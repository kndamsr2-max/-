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
  getDbKey(suffix: string): string {
    const activeDbId = localStorage.getItem('sami_active_db_id') || 'default';
    if (activeDbId === 'default') {
      return `sami_${suffix}`;
    }
    return `sami_db_${activeDbId}_${suffix}`;
  },

  getDatabases(): any[] {
    const list = localStorage.getItem('sami_databases');
    if (!list) {
      const defaultList = [
        { id: 'default', name: 'قاعدة البيانات الرئيسية (الميزان)', nameEn: 'Main Database (Al-Meezan)', createdAt: '2026-06-30' }
      ];
      localStorage.setItem('sami_databases', JSON.stringify(defaultList));
      return defaultList;
    }
    return JSON.parse(list);
  },

  saveDatabases(list: any[]) {
    localStorage.setItem('sami_databases', JSON.stringify(list));
  },

  getActiveDatabaseId(): string {
    return localStorage.getItem('sami_active_db_id') || 'default';
  },

  setActiveDatabaseId(id: string) {
    localStorage.setItem('sami_active_db_id', id);
    this.init();
  },

  createDatabase(name: string, nameEn: string): any {
    const dbs = this.getDatabases();
    const newId = 'db_' + Date.now().toString().slice(-6);
    const newDb = {
      id: newId,
      name,
      nameEn,
      createdAt: new Date().toISOString().split('T')[0]
    };
    dbs.push(newDb);
    this.saveDatabases(dbs);
    
    // Switch to newly created database
    this.setActiveDatabaseId(newId);
    return newDb;
  },

  reset() {
    localStorage.clear();
    this.init();
  },

  init() {
    // 1. Setup users
    const storedUsers = localStorage.getItem(this.getDbKey('users'));
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

      localStorage.setItem(this.getDbKey('users'), JSON.stringify([adminUser, guestUser]));
    }

    // 2. Setup warehouses
    if (!localStorage.getItem(this.getDbKey('warehouses'))) {
      localStorage.setItem(this.getDbKey('warehouses'), JSON.stringify(INITIAL_WAREHOUSES));
    }

    // 3. Setup products
    if (!localStorage.getItem(this.getDbKey('products'))) {
      localStorage.setItem(this.getDbKey('products'), JSON.stringify(INITIAL_PRODUCTS));
    }

    // 4. Setup invoices
    if (!localStorage.getItem(this.getDbKey('invoices'))) {
      localStorage.setItem(this.getDbKey('invoices'), JSON.stringify(INITIAL_INVOICES));
    }

    // 5. Setup clients and vendors
    if (!localStorage.getItem(this.getDbKey('partners'))) {
      const partners = [
        { id: 'C001', type: 'client', name: 'شركة النور للمقاولات', phone: '01011112222', email: 'info@elnoor.com', address: 'التجمع الخامس, القاهرة', balance: -9250 },
        { id: 'C002', type: 'client', name: 'الهيئة العربية للتصنيع', phone: '01244445555', email: 'sales@aoi.com', address: 'مصر الجديدة, القاهرة', balance: 0 },
        { id: 'V001', type: 'vendor', name: 'المجموعة الهندسية للاستيراد', phone: '0223456789', email: 'eng_group@import.com', address: 'وسط البلد, القاهرة', balance: 0 },
        { id: 'V002', type: 'vendor', name: 'مؤسسة الرياض للأوراق والكرتون', phone: '0502233441', email: 'riyadh@paper.com', address: 'السادات الصناعية', balance: -15000 },
      ];
      localStorage.setItem(this.getDbKey('partners'), JSON.stringify(partners));
    }

    // 6. Setup Audit Log
    if (!localStorage.getItem(this.getDbKey('audit_logs'))) {
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
      localStorage.setItem(this.getDbKey('audit_logs'), JSON.stringify(initialLogs));
    }

    // 7. Active company & branch configs
    if (!localStorage.getItem(this.getDbKey('active_company'))) {
      localStorage.setItem(this.getDbKey('active_company'), 'الميزان للحلول المحاسبية المتقدمة');
    }
    if (!localStorage.getItem(this.getDbKey('active_branch'))) {
      localStorage.setItem(this.getDbKey('active_branch'), 'الفرع الرئيسي');
    }
    if (!localStorage.getItem(this.getDbKey('active_year'))) {
      localStorage.setItem(this.getDbKey('active_year'), 'السنة المالية 2026');
    }

    // 8. Accounting Systems Initialization
    if (!localStorage.getItem(this.getDbKey('accounts'))) {
      const DEFAULT_ACCOUNTS = [
        { code: '1000', name: 'الأصول الثابتة', nameEn: 'Fixed Assets', type: 'asset', balance: 450000 },
        { code: '1101', name: 'الخزينة الرئيسية - صندوق القاهرة', nameEn: 'Main Safe Box - Cairo', type: 'asset', balance: 215000 },
        { code: '1102', name: 'البنك التجاري الدولي CIB', nameEn: 'CIB Bank Account', type: 'asset', balance: 1450000 },
        { code: '1201', name: 'مخزون المنتجات التامة', nameEn: 'Finished Goods Inventory', type: 'asset', balance: 350000 },
        { code: '1301', name: 'العملاء والذمم المدينة', nameEn: 'Accounts Receivable', type: 'asset', balance: 0 },
        { code: '2101', name: 'الموردون والدائنون المعتمدون', nameEn: 'Accounts Payable', type: 'liability', balance: 185000 },
        { code: '2201', name: 'مخصص إهلاك الأصول المتراكم', nameEn: 'Accumulated Depreciation', type: 'liability', balance: 45000 },
        { code: '3000', name: 'رأس مال شركة سامي سيستم', nameEn: 'Owner Equity Capital', type: 'equity', balance: 2000000 },
        { code: '3101', name: 'الأرباح المحتجزة / أرصدة افتتاحية', nameEn: 'Retained Earnings / Opening Balances', type: 'equity', balance: 150000 },
        { code: '4101', name: 'إيرادات مبيعات الأجهزة الفورية', nameEn: 'Sales Revenues', type: 'revenue', balance: 530000 },
        { code: '5100', name: 'تكلفة المبيعات (تكلفة البضاعة المباعة)', nameEn: 'Cost of Goods Sold', type: 'expense', balance: 0 },
        { code: '5101', name: 'مصروفات الإيجار السنوي', nameEn: 'Rent Expenses', type: 'expense', balance: 120000 },
        { code: '5102', name: 'مصروفات المرتبات والأجور الكلية', nameEn: 'Salaries Expenses', type: 'expense', balance: 280000 },
        { code: '5103', name: 'مصروفات عمومية وإدارية', nameEn: 'General & Admin Expenses', type: 'expense', balance: 45000 },
      ];
      localStorage.setItem(this.getDbKey('accounts'), JSON.stringify(DEFAULT_ACCOUNTS));
    }
    if (!localStorage.getItem(this.getDbKey('journal_entries'))) {
      const DEFAULT_JOURNAL_ENTRIES = [
        { id: 'JV-101', date: '2026-06-20', desc: 'إثبات سداد الإيجار السنوي للمقر الرئيسي', debitAcc: '5101', creditAcc: '1102', amount: 15000, status: 'approved' },
        { id: 'JV-102', date: '2026-06-24', desc: 'شراء أجهزة مكتبية ومقاعد فرع الجيزة', debitAcc: '1000', creditAcc: '1101', amount: 45000, status: 'approved' },
        { id: 'JV-103', date: '2026-06-28', desc: 'تحصيل دفعة بشيك من شركة النور', debitAcc: '1102', creditAcc: '2101', amount: 80000, status: 'approved' }
      ];
      localStorage.setItem(this.getDbKey('journal_entries'), JSON.stringify(DEFAULT_JOURNAL_ENTRIES));
    }
    if (!localStorage.getItem(this.getDbKey('expenses'))) {
      const DEFAULT_EXPENSES = [
        { id: 1, date: '2026-06-15', category: 'كهرباء ومياه', accountCode: '5103', amount: 4500, paidVia: 'cash', notes: 'سداد فاتورة كهرباء مخزن بولارس' },
        { id: 2, date: '2026-06-18', category: 'صيانة وشحن المبيعات', accountCode: '5103', amount: 2800, paidVia: 'cib', notes: 'صيانة مكيفات صالة المبيعات الرئيسية' },
        { id: 3, date: '2026-06-25', category: 'مرتبات مستشارين فنيين', accountCode: '5102', amount: 35000, paidVia: 'cib', notes: 'سداد تعاقد الاستشارات التقنية' }
      ];
      localStorage.setItem(this.getDbKey('expenses'), JSON.stringify(DEFAULT_EXPENSES));
    }
    if (!localStorage.getItem(this.getDbKey('cheques'))) {
      const DEFAULT_CHEQUES = [
        { id: 'CHQ-9901', bank: 'البنك التجاري الدولي CIB', chqNo: 'CIB-001290', amount: 150000, type: 'incoming', drawer: 'شركة النور للمقاولات', dueDate: '2026-07-15', status: 'pending' },
        { id: 'CHQ-9902', bank: 'بنك قطر الوطني QNB', chqNo: 'QNB-881200', amount: 45000, type: 'outgoing', drawer: 'شركة النصر للكرتون', dueDate: '2026-06-28', status: 'collected' },
        { id: 'CHQ-9903', bank: 'بنك مصر - فرع البطل', chqNo: 'MISR-041922', amount: 95000, type: 'incoming', drawer: 'مؤسسة الرياض للأوراق', dueDate: '2026-07-20', status: 'pending' },
        { id: 'CHQ-9904', bank: 'البنك الأهلي المصري', chqNo: 'NBE-331201', amount: 60000, type: 'outgoing', drawer: 'مورد الأخشاب المعتمد', dueDate: '2026-07-05', status: 'bounced' }
      ];
      localStorage.setItem(this.getDbKey('cheques'), JSON.stringify(DEFAULT_CHEQUES));
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
    localStorage.setItem(this.getDbKey('audit_logs'), JSON.stringify(logs));
    return newLog;
  },

  // Getters
  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(this.getDbKey('users')) || '[]');
  },

  saveUsers(users: User[]) {
    localStorage.setItem(this.getDbKey('users'), JSON.stringify(users));
  },

  getAuditLogs(): AuditLog[] {
    return JSON.parse(localStorage.getItem(this.getDbKey('audit_logs')) || '[]');
  },

  getWarehouses(): Warehouse[] {
    return JSON.parse(localStorage.getItem(this.getDbKey('warehouses')) || '[]');
  },

  saveWarehouses(wh: Warehouse[]) {
    localStorage.setItem(this.getDbKey('warehouses'), JSON.stringify(wh));
  },

  getProducts(): Product[] {
    return JSON.parse(localStorage.getItem(this.getDbKey('products')) || '[]');
  },

  saveProducts(prods: Product[]) {
    localStorage.setItem(this.getDbKey('products'), JSON.stringify(prods));
  },

  getInvoices(): Invoice[] {
    return JSON.parse(localStorage.getItem(this.getDbKey('invoices')) || '[]');
  },

  saveInvoices(invs: Invoice[]) {
    localStorage.setItem(this.getDbKey('invoices'), JSON.stringify(invs));
  },

  getPartners(): any[] {
    return JSON.parse(localStorage.getItem(this.getDbKey('partners')) || '[]');
  },

  savePartners(partners: any[]) {
    localStorage.setItem(this.getDbKey('partners'), JSON.stringify(partners));
  },

  // Accounting Ledger helper methods
  getAccounts() {
    return JSON.parse(localStorage.getItem(this.getDbKey('accounts')) || '[]');
  },

  saveAccounts(accs: any[]) {
    localStorage.setItem(this.getDbKey('accounts'), JSON.stringify(accs));
  },

  getJournalEntries() {
    return JSON.parse(localStorage.getItem(this.getDbKey('journal_entries')) || '[]');
  },

  saveJournalEntries(entries: any[]) {
    localStorage.setItem(this.getDbKey('journal_entries'), JSON.stringify(entries));
  },

  getExpenses() {
    return JSON.parse(localStorage.getItem(this.getDbKey('expenses')) || '[]');
  },

  saveExpenses(exps: any[]) {
    localStorage.setItem(this.getDbKey('expenses'), JSON.stringify(exps));
  },

  getCheques() {
    return JSON.parse(localStorage.getItem(this.getDbKey('cheques')) || '[]');
  },

  saveCheques(chqs: any[]) {
    localStorage.setItem(this.getDbKey('cheques'), JSON.stringify(chqs));
  },

  postJournalEntry(date: string, desc: string, debitAccCode: string, creditAccCode: string, amount: number) {
    if (amount <= 0) return null;
    const accounts = this.getAccounts();
    const updated = accounts.map((acc: any) => {
      if (acc.code === debitAccCode) {
        const isDebitIncrease = acc.type === 'asset' || acc.type === 'expense';
        return { ...acc, balance: isDebitIncrease ? acc.balance + amount : acc.balance - amount };
      }
      if (acc.code === creditAccCode) {
        const isDebitIncrease = acc.type === 'asset' || acc.type === 'expense';
        return { ...acc, balance: isDebitIncrease ? acc.balance - amount : acc.balance + amount };
      }
      return acc;
    });
    this.saveAccounts(updated);

    const entries = this.getJournalEntries();
    const newEntry = {
      id: `JV-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`,
      date,
      desc,
      debitAcc: debitAccCode,
      creditAcc: creditAccCode,
      amount,
      status: 'approved'
    };
    entries.unshift(newEntry);
    this.saveJournalEntries(entries);
    return newEntry;
  },

  autoPostInvoiceJournalEntry(invoice: Invoice) {
    if (invoice.status !== 'approved') return;
    
    // Check if we already have a JV for this invoice to prevent double posting
    const entries = this.getJournalEntries();
    const exists = entries.some((e: any) => e.desc.includes(invoice.invoiceNo));
    if (exists) return;

    const date = invoice.date;
    const netAmount = invoice.netAmount;
    
    // Prepare accounts
    let debitAcc = '1101'; // Default cash
    if (invoice.paymentMethod === 'bank') {
      debitAcc = '1102'; // CIB
    } else if (invoice.paymentMethod === 'credit') {
      debitAcc = '1301'; // Accounts Receivable
    }

    if (invoice.type === 'sale') {
      // 1. Principal Sale Entry: Debit Cash/Bank/AR, Credit Sales Revenue ('4101')
      const desc = `قيد مبيعات تلقائي للفاتورة رقم ${invoice.invoiceNo} - العميل: ${invoice.partnerName}`;
      this.postJournalEntry(date, desc, debitAcc, '4101', netAmount);

      // 2. Inventory Cost Entry: Debit Cost of Goods Sold ('5100'), Credit Inventory ('1201')
      const allProducts = this.getProducts();
      let totalCost = 0;
      invoice.items.forEach(item => {
        const prod = allProducts.find(p => p.code === item.productCode);
        const itemCost = prod ? prod.cost : item.price * 0.75; // fallback
        totalCost += itemCost * item.quantity;
      });
      if (totalCost > 0) {
        const costDesc = `تكلفة مبيعات تلقائية للفاتورة رقم ${invoice.invoiceNo}`;
        this.postJournalEntry(date, costDesc, '5100', '1201', totalCost);
      }
    } else if (invoice.type === 'purchase') {
      // 1. Purchase Entry: Debit Inventory ('1201'), Credit Cash/Bank/AP
      let creditAcc = '1101';
      if (invoice.paymentMethod === 'bank') {
        creditAcc = '1102';
      } else if (invoice.paymentMethod === 'credit') {
        creditAcc = '2101'; // Accounts Payable
      }
      const desc = `قيد مشتريات تلقائي للفاتورة رقم ${invoice.invoiceNo} - المورد: ${invoice.partnerName}`;
      this.postJournalEntry(date, desc, '1201', creditAcc, netAmount);
    } else if (invoice.type === 'sale_return') {
      // Sales Return: Debit Sales Revenue / Returns, Credit Cash/Bank/AR
      let creditAcc = '1101';
      if (invoice.paymentMethod === 'bank') {
        creditAcc = '1102';
      } else if (invoice.paymentMethod === 'credit') {
        creditAcc = '1301';
      }
      const desc = `قيد مرتجع مبيعات تلقائي للفاتورة رقم ${invoice.invoiceNo}`;
      this.postJournalEntry(date, desc, '4101', creditAcc, netAmount);

      // Inventory return: Debit Inventory ('1201'), Credit COGS ('5100')
      const allProducts = this.getProducts();
      let totalCost = 0;
      invoice.items.forEach(item => {
        const prod = allProducts.find(p => p.code === item.productCode);
        const itemCost = prod ? prod.cost : item.price * 0.75;
        totalCost += itemCost * item.quantity;
      });
      if (totalCost > 0) {
        const costDesc = `إرجاع تكلفة مبيعات تلقائي للفاتورة رقم ${invoice.invoiceNo}`;
        this.postJournalEntry(date, costDesc, '1201', '5100', totalCost);
      }
    } else if (invoice.type === 'purchase_return') {
      // Purchase Return: Debit Cash/Bank/AP, Credit Inventory ('1201')
      let debitAcc = '1101';
      if (invoice.paymentMethod === 'bank') {
        debitAcc = '1102';
      } else if (invoice.paymentMethod === 'credit') {
        debitAcc = '2101';
      }
      const desc = `قيد مرتجع مشتريات تلقائي للفاتورة رقم ${invoice.invoiceNo}`;
      this.postJournalEntry(date, desc, debitAcc, '1201', netAmount);
    }
  }
};
