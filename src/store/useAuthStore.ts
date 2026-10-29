import { create } from 'zustand';
import { UserProfile } from '@/types/api';

export function extractRolesFromJwt(token: string | null | undefined): string[] {
  if (!token) return [];
  try {
    const parts = token.split('.');
    if (parts.length < 2) return [];
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    const roleValues =
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      decoded['role'] ||
      decoded['roles'] ||
      decoded['Role'] ||
      decoded['Roles'];

    if (!roleValues) return [];
    if (Array.isArray(roleValues)) return roleValues.map(String);
    return [String(roleValues)];
  } catch (err) {
    console.warn('Could not extract roles from JWT:', err);
    return [];
  }
}

export function checkIsAdmin(user: UserProfile | null | undefined, token?: string | null): boolean {
  const tokenRoles = token ? extractRolesFromJwt(token) : [];
  const rawList: any[] = [
    ...(Array.isArray(user?.roles) ? user.roles : []),
    ...(user?.role ? [user.role] : []),
    ...tokenRoles,
  ];

  return rawList.some((r) => {
    if (typeof r === 'string') {
      const lower = r.trim().toLowerCase();
      return lower === 'admin' || lower === 'administrator' || lower.includes('admin');
    }
    return false;
  });
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  setAuth: (token: string, user: UserProfile) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,

  setAuth: (token: string, user: UserProfile) => {
    const tokenRoles = extractRolesFromJwt(token);
    const combinedRoles = Array.from(new Set([...(user.roles || []), ...tokenRoles]));
    const fullUser: UserProfile = {
      ...user,
      roles: combinedRoles,
      role: combinedRoles[0] || user.role,
    };
    const isAdmin = checkIsAdmin(fullUser, token);

    if (typeof window !== 'undefined') {
      localStorage.setItem('abaya_auth_token', token);
      localStorage.setItem('abaya_user', JSON.stringify(fullUser));
    }

    set({
      token,
      user: fullUser,
      isAuthenticated: true,
      isLoading: false,
      isAdmin,
    });
  },

  updateUser: (updated) => {
    const current = get().user;
    const token = get().token;
    if (current) {
      const next: UserProfile = { ...current, ...updated };
      const isAdmin = checkIsAdmin(next, token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('abaya_user', JSON.stringify(next));
      }
      set({ user: next, isAdmin });
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('abaya_auth_token');
      localStorage.removeItem('abaya_user');
    }
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false,
    });
  },

  loadFromStorage: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }
    const token = localStorage.getItem('abaya_auth_token');
    const storedUser = localStorage.getItem('abaya_user');

    if (!token) {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isAdmin: false,
      });
      return;
    }

    let parsedUser: UserProfile | null = null;
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser);
      } catch {
        parsedUser = null;
      }
    }

    const tokenRoles = extractRolesFromJwt(token);
    if (parsedUser) {
      const combinedRoles = Array.from(
        new Set([...(parsedUser.roles || []), ...tokenRoles])
      );
      parsedUser = {
        ...parsedUser,
        roles: combinedRoles,
        role: combinedRoles[0] || parsedUser.role,
      };
    }

    const isAdmin = checkIsAdmin(parsedUser, token);

    set({
      token,
      user: parsedUser,
      isAuthenticated: true,
      isLoading: false,
      isAdmin,
    });

    // Background verify and refresh profile
    try {
      const { accountService } = await import('@/api/account');
      const freshProfile = await accountService.getProfile();
      const freshTokenRoles = extractRolesFromJwt(token);
      const combinedRoles = Array.from(
        new Set([...(freshProfile.roles || []), ...freshTokenRoles])
      );
      const mergedFreshUser: UserProfile = {
        ...freshProfile,
        roles: combinedRoles,
        role: combinedRoles[0] || freshProfile.role,
      };
      const freshIsAdmin = checkIsAdmin(mergedFreshUser, token);

      localStorage.setItem('abaya_user', JSON.stringify(mergedFreshUser));
      set({ user: mergedFreshUser, isAdmin: freshIsAdmin });
    } catch {
      // If profile fails with 401, interceptor will clear and notify
    }
  },
}));
