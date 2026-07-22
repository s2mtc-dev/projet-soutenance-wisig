export const DATABASE_VERSION = 1;

const now = '2026-07-21T09:00:00.000Z';

function stamp(record) {
  return {
    createdAt: now,
    updatedAt: now,
    status: record.status ?? 'active',
    ...record
  };
}

export function createSeedDatabase() {
  return structuredClone({
    version: DATABASE_VERSION,
    migratedAt: now,
    users: [
      stamp({
        id: 'user-admin',
        displayName: 'Admin UniFlow',
        email: 'admin@uniflow.local',
        password: 'demo123',
        role: 'admin',
        linkedProfileId: null,
        locale: 'fr',
        avatar: 'AU'
      }),
      stamp({
        id: 'user-teacher',
        displayName: 'Pr. Youssef Alaoui',
        email: 'teacher@uniflow.local',
        password: 'demo123',
        role: 'teacher',
        linkedProfileId: 'teach-1',
        locale: 'fr',
        avatar: 'YA'
      }),
      stamp({
        id: 'user-student',
        displayName: 'Mina El Fassi',
        email: 'student@uniflow.local',
        password: 'demo123',
        role: 'student',
        linkedProfileId: 'stu-1',
        locale: 'fr',
        avatar: 'ME'
      })
    ],
    academicYears: [
      stamp({ id: 'year-2025', label: '2025-2026', startDate: '2025-09-15', endDate: '2026-07-15', current: true })
    ],
    programs: [
      stamp({ id: 'prog-cs', code: 'GI', nameFr: 'Génie Informatique', nameAr: 'هندسة المعلوميات', department: 'Sciences et Techniques', degreeType: 'Licence', duration: 3 }),
      stamp({ id: 'prog-math', code: 'MA', nameFr: 'Mathématiques Appliquées', nameAr: 'الرياضيات التطبيقية', department: 'Sciences', degreeType: 'Licence', duration: 3 })
    ],
    levels: [
      stamp({ id: 'lvl-cs-1', programId: 'prog-cs', label: 'GI 1', order: 1 }),
      stamp({ id: 'lvl-cs-2', programId: 'prog-cs', label: 'GI 2', order: 2 }),
      stamp({ id: 'lvl-math-2', programId: 'prog-math', label: 'MA 2', order: 2 })
    ],
    semesters: [
      stamp({ id: 'sem-s3', code: 'S3', levelId: 'lvl-cs-2', academicYearId: 'year-2025', startDate: '2025-09-15', endDate: '2026-01-31' }),
      stamp({ id: 'sem-s4', code: 'S4', levelId: 'lvl-cs-2', academicYearId: 'year-2025', startDate: '2026-02-10', endDate: '2026-07-15' }),
      stamp({ id: 'sem-ma-s4', code: 'S4-MA', levelId: 'lvl-math-2', academicYearId: 'year-2025', startDate: '2026-02-10', endDate: '2026-07-15' })
    ],
    modules: [
      stamp({ id: 'mod-cs-fundamentals', code: 'M301', semesterId: 'sem-s3', nameFr: 'Fondamentaux informatiques', nameAr: 'أساسيات المعلوميات', coefficient: 3, credits: 6 }),
      stamp({ id: 'mod-data', code: 'M302', semesterId: 'sem-s3', nameFr: 'Données et systèmes', nameAr: 'البيانات والأنظمة', coefficient: 2, credits: 5 }),
      stamp({ id: 'mod-web', code: 'M401', semesterId: 'sem-s4', nameFr: 'Développement Web', nameAr: 'تطوير الويب', coefficient: 3, credits: 6 })
    ],
    subjects: [
      stamp({ id: 'sub-algo', code: 'ALG301', moduleId: 'mod-cs-fundamentals', nameFr: 'Algorithmique avancée', nameAr: 'الخوارزميات المتقدمة', coefficient: 2, hours: 48 }),
      stamp({ id: 'sub-arch', code: 'ARC301', moduleId: 'mod-cs-fundamentals', nameFr: 'Architecture des ordinateurs', nameAr: 'معمارية الحاسوب', coefficient: 1, hours: 36 }),
      stamp({ id: 'sub-db', code: 'BD302', moduleId: 'mod-data', nameFr: 'Bases de données', nameAr: 'قواعد البيانات', coefficient: 2, hours: 48 }),
      stamp({ id: 'sub-os', code: 'SYS302', moduleId: 'mod-data', nameFr: 'Systèmes d’exploitation', nameAr: 'أنظمة التشغيل', coefficient: 1, hours: 36 }),
      stamp({ id: 'sub-web', code: 'WEB401', moduleId: 'mod-web', nameFr: 'Applications web', nameAr: 'تطبيقات الويب', coefficient: 2, hours: 50 }),
      stamp({ id: 'sub-project', code: 'PRJ401', moduleId: 'mod-web', nameFr: 'Projet encadré', nameAr: 'مشروع مؤطر', coefficient: 1, hours: 24 })
    ],
    groups: [
      stamp({ id: 'grp-cs-2a', code: 'GI2-A', programId: 'prog-cs', levelId: 'lvl-cs-2', capacity: 36 }),
      stamp({ id: 'grp-cs-2b', code: 'GI2-B', programId: 'prog-cs', levelId: 'lvl-cs-2', capacity: 34 }),
      stamp({ id: 'grp-math-2a', code: 'MA2-A', programId: 'prog-math', levelId: 'lvl-math-2', capacity: 32 })
    ],
    rooms: [
      stamp({ id: 'room-a101', code: 'A101', building: 'Bloc A', capacity: 45, type: 'Amphi' }),
      stamp({ id: 'room-b204', code: 'B204', building: 'Bloc B', capacity: 32, type: 'Salle' }),
      stamp({ id: 'room-lab-small', code: 'LAB-S', building: 'Bloc C', capacity: 20, type: 'Laboratoire' }),
      stamp({ id: 'room-lab-big', code: 'LAB-1', building: 'Bloc C', capacity: 38, type: 'Laboratoire' })
    ],
    teachers: [
      stamp({ id: 'teach-1', employeeNumber: 'ENS-001', firstNameFr: 'Youssef', lastNameFr: 'Alaoui', firstNameAr: 'يوسف', lastNameAr: 'العلوي', email: 'youssef.alaoui@univ.test', phone: '+212600001001', speciality: 'Algorithmique', rank: 'Professeur' }),
      stamp({ id: 'teach-2', employeeNumber: 'ENS-002', firstNameFr: 'Hajar', lastNameFr: 'Benali', firstNameAr: 'هاجر', lastNameAr: 'بن علي', email: 'hajar.benali@univ.test', phone: '+212600001002', speciality: 'Bases de données', rank: 'Maître de conférences' }),
      stamp({ id: 'teach-3', employeeNumber: 'ENS-003', firstNameFr: 'Karim', lastNameFr: 'Mansouri', firstNameAr: 'كريم', lastNameAr: 'منصوري', email: 'karim.mansouri@univ.test', phone: '+212600001003', speciality: 'Web', rank: 'Professeur assistant' }),
      stamp({ id: 'teach-4', employeeNumber: 'ENS-004', firstNameFr: 'Salma', lastNameFr: 'Naciri', firstNameAr: 'سلمى', lastNameAr: 'ناصري', email: 'salma.naciri@univ.test', phone: '+212600001004', speciality: 'Systèmes', rank: 'Vacataire' })
    ],
    students: [
      stamp({ id: 'stu-1', registrationNumber: 'UNI-2025-001', firstNameFr: 'Mina', lastNameFr: 'El Fassi', firstNameAr: 'مينا', lastNameAr: 'الفاسي', email: 'mina.elfassi@etu.test', phone: '+212600002001', birthDate: '2004-01-09', programId: 'prog-cs', levelId: 'lvl-cs-2', groupId: 'grp-cs-2a' }),
      stamp({ id: 'stu-2', registrationNumber: 'UNI-2025-002', firstNameFr: 'Omar', lastNameFr: 'Tazi', firstNameAr: 'عمر', lastNameAr: 'التازي', email: 'omar.tazi@etu.test', phone: '+212600002002', birthDate: '2003-11-14', programId: 'prog-cs', levelId: 'lvl-cs-2', groupId: 'grp-cs-2a' }),
      stamp({ id: 'stu-3', registrationNumber: 'UNI-2025-003', firstNameFr: 'Lina', lastNameFr: 'Berrada', firstNameAr: 'لينا', lastNameAr: 'برادة', email: 'lina.berrada@etu.test', phone: '+212600002003', birthDate: '2004-03-22', programId: 'prog-cs', levelId: 'lvl-cs-2', groupId: 'grp-cs-2b' }),
      stamp({ id: 'stu-4', registrationNumber: 'UNI-2025-004', firstNameFr: 'Adam', lastNameFr: 'Harti', firstNameAr: 'آدم', lastNameAr: 'حارثي', email: 'adam.harti@etu.test', phone: '+212600002004', birthDate: '2003-07-30', programId: 'prog-cs', levelId: 'lvl-cs-2', groupId: 'grp-cs-2a' }),
      stamp({ id: 'stu-5', registrationNumber: 'UNI-2025-005', firstNameFr: 'Nour', lastNameFr: 'Ziani', firstNameAr: 'نور', lastNameAr: 'زياني', email: 'nour.ziani@etu.test', phone: '+212600002005', birthDate: '2004-04-10', programId: 'prog-cs', levelId: 'lvl-cs-2', groupId: 'grp-cs-2a' }),
      stamp({ id: 'stu-6', registrationNumber: 'UNI-2025-006', firstNameFr: 'Samir', lastNameFr: 'Idrissi', firstNameAr: 'سمير', lastNameAr: 'الإدريسي', email: 'samir.idrissi@etu.test', phone: '+212600002006', birthDate: '2003-12-03', programId: 'prog-math', levelId: 'lvl-math-2', groupId: 'grp-math-2a' })
    ],
    enrollments: [
      stamp({ id: 'enr-1', studentId: 'stu-1', academicYearId: 'year-2025', programId: 'prog-cs', levelId: 'lvl-cs-2', groupId: 'grp-cs-2a', status: 'active' }),
      stamp({ id: 'enr-2', studentId: 'stu-2', academicYearId: 'year-2025', programId: 'prog-cs', levelId: 'lvl-cs-2', groupId: 'grp-cs-2a', status: 'active' }),
      stamp({ id: 'enr-3', studentId: 'stu-3', academicYearId: 'year-2025', programId: 'prog-cs', levelId: 'lvl-cs-2', groupId: 'grp-cs-2b', status: 'active' }),
      stamp({ id: 'enr-4', studentId: 'stu-4', academicYearId: 'year-2025', programId: 'prog-cs', levelId: 'lvl-cs-2', groupId: 'grp-cs-2a', status: 'active' }),
      stamp({ id: 'enr-5', studentId: 'stu-5', academicYearId: 'year-2025', programId: 'prog-cs', levelId: 'lvl-cs-2', groupId: 'grp-cs-2a', status: 'active' }),
      stamp({ id: 'enr-6', studentId: 'stu-6', academicYearId: 'year-2025', programId: 'prog-math', levelId: 'lvl-math-2', groupId: 'grp-math-2a', status: 'active' })
    ],
    teachingAssignments: [
      stamp({ id: 'ta-1', teacherId: 'teach-1', subjectId: 'sub-algo', semesterId: 'sem-s3', groupIds: ['grp-cs-2a', 'grp-cs-2b'] }),
      stamp({ id: 'ta-2', teacherId: 'teach-2', subjectId: 'sub-db', semesterId: 'sem-s3', groupIds: ['grp-cs-2a'] }),
      stamp({ id: 'ta-3', teacherId: 'teach-4', subjectId: 'sub-os', semesterId: 'sem-s3', groupIds: ['grp-cs-2a', 'grp-cs-2b'] }),
      stamp({ id: 'ta-4', teacherId: 'teach-3', subjectId: 'sub-web', semesterId: 'sem-s4', groupIds: ['grp-cs-2a'] }),
      stamp({ id: 'ta-5', teacherId: 'teach-3', subjectId: 'sub-project', semesterId: 'sem-s4', groupIds: ['grp-cs-2a'] })
    ],
    assessments: [
      stamp({ id: 'assess-algo-quiz', subjectId: 'sub-algo', title: 'Contrôle continu', type: 'CC', date: '2025-11-12', weight: 40, maximumMark: 20, published: true }),
      stamp({ id: 'assess-algo-final', subjectId: 'sub-algo', title: 'Examen final', type: 'EF', date: '2026-01-18', weight: 60, maximumMark: 20, published: true }),
      stamp({ id: 'assess-db-final', subjectId: 'sub-db', title: 'Projet SQL', type: 'TP', date: '2025-12-20', weight: 100, maximumMark: 20, published: true }),
      stamp({ id: 'assess-web-final', subjectId: 'sub-web', title: 'Application web', type: 'Projet', date: '2026-05-20', weight: 100, maximumMark: 20, published: false })
    ],
    grades: [
      stamp({ id: 'grade-1', assessmentId: 'assess-algo-quiz', studentId: 'stu-1', mark: 14, absence: null, comment: 'Stable', authorUserId: 'user-teacher' }),
      stamp({ id: 'grade-2', assessmentId: 'assess-algo-final', studentId: 'stu-1', mark: 15.5, absence: null, comment: 'Good reasoning', authorUserId: 'user-teacher' }),
      stamp({ id: 'grade-3', assessmentId: 'assess-algo-quiz', studentId: 'stu-2', mark: 11, absence: null, comment: '', authorUserId: 'user-teacher' }),
      stamp({ id: 'grade-4', assessmentId: 'assess-algo-final', studentId: 'stu-2', mark: 12.5, absence: null, comment: '', authorUserId: 'user-teacher' }),
      stamp({ id: 'grade-5', assessmentId: 'assess-algo-quiz', studentId: 'stu-4', mark: null, absence: 'excused', comment: 'Medical certificate', authorUserId: 'user-teacher' }),
      stamp({ id: 'grade-6', assessmentId: 'assess-algo-final', studentId: 'stu-4', mark: 13, absence: null, comment: '', authorUserId: 'user-teacher' }),
      stamp({ id: 'grade-7', assessmentId: 'assess-algo-quiz', studentId: 'stu-5', mark: null, absence: 'unexcused', comment: 'Absent', authorUserId: 'user-teacher' }),
      stamp({ id: 'grade-8', assessmentId: 'assess-algo-final', studentId: 'stu-5', mark: 8, absence: null, comment: '', authorUserId: 'user-teacher' }),
      stamp({ id: 'grade-9', assessmentId: 'assess-db-final', studentId: 'stu-1', mark: 16, absence: null, comment: '', authorUserId: 'user-admin' })
    ],
    scheduleEntries: [
      stamp({ id: 'sch-1', subjectId: 'sub-algo', groupId: 'grp-cs-2a', teacherId: 'teach-1', roomId: 'room-a101', weekday: 1, startTime: '09:00', endTime: '11:00' }),
      stamp({ id: 'sch-2', subjectId: 'sub-db', groupId: 'grp-cs-2a', teacherId: 'teach-2', roomId: 'room-lab-big', weekday: 2, startTime: '10:00', endTime: '12:00' }),
      stamp({ id: 'sch-3', subjectId: 'sub-os', groupId: 'grp-cs-2a', teacherId: 'teach-4', roomId: 'room-b204', weekday: 3, startTime: '08:30', endTime: '10:30' }),
      stamp({ id: 'sch-4', subjectId: 'sub-web', groupId: 'grp-cs-2a', teacherId: 'teach-3', roomId: 'room-lab-big', weekday: 4, startTime: '14:00', endTime: '16:00' })
    ],
    activityLogs: [
      stamp({ id: 'log-1', actorUserId: 'user-admin', action: 'seeded', entityType: 'database', entityId: 'demo', summary: 'Base de démonstration initialisée', timestamp: now })
    ]
  });
}
