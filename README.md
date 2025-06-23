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
