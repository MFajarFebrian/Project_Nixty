# Product Licenses Multi-Use System

## Overview
This document describes the enhanced product licenses system that supports multiple usage for product keys and automatic product information population.

## Key Changes

### 1. Database Schema Updates
- **Added `usage_count`**: Tracks how many times a license has been used
- **Added `max_usage`**: Defines maximum usage limit per license type
- **Updated `status` enum**: Added 'partially_used' status
- **Added `product_name`**: Selectable product name from products table
- **Added `product_version`**: Selectable product version from products table
- **Removed `additional_info`**: Replaced with separate name/version fields

### 2. Usage Limits by License Type
- **Product Keys**: Can be used up to **5 times**
- **Email/Password**: Can be used **1 time** (single account)
- **Access Codes**: Can be used **1 time**
- **Download Links**: Can be used **999 times** (unlimited downloads)

### 3. Status Values
- **available**: License is ready to be used (usage_count = 0)
- **partially_used**: License has been used but not at maximum (0 < usage_count < max_usage)
- **used**: License has reached maximum usage (usage_count >= max_usage)
- **expired**: License has passed expiration date
- **reserved**: License is temporarily reserved

## Database Migration

Run this SQL to update your existing database:

```sql
-- Add new columns
ALTER TABLE `product_licenses` 
ADD COLUMN `usage_count` int(11) NOT NULL DEFAULT 0 AFTER `is_used`,
ADD COLUMN `max_usage` int(11) NOT NULL DEFAULT 1 AFTER `usage_count`;

-- Set max_usage based on license type
UPDATE `product_licenses` 
SET `max_usage` = CASE 
    WHEN `license_type` = 'product_key' THEN 5
    WHEN `license_type` = 'email_password' THEN 1
    WHEN `license_type` = 'access_code' THEN 1
    WHEN `license_type` = 'download_link' THEN 999
    ELSE 1
END;

-- Update existing usage counts
UPDATE `product_licenses` 
SET `usage_count` = CASE WHEN `is_used` = 1 THEN 1 ELSE 0 END;

-- Add new status option
ALTER TABLE `product_licenses` 
MODIFY COLUMN `status` enum('available','partially_used','used','expired','reserved') DEFAULT 'available';

-- Add product name and version columns
ALTER TABLE `product_licenses`
ADD COLUMN `product_name` varchar(255) DEFAULT NULL,
ADD COLUMN `product_version` varchar(50) DEFAULT NULL;

-- Populate from products table
UPDATE `product_licenses` pl
JOIN `products` p ON pl.product_id = p.id
SET pl.product_name = p.name, pl.product_version = p.version;

-- Remove additional_info column
ALTER TABLE `product_licenses` DROP COLUMN `additional_info`;
```

## API Endpoints

### Create Product License
**POST** `/api/admin/product-licenses`

Automatically sets:
- `max_usage` based on license type
- `usage_count` starts at 0
- Validates `product_name` and `product_version` against products table

### Use License
**POST** `/api/admin/product-licenses/use`

```json
{
  "license_id": 123,
  "transaction_id": 456
}
```

Increments usage count and updates status accordingly.

## Admin Interface Changes

### Form Behavior
- **product_id**: Dropdown showing "Product Name (Version)" format
- **product_name**: Auto-filled when product_id is selected (read-only)
- **product_version**: Auto-filled when product_id is selected (read-only)
- **usage_count**: Shows current usage
- **max_usage**: Shows maximum allowed usage
- **Status dropdown**: Includes "Partially Used" option

### Display
- Shows remaining uses: `(max_usage - usage_count)`
- Visual indicators for usage status
- Auto-filled fields with special styling and indicators
- Product dropdown shows "Name (Version)" format

## Usage Examples

### Creating a Product Key License
```javascript
// When creating through admin interface
{
  "product_id": 1,
  "license_type": "product_key",
  "product_key": "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
  "product_name": "Microsoft Office",
  "product_version": "2021"
  // max_usage auto-set: 5
  // usage_count auto-set: 0
}
```

### Using a License
```javascript
// First use
POST /api/admin/product-licenses/use
{
  "license_id": 1,
  "transaction_id": 123
}
// Result: usage_count = 1, status = "partially_used"

// Fifth use (for product key)
POST /api/admin/product-licenses/use
{
  "license_id": 1,
  "transaction_id": 127
}
// Result: usage_count = 5, status = "used"
```

## Benefits

### 1. Structured Product Information
- Separate product name and version fields
- Dropdown selection from existing products
- Validation against products table

### 2. Multi-Use Product Keys
- Product keys can serve 5 customers
- Better value for bulk licenses
- Automatic tracking prevents overuse

### 3. Flexible Usage Limits
- Different limits per license type
- Download links allow unlimited access
- Account-based licenses remain single-use

### 4. Better Status Tracking
- Clear distinction between unused, partially used, and fully used
- Easy identification of available licenses
- Proper inventory management

## Integration with Sales Process

### Automatic License Assignment
```javascript
// Find available license with remaining uses
const availableLicense = await pool.execute(`
  SELECT * FROM product_licenses 
  WHERE product_id = ? 
  AND usage_count < max_usage 
  AND status IN ('available', 'partially_used')
  AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1
`, [productId]);

// Use the license
if (availableLicense.length > 0) {
  await useLicense(availableLicense[0].id, transactionId);
}
```

### License Stock Reporting
```sql
SELECT 
  p.name,
  p.version,
  COUNT(pl.id) as total_licenses,
  SUM(pl.max_usage - pl.usage_count) as total_remaining_uses,
  SUM(CASE WHEN pl.status = 'available' THEN 1 ELSE 0 END) as unused_licenses,
  SUM(CASE WHEN pl.status = 'partially_used' THEN 1 ELSE 0 END) as partially_used_licenses,
  SUM(CASE WHEN pl.status = 'used' THEN 1 ELSE 0 END) as fully_used_licenses
FROM products p
LEFT JOIN product_licenses pl ON p.id = pl.product_id
GROUP BY p.id, p.name, p.version;
```

## Testing

### Test Scenarios
1. **Create product license** - Verify auto-population
2. **Use license multiple times** - Check status transitions
3. **Reach usage limit** - Verify "used" status
4. **Try to exceed limit** - Should fail gracefully
5. **Different license types** - Verify correct max_usage values

### Expected Behavior
- Product keys: 5 uses maximum
- Other types: 1 use maximum (except download links: 999)
- Status updates automatically
- additional_info always reflects current product information
