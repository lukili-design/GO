/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Booking } from '../types';
import { getPurposeOption } from '../data/mockData';
import { QrCode, MapPin, Calendar, Car, ShieldAlert, Download, Mail, ArrowLeft, HeartHandshake, CheckCircle2, Share2, Image } from 'lucide-react';

interface InvitationCardProps {
  booking: Booking;
  onBack: () => void;
  onSimulateCheckIn?: (id: string) => void;
  onSimulateCheckOut?: (id: string) => void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({ booking, onBack, onSimulateCheckIn, onSimulateCheckOut }) => {
  const purposeOpt = getPurposeOption(booking.purpose);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [savedToAlbum, setSavedToAlbum] = React.useState(false);
  const [shareSuccess, setShareSuccess] = React.useState<string | null>(null);

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
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900 overflow-y-auto">
      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={onBack}
          type="button"
          className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-sm font-bold text-slate-950 dark:text-slate-50">電子邀請函 / 通行證</h1>
          <p className="text-[10px] text-slate-400 font-medium">請分享電子通行證給訪客</p>
        </div>
      </div>

      {/* Ticket Container */}
      <div className="p-4 flex-1 space-y-4 max-w-md mx-auto w-full pb-20">
        
        {/* Success toast */}
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3 rounded-xl flex items-start gap-2.5">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">已成功生成邀請 (Invitation Generated)</h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5 leading-relaxed">
              預約成功！請使用下方的「分享邀請函圖片」按鈕，直接將專屬二維碼通行證分享給訪客，以便快速放行。
            </p>
          </div>
        </div>

        {/* Boarding-Pass style Card */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-md border border-slate-200/80 dark:border-slate-800 overflow-hidden relative">
          
          {/* TVB Logo Top Section */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 text-center relative">
            <div className="absolute top-3 left-4 flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 via-green-500 to-red-500" />
              <span className="text-[10px] font-black tracking-widest text-slate-300">TVB</span>
            </div>
            <div className="absolute top-3.5 right-4">
              <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                VISITOR PASS
              </span>
            </div>
            
            <h2 className="text-sm font-black tracking-wide mt-3">電視城訪客通行證</h2>
            <p className="text-[9px] text-indigo-200 uppercase tracking-widest mt-0.5">TVB City Electronic Visitor Pass</p>
          </div>

          {/* Booking Code Bar */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-b border-dashed border-slate-200 dark:border-slate-800/80 flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>PASS ID: {booking.invitationCode}</span>
            <span>STATUS: ACTIVE</span>
          </div>

          {/* QR Code Section */}
          <div className="p-6 flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-center">
            
            {/* Visual QR Wrapper */}
            <div className="relative p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner mb-3">
              <div className="w-36 h-36 flex items-center justify-center bg-white p-2 rounded-lg relative">
                {/* Simulated QR block layout */}
                <QrCode size={120} className="text-slate-950" />
                
                {/* Overlay TVB logo in center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border-2 border-white shadow-md">
                  <span className="text-[10px] font-black tracking-wider text-white">TVB</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] font-bold text-slate-900 dark:text-slate-50">核銷通行條碼 (Entry Scanner Code)</p>
            <p className="text-[9px] text-slate-400 mt-1 max-w-[80%] leading-relaxed">
              到訪時請將此條碼出示於閘口或前台保安終端，進行核銷即可通行。
            </p>
          </div>

          {/* Separator Punch Holes */}
          <div className="relative flex items-center justify-between h-4 bg-white dark:bg-slate-950">
            <div className="w-4 h-4 bg-slate-100 dark:bg-slate-900 rounded-full -ml-2 border-r border-slate-200 dark:border-slate-800"></div>
            <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-800"></div>
            <div className="w-4 h-4 bg-slate-100 dark:bg-slate-900 rounded-full -mr-2 border-l border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Passenger Information details */}
          <div className="p-4 space-y-3 bg-white dark:bg-slate-950 text-xs">
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              
              <div className="col-span-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-[10px] font-medium text-slate-400 block mb-1">已登記訪客名單 / Registered Visitors</span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {((booking.visitors && booking.visitors.length > 0) ? booking.visitors : [{ name: booking.visitorName, idNumber: '' }]).map((v, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {idx + 1}. {v.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                        {v.idNumber ? `證件：${v.idNumber}` : <span className="text-slate-300 dark:text-slate-600 italic font-normal">未登記證件</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <span className="text-[10px] font-medium text-slate-400 block">到訪性質 / Category</span>
                <span className="mt-0.5 inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                  {purposeOpt.label}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-[10px] font-medium text-slate-400 block">預約到訪時間 / Booking Time</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 block mt-0.5 flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDateTime(booking.visitDateTime)}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-[10px] font-medium text-slate-400 block">目的地 / Destination</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5 flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{booking.destination}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] font-medium text-slate-400 block">公司名稱 / Company</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5 truncate">
                  {booking.company || '— 登記為個人訪客 —'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-medium text-slate-400 block">車牌號碼 / Vehicle Plate</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5 flex items-center gap-1">
                  <Car size={12} className="text-slate-400" />
                  <span>{booking.licensePlate || '未預約泊車位'}</span>
                </span>
              </div>

            </div>

            {booking.notes && (
              <div className="mt-4 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 leading-normal">
                <strong className="font-bold text-slate-700 dark:text-slate-300">備註：</strong>
                {booking.notes}
              </div>
            )}

            {/* Parking Instructions and Copy confirmation */}
            {booking.licensePlate && (
              <div className="mt-2.5 p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100/60 dark:border-amber-900/30 rounded-lg text-[10px] text-amber-800 dark:text-amber-400 space-y-1">
                <p className="font-bold">⚠️ 停車與入廠指引：</p>
                <p className="leading-relaxed">
                  1. 車牌：每間公司只可安排兩個泊車位，並需提供車牌號碼。已為 <strong>{booking.licensePlate}</strong> 成功配額。<br />
                  2. 入廠時請遵從現場保安人員指揮，停放於地下訪客指定車位。
                </p>
              </div>
            )}

          </div>

          {/* Card Safety Rules Footer */}
          <div className="p-3.5 bg-slate-100 dark:bg-slate-900 text-[10px] text-slate-500 leading-relaxed border-t border-slate-200 dark:border-slate-800 flex gap-2 items-start">
            <ShieldAlert size={14} className="text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-300">訪客安全須知 / Visitor Regulations</p>
              <p className="mt-0.5 text-slate-400">
                本證僅限預約本人及車輛當天有效。進入電視城大樓範圍內，需全程佩戴由保安發放之訪客掛牌。禁止進入錄影管制區域及拍攝未授權布景。
              </p>
            </div>
          </div>

        </div>

        {/* Share Invitation Image Operations Panel */}
        <div className="space-y-3">
          <button
            onClick={() => {
              setIsGenerating(true);
              setTimeout(() => {
                setIsGenerating(false);
                setShowShareModal(true);
              }, 800);
            }}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg cursor-pointer transition-all active:scale-[0.98]"
          >
            <Share2 size={16} />
            <span>📲 分享邀請函圖片 (Share Image Pass)</span>
          </button>

          {/* Quick simulator shortcut if pending */}
          {onSimulateCheckIn && booking.status === 'UPCOMING' && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-blue-800 dark:text-blue-400">🚪 快速測試：模擬保安掃碼</p>
                  <p className="text-[9px] text-blue-600 dark:text-blue-500">
                    一鍵將此訪客從『待到訪』轉變為『進行中』
                  </p>
                </div>
                <button
                  onClick={() => {
                    onSimulateCheckIn(booking.id);
                    onBack();
                  }}
                  type="button"
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  模擬簽到
                </button>
              </div>
            </div>
          )}

          {/* Quick simulator shortcut if checked in */}
          {onSimulateCheckOut && booking.status === 'CHECKED_IN' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400">🚪 快速測試：模擬訪客簽出</p>
                  <p className="text-[9px] text-amber-600 dark:text-amber-500">
                    一鍵將此訪客從在大樓狀態變更為『已結束/已取消』
                  </p>
                </div>
                <button
                  onClick={() => {
                    onSimulateCheckOut(booking.id);
                    onBack();
                  }}
                  type="button"
                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  模擬簽出
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Location map footer */}
        <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200">
            <MapPin size={14} className="text-red-500" />
            <span>TVB 電視城電視廣播有限公司</span>
          </div>
          <p className="text-[10px] text-slate-400">
            香港九龍將軍澳工業邨駿才街 77 號 (77 Chun Choi Street, Tseung Kwan O)
          </p>
          <div className="h-24 bg-slate-100 dark:bg-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center border border-slate-200/50 dark:border-slate-800">
            {/* Draw a styled minimal mock map */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              {/* Fake road networks lines */}
              <div className="absolute top-4 left-0 w-full h-1.5 bg-slate-400 rotate-12"></div>
              <div className="absolute top-12 left-0 w-full h-1 bg-slate-400 -rotate-6"></div>
              <div className="absolute top-0 left-1/3 w-2 h-full bg-slate-400"></div>
              <div className="absolute top-0 left-2/3 w-1 h-full bg-slate-400"></div>
              <div className="absolute top-8 left-10 w-20 h-10 bg-slate-400 rounded-lg"></div>
            </div>
            {/* Center Pin */}
            <div className="relative flex flex-col items-center">
              <div className="w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <span className="text-[9px] bg-slate-950 text-white px-1.5 py-0.5 rounded font-black mt-1 shadow-sm">
                TVB CITY
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center text-white space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-200">正在生成高清通行證圖片...</p>
        </div>
      )}

      {/* Share Image Preview Modal */}
      {showShareModal && (
        <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col overflow-y-auto p-4 text-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 shrink-0">
            <h3 className="text-xs font-bold tracking-wider flex items-center gap-1 text-slate-300">
              <Share2 size={14} className="text-blue-500" />
              <span>邀請函圖片分享與預覽</span>
            </h3>
            <button
              onClick={() => {
                setShowShareModal(false);
                setSavedToAlbum(false);
                setShareSuccess(null);
                setCopied(false);
              }}
              className="text-slate-400 hover:text-white font-bold text-xs bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 cursor-pointer"
            >
              關閉
            </button>
          </div>

          {/* Success Alerts */}
          {savedToAlbum && (
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-900 text-emerald-400 rounded-xl text-[10px] font-bold mb-3 flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 size={14} />
              <span>已成功保存通行證邀請圖片至手機相簿！</span>
            </div>
          )}

          {shareSuccess && (
            <div className="p-2.5 bg-blue-950/40 border border-blue-900 text-blue-400 rounded-xl text-[10px] font-bold mb-3 flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>{shareSuccess}</span>
            </div>
          )}

          {copied && (
            <div className="p-2.5 bg-blue-950/40 border border-blue-900 text-blue-400 rounded-xl text-[10px] font-bold mb-3 flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>已複製預約純文字詳情，可直接貼上傳送！</span>
            </div>
          )}

          {/* HD Pass Card Image (Visual Representation for sharing) */}
          <div className="bg-white text-slate-900 rounded-2xl p-4 space-y-4 shadow-2xl border-4 border-blue-600/30 shrink-0 select-none">
            
            {/* TVB Branding Card Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-blue-500 via-green-500 to-red-500" />
                <span className="text-xs font-black tracking-widest text-slate-900">TVB CITY</span>
              </div>
              <span className="text-[9px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded uppercase">
                電子通行證
              </span>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center py-2 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-2 bg-white rounded-lg border border-slate-200 relative mb-1.5 shadow-sm">
                <QrCode size={110} className="text-slate-950" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded bg-slate-950 flex items-center justify-center border border-white">
                  <span className="text-[7px] font-black text-white">TVB</span>
                </div>
              </div>
              <p className="text-[9px] font-bold text-slate-500 tracking-wider">PASS ID: {booking.invitationCode}</p>
            </div>

            {/* Complete Card Attributes */}
            <div className="space-y-2.5 text-xs">
              <div className="border-b border-slate-100 pb-2 space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">已登記訪客名單 (證件號)</span>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {((booking.visitors && booking.visitors.length > 0) ? booking.visitors : [{ name: booking.visitorName, idNumber: '' }]).map((v, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-1 bg-slate-50 rounded">
                      <span className="font-extrabold text-slate-900">
                        {idx + 1}. {v.name}
                      </span>
                      <span className="font-mono text-[9px] text-slate-500 font-semibold">
                        {v.idNumber ? `證件: ${v.idNumber}` : '未填寫'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">到訪性質</span>
                <span className="font-extrabold text-blue-600 text-xs block mt-0.5">
                  {purposeOpt.label}
                </span>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">到訪日期與時間</span>
                <span className="font-extrabold text-slate-900 block mt-0.5 text-xs flex items-center gap-1">
                  <Calendar size={12} className="text-blue-500" />
                  {formatDateTime(booking.visitDateTime)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">目的地</span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5">
                    {booking.destination}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">車牌號碼</span>
                  <span className="font-bold text-slate-800 block mt-0.5">
                    {booking.licensePlate || '未預約泊車'}
                  </span>
                </div>
              </div>

              {booking.notes && (
                <div className="p-2 bg-slate-50 rounded-lg text-[9px] text-slate-500 border border-slate-200 leading-relaxed">
                  <span className="font-bold text-slate-700 block">備註：</span>
                  {booking.notes}
                </div>
              )}
            </div>

            {/* Instruction Footer */}
            <div className="text-[8px] text-slate-400 leading-normal pt-2 border-t border-slate-100 flex gap-1.5">
              <ShieldAlert size={12} className="text-slate-400 shrink-0" />
              <span>本通行證由員工代為辦理。到訪時向將軍澳電視城一樓前台或保安掃描即可核銷。</span>
            </div>

          </div>

          {/* Action options */}
          <div className="mt-5 space-y-2 pb-8">
            <button
              onClick={() => {
                setSavedToAlbum(true);
                setShareSuccess(null);
                setCopied(false);
                setTimeout(() => setSavedToAlbum(false), 3000);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md"
            >
              <Download size={14} />
              <span>💾 儲存通行證圖片至相簿 (Save Image)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShareSuccess('已呼叫系統分享，成功將通行證圖片發送給 WeChat 聯絡人！');
                  setSavedToAlbum(false);
                  setCopied(false);
                  setTimeout(() => setShareSuccess(null), 3500);
                }}
                className="flex items-center justify-center gap-1 py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                <span>💬 分享至 WeChat</span>
              </button>
              <button
                onClick={() => {
                  setShareSuccess('已呼叫系統分享，成功將通行證圖片發送給 WhatsApp 聯絡人！');
                  setSavedToAlbum(false);
                  setCopied(false);
                  setTimeout(() => setShareSuccess(null), 3500);
                }}
                className="flex items-center justify-center gap-1 py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                <span>💬 分享至 WhatsApp</span>
              </button>
            </div>

            <button
              onClick={() => {
                const visitorNamesText = booking.visitors && booking.visitors.length > 0
                  ? booking.visitors.map((v, i) => `${i + 1}. ${v.name} (${v.idNumber || '未登記證件'})`).join(', ')
                  : booking.visitorName;
                const text = `【TVB 電視城訪客通行證】\n訪客名單：${visitorNamesText}\n到訪日期與時間：${formatDateTime(booking.visitDateTime)}\n到訪性質：${purposeOpt.label}\n目的地：${booking.destination}\n車牌號碼：${booking.licensePlate || '未預約泊車'}\n備註：${booking.notes || '無'}\n預約編號：${booking.invitationCode}`;
                navigator.clipboard.writeText(text);
                setCopied(true);
                setSavedToAlbum(false);
                setShareSuccess(null);
                setTimeout(() => setCopied(false), 3000);
              }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              <span>📋 複製純文字到剪貼簿 (Copy Text)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
