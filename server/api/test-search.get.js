export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    console.log('Test search API called with query:', query);
    
    return {
      success: true,
      message: 'Test search API is working',
      query: query,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Test search API error:', error);
    return {
      success: false,
      message: 'Test search API failed',
      error: error.message
    };
  }
});
