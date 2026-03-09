import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminLayout } from '../components/AdminLayout';
import { RequireAuth } from '../components/RequireAuth';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { ContentLibraryPage } from '../pages/ContentLibraryPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LanguageSettingsPage } from '../pages/LanguageSettingsPage';
import { LoginPage } from '../pages/LoginPage';
import { ModelConfigurationPage } from '../pages/ModelConfigurationPage';
import { OnboardingAIPage } from '../pages/OnboardingAIPage';
import { OnboardingPolicyConfigurationPage } from '../pages/OnboardingPolicyConfigurationPage';
import { OnboardingTextConfigurationPage } from '../pages/OnboardingTextConfigurationPage';
import { PromptsConfigurationPage } from '../pages/PromptsConfigurationPage';
import { SectionPage } from '../pages/SectionPage';
import { UsersPage } from '../pages/UsersPage';
import { UserProfilePage } from '../pages/UserProfilePage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users-accounts" element={<UsersPage />} />
          <Route path="/users-accounts/:userId" element={<UserProfilePage />} />
          <Route path="/language-settings" element={<LanguageSettingsPage />} />
          <Route path="/content-library" element={<ContentLibraryPage />} />
          <Route path="/prompts-configuration" element={<PromptsConfigurationPage />} />
          <Route path="/model-configuration" element={<ModelConfigurationPage />} />
          <Route path="/onboarding-text-configuration" element={<OnboardingTextConfigurationPage />} />
          <Route path="/onboarding-policy-configuration" element={<OnboardingPolicyConfigurationPage />} />
          <Route path="/ai-experience" element={<OnboardingAIPage />} />
          <Route
            path="/safety-boundaries"
            element={
              <SectionPage
                title="Safety & Boundaries"
                subtitle="Rule management for supportive wellness boundaries."
                bullets={[
                  'Sensitive-topic detections and supportive auto-responses',
                  'Emergency resource prompts by region',
                  'Session-level guardrails with anonymized QA event logs'
                ]}
              />
            }
          />
          <Route
            path="/analytics"
            element={
              <SectionPage
                title="Analytics"
                subtitle="Behavior and product analytics for self-help outcomes."
                bullets={[
                  'Onboarding and exercise completion funnels',
                  'Cohort retention and content drop-off',
                  'Wellbeing self-rating trends and search analytics'
                ]}
              />
            }
          />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
