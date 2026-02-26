export type AdminUser = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  account_state: 'invited' | 'active' | 'paused' | string;
  member_since: string | null;
};

export type UsersResponse = {
  requested_by: string;
  visibility: string;
  users: AdminUser[];
};

export type UpdateUserPayload = {
  role?: string;
  is_active?: boolean;
};

export type CreateUserPayload = {
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  country: string;
  language: string;
  temp_password: string;
};

export type UserProfile = {
  user_id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  country: string;
  language: string;
  member_since: string | null;
};

export type FamilyProfile = {
  profile_id: number;
  primary_user_id: number;
  profile_type: 'child' | 'adult' | string;
  display_name: string;
  age_band: string;
  profile_active: boolean;
  consent_granted: boolean | null;
  consent_text_version: string | null;
  daily_time_limit_minutes: number | null;
  topic_restrictions: string[];
  conversation_visibility_rule: string | null;
};

export type FamilyProfilesResponse = {
  requested_by: string;
  primary_user_id: number;
  items: FamilyProfile[];
};

export type CreateFamilyProfilePayload = {
  profile_type: 'child' | 'adult';
  display_name: string;
  age_band: string;
  daily_time_limit_minutes: number;
  topic_restrictions: string[];
  conversation_visibility_rule: string;
};

export type UpdateChildPayload = {
  display_name?: string;
  age_band?: string;
  daily_time_limit_minutes?: number;
  topic_restrictions?: string[];
  conversation_visibility_rule?: string;
};

export type Journey = {
  id: number;
  title: string;
  topic: string;
  difficulty: string;
  is_published: boolean;
  summary: string;
};

export type JourneysResponse = {
  requested_by: string;
  items: Journey[];
};

export type AnalyticsOverview = {
  requested_by: string;
  summary: {
    dau: number;
    journey_completion_rate: number;
    sensitive_content_detections: number;
    top_journey: string;
  };
};

export type AuditEvent = {
  id: number;
  actor_email: string;
  actor_role: string | null;
  action: string;
  module: string;
  details: string;
  created_at: string;
};

export type AuditResponse = {
  requested_by: string;
  events: AuditEvent[];
};

export type SupportedLanguagesResponse = {
  supported_languages: string[];
  options: {
    code: string;
    name: string;
    enabled: boolean;
  }[];
};
