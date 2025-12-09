import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.farmMap': 'Farm Map',
    'nav.smartTools': 'Smart Tools',
    'nav.management': 'Management',
    'nav.inventory': 'Inventory',
    'nav.marketplace': 'Marketplace',
    'nav.fields': 'Fields',
    'nav.logout': 'Logout',
    
    // Menu Items
    'menu.diseaseDetection': 'Disease Detection',
    'menu.diseaseDetectionDesc': 'AI-powered plant disease detection',
    'menu.iotMonitoring': 'IoT Monitoring',
    'menu.iotMonitoringDesc': 'Real-time sensor data monitoring',
    'menu.inventory': 'Inventory',
    'menu.inventoryDesc': 'Manage your farm inventory',
    'menu.marketplace': 'Marketplace',
    'menu.marketplaceDesc': 'Buy and sell farm products',
    'menu.fields': 'Fields',
    'menu.fieldsDesc': 'Manage your farm fields',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.welcomeSubtitle': 'Here\'s what\'s happening with your farm today',
    'dashboard.totalItems': 'Total Items',
    'dashboard.totalValue': 'Total Value',
    'dashboard.lowStock': 'Low Stock',
    'dashboard.overview': 'Farm Overview',
    'dashboard.weather': 'Weather',
    'dashboard.fields': 'Fields',
    'dashboard.inventory': 'Inventory',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.addField': 'Add Field',
    'dashboard.viewInventory': 'View Inventory',
    'dashboard.weatherDetails': 'Weather Details',
    'dashboard.temperature': 'Temperature',
    'dashboard.humidity': 'Humidity',
    'dashboard.windSpeed': 'Wind Speed',
    'dashboard.condition': 'Condition',
    'dashboard.lastUpdated': 'Last Updated',
    'dashboard.fieldName': 'Field Name',
    'dashboard.cropType': 'Crop Type',
    'dashboard.status': 'Status',
    'dashboard.area': 'Area',
    'dashboard.health': 'Health',
    'dashboard.active': 'Active',
    'dashboard.inactive': 'Inactive',
    'dashboard.healthy': 'Healthy',
    'dashboard.needsAttention': 'Needs Attention',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.refresh': 'Refresh',
    
    // Language
    'language.toggle': 'Toggle Language',
    'language.english': 'English',
    'language.arabic': 'العربية',
    
    // Modal
    'modal.confirmLogout': 'Confirm Logout',
    'modal.logoutQuestion': 'Are you sure you want to logout?',
    'modal.cancel': 'Cancel',
    'modal.logout': 'Logout'
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.dashboard': 'لوحة التحكم',
    'nav.farmMap': 'خريطة المزرعة',
    'nav.smartTools': 'الأدوات الذكية',
    'nav.management': 'الإدارة',
    'nav.inventory': 'المخزون',
    'nav.marketplace': 'السوق',
    'nav.fields': 'الحقول',
    'nav.logout': 'تسجيل الخروج',
    
    // Menu Items
    'menu.diseaseDetection': 'كشف الأمراض',
    'menu.diseaseDetectionDesc': 'كشف الأمراض النباتية بالذكاء الاصطناعي',
    'menu.iotMonitoring': 'مراقبة إنترنت الأشياء',
    'menu.iotMonitoringDesc': 'مراقبة بيانات المستشعرات في الوقت الفعلي',
    'menu.inventory': 'المخزون',
    'menu.inventoryDesc': 'إدارة مخزون مزرعتك',
    'menu.marketplace': 'السوق',
    'menu.marketplaceDesc': 'شراء وبيع المنتجات الزراعية',
    'menu.fields': 'الحقول',
    'menu.fieldsDesc': 'إدارة حقول مزرعتك',
    
    // Dashboard
    'dashboard.welcome': 'مرحباً بعودتك',
    'dashboard.welcomeSubtitle': 'إليك ما يحدث في مزرعتك اليوم',
    'dashboard.overview': 'نظرة عامة على المزرعة',
    'dashboard.weather': 'الطقس',
    'dashboard.fields': 'الحقول',
    'dashboard.inventory': 'المخزون',
    'dashboard.recentActivity': 'النشاط الأخير',
    'dashboard.quickActions': 'إجراءات سريعة',
    'dashboard.addField': 'إضافة حقل',
    'dashboard.viewInventory': 'عرض المخزون',
    'dashboard.weatherDetails': 'تفاصيل الطقس',
    'dashboard.temperature': 'درجة الحرارة',
    'dashboard.humidity': 'الرطوبة',
    'dashboard.windSpeed': 'سرعة الرياح',
    'dashboard.condition': 'الحالة',
    'dashboard.lastUpdated': 'آخر تحديث',
    'dashboard.fieldName': 'اسم الحقل',
    'dashboard.cropType': 'نوع المحصول',
    'dashboard.status': 'الحالة',
    'dashboard.area': 'المساحة',
    'dashboard.health': 'الصحة',
    'dashboard.active': 'نشط',
    'dashboard.inactive': 'غير نشط',
    'dashboard.healthy': 'سليم',
    'dashboard.needsAttention': 'يحتاج اهتمام',
    'dashboard.totalItems': 'إجمالي العناصر',
    'dashboard.totalValue': 'القيمة الإجمالية',
    'dashboard.lowStock': 'المخزون المنخفض',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.view': 'عرض',
    'common.add': 'إضافة',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.refresh': 'تحديث',
    
    // Language
    'language.toggle': 'تبديل اللغة',
    'language.english': 'English',
    'language.arabic': 'العربية',
    
    // Modal
    'modal.confirmLogout': 'تأكيد تسجيل الخروج',
    'modal.logoutQuestion': 'هل أنت متأكد من أنك تريد تسجيل الخروج؟',
    'modal.cancel': 'إلغاء',
    'modal.logout': 'تسجيل الخروج'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    // Update document direction for Arabic
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const translate = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, translate, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback for when context is not available
    return {
      language: 'en',
      translate: (key) => key,
      toggleLanguage: () => {}
    };
  }
  return context;
};