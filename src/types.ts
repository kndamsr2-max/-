export interface User {
  id: string;
  username: string;
  fullName: string;
  password?: string; // Stored securely/locally
  jobTitle: string;
  department: string;
  branch: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  status: 'active' | 'suspended';
  lastLogin?: string;
  deviceInfo?: string;
  permissions: UserPermissions;
}

export interface UserPermissions {
  // General Permissions
  systemAccess: boolean;
  changePassword: boolean;
  viewDashboard: boolean;
  openMultiTabs: boolean;
  exportExcel: boolean;
  exportPdf: boolean;
  print: boolean;
  sendEmail: boolean;
  sendWhatsapp: boolean;
  backup: boolean;
  restore: boolean;

  // Screen specific permissions (key is screenId, value is action permissions)
  screens: {
    [screenId: string]: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
      approve: boolean; // اعتماد
      unapprove: boolean; // إلغاء اعتماد
      print: boolean;
      export: boolean;
      importExcel: boolean;
      reopen: boolean;
      cancel: boolean;
      finalDelete: boolean;
    };
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string; // e.g., "تسجيل دخول", "إنشاء فاتورة مبيعات", "تعديل مستخدم"
  details: string;
  timestamp: string;
  ipAddress: string;
  device: string;
}

export interface Tab {
  id: string;
  title: string;
  titleEn: string;
  type: string; // 'dashboard' | 'invoice' | 'user-management' | 'audit-log' | 'products' | 'warehouses' | 'clients' | 'vendors' | 'accounts' | 'transfers' | 'backup'
  isPinned?: boolean;
  props?: any; // Additional arguments, e.g. invoiceId
}

export interface Warehouse {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  location: string;
  manager: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  barcode: string;
  unit: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minLimit: number;
  reorderLimit: number;
  expiryDate?: string;
  batchNo?: string;
  serialNo?: string;
}

export interface InvoiceItem {
  id: string;
  productCode: string;
  productName: string;
  barcode: string;
  unit: string;
  quantity: number;
  weight?: number; // for physical store items
  price: number;
  discount: number; // percentage
  tax: number; // percentage
  total: number;
  batchNo?: string;
  lotNo?: string;
  color?: string;
  size?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  type: 'sale' | 'purchase' | 'sale_return' | 'purchase_return' | 'stock_in' | 'stock_out' | 'transfer';
  partnerId: string; // Client or Vendor ID or Warehouse ID (for transfer)
  partnerName: string;
  warehouseId: string;
  warehouseName: string;
  representative: string;
  paymentMethod: 'cash' | 'credit' | 'bank';
  currency: string;
  items: InvoiceItem[];
  subTotal: number;
  discount: number; // flat or percentage discount
  tax: number; // tax total
  netAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'draft' | 'approved' | 'cancelled';
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  branch: string;
  company: string;
}
