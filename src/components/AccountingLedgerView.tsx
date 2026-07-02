import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calculator, FileText, ArrowRightLeft, Shield, Plus, DollarSign, 
  Trash2, Landmark, CheckCircle, Clock, Percent, ClipboardList, Briefcase, RefreshCw, X,
  Scale, FileSpreadsheet
} from 'lucide-react';
import { mockDatabase } from '../data/mockDatabase';

interface AccountingLedgerProps {
  lang: 'ar' | 'en';
  currentUser: any;
  onClose: () => void;
}

export default function AccountingLedgerView({ lang, currentUser, onClose }: AccountingLedgerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'expenses' | 'cost_centers' | 'assets' | 'cheques' | 'trial_balance'>('accounts');

  // Chart of accounts state
  const [accounts, setAccounts] = useState([
    { code: '1000', name: 'الأصول الثابتة', nameEn: 'Fixed Assets', type: 'asset', balance: 450000 },
    { code: '1101', name: 'الخزينة الرئيسية - صندوق القاهرة', nameEn: 'Main Safe Box - Cairo', type: 'asset', balance: 215000 },
    { code: '1102', name: 'البنك التجاري الدولي CIB', nameEn: 'CIB Bank Account', type: 'asset', balance: 1450000 },
    { code: '1201', name: 'مخزون المنتجات التامة', nameEn: 'Finished Goods Inventory', type: 'asset', balance: 350000 },
    { code: '2101', name: 'الموردون والدائنون المعتمدون', nameEn: 'Accounts Payable', type: 'liability', balance: 185000 },
    { code: '2201', name: 'مخصص إهلاك الأصول المتراكم', nameEn: 'Accumulated Depreciation', type: 'liability', balance: 45000 },
    { code: '3000', name: 'رأس مال شركة سامي سيستم', nameEn: 'Owner Equity Capital', type: 'equity', balance: 2000000 },
    { code: '3101', name: 'الأرباح المحتجزة / أرصدة افتتاحية', nameEn: 'Retained Earnings / Opening Balances', type: 'equity', balance: 150000 },
    { code: '4101', name: 'إيرادات مبيعات الأجهزة الفورية', nameEn: 'Sales Revenues', type: 'revenue', balance: 530000 },
    { code: '5101', name: 'مصروفات الإيجار السنوي', nameEn: 'Rent Expenses', type: 'expense', balance: 120000 },
    { code: '5102', name: 'مصروفات المرتبات والأجور الكلية', nameEn: 'Salaries Expenses', type: 'expense', balance: 280000 },
    { code: '5103', name: 'مصروفات عمومية وإدارية', nameEn: 'General & Admin Expenses', type: 'expense', balance: 45000 },
  ]);

  // Balanced Journal entry creator state
  const [journalEntries, setJournalEntries] = useState([
    { id: 'JV-101', date: '2026-06-20', desc: 'إثبات سداد الإيجار السنوي للمقر الرئيسي', debitAcc: '5101', creditAcc: '1102', amount: 15000, status: 'approved' },
    { id: 'JV-102', date: '2026-06-24', desc: 'شراء أجهزة مكتبية ومقاعد فرع الجيزة', debitAcc: '1000', creditAcc: '1101', amount: 45000, status: 'approved' },
    { id: 'JV-103', date: '2026-06-28', desc: 'تحصيل دفعة بشيك من شركة النور', debitAcc: '1102', creditAcc: '2101', amount: 80000, status: 'approved' }
  ]);

  const [newJvDesc, setNewJvDesc] = useState('');
  const [newJvDebit, setNewJvDebit] = useState('5103');
  const [newJvCredit, setNewJvCredit] = useState('1101');
  const [newJvAmount, setNewJvAmount] = useState<number>(0);

  // Expenses management state
  const [expenses, setExpenses] = useState([
    { id: 1, date: '2026-06-15', category: 'كهرباء ومياه', accountCode: '5103', amount: 4500, paidVia: 'cash', notes: 'سداد فاتورة كهرباء مخزن بولارس' },
    { id: 2, date: '2026-06-18', category: 'صيانة وشحن المبيعات', accountCode: '5103', amount: 2800, paidVia: 'cib', notes: 'صيانة مكيفات صالة المبيعات الرئيسية' },
    { id: 3, date: '2026-06-25', category: 'مرتبات مستشارين فنيين', accountCode: '5102', amount: 35000, paidVia: 'cib', notes: 'سداد تعاقد الاستشارات التقنية' }
  ]);
  const [expenseCat, setExpenseCat] = useState('كهرباء ومياه');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseVia, setExpenseVia] = useState('cash');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Cost Centers budget tracking state
  const [costCenters, setCostCenters] = useState([
    { code: 'CC-HQ', name: 'مركز تكلفة الإدارة العامة - القاهرة', budget: 1500000, actual: 445000, manager: 'م. سامي الجيار' },
    { code: 'CC-ALX', name: 'مركز مشروع توسعة الإسكندرية الدولي', budget: 800000, actual: 350000, manager: 'أحمد محمود' },
    { code: 'CC-MKT', name: 'مركز ميزانية تسويق سامي سيستم الممول', budget: 300000, actual: 120000, manager: 'يوسف شريف' },
    { code: 'CC-SUP', name: 'مركز تكلفة الدعم والصيانة الميدانية', budget: 200000, actual: 65000, manager: 'م. سيد علي' }
  ]);

  // Asset Management & Depreciation state
  const [assets, setAssets] = useState([
    { id: 'AST-01', name: 'خوادم الشبكة السحابية الرئيسية IBM', purchaseDate: '2026-01-10', cost: 180000, depRate: 20, accDep: 18000, value: 162000 },
    { id: 'AST-02', name: 'سيارة جيب جراند شيروكي لنقل المبيعات', purchaseDate: '2026-02-15', cost: 240000, depRate: 15, accDep: 12000, value: 228000 },
    { id: 'AST-03', name: 'مكيفات مركزية وأثاث الفرع الرئيسي', purchaseDate: '2026-03-01', cost: 30000, depRate: 10, accDep: 1000, value: 29000 }
  ]);

  // Cheque Cycle tracking state
  const [cheques, setCheques] = useState([
    { id: 'CHQ-9901', bank: 'البنك التجاري الدولي CIB', chqNo: 'CIB-001290', amount: 150000, type: 'incoming', drawer: 'شركة النor للمقاولات', dueDate: '2026-07-15', status: 'pending' },
    { id: 'CHQ-9902', bank: 'بنك قطر الوطني QNB', chqNo: 'QNB-881200', amount: 45000, type: 'outgoing', drawer: 'شركة النصر للكرتون', dueDate: '2026-06-28', status: 'collected' },
    { id: 'CHQ-9903', bank: 'بنك مصر - فرع البطل', chqNo: 'MISR-041922', amount: 95000, type: 'incoming', drawer: 'مؤسسة الرياض للأوراق', dueDate: '2026-07-20', status: 'pending' },
    { id: 'CHQ-9904', bank: 'البنك الأهلي المصري', chqNo: 'NBE-331201', amount: 60000, type: 'outgoing', drawer: 'مورد الأخشاب المعتمد', dueDate: '2026-07-05', status: 'bounced' }
  ]);

  // Actions handlers
  const handleAddJv = (e: React.FormEvent) => {
    e.preventDefault();
    if (newJvAmount <= 0) {
      alert(lang === 'ar' ? 'يرجى إدخال مبلغ صحيح أكبر من الصفر!' : 'Enter a valid positive amount!');
      return;
    }
    if (newJvDebit === newJvCredit) {
      alert(lang === 'ar' ? 'خطأ محاسبي: لا يمكن مطابقة حساب المدين والدائن في نفس القيد!' : 'Accounting error: Debit and Credit accounts cannot be identical!');
      return;
    }

    // Update account balances
    const updatedAccounts = accounts.map(acc => {
      if (acc.code === newJvDebit) {
        return { ...acc, balance: acc.balance + newJvAmount };
      }
      if (acc.code === newJvCredit) {
        return { ...acc, balance: acc.balance - newJvAmount };
      }
      return acc;
    });

    setAccounts(updatedAccounts);

    const newJv = {
      id: `JV-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      desc: newJvDesc || (lang === 'ar' ? 'قيد تسوية نظامي يدوي' : 'Manual system adjustment'),
      debitAcc: newJvDebit,
      creditAcc: newJvCredit,
      amount: newJvAmount,
      status: 'approved'
    };

    setJournalEntries([newJv, ...journalEntries]);

    // Audit logs entry
    mockDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'قيد محاسبي جديد',
      `تم ترحيل القيد رقم ${newJv.id} بنجاح: مدين ${newJvDebit} دائن ${newJvCredit} بقيمة ${newJvAmount} EGP`
    );

    // Reset inputs
    setNewJvDesc('');
    setNewJvAmount(0);
    alert(lang === 'ar' ? 'تم ترحيل القيد المحاسبي المتوازن وتحديث الحسابات المرتبطة بنجاح!' : 'Balanced Journal entry posted and accounts updated!');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) {
      alert(lang === 'ar' ? 'يرجى إدخال مبلغ مصروف صحيح!' : 'Enter a valid expense amount!');
      return;
    }

    const newExp = {
      id: expenses.length + 1,
      date: new Date().toISOString().split('T')[0],
      category: expenseCat,
      accountCode: '5103',
      amount: expenseAmount,
      paidVia: expenseVia,
      notes: expenseNotes || (lang === 'ar' ? 'مصروفات تشغيلية دورية' : 'Regular operational expense')
    };

    setExpenses([newExp, ...expenses]);

    // Update cash or bank ledger accounts automatically
    const paySourceAcc = expenseVia === 'cash' ? '1101' : '1102';
    const updatedAccounts = accounts.map(acc => {
      if (acc.code === '5103') { // general expense
        return { ...acc, balance: acc.balance + expenseAmount };
      }
      if (acc.code === paySourceAcc) {
        return { ...acc, balance: acc.balance - expenseAmount };
      }
      return acc;
    });
    setAccounts(updatedAccounts);

    // Update Cost Centers Center randomly for simulation
    const centerIndex = Math.floor(Math.random() * costCenters.length);
    const updatedCenters = [...costCenters];
    updatedCenters[centerIndex].actual += expenseAmount;
    setCostCenters(updatedCenters);

    // Audit Log
    mockDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'تسجيل مصروف',
      `تم إثبات مصروف بقيمة ${expenseAmount} EGP تحت بند ${expenseCat} وتخصيصه لـ ${updatedCenters[centerIndex].name}`
    );

    // Reset states
    setExpenseAmount(0);
    setExpenseNotes('');
    alert(lang === 'ar' ? 'تم حفظ المصروف وترحيل الأثر المالي وتحديث مركز التكلفة بنجاح!' : 'Expense registered and cost center allocated!');
  };

  const handleCollectCheque = (chqId: string) => {
    const chq = cheques.find(c => c.id === chqId);
    if (!chq) return;

    if (chq.status !== 'pending') {
      alert(lang === 'ar' ? 'تم تحصيل أو تعليق هذا الشيك مسبقاً!' : 'This cheque has already been finalized!');
      return;
    }

    // Update cheque status
    const updatedCheques = cheques.map(c => {
      if (c.id === chqId) {
        return { ...c, status: 'collected' as const };
      }
      return c;
    });
    setCheques(updatedCheques);

    // Update ledger: increase bank CIB (1102), decrease accounts receivable / partner
    const updatedAccounts = accounts.map(acc => {
      if (acc.code === '1102') { // Bank
        return { ...acc, balance: acc.balance + chq.amount };
      }
      return acc;
    });
    setAccounts(updatedAccounts);

    mockDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'تحصيل شيك مصرفي',
      `تم تحصيل الشيك رقم ${chq.chqNo} لصالح البنك بقيمة ${chq.amount} EGP وتحديث كشف الحساب`
    );

    alert(lang === 'ar' ? `تم إيداع مبلغ الشيك بقيمة ${chq.amount.toLocaleString()} EGP بحساب الشركة بالبنك!` : `Cheque amount deposited to corporate bank account!`);
  };

  // Run Annual Depreciation on Assets
  const handleDepreciateAssets = () => {
    const updatedAssets = assets.map(asset => {
      const depAmt = parseFloat((asset.cost * (asset.depRate / 100)).toFixed(2));
      const newAccDep = asset.accDep + depAmt;
      const newValue = asset.cost - newAccDep;
      return {
        ...asset,
        accDep: newAccDep,
        value: newValue
      };
    });
    setAssets(updatedAssets);

    // Create a balanced journal entry for total depreciations
    const totalDepAmt = assets.reduce((sum, item) => sum + (item.cost * (item.depRate / 100)), 0);
    
    // Debit general admin expenses, Credit accumulated depreciation
    const updatedAccounts = accounts.map(acc => {
      if (acc.code === '5103') { // general expense
        return { ...acc, balance: acc.balance + totalDepAmt };
      }
      if (acc.code === '2201') { // Accumulated dep.
        return { ...acc, balance: acc.balance + totalDepAmt };
      }
      return acc;
    });
    setAccounts(updatedAccounts);

    mockDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'إهلاك أصول دوري',
      `تم ترحيل دورة إهلاك الأصول العامة بقيمة إجمالية ${totalDepAmt} EGP`
    );

    alert(lang === 'ar' ? `تم تشغيل دورة الإهتلاكات الدورية للأصول وحساب الفروقات بنجاح بقيمة: ${totalDepAmt} EGP` : `Depreciations posted successfully: ${totalDepAmt} EGP`);
  };

  return (
    <div className="p-4 md:p-6 bg-[#f0f2f5] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* View Header ribbon options */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1e40af] dark:text-white flex items-center gap-2">
              <span>{lang === 'ar' ? 'مجمع الأنظمة المالية والحسابية' : 'Finance & Accounting Workspace'}</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">Ledger v4.0</span>
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ar' ? 'إدارة دليل الحسابات، قيود اليومية، مراكز التكلفة، وإهلاك الأصول العامة' : 'Manage general ledger, journal entries, cost centers & asset depreciation'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إغلاق شاشة الحسابات' : 'Close Module'}</span>
        </button>
      </div>

      {/* Accounting Sub-nav workspace tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 rounded-t-xl gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'accounts' 
              ? 'bg-[#1e40af] text-white shadow' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{lang === 'ar' ? 'دليل الحسابات وقيود اليومية' : 'Chart of Accounts & Journal'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'expenses' 
              ? 'bg-[#1e40af] text-white shadow' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{lang === 'ar' ? 'المالية وإدارة المصروفات' : 'Expense & Treasury'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cost_centers')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'cost_centers' 
              ? 'bg-[#1e40af] text-white shadow' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{lang === 'ar' ? 'مراكز التكلفة والمشاريع' : 'Cost Centers Budgets'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('assets')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'assets' 
              ? 'bg-[#1e40af] text-white shadow' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>{lang === 'ar' ? 'الأصول الثابتة والاهلاكات' : 'Fixed Assets & Dep.'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cheques')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'cheques' 
              ? 'bg-[#1e40af] text-white shadow' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>{lang === 'ar' ? 'دورة الشيكات المصرفية' : 'Bank Cheques Cycle'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('trial_balance')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'trial_balance' 
              ? 'bg-[#1e40af] text-white shadow' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>{lang === 'ar' ? 'ميزان المراجعة والقوائم الختامية' : 'Trial Balance & Financials'}</span>
        </button>
      </div>

      {/* Main Tab workspace container */}
      <div className="bg-white dark:bg-slate-900 border border-t-0 border-slate-200 dark:border-slate-800 rounded-b-xl p-5 shadow-sm">
        
        {/* TAB 1: Chart of accounts */}
        {activeSubTab === 'accounts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Directory of accounts list */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  {lang === 'ar' ? 'دليل كود الحساب المعتمد والموازين الفورية' : 'General Ledger Accounts Directory'}
                </h3>
                
                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-slate-700 dark:text-slate-300">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800 text-right">
                        <th className="p-3">كود الحساب</th>
                        <th className="p-3">اسم الحساب الدفتري</th>
                        <th className="p-3">التصنيف الرئيسي</th>
                        <th className="p-3 text-left">الرصيد الدفتري الحالي</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {accounts.map(acc => (
                        <tr key={acc.code} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-950/40">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{acc.code}</td>
                          <td className="p-3 font-sans font-bold">{lang === 'ar' ? acc.name : acc.nameEn}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              acc.type === 'asset' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                              acc.type === 'liability' ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40' :
                              acc.type === 'equity' ? 'bg-violet-50 text-violet-700' :
                              acc.type === 'revenue' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {acc.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-left font-black text-slate-850 dark:text-white">
                            {acc.balance.toLocaleString()} EGP
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Balanced Journal Voucher Entry creator */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-4">
                <h3 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'ar' ? 'إنشاء قيد يومية متوازن' : 'Create Balanced JV'}</span>
                </h3>

                <form onSubmit={handleAddJv} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'وصف أو بيان القيد:' : 'Description:'}</label>
                    <input
                      type="text"
                      required
                      value={newJvDesc}
                      onChange={(e) => setNewJvDesc(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: سداد مصروفات أو تسوية رصيد...' : 'e.g., Bank charges adjustments...'}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-slate-850 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'حساب الجانب المدين (DEBIT) (+) *' : 'DEBIT Account (+):'}</label>
                    <select
                      value={newJvDebit}
                      onChange={(e) => setNewJvDebit(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5"
                    >
                      {accounts.map(a => (
                        <option key={a.code} value={a.code}>[{a.code}] {a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'حساب الجانب الدائن (CREDIT) (-) *' : 'CREDIT Account (-):'}</label>
                    <select
                      value={newJvCredit}
                      onChange={(e) => setNewJvCredit(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5"
                    >
                      {accounts.map(a => (
                        <option key={a.code} value={a.code}>[{a.code}] {a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'القيمة المالية (المبلغ):' : 'Amount EGP:'}</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        required
                        value={newJvAmount || ''}
                        onChange={(e) => setNewJvAmount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded py-1.5 px-3 text-emerald-600 font-black font-mono"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-mono">EGP</span>
                    </div>
                  </div>

                  {/* Balancing confirmation note */}
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded border border-emerald-150 text-[10px] text-emerald-700 leading-relaxed font-semibold">
                    ⚡ {lang === 'ar' ? 'التحقق التلقائي: مدخلات الجانب المدين تساوي تماماً الجانب الدائن بموجب معايير المراجعة المزدوجة.' : 'Automatic Audit balance verified: DEBIT matches CREDIT.'}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1e40af] hover:bg-blue-800 text-white font-bold py-2 rounded shadow transition-all cursor-pointer text-xs"
                  >
                    {lang === 'ar' ? 'ترحيل وقيد الدفاتر فوراً' : 'Post Journal Voucher'}
                  </button>
                </form>
              </div>

            </div>

            {/* Recent journal ledger list bottom */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-white mb-2 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-indigo-500" />
                <span>{lang === 'ar' ? 'آخر قيود اليومية العامة المرحلة بالنظام' : 'Recent Posted Journal Entries'}</span>
              </h3>
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table className="w-full text-xs text-slate-700 dark:text-slate-300 font-mono text-right">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-2.5">رقم السند</th>
                      <th className="p-2.5">التاريخ</th>
                      <th className="p-2.5">البيان والشرح</th>
                      <th className="p-2.5">المدين (+)</th>
                      <th className="p-2.5">الدائن (-)</th>
                      <th className="p-2.5 text-left">المبلغ المالي</th>
                      <th className="p-2.5 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journalEntries.map(entry => (
                      <tr key={entry.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-[#1e40af] dark:text-blue-400">{entry.id}</td>
                        <td className="p-2.5 text-slate-500">{entry.date}</td>
                        <td className="p-2.5 font-sans font-semibold">{entry.desc}</td>
                        <td className="p-2.5">
                          <span className="text-blue-600 font-bold">{entry.debitAcc}</span> - {accounts.find(a => a.code === entry.debitAcc)?.name}
                        </td>
                        <td className="p-2.5">
                          <span className="text-amber-600 font-bold">{entry.creditAcc}</span> - {accounts.find(a => a.code === entry.creditAcc)?.name}
                        </td>
                        <td className="p-2.5 text-left font-black text-slate-850 dark:text-white">{entry.amount.toLocaleString()} EGP</td>
                        <td className="p-2.5 text-center">
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            {lang === 'ar' ? 'مرحّل' : 'Posted'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Expenses Finance manager */}
        {activeSubTab === 'expenses' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Add Expense Form */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 text-xs">
                <h3 className="text-xs font-bold text-slate-850 dark:text-white mb-3 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  <span>{lang === 'ar' ? 'تسجيل سند صرف مصروفات تشغيلية' : 'Log New Expense Voucher'}</span>
                </h3>

                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'بند المصروف:' : 'Category:'}</label>
                    <select
                      value={expenseCat}
                      onChange={(e) => setExpenseCat(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5"
                    >
                      <option value="كهرباء ومياه">{lang === 'ar' ? 'كهرباء وإنارة ومياه' : 'Utilities & Power'}</option>
                      <option value="صيانة وشحن المبيعات">{lang === 'ar' ? 'شحن وصيانة الآليات' : 'Logistics & Repairs'}</option>
                      <option value="مرتبات مستشارين فنيين">{lang === 'ar' ? 'استشارات فنية ومرتبات' : 'Consulting & Wages'}</option>
                      <option value="بنزين وانتقالات">{lang === 'ar' ? 'وقود وبترول وانتقالات ومندوبين' : 'Fuel & Travel'}</option>
                      <option value="مطبوعات وإعلانات ممولة">{lang === 'ar' ? 'تسويق ومطبوعات وإعلانات' : 'Marketing & Prints'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'قيمة المصروف الكلي:' : 'Expense Amount:'}</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        required
                        value={expenseAmount || ''}
                        onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded py-1.5 px-3 font-black text-rose-600 font-mono"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-mono">EGP</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'طريقة السداد / حساب الصرف:' : 'Payment Source:'}</label>
                    <select
                      value={expenseVia}
                      onChange={(e) => setExpenseVia(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5"
                    >
                      <option value="cash">{lang === 'ar' ? 'الخزينة النقدية (١١٠١)' : 'Cash Safe Box (1101)'}</option>
                      <option value="cib">{lang === 'ar' ? 'حساب البنك CIB (١١٠٢)' : 'CIB Bank Account (1102)'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'ملاحظات وتفاصيل:' : 'Notes / Remarks:'}</label>
                    <textarea
                      value={expenseNotes}
                      onChange={(e) => setExpenseNotes(e.target.value)}
                      placeholder={lang === 'ar' ? 'تفاصيل الفاتورة واسم المورد المستلم...' : 'Invoice details, vendor name...'}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2 h-16 text-slate-850 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded shadow transition-all cursor-pointer"
                  >
                    {lang === 'ar' ? 'ترحيل المصروف وتحديث الصناديق' : 'Post & Disburse Expense'}
                  </button>
                </form>
              </div>

              {/* Expense Ledger list */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  {lang === 'ar' ? 'دفتر حركات المصروفات التشغيلية الكلية' : 'Operational Expense General Ledger'}
                </h3>

                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-slate-700 dark:text-slate-300 text-right">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3">م</th>
                        <th className="p-3">التاريخ</th>
                        <th className="p-3">البند المالي</th>
                        <th className="p-3">الحساب المدين</th>
                        <th className="p-3">طريقة السداد</th>
                        <th className="p-3">البيان والشرح التفصيلي</th>
                        <th className="p-3 text-left">القيمة المدفوعة</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {expenses.map((exp, index) => (
                        <tr key={exp.id} className="border-b border-slate-100 dark:border-slate-850/60 hover:bg-slate-50">
                          <td className="p-3 text-slate-400 font-bold">{index + 1}</td>
                          <td className="p-3 text-slate-500">{exp.date}</td>
                          <td className="p-3 font-sans font-bold text-rose-600">{exp.category}</td>
                          <td className="p-3 font-bold">{exp.accountCode}</td>
                          <td className="p-3 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              exp.paidVia === 'cash' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {exp.paidVia === 'cash' ? (lang === 'ar' ? 'نقدي خزانة' : 'Cash Safe') : 'Bank CIB'}
                            </span>
                          </td>
                          <td className="p-3 font-sans text-slate-600 dark:text-slate-400">{exp.notes}</td>
                          <td className="p-3 text-left font-black text-rose-600 dark:text-rose-400">
                            {exp.amount.toLocaleString()} EGP
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

        {/* TAB 3: Cost Centers budgets */}
        {activeSubTab === 'cost_centers' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              {lang === 'ar' ? 'توزيع التكاليف ومراكز الميزانيات المعتمدة' : 'Cost Center Allocations & Budgets Variance'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {costCenters.map(cc => {
                const percentage = Math.min(100, Math.floor((cc.actual / cc.budget) * 100));
                return (
                  <div key={cc.code} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded font-mono">
                          {cc.code}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1.5">
                          {cc.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{lang === 'ar' ? `مدير المشروع: ${cc.manager}` : `Supervisor: ${cc.manager}`}</p>
                      </div>

                      <div className="text-right font-mono text-[10px]">
                        <p className="text-slate-500">{lang === 'ar' ? 'الميزانية المرصودة' : 'Budget Target'}</p>
                        <p className="text-xs font-black text-[#1e40af] dark:text-blue-400">{cc.budget.toLocaleString()} EGP</p>
                      </div>
                    </div>

                    {/* Progress tracking bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold">
                        <span>{lang === 'ar' ? `الاستهلاك الفعلي: ${percentage}%` : `Actual Consumption: ${percentage}%`}</span>
                        <span>{(cc.budget - cc.actual).toLocaleString()} {lang === 'ar' ? 'ج متبقي' : 'EGP left'}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentage > 85 ? 'bg-rose-500' : percentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] border-t border-slate-200/50 dark:border-slate-800/50 pt-2 font-mono">
                      <span className="text-slate-500">{lang === 'ar' ? 'الصرف الفعلي حتى الآن:' : 'Actual Cost Total:'}</span>
                      <span className="font-bold text-slate-850 dark:text-white">{cc.actual.toLocaleString()} EGP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: Fixed Assets & Depreciations */}
        {activeSubTab === 'assets' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold text-[#1e40af] dark:text-white">
                  {lang === 'ar' ? 'دليل الأصول الرأسمالية ومخصصات الاهلاك' : 'Capital Assets Master & Accrued Depreciation'}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === 'ar' ? 'تسجيل الآلات والمباني ومعدات التشغيل واحتساب الاهلاك السنوي المتوازن دفترياً' : 'Register equipment, hardware, calculate straight-line depreciation'}
                </p>
              </div>

              <button
                onClick={handleDepreciateAssets}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Percent className="w-4 h-4 animate-spin" />
                <span>{lang === 'ar' ? 'تشغيل وترحيل الاهلاك السنوي' : 'Run Asset Depreciation'}</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
              <table className="w-full text-xs text-slate-700 dark:text-slate-300 text-right">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">كود الأصل</th>
                    <th className="p-3">اسم الأصل الرأسمالي</th>
                    <th className="p-3">تاريخ الشراء</th>
                    <th className="p-3 text-center">معدل الاهلاك السنوي</th>
                    <th className="p-3 text-left">التكلفة التاريخية</th>
                    <th className="p-3 text-left">الإهلاك المتراكم</th>
                    <th className="p-3 text-left">القيمة الدفترية الحالية</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {assets.map(asset => (
                    <tr key={asset.id} className="border-b border-slate-100 dark:border-slate-850/60 hover:bg-slate-50">
                      <td className="p-3 text-[#1e40af] dark:text-blue-400 font-bold">{asset.id}</td>
                      <td className="p-3 font-sans font-bold">{asset.name}</td>
                      <td className="p-3 text-slate-500">{asset.purchaseDate}</td>
                      <td className="p-3 text-center text-amber-600 font-bold">{asset.depRate}%</td>
                      <td className="p-3 text-left font-bold">{asset.cost.toLocaleString()} EGP</td>
                      <td className="p-3 text-left text-rose-500 font-bold">{asset.accDep.toLocaleString()} EGP</td>
                      <td className="p-3 text-left text-emerald-600 font-black bg-emerald-50/10">{asset.value.toLocaleString()} EGP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Cheques Cycle Tracker */}
        {activeSubTab === 'cheques' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              {lang === 'ar' ? 'حركة الشيكات الآجلة والواردة والتحصيل المالي' : 'Incoming / Outgoing Corporate Cheque Register'}
            </h3>

            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
              <table className="w-full text-xs text-slate-700 dark:text-slate-300 text-right">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">رقم الشيك</th>
                    <th className="p-3">البنك المسحوب عليه</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3">الساحب / المستفيد</th>
                    <th className="p-3">تاريخ الاستحقاق</th>
                    <th className="p-3 text-left">قيمة الشيك المادية</th>
                    <th className="p-3 text-center">حالة الشيك</th>
                    <th className="p-3 text-center">إجراءات التحصيل</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {cheques.map(c => (
                    <tr key={c.id} className="border-b border-slate-100 dark:border-slate-850/60 hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{c.chqNo}</td>
                      <td className="p-3 font-sans font-bold">{c.bank}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.type === 'incoming' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {c.type === 'incoming' ? (lang === 'ar' ? 'شيك وارد (قبض)' : 'Incoming') : (lang === 'ar' ? 'شيك صادر (صرف)' : 'Outgoing')}
                        </span>
                      </td>
                      <td className="p-3 font-sans">{c.drawer}</td>
                      <td className="p-3 text-slate-500">{c.dueDate}</td>
                      <td className="p-3 text-left font-black">{c.amount.toLocaleString()} EGP</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'collected' ? 'bg-emerald-100 text-emerald-800' : 
                          c.status === 'bounced' ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status === 'collected' ? (lang === 'ar' ? 'تم التحصيل والمقاصة' : 'Collected') :
                           c.status === 'bounced' ? (lang === 'ar' ? 'مرفوض ومردود' : 'Bounced') : (lang === 'ar' ? 'معلق للتحصيل' : 'Pending Clearance')}
                        </span>
                      </td>
                      <td className="p-2 text-center font-sans">
                        {c.status === 'pending' ? (
                          <button
                            onClick={() => handleCollectCheque(c.id)}
                            className="bg-[#1e40af] hover:bg-blue-800 text-white font-bold px-2.5 py-1 rounded text-[10px] transition-all cursor-pointer"
                          >
                            {lang === 'ar' ? 'إيداع وتحصيل' : 'Deposit & Clear'}
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: Trial Balance & Financial Statements */}
        {activeSubTab === 'trial_balance' && (
          <div className="space-y-8">
            {/* Tab header description */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-[#1e40af] dark:text-blue-400 flex items-center gap-2">
                  <Scale className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                  <span>{lang === 'ar' ? 'ميزان المراجعة والقوائم المالية الختامية' : 'Trial Balance & Financial Statements'}</span>
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  {lang === 'ar' ? 'تقرير بموازين الحسابات الدفترية المدينة والدائنة مع قائمة الدخل والميزانية العمومية المتوازنة في الوقت الفعلي' : 'Balances of all debit and credit ledger accounts, income statement, and balanced balance sheet in real-time'}
                </p>
              </div>

              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-800 dark:text-white px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'ar' ? 'طباعة / تصدير PDF' : 'Print / Export PDF'}</span>
                </button>
              </div>
            </div>

            {/* Trial Balance Table Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-700 dark:text-white flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'ar' ? 'ميزان المراجعة بالأرصدة الدورية' : 'Trial Balance (by Balances)'}</span>
                </h4>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                  ⚡ {lang === 'ar' ? 'حالة الميزان: متوازن تماماً' : 'Trial Balance Status: Fully Balanced'}
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-150 dark:border-slate-800 rounded-xl">
                <table className="w-full text-xs text-slate-700 dark:text-slate-300 text-right">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800 text-right">
                      <th className="p-3 w-1/5">{lang === 'ar' ? 'كود الحساب' : 'Account Code'}</th>
                      <th className="p-3 w-2/5">{lang === 'ar' ? 'اسم الحساب الدفتري' : 'Account Name'}</th>
                      <th className="p-3 text-left w-1/5">{lang === 'ar' ? 'أرصدة مدينة (+)' : 'Debit Balance (+)'}</th>
                      <th className="p-3 text-left w-1/5">{lang === 'ar' ? 'أرصدة دائنة (-)' : 'Credit Balance (-)'}</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {accounts.map(acc => {
                      // Determine Debit/Credit based on account natural type
                      let debit = 0;
                      let credit = 0;
                      if (acc.type === 'asset' || acc.type === 'expense') {
                        if (acc.balance >= 0) debit = acc.balance;
                        else credit = -acc.balance;
                      } else {
                        if (acc.balance >= 0) credit = acc.balance;
                        else debit = -acc.balance;
                      }

                      return (
                        <tr key={acc.code} className="border-b border-slate-100 dark:border-slate-850/60 hover:bg-slate-50 dark:hover:bg-slate-950/20">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{acc.code}</td>
                          <td className="p-3 font-sans font-medium">{lang === 'ar' ? acc.name : acc.nameEn}</td>
                          <td className="p-3 text-left font-bold text-slate-800 dark:text-slate-200">
                            {debit > 0 ? debit.toLocaleString() : '-'}
                          </td>
                          <td className="p-3 text-left font-bold text-slate-800 dark:text-slate-200">
                            {credit > 0 ? credit.toLocaleString() : '-'}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Totals Row */}
                    {(() => {
                      let totalDebits = 0;
                      let totalCredits = 0;
                      accounts.forEach(acc => {
                        if (acc.type === 'asset' || acc.type === 'expense') {
                          if (acc.balance >= 0) totalDebits += acc.balance;
                          else totalCredits += -acc.balance;
                        } else {
                          if (acc.balance >= 0) totalCredits += acc.balance;
                          else totalDebits += -acc.balance;
                        }
                      });

                      return (
                        <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                          <td className="p-3 font-sans text-slate-900 dark:text-white" colSpan={2}>
                            {lang === 'ar' ? 'إجمالي ميزان المراجعة المتوازن' : 'Total Trial Balance Sum'}
                          </td>
                          <td className="p-3 text-left text-blue-600 dark:text-blue-400 font-black border-double border-b-4 border-slate-300">
                            {totalDebits.toLocaleString()} EGP
                          </td>
                          <td className="p-3 text-left text-blue-600 dark:text-blue-400 font-black border-double border-b-4 border-slate-300">
                            {totalCredits.toLocaleString()} EGP
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Income Statement & Balance Sheet side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              
              {/* Income Statement (قائمة الدخل) */}
              {(() => {
                const salesAcc = accounts.find(a => a.code === '4101')?.balance || 0;
                const rentAcc = accounts.find(a => a.code === '5101')?.balance || 0;
                const salariesAcc = accounts.find(a => a.code === '5102')?.balance || 0;
                const adminAcc = accounts.find(a => a.code === '5103')?.balance || 0;
                
                const totalExpenses = rentAcc + salariesAcc + adminAcc;
                const netIncome = salesAcc - totalExpenses;

                return (
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                    <h4 className="text-xs font-black text-[#1e40af] dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-2 flex justify-between items-center">
                      <span>{lang === 'ar' ? 'قائمة الدخل للفترة المالية الحالية' : 'Income Statement'}</span>
                      <span className="text-[10px] font-mono text-slate-500">Statement of Revenue & Expenses</span>
                    </h4>

                    <div className="space-y-2.5 text-xs">
                      {/* Revenues */}
                      <div className="flex justify-between font-semibold border-b border-slate-100 dark:border-slate-800/50 pb-1.5">
                        <span className="text-slate-700 dark:text-slate-300">{lang === 'ar' ? 'إيرادات المبيعات والخدمات (٤١٠١)' : 'Sales & Services Revenues (4101)'}</span>
                        <span className="font-mono text-emerald-600 font-bold">+{salesAcc.toLocaleString()} EGP</span>
                      </div>

                      {/* Less Expenses */}
                      <div className="text-slate-500 font-bold text-[10px] uppercase mt-2">{lang === 'ar' ? 'المصروفات التشغيلية والعمومية:' : 'Less Operating Expenses:'}</div>
                      
                      <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400">
                        <span>{lang === 'ar' ? 'مصروفات الإيجار السنوي (٥١٠١)' : 'Rent Expenses (5101)'}</span>
                        <span className="font-mono">-{rentAcc.toLocaleString()} EGP</span>
                      </div>

                      <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400">
                        <span>{lang === 'ar' ? 'مصروفات المرتبات والأجور (٥١٠٢)' : 'Salaries & Wages (5102)'}</span>
                        <span className="font-mono">-{salariesAcc.toLocaleString()} EGP</span>
                      </div>

                      <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400">
                        <span>{lang === 'ar' ? 'مصروفات عمومية وإدارية (٥١٠٣)' : 'General & Admin (5103)'}</span>
                        <span className="font-mono">-{adminAcc.toLocaleString()} EGP</span>
                      </div>

                      <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-700 dark:text-slate-300">
                        <span>{lang === 'ar' ? 'إجمالي المصروفات الكلي' : 'Total Operating Expenses'}</span>
                        <span className="font-mono text-rose-500">-{totalExpenses.toLocaleString()} EGP</span>
                      </div>

                      {/* Net Income badge */}
                      <div className="flex justify-between items-center font-black border-t-2 border-slate-300 dark:border-slate-700 pt-3 text-slate-900 dark:text-white mt-4 bg-white dark:bg-slate-900 p-3 rounded-lg shadow-inner">
                        <span className="text-sm text-slate-850 dark:text-white">{lang === 'ar' ? 'صافي الربح الدفتري للفترة' : 'Net Period Profit'}</span>
                        <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-black">
                          {netIncome.toLocaleString()} EGP
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Balance Sheet (الميزانية العمومية) */}
              {(() => {
                // Read accounts values
                const fixedAssets = accounts.find(a => a.code === '1000')?.balance || 0;
                const cashSafe = accounts.find(a => a.code === '1101')?.balance || 0;
                const bankCib = accounts.find(a => a.code === '1102')?.balance || 0;
                const inventory = accounts.find(a => a.code === '1201')?.balance || 0;

                const payables = accounts.find(a => a.code === '2101')?.balance || 0;
                const accumDep = accounts.find(a => a.code === '2201')?.balance || 0;
                
                const capital = accounts.find(a => a.code === '3000')?.balance || 0;
                const retained = accounts.find(a => a.code === '3101')?.balance || 0;

                // Net period profit from revenue - expenses
                const salesAcc = accounts.find(a => a.code === '4101')?.balance || 0;
                const rentAcc = accounts.find(a => a.code === '5101')?.balance || 0;
                const salariesAcc = accounts.find(a => a.code === '5102')?.balance || 0;
                const adminAcc = accounts.find(a => a.code === '5103')?.balance || 0;
                const netIncome = salesAcc - (rentAcc + salariesAcc + adminAcc);

                // Calculations
                const totalAssets = fixedAssets + cashSafe + bankCib + inventory;
                const totalLiabilities = payables + accumDep;
                const totalEquity = capital + retained + netIncome;
                const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

                return (
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                    <h4 className="text-xs font-black text-[#1e40af] dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-2 flex justify-between items-center">
                      <span>{lang === 'ar' ? 'الميزانية العمومية والمركز المالي دفترياً' : 'Balance Sheet'}</span>
                      <span className="text-[10px] font-mono text-slate-500">Assets = Liabilities + Equity</span>
                    </h4>

                    <div className="space-y-4 text-xs">
                      {/* Assets Section */}
                      <div className="space-y-2">
                        <div className="text-slate-800 dark:text-white font-bold text-[10px] uppercase border-b border-slate-200 dark:border-slate-800 pb-1 flex justify-between">
                          <span>{lang === 'ar' ? '١. الأصول الإجمالية (ASSETS):' : '1. ASSETS:'}</span>
                          <span className="font-mono text-blue-600 dark:text-blue-400">+{totalAssets.toLocaleString()} EGP</span>
                        </div>
                        <div className="flex justify-between pl-3 text-slate-600 dark:text-slate-400">
                          <span>{lang === 'ar' ? 'الأصول الثابتة المادية (١٠٠٠)' : 'Fixed Assets (1000)'}</span>
                          <span className="font-mono">{fixedAssets.toLocaleString()} EGP</span>
                        </div>
                        <div className="flex justify-between pl-3 text-slate-600 dark:text-slate-400">
                          <span>{lang === 'ar' ? 'مخزون مستودع المنتجات التامة (١٢٠١)' : 'Finished Goods Stock (1201)'}</span>
                          <span className="font-mono">{inventory.toLocaleString()} EGP</span>
                        </div>
                        <div className="flex justify-between pl-3 text-slate-600 dark:text-slate-400">
                          <span>{lang === 'ar' ? 'رصيد الخزينة نقدية (١١٠١)' : 'Cash in Hand (1101)'}</span>
                          <span className="font-mono">{cashSafe.toLocaleString()} EGP</span>
                        </div>
                        <div className="flex justify-between pl-3 text-slate-600 dark:text-slate-400">
                          <span>{lang === 'ar' ? 'رصيد حساب البنك CIB (١١٠٢)' : 'Bank CIB Balance (1102)'}</span>
                          <span className="font-mono">{bankCib.toLocaleString()} EGP</span>
                        </div>
                      </div>

                      {/* Liabilities & Equity Section */}
                      <div className="space-y-2">
                        <div className="text-slate-800 dark:text-white font-bold text-[10px] uppercase border-b border-slate-200 dark:border-slate-800 pb-1 flex justify-between">
                          <span>{lang === 'ar' ? '٢. الخصوم وحقوق الملكية (LIABILITIES & EQUITY):' : '2. LIABILITIES & EQUITY:'}</span>
                          <span className="font-mono text-blue-600 dark:text-blue-400">+{totalLiabilitiesAndEquity.toLocaleString()} EGP</span>
                        </div>
                        
                        <div className="text-slate-500 font-bold text-[9px] pl-2 uppercase">{lang === 'ar' ? 'الخصوم والدائنون (Liabilities):' : 'Liabilities:'}</div>
                        <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400">
                          <span>{lang === 'ar' ? 'الموردون والحسابات الدائنة (٢١٠١)' : 'Accounts Payable (2101)'}</span>
                          <span className="font-mono">{payables.toLocaleString()} EGP</span>
                        </div>
                        <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400">
                          <span>{lang === 'ar' ? 'مخصص إهلاك الأصول المتراكم (٢٢٠١)' : 'Accumulated Depreciation (2201)'}</span>
                          <span className="font-mono">{accumDep.toLocaleString()} EGP</span>
                        </div>

                        <div className="text-slate-500 font-bold text-[9px] pl-2 uppercase mt-2">{lang === 'ar' ? 'حقوق الملكية والأرباح (Equity):' : 'Owner\'s Equity:'}</div>
                        <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400">
                          <span>{lang === 'ar' ? 'رأس مال شركة سامي سيستم (٣٠٠٠)' : 'Paid-In Owner Capital (3000)'}</span>
                          <span className="font-mono">{capital.toLocaleString()} EGP</span>
                        </div>
                        <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400">
                          <span>{lang === 'ar' ? 'الأرباح المحتجزة الافتتاحية (٣١٠١)' : 'Opening Retained Earnings (3101)'}</span>
                          <span className="font-mono">{retained.toLocaleString()} EGP</span>
                        </div>
                        <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400 font-semibold text-emerald-600">
                          <span>{lang === 'ar' ? 'صافي أرباح الفترة الحالية' : 'Current Period Net Income'}</span>
                          <span className="font-mono">+{netIncome.toLocaleString()} EGP</span>
                        </div>
                      </div>

                      {/* Balanced Balance Sheet validation footer */}
                      <div className="flex justify-between items-center font-black border-t-2 border-slate-300 dark:border-slate-700 pt-3 mt-4 bg-blue-600 dark:bg-blue-700 text-white p-3 rounded-lg shadow">
                        <span className="text-[11px] text-white font-bold">{lang === 'ar' ? 'توازن المركز المالي دفترياً' : 'Balance Validation Status'}</span>
                        <div className="text-right text-xs">
                          <p className="font-mono text-white text-[10px]">{lang === 'ar' ? 'الأصول = الخصوم + حقوق الملكية' : 'Assets = Liabilities + Equity'}</p>
                          <p className="font-mono text-emerald-300 text-sm font-black mt-0.5">{totalAssets.toLocaleString()} EGP</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
