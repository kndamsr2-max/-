import React, { useState } from 'react';
import { 
  Building, Settings, HelpCircle, ShieldAlert, Sparkles, CheckCircle, Percent, 
  Trash2, Phone, Database, Send, Network, Cpu, Clock, DollarSign, Calendar, X, ShieldCheck
} from 'lucide-react';
import { mockDatabase } from '../data/mockDatabase';

interface EnterpriseExtraProps {
  lang: 'ar' | 'en';
  currentUser: any;
  onClose: () => void;
}

export default function EnterpriseExtraView({ lang, currentUser, onClose }: EnterpriseExtraProps) {
  const [activeSubTab, setActiveSubTab] = useState<'branches' | 'support' | 'financials' | 'alerts'>('branches');

  // Branch list state
  const [branches, setBranches] = useState([
    { code: 'BR-CAI', name: 'فرع الإدارة الرئيسي - القاهرة', nameEn: 'Cairo HQ Branch', manager: 'م. سامي الجيار', staff: 14, sales: 840000, status: 'active' },
    { code: 'BR-ALX', name: 'الفرع الإقليمي الدولي - الإسكندرية', nameEn: 'Alexandria Branch', manager: 'أحمد محمود', staff: 6, sales: 310000, status: 'active' },
    { code: 'BR-GIZ', name: 'معرض البيع المباشر الجديد - الجيزة', nameEn: 'Giza Retail Showroom', manager: 'يوسف شريف', staff: 5, sales: 185000, status: 'active' },
    { code: 'BR-POL', name: 'مستودع بولارس اللوجستي والتحويلات', nameEn: 'Polaris Logistics Hub', manager: 'كريم خالد', staff: 4, sales: 0, status: 'active' }
  ]);

  // API Developer sandbox state
  const [apiKey, setApiKey] = useState('sami_sec_token_9901x_01278150_live');
  const [webhookUrl, setWebhookUrl] = useState('https://api.sami-system-erp.com/webhooks/sales');
  const [isGenerating, setIsGenerating] = useState(false);

  // Maintenance & Warranties state
  const [tickets, setTickets] = useState([
    { id: 'TCK-201', client: 'شركة النور للمقاولات', item: 'طابعة ليزر إتش بي Pro', issue: 'بهتان حبر في الطباعة المزدوجة', status: 'diagnosing', date: '2026-06-25' },
    { id: 'TCK-202', client: 'مكتبة مصر العامة', item: 'شاشة سامسونج LED 32', issue: 'فصل كابل التيار الكهربائي الداخلي', status: 'pending_parts', date: '2026-06-28' },
    { id: 'TCK-203', client: 'مؤسسة الرياض للأوراق', item: 'راوتر شبكات فايبر IBM', issue: 'تحديث السوفت وير والربط البرمجي', status: 'solved', date: '2026-06-20' }
  ]);

  // Warranty claims database
  const [warranties, setWarranties] = useState([
    { id: 'WAR-881', client: 'شركة النور للمقاولات', item: 'شاشة سامسونج LED 32', duration: '36 شهر', expiryDate: '2029-06-25', status: 'valid' },
    { id: 'WAR-882', client: 'شركة المهندس للمواد', item: 'طابعة ليزر إتش بي Pro', duration: '12 شهر', expiryDate: '2027-06-18', status: 'valid' }
  ]);

  // Installments state
  const [installments, setInstallments] = useState([
    { id: 'INST-01', client: 'شركة النور للمقاولات', totalAmount: 45000, paidAmount: 15000, remainingAmount: 30000, monthlyFee: 5000, dueDate: '2026-07-15' },
    { id: 'INST-02', client: 'مؤسسة الرياض للأوراق والكرتون', totalAmount: 18000, paidAmount: 12000, remainingAmount: 6000, monthlyFee: 3000, dueDate: '2026-07-05' },
    { id: 'INST-03', client: 'مكتبة مصر العامة للأعمال', totalAmount: 9000, paidAmount: 3000, remainingAmount: 6000, monthlyFee: 1500, dueDate: '2026-07-20' }
  ]);

  // Commissions state
  const [commissions, setCommissions] = useState([
    { id: 'REP-01', name: 'أحمد محمود سليمان', monthlySales: 125000, target: 150000, rate: 3, earned: 3750 },
    { id: 'REP-02', name: 'يوسف شريف عبد الهادي', monthlySales: 195000, target: 150000, rate: 5, earned: 9750 },
    { id: 'REP-03', name: 'كريم خالد الشرقاوي', monthlySales: 80000, target: 120000, rate: 2, earned: 16000 }
  ]);

  // Insurance policies database
  const [insurances, setInsurances] = useState([
    { id: 'INS-001', company: 'مصر للتأمين التكافلي', type: 'تأمين الحريق والسرقة للمخازن', policyNo: 'POL-MISR-9921', premium: 12000, coverage: 5000000 },
    { id: 'INS-002', company: 'أليانز للتأمين الطبي', type: 'تأمين طبي شامل لموظفي الفروع', policyNo: 'POL-ALZ-4122', premium: 35000, coverage: 150000 },
    { id: 'INS-003', company: 'أكسا لتأمين النقل واللوجستيات', type: 'تأمين حوادث عربات نقل المبيعات', policyNo: 'POL-AXA-0811', premium: 8000, coverage: 300000 }
  ]);

  // Monitoring alerts state
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'stock_low', text: 'شاشة سامسونج LED 32 اقتربت من حد الطلب (المخزن: 4 وحدات)', date: 'اليوم', status: 'critical' },
    { id: 2, type: 'installment_due', text: 'قسط مستحق متأخر على مؤسسة الرياض للأوراق (مبلغ: 3000 ج)', date: 'أمس', status: 'warning' },
    { id: 3, type: 'warranty_expire', text: 'عقد صيانة خادم IBM الرئيسي يوشك على الانتهاء بعد 15 يوماً', date: 'منذ يومين', status: 'info' }
  ]);

  // Actions handlers
  const handleGenerateNewKey = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = `sami_sec_token_${Math.random().toString(36).substring(2, 10).toUpperCase()}_verified`;
      setApiKey(generated);
      setIsGenerating(false);

      mockDatabase.addAuditLog(
        currentUser.id,
        currentUser.username,
        'تجديد رمز الربط البرمجي',
        `تم تجديد رمز التحقق البرمجي API Token لجهاز الرابط الخارجي بنجاح.`
      );

      alert(lang === 'ar' ? 'تم توليد وتأمين كود الربط السحابي الجديد وتحديث جدار الحماية!' : 'New secure API Token generated and synchronized!');
    }, 1000);
  };

  const handleUpdateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    mockDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'تحديث رابط الويب هوك Webhook',
      `تحديث رابط الاستجابة السريع للمبيعات إلى: ${webhookUrl}`
    );
    alert(lang === 'ar' ? 'تم حفظ مسار الويب هوك وتجربة الاتصال بنجاح (HTTP 200 OK)!' : 'Webhook URL synchronized and hand-shake verified!');
  };

  const handlePayInstallment = (id: string) => {
    const updated = installments.map(inst => {
      if (inst.id === id) {
        if (inst.remainingAmount <= 0) {
          alert(lang === 'ar' ? 'تم سداد كافة الأقساط المقررة على هذا العميل!' : 'This installment book is already fully settled!');
          return inst;
        }
        const newPaid = inst.paidAmount + inst.monthlyFee;
        const newRemaining = inst.totalAmount - newPaid;
        return {
          ...inst,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          dueDate: '2026-08-15' // roll to next month due date for simulation
        };
      }
      return inst;
    });
    setInstallments(updated);

    const match = installments.find(i => i.id === id);
    if (match) {
      mockDatabase.addAuditLog(
        currentUser.id,
        currentUser.username,
        'سداد قسط عميل',
        `تم تحصيل قسط بقيمة ${match.monthlyFee} EGP من العميل: ${match.client}`
      );
      alert(lang === 'ar' ? `تم تحصيل القيد وإيداع قيمة القسط (${match.monthlyFee.toLocaleString()} EGP) بخزينة القاهرة المعتمدة بنجاح!` : `Installment of ${match.monthlyFee} EGP recorded successfully!`);
    }
  };

  const handleResolveAlert = (alertId: number) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  return (
    <div className="p-4 md:p-6 bg-[#f0f2f5] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Top Header Ribbon */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-lg">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1e40af] dark:text-white flex items-center gap-2">
              <span>{lang === 'ar' ? 'مجمع الفروع، الأقساط، الصيانة، والربط البرمجي' : 'Branches, Installments, Tickets & Web APIs Workspace'}</span>
              <span className="text-xs bg-violet-100 text-violet-750 dark:bg-violet-950/40 dark:text-violet-400 px-2 py-0.5 rounded font-mono font-bold">HQ-Global v4.5</span>
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ar' ? 'تعدد الفروع والربط البرمجي API، إدارة الصيانة والضمانات، إدارة الأقساط، العمولات ومستهدف المبيعات، والتأمين الشامل الكلي' : 'Manage regional branches, developer API tokens, maintenance, customer installment files, sales targets & insurance logs'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إغلاق الشاشة' : 'Close Module'}</span>
        </button>
      </div>

      {/* Tabs navigation list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 rounded-t-xl gap-2 overflow-x-auto">
        
        <button
          onClick={() => setActiveSubTab('branches')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'branches' 
              ? 'bg-[#1e40af] text-white shadow' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>{lang === 'ar' ? 'تعدد الفروع والربط البرمجي API' : 'Multi-Branches & Developer API'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('support')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'support' 
              ? 'bg-[#1e40af] text-white shadow' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{lang === 'ar' ? 'الصيانة والضمانات وخدمات ما بعد البيع' : 'Maintenance & Warranties'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('financials')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'financials' 
              ? 'bg-[#1e40af] text-white shadow' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span>{lang === 'ar' ? 'الأقساط، العمولات والتأمينات' : 'Installments, Quotas & Insurances'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('alerts')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'alerts' 
              ? 'bg-[#1e40af] text-white shadow' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>{lang === 'ar' ? 'غرفة المتابعة والتنبيهات المبرمجة' : 'Monitoring Control Alerts'}</span>
        </button>

      </div>

      {/* Main Tab content workspace */}
      <div className="bg-white dark:bg-slate-900 border border-t-0 border-slate-200 dark:border-slate-800 rounded-b-xl p-5 shadow-sm">
        
        {/* SUBTAB 1: Branches and APIs */}
        {activeSubTab === 'branches' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Branches Grid List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  {lang === 'ar' ? 'إحصائيات وحالة الفروع المسجلة بجمهورية مصر العربية' : 'Active Branches Operations & Revenues'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {branches.map(br => (
                    <div key={br.code} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-3 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded font-mono">
                            {br.code}
                          </span>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1.5">
                            {lang === 'ar' ? br.name : br.nameEn}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-1">{lang === 'ar' ? `المشرف الإقليمي: ${br.manager}` : `Director: ${br.manager}`}</p>
                        </div>

                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {lang === 'ar' ? 'متصل ونشط' : 'Online'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-slate-200/50 dark:border-slate-800/50 pt-3 text-center">
                        <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-150 font-mono">
                          <p className="text-[8px] text-slate-500">{lang === 'ar' ? 'فريق العمل' : 'Staff Size'}</p>
                          <p className="text-xs font-black text-slate-850 dark:text-white mt-0.5">{br.staff} {lang === 'ar' ? 'موظفين' : 'staff'}</p>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-150 font-mono">
                          <p className="text-[8px] text-slate-500">{lang === 'ar' ? 'حجم مبيعات الفرع' : 'Branch Sales'}</p>
                          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{br.sales.toLocaleString()} EGP</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Developer credentials playground */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-4">
                <h3 className="text-xs font-bold text-slate-850 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#1e40af]" />
                  <span>{lang === 'ar' ? 'الربط البرمجي API وبوابة المطورين' : 'Secure Web API Integration'}</span>
                </h3>

                <div className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'رمز التحقق المعتمد (Authorization Header Key):' : 'Bearer Authorization API Key:'}</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={apiKey}
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded px-2.5 py-1.5 font-mono text-[9px] text-[#1e40af] dark:text-blue-400"
                      />
                      <button
                        onClick={handleGenerateNewKey}
                        disabled={isGenerating}
                        className="bg-[#1e40af] text-white font-bold px-2.5 py-1.5 rounded hover:bg-blue-800 transition-all text-[10px] cursor-pointer"
                      >
                        {isGenerating ? '...' : (lang === 'ar' ? 'توليد جديد' : 'Rotate')}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateWebhook} className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'مسار استدعاء المبيعات الفوري (Sales Event Webhook):' : 'Webhook Callback URL (Sales Events):'}</label>
                      <input
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded px-2.5 py-1.5 font-mono text-[10px]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-white font-bold py-1.5 rounded transition-all text-[10px] cursor-pointer border border-slate-200"
                    >
                      {lang === 'ar' ? 'فحص رابط الاتصال والربط' : 'Test Webhook Connection (POST)'}
                    </button>
                  </form>

                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded text-[9px] leading-relaxed font-semibold">
                    🔑 {lang === 'ar' ? 'نظام سامي سيستم يدعم بروتوكولات RESTful APIs الكاملة لربط المتاجر الإلكترونية وسلة وزد وشوبيفاي.' : 'Sami System exposes full JSON REST hooks for syncing Shopify, Salla, or custom e-commerce channels.'}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUBTAB 2: Support, maintenance & after-sales warranties */}
        {activeSubTab === 'support' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Support maintenance tickets */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  {lang === 'ar' ? 'أوامر شغل صيانة الأجهزة والورودات الفنية' : 'Diagnostics & Maintenance Work Orders'}
                </h3>

                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-slate-700 dark:text-slate-300 text-right">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3">رقم التذكرة</th>
                        <th className="p-3">العميل</th>
                        <th className="p-3">اسم الجهاز</th>
                        <th className="p-3">شرح العطل</th>
                        <th className="p-3 text-center">حالة الفحص والصيانة</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-[11px]">
                      {tickets.map(t => (
                        <tr key={t.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50">
                          <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{t.id}</td>
                          <td className="p-3 font-sans font-semibold">{t.client}</td>
                          <td className="p-3 font-sans">{t.item}</td>
                          <td className="p-3 font-sans text-slate-500">{t.issue}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.status === 'solved' ? 'bg-emerald-50 text-emerald-700' :
                              t.status === 'diagnosing' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700 animate-pulse'
                            }`}>
                              {t.status === 'solved' ? (lang === 'ar' ? 'تمت الصيانة والتسليم' : 'Resolved') :
                               t.status === 'diagnosing' ? (lang === 'ar' ? 'جاري الفحص المخبري' : 'Under Diagnostics') : (lang === 'ar' ? 'معلق لقطع الغيار' : 'Awaiting Parts')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* After-Sales Warranty Certificates tracking */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  {lang === 'ar' ? 'شهادات ضمان المبيعات وخدمات ما بعد البيع' : 'After-Sales Active Warranty Certificates'}
                </h3>

                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-slate-700 dark:text-slate-300 text-right">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3">رقم الضمان</th>
                        <th className="p-3">العميل المعتمد</th>
                        <th className="p-3">اسم الصنف المؤمن</th>
                        <th className="p-3">فترة الضمان</th>
                        <th className="p-3">صلاحية التغطية لغاية</th>
                        <th className="p-3 text-center">حالة الضمان</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-[11px]">
                      {warranties.map(w => (
                        <tr key={w.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50">
                          <td className="p-3 font-bold text-[#1e40af] dark:text-blue-400">{w.id}</td>
                          <td className="p-3 font-sans font-semibold">{w.client}</td>
                          <td className="p-3 font-sans">{w.item}</td>
                          <td className="p-3 text-center">{w.duration}</td>
                          <td className="p-3 text-slate-500">{w.expiryDate}</td>
                          <td className="p-3 text-center">
                            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100">
                              {lang === 'ar' ? 'مغطى وصالح' : 'In Warranty / Valid'}
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

        {/* SUBTAB 3: Installments, Commissions, and Insurance */}
        {activeSubTab === 'financials' && (
          <div className="space-y-6">
            
            {/* Installments book row */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                {lang === 'ar' ? 'سجل متابعة الأقساط وجدول السداد للعملاء' : 'Customer Installments Ledgers & payment Schedules'}
              </h3>

              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table className="w-full text-xs text-slate-700 dark:text-slate-300 text-right">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3">رقم الدفتر</th>
                      <th className="p-3">العميل المقسط</th>
                      <th className="p-3 text-left">مجموع مبلغ التقسيط</th>
                      <th className="p-3 text-left">المسدد دفترياً</th>
                      <th className="p-3 text-left">الرصيد المتبقي مستقبلاً</th>
                      <th className="p-3 text-left">قيمة القسط الشهري</th>
                      <th className="p-3">تاريخ الاستحقاق القادم</th>
                      <th className="p-3 text-center">إجراء السداد السريع</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {installments.map(inst => {
                      const completedRatio = Math.min(100, Math.floor((inst.paidAmount / inst.totalAmount) * 100));
                      return (
                        <tr key={inst.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50">
                          <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{inst.id}</td>
                          <td className="p-3 font-sans font-bold">{inst.client}</td>
                          <td className="p-3 text-left">{inst.totalAmount.toLocaleString()} EGP</td>
                          <td className="p-3 text-left text-emerald-600 font-bold">{inst.paidAmount.toLocaleString()} EGP ({completedRatio}%)</td>
                          <td className="p-3 text-left text-rose-500 font-bold">{inst.remainingAmount.toLocaleString()} EGP</td>
                          <td className="p-3 text-left font-black text-slate-850 dark:text-white">{inst.monthlyFee.toLocaleString()} EGP</td>
                          <td className="p-3 text-slate-500 font-bold">{inst.dueDate}</td>
                          <td className="p-2 text-center font-sans">
                            {inst.remainingAmount > 0 ? (
                              <button
                                onClick={() => handlePayInstallment(inst.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer"
                              >
                                {lang === 'ar' ? 'سداد قسط شهري' : 'Pay Month'}
                              </button>
                            ) : (
                              <span className="text-emerald-600 font-bold text-[10px]">✓ مسدد بالكامل</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Commissions & Insurance split grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              
              {/* Commissions reps targets */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  {lang === 'ar' ? 'عمولات ومستهدف مبيعات مناديب وموظفي الفروع' : 'Sales Representatives Quotas & Earned Commissions'}
                </h3>

                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-slate-700 dark:text-slate-300 text-right">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3">اسم المندوب المعتمد</th>
                        <th className="p-3 text-left">مبيعات الشهر الحالية</th>
                        <th className="p-3 text-left">المستهدف (Target)</th>
                        <th className="p-3 text-center">العمولة الكسبانة</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-[11px]">
                      {commissions.map(rep => {
                        const ratio = Math.min(100, Math.floor((rep.monthlySales / rep.target) * 100));
                        return (
                          <tr key={rep.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50">
                            <td className="p-3 font-sans font-bold">{rep.name}</td>
                            <td className="p-3 text-left font-black text-[#1e40af] dark:text-blue-400">{rep.monthlySales.toLocaleString()} EGP</td>
                            <td className="p-3 text-left text-slate-400">{rep.target.toLocaleString()} EGP ({ratio}%)</td>
                            <td className="p-3 text-center text-emerald-600 font-black">{rep.earned.toLocaleString()} EGP ({rep.rate}%)</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Corporate Insurance policies */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  {lang === 'ar' ? 'عقود التأمين الرأسمالي والتأمين الطبي للشركة' : 'Active Corporate Insurance Policies'}
                </h3>

                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-slate-700 dark:text-slate-300 text-right">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3">رقم البوليصة</th>
                        <th className="p-3">شركة التأمين</th>
                        <th className="p-3">بند التغطية التأمينية</th>
                        <th className="p-3 text-left">القسط السنوي</th>
                        <th className="p-3 text-left">سقف التعويض الكلي</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-[11px]">
                      {insurances.map(ins => (
                        <tr key={ins.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50">
                          <td className="p-3 text-[#1e40af] font-bold">{ins.policyNo}</td>
                          <td className="p-3 font-sans font-bold">{ins.company}</td>
                          <td className="p-3 font-sans text-slate-500">{ins.type}</td>
                          <td className="p-3 text-left font-bold text-rose-600">-{ins.premium.toLocaleString()} EGP</td>
                          <td className="p-3 text-left font-black text-emerald-600">{ins.coverage.toLocaleString()} EGP</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUBTAB 4: live Alerts Aggregator */}
        {activeSubTab === 'alerts' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              {lang === 'ar' ? 'غرفة المراقبة المركزية ورصد التنبيهات والأخطار التشغيلية' : 'Consolidated Smart System Alerts Room'}
            </h3>

            <div className="space-y-3.5">
              {alerts.map(a => (
                <div 
                  key={a.id} 
                  className={`p-4 rounded-xl border flex justify-between items-center gap-4 transition-all ${
                    a.status === 'critical' ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900' :
                    a.status === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900' :
                    'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-white dark:bg-slate-950/60 font-bold px-2 py-0.5 rounded border">
                      {a.type.toUpperCase()}
                    </span>
                    <div>
                      <p className="text-xs font-bold leading-relaxed">{a.text}</p>
                      <span className="text-[9px] text-slate-400 font-bold block mt-1">{lang === 'ar' ? `رصد في: ${a.date}` : `Captured: ${a.date}`}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleResolveAlert(a.id)}
                    className="p-1 hover:bg-slate-200/50 rounded-lg text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                    title={lang === 'ar' ? 'استبعاد وتأكيد المعالجة' : 'Acknowledge alert'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {alerts.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold">{lang === 'ar' ? 'المخازن والماليات آمنة ١٠٠٪! لا توجد إنذارات معلقة حالياً.' : 'Enterprise is running at 100% capacity. No notifications pending!'}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
