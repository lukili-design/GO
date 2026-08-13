/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PurposeCode, Booking, VisitorInfo } from '../types';
import { PURPOSE_OPTIONS } from '../data/mockData';
import { Calendar, User, Building, Car, FileText, Mail, MapPin, Plus, Trash2 } from 'lucide-react';

interface BookingFormProps {
  onSubmit: (newBooking: Omit<Booking, 'id' | 'status' | 'createdAt' | 'invitationCode'>) => void;
  onViewRecords: () => void;
  onBackToWorkbench?: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, onViewRecords, onBackToWorkbench }) => {
  const [visitors, setVisitors] = useState<VisitorInfo[]>([
    { name: '', idNumber: '' }
  ]);
  const [company, setCompany] = useState('');
  const [visitDateTime, setVisitDateTime] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [purpose, setPurpose] = useState<PurposeCode>('M'); // Default 'M' for Meeting
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');

  // Validation States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleAddVisitorRow = () => {
    setVisitors([...visitors, { name: '', idNumber: '' }]);
  };

  const handleRemoveVisitorRow = (idx: number) => {
    if (visitors.length <= 1) return;
    const updated = visitors.filter((_, i) => i !== idx);
    setVisitors(updated);
    
    // Clear validation error of the removed index and reindex
    const updatedErrors = { ...errors };
    delete updatedErrors[`visitorName_${idx}`];
    delete updatedErrors[`visitorIdNumber_${idx}`];
    
    const reindexedErrors: { [key: string]: string } = {};
    Object.keys(updatedErrors).forEach((key) => {
      if (key.startsWith('visitorName_')) {
        const kIdx = parseInt(key.split('_')[1], 10);
        if (kIdx > idx) {
          reindexedErrors[`visitorName_${kIdx - 1}`] = updatedErrors[key];
        } else if (kIdx < idx) {
          reindexedErrors[key] = updatedErrors[key];
        }
      } else if (key.startsWith('visitorIdNumber_')) {
        const kIdx = parseInt(key.split('_')[1], 10);
        if (kIdx > idx) {
          reindexedErrors[`visitorIdNumber_${kIdx - 1}`] = updatedErrors[key];
        } else if (kIdx < idx) {
          reindexedErrors[key] = updatedErrors[key];
        }
      } else {
        reindexedErrors[key] = updatedErrors[key];
      }
    });
    setErrors(reindexedErrors);
  };

  const handleVisitorChange = (idx: number, field: keyof VisitorInfo, value: string) => {
    const updated = [...visitors];
    updated[idx] = { ...updated[idx], [field]: value };
    setVisitors(updated);

    if (field === 'name' && value.trim()) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[`visitorName_${idx}`];
        return copy;
      });
    }
    if (field === 'idNumber' && value.trim()) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[`visitorIdNumber_${idx}`];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    visitors.forEach((v, idx) => {
      if (!v.name.trim()) {
        newErrors[`visitorName_${idx}`] = `請輸入訪客 #${idx + 1} 姓名`;
      }
      if (!v.idNumber.trim()) {
        newErrors[`visitorIdNumber_${idx}`] = `請輸入訪客 #${idx + 1} 證件號碼`;
      }
    });

    if (!visitDateTime) {
      newErrors.visitDateTime = '請選擇到訪日期與時間 (Date & time are required)';
    }
    if (!destination.trim()) {
      newErrors.destination = '請輸入目的地 (Destination is required)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const validVisitors = visitors.filter(v => v.name.trim() !== '');

    onSubmit({
      visitorName: validVisitors[0]?.name || '',
      company: company.trim() ? company : undefined,
      visitDateTime,
      licensePlate: licensePlate.trim() ? licensePlate : undefined,
      purpose,
      destination,
      notes: notes.trim() ? notes : undefined,
      visitors: validVisitors,
    });

    // Reset Form
    setVisitors([{ name: '', idNumber: '' }]);
    setCompany('');
    setVisitDateTime('');
    setLicensePlate('');
    setPurpose('M');
    setDestination('');
    setNotes('');
    setErrors({});
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      {/* App Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          {onBackToWorkbench && (
            <button
              type="button"
              onClick={onBackToWorkbench}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer mr-0.5"
              title="返回工作日常"
            >
              ←
            </button>
          )}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-emerald-500 to-red-500 p-[1.5px] shadow-sm">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[6px] flex items-center justify-center font-bold text-xs text-slate-800 dark:text-white">
              TVB
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-950 dark:text-slate-50">訪客預約</h1>
            <p className="text-[10px] text-slate-400 font-medium">TVB Go 辦公服務</p>
          </div>
        </div>
        <button
          onClick={onViewRecords}
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
        >
          <span>📋 我的預約 / 紀錄</span>
        </button>
      </div>

      {/* Main Body */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-20 flex-1">
        {/* Banner Card */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white shadow-md relative overflow-hidden">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
            <Calendar size={120} />
          </div>
          <h2 className="text-base font-bold mb-1">訪客預約登記</h2>
          <p className="text-xs text-blue-50/80 leading-relaxed max-w-[85%]">
            請提前在此填寫訪客資料。登記成功後，您可以直接將電子通行證分享給訪客。
          </p>
        </div>

        {/* Form Fields */}
        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
          
          {/* Visitors List Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <User size={14} className="text-blue-500" />
                <span>訪客名單 (Visitors) <span className="text-rose-500">*</span></span>
              </label>
              <button
                type="button"
                onClick={handleAddVisitorRow}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition-all cursor-pointer border border-blue-100/50 dark:border-blue-900/30"
              >
                <Plus size={11} />
                <span>新增訪客</span>
              </button>
            </div>

            <div className="space-y-3">
              {visitors.map((visitor, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2.5 relative"
                >
                  {/* Visitor Row Header */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">訪客 #{idx + 1}</span>
                    {visitors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVisitorRow(idx)}
                        className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-all"
                        title="移除此訪客"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Name field */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        姓名 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={visitor.name}
                        onChange={(e) => handleVisitorChange(idx, 'name', e.target.value)}
                        placeholder="請輸入訪客全名"
                        className={`w-full px-3 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                          errors[`visitorName_${idx}`]
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                        }`}
                      />
                      {errors[`visitorName_${idx}`] && (
                        <p className="mt-1 text-[9px] font-medium text-rose-500">{errors[`visitorName_${idx}`]}</p>
                      )}
                    </div>

                    {/* ID Document field */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        證件號碼 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={visitor.idNumber}
                        onChange={(e) => handleVisitorChange(idx, 'idNumber', e.target.value)}
                        placeholder="請輸入身分證 / 護照號碼"
                        className={`w-full px-3 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                          errors[`visitorIdNumber_${idx}`]
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                        }`}
                      />
                      {errors[`visitorIdNumber_${idx}`] && (
                        <p className="mt-1 text-[9px] font-medium text-rose-500">{errors[`visitorIdNumber_${idx}`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Building size={14} className="text-slate-400" />
              公司名稱 <span className="text-slate-400 text-[10px] font-normal">(選填)</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="例如：騰訊香港 (Tencent HK)"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Visit Date and Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Calendar size={14} className="text-slate-400" />
              到訪日期與時間 <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={visitDateTime}
              onChange={(e) => setVisitDateTime(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-lg border bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                errors.visitDateTime
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
              }`}
            />
            {errors.visitDateTime && (
              <p className="mt-1 text-[10px] font-medium text-rose-500">{errors.visitDateTime}</p>
            )}
          </div>

          {/* Purpose of Visit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
              <FileText size={14} className="text-slate-400" />
              到訪性質 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PURPOSE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setPurpose(opt.code)}
                  className={`flex items-center justify-center py-2 px-2 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                    purpose === opt.code
                      ? 'bg-blue-500 border-blue-500 text-white shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400 italic">
              目前選擇：{PURPOSE_OPTIONS.find((o) => o.code === purpose)?.label}
            </p>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <MapPin size={14} className="text-slate-400" />
              目的地 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="例如：行政大樓 7 樓會議室 B"
              className={`w-full px-3 py-2 text-xs rounded-lg border bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                errors.destination
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
              }`}
            />
            {errors.destination && (
              <p className="mt-1 text-[10px] font-medium text-rose-500">{errors.destination}</p>
            )}
          </div>

          {/* License Plate */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Car size={14} className="text-slate-400" />
              車牌號碼 <span className="text-slate-400 text-[10px] font-normal">(選填)</span>
            </label>
            <input
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              placeholder="請輸入車牌號碼"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all mb-1.5"
            />
            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
              <p className="text-[10px] leading-relaxed text-amber-800 dark:text-amber-400 font-medium">
                車牌：每間公司只可安排兩個泊車位，並需提供車牌號碼。
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText size={14} className="text-slate-400" />
              備註 <span className="text-slate-400 text-[10px] font-normal">(選填)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="請填寫其他注意事項或訪客需求..."
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>

        </div>

        {/* Submit Actions */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>生成邀請</span>
          </button>
        </div>
      </form>
    </div>
  );
};
