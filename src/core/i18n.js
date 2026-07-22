export const dictionaries = {
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
    'nav.academic': 'Structure',
    'nav.assignments': 'Affectations',
    'nav.dashboard': 'Tableau de bord',
    'nav.enrollments': 'Inscriptions',
    'nav.gradebook': 'Carnet de notes',
    'nav.grades': 'Notes',
    'nav.groups': 'Groupes',
    'nav.myCourses': 'Mes cours',
    'nav.myGrades': 'Mes notes',
    'nav.myProgram': 'Ma filière',
    'nav.mySchedule': 'Mon emploi du temps',
    'nav.myTranscript': 'Relevé',
    'nav.profile': 'Profil',
    'nav.reports': 'Rapports',
    'nav.schedule': 'Emploi du temps',
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
    'nav.academic': 'البنية',
    'nav.assignments': 'التكليفات',
    'nav.dashboard': 'لوحة القيادة',
    'nav.enrollments': 'التسجيلات',
    'nav.gradebook': 'دفتر النقط',
    'nav.grades': 'النقط',
    'nav.groups': 'المجموعات',
    'nav.myCourses': 'دروسي',
    'nav.myGrades': 'نقطي',
    'nav.myProgram': 'مسلكي',
    'nav.mySchedule': 'جدولي',
    'nav.myTranscript': 'كشف النقط',
    'nav.profile': 'الملف',
    'nav.reports': 'التقارير',
    'nav.schedule': 'استعمال الزمن',
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

export function interpolate(template, params = {}) {
  return Object.entries(params).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

export function t(locale, key, params = {}) {
  const dictionary = dictionaries[locale] ?? dictionaries.fr;
  return interpolate(dictionary[key] ?? dictionaries.fr[key] ?? key, params);
}

export function getDirection(locale) {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function formatNumber(locale, value, options = {}) {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-MA' : 'fr-MA', options).format(value);
}

export function formatDate(locale, value) {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA' : 'fr-MA', { dateStyle: 'medium' }).format(new Date(value));
}
