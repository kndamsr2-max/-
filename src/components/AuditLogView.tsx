import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, RefreshCw, X, Printer, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { mockDatabase } from '../data/mockDatabase';
import { AuditLog } from '../types';

interface AuditLogViewProps {
  lang: 'ar' | 'en';
  onClose: () => void;
}

export default function AuditLogView({ lang, onClose }: AuditLogViewProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    mockDatabase.init();
    setLogs(mockDatabase.getAuditLogs());
  };

  const handleClearLogs = () => {
    if (confirm(lang === 'ar' ? 'تحذير: هل تريد مسح سجل العمليات الحالي بالكامل؟' : 'Warning: Are you sure you want to clear all logs?')) {
      localStorage.setItem('sami_audit_logs', JSON.stringify([]));
      loadLogs();
    }
  };

  const filteredLogs = logs.filter(log => 
    log.username.includes(searchTerm) || 
    log.action.includes(searchTerm) || 
    log.details.includes(searchTerm) || 
    log.device.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-6 bg-[#f0f2f5] dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Banner */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-600 text-white">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1e40af] dark:text-white flex items-center gap-2">
              <span>{lang === 'ar' ? 'سجل العمليات والرقابة الداخلية (Audit Log)' : 'Audit Trail & Internal Logs'}</span>
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ar' ? 'تسجيل فوري لجميع حركات دخول الموظفين، وإصدار الفواتير وحذف المستندات' : 'Live tracking of all user actions, edits, updates and system entries'}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <button
            onClick={loadLogs}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded text-slate-700 dark:text-slate-200 cursor-pointer border border-slate-200 dark:border-slate-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{lang === 'ar' ? 'تحديث السجل' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-3 py-2 rounded cursor-pointer transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'تفريغ السجل' : 'Clear Trail'}</span>
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

      {/* Filter panel */}
      <div className="flex gap-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 max-w-lg shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'ar' ? 'ابحث باسم الموظف، العملية، أو تفاصيل الحركة...' : 'Filter audit trail...'}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded py-1.5 pr-8 pl-3 text-xs text-slate-850 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 text-right border-b border-slate-200 dark:border-slate-800 font-bold">
                <th className="p-3 w-32">{lang === 'ar' ? 'التوقيت الفعلي' : 'Timestamp'}</th>
                <th className="p-3 w-28">{lang === 'ar' ? 'حساب الموظف' : 'User Account'}</th>
                <th className="p-3 w-36">{lang === 'ar' ? 'نوع العملية' : 'Action Type'}</th>
                <th className="p-3">{lang === 'ar' ? 'تفاصيل الحركة والتعديل' : 'Activity & Changes Description'}</th>
                <th className="p-3 w-44">{lang === 'ar' ? 'عنوان الـ IP' : 'IP Address'}</th>
                <th className="p-3 w-56">{lang === 'ar' ? 'جهاز الدخول المتصل' : 'Connected Device / Platform'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors font-mono">
                  <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 text-blue-600 dark:text-blue-400 font-bold font-sans">@{log.username}</td>
                  <td className="p-3">
                    <span className="bg-[#1e40af]/10 text-[#1e40af] dark:bg-emerald-500/10 dark:text-emerald-400 border border-blue-500/20 dark:border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-slate-800 dark:text-white text-[11px] font-sans leading-relaxed">{log.details}</td>
                  <td className="p-3 text-slate-400 text-[10px]">{log.ipAddress}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-sans text-[10px] truncate max-w-[200px]">{log.device}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-500 font-sans">
                    {lang === 'ar' ? 'لم يتم العثور على أي حركات مسجلة مطابقة!' : 'No matching activities recorded!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
