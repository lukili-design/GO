/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { getPurposeOption, getVisitorTypeLabel } from '../data/mockData';
import { ArrowLeft, Search, Calendar, Share2, Clock, CheckCircle, XCircle, Repeat, Ticket, Crown, HelpCircle, BookOpen, X, Users, User, ShieldCheck } from 'lucide-react';

interface BookingRecordsProps {
  bookings: Booking[];
  onBack: () => void;
  onCancelBooking: (id: string) => void;
  onSimulateCheckIn: (id: string) => void;
  onSimulateCheckOut: (id: string) => void;
  onViewPass: (booking: Booking) => void;
  onRebook: (booking: Booking) => void;
}

export const BookingRecords: React.FC<BookingRecordsProps> = ({
  bookings,
  onBack,
  onCancelBooking,
  onViewPass,
}) => {
  // Rules modal state
  const [showRulesModal, setShowRulesModal] = useState(false);
  // Check if booking approval is required globally
  const isApprovalRequired = typeof window !== 'undefined'
    ? localStorage.getItem('tvb_booking_approval_required') === 'true'
    : true;

  // Tabs: 'PENDING' | 'UPCOMING' | 'CHECKED_IN' | 'HISTORY'
  const [activeTab, setActiveTab] = useState<'PENDING' | 'UPCOMING' | 'CHECKED_IN' | 'HISTORY'>(
    isApprovalRequired ? 'PENDING' : 'UPCOMING'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Ensure activeTab is not PENDING if approval is turned off
  React.useEffect(() => {
    if (!isApprovalRequired && activeTab === 'PENDING') {
      setActiveTab('UPCOMING');
    }
  }, [isApprovalRequired, activeTab]);

  // Count helper
  const pendingBookings = bookings.filter(b => b.status === BookingStatus.PENDING);
  const upcomingBookings = bookings.filter(b => b.status === BookingStatus.UPCOMING);
  const checkedInBookings = bookings.filter(b => b.status === BookingStatus.CHECKED_IN);
  const historyBookings = bookings.filter(
    b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED
  );

  // Filter records based on active tab & search query
  const getFilteredBookings = () => {
    let list: Booking[] = [];
    if (activeTab === 'PENDING') list = pendingBookings;
    else if (activeTab === 'UPCOMING') list = upcomingBookings;
    else if (activeTab === 'CHECKED_IN') list = checkedInBookings;
    else list = historyBookings;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        b =>
          b.visitorName.toLowerCase().includes(q) ||
          (b.company && b.company.toLowerCase().includes(q)) ||
          (b.licensePlate && b.licensePlate.toLowerCase().includes(q)) ||
          b.destination.toLowerCase().includes(q) ||
          b.invitationCode.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filtered = getFilteredBookings();

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Records Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 shadow-xs px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            type="button"
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-950 dark:text-slate-50">📋 我的預約 / 紀錄</h1>
            <p className="text-[10px] text-slate-400 font-medium">預約管理與紀錄追蹤</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowRulesModal(true)}
          className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 text-[11px] font-bold flex items-center gap-1 hover:bg-blue-100 cursor-pointer transition-all shrink-0"
        >
          <BookOpen size={13} />
          <span>頁面規則說明</span>
        </button>
      </div>

      {/* Tabs list with counts (動態渲染: 待審核僅於啟用時顯示) */}
      <div className={`bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 p-2 grid ${
        isApprovalRequired ? 'grid-cols-4' : 'grid-cols-3'
      } gap-1`}>
        {isApprovalRequired && (
          <button
            onClick={() => setActiveTab('PENDING')}
            type="button"
            className={`py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'PENDING'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 shadow-2xs'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <span>待審核</span>
            <span className="text-[10px] bg-amber-400/15 text-amber-700 dark:text-amber-400 px-1.5 py-0.2 rounded-full font-bold">
              {pendingBookings.length}
            </span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('UPCOMING')}
          type="button"
          className={`py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'UPCOMING'
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 shadow-2xs'
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <span>待到訪</span>
          <span className="text-[10px] bg-blue-400/15 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded-full font-bold">
            {upcomingBookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('CHECKED_IN')}
          type="button"
          className={`py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'CHECKED_IN'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 shadow-2xs'
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <span>進行中</span>
          <span className="text-[10px] bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">
            {checkedInBookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          type="button"
          className={`py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'HISTORY'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs'
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <span>歷史/已取消</span>
          <span className="text-[10px] bg-slate-400/15 text-slate-500 px-1.5 py-0.2 rounded-full font-bold">
            {historyBookings.length}
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋姓名、公司、車牌或目的地..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-[10px]"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* Bookings List Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 pb-24">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
              <Search size={20} />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">沒有相符的預約紀錄</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">目前分頁尚無登記數據</p>
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer"
            >
              + 提交預約
            </button>
          </div>
        ) : (
          filtered.map((b) => {
            const purposeOpt = getPurposeOption(b.purpose);

            // Total count calculation
            const isTeam = b.visitorType === 'TEAM';
            const isMultiShared = b.visitorType === 'MULTI_SHARED';
            const isMultiIndiv = b.visitorType === 'MULTI' || b.visitorType === 'MULTI_INDIVIDUAL';
            const totalCount = b.totalVisitorsCount || (b.visitors ? b.visitors.length : 1);

            return (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {/* 1. Header Line: 到訪類型 (個人訪客 / 多人同行 / 多人分行 / 團隊訪客) + Purpose Badge */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/60 dark:bg-slate-900/60">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 font-black rounded-full border ${
                        isTeam
                          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                          : isMultiIndiv
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          : isMultiShared
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                          : 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                      }`}
                    >
                      {getVisitorTypeLabel(b.visitorType)}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 font-black rounded-md border shrink-0 ${purposeOpt.color} ${purposeOpt.bgColor}`}>
                    {purposeOpt.label}
                  </span>
                </div>

                {/* 2. Sub-Header: Company Name (if available) */}
                {b.company && (
                  <div className="px-3.5 pt-3 pb-0 text-xs font-black text-slate-900 dark:text-slate-100">
                    {b.company}
                  </div>
                )}

                {/* 3. Card Body Content */}
                <div className="p-3.5 text-xs space-y-3 text-slate-700 dark:text-slate-300">
                  
                  {/* 到訪時間區塊: 與訪客信息 UI 一致，藍色字體標識 */}
                  <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 text-xs">
                      <span className="text-blue-600 dark:text-blue-400 font-black">
                        到訪時間
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {b.visitMode === 'MULTI_PASS' ? '有效期內多次訪問' : '單次訪問'}
                      </span>
                    </div>

                    <div className="pt-1 border-t border-slate-200/60 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-slate-100 text-xs tracking-tight">
                      {b.visitDateTime}
                    </div>
                  </div>

                  {/* 訪客信息區塊: 與到訪時間 UI 一致 */}
                  <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                    {/* Header directly above name: 訪客信息 + VIP 標識  +  共N人 */}
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-black">
                          訪客信息
                        </span>
                        {b.clientTier === 'VIP' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 dark:bg-amber-500 text-white text-[10px] font-black rounded-md shadow-xs border border-amber-400 dark:border-amber-400 tracking-wider">
                            <Crown size={11} className="fill-white stroke-[2.5]" />
                            <span>VIP</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                        共{totalCount}人
                      </span>
                    </div>

                    {/* Roster Items */}
                    {isTeam ? (
                      /* Team Visitor: Display 1 Leader */
                      <div className="space-y-0.5 text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {b.visitorName}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          電郵：{b.contactEmail || '未填寫'}
                        </div>
                      </div>
                    ) : (isMultiShared || isMultiIndiv) && b.visitors && b.visitors.length > 0 ? (
                      /* Multi Visitors: Display visitors list */
                      <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        {b.visitors.map((v, idx) => (
                          <div key={idx} className="space-y-0.5 text-xs">
                            <div className="font-bold text-slate-900 dark:text-slate-100">
                              {v.name}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                              電郵：{v.email || '未填寫'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Single Visitor: Display 1 Person */
                      <div className="space-y-0.5 text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {b.visitorName}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          電郵：{b.contactEmail || (b.visitors && b.visitors[0]?.email) || '未填寫'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Field Items: 目的地, 車牌號碼, 備註說明 */}
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">目的地: </span>
                      <span className="text-slate-700 dark:text-slate-300">{b.destination}</span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">車牌號碼：</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono">
                        {b.licensePlate || ''}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">備註說明：</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {b.notes || ''}
                      </span>
                    </div>

                    <div className="pt-1 text-[11px] text-slate-400 font-mono">
                      <span>邀請碼編號：</span>
                      <span className="font-bold text-slate-600 dark:text-slate-400">{b.invitationCode}</span>
                    </div>
                  </div>

                </div>

                {/* 4. Footer & Action Buttons Logic:
                    - 待審核 / 待到訪: 顯示「分享預約」與「取消預約」
                    - 進行中 / 歷史/已取消: 沒有分享和取消操作
                */}
                <div className="p-3 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {/* Left Status Tag */}
                  <div>
                    {b.status === BookingStatus.PENDING && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800/50">
                        <Clock size={12} />
                        <span>待審核</span>
                      </span>
                    )}
                    {b.status === BookingStatus.UPCOMING && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-800/50">
                        <Clock size={12} />
                        <span>待到訪</span>
                      </span>
                    )}
                    {b.status === BookingStatus.CHECKED_IN && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800/50">
                        <CheckCircle size={12} />
                        <span>進行中</span>
                      </span>
                    )}
                    {b.status === BookingStatus.COMPLETED && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                        <CheckCircle size={12} />
                        <span>歷史</span>
                      </span>
                    )}
                    {b.status === BookingStatus.CANCELLED && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200 dark:border-rose-900/50">
                        <XCircle size={12} />
                        <span>已取消</span>
                      </span>
                    )}
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-2">
                    {b.status === BookingStatus.UPCOMING && (
                      <button
                        type="button"
                        onClick={() => onViewPass(b)}
                        className="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-xl transition-all cursor-pointer border border-blue-200/60 dark:border-blue-800/60 inline-flex items-center gap-1"
                      >
                        <Ticket size={13} />
                        <span>查看通行證</span>
                      </button>
                    )}
                    {(b.status === BookingStatus.PENDING || b.status === BookingStatus.UPCOMING) && (
                      <button
                        type="button"
                        onClick={() => onCancelBooking(b.id)}
                        className="px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl transition-all cursor-pointer border border-rose-200/60 dark:border-rose-800/60"
                      >
                        取消預約
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 需求與頁面規則說明 Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 relative animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">「我的預約」需求與頁面規則說明</h3>
                  <p className="text-[10px] text-slate-400">流程規範與 4 種訪客類型完整定義</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-slate-700 dark:text-slate-300">
              
              {/* Section 1: 我的預約頁面 Tab 與狀態流程規則 */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <ShieldCheck size={14} />
                  <span>一、「我的預約」Tab 與頁面狀態流程規則</span>
                </h4>
                <div className="space-y-2 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-[11px] leading-relaxed">
                  <p><strong className="text-amber-600 dark:text-amber-400">1. 待審核 Tab：</strong> 提交預約後等待內部員工/主管審核。在此狀態下可隨時「取消預約」。</p>
                  <p><strong className="text-blue-600 dark:text-blue-400">2. 待到訪 Tab：</strong> 審核通過或免審核生效之預約。<strong>僅此 Tab 具備「🎫 查看通行證」按鈕</strong>，可供下載、分享或發送電郵。</p>
                  <p><strong className="text-emerald-600 dark:text-emerald-400">3. 進行中 Tab：</strong> 訪客已於現場閘口/安保終端掃碼核銷入場，正在廠區內訪問中。</p>
                  <p><strong className="text-slate-500">4. 歷史 Tab：</strong> 訪客已簽退離場（Completed）或已取消（Cancelled）之歷史紀錄。</p>
                </div>
              </div>

              {/* Section 2: 系統 4 種訪客類型完整定義與區別 (放在規則說明下方) */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Users size={14} />
                  <span>二、系統 4 種訪客類型完整定義與區別</span>
                </h4>
                
                <div className="space-y-2.5 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  
                  {/* 個人訪客 */}
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1">
                      <div className="font-black text-sky-700 dark:text-sky-300 flex items-center gap-1 text-xs">
                        <User size={13} />
                        <span>1. 個人訪客</span>
                      </div>
                      <span className="text-[10px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full">
                        1 人單獨到訪
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug pt-0.5">
                      <strong className="text-slate-400 font-normal">通行證與核銷機制：</strong>
                      生成 1 張 個人專屬通行證。
                    </p>
                  </div>

                  {/* 多人同行 */}
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1">
                      <div className="font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-1 text-xs">
                        <Users size={13} />
                        <span>2. 多人同行</span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                        多人同時同行到訪
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug pt-0.5">
                      <strong className="text-slate-400 font-normal">通行證與核銷機制：</strong>
                      共用 1 張電子通行證，展示所有成員名單，由代表出示條碼一次性核銷同行進入。
                    </p>
                  </div>

                  {/* 多人分行 */}
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1">
                      <div className="font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-1 text-xs">
                        <Users size={13} />
                        <span>3. 多人分行</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        多人不同時間 / 分頭到訪
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug pt-0.5">
                      <strong className="text-slate-400 font-normal">通行證與核銷機制：</strong>
                      系統為每位成員生成專屬獨立通行證（如 PASS-B002-1, PASS-B002-2），可單獨下載圖片或發送電郵給個人，各自獨立掃碼入場。
                    </p>
                  </div>

                  {/* 團隊訪客 */}
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1">
                      <div className="font-black text-purple-700 dark:text-purple-300 flex items-center gap-1 text-xs">
                        <Crown size={13} />
                        <span>4. 團隊訪客</span>
                      </div>
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
                        團體/劇組同列進出
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug pt-0.5">
                      <strong className="text-slate-400 font-normal">通行證與核銷機制：</strong>
                      僅需填寫領隊資訊與總人數，生成 1 張團體通行證，由領隊統一帶隊核銷入場。
                    </p>
                  </div>

                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md"
              >
                我知道了
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
