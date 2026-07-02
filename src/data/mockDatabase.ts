import { User, UserPermissions, AuditLog, Warehouse, Product, Invoice, InvoiceItem } from '../types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11).toUpperCase();

export const defaultPermissions = (isAdmin: boolean): UserPermissions => {
  const screens = ['dashboard', 'sales_invoice', 'purchase_invoice', 'stock_in', 'stock_out', 'stock_transfer', 'user_management', 'audit_logs', 'products', 'clients', 'vendors'];
  const screenPerms: any = {};
  
  screens.forEach(screen => {
    screenPerms[screen] = {
      view: true,
      add: isAdmin,
      edit: isAdmin,
      delete: isAdmin,
      approve: isAdmin,
      unapprove: isAdmin,
      print: true,
      export: true,
      importExcel: isAdmin,
      reopen: isAdmin,
      cancel: isAdmin,
      finalDelete: isAdmin,
    };
  });

  return {
    systemAccess: true,
    changePassword: true,
    viewDashboard: true,
    openMultiTabs: true,
    exportExcel: true,
    exportPdf: true,
    print: true,
    sendEmail: true,
    sendWhatsapp: true,
    backup: true,
    restore: isAdmin,
    screens: screenPerms,
  };
};

const INITIAL_WAREHOUSES: Warehouse[] = [
  { id: 'WH-01', code: 'WH001', name: 'مخزن المنتج التام', nameEn: 'Finished Goods Warehouse', location: 'المنطقة الصناعية - الجيزة', manager: 'أحمد محمود' },
  { id: 'WH-02', code: 'WH002', name: 'مخزن بولارس', nameEn: 'Polaris Warehouse', location: 'مجمع بولارس - أكتوبر', manager: 'يوسف شريف' },
  { id: 'WH-03', code: 'WH003', name: 'مخزن المرتجعات', nameEn: 'Returns Warehouse', location: 'الفرع الرئيسي - القاهرة', manager: 'سيد علي' },
  { id: 'WH-04', code: 'WH004', name: 'مخزن التالف', nameEn: 'Scrap/Damaged Warehouse', location: 'المنطقة الحرة - الإسكندرية', manager: 'محمد حسن' },
  { id: 'WH-05', code: 'WH005', name: 'مخزن الخامات', nameEn: 'Raw Materials Warehouse', location: 'بدر الصناعية', manager: 'كريم خالد' },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'P001', code: 'PROD-101', name: 'شاشة سامسونج LED 32', nameEn: 'Samsung LED Monitor 32"', barcode: '8806090123456', unit: 'عدد', category: 'إلكترونيات', price: 6500, cost: 5200, stock: 45, minLimit: 10, reorderLimit: 15, expiryDate: '2028-12-31', batchNo: 'B-SAM-2026', serialNo: 'SN-SAM-0012' },
  { id: 'P002', code: 'PROD-102', name: 'كابل HDMI فائق السرعة 3م', nameEn: 'Ultra HDMI Cable 3m', barcode: '6901234567890', unit: 'حبة', category: 'إكسسوارات', price: 250, cost: 120, stock: 150, minLimit: 20, reorderLimit: 30, expiryDate: '2030-01-01', batchNo: 'B-CAB-102', serialNo: 'SN-CAB-1122' },
  { id: 'P003', code: 'PROD-103', name: 'طابعة ليزر إتش بي Pro', nameEn: 'HP LaserJet Pro Printer', barcode: '0190781234567', unit: 'عدد', category: 'أجهزة مكتبية', price: 9800, cost: 8100, stock: 8, minLimit: 5, reorderLimit: 8, expiryDate: '2029-06-30', batchNo: 'B-HP-98', serialNo: 'SN-HP-33441' },
  { id: 'P004', code: 'PROD-104', name: 'ماوس لاسلكي لوجيتك', nameEn: 'Logitech Wireless Mouse', barcode: '0097855123456', unit: 'عدد', category: 'إكسسوارات', price: 450, cost: 300, stock: 4, minLimit: 10, reorderLimit: 15, expiryDate: '2031-12-31', batchNo: 'B-LOG-54', serialNo: 'SN-LOG-9922' }, // Low stock item
  { id: 'P005', code: 'PROD-105', name: 'حبر أسود طابعة HP 83A', nameEn: 'HP 83A Black Toner', barcode: '0887111234567', unit: 'علبة', category: 'أحبار', price: 1200, cost: 950, stock: 32, minLimit: 5, reorderLimit: 8, expiryDate: '2026-08-15', batchNo: 'B-TON-83A', serialNo: 'SN-TON-4411' }, // Near expiry date (Aug 2026)
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-1001',
    invoiceNo: 'SAL-2026-0001',
    date: '2026-06-25',
    type: 'sale',
    partnerId: 'C001',
    partnerName: 'شركة النور للمقاولات',
    warehouseId: 'WH-01',
    warehouseName: 'مخزن المنتج التام',
    representative: 'سامح ممدوح',
    paymentMethod: 'credit',
    currency: 'EGP',
    subTotal: 13000,
    discount: 500,
    tax: 1750,
    netAmount: 14250,
    paidAmount: 5000,
    remainingAmount: 9250,
    status: 'approved',
    createdBy: 'admin',
    createdAt: '2026-06-25T10:30:00Z',
    approvedBy: 'admin',
    approvedAt: '2026-06-25T10:35:00Z',
    branch: 'الفرع الرئيسي - القاهرة',
    company: 'الشركة العالمية للأعمال الجغرافية',
    items: [
      {
        id: 'ITEM-1',
        productCode: 'PROD-101',
        productName: 'شاشة سامسونج LED 32',
        barcode: '8806090123456',
        unit: 'عدد',
        quantity: 2,
        price: 6500,
        discount: 0,
        tax: 14,
        total: 13000,
        notes: 'تسليم فوري ومطابقة المواصفات',
      }
    ]
  },
  {
    id: 'INV-1002',
    invoiceNo: 'PUR-2026-0001',
    date: '2026-06-28',
    type: 'purchase',
    partnerId: 'V001',
    partnerName: 'المجموعة الهندسية للاستيراد',
    warehouseId: 'WH-05',
    warehouseName: 'مخزن الخامات',
    representative: 'أحمد محمود',
    paymentMethod: 'cash',
    currency: 'EGP',
    subTotal: 81000,
    discount: 1000,
    tax: 11200,
    netAmount: 91200,
    paidAmount: 91200,
    remainingAmount: 0,
    status: 'approved',
    createdBy: 'admin',
    createdAt: '2026-06-28T14:20:00Z',
    approvedBy: 'admin',
    approvedAt: '2026-06-28T14:25:00Z',
    branch: 'الفرع الرئيسي - القاهرة',
    company: 'الشركة العالمية للأعمال الجغرافية',
    items: [
      {
        id: 'ITEM-2',
        productCode: 'PROD-103',
        productName: 'طابعة ليزر إتش بي Pro',
        barcode: '0190781234567',
        unit: 'عدد',
        quantity: 10,
        price: 8100,
        discount: 0,
        tax: 14,
        total: 81000,
        notes: 'دفعة جديدة لخط الإنتاج',
      }
    ]
  }
];

export const mockDatabase = {
  // Clear and reset database helper
  reset() {
    localStorage.clear();
    this.init();
  },

  init() {
    // 1. Setup users
    const storedUsers = localStorage.getItem('sami_users');
    if (!storedUsers) {
      const adminUser: User = {
        id: 'USER-ADMIN',
        username: 'admin',
        fullName: 'المدير العام (أدمن)',
        password: '01278150',
        jobTitle: 'مدير النظام',
        department: 'الإدارة العليا',
        branch: 'الفرع الرئيسي - القاهرة',
        email: 'admin@samisystem.com',
        phone: '01278150',
        status: 'active',
        lastLogin: new Date().toISOString(),
        deviceInfo: 'متصفح النظام الافتراضي (Chrome)',
        permissions: defaultPermissions(true)
      };
      
      const guestUser: User = {
        id: 'USER-GUEST',
        username: 'guest',
        fullName: 'المحاسب المساعد',
        password: '123',
        jobTitle: 'محاسب',
        department: 'الحسابات',
        branch: 'فرع الجيزة',
        email: 'guest@samisystem.com',
        phone: '01122334455',
        status: 'active',
        lastLogin: '2026-06-30T09:00:00Z',
        deviceInfo: 'Firefox / Win11',
        permissions: defaultPermissions(false)
      };

      localStorage.setItem('sami_users', JSON.stringify([adminUser, guestUser]));
    }

    // 2. Setup warehouses
    if (!localStorage.getItem('sami_warehouses')) {
      localStorage.setItem('sami_warehouses', JSON.stringify(INITIAL_WAREHOUSES));
    }

    // 3. Setup products
    if (!localStorage.getItem('sami_products')) {
      localStorage.setItem('sami_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    // 4. Setup invoices
    if (!localStorage.getItem('sami_invoices')) {
      localStorage.setItem('sami_invoices', JSON.stringify(INITIAL_INVOICES));
    }

    // 5. Setup clients and vendors
    if (!localStorage.getItem('sami_partners')) {
      const partners = [
        { id: 'C001', type: 'client', name: 'شركة النور للمقاولات', phone: '01011112222', email: 'info@elnoor.com', address: 'التجمع الخامس, القاهرة', balance: -9250 },
        { id: 'C002', type: 'client', name: 'الهيئة العربية للتصنيع', phone: '01244445555', email: 'sales@aoi.com', address: 'مصر الجديدة, القاهرة', balance: 0 },
        { id: 'V001', type: 'vendor', name: 'المجموعة الهندسية للاستيراد', phone: '0223456789', email: 'eng_group@import.com', address: 'وسط البلد, القاهرة', balance: 0 },
        { id: 'V002', type: 'vendor', name: 'مؤسسة الرياض للأوراق والكرتون', phone: '0502233441', email: 'riyadh@paper.com', address: 'السادات الصناعية', balance: -15000 },
      ];
      localStorage.setItem('sami_partners', JSON.stringify(partners));
    }

    // 6. Setup Audit Log
    if (!localStorage.getItem('sami_audit_logs')) {
      const initialLogs: AuditLog[] = [
        {
          id: 'LOG-001',
          userId: 'USER-ADMIN',
          username: 'admin',
          action: 'تثبيت النظام',
          details: 'تهيئة وإطلاق النظام لأول مرة بنجاح وتوليد حساب الأدمن الافتراضي.',
          timestamp: '2026-06-01T08:00:00Z',
          ipAddress: '127.0.0.1',
          device: 'System Engine Server'
        },
        {
          id: 'LOG-002',
          userId: 'USER-ADMIN',
          username: 'admin',
          action: 'تسجيل دخول',
          details: 'تسجيل دخول ناجح لمدير النظام من لوحة التحكم.',
          timestamp: '2026-06-25T10:00:00Z',
          ipAddress: '192.168.1.15',
          device: 'Windows PC (Chrome)'
        },
        {
          id: 'LOG-003',
          userId: 'USER-ADMIN',
          username: 'admin',
          action: 'فاتورة مبيعات',
          details: 'إنشاء واعتماد فاتورة مبيعات برقم SAL-2026-0001 للعميل: شركة النور للمقاولات بقيمة 14,250 جنيه.',
          timestamp: '2026-06-25T10:35:00Z',
          ipAddress: '192.168.1.15',
          device: 'Windows PC (Chrome)'
        }
      ];
      localStorage.setItem('sami_audit_logs', JSON.stringify(initialLogs));
    }

    // 7. Active company & branch configs
    if (!localStorage.getItem('sami_active_company')) {
      localStorage.setItem('sami_active_company', 'سامي سيستم للحلول المحاسبية المتقدمة');
    }
    if (!localStorage.getItem('sami_active_branch')) {
      localStorage.setItem('sami_active_branch', 'الفرع الرئيسي - القاهرة');
    }
    if (!localStorage.getItem('sami_active_year')) {
      localStorage.setItem('sami_active_year', 'السنة المالية 2026');
    }
  },

  // Log action helper
  addAuditLog(userId: string, username: string, action: string, details: string) {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: 'LOG-' + generateId(),
      userId,
      username,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 254 + 1),
      device: navigator.userAgent.includes('Mobile') ? 'جوال ذكي (Android/iOS)' : 'حاسوب مكتبي (Windows PC / Chrome)'
    };
    logs.unshift(newLog); // Put most recent at top
    localStorage.setItem('sami_audit_logs', JSON.stringify(logs));
    return newLog;
  },

  // Getters
  getUsers(): User[] {
    return JSON.parse(localStorage.getItem('sami_users') || '[]');
  },

  saveUsers(users: User[]) {
    localStorage.setItem('sami_users', JSON.stringify(users));
  },

  getAuditLogs(): AuditLog[] {
    return JSON.parse(localStorage.getItem('sami_audit_logs') || '[]');
  },

  getWarehouses(): Warehouse[] {
    return JSON.parse(localStorage.getItem('sami_warehouses') || '[]');
  },

  saveWarehouses(wh: Warehouse[]) {
    localStorage.setItem('sami_warehouses', JSON.stringify(wh));
  },

  getProducts(): Product[] {
    return JSON.parse(localStorage.getItem('sami_products') || '[]');
  },

  saveProducts(prods: Product[]) {
    localStorage.setItem('sami_products', JSON.stringify(prods));
  },

  getInvoices(): Invoice[] {
    return JSON.parse(localStorage.getItem('sami_invoices') || '[]');
  },

  saveInvoices(invs: Invoice[]) {
    localStorage.setItem('sami_invoices', JSON.stringify(invs));
  },

  getPartners(): any[] {
    return JSON.parse(localStorage.getItem('sami_partners') || '[]');
  },

  savePartners(partners: any[]) {
    localStorage.setItem('sami_partners', JSON.stringify(partners));
  }
};
