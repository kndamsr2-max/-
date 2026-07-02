import React, { useState, useEffect } from 'react';
import { 
  Plus, Save, Edit2, Trash2, Search, Printer, FileSpreadsheet, FileText, X, 
  UserCheck, Shield, Key, Eye, EyeOff, CheckSquare, Square, RefreshCw
} from 'lucide-react';
import { mockDatabase, defaultPermissions } from '../data/mockDatabase';
import { User, UserPermissions } from '../types';

interface UserManagementViewProps {
  lang: 'ar' | 'en';
  currentUser: any;
  onClose: () => void;
}

export default function UserManagementView({ lang, currentUser, onClose }: UserManagementViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form Fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [branch, setBranch] = useState('الفرع الرئيسي - القاهرة');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [showPassword, setShowPassword] = useState(false);

  // Custom inline overlays to prevent sandbox iframe alert() and confirm() blocks
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4000);
  };

  // Search input
  const [searchTerm, setSearchTerm] = useState('');

  // Permissions state
  const [permissions, setPermissions] = useState<UserPermissions>(defaultPermissions(false));

  const isAdmin = currentUser?.username?.toLowerCase() === 'admin';

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = (userToSelect?: User) => {
    mockDatabase.init();
    const list = mockDatabase.getUsers();
    setUsers(list);
    
    const target = userToSelect || selectedUser;
    if (target) {
      const found = list.find(u => u.id === target.id) || list[0];
      if (found) {
        handleSelectUser(found);
      }
    } else if (list.length > 0) {
      handleSelectUser(list[0]);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setUsername(user.username);
    setFullName(user.fullName);
    setPassword(user.password || '');
    setConfirmPassword(user.password || '');
    setJobTitle(user.jobTitle);
    setDepartment(user.department);
    setBranch(user.branch);
    setEmail(user.email);
    setPhone(user.phone);
    setAvatarUrl(user.avatarUrl || '');
    setStatus(user.status);
    setPermissions(user.permissions);
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setUsername('');
    setFullName('');
    setPassword('');
    setConfirmPassword('');
    setJobTitle('');
    setDepartment('');
    setBranch('الفرع الرئيسي - القاهرة');
    setEmail('');
    setPhone('');
    setAvatarUrl('');
    setStatus('active');
    setPermissions(defaultPermissions(false));
  };

  const handleSaveUser = () => {
    if (!username || !fullName || !password) {
      showToast(lang === 'ar' ? 'يرجى ملء جميع الحقول الإلزامية الاسم، اسم المستخدم، الرقم السري!' : 'Please fill all mandatory fields!', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast(lang === 'ar' ? 'عفواً، الرقم السري غير متطابق مع التأكيد!' : 'Passwords do not match!', 'error');
      return;
    }

    // Check permissions and restrictions if not admin
    if (currentUser?.username?.toLowerCase() !== 'admin') {
      showToast(lang === 'ar' ? 'صلاحية إضافة/تعديل الموظفين تقتصر على حساب المدير العام فقط!' : 'Only super-admin can manage accounts!', 'error');
      return;
    }

    const currentUsers = mockDatabase.getUsers();
    
    const userData: User = {
      id: selectedUser ? selectedUser.id : 'USER-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      username: username.toLowerCase().trim(),
      fullName,
      password,
      jobTitle,
      department,
      branch,
      email,
      phone,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
      status,
      permissions
    };

    let updatedList;
    if (selectedUser) {
      updatedList = currentUsers.map(u => u.id === selectedUser.id ? userData : u);
    } else {
      // Validate uniqueness
      if (currentUsers.some(u => u.username === userData.username)) {
        showToast(lang === 'ar' ? 'اسم المستخدم هذا مسجل بالفعل لموظف آخر!' : 'Username is already taken!', 'error');
        return;
      }
      updatedList = [...currentUsers, userData];
    }

    mockDatabase.saveUsers(updatedList);
    
    // Log action
    mockDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'إدارة المستخدمين',
      `تم حفظ وتعديل بيانات مستخدم النظام: ${fullName} (${jobTitle}) - الحالة: ${status}`
    );

    showToast(lang === 'ar' ? 'تم حفظ بيانات المستخدم وتحديث صلاحيات النظام بنجاح!' : 'User saved successfully!', 'success');
    loadUsers(userData);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    if (selectedUser.username === 'admin') {
      showToast(lang === 'ar' ? 'عفواً، لا يمكن حذف حساب مدير النظام الافتراضي!' : 'Cannot delete primary admin account!', 'error');
      return;
    }

    if (currentUser?.username?.toLowerCase() !== 'admin') {
      showToast(lang === 'ar' ? 'تنبيه: لا تمتلك صلاحيات حذف الموظفين!' : 'Permission denied!', 'error');
      return;
    }

    setConfirmDialog({
      message: lang === 'ar' ? `هل أنت متأكد من حذف الحساب: ${selectedUser.fullName} نهائياً؟` : `Are you sure you want to delete ${selectedUser.fullName}?`,
      onConfirm: () => {
        const currentUsers = mockDatabase.getUsers();
        const updated = currentUsers.filter(u => u.id !== selectedUser.id);
        mockDatabase.saveUsers(updated);

        mockDatabase.addAuditLog(
          currentUser.id,
          currentUser.username,
          'حذف مستخدم',
          `تم حذف حساب الموظف: ${selectedUser.fullName} نهائياً من قاعدة البيانات.`
        );

        showToast(lang === 'ar' ? 'تم حذف المستخدم بنجاح!' : 'User deleted successfully!', 'success');
        handleNewUser();
        loadUsers();
        setConfirmDialog(null);
      }
    });
  };

  // Toggle dynamic permissions
  const toggleGeneralPermission = (key: keyof Omit<UserPermissions, 'screens'>) => {
    const copy = { ...permissions };
    (copy as any)[key] = !copy[key];
    setPermissions(copy);
  };

  const toggleScreenPermission = (screenId: string, action: string) => {
    const copy = { ...permissions };
    if (!copy.screens[screenId]) {
      copy.screens[screenId] = {
        view: false, add: false, edit: false, delete: false, approve: false,
        unapprove: false, print: false, export: false, importExcel: false,
        reopen: false, cancel: false, finalDelete: false
      };
    }
    const screenPerm = copy.screens[screenId] as any;
    screenPerm[action] = !screenPerm[action];
    setPermissions(copy);
  };

  // Filtered users search
  const filteredUsers = users.filter(u => 
    u.fullName.includes(searchTerm) || 
    u.username.includes(searchTerm) || 
    u.jobTitle.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-6 bg-[#f0f2f5] dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Admin Status Card Banner */}
      {isAdmin ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-3 mb-6 font-semibold animate-fadeIn">
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-sm">
              {lang === 'ar' ? 'وضع المسؤول نشط: كامل الصلاحيات لإضافة وإدارة موظفي النظام' : 'Administrator Mode Active: Full Privileges to Add & Manage Users'}
            </p>
            <p className="text-[10px] opacity-90 mt-0.5">
              {lang === 'ar' 
                ? 'بصفتك المسؤول الرئيسي، تمتلك الصلاحية الحصرية لإضافة مستخدمين متعددين، حذفهم، وتعديل مستويات ومصفوفات الأمان الخاصة بهم.' 
                : 'As the primary administrator, you have exclusive rights to add multiple users, delete them, and customize their exact permission matrices.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-400 p-4 rounded-xl text-xs flex items-center gap-3 mb-6 font-semibold animate-fadeIn">
          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <p className="font-bold text-sm">
              {lang === 'ar' ? 'حساب عرض فقط: غير مصرح لك بإضافة أو تعديل المستخدمين' : 'Read-Only Account: Not Authorized to Manage Users'}
            </p>
            <p className="text-[10px] opacity-90 mt-0.5">
              {lang === 'ar' 
                ? 'عفواً، لا يمتلك حسابك الحالي الصلاحية الأمنية لإضافة موظف جديد أو تعديل مستويات دخول النظام. هذه الصلاحية تقتصر فقط على حساب المسؤول الرئيسي (admin).' 
                : 'Your current account does not have security clearance to add new employees or modify access levels. This authority is strictly reserved for the primary administrator (admin).'}
            </p>
          </div>
        </div>
      )}

      {/* Top action riboon */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#b89047] text-white">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#b89047] dark:text-[#c5a880] flex items-center gap-2">
              <span>{lang === 'ar' ? 'إدارة بطاقات الموظفين ومستويات الأمان' : 'Employee Cards & Permission Schemes'}</span>
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ar' ? 'تخصيص صلاحيات دخول الشاشات والعمليات وطباعة المستندات' : 'Configure screen levels, print access, and export rules'}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {isAdmin && (
            <>
              <button
                onClick={handleNewUser}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded text-slate-700 dark:text-slate-200 cursor-pointer border border-slate-200 dark:border-slate-700 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-[#b89047] dark:text-[#c5a880]" />
                <span>{lang === 'ar' ? 'جديد (F2)' : 'New'}</span>
              </button>

              <button
                onClick={handleSaveUser}
                className="flex items-center gap-1.5 bg-[#b89047] hover:bg-[#a67f3c] px-4 py-2 rounded text-white cursor-pointer shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'حفظ الحساب (F10)' : 'Save User'}</span>
              </button>

              <button
                onClick={handleDeleteUser}
                className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-3 py-2 rounded cursor-pointer transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'حذف الحساب' : 'Delete'}</span>
              </button>
            </>
          )}

          <button
            onClick={() => showToast(lang === 'ar' ? 'جاري طباعة سجل الموظفين وصلاحياتهم...' : 'Printing permissions...', 'info')}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded text-slate-700 dark:text-slate-200 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'ar' ? 'طباعة' : 'Print'}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left side: Users Directory and Search list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm h-[650px] flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
              <span>{lang === 'ar' ? 'دليل موظفي النظام' : 'Registered System Users'}</span>
              <span className="bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">{users.length}</span>
            </h3>

            {/* Quick search */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث بالاسم أو الوظيفة...' : 'Search directory...'}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded py-1.5 pr-8 pl-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
            </div>

            {/* Users lists scrollable */}
            <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center gap-3 ${
                    selectedUser?.id === u.id 
                      ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500 dark:border-blue-400 text-slate-900 dark:text-white shadow-sm font-bold' 
                      : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <img
                    src={u.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.username}`}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold truncate">{u.fullName}</h4>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{u.jobTitle} - {u.branch}</p>
                  </div>
                  {u.status === 'suspended' && (
                    <span className="bg-rose-500/10 text-rose-500 border border-rose-500/30 text-[8px] px-1.5 py-0.5 rounded font-bold">موقوف</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-150 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-mono">AL-MEEZAN Security v4.2</span>
          </div>
        </div>

        {/* Right side: Selected User Card details and Permissions mapping */}
        <div className="lg:col-span-3 space-y-6 overflow-y-auto max-h-[650px] pr-1">
          {/* User Details card block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#b89047] dark:text-[#c5a880] border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#b89047] dark:text-[#c5a880]" />
              <span>{lang === 'ar' ? 'المعلومات الشخصية والوظيفية للحساب' : 'Account Identity & Profile Information'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'اسم المستخدم (الدخول) *' : 'Username *'}</label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 disabled:bg-slate-100 disabled:dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono disabled:text-slate-400 dark:disabled:text-slate-500"
                  placeholder="e.g., ahmed_sale"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'الاسم بالكامل للموظف *' : 'Full Name *'}</label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 disabled:bg-slate-100 disabled:dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  placeholder={lang === 'ar' ? 'مثال: أحمد محمد علي' : 'Full Name'}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'المرتبة / المسمى الوظيفي' : 'Job Title'}</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 disabled:bg-slate-100 disabled:dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  placeholder={lang === 'ar' ? 'مثال: محاسب مستودعات' : 'e.g. Warehouse Accountant'}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'الرقم السري *' : 'Password *'}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={!isAdmin}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 disabled:bg-slate-100 disabled:dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none font-mono"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-2 flex items-center text-slate-400 hover:text-slate-600 disabled:text-slate-300 dark:disabled:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'تأكيد الرقم السري *' : 'Confirm Password *'}</label>
                <input
                  type="password"
                  required
                  disabled={!isAdmin}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 disabled:bg-slate-100 disabled:dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none font-mono"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'القسم المالي/الإداري' : 'Department'}</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 disabled:bg-slate-100 disabled:dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none"
                  placeholder={lang === 'ar' ? 'مثال: الحسابات والمراجعة' : 'e.g. Finance & Auditing'}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'الفرع الفعلي المخصص' : 'Assigned Branch'}</label>
                <select
                  value={branch}
                  disabled={!isAdmin}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 disabled:bg-slate-100 disabled:dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="الفرع الرئيسي - القاهرة">الفرع الرئيسي - القاهرة</option>
                  <option value="فرع الجيزة">فرع الجيزة</option>
                  <option value="فرع الإسكندرية">فرع الإسكندرية</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                <input
                  type="email"
                  disabled={!isAdmin}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 disabled:bg-slate-100 disabled:dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'رقم الهاتف / الجوال' : 'Phone / Mobile'}</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 disabled:bg-slate-100 disabled:dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none font-mono"
                  placeholder="012XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'رابط الصورة الشخصية' : 'Personal Avatar URL'}</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 disabled:bg-slate-100 disabled:dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none font-mono"
                  placeholder="https://api.dicebear.com/..."
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{lang === 'ar' ? 'حالة الحساب والموظف' : 'Account Status'}</label>
                <select
                  value={status}
                  disabled={!isAdmin}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 disabled:bg-slate-100 disabled:dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="active">{lang === 'ar' ? 'نشط ومفعّل' : 'Active'}</option>
                  <option value="suspended">{lang === 'ar' ? 'موقوف / معلق الصلاحيات' : 'Suspended'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Detailed Permissions lists */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-[#b89047] dark:text-[#c5a880] border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#b89047]" />
              <span>{lang === 'ar' ? 'جدول الصلاحيات ومصفوفة الأمان التفصيلية' : 'Permission matrices & Security Schemes'}</span>
            </h3>

            {/* General Permissions checkboxes */}
            <div>
              <h4 className="text-[11px] font-bold text-[#b89047] dark:text-[#c5a880] mb-3">{lang === 'ar' ? 'أولاً: صلاحيات الدخول والوظائف العامة' : 'General & System Level Access'}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.keys(permissions)
                  .filter(key => key !== 'screens')
                  .map((key) => {
                    const isChecked = (permissions as any)[key] === true;
                    const labels: { [key: string]: string } = {
                      systemAccess: 'الدخول للنظام والواجهات',
                      changePassword: 'تغيير كلمة المرور الخاصة به',
                      viewDashboard: 'رؤية لوحة مؤشرات الأداء',
                      openMultiTabs: 'فتح أكثر من شاشة في نفس الوقت',
                      exportExcel: 'تصدير البيانات لملفات Excel',
                      exportPdf: 'حفظ المستندات بصيغة PDF',
                      print: 'طباعة الفواتير والسندات المالية',
                      sendEmail: 'إرسال الفواتير عبر البريد الإلكتروني',
                      sendWhatsapp: 'إرسال الإشعارات عبر واتساب',
                      backup: 'إنشاء وحفظ نسخ احتياطية',
                      restore: 'استعادة النسخ الاحتياطية للنظام'
                    };
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={!isAdmin}
                        onClick={() => toggleGeneralPermission(key as any)}
                        className={`flex items-center gap-2 p-2 rounded border text-right text-xs transition-all ${
                          isChecked 
                            ? 'bg-[#b89047]/5 dark:bg-[#b89047]/10 border-[#b89047] dark:border-[#c5a880] text-slate-900 dark:text-white font-bold' 
                            : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                        } ${!isAdmin ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {isChecked ? <CheckSquare className="w-4 h-4 text-[#b89047] shrink-0" /> : <Square className="w-4 h-4 text-slate-400 shrink-0" />}
                        <span>{labels[key] || key}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Screen-specific permissions table */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <h4 className="text-[11px] font-bold text-[#b89047] dark:text-[#c5a880] mb-3">{lang === 'ar' ? 'ثانياً: صلاحيات تفصيلية لكل شاشة' : 'Screen Level Action Permissions'}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] text-slate-700 dark:text-slate-300">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-center font-bold">
                      <th className="p-2 text-right">{lang === 'ar' ? 'الشاشة' : 'Screen'}</th>
                      <th className="p-2">{lang === 'ar' ? 'عرض' : 'View'}</th>
                      <th className="p-2">{lang === 'ar' ? 'إضافة' : 'Add'}</th>
                      <th className="p-2">{lang === 'ar' ? 'تعديل' : 'Edit'}</th>
                      <th className="p-2">{lang === 'ar' ? 'حذف' : 'Delete'}</th>
                      <th className="p-2">{lang === 'ar' ? 'اعتماد' : 'Approve'}</th>
                      <th className="p-2">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</th>
                      <th className="p-2">{lang === 'ar' ? 'حذف نهائي' : 'Final Del'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(permissions.screens).map((screenId) => {
                      const screenData = permissions.screens[screenId];
                      const screenNames: { [key: string]: string } = {
                        dashboard: 'لوحة التحكم',
                        sales_invoice: 'فاتورة مبيعات',
                        purchase_invoice: 'فاتورة مشتريات',
                        stock_in: 'إذن إضافة مخزني',
                        stock_out: 'إذن صرف مخزني',
                        stock_transfer: 'تحويل مخازن',
                        user_management: 'صلاحيات ومستخدمين',
                        audit_logs: 'سجل العمليات',
                        products: 'دليل الأصناف',
                        clients: 'العملاء',
                        vendors: 'الموردون'
                      };
                      return (
                        <tr key={screenId} className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/30 text-center">
                          <td className="p-2 text-right font-bold text-slate-800 dark:text-slate-200">{screenNames[screenId] || screenId}</td>
                          <td className="p-1">
                            <input
                              type="checkbox"
                              disabled={!isAdmin}
                              checked={screenData.view}
                              onChange={() => toggleScreenPermission(screenId, 'view')}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="checkbox"
                              disabled={!isAdmin}
                              checked={screenData.add}
                              onChange={() => toggleScreenPermission(screenId, 'add')}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="checkbox"
                              disabled={!isAdmin}
                              checked={screenData.edit}
                              onChange={() => toggleScreenPermission(screenId, 'edit')}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="checkbox"
                              disabled={!isAdmin}
                              checked={screenData.delete}
                              onChange={() => toggleScreenPermission(screenId, 'delete')}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="checkbox"
                              disabled={!isAdmin}
                              checked={screenData.approve}
                              onChange={() => toggleScreenPermission(screenId, 'approve')}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="checkbox"
                              disabled={!isAdmin}
                              checked={screenData.cancel}
                              onChange={() => toggleScreenPermission(screenId, 'cancel')}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="checkbox"
                              disabled={!isAdmin}
                              checked={screenData.finalDelete}
                              onChange={() => toggleScreenPermission(screenId, 'finalDelete')}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed bottom-5 left-5 right-5 md:left-auto md:right-5 md:w-96 z-50 animate-slideUp" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
          <div className={`p-4 rounded-xl border shadow-lg flex items-center justify-between gap-3 ${
            toast.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500/30 text-emerald-800 dark:text-emerald-400' 
              : toast.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-500/30 text-rose-800 dark:text-rose-400'
              : 'bg-amber-50 dark:bg-amber-950/80 border-amber-500/30 text-amber-800 dark:text-amber-400'
          }`}>
            <span className="text-xs font-bold font-sans">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50 animate-fadeIn" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#b89047]" />
              <span>{lang === 'ar' ? 'تأكيد العملية' : 'Confirm Action'}</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">{confirmDialog.message}</p>
            <div className="flex justify-end gap-2 text-xs font-semibold pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 rounded text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="bg-[#b89047] hover:bg-[#c5a880] px-5 py-2 rounded text-white transition-all shadow-sm cursor-pointer"
              >
                {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
