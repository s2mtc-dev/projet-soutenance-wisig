# UniFlow University Management App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Subagents are intentionally disabled by user instruction for this execution.

**Goal:** Build a complete frontend-only university management SPA with administrator, teacher, and student workflows, bilingual French/Arabic UI, Moroccan grading rules, and LocalStorage persistence behind an adapter.

**Architecture:** A vanilla JavaScript ES module SPA uses hash routing, role-guarded views, domain services, repositories, and an asynchronous storage adapter. DOM code depends on services and repositories, never directly on LocalStorage, so a future Firebase adapter can preserve the same service contracts.

**Tech Stack:** HTML, CSS, Bootstrap 5 from CDN, Bootstrap Icons from CDN, Chart.js from CDN, vanilla JavaScript ES modules, Node built-in test runner.

## Global Constraints

- Use Bootstrap 5 UI with vanilla JavaScript ES modules.
- Use LocalStorage only through the storage adapter.
- Support French and Arabic with full `lang`, `dir`, navigation, labels, dates, numbers, and RTL layout switching.
- Implement administrator, teacher, and student roles.
- Use Moroccan grades out of 20 with weighted averages, pass from 10/20, and mentions: `Très bien`, `Bien`, `Assez bien`, `Passable`, `Ajourné`.
- Seed realistic university data and visible demo accounts.
- Do not create git commits.
- Do not create subagents.
- Do not create a branch or worktree.

---

## File Structure

- `package.json`: npm scripts for tests and static server.
- `.gitignore`: ignore runtime/dependency/generated helper files.
- `index.html`: Bootstrap shell mount point and CDN dependencies.
- `assets/css/app.css`: institutional blue/gold visual system, responsive shell, RTL, print transcript styles.
- `src/data/seed.js`: deterministic seeded database and schema constants.
- `src/core/storage.js`: async storage adapter contract and LocalStorage implementation.
- `src/core/repository.js`: collection CRUD and query repository.
- `src/core/services.js`: authorization, grade calculations, schedule conflict checks, academic reporting, CSV/export helpers, mutation workflows.
- `src/core/i18n.js`: French and Arabic dictionaries, translation lookup, locale formatting, direction helpers.
- `src/app.js`: app bootstrap, session handling, hash router, Bootstrap view rendering, event handlers.
- `tests/domain.test.js`: Node tests for storage, repositories, services, i18n, and seed integrity.

## Task 1: Project Harness And Failing Domain Tests

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `tests/domain.test.js`

**Interfaces:**
- Produces tests that import `createSeedDatabase`, `MemoryStorageAdapter`, `Repository`, `GradeService`, `ScheduleService`, `AuthService`, and i18n helpers.

- [ ] **Step 1: Write failing tests**

Create tests covering seed integrity, async repository CRUD, grade mention and weighted average behavior, excused absence blocking publication, schedule overlap detection, role permission checks, and Arabic direction.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test`
Expected: FAIL because imported modules do not exist yet.

## Task 2: Data, Storage, Repository, Services, I18n

**Files:**
- Create: `src/data/seed.js`
- Create: `src/core/storage.js`
- Create: `src/core/repository.js`
- Create: `src/core/services.js`
- Create: `src/core/i18n.js`

**Interfaces:**
- `createSeedDatabase(): object`
- `MemoryStorageAdapter(initialDatabase?: object): adapter`
- `LocalStorageAdapter({ key, seedFactory }): adapter`
- `Repository(adapter, collectionName)`
- `GradeService(repositories)`
- `ScheduleService(repositories)`
- `AuthService(repositories)`
- `t(locale, key, params?): string`
- `getDirection(locale): "ltr" | "rtl"`

- [ ] **Step 1: Implement minimal modules**

Implement the contracts needed by the failing tests.

- [ ] **Step 2: Run tests**

Run: `npm test`
Expected: PASS.

## Task 3: HTML, CSS, App Shell, Routing, Auth

**Files:**
- Create: `index.html`
- Create: `assets/css/app.css`
- Create: `src/app.js`

**Interfaces:**
- `startApp({ root, storageKey? }): Promise<void>`
- Hash routes: `#/login`, `#/dashboard`, `#/profile`, role routes, and `#/not-found`.

- [ ] **Step 1: Add app tests for route metadata**

Extend `tests/domain.test.js` with role route checks that can run in Node.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test`
Expected: FAIL because route metadata is not exported yet.

- [ ] **Step 3: Implement shell and route metadata**

Build the Bootstrap shell, login page, role guards, language switch, sidebar/offcanvas navigation, and toast region.

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: PASS.

## Task 4: Role Workspaces And Management Flows

**Files:**
- Modify: `src/app.js`
- Modify: `src/core/services.js`
- Modify: `src/core/i18n.js`

**Interfaces:**
- Administrator views manage students, teachers, academic structure, enrollments, assignments, schedule, grades, reports, users, settings.
- Teacher views manage courses, groups, gradebook, and schedule.
- Student views show program, grades, transcript, and schedule.

- [ ] **Step 1: Add failing workflow service tests**

Add tests for creating a student with a linked user, saving a grade, export/import validation, and reset behavior.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test`
Expected: FAIL on missing workflow methods.

- [ ] **Step 3: Implement workflows and views**

Add real table/list/form workflows, inline validation, modals, CSV export, JSON export/import, reset, print transcript, and Chart.js reporting hooks.

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: PASS.

## Task 5: Browser Verification And Handoff

**Files:**
- Modify only if verification exposes defects.

- [ ] **Step 1: Run automated checks**

Run: `npm test`
Expected: all tests pass with no warnings.

- [ ] **Step 2: Start the local static server**

Run: `npm run start -- --listen 4173`
Expected: server serves `index.html`.

- [ ] **Step 3: Verify in browser**

Check login as admin, teacher, and student; French/Arabic switching; LocalStorage persistence after reload; admin create student; teacher grade entry; student transcript; reset/export/settings; responsive layout at desktop and mobile widths.

- [ ] **Step 4: Fix any defects with test-first changes**

For each defect, add or adjust the relevant failing test first, verify it fails, implement the fix, and re-run tests.

- [ ] **Step 5: Final handoff**

Report files changed, verification commands, local URL, demo accounts, and any known limitations.

## Self-Review

- Spec coverage: covered roles, routes, LocalStorage abstraction, bilingual RTL, grading rules, schedule conflicts, seeded data, reports, backup/import/reset, and browser verification.
- Placeholder scan: no `TBD`, `TODO`, or implementation-later language remains.
- Type consistency: route, adapter, repository, service, and i18n interfaces use the same names throughout the plan.
