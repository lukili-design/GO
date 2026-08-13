/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Booking, BookingStatus, PurposeCode } from '../types';
import { getPurposeOption } from '../data/mockData';
import { ArrowLeft, Search, Calendar, MapPin, Car, Mail, CheckCircle, Clock, XCircle, ChevronRight, Share2, Play, Power, RefreshCw } from 'lucide-react';

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
  onSimulateCheckIn,
  onSimulateCheckOut,
  onViewPass,
  onRebook,
}) => {
  // Tabs: 'UPCOMING' | 'CHECKED_IN' | 'HISTORY'
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'CHECKED_IN' | 'HISTORY'>('UPCOMING');
  const [searchQuery, setSearchQuery] = useState('');

  // Count helper
  const upcomingBookings = bookings.filter(b => b.status === BookingStatus.UPCOMING);
  const checkedInBookings = bookings.filter(b => b.status === BookingStatus.CHECKED_IN);
  const historyBookings = bookings.filter(
    b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED
  );

  // Filter records based on active tab & search query
  const getFilteredBookings = () => {
    let list: Booking[] = [];
    if (activeTab === 'UPCOMING') list = upcomingBookings;
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

    // Sort by visitDateTime descending for history, ascending for upcoming/checked-in
    return list.sort((a, b) => {
      const timeA = new Date(a.visitDateTime).getTime();
      const timeB = new Date(b.visitDateTime).getTime();
      return activeTab === 'HISTORY' ? timeB - timeA : timeA - timeB;
    });
  };

  const filtered = getFilteredBookings();

  // Format date helper (Y-M-D H:i)
  const formatDateTime = (dtStr: string) => {
    const dt = new Date(dtStr);
    if (isNaN(dt.getTime())) return dtStr;
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const date = String(dt.getDate()).padStart(2, '0');
    const hours = String(dt.getHours()).padStart(2, '0');
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${date} ${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Records Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={onBack}
          type="button"
          className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-sm font-bold text-slate-950 dark:text-slate-50">📋 我的預約 / 紀錄</h1>
          <p className="text-[10px] text-slate-400 font-medium">預約管理</p>
        </div>
      </div>

      {/* Tabs list with counts */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 p-2 grid grid-cols-3 gap-1">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          type="button"
          className={`relative py-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
            activeTab === 'UPCOMING'
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40'
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            <span>待到訪</span>
          </div>
          <span className="text-xs bg-yellow-400/10 text-yellow-600 px-1.5 py-0.5 rounded-full font-bold">
            {upcomingBookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('CHECKED_IN')}
          type="button"
          className={`relative py-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
            activeTab === 'CHECKED_IN'
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40'
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>進行中</span>
          </div>
          <span className="text-xs bg-emerald-400/10 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">
            {checkedInBookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          type="button"
          className={`relative py-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
            activeTab === 'HISTORY'
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40'
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>歷史/已取消</span>
          </div>
          <span className="text-xs bg-slate-400/15 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">
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
      <div className="flex-1 p-4 overflow-y-auto space-y-3 pb-24">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
              <Search size={20} />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">沒有找到相符的預約紀錄</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">目前分頁可能尚無登記，或更換關鍵字再試</p>
            {activeTab === 'UPCOMING' && (
              <button
                onClick={onBack}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow-sm cursor-pointer"
              >
                + 立即預約訪客
              </button>
            )}
          </div>
        ) : (
          filtered.map((b) => {
            const purposeOpt = getPurposeOption(b.purpose);
            return (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                {/* Card Header Info with DateTime & Category */}
                <div className="p-3.5 border-b border-slate-100/60 dark:border-slate-800/60 flex items-center justify-between gap-3 bg-slate-50/25 dark:bg-slate-950/25">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-blue-500 shrink-0" />
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 font-mono">
                        {formatDateTime(b.visitDateTime)}
                      </span>
                    </div>
                    {b.company ? (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 pl-4.5 font-medium truncate">
                        🏢 {b.company}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 italic pl-4.5 font-medium">
                        個人代表
                      </span>
                    )}
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 font-black rounded-md border ${purposeOpt.color} ${purposeOpt.bgColor} shrink-0`}>
                    {purposeOpt.label}
                  </span>
                </div>

                {/* Card Details Body */}
                <div className="p-3.5 bg-slate-50/10 dark:bg-slate-900/10 text-xs space-y-2.5 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/60 flex-1">
                  
                  {/* Registered Visitors list with full ID numbers */}
                  <div className="pb-2 border-b border-slate-100 dark:border-slate-850">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">已登記訪客名單</span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100/30 dark:border-blue-900/30">
                        共 {b.visitors && b.visitors.length > 0 ? b.visitors.length : 1} 人
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {((b.visitors && b.visitors.length > 0) ? b.visitors : [{ name: b.visitorName, idNumber: '' }]).map((visitor, idx) => (
                        <div 
                          key={idx} 
                          className="flex flex-col gap-0.5 py-1.5 px-2 bg-slate-50/55 dark:bg-slate-900/40 rounded text-xs"
                        >
                          <span className="font-bold text-slate-850 dark:text-slate-200">
                            {visitor.name}
                          </span>
                          <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                            <span className="text-slate-400 dark:text-slate-500 mr-1">證件號：</span>
                            <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                              {visitor.idNumber || <span className="text-slate-300 dark:text-slate-650 italic font-normal">未填寫</span>}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Destination & Plate */}
                  <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-100 dark:border-slate-850">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">目的地</span>
                      <span className="text-xs text-slate-800 dark:text-slate-200 font-bold block truncate">
                        📍 {b.destination}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">車牌號碼</span>
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                        🚗 {b.licensePlate || <span className="text-slate-400 italic font-normal">無安排車位</span>}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="pb-2">
                    <span className="text-[10px] text-slate-400 block mb-0.5">備註說明</span>
                    <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-slate-700 dark:text-slate-300">
                      💬 {b.notes || <span className="text-slate-400 italic">無</span>}
                    </div>
                  </div>

                  {/* Invitation Code */}
                  <div className="flex justify-between items-center text-[10px] pt-1 text-slate-400 border-t border-dashed border-slate-200/85 dark:border-slate-800/60">
                    <span>邀請碼編號：{b.invitationCode}</span>
                  </div>
                </div>

                {/* Status-specific Footer Actions */}
                <div className="p-2.5 bg-white dark:bg-slate-950 flex items-center justify-between gap-2 border-t border-slate-50 dark:border-slate-850">
                  
                  {/* Left: Status tag */}
                  <div>
                    {b.status === BookingStatus.UPCOMING && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded bg-yellow-50 dark:bg-yellow-950/20">
                        <Clock size={11} />
                        <span>🟡 待到訪</span>
                      </div>
                    )}
                    {b.status === BookingStatus.CHECKED_IN && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/20">
                        <CheckCircle size={11} />
                        <span>🟢 進行中</span>
                      </div>
                    )}
                    {(b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED) && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
                        <CheckCircle size={11} />
                        <span>⚪ 已結束/已取消</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Operations */}
                  <div className="flex items-center gap-1.5">
                    {/* Upcoming specific actions: Share Invitation & Cancel */}
                    {b.status === BookingStatus.UPCOMING && (
                      <>
                        <button
                          onClick={() => {
                            onViewPass(b);
                          }}
                          type="button"
                          className="px-2.5 py-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                        >
                          分享邀請
                        </button>
                        <button
                          onClick={() => {
                            onCancelBooking(b.id);
                          }}
                          type="button"
                          className="px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                        >
                          取消
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
