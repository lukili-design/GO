/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Booking, BookingStatus, PurposeCode, VisitorInfo } from '../types';
import { PURPOSE_OPTIONS, getPurposeOption, getVisitorTypeLabel } from '../data/mockData';
import { InvitationCard } from './InvitationCard';
import { 
  Users, User, Building, Car, Calendar, Mail, MapPin, 
  Plus, Trash2, Crown, Search, Eye, QrCode, X, Clock, 
  CheckCircle2, RotateCcw, AlertCircle, Sparkles, Laptop, 
  Check, FileText, Send, ArrowRight, ShieldCheck, ChevronRight, Download
} from 'lucide-react';

interface PcVisitorPortalProps {
  bookings: Booking[];
  onAddBooking: (newBookingData: Omit<Booking, 'id' | 'status' | 'createdAt' | 'invitationCode'> & { isWalkIn?: boolean, isPendingApproval?: boolean }) => void;
  onCancelBooking: (id: string) => void;
  triggerSound: (freq: number, type: OscillatorType, duration: number) => void;
}

export const PcVisitorPortal: React.FC<PcVisitorPortalProps> = ({
  bookings,
  onAddBooking,
  onCancelBooking,
  triggerSound,
}) => {
  // Main PC Portal Tab: 'CREATE' | 'RECORDS'
  const [activeTab, setActiveTab] = useState<'CREATE' | 'RECORDS'>('CREATE');

  // ==================== FORM STATES (TAB 1) ====================
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
  const [singleVisitDateTime, setSingleVisitDateTime] = useState('2026-08-18 10:00');
  const [startDateTime, setStartDateTime] = useState('2026-08-18 09:00');
  const [endDateTime, setEndDateTime] = useState('2026-08-18 18:00');
  const [clientTier, setClientTier] = useState<'NORMAL' | 'VIP'>('NORMAL');
  const [purpose, setPurpose] = useState<PurposeCode>('M'); // Default 'M' for Meeting
  const [destination, setDestination] = useState('電視城 1廠 (1st Studio)');
  const [licensePlates, setLicensePlates] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');

  // Validation States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Live preview share states
  const [pcSaveSuccessMsg, setPcSaveSuccessMsg] = useState(false);
  const [pcEmailModalOpen, setPcEmailModalOpen] = useState(false);
  const [pcTargetEmail, setPcTargetEmail] = useState('');
  const [pcEmailSentSuccess, setPcEmailSentSuccess] = useState<string | null>(null);

  // RECORDS STATES (TAB 2)
  const [recordsFilter, setRecordsFilter] = useState<'ALL' | 'PENDING' | 'UPCOMING' | 'CHECKED_IN' | 'CANCELLED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingDetailBooking, setViewingDetailBooking] = useState<Booking | null>(null);
  const [viewingPassBooking, setViewingPassBooking] = useState<Booking | null>(null);

  // Modals for Download & Email actions in Table
  const [downloadSelectorBooking, setDownloadSelectorBooking] = useState<Booking | null>(null);
  const [emailSelectorBooking, setEmailSelectorBooking] = useState<Booking | null>(null);
  const [singleEmailConfirmBooking, setSingleEmailConfirmBooking] = useState<{ booking: Booking; email: string } | null>(null);

  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [emailSuccessToast, setEmailSuccessToast] = useState<string | null>(null);

  // License plate handlers
  const handleAddLicensePlate = () => {
    if (licensePlates.length < 2) {
      setLicensePlates((prev) => [...prev, '']);
    }
  };

  const handleRemoveLicensePlate = (idx: number) => {
    if (licensePlates.length <= 1) return;
    setLicensePlates((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleLicensePlateChange = (idx: number, val: string) => {
    const updated = [...licensePlates];
    updated[idx] = val;
    setLicensePlates(updated);
  };

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

  // Validate PC Form
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (visitorCategory === 'SINGLE') {
      if (!singleName.trim()) {
        newErrors.singleName = '請輸入訪客全名';
      }
    } else if (visitorCategory === 'MULTI' || visitorCategory === 'MULTI_SHARED') {
      multiVisitors.forEach((v, idx) => {
        if (!v.name.trim()) {
          newErrors[`multiName_${idx}`] = `請輸入訪客 #${idx + 1} 姓名`;
        }
      });
    } else if (visitorCategory === 'TEAM') {
      if (!teamLeaderName.trim()) {
        newErrors.teamLeaderName = '請輸入領隊全名';
      }
      if (!teamTotalCount.trim()) {
        newErrors.teamTotalCount = '請填寫訪客總人數';
      } else if (isNaN(Number(teamTotalCount)) || Number(teamTotalCount) <= 0) {
        newErrors.teamTotalCount = '只能填寫大於0的數字';
      }
    }

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

    if (!destination.trim()) {
      newErrors.destination = '請輸入目的地';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

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

    const formattedVisitDateTime =
      visitMode === 'SINGLE_VISIT'
        ? singleVisitDateTime
        : `${startDateTime} 至 ${endDateTime}`;

    const validPlates = licensePlates
      .map((p) => p.trim())
      .filter((p) => p !== '');

    onAddBooking({
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

    triggerSound(880, 'sine', 0.15);
    setSubmitSuccessMsg(`預約登記成功！已為 [${mainVisitorName}] 生成電子通行證。`);

    // Reset Form fields
    setSingleName('');
    setSingleEmail('');
    setMultiVisitors([{ name: '', email: '' }]);
    setTeamLeaderName('');
    setTeamLeaderEmail('');
    setTeamTotalCount('');
    setCompany('');
    setLicensePlates(['']);
    setNotes('');
    setErrors({});

    setTimeout(() => setSubmitSuccessMsg(null), 5000);
  };

  // Helper for rendering visitor type badge label
  const getVisitorTypeLabel = (type?: string) => {
    if (type === 'MULTI_SHARED') return '多人同行';
    if (type === 'MULTI' || type === 'MULTI_INDIVIDUAL') return '多人分行';
    if (type === 'TEAM') return '團隊訪客';
    return '個人訪客';
  };

  // Helper for rendering visit mode label
  const getVisitModeLabel = (mode?: 'SINGLE_VISIT' | 'MULTI_PASS') => {
    if (mode === 'MULTI_PASS') return '🔄 多次通行證 (Multi-Pass)';
    return '🎫 單次到訪 (Single Visit)';
  };

  // Helper to extract visitor list for modal
  const getModalVisitorsList = (b: Booking): Array<{ name: string; email?: string; idNumber?: string }> => {
    if (b.visitors && b.visitors.length > 0) {
      return b.visitors.map(v => ({
        name: v.name,
        email: v.email,
        idNumber: v.idNumber
      }));
    }
    
    // Fallback: parse from visitorIdCard string if present
    if (b.visitorIdCard && b.visitorIdCard.includes('|')) {
      const parts = b.visitorIdCard.split('|').map(s => s.trim());
      return parts.map((part, idx) => {
        const subParts = part.split('(');
        const name = subParts[0].trim() || `訪客 #${idx + 1}`;
        const idNumber = subParts[1] ? subParts[1].replace(')', '').trim() : undefined;
        return { name, idNumber };
      });
    }

    return [{
      name: b.visitorName,
      email: b.contactEmail,
      idNumber: b.visitorIdCard
    }];
  };

  // Filter My Appointments
  const filteredBookings = bookings.filter((b) => {
    // Status filter
    if (recordsFilter === 'PENDING') {
      if (b.status !== BookingStatus.PENDING && !b.isPendingApproval) return false;
    } else if (recordsFilter === 'UPCOMING') {
      if (b.status !== BookingStatus.UPCOMING || b.isPendingApproval) return false;
    } else if (recordsFilter === 'CHECKED_IN') {
      if (b.status !== BookingStatus.CHECKED_IN) return false;
    } else if (recordsFilter === 'CANCELLED') {
      if (b.status !== BookingStatus.CANCELLED && b.status !== BookingStatus.COMPLETED) return false;
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        b.visitorName.toLowerCase().includes(term) ||
        (b.company && b.company.toLowerCase().includes(term)) ||
        b.invitationCode.toLowerCase().includes(term) ||
        (b.hostEmployeeName && b.hostEmployeeName.toLowerCase().includes(term)) ||
        b.id.toLowerCase().includes(term) ||
        (b.destination && b.destination.toLowerCase().includes(term))
      );
    }

    return true;
  });

  return (
    <div className="flex-1 bg-slate-100 dark:bg-slate-950 flex flex-col min-h-0 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
      
      {/* Top PC Portal Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-full border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1">
              <Laptop size={13} />
              <span>TVB PC 員工桌面門戶</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Desktop Visitor Management Portal</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
            <span>PC 版訪客預約登記與我的預約記錄</span>
            <Sparkles size={16} className="text-amber-500 fill-amber-500" />
          </h2>
        </div>

        {/* Tab Switcher: Create vs Records */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('CREATE');
              triggerSound(600, 'sine', 0.08);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'CREATE'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Plus size={15} />
            <span>訪客預約登記</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('RECORDS');
              triggerSound(700, 'sine', 0.08);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'RECORDS'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <FileText size={15} />
            <span>我的預約記錄 ({bookings.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Toast Notification */}
        {submitSuccessMsg && (
          <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg font-bold text-xs flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              <span>{submitSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setSubmitSuccessMsg(null)}
              className="p-1 hover:bg-emerald-600 rounded-lg cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ==================== TAB 1: CREATE VISITOR APPOINTMENT ==================== */}
        {activeTab === 'CREATE' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Form (8 Cols) */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <User className="text-blue-600" size={18} />
                  <span>填寫訪客到訪資料與行程配置</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  請提前完成訪客到訪登記，審核通過後系統將自動生成專屬電子通行證。
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                
                {/* 1. 訪客類型選擇 (Single / Multi / Team) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                    訪客類型 <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setVisitorCategory('SINGLE')}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        visitorCategory === 'SINGLE'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <User size={18} />
                      <span>個人訪客</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisitorCategory('MULTI_SHARED')}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        visitorCategory === 'MULTI_SHARED'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Users size={18} />
                      <span>多人同行</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisitorCategory('MULTI')}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        visitorCategory === 'MULTI'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Users size={18} />
                      <span>多人分行</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisitorCategory('TEAM')}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        visitorCategory === 'TEAM'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Crown size={18} />
                      <span>團隊訪客</span>
                    </button>
                  </div>

                  {/* Polished Helper Tip Banners */}
                  {visitorCategory === 'MULTI_SHARED' && (
                    <div className="mt-3 p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 rounded-2xl flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300 font-medium">
                      <Users size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>適用於多人同時同行到訪，共用一張電子通行證核銷入場。</span>
                    </div>
                  )}

                  {visitorCategory === 'MULTI' && (
                    <div className="mt-3 p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                      <Users size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>適用於多人不同行到訪，每位成員均擁有專屬電子通行證，需要每個人自己拿通行證獨立掃碼入場。</span>
                    </div>
                  )}

                  {visitorCategory === 'TEAM' && (
                    <div className="mt-3 p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/50 rounded-2xl flex items-start gap-2.5 text-xs text-indigo-800 dark:text-indigo-300 font-medium">
                      <Users size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <span>適用於團體同列進出，僅需填寫領隊資訊與一張團體通行證，由領隊統一帶隊核銷入場。</span>
                    </div>
                  )}
                </div>

                {/* 2. 訪客資料對應輸入區 */}
                {visitorCategory === 'SINGLE' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        訪客全名 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={singleName}
                        onChange={(e) => {
                          setSingleName(e.target.value);
                          if (errors.singleName) setErrors((prev) => ({ ...prev, singleName: '' }));
                        }}
                        placeholder="請輸入訪客全名（如：張小明）"
                        className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                          errors.singleName ? 'border-rose-400' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                        }`}
                      />
                      {errors.singleName && <p className="mt-1 text-[10px] text-rose-500 font-bold">{errors.singleName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        訪客電郵 <span className="text-slate-400 font-normal">(選填，填寫後自動發送電子通行證)</span>
                      </label>
                      <input
                        type="email"
                        value={singleEmail}
                        onChange={(e) => setSingleEmail(e.target.value)}
                        placeholder="請輸入訪客電郵（選填，填寫後自動發送電子通行證）"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {(visitorCategory === 'MULTI' || visitorCategory === 'MULTI_SHARED') && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        👥 登記入場訪客名單 ({multiVisitors.length} 人)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddMultiVisitor}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1 shadow-2xs transition-all"
                      >
                        <Plus size={14} />
                        <span>新增同行訪客</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {multiVisitors.map((v, idx) => (
                        <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">訪客全名 *</label>
                              <input
                                type="text"
                                value={v.name}
                                onChange={(e) => handleMultiVisitorChange(idx, 'name', e.target.value)}
                                placeholder={`請輸入訪客 #${idx + 1} 全名`}
                                className={`w-full px-3 py-1.5 text-xs rounded-lg border bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:outline-none ${
                                  errors[`multiName_${idx}`] ? 'border-rose-400' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                                }`}
                              />
                            </div>
                            {(visitorCategory !== 'MULTI_SHARED' || idx === 0) && (
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">電郵 (選填，填寫後自動發送電子通行證)</label>
                                <input
                                  type="email"
                                  value={v.email}
                                  onChange={(e) => handleMultiVisitorChange(idx, 'email', e.target.value)}
                                  placeholder="請輸入電郵（選填，填寫後自動發送電子通行證）"
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            )}
                          </div>
                          {multiVisitors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMultiVisitor(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer shrink-0 mt-4"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {visitorCategory === 'TEAM' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        領隊全名 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={teamLeaderName}
                        onChange={(e) => {
                          setTeamLeaderName(e.target.value);
                          if (errors.teamLeaderName) setErrors((prev) => ({ ...prev, teamLeaderName: '' }));
                        }}
                        placeholder="請輸入團體領隊全名"
                        className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                          errors.teamLeaderName ? 'border-rose-400' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                        }`}
                      />
                      {errors.teamLeaderName && <p className="mt-1 text-[10px] text-rose-500 font-bold">{errors.teamLeaderName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        領隊電郵 <span className="text-slate-400 font-normal">(選填，填寫後自動發送電子通行證)</span>
                      </label>
                      <input
                        type="email"
                        value={teamLeaderEmail}
                        onChange={(e) => setTeamLeaderEmail(e.target.value)}
                        placeholder="請輸入領隊電郵（選填，填寫後自動發送電子通行證）"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        團隊總人數 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={teamTotalCount}
                        onChange={(e) => {
                          setTeamTotalCount(e.target.value.replace(/[^0-9]/g, ''));
                          if (errors.teamTotalCount) setErrors((prev) => ({ ...prev, teamTotalCount: '' }));
                        }}
                        placeholder="例如: 15"
                        className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-900 dark:text-slate-100 focus:outline-none ${
                          errors.teamTotalCount ? 'border-rose-400' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                        }`}
                      />
                      {errors.teamTotalCount && <p className="mt-1 text-[10px] text-rose-500 font-bold">{errors.teamTotalCount}</p>}
                    </div>
                  </div>
                )}

                {/* 3. 公司名稱與客戶等級 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      公司 / 單位名稱
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="請輸入公司名稱（未填即標示為個人代表）"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      客戶等級
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setClientTier('NORMAL')}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                          clientTier === 'NORMAL'
                            ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        普通客戶
                      </button>

                      <button
                        type="button"
                        onClick={() => setClientTier('VIP')}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs cursor-pointer flex items-center justify-center gap-1 transition-all ${
                          clientTier === 'VIP'
                            ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        <Crown size={14} />
                        <span>👑 VIP 貴賓</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. 到訪模式與到訪時間 */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        到訪模式
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setVisitMode('SINGLE_VISIT')}
                          className={`py-2 px-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            visitMode === 'SINGLE_VISIT'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          單次到訪
                        </button>
                        <button
                          type="button"
                          onClick={() => setVisitMode('MULTI_PASS')}
                          className={`py-2 px-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            visitMode === 'MULTI_PASS'
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          多次通行證
                        </button>
                      </div>
                    </div>

                    <div>
                      {visitMode === 'SINGLE_VISIT' ? (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            到訪日期與時間 <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={singleVisitDateTime}
                            onChange={(e) => setSingleVisitDateTime(e.target.value)}
                            placeholder="YYYY-MM-DD HH:MM"
                            className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">開始時間</label>
                            <input
                              type="text"
                              value={startDateTime}
                              onChange={(e) => setStartDateTime(e.target.value)}
                              className="w-full px-2.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">結束時間</label>
                            <input
                              type="text"
                              value={endDateTime}
                              onChange={(e) => setEndDateTime(e.target.value)}
                              className="w-full px-2.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. 到訪性質與目的地 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      到訪性質 <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value as PurposeCode)}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {PURPOSE_OPTIONS.map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          [{opt.code}] {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      目的地 (Destination) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="例如: 電視城 1廠 / 主樓 3樓"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* 6. 車牌與備註 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 車牌號碼 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Car size={14} className="text-slate-400" />
                        <span>車牌號碼 <span className="text-slate-400 font-normal">(選填)</span></span>
                      </label>
                      {licensePlates.length < 2 && (
                        <button
                          type="button"
                          onClick={handleAddLicensePlate}
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
                            onChange={(e) => handleLicensePlateChange(idx, e.target.value)}
                            placeholder={`請輸入車牌號碼${licensePlates.length > 1 ? ` (${idx + 1})` : ''}`}
                            className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-all"
                          />
                          {licensePlates.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLicensePlate(idx)}
                              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer shrink-0 transition-colors"
                              title="刪除車牌"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      特殊備註 (選填)
                    </label>
                    <textarea
                      rows={licensePlates.length > 1 ? 3 : 2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="填寫特殊事宜或器材說明"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-550 hover:to-indigo-550 text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    <span>提交預約並生成電子通行證</span>
                  </button>
                </div>

              </form>
            </div>

            {/* Right Side: Live Invitation Preview Card (4 Cols) */}
            <div className="lg:col-span-4 space-y-4 sticky top-6">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <QrCode size={16} className="text-blue-600" />
                    <span>電子通行證 即時預覽</span>
                  </h4>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                    LIVE PREVIEW
                  </span>
                </div>

                {/* 訪客通行證 卡片 (完全對齊 APP InvitationCard 樣式與欄位) */}
                <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200/90 dark:border-slate-800 overflow-hidden">
                  
                  {/* Card Header: 訪客通行證 */}
                  <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-3.5 text-center relative">
                    <h2 className="text-sm font-black tracking-wide">訪客通行證</h2>
                    <p className="text-[9px] text-blue-100 font-medium mt-0.5">TVB Electronic Visitor Pass</p>
                    {clientTier === 'VIP' && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-md shadow-xs flex items-center gap-1">
                        <Crown size={10} className="fill-white" />
                        <span>VIP</span>
                      </span>
                    )}
                  </div>

                  {/* PASS ID & 狀態 Active */}
                  <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900/60 border-b border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                      PASS ID: TVB-888888
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      狀態 Active
                    </span>
                  </div>

                  {/* QR Code Section */}
                  <div className="p-4 flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-center border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner mb-2">
                      <div className="w-28 h-28 flex items-center justify-center bg-white p-2 rounded-xl relative">
                        <QrCode size={96} className="text-slate-950" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-slate-950 flex items-center justify-center border-2 border-white shadow-xs">
                          <span className="text-[7px] font-black tracking-wider text-white">TVB</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      到訪時請將此條碼出示於閘口或前台保安終端，進行核銷即可通行。
                    </p>
                  </div>

                  {/* Details Section */}
                  <div className="p-3.5 space-y-3 bg-white dark:bg-slate-950 text-xs">
                    
                    {/* 訪客列表 (個人訪客 / 多人訪客 / 團隊訪客) */}
                    <div className="bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 text-xs">
                        <span className="text-blue-600 dark:text-blue-400 font-black">
                          {visitorCategory === 'TEAM' ? '團隊訪客' : visitorCategory === 'MULTI' ? '多人訪客' : '個人訪客'}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                          共{visitorCategory === 'SINGLE' ? 1 : visitorCategory === 'MULTI' ? multiVisitors.length : (Number(teamTotalCount) || 1)}人
                        </span>
                      </div>

                      <div className="pt-1 border-t border-slate-200/60 dark:border-slate-800 space-y-1">
                        {visitorCategory === 'TEAM' ? (
                          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            1. {teamLeaderName || '團隊領隊'} <span className="text-[9px] font-normal text-slate-400">(領隊代表)</span>
                          </div>
                        ) : visitorCategory === 'MULTI' ? (
                          multiVisitors.map((v, idx) => (
                            <div key={idx} className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                              <span>{idx + 1}. {v.name || `訪客 #${idx + 1}`}</span>
                              {v.email && (
                                <span className="text-[9px] font-normal text-slate-400 font-mono truncate max-w-[120px]">{v.email}</span>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                            <span>1. {singleName || '張小明'}</span>
                            {singleEmail && (
                              <span className="text-[9px] font-normal text-slate-400 font-mono truncate max-w-[120px]">{singleEmail}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detailed Key-Value Rows (與 APP InvitationCard 欄位完全對齊) */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80 space-y-2 text-[11px]">
                      
                      {/* 到訪性質 */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-bold text-slate-500 dark:text-slate-400">到訪性質</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPurposeOption(purpose).color} ${getPurposeOption(purpose).bgColor}`}>
                          {getPurposeOption(purpose).label}
                        </span>
                      </div>

                      {/* 預約到訪時間 */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-bold text-slate-500 dark:text-slate-400">預約到訪時間</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[10px]">
                          {visitMode === 'SINGLE_VISIT' ? singleVisitDateTime : `${startDateTime}`}
                        </span>
                      </div>

                      {/* 到訪模式 */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-bold text-slate-500 dark:text-slate-400">到訪模式</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                          {visitMode === 'MULTI_PASS' ? '有效期內多次訪問' : '單次訪問'}
                        </span>
                      </div>

                      {/* 目的地 */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-bold text-slate-500 dark:text-slate-400">目的地</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-right truncate max-w-[160px]">
                          {destination}
                        </span>
                      </div>

                      {/* 公司名稱 */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-bold text-slate-500 dark:text-slate-400">公司名稱</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-right truncate max-w-[160px]">
                          {company.trim() || '無'}
                        </span>
                      </div>

                      {/* 車牌號碼 */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-bold text-slate-500 dark:text-slate-400">車牌號碼</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {licensePlates.filter(p => p.trim()).join(', ') || '未預約泊車'}
                        </span>
                      </div>

                      {/* 備註 */}
                      <div className="flex items-start justify-between pt-2 gap-2">
                        <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0">備註</span>
                        <span className="text-slate-700 dark:text-slate-300 text-right leading-relaxed truncate max-w-[160px]">
                          {notes.trim() || '無'}
                        </span>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Preview Share Buttons: 保存通行證圖片 & 發送電郵 */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPcSaveSuccessMsg(true);
                      setTimeout(() => setPcSaveSuccessMsg(false), 3500);
                    }}
                    className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <Download size={14} />
                    <span>保存通行證圖片</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPcTargetEmail(visitorCategory === 'SINGLE' ? singleEmail : visitorCategory === 'MULTI' ? (multiVisitors[0]?.email || '') : teamLeaderEmail);
                      setPcEmailModalOpen(true);
                    }}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <Mail size={14} />
                    <span>發送電郵</span>
                  </button>
                </div>

                {/* Feedback Toasts */}
                {pcSaveSuccessMsg && (
                  <div className="p-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md animate-bounce">
                    <CheckCircle2 size={15} />
                    <span>已成功保存電子通行證圖片！</span>
                  </div>
                )}

                {pcEmailSentSuccess && (
                  <div className="p-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md animate-bounce">
                    <CheckCircle2 size={15} />
                    <span>已發送電子通行證至 {pcEmailSentSuccess}！</span>
                  </div>
                )}

                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  提交預約後，系統將直接在列表中生成完整預約記錄，並可立即發送或匯出電子通行證。
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 2: MY APPOINTMENTS RECORDS ==================== */}
        {activeTab === 'RECORDS' && (
          <div className="space-y-6">
            
            {/* Feedback Toasts for Records actions */}
            {downloadSuccessToast && (
              <div className="p-3 bg-indigo-600 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg animate-bounce">
                <CheckCircle2 size={16} />
                <span>{downloadSuccessToast}</span>
              </div>
            )}

            {emailSuccessToast && (
              <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg animate-bounce">
                <CheckCircle2 size={16} />
                <span>{emailSuccessToast}</span>
              </div>
            )}

            {/* Master Table Header Controls & Filters */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileText className="text-blue-600" size={18} />
                    <span>訪客預約記錄看板</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">點擊「詳情」查看訪客細節，下載或點擊「發送電郵」發送電子通行證</p>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs gap-1 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setRecordsFilter('ALL')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all whitespace-nowrap ${
                      recordsFilter === 'ALL' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    全部 ({bookings.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecordsFilter('PENDING')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all whitespace-nowrap ${
                      recordsFilter === 'PENDING' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    待審核 ({bookings.filter(b => b.status === BookingStatus.PENDING || b.isPendingApproval).length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecordsFilter('UPCOMING')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all whitespace-nowrap ${
                      recordsFilter === 'UPCOMING' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    待到訪 ({bookings.filter(b => b.status === BookingStatus.UPCOMING && !b.isPendingApproval).length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecordsFilter('CHECKED_IN')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all whitespace-nowrap ${
                      recordsFilter === 'CHECKED_IN' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    進行中 ({bookings.filter(b => b.status === BookingStatus.CHECKED_IN).length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecordsFilter('CANCELLED')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all whitespace-nowrap ${
                      recordsFilter === 'CANCELLED' ? 'bg-white dark:bg-slate-900 text-slate-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    歷史/已取消 ({bookings.filter(b => b.status === BookingStatus.CANCELLED || b.status === BookingStatus.COMPLETED).length})
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜尋訪客姓名、公司、邀請碼、對接員工、目的地..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              </div>

              {/* Desktop Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="p-3.5 whitespace-nowrap">預約 ID</th>
                      <th className="p-3.5 text-center whitespace-nowrap">訪客類型</th>
                      <th className="p-3.5 whitespace-nowrap">訪客姓名</th>
                      <th className="p-3.5 text-center whitespace-nowrap">客戶等級</th>
                      <th className="p-3.5 whitespace-nowrap">公司名稱</th>
                      <th className="p-3.5 text-center whitespace-nowrap">到訪模式</th>
                      <th className="p-3.5 whitespace-nowrap">到訪日期與時間</th>
                      <th className="p-3.5 whitespace-nowrap">目的地</th>
                      <th className="p-3.5 whitespace-nowrap">車牌號碼</th>
                      <th className="p-3.5 text-center whitespace-nowrap">到訪性質</th>
                      <th className="p-3.5 whitespace-nowrap">登記證件號碼</th>
                      <th className="p-3.5 text-center whitespace-nowrap">到訪狀態</th>
                      <th className="p-3.5 text-center whitespace-nowrap">管理操作</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                          
                          {/* 1. 預約 ID */}
                          <td className="p-3.5 font-mono font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            #{b.id}
                          </td>

                          {/* 2. 訪客類型 */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <span className="inline-flex px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 text-[10px] font-bold rounded-md">
                              {getVisitorTypeLabel(b.visitorType)}
                            </span>
                          </td>

                          {/* 3. 訪客姓名 */}
                          <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>{b.visitorName}</span>
                              <span className="text-[10px] text-blue-500 font-mono">({b.invitationCode})</span>
                            </div>
                          </td>

                          {/* 4. 客戶等級 */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            {b.clientTier === 'VIP' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800 text-[10.5px] font-bold rounded-md">
                                👑 VIP客戶
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10.5px] font-semibold rounded-md border border-slate-200 dark:border-slate-700">
                                普通客戶
                              </span>
                            )}
                          </td>

                          {/* 5. 公司名稱 */}
                          <td className="p-3.5 text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">
                            {b.company || <span className="text-slate-400 italic">個人代表</span>}
                          </td>

                          {/* 6. 到訪模式 */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <span className="inline-flex px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-md border border-purple-200/50">
                              {getVisitModeLabel(b.visitMode)}
                            </span>
                          </td>

                          {/* 7. 到訪日期與時間 */}
                          <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            {b.visitDateTime}
                          </td>

                          {/* 8. 目的地 */}
                          <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {b.destination || '電視城主樓'}
                          </td>

                          {/* 9. 車牌號碼 */}
                          <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {b.licensePlate || <span className="text-slate-400 font-sans italic">無</span>}
                          </td>

                          {/* 10. 到訪性質 */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 text-[10.5px] font-bold rounded-lg ${getPurposeOption(b.purpose).bgColor} ${getPurposeOption(b.purpose).color}`}>
                              {getPurposeOption(b.purpose).label}
                            </span>
                          </td>

                          {/* 11. 登記證件號碼 */}
                          <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            {b.visitorIdCard || <span className="text-slate-400 font-sans italic">未核銷錄入</span>}
                          </td>

                          {/* 12. 到訪狀態 */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            {b.status === BookingStatus.CHECKED_IN || b.status === BookingStatus.COMPLETED ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-full border border-blue-300 dark:border-blue-800 whitespace-nowrap">
                                🟢 進行中
                              </span>
                            ) : b.status === BookingStatus.CANCELLED ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-black text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-700 whitespace-nowrap">
                                🚫 已取消
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-black text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 rounded-full border border-cyan-300 dark:border-cyan-800 whitespace-nowrap">
                                📅 待到訪
                              </span>
                            )}
                          </td>

                          {/* 13. 管理操作 */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* 1. 詳情 */}
                              <button
                                type="button"
                                onClick={() => setViewingDetailBooking(b)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 transition-all shrink-0"
                              >
                                <Eye size={13} />
                                <span>詳情</span>
                              </button>

                              {/* 2. 下載電子通行證 */}
                              <button
                                type="button"
                                onClick={() => {
                                  const isMultiIndiv = b.visitorType === 'MULTI' || b.visitorType === 'MULTI_INDIVIDUAL';
                                  if (isMultiIndiv) {
                                    setDownloadSelectorBooking(b);
                                  } else {
                                    const msg = `已成功下載【${b.visitorName}】之電子通行證圖片！`;
                                    setDownloadSuccessToast(msg);
                                    setTimeout(() => setDownloadSuccessToast(null), 3500);
                                  }
                                }}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 transition-all shrink-0"
                                title="下載電子通行證圖片"
                              >
                                <Download size={13} />
                                <span>下載電子通行證</span>
                              </button>

                              {/* 3. 發送電郵 */}
                              <button
                                type="button"
                                onClick={() => {
                                  const isMultiIndiv = b.visitorType === 'MULTI' || b.visitorType === 'MULTI_INDIVIDUAL';
                                  if (isMultiIndiv) {
                                    setEmailSelectorBooking(b);
                                  } else {
                                    const targetEmail = b.contactEmail || b.visitors?.[0]?.email || 'visitor@example.com';
                                    setSingleEmailConfirmBooking({ booking: b, email: targetEmail });
                                  }
                                }}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 transition-all shrink-0"
                                title="發送電子通行證至電郵"
                              >
                                <Mail size={13} />
                                <span>發送電郵</span>
                              </button>

                              {b.status === BookingStatus.UPCOMING && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`確定要取消訪客 ${b.visitorName} 的這筆預約嗎？`)) {
                                      onCancelBooking(b.id);
                                    }
                                  }}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40 text-xs font-bold rounded-xl cursor-pointer transition-all shrink-0"
                                >
                                  取消
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={13} className="p-8 text-center text-slate-400 font-bold">
                          暫無符合條件之訪客預約記錄
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* ==================== DETAIL MODAL ==================== */}
      {viewingDetailBooking && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-md">
                  {viewingDetailBooking.visitorName.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                      {viewingDetailBooking.invitationCode}
                    </span>
                    {viewingDetailBooking.clientTier === 'VIP' && (
                      <span className="px-2 py-0.5 bg-amber-500 text-white font-black text-[10px] rounded shadow-2xs">
                        👑 VIP 貴賓
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
                    {viewingDetailBooking.visitorName}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingDetailBooking(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Section 1: Registered Visitors List */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-slate-400 block text-[10px] mb-2 font-bold uppercase tracking-wider">
                  👥 已登記訪客名單 ({getModalVisitorsList(viewingDetailBooking).length} 人)
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {getModalVisitorsList(viewingDetailBooking).map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-slate-900 dark:text-slate-100 font-bold">{v.name}</span>
                        {v.idNumber ? (
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 font-mono text-[10.5px] font-bold rounded-md">
                            登記證件號碼: {v.idNumber}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono text-[10.5px] rounded-md">
                            登記證件號碼: 未登記
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] font-normal text-slate-500">
                        {v.email || viewingDetailBooking.contactEmail || '未提供電郵'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Core Booking Details Grid */}
              <div className="space-y-2">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  📋 訪客預約登記詳情
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">預約 ID</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono font-bold block">
                      #{viewingDetailBooking.id}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">訪客類型 / 到訪模式</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      {getVisitorTypeLabel(viewingDetailBooking.visitorType)} / {getVisitModeLabel(viewingDetailBooking.visitMode)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">公司名稱</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold block">
                      {viewingDetailBooking.company || '個人代表'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">到訪日期與時間</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono font-bold block">
                      {viewingDetailBooking.visitDateTime}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">到訪性質</span>
                    <span className={`inline-block px-2 py-0.5 text-[10.5px] font-bold rounded ${getPurposeOption(viewingDetailBooking.purpose).bgColor} ${getPurposeOption(viewingDetailBooking.purpose).color}`}>
                      {getPurposeOption(viewingDetailBooking.purpose).label}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">車牌號碼</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono font-bold block">
                      {viewingDetailBooking.licensePlate || '無車牌登記'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Section 3: Host Employee Info */}
              <div className="space-y-2">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  🏢 對接員工與目的地資訊
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">對接員工</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold block text-xs">
                      {viewingDetailBooking.hostEmployeeName || '陳大文'} ({viewingDetailBooking.hostEmployeeDept || '行政部'})
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">目的地 (Destination)</span>
                    <strong className="text-blue-600 dark:text-blue-400 font-bold block">
                      📍 {viewingDetailBooking.destination || '電視城主樓'}
                    </strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewingDetailBooking(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                關閉
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewingPassBooking(viewingDetailBooking);
                  setViewingDetailBooking(null);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-550 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-1.5 transition-all"
              >
                <QrCode size={14} />
                <span>檢視電子通行證</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================== PASS PREVIEW MODAL ==================== */}
      {viewingPassBooking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            
            <button
              type="button"
              onClick={() => setViewingPassBooking(null)}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-10"
            >
              <X size={20} />
            </button>

            <div className="p-4 overflow-y-auto">
              <InvitationCard
                booking={viewingPassBooking}
                onBack={() => setViewingPassBooking(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* PC Live Preview Email Modal */}
      {pcEmailModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-slate-100">發送電子通行證至電郵</h3>
                  <p className="text-[10px] text-slate-400">系統將發送帶有 QR Code 的通行證至目標信箱</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPcEmailModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!pcTargetEmail.trim()) return;
              const addr = pcTargetEmail.trim();
              setPcEmailModalOpen(false);
              setPcEmailSentSuccess(addr);
              setTimeout(() => setPcEmailSentSuccess(null), 4000);
            }} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  接收電子郵件地址 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={pcTargetEmail}
                  onChange={(e) => setPcTargetEmail(e.target.value)}
                  placeholder="請輸入訪客電郵地址"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPcEmailModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Send size={14} />
                  <span>確認發送</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. 多人分行 - 下載選擇彈窗 */}
      {downloadSelectorBooking && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600">
                  <Download size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-slate-100">下載電子通行證 - 多人分行成員選擇</h3>
                  <p className="text-[10px] text-slate-400">請選擇個別成員下載或一鍵下載全部</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDownloadSelectorBooking(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {getModalVisitorsList(downloadSelectorBooking).map((v, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 text-[10px] font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>{v.name}</span>
                    </div>
                    {v.email && <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{v.email}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const msg = `已成功下載【${v.name}】之專屬電子通行證圖片！`;
                      setDownloadSuccessToast(msg);
                      setTimeout(() => setDownloadSuccessToast(null), 3500);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1 shadow-xs transition-all"
                  >
                    <Download size={12} />
                    <span>下載通行證</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const count = getModalVisitorsList(downloadSelectorBooking).length;
                  const msg = `已成功下載全部 ${count} 位成員之專屬電子通行證圖片！`;
                  setDownloadSelectorBooking(null);
                  setDownloadSuccessToast(msg);
                  setTimeout(() => setDownloadSuccessToast(null), 3500);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-550 hover:to-blue-550 text-white font-black rounded-xl text-xs cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Download size={14} />
                <span>下載全部通行證圖片</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. 單人/多人同行/團隊訪客 - 發送電郵二次確認彈窗 */}
      {singleEmailConfirmBooking && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-slate-100">發送電子通行證 - 二次確認</h3>
                  <p className="text-[10px] text-slate-400">請確認接收電子郵件地址後發送</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSingleEmailConfirmBooking(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  接收電郵信箱 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={singleEmailConfirmBooking.email}
                  onChange={(e) => setSingleEmailConfirmBooking({ ...singleEmailConfirmBooking, email: e.target.value })}
                  placeholder="請輸入訪客電子郵件"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/50 text-[11px] text-emerald-800 dark:text-emerald-300">
                系統將發送標題為【TVB 訪客電子通行證】之憑證郵件至以上地址。
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSingleEmailConfirmBooking(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = singleEmailConfirmBooking.email.trim();
                    if (!target) return;
                    setSingleEmailConfirmBooking(null);
                    setEmailSuccessToast(`已成功將電子通行證發送至 ${target}！`);
                    setTimeout(() => setEmailSuccessToast(null), 3500);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Send size={14} />
                  <span>確認發送</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 多人分行 - 發送電郵成員選擇彈窗 */}
      {emailSelectorBooking && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-slate-100">發送電子通行證 - 多人分行成員選擇</h3>
                  <p className="text-[10px] text-slate-400">請選擇對應成員發送或一鍵全部發送</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailSelectorBooking(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {getModalVisitorsList(emailSelectorBooking).map((v, idx) => {
                const targetEmail = v.email || emailSelectorBooking.contactEmail || 'visitor@example.com';
                return (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[10px] font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span>{v.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{targetEmail}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `已成功將專屬電子通行證發送至【${v.name}】(${targetEmail})！`;
                        setEmailSuccessToast(msg);
                        setTimeout(() => setEmailSuccessToast(null), 3500);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-550 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1 shadow-xs transition-all"
                    >
                      <Mail size={12} />
                      <span>發送電郵</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const count = getModalVisitorsList(emailSelectorBooking).length;
                  const msg = `已成功將專屬電子通行證發送至全體 ${count} 位成員信箱！`;
                  setEmailSelectorBooking(null);
                  setEmailSuccessToast(msg);
                  setTimeout(() => setEmailSuccessToast(null), 3500);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-550 hover:to-teal-550 text-white font-black rounded-xl text-xs cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Send size={14} />
                <span>全部發送電郵</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
