import React, { useState } from 'react';
import { 
  Home, ShoppingBag, ShoppingCart, Package, Users, Briefcase, FileSpreadsheet, Settings, 
  Plus, List, ArrowLeftRight, ClipboardList, Database, FileText, LayoutDashboard, UserCheck, 
  ShieldCheck, BookOpen, Receipt, RefreshCw, Layers, DollarSign, Wallet, ShieldAlert, Cpu, Landmark, X
} from 'lucide-react';

interface RibbonHeaderProps {
  lang: 'ar' | 'en';
  onOpenTab: (tabId: string, title: string, titleEn: string, type: string, props?: any) => void;
  currentUser: any;
}

export default function RibbonHeader({ lang, onOpenTab, currentUser }: RibbonHeaderProps) {
  const [activeRibbon, setActiveRibbon] = useState<'home' | 'sales' | 'purchases' | 'inventory' | 'hr' | 'settings'>('home');

  const ribbonTabs = [
    { id: 'home', label: 'الرئيسية', labelEn: 'Home', icon: Home },
    { id: 'sales', label: 'المبيعات', labelEn: 'Sales', icon: ShoppingBag },
    { id: 'purchases', label: 'المشتريات', labelEn: 'Purchases', icon: ShoppingCart },
    { id: 'inventory', label: 'المخازن والأصناف', labelEn: 'Inventory', icon: Package },
    { id: 'hr', label: 'الموارد البشرية والعملاء', labelEn: 'HR & CRM', icon: Briefcase },
    { id: 'settings', label: 'المستخدمون والصلاحيات', labelEn: 'Settings & Security', icon: Settings },
  ];

  const handleAction = (type: string, titleAr: string, titleEn: string, extraProps?: any) => {
    // Check screen access permission if restricted
    const screenIdMap: { [key: string]: string } = {
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
      'accounting_ledger': 'dashboard',
      'pos_view': 'sales_invoice',
      'inventory_master': 'products',
      'hr_crm_portal': 'user_management',
      'enterprise_extra': 'dashboard'
    };

    const targetPermission = screenIdMap[type];
    if (targetPermission && currentUser && currentUser.permissions) {
      const userPerms = currentUser.permissions.screens[targetPermission];
      if (userPerms && !userPerms.view) {
        alert(lang === 'ar' ? `ليس لديك صلاحية لعرض شاشة: ${titleAr}` : `You do not have permission to view: ${titleEn}`);
        return;
      }
    }

    onOpenTab(type, titleAr, titleEn, type, extraProps);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 shadow-sm">
      {/* Ribbon Tabs headers */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/40 px-4">
        {ribbonTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeRibbon === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveRibbon(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                isActive 
                  ? 'bg-white dark:bg-slate-900 shadow-sm theme-accent-border theme-accent-text' 
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:theme-accent-text hover:bg-slate-200/50 dark:hover:bg-slate-900/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{lang === 'ar' ? tab.label : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Ribbon Toolbar Content (Office Style) */}
      <div className="p-2 bg-white dark:bg-slate-900 flex flex-wrap items-center gap-4 min-h-[72px] overflow-x-auto">
        {activeRibbon === 'home' && (
          <>
            <button
              onClick={() => handleAction('dashboard', 'لوحة التحكم', 'Dashboard')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:theme-accent-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'لوحة القيادة' : 'Dashboard'}</span>
            </button>

            <button
              onClick={() => handleAction('accounting_ledger', 'مجمع القيود والأنظمة المالية', 'General Ledger & Journal')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:theme-accent-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <BookOpen className="w-5 h-5 theme-accent-text" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'الدفاتر المحاسبية' : 'General Ledger'}</span>
            </button>

            <button
              onClick={() => handleAction('audit_logs', 'سجل العمليات والرقابة', 'Audit Logs')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:theme-accent-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <ClipboardList className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'سجل الحركات' : 'Audit Logs'}</span>
            </button>
            <button
              onClick={() => handleAction('backup', 'النسخ الاحتياطي والأرشيف', 'Backup & Restore')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:theme-accent-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <Database className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'النسخ والنسخ' : 'Backups'}</span>
            </button>
          </>
        )}

        {activeRibbon === 'sales' && (
          <>
            <button
              onClick={() => handleAction('sales_invoice', 'فاتورة مبيعات جديدة', 'New Sales Invoice', { mode: 'create' })}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:theme-accent-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'فاتورة بيع' : 'New Sale'}</span>
            </button>

            <button
              onClick={() => handleAction('sales_return', 'مرتجع مبيعات جديد', 'New Sales Return')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <RefreshCw className="w-5 h-5 text-amber-500" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'مرتجع بيع' : 'Sale Return'}</span>
            </button>

            <button
              onClick={() => handleAction('pos_view', 'شاشة مبيعات الكاشير POS', 'POS Terminal Workspace')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:theme-accent-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'نقاط البيع POS' : 'POS Terminal'}</span>
            </button>

            <button
              onClick={() => handleAction('clients', 'دليل العملاء المعتمدين', 'Client Directory')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:theme-accent-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'دليل العملاء' : 'Clients'}</span>
            </button>
          </>
        )}

        {activeRibbon === 'purchases' && (
          <>
            <button
              onClick={() => handleAction('purchase_invoice', 'فاتورة مشتريات جديدة', 'New Purchase Invoice', { mode: 'create' })}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:theme-accent-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'فاتورة شراء' : 'New Purchase'}</span>
            </button>

            <button
              onClick={() => handleAction('purchase_return', 'مرتجع مشتريات جديد', 'New Purchase Return')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <RefreshCw className="w-5 h-5 text-rose-500" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'مرتجع شراء' : 'Purchase Return'}</span>
            </button>

            <button
              onClick={() => handleAction('vendors', 'دليل الموردين والمستودع', 'Vendor Directory')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:theme-accent-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'الموردون' : 'Vendors'}</span>
            </button>
          </>
        )}

        {activeRibbon === 'inventory' && (
          <>
            <button
              onClick={() => handleAction('products', 'دليل كارت الصنف والأسعار', 'Product Master Data')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:theme-accent-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <List className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'كارت الصنف' : 'Item Card'}</span>
            </button>

            <button
              onClick={() => handleAction('inventory_master', 'جرد المستودعات وتعديل المخزون', 'Warehouse Jard & Stock Adjustment')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:theme-accent-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'جرد المستودعات' : 'Stock Jard'}</span>
            </button>

            <button
              onClick={() => handleAction('stock_in', 'إذن إضافة مخزني جديد', 'New Stock Inbound')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <Plus className="w-5 h-5 text-emerald-500" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'إذن إضافة' : 'Stock In'}</span>
            </button>

            <button
              onClick={() => handleAction('stock_out', 'إذن صرف مخزني جديد', 'New Stock Outbound')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <X className="w-5 h-5 text-rose-500" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'إذن صرف' : 'Stock Out'}</span>
            </button>

            <button
              onClick={() => handleAction('stock_transfer', 'تحويل بين المخازن اللوجستية', 'Warehouse Transfer')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:theme-accent-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <ArrowLeftRight className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'تحويل مخزني' : 'Transfer'}</span>
            </button>
          </>
        )}

        {activeRibbon === 'hr' && (
          <>
            <button
              onClick={() => handleAction('hr_crm_portal', 'بوابة الموظفين والرواتب والبصمة الحيوية', 'Employee Biometrics & Salaries')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:theme-accent-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'شؤون الموظفين' : 'HR Portal'}</span>
            </button>

            <button
              onClick={() => handleAction('user_management', 'المستخدمين والصلاحيات والدرجات', 'Users & Security')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:theme-accent-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <Settings className="w-5 h-5 text-slate-500" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'صلاحيات المستخدمين' : 'Permissions'}</span>
            </button>
          </>
        )}

        {activeRibbon === 'settings' && (
          <>
            <button
              onClick={() => handleAction('enterprise_extra', 'إعدادات فروع الشركة والربط البرمجي السحابي', 'Enterprise Branches & Web APIs')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:theme-accent-text dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <Cpu className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'الربط والفروع' : 'API & Branches'}</span>
            </button>

            <button
              onClick={() => handleAction('enterprise_extra', 'لوحة المتابعة وغرفة التنبيهات المبرمجة', 'Enterprise Alert Desk')}
              className="flex flex-col items-center gap-1 p-2 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer min-w-[70px]"
            >
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'التنبيهات والمتابعة' : 'System Alerts'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
