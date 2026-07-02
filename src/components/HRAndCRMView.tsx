import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Users, Calendar, Award, Shield, Plus, DollarSign, Clock, 
  UserCheck, ClipboardList, Wallet, Sparkles, Check, X, CheckCircle, Flame
} from 'lucide-react';
import { mockDatabase } from '../data/mockDatabase';

interface HRAndCRMProps {
  lang: 'ar' | 'en';
  currentUser: any;
  onClose: () => void;
}

export default function HRAndCRMView({ lang, currentUser, onClose }: HRAndCRMProps) {
  const [activeTab, setActiveTab] = useState<'hr' | 'crm'>('hr');
  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'attendance' | 'payroll' | 'loyalty' | 'visits'>('employees');

  // Employee directory state
  const [employees, setEmployees] = useState([
    { id: 'EMP-01', name: 'أحمد محمود سليمان', nameEn: 'Ahmed Mahmoud', dept: 'المستودعات والجرد', job: 'أمين مخزن رئيسي', salary: 12000, contractEnd: '2027-12-31', status: 'active' },
    { id: 'EMP-02', name: 'يوسف شريف عبد الهادي', nameEn: 'Youssef Sherif', dept: 'المبيعات والـ POS', job: 'مشرف مبيعات خارجي', salary: 15000, contractEnd: '2026-12-31', status: 'active' },
    { id: 'EMP-03', name: 'كريم خالد الشرقاوي', nameEn: 'Karim Khaled', dept: 'التوريدات والمشتريات', job: 'منسق مشتريات خارجية', salary: 11000, contractEnd: '2028-06-30', status: 'active' },
    { id: 'EMP-04', name: 'منى جمال الشافعي', nameEn: 'Mona Gamal', dept: 'الإدارة والمالية', job: 'محاسبة تكاليف ومراجعة', salary: 16000, contractEnd: '2027-05-15', status: 'active' },
    { id: 'EMP-05', name: 'سيد علي البهنسي', nameEn: 'Sayed Ali', dept: 'الدعم الفني والصيانة', job: 'مهندس صيانة ميداني', salary: 13500, contractEnd: '2026-09-01', status: 'active' }
  ]);

  // Attendance Clock-in logs
  const [attendanceLogs, setAttendanceLogs] = useState([
    { id: 1, empId: 'EMP-01', name: 'أحمد محمود سليمان', date: '2026-07-01', clockIn: '08:02 AM', clockOut: '04:15 PM', status: 'on_time' },
    { id: 2, empId: 'EMP-02', name: 'يوسف شريف عبد الهادي', date: '2026-07-01', clockIn: '08:29 AM', clockOut: '04:30 PM', status: 'late' },
    { id: 3, empId: 'EMP-04', name: 'منى جمال الشافعي', date: '2026-07-01', clockIn: '07:55 AM', clockOut: '04:00 PM', status: 'on_time' }
  ]);

  // Employee Requests (vacation, loan, advance)
  const [requests, setRequests] = useState([
    { id: 'REQ-401', empId: 'EMP-01', name: 'أحمد محمود سليمان', type: 'إجازة اعتيادية', date: '2026-07-05', details: 'طلب إجازة زفاف عائلية لمدة 3 أيام', status: 'pending' },
    { id: 'REQ-402', empId: 'EMP-03', name: 'كريم خالد الشرقاوي', type: 'سلفة مالية', date: '2026-07-02', details: 'طلب سلفة نقدية طارئة بقيمة 3000 EGP', status: 'pending' },
    { id: 'REQ-403', empId: 'EMP-05', name: 'سيد علي البهنسي', type: 'عقد صيانة سيارة', date: '2026-06-25', details: 'تغطية مصاريف انتقال الصيانة الميدانية', status: 'approved' }
  ]);

  // Customer Loyalty accounts database
  const [customers, setCustomers] = useState([
    { id: 'C001', name: 'شركة النور للمقاولات', tier: 'Gold', points: 1450, wallet: 12500, membership: '2027-12-31', phone: '01012345678', status: 'active' },
    { id: 'C002', name: 'مؤسسة الرياض للأوراق والكرتون', tier: 'Gold', points: 980, wallet: 3400, membership: '2026-11-15', phone: '01234567890', status: 'active' },
    { id: 'C003', name: 'شركة المهندس للصناعات الغذائية', tier: 'Silver', points: 420, wallet: 0, membership: '2026-08-30', phone: '01198765432', status: 'active' },
    { id: 'C004', name: 'مصنع الأمل للبلاستيك والكرتون', tier: 'Bronze', points: 120, wallet: 1500, membership: '2026-07-01', phone: '01511223344', status: 'expired' },
    { id: 'C-CASH', name: 'الزبون التجاري العام', tier: 'Bronze', points: 15, wallet: 0, membership: 'مستمر', phone: 'بدون هاتف', status: 'active' }
  ]);

  // Customer entry/attendance checks
  const [clientVisits, setClientVisits] = useState([
    { id: 1, name: 'ممثلي شركة النور للمقاولات', time: '09:15 AM', type: 'استشارة فنية واعتماد عينات', status: 'authorized' },
    { id: 2, name: 'أحمد راشد (مؤسسة الرياض)', time: '11:00 AM', type: 'استلام بضاعة ومطابقة رصيد المخزن', status: 'authorized' },
    { id: 3, name: 'أصيل العتيبي (زيارة حرة)', time: '02:30 PM', type: 'مبيعات فورية بالمعرض', status: 'walk_in' }
  ]);

  // Biometric device simulator trigger
  const [selectedEmpClock, setSelectedEmpClock] = useState('EMP-01');

  const handleClockInSimulator = () => {
    const emp = employees.find(e => e.id === selectedEmpClock);
    if (!emp) return;

    // Check if already clocked in today
    const exists = attendanceLogs.find(log => log.empId === selectedEmpClock && log.date === '2026-07-01');
    if (exists) {
      // Clock out instead
      const updated = attendanceLogs.map(log => {
        if (log.empId === selectedEmpClock && log.date === '2026-07-01') {
          return { ...log, clockOut: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
        }
        return log;
      });
      setAttendanceLogs(updated);
      alert(lang === 'ar' ? `تم تسجيل بصمة انصراف الموظف: ${emp.name} بنجاح!` : `Biometric clock-out recorded for ${emp.nameEn}`);
      return;
    }

    // New Clock in
    const newLog = {
      id: attendanceLogs.length + 1,
      empId: emp.id,
      name: emp.name,
      date: '2026-07-01',
      clockIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      clockOut: '--:--',
      status: 'on_time'
    };
    setAttendanceLogs([newLog, ...attendanceLogs]);

    mockDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'بصمة حضور يومية',
      `بصمة بيومترية مسجلة للموظف: ${emp.name} في تمام الساعة ${newLog.clockIn}`
    );

    alert(lang === 'ar' ? `تم تسجيل بصمة حضور الموظف: ${emp.name} بنجاح بالسيستم!` : `Biometric clock-in recorded for ${emp.nameEn}`);
  };

  const handleApproveRequest = (reqId: string, action: 'approved' | 'rejected') => {
    const updated = requests.map(req => {
      if (req.id === reqId) {
        return { ...req, status: action };
      }
      return req;
    });
    setRequests(updated);

    const r = requests.find(item => item.id === reqId);
    if (r) {
      mockDatabase.addAuditLog(
        currentUser.id,
        currentUser.username,
        'إدارة الطلبات الموظفين',
        `تم ${action === 'approved' ? 'الموافقة على' : 'رفض'} طلب ${r.type} المقدم من الموظف: ${r.name}`
      );
    }
    alert(lang === 'ar' ? 'تم تحديث حالة طلب الموظف وتعميم الإجراء بالمسيرات الإدارية!' : 'Employee request state updated!');
  };

  const handleAwardPoints = (customerId: string, pts: number) => {
    const updated = customers.map(c => {
      if (c.id === customerId) {
        const newPts = c.points + pts;
        const newWallet = c.wallet + (pts * 5); // 5 EGP cashback per point for simulation
        return { ...c, points: newPts, wallet: newWallet };
      }
      return c;
    });
    setCustomers(updated);
    const clientName = customers.find(c => c.id === customerId)?.name || '';

    mockDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'تحديث كود ولاء عميل',
      `تم منح العميل ${clientName} نقاط ولاء إضافية +${pts} جراء حركات المشتريات`
    );

    alert(lang === 'ar' ? `تم منح العميل ${pts} نقطة بنجاح، رصيد المحفظة المسترد تضاعف دفترياً!` : `Awarded ${pts} points to customer successfully!`);
  };

  return (
    <div className="p-4 md:p-6 bg-[#f0f2f5] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Top action ribbon banner */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1e40af] dark:text-white flex items-center gap-2">
              <span>{lang === 'ar' ? 'الموارد البشرية والعلاقات والعملاء' : 'HR Portal & CRM Client Relations'}</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">HR-CRM Link v3.8</span>
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ar' ? 'بطاقة الموظف، البصمة الحيوية، مسيرات الرواتب والمستحقات، بالتوازي مع بطاقات ولاء العملاء والعضويات ومحافظ النقاط المعتمدة' : 'Employee rosters, payroll, biometrics simulation, combined with client tiers, loyalty point engines, and wallet balances'}
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

      {/* Dual Tab Switcher (HR System vs. CRM Customer Engine) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-200/60 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-300/40 mb-6">
        <button
          onClick={() => {
            setActiveTab('hr');
            setActiveSubTab('employees');
          }}
          className={`py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'hr'
              ? 'bg-[#1e40af] text-white shadow font-black'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white/40'
          }`}
        >
          <Briefcase className="w-4.5 h-4.5" />
          <span>{lang === 'ar' ? 'نظام الموارد البشرية والرواتب (HR System)' : 'Human Resources & Payroll'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('crm');
            setActiveSubTab('loyalty');
          }}
          className={`py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'crm'
              ? 'bg-[#1e40af] text-white shadow font-black'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white/40'
          }`}
        >
          <Award className="w-4.5 h-4.5" />
          <span>{lang === 'ar' ? 'نظام علاقات العملاء ونقاط الولاء (CRM & Loyalty)' : 'Client Relations & Wallets CRM'}</span>
        </button>
      </div>

      {/* Horizontal Sub tabs headers */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 rounded-t-xl gap-2 overflow-x-auto">
        {activeTab === 'hr' ? (
          <>
            <button
              onClick={() => setActiveSubTab('employees')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeSubTab === 'employees' ? 'bg-slate-100 dark:bg-slate-800 text-[#1e40af] dark:text-blue-400 font-black' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{lang === 'ar' ? 'سجل الموظفين والعقود' : 'Employees Directory'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('attendance')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeSubTab === 'attendance' ? 'bg-slate-100 dark:bg-slate-800 text-[#1e40af] dark:text-blue-400 font-black' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>{lang === 'ar' ? 'جهاز البصمة والحضور' : 'Attendance Clock-in Logs'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('payroll')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeSubTab === 'payroll' ? 'bg-slate-100 dark:bg-slate-800 text-[#1e40af] dark:text-blue-400 font-black' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <DollarSign className="w-4 h-4 text-amber-500" />
              <span>{lang === 'ar' ? 'مسيرات الرواتب وطلبات الإجازة' : 'Salary Slips & Leave requests'}</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveSubTab('loyalty')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeSubTab === 'loyalty' ? 'bg-slate-100 dark:bg-slate-800 text-[#1e40af] dark:text-blue-400 font-black' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Wallet className="w-4 h-4 text-amber-500" />
              <span>{lang === 'ar' ? 'العملاء ومحفظة النقاط والأرصدة' : 'Client Accounts, Loyalty points & Wallets'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('visits')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeSubTab === 'visits' ? 'bg-slate-100 dark:bg-slate-800 text-[#1e40af] dark:text-blue-400 font-black' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>{lang === 'ar' ? 'حضور العملاء وزيارات العضويات' : 'Membership entry & Visitorial logs'}</span>
            </button>
          </>
        )}
      </div>

      {/* Main tab content workspace */}
      <div className="bg-white dark:bg-slate-900 border border-t-0 border-slate-200 dark:border-slate-800 rounded-b-xl p-5 shadow-sm">
        
        {/* TAB HR 1: Employee cards */}
        {activeTab === 'hr' && activeSubTab === 'employees' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              {lang === 'ar' ? 'دليل كارت الموظف المعتمد بنظام المحاسبة والتشغيل' : 'Active Employee Cards Directory'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {employees.map(emp => (
                <div key={emp.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-3 shadow-sm hover:shadow relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                        {emp.name.split(' ')[0][0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">
                          {emp.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{emp.id}</p>
                      </div>
                    </div>

                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {lang === 'ar' ? 'على رأس العمل' : 'Active'}
                    </span>
                  </div>

                  <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-3 space-y-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>{lang === 'ar' ? 'القسم الوظيفي:' : 'Department:'}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{emp.dept}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{lang === 'ar' ? 'المسمى الوظيفي:' : 'Job Title:'}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{emp.job}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{lang === 'ar' ? 'المراتب الأساسي الشامل:' : 'Monthly Basic Salary:'}</span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{emp.salary.toLocaleString()} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{lang === 'ar' ? 'صلاحية عقد العمل لغاية:' : 'Contract Due Date:'}</span>
                      <span className="font-bold font-mono">{emp.contractEnd}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB HR 2: Biometric clock simulation */}
        {activeTab === 'hr' && activeSubTab === 'attendance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Biometric machine simulator */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-4">
                <div className="text-center">
                  <div className="inline-flex p-3 bg-blue-100 text-[#1e40af] rounded-full mb-2">
                    <Clock className="w-8 h-8 animate-pulse text-[#1e40af]" />
                  </div>
                  <h3 className="text-xs font-black text-slate-850 dark:text-white">
                    {lang === 'ar' ? 'محاكي جهاز البصمة البيومترية' : 'Biometric Device Simulator'}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    {lang === 'ar' ? 'بصمة سريعة لمحاكاة تسجيل الموظفين لمواعيد الحضور والانصراف بالفرع' : 'Instant biometric logger mapping actual Cairo office gateway entry'}
                  </p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'اختر بطاقة الموظف:' : 'Select Employee Card:'}</label>
                    <select
                      value={selectedEmpClock}
                      onChange={(e) => setSelectedEmpClock(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 font-bold"
                    >
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>[{e.id}] {e.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleClockInSimulator}
                    className="w-full bg-[#1e40af] hover:bg-blue-800 text-white font-bold py-2.5 rounded shadow cursor-pointer flex items-center justify-center gap-2 text-xs"
                  >
                    <Flame className="w-4.5 h-4.5 text-amber-400 animate-bounce" />
                    <span>{lang === 'ar' ? 'تمرير البصمة الحيوية الفورية' : 'Log Instant Biometric Fingerprint'}</span>
                  </button>
                </div>
              </div>

              {/* Attendance log sheet */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  {lang === 'ar' ? 'مسير رصد الحضور والغياب لليوم الحالي' : 'Biometric Attendance Logs - Today'}
                </h3>

                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-slate-700 dark:text-slate-300 text-right">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3">كود الموظف</th>
                        <th className="p-3">الاسم بالكامل</th>
                        <th className="p-3">التاريخ</th>
                        <th className="p-3 text-center">بصمة الحضور</th>
                        <th className="p-3 text-center">بصمة الانصراف</th>
                        <th className="p-3 text-center">الحالة الإدارية</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {attendanceLogs.map(log => (
                        <tr key={log.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50">
                          <td className="p-3 font-bold text-[#1e40af] dark:text-blue-400">{log.empId}</td>
                          <td className="p-3 font-sans font-bold">{log.name}</td>
                          <td className="p-3 text-slate-500">{log.date}</td>
                          <td className="p-3 text-center text-emerald-600 font-bold">{log.clockIn}</td>
                          <td className="p-3 text-center text-blue-600 font-bold">{log.clockOut}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'on_time' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                            }`}>
                              {log.status === 'on_time' ? (lang === 'ar' ? 'حاضر ملتزم' : 'On Time') : (lang === 'ar' ? 'متأخر صباحي' : 'Late')}
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

        {/* TAB HR 3: Payroll Salary processing & requests */}
        {activeTab === 'hr' && activeSubTab === 'payroll' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Requests lists workflow */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  {lang === 'ar' ? 'طلبات الموظفين والاعتمادات الإدارية المعلقة' : 'Pending Employee Demands & Approvals'}
                </h3>

                <div className="space-y-3">
                  {requests.map(req => (
                    <div key={req.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded font-mono">
                            {req.id}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {req.name}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-rose-600 mt-2">
                          {req.type}
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{req.details}</p>
                        <span className="text-[9px] text-slate-400 block mt-1">{req.date}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApproveRequest(req.id, 'approved')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{lang === 'ar' ? 'موافقة وتعميم' : 'Approve'}</span>
                            </button>
                            
                            <button
                              onClick={() => handleApproveRequest(req.id, 'rejected')}
                              className="bg-rose-50 text-rose-600 font-bold px-3 py-1.5 rounded text-xs hover:bg-rose-100 cursor-pointer transition-all border border-rose-150"
                            >
                              <span>{lang === 'ar' ? 'رفض' : 'Reject'}</span>
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded text-xs font-bold ${
                            req.status === 'approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {req.status === 'approved' ? (lang === 'ar' ? 'تمت الموافقة والمحاسبة' : 'Approved') : (lang === 'ar' ? 'تم الرفض والأرشفة' : 'Rejected')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salaries process summary box */}
              <div className="bg-[#1e40af]/5 border border-[#1e40af]/20 p-5 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xs font-black text-[#1e40af] dark:text-white">
                    {lang === 'ar' ? 'مسير ميزانية الأجور الكلي - يوليو ٢٠٢٦' : 'Consolidated Payroll - July 2026'}
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                  <div className="flex justify-between">
                    <span>{lang === 'ar' ? 'عدد الموظفين المقيدين:' : 'Enrolled Employees:'}</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{employees.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'ar' ? 'الرواتب الأساسية الإجمالية:' : 'Basic Wages Total:'}</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">67,500 EGP</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>{lang === 'ar' ? 'الاستقطاعات والتأمين الطبي:' : 'Deductions & Insurances:'}</span>
                    <span className="font-bold font-mono">-4,200 EGP</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 border-t border-dashed border-slate-200 dark:border-slate-800 pt-3 text-sm font-black">
                    <span>{lang === 'ar' ? 'صافي مسير المرتبات المستحق:' : 'Net Payroll Outlay:'}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">63,300 EGP</span>
                  </div>
                </div>

                <button
                  onClick={() => alert(lang === 'ar' ? 'تم استخراج وتعميم مسيرات رواتب يوليو واعتماد تحويلات البنك آلياً بنجاح!' : 'Payroll slips generated and bank transfers submitted!')}
                  className="w-full bg-[#1e40af] hover:bg-blue-800 text-white font-bold py-2 rounded text-xs cursor-pointer shadow-sm mt-3"
                >
                  {lang === 'ar' ? 'ترحيل واعتماد تحويلات البنوك' : 'Commit & Disburse Salaries'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB CRM 1: Loyalty programs points and wallets */}
        {activeTab === 'crm' && activeSubTab === 'loyalty' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              {lang === 'ar' ? 'دليل بطاقات ولاء العملاء وحجم المحفظة الفورية والزيارات' : 'CRM Customer Loyalty Cards & Account Wallets'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.map(c => (
                <div key={c.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-3 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        c.tier === 'Gold' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        c.tier === 'Silver' ? 'bg-slate-200 text-slate-800 border' : 'bg-orange-50 text-orange-700'
                      }`}>
                        {c.tier.toUpperCase()} MEMBER
                      </span>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white mt-2">
                        {c.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{c.phone}</p>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono font-bold">{c.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                    <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-150 text-center font-mono">
                      <p className="text-[9px] text-slate-500 font-bold">{lang === 'ar' ? 'النقاط المتراكمة' : 'Loyalty Points'}</p>
                      <p className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1">{c.points} pts</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-150 text-center font-mono">
                      <p className="text-[9px] text-slate-500 font-bold">{lang === 'ar' ? 'محفظة الأرصدة المستردة' : 'Wallet EGP Balance'}</p>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">{c.wallet.toLocaleString()} EGP</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] pt-1 text-slate-500 font-semibold">
                    <span>{lang === 'ar' ? 'صلاحية العضوية لغاية:' : 'Expiry Date:'}</span>
                    <span className={`font-mono font-bold ${c.status === 'expired' ? 'text-rose-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
                      {c.membership} ({c.status === 'expired' ? (lang === 'ar' ? 'منتهية' : 'Expired') : (lang === 'ar' ? 'سارية' : 'Valid')})
                    </span>
                  </div>

                  {/* Manual point increment button */}
                  {c.id !== 'C-CASH' && (
                    <button
                      onClick={() => handleAwardPoints(c.id, 50)}
                      className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold py-1.5 rounded text-[10px] transition-all cursor-pointer border border-slate-200 dark:border-slate-700 mt-2"
                    >
                      {lang === 'ar' ? 'محاكاة شراء: منح +50 نقطة ولاء' : 'Simulate Purchase: Award +50 Pts'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CRM 2: Client visits attendance */}
        {activeTab === 'crm' && activeSubTab === 'visits' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form to log client entry visit */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-4">
                <h3 className="text-xs font-bold text-slate-850 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  <span>{lang === 'ar' ? 'رصد دخول زيارة عميل' : 'Log Customer Visit'}</span>
                </h3>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  alert(lang === 'ar' ? 'تم تسجيل حضور العميل بالبوابة وتأكيد عضوية الدخول الفورية بنجاح!' : 'Customer event entry logged!');
                }} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'العميل الزائر:' : 'Select Customer:'}</label>
                    <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5">
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">{lang === 'ar' ? 'غرض أو موضوع الزيارة:' : 'Purpose of Visit:'}</label>
                    <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5">
                      <option value="1">{lang === 'ar' ? 'استلام شحنة بضائع جردية' : 'Receive Goods Inbound'}</option>
                      <option value="2">{lang === 'ar' ? 'مطابقة ومصالحة كشف حساب مالي' : 'Account balance reconciliation'}</option>
                      <option value="3">{lang === 'ar' ? 'استشارة وصيانة ما بعد البيع' : 'Warranties & Technical maintenance'}</option>
                      <option value="4">{lang === 'ar' ? 'شراء فورية من المعرض الرئيسي' : 'Direct catalog purchase'}</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1e40af] hover:bg-blue-800 text-white font-bold py-2 rounded text-xs cursor-pointer shadow-sm"
                  >
                    {lang === 'ar' ? 'رصد وتأكيد بوابة الدخول' : 'Confirm Entry'}
                  </button>
                </form>
              </div>

              {/* Attendance visits list sheets */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-[#1e40af] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>{lang === 'ar' ? 'سجل حضور ومطابقة عضويات العملاء لليوم' : 'Today\'s Customer entry & Membership validity'}</span>
                </h3>

                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-slate-700 dark:text-slate-300 text-right">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3">م</th>
                        <th className="p-3">العميل والزائر الكريم</th>
                        <th className="p-3">وقت الدخول</th>
                        <th className="p-3">موضوع الزيارة</th>
                        <th className="p-3 text-center">حالة العضوية والتأمين بالبوابة</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {clientVisits.map((visit, index) => (
                        <tr key={visit.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50">
                          <td className="p-3 text-slate-400 font-bold">{index + 1}</td>
                          <td className="p-3 font-sans font-bold">{visit.name}</td>
                          <td className="p-3 text-[#1e40af] font-bold">{visit.time}</td>
                          <td className="p-3 font-sans">{visit.type}</td>
                          <td className="p-3 text-center font-sans">
                            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100">
                              {lang === 'ar' ? 'مأذون ومصرح بالدخول' : 'Access Granted / Valid'}
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
