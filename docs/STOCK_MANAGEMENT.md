# Stock Management System

## Overview

The stock management system allows administrators to track and manage product inventory levels across all digital products. The system provides real-time stock data, visual indicators for stock status, and tools for updating stock levels.

## Key Features

- Real-time stock monitoring
- Visual indicators for stock status (in-stock, low-stock, out-of-stock)
- Bulk stock update functionality
- Stock alerts and notifications
- Integration with product database
- Sorting and filtering options

## Technical Implementation

### Database Structure

The stock management system now uses a license-based approach instead of a static stock field:

1. **Product Licenses Table (`product_licenses`):**
   - Stores individual licenses for each product
   - Each license has a status: 'available', 'used', 'expired', or 'reserved'
   - Available licenses count as the actual stock

2. **Products Table (`products`):**
   - Removed static `stock` field
   - Added `min_stock_threshold` for low stock alerts
   - Added `license_type_default` for license creation

3. **Product Stock View (`product_stock_view`):**
   - Virtual view that calculates stock based on available licenses
   - Provides aggregated counts: available, used, expired, reserved, and total licenses

4. **Automatic Updates:**
   - Database triggers update product status automatically when licenses change
   - Stored procedure to add licenses and maintain stock counts

### Stock Calculation Logic

The stock level for a product is now calculated as:
```sql
COUNT(CASE WHEN pl.status = 'available' THEN 1 ELSE NULL END)
```

### Stock Status Indicators

- **In Stock**: Available licenses > min_stock_threshold
- **Low Stock**: Available licenses <= min_stock_threshold but > 0
- **Out of Stock**: Available licenses = 0

## Stock Update Process

1. **Adding Stock:**
   - When adding stock, the system now creates individual product licenses
   - Each license has appropriate data based on the product's license_type_default
   - For bulk additions, multiple licenses are created in a single operation

2. **Reducing Stock:**
   - Stock is automatically reduced when licenses are marked as used
   - Admin tools allow manual status changes for licenses
   - Special API endpoints handle license usage during purchase flows

3. **Stock Monitoring:**
   - Automatic triggers update product status when license status changes
   - Dashboard components reflect real-time license availability

## UI Components

### StockDisplay Component

Displays stock levels with visual indicators:
- Green: Good stock levels
- Yellow: Low stock warning
- Red: Out of stock alert

### StockManagement Component

Provides administrative interface for managing stock:
- View all products and their current stock levels
- Sort and filter products by various criteria
- Update stock levels individually or in bulk
- View detailed stock history

### StockOverview Component

Dashboard widget showing summary of stock status:
- Total products count
- Products in-stock count
- Products with low stock count
- Products out-of-stock count
- Visual chart of stock distribution

## API Endpoints

### Update Stock

**Endpoint**: `POST /api/admin/update-stock`

Now adds product licenses instead of updating a static stock field:

**Request Body:**
```json
{
  "product_id": 123,
  "stock": 25,
  "license_type": "product_key" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock updated successfully from 15 to 25",
  "data": {
    "product": {
      "id": 123,
      "name": "Microsoft Office Pro Plus",
      "version": "2021",
      "stock": 25,
      "available_stock": 25,
      "used_licenses": 10,
      "expired_licenses": 0,
      "reserved_licenses": 2,
      "total_licenses": 37
    },
    "stock_change": {
      "old_stock": 15,
      "new_stock": 25,
      "difference": 10,
      "licenses_added": 10
    }
  }
}
```

## Stock Alerts

### Low Stock Alerts

Products with stock ≤ min_stock_threshold items trigger low stock alerts:
- Visual warning indicators
- Dashboard notifications
- Email alerts (if configured)

### Out of Stock Alerts

Products with zero available licenses trigger out of stock alerts:
- Red status indicators
- Automatic status change to 'out_of_stock'
- Priority notifications

## Integration with Existing Systems

### Product Licenses

The stock system is now directly integrated with the product licenses system:

- **Stock**: Represents count of available licenses
- **Licenses**: Individual license records with detailed information
- **Relationship**: One-to-many relationship between products and licenses

### Transaction Processing

When a transaction is completed:
1. Check if product has available licenses
2. Select an available license for the customer
3. Update license status to 'used' or 'partially_used'
4. Triggers automatically update product stock status

## Admin Dashboard Integration

### Navigation
- **Main Admin Panel**: Access via `/admin`
- **License Management**: Access via `/admin/tables/product_licenses`
- **Stock Management**: Access via Stock Management modal in admin dashboard

### Features
- ✅ **View All Products**: With real-time stock levels
- ✅ **Add Stock**: Create licenses for any product
- ✅ **View Licenses**: See detailed license information
- ✅ **Stock Alerts**: Visual indicators for low/out of stock

## Usage Examples

### Adding Stock to Products

1. **Via Admin Dashboard:**
   - Navigate to Stock Management
   - Click "Edit Stock" for desired product
   - Enter new stock quantity
   - Save changes

2. **Via API:**
   ```javascript
   const response = await fetch('/api/admin/update-stock', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'x-user-id': adminUserId,
       'x-user-email': adminEmail
     },
     body: JSON.stringify({
       product_id: 123,
       stock: 50,
       license_type: "product_key"
     })
   });
   ```

### Monitoring Stock Levels

1. **Dashboard Overview:**
   - View stock statistics at a glance
   - See percentage breakdowns
   - Monitor alerts for low stock items

2. **Detailed Management:**
   - Filter products by stock status
   - Export stock reports
   - Bulk update capabilities

### Stock Reports

Export stock data to CSV:
- Product name and version
- Current stock levels
- Sold quantities
- Status information
- Category breakdown

## Best Practices

### Stock Management

1. **Regular Monitoring:**
   - Check stock levels daily
   - Set up alerts for low stock items
   - Review stock reports weekly

2. **Stock Updates:**
   - Update stock immediately after receiving new licenses
   - Verify stock counts regularly
   - Document stock changes for audit purposes

3. **Alert Thresholds:**
   - Set appropriate low stock thresholds (default: 5)
   - Configure email notifications for critical levels
   - Review and adjust thresholds based on sales patterns

### Data Integrity

1. **Validation:**
   - Stock cannot be negative
   - Automatic status updates based on stock levels
   - Transaction validation before stock reduction

2. **Backup:**
   - Regular database backups
   - Stock change logging
   - Audit trail maintenance

## Troubleshooting

### Common Issues

1. **Stock Not Updating:**
   - Check admin authentication
   - Verify API endpoint accessibility
   - Review database permissions

2. **Incorrect Stock Levels:**
   - Verify transaction processing
   - Check for concurrent updates
   - Review stock change logs

3. **Alerts Not Triggering:**
   - Check alert thresholds
   - Verify notification settings
   - Review system logs

### Performance Considerations

1. **Database Indexing:**
   - Stock field is indexed for fast queries
   - Composite indexes for filtered searches
   - Regular index maintenance

2. **Caching:**
   - Stock data cached for dashboard display
   - Real-time updates for critical operations
   - Background refresh for statistics

## Future Enhancements

### Planned Features

1. **Advanced Alerts:**
   - Email notifications
   - SMS alerts
   - Slack integration

2. **Stock Forecasting:**
   - Sales trend analysis
   - Automated reorder suggestions
   - Demand prediction

3. **Bulk Operations:**
   - Mass stock updates
   - Import/export functionality
   - Stock transfer between products

4. **Analytics:**
   - Stock turnover rates
   - Sales velocity analysis
   - Inventory optimization recommendations 