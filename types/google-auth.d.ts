// Type definitions for Google OAuth API
interface Window {
  google?: {
    accounts: {
      oauth2: {
        initTokenClient: (config: TokenClientConfig) => TokenClient;
      };
    };
  };
}

interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
  error_callback?: (error: any) => void;
}

interface TokenClient {
  requestAccessToken: () => void;
}

interface TokenResponse {
  access_token: string;
  error?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
} 