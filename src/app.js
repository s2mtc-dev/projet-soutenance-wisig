'use strict';

// Data model and mock data
const DATABASE_VERSION = 3;

const DATABASE_TABLES = {
  users: ['id', 'displayName', 'email', 'password', 'role', 'linkedProfileId', 'locale', 'avatar', 'status', 'createdAt', 'updatedAt'],
  filieres: ['id', 'code', 'nameFr', 'nameAr', 'department', 'degreeType', 'durationSemesters', 'status', 'createdAt', 'updatedAt'],
  semesters: ['id', 'filiereId', 'code', 'labelFr', 'labelAr', 'order', 'startDate', 'endDate', 'status', 'createdAt', 'updatedAt'],
  subjects: ['id', 'filiereId', 'semesterId', 'code', 'nameFr', 'nameAr', 'coefficient', 'hours', 'status', 'createdAt', 'updatedAt'],
  teachers: ['id', 'employeeNumber', 'firstNameFr', 'lastNameFr', 'firstNameAr', 'lastNameAr', 'email', 'phone', 'speciality', 'rank', 'status', 'createdAt', 'updatedAt'],
  teacherAssignments: ['id', 'teacherId', 'filiereId', 'semesterId', 'subjectId', 'academicYear', 'status', 'createdAt', 'updatedAt'],
  students: ['id', 'registrationNumber', 'firstNameFr', 'lastNameFr', 'firstNameAr', 'lastNameAr', 'email', 'phone', 'birthDate', 'filiereId', 'currentSemesterId', 'status', 'createdAt', 'updatedAt'],
  timetableEntries: ['id', 'filiereId', 'semesterId', 'subjectId', 'teacherId', 'weekday', 'startTime', 'endTime', 'status', 'createdAt', 'updatedAt'],
  grades: ['id', 'studentId', 'subjectId', 'semesterId', 'teacherId', 'mark', 'appreciation', 'published', 'gradedAt', 'status', 'createdAt', 'updatedAt'],
  activityLogs: ['id', 'actorUserId', 'action', 'entityType', 'entityId', 'summary', 'timestamp', 'status', 'createdAt', 'updatedAt']
};

const now = '2026-07-21T09:00:00.000Z';

function stamp(record) {
  return {
    createdAt: now,
    updatedAt: now,
    status: record.status ?? 'active',
    ...record
  };
}

function createSeedDatabase() {
  return structuredClone({
    version: DATABASE_VERSION,
    migratedAt: now,
    users: [
      stamp({ id: 'user-admin', displayName: 'Admin UniFlow', email: 'admin@uniflow.local', password: 'demo123', role: 'admin', linkedProfileId: null, locale: 'fr', avatar: 'AU' }),
      stamp({ id: 'user-teacher', displayName: 'Pr. Youssef Alaoui', email: 'teacher@uniflow.local', password: 'demo123', role: 'teacher', linkedProfileId: 'teach-1', locale: 'fr', avatar: 'YA' }),
      stamp({ id: 'user-student', displayName: 'Mina El Fassi', email: 'student@uniflow.local', password: 'demo123', role: 'student', linkedProfileId: 'stu-1', locale: 'fr', avatar: 'ME' })
    ],
    filieres: [
      stamp({ id: 'fil-gi', code: 'GI', nameFr: 'Génie Informatique', nameAr: 'هندسة المعلوميات', department: 'Sciences et Techniques', degreeType: 'Licence', durationSemesters: 6 }),
      stamp({ id: 'fil-ma', code: 'MA', nameFr: 'Mathématiques Appliquées', nameAr: 'الرياضيات التطبيقية', department: 'Sciences', degreeType: 'Licence', durationSemesters: 6 })
    ],
    semesters: [
      stamp({ id: 'sem-gi-s3', filiereId: 'fil-gi', code: 'S3', labelFr: 'Semestre 3', labelAr: 'السداسي 3', order: 3, startDate: '2025-09-15', endDate: '2026-01-31' }),
      stamp({ id: 'sem-gi-s4', filiereId: 'fil-gi', code: 'S4', labelFr: 'Semestre 4', labelAr: 'السداسي 4', order: 4, startDate: '2026-02-10', endDate: '2026-07-15' }),
      stamp({ id: 'sem-ma-s3', filiereId: 'fil-ma', code: 'S3', labelFr: 'Semestre 3', labelAr: 'السداسي 3', order: 3, startDate: '2025-09-15', endDate: '2026-01-31' })
    ],
    subjects: [
      stamp({ id: 'sub-algo', filiereId: 'fil-gi', semesterId: 'sem-gi-s3', code: 'ALG301', nameFr: 'Algorithmique avancée', nameAr: 'الخوارزميات المتقدمة', coefficient: 2, hours: 48 }),
      stamp({ id: 'sub-arch', filiereId: 'fil-gi', semesterId: 'sem-gi-s3', code: 'ARC301', nameFr: 'Architecture des ordinateurs', nameAr: 'معمارية الحاسوب', coefficient: 1, hours: 36 }),
      stamp({ id: 'sub-db', filiereId: 'fil-gi', semesterId: 'sem-gi-s3', code: 'BD302', nameFr: 'Bases de données', nameAr: 'قواعد البيانات', coefficient: 2, hours: 48 }),
      stamp({ id: 'sub-os', filiereId: 'fil-gi', semesterId: 'sem-gi-s3', code: 'SYS302', nameFr: 'Systèmes d’exploitation', nameAr: 'أنظمة التشغيل', coefficient: 1, hours: 36 }),
      stamp({ id: 'sub-web', filiereId: 'fil-gi', semesterId: 'sem-gi-s4', code: 'WEB401', nameFr: 'Applications web', nameAr: 'تطبيقات الويب', coefficient: 2, hours: 50 }),
      stamp({ id: 'sub-analysis', filiereId: 'fil-ma', semesterId: 'sem-ma-s3', code: 'ANA301', nameFr: 'Analyse numérique', nameAr: 'التحليل العددي', coefficient: 2, hours: 48 })
    ],
    teachers: [
      stamp({ id: 'teach-1', employeeNumber: 'ENS-001', firstNameFr: 'Youssef', lastNameFr: 'Alaoui', firstNameAr: 'يوسف', lastNameAr: 'العلوي', email: 'youssef.alaoui@univ.test', phone: '+212600001001', speciality: 'Algorithmique', rank: 'Professeur' }),
      stamp({ id: 'teach-2', employeeNumber: 'ENS-002', firstNameFr: 'Hajar', lastNameFr: 'Benali', firstNameAr: 'هاجر', lastNameAr: 'بن علي', email: 'hajar.benali@univ.test', phone: '+212600001002', speciality: 'Bases de données', rank: 'Maître de conférences' }),
      stamp({ id: 'teach-3', employeeNumber: 'ENS-003', firstNameFr: 'Karim', lastNameFr: 'Mansouri', firstNameAr: 'كريم', lastNameAr: 'منصوري', email: 'karim.mansouri@univ.test', phone: '+212600001003', speciality: 'Web', rank: 'Professeur assistant' }),
      stamp({ id: 'teach-4', employeeNumber: 'ENS-004', firstNameFr: 'Salma', lastNameFr: 'Naciri', firstNameAr: 'سلمى', lastNameAr: 'ناصري', email: 'salma.naciri@univ.test', phone: '+212600001004', speciality: 'Mathématiques', rank: 'Vacataire' })
    ],
    teacherAssignments: [
      stamp({ id: 'assign-1', teacherId: 'teach-1', filiereId: 'fil-gi', semesterId: 'sem-gi-s3', subjectId: 'sub-algo', academicYear: '2025-2026' }),
      stamp({ id: 'assign-2', teacherId: 'teach-1', filiereId: 'fil-gi', semesterId: 'sem-gi-s3', subjectId: 'sub-arch', academicYear: '2025-2026' }),
      stamp({ id: 'assign-3', teacherId: 'teach-2', filiereId: 'fil-gi', semesterId: 'sem-gi-s3', subjectId: 'sub-db', academicYear: '2025-2026' }),
      stamp({ id: 'assign-4', teacherId: 'teach-3', filiereId: 'fil-gi', semesterId: 'sem-gi-s4', subjectId: 'sub-web', academicYear: '2025-2026' }),
      stamp({ id: 'assign-5', teacherId: 'teach-4', filiereId: 'fil-gi', semesterId: 'sem-gi-s3', subjectId: 'sub-os', academicYear: '2025-2026' }),
      stamp({ id: 'assign-6', teacherId: 'teach-4', filiereId: 'fil-ma', semesterId: 'sem-ma-s3', subjectId: 'sub-analysis', academicYear: '2025-2026' })
    ],
    students: [
      stamp({ id: 'stu-1', registrationNumber: 'UNI-2025-001', firstNameFr: 'Mina', lastNameFr: 'El Fassi', firstNameAr: 'مينا', lastNameAr: 'الفاسي', email: 'mina.elfassi@etu.test', phone: '+212600002001', birthDate: '2004-01-09', filiereId: 'fil-gi', currentSemesterId: 'sem-gi-s3' }),
      stamp({ id: 'stu-2', registrationNumber: 'UNI-2025-002', firstNameFr: 'Omar', lastNameFr: 'Tazi', firstNameAr: 'عمر', lastNameAr: 'التازي', email: 'omar.tazi@etu.test', phone: '+212600002002', birthDate: '2003-11-14', filiereId: 'fil-gi', currentSemesterId: 'sem-gi-s3' }),
      stamp({ id: 'stu-3', registrationNumber: 'UNI-2025-003', firstNameFr: 'Lina', lastNameFr: 'Berrada', firstNameAr: 'لينا', lastNameAr: 'برادة', email: 'lina.berrada@etu.test', phone: '+212600002003', birthDate: '2004-03-22', filiereId: 'fil-gi', currentSemesterId: 'sem-gi-s4' }),
      stamp({ id: 'stu-4', registrationNumber: 'UNI-2025-004', firstNameFr: 'Adam', lastNameFr: 'Harti', firstNameAr: 'آدم', lastNameAr: 'حارثي', email: 'adam.harti@etu.test', phone: '+212600002004', birthDate: '2003-07-30', filiereId: 'fil-gi', currentSemesterId: 'sem-gi-s3' }),
      stamp({ id: 'stu-5', registrationNumber: 'UNI-2025-005', firstNameFr: 'Nour', lastNameFr: 'Ziani', firstNameAr: 'نور', lastNameAr: 'زياني', email: 'nour.ziani@etu.test', phone: '+212600002005', birthDate: '2004-04-10', filiereId: 'fil-gi', currentSemesterId: 'sem-gi-s3' }),
      stamp({ id: 'stu-6', registrationNumber: 'UNI-2025-006', firstNameFr: 'Samir', lastNameFr: 'Idrissi', firstNameAr: 'سمير', lastNameAr: 'الإدريسي', email: 'samir.idrissi@etu.test', phone: '+212600002006', birthDate: '2003-12-03', filiereId: 'fil-ma', currentSemesterId: 'sem-ma-s3' })
    ],
    timetableEntries: [
      stamp({ id: 'time-1', filiereId: 'fil-gi', semesterId: 'sem-gi-s3', subjectId: 'sub-algo', teacherId: 'teach-1', weekday: 1, startTime: '09:00', endTime: '11:00' }),
      stamp({ id: 'time-2', filiereId: 'fil-gi', semesterId: 'sem-gi-s3', subjectId: 'sub-db', teacherId: 'teach-2', weekday: 2, startTime: '10:00', endTime: '12:00' }),
      stamp({ id: 'time-3', filiereId: 'fil-gi', semesterId: 'sem-gi-s3', subjectId: 'sub-os', teacherId: 'teach-4', weekday: 3, startTime: '08:30', endTime: '10:30' }),
      stamp({ id: 'time-4', filiereId: 'fil-gi', semesterId: 'sem-gi-s3', subjectId: 'sub-arch', teacherId: 'teach-1', weekday: 4, startTime: '14:00', endTime: '16:00' }),
      stamp({ id: 'time-5', filiereId: 'fil-gi', semesterId: 'sem-gi-s4', subjectId: 'sub-web', teacherId: 'teach-3', weekday: 2, startTime: '14:00', endTime: '16:00' }),
      stamp({ id: 'time-6', filiereId: 'fil-ma', semesterId: 'sem-ma-s3', subjectId: 'sub-analysis', teacherId: 'teach-4', weekday: 1, startTime: '09:00', endTime: '11:00' })
    ],
    grades: [
      stamp({ id: 'grade-1', studentId: 'stu-1', subjectId: 'sub-algo', semesterId: 'sem-gi-s3', teacherId: 'teach-1', mark: 14.9, appreciation: 'Bien', published: true, gradedAt: '2026-01-20T09:00:00.000Z' }),
      stamp({ id: 'grade-2', studentId: 'stu-1', subjectId: 'sub-db', semesterId: 'sem-gi-s3', teacherId: 'teach-2', mark: 16, appreciation: 'Très bien', published: true, gradedAt: '2026-01-22T09:00:00.000Z' }),
      stamp({ id: 'grade-3', studentId: 'stu-2', subjectId: 'sub-algo', semesterId: 'sem-gi-s3', teacherId: 'teach-1', mark: 11.9, appreciation: 'Passable', published: true, gradedAt: '2026-01-20T10:00:00.000Z' }),
      stamp({ id: 'grade-4', studentId: 'stu-5', subjectId: 'sub-algo', semesterId: 'sem-gi-s3', teacherId: 'teach-1', mark: 4.8, appreciation: 'Insuffisant', published: true, gradedAt: '2026-01-20T11:00:00.000Z' })
    ],
    activityLogs: [
      stamp({ id: 'log-1', actorUserId: 'user-admin', action: 'seeded', entityType: 'database', entityId: 'demo', summary: 'Base relationnelle de démonstration initialisée', timestamp: now })
    ]
  });
}


// Local repository abstraction
class Repository {
  constructor(adapter, collectionName) {
    this.adapter = adapter;
    this.collectionName = collectionName;
  }

  async list({ includeArchived = false } = {}) {
    const records = await this.adapter.getCollection(this.collectionName);
    return includeArchived ? records : records.filter((record) => record.status !== 'archived');
  }

  async getById(id) {
    return this.adapter.getById(this.collectionName, id);
  }

  async create(record) {
    return this.adapter.create(this.collectionName, record);
  }

  async update(id, changes) {
    return this.adapter.update(this.collectionName, id, changes);
  }

  async archive(id) {
    return this.update(id, { status: 'archived' });
  }

  async remove(id) {
    return this.adapter.remove(this.collectionName, id);
  }

  async where(criteria = {}) {
    const entries = Object.entries(criteria);
    const records = await this.list({ includeArchived: true });
    return records.filter((record) => entries.every(([key, value]) => record[key] === value));
  }

  async findBy(key, value) {
    const records = await this.where({ [key]: value });
    return records[0] ?? null;
  }
}


// Storage adapters

function clone(value) {
  return structuredClone(value);
}

function ensureArray(snapshot, collection) {
  if (!Array.isArray(snapshot[collection])) {
    throw new Error(`Invalid collection: ${collection}`);
  }
}

class MemoryStorageAdapter {
  constructor(initialDatabase = createSeedDatabase()) {
    this.database = clone(initialDatabase);
    this.counter = 1;
  }

  async initialize() {
    if (!this.database || this.database.version !== DATABASE_VERSION) {
      this.database = createSeedDatabase();
    }
    return clone(this.database);
  }

  async getCollection(name) {
    await this.initialize();
    ensureArray(this.database, name);
    return clone(this.database[name]);
  }

  async getById(collection, id) {
    const items = await this.getCollection(collection);
    return items.find((item) => item.id === id) ?? null;
  }

  async create(collection, record) {
    await this.initialize();
    ensureArray(this.database, collection);
    const timestamp = new Date().toISOString();
    const created = {
      id: record.id ?? `id-${Date.now()}-${this.counter++}`,
      createdAt: record.createdAt ?? timestamp,
      updatedAt: timestamp,
      status: record.status ?? 'active',
      ...clone(record)
    };
    this.database[collection].push(created);
    return clone(created);
  }

  async update(collection, id, changes) {
    await this.initialize();
    ensureArray(this.database, collection);
    const index = this.database[collection].findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Record not found: ${collection}/${id}`);
    }
    const updated = {
      ...this.database[collection][index],
      ...clone(changes),
      id,
      updatedAt: new Date().toISOString()
    };
    this.database[collection][index] = updated;
    return clone(updated);
  }

  async remove(collection, id) {
    await this.initialize();
    ensureArray(this.database, collection);
    const before = this.database[collection].length;
    this.database[collection] = this.database[collection].filter((item) => item.id !== id);
    return before !== this.database[collection].length;
  }

  async replaceDatabase(snapshot) {
    if (!snapshot || snapshot.version !== DATABASE_VERSION) {
      throw new Error('Invalid database version');
    }
    for (const collection of Object.keys(createSeedDatabase())) {
      if (collection !== 'version' && collection !== 'migratedAt') {
        ensureArray(snapshot, collection);
      }
    }
    this.database = clone(snapshot);
    return clone(this.database);
  }

  async exportDatabase() {
    await this.initialize();
    return clone(this.database);
  }

  async clear() {
    this.database = createSeedDatabase();
    return clone(this.database);
  }
}

class LocalStorageAdapter extends MemoryStorageAdapter {
  constructor({ key = 'uniflow.database', seedFactory = createSeedDatabase } = {}) {
    super(seedFactory());
    this.key = key;
    this.seedFactory = seedFactory;
  }

  readRaw() {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.key);
  }

  writeRaw(snapshot) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.key, JSON.stringify(snapshot));
    }
  }

  async initialize() {
    const raw = this.readRaw();
    if (!raw) {
      this.database = this.seedFactory();
      this.writeRaw(this.database);
      return clone(this.database);
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed.version !== DATABASE_VERSION) {
        this.database = this.seedFactory();
        this.writeRaw(this.database);
      } else {
        this.database = parsed;
      }
    } catch {
      this.database = this.seedFactory();
      this.writeRaw(this.database);
    }
    return clone(this.database);
  }

  async create(collection, record) {
    const result = await super.create(collection, record);
    this.writeRaw(this.database);
    return result;
  }

  async update(collection, id, changes) {
    const result = await super.update(collection, id, changes);
    this.writeRaw(this.database);
    return result;
  }

  async remove(collection, id) {
    const result = await super.remove(collection, id);
    this.writeRaw(this.database);
    return result;
  }

  async replaceDatabase(snapshot) {
    const result = await super.replaceDatabase(snapshot);
    this.writeRaw(this.database);
    return result;
  }

  async clear() {
    this.database = this.seedFactory();
    this.writeRaw(this.database);
    return clone(this.database);
  }
}


// French and Arabic labels
const dictionaries = {
  fr: {
    'app.name': 'UniFlow',
    'app.subtitle': 'Gestion universitaire',
    'actions.add': 'Ajouter',
    'actions.archive': 'Archiver',
    'actions.cancel': 'Annuler',
    'actions.export': 'Exporter',
    'actions.import': 'Importer',
    'actions.login': 'Se connecter',
    'actions.logout': 'Déconnexion',
    'actions.print': 'Imprimer',
    'actions.reset': 'Réinitialiser',
    'actions.save': 'Enregistrer',
    'actions.search': 'Rechercher',
    'auth.demo': 'Comptes de démonstration',
    'auth.password': 'Mot de passe',
    'auth.signin': 'Connexion',
    'dashboard.title': 'Tableau de bord',
    'fields.email': 'Email',
    'fields.role': 'Rôle',
    'forms.required': 'Ce champ est obligatoire.',
    'nav.dashboard': 'Tableau de bord',
    'nav.school': 'École',
    'nav.timetable': 'Emploi du temps',
    'nav.gradebook': 'Carnet de notes',
    'nav.grades': 'Notes',
    'nav.mySubjects': 'Mes matières',
    'nav.myGrades': 'Mes notes',
    'nav.myFiliere': 'Ma filière',
    'nav.mySchedule': 'Mon emploi du temps',
    'nav.myTranscript': 'Relevé',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    'nav.students': 'Étudiants',
    'nav.teachers': 'Enseignants',
    'nav.users': 'Utilisateurs',
    'roles.admin': 'Administrateur',
    'roles.student': 'Étudiant',
    'roles.teacher': 'Enseignant',
    'status.active': 'Actif',
    'status.archived': 'Archivé',
    'status.validated': 'Validé',
    'status.failed': 'Ajourné',
    'toast.saved': 'Données enregistrées.',
    'validation.invalidCredentials': 'Identifiants invalides'
  },
  ar: {
    'app.name': 'UniFlow',
    'app.subtitle': 'تدبير جامعي',
    'actions.add': 'إضافة',
    'actions.archive': 'أرشفة',
    'actions.cancel': 'إلغاء',
    'actions.export': 'تصدير',
    'actions.import': 'استيراد',
    'actions.login': 'تسجيل الدخول',
    'actions.logout': 'خروج',
    'actions.print': 'طباعة',
    'actions.reset': 'إعادة الضبط',
    'actions.save': 'حفظ',
    'actions.search': 'بحث',
    'auth.demo': 'حسابات تجريبية',
    'auth.password': 'كلمة المرور',
    'auth.signin': 'تسجيل الدخول',
    'dashboard.title': 'لوحة القيادة',
    'fields.email': 'البريد الإلكتروني',
    'fields.role': 'الدور',
    'forms.required': 'هذا الحقل إجباري.',
    'nav.dashboard': 'لوحة القيادة',
    'nav.school': 'المدرسة',
    'nav.timetable': 'استعمال الزمن',
    'nav.gradebook': 'دفتر النقط',
    'nav.grades': 'النقط',
    'nav.mySubjects': 'موادي',
    'nav.myGrades': 'نقطي',
    'nav.myFiliere': 'مسلكي',
    'nav.mySchedule': 'جدولي',
    'nav.myTranscript': 'كشف النقط',
    'nav.profile': 'الملف',
    'nav.settings': 'الإعدادات',
    'nav.students': 'الطلبة',
    'nav.teachers': 'الأساتذة',
    'nav.users': 'المستخدمون',
    'roles.admin': 'مسؤول',
    'roles.student': 'طالب',
    'roles.teacher': 'أستاذ',
    'status.active': 'نشط',
    'status.archived': 'مؤرشف',
    'status.validated': 'مستوفى',
    'status.failed': 'غير مستوفى',
    'toast.saved': 'تم حفظ البيانات.',
    'validation.invalidCredentials': 'بيانات الدخول غير صحيحة'
  }
};

function interpolate(template, params = {}) {
  return Object.entries(params).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function t(locale, key, params = {}) {
  const dictionary = dictionaries[locale] ?? dictionaries.fr;
  return interpolate(dictionary[key] ?? dictionaries.fr[key] ?? key, params);
}

function getDirection(locale) {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

function formatNumber(locale, value, options = {}) {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-MA' : 'fr-MA', options).format(value);
}

function formatDate(locale, value) {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA' : 'fr-MA', { dateStyle: 'medium' }).format(new Date(value));
}


// Application services

const COLLECTIONS = Object.keys(DATABASE_TABLES);

const ROLE_ROUTES = {
  admin: ['#/dashboard', '#/profile', '#/students', '#/teachers', '#/school', '#/timetable', '#/grades', '#/users', '#/settings'],
  teacher: ['#/dashboard', '#/profile', '#/my-subjects', '#/gradebook', '#/my-schedule'],
  student: ['#/dashboard', '#/profile', '#/my-filiere', '#/my-schedule', '#/my-grades', '#/my-transcript']
};

function round1(value) {
  return Math.round(value * 10) / 10;
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sameContext(record, subjectId, semesterId) {
  return record.subjectId === subjectId && record.semesterId === semesterId;
}

function createRepositories(adapter) {
  return Object.fromEntries(COLLECTIONS.map((collection) => [collection, new Repository(adapter, collection)]));
}

class AuthService {
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

  async canManageGrade(user, subjectId, semesterId) {
    if (user.role === 'admin') {
      return true;
    }
    if (user.role !== 'teacher') {
      return false;
    }
    const assignments = await this.repositories.teacherAssignments.where({ teacherId: user.linkedProfileId });
    return assignments.some((assignment) => sameContext(assignment, subjectId, semesterId));
  }

  canReadStudent(user, studentId) {
    return user.role === 'admin' || (user.role === 'student' && user.linkedProfileId === studentId);
  }
}

class ScheduleService {
  constructor(repositories) {
    this.repositories = repositories;
  }

  async getTeacherAssignments(teacherId) {
    const [assignments, teachers, filieres, semesters, subjects] = await Promise.all([
      this.repositories.teacherAssignments.where({ teacherId }),
      this.repositories.teachers.list(),
      this.repositories.filieres.list(),
      this.repositories.semesters.list(),
      this.repositories.subjects.list()
    ]);

    return assignments.map((assignment) => ({
      assignment,
      teacher: teachers.find((teacher) => teacher.id === assignment.teacherId),
      filiere: filieres.find((filiere) => filiere.id === assignment.filiereId),
      semester: semesters.find((semester) => semester.id === assignment.semesterId),
      subject: subjects.find((subject) => subject.id === assignment.subjectId)
    }));
  }

  async getStudentTimetable(studentId) {
    const student = await this.repositories.students.getById(studentId);
    if (!student) {
      return [];
    }
    return this.getTimetable({
      filiereId: student.filiereId,
      semesterId: student.currentSemesterId
    });
  }

  async getTeacherTimetable(teacherId) {
    return this.getTimetable({ teacherId });
  }

  async getTimetable(criteria = {}) {
    const [entries, filieres, semesters, subjects, teachers] = await Promise.all([
      this.repositories.timetableEntries.list(),
      this.repositories.filieres.list(),
      this.repositories.semesters.list(),
      this.repositories.subjects.list(),
      this.repositories.teachers.list()
    ]);

    return entries
      .filter((entry) => Object.entries(criteria).every(([key, value]) => !value || entry[key] === value))
      .map((entry) => ({
        entry,
        filiere: filieres.find((filiere) => filiere.id === entry.filiereId),
        semester: semesters.find((semester) => semester.id === entry.semesterId),
        subject: subjects.find((subject) => subject.id === entry.subjectId),
        teacher: teachers.find((teacher) => teacher.id === entry.teacherId)
      }))
      .sort((a, b) => a.entry.weekday - b.entry.weekday || a.entry.startTime.localeCompare(b.entry.startTime));
  }
}

class GradeService {
  constructor(repositories) {
    this.repositories = repositories;
  }

  getMention(mark) {
    if (mark >= 16) return 'Très bien';
    if (mark >= 14) return 'Bien';
    if (mark >= 12) return 'Assez bien';
    if (mark >= 10) return 'Passable';
    return 'Ajourné';
  }

  async getStudentTranscript(studentId) {
    const [student, subjects, semesters, grades, teachers, assignments] = await Promise.all([
      this.repositories.students.getById(studentId),
      this.repositories.subjects.list(),
      this.repositories.semesters.list(),
      this.repositories.grades.where({ studentId }),
      this.repositories.teachers.list(),
      this.repositories.teacherAssignments.list()
    ]);
    if (!student) {
      return [];
    }

    return subjects
      .filter((subject) => subject.filiereId === student.filiereId && subject.semesterId === student.currentSemesterId)
      .map((subject) => {
        const assignment = assignments.find((item) => sameContext(item, subject.id, subject.semesterId));
        const grade = grades.find((item) => sameContext(item, subject.id, subject.semesterId));
        const mark = grade?.published ? grade.mark : null;
        return {
          subject,
          semester: semesters.find((semester) => semester.id === subject.semesterId),
          teacher: teachers.find((teacher) => teacher.id === assignment?.teacherId),
          grade: grade ?? null,
          mark,
          appreciation: grade?.published ? grade.appreciation : 'En attente',
          mention: mark === null ? 'En attente' : this.getMention(mark),
          validated: mark !== null && mark >= 10
        };
      });
  }

  async getStudentAverage(studentId) {
    const transcript = await this.getStudentTranscript(studentId);
    const published = transcript.filter((row) => row.mark !== null);
    if (!published.length) {
      return null;
    }
    const weighted = published.reduce((sum, row) => sum + row.mark * row.subject.coefficient, 0);
    const coefficients = published.reduce((sum, row) => sum + row.subject.coefficient, 0);
    return round1(weighted / coefficients);
  }

  async saveGrade({ actorUserId, studentId, subjectId, semesterId, mark, appreciation = '' }) {
    const numericMark = Number(mark);
    if (Number.isNaN(numericMark) || numericMark < 0 || numericMark > 20) {
      throw new Error('Mark must be between 0 and 20');
    }

    const [actor, student, subject, assignments] = await Promise.all([
      this.repositories.users.getById(actorUserId),
      this.repositories.students.getById(studentId),
      this.repositories.subjects.getById(subjectId),
      this.repositories.teacherAssignments.where({ subjectId })
    ]);

    if (!actor) {
      throw new Error('Actor not found');
    }
    if (!student || !subject || student.filiereId !== subject.filiereId || student.currentSemesterId !== semesterId || subject.semesterId !== semesterId) {
      throw new Error('Student is not enrolled in this subject context');
    }

    const assignment = assignments.find((item) => sameContext(item, subjectId, semesterId));
    if (!assignment) {
      throw new Error('Subject has no assigned teacher');
    }
    if (actor.role === 'teacher' && assignment.teacherId !== actor.linkedProfileId) {
      throw new Error('Teacher is not assigned to this subject');
    }
    if (!['admin', 'teacher'].includes(actor.role)) {
      throw new Error('Only teachers and admins can save grades');
    }

    const existing = (await this.repositories.grades.where({ studentId })).find((grade) => sameContext(grade, subjectId, semesterId));
    const payload = {
      studentId,
      subjectId,
      semesterId,
      teacherId: assignment.teacherId,
      mark: numericMark,
      appreciation,
      published: true,
      gradedAt: new Date().toISOString()
    };

    return existing
      ? this.repositories.grades.update(existing.id, payload)
      : this.repositories.grades.create({ id: id('grade'), ...payload });
  }
}

class AcademicService {
  constructor(repositories, adapter) {
    this.repositories = repositories;
    this.adapter = adapter;
  }

  async createStudent(input) {
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

function normalizePath(path) {
  const withoutQuery = (path || '#/dashboard').split('?')[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  if (segments.length > 2 && ['gradebook'].includes(segments[1])) {
    return `#/${segments[1]}`;
  }
  return withoutQuery;
}


// UI and app bootstrap

const ROUTES = [
  { path: '#/login', labelKey: 'auth.signin', roles: ['guest'] },
  { path: '#/dashboard', labelKey: 'nav.dashboard', roles: ['admin', 'teacher', 'student'] },
  { path: '#/profile', labelKey: 'nav.profile', roles: ['admin', 'teacher', 'student'] },
  { path: '#/students', labelKey: 'nav.students', roles: ['admin'] },
  { path: '#/teachers', labelKey: 'nav.teachers', roles: ['admin'] },
  { path: '#/school', labelKey: 'nav.school', roles: ['admin'] },
  { path: '#/timetable', labelKey: 'nav.timetable', roles: ['admin'] },
  { path: '#/grades', labelKey: 'nav.grades', roles: ['admin'] },
  { path: '#/users', labelKey: 'nav.users', roles: ['admin'] },
  { path: '#/settings', labelKey: 'nav.settings', roles: ['admin'] },
  { path: '#/my-subjects', labelKey: 'nav.mySubjects', roles: ['teacher'] },
  { path: '#/gradebook', labelKey: 'nav.gradebook', roles: ['teacher'] },
  { path: '#/my-filiere', labelKey: 'nav.myFiliere', roles: ['student'] },
  { path: '#/my-schedule', labelKey: 'nav.mySchedule', roles: ['teacher', 'student'] },
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

function resolveRoute(path = DEFAULT_ROUTE) {
  const normalized = normalizePath(path);
  return ROUTES.find((route) => route.path === normalized) ?? ROUTES.find((route) => route.path === '#/not-found');
}

function getAvailableRoutes(user) {
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
  return locale === 'ar' ? record[`${prefix}Ar`] || record[`${prefix}Fr`] || record.labelAr || record.labelFr || record.code : record[`${prefix}Fr`] || record[`${prefix}Ar`] || record.labelFr || record.labelAr || record.code;
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
    '#/school': 'diagram-3',
    '#/timetable': 'calendar-week',
    '#/grades': 'journal-check',
    '#/users': 'people',
    '#/settings': 'gear',
    '#/my-subjects': 'book',
    '#/gradebook': 'table',
    '#/my-schedule': 'calendar3',
    '#/my-filiere': 'diagram-2',
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
  return `<span class="badge rounded-pill text-bg-${tone}">${escapeHtml(text)}</span>`;
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
  const entries = await Promise.all(
    Object.entries(appState.repositories).map(async ([name, repo]) => [name, await repo.list({ includeArchived: true })])
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
    ['admin@uniflow.local', 'Administrateur', 'AD'],
    ['teacher@uniflow.local', 'Enseignant', 'TE'],
    ['student@uniflow.local', 'Étudiant', 'ST']
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
          <p>${locale === 'ar' ? 'واجهة جامعية محلية بثلاثة أدوار ونموذج بيانات بسيط.' : 'Application locale de gestion universitaire avec trois rôles et modèle de données relationnel simple.'}</p>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2>${t(locale, 'auth.demo')}</h2>
          <button class="btn btn-outline-light btn-sm" data-action="toggle-locale">${locale === 'ar' ? 'FR' : 'AR'}</button>
        </div>
        <div class="demo-list">
          ${accounts.map(([email, role, initials]) => `
            <button class="demo-account" data-demo-email="${email}">
              <span class="avatar">${initials}</span>
              <span><strong>${role}</strong><small>${email} / demo123</small></span>
            </button>`).join('')}
        </div>
      </aside>
    </main>`;
}

function renderShell(content) {
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
    const gradedStudents = new Set(data.grades.map((grade) => grade.studentId)).size;
    const successRate = gradedStudents ? Math.round((new Set(data.grades.filter((grade) => grade.mark >= 10).map((grade) => grade.studentId)).size / gradedStudents) * 100) : 0;
    return `
      <div class="metric-grid">
        ${metric(locale === 'ar' ? 'الطلبة' : 'Étudiants', data.students.length, '2025-2026', 'mortarboard')}
        ${metric(locale === 'ar' ? 'الأساتذة' : 'Enseignants', data.teachers.length, locale === 'ar' ? 'مكلفون' : 'affectés', 'person-workspace')}
        ${metric(locale === 'ar' ? 'المسالك' : 'Filières', data.filieres.length, locale === 'ar' ? 'مفتوحة' : 'ouvertes', 'diagram-3')}
        ${metric(locale === 'ar' ? 'نسبة النجاح' : 'Taux de réussite', `${successRate}%`, locale === 'ar' ? 'نقط منشورة' : 'notes publiées', 'graph-up')}
      </div>
      ${section(locale === 'ar' ? 'توزيع الطلبة حسب المسلك' : 'Répartition des étudiants par filière', '<div class="chart-frame chart-frame-sm"><canvas id="filiereChart"></canvas></div>')}
      ${section(locale === 'ar' ? 'النشاط الأخير' : 'Activité récente', renderActivity(data.activityLogs, locale))}`;
  }
  if (user.role === 'teacher') {
    const teacher = byId(data.teachers, user.linkedProfileId);
    const assignments = await appState.schedule.getTeacherAssignments(teacher.id);
    const timetable = await appState.schedule.getTeacherTimetable(teacher.id);
    const studentCount = new Set(assignments.flatMap((item) => data.students.filter((student) => student.filiereId === item.filiere.id && student.currentSemesterId === item.semester.id).map((student) => student.id))).size;
    return `
      <div class="metric-grid">
        ${metric(locale === 'ar' ? 'المواد' : 'Matières', assignments.length, personName(teacher, locale), 'book')}
        ${metric(locale === 'ar' ? 'الطلبة المعنيون' : 'Étudiants concernés', studentCount, locale === 'ar' ? 'حسب المسلك' : 'par filière', 'people')}
        ${metric(locale === 'ar' ? 'حصص الأسبوع' : 'Séances semaine', timetable.length, locale === 'ar' ? 'مبرمجة' : 'programmées', 'calendar-week')}
      </div>
      ${section(t(locale, 'nav.mySubjects'), renderTeacherSubjects(assignments, locale))}`;
  }

  const student = byId(data.students, user.linkedProfileId);
  const average = await appState.grades.getStudentAverage(student.id);
  const timetable = await appState.schedule.getStudentTimetable(student.id);
  return `
    <div class="metric-grid">
      ${metric(locale === 'ar' ? 'المعدل' : 'Moyenne', average === null ? '-' : `${average}/20`, locale === 'ar' ? 'النقط المنشورة' : 'notes publiées', 'patch-check')}
      ${metric(locale === 'ar' ? 'المسلك' : 'Filière', escapeHtml(localName(byId(data.filieres, student.filiereId), locale)), byId(data.semesters, student.currentSemesterId)?.code, 'diagram-2')}
      ${metric(locale === 'ar' ? 'حصص الأسبوع' : 'Séances semaine', timetable.length, locale === 'ar' ? 'حسب المسلك' : 'selon la filière', 'calendar3')}
    </div>
    ${section(t(locale, 'nav.mySchedule'), renderTimetableTable(timetable, locale))}`;
}

function renderActivity(logs, locale) {
  return `
    <div class="timeline">
      ${logs.slice(-6).reverse().map((log) => `<div><span>${formatDate(locale, log.timestamp)}</span><strong>${escapeHtml(log.summary)}</strong></div>`).join('')}
    </div>`;
}

function renderStudents(data) {
  const { locale } = appState;
  const rows = data.students.map((student) => `<tr>
    <td><strong>${personName(student, locale)}</strong><div class="muted">${student.registrationNumber}</div></td>
    <td>${escapeHtml(localName(byId(data.filieres, student.filiereId), locale))}</td>
    <td>${escapeHtml(localName(byId(data.semesters, student.currentSemesterId), locale, 'label'))}</td>
    <td>${escapeHtml(student.email)}</td>
    <td>${badge(t(locale, `status.${student.status}`), student.status === 'active' ? 'success' : 'secondary')}</td>
    <td><button class="btn btn-sm btn-outline-secondary" data-action="archive-student" data-id="${student.id}"><i class="bi bi-archive"></i></button></td>
  </tr>`).join('');
  return `
    ${section(
      t(locale, 'nav.students'),
      `<div class="table-toolbar"><input class="form-control" data-filter-table="studentsTable" placeholder="${t(locale, 'actions.search')}"></div>
       <div class="table-responsive"><table class="table align-middle searchable-table" id="studentsTable"><thead><tr><th>${locale === 'ar' ? 'الطالب' : 'Étudiant'}</th><th>${locale === 'ar' ? 'المسلك' : 'Filière'}</th><th>${locale === 'ar' ? 'السداسي' : 'Semestre'}</th><th>Email</th><th>${locale === 'ar' ? 'الحالة' : 'Statut'}</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,
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
    ${formField(locale === 'ar' ? 'المسلك' : 'Filière', `<select class="form-select" name="filiereId">${optionTags(data.filieres, 'fil-gi', locale)}</select>`)}
    ${formField(locale === 'ar' ? 'السداسي الحالي' : 'Semestre actuel', `<select class="form-select" name="currentSemesterId">${optionTags(data.semesters, 'sem-gi-s3', locale, 'label')}</select>`)}
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
  const rows = data.teachers.map((teacher) => {
    const assignmentCount = data.teacherAssignments.filter((assignment) => assignment.teacherId === teacher.id).length;
    return `<tr><td><strong>${personName(teacher, locale)}</strong><div class="muted">${teacher.employeeNumber}</div></td><td>${escapeHtml(teacher.speciality)}</td><td>${escapeHtml(teacher.rank)}</td><td>${escapeHtml(teacher.email)}</td><td>${assignmentCount}</td></tr>`;
  }).join('');
  return section(t(locale, 'nav.teachers'), `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>${locale === 'ar' ? 'الأستاذ' : 'Enseignant'}</th><th>${locale === 'ar' ? 'التخصص' : 'Spécialité'}</th><th>${locale === 'ar' ? 'الرتبة' : 'Grade'}</th><th>Email</th><th>${locale === 'ar' ? 'مواد' : 'Matières'}</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}

function renderSchool(data) {
  const { locale } = appState;
  const schemaRows = Object.entries(DATABASE_TABLES).map(([table, columns]) => `<tr><td><strong>${table}</strong></td><td><code>${columns.join('</code>, <code>')}</code></td></tr>`).join('');
  const filiereCards = data.filieres.map((filiere) => {
    const semesters = data.semesters.filter((semester) => semester.filiereId === filiere.id);
    return `<div class="split-row"><span><strong>${localName(filiere, locale)}</strong><small>${semesters.map((semester) => `${semester.code}: ${data.subjects.filter((subject) => subject.semesterId === semester.id).length} matières`).join(' · ')}</small></span><span>${filiere.code}</span></div>`;
  }).join('');
  const subjectRows = data.subjects.map((subject) => {
    const assignment = data.teacherAssignments.find((item) => item.subjectId === subject.id);
    return `<tr><td>${localName(byId(data.filieres, subject.filiereId), locale)}</td><td>${byId(data.semesters, subject.semesterId)?.code}</td><td><strong>${localName(subject, locale)}</strong><div class="muted">${subject.code}</div></td><td>${personName(byId(data.teachers, assignment?.teacherId), locale)}</td><td>${subject.coefficient}</td><td>${subject.hours}h</td></tr>`;
  }).join('');
  return `
    ${section(locale === 'ar' ? 'المسالك والسداسيات' : 'Filières et semestres', `<div class="split-list">${filiereCards}</div>`)}
    ${section(locale === 'ar' ? 'المواد والأساتذة' : 'Matières et enseignants', `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>${locale === 'ar' ? 'المسلك' : 'Filière'}</th><th>${locale === 'ar' ? 'السداسي' : 'Semestre'}</th><th>${locale === 'ar' ? 'المادة' : 'Matière'}</th><th>${locale === 'ar' ? 'الأستاذ' : 'Enseignant'}</th><th>Coef.</th><th>Heures</th></tr></thead><tbody>${subjectRows}</tbody></table></div>`)}
    ${section(locale === 'ar' ? 'تصميم قاعدة البيانات' : 'Conception relationnelle des données', `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>Table</th><th>Colonnes</th></tr></thead><tbody>${schemaRows}</tbody></table></div>`)}
  `;
}

function renderTimetableTable(rows, locale) {
  if (!rows.length) return emptyState(locale === 'ar' ? 'لا توجد حصص' : 'Aucune séance');
  return `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>${locale === 'ar' ? 'اليوم' : 'Jour'}</th><th>${locale === 'ar' ? 'الوقت' : 'Heure'}</th><th>${locale === 'ar' ? 'المسلك' : 'Filière'}</th><th>${locale === 'ar' ? 'السداسي' : 'Semestre'}</th><th>${locale === 'ar' ? 'المادة' : 'Matière'}</th><th>${locale === 'ar' ? 'الأستاذ' : 'Enseignant'}</th></tr></thead><tbody>${rows.map(({ entry, filiere, semester, subject, teacher }) => `<tr><td>${locale === 'ar' ? weekdayKeysAr[entry.weekday] : weekdayKeys[entry.weekday]}</td><td>${entry.startTime} - ${entry.endTime}</td><td>${localName(filiere, locale)}</td><td>${semester?.code ?? '-'}</td><td>${localName(subject, locale)}</td><td>${personName(teacher, locale)}</td></tr>`).join('')}</tbody></table></div>`;
}

async function renderTimetable(data) {
  const rows = await appState.schedule.getTimetable();
  return section(t(appState.locale, 'nav.timetable'), renderTimetableTable(rows, appState.locale));
}

function renderTeacherSubjects(assignments, locale) {
  if (!assignments.length) return emptyState(locale === 'ar' ? 'لا توجد مواد' : 'Aucune matière');
  return `<div class="split-list">${assignments.map(({ subject, filiere, semester }) => `<a href="#/gradebook/${subject.id}" class="split-row"><span><strong>${localName(subject, locale)}</strong><small>${localName(filiere, locale)} · ${semester.code}</small></span><i class="bi bi-arrow-${getDirection(locale) === 'rtl' ? 'left' : 'right'}"></i></a>`).join('')}</div>`;
}

async function renderTeacherSubjectsPage(data) {
  const assignments = await appState.schedule.getTeacherAssignments(appState.user.linkedProfileId);
  return section(t(appState.locale, 'nav.mySubjects'), renderTeacherSubjects(assignments, appState.locale));
}

function renderGradesOverview(data) {
  const { locale } = appState;
  const rows = data.grades.map((grade) => {
    const student = byId(data.students, grade.studentId);
    const subject = byId(data.subjects, grade.subjectId);
    return `<tr><td><strong>${personName(student, locale)}</strong><div class="muted">${student.registrationNumber}</div></td><td>${localName(byId(data.filieres, student.filiereId), locale)}</td><td>${byId(data.semesters, grade.semesterId)?.code}</td><td>${localName(subject, locale)}</td><td data-grade-mark-student="${student.id}">${grade.mark}/20</td><td data-grade-appreciation-student="${student.id}">${escapeHtml(grade.appreciation)}</td><td>${personName(byId(data.teachers, grade.teacherId), locale)}</td></tr>`;
  }).join('');
  return section(t(locale, 'nav.grades'), `<div class="table-responsive"><table class="table align-middle grades-overview-table"><thead><tr><th>${locale === 'ar' ? 'الطالب' : 'Étudiant'}</th><th>${locale === 'ar' ? 'المسلك' : 'Filière'}</th><th>${locale === 'ar' ? 'السداسي' : 'Semestre'}</th><th>${locale === 'ar' ? 'المادة' : 'Matière'}</th><th>${locale === 'ar' ? 'النقطة /20' : 'Note /20'}</th><th>${locale === 'ar' ? 'التقدير' : 'Appréciation'}</th><th>${locale === 'ar' ? 'الأستاذ' : 'Enseignant'}</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}

function renderGradebook(data) {
  const { locale, user } = appState;
  const teacherAssignments = data.teacherAssignments.filter((assignment) => assignment.teacherId === user.linkedProfileId);
  const subjectId = location.hash.split('/')[2] ?? teacherAssignments[0]?.subjectId;
  const assignment = teacherAssignments.find((item) => item.subjectId === subjectId) ?? teacherAssignments[0];
  if (!assignment) return section(t(locale, 'nav.gradebook'), emptyState(locale === 'ar' ? 'لا توجد مواد' : 'Aucune matière affectée'));
  const subject = byId(data.subjects, assignment.subjectId);
  const students = data.students.filter((student) => student.filiereId === assignment.filiereId && student.currentSemesterId === assignment.semesterId);
  const rows = students.map((student) => {
    const grade = data.grades.find((item) => item.studentId === student.id && item.subjectId === assignment.subjectId && item.semesterId === assignment.semesterId);
    return `<tr><td><strong>${personName(student, locale)}</strong><div class="muted">${student.registrationNumber}</div></td><td><input class="form-control form-control-sm" name="mark-${student.id}" type="number" min="0" max="20" step="0.25" value="${grade?.mark ?? ''}"></td><td><input class="form-control form-control-sm" name="appreciation-${student.id}" value="${escapeHtml(grade?.appreciation ?? '')}"></td></tr>`;
  }).join('');
  return `
    ${section(t(locale, 'nav.mySubjects'), renderTeacherSubjects(teacherAssignments.map((item) => ({ assignment: item, teacher: byId(data.teachers, item.teacherId), filiere: byId(data.filieres, item.filiereId), semester: byId(data.semesters, item.semesterId), subject: byId(data.subjects, item.subjectId) })), locale))}
    ${section(
      `${t(locale, 'nav.gradebook')} · ${localName(subject, locale)}`,
      `<form id="gradebookForm" data-subject-id="${assignment.subjectId}" data-semester-id="${assignment.semesterId}"><div class="table-responsive"><table class="table align-middle"><thead><tr><th>${locale === 'ar' ? 'الطالب' : 'Étudiant'}</th><th>${locale === 'ar' ? 'النقطة' : 'Note /20'}</th><th>${locale === 'ar' ? 'التقدير' : 'Appréciation'}</th></tr></thead><tbody>${rows}</tbody></table></div><button class="btn btn-primary"><i class="bi bi-save"></i>${t(locale, 'actions.save')}</button></form>`
    )}`;
}

async function renderStudentGrades(data) {
  const transcript = await appState.grades.getStudentTranscript(appState.user.linkedProfileId);
  return section(t(appState.locale, 'nav.myGrades'), renderTranscriptTable(transcript, appState.locale));
}

function renderTranscriptTable(transcript, locale) {
  return `<div class="transcript"><div class="table-responsive"><table class="table table-sm transcript-table"><colgroup><col class="transcript-col-subject"><col class="transcript-col-teacher"><col class="transcript-col-mark"><col class="transcript-col-appreciation"></colgroup><thead><tr><th>${locale === 'ar' ? 'المادة' : 'Matière'}</th><th>${locale === 'ar' ? 'الأستاذ' : 'Enseignant'}</th><th>${locale === 'ar' ? 'النقطة /20' : 'Note /20'}</th><th>${locale === 'ar' ? 'التقدير' : 'Appréciation'}</th></tr></thead><tbody>${transcript.map((row) => `<tr><td><strong>${localName(row.subject, locale)}</strong><div class="muted">${row.semester.code}</div></td><td>${personName(row.teacher, locale)}</td><td>${row.mark === null ? '-' : `${row.mark}/20`}</td><td>${escapeHtml(row.appreciation)}</td></tr>`).join('')}</tbody></table></div></div>`;
}

async function renderTranscript(data) {
  const { locale, user } = appState;
  const student = byId(data.students, user.linkedProfileId);
  const transcript = await appState.grades.getStudentTranscript(student.id);
  return section(
    t(locale, 'nav.myTranscript'),
    `<div class="print-header"><h2>${personName(student, locale)}</h2><p>${student.registrationNumber} · ${localName(byId(data.filieres, student.filiereId), locale)} · ${byId(data.semesters, student.currentSemesterId)?.code}</p></div>${renderTranscriptTable(transcript, locale)}`,
    `<button class="btn btn-outline-secondary" data-action="print"><i class="bi bi-printer"></i>${t(locale, 'actions.print')}</button>`,
    'transcript-section'
  );
}

function renderUsers(data) {
  const { locale } = appState;
  return section(t(locale, 'nav.users'), `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>${locale === 'ar' ? 'المستخدم' : 'Utilisateur'}</th><th>Email</th><th>${locale === 'ar' ? 'الدور' : 'Rôle'}</th><th>${locale === 'ar' ? 'اللغة' : 'Langue'}</th></tr></thead><tbody>${data.users.map((user) => `<tr><td>${escapeHtml(user.displayName)}</td><td>${escapeHtml(user.email)}</td><td>${t(locale, `roles.${user.role}`)}</td><td>${user.locale.toUpperCase()}</td></tr>`).join('')}</tbody></table></div>`);
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

async function renderStudentFiliere(data) {
  const { locale, user } = appState;
  const student = byId(data.students, user.linkedProfileId);
  const filiere = byId(data.filieres, student.filiereId);
  const semester = byId(data.semesters, student.currentSemesterId);
  const subjects = data.subjects.filter((subject) => subject.filiereId === student.filiereId && subject.semesterId === student.currentSemesterId);
  return section(t(locale, 'nav.myFiliere'), `<dl class="detail-list"><dt>${locale === 'ar' ? 'المسلك' : 'Filière'}</dt><dd>${localName(filiere, locale)}</dd><dt>${locale === 'ar' ? 'السداسي' : 'Semestre'}</dt><dd>${localName(semester, locale, 'label')}</dd><dt>${locale === 'ar' ? 'المواد' : 'Matières'}</dt><dd>${subjects.map((subject) => localName(subject, locale)).join(', ')}</dd></dl>`);
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
    case '#/school':
      content = renderSchool(data);
      break;
    case '#/timetable':
      content = await renderTimetable(data);
      break;
    case '#/grades':
      content = renderGradesOverview(data);
      break;
    case '#/users':
      content = renderUsers(data);
      break;
    case '#/settings':
      content = renderSettings(locale);
      break;
    case '#/my-subjects':
      content = await renderTeacherSubjectsPage(data);
      break;
    case '#/gradebook':
      content = renderGradebook(data);
      break;
    case '#/my-schedule':
      content = appState.user.role === 'student'
        ? section(t(locale, 'nav.mySchedule'), renderTimetableTable(await appState.schedule.getStudentTimetable(appState.user.linkedProfileId), locale))
        : section(t(locale, 'nav.mySchedule'), renderTimetableTable(await appState.schedule.getTeacherTimetable(appState.user.linkedProfileId), locale));
      break;
    case '#/my-filiere':
      content = await renderStudentFiliere(data);
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

  root.innerHTML = renderShell(content);
  renderCharts(data);
}

function renderCharts(data) {
  if (typeof Chart === 'undefined') return;
  if (activeChart) {
    activeChart.destroy();
    activeChart = null;
  }
  const canvas = document.getElementById('filiereChart');
  if (!canvas) return;
  const locale = appState.locale;
  activeChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: data.filieres.map((filiere) => localName(filiere, locale)),
      datasets: [{ data: data.filieres.map((filiere) => data.students.filter((student) => student.filiereId === filiere.id).length), backgroundColor: ['#123b68', '#f5bd2b', '#3e7cb1'] }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
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
      await appState.academic.createStudent(payload);
      showToast(t(appState.locale, 'toast.saved'));
      closeModal(form.closest('.modal'));
      await renderRoute();
      cleanupModalState();
    } catch (error) {
      showInlineError(form, error.message);
    }
  }
  if (form.id === 'gradebookForm') {
    event.preventDefault();
    const data = await loadData();
    const subjectId = form.dataset.subjectId;
    const semesterId = form.dataset.semesterId;
    const subject = byId(data.subjects, subjectId);
    const students = data.students.filter((student) => student.filiereId === subject.filiereId && student.currentSemesterId === semesterId);
    for (const student of students) {
      const mark = form.elements[`mark-${student.id}`].value;
      const appreciation = form.elements[`appreciation-${student.id}`].value;
      if (mark) {
        await appState.grades.saveGrade({ actorUserId: appState.user.id, studentId: student.id, subjectId, semesterId, mark, appreciation });
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
    openModal(document.getElementById(target.dataset.target));
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

async function startApp({ root = document.getElementById('app'), storageKey = 'uniflow.database' } = {}) {
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
