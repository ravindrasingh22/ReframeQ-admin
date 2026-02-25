import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { PaymentsPage } from '../pages/PaymentsPage';
import { SectionPage } from '../pages/SectionPage';
import { UsersPage } from '../pages/UsersPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users-accounts" element={<UsersPage />} />
        <Route
          path="/content-library"
          element={
            <SectionPage
              title="Content Library"
              subtitle="CBT skills content and learning journey management."
              bullets={[
                'Journeys: Calm Mind, Overthinking Reset, Social Confidence',
                'Exercises: Thought Record, Reframe, Confidence Ladder, Reflection Prompts',
                'Draft, publish, and version history with A/B content variants'
              ]}
            />
          }
        />
        <Route
          path="/ai-experience"
          element={
            <SectionPage
              title="AI Experience"
              subtitle="Prompt controls and response-quality settings for wellness coaching."
              bullets={[
                'Prompt templates for Reframe Coach and thought helper',
                'Style presets: friendly, structured, concise',
                'Low-confidence routing to clarifying questions and safer phrasing rules'
              ]}
            />
          }
        />
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
          path="/engagement"
          element={
            <SectionPage
              title="Engagement"
              subtitle="Notification templates, streaks, and campaign scheduling."
              bullets={[
                'Push and email reminders for check-ins and practice streaks',
                'In-app announcement templates',
                'Campaign scheduler and audience targeting'
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
        <Route
          path="/support"
          element={
            <SectionPage
              title="Support"
              subtitle="User feedback and help center operations."
              bullets={[
                'Ticket inbox and response queue',
                'FAQ editor and known issues page',
                'Refund and dispute routing'
              ]}
            />
          }
        />
        <Route path="/billing" element={<PaymentsPage />} />
        <Route
          path="/localization"
          element={
            <SectionPage
              title="Localization"
              subtitle="Language, tone packs, and accessibility settings."
              bullets={[
                'Localization by region and age segment',
                'Tone packs: kid-friendly, teen, adult',
                'Accessibility controls including readable font presets'
              ]}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <SectionPage
              title="Settings"
              subtitle="Operational configuration across platform modules."
              bullets={[
                'Feature flags and environment settings',
                'Data retention windows and privacy defaults',
                'Integration keys and service toggles'
              ]}
            />
          }
        />
        <Route
          path="/audit-logs"
          element={
            <SectionPage
              title="Audit Logs"
              subtitle="RBAC, change history, and operational traceability."
              bullets={[
                'Track who changed prompts, content, and safety rules',
                'Role-based access control events',
                'Consent and privacy request logs'
              ]}
            />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
