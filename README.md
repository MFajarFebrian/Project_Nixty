# Nixty Project

A Nuxt.js web application with MySQL integration and Google OAuth authentication.

## Features

- User authentication (login/register)
- Google OAuth integration
- User roles (admin/regular users)
- Secure password hashing
- Responsive UI

## Setup

### Prerequisites

- Node.js and npm
- MySQL database (via XAMPP or standalone)
- Google OAuth credentials

### Installation

1. Clone the repository
2. Install dependencies:
   ```
npm install
   ```
3. Set up the database:
   - Create a database named `nixty_db`
   - Run the SQL scripts in the `server/utils` directory
   - For Google OAuth fields, run:
     - On Windows: `.\update_database.ps1`
     - On Unix/Linux/Mac: `bash update_database.sh`

4. Configure Google OAuth:
   - The application is pre-configured with a client ID
   - For your own implementation, update the client ID in `composables/useGoogleAuth.ts`

5. Start the development server:
   ```
npm run dev
   ```

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Set the application type to "Web application"
6. Add authorized JavaScript origins:
   - For development: `http://localhost:3000`
   - For production: Your domain
7. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/google-callback`
   - For production: `https://your-domain.com/api/auth/google-callback`
8. Copy the client ID and update it in `composables/useGoogleAuth.ts`

## Environment Variables

### Required Configuration

Create a `.env` file based on `.env.example` and configure the following:

- **NUXT_PUBLIC_BASE_URL**: Base URL for the application - must be an absolute URL **without** trailing slash
  - Example: `http://localhost:3000` (development)
  - Example: `https://your-domain.com` (production)
  - Used for callback URLs and redirects in payment processing

- **MIDTRANS_SERVER_KEY** and **MIDTRANS_CLIENT_KEY**: Your Midtrans credentials from the dashboard

- **Database Configuration**: Standard MySQL connection settings

- **GOOGLE_CLIENT_ID**: For Google OAuth authentication

- **Email Configuration**: For license delivery notifications

## Payment Flow

The application uses Midtrans as the payment gateway with the following callback behavior:

1. **Payment Initiation**: User clicks "Buy Now" and is redirected to checkout
2. **Midtrans Integration**: Payment is processed through Midtrans Snap
3. **Callback Handling**: After payment, users are redirected to callback URLs based on payment status:
   - **Success**: `{NUXT_PUBLIC_BASE_URL}/payment/finish`
   - **Pending**: `{NUXT_PUBLIC_BASE_URL}/payment/unfinish`
   - **Error/Cancel**: `{NUXT_PUBLIC_BASE_URL}/payment/error`
4. **Webhook Processing**: Midtrans sends notifications to `/api/midtrans/notification` for payment status updates
5. **License Assignment**: Upon successful payment confirmation, a license is automatically assigned to the user

**Important**: The `NUXT_PUBLIC_BASE_URL` must be configured correctly as it's used to construct these callback URLs. It must be an absolute URL without a trailing slash.

## Database Schema

The application uses the following database schema:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  account_type ENUM('user', 'admin') DEFAULT 'user',
  google_id VARCHAR(255),
  profile_picture VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_google_id ON users(google_id);
```

## License

MIT
