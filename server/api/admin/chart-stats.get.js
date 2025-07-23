import db from '../../utils/db.js';
import { getQuery, createError } from 'h3';

// Helper function to convert date to GMT+7 (WIB)
function toWIB(date) {
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return new Date(utcDate.getTime() + (7 * 3600000)); // Add 7 hours for GMT+7
}

// Helper function to format date for WIB timezone
function formatDateWIB(date) {
  const wibDate = toWIB(date);
  return wibDate.toISOString().split('T')[0];
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const period = query.period || '7days';
    const startDate = query.startDate;
    const endDate = query.endDate;

    let days = 7;
    let customDateRange = false;

    // Determine the date range
    if (period === 'custom' && startDate && endDate) {
      customDateRange = true;
    } else if (period === '30days') {
      days = 30;
    } else if (period === '90days') {
      days = 90;
    } else {
      days = 7; // Default to 7 days
    }

    let startDateObj, endDateObj;

    if (customDateRange) {
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999); // End of day
    } else {
      endDateObj = new Date();
      startDateObj = new Date();
      startDateObj.setDate(endDateObj.getDate() - days + 1);
      startDateObj.setHours(0, 0, 0, 0); // Start of day
      endDateObj.setHours(23, 59, 59, 999); // End of day
    }

    // Query orders data from PostgreSQL
    const [rows] = await db.query(`
      SELECT 
        DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') as date,
        COUNT(*) as transaction_count,
        SUM(CASE WHEN status IN ('completed', 'settlement', 'capture') THEN total::numeric ELSE 0 END) as total_revenue,
        COUNT(CASE WHEN status IN ('completed', 'settlement', 'capture') THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
      FROM nixty.orders 
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta')
      ORDER BY DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') ASC
    `, [startDateObj.toISOString(), endDateObj.toISOString()]);

    // Create a complete date range array
    const chartData = [];
    const currentDate = new Date(startDateObj);
    
    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Find data for this date
      const dayData = rows.find(row => {
        const rowDate = new Date(row.date).toISOString().split('T')[0];
        return rowDate === dateStr;
      });

      chartData.push({
        date: dateStr,
        amount: dayData ? parseFloat(dayData.total_revenue || 0) : 0,
        count: dayData ? parseInt(dayData.transaction_count || 0) : 0,
        completed_count: dayData ? parseInt(dayData.completed_count || 0) : 0,
        pending_count: dayData ? parseInt(dayData.pending_count || 0) : 0,
        failed_count: dayData ? parseInt(dayData.failed_count || 0) : 0,
        label: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        shortLabel: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate summary statistics
    const totalRevenue = chartData.reduce((sum, day) => sum + day.amount, 0);
    const totalOrders = chartData.reduce((sum, day) => sum + day.completed_count, 0);
    const totalTransactions = chartData.reduce((sum, day) => sum + day.count, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      success: true,
      chartData,
      summary: {
        totalRevenue,
        totalOrders,
        totalTransactions,
        avgOrderValue,
        period: period,
        startDate: startDateObj.toISOString().split('T')[0],
        endDate: endDateObj.toISOString().split('T')[0]
      }
    };

  } catch (error) {
    console.error('Error fetching chart statistics:', error);
    return {
      success: false,
      chartData: [],
      summary: {
        totalRevenue: 0,
        totalOrders: 0,
        totalTransactions: 0,
        avgOrderValue: 0
      },
      error: error.message
    };
  }
});
