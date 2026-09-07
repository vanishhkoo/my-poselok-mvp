# MVP Rebuild Plan — «Мой посёлок» MVP 1.0

**Назначение:** стратегия пересборки MVP другим AI-агентом разработки.  
**Reference codebase:** текущий репозиторий (`main` @ `028c97cf`).  
**Companion doc:** [MVP_TECHNICAL_MAP.md](./MVP_TECHNICAL_MAP.md) — инвентаризация существующего кода.

**Принцип работы нового агента:**

> Существующий репозиторий — **REFERENCE IMPLEMENTATION**, а не обязательный blueprint.  
> Переносить работающую логику и проверенные контракты; **не** переносить Manus lock-in, монолитный технический долг и модули вне MVP 1.0.

**Легенда решений:**

| Решение | Значение |
|---------|----------|
| **REUSE AS IS** | Можно перенести с минимальными правками (imports, env, paths) |
| **REFACTOR** | Логика ценна, но требует упрощения, декомпозиции или замены зависимостей |
| **REBUILD** | Реализовать заново; reference только для поведения и контрактов |
| **DO NOT TRANSFER** | Не входит в новый MVP |

---

## 0. Целевая архитектура нового MVP (high-level)

```
┌─────────────────────────────────────────────────────────────────┐
│  app.my-poselok.ru          Public SPA (Journal, Article, Auth) │
├─────────────────────────────────────────────────────────────────┤
│  moderation.my-poselok.ru   Moderator SPA (Phase 6+, split)     │
├─────────────────────────────────────────────────────────────────┤
│  admin.my-poselok.ru        Admin SPA (Phase 7+, split)         │
└─────────────────────────────────────────────────────────────────┘
                              │
                    API (tRPC or REST — на выбор агента)
                              │
              ┌───────────────┼───────────────┐
              │               │               │
           MySQL         Email provider   Object Storage
                        (RuSender OK)    (provider-agnostic)
```

**Рекомендация:** сохранить **tRPC + Drizzle + React**, но **разделить** `routers.ts` и `AdminPage.tsx` на domain modules. Subdomains admin/moderation — **целевая** архитектура; на Phase 0–5 допустим monorepo с path-based routing, если заложен split по apps/packages.

---

## 1. Модуль 01 — AUTH

### 1.1. Таблица компонентов

| Компонент | Текущее состояние | Решение | Причина | Что передать новому агенту |
|-----------|-------------------|---------|---------|----------------------------|
| `AuthPage.tsx` | Полный mobile flow: login, register, OTP, recovery | **REFACTOR** | Рабочий UX, но смешан с SiteShell duplicate | Reference для шагов и labels; вынести shared auth form |
| `SiteShell.tsx` (auth block) | Desktop modal + duplicate auth logic | **REBUILD** | ~900+ строк shell; дублирует AuthPage | Паттерн `loginOpen` + mobile redirect; не копировать whole file |
| `AuthContext.tsx` | Canonical session: signIn, signOut, sessionState | **REUSE AS IS** → **REFACTOR** | Ядро MVP auth; alias `useTestAuth` — tech debt | `AuthContext.tsx` + tests |
| `AuthPage` + `SiteShell` unified | Два independent implementations | **REBUILD** | Single auth UI module | Один `AuthFlow` component |
| `authSecurity.ts` | scrypt, OTP HMAC, rate limit hashing | **REUSE AS IS** | Security-critical, tested | Whole file |
| `rusender.ts` | RuSender HTTP client | **REUSE AS IS** | Provider-agnostic enough; swap via env | Whole file + env contract |
| `server/db.ts` auth functions | Registration, OTP, login, recovery | **REFACTOR** | Monolith db.ts; logic sound | Extract `authRepository.ts` from db functions |
| `auth` tRPC router | 12+ procedures, working contracts | **REFACTOR** | Keep procedures; split from mega-router | Procedure list + input schemas from `routers.ts` |
| `sdk.ts` JWT + cookie | `app_session_id`, passwordSessionVersion | **REFACTOR** | JWT model good; Manus OAuth paths mixed in | JWT sign/verify + cookie only |
| `oauth.ts` Manus OAuth | Secondary callback route | **DO NOT TRANSFER** | Not primary MVP UI | — |
| `useAuth.ts` (legacy) | OAuth template hook | **DO NOT TRANSFER** | Superseded by AuthContext | — |
| `main.tsx` manus-cookie Bearer | sessionStorage JWT mirror | **DO NOT TRANSFER** | Manus preview hack; XSS risk | Cookie-only client |
| `LegalConsentDialog.tsx` | Post-login legal gate | **REFACTOR** | Required for writes; can simplify for MVP | Behavior + `legal.acceptRequired` |
| `ConsentPage.tsx` | Mobile consent | **REFACTOR** | Pair with LegalConsentDialog | Mobile variant |
| `shared/passwordPolicy.ts` | Password rules | **REUSE AS IS** | Shared client/server | Whole file |
| `authChallenges` + `authRateLimits` tables | OTP + rate limiting | **REUSE AS IS** | Canonical data model | Schema + migrations 0060–0062 |
| `users.passwordHash`, `emailVerifiedAt` | Password auth fields | **REUSE AS IS** | Core identity | Schema columns |

### 1.2. Особый анализ AUTH

**Что сохранить:**
- Email → OTP → password registration flow (`checkRegistrationEmail` → `startRegistration` → `verifyRegistrationCode`)
- Password login + `passwordSessionVersion` invalidation on recovery
- Cookie `app_session_id` (httpOnly) as primary session transport
- `authSecurity.ts` cryptography
- RuSender integration (or adapter with same interface)
- `requireActor(email)` pattern matching session

**Manus-зависимости удалить:**
- `server/_core/oauth.ts`, Manus branches in `sdk.ts`
- `client/src/const.ts` `startLogin()`
- `sessionStorage["manus-cookie"]` in `main.tsx` and `AuthContext.signOut`
- `useAuth.ts` OAuth hook

**JWT + cookie:** **ДА, сохранить.** Модель проверена (`passwordSessionPreviewFallback.test.ts`, `auth.logout.test.ts`). Новый проект: cookie-only на клиенте; Bearer только для service-to-service если нужно.

**RuSender:** **ДА, перенести** как default email adapter. Интерфейс:

```typescript
// Target abstraction (new code)
interface EmailOtpSender {
  sendOtp(params: { to: string; code: string; purpose: "registration" | "password_reset" }): Promise<void>;
}
// Reference: server/rusender.ts
```

**Canonical implementation files:**
1. `server/authSecurity.ts`
2. `server/rusender.ts`
3. `server/db.ts` (auth section: grep `startEmailRegistration`, `signInWithPassword`)
4. `client/src/contexts/AuthContext.tsx`
5. `client/src/pages/AuthPage.tsx`
6. `server/routers.ts` (`auth` router)
7. Tests: `authMvp.integration.test.ts`

---

## 2. Модуль 02 — JOURNAL

### 2.1. Таблица компонентов

| Компонент | Текущее состояние | Решение | Причина | Что передать новому агенту |
|-----------|-------------------|---------|---------|----------------------------|
| `Home.tsx` | Feed, sections, categories, ArticleCard, ColumnCarousel | **REFACTOR** | Core journal UX; file large (~200+ lines exports) | Split: FeedPage, ArticleCard, section nav |
| `ArticleCard` (in Home) | Card + metrics + navigation | **REFACTOR** | Reusable; currently coupled to Home | Extract to `components/journal/ArticleCard.tsx` |
| `ColumnCarousel` (in Home) | Editorial column widget | **REFACTOR** | MVP item «колонка автора» (editorial) | Component + `journal.column` query |
| `ContentMetrics.tsx` | Views/likes/comments/favorites on cards | **REFACTOR** | Good abstraction; MVP 1.0 journal needs views only on cards | Simplify props for MVP read path |
| `SectionFrame.tsx` | Journal layout | **REUSE AS IS** | Layout wrapper | Component |
| `SiteShell.tsx` (nav) | Journal nav, sections | **REFACTOR** | Entangled with auth/admin | Journal nav config only |
| `journal.list`, `listNew`, `column` | Working read APIs | **REUSE AS IS** | Stable contracts | tRPC procedures + db list functions |
| `journal.listFollowed`, `listFavorites` | Auth-required feeds | **DO NOT TRANSFER** | Not in target MVP 1.0 list | — |
| `journal.toggleLike` on cards | Inline like from feed | **DO NOT TRANSFER** | MVP JOURNAL spec: cards only, no interactions listed | — |
| `listMySettlement` section | Settlement feed | **DO NOT TRANSFER** | Out of MVP | — |
| `FeatureGate journal_*` | Platform flags | **REFACTOR** | Useful; simplify to MVP subset | `platform.features` pattern |
| `saveJournalReturnContext` | Scroll restore | **REUSE AS IS** | UX polish for read path | sessionStorage helper in Home |
| Hardcoded `defaultCategories` | Sidebar rubrics | **REBUILD** | Replace with `categories` table (see §8) | Category list UX only |

---

## 3. Модуль 03 — ARTICLE

### 3.1. Таблица компонентов

| Компонент | Текущее состояние | Решение | Причина | Что передать новому агенту |
|-----------|-------------------|---------|---------|----------------------------|
| `ArticlePage.tsx` | Full reader + comments + likes + share | **REFACTOR** | MVP 1.0: cover, content, author only | Strip interactions; keep layout |
| `ArticleContentRenderer.tsx` | Renders contentJson + media | **REUSE AS IS** | Core rendering | Whole file + `shared/articleContent.ts` |
| `articleOutline.ts` | TOC / scroll spy | **REFACTOR** | Nice UX; optional for MVP 1.0 | Reference if time permits |
| `journal.detail` | Load article + view count | **REUSE AS IS** | Canonical read API | Procedure + `getArticle()` |
| `visitorKey.ts` | Anonymous view tracking | **REUSE AS IS** | Clean utility | Whole file |
| Comments section (`#discussion`) | Full threaded comments | **DO NOT TRANSFER** | Not in MVP 1.0 ARTICLE spec | — |
| Likes, favorites, follow from article | Social interactions | **DO NOT TRANSFER** | Not in MVP 1.0 ARTICLE spec | — |
| `navigator.share` share | Client share | **DO NOT TRANSFER** | Not in spec | — |
| Related services block | Services cross-sell | **DO NOT TRANSFER** | Out of MVP | — |
| `ArticleRelatedCard`, read also | Cross-navigation | **REFACTOR** | Useful for AUTHOR link; optional | Link pattern to `/authors/:id` |
| Fallback cover URLs `/manus-storage/journal-*` | Static assets | **REBUILD** | Replace with neutral placeholders | Default cover component |

---

## 4. Модуль 04 — AUTHOR COLUMN

### 4.1. Таблица компонентов

| Компонент | Текущее состояние | Решение | Причина | Что передать новому агенту |
|-----------|-------------------|---------|---------|----------------------------|
| `AuthorPage.tsx` | Public profile + articles + services + follow | **REFACTOR** | MVP: author info + all articles + column | Remove services tab, follow for MVP 1.0 |
| `journal.author` | Author + articles query | **REUSE AS IS** | Canonical API | Procedure + `getAuthorProfile()` |
| `PublicProfileEditor.tsx` | Edit public identity | **REFACTOR** | Overlaps PROFILE; keep for owner edit | Component + `profile.updatePublicIdentity` |
| `PublicProfileEditPage.tsx` | Mobile edit route | **REFACTOR** | Route wrapper | Pattern |
| `AuthorArticleMiniCard.tsx` | Mini article links | **REUSE AS IS** | Reusable | Component |
| Editorial `ColumnCarousel` | Curated column issues | **REFACTOR** | MVP «колонка автора» = editorial column | See JOURNAL module |
| `authorFollows` + toggle follow | Subscription | **DO NOT TRANSFER** | Not in MVP 1.0 AUTHOR spec | — |
| `authorAchievements` | Gamification | **DO NOT TRANSFER** | Out of MVP | — |
| URL `/authors/:id` (not `/u/:username`) | Public URL by id | **REFACTOR** | Works; consider username route later | Routing decision doc |

---

## 5. Модуль 05 — PROFILE

### 5.1. Таблица компонентов

| Компонент | Текущее состояние | Решение | Причина | Что передать новому агенту |
|-----------|-------------------|---------|---------|----------------------------|
| `ProfilePage.tsx` | Large hub: profile, applications, legal, logout | **REFACTOR** | MVP: edit profile + my publications only | Extract profile core; drop cabinet noise |
| `ProfileMobileFlowPage.tsx` | Mobile edit flows | **REFACTOR** | Useful for mobile profile edit | Subset of flows |
| `auth.updateProfile` | name, email, phone, bio | **REUSE AS IS** | Private profile API | Procedure |
| `profile.uploadAvatar` | Avatar upload | **REFACTOR** | Logic good; swap storage backend | Procedure + storage abstraction |
| `profile.updatePublicIdentity` | username, firstName, lastName, bio | **REUSE AS IS** | Public identity | Procedure |
| `PersonalArticleManagement.tsx` | «Мои публикации» list | **REFACTOR** | Core for MVP item | Component + `profile.managedContent` |
| `AccountCabinetPanels.tsx` | Cabinet embedding | **REFACTOR** | Decompose; MVP needs articles panel only | Article list panel |
| `profileModel.ts` | UI helpers | **REUSE AS IS** | Small utility | File |
| Applications, settlements, reviews tabs | Extended profile | **DO NOT TRANSFER** | Out of MVP 1.0 | — |
| Business subscription flows | Cabinet | **DO NOT TRANSFER** | Out of MVP | — |
| `CabinetPage.tsx` full | Multi-domain cabinet | **DO NOT TRANSFER** | Replace with `/profile/publications` route | — |

---

## 6. Модуль 06 — EDITOR

### 6.1. Таблица компонентов

| Компонент | Текущее состояние | Решение | Причина | Что передать новому агенту |
|-----------|-------------------|---------|---------|----------------------------|
| `ArticleEditor.tsx` | Orchestrator: draft, submit, cover, categories | **REFACTOR** | High-value; decouple from monolith | **EDITOR CORE** — see §6.2 |
| `ArticleRichEditor.tsx` | TipTap editor | **REUSE AS IS** | Do not rewrite TipTap integration | **EDITOR CORE** |
| `ArticleContentRenderer.tsx` | Preview + public render | **REUSE AS IS** | Shared with ARTICLE | **EDITOR CORE** |
| `ArticleReaderPreviewBody.tsx` | Preview shell body | **REUSE AS IS** | Shared with MODERATION preview | **EDITOR CORE** |
| `shared/articleContent.ts` | contentJson v1/v2 schema | **REUSE AS IS** | Contract between editor/reader/DB | **EDITOR CORE** |
| `articleImageGeometry.ts` | Image layout in editor | **REUSE AS IS** | Non-trivial | **EDITOR CORE** |
| `ArticleBlocksEditor.tsx` | Legacy blocks editor | **DO NOT TRANSFER** | Superseded by TipTap v2 | — |
| `WriteArticlePage.tsx`, `ArticleEditorPage.tsx` | Route wrappers | **REBUILD** | Thin wrappers; trivial | Route pattern only |
| `journal.create`, `update`, upload* | Authoring API | **REFACTOR** | Keep contracts; split router | Procedures from `routers.ts` |
| `articleRevisions` model | Draft/pending/approved snapshots | **REUSE AS IS** | Moderation depends on this | Schema + `saveArticleRevision()` |
| Hardcoded `ARTICLE_CATEGORIES` | 14 categories in editor | **REBUILD** | Replace with DB `categories` + admin CRUD | Seed from current list |
| `requireJournalAuthoringAccess` | Resident author gate | **REFACTOR** | May simplify to `role=user + legal` for MVP | Server guard logic |

### 6.2. EDITOR CORE TRANSFER SET

**Переносить обязательно (не переписывать с нуля):**

| File | Why |
|------|-----|
| `client/src/components/article-editor/ArticleRichEditor.tsx` | TipTap config, extensions, toolbar |
| `client/src/components/article-editor/ArticleEditor.tsx` | Draft/submit workflow, cover upload UX |
| `shared/articleContent.ts` | Schema version 2 — migration cost too high |
| `client/src/components/article-editor/ArticleContentRenderer.tsx` | Render parity editor ↔ public |
| `client/src/components/article-editor/ArticleReaderPreviewBody.tsx` | Moderation preview reuse |
| `client/src/components/article-editor/articleImageGeometry.ts` | Image sizing logic |
| `server/db.ts` — `saveArticleRevision`, `requireArticleSubmissionReadiness` | Revision lifecycle |
| Tests: `articleDraftLifecycle.test.ts`, `articleEditorIterationOne.test.ts` | Behavioral spec |

### 6.3. EDITOR OPTIONAL / LEGACY FILES

| File | Action |
|------|--------|
| `ArticleBlocksEditor.tsx` | Skip |
| Legacy `body`-only articles without contentJson | Support read-only in renderer; new articles v2 only |
| Column fields on article (`isColumn`, `columnTitle`) | Phase 2+ journal; optional in editor MVP |
| `journal.setColumn` mutation | Defer unless editorial column in scope |

---

## 7. Модуль 07 — MODERATION

### 7.1. Таблица компонентов

| Компонент | Текущее состояние | Решение | Причина | Что передать новому агенту |
|-----------|-------------------|---------|---------|----------------------------|
| `AdminPage.tsx` (journal section) | Full journal moderation UI embedded | **REBUILD** | Target: standalone `moderation.my-poselok.ru` | Extract `JournalModerationApp` reference |
| `management.journal.*` tRPC | Approve/reject/list/preview — **used by UI** | **REFACTOR** | Rename namespace `moderation.articles.*`; keep logic | Procedures + `decideJournalModeration()` |
| `moderation.journal.*` tRPC | Duplicate API, **unused by UI** | **DO NOT TRANSFER** | Dead duplicate | — |
| `decideJournalModeration()` in db.ts | Transactional approve/reject | **REUSE AS IS** | Core business logic | Function + tests |
| `ModerationRevisionPreview` (in AdminPage) | Preview + approve/reject buttons | **REFACTOR** | Extract component | UI pattern + `ArticleReaderPreviewShell` |
| `moderation.queue` general | Settlements, services, support | **DO NOT TRANSFER** | Out of MVP moderation spec | — |
| `moderationWorkItems` table | SLA tracking | **REFACTOR** | Keep for articles; drop other targetTypes | Schema subset |
| Role gate moderator/admin | `users.role` | **REUSE AS IS** | Auth model | role enum |
| Deep link `/admin?management=journal&...` | Notification links | **REBUILD** | Target: `moderation.my-poselok.ru/pending/:revisionId` | URL scheme doc |

### 7.2. Целевая архитектура admin vs moderation (plan only)

```
packages/
  api/                    # shared tRPC backend
  shared/                 # types, articleContent
apps/
  web/                    # app.my-poselok.ru — public + profile + editor
  moderation/             # moderation.my-poselok.ru — Phase 6
  admin/                  # admin.my-poselok.ru — Phase 7
```

**Phase 6 (interim):** single repo, route prefix `/moderation/*`, env `VITE_APP_ROLE=moderation`.  
**Phase 6 (target):** separate Vite app, shared API, CORS + cookie domain `.my-poselok.ru`.

**Reference sections in AdminPage.tsx to study (not copy wholesale):**
- `JournalManagementPanel` (~L580+): tabs overview/all/pending/archived
- `ModerationRevisionPreview` (~L228): approve/reject UX
- `management.journal.list/preview/approve/reject` wiring

**Do NOT transfer:** `queue` view for non-article types, tariffs, geography, analytics from same file.

---

## 8. Модуль 08 — ADMIN

### 8.1. Таблица компонентов

| Компонент | Текущее состояние | Решение | Причина | Что передать новому агенту |
|-----------|-------------------|---------|---------|----------------------------|
| `AdminPage.tsx` (accounts, product) | Users, roles, feature flags | **REBUILD** | Target separate admin origin; file is 2400+ lines | Reference UX + API contracts |
| `administration.users` | User list + filters | **REFACTOR** | Core MVP admin | Procedure |
| `administration.updateUserRole` | user/moderator/admin | **REUSE AS IS** | MVP roles | Procedure |
| `administration.updateUserStatus` | block/delete | **REFACTOR** | MVP needs basic status | Procedure |
| `administration.features` | Feature toggles | **REFACTOR** | «Базовые настройки» | Simplify flag set to MVP |
| `management.journal.*` archive/visibility | Journal admin beyond moderation | **REFACTOR** | MVP «управление публикациями» | Subset of procedures |
| Categories admin CRUD | **Not implemented** | **REBUILD** | Required by target MVP spec | New `categories` module |
| `AdminTariffConstructor.tsx` | Tariffs | **DO NOT TRANSFER** | Out of MVP | — |
| `AdminGeographyPanel.tsx` | Geography | **DO NOT TRANSFER** | Out of MVP | — |
| `LegalDocumentsAdminPage.tsx` | Legal docs admin | **DO NOT TRANSFER** | Optional; legal consent can be Phase 1 simplification | — |
| `administration.siteMetrics` | Analytics dashboard | **DO NOT TRANSFER** | Out of MVP «базовые настройки» | — |
| `platformFeatureSettings` table | Feature storage | **REFACTOR** | Keep mechanism; trim flags | Schema |

---

## 9. DATABASE — стратегия нового MVP

### 9.1. CORE MVP TABLES

| Table | Module | Notes |
|-------|--------|-------|
| `users` | AUTH, PROFILE, AUTHOR | Core identity; trim unused business columns initially |
| `authChallenges` | AUTH | OTP registration + recovery |
| `authRateLimits` | AUTH | Rate limiting |
| `categories` | JOURNAL, ADMIN | **NEW** — see §10 |
| `articles` | JOURNAL, ARTICLE, EDITOR | Canonical published content |
| `articleRevisions` | EDITOR, MODERATION | Draft/pending workflow |
| `articleMedia` | EDITOR, ARTICLE | Inline image metadata |
| `contentViews` | JOURNAL, ARTICLE | Unique view counts (optional Phase 2) |

**Minimal `users` columns for MVP start:**
`id`, `email`, `passwordHash`, `passwordSessionVersion`, `emailVerifiedAt`, `role`, `accountStatus`, `name`, `firstName`, `lastName`, `username`, `avatarUrl`, `bio`, `createdAt`, `updatedAt`

**Defer to OPTIONAL:** `legalDocument*`, `authorFollows`, `articleLikes`, `articleComments`, `userFavorites`, `moderationWorkItems` (can add at Phase 5–6)

### 9.2. OPTIONAL / FUTURE

| Table | When |
|-------|------|
| `legalDocuments`, `legalDocumentVersions`, `legalDocumentAcceptances` | If legal consent gate required at launch |
| `moderationWorkItems` | Phase 6 — SLA dashboard |
| `userNotifications` | Phase 6 — moderator/author notifications |
| `authorFollows` | Post-MVP social |
| `articleLikes`, `articleComments`, `articleCommentLikes` | Post-MVP engagement |
| `userFavorites` | Post-MVP |
| `columnAppearances` | Editorial column optimization |
| `articleEngagementEvents` | Analytics |
| `articleServiceLinks` | Services integration |
| `platformFeatureSettings` | If runtime feature flags needed; else env-based for MVP |

### 9.3. DO NOT TRANSFER

| Table / domain | Reason |
|----------------|--------|
| `settlements`, `residentRequests`, `settlementMembers` | Settlements module |
| `services`, `serviceReviews`, `serviceCategories` | Services catalog |
| `supportTickets`, `supportChatMessages` | Support/chat |
| `businessAccountRequests`, tariff tables | Business/contour |
| `familyInvites`, geography statistics | Non-MVP |
| Chat tables | Communications |

### 9.4. Рекомендуемый порядок создания schema

| Step | Tables | Phase |
|------|--------|-------|
| 1 | `users` | Phase 1 AUTH |
| 2 | `authChallenges`, `authRateLimits` | Phase 1 |
| 3 | `categories` | Phase 2 JOURNAL (before articles if greenfield) |
| 4 | `articles` (minimal: no social columns required) | Phase 2–3 |
| 5 | `articleRevisions`, `articleMedia` | Phase 5 EDITOR |
| 6 | `contentViews` | Phase 3 ARTICLE (optional) |
| 7 | `moderationWorkItems`, `userNotifications` | Phase 6 |
| 8 | Admin extensions | Phase 7 |

**Migration strategy:** greenfield schema in new repo; **reference** `drizzle/schema.ts` + migrations `0060–0062` for auth; do **not** replay all 63 migrations.

---

## 10. JOURNAL CATEGORIES — стратегия

### 10.1. Решение: создать таблицу `categories`

| Aspect | Recommendation |
|--------|----------------|
| **REBUILD** category model | Да — текущий `articles.category` varchar + hardcoded list не масштабируется |
| **Avoid rework** | FK `articles.categoryId` + denormalized `categorySlug` for URLs |

### 10.2. Минимальные поля `categories`

| Field | Type | Purpose |
|-------|------|---------|
| `id` | int PK | FK target |
| `slug` | varchar(80) unique | URL-safe filter `/journal?category=:slug` |
| `title` | varchar(80) | Display name (current Russian labels) |
| `sortOrder` | int | Sidebar order |
| `isActive` | boolean | Admin hide without delete |
| `createdAt`, `updatedAt` | timestamp | Audit |

### 10.3. Связь article → category

```
categories (1) ──< articles (N)
articles.categoryId NOT NULL (after migration)
articles.categoryTitleSnapshot optional — preserve label if category renamed
```

**Migration from reference data:** seed 14 values from `ArticleEditor.tsx` `ARTICLE_CATEGORIES`.

### 10.4. Что перенести из reference

| Reference | Use |
|-----------|-----|
| `ARTICLE_CATEGORIES` array in `ArticleEditor.tsx` | Seed data |
| `defaultCategories` in `Home.tsx` | Default featured slugs |
| `management.journal.filterOptions` | Replace with `categories.list` admin API |

---

## 11. STORAGE — provider-agnostic стратегия

### 11.1. Текущее состояние (reference)

| Item | Detail |
|------|--------|
| **Provider** | Manus Forge presign → S3 PUT |
| **Upload API** | `storagePut(relKey, data, contentType)` → `{ key, url }` |
| **Public URL** | `/manus-storage/{key}` via `storageProxy` 307 redirect |
| **Validation** | Server rejects URLs not starting with `/manus-storage/` |

### 11.2. Storage key conventions (reference)

| Prefix | Content |
|--------|---------|
| `article-cover/user-{userId}/{timestamp}-{name}` | Article cover |
| `article-inline/article-{articleId}/user-{userId}/...` | Inline editor images |
| `profile-avatars/user-{userId}/{timestamp}-{name}` | Avatar |
| `legal-documents/...` | DO NOT TRANSFER for MVP |
| `resident-documents/...` | DO NOT TRANSFER |

Keys get random 8-char suffix via `appendHashSuffix()` in `storage.ts`.

### 11.3. Target abstraction (new project)

```typescript
// server/storage/types.ts — NEW PROJECT
interface StorageService {
  upload(params: {
    namespace: "article-cover" | "article-inline" | "profile-avatar";
    ownerId: number;
    fileName: string;
    mimeType: string;
    data: Buffer;
  }): Promise<{ storageKey: string; publicUrl: string }>;

  resolvePublicUrl(storageKey: string): string;
}

// publicUrl is opaque to frontend — e.g. "/api/media/{storageKey}" or CDN URL
```

**REFACTOR reference:** `server/storage.ts` → implement new adapter; keep key prefix conventions for migration of existing blobs.

### 11.4. Frontend rules (new agent)

| Rule | Detail |
|------|--------|
| Store `publicUrl` or `storageKey` in DB | Never store provider-specific S3 URLs in client state |
| No `manus-storage` string in client | Replace with `/api/media/*` proxy |
| Upload via tRPC mutation | Client sends base64/dataUrl; server calls StorageService |
| Renderer uses URL from API only | `ArticleContentRenderer` unchanged if URLs are absolute paths |

### 11.5. Решение по компонентам storage

| Component | Решение |
|-----------|---------|
| `storagePut` / `storageGet` | **REBUILD** as interface + adapter |
| `storageProxy.ts` `/manus-storage/*` | **REBUILD** as `/api/media/:key` |
| Forge env vars | **DO NOT TRANSFER** |
| Key prefix conventions | **REUSE AS IS** (logical structure) |
| `@aws-sdk/client-s3` in package.json | Optional — agent may use direct S3 adapter |

---

## 12. Shared infrastructure

| Компонент | Решение | Notes |
|-----------|---------|-------|
| `server/routers.ts` monolith | **REBUILD** | Split: `authRouter`, `journalRouter`, `moderationRouter`, `adminRouter` |
| `server/db.ts` monolith | **REBUILD** | Split repositories by domain |
| `App.tsx` all routes | **REFACTOR** | MVP route subset only |
| `SiteShell.tsx` | **REBUILD** | Slim shell: nav + auth trigger |
| tRPC + React Query | **REUSE AS IS** | Proven stack |
| Drizzle ORM | **REUSE AS IS** | Schema-first |
| `FeatureGate` pattern | **REFACTOR** | Optional for MVP; env flags sufficient initially |
| Vitest tests | **REFACTOR** | Port MVP-relevant tests per phase |
| `vite-plugin-manus-runtime` | **DO NOT TRANSFER** | |
| Wouter routing | **REUSE AS IS** | |
| shadcn/ui components | **REUSE AS IS** | `client/src/components/ui/*` |

---

## 13. REBUILD ORDER

### PHASE 0 — PROJECT FOUNDATION

**Цель:** новый репозиторий / app skeleton, provider-agnostic infra, без feature code.

| Study (reference) | Transfer | Do NOT transfer |
|-------------------|----------|-----------------|
| `package.json`, `vite.config.ts` (minus Manus plugin) | Stack versions, scripts | manus-runtime, debug-collector |
| `server/_core/index.ts` | Express + tRPC mount pattern | `/api/scheduled/*` Manus cron |
| `client/src/lib/trpc.ts`, `main.tsx` (cookie only) | tRPC client setup | manus-cookie Bearer |
| `drizzle.config.ts`, Drizzle setup | ORM tooling | Full schema |
| `docs/MVP_TECHNICAL_MAP.md`, this doc | Requirements | — |

**Deliverables:**
- Empty monorepo or single app with health check
- `StorageService` interface stub
- `EmailOtpSender` interface stub
- CI: `tsc`, `vitest`

**Done when:** `npm run dev` serves hello page; `npm test` passes; no Manus env vars required.

---

### PHASE 1 — AUTH

**Цель:** registration, login, email OTP, password recovery, logout.

| Study | Transfer | Do NOT transfer |
|-------|----------|-----------------|
| `authSecurity.ts`, `rusender.ts` | **REUSE** | oauth.ts, useAuth.ts |
| `AuthContext.tsx`, `AuthPage.tsx` | **REFACTOR** → unified auth | SiteShell auth duplicate |
| `server/db.ts` auth functions | **REFACTOR** → authRepository | — |
| `auth` router procedures | **REFACTOR** | legal.* (defer or simplify) |
| Migrations 0060–0062 pattern | **REUSE** schema shape | — |
| `authMvp.integration.test.ts` | Port tests | — |

**Done when:** E2E auth flow works; session cookie set; tests pass; no Manus OAuth.

---

### PHASE 2 — JOURNAL READ PATH

**Цель:** главная, лента, рубрики, карточки (read-only).

| Study | Transfer | Do NOT transfer |
|-------|----------|-----------------|
| `Home.tsx`, `ArticleCard`, `ContentMetrics` | **REFACTOR** | Likes/favorites on cards |
| `journal.list`, `listNew` | **REUSE** logic | listFollowed, listFavorites |
| `categories` table design (§10) | **REBUILD** | varchar category column |
| `SectionFrame`, `SiteShell` nav | **REFACTOR** | Settlement section |
| Seed categories from `ARTICLE_CATEGORIES` | Data migration | — |

**Done when:** `/` shows paginated feed; category filter works; cards link to `/journal/:id`.

---

### PHASE 3 — ARTICLE + AUTHOR

**Цель:** просмотр статьи, автор, переход в колонку автора.

| Study | Transfer | Do NOT transfer |
|-------|----------|-----------------|
| `ArticlePage.tsx` | **REFACTOR** (read-only) | Comments, likes, share |
| `ArticleContentRenderer`, `articleContent.ts` | **REUSE** | — |
| `journal.detail`, `visitorKey.ts` | **REUSE** | — |
| `AuthorPage.tsx` | **REFACTOR** | Services, follow |
| `journal.author` | **REUSE** | — |
| `ColumnCarousel` | **REFACTOR** (if editorial column in scope) | — |

**Done when:** `/journal/:id` renders cover + content + author link; `/authors/:id` lists articles.

---

### PHASE 4 — PROFILE

**Цель:** просмотр и редактирование профиля, avatar, username, мои публикации.

| Study | Transfer | Do NOT transfer |
|-------|----------|-----------------|
| `ProfilePage.tsx` | **REBUILD** slim version | Applications, cabinet |
| `PublicProfileEditor.tsx` | **REFACTOR** | — |
| `auth.updateProfile`, `profile.updatePublicIdentity`, `uploadAvatar` | **REFACTOR** + StorageService | — |
| `PersonalArticleManagement.tsx` | **REFACTOR** | Full cabinet |
| `profile.managedContent` | **REUSE** | — |

**Done when:** `/profile` edits fields; avatar upload via new storage; list of own articles with edit links.

---

### PHASE 5 — EDITOR

**Цель:** create/edit, images, cover, drafts, preview, submit to moderation.

| Study | Transfer | Do NOT transfer |
|-------|----------|-----------------|
| **EDITOR CORE TRANSFER SET** (§6.2) | **REFACTOR** | ArticleBlocksEditor |
| `journal.create/update/upload*` | **REFACTOR** | — |
| `articleRevisions` schema | **REUSE** | — |
| `articleDraftLifecycle.test.ts` | Port tests | — |
| StorageService implementation | **REBUILD** | Forge |

**Done when:** `/write` creates draft; autosave; preview; submit → `pending` revision; images upload.

---

### PHASE 6 — MODERATION

**Цель:** moderator app at target origin (or interim `/moderation` app).

| Study | Transfer | Do NOT transfer |
|-------|----------|-----------------|
| AdminPage journal panel | **REBUILD** as standalone app | Rest of AdminPage |
| `management.journal.*` | **REFACTOR** → `moderation.articles.*` | moderation.journal duplicate |
| `decideJournalModeration()` | **REUSE** | — |
| `ArticleReaderPreviewShell/Body` | **REUSE** | — |
| `journalModerationCore.test.ts` | Port tests | General moderation queue |

**Architecture checkpoint:** separate Vite app `apps/moderation`, shared `packages/api`.

**Done when:** moderator login; pending list; preview; approve publishes to feed; reject notifies author.

---

### PHASE 7 — ADMIN

**Цель:** admin origin — users, roles, publications, categories, basic settings.

| Study | Transfer | Do NOT transfer |
|-------|----------|-----------------|
| AdminPage accounts/product views | **REBUILD** | Tariffs, geography, analytics |
| `administration.users`, `updateUserRole` | **REFACTOR** | — |
| Categories CRUD | **REBUILD** (§10) | filterOptions hack |
| `management.journal` archive/visibility | **REFACTOR** subset | — |
| `platformFeatureSettings` | **REFACTOR** or env-based | Full flag tree |

**Architecture checkpoint:** separate Vite app `apps/admin`.

**Done when:** admin can manage users/roles, categories, toggle basic settings, hide/archive publications.

---

## 14. Risk register (new agent)

| Risk | Mitigation |
|------|------------|
| Copying whole `AdminPage.tsx` / `SiteShell.tsx` | Explicit **REBUILD** — extract only referenced panels |
| Forge URL baked in DB | Migration script: rewrite `/manus-storage/` → new media URLs |
| Duplicate auth UI | Phase 1 delivers single `AuthFlow` before journal work |
| Category rework later | Phase 2 creates `categories` table before articles scale |
| Moderation/admin subdomain scope creep | Phase 6–7 apps are thin; API shared |
| Legal consent complexity | Defer `legal.*` or hardcode single ToS checkbox for MVP |

---

## 15. Quick reference — decision summary by module

| Module | Primary strategy | Highest-value reference files |
|--------|------------------|------------------------------|
| AUTH | REFACTOR + reuse security layer | `authSecurity.ts`, `AuthContext.tsx`, `AuthPage.tsx` |
| JOURNAL | REFACTOR + categories REBUILD | `Home.tsx`, `journal.list` |
| ARTICLE | REFACTOR (strip social) | `ArticleContentRenderer.tsx`, `ArticlePage.tsx` |
| AUTHOR | REFACTOR | `AuthorPage.tsx`, `journal.author` |
| PROFILE | REBUILD slim + reuse API | `PublicProfileEditor.tsx`, profile router |
| EDITOR | REFACTOR (preserve TipTap) | **EDITOR CORE TRANSFER SET** |
| MODERATION | REBUILD UI + reuse decide logic | `decideJournalModeration`, AdminPage journal panel |
| ADMIN | REBUILD UI + reuse administration API | `administration.*`, categories CRUD new |

---

## 16. Document map for new agent

| Read first | Purpose |
|------------|---------|
| **This document** | Rebuild strategy and decisions |
| [MVP_TECHNICAL_MAP.md](./MVP_TECHNICAL_MAP.md) | Where everything lives in reference repo |
| [docs/project/AUTH.md](./project/AUTH.md) | Auth deep dive |
| [docs/project/INTEGRATIONS.md](./project/INTEGRATIONS.md) | External services |
| [docs/project/DATABASE.md](./project/DATABASE.md) | Full schema reference (filter via §9 here) |
| Tests listed in MVP_TECHNICAL_MAP §14.3 | Behavioral contracts |

---

*Документ подготовлен как инструкция для пересборки. Не изменяет прикладной код reference-репозитория.*
