# Admin Dashboard Documentation

## Overview

The Admin Dashboard provides a comprehensive interface for managing all database tables and system operations. It includes full CRUD (Create, Read, Update, Delete) functionality with proper authentication, validation, and security measures.

## Features

### 🔐 Authentication & Security
- Admin-only access with role-based authentication
- Rate limiting to prevent abuse
- Input validation and sanitization
- SQL injection prevention
- CSRF protection
- Security headers

### 📊 Dashboard Overview
- Real-time statistics for all tables
- Recent activity monitoring
- Quick access to all database tables
- Visual indicators for system health

### 🗃️ Table Management
- View all records with pagination
- Search and filter functionality
- Sort by any column
- Create new records with validation
- Edit existing records
- Delete records with confirmation
- Dynamic form generation based on table schema

### 🎨 User Interface
- Galaxy-themed design following project conventions
- Transparent backgrounds for better visual appeal
- Responsive design for all screen sizes
- Loading states and error handling
- Modal dialogs for forms and confirmations

## File Structure

```
├── pages/admin/
│   ├── index.vue                 # Main dashboard page
│   └── tables/[table].vue        # Table management interface
├── components/admin/
│   ├── RecordModal.vue           # Create/edit record modal
│   └── ConfirmModal.vue          # Delete confirmation modal
├── composables/
│   ├── useAdminAuth.js           # Admin authentication
│   ├── useAdminTables.js         # Table management logic
│   └── useAdminOverview.js       # Dashboard overview logic
├── server/api/admin/
│   ├── overview.get.js           # Dashboard statistics
│   ├── tables.get.js             # List all tables
│   ├── tables/[table].get.js     # Get table records
│   ├── tables/[table].post.js    # Create record
│   ├── tables/[table]/[id].put.js    # Update record
│   └── tables/[table]/[id].delete.js # Delete record
├── server/middleware/
│   ├── admin-auth.js             # Admin authentication middleware
│   └── admin-rate-limit.js       # Rate limiting middleware
├── server/utils/
│   ├── admin-validation.js       # Input validation utilities
│   └── admin-security.js         # Security utilities
└── assets/css/
    ├── pages/admin-dashboard.css
    ├── pages/admin-table-management.css
    └── components/admin-modals.css
```

## API Endpoints

### Authentication
All admin endpoints require authentication headers:
```
x-user-id: <user_id>
x-user-email: <user_email>
```

### Dashboard Overview
```
GET /api/admin/overview
```
Returns statistics, recent activity, and table information.

### Table Operations
```
GET /api/admin/tables                    # List all tables
GET /api/admin/tables/{table}            # Get table records
POST /api/admin/tables/{table}           # Create record
PUT /api/admin/tables/{table}/{id}       # Update record
DELETE /api/admin/tables/{table}/{id}    # Delete record
```

### Query Parameters for GET requests:
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 20, max: 100)
- `search`: Search query
- `sortBy`: Column to sort by (default: id)
- `sortOrder`: Sort direction (asc/desc, default: asc)

## Supported Tables

The admin dashboard supports the following tables:
- `users` - User accounts and admin management
- `products` - Product catalog management
- `categories` - Product categories
- `announcements` - Site announcements
- `deals` - Special offers and deals
- `hero_slides` - Homepage hero slides
- `transactions` - Payment transactions

## Validation Rules

Each table has specific validation rules:

### Users
- Email: Required, valid email format
- Password: Minimum 6 characters (auto-hashed)
- Account Type: user/admin enum

### Products
- Name: Required, 2-255 characters
- Price: Required, positive number
- Status: active/inactive/out_of_stock enum

### Categories
- Name: Required, 2-255 characters
- Slug: Required, URL-friendly format

## Security Features

### Input Validation
- All inputs are validated and sanitized
- SQL injection prevention
- XSS protection
- Type checking and format validation

### Rate Limiting
- General API: 100 requests per 15 minutes
- Admin API: 50 requests per 5 minutes
- Per-IP tracking with automatic cleanup

### Access Control
- Admin role verification
- Session validation
- Request origin validation
- Security headers on all responses

## Usage Instructions

### Accessing the Dashboard
1. Log in with an admin account
2. Navigate to `/admin` in your browser
3. View overview statistics and recent activity
4. Click on any table to manage its records

### Managing Records
1. Select a table from the dashboard
2. Use search and filters to find specific records
3. Click "Add New" to create records
4. Click edit icon to modify existing records
5. Click delete icon to remove records (with confirmation)

### Creating Records
1. Click "Add New" button
2. Fill in the required fields (marked with *)
3. Optional fields can be left empty
4. Click "Create" to save the record

### Editing Records
1. Click the edit icon next to any record
2. Modify the desired fields
3. Click "Save" to update the record

### Deleting Records
1. Click the delete icon next to any record
2. Confirm the deletion in the modal
3. Record will be permanently removed

## Testing

Run the test suite to verify functionality:

```bash
# Start the development server
npm run dev

# In another terminal, run tests
node scripts/test-admin-dashboard.js
```

The test suite covers:
- Authentication and authorization
- CRUD operations for all tables
- Input validation and error handling
- Pagination and search functionality
- Security measures and rate limiting

## Troubleshooting

### Common Issues

1. **403 Forbidden**: User doesn't have admin privileges
2. **401 Unauthorized**: Missing or invalid authentication headers
3. **429 Too Many Requests**: Rate limit exceeded, wait and retry
4. **400 Bad Request**: Invalid input data or validation errors

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages and allow localhost origins.

## Future Enhancements

Potential improvements for the admin dashboard:
- Bulk operations (delete multiple records)
- Export data to CSV/Excel
- Import data from files
- Advanced filtering and reporting
- Audit log viewer
- Real-time notifications
- Database backup/restore functionality
- User activity monitoring
- Custom dashboard widgets

## Contributing

When adding new features to the admin dashboard:
1. Follow the existing code structure and patterns
2. Add proper validation for new fields
3. Include security measures for new endpoints
4. Update tests to cover new functionality
5. Follow the galaxy theme styling conventions
6. Ensure responsive design compatibility
