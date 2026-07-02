import React, { useState } from 'react';
import { Database, Download, Upload, RefreshCw, X, ShieldAlert, Check } from 'lucide-react';
import { mockDatabase } from '../data/mockDatabase';

interface BackupRestoreViewProps {
  lang: 'ar' | 'en';
  currentUser: any;
  onClose: () => void;
}

export default function BackupRestoreView({ lang, currentUser, onClose }: BackupRestoreViewProps) {
  const [copied, setCopied] = useState(false);

  const handleDownloadBackup = () => {
    // Generate full snapshot of current localStorage items starting with sami_
    const backupObj: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sami_')) {
        backupObj[key] = localStorage.getItem(key);
      }
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute("download", `sami_system_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    // Log action
    mockDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'النسخ الاحتياطي',
      'توليد وتحميل نسخة احتياطية كاملة من البيانات بصيغة JSON بنجاح.'
    );

    alert(lang === 'ar' ? 'تم توليد وتنزيل النسخة الاحتياطية بنجاح!' : 'Backup file downloaded successfully!');
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          
          if (currentUser.username !== 'admin') {
            alert(lang === 'ar' ? 'صلاحية استعادة البيانات تقتصر على حساب الأدمن العام فقط!' : 'Restore operation restricted to Admin only!');
            return;
          }

          if (confirm(lang === 'ar' ? 'تحذير: استعادة هذه النسخة سيؤدي لاستبدال جميع البيانات الحالية نهائياً! هل تود المتابعة؟' : 'Warning: This will overwrite all current system data! Continue?')) {
            // Apply all items to localStorage
            Object.keys(parsed).forEach(key => {
              if (key.startsWith('sami_')) {
                localStorage.setItem(key, parsed[key]);
              }
            });

            mockDatabase.addAuditLog(
              currentUser.id,
              currentUser.username,
              'استعادة البيانات',
              'استعادة ناجحة ومطابقة لقاعدة بيانات النظام من ملف خارجي.'
            );

            alert(lang === 'ar' ? 'تمت استعادة البيانات بنجاح! سيتم إعادة تحميل الصفحة لتطبيق التغييرات.' : 'Data restored successfully! Page will refresh.');
            window.location.reload();
          }
        } catch (error) {
          alert(lang === 'ar' ? 'عفواً، الملف المختار غير صالح أو تالف!' : 'Invalid backup file structure!');
        }
      };
    }
  };

  const handleResetDatabase = () => {
    if (currentUser.username !== 'admin') {
      alert(lang === 'ar' ? 'عفواً، تصفير النظام يقتصر على حساب المدير العام فقط!' : 'Only super-admin can format the database!');
      return;
    }

    if (confirm(lang === 'ar' ? '🚨 خطر جداً: هل تريد تصفير قاعدة البيانات وإعادتها لحالة المصنع الافتراضية؟ سيتم حذف جميع الفواتير والموظفين!' : '🚨 CRITICAL: Reset database to factory default? This deletes everything!')) {
      mockDatabase.reset();
      alert(lang === 'ar' ? 'تمت إعادة تهيئة النظام بنجاح!' : 'System formatted successfully!');
      window.location.reload();
    }
  };

  return (
    <div className="p-4 md:p-6 bg-[#f0f2f5] dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top action header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 text-white">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1e40af] dark:text-white flex items-center gap-2">
              <span>{lang === 'ar' ? 'إدارة النسخ الاحتياطي وحماية البيانات' : 'System Backups & Data Hardening'}</span>
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ar' ? 'تصدير كامل لقاعدة بيانات مستخدمي سامي ومستودعاتها للحماية من الضياع المفاجئ' : 'Generate structured JSON snapshots and secure system archives'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950 px-3 py-2 rounded text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-all border border-slate-200 dark:border-slate-700 hover:border-rose-900 text-xs font-semibold"
        >
          <X className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'إغلاق ✖' : 'Close ✖'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
        {/* Export Backup panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="text-blue-600 dark:text-blue-400 bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center border border-blue-500/20">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">{lang === 'ar' ? 'تحميل نسخة احتياطية فورية' : 'Export Full Snapshot'}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {lang === 'ar' 
              ? 'احفظ جميع الفواتير والمخازن والصلاحيات وحسابات الموظفين وسجلات العمليات داخل ملف مالي آمن في حاسوبك الشخصي للرجوع إليه عند الضرورة.' 
              : 'Secure your inventory list, invoices register and user roles in a safe structured JSON document on your computer.'}
          </p>
          <button
            onClick={handleDownloadBackup}
            className="w-full bg-[#1e40af] hover:bg-blue-800 text-white font-bold py-2.5 rounded-lg text-xs shadow-sm active:scale-[0.98] transition-all cursor-pointer flex justify-center items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تنزيل ملف النسخة الاحتياطية (.json)' : 'Download Database Snapshot'}</span>
          </button>
        </div>

        {/* Import Restore panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center border border-emerald-500/20">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">{lang === 'ar' ? 'استعادة قاعدة البيانات' : 'Restore Database'}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {lang === 'ar' 
              ? 'اختر ملف النسخة الاحتياطية السابق تحميله لاستبدال البيانات الحالية على هذا المتصفح. تذكر أن هذا الإجراء خطير وسيغير جميع الأرصدة.' 
              : 'Upload a previously generated system database snapshot. WARNING: This operation overwrites all client files.'}
          </p>
          <label className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-lg text-xs transition-all cursor-pointer flex justify-center items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>{lang === 'ar' ? 'اختر ملف النسخة واسترجع البيانات' : 'Select Backup File & Restore'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreBackup}
              className="hidden"
            />
          </label>
        </div>

        {/* Reset Database option */}
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/35 rounded-xl p-6 shadow-sm space-y-4 md:col-span-2 bg-rose-50/20 dark:bg-rose-950/5">
          <div className="text-rose-600 dark:text-rose-400 bg-rose-500/10 w-12 h-12 rounded-lg flex items-center justify-center border border-rose-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">{lang === 'ar' ? 'تصفير النظام وإعادتها لحالة المصنع' : 'Factory Reset System'}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {lang === 'ar' 
              ? 'هذا الخيار خاص بأغراض التجارب والمطابقة الجمركية، سيمسح جميع الفواتير والمخازن والصلاحيات التي أدخلتها ويعيد النظام لحالته الأولى مع إبقاء حساب الأدمن التجريبي.' 
              : 'This action formats the entire workspace database and restores original preloaded demo items.'}
          </p>
          <button
            onClick={handleResetDatabase}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-5 rounded text-xs active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            {lang === 'ar' ? 'تهيئة وتصفير النظام بالكامل' : 'Initialize Factory Formatting'}
          </button>
        </div>
      </div>
    </div>
  );
}
