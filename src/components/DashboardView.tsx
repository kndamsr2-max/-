import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Package, Users, AlertTriangle, Clock, Calendar, ShieldCheck, 
  ArrowLeftRight, ArrowUpRight, DollarSign, RefreshCw 
} from 'lucide-react';
import { mockDatabase } from '../data/mockDatabase';
import { Product, Invoice } from '../types';

interface DashboardViewProps {
  lang: 'ar' | 'en';
  onOpenInvoice: (invoiceId: string, type: 'sale' | 'purchase') => void;
  onOpenTab: (tabId: string, titleAr: string, titleEn: string, type: string, props?: any) => void;
}

export default function DashboardView({ lang, onOpenInvoice, onOpenTab }: DashboardViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    mockDatabase.init();
    setProducts(mockDatabase.getProducts());
    setInvoices(mockDatabase.getInvoices());
    setLastUpdated(new Date().toLocaleTimeString());
  };

  // Dashboard Stats Calculations
  const salesInvoices = invoices.filter(inv => inv.type === 'sale' && inv.status === 'approved');
  const purchaseInvoices = invoices.filter(inv => inv.type === 'purchase' && inv.status === 'approved');

  const totalSales = salesInvoices.reduce((sum, inv) => sum + inv.netAmount, 0);
  const totalPurchases = purchaseInvoices.reduce((sum, inv) => sum + inv.netAmount, 0);
  const estimatedProfit = salesInvoices.reduce((sum, inv) => {
    // Basic profit calculation based on mock costs
    return sum + (inv.netAmount - inv.subTotal * 0.8); // 20% mock margin
  }, 0);

  // Stock Alerts
  const lowStockProducts = products.filter(p => p.stock <= p.minLimit);
  const nearExpiryProducts = products.filter(p => {
    if (!p.expiryDate) return false;
    const expDate = new Date(p.expiryDate);
    const today = new Date();
    const diffMonths = (expDate.getFullYear() - today.getFullYear()) * 12 + (expDate.getMonth() - today.getMonth());
    return diffMonths <= 6 && diffMonths >= 0;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#f0f2f5] dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Upper Status Bar */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#b89047] dark:text-[#c5a880] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#b89047] dark:text-[#c5a880]" />
            <span>{lang === 'ar' ? 'مؤشرات الأداء المالي والمخزني' : 'Financial & Inventory Indicators'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar' ? 'مراقبة المبيعات والمشتريات وحالة المستودعات في الوقت الفعلي' : 'Real-time monitoring of sales, purchases & inventory status'}
          </p>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center gap-2 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer active:scale-95 transition-all text-blue-600 dark:text-blue-400"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Grid of Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm hover:shadow-md relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{lang === 'ar' ? 'إجمالي المبيعات المعتمدة' : 'Total Approved Sales'}</p>
              <h3 className="text-2xl font-bold mt-2 text-blue-600 dark:text-blue-400 font-mono">
                {totalSales.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">EGP</span>
              </h3>
            </div>
            <div className="bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.4% {lang === 'ar' ? 'مقارنة بالشهر الماضي' : 'vs last month'}</span>
          </div>
        </div>

        {/* Purchases Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm hover:shadow-md relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{lang === 'ar' ? 'إجمالي المشتريات المعتمدة' : 'Total Approved Purchases'}</p>
              <h3 className="text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400 font-mono">
                {totalPurchases.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">EGP</span>
              </h3>
            </div>
            <div className="bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'تم التحديث في الوقت الحالي' : 'Updated just now'}</span>
          </div>
        </div>

        {/* Estimated Profit Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm hover:shadow-md relative overflow-hidden group hover:border-violet-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl group-hover:bg-violet-500/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{lang === 'ar' ? 'صافي الأرباح التقديرية' : 'Estimated Net Profit'}</p>
              <h3 className="text-2xl font-bold mt-2 text-violet-600 dark:text-violet-400 font-mono">
                {estimatedProfit.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">EGP</span>
              </h3>
            </div>
            <div className="bg-violet-500/10 p-2.5 rounded-lg border border-violet-500/20 text-violet-600 dark:text-violet-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.1% {lang === 'ar' ? 'معدل ربحية متميز' : 'High profitability'}</span>
          </div>
        </div>

        {/* Active Products Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm hover:shadow-md relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{lang === 'ar' ? 'الأصناف المسجلة بالنظام' : 'Registered Items'}</p>
              <h3 className="text-2xl font-bold mt-2 text-amber-600 dark:text-amber-500 font-mono">
                {products.length} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'أصناف' : 'items'}</span>
              </h3>
            </div>
            <div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-500">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{lowStockProducts.length} {lang === 'ar' ? 'أصناف تحت حد الطلب' : 'items need restock'}</span>
          </div>
        </div>
      </div>

      {/* Warnings & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alert Block */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{lang === 'ar' ? 'تنبيهات نقص المخزون' : 'Low Stock Restock Alerts'}</span>
            </h3>
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">{lang === 'ar' ? 'جميع مستويات المخزون آمنة وطبيعية.' : 'All stock levels are safe.'}</p>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-amber-500/20">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{lang === 'ar' ? `كود: ${p.code} | الوحدة: ${p.unit}` : `Code: ${p.code}`}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-500 dark:text-rose-400 font-mono">{p.stock}</span>
                      <p className="text-[9px] text-slate-500 mt-0.5">{lang === 'ar' ? `حد الطلب: ${p.minLimit}` : `Min: ${p.minLimit}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={() => onOpenTab('products', 'دليل كارت الصنف', 'Product Master Data', 'products')}
            className="w-full text-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 py-2 rounded-lg transition-all border border-slate-200 dark:border-slate-700 mt-4 cursor-pointer"
          >
            {lang === 'ar' ? 'فتح دليل الأصناف وإصدار أمر شراء' : 'Open Product Master to Restock'}
          </button>
        </div>

        {/* Expiration warning block */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>{lang === 'ar' ? 'تنبيهات قرب انتهاء الصلاحية' : 'Expiry Warnings'}</span>
            </h3>
            {nearExpiryProducts.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">{lang === 'ar' ? 'لا توجد أصناف توشك صلاحيتها على الانتهاء.' : 'No items near expiry date.'}</p>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {nearExpiryProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-emerald-500/20">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{lang === 'ar' ? `رقم التشغيلة: ${p.batchNo || 'بدون'}` : `Batch: ${p.batchNo}`}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{p.expiryDate}</span>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">{lang === 'ar' ? 'يستحق الإعدام أو الصرف' : 'Requires early action'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => onOpenTab('stock_transfer', 'تحويل بين المخازن', 'Warehouse Transfer', 'stock_transfer')}
            className="w-full text-center text-xs text-blue-600 hover:text-[#1e40af] dark:text-blue-400 dark:hover:text-blue-300 font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 py-2 rounded-lg transition-all border border-slate-200 dark:border-slate-700 mt-4 cursor-pointer"
          >
            {lang === 'ar' ? 'نقل الأصناف لمستودع التالف/المرتجعات' : 'Transfer items to Scrap/Return WH'}
          </button>
        </div>

        {/* Debt management warning block */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Users className="w-4 h-4 text-rose-500" />
              <span>{lang === 'ar' ? 'تنبيهات المديونيات والأرصدة المستحقة' : 'Customer/Vendor Balances'}</span>
            </h3>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {mockDatabase.getPartners().map(partner => (
                <div key={partner.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{partner.name}</h4>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${partner.type === 'client' ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-500'}`}>
                      {partner.type === 'client' ? (lang === 'ar' ? 'عميل' : 'Client') : (lang === 'ar' ? 'مورد' : 'Vendor')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold font-mono ${partner.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-400'}`}>
                      {partner.balance.toLocaleString()} EGP
                    </span>
                    <p className="text-[9px] text-slate-500 mt-0.5">{lang === 'ar' ? 'رصيد دفتري معلق' : 'Outstanding Balance'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => alert(lang === 'ar' ? 'ميزة "سندات المقاصة والقيود المالية" متوفرة في قسم الحسابات بالكامل!' : 'Financial settlement engine is fully automated!')}
            className="w-full text-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 py-2 rounded-lg transition-all border border-slate-200 dark:border-slate-700 mt-4 cursor-pointer"
          >
            {lang === 'ar' ? 'إجراء تسوية حسابية أو سداد' : 'Initiate Financial Settlement'}
          </button>
        </div>
      </div>

      {/* Recent invoices summary table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Clock className="w-4 h-4 text-[#1e40af] dark:text-indigo-400" />
          <span>{lang === 'ar' ? 'أحدث الفواتير والمستندات المحررة' : 'Latest Registered Invoices'}</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-right">
                <th className="p-3">{lang === 'ar' ? 'رقم الفاتورة' : 'Invoice No.'}</th>
                <th className="p-3">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="p-3">{lang === 'ar' ? 'النوع' : 'Type'}</th>
                <th className="p-3">{lang === 'ar' ? 'الطرف الثاني' : 'Partner Name'}</th>
                <th className="p-3">{lang === 'ar' ? 'المستودع' : 'Warehouse'}</th>
                <th className="p-3 text-left">{lang === 'ar' ? 'الصافي' : 'Net Amount'}</th>
                <th className="p-3">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="p-3 text-center">{lang === 'ar' ? 'خيارات' : 'Options'}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{inv.invoiceNo}</td>
                  <td className="p-3 font-mono">{inv.date}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.type === 'sale' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {inv.type === 'sale' ? (lang === 'ar' ? 'فاتورة بيع' : 'Sales') : (lang === 'ar' ? 'فاتورة شراء' : 'Purchase')}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{inv.partnerName}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{inv.warehouseName}</td>
                  <td className="p-3 text-left font-mono font-bold text-emerald-600 dark:text-emerald-400">{inv.netAmount.toLocaleString()} EGP</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/10 text-slate-500 dark:text-slate-400'
                    }`}>
                      {inv.status === 'approved' ? (lang === 'ar' ? 'معتمدة' : 'Approved') : (lang === 'ar' ? 'مسودة' : 'Draft')}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onOpenInvoice(inv.id, inv.type)}
                      className="text-xs bg-[#1e40af] hover:bg-blue-800 text-white px-3.5 py-1 rounded-md cursor-pointer transition-all shadow-sm"
                    >
                      {lang === 'ar' ? 'عرض / تعديل' : 'View / Edit'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
