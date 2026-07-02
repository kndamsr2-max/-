import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, Plus, Minus, Trash2, Printer, CreditCard, Coins, 
  Award, Building, User, Sparkles, Check, CheckCircle, Ticket, X, RefreshCw
} from 'lucide-react';
import { mockDatabase } from '../data/mockDatabase';
import { Product } from '../types';
import ProductModal from './ProductModal';

interface POSViewProps {
  lang: 'ar' | 'en';
  currentUser: any;
  onClose: () => void;
}

export default function POSView({ lang, currentUser, onClose }: POSViewProps) {
  // Database load
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  // Cart state
  const [cart, setCart] = useState<Array<{ product: Product; qty: number }>>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  
  // Enterprise context
  const [selectedBranch, setSelectedBranch] = useState<string>('cairo');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('C001'); // default to Nor Co.
  const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'wallet'>('cash');
  
  // Cash calculations
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [lastReceiptData, setLastReceiptData] = useState<any | null>(null);

  // Load products initially
  useEffect(() => {
    setProducts(mockDatabase.getProducts());
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Helper text mapping
  const t = {
    posTitle: lang === 'ar' ? 'شاشة نقطة البيع السريعة' : 'Fast POS Terminal',
    branch: lang === 'ar' ? 'الفرع التشغيلي:' : 'Active Branch:',
    search: lang === 'ar' ? 'ابحث باسم المنتج أو باركود...' : 'Search product or barcode...',
    customer: lang === 'ar' ? 'العميل المعتمد:' : 'Select Customer:',
    items: lang === 'ar' ? 'قائمة الفاتورة الفورية' : 'Active Ticket Items',
    totalBefore: lang === 'ar' ? 'الإجمالي قبل الضريبة والخصم:' : 'Subtotal:',
    tax: lang === 'ar' ? 'ضريبة القيمة المضافة (14%):' : 'VAT 14%:',
    discount: lang === 'ar' ? 'الخصم المباشر (%):' : 'Flat Discount (%):',
    grandTotal: lang === 'ar' ? 'الصافي الإجمالي المستحق:' : 'Grand Net Total:',
    cashPay: lang === 'ar' ? 'الدفع نقداً (Cash)' : 'Pay Cash',
    cardPay: lang === 'ar' ? 'الدفع بالبطاقة (Card)' : 'Card Payment',
    walletPay: lang === 'ar' ? 'محفظة النقاط والعضويات' : 'Redeem Wallet',
    cashReceived: lang === 'ar' ? 'المستلم من العميل:' : 'Cash Received:',
    changeDue: lang === 'ar' ? 'المتبقي لتقديمه للعميل:' : 'Refund Change:',
    completeOrder: lang === 'ar' ? 'اعتماد وطباعة الإيصال الفوري' : 'Post & Print Receipt',
    emptyCart: lang === 'ar' ? 'سلة المبيعات فارغة، انقر فوق الأصناف في اليسار لإضافتها!' : 'Cart is empty! Click items to add.',
    stockAlert: lang === 'ar' ? 'تنبيه: كمية منخفضة!' : 'Stock Alert!',
    loyaltyBonus: lang === 'ar' ? 'النقاط التي سيتم كسبها:' : 'Loyalty Points Gained:'
  };

  // Add item to POS cart
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert(lang === 'ar' ? 'الصنف نفد تماماً من المستودع الرئيسي!' : 'Out of Stock in main warehouse!');
      return;
    }
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.qty >= product.stock) {
        alert(lang === 'ar' ? `لا توجد كمية كافية بالمستودع! الكمية الفورية المتوفرة: ${product.stock}` : `Insufficient stock! Immediate stock: ${product.stock}`);
        return;
      }
      setCart(cart.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { product, qty: 1 }]);
    }
  };

  const updateQty = (productId: string, val: number) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;
    const newQty = item.qty + val;
    if (newQty <= 0) {
      setCart(cart.filter(i => i.product.id !== productId));
      return;
    }
    if (newQty > item.product.stock) {
      alert(lang === 'ar' ? `الكمية المدخلة تتجاوز رصيد المستودع الحالي (${item.product.stock})` : `Requested qty exceeds stock limit (${item.product.stock})`);
      return;
    }
    setCart(cart.map(i => i.product.id === productId ? { ...i, qty: newQty } : i));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const taxAmount = parseFloat((subtotal * 0.14).toFixed(2));
  const discountAmount = parseFloat((subtotal * (discountPercent / 100)).toFixed(2));
  const grandTotal = parseFloat((subtotal + taxAmount - discountAmount).toFixed(2));
  const pointsGained = Math.floor(grandTotal / 100);

  // Handle transaction payment submission
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert(lang === 'ar' ? 'السلة فارغة!' : 'Cart is empty!');
      return;
    }

    if (paymentType === 'cash' && cashGiven < grandTotal) {
      alert(lang === 'ar' ? 'المبلغ المستلم من العميل أقل من الصافي المطلوب!' : 'Cash received is less than total!');
      return;
    }

    // Load customer data
    const partners = mockDatabase.getPartners();
    const customer = partners.find(p => p.id === selectedCustomer) || { name: 'زبون نقدي عام', balance: 0 };

    // Register active invoice in database
    const invNo = `POS-${Date.now().toString().slice(-6)}`;
    
    // Deduct stock in database
    cart.forEach(item => {
      const dbProd = products.find(p => p.id === item.product.id);
      if (dbProd) {
        dbProd.stock -= item.qty;
      }
    });
    mockDatabase.saveProducts(products);

    // Save mock invoice
    const newInvoice = {
      id: invNo,
      invoiceNo: invNo,
      date: new Date().toISOString().split('T')[0],
      type: 'sale' as const,
      partnerId: customer.id || 'C-CASH',
      partnerName: customer.name,
      warehouseId: 'WH-01',
      warehouseName: 'مخزن المنتج التام',
      representative: currentUser.fullName,
      paymentMethod: paymentType,
      currency: 'EGP',
      subTotal: subtotal,
      discount: discountAmount,
      tax: taxAmount,
      netAmount: grandTotal,
      paidAmount: paymentType === 'cash' ? grandTotal : 0,
      remainingAmount: paymentType === 'cash' ? 0 : grandTotal,
      status: 'approved' as const,
      createdBy: currentUser.username,
      createdAt: new Date().toISOString(),
      company: 'سامي سيستم لأنظمة المحاسبة',
      branch: selectedBranch === 'cairo' ? 'الفرع الرئيسي - القاهرة' : selectedBranch === 'alex' ? 'فرع الإسكندرية الدولي' : 'فرع الجيزة الحديث',
      items: cart.map(item => ({
        id: `POS-ITEM-${Math.random().toString(36).substring(3,9).toUpperCase()}`,
        productCode: item.product.code,
        productName: item.product.name,
        barcode: item.product.barcode,
        unit: item.product.unit,
        quantity: item.qty,
        price: item.product.price,
        discount: discountPercent,
        tax: 14,
        total: item.product.price * item.qty
      }))
    };

    const currentInvoices = mockDatabase.getInvoices();
    mockDatabase.saveInvoices([newInvoice, ...currentInvoices]);

    // Record audit trail
    mockDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'فاتورة نقطة بيع',
      `تم إصدار إيصال مبيعات فوري رقم ${invNo} بقيمة ${grandTotal} EGP لفرع: ${newInvoice.branch}`
    );

    // Prepare receipt data
    setLastReceiptData({
      invoiceNo: invNo,
      date: newInvoice.date,
      branch: newInvoice.branch,
      cashier: currentUser.fullName,
      customerName: customer.name,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
      cashGiven: paymentType === 'cash' ? cashGiven : grandTotal,
      changeDue: paymentType === 'cash' ? parseFloat((cashGiven - grandTotal).toFixed(2)) : 0,
      paymentType,
      items: [...cart]
    });

    // Reset local states
    setCart([]);
    setCashGiven(0);
    setDiscountPercent(0);
    setShowReceipt(true);
  };

  // Quick cash keys
  const addQuickCash = (amount: number) => {
    setCashGiven(prev => prev + amount);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 md:p-6 bg-[#f0f2f5] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 flex flex-col gap-4 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Top action ribbon */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1e40af] text-white rounded-lg animate-pulse">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1e40af] dark:text-white flex items-center gap-2">
              <span>{t.posTitle}</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">● {lang === 'ar' ? 'نشط ومؤمن' : 'Active & Secured'}</span>
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ar' ? `المستخدم الفعلي: ${currentUser.fullName} (${currentUser.jobTitle})` : `Sales Associate: ${currentUser.fullName}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Branch Select */}
          <div className="flex items-center gap-1.5 text-xs">
            <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-slate-600 dark:text-slate-400 hidden sm:inline">{t.branch}</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="cairo">{lang === 'ar' ? 'الفرع الرئيسي - القاهرة' : 'Cairo Main Branch'}</option>
              <option value="alex">{lang === 'ar' ? 'فرع الإسكندرية الدولي' : 'Alexandria Branch'}</option>
              <option value="giza">{lang === 'ar' ? 'فرع الجيزة الجديد' : 'Giza Branch'}</option>
            </select>
          </div>

          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/40 px-3 py-1.5 rounded text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'إضافة كارت صنف (+)' : 'Add Item Card (+)'}</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950 px-3 py-1.5 rounded text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-150 dark:border-slate-700 transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'خروج' : 'Exit'}</span>
          </button>
        </div>
      </div>

      {/* Main Terminal Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        
        {/* Left Side: Product catalog and search */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-4 overflow-hidden">
          
          {/* Catalog Controls */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pr-9 pl-3 text-xs text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            </div>

            {/* Category Select list */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full scrollbar-none shrink-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    selectedCategory === cat 
                      ? 'bg-[#1e40af] border-[#1e40af] text-white' 
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-150'
                  }`}
                >
                  {cat === 'all' ? (lang === 'ar' ? 'الكل' : 'All Categories') : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid with scroll */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pr-1">
            {filteredProducts.map(p => {
              const isLowStock = p.stock <= p.minLimit;
              const isOutOfStock = p.stock <= 0;
              return (
                <div
                  key={p.id}
                  onClick={() => !isOutOfStock && addToCart(p)}
                  className={`border rounded-xl p-3.5 flex flex-col justify-between transition-all select-none relative overflow-hidden bg-slate-50 dark:bg-slate-950/40 ${
                    isOutOfStock 
                      ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-900' 
                      : 'cursor-pointer border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-md hover:bg-white dark:hover:bg-slate-900 active:scale-98'
                  }`}
                >
                  <div>
                    {/* Category Label */}
                    <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                      {p.category}
                    </span>

                    {/* Product Name */}
                    <h3 className="text-xs font-bold mt-2 text-slate-900 dark:text-white line-clamp-2">
                      {lang === 'ar' ? p.name : p.nameEn}
                    </h3>

                    {/* Barcode / Code */}
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{p.code}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      {/* Price tag */}
                      <span className="text-sm font-black text-[#1e40af] dark:text-blue-400 font-mono">
                        {p.price.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 ml-1">EGP</span>
                    </div>

                    {/* Stock indicator badge */}
                    <div>
                      {isOutOfStock ? (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-100">
                          {lang === 'ar' ? 'نفذت الكمية' : 'Sold Out'}
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-100 animate-pulse">
                          {lang === 'ar' ? `حرِج: ${p.stock}` : `Alert: ${p.stock}`}
                        </span>
                      ) : (
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-100">
                          {lang === 'ar' ? `المخزون: ${p.stock}` : `Stock: ${p.stock}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
                <Ticket className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs font-bold">{lang === 'ar' ? 'لا يوجد أصناف مطابقة لبحثك' : 'No matching products found'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Invoice Ticket Calculator */}
        <div className="w-full lg:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between overflow-hidden">
          
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            
            {/* Customer selector inside POS */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">
                {t.customer}
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                >
                  <option value="C-CASH">{lang === 'ar' ? 'عميل نقدي عام (زبون ممر)' : 'General Walk-in Customer (Cash)'}</option>
                  <option value="C001">{lang === 'ar' ? 'شركة النور للمقاولات - رصيد نقاط متميز' : 'Al-Noor Co. - High Loyalty Account'}</option>
                  <option value="C002">{lang === 'ar' ? 'مؤسسة الرياض للأوراق والكرتون' : 'Al-Riyadh Paper Est.'}</option>
                  <option value="C003">{lang === 'ar' ? 'شركة المهندس للصناعات الغذائية' : 'Al-Mohandes Food Industries'}</option>
                  <option value="C004">{lang === 'ar' ? 'مصنع الأمل للبلاستيك' : 'Al-Amal Plastic Factory'}</option>
                </select>
                <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded border border-blue-100 dark:border-blue-900">
                  <User className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <h3 className="text-xs font-bold text-slate-700 dark:text-white mb-2 flex justify-between items-center shrink-0">
                <span>{t.items}</span>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                  {cart.length} {lang === 'ar' ? 'بنود' : 'items'}
                </span>
              </h3>

              {/* Cart List Scroll */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {cart.map(item => (
                  <div 
                    key={item.product.id}
                    className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200/60 dark:border-slate-800/60"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-xs font-bold text-slate-850 dark:text-white truncate">
                        {lang === 'ar' ? item.product.name : item.product.nameEn}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.product.price.toLocaleString()} EGP
                        </span>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1 rounded font-mono">
                          x{item.qty}
                        </span>
                      </div>
                    </div>

                    {/* Qty edit buttons & delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        onClick={() => updateQty(item.product.id, -1)}
                        className="w-5 h-5 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded flex items-center justify-center font-bold hover:bg-slate-100 cursor-pointer text-xs"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-mono font-bold w-6 text-center text-slate-850 dark:text-white">
                        {item.qty}
                      </span>
                      <button 
                        onClick={() => updateQty(item.product.id, 1)}
                        className="w-5 h-5 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded flex items-center justify-center font-bold hover:bg-slate-100 cursor-pointer text-xs"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-5 h-5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded flex items-center justify-center hover:bg-rose-100 border border-rose-100 dark:border-rose-900/60 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400 text-center px-4">
                    <ShoppingCart className="w-8 h-8 opacity-40 mb-2 text-slate-500 animate-bounce" />
                    <p className="text-[10px] leading-relaxed font-bold">{t.emptyCart}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Checkout calculations bottom ledger */}
          <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 shrink-0">
            {/* Prices block */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>{t.totalBefore}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{subtotal.toLocaleString()} EGP</span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span>{t.tax}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{taxAmount.toLocaleString()} EGP</span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span>{t.discount}</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1 py-0.5 text-center text-xs text-amber-600 font-bold"
                  />
                  <span>%</span>
                </div>
              </div>

              {/* Loyalty Reward Indicator */}
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 p-1.5 rounded border border-emerald-150 dark:border-emerald-950/40">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t.loyaltyBonus}</span>
                </span>
                <span className="font-mono font-black">+{pointsGained} {lang === 'ar' ? 'نقطة ولاء' : 'pts'}</span>
              </div>

              <div className="flex justify-between items-center text-slate-900 dark:text-white font-black bg-slate-50 dark:bg-slate-950/40 p-2 rounded text-sm border border-slate-200/50 dark:border-slate-800/80">
                <span className="text-[#1e40af] dark:text-blue-400">{t.grandTotal}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{grandTotal.toLocaleString()} EGP</span>
              </div>
            </div>

            {/* Payment type switcher */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                onClick={() => setPaymentType('cash')}
                className={`py-1.5 rounded text-[10px] font-bold flex flex-col items-center gap-1 transition-all border cursor-pointer ${
                  paymentType === 'cash' 
                    ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-600 dark:text-blue-400 font-black' 
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>{lang === 'ar' ? 'نقدي' : 'Cash'}</span>
              </button>
              
              <button
                onClick={() => {
                  setPaymentType('card');
                  setCashGiven(grandTotal);
                }}
                className={`py-1.5 rounded text-[10px] font-bold flex flex-col items-center gap-1 transition-all border cursor-pointer ${
                  paymentType === 'card' 
                    ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-600 dark:text-blue-400 font-black' 
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{lang === 'ar' ? 'شبكة فيزا' : 'Card / POS'}</span>
              </button>

              <button
                onClick={() => {
                  setPaymentType('wallet');
                  setCashGiven(grandTotal);
                }}
                className={`py-1.5 rounded text-[10px] font-bold flex flex-col items-center gap-1 transition-all border cursor-pointer ${
                  paymentType === 'wallet' 
                    ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-600 dark:text-blue-400 font-black' 
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>{lang === 'ar' ? 'محفظة نقاط' : 'Redeem Pts'}</span>
              </button>
            </div>

            {/* Cash Given & change calculator */}
            {paymentType === 'cash' && (
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500">{t.cashReceived}</span>
                  <input
                    type="number"
                    min="0"
                    value={cashGiven || ''}
                    onChange={(e) => setCashGiven(parseFloat(e.target.value) || 0)}
                    className="w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-center text-emerald-600 dark:text-emerald-400 font-bold font-mono focus:outline-none"
                    placeholder="EGP"
                  />
                </div>

                {/* Quick cash selector buttons */}
                <div className="flex flex-wrap gap-1">
                  {[50, 100, 200, 500].map(cash => (
                    <button
                      key={cash}
                      type="button"
                      onClick={() => addQuickCash(cash)}
                      className="bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-[10px] font-bold font-mono text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      +{cash}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCashGiven(0)}
                    className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer"
                  >
                    C
                  </button>
                </div>

                {cashGiven >= grandTotal && (
                  <div className="flex justify-between items-center text-xs border-t border-slate-200/50 dark:border-slate-800/50 pt-2 text-slate-500">
                    <span>{t.changeDue}</span>
                    <span className="font-mono font-black text-amber-600 dark:text-amber-400">
                      {(cashGiven - grandTotal).toFixed(2)} EGP
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Execute Payment button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full text-white font-bold py-2.5 rounded-lg text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                cart.length === 0
                  ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed opacity-50'
                  : 'bg-[#1e40af] hover:bg-blue-800 hover:shadow shadow-blue-500/10 active:scale-[0.98]'
              }`}
            >
              <Printer className="w-4 h-4 animate-bounce" />
              <span>{t.completeOrder}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Modern Thermal Receipt Printing Dialog Simulator overlay */}
      {showReceipt && lastReceiptData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white text-slate-900 rounded-xl p-5 w-full max-w-sm shadow-2xl relative border-t-8 border-t-[#1e40af]">
            
            {/* Thermal paper header styling */}
            <div className="text-center font-sans">
              <h3 className="text-sm font-black text-[#1e40af] uppercase">** {lang === 'ar' ? 'سامي سيستم للمبيعات الفورية' : 'SAMI FAST SALES TERMINAL'} **</h3>
              <p className="text-[10px] text-slate-500 mt-1 font-bold">{lastReceiptData.branch}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">VAT NO: 498-125-992</p>
              <div className="border-b border-dashed border-slate-300 my-3"></div>
            </div>

            {/* Metadata */}
            <div className="text-[10px] space-y-1 font-mono text-slate-600">
              <div className="flex justify-between">
                <span>إيصال رقم / Receipt No:</span>
                <span className="font-bold">{lastReceiptData.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span>التاريخ / Date:</span>
                <span>{lastReceiptData.date}</span>
              </div>
              <div className="flex justify-between">
                <span>الكاشير / Cashier:</span>
                <span>{lastReceiptData.cashier}</span>
              </div>
              <div className="flex justify-between">
                <span>العميل / Customer:</span>
                <span className="font-bold">{lastReceiptData.customerName}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-slate-300 my-3"></div>

            {/* Receipt Items list */}
            <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[11px] text-slate-800">
              {lastReceiptData.items.map((item: any) => (
                <div key={item.product.id} className="flex justify-between">
                  <div className="pr-4">
                    <p className="font-bold">{lang === 'ar' ? item.product.name : item.product.nameEn}</p>
                    <p className="text-[9px] text-slate-500">x{item.qty} @ {item.product.price.toLocaleString()} EGP</p>
                  </div>
                  <span className="font-bold shrink-0">{(item.product.price * item.qty).toLocaleString()} EGP</span>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-slate-300 my-3"></div>

            {/* Calculations total receipt */}
            <div className="text-[10px] font-mono space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>المجموع الفرعي / Subtotal:</span>
                <span>{lastReceiptData.subtotal.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between text-amber-700 font-bold">
                <span>الخصم الممنوح / Discount:</span>
                <span>-{lastReceiptData.discountAmount.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>ضريبة قيمة مضافة / VAT 14%:</span>
                <span>{lastReceiptData.taxAmount.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between text-xs font-black text-slate-900 border-t border-slate-200 pt-2.5">
                <span>الصافي النهائي / Net Due:</span>
                <span>{lastReceiptData.grandTotal.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>طريقة السداد / Paid Method:</span>
                <span className="font-bold uppercase">{lastReceiptData.paymentType}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>المستلم / Amount Paid:</span>
                <span>{lastReceiptData.cashGiven.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between font-bold text-rose-700">
                <span>المتبقي للعميل / Change:</span>
                <span>{lastReceiptData.changeDue.toLocaleString()} EGP</span>
              </div>
            </div>

            <div className="border-b border-dashed border-slate-300 my-4"></div>

            {/* Barcode representation */}
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="h-8 bg-slate-900 w-44 flex items-center justify-center text-white text-[8px] font-mono tracking-[4px]">
                ||| | |||| | || | |||
              </div>
              <p className="text-[8px] text-slate-400 font-mono mt-1">Sami-POS-Transaction-Verified</p>
            </div>

            {/* Receipt Footer close buttons */}
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer border border-slate-300"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'طباعة ورق' : 'Print Paper'}</span>
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 bg-[#1e40af] hover:bg-blue-800 text-white text-xs font-bold py-2 rounded-lg text-center cursor-pointer"
              >
                {lang === 'ar' ? 'تم ومتابعة' : 'Done & Close'}
              </button>
            </div>

          </div>
        </div>
      )}

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
  );
}
