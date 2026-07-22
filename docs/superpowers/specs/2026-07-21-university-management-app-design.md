# UniFlow — University Management Application Design

Date: 2026-07-21  
Status: Approved design, awaiting written-spec review  
Implementation target: HTML, CSS, vanilla JavaScript, Bootstrap 5

## 1. Purpose

UniFlow is a jury-ready university management application for an end-of-study project. It demonstrates academic administration, role-based workflows, bilingual interface design, business-rule enforcement, reporting, and a persistence architecture that can move from browser storage to Firebase without rewriting the user interface.

The first version is a frontend-only demonstration. It stores data in LocalStorage and is not presented as production security or a real multi-user system.

## 2. Confirmed scope

- University rather than school or lycée model.
- French and Arabic interface with complete LTR/RTL switching.
- Administrator, teacher, and student roles.
- Moroccan grading model: marks out of 20, weighted averages, validation from 10/20, and mentions.
- Academic structure: academic years, programs, levels, semesters, modules, subjects, groups, and enrollments.
- Bootstrap 5 UI with vanilla JavaScript ES modules.
- LocalStorage for the first version through a replaceable persistence adapter.
- Realistic seeded data and three demonstration accounts.
- Responsive layouts for desktop, tablet, and mobile.

## 3. Out of scope for the first version

- Real authentication, password security, and server-side authorization.
- Live multi-user synchronization.
- Real email or SMS delivery.
- Tuition, billing, payroll, library, dormitory, and human-resources modules.
- Production deployment or Firebase integration.

These boundaries keep the implementation coherent and defensible while leaving clear extension points.

## 4. Product and visual direction

### Visual thesis

A credible institutional workspace using university blue, warm gold, calm light surfaces, disciplined typography, and dense but readable operational information.

### Content plan

1. Login and role selection establish the demonstration context.
2. Role-specific dashboards surface current academic status and next actions.
3. Management workspaces provide search, filters, tables, details, and focused forms.
4. Reports and printable academic records turn stored data into jury-visible outcomes.

### Interaction thesis

- A restrained page entrance reveals navigation and working content in sequence.
- Route transitions preserve the application shell while replacing the workspace smoothly.
- Toasts, inline validation, button states, and modal transitions make every operation visibly responsive.

### Interface system

- Bootstrap 5 provides layout primitives, forms, tables, modals, dropdowns, alerts, and responsive behavior.
- Bootstrap Icons provides consistent interface icons.
- Chart.js renders academic statistics.
- The primary palette is institutional navy and blue with a single gold action/highlight accent.
- Routine content uses plain sections, tables, and dividers instead of a dashboard mosaic of decorative cards.
- The desktop shell uses a left sidebar in French and a mirrored right sidebar in Arabic.
- Mobile navigation uses an off-canvas Bootstrap panel.
- Tables become horizontally scrollable or switch to essential-column views on narrow screens.
- The language switch updates text, `lang`, `dir`, alignment, navigation order, and directional icons immediately.

## 5. Application architecture

The application is a modular single-page application with hash-based routes such as `#/dashboard`, `#/students`, and `#/grades`.

The dependency flow is:

`Router → View → Controller → Domain Service → Repository → Storage Adapter`

### 5.1 Layers

- **Application shell:** sidebar, top bar, breadcrumbs, language switcher, and routed workspace.
- **Router:** route recognition, role guards, active navigation state, and not-found handling.
- **Views:** HTML generation and DOM-level interaction only.
- **Controllers:** translate user actions into service calls and view updates.
- **Domain services:** authorization, validation, calculations, conflict detection, and cross-entity operations.
- **Repositories:** collection-specific CRUD and query interfaces.
- **Storage adapters:** persistence implementation hidden behind a stable asynchronous interface.
- **Session store:** active user, role, language, theme, and transient UI state.
- **Event bus:** small application-level events such as `student:created`, `grade:updated`, and `language:changed`.

### 5.2 Replaceable persistence

Views, controllers, and services do not access `localStorage` directly. They depend on repositories, and repositories depend on a storage adapter.

The adapter contract is asynchronous even when LocalStorage is synchronous:

- `initialize()`
- `getCollection(name)`
- `getById(collection, id)`
- `create(collection, record)`
- `update(collection, id, changes)`
- `remove(collection, id)`
- `replaceDatabase(snapshot)`
- `exportDatabase()`
- `clear()`

This contract allows a future Firebase adapter to use the same repositories. Firebase-specific real-time subscriptions and server security rules would be a second design phase rather than hidden inside the LocalStorage version.

### 5.3 Local database lifecycle

- A namespaced key stores a versioned database snapshot.
- First launch creates realistic seed data.
- Schema version and migration functions protect future data-shape changes.
- Reset restores the original demonstration snapshot after explicit confirmation.
- JSON export and validated JSON import support backup and jury preparation.
- Every mutation updates timestamps and creates an activity-log entry.

## 6. Domain model

All entities have a UUID, creation timestamp, update timestamp, and active/archive status where appropriate.

### Identity and access

- `users`: display name, email, demo password, role, linked profile ID, locale, avatar.
- `roles`: administrator, teacher, student.
- `activityLogs`: actor, action, entity type, entity ID, summary, timestamp.

### People

- `students`: registration number, names in French and Arabic, contact data, birth date, program, level, group, enrollment status.
- `teachers`: employee number, names in French and Arabic, contact data, speciality, rank, status.

### Academic structure

- `academicYears`: label, start/end dates, current flag.
- `programs`: bilingual name, code, department, degree type, duration.
- `levels`: label and order within a program.
- `semesters`: code, level, academic year, start/end dates.
- `modules`: bilingual name, code, semester, coefficient, credits.
- `subjects`: bilingual name, code, module, coefficient, hours.
- `groups`: code, program, level, capacity.
- `rooms`: code, building, capacity, type.

### Academic operations

- `enrollments`: student, academic year, program, level, group, status.
- `teachingAssignments`: teacher, subject, semester, groups.
- `assessments`: subject, title, type, date, weight, maximum mark.
- `grades`: assessment, student, mark out of 20, absence flag, comment, author.
- `scheduleEntries`: subject, group, teacher, room, weekday, start/end time.

Relationships are stored with IDs. Repository helpers resolve related records for display and reporting.

## 7. Business rules

### Grades

- A normal mark must be between 0 and 20.
- An absence can be recorded separately from a numeric mark. An unexcused absence contributes `0/20`; an excused absence remains ungraded and prevents publication until resolved.
- Assessment weights within a subject may be partial while drafting but must total 100% before results can be published.
- Subject averages use assessment weights.
- Module averages use subject coefficients.
- Semester and overall averages use module coefficients.
- A subject, module, or semester is validated from 10/20.
- Mentions use fixed demonstration ranges: Très bien from 16, Bien from 14, Assez bien from 12, Passable from 10, and Ajourné below 10.
- Only an administrator or the assigned teacher may create or update a grade.
- Students may only read their own results.

### Scheduling

- A teacher cannot teach two sessions at overlapping times.
- A group cannot attend two sessions at overlapping times.
- A room cannot host two sessions at overlapping times.
- Room capacity must not be lower than group size.
- The selected teacher must be assigned to the subject.

### Data integrity

- Student registration numbers, teacher employee numbers, user emails, and academic codes are unique in their relevant scopes.
- Referenced records cannot be deleted silently.
- Records with academic history are archived instead of destroyed.
- Destructive operations require explicit confirmation.

### Authorization

Authorization is checked in route guards and domain services. Hidden controls are only a user-interface convenience and are not the authorization mechanism.

Because LocalStorage is editable by the browser user, these checks demonstrate application architecture but do not provide production security.

## 8. Functional areas by role

### 8.1 Administrator

- Dashboard: active students, teachers, success rate, program distribution, recent activity, and schedule warnings.
- Students: searchable/filterable list, details, create/edit/archive, enrollment history, and results.
- Teachers: searchable/filterable list, details, create/edit/archive, assignments, and schedule.
- Academic catalog: programs, levels, semesters, modules, subjects, groups, rooms, and academic years.
- Enrollments and teaching assignments.
- Schedule editor with conflict feedback.
- Grade overview and controlled correction.
- User-account management.
- Announcements.
- Reports with filters, Chart.js visualizations, CSV export, and print views.
- Settings, database backup/import, and demonstration reset.

### 8.2 Teacher

- Dashboard: today’s courses, assigned groups, and pending grading.
- Assigned subjects, groups, and schedule.
- Assessment creation and grade entry in a spreadsheet-like table.
- Automatic subject and group statistics.
- Student performance views limited to assigned groups.
- Announcements limited to assigned audiences.

### 8.3 Student

- Dashboard: overall average, validated modules, and next class.
- Personal profile and current enrollment.
- Personal weekly schedule.
- Detailed marks, weights, subject/module averages, validation status, and mentions.
- Printable transcript.
- Attendance history.
- Announcements.

## 9. Routes

Shared routes:

- `#/login`
- `#/dashboard`
- `#/profile`
- `#/not-found`

Administrator routes:

- `#/students`, `#/students/:id`
- `#/teachers`, `#/teachers/:id`
- `#/programs`, `#/academic-structure`
- `#/enrollments`, `#/assignments`
- `#/schedule`
- `#/grades`
- `#/reports`
- `#/users`
- `#/settings`

Teacher routes:

- `#/my-courses`
- `#/my-groups`
- `#/gradebook/:subjectId`
- `#/my-schedule`

Student routes:

- `#/my-program`
- `#/my-grades`
- `#/my-transcript`
- `#/my-schedule`

Route metadata defines allowed roles, navigation label keys, titles, and breadcrumb behavior.

## 10. Core workflows

### Administrator adds and enrolls a student

1. Open the student workspace and choose Add student.
2. Validate identity, contact information, and unique registration number.
3. Create the student and linked demo user.
4. Choose academic year, program, level, and group.
5. Create the enrollment and log the activity.
6. Show a success toast and open the new student detail view.

### Teacher records grades

1. Open an assigned subject and assessment.
2. Display only enrolled students in assigned groups.
3. Enter marks or absence states with inline validation.
4. Save changes through the grade service.
5. Recalculate aggregates and surface affected averages.
6. Recalculate aggregates and surface affected averages.

### Student reviews a transcript

1. Open the transcript route guarded by the student role.
2. Load enrollment, modules, subjects, assessments, and grades through repositories.
3. Calculate and display weighted results, validation states, and mention.
4. Switch French/Arabic without losing the active route.
5. Print a dedicated transcript layout.

## 11. Validation and error handling

- Required fields, formats, numeric ranges, and uniqueness constraints are validated before mutation.
- Field errors appear next to the relevant controls.
- Domain conflicts use a clear Bootstrap alert with actionable details.
- Success and failure feedback use accessible toast messages.
- Destructive actions use a confirmation modal naming the affected record.
- Empty states explain why no records exist and provide an allowed next action.
- Route failures render a recoverable error state rather than a blank workspace.
- A centralized error handler maps storage, validation, authorization, and unknown errors to localized messages.
- Storage quota or availability failures preserve the current form state where possible and recommend JSON export/reset actions.
- Import validates schema version and collection shapes before replacing current data.

## 12. Accessibility and localization

- Semantic landmarks, headings, labels, table headers, and buttons.
- Keyboard-operable navigation, menus, dialogs, and forms.
- Visible focus states and sufficient color contrast.
- Text alternatives for meaningful icons.
- `aria-live` feedback for validation summaries and transient status messages.
- French is the initial locale; Arabic can be selected at login or from the shell.
- Translation keys contain all interface text, validation messages, dates, statuses, and chart labels.
- Names and academic labels support bilingual values with a defined fallback.
- Dates and numbers use locale-aware formatting while grades retain the `/20` convention.

## 13. Demonstration data and accounts

The seed dataset includes multiple programs, levels, semesters, modules, subjects, groups, rooms, teachers, students, schedules, assessments, and grades. It deliberately includes enough variation to produce meaningful filters and charts without making the interface noisy.

Three visible demo accounts provide one-click login:

- Administrator account with complete access.
- Teacher account with assigned subjects and groups.
- Student account with a populated schedule, grades, and transcript.

Credentials are displayed on the login screen because this is a local demonstration, not secure authentication.

## 14. Verification strategy

### Automated checks

- Repository CRUD, filtering, immutability expectations, import/export, and reset.
- Grade weighting, averages, validation thresholds, and mentions.
- Schedule overlap and room-capacity rules.
- Role permissions and ownership constraints.
- Translation fallback and direction changes.
- Seed data integrity and referential consistency.

The domain and repository modules remain independent from the DOM so they can be tested with Node’s built-in test runner without introducing an application framework.

### Browser verification

- Login and logout for all three accounts.
- Role-specific route access and navigation visibility.
- Administrator CRUD and academic assignment workflows.
- Teacher grade workflows.
- Student schedule, results, and transcript workflows.
- Data survival across reloads.
- JSON backup, import, and demonstration reset.
- CSV export and print layouts.
- French and Arabic interface behavior, including RTL.
- Desktop, tablet, and mobile breakpoints.
- Empty, invalid, conflict, and storage-failure states.

## 15. Completion criteria

The first version is complete when:

- Every listed route renders meaningful seeded data or a functional management workflow.
- Core create, update, archive, search, filter, and reporting interactions work where authorized.
- All three roles have clearly different, coherent experiences.
- Grade calculations and schedule conflicts are consistent and tested.
- LocalStorage is accessed only through the adapter layer.
- Refreshing the page preserves data and the valid user session.
- Reset restores a predictable jury demonstration state.
- French and Arabic work across all primary routes with correct LTR/RTL behavior.
- The interface is usable on common desktop and mobile widths.
- No console errors occur during the prepared demonstration scenario.

## 16. Future Firebase transition

A later phase can implement a Firebase adapter and real authentication while retaining repository and service interfaces. That phase must also introduce server-enforced security rules, user provisioning, async loading states, concurrency behavior, migration from LocalStorage data, and decisions about real-time subscriptions. Those concerns are intentionally not simulated in the first version.
