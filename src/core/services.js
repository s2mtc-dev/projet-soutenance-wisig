import { createSeedDatabase } from '../data/seed.js';
import { Repository } from './repository.js';

const COLLECTIONS = [
  'users',
  'academicYears',
  'programs',
  'levels',
  'semesters',
  'modules',
  'subjects',
  'groups',
  'rooms',
  'teachers',
  'students',
  'enrollments',
  'teachingAssignments',
  'assessments',
  'grades',
  'scheduleEntries',
  'activityLogs'
];

export const ROLE_ROUTES = {
  admin: [
    '#/dashboard',
    '#/profile',
    '#/students',
    '#/teachers',
    '#/programs',
    '#/academic-structure',
    '#/enrollments',
    '#/assignments',
    '#/schedule',
    '#/grades',
    '#/reports',
    '#/users',
    '#/settings'
  ],
  teacher: ['#/dashboard', '#/profile', '#/my-courses', '#/my-groups', '#/gradebook', '#/my-schedule'],
  student: ['#/dashboard', '#/profile', '#/my-program', '#/my-grades', '#/my-transcript', '#/my-schedule']
};

function round1(value) {
  return Math.round(value * 10) / 10;
}

function minutes(time) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function overlaps(a, b) {
  return a.weekday === b.weekday && minutes(a.startTime) < minutes(b.endTime) && minutes(b.startTime) < minutes(a.endTime);
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createRepositories(adapter) {
  return Object.fromEntries(COLLECTIONS.map((collection) => [collection, new Repository(adapter, collection)]));
}

export class AuthService {
  constructor(repositories) {
    this.repositories = repositories;
  }

  async login(email, password) {
    const users = await this.repositories.users.list({ includeArchived: true });
    const user = users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return user;
  }

  canAccessRoute(user, path) {
    if (!user) {
      return path === '#/login';
    }
    const normalized = normalizePath(path);
    return ROLE_ROUTES[user.role]?.some((allowed) => normalized === allowed || normalized.startsWith(`${allowed}/`)) ?? false;
  }

  async canManageGrade(user, subjectId) {
    if (user.role === 'admin') {
      return true;
    }
    if (user.role !== 'teacher') {
      return false;
    }
    const assignments = await this.repositories.teachingAssignments.where({ teacherId: user.linkedProfileId });
    return assignments.some((assignment) => assignment.subjectId === subjectId);
  }

  canReadStudent(user, studentId) {
    return user.role === 'admin' || (user.role === 'student' && user.linkedProfileId === studentId);
  }
}

export class GradeService {
  constructor(repositories) {
    this.repositories = repositories;
  }

  getMention(average) {
    if (average >= 16) return 'Très bien';
    if (average >= 14) return 'Bien';
    if (average >= 12) return 'Assez bien';
    if (average >= 10) return 'Passable';
    return 'Ajourné';
  }

  async getSubjectAverage(studentId, subjectId) {
    const assessments = await this.repositories.assessments.where({ subjectId });
    const grades = await this.repositories.grades.where({ studentId });
    let weighted = 0;
    let totalWeight = 0;

    for (const assessment of assessments) {
      const grade = grades.find((item) => item.assessmentId === assessment.id);
      if (!grade) {
        return { average: null, publishable: false, validated: false, mention: 'Ajourné', reason: 'missing-grade' };
      }
      if (grade.absence === 'excused') {
        return { average: null, publishable: false, validated: false, mention: 'Ajourné', reason: 'excused-absence' };
      }
      const mark = grade.absence === 'unexcused' ? 0 : Number(grade.mark);
      weighted += mark * assessment.weight;
      totalWeight += assessment.weight;
    }

    if (totalWeight !== 100) {
      return { average: null, publishable: false, validated: false, mention: 'Ajourné', reason: 'weights-incomplete' };
    }

    const average = round1(weighted / totalWeight);
    return {
      average,
      publishable: true,
      validated: average >= 10,
      mention: this.getMention(average)
    };
  }

  async getModuleAverage(studentId, moduleId) {
    const subjects = await this.repositories.subjects.where({ moduleId });
    let weighted = 0;
    let totalCoefficient = 0;
    for (const subject of subjects) {
      const result = await this.getSubjectAverage(studentId, subject.id);
      if (!result.publishable) {
        continue;
      }
      weighted += result.average * subject.coefficient;
      totalCoefficient += subject.coefficient;
    }
    const average = totalCoefficient ? round1(weighted / totalCoefficient) : null;
    return {
      average,
      validated: average !== null && average >= 10,
      mention: average === null ? 'Ajourné' : this.getMention(average)
    };
  }

  async getStudentTranscript(studentId) {
    const modules = await this.repositories.modules.list();
    const rows = [];
    for (const module of modules) {
      const subjects = await this.repositories.subjects.where({ moduleId: module.id });
      const subjectRows = [];
      for (const subject of subjects) {
        subjectRows.push({
          subject,
          result: await this.getSubjectAverage(studentId, subject.id)
        });
      }
      rows.push({
        module,
        result: await this.getModuleAverage(studentId, module.id),
        subjects: subjectRows
      });
    }
    return rows;
  }

  async saveGrade({ actorUserId, assessmentId, studentId, mark, absence = null, comment = '' }) {
    if (absence === null && (Number(mark) < 0 || Number(mark) > 20 || Number.isNaN(Number(mark)))) {
      throw new Error('Mark must be between 0 and 20');
    }
    const existing = (await this.repositories.grades.where({ assessmentId })).find((grade) => grade.studentId === studentId);
    const payload = { assessmentId, studentId, mark: absence ? null : Number(mark), absence, comment, authorUserId: actorUserId };
    const saved = existing ? await this.repositories.grades.update(existing.id, payload) : await this.repositories.grades.create({ id: id('grade'), ...payload });
    return saved;
  }
}

export class ScheduleService {
  constructor(repositories) {
    this.repositories = repositories;
  }

  async validateEntry(entry) {
    const conflicts = [];
    const entries = await this.repositories.scheduleEntries.list({ includeArchived: true });
    const group = await this.repositories.groups.getById(entry.groupId);
    const room = await this.repositories.rooms.getById(entry.roomId);
    const assignments = await this.repositories.teachingAssignments.where({ teacherId: entry.teacherId });
    const assigned = assignments.some((assignment) => assignment.subjectId === entry.subjectId && assignment.groupIds.includes(entry.groupId));

    for (const current of entries.filter((item) => item.id !== entry.id && overlaps(item, entry))) {
      if (current.teacherId === entry.teacherId) conflicts.push({ type: 'teacher', entryId: current.id });
      if (current.groupId === entry.groupId) conflicts.push({ type: 'group', entryId: current.id });
      if (current.roomId === entry.roomId) conflicts.push({ type: 'room', entryId: current.id });
    }
    if (room && group && room.capacity < group.capacity) {
      conflicts.push({ type: 'capacity', roomId: room.id, groupId: group.id });
    }
    if (!assigned) {
      conflicts.push({ type: 'assignment', teacherId: entry.teacherId, subjectId: entry.subjectId });
    }
    return { valid: conflicts.length === 0, conflicts };
  }
}

export class AcademicService {
  constructor(repositories, adapter) {
    this.repositories = repositories;
    this.adapter = adapter;
  }

  async createStudentWithEnrollment(input) {
    if (await this.repositories.students.findBy('registrationNumber', input.registrationNumber)) {
      throw new Error('Registration number already exists');
    }
    if (await this.repositories.users.findBy('email', input.email)) {
      throw new Error('Email already exists');
    }
    const student = await this.repositories.students.create({
      id: id('stu'),
      ...input,
      status: 'active'
    });
    await this.repositories.users.create({
      id: id('user'),
      displayName: `${input.firstNameFr} ${input.lastNameFr}`,
      email: input.email,
      password: 'demo123',
      role: 'student',
      linkedProfileId: student.id,
      locale: 'fr',
      avatar: `${input.firstNameFr[0] ?? 'E'}${input.lastNameFr[0] ?? 'T'}`
    });
    await this.repositories.enrollments.create({
      id: id('enr'),
      studentId: student.id,
      academicYearId: 'year-2025',
      programId: input.programId,
      levelId: input.levelId,
      groupId: input.groupId,
      status: 'active'
    });
    await this.repositories.activityLogs.create({
      id: id('log'),
      actorUserId: 'user-admin',
      action: 'student:created',
      entityType: 'student',
      entityId: student.id,
      summary: `Student ${student.registrationNumber} created`,
      timestamp: new Date().toISOString()
    });
    return student;
  }

  async resetDemoData() {
    await this.adapter.replaceDatabase(createSeedDatabase());
  }

  async exportCsv(collectionName) {
    const rows = await this.repositories[collectionName].list({ includeArchived: true });
    if (!rows.length) {
      return '';
    }
    const headers = Object.keys(rows[0]);
    const body = rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? '')).join(','));
    return [headers.join(','), ...body].join('\n');
  }
}

export function normalizePath(path) {
  const withoutQuery = (path || '#/dashboard').split('?')[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  if (segments.length > 2 && ['students', 'teachers', 'gradebook'].includes(segments[1])) {
    return `#/${segments[1]}`;
  }
  return withoutQuery;
}
