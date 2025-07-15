import db from '../../utils/db.js';

export default defineEventHandler(async (event) => {
    try {
        // Check table structure
        const [tableInfo] = await db.query('DESCRIBE transactions');
        
        // Check if we have any transactions
        const [countResult] = await db.query('SELECT COUNT(*) as count FROM transactions');
        
        // Check for any duplicate entries
        const [duplicateCheck] = await db.query(`
            SELECT order_id, COUNT(*) as count 
            FROM transactions 
            GROUP BY order_id 
            HAVING COUNT(*) > 1
        `);
        
        return {
            success: true,
            tableStructure: tableInfo,
            totalTransactions: countResult[0].count,
            duplicateOrders: duplicateCheck
        };
    } catch (error) {
        console.error('Database check error:', error);
        return {
            success: false,
            error: error.message
        };
    }
});
