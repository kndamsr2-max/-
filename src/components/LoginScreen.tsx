import React, { useState, useEffect } from 'react';
import { User, Eye, EyeOff, Lock, User as UserIcon, Clock, Calendar, Scale, Globe, Monitor } from 'lucide-react';
import { mockDatabase } from '../data/mockDatabase';
import { motion } from 'motion/react';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
}

export default function LoginScreen({ onLoginSuccess, lang, setLang }: LoginScreenProps) {
  const [username, setUsername] = useState('admin'); // preloaded for convenience
  const [password, setPassword] = useState('01278150'); // preloaded for convenience
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  
  // Date and Time State
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    mockDatabase.init();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = mockDatabase.getUsers();
    const foundUser = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      setError(
        lang === 'ar' 
          ? 'اسم المستخدم أو كلمة المرور غير صحيحة!' 
          : 'Invalid username or password!'
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

    // Update last login details
    const updatedUsers = users.map(u => {
      if (u.id === foundUser.id) {
        return {
          ...u,
          lastLogin: new Date().toISOString(),
          deviceInfo: `Chrome (AI Studio Applet) - ${navigator.platform}`
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

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between p-4 md:p-8 font-sans relative overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Decorative ambient background curves */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Bar of Login Screen */}
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] border border-[#c5a880]/30 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/10 text-[#c5a880]">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#0f172a] dark:text-white tracking-wide flex items-center gap-2">
              <span>{lang === 'ar' ? 'الميزان دوت نت' : 'Al-Meezan .Net'}</span>
              <span className="text-[10px] font-bold bg-[#c5a880]/20 text-[#b89047] border border-[#c5a880]/40 px-2 py-0.5 rounded">ERP</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {lang === 'ar' ? 'نظام المحاسبة والمستودعات والرقابة المتكامل' : 'Integrated Accounting, Inventory & Audit Systems'}
            </p>
          </div>
        </div>

        {/* Dynamic Date & Time */}
        <div className="flex flex-col md:flex-row items-center gap-4 font-mono text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold">{formatDate()}</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50 text-blue-600 dark:text-blue-300 font-bold shadow-sm">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>{formatTime()}</span>
          </div>
          <div className="bg-emerald-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-emerald-150 dark:border-slate-700/50 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm">
            v3.5.0
          </div>
        </div>
      </div>

      {/* Middle Login Container */}
      <div className="w-full max-w-md mx-auto my-auto py-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xl relative"
        >
          {/* Language Switcher inside card */}
          <div className="absolute top-4 left-4">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 rounded-full transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>
          </div>

          <div className="text-center mb-8 mt-4">
            <div className="inline-flex w-16 h-16 bg-[#c5a880]/15 rounded-full items-center justify-center text-[#b89047] mb-3 border border-[#c5a880]/20 shadow-inner">
              <Scale className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white mb-1">
              {lang === 'ar' ? 'بوابة تسجيل الدخول الآمنة' : 'Secure Access Gateway'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === 'ar' 
                ? 'برنامج الميزان دوت نت - لإدارة الحسابات والمستودعات' 
                : 'Al-Meezan .Net Accounting & Inventory System'}
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-xs mb-5 text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === 'ar' ? 'اسم المستخدم' : 'Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg py-2.5 pr-10 pl-3 text-sm text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  placeholder={lang === 'ar' ? 'مثال: admin' : 'e.g., admin'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg py-2.5 pr-10 pl-10 text-sm text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                />
                <span>{lang === 'ar' ? 'تذكرني على هذا الجهاز' : 'Remember me on this device'}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white border border-[#c5a880]/30 hover:border-[#c5a880] font-bold py-2.5 rounded-lg text-sm shadow-sm active:scale-[0.98] transition-all cursor-pointer mt-6 flex justify-center items-center gap-2 text-[#c5a880]"
            >
              <Scale className="w-4 h-4 text-[#c5a880]" />
              <span>{lang === 'ar' ? 'تسجيل الدخول الآمن للنظام' : 'Secure Sign In To System'}</span>
            </button>
          </form>

          {/* Helper details */}
          <div className="mt-6 border-t border-slate-150 dark:border-slate-800/50 pt-4 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">
              {lang === 'ar' 
                ? 'الحساب التجريبي الافتراضي: admin / كلمة المرور: 01278150' 
                : 'Default credentials: admin / Password: 01278150'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-4 z-10 font-sans font-medium">
        <p>© 2026 برنامج الميزان دوت نت لإدارة الحسابات والمستودعات. جميع الحقوق محفوظة لشركة الميزان للبرمجيات.</p>
        <p className="flex items-center gap-1">
          <Monitor className="w-3.5 h-3.5 text-[#b89047]" />
          <span>{lang === 'ar' ? 'بيئة تشغيل الميزان المحمية بالكامل' : 'Al-Meezan Fully Protected Runtime'}</span>
        </p>
      </div>
    </div>
  );
}
