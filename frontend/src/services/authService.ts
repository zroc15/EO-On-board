/**
 * Authentication Service
 *
 * This service abstracts authentication logic to make it easy to swap
 * implementations (localStorage → Okta/SSO) without changing application code.
 *
 * Current Implementation: localStorage (Development Only)
 * Future Implementation: Okta SSO + JWT tokens
 */

import { User } from '../types';
import { storageService } from './localStorage';

/**
 * Authentication Provider Interface
 *
 * This interface defines the contract that any auth provider must implement.
 * When switching to Okta, create an OktaAuthProvider that implements this interface.
 */
export interface AuthProvider {
  /**
   * Authenticate user with credentials
   * @param credentials - Authentication credentials (email for dev, tokens for SSO)
   * @returns Promise resolving to authenticated user
   */
  login(credentials: any): Promise<User>;

  /**
   * Log out current user
   */
  logout(): Promise<void>;

  /**
   * Get currently authenticated user
   * @returns Current user or null if not authenticated
   */
  getCurrentUser(): User | null;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean;

  /**
   * Refresh authentication token (for SSO)
   */
  refreshToken?(): Promise<void>;

  /**
   * Get access token for API calls (for SSO)
   */
  getAccessToken?(): Promise<string | undefined>;
}

/**
 * LocalStorage Auth Provider (Development Only)
 *
 * WARNING: This is NOT secure and should ONLY be used for development/demo.
 * Replace with OktaAuthProvider for production.
 */
class LocalStorageAuthProvider implements AuthProvider {
  async login(credentials: { email: string }): Promise<User> {
    const users = storageService.getAllUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.is_active) {
      throw new Error('User account is inactive');
    }

    // Store user in localStorage (DEV ONLY)
    storageService.setCurrentUser(user);

    return user;
  }

  async logout(): Promise<void> {
    storageService.setCurrentUser(null);
  }

  getCurrentUser(): User | null {
    return storageService.getCurrentUser();
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.is_active;
  }
}

/**
 * Okta Auth Provider (Future Implementation)
 *
 * Uncomment and implement when integrating with Okta:
 *
 * import { OktaAuth } from '@okta/okta-auth-js';
 *
 * class OktaAuthProvider implements AuthProvider {
 *   private oktaAuth: OktaAuth;
 *
 *   constructor() {
 *     this.oktaAuth = new OktaAuth({
 *       issuer: import.meta.env.VITE_OKTA_ISSUER,
 *       clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
 *       redirectUri: import.meta.env.VITE_OKTA_REDIRECT_URI,
 *       scopes: ['openid', 'profile', 'email'],
 *       pkce: true
 *     });
 *   }
 *
 *   async login(credentials?: never): Promise<User> {
 *     // Redirect to Okta for authentication
 *     await this.oktaAuth.signInWithRedirect();
 *
 *     // This method won't return - user will be redirected
 *     // User data will be available in handleCallback()
 *     throw new Error('Redirecting to Okta...');
 *   }
 *
 *   async handleCallback(): Promise<User> {
 *     const tokens = await this.oktaAuth.token.parseFromUrl();
 *     this.oktaAuth.tokenManager.setTokens(tokens);
 *
 *     const userInfo = await this.oktaAuth.getUser();
 *
 *     // Map Okta user to application User type
 *     const user: User = {
 *       id: userInfo.sub,
 *       name: userInfo.name || '',
 *       email: userInfo.email || '',
 *       role: userInfo['custom:role'] || 'solutions_engineer', // Custom Okta attribute
 *       is_active: true
 *     };
 *
 *     // Optionally cache user info in localStorage for offline access
 *     localStorage.setItem('user_cache', JSON.stringify(user));
 *
 *     return user;
 *   }
 *
 *   async logout(): Promise<void> {
 *     await this.oktaAuth.signOut();
 *     localStorage.removeItem('user_cache');
 *   }
 *
 *   getCurrentUser(): User | null {
 *     // Check if tokens are valid
 *     const accessToken = this.oktaAuth.tokenManager.get('accessToken');
 *     if (!accessToken) return null;
 *
 *     // Return cached user info
 *     const cached = localStorage.getItem('user_cache');
 *     return cached ? JSON.parse(cached) : null;
 *   }
 *
 *   isAuthenticated(): boolean {
 *     return this.oktaAuth.authStateManager.getAuthState()?.isAuthenticated || false;
 *   }
 *
 *   async refreshToken(): Promise<void> {
 *     const tokenManager = this.oktaAuth.tokenManager;
 *     await tokenManager.renew('accessToken');
 *     await tokenManager.renew('idToken');
 *   }
 *
 *   async getAccessToken(): Promise<string | undefined> {
 *     const accessToken = await this.oktaAuth.tokenManager.get('accessToken');
 *     return accessToken?.accessToken;
 *   }
 * }
 */

/**
 * Auth Service Singleton
 *
 * Usage throughout the application:
 *
 * import { authService } from './services/authService';
 *
 * // Login
 * const user = await authService.login({ email: 'user@example.com' });
 *
 * // Logout
 * await authService.logout();
 *
 * // Check authentication
 * if (authService.isAuthenticated()) {
 *   const user = authService.getCurrentUser();
 * }
 */
class AuthService {
  private provider: AuthProvider;

  constructor() {
    // In development, use localStorage provider
    // In production, swap this with OktaAuthProvider
    this.provider = new LocalStorageAuthProvider();

    // For production with Okta:
    // this.provider = new OktaAuthProvider();
  }

  /**
   * Set a different auth provider (useful for testing)
   */
  setProvider(provider: AuthProvider) {
    this.provider = provider;
  }

  /**
   * Authenticate user
   */
  async login(credentials: any): Promise<User> {
    return this.provider.login(credentials);
  }

  /**
   * Log out current user
   */
  async logout(): Promise<void> {
    return this.provider.logout();
  }

  /**
   * Get currently authenticated user
   */
  getCurrentUser(): User | null {
    return this.provider.getCurrentUser();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.provider.isAuthenticated();
  }

  /**
   * Refresh authentication token (for SSO implementations)
   */
  async refreshToken(): Promise<void> {
    if (this.provider.refreshToken) {
      return this.provider.refreshToken();
    }
  }

  /**
   * Get access token for API calls (for SSO implementations)
   */
  async getAccessToken(): Promise<string | undefined> {
    if (this.provider.getAccessToken) {
      return this.provider.getAccessToken();
    }
    return undefined;
  }
}

// Export singleton instance
export const authService = new AuthService();
