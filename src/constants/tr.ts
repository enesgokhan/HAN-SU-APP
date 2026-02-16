export const TR = {
  appName: 'HAN Arıtma',

  // Navigation
  navDashboard: 'Anasayfa',
  navNotifications: 'Bildirimler',
  navCustomers: 'Müşteriler',

  // Dashboard
  dashboardTitle: 'Bakım Takibi',
  overdue: 'Gecikmiş',
  dueSoon: 'Yaklaşıyor',
  upcoming: 'Planlı',
  ok: 'Normal',
  overdueAlert: (count: number) => `${count} müşteri için bakım süresi geçmiş!`,
  daysOverdue: (days: number) => `${Math.abs(days)} gün gecikme`,
  daysUntilDue: (days: number) => `${days} gün kaldı`,
  dueToday: 'Bugün!',
  noReminders: 'Tüm bakımlar güncel',
  totalCustomers: 'Toplam',
  thisMonth: 'Yaklaşan Bakımlar',
  viewAll: 'Tümünü Gör',
  greeting: 'Hoş geldiniz',

  // Notifications
  allFilter: 'Tümü',
  overdueFilter: 'Gecikmiş',
  dueSoonFilter: 'Yaklaşan',
  upcomingFilter: 'Planlı',
  normalFilter: 'Normal',
  maintenanceDone: 'Bakım Yapıldı',
  postpone: 'Ertele',
  sortByUrgency: 'Aciliyet',
  sortByName: 'Ada Göre',
  sortByDate: 'Tarihe Göre',
  noNotifications: 'Bildirim yok',
  noNotificationsDesc: 'Tüm bakımlar güncel durumda',
  searchNotFound: 'Sonuç bulunamadı',

  // Snooze
  snoozeOneMonth: '+1 Ay',
  snoozeTwoMonths: '+2 Ay',
  snoozeCustom: 'Tarih Seç',
  snoozedUntil: (date: string) => `${date} tarihine ertelendi`,

  // Customer
  addCustomer: 'Yeni Müşteri',
  editCustomer: 'Müşteriyi Düzenle',
  customerName: 'Ad Soyad',
  customerPhone: 'Telefon',
  customerAddress: 'Adres',
  installationDate: 'Kurulum Tarihi',
  notes: 'Notlar',
  save: 'Kaydet',
  delete: 'Sil',
  cancel: 'İptal',
  confirm: 'Onayla',
  confirmDelete: 'Bu müşteriyi ve tüm bakım kayıtlarını silmek istediğinize emin misiniz?',
  customerSaved: 'Müşteri kaydedildi',
  customerDeleted: 'Müşteri silindi',
  customerCount: (count: number) => `${count} müşteri`,
  sortLabel: 'Sırala',
  sortByInstallation: 'Kurulum Tarihi',
  sortByLastMaintenance: 'Son Bakım',

  // Maintenance
  maintenanceHistory: 'Bakım Geçmişi',
  addMaintenance: 'Bakım Ekle',
  maintenanceDate: 'Bakım Tarihi',
  maintenanceType: 'Bakım Türü',
  filterReplacement: 'Filtre Değişimi',
  membraneReplacement: 'Membran Değişimi',
  generalMaintenance: 'Genel Bakım',
  repair: 'Tamir',
  other: 'Diğer',
  nextMaintenance: 'Sonraki Bakım',
  lastMaintenance: 'Son Bakım',
  noMaintenanceYet: 'Henüz bakım kaydı yok',
  maintenanceAdded: 'Bakım kaydı eklendi',

  // Search
  searchPlaceholder: 'Müşteri ara...',

  // Backup
  backup: 'Yedekle',
  restore: 'Geri Yükle',
  backupSuccess: 'Yedek indirildi',
  restoreConfirm: 'Mevcut tüm veriler silinecek ve yedek dosyasından geri yüklenecek. Emin misiniz?',
  restoreSuccess: 'Veriler başarıyla geri yüklendi',
  restoreError: 'Geri yükleme hatası',
  invalidBackupFile: 'Geçersiz yedek dosyası',

  // Validation
  nameRequired: 'Ad soyad boş bırakılamaz',
  invalidPhone: 'Geçerli bir telefon numarası girin',
  customerSaveFailed: 'Müşteri kaydedilemedi',
  maintenanceSaveFailed: 'Bakım kaydı eklenemedi',
  confirmDeleteMaintenance: 'Bu bakım kaydını silmek istediğinize emin misiniz?',
  saving: 'Kaydediliyor...',
  searchNoResults: (query: string) => `"${query}" için müşteri bulunamadı`,

  // Maintenance cycle
  maintenanceCycle: 'Bakım Periyodu',
  months3: '3 Ay',
  months6: '6 Ay',
  months12: '12 Ay',

  // Active/Inactive
  markInactive: 'Pasif Yap',
  markActive: 'Aktif Yap',
  inactiveFilter: 'Pasif',
  customerDeactivated: 'Müşteri pasif yapıldı',
  customerActivated: 'Müşteri aktif yapıldı',

  // Dashboard v3
  thisWeek: 'Bu Hafta',
  recentActivity: 'Son Aktiviteler',
  today: 'Bugün',
  tomorrow: 'Yarın',
  viewNow: 'Şimdi Gör',
  doneThisMonth: 'Bu Ay',
  noUpcomingThisWeek: 'Bu hafta planlanmış bakım yok',
  activeCustomers: 'Aktif',

  // Error handling
  errorTitle: 'Bir hata oluştu',
  errorDescription: 'Uygulama beklenmeyen bir hata ile karşılaştı.',
  errorReload: 'Anasayfaya Dön',
  snoozeFailed: 'Erteleme başarısız',
  backupFailed: 'Yedekleme başarısız',

  // Plans / Appointments
  navPlans: 'Randevular',
  addPlan: 'Yeni Randevu',
  planDate: 'Randevu Tarihi',
  planNotes: 'Notlar',
  planSaved: 'Randevu kaydedildi',
  planSaveFailed: 'Randevu kaydedilemedi',
  planCompleted: 'Bakım kaydı eklendi',
  planPostponed: 'Randevu ertelendi',
  planCancelled: 'Randevu iptal edildi',
  selectCustomer: 'Müşteri Seçin',
  noPlans: 'Henüz randevu yok',
  noPlansDesc: 'Müşterilerinizle anlaştığınız randevuları buradan takip edin',
  confirmCancelPlan: 'Bu randevuyu iptal etmek istediğinize emin misiniz?',
  todayAppointments: 'Bugünkü Randevular',
  scheduledFilter: 'Planlanmış',
  completedFilter: 'Tamamlanan',
  cancelledFilter: 'İptal',
  markAsDone: 'Yapıldı',
  cancelPlan: 'İptal Et',
  overdueAppointment: 'Geçmiş',

  // General
  noCustomers: 'Henüz müşteri eklenmemiş',
  noCustomersDesc: 'İlk müşterinizi ekleyerek başlayın',
  required: 'Bu alan zorunludur',
} as const;

export const MAINTENANCE_TYPE_LABELS: Record<import('../types').MaintenanceType, string> = {
  filter_replacement: TR.filterReplacement,
  membrane_replacement: TR.membraneReplacement,
  general_maintenance: TR.generalMaintenance,
  repair: TR.repair,
  other: TR.other,
};
