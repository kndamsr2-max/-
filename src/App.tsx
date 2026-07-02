import React, { useState, useEffect } from 'react';
import { 
  Building2, User as UserIcon, Clock, Calendar, Bell, Mail, Search, LogOut, 
  ChevronDown, Sun, Moon, Sparkles, FolderKanban, HelpCircle, LayoutDashboard,
  ShoppingBag, ShoppingCart, Package, Users, Briefcase, Settings, Database, 
  Activity, ArrowLeftRight, CreditCard, ShieldCheck, FileSpreadsheet, X, Pin, PinOff, Scale,
  Maximize2, Minimize2, Split, Plus
} from 'lucide-react';
import { mockDatabase } from './data/mockDatabase';
import { Tab, User, Product } from './types';
import LoginScreen from './components/LoginScreen';
import RibbonHeader from './components/RibbonHeader';
import DashboardView from './components/DashboardView';
import InvoiceView from './components/InvoiceView';
import WarehouseTransferView from './components/WarehouseTransferView';
import UserManagementView from './components/UserManagementView';
import AuditLogView from './components/AuditLogView';
import BackupRestoreView from './components/BackupRestoreView';
import POSView from './components/POSView';
import AccountingLedgerView from './components/AccountingLedgerView';
import InventoryMasterView from './components/InventoryMasterView';
import HRAndCRMView from './components/HRAndCRMView';
import EnterpriseExtraView from './components/EnterpriseExtraView';
import ProductModal from './components/ProductModal';

export const accentColors = {
  gold: {
    nameAr: 'الذهبي الملكي',
    nameEn: 'Royal Gold',
    primary: '#b89047',
    secondary: '#c5a880',
    hover: '#9a7535',
    text: 'text-[#b89047] dark:text-[#c5a880]',
    border: 'border-[#b89047]',
    bg: 'bg-[#b89047]',
    lightBg: 'rgba(184, 144, 71, 0.1)',
    badge: 'bg-[#b89047]/10 text-[#b89047] dark:bg-[#b89047]/20 dark:text-[#c5a880]',
  },
  blue: {
    nameAr: 'النيلي الملكي',
    nameEn: 'Sapphire Blue',
    primary: '#1d4ed8',
    secondary: '#3b82f6',
    hover: '#1e40af',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-600',
    bg: 'bg-blue-600',
    lightBg: 'rgba(37, 99, 235, 0.1)',
    badge: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  },
  emerald: {
    nameAr: 'الأخضر الزمردي',
    nameEn: 'Emerald Oasis',
    primary: '#059669',
    secondary: '#10b981',
    hover: '#047857',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-600',
    bg: 'bg-emerald-600',
    lightBg: 'rgba(5, 150, 105, 0.1)',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  violet: {
    nameAr: 'البنفسجي الإمبراطوري',
    nameEn: 'Imperial Violet',
    primary: '#6d28d9',
    secondary: '#8b5cf6',
    hover: '#5b21b6',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-600',
    bg: 'bg-violet-600',
    lightBg: 'rgba(109, 40, 217, 0.1)',
    badge: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400',
  },
  rose: {
    nameAr: 'العنابي الراقي',
    nameEn: 'Ruby Rose',
    primary: '#be123c',
    secondary: '#f43f5e',
    hover: '#9f1239',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-600',
    bg: 'bg-rose-600',
    lightBg: 'rgba(190, 18, 60, 0.1)',
    badge: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('al_meezan_dark_mode');
    return saved !== null ? saved === 'true' : false;
  });
  const [themeAccent, setThemeAccent] = useState<'gold' | 'blue' | 'emerald' | 'violet' | 'rose'>(() => {
    return (localStorage.getItem('al_meezan_theme_accent') as any) || 'gold';
  });
  const [isLargeBoldFont, setIsLargeBoldFont] = useState<boolean>(() => {
    return localStorage.getItem('al_meezan_large_font') === 'true';
  });
  
  // Real-time Header Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Tabs management like a web browser
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('dashboard');
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const [secondaryActiveTabId, setSecondaryActiveTabId] = useState<string | null>(null);

  // Interactive drop-downs
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productRefreshKey, setProductRefreshKey] = useState(0);

  // Database states
  const [showDbMenu, setShowDbMenu] = useState(false);
  const [databases, setDatabases] = useState<any[]>([]);
  const [activeDbId, setActiveDbId] = useState<string>('default');
  const [newDbName, setNewDbName] = useState('');
  const [newDbNameEn, setNewDbNameEn] = useState('');

  // Notifications preloaded
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'شاشة سامسونج LED 32 اقتربت من نفاد المخزون (باقي 4)', time: 'منذ دقيقة', unread: true },
    { id: 2, text: 'مؤسسة الرياض للأوراق والكرتون لديها رصيد دائن معلق بقيمة 15,000 ج', time: 'منذ ساعة', unread: true },
    { id: 3, text: 'تم إنشاء نسخة احتياطية تلقائية لقاعدة بيانات سامي سيستم بنجاح', time: 'منذ ساعتين', unread: false },
  ]);

  // Messages preloaded
  const [messages, setMessages] = useState([
    { id: 1, from: 'م. سامح الجيار', text: 'أرجو اعتماد إذن الصرف المخزني رقم WH-04 لإجراء جرد ربع السنوي.', time: 'منذ 10 دقائق' },
    { id: 2, from: 'المراجعة الداخلية', text: 'تم فحص الموازنة الضريبية واعتماد ضريبة القيمة المضافة لدفعة يونيو.', time: 'منذ يوم' }
  ]);

  useEffect(() => {
    // Initiate DB
    mockDatabase.init();
    setDatabases(mockDatabase.getDatabases());
    setActiveDbId(mockDatabase.getActiveDatabaseId());
    
    // Header clock update
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Sync dark mode class with HTML and save to storage
    localStorage.setItem('al_meezan_dark_mode', darkMode.toString());
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Save theme accent to storage and set CSS variables on root
    localStorage.setItem('al_meezan_theme_accent', themeAccent);
    const root = window.document.documentElement;
    const active = accentColors[themeAccent];
    root.style.setProperty('--primary-color', active.primary);
    root.style.setProperty('--secondary-color', active.secondary);
    root.style.setProperty('--primary-hover', active.hover);
    root.style.setProperty('--light-bg', active.lightBg);
  }, [themeAccent]);

  useEffect(() => {
    localStorage.setItem('al_meezan_large_font', isLargeBoldFont.toString());
  }, [isLargeBoldFont]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Initialize default tabs once logged in
    setTabs([
      { id: 'dashboard', title: 'لوحة التحكم', titleEn: 'Dashboard', type: 'dashboard', isPinned: true }
    ]);
    setActiveTabId('dashboard');
  };

  const handleLogout = () => {
    if (currentUser) {
      mockDatabase.addAuditLog(
        currentUser.id,
        currentUser.username,
        'تسجيل خروج',
        `تم تسجيل خروج الموظف: ${currentUser.fullName} بنجاح من النظام.`
      );
    }
    setCurrentUser(null);
    setTabs([]);
  };

  const handleSwitchDb = (dbId: string) => {
    mockDatabase.setActiveDatabaseId(dbId);
    setActiveDbId(dbId);
    setDatabases(mockDatabase.getDatabases());
    
    const users = mockDatabase.getUsers();
    const match = users.find(u => u.username === currentUser?.username);
    if (match) {
      setCurrentUser(match);
      mockDatabase.addAuditLog(
        match.id,
        match.username,
        'تبديل قاعدة البيانات',
        `تم الانتقال إلى قاعدة البيانات: ${mockDatabase.getDatabases().find(d => d.id === dbId)?.name || dbId}`
      );
    } else {
      setCurrentUser(users[0] || null);
    }

    setTabs([
      { id: 'dashboard', title: 'لوحة التحكم', titleEn: 'Dashboard', type: 'dashboard', isPinned: true }
    ]);
    setActiveTabId('dashboard');
    setShowDbMenu(false);
  };

  const handleCreateDb = () => {
    if (!newDbName.trim()) return;
    const nameEn = newDbNameEn.trim() || newDbName.trim();
    const newDb = mockDatabase.createDatabase(newDbName.trim(), nameEn);
    
    setActiveDbId(newDb.id);
    setDatabases(mockDatabase.getDatabases());
    setNewDbName('');
    setNewDbNameEn('');
    
    const users = mockDatabase.getUsers();
    setCurrentUser(users[0] || null);

    setTabs([
      { id: 'dashboard', title: 'لوحة التحكم', titleEn: 'Dashboard', type: 'dashboard', isPinned: true }
    ]);
    setActiveTabId('dashboard');
    setShowDbMenu(false);

    setNotifications(prev => [
      {
        id: Date.now(),
        text: lang === 'ar' 
          ? `تم إنشاء وتفعيل قاعدة البيانات "${newDb.name}" بنجاح!` 
          : `Database "${newDb.nameEn}" was created and activated successfully!`,
        time: 'الآن',
        unread: true
      },
      ...prev
    ]);
  };

  const exportProductsToCSV = () => {
    const headers = lang === 'ar'
      ? ['كود الصنف', 'اسم الصنف', 'الباركود الدولي', 'الوحدة', 'سعر البيع', 'التكلفة', 'الكمية الفورية', 'التاريخ والتشغيلة']
      : ['Product Code', 'Product Name', 'Barcode', 'Unit', 'Price', 'Cost', 'Current Stock', 'Expiry/Batch'];
    const rows = mockDatabase.getProducts().map(p => [
      `"${p.code}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.barcode}"`,
      `"${p.unit}"`,
      p.price,
      p.cost,
      p.stock,
      `"${p.expiryDate || 'مستمر'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `product_directory.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPartnersToCSV = (type: 'clients' | 'vendors') => {
    const partners = mockDatabase.getPartners().filter(p => p.type === (type === 'clients' ? 'client' : 'vendor'));
    const headers = lang === 'ar'
      ? ['كود الشريك', 'الاسم بالكامل', 'الهاتف والاتصال', 'البريد الإلكتروني', 'المقر الرئيسي', 'الرصيد الدفتري الحالي']
      : ['Partner Code', 'Full Name', 'Phone', 'Email', 'Address', 'Balance'];
    const rows = partners.map(p => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.phone}"`,
      `"${p.email}"`,
      `"${p.address.replace(/"/g, '""')}"`,
      p.balance
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_directory.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Browser-style tab opening system
  const handleOpenTab = (tabId: string, titleAr: string, titleEn: string, type: string, extraProps?: any) => {
    // Check if tab already exists, if so activate it
    const existingIndex = tabs.findIndex(t => t.id === tabId);
    if (existingIndex !== -1) {
      setActiveTabId(tabId);
      // update props if any
      if (extraProps) {
        const copy = [...tabs];
        copy[existingIndex].props = extraProps;
        setTabs(copy);
      }
      return;
    }

    // Check permissions
    if (currentUser && currentUser.permissions) {
      const screenMap: { [key: string]: string } = {
        'dashboard': 'dashboard',
        'sales_invoice': 'sales_invoice',
        'purchase_invoice': 'purchase_invoice',
        'stock_in': 'stock_in',
        'stock_out': 'stock_out',
        'stock_transfer': 'stock_transfer',
        'user_management': 'user_management',
        'audit_logs': 'audit_logs',
        'products': 'products',
        'clients': 'clients',
        'vendors': 'vendors',
        'backup': 'user_management',
        'pos_view': 'sales_invoice',
        'accounting_ledger': 'dashboard',
        'inventory_master': 'products',
        'hr_crm_portal': 'user_management',
        'enterprise_extra': 'dashboard'
      };
      
      const targetScreen = screenMap[type];
      if (targetScreen) {
        const hasAccess = currentUser.permissions.screens[targetScreen]?.view;
        if (!hasAccess) {
          alert(lang === 'ar' ? `ليس لديك صلاحية لفتح شاشة: ${titleAr}` : `You do not have permission to access: ${titleEn}`);
          return;
        }
      }
    }

    // Respect multi tabs limits
    if (!currentUser?.permissions?.openMultiTabs && tabs.length >= 3) {
      alert(lang === 'ar' ? 'غير مسموح بحسابك بفتح أكثر من 3 تبويبات في نفس الوقت!' : 'Multi-tab constraint reached!');
      return;
    }

    const newTab: Tab = {
      id: tabId,
      title: titleAr,
      titleEn,
      type,
      props: extraProps
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(tabId);
  };

  const handleCloseTab = (tabId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const tabToClose = tabs.find(t => t.id === tabId);
    if (tabToClose?.isPinned) {
      alert(lang === 'ar' ? 'لا يمكن إغلاق التبويبات المثبتة!' : 'Cannot close pinned tabs!');
      return;
    }

    const filtered = tabs.filter(t => t.id !== tabId);
    setTabs(filtered);

    // If active tab was closed, switch active to the last remaining tab
    if (activeTabId === tabId && filtered.length > 0) {
      setActiveTabId(filtered[filtered.length - 1].id);
    }

    // If secondary active tab was closed, find another tab or reset to null
    if (secondaryActiveTabId === tabId) {
      const remainingOthers = filtered.filter(t => t.id !== activeTabId);
      if (remainingOthers.length > 0) {
        setSecondaryActiveTabId(remainingOthers[remainingOthers.length - 1].id);
      } else {
        setSecondaryActiveTabId(null);
      }
    }
  };

  const handleTogglePinTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = tabs.map(t => {
      if (t.id === tabId) {
        return { ...t, isPinned: !t.isPinned };
      }
      return t;
    });
    setTabs(updated);
  };

  // Format header time/date
  const headerTime = () => currentTime.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const headerDate = () => currentTime.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  // Quick universal search handler
  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const screens = [
      { key: 'لوحة', nameAr: 'لوحة التحكم', nameEn: 'Dashboard', type: 'dashboard' },
      { key: 'بيع', nameAr: 'فاتورة مبيعات جديدة', nameEn: 'New Sales Invoice', type: 'sales_invoice' },
      { key: 'شراء', nameAr: 'فاتورة مشتريات جديدة', nameEn: 'New Purchase Invoice', type: 'purchase_invoice' },
      { key: 'اضافة', nameAr: 'إذن إضافة مخزني', nameEn: 'Warehouse Inbound', type: 'stock_in' },
      { key: 'صرف', nameAr: 'إذن صرف مخزني', nameEn: 'Warehouse Outbound', type: 'stock_out' },
      { key: 'تحويل', nameAr: 'تحويل بين المخازن', nameEn: 'Warehouse Transfer', type: 'stock_transfer' },
      { key: 'مستخدم', nameAr: 'المستخدمين والصلاحيات', nameEn: 'Users & Security', type: 'user_management' },
      { key: 'سجل', nameAr: 'سجل العمليات والرقابة', nameEn: 'Audit Logs', type: 'audit_logs' },
      { key: 'صنف', nameAr: 'دليل الأصناف', nameEn: 'Products Master', type: 'products' },
      { key: 'عميل', nameAr: 'دليل العملاء', nameEn: 'Clients Master', type: 'clients' },
      { key: 'مورد', nameAr: 'دليل الموردين', nameEn: 'Vendors Master', type: 'vendors' },
      { key: 'نسخ', nameAr: 'النسخ الاحتياطي', nameEn: 'DB Backup', type: 'backup' }
    ];

    const match = screens.find(s => 
      s.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.key.includes(searchQuery)
    );

    if (match) {
      handleOpenTab(match.type, match.nameAr, match.nameEn, match.type);
      setSearchQuery('');
    } else {
      alert(lang === 'ar' ? 'لم نجد شاشة مطابقة لبحثك السريع!' : 'No matching screen found!');
    }
  };

  // If not logged in, render the login screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} lang={lang} setLang={setLang} />;
  }

  // Render specific tab content cleanly
  const renderTabContent = (tab: Tab) => {
    switch (tab.type) {
      case 'dashboard':
        return (
          <div className="w-full">
            <DashboardView
              lang={lang}
              onOpenInvoice={(invId, type) => handleOpenTab(`invoice_edit_${invId}`, 'عرض فاتورة', 'View Invoice', type === 'sale' ? 'sales_invoice' : 'purchase_invoice', { invoiceId: invId })}
              onOpenTab={handleOpenTab}
            />
          </div>
        );
      
      case 'sales_invoice':
        return (
          <div className="w-full">
            <InvoiceView
              lang={lang}
              invoiceId={tab.props?.invoiceId}
              invoiceType="sale"
              currentUser={currentUser}
              onClose={() => handleCloseTab(tab.id)}
              onRefreshDashboard={() => {}}
            />
          </div>
        );

      case 'sales_return':
        return (
          <div className="w-full">
            <InvoiceView
              lang={lang}
              invoiceId={tab.props?.invoiceId}
              invoiceType="sale_return"
              currentUser={currentUser}
              onClose={() => handleCloseTab(tab.id)}
              onRefreshDashboard={() => {}}
            />
          </div>
        );

      case 'purchase_invoice':
        return (
          <div className="w-full">
            <InvoiceView
              lang={lang}
              invoiceId={tab.props?.invoiceId}
              invoiceType="purchase"
              currentUser={currentUser}
              onClose={() => handleCloseTab(tab.id)}
              onRefreshDashboard={() => {}}
            />
          </div>
        );

      case 'purchase_return':
        return (
          <div className="w-full">
            <InvoiceView
              lang={lang}
              invoiceId={tab.props?.invoiceId}
              invoiceType="purchase_return"
              currentUser={currentUser}
              onClose={() => handleCloseTab(tab.id)}
              onRefreshDashboard={() => {}}
            />
          </div>
        );

      case 'stock_in':
        return (
          <div className="w-full">
            <InvoiceView
              lang={lang}
              invoiceId={tab.props?.invoiceId}
              invoiceType="stock_in"
              currentUser={currentUser}
              onClose={() => handleCloseTab(tab.id)}
              onRefreshDashboard={() => {}}
            />
          </div>
        );

      case 'stock_out':
        return (
          <div className="w-full">
            <InvoiceView
              lang={lang}
              invoiceId={tab.props?.invoiceId}
              invoiceType="stock_out"
              currentUser={currentUser}
              onClose={() => handleCloseTab(tab.id)}
              onRefreshDashboard={() => {}}
            />
          </div>
        );

      case 'stock_transfer':
        return (
          <div className="w-full">
            <InvoiceView
              lang={lang}
              invoiceId={tab.props?.invoiceId}
              invoiceType="transfer"
              currentUser={currentUser}
              onClose={() => handleCloseTab(tab.id)}
              onRefreshDashboard={() => {}}
            />
          </div>
        );

      case 'user_management':
        return (
          <div className="w-full">
            <UserManagementView
              lang={lang}
              currentUser={currentUser}
              onClose={() => handleCloseTab(tab.id)}
            />
          </div>
        );

      case 'audit_logs':
        return (
          <div className="w-full">
            <AuditLogView
              lang={lang}
              onClose={() => handleCloseTab(tab.id)}
            />
          </div>
        );

      case 'backup':
        return (
          <div className="w-full">
            <BackupRestoreView
              lang={lang}
              currentUser={currentUser}
              onClose={() => handleCloseTab(tab.id)}
            />
          </div>
        );

      // Sub-directories for Products, clients, vendors
      case 'products':
        return (
          <div className="p-6 space-y-6" key={productRefreshKey}>
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-300 dark:border-slate-700 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{lang === 'ar' ? 'دليل كارت الصنف والباركود الدولي' : 'Product Directory'}</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">{lang === 'ar' ? 'عرض تفصيلي لجميع الأقسام والسلع المتاحة بالمستودع كجدول إكسيل' : 'Comprehensive spreadsheet view of warehouse products'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[#b89047] hover:bg-amber-400 text-black font-extrabold px-4 py-2 rounded-lg cursor-pointer transition-all shadow-md border border-[#b89047]/50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'إضافة كارت صنف جديد (+)' : 'Add New Product Card (+)'}</span>
                </button>
                <button
                  onClick={exportProductsToCSV}
                  className="flex items-center gap-1.5 bg-[#1e40af] hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-all shadow-md border border-blue-700"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تصدير الدليل إلى Excel / CSV' : 'Export Directory to Excel'}</span>
                </button>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl p-4 overflow-x-auto shadow-sm">
              <table className="w-full text-xs text-slate-800 dark:text-slate-200 excel-grid">
                <thead>
                  {/* Excel Column Letters Indicator */}
                  <tr className="bg-slate-200 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-center font-mono text-[10px] select-none border-b border-slate-300 dark:border-slate-800">
                    <th className="border-r border-slate-300 dark:border-slate-800 p-1">A</th>
                    <th className="border-r border-slate-300 dark:border-slate-800 p-1">B</th>
                    <th className="border-r border-slate-300 dark:border-slate-800 p-1">C</th>
                    <th className="border-r border-slate-300 dark:border-slate-800 p-1">D</th>
                    <th className="border-r border-slate-300 dark:border-slate-800 p-1">E</th>
                    <th className="border-r border-slate-300 dark:border-slate-800 p-1">F</th>
                    <th className="border-r border-slate-300 dark:border-slate-800 p-1">G</th>
                    <th className="p-1">H</th>
                  </tr>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-850 dark:text-slate-300 text-right border-b border-slate-300 dark:border-slate-700 font-bold">
                    <th className="p-3 border-r border-slate-300 dark:border-slate-800">كود الصنف</th>
                    <th className="p-3 border-r border-slate-300 dark:border-slate-800">اسم الصنف</th>
                    <th className="p-3 border-r border-slate-300 dark:border-slate-800">الباركود الدولي</th>
                    <th className="p-3 text-center border-r border-slate-300 dark:border-slate-800">الوحدة</th>
                    <th className="p-3 text-left border-r border-slate-300 dark:border-slate-800">سعر البيع</th>
                    <th className="p-3 text-left border-r border-slate-300 dark:border-slate-800">التكلفة</th>
                    <th className="p-3 text-center border-r border-slate-300 dark:border-slate-800">الكمية الفورية</th>
                    <th className="p-3 text-center">التاريخ والتشغيلة</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDatabase.getProducts().map(p => (
                    <tr key={p.id} className="border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/20">
                      <td className="p-3 font-mono font-bold text-slate-950 dark:text-white border-r border-slate-300 dark:border-slate-800">{p.code}</td>
                      <td className="p-3 font-bold border-r border-slate-300 dark:border-slate-800">{p.name}</td>
                      <td className="p-3 font-mono text-slate-500 dark:text-slate-400 border-r border-slate-300 dark:border-slate-800">{p.barcode}</td>
                      <td className="p-3 text-center border-r border-slate-300 dark:border-slate-800">{p.unit}</td>
                      <td className="p-3 text-left font-mono text-emerald-600 dark:text-emerald-400 border-r border-slate-300 dark:border-slate-800">{p.price.toLocaleString()} EGP</td>
                      <td className="p-3 text-left font-mono text-slate-500 dark:text-slate-400 border-r border-slate-300 dark:border-slate-800">{p.cost.toLocaleString()} EGP</td>
                      <td className={`p-3 text-center font-mono font-bold border-r border-slate-300 dark:border-slate-800 ${p.stock <= p.minLimit ? 'text-rose-500 font-bold' : 'text-slate-800 dark:text-white'}`}>{p.stock}</td>
                      <td className="p-3 text-center text-[11px] text-slate-500 dark:text-slate-400 font-mono">{p.expiryDate || 'مستمر'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'clients':
      case 'vendors':
        const typeLabel = tab.type === 'clients' ? 'client' : 'vendor';
        return (
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-300 dark:border-slate-700 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  {tab.type === 'clients' ? (lang === 'ar' ? 'دليل العملاء والحسابات المعتمدة' : 'Clients Directory') : (lang === 'ar' ? 'دليل الموردين والمشتريات' : 'Vendors Directory')}
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">{lang === 'ar' ? 'عرض تفصيلي للأرصدة المالية والشركاء كجدول إكسيل' : 'Spreadsheet table with current business partner details'}</p>
              </div>
              <button
                onClick={() => exportPartnersToCSV(tab.type as 'clients' | 'vendors')}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-all shadow-md border border-emerald-500"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تصدير الدليل إلى Excel / CSV' : 'Export Directory to Excel'}</span>
              </button>
            </div>
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl p-4 overflow-x-auto shadow-sm">
              <table className="w-full text-xs text-slate-800 dark:text-slate-200 excel-grid">
                <thead>
                  {/* Excel Column Letters Indicator */}
                  <tr className="bg-slate-200 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-center font-mono text-[10px] select-none border-b border-slate-300 dark:border-slate-800">
                    <th className="border-r border-slate-300 dark:border-slate-800 p-1">A</th>
                    <th className="border-r border-slate-300 dark:border-slate-800 p-1">B</th>
                    <th className="border-r border-slate-300 dark:border-slate-800 p-1">C</th>
                    <th className="border-r border-slate-300 dark:border-slate-800 p-1">D</th>
                    <th className="border-r border-slate-300 dark:border-slate-800 p-1">E</th>
                    <th className="p-1">F</th>
                  </tr>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-850 dark:text-slate-300 text-right border-b border-slate-300 dark:border-slate-700 font-bold">
                    <th className="p-3 border-r border-slate-300 dark:border-slate-800">كود الشريك</th>
                    <th className="p-3 border-r border-slate-300 dark:border-slate-800">الاسم بالكامل</th>
                    <th className="p-3 border-r border-slate-300 dark:border-slate-800">الهاتف والاتصال</th>
                    <th className="p-3 border-r border-slate-300 dark:border-slate-800">البريد الإلكتروني</th>
                    <th className="p-3 border-r border-slate-300 dark:border-slate-800">المقر الرئيسي</th>
                    <th className="p-3 text-left">الرصيد الدفتري الحالي</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDatabase.getPartners().filter(p => p.type === typeLabel).map(partner => (
                    <tr key={partner.id} className="border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/20">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white border-r border-slate-300 dark:border-slate-800">{partner.id}</td>
                      <td className="p-3 font-bold border-r border-slate-300 dark:border-slate-800">{partner.name}</td>
                      <td className="p-3 font-mono border-r border-slate-300 dark:border-slate-800">{partner.phone}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 border-r border-slate-300 dark:border-slate-800">{partner.email}</td>
                      <td className="p-3 border-r border-slate-300 dark:border-slate-800">{partner.address}</td>
                      <td className={`p-3 text-left font-mono font-bold ${partner.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {partner.balance.toLocaleString()} EGP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'pos_view':
        return (
          <div className="w-full">
            <POSView
              lang={lang}
              currentUser={currentUser}
              onClose={() => handleCloseTab(tab.id)}
            />
          </div>
        );

      case 'accounting_ledger':
        return (
          <div className="w-full">
            <AccountingLedgerView
              lang={lang}
              currentUser={currentUser}
              onClose={() => handleCloseTab(tab.id)}
            />
          </div>
        );

      case 'inventory_master':
        return (
          <div className="w-full">
            <InventoryMasterView
              lang={lang}
              currentUser={currentUser}
              onClose={() => handleCloseTab(tab.id)}
            />
          </div>
        );

      case 'hr_crm_portal':
        return (
          <div className="w-full">
            <HRAndCRMView
              lang={lang}
              currentUser={currentUser}
              onClose={() => handleCloseTab(tab.id)}
            />
          </div>
        );

      case 'enterprise_extra':
        return (
          <div className="w-full">
            <EnterpriseExtraView
              lang={lang}
              currentUser={currentUser}
              onClose={() => handleCloseTab(tab.id)}
            />
          </div>
        );

      default:
        return (
          <div className="p-12 text-center text-slate-500">
            <h3 className="text-sm font-bold mb-2">جاري تهيئة هذه الشاشة</h3>
            <p className="text-xs">سيتم ربطها بكافة قواعد الجرد والقيود اليومية في التحديث القادم لسامي سيستم.</p>
          </div>
        );
    }
  };

  // Render a Windows-like or ERP-like Window Frame Header
  const renderTabHeaderControls = (tab: Tab | undefined, side: 'left' | 'right') => {
    if (!tab) return null;
    return (
      <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 px-3.5 py-2.5 flex justify-between items-center select-none text-xs">
        {/* Title & Icon */}
        <div className="flex items-center gap-2 font-bold theme-accent-text">
          <div className="w-2.5 h-2.5 rounded-full theme-accent-bg animate-pulse" />
          <span className="font-sans text-xs">
            {lang === 'ar' ? tab.title : tab.titleEn}
          </span>
          {isSplitView && (
            <span className="text-[9px] font-sans px-2 py-0.5 rounded border theme-accent-light-bg theme-accent-text border-[var(--primary-color)]/30">
              {side === 'left' ? (lang === 'ar' ? 'الشاشة ١' : 'Pane 1') : (lang === 'ar' ? 'الشاشة ٢' : 'Pane 2')}
            </span>
          )}
        </div>

        {/* Tab drop-down changer / controls */}
        <div className="flex items-center gap-2">
          {isSplitView && (
            <select
              value={tab.id}
              onChange={(e) => {
                if (side === 'left') {
                  setActiveTabId(e.target.value);
                } else {
                  setSecondaryActiveTabId(e.target.value);
                }
              }}
              className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              {tabs.map((t) => (
                <option key={t.id} value={t.id} disabled={side === 'left' ? t.id === secondaryActiveTabId : t.id === activeTabId}>
                  {lang === 'ar' ? t.title : t.titleEn}
                </option>
              ))}
            </select>
          )}

          {/* Maximize / Close Buttons mimicking classic Windows titlebar */}
          <div className="flex items-center gap-1.5">
            {isSplitView && (
              <button
                onClick={() => {
                  // Maximize this side (disable split view and make this tab active)
                  setActiveTabId(tab.id);
                  setIsSplitView(false);
                }}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                title={lang === 'ar' ? 'تكبير ملء الشاشة' : 'Maximize to Full Screen'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
            {side === 'right' && (
              <button
                onClick={() => setIsSplitView(false)}
                className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
                title={lang === 'ar' ? 'إغلاق الشاشة الثانية' : 'Close Pane 2'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Side bar links mapping
  const sidebarLinks = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'sales_invoice', label: 'المبيعات', icon: ShoppingBag, props: { mode: 'create' } },
    { id: 'purchase_invoice', label: 'المشتريات', icon: ShoppingCart, props: { mode: 'create' } },
    { id: 'stock_transfer', label: 'المخازن والتحويلات', icon: Package },
    { id: 'products', label: 'كارت الصنف والباركود', icon: FileSpreadsheet },
    { id: 'clients', label: 'العملاء والدائنين', icon: Users },
    { id: 'vendors', label: 'الموردون والمشتريات', icon: Users },
    { id: 'user_management', label: 'الموارد البشرية HR والصلاحيات', icon: Briefcase },
    { id: 'audit_logs', label: 'سجل العمليات والرقابة', icon: Activity },
    { id: 'backup', label: 'النسخ الاحتياطي والأرشيف', icon: Database },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? (themeAccent === 'gold' ? 'bg-[#000000] text-[#f1f5f9] dark' : 'bg-[#090d16] text-[#f1f5f9] dark') : 'bg-[#f0f2f5] text-[#1e293b]'} flex flex-col font-sans select-none overflow-x-hidden ${isLargeBoldFont ? 'large-bold-font-mode' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Dynamic Accent Colors Stylesheet Injection */}
      <style>{`
        :root {
          --primary-color: ${accentColors[themeAccent].primary};
          --secondary-color: ${accentColors[themeAccent].secondary};
          --light-bg: ${accentColors[themeAccent].lightBg};
        }
        
        /* Direct class overrides for full compatibility with existing colors */
        .theme-accent-text {
          color: var(--primary-color) !important;
        }
        .theme-accent-bg {
          background-color: var(--primary-color) !important;
        }
        .theme-accent-border {
          border-color: var(--primary-color) !important;
        }
        .theme-accent-border-t {
          border-top-color: var(--primary-color) !important;
        }
        .theme-accent-light-bg {
          background-color: var(--light-bg) !important;
        }
        .theme-accent-hover-bg:hover {
          background-color: var(--primary-color) !important;
          opacity: 0.9;
        }
        .theme-accent-btn {
          background-color: var(--primary-color) !important;
          border-color: var(--primary-color) !important;
          color: white !important;
        }
        .theme-accent-btn:hover {
          opacity: 0.9;
        }

        /* Excel grid lines & spreadsheet style headers */
        .excel-grid {
          border-collapse: collapse !important;
          border: 2px solid #64748b !important;
        }
        .excel-grid th {
          border: 1px solid #94a3b8 !important;
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
          font-weight: bold !important;
        }
        .excel-grid td {
          border: 1px solid #cbd5e1 !important;
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        .dark .excel-grid {
          border: 2px solid #b89047 !important;
        }
        .dark .excel-grid th {
          border: 1px solid #475569 !important;
          background-color: #0a0a0a !important;
          color: #f5f5f5 !important;
        }
        .dark .excel-grid td {
          border: 1px solid #0a0a0a !important;
          background-color: #000000 !important;
          color: #f1f5f9 !important;
        }

        /* Large & Bold Font theme override ("خط كبير وأسود") */
        .large-bold-font-mode {
          font-size: 104% !important;
        }
        .large-bold-font-mode p,
        .large-bold-font-mode span,
        .large-bold-font-mode td,
        .large-bold-font-mode th,
        .large-bold-font-mode input,
        .large-bold-font-mode select,
        .large-bold-font-mode button,
        .large-bold-font-mode h1,
        .large-bold-font-mode h2,
        .large-bold-font-mode h3,
        .large-bold-font-mode h4,
        .large-bold-font-mode div {
          font-weight: 700 !important;
        }
        .large-bold-font-mode .text-xs, 
        .large-bold-font-mode .text-\[10px\], 
        .large-bold-font-mode .text-\[11px\],
        .large-bold-font-mode .font-mono {
          font-size: 13px !important;
        }
        .large-bold-font-mode .text-sm {
          font-size: 15px !important;
        }
        .large-bold-font-mode .text-base {
          font-size: 17px !important;
        }
        .large-bold-font-mode .text-lg {
          font-size: 19px !important;
        }
        .large-bold-font-mode .text-xl {
          font-size: 22px !important;
        }
        .large-bold-font-mode .text-2xl {
          font-size: 26px !important;
        }
        /* Make standard font colors super dark black in light mode */
        html:not(.dark) .large-bold-font-mode .text-slate-500,
        html:not(.dark) .large-bold-font-mode .text-slate-600,
        html:not(.dark) .large-bold-font-mode .text-slate-700,
        html:not(.dark) .large-bold-font-mode .text-slate-800,
        html:not(.dark) .large-bold-font-mode .text-slate-900,
        html:not(.dark) .large-bold-font-mode td,
        html:not(.dark) .large-bold-font-mode th {
          color: #000000 !important;
        }

        /* Premium Golden-Black high contrast theme frames/borders */
        .dark.large-bold-font-mode, .dark {
          --gold-color: #b89047;
        }
        .dark .bg-white, .dark .bg-slate-900 {
          background-color: #050505 !important;
        }
        .dark .border-slate-200, .dark .border-slate-800 {
          border-color: #334155 !important;
        }
        
        /* Gold frame & golden-black style for cards & headers */
        .dark .bg-white, 
        .dark .bg-slate-900,
        .dark header,
        .dark .rounded-xl {
          border: 1.5px solid var(--primary-color) !important;
          box-shadow: 0 0 10px rgba(184, 144, 71, 0.1) !important;
        }
      `}</style>
      
      {/* Upper Main Executive Topbar */}
      <header className="bg-slate-950 text-white px-4 py-2.5 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-[#c5a880]/30 z-30 shadow-lg">
        
        {/* Title / Corporate Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-lg flex items-center justify-center shadow-md border border-[#c5a880]/30 text-[#c5a880] font-black">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">{lang === 'ar' ? 'الميزان دوت نت' : 'Al-Meezan .Net'}</span>
              <span className="text-[9px] font-bold bg-[#c5a880]/20 text-[#b89047] px-1.5 py-0.5 rounded border border-[#c5a880]/40 font-mono">ERP v4.2</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">{lang === 'ar' ? 'برنامج المحاسبة والمستودعات المتكامل' : 'Accounting & Warehouse ERP System'}</p>
          </div>
        </div>

        {/* Database Selector Dropdown - UPPERMOST OF THE PROGRAM */}
        <div className="relative" id="db-selector-container">
          <button
            onClick={() => {
              setShowDbMenu(!showDbMenu);
              setShowThemeMenu(false);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-[#121c2c] hover:bg-[#1a2d42] border border-[#c5a880]/40 rounded-lg text-xs text-[#c5a880] hover:text-white font-bold transition-all cursor-pointer shadow-md"
            title={lang === 'ar' ? 'إدارة وقواعد البيانات النشطة' : 'Database Management & Selection'}
          >
            <Database className="w-4 h-4 text-[#c5a880] animate-pulse" />
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-medium leading-none mb-0.5">{lang === 'ar' ? 'قاعدة البيانات النشطة' : 'Active Database'}</p>
              <p className="text-xs leading-none font-bold text-slate-200">
                {databases.find(d => d.id === activeDbId)?.name || (lang === 'ar' ? 'قاعدة البيانات الرئيسية' : 'Main Database')}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#c5a880]" />
          </button>

          {showDbMenu && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-[#c5a880]/30 rounded-xl shadow-2xl p-3.5 z-50 text-xs text-slate-100">
              <h4 className="font-bold border-b border-slate-800 pb-2 text-white mb-2 flex items-center gap-1.5 font-sans">
                <Database className="w-4 h-4 text-amber-500" />
                <span>{lang === 'ar' ? 'إدارة وقواعد البيانات' : 'Database Administration'}</span>
              </h4>
              
              {/* List of existing databases */}
              <div className="space-y-1 max-h-40 overflow-y-auto mb-3 scrollbar-thin scrollbar-thumb-slate-700 text-right">
                {databases.map((db: any) => {
                  const isActive = db.id === activeDbId;
                  return (
                    <button
                      key={db.id}
                      onClick={() => handleSwitchDb(db.id)}
                      className={`w-full text-right p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold' 
                          : 'hover:bg-slate-800 border border-transparent text-slate-300'
                      }`}
                    >
                      <div className="text-right">
                        <p className="font-bold text-xs">{lang === 'ar' ? db.name : db.nameEn}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{lang === 'ar' ? `تاريخ الإنشاء: ${db.createdAt}` : `Created: ${db.createdAt}`}</p>
                      </div>
                      {isActive && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>}
                    </button>
                  );
                })}
              </div>

              {/* Create new database form */}
              <div className="border-t border-slate-800 pt-3">
                <p className="font-bold text-white mb-2 text-[11px] flex items-center gap-1 font-sans justify-end">
                  <span>{lang === 'ar' ? 'إنشاء قاعدة بيانات جديدة' : 'Create New Database'}</span>
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newDbName}
                    onChange={(e) => setNewDbName(e.target.value)}
                    placeholder={lang === 'ar' ? 'اسم قاعدة البيانات باللغة العربية' : 'e.g. Alex Branch Database'}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/60 placeholder-slate-600 text-right"
                  />
                  <input
                    type="text"
                    value={newDbNameEn}
                    onChange={(e) => setNewDbNameEn(e.target.value)}
                    placeholder={lang === 'ar' ? 'الاسم بالإنجليزية (اختياري)' : 'English Name (Optional)'}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/60 placeholder-slate-600 text-right"
                  />
                  <button
                    onClick={handleCreateDb}
                    disabled={!newDbName.trim()}
                    className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white font-bold rounded cursor-pointer transition-all flex items-center justify-center gap-1 border border-amber-600/20 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'تأسيس قاعدة البيانات' : 'Initialize Database'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Universal Quick Search Bar */}
        <form onSubmit={handleQuickSearch} className="flex-1 max-w-sm relative mx-0 md:mx-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pr-8 pl-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#c5a880]/60 focus:bg-slate-950 transition-all"
            placeholder={lang === 'ar' ? 'البحث السريع عن أي شاشة... (مثال: مبيعات)' : 'Quick screen lookup... (e.g., Sales)'}
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
        </form>

        {/* Status widgets, Time, Notifications and Profiles */}
        <div className="flex items-center gap-4">
          
          {/* Active branch and year */}
          <div className="hidden lg:flex flex-col text-right text-[10px] text-blue-200 border-r border-blue-800/60 pr-3 mr-3 font-medium space-y-0.5">
            <div><span className="text-blue-300">{lang === 'ar' ? 'الفرع:' : 'Branch:'}</span> {lang === 'ar' ? 'الفرع الرئيسي' : 'Main Branch'}</div>
            <div><span className="text-blue-300">{lang === 'ar' ? 'السنة المالية:' : 'FY:'}</span> {lang === 'ar' ? '٢٠٢٦' : '2026'}</div>
          </div>

          {/* Clock Widget */}
          <div className="hidden md:flex flex-col text-right text-[10px] font-mono text-blue-100">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <Clock className="w-3 h-3 animate-pulse" />
              <span>{headerTime()}</span>
            </div>
            <div className="text-blue-300 text-[9px] mt-0.5">{headerDate()}</div>
          </div>

          {/* Theme & Color Customizer Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowNotifications(false);
                setShowMessages(false);
                setShowProfileMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950/40 hover:bg-[#1e3a8a]/40 text-blue-200 hover:text-white rounded-lg cursor-pointer transition-all border border-blue-800/55"
              title={lang === 'ar' ? 'تخصيص الألوان والمظهر' : 'Customize Theme & Colors'}
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-[11px] font-bold hidden sm:inline">
                {lang === 'ar' ? 'مظهر النظام' : 'System Theme'}
              </span>
            </button>

            {showThemeMenu && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-850 rounded-xl shadow-2xl p-4 z-50 text-xs text-slate-100">
                <h4 className="font-bold border-b border-slate-800 pb-2 text-white mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'ar' ? 'تخصيص المظهر والألوان' : 'Theme Customization'}</span>
                </h4>

                {/* 1. Theme Mode Switcher */}
                <div className="space-y-2 mb-4">
                  <label className="text-[10px] font-semibold text-slate-400 block">
                    {lang === 'ar' ? 'وضع المظهر' : 'Theme Mode'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-850">
                    <button
                      onClick={() => setDarkMode(false)}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        !darkMode
                          ? 'bg-white text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>{lang === 'ar' ? 'نهاري / فاتح' : 'Light'}</span>
                    </button>
                    <button
                      onClick={() => setDarkMode(true)}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        darkMode
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-blue-400" />
                      <span>{lang === 'ar' ? 'ليلي / داكن' : 'Dark'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Color Accent Picker */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 block">
                    {lang === 'ar' ? 'اللون الرئيسي للنظام' : 'Accent Color'}
                  </label>
                  <div className="flex items-center justify-between gap-1.5 p-2 bg-slate-950 rounded-lg border border-slate-850">
                    {(Object.keys(accentColors) as Array<keyof typeof accentColors>).map((key) => {
                      const col = accentColors[key];
                      const isSelected = themeAccent === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setThemeAccent(key)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            isSelected ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 hover:opacity-100 hover:scale-105'
                          }`}
                          style={{ backgroundColor: col.primary }}
                          title={lang === 'ar' ? col.nameAr : col.nameEn}
                        >
                          {isSelected && (
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-center text-[10px] text-slate-500 mt-1 font-semibold">
                    {lang === 'ar' ? accentColors[themeAccent].nameAr : accentColors[themeAccent].nameEn}
                  </div>
                </div>

                {/* 3. Font Style Switcher ("خط كبير وأسود") */}
                <div className="space-y-2 mt-4 pt-3 border-t border-slate-800">
                  <label className="text-[10px] font-semibold text-slate-400 block">
                    {lang === 'ar' ? 'نمط الخط والمقاس' : 'Font Size & Weight'}
                  </label>
                  <button
                    onClick={() => setIsLargeBoldFont(!isLargeBoldFont)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer font-bold ${
                      isLargeBoldFont 
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{lang === 'ar' ? 'خط عريض وكبير أسود 🔠' : 'Large Bold Font 🔠'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono">
                      {isLargeBoldFont ? (lang === 'ar' ? 'مفعل' : 'ON') : (lang === 'ar' ? 'ملغي' : 'OFF')}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Panel */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowMessages(false);
                setShowProfileMenu(false);
              }}
              className="p-2 bg-blue-900/50 hover:bg-[#1e3a8a] text-blue-200 hover:text-white rounded-lg cursor-pointer transition-all relative border border-blue-800/60"
            >
              <Bell className="w-4 h-4 text-blue-200" />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-40 text-xs text-slate-100">
                <h4 className="font-bold border-b border-slate-800 pb-2 text-white mb-2 flex justify-between">
                  <span>{lang === 'ar' ? 'إشعارات النظام' : 'Notifications'}</span>
                  <button 
                    onClick={() => setNotifications(notifications.map(n => ({...n, unread: false})))}
                    className="text-[10px] text-blue-400 hover:underline animate-pulse"
                  >
                    تحديد كمقروء
                  </button>
                </h4>
                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-2 rounded-lg border ${n.unread ? 'bg-blue-600/10 border-blue-500/20 text-white' : 'bg-slate-950/40 border-slate-900 text-slate-400'}`}>
                      <p>{n.text}</p>
                      <span className="text-[9px] text-slate-500 block mt-1">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Account Menu drop-down */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
                setShowMessages(false);
              }}
              className="flex items-center gap-2 p-1 hover:bg-blue-800 rounded-lg transition-all cursor-pointer text-white"
            >
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.username}`}
                alt="avatar"
                className="w-7 h-7 rounded-full border border-white/20 bg-blue-300"
              />
              <span className="text-xs font-bold hidden md:inline">{currentUser.fullName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
            </button>

            {showProfileMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-40 text-xs text-slate-100">
                <div className="p-2 border-b border-slate-800/80 mb-2">
                  <p className="font-bold text-white truncate">{currentUser.fullName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{currentUser.jobTitle} - {currentUser.department}</p>
                </div>

                <button
                  onClick={() => handleOpenTab('user_management', 'المستخدمين والصلاحيات', 'Users & Security', 'user_management')}
                  className="w-full text-right p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span>{lang === 'ar' ? 'الملف الشخصي والصلاحيات' : 'Profile & Security'}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-right p-2 hover:bg-rose-950/35 text-rose-400 hover:text-rose-300 rounded-lg flex items-center gap-2 cursor-pointer transition-all mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Microsoft Office ribbon header layout */}
      <RibbonHeader lang={lang} onOpenTab={handleOpenTab} currentUser={currentUser} />

      {/* Browser tab layout list */}
      <div className="bg-slate-200/80 dark:bg-slate-950 border-b border-slate-300 dark:border-slate-800 flex justify-between items-center select-none px-4 py-1 gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            const isSecondary = secondaryActiveTabId === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-semibold cursor-pointer transition-all shrink-0 border relative ${
                  isActive 
                    ? 'bg-white dark:bg-slate-900 border-t-2 border-x-slate-300 dark:border-x-slate-700 border-b-transparent font-bold theme-accent-text theme-accent-border-t' 
                    : isSecondary && isSplitView
                    ? 'border-t-2 border-x-slate-300 dark:border-x-slate-700 font-bold theme-accent-light-bg theme-accent-text theme-accent-border-t opacity-90'
                    : 'bg-slate-200/50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-300/40 dark:hover:bg-slate-900/40'
                }`}
              >
                {/* Pin/Unpin */}
                {!tab.isPinned && (
                  <button
                    onClick={(e) => handleTogglePinTab(tab.id, e)}
                    className="text-slate-400 hover:text-amber-500 transition-colors"
                    title="تثبيت التبويب"
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                )}
                {tab.isPinned && (
                  <button
                    onClick={(e) => handleTogglePinTab(tab.id, e)}
                    className="text-amber-500 hover:text-slate-400 transition-colors"
                    title="إلغاء التثبيت"
                  >
                    <PinOff className="w-3 h-3" />
                  </button>
                )}
  
                <span>{lang === 'ar' ? tab.title : tab.titleEn}</span>
                
                {/* If Split View is active, offer button to send this tab to Pane 2 */}
                {isSplitView && !isSecondary && tab.id !== 'dashboard' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSecondaryActiveTabId(tab.id);
                    }}
                    className="p-0.5 rounded text-slate-400 hover:theme-accent-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    title={lang === 'ar' ? 'عرض في الشاشة ٢' : 'Show in Pane 2'}
                  >
                    <ArrowLeftRight className="w-2.5 h-2.5" />
                  </button>
                )}
  
                {/* Close (✖) */}
                {!tab.isPinned && (
                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="text-slate-400 hover:text-rose-500 font-bold p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
  
        {/* Side-by-Side Dual View Switch */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const newMode = !isSplitView;
              setIsSplitView(newMode);
              if (newMode && !secondaryActiveTabId) {
                const other = tabs.find(t => t.id !== activeTabId);
                if (other) {
                  setSecondaryActiveTabId(other.id);
                }
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
              isSplitView 
                ? 'theme-accent-bg theme-accent-border text-white shadow-sm font-extrabold' 
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'العرض الثنائي الجانبي (شاشتين)' : 'Split Side-by-Side'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Tab Body Render */}
      <main className="flex-1 bg-[#f0f2f5] dark:bg-[#090d16] flex">
        {/* Pinned sidebar containing quick commands directories */}
        <aside className="w-64 bg-slate-800 text-slate-300 border-r border-slate-700 hidden xl:flex flex-col p-4 justify-between shrink-0 shadow-inner">
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-3 px-2">
                {lang === 'ar' ? 'الوصول السريع للملفات' : 'FILE NAVIGATOR'}
              </h3>
              <div className="space-y-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleOpenTab(link.id, link.label, link.id, link.id, link.props)}
                      className="w-full text-right px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-blue-400" />
                      <span>{link.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <h4 className="text-[10px] font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#b89047]" />
              <span>{lang === 'ar' ? 'حماية الميزان دوت نت' : 'Al-Meezan Protection'}</span>
            </h4>
            <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
              {lang === 'ar' ? 'خوارزميات التوازن الحسابي الحائزة على براءة اختراع لمنع الأخطاء المحاسبية وتشفير القيود.' : 'Mathematical balance validation checks prevents journal entry errors and secures data.'}
            </p>
          </div>
        </aside>

        {/* Real-time Content Switcher inside Active Tab */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          {isSplitView ? (
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-3 p-3 bg-slate-200/40 dark:bg-slate-950/40 min-h-0">
              {/* Left Pane (displays activeTabId) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-sm min-h-0">
                {(() => {
                  const tab = tabs.find(t => t.id === activeTabId);
                  if (!tab) return (
                    <div className="p-8 text-center text-slate-400">
                      {lang === 'ar' ? 'الرجاء فتح شاشة' : 'Please open a tab'}
                    </div>
                  );
                  return (
                    <>
                      {renderTabHeaderControls(tab, 'left')}
                      <div className="flex-1 overflow-y-auto min-h-0 p-2">
                        {renderTabContent(tab)}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Right Pane (displays secondaryActiveTabId) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-sm min-h-0">
                {(() => {
                  const secondaryTab = tabs.find(t => t.id === secondaryActiveTabId);
                  if (!secondaryTab) return (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-4">
                      <LayoutDashboard className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse" />
                      <p className="text-xs font-semibold">
                        {lang === 'ar' ? 'يرجى اختيار التبويب المطلوب عرضه في الشاشة الثانية' : 'Please select a tab to show in Pane 2'}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                        {tabs.filter(t => t.id !== activeTabId).map(t => (
                          <button
                            key={t.id}
                            onClick={() => setSecondaryActiveTabId(t.id)}
                            className="bg-[#b89047]/10 hover:bg-[#b89047]/20 border border-[#b89047]/30 text-[#b89047] px-3 py-1.5 rounded text-[11px] font-bold transition-all cursor-pointer"
                          >
                            {lang === 'ar' ? t.title : t.titleEn}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                  return (
                    <>
                      {renderTabHeaderControls(secondaryTab, 'right')}
                      <div className="flex-1 overflow-y-auto min-h-0 p-2">
                        {renderTabContent(secondaryTab)}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            /* Single view mode (covers full screen width) */
            <div className="flex-1 p-1 md:p-1.5 flex flex-col min-h-0">
              {tabs.map((tab) => {
                const isActive = activeTabId === tab.id;
                if (!isActive) return null;
                return (
                  <div key={tab.id} className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-sm min-h-0">
                    {renderTabHeaderControls(tab, 'left')}
                    <div className="flex-1 overflow-y-auto p-1.5 md:p-3.5">
                      {renderTabContent(tab)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={() => {
          setProductRefreshKey(prev => prev + 1);
        }}
        lang={lang}
        currentUser={currentUser}
      />
    </div>
  );
}
