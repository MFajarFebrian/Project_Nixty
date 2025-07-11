import db from '../../../utils/db.js';
import { getQuery, createError } from 'h3';

const getValidatedQueryParams = (event) => {
  const query = getQuery(event);
  const { period, date } = query;

  if (!['day', 'month', 'year'].includes(period)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid period specified' });
  }
  if (!date) {
    throw createError({ statusCode: 400, statusMessage: 'Date is required' });
  }
  
  return { period, date };
};

const getDailyStats = async (date) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                HOUR(created_at) as hour, 
                COUNT(*) as transaction_count, 
                SUM(amount) as total_revenue
            FROM transactions
            WHERE DATE(created_at) = ? AND status = 'completed'
            GROUP BY HOUR(created_at)
            ORDER BY hour ASC
        `, [date]);

        const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        const transactionData = Array(24).fill(0);
        const revenueData = Array(24).fill(0);

        for (const row of rows) {
            transactionData[row.hour] = Number(row.transaction_count);
            revenueData[row.hour] = Number(row.total_revenue);
        }

        return { labels, transactionData, revenueData };
    } catch (error) {
        console.error("Error in getDailyStats:", error);
        return { labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), transactionData: Array(24).fill(0), revenueData: Array(24).fill(0) };
    }
};

const getMonthlyStats = async (date) => {
    try {
        const [year, month] = date.split('-');
        const daysInMonth = new Date(year, month, 0).getDate();
        const startDate = `${year}-${month}-01`;
        const endDate = `${year}-${month}-${daysInMonth}`;

        const [rows] = await db.execute(`
            SELECT 
                DAY(created_at) as day, 
                COUNT(*) as transaction_count, 
                SUM(amount) as total_revenue
            FROM transactions
            WHERE created_at >= ? AND created_at <= ? AND status = 'completed'
            GROUP BY DAY(created_at)
            ORDER BY day ASC
        `, [startDate, endDate]);

        const labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
        const transactionData = Array(daysInMonth).fill(0);
        const revenueData = Array(daysInMonth).fill(0);
        
        for (const row of rows) {
            const dayIndex = row.day - 1; // 0-indexed
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
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const [rows] = await db.execute(`
            SELECT 
                MONTH(created_at) as month, 
                COUNT(*) as transaction_count, 
                SUM(amount) as total_revenue
            FROM transactions
            WHERE created_at >= ? AND created_at <= ? AND status = 'completed'
            GROUP BY MONTH(created_at)
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
        const { period, date } = getValidatedQueryParams(event);

        let stats;
        if (period === 'day') {
            stats = await getDailyStats(date);
        } else if (period === 'month') {
            stats = await getMonthlyStats(date);
        } else if (period === 'year') {
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