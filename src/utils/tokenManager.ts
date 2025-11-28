// Token management utilities

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  user: any;
}

export function getTokens(): { accessToken: string | null; refreshToken: string | null } {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  };
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

export function getTokenExpiry(token: string): Date | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
}

export function shouldRefreshToken(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    const now = Date.now();
    const timeUntilExpiry = exp - now;
    
    // Refresh if less than 2 minutes remaining
    return timeUntilExpiry < 2 * 60 * 1000;
  } catch {
    return true;
  }
}

export async function refreshTokens(): Promise<boolean> {
  try {
    const { refreshToken } = getTokens();
    if (!refreshToken) {
      return false;
    }

    const response = await fetch('http://localhost:9876/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      setTokens(data.data.accessToken, data.data.refreshToken || refreshToken);
      return true;
    }

    clearTokens();
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearTokens();
    return false;
  }
}

// Auto-refresh token before it expires
export function startTokenRefreshTimer(): void {
  const checkInterval = 60 * 1000; // Check every minute

  const intervalId = setInterval(async () => {
    const { accessToken } = getTokens();
    
    if (!accessToken) {
      clearInterval(intervalId);
      return;
    }

    if (shouldRefreshToken(accessToken)) {
      console.log('Auto-refreshing token...');
      const success = await refreshTokens();
      
      if (!success) {
        clearInterval(intervalId);
        window.location.href = '/auth/login';
      }
    }
  }, checkInterval);

  // Store interval ID to clear on logout
  (window as any).__tokenRefreshInterval = intervalId;
}

export function stopTokenRefreshTimer(): void {
  const intervalId = (window as any).__tokenRefreshInterval;
  if (intervalId) {
    clearInterval(intervalId);
    delete (window as any).__tokenRefreshInterval;
  }
}
