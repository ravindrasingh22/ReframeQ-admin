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
  mobile_country_code: string;
  mobile_number: string;
  city: string;
  state: string;
  role: string;
  is_active: boolean;
  country: string;
  language: string;
  member_since: string | null;
  invite_code: string | null;
  onboarding_step: string;
  onboarding_completed: boolean;
  onboarding_updated_at: string | null;
  onboarding_state: Record<string, unknown>;
  mood_logs: MoodLog[];
};

export type MoodLog = {
  id: number;
  mood_id: string;
  mood_label: string;
  checkin_date: string;
  created_at: string;
  updated_at: string;
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

export type PromptTemplateItem = {
  key: string;
  label: string;
  system_prompt: string;
  developer_prompt: string;
  enabled: boolean;
};

export type PromptTemplatesResponse = {
  items: PromptTemplateItem[];
};

export type ModelConfiguration = {
  provider: string;
  default_model: string;
  onboarding_model: string;
  fallback_model: string;
  base_url: string;
  timeout_seconds: number;
  temperature: number;
  enabled: boolean;
};

export type OnboardingTextScreenConfig = {
  key: string;
  title: string;
  subtitle: string;
  primary_cta: string;
  secondary_cta: string;
  enabled: boolean;
};

export type OnboardingTextConfiguration = {
  screens: OnboardingTextScreenConfig[];
};

export type ToggleItem = {
  key: string;
  label: string;
  enabled: boolean;
};

export type OnboardingPolicyConfiguration = {
  onboarding_enabled: boolean;
  allow_resume: boolean;
  enabled_user_types: ToggleItem[];
  enabled_account_modes: ToggleItem[];
  allow_family_flows: boolean;
  require_invite_for_family_join: boolean;
};

export type FirstReframeConfig = {
  enabled: boolean;
  model_name: string;
  temperature: number;
  max_tokens: number;
  schema_version: string;
  show_pattern_label: boolean;
  show_titles: boolean;
  system_prompt: string;
  developer_prompt: string;
  fallback_template_json: Record<string, unknown>;
  style_overrides: Record<string, unknown>;
  goal_overrides: Record<string, unknown>;
  user_type_overrides: Record<string, unknown>;
  safety_overrides: Record<string, unknown>;
};

export type FirstReframePreviewResponse = {
  model: string;
  result: Record<string, unknown>;
};
