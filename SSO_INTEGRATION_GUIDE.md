# Okta SSO Integration Guide

This guide explains how to integrate Okta Single Sign-On (SSO) into the EliteOps Customer Onboarding application.

---

## Prerequisites

1. **Okta Developer Account** - Sign up at https://developer.okta.com
2. **Backend API** - You'll need an API to validate tokens and manage user data
3. **Node.js & npm** - Already installed for the project

---

## Step 1: Configure Okta Application

### 1.1 Create a New Application in Okta

1. Log into your Okta Admin Console
2. Navigate to **Applications** → **Applications**
3. Click **Create App Integration**
4. Select:
   - **Sign-in method**: OIDC (OpenID Connect)
   - **Application type**: Single-Page Application (SPA)
5. Click **Next**

### 1.2 Configure Application Settings

**Application Settings:**
- **App integration name**: EliteOps Customer Onboarding
- **Grant type**: Authorization Code (with PKCE)
- **Sign-in redirect URIs**:
  - Development: `http://localhost:5173/login/callback`
  - Production: `https://app.eliteops.com/login/callback`
- **Sign-out redirect URIs**:
  - Development: `http://localhost:5173`
  - Production: `https://app.eliteops.com`
- **Trusted Origins**:
  - Development: `http://localhost:5173`
  - Production: `https://app.eliteops.com`

### 1.3 Note Your Credentials

After creating the application, note the following from the **General** tab:
- **Client ID**: `{your-client-id}`
- **Okta Domain**: `{your-domain}.okta.com`

---

## Step 2: Configure Custom User Attributes

EliteOps requires a `role` attribute to determine user permissions.

### 2.1 Add Custom Attribute

1. Navigate to **Directory** → **Profile Editor**
2. Find and click on your **User** profile
3. Click **Add Attribute**
4. Configure:
   - **Data type**: String
   - **Display name**: Role
   - **Variable name**: `role`
   - **Description**: EliteOps user role
   - **Enum**: Define allowed values:
     - `director` - Director
     - `senior_director` - Senior Director
     - `manager` - Manager
     - `solutions_architect` - Solutions Architect
     - `account_rep` - Account Representative
     - `lead_solutions_engineer` - Lead Solutions Engineer
     - `solutions_engineer` - Solutions Engineer
     - `delivery_engineer` - Delivery Engineer

### 2.2 Add Role to User Profile

For each user:
1. Navigate to **Directory** → **People**
2. Select a user
3. Click **Profile** → **Edit**
4. Set the **Role** attribute
5. Click **Save**

---

## Step 3: Install Dependencies

```bash
cd /home/user/EO-On-board/frontend

npm install @okta/okta-auth-js @okta/okta-react
```

---

## Step 4: Configure Environment Variables

Create `.env` files:

### `.env.development`
```env
# Vite Environment Variables
VITE_API_URL=http://localhost:3000
VITE_OKTA_CLIENT_ID=your_dev_client_id
VITE_OKTA_ISSUER=https://your-dev-domain.okta.com/oauth2/default
VITE_OKTA_REDIRECT_URI=http://localhost:5173/login/callback
```

### `.env.production`
```env
VITE_API_URL=https://api.eliteops.com
VITE_OKTA_CLIENT_ID=your_prod_client_id
VITE_OKTA_ISSUER=https://your-prod-domain.okta.com/oauth2/default
VITE_OKTA_REDIRECT_URI=https://app.eliteops.com/login/callback
```

### Update `.gitignore`
```
.env
.env.local
.env.development
.env.production
.env.*.local
```

---

## Step 5: Implement Okta Auth Provider

Uncomment the `OktaAuthProvider` class in `frontend/src/services/authService.ts`:

```typescript
// frontend/src/services/authService.ts
import { OktaAuth } from '@okta/okta-auth-js';

class OktaAuthProvider implements AuthProvider {
  private oktaAuth: OktaAuth;

  constructor() {
    this.oktaAuth = new OktaAuth({
      issuer: import.meta.env.VITE_OKTA_ISSUER,
      clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
      redirectUri: import.meta.env.VITE_OKTA_REDIRECT_URI,
      scopes: ['openid', 'profile', 'email'],
      pkce: true,
      tokenManager: {
        storage: 'localStorage',
        autoRenew: true
      }
    });

    // Set up token renewal
    this.setupTokenRenewal();
  }

  private setupTokenRenewal() {
    this.oktaAuth.tokenManager.on('renewed', (key, newToken) => {
      console.log(`Token ${key} renewed`, newToken);
    });

    this.oktaAuth.tokenManager.on('error', (err) => {
      console.error('TokenManager error:', err);
    });
  }

  async login(): Promise<User> {
    await this.oktaAuth.signInWithRedirect();
    throw new Error('Redirecting to Okta...');
  }

  async handleCallback(): Promise<User> {
    const tokens = await this.oktaAuth.token.parseFromUrl();
    this.oktaAuth.tokenManager.setTokens(tokens);

    const userInfo = await this.oktaAuth.getUser();
    const user: User = {
      id: userInfo.sub!,
      name: userInfo.name || '',
      email: userInfo.email || '',
      role: (userInfo as any)['custom:role'] || 'solutions_engineer',
      is_active: true
    };

    localStorage.setItem('user_cache', JSON.stringify(user));
    return user;
  }

  async logout(): Promise<void> {
    await this.oktaAuth.signOut();
    localStorage.removeItem('user_cache');
  }

  getCurrentUser(): User | null {
    const accessToken = this.oktaAuth.tokenManager.get('accessToken');
    if (!accessToken) return null;

    const cached = localStorage.getItem('user_cache');
    return cached ? JSON.parse(cached) : null;
  }

  isAuthenticated(): boolean {
    const accessToken = this.oktaAuth.tokenManager.get('accessToken');
    return accessToken !== undefined;
  }

  async refreshToken(): Promise<void> {
    await this.oktaAuth.tokenManager.renew('accessToken');
    await this.oktaAuth.tokenManager.renew('idToken');
  }

  async getAccessToken(): Promise<string | undefined> {
    const accessToken = await this.oktaAuth.tokenManager.get('accessToken');
    return accessToken?.accessToken;
  }
}

// Update the AuthService constructor:
class AuthService {
  private provider: AuthProvider;

  constructor() {
    // Use Okta in production
    if (import.meta.env.PROD) {
      this.provider = new OktaAuthProvider();
    } else {
      // Use localStorage in development for easier testing
      this.provider = new LocalStorageAuthProvider();
    }
  }
  // ... rest of the class
}
```

---

## Step 6: Update Login Component

Update `frontend/src/pages/Login.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { User } from '../types';
import { storageService } from '../services/localStorage';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if this is a callback from Okta
  useEffect(() => {
    const handleOktaCallback = async () => {
      if (window.location.pathname === '/login/callback') {
        setLoading(true);
        try {
          const user = await (authService.provider as any).handleCallback();
          onLogin(user);
          navigate('/');
        } catch (err: any) {
          console.error('Okta callback error:', err);
          setError(err.message || 'Failed to authenticate');
        } finally {
          setLoading(false);
        }
      }
    };

    handleOktaCallback();
  }, [onLogin, navigate]);

  // In production, use Okta
  const handleOktaLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await authService.login({});
      // Will redirect to Okta - this line won't be reached
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
      setLoading(false);
    }
  };

  // In development, use email selection (existing functionality)
  const [selectedEmail, setSelectedEmail] = useState('');
  const users = storageService.getAllUsers().filter(u => u.is_active);

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmail) return;

    setLoading(true);
    setError('');
    try {
      const user = await authService.login({ email: selectedEmail });
      onLogin(user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  // Show different UI based on environment
  const isProduction = import.meta.env.PROD;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Sign In to EliteOps
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {isProduction ? (
          // Production: Okta SSO
          <button
            onClick={handleOktaLogin}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all disabled:opacity-50"
          >
            Sign In with Okta
          </button>
        ) : (
          // Development: Email selection
          <form onSubmit={handleDevLogin}>
            <label className="block text-sm font-medium text-primary-100 mb-2">
              Select User (Development Only)
            </label>
            <select
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="w-full px-4 py-2 mb-4 border-2 border-primary-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Choose a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.email}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading || !selectedEmail}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
```

---

## Step 7: Update App.tsx

Add callback route in `frontend/src/App.tsx`:

```typescript
import { Routes, Route } from 'react-router-dom';

function App() {
  // ... existing code

  return (
    <Layout currentUser={currentUser} onLogout={handleLogout}>
      <Routes>
        <Route path="/login/callback" element={<div>Processing login...</div>} />
        <Route path="/" element={<Dashboard />} />
        {/* ... other routes */}
      </Routes>
    </Layout>
  );
}
```

---

## Step 8: Backend API Integration

### 8.1 Token Validation

Your backend API must validate Okta tokens:

```typescript
// backend/middleware/auth.ts
import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

export const authenticate = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.OKTA_ISSUER}/v1/keys`
  }),
  audience: process.env.OKTA_AUDIENCE,
  issuer: process.env.OKTA_ISSUER,
  algorithms: ['RS256']
});

// Usage
app.get('/api/onboarding', authenticate, async (req, res) => {
  // req.auth contains decoded JWT
  const userId = req.auth.sub;
  // ... fetch data for user
});
```

### 8.2 Make API Calls with Token

Update API client to include tokens:

```typescript
// frontend/src/services/apiClient.ts
import { authService } from './authService';

class ApiClient {
  private baseUrl = import.meta.env.VITE_API_URL;

  private async getHeaders(): Promise<HeadersInit> {
    const token = await authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: await this.getHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired - refresh or redirect to login
        await authService.refreshToken();
        // Retry request
        return this.get(endpoint);
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      if (response.status === 401) {
        await authService.refreshToken();
        return this.post(endpoint, data);
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
```

---

## Step 9: Testing

### 9.1 Development Testing

```bash
npm run dev
```

- Should use localStorage-based auth
- No Okta integration active

### 9.2 Production Testing

```bash
npm run build
npm run preview
```

- Will attempt to use Okta auth
- Requires valid Okta configuration

---

## Step 10: Deployment

### 10.1 Environment Variables

Set in your hosting platform (Netlify, Vercel, etc.):
- `VITE_API_URL`
- `VITE_OKTA_CLIENT_ID`
- `VITE_OKTA_ISSUER`
- `VITE_OKTA_REDIRECT_URI`

### 10.2 Build and Deploy

```bash
npm run build
# Deploy dist/ folder
```

---

## Troubleshooting

### Issue: "Invalid redirect URI"
**Solution**: Ensure redirect URIs in Okta match exactly (including trailing slashes)

### Issue: "Token validation failed"
**Solution**: Verify issuer URL includes `/oauth2/default`

### Issue: "CORS error"
**Solution**: Add your domain to Okta Trusted Origins

### Issue: "Custom role attribute not found"
**Solution**: Ensure role attribute is added to user profile and included in token claims

---

## Security Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Never commit `.env` files to git
3. ✅ Rotate client secrets regularly
4. ✅ Enable MFA in Okta for all users
5. ✅ Set appropriate token expiration times
6. ✅ Implement proper CORS policies
7. ✅ Log all authentication attempts
8. ✅ Monitor for suspicious activity

---

## Support

For Okta-specific issues:
- **Documentation**: https://developer.okta.com/docs/
- **Community**: https://devforum.okta.com/

For application issues:
- Check `SECURITY_AUDIT.md` for security guidelines
- Review `frontend/src/services/authService.ts` for implementation details

---

## Rollback Plan

If SSO integration has issues, you can quickly rollback:

1. Update `authService.ts` constructor:
```typescript
constructor() {
  // Force development mode
  this.provider = new LocalStorageAuthProvider();
}
```

2. Rebuild and redeploy:
```bash
npm run build
```

This will revert to the localStorage-based authentication while you troubleshoot.
