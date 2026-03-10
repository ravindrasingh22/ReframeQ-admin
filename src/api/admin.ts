import { apiClient } from './client';
import type {
  AnalyticsOverview,
  AuditResponse,
  CreateUserPayload,
  CreateFamilyProfilePayload,
  FamilyProfile,
  FamilyProfilesResponse,
  JourneysResponse,
  UpdateChildPayload,
  UpdateUserPayload,
  UserProfile,
  UsersResponse,
  SupportedLanguagesResponse,
  FirstReframeConfig,
  FirstReframePreviewResponse,
  ModelConfiguration,
  OnboardingPolicyConfiguration,
  OnboardingTextConfiguration,
  PromptTemplateItem,
  PromptTemplatesResponse
} from '../types/admin';

export async function loginAdmin(email: string, password: string) {
  const response = await apiClient.post('/api/admin/auth/login', { email, password });
  return response.data as { access_token: string; token_type: string; role: string; full_name: string };
}

export async function fetchAdminMe() {
  const response = await apiClient.get('/api/admin/auth/me');
  return response.data as { email: string; role: string; full_name: string };
}

export async function fetchUsers() {
  const response = await apiClient.get('/api/admin/users/');
  return response.data as UsersResponse;
}

export async function createUser(payload: CreateUserPayload) {
  const response = await apiClient.post('/api/admin/users/', payload);
  return response.data;
}

export async function fetchUserProfile(userId: number) {
  const response = await apiClient.get(`/api/admin/users/${userId}/profile`);
  return response.data as UserProfile;
}

export async function updateUserProfile(
  userId: number,
  payload: {
    full_name: string;
    mobile_country_code: string;
    mobile_number: string;
    city: string;
    state: string;
    role: string;
    is_active: boolean;
    country: string;
    language: string;
  }
) {
  const response = await apiClient.patch(`/api/admin/users/${userId}/profile`, payload);
  return response.data as UserProfile;
}

export async function changeUserPassword(userId: number, newPassword: string) {
  const response = await apiClient.post(`/api/admin/users/${userId}/password`, { new_password: newPassword });
  return response.data;
}

export async function updateUser(userId: number, payload: UpdateUserPayload) {
  const response = await apiClient.patch(`/api/admin/users/${userId}`, payload);
  return response.data;
}

export async function deleteUser(userId: number) {
  const response = await apiClient.delete(`/api/admin/users/${userId}`);
  return response.data;
}

export async function bulkUserAction(payload: {
  user_ids: number[];
  action: 'set_status' | 'set_role' | 'delete';
  is_active?: boolean;
  role?: string;
}) {
  const response = await apiClient.post('/api/admin/users/bulk', payload);
  return response.data;
}

export async function fetchProfilesByPrimaryUser(primaryUserId: number) {
  const response = await apiClient.get(`/api/admin/users/${primaryUserId}/profiles`);
  return response.data as FamilyProfilesResponse;
}

export async function createProfileForPrimaryUser(primaryUserId: number, payload: CreateFamilyProfilePayload) {
  const response = await apiClient.post(`/api/admin/users/${primaryUserId}/profiles`, payload);
  return response.data as FamilyProfile;
}

export async function updateChildProfile(profileId: number, payload: UpdateChildPayload) {
  const response = await apiClient.patch(`/api/admin/users/children/${profileId}`, payload);
  return response.data as FamilyProfile;
}

export async function updateChildStatus(profileId: number, profileActive: boolean) {
  const response = await apiClient.patch(`/api/admin/users/children/${profileId}/status`, {
    profile_active: profileActive
  });
  return response.data as FamilyProfile;
}

export async function deleteChildProfile(profileId: number) {
  const response = await apiClient.delete(`/api/admin/users/children/${profileId}`);
  return response.data;
}

export async function getChildConsent(profileId: number) {
  const response = await apiClient.get(`/api/admin/users/children/${profileId}/consent`);
  return response.data as FamilyProfile;
}

export async function recordChildConsent(profileId: number, guardianUserId: number, consentTextVersion = 'v1') {
  const response = await apiClient.post(`/api/admin/users/children/${profileId}/consent`, {
    guardian_user_id: guardianUserId,
    consent_text_version: consentTextVersion
  });
  return response.data as FamilyProfile;
}

export async function fetchJourneys() {
  const response = await apiClient.get('/api/admin/content/journeys');
  return response.data as JourneysResponse;
}

export async function fetchAnalyticsOverview() {
  const response = await apiClient.get('/api/admin/analytics/overview');
  return response.data as AnalyticsOverview;
}

export async function fetchAuditLogs(filters?: {
  startDate?: string;
  endDate?: string;
  actorEmail?: string;
  role?: string;
  action?: string;
  window?: string;
}) {
  const response = await apiClient.get('/api/admin/audit-logs/', {
    params: {
      start_date: filters?.startDate || undefined,
      end_date: filters?.endDate || undefined,
      actor_email: filters?.actorEmail || undefined,
      role: filters?.role || undefined,
      action: filters?.action || undefined,
      window: filters?.window || undefined
    }
  });
  return response.data as AuditResponse;
}

export async function fetchSupportedLanguages() {
  const response = await apiClient.get('/api/admin/settings/languages');
  return response.data as SupportedLanguagesResponse;
}

export async function updateSupportedLanguages(supportedLanguages: string[]) {
  const response = await apiClient.put('/api/admin/settings/languages', {
    supported_languages: supportedLanguages
  });
  return response.data as SupportedLanguagesResponse;
}

export async function fetchPromptTemplates() {
  const response = await apiClient.get('/api/admin/settings/prompts');
  return response.data as PromptTemplatesResponse;
}

export async function updatePromptTemplates(items: PromptTemplateItem[]) {
  const response = await apiClient.put('/api/admin/settings/prompts', { items });
  return response.data as PromptTemplatesResponse;
}

export async function fetchModelConfiguration() {
  const response = await apiClient.get('/api/admin/settings/models');
  return response.data as ModelConfiguration;
}

export async function updateModelConfiguration(payload: ModelConfiguration) {
  const response = await apiClient.put('/api/admin/settings/models', payload);
  return response.data as ModelConfiguration;
}

export async function fetchOnboardingTextConfiguration() {
  const response = await apiClient.get('/api/admin/settings/onboarding-text');
  return response.data as OnboardingTextConfiguration;
}

export async function updateOnboardingTextConfiguration(payload: OnboardingTextConfiguration) {
  const response = await apiClient.put('/api/admin/settings/onboarding-text', payload);
  return response.data as OnboardingTextConfiguration;
}

export async function fetchOnboardingPolicyConfiguration() {
  const response = await apiClient.get('/api/admin/settings/onboarding-policy');
  return response.data as OnboardingPolicyConfiguration;
}

export async function updateOnboardingPolicyConfiguration(payload: OnboardingPolicyConfiguration) {
  const response = await apiClient.put('/api/admin/settings/onboarding-policy', payload);
  return response.data as OnboardingPolicyConfiguration;
}

export async function fetchFirstReframeConfig() {
  const response = await apiClient.get('/api/admin/ai/onboarding/first-reframe');
  return response.data as FirstReframeConfig;
}

export async function updateFirstReframeConfig(payload: FirstReframeConfig) {
  const response = await apiClient.put('/api/admin/ai/onboarding/first-reframe', payload);
  return response.data as FirstReframeConfig;
}

export async function previewFirstReframe(payload: {
  user_thought: string;
  user_type: string;
  account_mode: string;
  goal: string;
  secondary_goals: string[];
  clarity_score?: number;
  control_score?: number;
  mental_noise_score?: number;
  readiness_score?: number;
  coach_style: string;
  language: string;
  country: string;
}) {
  const response = await apiClient.post('/api/admin/ai/onboarding/first-reframe/preview', payload);
  return response.data as FirstReframePreviewResponse;
}
