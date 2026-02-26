import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8001';
const ADMIN_TOKEN_KEY = 'reframeq_admin_token';
const ADMIN_ROLE_KEY = 'reframeq_admin_role';
const ADMIN_NAME_KEY = 'reframeq_admin_name';

export const apiClient = axios.create({
  baseURL
});

let adminToken = '';
let adminRole = '';
let adminName = '';
let redirectingToLogin = false;

export function setAdminToken(token: string) {
  adminToken = token;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function setAdminRole(role: string) {
  adminRole = role;
  localStorage.setItem(ADMIN_ROLE_KEY, role);
}

export function setAdminName(fullName: string) {
  adminName = fullName;
  localStorage.setItem(ADMIN_NAME_KEY, fullName);
}

export function initializeAdminToken() {
  adminToken = localStorage.getItem(ADMIN_TOKEN_KEY) ?? '';
  adminRole = localStorage.getItem(ADMIN_ROLE_KEY) ?? '';
  adminName = localStorage.getItem(ADMIN_NAME_KEY) ?? '';
}

export function clearAdminToken() {
  adminToken = '';
  adminRole = '';
  adminName = '';
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_ROLE_KEY);
  localStorage.removeItem(ADMIN_NAME_KEY);
}

export function hasAdminToken(): boolean {
  return Boolean(adminToken || localStorage.getItem(ADMIN_TOKEN_KEY));
}

export function getAdminRole(): string {
  return adminRole || localStorage.getItem(ADMIN_ROLE_KEY) || 'unknown';
}

export function getAdminName(): string {
  return adminName || localStorage.getItem(ADMIN_NAME_KEY) || '';
}

apiClient.interceptors.request.use((config) => {
  if (!adminToken) {
    adminToken = localStorage.getItem(ADMIN_TOKEN_KEY) ?? '';
  }

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status as number | undefined;
    const requestUrl = String(error?.config?.url ?? '');
    const isLoginCall = requestUrl.includes('/api/admin/auth/login');

    if (status === 401 && !isLoginCall) {
      clearAdminToken();
      if (!redirectingToLogin) {
        redirectingToLogin = true;
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        } else {
          redirectingToLogin = false;
        }
      }
    }

    return Promise.reject(error);
  }
);
