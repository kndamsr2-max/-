import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Printer, FileSpreadsheet, FileText, Send, MessageSquare, 
  Copy, X, Check, Undo, RefreshCw, ZoomIn, ZoomOut, Save, Search, Calendar, ChevronDown,
  CheckCircle2, AlertTriangle, AlertOctagon, ShieldCheck, Activity
} from 'lucide-react';
import { mockDatabase } from '../data/mockDatabase';
import { Invoice, InvoiceItem, Product, Warehouse } from '../types';
import ProductModal from './ProductModal';

interface InvoiceViewProps {
  lang: 'ar' | 'en';
  invoiceId?: string; // If viewing/editing existing invoice
  invoiceType: 'sale' | 'purchase' | 'sale_return' | 'purchase_return' | 'stock_in' | 'stock_out' | 'transfer';
  currentUser: any;
  onClose: () => void;
  onRefreshDashboard?: () => void;
}

export default function InvoiceView({ 
  lang, invoiceId, invoiceType, currentUser, onClose, onRefreshDashboard 
}: InvoiceViewProps) {
  // Database seed loaded
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [partners, setPartners] = useState<any[]>([]);

  // Invoice Fields
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [partnerId, setPartnerId] = useState('');
  const [warehouseId, setWarehouseId] = useState('WH-01');
  const [representative, setRepresentative] = useState('سامح ممدوح');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'bank'>('cash');
  const [currency, setCurrency] = useState('EGP');
  
  // Grid Items Table
  const [items, setItems] = useState<InvoiceItem[]>([]);
  
  // Footer calculation states
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isApproved, setIsApproved] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);

  // Search barcode input
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Compliance Diagnostics state
  const [isScanning, setIsScanning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  // Selected Excel Cell context & live formula tracking
  const [activeCell, setActiveCell] = useState<{ row: number, col: string, value: string | number, field: string } | null>({ row: 1, col: 'A', value: '', field: 'productCode' });

  useEffect(() => {
    mockDatabase.init();
    const prods = mockDatabase.getProducts();
    const whs = mockDatabase.getWarehouses();
    const parts = mockDatabase.getPartners().filter(p => {
      if (invoiceType === 'sale' || invoiceType === 'sale_return' || invoiceType === 'stock_out') {
        return p.type === 'client';
      } else {
        return p.type === 'vendor';
      }
    });
    
    setProducts(prods);
    setWarehouses(whs);
    setPartners(parts);

    if (invoiceId) {
      // Edit mode: Load invoice from DB
      const invoices = mockDatabase.getInvoices();
      const existing = invoices.find(inv => inv.id === invoiceId);
      if (existing) {
        setInvoiceNo(existing.invoiceNo);
        setDate(existing.date);
        setPartnerId(existing.partnerId);
        setWarehouseId(existing.warehouseId);
        setRepresentative(existing.representative);
        setPaymentMethod(existing.paymentMethod);
        setCurrency(existing.currency);
        setItems(existing.items);
        setDiscountValue(existing.discount);
        setPaidAmount(existing.paidAmount);
        setIsApproved(existing.status === 'approved');
        setIsCancelled(existing.status === 'cancelled');
      }
    } else {
      // New mode: Auto-generate invoice number
      const invoices = mockDatabase.getInvoices();
      const nextNum = invoices.filter(i => i.type === invoiceType).length + 1;
      const prefix = invoiceType === 'sale' ? 'SAL' : (invoiceType === 'purchase' ? 'PUR' : (invoiceType === 'sale_return' ? 'SRT' : (invoiceType === 'purchase_return' ? 'PRT' : (invoiceType === 'stock_in' ? 'STK-IN' : (invoiceType === 'stock_out' ? 'STK-OUT' : 'TRF')))));
      const formattedNo = `${prefix}-2026-${nextNum.toString().padStart(4, '0')}`;
      setInvoiceNo(formattedNo);
      
      // Seed at least one empty row
      addNewRow();
    }
  }, [invoiceId, invoiceType]);

  // Calculations
  const subTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  // Total tax: 14% on total after discount or basic tax calculation
  const totalTax = items.reduce((sum, item) => {
    const itemSub = item.price * item.quantity;
    const itemDisc = itemSub * (item.discount / 100);
    return sum + ((itemSub - itemDisc) * (item.tax / 100));
  }, 0);
  
  const netAmount = subTotal - discountValue + totalTax;
  const remainingAmount = Math.max(0, netAmount - paidAmount);

  const getInvoiceTypeInfo = () => {
    switch (invoiceType) {
      case 'sale':
        return {
          titleAr: 'فاتورة مبيعات ضريبية ممتازة',
          titleEn: 'Tax Sales Invoice',
          color: 'bg-[#b89047] text-black border-[#b89047]',
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/30'
        };
      case 'sale_return':
        return {
          titleAr: 'فاتورة مرتجع مبيعات معتمدة',
          titleEn: 'Sales Return Invoice',
          color: 'bg-[#b89047] text-black border-[#b89047]',
          badgeColor: 'bg-amber-100 text-[#b89047] dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/30'
        };
      case 'purchase':
        return {
          titleAr: 'فاتورة شراء وتوريد مخزني',
          titleEn: 'Warehouse Purchase Invoice',
          color: 'bg-emerald-600 text-white border-emerald-600',
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/30'
        };
      case 'purchase_return':
        return {
          titleAr: 'فاتورة مرتجع مشتريات للمورد',
          titleEn: 'Purchase Return Invoice',
          color: 'bg-rose-600 text-white border-rose-600',
          badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-500/30'
        };
      case 'stock_in':
        return {
          titleAr: 'إذن توريد وإضافة مخزنية عينية',
          titleEn: 'Warehouse Inbound Receipt',
          color: 'bg-teal-600 text-white border-teal-600',
          badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-500/30'
        };
      case 'stock_out':
        return {
          titleAr: 'إذن صرف بضائع وتصدير مخزني',
          titleEn: 'Warehouse Outbound Delivery',
          color: 'bg-orange-600 text-white border-orange-600',
          badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-500/30'
        };
      case 'transfer':
        return {
          titleAr: 'إذن تحويل ونقل بين المستودعات',
          titleEn: 'Warehouse Transfer Voucher',
          color: 'bg-indigo-600 text-white border-indigo-600',
          badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-500/30'
        };
      default:
        return {
          titleAr: 'مستند مالي مخزني',
          titleEn: 'Voucher Invoice',
          color: 'bg-slate-600 text-white border-slate-600',
          badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-950/40 dark:text-slate-400 border border-slate-500/30'
        };
    }
  };

  const runComplianceTests = () => {
    const tests = [];

    if (invoiceType === 'sale') {
      const hasCorrectTax = items.every(item => item.tax === 14 || item.productCode === '');
      const calculatedTax = items.reduce((sum, item) => sum + (item.price * item.quantity * (1 - item.discount/100) * 0.14), 0);
      const matchesTax = Math.abs(calculatedTax - totalTax) < 5;
      tests.push({
        id: 'vat_sale',
        nameAr: 'اختبار دقة ضريبة القيمة المضافة (14%)',
        nameEn: 'VAT 14% Calculation Integrity',
        status: (hasCorrectTax && matchesTax) ? 'pass' : 'warning',
        messageAr: (hasCorrectTax && matchesTax) ? 'تم التحقق من تطبيق ضريبة 14% مطابقة للهيئة' : 'يرجى مراجعة نسب ضريبة الأصناف (يجب أن تكون 14%)',
        messageEn: (hasCorrectTax && matchesTax) ? 'VAT is calculated perfectly at 14%' : 'Tax percentage deviates from standard 14% standard'
      });

      const discountPercent = subTotal > 0 ? (discountValue / subTotal) * 100 : 0;
      const discountOk = discountPercent <= 15;
      tests.push({
        id: 'discount_cap',
        nameAr: 'اختبار سقف الخصم التجاري المسموح',
        nameEn: 'Commercial Discount Cap (Max 15%)',
        status: discountOk ? 'pass' : 'warning',
        messageAr: discountOk ? `الخصم في الحدود الآمنة (${discountPercent.toFixed(1)}%)` : `تحذير: نسبة الخصم تجاوزت الحد الأقصى 15% (${discountPercent.toFixed(1)}%)`,
        messageEn: discountOk ? 'Discount is within safe limits' : 'Warning: Discount exceeds 15% of invoice value'
      });

      let stockOk = true;
      let missingItemName = '';
      items.forEach(item => {
        if (!item.productCode) return;
        const prod = products.find(p => p.code === item.productCode);
        if (prod && item.quantity > prod.stock) {
          stockOk = false;
          missingItemName = item.productName;
        }
      });
      tests.push({
        id: 'stock_level',
        nameAr: 'فحص كفاية رصيد المستودع الفعلي',
        nameEn: 'Stock Sufficiency Check',
        status: stockOk ? 'pass' : 'fail',
        messageAr: stockOk ? 'جميع الكميات متوفرة بالمخزن وجاهزة للصرف' : `عجز في رصيد الصنف: (${missingItemName}) الكمية المطلوبة غير متوفرة!`,
        messageEn: stockOk ? 'All requested items are available in stock' : `Shortage in item: (${missingItemName}) quantity requested exceeds available stock`
      });

      const hasPartner = !!partnerId;
      const hasItems = items.length > 0 && items[0].productCode !== '';
      const zatcaOk = hasPartner && hasItems && netAmount > 0;
      tests.push({
        id: 'zatca_compliance',
        nameAr: 'فحص معايير الفوترة الإلكترونية (ZATCA)',
        nameEn: 'ZATCA E-Invoicing Standards',
        status: zatcaOk ? 'pass' : 'fail',
        messageAr: zatcaOk ? 'الفاتورة مطابقة للمتطلبات الأمنية وجاهزة للربط والتشهير بالباركود' : 'البيانات ناقصة: يجب تحديد العميل وإدراج أصناف بالجدول للحصول على كود QR معتمد',
        messageEn: zatcaOk ? 'Invoice strictly compliant with ZATCA phase 2' : 'Missing fields: Must select partner and items to generate secure ZATCA QR'
      });

      const selectedPartner = partners.find(p => p.id === partnerId);
      const currentBalance = selectedPartner ? selectedPartner.balance : 0;
      const isCredit = paymentMethod === 'credit';
      const creditOk = !isCredit || (currentBalance + netAmount <= 150000);
      tests.push({
        id: 'client_credit',
        nameAr: 'فحص الحد الائتماني والملاءة للعميل',
        nameEn: 'Client Credit Limit Verification',
        status: creditOk ? 'pass' : 'warning',
        messageAr: creditOk ? 'الوضع المالي للعميل ممتاز وسقف الائتمان يسمح بالعملية' : `تحذير: إجمالي مديونية العميل ستتجاوز الحد الأقصى للائتمان (150,000 EGP)`,
        messageEn: creditOk ? 'Client balance is within approved credit term' : 'Warning: Post-transaction balance exceeds credit ceiling (150,000 EGP)'
      });
    }
    else if (invoiceType === 'purchase') {
      const selectedPartner = partners.find(p => p.id === partnerId);
      const hasSupplier = !!partnerId;
      tests.push({
        id: 'supplier_balance',
        nameAr: 'تدقيق حساب المورد وأرصدة الديون المفتوحة',
        nameEn: 'Supplier Ledger Balance Audit',
        status: hasSupplier ? 'pass' : 'fail',
        messageAr: hasSupplier ? `رصيد المورد الحالي: (${selectedPartner?.balance?.toLocaleString() || 0} EGP)` : 'يرجى اختيار مورد معتمد لتوجيه الالتزامات المالية بشكل سليم',
        messageEn: hasSupplier ? 'Supplier ledger successfully selected' : 'No vendor selected: financial ledger entries cannot be routed'
      });

      const hasDates = items.every(item => !item.productCode || (item.notes && item.notes.trim().length > 3));
      tests.push({
        id: 'expiry_dates',
        nameAr: 'اختبار صلاحية تواريخ الإنتاج والتشغيلات المرفقة',
        nameEn: 'Expiry Dates & Batch Traceability',
        status: hasDates ? 'pass' : 'warning',
        messageAr: hasDates ? 'جميع تواريخ الصلاحية وأرقام الدفعات مدخلة بنجاح' : 'تنبيه: يُنصح بكتابة رقم التشغيلة وتاريخ الصلاحية بالـ Notes للأصناف سريعة التلف',
        messageEn: hasDates ? 'Batch traceability is fully populated' : 'Warning: Highly recommended to fill batch/expiry details in notes'
      });

      const wh = warehouses.find(w => w.id === warehouseId);
      const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
      const spaceOk = totalQty < 5000;
      tests.push({
        id: 'warehouse_capacity',
        nameAr: 'فحص الطاقة الاستيعابية والرفوف بالمستودع',
        nameEn: 'Warehouse Space & Allocation Capacity',
        status: spaceOk ? 'pass' : 'warning',
        messageAr: spaceOk ? `المخزن (${wh?.name || 'WH-01'}) مستعد لاستقبال الشحنة (${totalQty} قطعة)` : 'سعة المخزن ممتلئة بنسبة تفوق 90%، يرجى التخزين في مخزن بديل',
        messageEn: spaceOk ? 'Warehouse capacity is adequate for incoming stock' : 'Warning: Selected warehouse is at high utilization capacity'
      });

      const taxOk = totalTax > 0;
      tests.push({
        id: 'input_tax_recovery',
        nameAr: 'اختبار أهلية استرداد ضريبة المدخلات للمشتريات',
        nameEn: 'Input VAT Recovery eligibility',
        status: taxOk ? 'pass' : 'warning',
        messageAr: taxOk ? 'الضريبة مدخلة بوضوح ومؤهلة للاسترداد الجمركي بالكامل' : 'تنبيه: لا توجد ضريبة مبيعات محتسبة في الفاتورة، لن تتمكن من ترحيل مدخلات ضريبية',
        messageEn: taxOk ? 'Eligible for complete refund of input tax value' : 'Notice: Zero tax entered, invoice is marked as tax-exempt'
      });

      let costOk = true;
      items.forEach(item => {
        if (!item.productCode) return;
        const prod = products.find(p => p.code === item.productCode);
        if (prod && item.price > prod.cost * 1.3) {
          costOk = false;
        }
      });
      tests.push({
        id: 'cost_inflation',
        nameAr: 'اختبار تضخم كلفة الشراء وعروض الموردين',
        nameEn: 'Purchase Cost Inflation Guard',
        status: costOk ? 'pass' : 'warning',
        messageAr: costOk ? 'أسعار التوريد ضمن الحدود القياسية مقارنة بأسعار التكلفة بالمخزن' : 'تحذير: أسعار الشراء لبعض الأصناف تفوق بـ 30% تكلفة التقييم القياسية بالمستودع',
        messageEn: costOk ? 'Procurement pricing is within safe standard' : 'Warning: Unit purchase cost is inflated by more than 30% of standard ledger cost'
      });
    }
    else if (invoiceType === 'sale_return') {
      const hasOriginalRef = !!representative;
      tests.push({
        id: 'original_ref',
        nameAr: 'اختبار مطابقة المرتجع للفاتورة الضريبية الأصلية',
        nameEn: 'Original Invoice Reference Check',
        status: hasOriginalRef ? 'pass' : 'warning',
        messageAr: hasOriginalRef ? `تم إسناد الفاتورة للمندوب: (${representative}) لمطابقة السجلات` : 'تنبيه: يُرجى تحديد اسم مندوب البيع الأصلي ومطابقة الفاتورة لمنع التلاعب المالي',
        messageEn: hasOriginalRef ? 'Original representative matched' : 'Warning: Original invoice reference should be checked'
      });

      tests.push({
        id: 'return_window',
        nameAr: 'فحص المهلة القانونية لاسترجاع المنتجات (14 يوماً)',
        nameEn: 'Regulatory 14-Day Return Window',
        status: 'pass',
        messageAr: 'تاريخ الحركة يقع ضمن النطاق الزمني القانوني للمستهلك (14 يوماً مالي)',
        messageEn: 'Transaction date falls within the 14-day regulatory window'
      });

      const qualityOk = items.length > 0 && items.every(item => !item.productCode || item.quantity > 0);
      tests.push({
        id: 'quality_reshelf',
        nameAr: 'فحص أهلية إعادة المنتج على الرف لضمان الجودة',
        nameEn: 'Quality Control & Reshelving Authorization',
        status: qualityOk ? 'pass' : 'fail',
        messageAr: qualityOk ? 'تم اختبار صلاحية المواد وهي مطابقة للمواصفات لإعادة إدراجها بالرصيد' : 'فشل الاختبار: لا توجد كميات صحيحة مرتجعة للفحص الفني',
        messageEn: qualityOk ? 'Items passed inspection and are ready for resale' : 'Fail: Empty or invalid return item list entered'
      });
    }
    else if (invoiceType === 'purchase_return') {
      const traceOk = !!partnerId;
      tests.push({
        id: 'trace_bill',
        nameAr: 'فحص تتبع المشتريات المرتجعة للشركة الموردة',
        nameEn: 'Supplier Invoice Reference Traceability',
        status: traceOk ? 'pass' : 'fail',
        messageAr: traceOk ? 'تم التحقق من حساب المورد لمطابقة القيد العكسي المزدوج' : 'فشل الاختبار: يرجى تحديد المورد المستحق لإثبات الخصم الدفتري',
        messageEn: traceOk ? 'Vendor account found for double-entry reversal' : 'Fail: Must specify the target supplier'
      });

      let decOk = true;
      items.forEach(item => {
        if (!item.productCode) return;
        const prod = products.find(p => p.code === item.productCode);
        if (prod && prod.stock < item.quantity) decOk = false;
      });
      tests.push({
        id: 'wh_decrement',
        nameAr: 'التحقق من كفاية الأرصدة بالمخزن قبل الخصم والتسليم',
        nameEn: 'Stock Level Pre-Return Sufficiency',
        status: decOk ? 'pass' : 'fail',
        messageAr: decOk ? 'الكمية المراد إرجاعها للمورد متوفرة في المستودع وقابلة للإخراج' : 'فشل الاختبار: الكمية المطلوب إرجاعها للمورد تتعدى الرصيد المتوفر حالياً بالمخزن!',
        messageEn: decOk ? 'Available warehouse stock is sufficient' : 'Fail: Return quantity exceeds available warehouse balance'
      });
    }
    else if (invoiceType === 'stock_in') {
      const countOk = items.length > 0 && items.reduce((sum, item) => sum + item.quantity, 0) > 0;
      tests.push({
        id: 'inbound_match',
        nameAr: 'مطابقة الفحص المادي والاستلام العيني للسلع',
        nameEn: 'Inbound Physical Count Verification',
        status: countOk ? 'pass' : 'fail',
        messageAr: countOk ? 'أصناف التوريد مدخلة بنجاح ومطابقة لمحضر الفحص والاستلام الفعلي' : 'فشل الاختبار: يرجى كتابة كميات السلع الواردة المضافة للمستودع',
        messageEn: countOk ? 'Physical count successfully registered' : 'Fail: Inbound quantity cannot be empty'
      });

      const rackOk = !!warehouseId;
      tests.push({
        id: 'rack_placement',
        nameAr: 'تخصيص الرفوف وتوزيع البضائع الواردة بالمستودع',
        nameEn: 'Rack Placement & Storage Allocation Map',
        status: rackOk ? 'pass' : 'warning',
        messageAr: rackOk ? `تم تعيين التخزين التلقائي على زون المستودع المحدد (${warehouseId})` : 'تحذير: لم يتم اختيار المستودع، سيتم التخزين في الرفوف الاحتياطية تلقائياً',
        messageEn: rackOk ? 'Warehouse storage zones allocated properly' : 'Warning: Rack zone unallocated, fallback default rack used'
      });
    }
    else if (invoiceType === 'stock_out') {
      const authOk = !!representative;
      tests.push({
        id: 'dispatch_auth',
        nameAr: 'فحص توثيق وصلاحيات مسؤول الصرف المخزني',
        nameEn: 'Outbound Dispatcher Security Authorization',
        status: authOk ? 'pass' : 'warning',
        messageAr: authOk ? `تم توثيق محضر الصرف تحت إشراف المندوب: (${representative})` : 'تحذير: يرجى كتابة اسم أمين العهدة أو مستلم بضائع الصرف لضمان الرقابة',
        messageEn: authOk ? 'Dispatcher security ID is authenticated' : 'Warning: No authorized recipient specified'
      });

      let minStockOk = true;
      items.forEach(item => {
        if (!item.productCode) return;
        const prod = products.find(p => p.code === item.productCode);
        if (prod && (prod.stock - item.quantity < prod.minLimit)) minStockOk = false;
      });
      tests.push({
        id: 'min_stock_limit',
        nameAr: 'اختبار تجاوز الحد الأدنى لمخزون الطوارئ والطلب',
        nameEn: 'Minimum Reserve Stock Level Guard',
        status: minStockOk ? 'pass' : 'warning',
        messageAr: minStockOk ? 'أرصدة المستودع ستبقى في المنطقة الآمنة بعد إتمام عملية الصرف' : 'تحذير: صرف هذه الكمية سينزل برصيد بعض الأصناف تحت حد الأمان المطلوب لإعادة الطلب!',
        messageEn: minStockOk ? 'Safe inventory levels maintained' : 'Warning: Transaction will push items below safety stock limit'
      });
    }
    else if (invoiceType === 'transfer') {
      const isDifferent = warehouseId !== partnerId;
      tests.push({
        id: 'wh_separation',
        nameAr: 'فحص تطابق مخازن الشحن والاستلام للتحويل',
        nameEn: 'Warehouse Separation Validation',
        status: isDifferent ? 'pass' : 'fail',
        messageAr: isDifferent ? 'مستودع المصدر يختلف عن مستودع الهدف وهو خيار سليم للتحويل' : 'فشل الاختبار: يرجى اختيار مستودعين مختلفين! لا يمكن التحويل لنفس المستودع',
        messageEn: isDifferent ? 'Source and destination warehouses differ correctly' : 'Fail: Source and destination warehouse cannot be identical'
      });

      let coverOk = true;
      items.forEach(item => {
        if (!item.productCode) return;
        const prod = products.find(p => p.code === item.productCode);
        if (prod && prod.stock < item.quantity) coverOk = false;
      });
      tests.push({
        id: 'transfer_cover',
        nameAr: 'فحص توفر كميات النقل بالمخزن الرئيسي المصدر',
        nameEn: 'Source Stock Cover Check',
        status: coverOk ? 'pass' : 'fail',
        messageAr: coverOk ? 'جميع السلع المحولة متوفرة بالكامل ومغطاة برصيد مخزن الشحن' : 'فشل الاختبار: الكمية المراد نقلها تفوق الرصيد الحالي المتوفر بمخزن المصدر!',
        messageEn: coverOk ? 'Source stocks are completely covered' : 'Fail: Attempting to transfer more quantities than available at source'
      });
    }

    return tests;
  };

  useEffect(() => {
    setTestResults(runComplianceTests());
  }, [items, partnerId, warehouseId, discountValue, paymentMethod, representative, invoiceType, products]);

  const handleReRunDiagnostics = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setTestResults(runComplianceTests());
    }, 750);
  };

  const addNewRow = () => {
    const newItem: InvoiceItem = {
      id: 'ITEM-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      productCode: '',
      productName: '',
      barcode: '',
      unit: 'عدد',
      quantity: 1,
      price: 0,
      discount: 0,
      tax: 14, // 14% VAT default in Egypt
      total: 0,
      notes: ''
    };
    setItems([...items, newItem]);
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) {
      alert(lang === 'ar' ? 'يجب أن تحتوي الفاتورة على بند واحد على الأقل!' : 'The invoice must contain at least one item!');
      return;
    }
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  };

  const handleCellChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const copy = [...items];
    const item = { ...copy[index] };

    if (field === 'productCode') {
      const selectedProd = products.find(p => p.code === value);
      if (selectedProd) {
        item.productCode = selectedProd.code;
        item.productName = selectedProd.name;
        item.barcode = selectedProd.barcode;
        item.unit = selectedProd.unit;
        item.price = selectedProd.price;
        item.tax = 14;
      } else {
        item.productCode = value;
      }
    } else {
      (item as any)[field] = value;
    }

    // Recalculate row total
    const itemSub = item.price * item.quantity;
    const itemDisc = itemSub * (item.discount / 100);
    const itemTax = (itemSub - itemDisc) * (item.tax / 100);
    item.total = itemSub - itemDisc + itemTax;

    copy[index] = item;
    setItems(copy);
  };

  const handleFormulaBarChange = (val: string) => {
    if (!activeCell) return;
    const { row, col, field } = activeCell;
    const itemIndex = row - 1;
    if (itemIndex < 0 || itemIndex >= items.length) return;

    let typedVal: any = val;
    if (field === 'quantity') typedVal = parseInt(val) || 0;
    else if (field === 'price' || field === 'discount' || field === 'tax') typedVal = parseFloat(val) || 0;

    handleCellChange(itemIndex, field as any, typedVal);
    setActiveCell({ ...activeCell, value: val });
  };

  // Add Item via Barcode Input
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeSearch.trim()) return;

    const selectedProd = products.find(p => p.barcode === barcodeSearch || p.code === barcodeSearch);
    if (selectedProd) {
      // Find if already in items and increment qty, otherwise add row
      const existingIdx = items.findIndex(item => item.productCode === selectedProd.code);
      if (existingIdx !== -1) {
        handleCellChange(existingIdx, 'quantity', items[existingIdx].quantity + 1);
      } else {
        const newItem: InvoiceItem = {
          id: 'ITEM-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          productCode: selectedProd.code,
          productName: selectedProd.name,
          barcode: selectedProd.barcode,
          unit: selectedProd.unit,
          quantity: 1,
          price: selectedProd.price,
          discount: 0,
          tax: 14,
          total: selectedProd.price * 1.14,
          notes: ''
        };
        // Replace first row if empty
        if (items.length === 1 && items[0].productCode === '') {
          setItems([newItem]);
        } else {
          setItems([...items, newItem]);
        }
      }
      setBarcodeSearch('');
    } else {
      alert(lang === 'ar' ? 'عفواً، الصنف غير مسجل بدليل الباركود!' : 'Item not found in database!');
    }
  };

  const handleSave = () => {
    if (!partnerId) {
      alert(lang === 'ar' ? 'يرجى تحديد العميل/المورد أولاً!' : 'Please select customer/vendor!');
      return;
    }

    if (items.some(i => !i.productCode)) {
      alert(lang === 'ar' ? 'يرجى تعبئة الأكواد لجميع الأصناف المضافة!' : 'Please specify products for all rows!');
      return;
    }

    const invoices = mockDatabase.getInvoices();
    const selectedPartner = partners.find(p => p.id === partnerId);
    const selectedWh = warehouses.find(w => w.id === warehouseId);

    const invoiceData: Invoice = {
      id: invoiceId || 'INV-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      invoiceNo,
      date,
      type: invoiceType,
      partnerId,
      partnerName: selectedPartner ? selectedPartner.name : 'عميل افتراضي',
      warehouseId,
      warehouseName: selectedWh ? selectedWh.name : 'مخزن رئيسي',
      representative,
      paymentMethod,
      currency,
      items,
      subTotal,
      discount: discountValue,
      tax: totalTax,
      netAmount,
      paidAmount,
      remainingAmount,
      status: isApproved ? 'approved' : (isCancelled ? 'cancelled' : 'draft'),
      createdBy: currentUser.username,
      createdAt: new Date().toISOString(),
      branch: 'الفرع الرئيسي - القاهرة',
      company: 'سامي سيستم لأنظمة المحاسبة'
    };

    let updatedList;
    if (invoiceId) {
      updatedList = invoices.map(i => i.id === invoiceId ? invoiceData : i);
    } else {
      updatedList = [invoiceData, ...invoices];
    }

    mockDatabase.saveInvoices(updatedList);

    // If approved, update product stock levels automatically!
    if (isApproved) {
      const allProds = mockDatabase.getProducts();
      items.forEach(item => {
        const prodIdx = allProds.findIndex(p => p.code === item.productCode);
        if (prodIdx !== -1) {
          if (invoiceType === 'sale') {
            allProds[prodIdx].stock -= item.quantity;
          } else {
            allProds[prodIdx].stock += item.quantity;
          }
        }
      });
      mockDatabase.saveProducts(allProds);
      
      // Automatically post double-entry general ledger journal entries for the ERP accountant integrations!
      mockDatabase.autoPostInvoiceJournalEntry(invoiceData);
    }

    // Write to Audit Log
    mockDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      invoiceType === 'sale' ? 'فاتورة مبيعات' : 'فاتورة مشتريات',
      `تم حفظ ${invoiceType === 'sale' ? 'فاتورة مبيعات' : 'فاتورة مشتريات'} برقم ${invoiceNo} بقيمة صافية ${netAmount.toLocaleString()} جنيه.`
    );

    alert(lang === 'ar' ? 'تم حفظ الفاتورة وتحديث المخازن بنجاح!' : 'Invoice saved successfully!');
    if (onRefreshDashboard) onRefreshDashboard();
    onClose();
  };

  const handlePrint = () => {
    // Elegant simulation of a printed accounting voucher
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${invoiceNo}</title>
            <style>
              body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; direction: rtl; padding: 40px; color: #1e293b; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #b89047; padding-bottom: 15px; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; color: #b89047; }
              .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 30px; font-size: 14px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
              th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: right; }
              th { bg-color: #f1f5f9; font-weight: bold; }
              .totals { margin-right: auto; width: 300px; font-size: 14px; }
              .totals-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; }
              .net { font-size: 16px; font-weight: bold; color: #b89047; border-bottom: 2px solid #b89047; padding-top: 5px; }
              .footer { text-align: center; margin-top: 80px; font-size: 11px; color: #64748b; border-t: 1px solid #e2e8f0; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="title">الـنـظـام الـذهـبـي لـلـمـحـاسـبـة</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">مستند رسمي معتمد نظامياً</div>
              </div>
              <div style="text-align: left;">
                <div style="font-size: 18px; font-weight: bold; color: #b89047;">${getInvoiceTypeInfo().titleAr}</div>
                <div style="font-size: 13px; font-mono: true; margin-top: 4px;">رقم: ${invoiceNo}</div>
              </div>
            </div>

            <div class="meta-grid">
              <div>
                <strong>التاريخ:</strong> ${date}<br>
                <strong>العميل/المورد:</strong> ${partners.find(p => p.id === partnerId)?.name || 'غير محدد'}<br>
                <strong>طريقة الدفع:</strong> ${paymentMethod === 'cash' ? 'نقدي' : 'آجل / ذمم'}
              </div>
              <div>
                <strong>المخزن المستهدف:</strong> ${warehouses.find(w => w.id === warehouseId)?.name || 'الرئيسي'}<br>
                <strong>مندوب الحركة:</strong> ${representative}<br>
                <strong>العملة:</strong> ${currency}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>م</th>
                  <th>كود الصنف</th>
                  <th>اسم الصنف</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>خصم %</th>
                  <th>ضريبة %</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${item.productCode}</td>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toLocaleString()}</td>
                    <td>${item.discount}%</td>
                    <td>${item.tax}%</td>
                    <td>${item.total.toLocaleString()} EGP</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-row">
                <span>الإجمالي الفرعي:</span>
                <span>${subTotal.toLocaleString()} EGP</span>
              </div>
              <div class="totals-row">
                <span>الخصم التجاري:</span>
                <span>${discountValue.toLocaleString()} EGP</span>
              </div>
              <div class="totals-row">
                <span>ضريبة القيمة المضافة:</span>
                <span>${totalTax.toLocaleString()} EGP</span>
              </div>
              <div class="totals-row net">
                <span>الصافي النهائي:</span>
                <span>${netAmount.toLocaleString()} EGP</span>
              </div>
              <div class="totals-row">
                <span>المدفوع:</span>
                <span>${paidAmount.toLocaleString()} EGP</span>
              </div>
              <div class="totals-row">
                <span>المتبقي:</span>
                <span>${remainingAmount.toLocaleString()} EGP</span>
              </div>
            </div>

            <div class="footer">
              سند محاسبي معتمد ومولّد تلقائياً عبر النظام الذهبي للمحاسبة
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const exportInvoiceItemsToCSV = () => {
    const headers = lang === 'ar'
      ? ['م', 'كود الصنف', 'اسم الصنف', 'الباركود', 'الوحدة', 'الكمية', 'السعر', 'خصم %', 'ضريبة %', 'الإجمالي', 'ملاحظات']
      : ['No', 'Item Code', 'Item Name', 'Barcode', 'Unit', 'Quantity', 'Price', 'Discount %', 'Tax %', 'Total', 'Notes'];

    const rows = items.map((item, idx) => [
      idx + 1,
      `"${item.productCode}"`,
      `"${item.productName.replace(/"/g, '""')}"`,
      `"${item.barcode}"`,
      `"${item.unit}"`,
      item.quantity,
      item.price,
      item.discount,
      item.tax,
      item.total,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${invoiceNo}_items.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`p-4 md:p-6 bg-slate-950 text-white min-h-screen font-sans ${isMaximized ? 'w-full' : 'max-w-7xl mx-auto'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Invoice Header Options Ribbon */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900 p-4 rounded-xl border-2 border-[#b89047] mb-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#b89047] text-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex flex-wrap items-center gap-2 tracking-tight">
              <span className="text-[#b89047] font-extrabold">{lang === 'ar' ? getInvoiceTypeInfo().titleAr : getInvoiceTypeInfo().titleEn}</span>
              <span className="text-xs bg-black text-[#b89047] border border-[#b89047]/40 px-2.5 py-1 rounded font-mono font-bold">{invoiceNo}</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              {lang === 'ar' ? `المحاسب المسؤول: ${currentUser.fullName} | الـنـظـام الـذهـبـي ⚜` : `Accountant: ${currentUser.username} | GOLDEN SYSTEM ⚜`}
            </p>
          </div>
        </div>

        {/* Option Action Buttons */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => {
              setItems([]);
              addNewRow();
            }}
            className="flex items-center gap-1.5 bg-black hover:bg-[#b89047] text-[#b89047] hover:text-black px-3.5 py-2 rounded-lg cursor-pointer transition-all border border-[#b89047]/50 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'جديد' : 'New'}</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-[#b89047] hover:bg-amber-400 text-black px-4 py-2 rounded-lg cursor-pointer shadow-md shadow-amber-500/10 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{lang === 'ar' ? 'حفظ الفاتورة 💾' : 'Save Document 💾'}</span>
          </button>

          <button
            onClick={() => setIsApproved(!isApproved)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border transition-all cursor-pointer ${
              isApproved 
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' 
                : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isApproved ? (lang === 'ar' ? 'معتمدة ومرحّلة' : 'Approved') : (lang === 'ar' ? 'اعتماد وترحيل' : 'Approve')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-lg text-slate-300 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4 text-[#b89047]" />
            <span>{lang === 'ar' ? 'طباعة' : 'Print'}</span>
          </button>

          <button
            onClick={exportInvoiceItemsToCSV}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-lg text-slate-300 cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Excel / CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-lg text-slate-300 cursor-pointer transition-all"
          >
            <FileText className="w-4 h-4 text-rose-500" />
            <span>PDF</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 px-3.5 py-2 rounded-lg text-rose-300 cursor-pointer transition-all hover:text-white"
          >
            <X className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إغلاق ✖' : 'Close ✖'}</span>
          </button>
        </div>
      </div>

      {/* Barcode Quick Search & New Product Card Integration */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <form onSubmit={handleBarcodeSubmit} className="flex gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800 flex-1 max-w-lg shadow-md">
          <div className="relative flex-1">
            <input
              type="text"
              value={barcodeSearch}
              onChange={(e) => setBarcodeSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pr-8 pl-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#b89047]"
              placeholder={lang === 'ar' ? 'امسح الباركود ضوئياً أو أدخل كود الصنف...' : 'Scan barcode or type item code...'}
            />
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-500" />
          </div>
          <button
            type="submit"
            className="bg-[#b89047] hover:bg-amber-400 text-black px-4 py-1.5 rounded-lg text-xs cursor-pointer font-bold transition-all shadow-sm whitespace-nowrap"
          >
            {lang === 'ar' ? 'إضافة صنف' : 'Add'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setIsProductModalOpen(true)}
          className="bg-black hover:bg-[#b89047]/10 text-[#b89047] hover:text-white border-2 border-[#b89047] px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-amber-500/5 whitespace-nowrap"
        >
          <Plus className="w-4.5 h-4.5 text-[#b89047]" />
          <span>{lang === 'ar' ? 'إضافة كارت صنف جديد (+)' : 'Add New Product Card (+)'}</span>
        </button>
      </div>

      {/* 2-Column Responsive Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Invoice Main Document (3 columns out of 4) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Invoice Meta-Data Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 bg-slate-900 p-5 rounded-xl border-2 border-[#b89047]/30 mb-6 shadow-md">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">{lang === 'ar' ? 'رقم المستند' : 'Invoice No.'}</label>
              <input
                type="text"
                readOnly
                value={invoiceNo}
                className="w-full bg-black border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-400 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">{lang === 'ar' ? 'التاريخ' : 'Date'}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#b89047]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">
                {invoiceType === 'sale' ? (lang === 'ar' ? 'العميل المستهدف' : 'Customer') : (lang === 'ar' ? 'المورد المعتمد' : 'Vendor')}
              </label>
              <select
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                className="w-full bg-black border border-slate-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#b89047]"
              >
                <option value="">{lang === 'ar' ? '-- اختر الحساب --' : '-- Choose Account --'}</option>
                {partners.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">{lang === 'ar' ? 'المستودع المستهدف' : 'Warehouse'}</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full bg-black border border-slate-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#b89047]"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">{lang === 'ar' ? 'مندوب الحركة' : 'Representative'}</label>
              <input
                type="text"
                value={representative}
                onChange={(e) => setRepresentative(e.target.value)}
                className="w-full bg-black border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">{lang === 'ar' ? 'طريقة السداد' : 'Payment Type'}</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-black border border-slate-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="cash">{lang === 'ar' ? 'نقدي' : 'Cash'}</option>
                <option value="credit">{lang === 'ar' ? 'آجل ذمم' : 'Credit / Post-paid'}</option>
                <option value="bank">{lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">{lang === 'ar' ? 'العملة' : 'Currency'}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-black border border-slate-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="EGP">EGP (جنيه مصري)</option>
                <option value="USD">USD (دولار أمريكي)</option>
                <option value="SAR">SAR (ريال سعودي)</option>
              </select>
            </div>
          </div>

      {/* Microsoft Excel Style Sheet Tabs Header */}
      <div className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-900 px-3 py-1.5 rounded-t-xl border-x-2 border-t-2 border-[#b89047]/30 text-xs font-bold overflow-x-auto select-none">
        <div className="bg-white dark:bg-slate-950 text-[#b89047] border-t-2 border-t-amber-500 border-x border-slate-300 dark:border-slate-800 px-3 py-1 rounded-t flex items-center gap-1.5 shadow-sm">
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#b89047]" />
          <span>{lang === 'ar' ? 'ورقة١ - بيانات الفاتورة الحالية' : 'Sheet1 - Current Voucher Entries'}</span>
        </div>
        <div className="text-slate-400 dark:text-slate-500 px-3 py-1 hover:text-slate-200 cursor-pointer transition-colors flex items-center gap-1.5">
          <span>{lang === 'ar' ? 'ورقة٢ - كروت الحسابات المدفوعة' : 'Sheet2 - Ledger Mappings'}</span>
        </div>
        <div className="text-slate-400 dark:text-slate-500 px-3 py-1 hover:text-slate-200 cursor-pointer transition-colors flex items-center gap-1.5">
          <span>{lang === 'ar' ? 'ورقة٣ - حركات المخزن الفورية' : 'Sheet3 - Live Card Stocks'}</span>
        </div>
      </div>

      {/* Dynamic Microsoft Excel Formula Bar */}
      <div className="flex items-center gap-1 bg-[#f1f5f9] dark:bg-[#0b0f19] border-2 border-t-0 border-[#b89047]/30 p-1.5 text-xs font-mono mb-4 shadow-inner relative z-10 flex-wrap md:flex-nowrap">
        {/* Active Cell Coordinates Indicator */}
        <div className="bg-amber-500/10 dark:bg-amber-500/20 text-[#b89047] border border-[#b89047]/40 px-3.5 py-1.5 rounded text-center font-extrabold min-w-[64px] shadow-sm select-none">
          {activeCell ? `${activeCell.col}${activeCell.row}` : 'A1'}
        </div>
        
        {/* fx Symbol separator */}
        <div className="text-[#b89047] font-serif italic font-black px-3.5 text-base select-none border-r border-[#b89047]/20 h-6 flex items-center">
          fx
        </div>

        {/* Real-time Formula Bar Edit Input */}
        <input
          type="text"
          value={activeCell ? activeCell.value : ''}
          onChange={(e) => handleFormulaBarChange(e.target.value)}
          placeholder={lang === 'ar' ? 'أدخل القيمة الحية أو اكتب تعليقاً في الخلية النشطة للتعديل...' : 'Edit live cell value, price, quantity, or comments here...'}
          className="flex-1 bg-white dark:bg-[#06080e] text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-800 rounded px-3.5 py-1.5 text-xs focus:outline-none focus:border-[#b89047] font-sans font-bold"
          disabled={!activeCell || activeCell.field === 'productName' || activeCell.field === 'barcode' || activeCell.field === 'total'}
        />
        
        <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden lg:inline px-2">
          {lang === 'ar' ? 'نمط التحرير المتكامل' : 'Spreadsheet Mode'}
        </span>
      </div>

      {/* Main Items Grid - Excel style with inline edits */}
      <div className="bg-white dark:bg-black border-2 border-[#b89047] rounded-xl shadow-xl overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-black dark:text-white excel-grid border-collapse min-w-[1000px]">
            <thead>
              {/* Excel Row-Header Column Indicators */}
              <tr className="bg-slate-100 dark:bg-[#070a10] text-[#b89047] text-center font-mono text-[11px] select-none border-b border-slate-200 dark:border-slate-850">
                <th className="bg-slate-200 dark:bg-slate-950 border-r border-[#b89047]/30 w-12 text-center font-black">⚜</th>
                <th className={`border-r border-slate-200 dark:border-slate-800 p-1 font-bold ${activeCell?.col === 'A' ? 'bg-[#b89047]/20 text-[#b89047] font-black' : ''}`}>A</th>
                <th className={`border-r border-slate-200 dark:border-slate-800 p-1 font-bold ${activeCell?.col === 'B' ? 'bg-[#b89047]/20 text-[#b89047] font-black' : ''}`}>B</th>
                <th className={`border-r border-slate-200 dark:border-slate-800 p-1 font-bold ${activeCell?.col === 'C' ? 'bg-[#b89047]/20 text-[#b89047] font-black' : ''}`}>C</th>
                <th className={`border-r border-slate-200 dark:border-slate-800 p-1 font-bold ${activeCell?.col === 'D' ? 'bg-[#b89047]/20 text-[#b89047] font-black' : ''}`}>D</th>
                <th className={`border-r border-slate-200 dark:border-slate-800 p-1 font-bold ${activeCell?.col === 'E' ? 'bg-[#b89047]/20 text-[#b89047] font-black' : ''}`}>E</th>
                <th className={`border-r border-slate-200 dark:border-slate-800 p-1 font-bold ${activeCell?.col === 'F' ? 'bg-[#b89047]/20 text-[#b89047] font-black' : ''}`}>F</th>
                <th className={`border-r border-slate-200 dark:border-slate-800 p-1 font-bold ${activeCell?.col === 'G' ? 'bg-[#b89047]/20 text-[#b89047] font-black' : ''}`}>G</th>
                <th className={`border-r border-slate-200 dark:border-slate-800 p-1 font-bold ${activeCell?.col === 'H' ? 'bg-[#b89047]/20 text-[#b89047] font-black' : ''}`}>H</th>
                <th className={`border-r border-slate-200 dark:border-slate-800 p-1 font-bold ${activeCell?.col === 'I' ? 'bg-[#b89047]/20 text-[#b89047] font-black' : ''}`}>I</th>
                <th className={`border-r border-slate-200 dark:border-slate-800 p-1 font-bold ${activeCell?.col === 'J' ? 'bg-[#b89047]/20 text-[#b89047] font-black' : ''}`}>J</th>
                <th className="p-1 font-bold text-center">K</th>
              </tr>
              <tr className="bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-white text-right border-b-2 border-[#b89047] font-black text-xs">
                <th className="p-3 w-12 text-center bg-slate-300 dark:bg-slate-950 border-r border-slate-300 dark:border-slate-800 text-[#b89047]">م</th>
                <th className="p-3 w-40 border-r border-slate-300 dark:border-slate-800 text-slate-800 dark:text-[#b89047]">{lang === 'ar' ? 'كود الصنف *' : 'Item Code *'}</th>
                <th className="p-3 w-64 border-r border-slate-300 dark:border-slate-800 text-slate-800 dark:text-[#b89047]">{lang === 'ar' ? 'اسم الصنف' : 'Item Name'}</th>
                <th className="p-3 w-40 border-r border-slate-300 dark:border-slate-800 text-slate-800 dark:text-[#b89047]">{lang === 'ar' ? 'الباركود' : 'Barcode'}</th>
                <th className="p-3 w-20 border-r border-slate-300 dark:border-slate-800 text-slate-800 dark:text-[#b89047]">{lang === 'ar' ? 'الوحدة' : 'Unit'}</th>
                <th className="p-3 w-24 text-center border-r border-slate-300 dark:border-slate-800 text-slate-800 dark:text-[#b89047]">{lang === 'ar' ? 'الكمية *' : 'Qty *'}</th>
                <th className="p-3 w-28 text-left border-r border-slate-300 dark:border-slate-800 text-slate-800 dark:text-[#b89047]">{lang === 'ar' ? 'السعر *' : 'Price *'}</th>
                <th className="p-3 w-20 text-center border-r border-slate-300 dark:border-slate-800 text-slate-800 dark:text-[#b89047]">{lang === 'ar' ? 'خصم %' : 'Disc %'}</th>
                <th className="p-3 w-20 text-center border-r border-slate-300 dark:border-slate-800 text-slate-800 dark:text-[#b89047]">{lang === 'ar' ? 'ضريبة %' : 'VAT %'}</th>
                <th className="p-3 w-32 text-left border-r border-slate-300 dark:border-slate-800 text-slate-800 dark:text-[#b89047]">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                <th className="p-3 w-44 text-slate-800 dark:text-[#b89047]">{lang === 'ar' ? 'ملاحظات' : 'Notes'}</th>
                <th className="p-3 w-12 text-center text-[#b89047]">{lang === 'ar' ? 'إجراء' : 'Act'}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const isActiveRow = activeCell?.row === index + 1;
                return (
                  <tr key={item.id} className={`border-b border-slate-200 dark:border-slate-850 hover:bg-[#b89047]/5 transition-all font-mono ${isActiveRow ? 'bg-amber-500/5' : ''}`}>
                    <td className={`p-2 text-center font-black border-r border-slate-300 dark:border-slate-800 transition-colors ${isActiveRow ? 'bg-amber-500/20 text-[#b89047]' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-[#b89047]'}`}>{index + 1}</td>
                    
                    {/* Product Code Select or Input */}
                    <td className={`p-1 border-r border-slate-200 dark:border-slate-800 bg-[#fef8ec] dark:bg-slate-950/20 ${activeCell?.row === index + 1 && activeCell?.col === 'A' ? 'ring-2 ring-amber-500 z-10' : ''}`}>
                      <select
                        value={item.productCode}
                        onChange={(e) => handleCellChange(index, 'productCode', e.target.value)}
                        onFocus={() => setActiveCell({ row: index + 1, col: 'A', value: item.productCode || '', field: 'productCode' })}
                        className="w-full bg-transparent border border-transparent hover:border-amber-300 rounded px-1.5 py-1 text-sm text-black dark:text-white font-extrabold focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:text-black dark:focus:text-white"
                      >
                        <option value="">{lang === 'ar' ? '-- اختر الكود --' : '-- Code --'}</option>
                        {products.map(p => (
                          <option key={p.id} value={p.code}>{p.code}</option>
                        ))}
                      </select>
                    </td>

                    {/* Product Name (readonly cell) */}
                    <td className={`p-1 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/10 ${activeCell?.row === index + 1 && activeCell?.col === 'B' ? 'ring-2 ring-amber-500 z-10' : ''}`}>
                      <input
                        type="text"
                        readOnly
                        value={item.productName}
                        placeholder={lang === 'ar' ? 'اختر الكود للتحميل' : 'Select code to load'}
                        onFocus={() => setActiveCell({ row: index + 1, col: 'B', value: item.productName || '', field: 'productName' })}
                        className="w-full bg-transparent border border-transparent text-sm text-slate-800 dark:text-slate-200 font-extrabold rounded px-1.5 py-1 focus:outline-none"
                      />
                    </td>

                    {/* Barcode (readonly cell) */}
                    <td className={`p-1 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/10 ${activeCell?.row === index + 1 && activeCell?.col === 'C' ? 'ring-2 ring-amber-500 z-10' : ''}`}>
                      <input
                        type="text"
                        readOnly
                        value={item.barcode}
                        onFocus={() => setActiveCell({ row: index + 1, col: 'C', value: item.barcode || '', field: 'barcode' })}
                        className="w-full bg-transparent border border-transparent text-sm text-slate-500 dark:text-slate-400 font-bold rounded px-1.5 py-1 focus:outline-none"
                      />
                    </td>

                    {/* Unit */}
                    <td className={`p-1 border-r border-slate-200 dark:border-slate-800 bg-[#fef8ec] dark:bg-slate-950/20 ${activeCell?.row === index + 1 && activeCell?.col === 'D' ? 'ring-2 ring-amber-500 z-10' : ''}`}>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleCellChange(index, 'unit', e.target.value)}
                        onFocus={() => setActiveCell({ row: index + 1, col: 'D', value: item.unit || '', field: 'unit' })}
                        className="w-full bg-transparent border border-transparent hover:border-amber-300 rounded px-1.5 py-1 text-sm text-black dark:text-white font-extrabold focus:outline-none text-center focus:bg-white dark:focus:bg-slate-900 focus:text-black dark:focus:text-white"
                      />
                    </td>

                    {/* Quantity */}
                    <td className={`p-1 border-r border-slate-200 dark:border-slate-800 bg-[#fef8ec] dark:bg-slate-950/20 ${activeCell?.row === index + 1 && activeCell?.col === 'E' ? 'ring-2 ring-amber-500 z-10' : ''}`}>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleCellChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        onFocus={() => setActiveCell({ row: index + 1, col: 'E', value: item.quantity, field: 'quantity' })}
                        className="w-full bg-transparent border border-transparent hover:border-amber-300 rounded px-1.5 py-1 text-sm text-emerald-800 dark:text-emerald-400 font-black focus:outline-none text-center focus:bg-white dark:focus:bg-slate-900 focus:text-black dark:focus:text-white"
                      />
                    </td>

                    {/* Price */}
                    <td className={`p-1 border-r border-slate-200 dark:border-slate-800 bg-[#fef8ec] dark:bg-slate-950/20 ${activeCell?.row === index + 1 && activeCell?.col === 'F' ? 'ring-2 ring-amber-500 z-10' : ''}`}>
                      <input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(e) => handleCellChange(index, 'price', parseFloat(e.target.value) || 0)}
                        onFocus={() => setActiveCell({ row: index + 1, col: 'F', value: item.price, field: 'price' })}
                        className="w-full bg-transparent border border-transparent hover:border-amber-300 rounded px-1.5 py-1 text-sm text-blue-800 dark:text-blue-400 font-black focus:outline-none text-left focus:bg-white dark:focus:bg-slate-900 focus:text-black dark:focus:text-white"
                      />
                    </td>

                    {/* Discount percentage */}
                    <td className={`p-1 border-r border-slate-200 dark:border-slate-800 bg-[#fef8ec] dark:bg-slate-950/20 ${activeCell?.row === index + 1 && activeCell?.col === 'G' ? 'ring-2 ring-amber-500 z-10' : ''}`}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={(e) => handleCellChange(index, 'discount', parseFloat(e.target.value) || 0)}
                        onFocus={() => setActiveCell({ row: index + 1, col: 'G', value: item.discount, field: 'discount' })}
                        className="w-full bg-transparent border border-transparent hover:border-amber-300 rounded px-1.5 py-1 text-sm text-amber-800 dark:text-amber-500 font-black focus:outline-none text-center focus:bg-white dark:focus:bg-slate-900 focus:text-black dark:focus:text-white"
                      />
                    </td>

                    {/* Tax percentage */}
                    <td className={`p-1 border-r border-slate-200 dark:border-slate-800 bg-[#fef8ec] dark:bg-slate-950/20 ${activeCell?.row === index + 1 && activeCell?.col === 'H' ? 'ring-2 ring-amber-500 z-10' : ''}`}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.tax}
                        onChange={(e) => handleCellChange(index, 'tax', parseFloat(e.target.value) || 0)}
                        onFocus={() => setActiveCell({ row: index + 1, col: 'H', value: item.tax, field: 'tax' })}
                        className="w-full bg-transparent border border-transparent hover:border-amber-300 rounded px-1.5 py-1 text-sm text-black dark:text-white font-extrabold focus:outline-none text-center focus:bg-white dark:focus:bg-slate-900 focus:text-black dark:focus:text-white"
                      />
                    </td>

                    {/* Total Amount calculated (readonly formula cell) */}
                    <td className={`p-2 text-left font-black text-sm text-black dark:text-amber-400 bg-[#fdf2d5] dark:bg-amber-950/30 border-r border-slate-200 dark:border-slate-800 ${activeCell?.row === index + 1 && activeCell?.col === 'I' ? 'ring-2 ring-amber-500 z-10' : ''}`}>
                      <button
                        type="button"
                        onFocus={() => setActiveCell({ row: index + 1, col: 'I', value: `=(F${index + 1} * E${index + 1}) - G${index + 1}% + H${index + 1}%`, field: 'total' })}
                        className="w-full text-left bg-transparent border-0 focus:outline-none font-mono font-black"
                      >
                        {(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </button>
                    </td>

                    {/* Notes */}
                    <td className={`p-1 border-r border-slate-200 dark:border-slate-800 bg-[#fef8ec] dark:bg-slate-950/20 ${activeCell?.row === index + 1 && activeCell?.col === 'J' ? 'ring-2 ring-amber-500 z-10' : ''}`}>
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => handleCellChange(index, 'notes', e.target.value)}
                        onFocus={() => setActiveCell({ row: index + 1, col: 'J', value: item.notes || '', field: 'notes' })}
                        className="w-full bg-transparent border border-transparent hover:border-amber-300 rounded px-1.5 py-1 text-sm text-black dark:text-white font-bold focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:text-black dark:focus:text-white"
                      />
                    </td>

                    {/* Remove row option */}
                    <td className="p-2 text-center bg-[#fef8ec] dark:bg-slate-950/25">
                      <button
                        onClick={() => removeRow(index)}
                        className="text-rose-600 hover:text-rose-400 p-1 cursor-pointer hover:bg-rose-500/10 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Aesthetic placeholder empty Excel rows to replicate a full spreadsheet of 12 rows */}
              {Array.from({ length: Math.max(0, 12 - items.length) }).map((_, placeholderIdx) => {
                const rowIndex = items.length + placeholderIdx + 1;
                return (
                  <tr key={`placeholder-${rowIndex}`} className="border-b border-slate-100 dark:border-slate-850 opacity-20 select-none font-mono">
                    <td className="p-2 text-center bg-slate-50 dark:bg-slate-950 text-slate-400 border-r border-slate-200 dark:border-slate-800">{rowIndex}</td>
                    <td className="p-1 border-r border-slate-100 dark:border-slate-850 text-center font-semibold">--</td>
                    <td className="p-1 border-r border-slate-100 dark:border-slate-850 text-center font-semibold">--</td>
                    <td className="p-1 border-r border-slate-100 dark:border-slate-850 text-center font-semibold">--</td>
                    <td className="p-1 border-r border-slate-100 dark:border-slate-850 text-center font-semibold">--</td>
                    <td className="p-1 border-r border-slate-100 dark:border-slate-850 text-center font-semibold">--</td>
                    <td className="p-1 border-r border-slate-100 dark:border-slate-850 text-center font-semibold">--</td>
                    <td className="p-1 border-r border-slate-100 dark:border-slate-850 text-center font-semibold">--</td>
                    <td className="p-1 border-r border-slate-100 dark:border-slate-850 text-center font-semibold">--</td>
                    <td className="p-2 border-r border-slate-100 dark:border-slate-850 text-left font-semibold">0.00</td>
                    <td className="p-1 border-r border-slate-100 dark:border-slate-850 text-center font-semibold">--</td>
                    <td className="p-2 text-center"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add item button directly beneath grid */}
        <div className="p-3 bg-slate-900 border-t border-[#b89047]/30 flex justify-between">
          <button
            onClick={addNewRow}
            className="flex items-center gap-1.5 bg-black hover:bg-[#b89047] hover:text-black border border-[#b89047]/40 text-xs text-[#b89047] px-4 py-2 rounded-lg cursor-pointer transition-all shadow-sm font-black active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إضافة سطر جديد (Insert Row)' : 'Add Row'}</span>
          </button>

          <span className="text-[10px] text-[#b89047] font-mono self-center">
            {lang === 'ar' ? '⚜ تمتع بالتحرير المباشر المتكامل وحساب الخصم والضريبة التلقائي' : '⚜ Enjoy fluid inline edits, automatic tax and discount computations.'}
          </span>
        </div>
      </div>

      {/* Invoice Bottom Calculations Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 p-5 rounded-xl border-2 border-[#b89047] shadow-lg text-white">
        {/* Helper Instructions/Shortcuts */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-[#b89047] border-b border-slate-800 pb-2">{lang === 'ar' ? 'ملاحظات المستند والشروط المالية' : 'Voucher Terms & Instructions'}</h3>
          <p className="text-[11px] text-slate-350 leading-relaxed font-semibold">
            {lang === 'ar' 
              ? 'إن اعتماد الفاتورة يرحّل القيمة المادية إلى الحساب الدفتري التابع للعميل/المورد، ويخصم الكمية الفورية مباشرة من المخزن المحدد أعلاه.' 
              : 'Approving an invoice posts physical balance edits to warehouses and partner accounts ledger.'}
          </p>
          <div className="bg-black/50 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-450 space-y-1 font-mono">
            <p className="text-[#b89047]">⌨ {lang === 'ar' ? 'ملاحظة: يدعم الجدول التعديل المباشر كبرامج الإكسيل.' : 'Note: Grid allows live Excel-style calculations.'}</p>
            <p className="text-[#b89047]">⚡ {lang === 'ar' ? 'امسح الباركود للسرعة في جرد المبيعات والمستودعات.' : 'Scan barcode to insert item rapidly.'}</p>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="space-y-2 max-w-sm ml-auto mr-0 md:mr-auto md:ml-0 w-full text-xs font-bold">
          <div className="flex justify-between items-center text-slate-300 py-1 border-b border-slate-800">
            <span>{lang === 'ar' ? 'إجمالي المنتجات قبل الضريبة والخصم:' : 'Subtotal (Before VAT/Discount):'}</span>
            <span className="font-mono font-extrabold text-white">{subTotal.toLocaleString()} EGP</span>
          </div>

          <div className="flex justify-between items-center text-slate-300 py-1 border-b border-slate-800">
            <span>{lang === 'ar' ? 'قيمة الخصم التجاري المباشر:' : 'Flat Commercial Discount:'}</span>
            <input
              type="number"
              min="0"
              value={discountValue}
              onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
              className="w-28 bg-black border border-[#b89047]/40 rounded-lg px-2 py-1 text-center text-amber-500 font-extrabold focus:outline-none focus:border-[#b89047]"
            />
          </div>

          <div className="flex justify-between items-center text-slate-300 py-1 border-b border-slate-800">
            <span>{lang === 'ar' ? 'قيمة ضريبة القيمة المضافة (14%):' : 'Total 14% VAT:'}</span>
            <span className="font-mono font-extrabold text-white">{totalTax.toLocaleString()} EGP</span>
          </div>

          <div className="flex justify-between items-center text-white py-2 border-b border-[#b89047] font-black bg-black/40 px-2 rounded">
            <span className="text-[#b89047] text-sm">{lang === 'ar' ? 'الصافي النهائي للاستحقاق:' : 'Net Final Amount:'}</span>
            <span className="font-mono text-emerald-400 text-base">{netAmount.toLocaleString()} EGP</span>
          </div>

          <div className="flex justify-between items-center text-slate-300 py-1 border-b border-slate-800">
            <span>{lang === 'ar' ? 'المبلغ المدفوع (المحصل):' : 'Paid Amount:'}</span>
            <input
              type="number"
              min="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
              className="w-28 bg-black border border-slate-800 rounded-lg px-2 py-1 text-center text-emerald-400 font-extrabold focus:outline-none focus:border-[#b89047]"
            />
          </div>

          <div className="flex justify-between items-center text-slate-300 py-1">
            <span className={remainingAmount > 0 ? 'text-rose-400' : 'text-slate-300'}>
              {lang === 'ar' ? 'المبلغ المتبقي (ذمم معلقة):' : 'Remaining / Debt Balance:'}
            </span>
            <span className={`font-mono font-extrabold ${remainingAmount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {remainingAmount.toLocaleString()} EGP
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Right Side: Automated Diagnostics & Audit Panel (1 column out of 4) */}
    <div className="lg:col-span-1 space-y-4">
      <div className="bg-slate-900 border-2 border-[#b89047] p-4 rounded-xl shadow-lg text-white">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-black text-[#b89047] flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>{lang === 'ar' ? 'لوحة الامتثال والتدقيق المالي' : 'Smart Audit Panel'}</span>
          </h3>
          <button
            type="button"
            onClick={handleReRunDiagnostics}
            disabled={isScanning}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
            title={lang === 'ar' ? 'إعادة تشغيل الفحص' : 'Re-run Tests'}
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <p className="text-[10px] text-slate-400 mb-4 leading-relaxed font-medium">
          {lang === 'ar' 
            ? 'فحص فوري وتلقائي للمعايير المحاسبية المعتمدة، وقوانين هيئة الزكاة والضريبة والجمارك (ZATCA)، وسلامة حركات المستودعات.'
            : 'Real-time auditing of accounting regulations, ZATCA e-invoicing standards, and inventory integrity.'}
        </p>

        {/* Scanning Indicator or Results */}
        {isScanning ? (
          <div className="py-8 text-center space-y-2 bg-black/40 rounded-lg">
            <div className="inline-block w-8 h-8 border-4 border-amber-500/25 border-t-[#b89047] rounded-full animate-spin"></div>
            <p className="text-[11px] text-[#b89047] font-bold">{lang === 'ar' ? 'جاري فحص قواعد الامتثال المالي...' : 'Auditing rules...'}</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {testResults.map((test) => {
              const isPass = test.status === 'pass';
              const isFail = test.status === 'fail';
              const statusColor = isPass 
                ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-400' 
                : isFail 
                  ? 'border-rose-500/20 bg-rose-950/20 text-rose-400' 
                  : 'border-amber-500/20 bg-amber-950/20 text-amber-400';

              return (
                <div 
                  key={test.id} 
                  className={`p-3 rounded-lg border text-[11px] space-y-1.5 transition-all ${statusColor}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <strong className="font-bold block leading-snug">
                      {lang === 'ar' ? test.nameAr : test.nameEn}
                    </strong>
                    <span className="shrink-0 mt-0.5">
                      {isPass && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {isFail && <AlertOctagon className="w-4 h-4 text-rose-500" />}
                      {!isPass && !isFail && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-90 leading-relaxed">
                    {lang === 'ar' ? test.messageAr : test.messageEn}
                  </p>
                </div>
              );
            })}

            {testResults.length === 0 && (
              <p className="text-center py-6 text-xs text-slate-500">
                {lang === 'ar' ? 'لا توجد اختبارات مخصصة لهذه الحركة.' : 'No audit tests configured.'}
              </p>
            )}
          </div>
        )}
      </div>
      
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={(newProduct) => {
          setProducts(mockDatabase.getProducts());
        }}
        lang={lang}
        currentUser={currentUser}
      />
    </div>
  </div>
</div>
);
}
