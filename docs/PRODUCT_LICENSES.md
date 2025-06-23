# Product Licenses Table Documentation

## Overview

The `product_licenses` table stores product keys, email/password combinations, access codes, and download links for digital products. This table allows you to manage different types of product access credentials depending on the product type.

## Table Structure

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | int(11) | Primary key, auto-increment |
| `product_id` | int(11) | Foreign key to products table |
| `license_type` | enum | Type of license: 'product_key', 'email_password', 'access_code', 'download_link' |
| `product_key` | varchar(500) | Product activation key (for software licenses) |
| `email` | varchar(255) | Email address (for account-based products) |
| `password` | varchar(255) | Password (for account-based products) |
| `access_code` | varchar(255) | Access or activation code |
| `download_link` | varchar(1000) | Direct download URL |
| `additional_info` | text | Additional license information |
| `is_used` | tinyint(1) | Whether the license has been used (0 = unused, 1 = used) |
| `used_by_transaction_id` | int(11) | Foreign key to transaction that used this license |
| `used_at` | timestamp | When the license was used |
| `expires_at` | timestamp | When the license expires (NULL = permanent) |
| `status` | enum | License status: 'available', 'used', 'expired', 'reserved' |
| `notes` | text | Internal notes about the license |
| `created_at` | timestamp | When the license was created |
| `updated_at` | timestamp | When the license was last updated |

### License Types

1. **product_key**: Traditional software license keys
   - Use `product_key` field
   - Example: Microsoft Office product keys

2. **email_password**: Account-based access
   - Use `email` and `password` fields
   - Example: Microsoft Office 365 accounts

3. **access_code**: Simple access codes
   - Use `access_code` field
   - Example: Game activation codes

4. **download_link**: Direct download access
   - Use `download_link` field
   - Example: Software download URLs

### Status Values

- **available**: License is ready to be sold/used
- **used**: License has been assigned to a customer
- **expired**: License has passed its expiration date
- **reserved**: License is temporarily reserved (e.g., during checkout)

## Usage Examples

### Adding Product Keys for Microsoft Office 2021

```sql
INSERT INTO product_licenses (product_id, license_type, product_key, additional_info, status, notes) 
VALUES (3, 'product_key', 'FXYTK-NJJ8C-GB6DW-3DYQT-6F7TH', 'Microsoft Office Pro Plus 2021 - Retail License', 'available', 'Valid for single PC installation');
```

### Adding Office 365 Account

```sql
INSERT INTO product_licenses (product_id, license_type, email, password, additional_info, expires_at, status, notes) 
VALUES (4, 'email_password', 'office365user@nixtystore.com', 'SecurePass123!', 'Microsoft Office 365 - 1 Year Subscription', '2026-06-20 07:25:23', 'available', 'Includes 1TB OneDrive storage');
```

### Marking License as Used

```sql
UPDATE product_licenses 
SET status = 'used', 
    is_used = 1, 
    used_by_transaction_id = 123, 
    used_at = NOW() 
WHERE id = 1;
```

## Admin Dashboard Integration

The product_licenses table is fully integrated into the admin dashboard:

### Navigation
- **Main Admin Panel**: Access via `/admin`
- **License Management**: Access via `/admin/tables/product_licenses`
- **Quick Access**: Admin dropdown → "Manage Licenses"

### Features
- ✅ **View All Licenses**: Paginated list with search and filtering
- ✅ **Add New Licenses**: Create licenses for any product
- ✅ **Edit Licenses**: Update license information and status
- ✅ **Delete Licenses**: Remove unused licenses
- ✅ **Status Management**: Track available, used, expired licenses
- ✅ **Product Association**: Link licenses to specific products
- ✅ **Transaction Tracking**: See which transaction used a license

### Form Fields

When creating/editing licenses in the admin dashboard:

**Required Fields:**
- Product ID (dropdown of available products)
- License Type (dropdown: Product Key, Email & Password, Access Code, Download Link)

**Conditional Fields (based on license type):**
- **Product Key**: Product Key field
- **Email & Password**: Email and Password fields
- **Access Code**: Access Code field
- **Download Link**: Download Link field

**Optional Fields:**
- Additional Info
- Expires At (for time-limited licenses)
- Status (Available, Used, Expired, Reserved)
- Notes (internal use only)

## Best Practices

### Security
1. **Sensitive Data**: Email/password combinations should be handled securely
2. **Access Control**: Only admin users can manage licenses
3. **Audit Trail**: Track when licenses are used and by which transaction

### License Management
1. **Stock Monitoring**: Keep track of available licenses per product
2. **Expiration Management**: Monitor and update expired licenses
3. **Bulk Operations**: Use SQL for bulk license imports
4. **Validation**: Ensure license keys are valid before adding

### Automation Opportunities
1. **Auto-Assignment**: Automatically assign available licenses to completed orders
2. **Expiration Alerts**: Notify when licenses are about to expire
3. **Stock Alerts**: Alert when license stock is low
4. **Bulk Import**: Import licenses from CSV files

## API Endpoints

All standard admin API endpoints are available:

- `GET /api/admin/tables/product_licenses` - List licenses with pagination
- `POST /api/admin/tables/product_licenses` - Create new license
- `PUT /api/admin/tables/product_licenses/{id}` - Update license
- `DELETE /api/admin/tables/product_licenses/{id}` - Delete license

### Query Parameters
- `page`: Page number
- `limit`: Records per page
- `search`: Search in text fields
- `sortBy`: Column to sort by
- `sortOrder`: asc/desc

## Integration with Sales Process

### Automatic License Assignment
When a transaction is completed, the system can automatically:
1. Find an available license for the purchased product
2. Mark the license as 'used'
3. Associate it with the transaction
4. Send license details to the customer

### Example Integration Code
```javascript
// Find available license for product
const availableLicense = await findAvailableLicense(productId);

if (availableLicense) {
  // Mark as used
  await markLicenseAsUsed(availableLicense.id, transactionId);
  
  // Send to customer
  await sendLicenseToCustomer(customerEmail, availableLicense);
}
```

## Reporting and Analytics

### Available Queries
1. **License Stock Report**: Count of available licenses per product
2. **Usage Report**: Licenses used in a time period
3. **Expiration Report**: Licenses expiring soon
4. **Revenue Report**: Revenue from license sales

### Example Queries

**License Stock by Product:**
```sql
SELECT p.name, p.version, 
       COUNT(pl.id) as total_licenses,
       SUM(CASE WHEN pl.status = 'available' THEN 1 ELSE 0 END) as available,
       SUM(CASE WHEN pl.status = 'used' THEN 1 ELSE 0 END) as used
FROM products p
LEFT JOIN product_licenses pl ON p.id = pl.product_id
GROUP BY p.id, p.name, p.version;
```

**Licenses Expiring in 30 Days:**
```sql
SELECT pl.*, p.name as product_name
FROM product_licenses pl
JOIN products p ON pl.product_id = p.id
WHERE pl.expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
AND pl.status = 'available';
```

## Troubleshooting

### Common Issues
1. **No Available Licenses**: Check stock levels and add more licenses
2. **Expired Licenses**: Update expiration dates or mark as expired
3. **Invalid Product Keys**: Validate keys before adding to database
4. **Duplicate Licenses**: Ensure unique constraints on license keys

### Maintenance Tasks
1. **Regular Cleanup**: Remove or archive old expired licenses
2. **Stock Monitoring**: Monitor license levels for popular products
3. **Validation**: Periodically validate license keys and accounts
4. **Backup**: Regular backups of license data for security
