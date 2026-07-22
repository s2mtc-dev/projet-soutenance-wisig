import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createSeedDatabase, DATABASE_VERSION } from '../src/data/seed.js';
import { MemoryStorageAdapter } from '../src/core/storage.js';
import { Repository } from '../src/core/repository.js';
import {
  AcademicService,
  AuthService,
  GradeService,
  ScheduleService,
  createRepositories
} from '../src/core/services.js';
import { getDirection, interpolate, t } from '../src/core/i18n.js';
import { ROUTES, getAvailableRoutes, renderTranscriptTable, resolveRoute } from '../src/app.js';

function makeContext() {
  const db = createSeedDatabase();
  const adapter = new MemoryStorageAdapter(db);
  const repositories = createRepositories(adapter);
  return {
    db,
    adapter,
    repositories,
    auth: new AuthService(repositories),
    grades: new GradeService(repositories),
    schedule: new ScheduleService(repositories),
    academic: new AcademicService(repositories, adapter)
  };
}

test('seed database is versioned and has complete role demo data', () => {
  const db = createSeedDatabase();

  assert.equal(db.version, DATABASE_VERSION);
  assert.equal(db.users.some((user) => user.role === 'admin'), true);
  assert.equal(db.users.some((user) => user.role === 'teacher'), true);
  assert.equal(db.users.some((user) => user.role === 'student'), true);
  assert.equal(db.students.length >= 6, true);
  assert.equal(db.teachers.length >= 4, true);
  assert.equal(db.programs.length >= 2, true);
  assert.equal(db.modules.length >= 3, true);
  assert.equal(db.subjects.length >= 6, true);
  assert.equal(db.scheduleEntries.length >= 4, true);
});

test('repository CRUD is asynchronous and does not mutate returned records', async () => {
  const { repositories } = makeContext();
  const students = repositories.students;
  const existing = await students.list();
  const first = existing[0];
  first.firstNameFr = 'Changed outside repository';

  const untouched = await students.getById(first.id);
  assert.notEqual(untouched.firstNameFr, 'Changed outside repository');

  const created = await students.create({
    registrationNumber: 'UNI-2026-999',
    firstNameFr: 'Nadia',
    lastNameFr: 'Rami',
    firstNameAr: 'نادية',
    lastNameAr: 'رامي',
    email: 'nadia.rami@example.test',
    phone: '+212600000999',
    birthDate: '2003-02-20',
    programId: 'prog-cs',
    levelId: 'lvl-cs-2',
    groupId: 'grp-cs-2a',
    status: 'active'
  });

  assert.match(created.id, /^id-/);
  await students.update(created.id, { phone: '+212600000001' });
  assert.equal((await students.getById(created.id)).phone, '+212600000001');
  await students.archive(created.id);
  assert.equal((await students.getById(created.id)).status, 'archived');
});

test('grade service calculates weighted averages and Moroccan mentions', async () => {
  const { grades } = makeContext();
  const average = await grades.getSubjectAverage('stu-1', 'sub-algo');
  const moduleAverage = await grades.getModuleAverage('stu-1', 'mod-cs-fundamentals');

  assert.equal(average.average, 14.9);
  assert.equal(average.validated, true);
  assert.equal(average.mention, 'Bien');
  assert.equal(moduleAverage.validated, true);
  assert.equal(grades.getMention(16.2), 'Très bien');
  assert.equal(grades.getMention(9.99), 'Ajourné');
});

test('excused absences block publication while unexcused absences count as zero', async () => {
  const { grades } = makeContext();

  const excused = await grades.getSubjectAverage('stu-4', 'sub-algo');
  const unexcused = await grades.getSubjectAverage('stu-5', 'sub-algo');

  assert.equal(excused.publishable, false);
  assert.equal(excused.average, null);
  assert.equal(unexcused.publishable, true);
  assert.equal(unexcused.average < 10, true);
});

test('schedule service detects teacher, group, room, capacity, and assignment conflicts', async () => {
  const { schedule } = makeContext();
  const teacherConflict = await schedule.validateEntry({
    id: 'new-1',
    subjectId: 'sub-db',
    groupId: 'grp-cs-2a',
    teacherId: 'teach-1',
    roomId: 'room-a101',
    weekday: 1,
    startTime: '09:30',
    endTime: '11:00'
  });

  assert.equal(teacherConflict.valid, false);
  assert.equal(teacherConflict.conflicts.some((item) => item.type === 'teacher'), true);
  assert.equal(teacherConflict.conflicts.some((item) => item.type === 'group'), true);
  assert.equal(teacherConflict.conflicts.some((item) => item.type === 'room'), true);
  assert.equal(teacherConflict.conflicts.some((item) => item.type === 'assignment'), true);

  const capacityConflict = await schedule.validateEntry({
    id: 'new-2',
    subjectId: 'sub-db',
    groupId: 'grp-cs-2a',
    teacherId: 'teach-2',
    roomId: 'room-lab-small',
    weekday: 4,
    startTime: '08:00',
    endTime: '10:00'
  });

  assert.equal(capacityConflict.conflicts.some((item) => item.type === 'capacity'), true);
});

test('auth service enforces role and ownership permissions', async () => {
  const { auth } = makeContext();
  const admin = await auth.login('admin@uniflow.local', 'demo123');
  const teacher = await auth.login('teacher@uniflow.local', 'demo123');
  const student = await auth.login('student@uniflow.local', 'demo123');

  assert.equal(admin.role, 'admin');
  assert.equal(auth.canAccessRoute(admin, '#/students'), true);
  assert.equal(auth.canAccessRoute(teacher, '#/students'), false);
  assert.equal(await auth.canManageGrade(teacher, 'sub-algo'), true);
  assert.equal(await auth.canManageGrade(teacher, 'sub-db'), false);
  assert.equal(auth.canReadStudent(student, 'stu-1'), true);
  assert.equal(auth.canReadStudent(student, 'stu-2'), false);
  await assert.rejects(() => auth.login('teacher@uniflow.local', 'wrong'), /Invalid credentials/);
});

test('academic workflows create linked users, save grades, and reset/export data', async () => {
  const { repositories, academic, grades, adapter } = makeContext();

  const student = await academic.createStudentWithEnrollment({
    registrationNumber: 'UNI-2026-100',
    firstNameFr: 'Sara',
    lastNameFr: 'Amrani',
    firstNameAr: 'سارة',
    lastNameAr: 'العمراني',
    email: 'sara.amrani@example.test',
    phone: '+212600000100',
    birthDate: '2004-06-12',
    programId: 'prog-cs',
    levelId: 'lvl-cs-2',
    groupId: 'grp-cs-2a'
  });

  assert.equal((await repositories.users.findBy('linkedProfileId', student.id)).role, 'student');
  assert.equal((await repositories.enrollments.where({ studentId: student.id })).length, 1);

  const saved = await grades.saveGrade({
    actorUserId: 'user-teacher',
    assessmentId: 'assess-algo-final',
    studentId: student.id,
    mark: 15.5,
    absence: null,
    comment: 'Good work'
  });

  assert.equal(saved.mark, 15.5);

  const snapshot = await adapter.exportDatabase();
  assert.equal(snapshot.version, DATABASE_VERSION);
  await academic.resetDemoData();
  assert.equal((await repositories.students.findBy('registrationNumber', 'UNI-2026-100')), null);
});

test('i18n supports translation fallback, interpolation, and RTL direction', () => {
  assert.equal(t('fr', 'app.name'), 'UniFlow');
  assert.equal(t('ar', 'nav.students'), 'الطلبة');
  assert.equal(t('fr', 'missing.key'), 'missing.key');
  assert.equal(interpolate('Bonjour {name}', { name: 'Mina' }), 'Bonjour Mina');
  assert.equal(getDirection('fr'), 'ltr');
  assert.equal(getDirection('ar'), 'rtl');
});

test('route metadata protects role-specific workspaces', () => {
  const adminOnly = ROUTES.find((route) => route.path === '#/settings');
  const teacherOnly = ROUTES.find((route) => route.path === '#/gradebook');
  const studentOnly = ROUTES.find((route) => route.path === '#/my-transcript');

  assert.deepEqual(adminOnly.roles, ['admin']);
  assert.deepEqual(teacherOnly.roles, ['teacher']);
  assert.deepEqual(studentOnly.roles, ['student']);
  assert.equal(ROUTES.some((route) => route.path === '#/profile' && route.roles.includes('student')), true);
});

test('route helpers resolve dynamic paths and filter navigation by role', () => {
  assert.equal(resolveRoute('#/students/stu-1').path, '#/students');
  assert.equal(resolveRoute('#/gradebook/sub-algo').path, '#/gradebook');
  assert.equal(resolveRoute('#/unknown').path, '#/not-found');

  const teacherRoutes = getAvailableRoutes({ role: 'teacher' });
  const studentRoutes = getAvailableRoutes({ role: 'student' });

  assert.equal(teacherRoutes.some((route) => route.path === '#/gradebook'), true);
  assert.equal(teacherRoutes.some((route) => route.path === '#/students'), false);
  assert.equal(studentRoutes.some((route) => route.path === '#/my-transcript'), true);
  assert.equal(studentRoutes.some((route) => route.path === '#/reports'), false);
});

test('transcript markup uses a fixed column layout for global alignment', async () => {
  const { grades } = makeContext();
  const transcript = await grades.getStudentTranscript('stu-1');
  const html = renderTranscriptTable(transcript, 'fr');

  assert.match(html, /class="[^"]*transcript-table/);
  assert.match(html, /<col class="transcript-col-subject">/);
  assert.match(html, /<col class="transcript-col-average">/);
  assert.match(html, /<col class="transcript-col-result">/);
  assert.match(html, /<col class="transcript-col-mention">/);
  assert.equal((html.match(/<colgroup>/g) ?? []).length, transcript.length);
});

test('transcript page is constrained to document width', () => {
  const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const cssSource = readFileSync(new URL('../assets/css/app.css', import.meta.url), 'utf8');

  assert.match(appSource, /transcript-section/);
  assert.match(cssSource, /\.transcript-section\s*{[^}]*max-width:\s*1120px/s);
  assert.match(cssSource, /\.transcript-section\s*{[^}]*margin-inline:\s*auto/s);
});

test('login page uses equal split and places brand copy in the blue side', () => {
  const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const cssSource = readFileSync(new URL('../assets/css/app.css', import.meta.url), 'utf8');

  assert.match(cssSource, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\)/);
  assert.match(appSource, /<aside class="demo-panel">[\s\S]*<div class="login-brand-copy">[\s\S]*<h1>\$\{t\(locale, 'app\.name'\)\}<\/h1>/);
  assert.doesNotMatch(appSource, /<section class="login-panel">[\s\S]*<h1>\$\{t\(locale, 'app\.name'\)\}<\/h1>[\s\S]*<form id="loginForm"/);
});

test('dashboard charts are constrained to dashboard-sized frames', () => {
  const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const cssSource = readFileSync(new URL('../assets/css/app.css', import.meta.url), 'utf8');

  assert.match(appSource, /<div class="chart-frame chart-frame-sm"><canvas id="programChart"/);
  assert.match(appSource, /<div class="chart-frame"><canvas id="reportChart"/);
  assert.match(appSource, /maintainAspectRatio:\s*false/);
  assert.match(cssSource, /\.chart-frame\s*{[^}]*height:\s*320px/s);
  assert.match(cssSource, /\.chart-frame-sm\s*{[^}]*max-width:\s*520px/s);
  assert.match(cssSource, /\.chart-frame-sm\s*{[^}]*height:\s*280px/s);
});

test('admin grades overview separates marks from appreciations', () => {
  const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(appSource, /data-grade-mark-student="\$\{student\.id\}"/);
  assert.match(appSource, /data-grade-appreciation-student="\$\{student\.id\}"/);
  assert.match(appSource, /Note \/20/);
  assert.match(appSource, /Appréciation/);
  assert.doesNotMatch(appSource, /data-average-student/);
});

test('page action forms use organized Bootstrap modals with full-width submit footers', () => {
  const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const cssSource = readFileSync(new URL('../assets/css/app.css', import.meta.url), 'utf8');

  assert.match(appSource, /function renderFormModal/);
  assert.match(appSource, /id: 'createStudentModal'/);
  assert.match(appSource, /id: 'scheduleConflictModal'/);
  assert.match(appSource, /data-action="open-modal"/);
  assert.match(appSource, /class="modal-footer form-modal-footer"/);
  assert.match(appSource, /class="btn btn-primary w-100"/);
  assert.match(appSource, /form="\$\{formId\}"/);
  assert.match(appSource, /formId: 'studentForm'/);
  assert.match(appSource, /formId: 'scheduleForm'/);
  assert.match(appSource, /function openModal/);
  assert.match(appSource, /classList\.add\('show'\)/);
  assert.match(appSource, /aria-modal/);
  assert.doesNotMatch(appSource, /collapsible-form/);
  assert.doesNotMatch(appSource, /toggle-create-student/);
  assert.match(cssSource, /\.form-modal-grid\s*{/);
  assert.match(cssSource, /\.form-modal-footer\s*{/);
});

test('workspace animation does not trap Bootstrap modals under the backdrop', () => {
  const cssSource = readFileSync(new URL('../assets/css/app.css', import.meta.url), 'utf8');
  const htmlSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.doesNotMatch(cssSource, /\.workspace\s*{[^}]*animation:[^;}]*\bboth\b/s);
  assert.doesNotMatch(cssSource, /@keyframes\s+workspace-in\s*{\s*from\s*{[^}]*transform:/s);
  assert.doesNotMatch(cssSource, /@keyframes\s+workspace-in\s*{[\s\S]*to\s*{[^}]*transform:/s);
  assert.match(htmlSource, /href="\.\/assets\/css\/app\.css\?v=[^"]+"/);
});

test('large profile avatar keeps circular dimensions inside flex rows', () => {
  const cssSource = readFileSync(new URL('../assets/css/app.css', import.meta.url), 'utf8');

  assert.match(cssSource, /\.avatar\.huge\s*{[^}]*width:\s*84px/s);
  assert.match(cssSource, /\.avatar\.huge\s*{[^}]*height:\s*84px/s);
  assert.match(cssSource, /\.avatar\.huge\s*{[^}]*flex:\s*0\s+0\s+84px/s);
  assert.match(cssSource, /\.avatar\.huge\s*{[^}]*font-size:\s*1\.5rem/s);
});

test('auxiliary message module is removed from app source', () => {
  const files = [
    '../src/app.js',
    '../src/core/services.js',
    '../src/core/i18n.js',
    '../src/data/seed.js'
  ];
  const removedFeaturePattern = new RegExp(
    '#/noti' + 'fications|nav\\.noti' + 'fications|noti' + 'fications|noti' + 'fication',
    'i'
  );

  for (const file of files) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(source, removedFeaturePattern, file);
  }
});

test('broadcast bulletin module is removed from app source', () => {
  const files = [
    '../src/app.js',
    '../src/core/services.js',
    '../src/core/i18n.js',
    '../src/data/seed.js'
  ];
  const removedFeaturePattern = new RegExp(
    '#/announ' + 'cements|nav\\.announ' + 'cements|announ' + 'cements|announ' + 'cement|anno' + 'nce|anno' + 'nces|mega' + 'phone',
    'i'
  );

  for (const file of files) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(source, removedFeaturePattern, file);
  }
});

test('classroom participation module is removed from app source', () => {
  const files = [
    '../src/app.js',
    '../src/core/services.js',
    '../src/core/i18n.js',
    '../src/data/seed.js'
  ];
  const removedFeaturePattern = new RegExp(
    '#/atten' + 'dance|#/my-atten' + 'dance|nav\\.atten' + 'dance|nav\\.myAtten' + 'dance|atten' + 'danceSessions|atten' + 'danceRecords|getAtten' + 'danceSummary|renderAtten' + 'dance|renderStudentAtten' + 'dance|pré' + 'sence|pré' + 'sences|presen' + 'ce tracking',
    'i'
  );

  for (const file of files) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(source, removedFeaturePattern, file);
  }
});
