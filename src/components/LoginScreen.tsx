import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, Lock, User as UserIcon, Clock, Calendar, Scale, Globe, Monitor, 
  Database, Plus, Key, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Building
} from 'lucide-react';
import { mockDatabase, defaultPermissions } from '../data/mockDatabase';
import { User as UserType } from '../types';
import { motion } from 'motion/react';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
}

export default function LoginScreen({ onLoginSuccess, lang, setLang }: LoginScreenProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(true);
  const [error, setError] = useState('');
  
  // Date and Time State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Database Creation Modal State
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbCompanyName, setDbCompanyName] = useState('');
  const [dbBranchName, setDbBranchName] = useState('');
  const [dbFiscalYear, setDbFiscalYear] = useState('2026');
  const [dbAdminUser, setDbAdminUser] = useState('');
  const [dbAdminPass, setDbAdminPass] = useState('');
  const [dbIncludeSeed, setDbIncludeSeed] = useState(true);
  const [dbSuccessMsg, setDbSuccessMsg] = useState('');
  const [dbErrorMsg, setDbErrorMsg] = useState('');

  useEffect(() => {
    mockDatabase.init();
    const loadedUsers = mockDatabase.getUsers();
    setUsers(loadedUsers);

    // If there is an active user or default, let's select the first active user automatically
    if (loadedUsers.length > 0) {
      const firstActive = loadedUsers.find(u => u.status === 'active') || loadedUsers[0];
      handleSelectUser(firstActive);
    }

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
    setUsername(user.username);
    
    // Check if there is a saved password for this user
    const savedPass = localStorage.getItem(`remembered_pass_${user.username.toLowerCase()}`);
    if (savedPass) {
      setPassword(savedPass);
      setRememberPassword(true);
    } else {
      setPassword('');
      setRememberPassword(false);
    }
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError(
        lang === 'ar'
          ? 'يرجى اختيار حساب مستخدم وإدخال كلمة المرور!'
          : 'Please select a user account and enter password!'
      );
      return;
    }

    const currentUsers = mockDatabase.getUsers();
    const foundUser = currentUsers.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      setError(
        lang === 'ar' 
          ? 'كلمة المرور غير صحيحة للحساب المحدد!' 
          : 'Incorrect password for the selected account!'
      );
      return;
    }

    if (foundUser.status === 'suspended') {
      setError(
        lang === 'ar' 
          ? 'عذرًا، هذا الحساب موقوف حاليًا. يرجى مراجعة المدير.' 
          : 'Sorry, this account is currently suspended. Please contact admin.'
      );
      return;
    }

    // Save or delete password based on rememberPassword choice
    if (rememberPassword) {
      localStorage.setItem(`remembered_pass_${username.toLowerCase()}`, password);
    } else {
      localStorage.removeItem(`remembered_pass_${username.toLowerCase()}`);
    }

    // Update last login details
    const updatedUsers = currentUsers.map(u => {
      if (u.id === foundUser.id) {
        return {
          ...u,
          lastLogin: new Date().toISOString(),
          deviceInfo: `Chrome (Al-Meezan Secure Portal) - ${navigator.platform}`
        };
      }
      return u;
    });
    mockDatabase.saveUsers(updatedUsers);

    // Write into Audit Log
    mockDatabase.addAuditLog(
      foundUser.id,
      foundUser.username,
      'تسجيل دخول',
      `تسجيل دخول ناجح للمستخدم: ${foundUser.fullName} (${foundUser.jobTitle})`
    );

    onLoginSuccess(foundUser);
  };

  // Formatted date and time
  const formatTime = () => {
    return currentTime.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCreateDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    setDbErrorMsg('');
    setDbSuccessMsg('');

    if (!dbCompanyName.trim() || !dbAdminUser.trim() || !dbAdminPass.trim()) {
      setDbErrorMsg(lang === 'ar' ? 'يرجى ملء كافة الحقول الإجبارية!' : 'Please fill all required fields!');
      return;
    }

    try {
      // Clear current system cache & store values
      localStorage.clear();

      // Create admin user object
      const adminId = 'USER-ADMIN';
      const customAdmin: UserType = {
        id: adminId,
        username: dbAdminUser.trim().toLowerCase(),
        fullName: lang === 'ar' ? 'المدير العام (المالك)' : 'General Manager (Owner)',
        password: dbAdminPass,
        jobTitle: lang === 'ar' ? 'مدير عام النظام' : 'System Owner',
        department: lang === 'ar' ? 'الإدارة العليا' : 'Executive Management',
        branch: dbBranchName.trim() || (lang === 'ar' ? 'الفرع الرئيسي' : 'Main Branch'),
        email: `${dbAdminUser.trim().toLowerCase()}@system.com`,
        phone: '01234567890',
        status: 'active',
        lastLogin: new Date().toISOString(),
        deviceInfo: 'Initialized Database Engine',
        permissions: defaultPermissions(true)
      };

      // Set users
      localStorage.setItem('sami_users', JSON.stringify([customAdmin]));
      
      // Setup company metadata
      localStorage.setItem('sami_active_company', dbCompanyName.trim());
      localStorage.setItem('sami_active_branch', dbBranchName.trim() || (lang === 'ar' ? 'الفرع الرئيسي' : 'Main Branch'));
      localStorage.setItem('sami_active_year', `${lang === 'ar' ? 'السنة المالية' : 'Fiscal Year'} ${dbFiscalYear.trim() || '2026'}`);

      if (dbIncludeSeed) {
        // Seed default system data
        const initialWarehouses = [
          { id: 'WH-01', code: 'WH001', name: lang === 'ar' ? 'مخزن المنتج التام' : 'Finished Goods Warehouse', nameEn: 'Finished Goods Warehouse', location: dbBranchName.trim() || 'القاهرة', manager: customAdmin.fullName },
          { id: 'WH-02', code: 'WH002', name: lang === 'ar' ? 'مستودع المبيعات السريع' : 'Retail Sales Depot', nameEn: 'Retail Sales Depot', location: 'المعرض التجاري', manager: customAdmin.fullName }
        ];
        const initialProducts = [
          { id: 'P001', code: 'PROD-101', name: 'شاشة سامسونج LED 32', nameEn: 'Samsung LED Monitor 32"', barcode: '8806090123456', unit: 'عدد', category: 'إلكترونيات', price: 6500, cost: 5200, stock: 50, minLimit: 10, reorderLimit: 15 },
          { id: 'P002', code: 'PROD-102', name: 'كابل HDMI فائق السرعة 3م', nameEn: 'Ultra HDMI Cable 3m', barcode: '6901234567890', unit: 'حبة', category: 'إكسسوارات', price: 250, cost: 120, stock: 200, minLimit: 20, reorderLimit: 30 }
        ];
        const initialPartners = [
          { id: 'C001', type: 'client', name: lang === 'ar' ? 'مجموعة شركات النور المحدودة' : 'El-Noor Group Co.', phone: '01011112222', email: 'info@elnoor.com', address: 'Cairo', balance: 0 },
          { id: 'V001', type: 'vendor', name: lang === 'ar' ? 'المجموعة الهندسية للاستيراد' : 'Engineering Import Group', phone: '0223456789', email: 'import@eng.com', address: 'Giza', balance: 0 }
        ];

        localStorage.setItem('sami_warehouses', JSON.stringify(initialWarehouses));
        localStorage.setItem('sami_products', JSON.stringify(initialProducts));
        localStorage.setItem('sami_partners', JSON.stringify(initialPartners));
        localStorage.setItem('sami_invoices', JSON.stringify([]));
      } else {
        localStorage.setItem('sami_warehouses', JSON.stringify([
          { id: 'WH-01', code: 'WH001', name: lang === 'ar' ? 'مستودع السلع الافتراضي' : 'Default Warehouse', nameEn: 'Default Warehouse', location: dbBranchName.trim() || 'القاهرة', manager: customAdmin.fullName }
        ]));
        localStorage.setItem('sami_products', JSON.stringify([]));
        localStorage.setItem('sami_partners', JSON.stringify([]));
        localStorage.setItem('sami_invoices', JSON.stringify([]));
      }

      // Initial audit logs
      const auditLogs = [
        {
          id: 'LOG-INIT',
          userId: adminId,
          username: customAdmin.username,
          action: 'تهيئة وتوليد قاعدة بيانات',
          details: lang === 'ar' 
            ? `تم بنجاح توليد هيكل قاعدة البيانات الجديدة لمنشأة [${dbCompanyName.trim()}] وتعيين حساب الأدمن.`
            : `Successfully configured database schemas for company: [${dbCompanyName.trim()}].`,
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          device: 'Al-Meezan Core Database DB-Engine'
        }
      ];
      localStorage.setItem('sami_audit_logs', JSON.stringify(auditLogs));

      setDbSuccessMsg(lang === 'ar' ? 'تم إنشاء قاعدة البيانات بنجاح! جاري التحديث...' : 'Database generated successfully! Refreshing...');

      // Reload fresh users list
      setTimeout(() => {
        const freshUsers = mockDatabase.getUsers();
        setUsers(freshUsers);
        if (freshUsers.length > 0) {
          handleSelectUser(freshUsers[0]);
        }
        setIsDbModalOpen(false);
        setDbCompanyName('');
        setDbBranchName('');
        setDbAdminUser('');
        setDbAdminPass('');
      }, 1500);

    } catch (err: any) {
      setDbErrorMsg(lang === 'ar' ? 'فشلت عملية التهيئة: ' + err.message : 'Database generation failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col justify-between p-4 md:p-8 font-sans relative overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Premium background decorative blur */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#b89047]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Bar */}
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 border-b border-[#b89047]/20 pb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-black border-2 border-[#b89047] rounded-xl flex items-center justify-center shadow-lg text-[#b89047] shadow-amber-500/10">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wide flex items-center gap-2">
              <span>{lang === 'ar' ? 'برنامج الميزان دوت نت' : 'Al-Meezan .Net'}</span>
              <span className="text-[10px] font-black bg-[#b89047]/20 text-[#b89047] border border-[#b89047]/40 px-2 py-0.5 rounded-lg">ERP</span>
            </h1>
            <p className="text-xs text-slate-400 font-bold">
              {lang === 'ar' ? 'النظام المتكامل لإدارة المحاسبة والمستودعات والرقابة' : 'Unified ERP system for advanced double-entry ledger & warehousing'}
            </p>
          </div>
        </div>

        {/* Calendar and Time widgets */}
        <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-2 bg-slate-900 border border-[#b89047]/20 px-3 py-1.5 rounded-xl shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold">{formatDate()}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-[#b89047]/20 px-3 py-1.5 rounded-xl text-amber-400 font-black shadow-sm">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{formatTime()}</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-[#b89047] font-black shadow-sm">
            v3.5.0
          </div>
        </div>
      </div>

      {/* Main Form Split Container */}
      <div className="w-full max-w-4xl mx-auto my-auto py-8 z-10">
        <div className="bg-slate-900 rounded-2xl border-2 border-[#b89047] shadow-2xl relative overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">
          
          {/* Top Absolute Options */}
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 text-xs text-[#b89047] hover:text-white bg-black border border-[#b89047]/30 hover:border-[#b89047] px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>
          </div>

          {/* Left Column: Users Selector Grid (5 cols out of 12) */}
          <div className="md:col-span-5 bg-slate-950 p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#b89047]/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-amber-400 animate-bounce" />
                <h3 className="text-xs font-black text-[#b89047] tracking-wider uppercase">
                  {lang === 'ar' ? 'اختر حساب المستخدم للوصول السريع' : 'SELECT REGISTERED ACCOUNT'}
                </h3>
              </div>
              
              <p className="text-[11px] text-slate-400 mb-6 leading-relaxed">
                {lang === 'ar' 
                  ? 'اضغط على بطاقة أي موظف مسجل بالنظام لإدخال كلمة المرور مباشرة والبدء.' 
                  : 'Click on any registered user card below to safely input their password and log in.'}
              </p>

              {/* Dynamic list of active users */}
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {users.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  const initials = u.fullName.split(' ').slice(0, 2).map(n => n[0]).join('');

                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected 
                          ? 'bg-[#b89047]/10 border-[#b89047] shadow-md shadow-amber-500/5' 
                          : 'bg-black/40 border-slate-800 hover:border-[#b89047]/45 hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg font-black flex items-center justify-center text-xs transition-colors ${
                          isSelected ? 'bg-[#b89047] text-black' : 'bg-slate-800 text-slate-300 group-hover:bg-[#b89047]/20 group-hover:text-[#b89047]'
                        }`}>
                          {initials || 'U'}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white group-hover:text-[#b89047] transition-colors">{u.fullName}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded border border-slate-700">
                          {u.jobTitle}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {users.length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-6">
                    {lang === 'ar' ? 'لا يوجد مستخدمون بقاعدة البيانات.' : 'No users found in database.'}
                  </p>
                )}
              </div>
            </div>

            {/* Create Database Trigger Widget */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="bg-black/50 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black text-white">{lang === 'ar' ? 'محرك تهيئة قواعد البيانات' : 'DB Bootstrapper Engine'}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {lang === 'ar'
                    ? 'هل ترغب بتوليد قاعدة بيانات جديدة تماماً لشركة أخرى باسم مستخدم مخصص وتطهير الكاش؟'
                    : 'Configure a brand-new multi-tenant or fresh independent local warehouse database.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsDbModalOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 bg-[#b89047] hover:bg-amber-400 text-black font-black text-[11px] py-2 rounded-lg cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'إنشاء قاعدة بيانات مستقلة 🗄️' : 'Create Custom Database 🗄️'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Active Password Form (7 cols out of 12) */}
          <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Header Title inside card */}
              <div className="mb-6 text-center md:text-right mt-10 md:mt-4">
                <h2 className="text-xl font-black text-[#b89047] flex items-center gap-2 justify-center md:justify-start">
                  <Key className="w-5 h-5 text-[#b89047]" />
                  <span>{lang === 'ar' ? 'بوابة التحقق والولوج الآمن' : 'Credential Secure Validation'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {lang === 'ar' 
                    ? 'أدخل كلمة مرور الحساب المحدد للتشفير والمصادقة' 
                    : 'Enter verification password for the selected ERP account.'}
                </p>
              </div>

              {error && (
                <div className="bg-rose-950/40 border border-rose-500/50 text-rose-300 p-3 rounded-xl text-xs mb-5 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Username read-only feedback */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 tracking-wider mb-1.5">
                    {lang === 'ar' ? 'المستخدم النشط المختار *' : 'ACTIVE SELECTED USER *'}
                  </label>
                  <div className="relative flex items-center bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl">
                    <UserIcon className="w-4 h-4 text-[#b89047] mr-1.5 ml-1.5" />
                    <span className="text-xs font-black text-white font-mono">
                      {selectedUser ? `${selectedUser.fullName} (@${selectedUser.username})` : (lang === 'ar' ? 'يرجى تحديد حساب مستخدم من اليسار' : 'Select user on left')}
                    </span>
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 tracking-wider mb-1.5">
                    {lang === 'ar' ? 'أدخل كلمة المرور الفورية *' : 'ENTER VERIFICATION PASSWORD *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4 text-[#b89047]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pr-10 pl-10 text-sm text-white focus:outline-none focus:border-[#b89047] transition-all font-mono"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Password option */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-[#b89047] select-none">
                    <input
                      type="checkbox"
                      checked={rememberPassword}
                      onChange={(e) => setRememberPassword(e.target.checked)}
                      className="rounded bg-black border-slate-800 text-[#b89047] focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold">{lang === 'ar' ? 'حفظ كلمة السر وتذكرني بالجهاز' : 'Remember my password'}</span>
                  </label>
                </div>

                {/* Login submission button */}
                <button
                  type="submit"
                  className="w-full bg-[#b89047] hover:bg-amber-400 text-black font-black py-3 rounded-xl text-xs shadow-lg active:scale-[0.98] transition-all cursor-pointer mt-6 flex justify-center items-center gap-2"
                >
                  <Scale className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'الولوج الآمن والمصادقة المشفرة' : 'Login Secure Verification'}</span>
                </button>
              </form>
            </div>

            {/* System warning compliance badge */}
            <div className="mt-8 pt-4 border-t border-slate-800/50 flex items-center gap-2 text-[10px] text-slate-500 justify-center">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>{lang === 'ar' ? 'نظام الميزان متوافق مع لوائح مكافحة الاحتيال والجرائم المعلوماتية' : 'This session is logged and encrypted via secure enterprise standards.'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Database Creation overlay modal */}
      {isDbModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[99999] p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 border-2 border-[#b89047] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-white">
            <div className="bg-slate-950 p-4 border-b border-[#b89047]/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#b89047]" />
                <h3 className="font-black text-sm text-[#b89047]">{lang === 'ar' ? 'إنشاء وتهيئة قاعدة بيانات جديدة بالكامل' : 'Database Bootstrapper Engine'}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsDbModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer px-2 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDatabase} className="p-6 space-y-4 text-xs">
              {dbErrorMsg && (
                <div className="bg-rose-950/40 border border-rose-500/50 p-3 rounded-lg text-rose-300 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{dbErrorMsg}</span>
                </div>
              )}

              {dbSuccessMsg && (
                <div className="bg-emerald-950/40 border border-emerald-500/50 p-3 rounded-lg text-emerald-300 flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 animate-pulse" />
                  <span>{dbSuccessMsg}</span>
                </div>
              )}

              {/* Company Info */}
              <div className="space-y-3 bg-black/30 p-3.5 rounded-xl border border-slate-800">
                <h4 className="font-black text-[10px] text-slate-400 tracking-wider uppercase border-b border-slate-800 pb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#b89047]" />
                  <span>{lang === 'ar' ? 'بيانات المنشأة المالية المستهدفة' : 'Corporate Identity Settings'}</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">{lang === 'ar' ? 'اسم الشركة / المنشأة *' : 'Company Name *'}</label>
                    <input
                      type="text"
                      required
                      value={dbCompanyName}
                      onChange={(e) => setDbCompanyName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-[#b89047]"
                      placeholder={lang === 'ar' ? 'مثال: شركة البركة للتجارة' : 'e.g., Al-Baraka Trading'}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">{lang === 'ar' ? 'الفرع الرئيسي التابع' : 'Main Branch'}</label>
                    <input
                      type="text"
                      value={dbBranchName}
                      onChange={(e) => setDbBranchName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#b89047]"
                      placeholder={lang === 'ar' ? 'مثال: فرع القاهرة الرئيسي' : 'e.g., Main Cairo Branch'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">{lang === 'ar' ? 'السنة المالية الافتتاحية' : 'Initial Fiscal Year'}</label>
                  <input
                    type="text"
                    value={dbFiscalYear}
                    onChange={(e) => setDbFiscalYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Initial admin user info */}
              <div className="space-y-3 bg-black/30 p-3.5 rounded-xl border border-slate-800">
                <h4 className="font-black text-[10px] text-slate-400 tracking-wider uppercase border-b border-slate-800 pb-1 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-[#b89047]" />
                  <span>{lang === 'ar' ? 'بيانات مدير النظام المالك (الأدمن الجديد)' : 'Master Administrator Credentials'}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">{lang === 'ar' ? 'اسم المستخدم للمدير *' : 'Admin Username *'}</label>
                    <input
                      type="text"
                      required
                      value={dbAdminUser}
                      onChange={(e) => setDbAdminUser(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold focus:outline-none"
                      placeholder="e.g. root, owner"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">{lang === 'ar' ? 'كلمة مرور الدخول للمدير *' : 'Admin Password *'}</label>
                    <input
                      type="password"
                      required
                      value={dbAdminPass}
                      onChange={(e) => setDbAdminPass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Seeding selection */}
              <div className="p-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={dbIncludeSeed}
                    onChange={(e) => setDbIncludeSeed(e.target.checked)}
                    className="rounded bg-black border-slate-800 text-[#b89047] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-bold text-[10px] text-slate-300">
                    {lang === 'ar'
                      ? 'تضمين هيكل السلع والمستودعات والشركاء المبدئية (بيانات تجريبية مبدئية)'
                      : 'Inject initial catalog, warehouse locations & client profiles as templates'}
                  </span>
                </label>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsDbModalOpen(false)}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl font-bold cursor-pointer border border-slate-800"
                >
                  {lang === 'ar' ? 'إلغاء الأمر' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="bg-[#b89047] hover:bg-amber-400 text-black px-5 py-2 rounded-xl font-black cursor-pointer shadow-lg active:scale-95"
                >
                  {lang === 'ar' ? 'توليد وتهيئة قاعدة البيانات 🗄️' : 'Bootstrap Database 🗄️'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-slate-500 border-t border-slate-800 pt-4 z-10 font-medium text-center md:text-right">
        <p>© 2026 برنامج الميزان دوت نت لإدارة الحسابات والمستودعات والرقابة المتكاملة. جميع الحقوق محفوظة لشركة الميزان للبرمجيات المتطورة.</p>
        <p className="flex items-center gap-1.5">
          <Monitor className="w-3.5 h-3.5 text-[#b89047]" />
          <span className="text-[#b89047] font-bold">{lang === 'ar' ? 'بيئة تشغيل الميزان الآمنة بالكامل' : 'Protected Al-Meezan Secured Sandbox Portal'}</span>
        </p>
      </div>
    </div>
  );
}
