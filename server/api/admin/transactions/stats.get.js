import db from '../../../utils/db.js';
import { getQuery, createError } from 'h3';

const getValidatedQueryParams = (event) => {
  const query = getQuery(event);
  const { period, date, startDate, endDate } = query;

  if (!['day', 'month', 'year'].includes(period)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid period specified' });
  }
  
  // For day period, we now support date range
  if (period === 'day') {
    if (!startDate || !endDate) {
      throw createError({ statusCode: 400, statusMessage: 'startDate and endDate are required for day period' });
    }
    return { period, startDate, endDate };
  } else {
    if (!date) {
      throw createError({ statusCode: 400, statusMessage: 'Date is required' });
    }
    return { period, date };
  }
};

const getDailyStats = async (startDate, endDate) => {
    try {
        // Parse dates as UTC to avoid timezone issues
        const start = new Date(startDate + 'T00:00:00.000Z');
        const end = new Date(endDate + 'T23:59:59.999Z');
        
        const isSingleDay = start.toDateString() === end.toDateString();

        if (isSingleDay) {
            const [rows] = await db.execute(`
                SELECT 
                    EXTRACT(HOUR FROM created_at) as hour, 
                    COUNT(*) as transaction_count, 
                    SUM(amount) as total_revenue
                FROM transactions
                WHERE created_at >= ? AND created_at <= ? AND (status = 'settlement' OR status = 'completed')
                GROUP BY EXTRACT(HOUR FROM created_at)
                ORDER BY hour ASC
            `, [start, end]);

            const labels = Array.from({ length: 24 }, (_, i) => i.toString());
            const transactionData = Array(24).fill(0);
            const revenueData = Array(24).fill(0);

            for (const row of rows) {
                const hourIndex = Number(row.hour);
                transactionData[hourIndex] = Number(row.transaction_count);
                revenueData[hourIndex] = Number(row.total_revenue);
            }
            return { labels, transactionData, revenueData };
        } else {
            const [rows] = await db.execute(`
                SELECT 
                    TO_CHAR(created_at, 'YYYY-MM-DD') as date,
                    COUNT(*) as transaction_count, 
                    SUM(amount) as total_revenue
                FROM transactions
                WHERE created_at >= ? AND created_at <= ? AND (status = 'settlement' OR status = 'completed')
                GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
                ORDER BY date ASC
            `, [start, end]);

            const dateMap = new Map();
            const dateCursor = new Date(start);
            while(dateCursor <= end) {
                dateMap.set(dateCursor.toISOString().split('T')[0], { transaction_count: 0, total_revenue: 0 });
                dateCursor.setDate(dateCursor.getDate() + 1);
            }

            for(const row of rows) {
                dateMap.set(row.date, {
                    transaction_count: Number(row.transaction_count),
                    total_revenue: Number(row.total_revenue)
                });
            }

            const labels = Array.from(dateMap.keys());
            const transactionData = Array.from(dateMap.values()).map(d => d.transaction_count);
            const revenueData = Array.from(dateMap.values()).map(d => d.total_revenue);

            return { labels, transactionData, revenueData };
        }
    } catch (error) {
        console.error("Error in getDailyStats:", error);
        return { labels: [], transactionData: [], revenueData: [] };
    }
};

const getMonthlyStats = async (date) => {
    try {
        const [year, month] = date.split('-');
        const daysInMonth = new Date(year, month, 0).getDate();
        const startDate = new Date(`${year}-${month}-01`);
        startDate.setHours(0,0,0,0);
        const endDate = new Date(`${year}-${month}-${daysInMonth}`);
        endDate.setHours(23,59,59,999);

        const [rows] = await db.execute(`
            SELECT 
                EXTRACT(DAY FROM created_at) as day, 
                COUNT(*) as transaction_count, 
                SUM(amount) as total_revenue
            FROM transactions
            WHERE created_at >= ? AND created_at <= ? AND (status = 'settlement' OR status = 'completed')
            GROUP BY EXTRACT(DAY FROM created_at)
            ORDER BY day ASC
        `, [startDate, endDate]);

        const labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
        const transactionData = Array(daysInMonth).fill(0);
        const revenueData = Array(daysInMonth).fill(0);
        
        for (const row of rows) {
            const dayIndex = row.day - 1;
            transactionData[dayIndex] = Number(row.transaction_count);
            revenueData[dayIndex] = Number(row.total_revenue);
        }

        return { labels, transactionData, revenueData };
    } catch (error) {
        console.error("Error in getMonthlyStats:", error);
        const [year, month] = date.split('-');
        const daysInMonth = new Date(year, month, 0).getDate();
        return { 
            labels: Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()), 
            transactionData: Array(daysInMonth).fill(0), 
            revenueData: Array(daysInMonth).fill(0) 
        };
    }
};

const getYearlyStats = async (year) => {
    try {
        const startDate = new Date(`${year}-01-01`);
        startDate.setHours(0,0,0,0);
        const endDate = new Date(`${year}-12-31`);
        endDate.setHours(23,59,59,999);


        const [rows] = await db.execute(`
            SELECT 
                EXTRACT(MONTH FROM created_at) as month, 
                COUNT(*) as transaction_count, 
                SUM(amount) as total_revenue
            FROM transactions
            WHERE created_at >= ? AND created_at <= ? AND (status = 'settlement' OR status = 'completed')
            GROUP BY EXTRACT(MONTH FROM created_at)
            ORDER BY month ASC
        `, [startDate, endDate]);

        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const transactionData = Array(12).fill(0);
        const revenueData = Array(12).fill(0);

        for (const row of rows) {
            const monthIndex = row.month - 1; // 0-indexed
            transactionData[monthIndex] = Number(row.transaction_count);
            revenueData[monthIndex] = Number(row.total_revenue);
        }

        return { labels, transactionData, revenueData };
    } catch (error) {
        console.error("Error in getYearlyStats:", error);
        return { 
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            transactionData: Array(12).fill(0),
            revenueData: Array(12).fill(0)
        };
    }
};

export default defineEventHandler(async (event) => {
    try {
        const validatedParams = getValidatedQueryParams(event);
        const { period } = validatedParams;

        let stats;
        if (period === 'day') {
            const { startDate, endDate } = validatedParams;
            stats = await getDailyStats(startDate, endDate);
        } else if (period === 'month') {
            const { date } = validatedParams;
            stats = await getMonthlyStats(date);
        } else if (period === 'year') {
            const { date } = validatedParams;
            stats = await getYearlyStats(date);
        }
        
        return stats || { 
            labels: [], 
            transactionData: [], 
            revenueData: [] 
        };
    } catch (error) {
        console.error('Error fetching transaction stats:', error);
        return { 
            labels: [], 
            transactionData: [], 
            revenueData: [],
            error: error.message
        };
    }
});
