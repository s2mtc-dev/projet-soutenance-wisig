import { createSeedDatabase } from './data/seed.js';
import { formatDate, formatNumber, getDirection, t } from './core/i18n.js';
import { LocalStorageAdapter } from './core/storage.js';
import { AcademicService, AuthService, GradeService, ScheduleService, createRepositories, normalizePath } from './core/services.js';

export const ROUTES = [
  { path: '#/login', labelKey: 'auth.signin', roles: ['guest'] },
  { path: '#/dashboard', labelKey: 'nav.dashboard', roles: ['admin', 'teacher', 'student'] },
  { path: '#/profile', labelKey: 'nav.profile', roles: ['admin', 'teacher', 'student'] },
  { path: '#/students', labelKey: 'nav.students', roles: ['admin'] },
  { path: '#/teachers', labelKey: 'nav.teachers', roles: ['admin'] },
  { path: '#/programs', labelKey: 'nav.academic', roles: ['admin'] },
  { path: '#/academic-structure', labelKey: 'nav.academic', roles: ['admin'] },
  { path: '#/enrollments', labelKey: 'nav.enrollments', roles: ['admin'] },
  { path: '#/assignments', labelKey: 'nav.assignments', roles: ['admin'] },
  { path: '#/schedule', labelKey: 'nav.schedule', roles: ['admin'] },
  { path: '#/grades', labelKey: 'nav.grades', roles: ['admin'] },
  { path: '#/reports', labelKey: 'nav.reports', roles: ['admin'] },
  { path: '#/users', labelKey: 'nav.users', roles: ['admin'] },
  { path: '#/settings', labelKey: 'nav.settings', roles: ['admin'] },
  { path: '#/my-courses', labelKey: 'nav.myCourses', roles: ['teacher'] },
  { path: '#/my-groups', labelKey: 'nav.groups', roles: ['teacher'] },
  { path: '#/gradebook', labelKey: 'nav.gradebook', roles: ['teacher'] },
  { path: '#/my-schedule', labelKey: 'nav.mySchedule', roles: ['teacher', 'student'] },
  { path: '#/my-program', labelKey: 'nav.myProgram', roles: ['student'] },
  { path: '#/my-grades', labelKey: 'nav.myGrades', roles: ['student'] },
  { path: '#/my-transcript', labelKey: 'nav.myTranscript', roles: ['student'] },
  { path: '#/not-found', labelKey: 'notFound.title', roles: ['admin', 'teacher', 'student'] }
];

const SESSION_KEY = 'uniflow.session';
const DEFAULT_ROUTE = '#/dashboard';
const PUBLIC_ROUTES = ['#/login'];
const weekdayKeys = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const weekdayKeysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

let appState = null;
let activeChart = null;

export function resolveRoute(path = DEFAULT_ROUTE) {
  const normalized = normalizePath(path);
  return ROUTES.find((route) => route.path === normalized) ?? ROUTES.find((route) => route.path === '#/not-found');
}

export function getAvailableRoutes(user) {
  if (!user) {
    return ROUTES.filter((route) => route.roles.includes('guest'));
  }
  return ROUTES.filter((route) => route.roles.includes(user.role) && route.path !== '#/not-found');
}

function byId(collection, id) {
  return collection.find((item) => item.id === id) ?? null;
}

function localName(record, locale, prefix = 'name') {
  if (!record) return '';
  return locale === 'ar' ? record[`${prefix}Ar`] || record[`${prefix}Fr`] || record.label || record.code : record[`${prefix}Fr`] || record[`${prefix}Ar`] || record.label || record.code;
}

function personName(person, locale) {
  if (!person) return '';
  return locale === 'ar'
    ? `${person.firstNameAr || person.firstNameFr} ${person.lastNameAr || person.lastNameFr}`
    : `${person.firstNameFr || person.firstNameAr} ${person.lastNameFr || person.lastNameAr}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function optionTags(items, selectedId, locale, namePrefix = 'name') {
  return items
    .map((item) => `<option value="${item.id}" ${item.id === selectedId ? 'selected' : ''}>${escapeHtml(localName(item, locale, namePrefix))}</option>`)
    .join('');
}

function routeIcon(path) {
  const icons = {
    '#/dashboard': 'speedometer2',
    '#/profile': 'person-circle',
    '#/students': 'mortarboard',
    '#/teachers': 'person-workspace',
    '#/programs': 'diagram-3',
    '#/academic-structure': 'building',
    '#/enrollments': 'clipboard-check',
    '#/assignments': 'person-lines-fill',
    '#/schedule': 'calendar-week',
    '#/grades': 'journal-check',
    '#/reports': 'bar-chart',
    '#/users': 'people',
    '#/settings': 'gear',
    '#/my-courses': 'book',
    '#/my-groups': 'people',
    '#/gradebook': 'table',
    '#/my-schedule': 'calendar3',
    '#/my-program': 'diagram-2',
    '#/my-grades': 'patch-check',
    '#/my-transcript': 'printer'
  };
  return icons[path] ?? 'circle';
}

function shellNav(user, locale) {
  return getAvailableRoutes(user)
    .filter((route) => route.path !== '#/login')
    .map((route) => {
      const active = resolveRoute(location.hash || DEFAULT_ROUTE).path === route.path ? 'active' : '';
      return `
        <a class="nav-link ${active}" href="${route.path}">
          <i class="bi bi-${routeIcon(route.path)}" aria-hidden="true"></i>
          <span>${t(locale, route.labelKey)}</span>
        </a>`;
    })
    .join('');
}

function metric(label, value, hint, icon) {
  return `
    <div class="metric">
      <div class="metric-icon"><i class="bi bi-${icon}" aria-hidden="true"></i></div>
      <div>
        <div class="metric-value">${value}</div>
        <div class="metric-label">${label}</div>
        <div class="metric-hint">${hint}</div>
      </div>
    </div>`;
}

function section(title, body, actions = '', className = '') {
  return `
    <section class="workspace-section ${className}">
      <div class="section-head">
        <h2>${title}</h2>
        <div class="section-actions">${actions}</div>
      </div>
      ${body}
    </section>`;
}

function formField(label, control, className = '') {
  return `<label class="form-field ${className}"><span>${label}</span>${control}</label>`;
}

function renderFormModal({ id, title, formId, fields, submitLabel, submitIcon = 'save', result = '' }) {
  return `
    <div class="modal fade form-modal" id="${id}" tabindex="-1" aria-labelledby="${id}Title">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <p class="modal-eyebrow">${appState.locale === 'ar' ? 'نموذج' : 'Formulaire'}</p>
              <h2 class="modal-title" id="${id}Title">${title}</h2>
            </div>
            <button type="button" class="btn-close" data-action="close-modal" data-target="${id}" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="${formId}" class="form-modal-grid">
              ${fields}
            </form>
            ${result}
          </div>
          <div class="modal-footer form-modal-footer">
            <button class="btn btn-primary w-100" type="submit" form="${formId}"><i class="bi bi-${submitIcon}"></i>${submitLabel}</button>
          </div>
        </div>
      </div>
    </div>`;
}

function emptyState(text) {
  return `<div class="empty-state"><i class="bi bi-inbox"></i><span>${text}</span></div>`;
}

function badge(text, tone = 'primary') {
  return `<span class="badge rounded-pill text-bg-${tone}">${text}</span>`;
}

function download(filename, content, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function loadData() {
  const repositories = appState.repositories;
  const entries = await Promise.all(
    Object.entries(repositories).map(async ([name, repo]) => [name, await repo.list({ includeArchived: true })])
  );
  return Object.fromEntries(entries);
}

async function findCurrentProfile(data) {
  const user = appState.user;
  if (!user) return null;
  if (user.role === 'student') return byId(data.students, user.linkedProfileId);
  if (user.role === 'teacher') return byId(data.teachers, user.linkedProfileId);
  return user;
}

function renderLogin(locale) {
  const accounts = [
    ['admin@uniflow.local', 'Administrateur', 'admin'],
    ['teacher@uniflow.local', 'Enseignant', 'teacher'],
    ['student@uniflow.local', 'Étudiant', 'student']
  ];
  return `
    <main class="login-screen">
      <section class="login-panel">
        <div class="login-form-card">
          <h2>${t(locale, 'auth.signin')}</h2>
          <p>${locale === 'ar' ? 'اختر حسابا تجريبيا أو استعمل بيانات الدخول.' : 'Choisissez un compte de démonstration ou utilisez les identifiants.'}</p>
        <form id="loginForm" class="stack">
          <label class="form-label">${t(locale, 'fields.email')}</label>
          <input class="form-control" name="email" value="admin@uniflow.local" required>
          <label class="form-label">${t(locale, 'auth.password')}</label>
          <input class="form-control" name="password" value="demo123" type="password" required>
          <button class="btn btn-primary btn-lg" type="submit"><i class="bi bi-box-arrow-in-right"></i>${t(locale, 'actions.login')}</button>
        </form>
        </div>
      </section>
      <aside class="demo-panel">
        <div class="login-brand-copy">
          <div class="brand-mark">UF</div>
          <h1>${t(locale, 'app.name')}</h1>
          <p>${locale === 'ar' ? 'واجهة جامعية محلية بثلاثة أدوار وقواعد نقط مغربية.' : 'Application locale de gestion universitaire avec trois rôles et notes marocaines.'}</p>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2>${t(locale, 'auth.demo')}</h2>
          <button class="btn btn-outline-light btn-sm" data-action="toggle-locale">${locale === 'ar' ? 'FR' : 'AR'}</button>
        </div>
        <div class="demo-list">
          ${accounts
            .map(
              ([email, role, key]) => `
              <button class="demo-account" data-demo-email="${email}">
                <span class="avatar">${key.slice(0, 2).toUpperCase()}</span>
                <span><strong>${role}</strong><small>${email} / demo123</small></span>
              </button>`
            )
            .join('')}
        </div>
      </aside>
    </main>`;
}

function renderShell(content, data) {
  const { user, locale } = appState;
  const direction = getDirection(locale);
  return `
    <div class="app-shell" dir="${direction}">
      <aside class="sidebar">
        <a href="#/dashboard" class="shell-brand">
          <span class="brand-mark small">UF</span>
          <span><strong>${t(locale, 'app.name')}</strong><small>${t(locale, 'app.subtitle')}</small></span>
        </a>
        <nav class="shell-nav">${shellNav(user, locale)}</nav>
      </aside>
      <div class="main-shell">
        <header class="topbar">
          <button class="btn icon-btn d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileNav" aria-label="Menu">
            <i class="bi bi-list"></i>
          </button>
          <div>
            <div class="eyebrow">${t(locale, `roles.${user.role}`)}</div>
            <h1>${t(locale, resolveRoute(location.hash || DEFAULT_ROUTE).labelKey)}</h1>
          </div>
          <div class="topbar-actions">
            <button class="btn btn-outline-secondary btn-sm" data-action="toggle-locale">${locale === 'ar' ? 'FR' : 'AR'}</button>
            <span class="user-chip"><span class="avatar">${escapeHtml(user.avatar)}</span>${escapeHtml(user.displayName)}</span>
            <button class="btn icon-btn" data-action="logout" aria-label="${t(locale, 'actions.logout')}"><i class="bi bi-box-arrow-right"></i></button>
          </div>
        </header>
        <main id="workspace" class="workspace">${content}</main>
      </div>
      <div class="offcanvas offcanvas-${direction === 'rtl' ? 'end' : 'start'}" tabindex="-1" id="mobileNav">
        <div class="offcanvas-header">
          <h5>${t(locale, 'app.name')}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
        <div class="offcanvas-body shell-nav">${shellNav(user, locale)}</div>
      </div>
      <div class="toast-container position-fixed bottom-0 end-0 p-3" id="toastRegion"></div>
    </div>`;
}

async function renderDashboard(data) {
  const { locale, user } = appState;
  if (user.role === 'admin') {
    const activeStudents = data.students.filter((student) => student.status === 'active').length;
    const teachers = data.teachers.filter((teacher) => teacher.status === 'active').length;
    const validated = await Promise.all(data.students.map((student) => appState.grades.getSubjectAverage(student.id, 'sub-algo')));
    const successRate = Math.round((validated.filter((item) => item.validated).length / validated.length) * 100);
    const warnings = await Promise.all(data.scheduleEntries.map((entry) => appState.schedule.validateEntry(entry)));
    return `
      <div class="metric-grid">
        ${metric(locale === 'ar' ? 'الطلبة النشطون' : 'Étudiants actifs', activeStudents, '2025-2026', 'mortarboard')}
        ${metric(locale === 'ar' ? 'الأساتذة' : 'Enseignants', teachers, locale === 'ar' ? 'مكلفون بالتدريس' : 'affectés aux modules', 'person-workspace')}
        ${metric(locale === 'ar' ? 'نسبة النجاح' : 'Taux de réussite', `${successRate}%`, 'Algorithmique', 'graph-up')}
        ${metric(locale === 'ar' ? 'تنبيهات الجدول' : 'Alertes planning', warnings.filter((item) => !item.valid).length, locale === 'ar' ? 'تعارضات' : 'conflits', 'exclamation-triangle')}
      </div>
      ${section(locale === 'ar' ? 'توزيع المسالك' : 'Répartition par filière', '<div class="chart-frame chart-frame-sm"><canvas id="programChart"></canvas></div>')}
      ${section(locale === 'ar' ? 'النشاط الأخير' : 'Activité récente', renderActivity(data.activityLogs, locale))}`;
  }
  if (user.role === 'teacher') {
    const teacher = byId(data.teachers, user.linkedProfileId);
    const assignments = data.teachingAssignments.filter((item) => item.teacherId === teacher.id);
    return `
      <div class="metric-grid">
        ${metric(locale === 'ar' ? 'المواد' : 'Matières', assignments.length, personName(teacher, locale), 'book')}
        ${metric(locale === 'ar' ? 'المجموعات' : 'Groupes', new Set(assignments.flatMap((item) => item.groupIds)).size, locale === 'ar' ? 'هذه السنة' : 'cette année', 'people')}
        ${metric(locale === 'ar' ? 'حصص هذا الأسبوع' : 'Séances semaine', data.scheduleEntries.filter((entry) => entry.teacherId === teacher.id).length, locale === 'ar' ? 'مبرمجة' : 'programmées', 'calendar-week')}
      </div>
      ${section(t(locale, 'nav.myCourses'), renderTeacherCourses(data, teacher.id))}`;
  }
  const student = byId(data.students, user.linkedProfileId);
  const transcript = await appState.grades.getStudentTranscript(student.id);
  const publishable = transcript.flatMap((module) => module.subjects).filter((row) => row.result.publishable);
  const average = publishable.length ? roundAverage(publishable.reduce((sum, row) => sum + row.result.average, 0) / publishable.length) : '-';
  return `
    <div class="metric-grid">
      ${metric(locale === 'ar' ? 'المعدل العام' : 'Moyenne générale', `${average}/20`, locale === 'ar' ? 'مواد منشورة' : 'matières publiées', 'patch-check')}
      ${metric(locale === 'ar' ? 'المسلك' : 'Filière', escapeHtml(localName(byId(data.programs, student.programId), locale)), byId(data.groups, student.groupId).code, 'diagram-2')}
    </div>
    ${section(t(locale, 'nav.mySchedule'), renderScheduleTable(data.scheduleEntries.filter((entry) => entry.groupId === student.groupId), data, locale))}`;
}

function roundAverage(value) {
  return Math.round(value * 10) / 10;
}

function renderActivity(logs, locale) {
  return `
    <div class="timeline">
      ${logs
        .slice(-6)
        .reverse()
        .map((log) => `<div><span>${formatDate(locale, log.timestamp)}</span><strong>${escapeHtml(log.summary)}</strong></div>`)
        .join('')}
    </div>`;
}

function renderStudents(data) {
  const { locale } = appState;
  const rows = data.students
    .map((student) => {
      const program = byId(data.programs, student.programId);
      const group = byId(data.groups, student.groupId);
      return `<tr>
        <td><strong>${personName(student, locale)}</strong><div class="muted">${student.registrationNumber}</div></td>
        <td>${escapeHtml(localName(program, locale))}</td>
        <td>${group?.code ?? '-'}</td>
        <td>${student.email}</td>
        <td>${badge(t(locale, `status.${student.status}`), student.status === 'active' ? 'success' : 'secondary')}</td>
        <td><button class="btn btn-sm btn-outline-secondary" data-action="archive-student" data-id="${student.id}"><i class="bi bi-archive"></i></button></td>
      </tr>`;
    })
    .join('');
  return `
    ${section(
      t(locale, 'nav.students'),
      `<div class="table-toolbar"><input class="form-control" data-filter-table="studentsTable" placeholder="${t(locale, 'actions.search')}"></div>
       <div class="table-responsive"><table class="table align-middle searchable-table" id="studentsTable"><thead><tr><th>${locale === 'ar' ? 'الطالب' : 'Étudiant'}</th><th>${locale === 'ar' ? 'المسلك' : 'Filière'}</th><th>${locale === 'ar' ? 'المجموعة' : 'Groupe'}</th><th>Email</th><th>${locale === 'ar' ? 'الحالة' : 'Statut'}</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,
      `<button class="btn btn-primary" data-action="open-modal" data-target="createStudentModal"><i class="bi bi-plus-lg"></i>${t(locale, 'actions.add')}</button>`
    )}
    ${renderStudentForm(data, locale)}`;
}

function renderStudentForm(data, locale) {
  const fields = `
    ${formField(locale === 'ar' ? 'رقم التسجيل' : 'N° inscription', '<input class="form-control" name="registrationNumber" placeholder="UNI-2026-100" required>', 'form-field-wide')}
    ${formField(locale === 'ar' ? 'الاسم بالفرنسية' : 'Prénom FR', '<input class="form-control" name="firstNameFr" placeholder="Mina" required>')}
    ${formField(locale === 'ar' ? 'النسب بالفرنسية' : 'Nom FR', '<input class="form-control" name="lastNameFr" placeholder="El Fassi" required>')}
    ${formField(locale === 'ar' ? 'الاسم بالعربية' : 'الاسم', '<input class="form-control" name="firstNameAr" placeholder="مينة" required>')}
    ${formField(locale === 'ar' ? 'النسب بالعربية' : 'النسب', '<input class="form-control" name="lastNameAr" placeholder="الفاسي" required>')}
    ${formField('Email', '<input class="form-control" name="email" placeholder="email@example.test" type="email" required>')}
    ${formField(locale === 'ar' ? 'الهاتف' : 'Téléphone', '<input class="form-control" name="phone" placeholder="+212..." required>')}
    ${formField(locale === 'ar' ? 'تاريخ الازدياد' : 'Date de naissance', '<input class="form-control" name="birthDate" type="date" required>')}
    ${formField(locale === 'ar' ? 'المسلك' : 'Filière', `<select class="form-select" name="programId">${optionTags(data.programs, 'prog-cs', locale)}</select>`)}
    ${formField(locale === 'ar' ? 'المستوى' : 'Niveau', `<select class="form-select" name="levelId">${optionTags(data.levels, 'lvl-cs-2', locale, 'label')}</select>`)}
    ${formField(locale === 'ar' ? 'المجموعة' : 'Groupe', `<select class="form-select" name="groupId">${optionTags(data.groups, 'grp-cs-2a', locale, 'code')}</select>`)}
  `;
  return renderFormModal({
    id: 'createStudentModal',
    title: locale === 'ar' ? 'إضافة طالب' : 'Ajouter un étudiant',
    formId: 'studentForm',
    fields,
    submitLabel: t(locale, 'actions.save')
  });
}

function renderTeachers(data) {
  const { locale } = appState;
  const rows = data.teachers
    .map((teacher) => `<tr><td><strong>${personName(teacher, locale)}</strong><div class="muted">${teacher.employeeNumber}</div></td><td>${teacher.speciality}</td><td>${teacher.rank}</td><td>${teacher.email}</td><td>${badge(t(locale, `status.${teacher.status}`), teacher.status === 'active' ? 'success' : 'secondary')}</td></tr>`)
    .join('');
  return section(t(locale, 'nav.teachers'), `<div class="table-toolbar"><input class="form-control" data-filter-table="teachersTable" placeholder="${t(locale, 'actions.search')}"></div><div class="table-responsive"><table class="table align-middle searchable-table" id="teachersTable"><thead><tr><th>${locale === 'ar' ? 'الأستاذ' : 'Enseignant'}</th><th>${locale === 'ar' ? 'التخصص' : 'Spécialité'}</th><th>${locale === 'ar' ? 'الرتبة' : 'Grade'}</th><th>Email</th><th>${locale === 'ar' ? 'الحالة' : 'Statut'}</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}

function renderAcademic(data) {
  const { locale } = appState;
  const programs = data.programs.map((program) => `<tr><td><strong>${localName(program, locale)}</strong><div class="muted">${program.code}</div></td><td>${program.department}</td><td>${program.degreeType}</td><td>${program.duration}</td></tr>`).join('');
  const subjects = data.subjects.map((subject) => `<tr><td>${localName(subject, locale)}</td><td>${subject.code}</td><td>${localName(byId(data.modules, subject.moduleId), locale)}</td><td>${subject.coefficient}</td><td>${subject.hours}h</td></tr>`).join('');
  return `
    ${section(locale === 'ar' ? 'المسالك' : 'Filières', `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>${locale === 'ar' ? 'المسلك' : 'Filière'}</th><th>${locale === 'ar' ? 'الشعبة' : 'Département'}</th><th>${locale === 'ar' ? 'الشهادة' : 'Diplôme'}</th><th>${locale === 'ar' ? 'المدة' : 'Durée'}</th></tr></thead><tbody>${programs}</tbody></table></div>`)}
    ${section(locale === 'ar' ? 'المواد والوحدات' : 'Matières et modules', `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>${locale === 'ar' ? 'المادة' : 'Matière'}</th><th>Code</th><th>${locale === 'ar' ? 'الوحدة' : 'Module'}</th><th>Coef.</th><th>Heures</th></tr></thead><tbody>${subjects}</tbody></table></div>`)}
    ${section(locale === 'ar' ? 'القاعات' : 'Salles', `<div class="room-grid">${data.rooms.map((room) => `<div class="room-tile"><strong>${room.code}</strong><span>${room.building}</span><span>${room.type} · ${room.capacity}</span></div>`).join('')}</div>`)}
  `;
}

function renderEnrollments(data) {
  const { locale } = appState;
  const rows = data.enrollments.map((enrollment) => {
    const student = byId(data.students, enrollment.studentId);
    return `<tr><td>${personName(student, locale)}</td><td>${localName(byId(data.programs, enrollment.programId), locale)}</td><td>${localName(byId(data.levels, enrollment.levelId), locale, 'label')}</td><td>${byId(data.groups, enrollment.groupId)?.code ?? '-'}</td><td>${badge(enrollment.status, 'success')}</td></tr>`;
  }).join('');
  return section(t(locale, 'nav.enrollments'), `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>${locale === 'ar' ? 'الطالب' : 'Étudiant'}</th><th>${locale === 'ar' ? 'المسلك' : 'Filière'}</th><th>${locale === 'ar' ? 'المستوى' : 'Niveau'}</th><th>${locale === 'ar' ? 'المجموعة' : 'Groupe'}</th><th>${locale === 'ar' ? 'الحالة' : 'Statut'}</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}

function renderAssignments(data) {
  const { locale } = appState;
  const rows = data.teachingAssignments.map((assignment) => `<tr><td>${personName(byId(data.teachers, assignment.teacherId), locale)}</td><td>${localName(byId(data.subjects, assignment.subjectId), locale)}</td><td>${assignment.groupIds.map((idValue) => byId(data.groups, idValue)?.code).join(', ')}</td><td>${byId(data.semesters, assignment.semesterId)?.code ?? '-'}</td></tr>`).join('');
  return section(t(locale, 'nav.assignments'), `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>${locale === 'ar' ? 'الأستاذ' : 'Enseignant'}</th><th>${locale === 'ar' ? 'المادة' : 'Matière'}</th><th>${locale === 'ar' ? 'المجموعات' : 'Groupes'}</th><th>${locale === 'ar' ? 'السداسي' : 'Semestre'}</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}

function renderScheduleTable(entries, data, locale) {
  if (!entries.length) return emptyState(locale === 'ar' ? 'لا توجد حصص' : 'Aucune séance');
  return `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>${locale === 'ar' ? 'اليوم' : 'Jour'}</th><th>${locale === 'ar' ? 'الوقت' : 'Heure'}</th><th>${locale === 'ar' ? 'المادة' : 'Matière'}</th><th>${locale === 'ar' ? 'الأستاذ' : 'Enseignant'}</th><th>${locale === 'ar' ? 'المجموعة' : 'Groupe'}</th><th>${locale === 'ar' ? 'القاعة' : 'Salle'}</th></tr></thead><tbody>${entries.map((entry) => `<tr><td>${locale === 'ar' ? weekdayKeysAr[entry.weekday] : weekdayKeys[entry.weekday]}</td><td>${entry.startTime} - ${entry.endTime}</td><td>${localName(byId(data.subjects, entry.subjectId), locale)}</td><td>${personName(byId(data.teachers, entry.teacherId), locale)}</td><td>${byId(data.groups, entry.groupId)?.code ?? '-'}</td><td>${byId(data.rooms, entry.roomId)?.code ?? '-'}</td></tr>`).join('')}</tbody></table></div>`;
}

function renderSchedule(data) {
  const { locale } = appState;
  const fields = `
    ${formField(locale === 'ar' ? 'المادة' : 'Matière', `<select class="form-select" name="subjectId">${optionTags(data.subjects, 'sub-db', locale)}</select>`)}
    ${formField(locale === 'ar' ? 'الأستاذ' : 'Enseignant', `<select class="form-select" name="teacherId">${data.teachers.map((teacher) => `<option value="${teacher.id}">${personName(teacher, locale)}</option>`).join('')}</select>`)}
    ${formField(locale === 'ar' ? 'المجموعة' : 'Groupe', `<select class="form-select" name="groupId">${optionTags(data.groups, 'grp-cs-2a', locale, 'code')}</select>`)}
    ${formField(locale === 'ar' ? 'القاعة' : 'Salle', `<select class="form-select" name="roomId">${optionTags(data.rooms, 'room-a101', locale, 'code')}</select>`)}
    ${formField(locale === 'ar' ? 'اليوم' : 'Jour', '<input class="form-control" name="weekday" type="number" min="1" max="6" value="1">')}
    ${formField(locale === 'ar' ? 'بداية الحصة' : 'Début', '<input class="form-control" name="startTime" type="time" value="09:30">')}
    ${formField(locale === 'ar' ? 'نهاية الحصة' : 'Fin', '<input class="form-control" name="endTime" type="time" value="11:00">')}
  `;
  const title = locale === 'ar' ? 'اختبار تعارض الحصص' : 'Tester un conflit planning';
  return `
    ${section(
      t(locale, 'nav.schedule'),
      renderScheduleTable(data.scheduleEntries, data, locale),
      `<button class="btn btn-primary" data-action="open-modal" data-target="scheduleConflictModal"><i class="bi bi-search"></i>${title}</button>`
    )}
    ${renderFormModal({
      id: 'scheduleConflictModal',
      title,
      formId: 'scheduleForm',
      fields,
      submitLabel: locale === 'ar' ? 'تحقق' : 'Vérifier',
      submitIcon: 'search',
      result: '<div id="scheduleResult" class="form-modal-result"></div>'
    })}`;
}

function renderGradesOverview(data) {
  const { locale } = appState;
  const rows = data.students.map((student) => `<tr><td>${personName(student, locale)}</td><td>${student.registrationNumber}</td><td data-grade-mark-student="${student.id}">...</td><td data-grade-appreciation-student="${student.id}">...</td></tr>`).join('');
  queueMicrotask(async () => {
    for (const student of data.students) {
      const result = await appState.grades.getSubjectAverage(student.id, 'sub-algo');
      const markCell = document.querySelector(`[data-grade-mark-student="${student.id}"]`);
      const appreciationCell = document.querySelector(`[data-grade-appreciation-student="${student.id}"]`);
      if (markCell) markCell.textContent = result.publishable ? `${result.average}/20` : '-';
      if (appreciationCell) appreciationCell.innerHTML = result.publishable ? badge(result.mention, result.validated ? 'success' : 'danger') : badge(locale === 'ar' ? 'غير منشور' : 'Non publié', 'warning');
    }
  });
  return section(t(locale, 'nav.grades'), `<div class="table-responsive"><table class="table align-middle grades-overview-table"><thead><tr><th>${locale === 'ar' ? 'الطالب' : 'Étudiant'}</th><th>${locale === 'ar' ? 'رقم التسجيل' : 'N° inscription'}</th><th>${locale === 'ar' ? 'النقطة /20' : 'Note /20'}</th><th>${locale === 'ar' ? 'التقدير' : 'Appréciation'}</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}

function renderTeacherCourses(data, teacherId = appState.user.linkedProfileId) {
  const { locale } = appState;
  const assignments = data.teachingAssignments.filter((assignment) => assignment.teacherId === teacherId);
  return `<div class="split-list">${assignments.map((assignment) => `<a href="#/gradebook/${assignment.subjectId}" class="split-row"><span><strong>${localName(byId(data.subjects, assignment.subjectId), locale)}</strong><small>${assignment.groupIds.map((idValue) => byId(data.groups, idValue)?.code).join(', ')}</small></span><i class="bi bi-arrow-${getDirection(locale) === 'rtl' ? 'left' : 'right'}"></i></a>`).join('')}</div>`;
}

function renderGradebook(data) {
  const { locale, user } = appState;
  const subjectId = location.hash.split('/')[2] ?? data.teachingAssignments.find((assignment) => assignment.teacherId === user.linkedProfileId)?.subjectId ?? 'sub-algo';
  const assignment = data.teachingAssignments.find((item) => item.teacherId === user.linkedProfileId && item.subjectId === subjectId);
  const students = data.students.filter((student) => assignment?.groupIds.includes(student.groupId));
  const assessments = data.assessments.filter((assessment) => assessment.subjectId === subjectId);
  const assessmentId = assessments[0]?.id;
  const rows = students.map((student) => {
    const grade = data.grades.find((item) => item.studentId === student.id && item.assessmentId === assessmentId);
    return `<tr><td>${personName(student, locale)}</td><td>${student.registrationNumber}</td><td><input class="form-control form-control-sm" name="mark-${student.id}" type="number" min="0" max="20" step="0.25" value="${grade?.mark ?? ''}"></td><td><select class="form-select form-select-sm" name="absence-${student.id}"><option value="">-</option><option value="excused" ${grade?.absence === 'excused' ? 'selected' : ''}>Excusée</option><option value="unexcused" ${grade?.absence === 'unexcused' ? 'selected' : ''}>Non excusée</option></select></td></tr>`;
  }).join('');
  return `
    ${section(t(locale, 'nav.myCourses'), renderTeacherCourses(data))}
    ${section(
      t(locale, 'nav.gradebook'),
      `<form id="gradebookForm" data-assessment-id="${assessmentId ?? ''}"><div class="table-responsive"><table class="table align-middle"><thead><tr><th>${locale === 'ar' ? 'الطالب' : 'Étudiant'}</th><th>${locale === 'ar' ? 'رقم التسجيل' : 'N° inscription'}</th><th>${locale === 'ar' ? 'النقطة' : 'Note /20'}</th><th>${locale === 'ar' ? 'الغياب' : 'Absence'}</th></tr></thead><tbody>${rows}</tbody></table></div><button class="btn btn-primary"><i class="bi bi-save"></i>${t(locale, 'actions.save')}</button></form>`
    )}`;
}

async function renderStudentGrades(data) {
  const { locale, user } = appState;
  const studentId = user.linkedProfileId;
  const transcript = await appState.grades.getStudentTranscript(studentId);
  return section(t(locale, 'nav.myGrades'), renderTranscriptTable(transcript, locale));
}

export function renderTranscriptTable(transcript, locale) {
  return `<div class="transcript">${transcript.map((module) => `<div class="transcript-module"><div class="transcript-module-head"><h3>${localName(module.module, locale)}</h3><span>${module.result.average ?? '-'}/20</span></div><div class="table-responsive"><table class="table table-sm transcript-table"><colgroup><col class="transcript-col-subject"><col class="transcript-col-average"><col class="transcript-col-result"><col class="transcript-col-mention"></colgroup><thead><tr><th>${locale === 'ar' ? 'المادة' : 'Matière'}</th><th>${locale === 'ar' ? 'المعدل' : 'Moyenne'}</th><th>${locale === 'ar' ? 'النتيجة' : 'Résultat'}</th><th>${locale === 'ar' ? 'الميزة' : 'Mention'}</th></tr></thead><tbody>${module.subjects.map((row) => `<tr><td>${localName(row.subject, locale)}</td><td>${row.result.average ?? '-'}</td><td>${row.result.validated ? badge(t(locale, 'status.validated'), 'success') : badge(row.result.publishable ? t(locale, 'status.failed') : locale === 'ar' ? 'معلق' : 'En attente', row.result.publishable ? 'danger' : 'warning')}</td><td>${row.result.mention}</td></tr>`).join('')}</tbody></table></div></div>`).join('')}</div>`;
}

async function renderTranscript(data) {
  const { locale, user } = appState;
  const student = byId(data.students, user.linkedProfileId);
  const transcript = await appState.grades.getStudentTranscript(student.id);
  return section(
    t(locale, 'nav.myTranscript'),
    `<div class="print-header"><h2>${personName(student, locale)}</h2><p>${student.registrationNumber} · ${localName(byId(data.programs, student.programId), locale)} · ${byId(data.groups, student.groupId)?.code}</p></div>${renderTranscriptTable(transcript, locale)}`,
    `<button class="btn btn-outline-secondary" data-action="print"><i class="bi bi-printer"></i>${t(locale, 'actions.print')}</button>`,
    'transcript-section'
  );
}

function renderReports(data) {
  const { locale } = appState;
  return `
    <div class="metric-grid">
      ${metric(locale === 'ar' ? 'الطلبة' : 'Étudiants', data.students.length, locale === 'ar' ? 'مسجلون' : 'inscrits', 'mortarboard')}
      ${metric(locale === 'ar' ? 'المواد' : 'Matières', data.subjects.length, locale === 'ar' ? 'مفتوحة' : 'ouvertes', 'book')}
      ${metric(locale === 'ar' ? 'الحصص' : 'Séances', data.scheduleEntries.length, locale === 'ar' ? 'في الجدول' : 'au planning', 'calendar3')}
    </div>
    ${section(t(locale, 'nav.reports'), '<div class="chart-frame"><canvas id="reportChart"></canvas></div>', `<button class="btn btn-outline-secondary" data-action="export-csv" data-collection="students"><i class="bi bi-filetype-csv"></i>CSV</button>`)}
  `;
}

function renderUsers(data) {
  const { locale } = appState;
  return section(t(locale, 'nav.users'), `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>${locale === 'ar' ? 'المستخدم' : 'Utilisateur'}</th><th>Email</th><th>${locale === 'ar' ? 'الدور' : 'Rôle'}</th><th>${locale === 'ar' ? 'اللغة' : 'Langue'}</th></tr></thead><tbody>${data.users.map((user) => `<tr><td>${user.displayName}</td><td>${user.email}</td><td>${t(locale, `roles.${user.role}`)}</td><td>${user.locale.toUpperCase()}</td></tr>`).join('')}</tbody></table></div>`);
}

function renderSettings(locale) {
  return section(
    t(locale, 'nav.settings'),
    `<div class="settings-grid">
      <button class="setting-action" data-action="export-json"><i class="bi bi-download"></i><span>${locale === 'ar' ? 'تصدير قاعدة البيانات JSON' : 'Exporter la base JSON'}</span></button>
      <label class="setting-action"><i class="bi bi-upload"></i><span>${locale === 'ar' ? 'استيراد JSON' : 'Importer JSON'}</span><input class="visually-hidden" type="file" accept="application/json" data-action="import-json"></label>
      <button class="setting-action danger" data-action="reset-db"><i class="bi bi-arrow-clockwise"></i><span>${locale === 'ar' ? 'إعادة بيانات العرض' : 'Réinitialiser la démonstration'}</span></button>
    </div>`
  );
}

async function renderProfile(data) {
  const { locale, user } = appState;
  const profile = await findCurrentProfile(data);
  const name = user.role === 'admin' ? user.displayName : personName(profile, locale);
  return section(t(locale, 'nav.profile'), `<div class="profile-panel"><div class="avatar huge">${escapeHtml(user.avatar)}</div><div><h2>${escapeHtml(name)}</h2><p>${escapeHtml(user.email)}</p><p>${t(locale, `roles.${user.role}`)}</p></div></div>`);
}

async function renderStudentProgram(data) {
  const { locale, user } = appState;
  const student = byId(data.students, user.linkedProfileId);
  const enrollment = data.enrollments.find((item) => item.studentId === student.id);
  return section(t(locale, 'nav.myProgram'), `<dl class="detail-list"><dt>${locale === 'ar' ? 'المسلك' : 'Filière'}</dt><dd>${localName(byId(data.programs, enrollment.programId), locale)}</dd><dt>${locale === 'ar' ? 'المستوى' : 'Niveau'}</dt><dd>${localName(byId(data.levels, enrollment.levelId), locale, 'label')}</dd><dt>${locale === 'ar' ? 'المجموعة' : 'Groupe'}</dt><dd>${byId(data.groups, enrollment.groupId)?.code}</dd><dt>${locale === 'ar' ? 'السنة الجامعية' : 'Année universitaire'}</dt><dd>${byId(data.academicYears, enrollment.academicYearId)?.label}</dd></dl>`);
}

async function renderRoute() {
  const root = appState.root;
  const locale = appState.locale;
  document.documentElement.lang = locale;
  document.documentElement.dir = getDirection(locale);

  if (!appState.user || PUBLIC_ROUTES.includes(location.hash || '#/login')) {
    root.innerHTML = renderLogin(locale);
    return;
  }

  const route = resolveRoute(location.hash || DEFAULT_ROUTE);
  if (!appState.auth.canAccessRoute(appState.user, route.path)) {
    location.hash = '#/dashboard';
    return;
  }

  const data = await loadData();
  let content = '';
  switch (route.path) {
    case '#/dashboard':
      content = await renderDashboard(data);
      break;
    case '#/profile':
      content = await renderProfile(data);
      break;
    case '#/students':
      content = renderStudents(data);
      break;
    case '#/teachers':
      content = renderTeachers(data);
      break;
    case '#/programs':
    case '#/academic-structure':
      content = renderAcademic(data);
      break;
    case '#/enrollments':
      content = renderEnrollments(data);
      break;
    case '#/assignments':
      content = renderAssignments(data);
      break;
    case '#/schedule':
    case '#/my-schedule':
      content = appState.user.role === 'student'
        ? section(t(locale, 'nav.mySchedule'), renderScheduleTable(data.scheduleEntries.filter((entry) => entry.groupId === byId(data.students, appState.user.linkedProfileId)?.groupId), data, locale))
        : appState.user.role === 'teacher'
          ? section(t(locale, 'nav.mySchedule'), renderScheduleTable(data.scheduleEntries.filter((entry) => entry.teacherId === appState.user.linkedProfileId), data, locale))
          : renderSchedule(data);
      break;
    case '#/grades':
      content = renderGradesOverview(data);
      break;
    case '#/reports':
      content = renderReports(data);
      break;
    case '#/users':
      content = renderUsers(data);
      break;
    case '#/settings':
      content = renderSettings(locale);
      break;
    case '#/my-courses':
      content = section(t(locale, 'nav.myCourses'), renderTeacherCourses(data));
      break;
    case '#/my-groups':
      content = renderEnrollments({ ...data, enrollments: data.enrollments.filter((enrollment) => data.teachingAssignments.some((assignment) => assignment.teacherId === appState.user.linkedProfileId && assignment.groupIds.includes(enrollment.groupId))) });
      break;
    case '#/gradebook':
      content = renderGradebook(data);
      break;
    case '#/my-program':
      content = await renderStudentProgram(data);
      break;
    case '#/my-grades':
      content = await renderStudentGrades(data);
      break;
    case '#/my-transcript':
      content = await renderTranscript(data);
      break;
    default:
      content = section('404', locale === 'ar' ? 'الصفحة غير موجودة' : 'Page introuvable');
  }

  root.innerHTML = renderShell(content, data);
  renderCharts(data);
}

function renderCharts(data) {
  if (typeof Chart === 'undefined') return;
  if (activeChart) {
    activeChart.destroy();
    activeChart = null;
  }
  const locale = appState.locale;
  const canvas = document.getElementById('programChart') ?? document.getElementById('reportChart');
  if (!canvas) return;
  const counts = data.programs.map((program) => data.students.filter((student) => student.programId === program.id).length);
  activeChart = new Chart(canvas, {
    type: document.getElementById('reportChart') ? 'bar' : 'doughnut',
    data: {
      labels: data.programs.map((program) => localName(program, locale)),
      datasets: [{ data: counts, backgroundColor: ['#123b68', '#f5bd2b', '#3e7cb1'] }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: document.getElementById('reportChart') ? { y: { beginAtZero: true, ticks: { precision: 0 } } } : undefined
    }
  });
}

function showToast(message, tone = 'success') {
  const region = document.getElementById('toastRegion');
  if (!region || typeof bootstrap === 'undefined') return;
  const element = document.createElement('div');
  element.className = `toast align-items-center text-bg-${tone} border-0`;
  element.role = 'status';
  element.innerHTML = `<div class="d-flex"><div class="toast-body">${escapeHtml(message)}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  region.appendChild(element);
  const toast = new bootstrap.Toast(element, { delay: 2600 });
  toast.show();
  element.addEventListener('hidden.bs.toast', () => element.remove());
}

function cleanupModalState() {
  document.querySelectorAll('.modal-backdrop').forEach((element) => element.remove());
  document.body.classList.remove('modal-open');
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('padding-right');
}

function openModal(modalElement) {
  if (!modalElement) return;
  if (typeof bootstrap !== 'undefined') {
    bootstrap.Modal.getOrCreateInstance(modalElement).show();
    return;
  }
  cleanupModalState();
  modalElement.classList.add('show');
  modalElement.removeAttribute('aria-hidden');
  modalElement.setAttribute('aria-modal', 'true');
  modalElement.setAttribute('role', 'dialog');
  modalElement.style.display = 'block';
  document.body.classList.add('modal-open');
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop fade show';
  backdrop.dataset.localModalBackdrop = modalElement.id;
  document.body.appendChild(backdrop);
  modalElement.querySelector('input, select, button')?.focus();
}

function closeModal(modalElement) {
  if (!modalElement) return;
  if (typeof bootstrap !== 'undefined') {
    bootstrap.Modal.getInstance(modalElement)?.hide();
    return;
  }
  modalElement.classList.remove('show');
  modalElement.setAttribute('aria-hidden', 'true');
  modalElement.removeAttribute('aria-modal');
  modalElement.removeAttribute('role');
  modalElement.style.display = 'none';
  cleanupModalState();
}

async function handleSubmit(event) {
  const form = event.target;
  if (form.id === 'loginForm') {
    event.preventDefault();
    const formData = new FormData(form);
    try {
      const user = await appState.auth.login(formData.get('email'), formData.get('password'));
      appState.user = user;
      localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, locale: appState.locale }));
      location.hash = DEFAULT_ROUTE;
      await renderRoute();
    } catch {
      showInlineError(form, t(appState.locale, 'validation.invalidCredentials'));
    }
  }
  if (form.id === 'studentForm') {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      await appState.academic.createStudentWithEnrollment(payload);
      showToast(t(appState.locale, 'toast.saved'));
      closeModal(form.closest('.modal'));
      await renderRoute();
      cleanupModalState();
    } catch (error) {
      showInlineError(form, error.message);
    }
  }
  if (form.id === 'scheduleForm') {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.weekday = Number(payload.weekday);
    const result = await appState.schedule.validateEntry(payload);
    document.getElementById('scheduleResult').innerHTML = result.valid
      ? `<div class="alert alert-success">${appState.locale === 'ar' ? 'لا يوجد تعارض.' : 'Aucun conflit détecté.'}</div>`
      : `<div class="alert alert-warning"><strong>${appState.locale === 'ar' ? 'تعارضات:' : 'Conflits :'}</strong> ${result.conflicts.map((item) => item.type).join(', ')}</div>`;
  }
  if (form.id === 'gradebookForm') {
    event.preventDefault();
    const data = await loadData();
    const assessmentId = form.dataset.assessmentId;
    const assignment = data.teachingAssignments.find((item) => item.teacherId === appState.user.linkedProfileId && data.assessments.find((assessment) => assessment.id === assessmentId)?.subjectId === item.subjectId);
    const students = data.students.filter((student) => assignment?.groupIds.includes(student.groupId));
    for (const student of students) {
      const mark = form.elements[`mark-${student.id}`].value;
      const absence = form.elements[`absence-${student.id}`].value || null;
      if (mark || absence) {
        await appState.grades.saveGrade({ actorUserId: appState.user.id, assessmentId, studentId: student.id, mark: mark || 0, absence, comment: '' });
      }
    }
    showToast(t(appState.locale, 'toast.saved'));
    await renderRoute();
  }
}

function showInlineError(form, message) {
  form.querySelector('.alert')?.remove();
  form.insertAdjacentHTML('afterbegin', `<div class="alert alert-danger">${escapeHtml(message)}</div>`);
}

async function handleClick(event) {
  const target = event.target.closest('[data-action], [data-demo-email]');
  if (!target) return;
  const action = target.dataset.action;
  if (target.dataset.demoEmail) {
    document.querySelector('[name="email"]').value = target.dataset.demoEmail;
    document.querySelector('[name="password"]').value = 'demo123';
  }
  if (action === 'toggle-locale') {
    appState.locale = appState.locale === 'ar' ? 'fr' : 'ar';
    if (appState.user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: appState.user.id, locale: appState.locale }));
    }
    await renderRoute();
  }
  if (action === 'logout') {
    appState.user = null;
    localStorage.removeItem(SESSION_KEY);
    location.hash = '#/login';
    await renderRoute();
  }
  if (action === 'open-modal') {
    const modalElement = document.getElementById(target.dataset.target);
    openModal(modalElement);
  }
  if (action === 'close-modal') {
    closeModal(document.getElementById(target.dataset.target));
  }
  if (action === 'archive-student') {
    await appState.repositories.students.archive(target.dataset.id);
    showToast(t(appState.locale, 'toast.saved'));
    await renderRoute();
  }
  if (action === 'print') {
    window.print();
  }
  if (action === 'export-json') {
    download('uniflow-backup.json', JSON.stringify(await appState.adapter.exportDatabase(), null, 2));
  }
  if (action === 'export-csv') {
    download(`${target.dataset.collection}.csv`, await appState.academic.exportCsv(target.dataset.collection), 'text/csv');
  }
  if (action === 'reset-db' && confirm(appState.locale === 'ar' ? 'إعادة بيانات العرض؟' : 'Réinitialiser les données de démonstration ?')) {
    await appState.academic.resetDemoData();
    showToast(t(appState.locale, 'toast.saved'));
    await renderRoute();
  }
}

async function handleChange(event) {
  const target = event.target;
  if (target.matches('[data-action="import-json"]')) {
    const file = target.files[0];
    if (!file) return;
    const snapshot = JSON.parse(await file.text());
    await appState.adapter.replaceDatabase(snapshot);
    showToast(t(appState.locale, 'toast.saved'));
    await renderRoute();
  }
  if (target.matches('[data-filter-table]')) {
    filterTable(target);
  }
}

function handleInput(event) {
  if (event.target.matches('[data-filter-table]')) {
    filterTable(event.target);
  }
}

function filterTable(input) {
  const table = document.getElementById(input.dataset.filterTable);
  const query = input.value.toLowerCase();
  table?.querySelectorAll('tbody tr').forEach((row) => {
    row.hidden = !row.textContent.toLowerCase().includes(query);
  });
}

async function restoreSession(repositories) {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return { user: null, locale: 'fr' };
  try {
    const session = JSON.parse(raw);
    return {
      user: await repositories.users.getById(session.userId),
      locale: session.locale ?? 'fr'
    };
  } catch {
    return { user: null, locale: 'fr' };
  }
}

export async function startApp({ root = document.getElementById('app'), storageKey = 'uniflow.database' } = {}) {
  const adapter = new LocalStorageAdapter({ key: storageKey, seedFactory: createSeedDatabase });
  await adapter.initialize();
  const repositories = createRepositories(adapter);
  const session = await restoreSession(repositories);
  appState = {
    root,
    adapter,
    repositories,
    auth: new AuthService(repositories),
    grades: new GradeService(repositories),
    schedule: new ScheduleService(repositories),
    academic: new AcademicService(repositories, adapter),
    user: session.user,
    locale: session.locale
  };
  if (!location.hash) {
    location.hash = session.user ? DEFAULT_ROUTE : '#/login';
  }
  window.addEventListener('hashchange', renderRoute);
  root.addEventListener('submit', handleSubmit);
  root.addEventListener('click', handleClick);
  root.addEventListener('change', handleChange);
  root.addEventListener('input', handleInput);
  await renderRoute();
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => startApp());
}
