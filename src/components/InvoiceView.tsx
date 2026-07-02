import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Printer, FileSpreadsheet, FileText, Send, MessageSquare, 
  Copy, X, Check, Undo, RefreshCw, ZoomIn, ZoomOut, Save, Search, Calendar, ChevronDown
} from 'lucide-react';
import { mockDatabase } from '../data/mockDatabase';
import { Invoice, InvoiceItem, Product, Warehouse } from '../types';

interface InvoiceViewProps {
  lang: 'ar' | 'en';
  invoiceId?: string; // If viewing/editing existing invoice
  invoiceType: 'sale' | 'purchase';
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

  useEffect(() => {
    mockDatabase.init();
    const prods = mockDatabase.getProducts();
    const whs = mockDatabase.getWarehouses();
    const parts = mockDatabase.getPartners().filter(p => p.type === (invoiceType === 'sale' ? 'client' : 'vendor'));
    
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
      const prefix = invoiceType === 'sale' ? 'SAL' : 'PUR';
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
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; color: #2563eb; }
              .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 30px; font-size: 14px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
              th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: right; }
              th { bg-color: #f1f5f9; font-weight: bold; }
              .totals { margin-right: auto; width: 300px; font-size: 14px; }
              .totals-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; }
              .net { font-size: 16px; font-weight: bold; color: #16a34a; border-bottom: 2px solid #16a34a; padding-top: 5px; }
              .footer { text-align: center; margin-top: 80px; font-size: 11px; color: #64748b; border-t: 1px solid #e2e8f0; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="title">سامي سيستم للمحاسبة والمستودعات</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">الفرع الرئيسي - القاهرة</div>
              </div>
              <div style="text-align: left;">
                <div style="font-size: 18px; font-weight: bold; color: #2563eb;">${invoiceType === 'sale' ? 'فاتورة مبيعات ضريبية' : 'فاتورة مشتريات'}</div>
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
              سند محاسبي معتمد ومولّد تلقائياً عبر سامي سيستم - نظام الإمساك الدفتري المالي المتكامل
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className={`p-4 md:p-6 bg-[#f0f2f5] dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen font-sans ${isMaximized ? 'w-full' : 'max-w-7xl mx-auto'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Invoice Header Options Ribbon */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${invoiceType === 'sale' ? 'bg-blue-600' : 'bg-emerald-600'} text-white`}>
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1e40af] dark:text-white flex items-center gap-2">
              <span>{invoiceType === 'sale' ? (lang === 'ar' ? 'فاتورة مبيعات ممتازة' : 'Sales Invoice') : (lang === 'ar' ? 'فاتورة شراء مخزنية' : 'Purchase Invoice')}</span>
              <span className="text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded font-mono">{invoiceNo}</span>
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ar' ? `محرر المستند: ${currentUser.fullName}` : `Created by: ${currentUser.username}`}
            </p>
          </div>
        </div>

        {/* Option Action Buttons */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <button
            onClick={() => {
              setItems([]);
              addNewRow();
            }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded text-slate-700 dark:text-slate-200 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{lang === 'ar' ? 'جديد' : 'New'}</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-[#1e40af] hover:bg-blue-800 px-4 py-2 rounded text-white cursor-pointer shadow-sm active:scale-95 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'حفظ الفاتورة' : 'Save'}</span>
          </button>

          <button
            onClick={() => setIsApproved(!isApproved)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded border transition-all cursor-pointer ${
              isApproved 
                ? 'bg-emerald-50 dark:bg-emerald-600/20 border-emerald-300 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-400' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isApproved ? (lang === 'ar' ? 'معتمدة ومرحّلة' : 'Approved') : (lang === 'ar' ? 'اعتماد وترحيل' : 'Approve')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded text-slate-700 dark:text-slate-200 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{lang === 'ar' ? 'طباعة' : 'Print'}</span>
          </button>

          <button
            onClick={() => {
              alert(lang === 'ar' ? 'جاري محاكاة وتصدير ملف Excel مالي متكامل...' : 'Exporting clean Excel layout...');
            }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded text-slate-700 dark:text-slate-200 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => {
              alert(lang === 'ar' ? 'جاري تصدير وتوليد مستند PDF ضريبي...' : 'Exporting tax compliant PDF...');
            }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded text-slate-700 dark:text-slate-200 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>PDF</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950 px-3 py-2 rounded text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-all border border-slate-200 dark:border-slate-700 hover:border-rose-900"
          >
            <X className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'إغلاق ✖' : 'Close ✖'}</span>
          </button>
        </div>
      </div>

      {/* Barcode Quick Search Integration */}
      <form onSubmit={handleBarcodeSubmit} className="flex gap-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 max-w-lg shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            value={barcodeSearch}
            onChange={(e) => setBarcodeSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded py-1.5 pr-8 pl-3 text-xs text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
            placeholder={lang === 'ar' ? 'امسح الباركود ضوئياً أو أدخل كود الصنف...' : 'Scan barcode or type item code...'}
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-500" />
        </div>
        <button
          type="submit"
          className="bg-[#1e40af] hover:bg-blue-800 text-white px-4 py-1.5 rounded text-xs cursor-pointer font-bold transition-all shadow-sm"
        >
          {lang === 'ar' ? 'إضافة صنف' : 'Add'}
        </button>
      </form>

      {/* Invoice Meta-Data Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800/60 mb-6 shadow-sm">
        <div>
          <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'رقم المستند' : 'Invoice No.'}</label>
          <input
            type="text"
            readOnly
            value={invoiceNo}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-550 dark:text-slate-400 font-mono focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'التاريخ' : 'Date'}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">
            {invoiceType === 'sale' ? (lang === 'ar' ? 'العميل المستهدف' : 'Customer') : (lang === 'ar' ? 'المورد المعتمد' : 'Vendor')}
          </label>
          <select
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">{lang === 'ar' ? '-- اختر الحساب --' : '-- Choose Account --'}</option>
            {partners.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'المستودع المستهدف' : 'Warehouse'}</label>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:border-blue-500"
          >
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'مندوب الحركة' : 'Representative'}</label>
          <input
            type="text"
            value={representative}
            onChange={(e) => setRepresentative(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-850 dark:text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'طريقة السداد' : 'Payment Type'}</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-xs text-slate-850 dark:text-white focus:outline-none"
          >
            <option value="cash">{lang === 'ar' ? 'نقدي' : 'Cash'}</option>
            <option value="credit">{lang === 'ar' ? 'آجل ذمم' : 'Credit / Post-paid'}</option>
            <option value="bank">{lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'العملة' : 'Currency'}</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-xs text-slate-850 dark:text-white focus:outline-none"
          >
            <option value="EGP">EGP (جنيه مصري)</option>
            <option value="USD">USD (دولار أمريكي)</option>
            <option value="SAR">SAR (ريال سعودي)</option>
          </select>
        </div>
      </div>

      {/* Main Items Grid - Excel style with inline edits */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 text-right border-b border-slate-200 dark:border-slate-800 font-bold">
                <th className="p-3 w-12 text-center">م</th>
                <th className="p-3 w-40">{lang === 'ar' ? 'كود الصنف *' : 'Item Code *'}</th>
                <th className="p-3 w-64">{lang === 'ar' ? 'اسم الصنف' : 'Item Name'}</th>
                <th className="p-3 w-40">{lang === 'ar' ? 'الباركود' : 'Barcode'}</th>
                <th className="p-3 w-20">{lang === 'ar' ? 'الوحدة' : 'Unit'}</th>
                <th className="p-3 w-24 text-center">{lang === 'ar' ? 'الكمية *' : 'Qty *'}</th>
                <th className="p-3 w-28 text-left">{lang === 'ar' ? 'السعر *' : 'Price *'}</th>
                <th className="p-3 w-20 text-center">{lang === 'ar' ? 'خصم %' : 'Disc %'}</th>
                <th className="p-3 w-20 text-center">{lang === 'ar' ? 'ضريبة %' : 'VAT %'}</th>
                <th className="p-3 w-32 text-left">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                <th className="p-3 w-44">{lang === 'ar' ? 'ملاحظات' : 'Notes'}</th>
                <th className="p-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all font-mono text-slate-800 dark:text-white">
                  <td className="p-2 text-center text-slate-400 dark:text-slate-500 font-bold">{index + 1}</td>
                  
                  {/* Product Code Select or Input */}
                  <td className="p-1">
                    <select
                      value={item.productCode}
                      onChange={(e) => handleCellChange(index, 'productCode', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-xs text-slate-850 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">{lang === 'ar' ? '-- اختر الكود --' : '-- Code --'}</option>
                      {products.map(p => (
                        <option key={p.id} value={p.code}>{p.code}</option>
                      ))}
                    </select>
                  </td>

                  {/* Product Name Select or readOnly Input */}
                  <td className="p-1">
                    <input
                      type="text"
                      readOnly
                      value={item.productName}
                      placeholder={lang === 'ar' ? 'اختر الكود للتحميل' : 'Select code to load'}
                      className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-300 rounded px-1.5 py-1 text-xs focus:outline-none"
                    />
                  </td>

                  {/* Barcode */}
                  <td className="p-1">
                    <input
                      type="text"
                      readOnly
                      value={item.barcode}
                      className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 rounded px-1.5 py-1 text-xs focus:outline-none"
                    />
                  </td>

                  {/* Unit */}
                  <td className="p-1">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleCellChange(index, 'unit', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-xs text-slate-800 dark:text-slate-300 focus:outline-none text-center"
                    />
                  </td>

                  {/* Quantity */}
                  <td className="p-1">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleCellChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none text-center"
                    />
                  </td>

                  {/* Price */}
                  <td className="p-1">
                    <input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) => handleCellChange(index, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-xs text-blue-600 dark:text-blue-400 font-bold focus:outline-none text-left"
                    />
                  </td>

                  {/* Discount percentage */}
                  <td className="p-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount}
                      onChange={(e) => handleCellChange(index, 'discount', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-xs text-amber-600 dark:text-amber-400 font-bold focus:outline-none text-center"
                    />
                  </td>

                  {/* Tax percentage */}
                  <td className="p-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.tax}
                      onChange={(e) => handleCellChange(index, 'tax', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-xs text-slate-800 dark:text-slate-300 focus:outline-none text-center"
                    />
                  </td>

                  {/* Total Amount calculated */}
                  <td className="p-2 text-left font-bold text-slate-850 dark:text-white bg-slate-100/50 dark:bg-slate-950/40">
                    {(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP
                  </td>

                  {/* Notes */}
                  <td className="p-1">
                    <input
                      type="text"
                      value={item.notes || ''}
                      onChange={(e) => handleCellChange(index, 'notes', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-xs text-slate-800 dark:text-slate-300 focus:outline-none"
                    />
                  </td>

                  {/* Remove row option */}
                  <td className="p-2 text-center">
                    <button
                      onClick={() => removeRow(index)}
                      className="text-rose-500 hover:text-rose-400 p-1 cursor-pointer hover:bg-rose-500/10 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add item button directly beneath grid */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-850 flex justify-between">
          <button
            onClick={addNewRow}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-250 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 px-4 py-2 rounded cursor-pointer transition-all shadow-sm font-bold"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{lang === 'ar' ? 'إضافة سطر جديد (Insert Row)' : 'Add Row'}</span>
          </button>

          <span className="text-[10px] text-slate-500 self-center">
            {lang === 'ar' ? '* تعبئة أكواد الأصناف بشكل صحيح يحدث الكميات والأسعار تلقائياً.' : '* Choosing item codes automatically populates descriptions.'}
          </span>
        </div>
      </div>

      {/* Invoice Bottom Calculations Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
        {/* Helper Instructions/Shortcuts */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">{lang === 'ar' ? 'ملاحظات المستند والشروط المالية' : 'Voucher Terms & Instructions'}</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {lang === 'ar' 
              ? 'إن اعتماد الفاتورة يرحّل القيمة المادية إلى الحساب الدفتري التابع للعميل/المورد، ويخصم الكمية الفورية مباشرة من المخزن المحدد أعلاه.' 
              : 'Approving an invoice post physical balance edits to warehouses and partner accounts ledger.'}
          </p>
          <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded border border-slate-200 dark:border-slate-800/60 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
            <p>⌨ {lang === 'ar' ? 'ملاحظة: يدعم الجدول التعديل المباشر كبرامج الإكسيل.' : 'Note: Grid allows live Excel-style calculations.'}</p>
            <p>⚡ {lang === 'ar' ? 'امسح الباركود للسرعة في جرد المبيعات والمستودعات.' : 'Scan barcode to insert item rapidly.'}</p>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="space-y-2 max-w-sm ml-auto mr-0 md:mr-auto md:ml-0 w-full text-xs">
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 py-1 border-b border-slate-200 dark:border-slate-800/50">
            <span>{lang === 'ar' ? 'إجمالي المنتجات قبل الضريبة والخصم:' : 'Subtotal (Before VAT/Discount):'}</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{subTotal.toLocaleString()} EGP</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 py-1 border-b border-slate-200 dark:border-slate-800/50">
            <span>{lang === 'ar' ? 'قيمة الخصم التجاري المباشر:' : 'Flat Commercial Discount:'}</span>
            <input
              type="number"
              min="0"
              value={discountValue}
              onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
              className="w-28 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-center text-amber-650 dark:text-amber-400 font-bold focus:outline-none"
            />
          </div>

          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 py-1 border-b border-slate-200 dark:border-slate-800/50">
            <span>{lang === 'ar' ? 'قيمة ضريبة القيمة المضافة (14%):' : 'Total 14% VAT:'}</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{totalTax.toLocaleString()} EGP</span>
          </div>

          <div className="flex justify-between items-center text-slate-900 dark:text-white py-2 border-b border-slate-200 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-950/40 px-2 rounded">
            <span className="text-blue-600 dark:text-blue-400">{lang === 'ar' ? 'الصافي النهائي للاستحقاق:' : 'Net Final Amount:'}</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">{netAmount.toLocaleString()} EGP</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 py-1 border-b border-slate-200 dark:border-slate-800/50">
            <span>{lang === 'ar' ? 'المبلغ المدفوع (المحصل):' : 'Paid Amount:'}</span>
            <input
              type="number"
              min="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
              className="w-28 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-center text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none"
            />
          </div>

          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 py-1">
            <span className={remainingAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}>
              {lang === 'ar' ? 'المبلغ المتبقي (ذمم معلقة):' : 'Remaining / Debt Balance:'}
            </span>
            <span className={`font-mono font-bold ${remainingAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
              {remainingAmount.toLocaleString()} EGP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
