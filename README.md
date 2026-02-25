# ReframeQ Admin Portal

Web admin interface for ReframeQ. This portal is intended for internal staff and (optionally) parents with elevated permissions. It operates against the ReframeQ backend APIs for data, reporting, and content management.

## Goals
- Manage users, roles, and family links (parent ↔ child accounts).
- View aggregated mood/journal analytics; triage alerts.
- Curate daily “Reframe” micro-interventions and AI prompt templates.
- Handle localization content (English/Hinglish strings).

## Proposed Stack
- React (TypeScript)
- UI: component library such as MUI/Chakra/Ant Design (theme with the same pastel palette)
- Routing: React Router
- State/Data: React Query or SWR for API calls; lightweight context for auth/session
- Auth: token-based (JWT) once backend auth is available; mocked during early development

## Suggested Project Structure
```
ReframeQ-admin/
├── package.json
└── src/
    ├── App.tsx
    ├── components/
    ├── pages/
    │   ├── Login.tsx
    │   ├── Dashboard.tsx          # KPIs, alerts snapshot
    │   ├── Users/
    │   │   ├── Parents.tsx
    │   │   └── Children.tsx
    │   ├── Reports/
    │   │   ├── MoodTrends.tsx
    │   │   └── Journals.tsx
    │   ├── Content/
    │   │   ├── Reframes.tsx       # CRUD for micro-interventions
    │   │   └── Prompts.tsx        # AI prompt templates
    │   └── Settings/
    │       ├── Localization.tsx   # en/hi-en strings
    │       └── FeatureFlags.tsx
    ├── hooks/                     # useAuth, useApi, etc.
    ├── api/                       # typed clients to backend
    ├── theme/                     # pastel palette + typography
    ├── i18n/                      # admin UI translations
    └── utils/
```

## Backend Touchpoints (ReframeQ-backend)
- Auth (admin/staff/parent)
- User/role management; parent-child linkage
- Reports: mood trends, journal stats, alerts
- Content: Reframe exercises, AI prompt templates, localization keys

## Dev Notes
- Start with mocked API clients; swap to real endpoints when backend is ready.
- Protect admin routes; add RBAC checks in the UI.
- Keep accessibility and responsive design in mind (desktop-first, mobile-friendly where feasible).

## Next Steps
- Initialize React app with chosen UI library and theme.
- Scaffold pages with mocked data providers.
- Align API client interfaces with backend contracts once available.

