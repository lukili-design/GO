/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Booking } from '../types';
import { getPurposeOption, getVisitorTypeLabel } from '../data/mockData';
import { 
  QrCode, ArrowLeft, CheckCircle2, Download, Mail, Send, X, 
  ChevronLeft, ChevronRight, User, Users, Shield, Building 
} from 'lucide-react';

interface InvitationCardProps {
  booking: Booking;
  onBack: () => void;
  onSimulateCheckIn?: (id: string) => void;
  onSimulateCheckOut?: (id: string) => void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  booking,
  onBack,
}) => {
  const purposeOpt = getPurposeOption(booking.purpose);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [emailSentSuccess, setEmailSentSuccess] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedVisitorIndex, setSelectedVisitorIndex] = useState(0);

  const isTeam = booking.visitorType === 'TEAM';
  const isMultiShared = booking.visitorType === 'MULTI_SHARED';
  const isMultiIndiv = booking.visitorType === 'MULTI' || booking.visitorType === 'MULTI_INDIVIDUAL';

  const categoryLabel = getVisitorTypeLabel(booking.visitorType);

  // Visitor List
  const visitorsList = (booking.visitors && booking.visitors.length > 0)
    ? booking.visitors
    : [{ name: booking.visitorName, email: booking.contactEmail }];

  const currentVisitor = visitorsList[selectedVisitorIndex] || visitorsList[0];
  const [targetEmail, setTargetEmail] = useState(currentVisitor.email || booking.contactEmail || '');

  // Keep target email synced when switching selected visitor
  React.useEffect(() => {
    setTargetEmail(currentVisitor.email || booking.contactEmail || '');
  }, [selectedVisitorIndex, currentVisitor, booking.contactEmail]);

  const handlePrevVisitor = () => {
    setSelectedVisitorIndex((prev) => (prev > 0 ? prev - 1 : visitorsList.length - 1));
  };

  const handleNextVisitor = () => {
    setSelectedVisitorIndex((prev) => (prev < visitorsList.length - 1 ? prev + 1 : 0));
  };

  const handleSaveImage = (allMembers = false) => {
    if (allMembers && isMultiIndiv) {
      setSavedSuccess(`已成功保存全體 ${visitorsList.length} 位成員之獨立電子通行證圖片！`);
    } else {
      setSavedSuccess(`已成功保存【${currentVisitor.name}】的電子通行證圖片至相簿！`);
    }
    setTimeout(() => {
      setSavedSuccess(null);
    }, 3500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
      {/* 1. Header Bar: 返回 | 電子通行證 */}
      <div className="shrink-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-2xs z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            type="button"
            className="flex items-center gap-1 p-1 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors cursor-pointer text-xs font-bold"
          >
            <ArrowLeft size={16} />
            <span>返回</span>
          </button>
          <div>
            <h1 className="text-sm font-black text-slate-950 dark:text-slate-50">電子通行證</h1>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 text-[10.5px] font-black rounded-lg border ${
          isMultiIndiv
            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : isMultiShared
            ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            : isTeam
            ? 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
            : 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
        }`}>
          {categoryLabel}
        </span>
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-md mx-auto w-full">
        
        {/* Notice Banner */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 p-3.5 rounded-2xl flex items-start gap-3 shadow-2xs">
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-black text-emerald-900 dark:text-emerald-300">
              已生成【{categoryLabel}】通行證
            </h3>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed font-medium">
              {isMultiIndiv
                ? '「多人分行」模式：每位成員均擁有獨立電子通行證，使用下方左右箭頭切換查看與分享！' 
                : isMultiShared
                ? '「多人同行」模式：共用一張電子通行證核銷入場，已列出全體同行訪客名單。'
                : '預約成功！出示專屬 QR Code 或下載圖片即可掃碼核銷進入電視城。'
              }
            </p>
          </div>
        </div>

        {/* 多人分行：左右切換選卡列 */}
        {isMultiIndiv && visitorsList.length > 1 && (
          <div className="bg-white dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
              <button
                type="button"
                onClick={handlePrevVisitor}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer transition-all flex items-center justify-center shrink-0"
                title="上一位訪客"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="text-center px-2">
                <span className="text-sm font-black text-blue-600 dark:text-blue-400 block truncate">
                  {currentVisitor.name}
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextVisitor}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer transition-all flex items-center justify-center shrink-0"
                title="下一位訪客"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Save Toast feedback */}
        {savedSuccess && (
          <div className="p-3 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-bounce">
            <CheckCircle2 size={16} />
            <span>{savedSuccess}</span>
          </div>
        )}

        {/* Email Sent Toast feedback */}
        {emailSentSuccess && (
          <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-bounce">
            <CheckCircle2 size={16} />
            <span>已成功將電子通行證發送至 {emailSentSuccess}！</span>
          </div>
        )}

        {/* 訪客通行證 卡片 */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200/90 dark:border-slate-800 overflow-hidden">
          
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-4 text-center relative">
            <h2 className="text-base font-black tracking-wide">TVB 電子通行證</h2>
            <p className="text-[10px] text-blue-100 font-medium mt-0.5">TVB Electronic Visitor Pass</p>
            {isMultiIndiv && (
              <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[9.5px] rounded-md shadow-2xs">
                成員 {selectedVisitorIndex + 1} 專屬卡
              </span>
            )}
          </div>

          {/* PASS ID & Active status */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-mono">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              PASS ID: {booking.invitationCode}{isMultiIndiv ? `-${selectedVisitorIndex + 1}` : ''}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              狀態 Active
            </span>
          </div>

          {/* QR Code Section */}
          <div className="p-5 flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-center border-b border-slate-100 dark:border-slate-800">
            {/* Displayed Visitor Name Banner */}
            <div className="mb-3 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-xl text-blue-900 dark:text-blue-200 text-xs font-black flex items-center gap-1.5 shadow-2xs">
              <User size={14} className="text-blue-600 dark:text-blue-400" />
              <span>持證者姓名：{isMultiIndiv ? currentVisitor.name : booking.visitorName}</span>
            </div>

            {/* Visual QR Block */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner mb-2.5">
              <div className="w-36 h-36 flex items-center justify-center bg-white p-2 rounded-xl relative">
                <QrCode size={128} className="text-slate-950" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border-2 border-white shadow-md">
                  <span className="text-[9px] font-black tracking-wider text-white">TVB</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium max-w-[90%] leading-relaxed">
              {isMultiIndiv 
                ? '到訪時請持證者出示此個人條碼，於閘口或安保終端獨立掃碼入場。'
                : '到訪時請將此條碼出示於閘口或前台安保終端掃碼入場。'
              }
            </p>
          </div>

          {/* Details Section */}
          <div className="p-4 space-y-3.5 bg-white dark:bg-slate-950 text-xs">
            
            {/* 多人同行 (共用卡) 或 團隊：顯示全體成員名單 */}
            {(isMultiShared || isTeam) && (
              <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 text-xs">
                  <span className="text-blue-600 dark:text-blue-400 font-black">
                    {categoryLabel}成員名單
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                    共{booking.totalVisitorsCount || visitorsList.length}人
                  </span>
                </div>

                <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800 space-y-1.5">
                  {isTeam ? (
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      1. {booking.visitorName} <span className="text-[10px] font-normal text-slate-400">(領隊代表帶隊)</span>
                    </div>
                  ) : (
                    visitorsList.map((v, idx) => (
                      <div 
                        key={idx} 
                        className="text-xs p-1.5 rounded-lg font-bold flex items-center justify-between bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <span>{idx + 1}. {v.name}</span>
                        {v.email && (
                          <span className="text-[10px] font-normal font-mono text-slate-500">{v.email}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 多人分行：訪客資訊只顯示單個人 (當前切換到的成員) */}
            {isMultiIndiv && (
              <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                    <User size={13} />
                    <span>持證訪客個人資訊</span>
                  </span>
                </div>

                <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">姓名：</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{currentVisitor.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">電郵信箱：</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{currentVisitor.email || booking.contactEmail || '未填寫'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Common Key-Value Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 space-y-2.5 text-xs">
              
              {/* 到訪性質 */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-slate-500 dark:text-slate-400">到訪性質</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${purposeOpt.color} ${purposeOpt.bgColor}`}>
                  {purposeOpt.label}
                </span>
              </div>

              {/* 預約到訪時間 */}
              <div className="flex items-center justify-between pt-2.5">
                <span className="font-bold text-slate-500 dark:text-slate-400">預約到訪時間</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                  {booking.visitDateTime}
                </span>
              </div>

              {/* 到訪模式 */}
              <div className="flex items-center justify-between pt-2.5">
                <span className="font-bold text-slate-500 dark:text-slate-400">到訪模式</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {booking.visitMode === 'MULTI_PASS' ? '有效期內多次訪問' : '單次訪問'}
                </span>
              </div>

              {/* 目的地 */}
              <div className="flex items-center justify-between pt-2.5">
                <span className="font-bold text-slate-500 dark:text-slate-400">目的地</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right truncate max-w-[200px]">
                  {booking.destination}
                </span>
              </div>

              {/* 公司名稱 */}
              <div className="flex items-center justify-between pt-2.5">
                <span className="font-bold text-slate-500 dark:text-slate-400">公司名稱</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right truncate max-w-[200px]">
                  {booking.company || '無'}
                </span>
              </div>

              {/* 車牌號碼 */}
              <div className="flex items-center justify-between pt-2.5">
                <span className="font-bold text-slate-500 dark:text-slate-400">車牌號碼</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {booking.licensePlate || '未預約泊車'}
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* 固定在螢幕底部的操作按鈕欄 (Sticky Footer Action Bar) */}
      <div className="shrink-0 sticky bottom-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 shadow-lg z-20 space-y-2">
        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto w-full">
          <button
            onClick={() => handleSaveImage(false)}
            type="button"
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer"
          >
            <Download size={15} />
            <span className="truncate">保存當前電子通行證</span>
          </button>

          <button
            onClick={() => setShowEmailModal(true)}
            type="button"
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer"
          >
            <Mail size={15} />
            <span className="truncate">發送電郵</span>
          </button>
        </div>

        {isMultiIndiv && visitorsList.length > 1 && (
          <div className="max-w-md mx-auto w-full">
            <button
              onClick={() => handleSaveImage(true)}
              type="button"
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer border border-slate-700"
            >
              <Download size={13} />
              <span>一鍵保存全部通行證</span>
            </button>
          </div>
        )}
      </div>

      {/* Send Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-slate-100">發送電子通行證至電郵</h3>
                  <p className="text-[10px] text-slate-400">發送【{isMultiIndiv ? currentVisitor.name : booking.visitorName}】持證條碼至目標信箱</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!targetEmail.trim()) return;
              const sentAddr = targetEmail.trim();
              setShowEmailModal(false);
              setEmailSentSuccess(sentAddr);
              setTimeout(() => setEmailSentSuccess(null), 4000);
            }} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  接收電子郵件地址 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="請輸入訪客電郵地址"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
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

    </div>
  );
};
