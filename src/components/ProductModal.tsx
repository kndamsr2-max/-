import React, { useState, useEffect } from 'react';
import { X, Package, Barcode, DollarSign, Layers, Calendar, Tag, Info, AlertTriangle } from 'lucide-react';
import { mockDatabase } from '../data/mockDatabase';
import { Product } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newProduct: Product) => void;
  lang: 'ar' | 'en';
  currentUser: any;
}

export default function ProductModal({ isOpen, onClose, onSave, lang, currentUser }: ProductModalProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [barcode, setBarcode] = useState('');
  const [unit, setUnit] = useState('عدد');
  const [category, setCategory] = useState('إلكترونيات');
  const [price, setPrice] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [minLimit, setMinLimit] = useState<number>(5);
  const [reorderLimit, setReorderLimit] = useState<number>(10);
  const [expiryDate, setExpiryDate] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-generate safe product code and barcode when modal opens
  useEffect(() => {
    if (isOpen) {
      const products = mockDatabase.getProducts();
      
      // Suggest next product code
      let nextNum = 101;
      const codes = products.map(p => {
        const match = p.code.match(/PROD-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      });
      const maxCodeNum = Math.max(...codes, 100);
      nextNum = maxCodeNum + 1;
      setCode(`PROD-${nextNum}`);

      // Suggest barcode
      const randomBarcode = '69' + Math.floor(10000000000 + Math.random() * 90000000000).toString();
      setBarcode(randomBarcode);

      // Reset form fields
      setName('');
      setNameEn('');
      setUnit(lang === 'ar' ? 'عدد' : 'PCS');
      setCategory('إلكترونيات');
      setPrice(0);
      setCost(0);
      setStock(0);
      setMinLimit(5);
      setReorderLimit(10);
      setExpiryDate('');
      setBatchNo('');
      setSerialNo('');
      setErrorMsg('');
    }
  }, [isOpen, lang]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !name.trim()) {
      setErrorMsg(lang === 'ar' ? 'يرجى ملء الحقول الإجبارية (كود الصنف واسم الصنف)' : 'Please fill required fields (Code and Name)');
      return;
    }

    const products = mockDatabase.getProducts();
    // Validate duplicates
    if (products.some(p => p.code.toLowerCase() === code.trim().toLowerCase())) {
      setErrorMsg(lang === 'ar' ? `كود الصنف [${code}] مستخدم بالفعل!` : `Product code [${code}] already exists!`);
      return;
    }

    if (barcode && products.some(p => p.barcode === barcode.trim() && p.barcode !== '')) {
      setErrorMsg(lang === 'ar' ? `الباركود [${barcode}] مستخدم بالفعل لصنف آخر!` : `Barcode [${barcode}] is already assigned!`);
      return;
    }

    if (price < cost) {
      if (!window.confirm(lang === 'ar' ? 'تنبيه: سعر البيع أقل من سعر التكلفة! هل تريد الاستمرار بحفظ كارت الصنف؟' : 'Warning: Sale price is lower than cost! Do you want to continue?')) {
        return;
      }
    }

    const finalNameEn = nameEn.trim() || name.trim();

    const newProduct: Product = {
      id: 'P' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      code: code.trim(),
      name: name.trim(),
      nameEn: finalNameEn,
      barcode: barcode.trim(),
      unit,
      category,
      price: Number(price) || 0,
      cost: Number(cost) || 0,
      stock: Number(stock) || 0,
      minLimit: Number(minLimit) || 0,
      reorderLimit: Number(reorderLimit) || 0,
      expiryDate: expiryDate || undefined,
      batchNo: batchNo.trim() || undefined,
      serialNo: serialNo.trim() || undefined
    };

    // Save product in mock db
    const updatedProducts = [...products, newProduct];
    mockDatabase.saveProducts(updatedProducts);

    // Add Audit Log
    mockDatabase.addAuditLog(
      currentUser?.id || 'USER-ADMIN',
      currentUser?.username || 'admin',
      'إضافة كارت صنف',
      `تم إنشاء كارت صنف جديد بنجاح: ${newProduct.name} [كود: ${newProduct.code}] بسعر بيع ${newProduct.price} ج وتكلفة ${newProduct.cost} ج.`
    );

    onSave(newProduct);
    onClose();
  };

  const handleGenerateBarcode = () => {
    const randomBarcode = '69' + Math.floor(10000000000 + Math.random() * 90000000000).toString();
    setBarcode(randomBarcode);
  };

  const categoriesAr = ['إلكترونيات', 'إكسسوارات', 'أجهزة مكتبية', 'أحبار', 'قطع غيار', 'خدمات', 'أخرى'];
  const categoriesEn = ['Electronics', 'Accessories', 'Office Equipment', 'Toners/Inks', 'Spare Parts', 'Services', 'Others'];

  const unitsAr = ['عدد', 'حبة', 'علبة', 'كرتونة', 'متر', 'كجم', 'خدمة'];
  const unitsEn = ['PCS', 'Unit', 'Box', 'Carton', 'Meter', 'KG', 'Service'];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[9999] p-4 animate-fadeIn" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div 
        id="add_product_card_modal"
        className="bg-slate-900 border-2 border-[#b89047] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-white"
      >
        {/* Header bar mimicking premium system style */}
        <div className="bg-slate-950 border-b border-[#b89047]/30 p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#b89047]/10 rounded-lg text-[#b89047] border border-[#b89047]/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#b89047]">
                {lang === 'ar' ? 'توليد كارت صنف جديد (تعريف صنف مخزني)' : 'Create New Product Card / Inventory Item'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {lang === 'ar' ? 'أدخل تفاصيل ومواصفات السلعة ونسب الأسعار المعتمدة للترحيل بالسيستم' : 'Define pricing, stock levels and identification parameters'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 text-xs">
          {errorMsg && (
            <div className="bg-rose-950/40 border border-rose-500/50 rounded-lg p-3 text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Core identification */}
          <div className="bg-black/30 p-4 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-[10px] font-black tracking-wider text-slate-400 uppercase border-b border-slate-800 pb-1.5 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#b89047]" />
              <span>{lang === 'ar' ? 'الهوية والبيانات الأساسية للصنف' : 'Primary Product Identity'}</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">
                  {lang === 'ar' ? 'كود الصنف الفريد *' : 'Unique Item Code *'}
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#b89047]"
                  placeholder="e.g. PROD-106"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">
                  {lang === 'ar' ? 'الباركود الدولي (EAN-13)' : 'International Barcode (EAN-13)'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#b89047]"
                    placeholder="e.g. 6901234567890"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateBarcode}
                    className="bg-slate-800 hover:bg-slate-700 text-[#b89047] px-3 rounded-lg border border-slate-700 text-[10px] font-bold whitespace-nowrap cursor-pointer"
                    title={lang === 'ar' ? 'توليد باركود تلقائي' : 'Generate Barcode'}
                  >
                    <Barcode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">
                  {lang === 'ar' ? 'اسم الصنف باللغة العربية *' : 'Product Arabic Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#b89047] font-bold"
                  placeholder={lang === 'ar' ? 'شاحن ايفون سريع 20 وات' : 'e.g., iPhone Fast Charger 20W'}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">
                  {lang === 'ar' ? 'الاسم باللغة الإنجليزية' : 'English Name / Description'}
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#b89047]"
                  placeholder="e.g., Apple iPhone Charger 20W USB-C"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">
                  {lang === 'ar' ? 'الفئة / القسم الرئيسي' : 'Category / Classification'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#b89047] cursor-pointer"
                >
                  {(lang === 'ar' ? categoriesAr : categoriesEn).map((cat, idx) => {
                    const val = lang === 'ar' ? cat : categoriesAr[idx];
                    return (
                      <option key={val} value={val}>{cat}</option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">
                  {lang === 'ar' ? 'وحدة القياس الأساسية' : 'Standard Unit'}
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#b89047] cursor-pointer"
                >
                  {(lang === 'ar' ? unitsAr : unitsEn).map((un, idx) => {
                    const val = lang === 'ar' ? un : unitsAr[idx];
                    return (
                      <option key={val} value={val}>{un}</option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing parameters */}
          <div className="bg-black/30 p-4 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-[10px] font-black tracking-wider text-slate-400 uppercase border-b border-slate-800 pb-1.5 mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#b89047]" />
              <span>{lang === 'ar' ? 'التسعير ونسب الأرباح' : 'Pricing & Costing Matrix'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">
                  {lang === 'ar' ? 'تكلفة شراء الصنف (Cost) *' : 'Purchase Cost (Cost) *'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={cost || ''}
                  onChange={(e) => setCost(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#b89047]"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">
                  {lang === 'ar' ? 'سعر البيع الافتراضي (Price) *' : 'Default Retail Price (Price) *'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={price || ''}
                  onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[#b89047] font-mono font-bold focus:outline-none focus:border-[#b89047]"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">
                  {lang === 'ar' ? 'هامش الربح المتوقع' : 'Estimated Profit Margin'}
                </label>
                <div className="w-full bg-slate-950/50 border border-slate-850 rounded-lg px-3 py-2 text-slate-400 font-mono font-bold flex justify-between items-center select-none">
                  <span>{(price - cost).toLocaleString()} EGP</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans ${price > cost ? 'bg-emerald-950/50 text-emerald-400' : 'bg-rose-950/50 text-rose-400'}`}>
                    {price > 0 ? (((price - cost) / price) * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stock control and thresholds */}
          <div className="bg-black/30 p-4 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-[10px] font-black tracking-wider text-slate-400 uppercase border-b border-slate-800 pb-1.5 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#b89047]" />
              <span>{lang === 'ar' ? 'إعدادات أرصدة المستودع والحدود الأمنية' : 'Stock Levels & Reorder Limits'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">
                  {lang === 'ar' ? 'الكمية الفورية الحالية (الرصيد الافتتاحي)' : 'Current Physical Stock'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock || ''}
                  onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#b89047]"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">
                  {lang === 'ar' ? 'حد الطلب الأدنى' : 'Minimum Stock Alert'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={minLimit || ''}
                  onChange={(e) => setMinLimit(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-mono focus:outline-none focus:border-[#b89047]"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">
                  {lang === 'ar' ? 'الحد الأقصى للتخزين' : 'Reorder Limit Threshold'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={reorderLimit || ''}
                  onChange={(e) => setReorderLimit(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-mono focus:outline-none focus:border-[#b89047]"
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          {/* Traceability parameters */}
          <div className="bg-black/30 p-4 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-[10px] font-black tracking-wider text-slate-400 uppercase border-b border-slate-800 pb-1.5 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#b89047]" />
              <span>{lang === 'ar' ? 'تتبع التشغيلات وصلاحية المنتج (Traceability)' : 'Batch, Serial Numbers & Shelf-Life'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">
                  {lang === 'ar' ? 'تاريخ انتهاء الصلاحية' : 'Expiry Date'}
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#b89047]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">
                  {lang === 'ar' ? 'رقم التشغيلة / اللوت (Batch No)' : 'Batch/Lot Number'}
                </label>
                <input
                  type="text"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#b89047]"
                  placeholder="e.g. B-SAM-2026"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">
                  {lang === 'ar' ? 'الرقم التسلسلي للجهاز (Serial No)' : 'Serial Number (SN)'}
                </label>
                <input
                  type="text"
                  value={serialNo}
                  onChange={(e) => setSerialNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#b89047]"
                  placeholder="e.g. SN-SAM-0012"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="border-t border-slate-800 pt-5 flex justify-end gap-3.5 sticky bottom-0 bg-slate-900 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-all active:scale-95 border border-slate-800"
            >
              {lang === 'ar' ? 'إلغاء الأمر ✖' : 'Cancel ✖'}
            </button>
            <button
              type="submit"
              className="bg-[#b89047] hover:bg-amber-400 text-black font-extrabold px-6 py-2.5 rounded-xl cursor-pointer transition-all active:scale-95 shadow-lg shadow-amber-500/10"
            >
              {lang === 'ar' ? 'حفظ الصنف وتوليد الكارت 💾' : 'Save Item & Generate Card 💾'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
