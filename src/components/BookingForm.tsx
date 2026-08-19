/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PurposeCode, Booking, VisitorInfo } from '../types';
import { PURPOSE_OPTIONS } from '../data/mockData';
import { 
  ArrowLeft, Calendar, User, Users, Building, Car, 
  FileText, Mail, MapPin, Plus, Trash2, Crown 
} from 'lucide-react';

interface BookingFormProps {
  onSubmit: (newBooking: Omit<Booking, 'id' | 'status' | 'createdAt' | 'invitationCode'>) => void;
  onViewRecords: () => void;
  onBackToWorkbench?: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, onViewRecords, onBackToWorkbench }) => {
  // Visitor Category: 'SINGLE' | 'MULTI_SHARED' | 'MULTI' | 'TEAM'
  const [visitorCategory, setVisitorCategory] = useState<'SINGLE' | 'MULTI_SHARED' | 'MULTI' | 'TEAM'>('SINGLE');

  // Single Visitor state
  const [singleName, setSingleName] = useState('');
  const [singleEmail, setSingleEmail] = useState('');

  // Multi Visitors state
  const [multiVisitors, setMultiVisitors] = useState<Array<{ name: string; email: string }>>([
    { name: '', email: '' }
  ]);

  // Team Visitor state
  const [teamLeaderName, setTeamLeaderName] = useState('');
  const [teamLeaderEmail, setTeamLeaderEmail] = useState('');
  const [teamTotalCount, setTeamTotalCount] = useState('');

  // Common Fields
  const [company, setCompany] = useState('');
  const [visitMode, setVisitMode] = useState<'SINGLE_VISIT' | 'MULTI_PASS'>('SINGLE_VISIT');
  const [singleVisitDateTime, setSingleVisitDateTime] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [clientTier, setClientTier] = useState<'NORMAL' | 'VIP'>('NORMAL');
  const [purpose, setPurpose] = useState<PurposeCode>('M'); // Default 'M' for Meeting
  const [destination, setDestination] = useState('');
  const [licensePlates, setLicensePlates] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');

  // Validation States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handlers for Multi-Visitors
  const handleAddMultiVisitor = () => {
    setMultiVisitors((prev) => [...prev, { name: '', email: '' }]);
  };

  const handleRemoveMultiVisitor = (idx: number) => {
    if (multiVisitors.length <= 1) return;
    setMultiVisitors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMultiVisitorChange = (idx: number, field: 'name' | 'email', value: string) => {
    const updated = [...multiVisitors];
    updated[idx] = { ...updated[idx], [field]: value };
    setMultiVisitors(updated);

    if (field === 'name' && value.trim()) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[`multiName_${idx}`];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate Visitor Name/Details based on Category
    if (visitorCategory === 'SINGLE') {
      if (!singleName.trim()) {
        newErrors.singleName = '請輸入訪客全名';
      }
    } else if (visitorCategory === 'MULTI') {
      multiVisitors.forEach((v, idx) => {
        if (!v.name.trim()) {
          newErrors[`multiName_${idx}`] = `請輸入訪客 #${idx + 1} 姓名`;
        }
      });
    } else if (visitorCategory === 'TEAM') {
      if (!teamLeaderName.trim()) {
        newErrors.teamLeaderName = '請輸入訪客全名';
      }
      if (!teamTotalCount.trim()) {
        newErrors.teamTotalCount = '請填寫訪客總人數';
      } else if (isNaN(Number(teamTotalCount)) || Number(teamTotalCount) <= 0) {
        newErrors.teamTotalCount = '只能填寫大於0的數字';
      }
    }

    // Validate Visit Date/Time
    if (visitMode === 'SINGLE_VISIT') {
      if (!singleVisitDateTime) {
        newErrors.visitDateTime = '請選擇到訪日期和時間';
      }
    } else {
      if (!startDateTime) {
        newErrors.startDateTime = '請選擇開始日期和時間';
      }
      if (!endDateTime) {
        newErrors.endDateTime = '請選擇結束日期和時間';
      }
    }

    // Destination
    if (!destination.trim()) {
      newErrors.destination = '請輸入目的地';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Build visitor Name, visitors array, and lead contact email
    let mainVisitorName = '';
    let mainContactEmail = '';
    let visitorList: VisitorInfo[] = [];
    let totalCount = 1;

    if (visitorCategory === 'SINGLE') {
      mainVisitorName = singleName.trim();
      mainContactEmail = singleEmail.trim();
      visitorList = [{ name: singleName.trim(), email: singleEmail.trim() }];
      totalCount = 1;
    } else if (visitorCategory === 'MULTI' || visitorCategory === 'MULTI_SHARED') {
      const validMulti = multiVisitors.filter((v) => v.name.trim() !== '');
      mainVisitorName = validMulti[0]?.name || '';
      mainContactEmail = validMulti[0]?.email || '';
      visitorList = validMulti.map((v) => ({ name: v.name.trim(), email: v.email.trim() }));
      totalCount = validMulti.length;
    } else if (visitorCategory === 'TEAM') {
      mainVisitorName = teamLeaderName.trim();
      mainContactEmail = teamLeaderEmail.trim();
      visitorList = [{ name: teamLeaderName.trim(), email: teamLeaderEmail.trim() }];
      totalCount = parseInt(teamTotalCount, 10) || 1;
    }

    // Format Visit Date Time string
    const formattedVisitDateTime =
      visitMode === 'SINGLE_VISIT'
        ? singleVisitDateTime
        : `${startDateTime} 至 ${endDateTime}`;

    // Filter valid license plates
    const validPlates = licensePlates
      .map((p) => p.trim())
      .filter((p) => p !== '');

    onSubmit({
      visitorName: mainVisitorName,
      visitorType: visitorCategory,
      totalVisitorsCount: totalCount,
      clientTier: clientTier,
      company: company.trim() ? company : undefined,
      visitDateTime: formattedVisitDateTime,
      visitMode: visitMode,
      startDateTime: visitMode === 'MULTI_PASS' ? startDateTime : undefined,
      endDateTime: visitMode === 'MULTI_PASS' ? endDateTime : undefined,
      licensePlate: validPlates.length > 0 ? validPlates.join(', ') : undefined,
      licensePlates: validPlates.length > 0 ? validPlates : undefined,
      purpose,
      destination,
      notes: notes.trim() ? notes : undefined,
      contactEmail: mainContactEmail ? mainContactEmail : undefined,
      visitors: visitorList,
    });

    // Reset Form
    setSingleName('');
    setSingleEmail('');
    setMultiVisitors([{ name: '', email: '' }]);
    setTeamLeaderName('');
    setTeamLeaderEmail('');
    setTeamTotalCount('');
    setCompany('');
    setSingleVisitDateTime('');
    setStartDateTime('');
    setEndDateTime('');
    setLicensePlates(['']);
    setPurpose('M');
    setDestination('');
    setNotes('');
    setErrors({});
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      {/* 1. 頂部返回Bar: 返回按鈕 | 訪客預約 | 我的預約 */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          {onBackToWorkbench && (
            <button
              type="button"
              onClick={onBackToWorkbench}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="返回"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">
            訪客預約
          </h1>
        </div>

        <button
          type="button"
          onClick={onViewRecords}
          className="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100/80 rounded-xl transition-colors cursor-pointer border border-blue-200/60 dark:border-blue-800/60"
        >
          我的預約
        </button>
      </div>

      {/* Main Body Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-20 flex-1 max-w-md mx-auto w-full">
        
        {/* 2. 訪客預約登記 Banner Notice */}
        <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl text-white shadow-md">
          <h2 className="text-sm font-black mb-1">訪客預約登記</h2>
          <p className="text-xs text-blue-50/90 leading-relaxed font-medium">
            請提前在此填寫訪客資料。登記成功並且審核通過後、您可以將電子通行證分享給訪客。
          </p>
        </div>

        {/* 3. 表單內容卡片 */}
        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
          
          {/* 訪客類型選擇 (個人 / 多人同行 / 多人分到 / 團隊) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              訪客類型 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setVisitorCategory('SINGLE')}
                className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                  visitorCategory === 'SINGLE'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                個人訪客
              </button>

              <button
                type="button"
                onClick={() => setVisitorCategory('MULTI_SHARED')}
                className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                  visitorCategory === 'MULTI_SHARED'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                多人同行
              </button>

              <button
                type="button"
                onClick={() => setVisitorCategory('MULTI')}
                className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                  visitorCategory === 'MULTI'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                多人分行
              </button>

              <button
                type="button"
                onClick={() => setVisitorCategory('TEAM')}
                className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                  visitorCategory === 'TEAM'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                團隊訪客
              </button>
            </div>

            {/* 多人同行 (共用卡) 說明提示 */}
            {visitorCategory === 'MULTI_SHARED' && (
              <div className="mt-2.5 p-2.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 rounded-xl flex items-start gap-2 text-[11px] text-blue-800 dark:text-blue-300 font-medium leading-snug">
                <Users size={14} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>適用於多人同時同行到訪，共用一張電子通行證核銷入場。</span>
              </div>
            )}

            {/* 多人分到 (獨立卡) 說明提示 */}
            {visitorCategory === 'MULTI' && (
              <div className="mt-2.5 p-2.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 rounded-xl flex items-start gap-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium leading-snug">
                <Users size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>適用於多人不同行到訪，每位成員均擁有專屬電子通行證，需要每個人自己拿通行證獨立掃碼入場。</span>
              </div>
            )}

            {/* 團隊訪客 說明提示 */}
            {visitorCategory === 'TEAM' && (
              <div className="mt-2.5 p-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/50 rounded-xl flex items-start gap-2 text-[11px] text-indigo-800 dark:text-indigo-300 font-medium leading-snug">
                <Users size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>適用於團體同列進出，僅需填寫領隊資訊與一張團體通行證，由領隊統一帶隊核銷入場。</span>
              </div>
            )}
          </div>

          {/* ==================== A) 單人訪客欄位 ==================== */}
          {visitorCategory === 'SINGLE' && (
            <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              {/* 姓名 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <User size={14} className="text-slate-400" />
                  <span>姓名 <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  value={singleName}
                  onChange={(e) => {
                    setSingleName(e.target.value);
                    if (errors.singleName) setErrors((prev) => ({ ...prev, singleName: '' }));
                  }}
                  placeholder="請輸入訪客全名"
                  className={`w-full px-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.singleName
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                  }`}
                />
                {errors.singleName && (
                  <p className="mt-1 text-[10px] font-medium text-rose-500">{errors.singleName}</p>
                )}
              </div>

              {/* 電郵 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Mail size={14} className="text-slate-400" />
                  <span>電郵 <span className="text-slate-400 text-[10px] font-normal">(填寫後自動發送電子通行證)</span></span>
                </label>
                <input
                  type="email"
                  value={singleEmail}
                  onChange={(e) => setSingleEmail(e.target.value)}
                  placeholder="請輸入電郵（選填，填寫後自動發送電子通行證）"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
          )}

          {/* ==================== B) 多人訪客欄位 (同行或獨立) ==================== */}
          {(visitorCategory === 'MULTI' || visitorCategory === 'MULTI_SHARED') && (
            <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Users size={14} className="text-blue-500" />
                  <span>訪客名單 <span className="text-rose-500">*</span></span>
                </label>
                <button
                  type="button"
                  onClick={handleAddMultiVisitor}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 rounded-lg transition-all cursor-pointer border border-blue-200/50 dark:border-blue-800/50"
                >
                  <Plus size={12} />
                  <span>新增訪客</span>
                </button>
              </div>

              <div className="space-y-3">
                {multiVisitors.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-2 relative"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>訪客 #{idx + 1}</span>
                      {multiVisitors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMultiVisitor(idx)}
                          className="text-rose-500 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                          title="移除訪客"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    {/* 多人：姓名 */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        姓名 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => handleMultiVisitorChange(idx, 'name', e.target.value)}
                        placeholder="請輸入訪客全名"
                        className={`w-full px-3 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                          errors[`multiName_${idx}`]
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                        }`}
                      />
                      {errors[`multiName_${idx}`] && (
                        <p className="mt-1 text-[9px] font-medium text-rose-500">{errors[`multiName_${idx}`]}</p>
                      )}
                    </div>

                    {/* 多人：電郵 (若為「多人同行」，僅訪客#1需要/可填寫電郵) */}
                    {(visitorCategory !== 'MULTI_SHARED' || idx === 0) && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          電郵 <span className="text-slate-400 font-normal">(選填，填寫後自動發送電子通行證)</span>
                        </label>
                        <input
                          type="email"
                          value={v.email}
                          onChange={(e) => handleMultiVisitorChange(idx, 'email', e.target.value)}
                          placeholder="請輸入電郵"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== C) 團隊訪客欄位 ==================== */}
          {visitorCategory === 'TEAM' && (
            <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              {/* 領隊姓名 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <User size={14} className="text-slate-400" />
                  <span>領隊姓名 <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  value={teamLeaderName}
                  onChange={(e) => {
                    setTeamLeaderName(e.target.value);
                    if (errors.teamLeaderName) setErrors((prev) => ({ ...prev, teamLeaderName: '' }));
                  }}
                  placeholder="請輸入訪客全名"
                  className={`w-full px-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.teamLeaderName
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                  }`}
                />
                {errors.teamLeaderName && (
                  <p className="mt-1 text-[10px] font-medium text-rose-500">{errors.teamLeaderName}</p>
                )}
              </div>

              {/* 電郵 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Mail size={14} className="text-slate-400" />
                  <span>電郵 <span className="text-slate-400 text-[10px] font-normal">(填寫後自動發送電子通行證)</span></span>
                </label>
                <input
                  type="email"
                  value={teamLeaderEmail}
                  onChange={(e) => setTeamLeaderEmail(e.target.value)}
                  placeholder="請輸入電郵（選填，填寫後自動發送電子通行證）"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* 訪客總人數 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Users size={14} className="text-slate-400" />
                  <span>訪客總人數 <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={teamTotalCount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setTeamTotalCount(val);
                    if (errors.teamTotalCount) setErrors((prev) => ({ ...prev, teamTotalCount: '' }));
                  }}
                  placeholder="只能填寫數字"
                  className={`w-full px-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.teamTotalCount
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                  }`}
                />
                {errors.teamTotalCount && (
                  <p className="mt-1 text-[10px] font-medium text-rose-500">{errors.teamTotalCount}</p>
                )}
              </div>
            </div>
          )}

          {/* 公司名稱 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Building size={14} className="text-slate-400" />
              <span>公司名稱 <span className="text-slate-400 text-[10px] font-normal">(選填)</span></span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="請輸入"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* 到訪模式 / 頻率 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              到訪模式 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisitMode('SINGLE_VISIT')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                  visitMode === 'SINGLE_VISIT'
                    ? 'bg-blue-500 border-blue-500 text-white shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                單次訪問
              </button>
              <button
                type="button"
                onClick={() => setVisitMode('MULTI_PASS')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                  visitMode === 'MULTI_PASS'
                    ? 'bg-blue-500 border-blue-500 text-white shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                有效期內多次訪問
              </button>
            </div>
          </div>

          {/* 到訪日期 (單次訪問 vs 有效期內多次訪問) */}
          {visitMode === 'SINGLE_VISIT' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar size={14} className="text-slate-400" />
                <span>到訪日期和時間 <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="datetime-local"
                value={singleVisitDateTime}
                onChange={(e) => {
                  setSingleVisitDateTime(e.target.value);
                  if (errors.visitDateTime) setErrors((prev) => ({ ...prev, visitDateTime: '' }));
                }}
                className={`w-full px-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.visitDateTime
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                }`}
              />
              {errors.visitDateTime && (
                <p className="mt-1 text-[10px] font-medium text-rose-500">{errors.visitDateTime}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Calendar size={14} className="text-slate-400" />
                  <span>開始日期和時間 <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => {
                    setStartDateTime(e.target.value);
                    if (errors.startDateTime) setErrors((prev) => ({ ...prev, startDateTime: '' }));
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.startDateTime
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                  }`}
                />
                {errors.startDateTime && (
                  <p className="mt-1 text-[10px] font-medium text-rose-500">{errors.startDateTime}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Calendar size={14} className="text-slate-400" />
                  <span>結束日期和時間 <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => {
                    setEndDateTime(e.target.value);
                    if (errors.endDateTime) setErrors((prev) => ({ ...prev, endDateTime: '' }));
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.endDateTime
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                  }`}
                />
                {errors.endDateTime && (
                  <p className="mt-1 text-[10px] font-medium text-rose-500">{errors.endDateTime}</p>
                )}
              </div>
            </div>
          )}

          {/* 客戶類型：普通客戶 / VIP客戶 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              客戶類型 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setClientTier('NORMAL')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  clientTier === 'NORMAL'
                    ? 'bg-blue-500 border-blue-500 text-white shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>普通客戶</span>
              </button>
              <button
                type="button"
                onClick={() => setClientTier('VIP')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  clientTier === 'VIP'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-500 text-white shadow-xs ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Crown size={14} className={clientTier === 'VIP' ? 'text-amber-100' : 'text-amber-500'} />
                <span>VIP客戶</span>
              </button>
            </div>
          </div>

          {/* 到訪性質 (不變) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
              <FileText size={14} className="text-slate-400" />
              <span>到訪性質 <span className="text-rose-500">*</span></span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PURPOSE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setPurpose(opt.code)}
                  className={`flex items-center justify-center py-2 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    purpose === opt.code
                      ? 'bg-blue-500 border-blue-500 text-white shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 目的地 (不變) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <MapPin size={14} className="text-slate-400" />
              <span>目的地 <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                if (errors.destination) setErrors((prev) => ({ ...prev, destination: '' }));
              }}
              placeholder="例如：電視城行政大樓 7 樓會議室 B"
              className={`w-full px-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                errors.destination
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
              }`}
            />
            {errors.destination && (
              <p className="mt-1 text-[10px] font-medium text-rose-500">{errors.destination}</p>
            )}
          </div>

          {/* 車牌號碼 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Car size={14} className="text-slate-400" />
                <span>車牌號碼 <span className="text-slate-400 text-[10px] font-normal">(選填)</span></span>
              </label>
              {licensePlates.length < 2 && (
                <button
                  type="button"
                  onClick={() => setLicensePlates((prev) => [...prev, ''])}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <Plus size={12} />
                  <span>新增車牌</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {licensePlates.map((plate, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={plate}
                    onChange={(e) => {
                      const copy = [...licensePlates];
                      copy[idx] = e.target.value;
                      setLicensePlates(copy);
                    }}
                    placeholder={`請輸入車牌號碼${licensePlates.length > 1 ? ` (${idx + 1})` : ''}`}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  {licensePlates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const copy = licensePlates.filter((_, i) => i !== idx);
                        setLicensePlates(copy);
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer shrink-0"
                      title="移除車牌"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 備註 (不變) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText size={14} className="text-slate-400" />
              <span>備註 <span className="text-slate-400 text-[10px] font-normal">(選填)</span></span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="請填寫其他注意事項或訪客需求..."
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>

        </div>

        {/* 提交按鈕 */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-2xl text-xs font-black transition-all shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>提交預約</span>
          </button>
        </div>
      </form>
    </div>
  );
};
