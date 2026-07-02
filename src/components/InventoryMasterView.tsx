import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Archive, ArrowRightLeft, RefreshCw, Layers, CheckCircle, 
  Printer, Trash2, Calendar, FileText, Percent, Barcode, Shield, X
} from 'lucide-react';
import { mockDatabase } from '../data/mockDatabase';
import { Product } from '../types';

interface InventoryMasterProps {
  lang: 'ar' | 'en';
  currentUser: any;
  onClose: () => void;
}

export default function InventoryMasterView({ lang, currentUser, onClose }: InventoryMasterProps) {
  const [activeSubTab, setActiveSubTab] = useState<'vouchers' | 'jard' | 'promos'>('vouchers');
  const [products, setProducts] = useState<Product[]>([]);

  // Stock Vouchers state
  const [vouchers, setVouchers] = useState([
    { id: 'STK-9001', type: 'in', date: '2026-06-21', warehouse: 'مخزن المنتج التام', productCode: 'PROD-101', productName: 'شاشة سامسونج LED 32', qty: 20, supervisor: 'أحمد محمود', notes: 'توريد من المصنع الرئيسي' },
    { id: 'STK-9002', type: 'out', date: '2026-06-23', warehouse: 'مخزن بولارس', productCode: 'PROD-104', productName: 'ماوس لاسلكي لوجيتك', qty: 5, supervisor: 'يوسف شريف', notes: 'سحب لفرع التجزئة' },
    { id: 'STK-9003', type: 'in', date: '2026-06-25', warehouse: 'مخزن الخامات', productCode: 'PROD-102', productName: 'كابل HDMI فائق السرعة 3م', qty: 50, supervisor: 'كريم خالد', notes: 'استلام بضاعة المورد الصيني' }
  ]);

  const [vType, setVType] = useState<'in' | 'out'>('in');
  const [vWarehouse, setVWarehouse] = useState('WH-01');
  const [vProdCode, setVProdCode] = useState('PROD-101');
  const [vQty, setVQty] = useState<number>(0);
  const [vNotes, setVNotes] = useState('');

  // Jard / Stock-taking physical counts list
  const [jardProducts, setJardProducts] = useState<Array<{ product: Product; physical: number; difference: number }>>([]);

  // Offers & Promos state
  const [promos, setPromos] = useState([
    { id: 'PR-10', name: 'عروض صيف شركة سامي للأجهزة', nameEn: 'Sami Summer Monitors Promotion', discount: 15, itemCategory: 'إلكترونيات', activeUntil: '2026-08-31', status: 'active' },
    { id: 'PR-11', name: 'قائمة خصومات مستلزمات الشحن', nameEn: 'HDMI Cables Bundle Discount', discount: 25, itemCategory: 'إكسسوارات', activeUntil: '2026-07-15', status: 'active' },
    { id: 'PR-12', name: 'حملة تصفية الأحبار منتهية الصلاحية', nameEn: 'HP Ink Clearance Drive', discount: 30, itemCategory: 'أحبار', activeUntil: '2026-06-30', status: 'expired' }
  ]);
  const [promoName, setPromoName] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<number>(10);
  const [promoCategory, setPromoCategory] = useState('إلكترونيات');

  // Load products initially
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const prods = mockDatabase.getProducts();
    setProducts(prods);

    // Populate stock-taking table with system default amounts
    setJardProducts(prods.map(p => ({
      product: p,
      physical: p.stock, // Default counted physical is equal to system
      difference: 0
    })));
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (vQty <= 0) {
      alert(lang === 'ar' ? 'يرجى إدخال كمية صحيحة أكبر من الصفر!' : 'Enter a valid quantity!');
      return;
    }

    const selectedProduct = products.find(p => p.code === vProdCode);
    if (!selectedProduct) return;

    if (vType === 'out' && selectedProduct.stock < vQty) {
      alert(lang === 'ar' ? `رصيد المستودع غير كافي! الرصيد المتاح: ${selectedProduct.stock}` : `Insufficient stock! Stock available: ${selectedProduct.stock}`);
      return;
    }

    // Update stock in database
    const updatedProducts = products.map(p => {
      if (p.code === vProdCode) {
        const newStock = vType === 'in' ? p.stock + vQty : p.stock - vQty;
        return { ...p, stock: newStock };
      }
      return p;
    });
    mockDatabase.saveProducts(updatedProducts);
    setProducts(updatedProducts);

    // Save stock voucher record
    const warehouseName = vWarehouse === 'WH-01' ? 'مخزن المنتج التام' : vWarehouse === 'WH-02' ? 'مخزن بولارس' : 'مخزن الخامات';
    const newVoucher = {
      id: `STK-${Date.now().toString().slice(-4)}`,
      type: vType,
      date: new Date().toISOString().split('T')[0],
      warehouse: warehouseName,
      productCode: vProdCode,
      productName: selectedProduct.name,
      qty: vQty,
      supervisor: currentUser.fullName,
      notes: vNotes || (vType === 'in' ? 'إضافة مخزنية معتمدة' : 'صرف مخزني معتمد')
    };

    setVouchers([newVoucher, ...vouchers]);

    // Record audit trails
    mockDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'حركة مستودعات',
      `تم إصدار إذن مخزني ${vType === 'in' ? 'إضافة' : 'صرف'} رقم ${newVoucher.id} للصنف: ${selectedProduct.name} بكمية ${vQty}`
    );

    // Sync physical counting table
    setJardProducts(updatedProducts.map(p => ({
      product: p,
      physical: p.stock,
      difference: 0
    })));

    setVQty(0);
    setVNotes('');
    alert(lang === 'ar' ? 'تم إصدار إذن المستودعات وترحيل كميات كرت الصنف فوراً بنجاح!' : 'Warehouse voucher recorded and stock adjusted!');
  };

  // Update physical count on a specific product card in the Jard
  const handlePhysicalCountChange = (productId: string, val: number) => {
    const updated = jardProducts.map(item => {
      if (item.product.id === productId) {
        const diff = val - item.product.stock;
        return {
          ...item,
          physical: val,
          difference: diff
        };
      }
      return item;
    });
    setJardProducts(updated);
  };

  // Commit stock taking adjustments
  const handleCommitJardAdjustments = () => {
    // Generate system audit log and correct DB
    const adjusted = jardProducts.map(item => {
      return {
        ...item.product,
        stock: item.physical
      };
    });

    mockDatabase.saveProducts(adjusted);
    setProducts(adjusted);

    // Audit logs entry
    mockDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'جرد المخزون السنوي',
      `تم إثبات جرد وتسوية فروق الكميات لـ ${adjusted.length} صنف مستودع`
    );

    alert(lang === 'ar' ? 'تم اعتماد تعديلات جرد المستودعات ومطابقة الأرصدة الدفترية مع الأرصدة الفعلية على الرف بنجاح!' : 'Physical stock counts committed & database matched successfully!');
    loadProducts();
  };

  // Create new active campaign promo offer
  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoName) return;

    const newPromo = {
      id: `PR-${Date.now().toString().slice(-2)}`,
      name: promoName,
      nameEn: promoName,
      discount: promoDiscount,
      itemCategory: promoCategory,
      activeUntil: '2026-12-31',
      status: 'active'
    };

    setPromos([newPromo, ...promos]);

    mockDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'تحديث العروض والأسعار',
      `تم تعميم عرض سعري جديد خصم %${promoDiscount} لفئة الأصناف: ${promoCategory}`
    );

    setPromoName('');
    alert(lang === 'ar' ? 'تم تعميم قائمة العروض والتخفيضات الجديدة بمنافذ الفروع والـ POS بنجاح!' : 'New price offer promulgated to all POS terminals!');
  };

  return (
    <div className="p-4 md:p-6 bg-[#f0f2f5] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Top action ribbon */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-lg">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1e40af] dark:text-white flex items-center gap-2">
              <span>{lang === 'ar' ? 'إدارة المستودعات، الجرد، والعروض' : 'Inventory, Stocktaking & Offers Master'}</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">WMS v4.2</span>
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ar' ? 'إصدار أذون الإضافة والصرف، جرد المخازن الفعلية، وتنزيل العروض وحملات الأسعار المعتمدة' : 'Post stock-in/out vouchers, perform physical counts (Jard), create promo price lists'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إغلاق شاشة المستودعات' : 'Close Module'}</span>
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 rounded-t-xl gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('vouchers')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'vouchers' 
              ? 'bg-[#1e40af] text-white shadow' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'أذون المستودعات (إضافة/صرف)' : 'Warehouse Stock Vouchers'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('jard')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'jard' 
              ? 'bg-[#1e40af] text-white shadow' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{lang === 'ar' ? 'جرد المستودعات وتعديل المخزون' : 'Stocktaking (Jard Adjustment)'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('promos')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'promos' 
              ? 'bg-[#1e40af] text-white shadow' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>{lang === 'ar' ? 'العروض وقوائم الأسعار المحدثة' : 'Offers & Price Lists'}</span>
        </button>
      </div>

      {/* Tab content area */}
      <div className="bg-white dark:bg-slate-900 border border-t-0 border-slate-200 dark:border-slate-800 rounded-b-xl p-5 shadow-sm">
        
        {/* Subtab 1: stock vouchers */}
        {activeSubTab === 'vouchers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form to issue a voucher */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 text-xs">
                <h3 className="text-xs font-bold text-slate-850 dark:text-white mb-3 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#1e40af]" />
                  <span>{lang === 'ar' ? 'إصدار إذن حركة مستودعات رسمي' : 'Issue New Stock Voucher'}</span>
                </h3>

                <form onSubmit={handleCreateVoucher} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'نوع الحركة:' : 'Voucher Type:'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setVType('in')}
                        className={`py-1.5 rounded text-xs font-bold border transition-all cursor-pointer ${
                          vType === 'in' 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-black' 
                            : 'bg-white text-slate-500 border-slate-200'
                        }`}
                      >
                        {lang === 'ar' ? 'إذن إضافة (+)' : 'Stock In (+)'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setVType('out')}
                        className={`py-1.5 rounded text-xs font-bold border transition-all cursor-pointer ${
                          vType === 'out' 
                            ? 'bg-rose-50 border-rose-500 text-rose-700 font-black' 
                            : 'bg-white text-slate-500 border-slate-200'
                        }`}
                      >
                        {lang === 'ar' ? 'إذن صرف (-)' : 'Stock Out (-)'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'المستودع المستهدف:' : 'Select Warehouse:'}</label>
                    <select
                      value={vWarehouse}
                      onChange={(e) => setVWarehouse(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5"
                    >
                      <option value="WH-01">{lang === 'ar' ? 'مخزن المنتج التام (WH-01)' : 'Finished Goods WH (WH-01)'}</option>
                      <option value="WH-02">{lang === 'ar' ? 'مخزن بولارس (WH-02)' : 'Polaris WH (WH-02)'}</option>
                      <option value="WH-05">{lang === 'ar' ? 'مخزن الخامات (WH-05)' : 'Raw Materials WH (WH-05)'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'الصنف المستودعي:' : 'Select Product:'}</label>
                    <select
                      value={vProdCode}
                      onChange={(e) => setVProdCode(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.code}>[{p.code}] {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'الكمية بالأرقام:' : 'Voucher Quantity:'}</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={vQty || ''}
                      onChange={(e) => setVQty(parseInt(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded py-1.5 px-3 font-bold font-mono"
                      placeholder="e.g. 10"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'البيان وملاحظات الترخيص:' : 'Reason / Notes:'}</label>
                    <textarea
                      value={vNotes}
                      onChange={(e) => setVNotes(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثل: تسوية رصيد وارد من المورد أو إتلاف تلف...' : 'e.g. Inbound shipment verified...'}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2 h-16 text-slate-850 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1e40af] hover:bg-blue-800 text-white font-bold py-2 rounded shadow transition-all cursor-pointer"
                  >
                    {lang === 'ar' ? 'اعتماد وترحيل الإذن' : 'Approve & Post'}
                  </button>
                </form>
              </div>

              {/* History list of warehouse vouchers */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  {lang === 'ar' ? 'سجل تتبع أذون الصرف والإضافة المعتمدة' : 'Inbound & Outbound Vouchers Audit Log'}
                </h3>

                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-slate-700 dark:text-slate-300 text-right">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3">رقم الإذن</th>
                        <th className="p-3">الحركة</th>
                        <th className="p-3">التاريخ</th>
                        <th className="p-3">المستودع</th>
                        <th className="p-3">اسم الصنف</th>
                        <th className="p-3 text-center">الكمية</th>
                        <th className="p-3">المشرف المسؤول</th>
                        <th className="p-3">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {vouchers.map(v => (
                        <tr key={v.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50">
                          <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{v.id}</td>
                          <td className="p-3 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              v.type === 'in' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {v.type === 'in' ? (lang === 'ar' ? 'إضافة (+)' : 'In') : (lang === 'ar' ? 'صرف (-)' : 'Out')}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{v.date}</td>
                          <td className="p-3 font-sans">{v.warehouse}</td>
                          <td className="p-3 font-sans font-bold">{v.productName}</td>
                          <td className="p-3 text-center font-black">{v.qty}</td>
                          <td className="p-3 font-sans">{v.supervisor}</td>
                          <td className="p-3 font-sans text-slate-500 truncate max-w-[120px]">{v.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Subtab 2: Jard / Stock taking count adjustment */}
        {activeSubTab === 'jard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold text-[#1e40af] dark:text-white">
                  {lang === 'ar' ? 'محاكي جرد المخازن السنوي والتسوية الكمية الفورية' : 'Live Physical Stocktaking & Ledger Adjustments (Jard)'}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === 'ar' ? 'قارن الكمية الدفترية المسجلة على السيرفر بالكمية الفعلية على أرفف المستودع لتسجيل العجز أو الزيادة آلياً' : 'Verify and sync physical shelves count with corporate databases'}
                </p>
              </div>

              <button
                onClick={handleCommitJardAdjustments}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{lang === 'ar' ? 'اعتماد جرد الرفوف وتحديث السيستم' : 'Commit Shelf Counts & Adjust'}</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
              <table className="w-full text-xs text-slate-700 dark:text-slate-300 text-right">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">كود الصنف</th>
                    <th className="p-3">اسم الصنف المستودعي</th>
                    <th className="p-3">الباركود</th>
                    <th className="p-3 text-center">الكمية الدفترية بالسيستم</th>
                    <th className="p-3 text-center">الكمية الفعلية على الرف (معدل)</th>
                    <th className="p-3 text-center">الفروقات والعجز والزيادة</th>
                    <th className="p-3 text-center">الحالة الإرشادية</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {jardProducts.map(item => {
                    return (
                      <tr key={item.product.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50">
                        <td className="p-3 font-bold text-[#1e40af] dark:text-blue-400">{item.product.code}</td>
                        <td className="p-3 font-sans font-bold">{lang === 'ar' ? item.product.name : item.product.nameEn}</td>
                        <td className="p-3 text-slate-500">{item.product.barcode}</td>
                        <td className="p-3 text-center font-bold text-slate-600">{item.product.stock}</td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={item.physical}
                            onChange={(e) => handlePhysicalCountChange(item.product.id, Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-center py-1 font-black text-blue-600"
                          />
                        </td>
                        <td className={`p-3 text-center font-black ${item.difference < 0 ? 'text-rose-600' : item.difference > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {item.difference > 0 ? `+${item.difference}` : item.difference}
                        </td>
                        <td className="p-3 text-center">
                          {item.difference < 0 ? (
                            <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold">
                              {lang === 'ar' ? 'عجز بالرف' : 'Deficit'}
                            </span>
                          ) : item.difference > 0 ? (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                              {lang === 'ar' ? 'زيادة بالرف' : 'Surplus'}
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                              {lang === 'ar' ? 'مطابق وممتاز' : 'Matched'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subtab 3: Promos, offers & Price lists */}
        {activeSubTab === 'promos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Promo builder Form */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 text-xs">
                <h3 className="text-xs font-bold text-slate-850 dark:text-white mb-3 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-emerald-500" />
                  <span>{lang === 'ar' ? 'إنشاء منشور عروض وحملة ترويجية' : 'Create Special Price Promo'}</span>
                </h3>

                <form onSubmit={handleCreatePromo} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'اسم الحملة الترويجية:' : 'Promo Campaign Name:'}</label>
                    <input
                      type="text"
                      required
                      value={promoName}
                      onChange={(e) => setPromoName(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: عروض التخفيضات الكبرى للتجهيزات' : 'e.g., Back to school super discounts'}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'نسبة الخصم المعتمد (%):' : 'Promo Discount (%):'}</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        required
                        value={promoDiscount || ''}
                        onChange={(e) => setPromoDiscount(Math.min(90, Math.max(1, parseInt(e.target.value) || 0)))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded py-1.5 px-3 font-bold text-emerald-600 font-mono"
                      />
                      <span className="absolute right-3 top-2 text-[10px] font-mono">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'الفئة المستهدفة بالخصم:' : 'Target Category:'}</label>
                    <select
                      value={promoCategory}
                      onChange={(e) => setPromoCategory(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5"
                    >
                      <option value="إلكترونيات">{lang === 'ar' ? 'أجهزة وإلكترونيات' : 'Electronics'}</option>
                      <option value="إكسسوارات">{lang === 'ar' ? 'إكسسوارات وموصلات' : 'Accessories'}</option>
                      <option value="أحبار">{lang === 'ar' ? 'أحبار طابعات مستوردة' : 'Toners & Inks'}</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1e40af] hover:bg-blue-800 text-white font-bold py-2 rounded shadow transition-all cursor-pointer"
                  >
                    {lang === 'ar' ? 'اعتماد ونشر خصم الأسعار' : 'Publish & Broadcast Price list'}
                  </button>
                </form>
              </div>

              {/* Price lists promos tables */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  {lang === 'ar' ? 'حملات أسعار الخصومات والعروض الفعالة' : 'Active Price Offers & Discount Sheets'}
                </h3>

                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-slate-700 dark:text-slate-300 text-right">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3">كود العرض</th>
                        <th className="p-3">عنوان الحملة</th>
                        <th className="p-3 text-center">الخصم المبرمج</th>
                        <th className="p-3">الفئة المستهدفة</th>
                        <th className="p-3">صلاحية العرض حتى</th>
                        <th className="p-3 text-center">الحالة التشغيلية</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {promos.map(pr => (
                        <tr key={pr.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50">
                          <td className="p-3 font-bold text-[#1e40af] dark:text-blue-400">{pr.id}</td>
                          <td className="p-3 font-sans font-bold">{lang === 'ar' ? pr.name : pr.nameEn}</td>
                          <td className="p-3 text-center text-rose-600 font-bold">-{pr.discount}%</td>
                          <td className="p-3 font-sans">{pr.itemCategory}</td>
                          <td className="p-3 text-slate-500">{pr.activeUntil}</td>
                          <td className="p-3 text-center font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              pr.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {pr.status === 'active' ? (lang === 'ar' ? 'فعّال حالياً' : 'Active') : (lang === 'ar' ? 'منتهي الصلاحية' : 'Expired')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
