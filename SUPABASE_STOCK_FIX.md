# Supabase Stock Management Fix

## Problem
The stock management system was not calculating stock properly from the `product_stock_view` because:

1. The view was designed for MySQL but the website now uses Supabase (PostgreSQL)
2. The available stock calculation was inconsistent between the displayed number and stock status
3. API endpoints were using MySQL syntax and stored procedures instead of PostgreSQL

## Solution

### 1. Fixed `product_stock_view` for PostgreSQL

**File**: `fix_product_stock_view.sql`

The corrected view now properly calculates:
- `available_stock`: Sum of (max_usage - send_license) for available licenses
- `stock_status`: Based on count of available licenses, not stock quantity
- `usage_percentage`: Percentage of licenses marked as used

### 2. Updated Stock Management API

**File**: `server/api/admin/update-stock.post.js`

Changes:
- Replaced MySQL stored procedure calls with direct PostgreSQL INSERT statements
- Updated to use the unified `db` interface instead of raw `pool.execute`
- Added proper license data structure for PostgreSQL

### 3. Updated Admin Tables API

**File**: `server/api/admin/tables/[table].get.js`

Changes:
- Updated to use unified `db` interface
- Added stock information to products table view
- Fixed PostgreSQL column information queries

### 4. Database Migration Script

**File**: `scripts/fix-supabase-stock.js`

This script:
- Applies the new `product_stock_view` to your Supabase database
- Creates necessary indexes for performance
- Tests the updated view

## How to Apply the Fix

1. **Apply the database changes**:
   ```bash
   node scripts/fix-supabase-stock.js
   ```

2. **Verify the stock view is working**:
   - Check the admin dashboard
   - Verify stock numbers are displayed correctly
   - Test stock updates through the admin interface

3. **Test stock management**:
   - Try updating stock for a product
   - Verify the stock count updates correctly
   - Check that the stock status (in_stock/low_stock/out_of_stock) is accurate

## Key Changes in Stock Calculation

### Before (MySQL):
```sql
-- Available stock calculation (problematic)
sum(case when pl.status = 'available' and coalesce(pl.send_license,0) < pl.max_usage 
    then pl.max_usage - coalesce(pl.send_license,0) else 0 end) AS available_stock

-- Stock status calculation (different logic)
sum(case when pl.status = 'available' AND coalesce(pl.send_license,0) < pl.max_usage 
    then 1 else 0 end)
```

### After (PostgreSQL):
```sql
-- Available stock calculation (consistent)
COALESCE(SUM(
    CASE 
        WHEN pl.status = 'available' AND COALESCE(pl.send_license, 0) < pl.max_usage 
        THEN pl.max_usage - COALESCE(pl.send_license, 0)
        ELSE 0 
    END
), 0) AS available_stock

-- Stock status calculation (uses same logic)
CASE 
    WHEN COALESCE(SUM(
        CASE 
            WHEN pl.status = 'available' AND COALESCE(pl.send_license, 0) < pl.max_usage 
            THEN 1 
            ELSE 0 
        END
    ), 0) = 0 THEN 'out_of_stock'
    -- ... rest of logic
END AS stock_status
```

## Verification

After applying the fix, verify:

1. **Stock Display**: Check that stock numbers in the admin dashboard are accurate
2. **Stock Updates**: Test adding stock through the admin interface
3. **Stock Status**: Verify that low stock and out of stock warnings appear correctly
4. **Performance**: Ensure the view queries are fast (indexes are created)

## Files Modified

- `fix_product_stock_view.sql` - New PostgreSQL view definition
- `server/api/admin/update-stock.post.js` - Updated for PostgreSQL
- `server/api/admin/tables/[table].get.js` - Updated for PostgreSQL
- `scripts/fix-supabase-stock.js` - Migration script
- `SUPABASE_STOCK_FIX.md` - This documentation

## Next Steps

1. Run the migration script
2. Test the stock management functionality
3. Monitor performance of the updated queries
4. Consider adding more detailed stock tracking if needed
