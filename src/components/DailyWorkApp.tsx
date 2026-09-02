/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AppBottomTab, DailyWorkSubModule, ClockInLog, LocationMethod, 
  BeaconRule, WifiRule, GpsConfig, VotingCampaign, VoteArticle 
} from '../types';
import { AppArticleDetailView } from './voting/AppArticleDetailView';
import { AppVotingListView } from './voting/AppVotingListView';
import { AppVotingDetailView } from './voting/AppVotingDetailView';
import { 
  Newspaper, Users, Briefcase, Sparkles, FolderKanban, 
  Calendar, Utensils, Bus, UserCheck, Clock, MapPin, 
  Wifi, Radio, CheckCircle2, AlertTriangle, ChevronRight, 
  RefreshCw, ShieldCheck, ArrowLeft, Send, Check, Info, FileText, Search,
  ChevronDown, Bell, QrCode, Building2, FileCheck, FileSpreadsheet, Plus, Laptop,
  BarChart2, Flame, Award
} from 'lucide-react';

interface DailyWorkAppProps {
  clockInLogs: ClockInLog[];
  onAddClockInLog: (log: Omit<ClockInLog, 'id'>) => void;
  beacons: BeaconRule[];
  wifis: WifiRule[];
  gpsConfig: GpsConfig;
  onOpenVisitorBooking: () => void;
  onOpenVisitorRecords?: () => void;
  votingCampaigns?: VotingCampaign[];
  voteArticles?: VoteArticle[];
  userVotes?: Record<string, string[]>;
  onVoteSubmit?: (campaignId: string, phaseId: string, optionIds: string[]) => void;
  triggerSound: (freq: number, type: OscillatorType, duration: number) => void;
}

export const DailyWorkApp: React.FC<DailyWorkAppProps> = ({
  clockInLogs,
  onAddClockInLog,
  beacons,
  wifis,
  gpsConfig,
  onOpenVisitorBooking,
  onOpenVisitorRecords,
  votingCampaigns = [],
  voteArticles = [],
  userVotes = {},
  onVoteSubmit,
  triggerSound
}) => {
  // Bottom Tab State (Default & ONLY clickable functional tab: 'DAILY_WORK')
  const [activeBottomTab, setActiveBottomTab] = useState<AppBottomTab>('DAILY_WORK');
  
  // Sub-module view inside 'DAILY_WORK'
  const [subModule, setSubModule] = useState<DailyWorkSubModule>('WORKBENCH');

  // Currently opened article for reading
  const [selectedArticle, setSelectedArticle] = useState<VoteArticle | null>(null);

  // Currently opened voting campaign for detail viewing/voting (Page 2 of Voting)
  const [selectedVotingCampaign, setSelectedVotingCampaign] = useState<VotingCampaign | null>(null);
  const [selectedVoteItemId, setSelectedVoteItemId] = useState<string | undefined>(undefined);

  // TVB Express News Tab State: 全部 / 公司公告 / 部門消息
  const [newsTab, setNewsTab] = useState<'ALL' | 'ANNOUNCEMENT' | 'DEPT'>('ALL');

  // Attendance History Calendar State
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonthNum, setSelectedMonthNum] = useState<string>('08');
  const selectedMonth = `${selectedYear}-${selectedMonthNum}`;
  const [selectedRecordDate, setSelectedRecordDate] = useState<string>('2026-08-12');

  // Non-clickable tab toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Server Clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Location Verification Test Scenario Simulation (For App Demo)
  // 'IN_OFFICE_ALL' | 'WIFI_GPS_ONLY' | 'OUTSIDE_REMOTE'
  const [testScenario, setTestScenario] = useState<'IN_OFFICE_ALL' | 'WIFI_GPS_ONLY' | 'OUTSIDE_REMOTE'>('IN_OFFICE_ALL');

  // Scanning animation state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<{
    beaconPassed: boolean;
    beaconName?: string;
    wifiPassed: boolean;
    wifiSsid?: string;
    gpsPassed: boolean;
    gpsDistance?: number;
    isInOffice: boolean;
  }>({
    beaconPassed: true,
    beaconName: 'TVB主樓大堂 Beacon',
    wifiPassed: true,
    wifiSsid: 'TVB-Corp-5G',
    gpsPassed: true,
    gpsDistance: 42,
    isInOffice: true
  });

  // Re-run location check when scenario changes
  useEffect(() => {
    setIsScanning(true);
    const timeout = setTimeout(() => {
      if (testScenario === 'IN_OFFICE_ALL') {
        setScanResults({
          beaconPassed: true,
          beaconName: beacons[0]?.name || 'TVB主樓大堂 Beacon',
          wifiPassed: true,
          wifiSsid: wifis[0]?.ssid || 'TVB-Corp-5G',
          gpsPassed: true,
          gpsDistance: 45,
          isInOffice: true
        });
      } else if (testScenario === 'WIFI_GPS_ONLY') {
        setScanResults({
          beaconPassed: false,
          wifiPassed: true,
          wifiSsid: wifis[0]?.ssid || 'TVB-Corp-5G',
          gpsPassed: true,
          gpsDistance: 120,
          isInOffice: true
        });
      } else {
        setScanResults({
          beaconPassed: false,
          wifiPassed: false,
          gpsPassed: false,
          gpsDistance: 1850,
          isInOffice: false
        });
      }
      setIsScanning(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [testScenario, beacons, wifis]);

  // Determine current employee's punch status for today
  const myTodayLogs = clockInLogs.filter(
    l => l.employeeId === 'TVB-8821' && l.timestamp.startsWith(currentTime.toISOString().split('T')[0])
  );
  
  const lastPunch = myTodayLogs[myTodayLogs.length - 1];
  const nextClockType = (!lastPunch || lastPunch.clockType === 'OUT') ? 'IN' : 'OUT';

  // Clock-in success badge popup
  const [successBadge, setSuccessBadge] = useState<{
    show: boolean;
    clockType: 'IN' | 'OUT';
    timestamp: string;
    method: string;
  } | null>(null);

  // Field punch confirmation modal
  const [showFieldModal, setShowFieldModal] = useState<boolean>(false);
  const [fieldReason, setFieldReason] = useState<string>('');

  // Handle Bottom Tab Navigation Click
  const handleTabClick = (tab: AppBottomTab, label: string) => {
    if (tab === 'DAILY_WORK') {
      setActiveBottomTab('DAILY_WORK');
      setSubModule('WORKBENCH');
    } else if (tab === 'NEWS') {
      setActiveBottomTab('NEWS');
    } else {
      triggerSound(300, 'sine', 0.1);
      setToastMessage(`「${label}」功能模組建設中，目前請使用【TVB快訊】與【工作日常】`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Perform Clock-In Action
  const executeClockIn = (overrideField = false) => {
    if (!scanResults.isInOffice && !overrideField) {
      // Out of bounds -> Prompt
      setShowFieldModal(true);
      triggerSound(250, 'triangle', 0.2);
      return;
    }

    let chosenMethod: LocationMethod = 'GPS';
    let locationDetail = '';

    if (overrideField) {
      chosenMethod = 'GPS';
      locationDetail = fieldReason ? `GPS 圍欄 (報備): ${fieldReason}` : 'GPS 圍欄打卡';
    } else if (scanResults.beaconPassed) {
      chosenMethod = 'BEACON';
      locationDetail = `${scanResults.beaconName} (RSSI: -68dBm)`;
    } else if (scanResults.wifiPassed) {
      chosenMethod = 'WIFI';
      locationDetail = `${scanResults.wifiSsid} (MAC Whitelisted)`;
    } else if (scanResults.gpsPassed) {
      chosenMethod = 'GPS';
      locationDetail = `GPS TVB城內 (${scanResults.gpsDistance}m)`;
    }

    const formattedTime = currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const nowIso = `${currentTime.toISOString().split('T')[0]} ${formattedTime}`;

    onAddClockInLog({
      employeeId: 'TVB-8821',
      employeeName: '陳大文 (Tai Man Chan)',
      dept: '綜藝節目部',
      timestamp: nowIso,
      clockType: nextClockType,
      method: chosenMethod,
      locationDetail: locationDetail,
      status: 'NORMAL',
      notes: overrideField ? fieldReason : undefined
    });

    triggerSound(950, 'sine', 0.18);

    setSuccessBadge({
      show: true,
      clockType: nextClockType,
      timestamp: formattedTime,
      method: chosenMethod === 'BEACON' ? 'Beacon' : chosenMethod === 'WIFI' ? 'Wi-Fi' : 'GPS 圍欄'
    });

    setShowFieldModal(false);
    setFieldReason('');

    setTimeout(() => {
      setSuccessBadge(null);
    }, 4000);
  };

  // Sub-module Modals / Renderers
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string>('2026-08-10');
  const [canteenCategory, setCanteenCategory] = useState<'A' | 'B' | 'DRINK'>('A');

  // If viewing an article detail, render the specialized article reader (Page with single back button)
  if (selectedArticle) {
    return (
      <AppArticleDetailView
        article={selectedArticle}
        campaigns={votingCampaigns}
        onBack={() => setSelectedArticle(null)}
        onSelectCampaign={(campaign, voteItemId) => {
          setSelectedArticle(null);
          setSelectedVotingCampaign(campaign);
          setSelectedVoteItemId(voteItemId);
        }}
        onVoteSubmit={onVoteSubmit}
        userVotes={userVotes}
        triggerSound={triggerSound}
      />
    );
  }

  // If viewing a voting campaign detail, render the specialized voting detail page (Page 2 with single back button)
  if (selectedVotingCampaign) {
    return (
      <AppVotingDetailView
        campaign={selectedVotingCampaign}
        initialVoteItemId={selectedVoteItemId}
        onBack={() => {
          setSelectedVotingCampaign(null);
          setSelectedVoteItemId(undefined);
        }}
        onVoteSubmit={onVoteSubmit}
        userVotes={userVotes}
        triggerSound={triggerSound}
      />
    );
  }

  // Determine if current screen is root view (no back button needed)
  const isRootScreen = (activeBottomTab === 'NEWS') || (activeBottomTab === 'DAILY_WORK' && subModule === 'WORKBENCH');

  const handleTopBack = () => {
    if (subModule === 'CLOCK_RECORD') {
      setSubModule('CLOCK_IN');
    } else {
      setSubModule('WORKBENCH');
    }
    triggerSound(500, 'sine', 0.05);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden relative">
      
      {/* Toast Notification for Non-clickable bottom tabs */}
      {toastMessage && (
        <div className="absolute top-10 left-4 right-4 z-50 bg-slate-900/95 dark:bg-slate-800/95 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xl backdrop-blur border border-slate-700/50 flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <Info size={15} className="text-amber-400 shrink-0" />
          <span className="font-medium text-[11px] leading-tight flex-1">{toastMessage}</span>
        </div>
      )}

      {/* SUCCESS PUNCH BADGE POPUP */}
      {successBadge?.show && (
        <div className="absolute inset-x-4 top-12 z-50 bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl border border-emerald-400 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center gap-1.5">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <CheckCircle2 size={24} className="text-white" />
          </div>
          <span className="text-xs font-black tracking-wide uppercase bg-emerald-700/60 px-2 py-0.5 rounded-full">
            Successfully Clocked {successBadge.clockType === 'IN' ? 'In' : 'Out'}
          </span>
          <h4 className="text-base font-black">
            {successBadge.clockType === 'IN' ? 'CLOCK IN 成功' : 'CLOCK OUT 成功'}
          </h4>
          <div className="flex items-center gap-2 text-xs font-mono bg-emerald-800/50 px-3 py-1 rounded-lg">
            <span>⏰ {successBadge.timestamp}</span>
            <span>•</span>
            <span>{successBadge.method}</span>
          </div>
        </div>
      )}

      {/* FIELD PUNCH MODAL */}
      {showFieldModal && (
        <div className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 w-full max-w-xs shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
              <AlertTriangle size={18} />
              <span>不在指定辦公區域內</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              系統未匹配到 Beacon、Wi-Fi 或 GPS 圍欄。若您正在執行外勤任務，請填寫說明：
            </p>
            <input
              type="text"
              value={fieldReason}
              onChange={(e) => setFieldReason(e.target.value)}
              placeholder="請輸入外勤地點或事由 (例: 灣仔採訪)"
              className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-amber-500"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowFieldModal(false)}
                className="flex-1 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => executeClockIn(true)}
                className="flex-1 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs"
              >
                確認外勤打卡
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APP TOP NATIVE NAVIGATION HEADER */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0 select-none shadow-2xs z-20">
        <div className="flex items-center gap-2.5">
          {/* 只在非根頁面顯示唯一的返回按鈕 */}
          {!isRootScreen && (
            <button
              type="button"
              onClick={handleTopBack}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="返回上一頁"
            >
              <ArrowLeft size={17} />
            </button>
          )}

          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">
              {activeBottomTab === 'NEWS' && 'TVB快訊'}
              {activeBottomTab === 'DAILY_WORK' && subModule === 'WORKBENCH' && '工作日常'}
              {activeBottomTab === 'DAILY_WORK' && subModule === 'VOTING' && '互動投票'}
              {activeBottomTab === 'DAILY_WORK' && subModule === 'CLOCK_IN' && '考勤'}
              {subModule === 'CLOCK_RECORD' && '考勤記錄'}
              {subModule === 'CALENDAR' && '日曆'}
              {subModule === 'CANTEEN' && '餐廳'}
              {subModule === 'BUS' && '員工巴士'}
            </h1>
          </div>
        </div>

        {/* 右上角快捷操作: 考勤頁面顯示考勤日曆, 其他頁面顯示搜尋 */}
        {activeBottomTab === 'DAILY_WORK' && subModule === 'CLOCK_IN' ? (
          <button
            type="button"
            onClick={() => setSubModule('CLOCK_RECORD')}
            className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-all cursor-pointer flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60"
            title="考勤記錄"
          >
            <Calendar size={17} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setToastMessage('搜尋功能已就緒');
              setTimeout(() => setToastMessage(null), 2000);
            }}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60"
            title="搜尋"
          >
            <Search size={17} />
          </button>
        )}
      </div>

      {/* MAIN CONTENT CANVAS */}
      <div className="flex-1 overflow-y-auto">
        
        {/* ================= 0. TVB快訊 VIEW (activeBottomTab === 'NEWS') ================= */}
        {activeBottomTab === 'NEWS' && (
          <div className="p-3.5 space-y-3.5">
            {/* 考勤提醒卡片 (Clock-In / Attendance) */}
            <button
              type="button"
              onClick={() => {
                setActiveBottomTab('DAILY_WORK');
                setSubModule('CLOCK_IN');
              }}
              className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] text-white rounded-2xl p-4 shadow-lg shadow-emerald-500/20 border border-emerald-400/30 flex items-center justify-between group transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 shrink-0 group-hover:scale-105 transition-transform">
                  <Clock size={22} className="text-white stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-black tracking-wide text-white">
                    Clock-In / Attendance
                  </h3>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                <ChevronRight size={20} className="text-white group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            <div className="bg-white dark:bg-slate-950 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                    <Newspaper size={18} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-wide">
                    TVB快訊
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">電視城最新動態</span>
              </div>

              {/* 三個 Tab: 全部 / 公司公告 / 部門消息 */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setNewsTab('ALL')}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    newsTab === 'ALL'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  全部
                </button>
                <button
                  type="button"
                  onClick={() => setNewsTab('ANNOUNCEMENT')}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    newsTab === 'ANNOUNCEMENT'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  公司公告
                </button>
                <button
                  type="button"
                  onClick={() => setNewsTab('DEPT')}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    newsTab === 'DEPT'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  部門消息
                </button>
              </div>

              {/* 文章內容 (第一篇文章為包含投票組件的專題文章，點擊進入即可看到文章與關聯投票組件效果) */}
              <div className="space-y-2.5 pt-1">
                {/* 渲染專題與投票關聯文章 */}
                {voteArticles
                  .filter(art => newsTab === 'ALL' || (newsTab === 'ANNOUNCEMENT' && (art.category.includes('投票') || art.category.includes('資訊') || art.category.includes('盛典') || art.category.includes('活動') || art.category.includes('公告'))) || (newsTab === 'DEPT' && (art.category.includes('福利') || art.category.includes('部門'))))
                  .map(article => (
                    <div
                      key={article.id}
                      onClick={() => {
                        setSelectedArticle(article);
                        triggerSound(750, 'sine', 0.08);
                      }}
                      className="p-3.5 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 dark:from-slate-900/90 dark:to-blue-950/30 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 space-y-2 hover:border-blue-400 transition-all cursor-pointer shadow-2xs group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1 shadow-xs">
                          <Sparkles size={10} className="text-amber-300" />
                          <span>{article.category}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{article.publishDate.substring(0, 10)}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h4>
                      {article.summary && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                          {article.summary}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-blue-600 dark:text-blue-400 font-bold pt-1 border-t border-blue-100 dark:border-slate-800">
                        <span>點擊閱讀全文並立即參與投票 ➔</span>
                        <span>{article.viewCount.toLocaleString()} 閱讀</span>
                      </div>
                    </div>
                  ))}

                {/* 常規快訊公告 */}
                {[
                  {
                    id: 'std-1',
                    category: 'ANNOUNCEMENT',
                    categoryName: '公司公告',
                    title: '【公司公告】2026年度電視城行政與考勤管理制度升級指引',
                    date: '2026-08-11',
                    summary: '為方便全體同仁差勤登記，電視城已全面開通藍牙與Wi-Fi考勤，請參閱最新考勤指引。'
                  },
                  {
                    id: 'std-2',
                    category: 'DEPT',
                    categoryName: '部門消息',
                    title: '【部門消息】綜藝節目部《2026台慶亮燈》1號錄影廠行程預告',
                    date: '2026-08-10',
                    summary: '綜藝節目部製作團隊請留意，1號廠錄影設備將於明日14:00進行測試，請相關人員準時出席。'
                  },
                  {
                    id: 'std-3',
                    category: 'ANNOUNCEMENT',
                    categoryName: '公司公告',
                    title: '【公司公告】員工餐廳八月份特別菜單及八達通/飯卡增值優惠',
                    date: '2026-08-08',
                    summary: '八月份電視城員工餐廳提供精選港式燒味套餐，使用電子飯卡消費可享85折優惠。'
                  },
                  {
                    id: 'std-4',
                    category: 'DEPT',
                    categoryName: '部門消息',
                    title: '【部門消息】電視城員工巴士班次增設調景嶺/旺角直達線',
                    date: '2026-08-05',
                    summary: '下班繁忙時間（18:15及18:30）特設直達調景嶺地鐵站及旺角雅蘭中心專車。'
                  }
                ]
                  .filter(a => newsTab === 'ALL' || a.category === newsTab)
                  .map(article => (
                    <div
                      key={article.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1.5 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          article.category === 'ANNOUNCEMENT'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {article.categoryName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{article.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {article.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {article.summary}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 1. WORKBENCH VIEW (activeBottomTab === 'DAILY_WORK') ================= */}
        {activeBottomTab === 'DAILY_WORK' && subModule === 'WORKBENCH' && (
          <div className="p-4 space-y-4">
            
            {/* 工作日常 大卡片網格 (5個彩色的金剛區入口) */}
            <div className="grid grid-cols-3 gap-3.5">
              
              {/* 1. 日曆 (藍色系) */}
              <button
                type="button"
                onClick={() => setSubModule('CALENDAR')}
                className="bg-blue-50/90 dark:bg-blue-950/40 hover:bg-blue-100/90 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-900/50 rounded-2xl py-4.5 px-3 flex flex-col items-center justify-center gap-2.5 active:scale-[0.98] transition-all cursor-pointer shadow-2xs group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                  <Calendar size={26} className="stroke-[2.2]" />
                </div>
                <span className="text-xs font-black text-blue-950 dark:text-blue-100 tracking-tight">
                  日曆
                </span>
              </button>

              {/* 2. 餐廳 (橙黃色系) */}
              <button
                type="button"
                onClick={() => setSubModule('CANTEEN')}
                className="bg-amber-50/90 dark:bg-amber-950/40 hover:bg-amber-100/90 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-900/50 rounded-2xl py-4.5 px-3 flex flex-col items-center justify-center gap-2.5 active:scale-[0.98] transition-all cursor-pointer shadow-2xs group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
                  <Utensils size={26} className="stroke-[2.2]" />
                </div>
                <span className="text-xs font-black text-amber-950 dark:text-amber-100 tracking-tight">
                  餐廳
                </span>
              </button>

              {/* 3. 員工巴士 (翠綠色系) */}
              <button
                type="button"
                onClick={() => setSubModule('BUS')}
                className="bg-emerald-50/90 dark:bg-emerald-950/40 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-900/50 rounded-2xl py-4.5 px-3 flex flex-col items-center justify-center gap-2.5 active:scale-[0.98] transition-all cursor-pointer shadow-2xs group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                  <Bus size={26} className="stroke-[2.2]" />
                </div>
                <span className="text-xs font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
                  員工巴士
                </span>
              </button>

              {/* 4. 訪客預約 (紫色系) */}
              <button
                type="button"
                onClick={onOpenVisitorBooking}
                className="bg-purple-50/90 dark:bg-purple-950/40 hover:bg-purple-100/90 dark:hover:bg-purple-900/60 border border-purple-200/60 dark:border-purple-900/50 rounded-2xl py-4.5 px-3 flex flex-col items-center justify-center gap-2.5 active:scale-[0.98] transition-all cursor-pointer shadow-2xs group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
                  <UserCheck size={26} className="stroke-[2.2]" />
                </div>
                <span className="text-xs font-black text-purple-950 dark:text-purple-100 tracking-tight">
                  訪客預約
                </span>
              </button>

              {/* 5. 我的預約 / 紀錄 (藍紫色系) */}
              <button
                type="button"
                onClick={onOpenVisitorRecords || onOpenVisitorBooking}
                className="bg-sky-50/90 dark:bg-sky-950/40 hover:bg-sky-100/90 dark:hover:bg-sky-900/60 border border-sky-200/60 dark:border-sky-900/50 rounded-2xl py-4.5 px-3 flex flex-col items-center justify-center gap-2.5 active:scale-[0.98] transition-all cursor-pointer shadow-2xs group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
                  <FileText size={26} className="stroke-[2.2]" />
                </div>
                <span className="text-xs font-black text-sky-950 dark:text-sky-100 tracking-tight">
                  預約記錄
                </span>
              </button>

              {/* 6. 考勤 (玫瑰/靛藍色系) */}
              <button
                type="button"
                onClick={() => setSubModule('CLOCK_IN')}
                className="bg-indigo-50/90 dark:bg-indigo-950/40 hover:bg-indigo-100/90 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-900/50 rounded-2xl py-4.5 px-3 flex flex-col items-center justify-center gap-2.5 active:scale-[0.98] transition-all cursor-pointer shadow-2xs group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                  <Clock size={26} className="stroke-[2.2]" />
                </div>
                <span className="text-xs font-black text-indigo-950 dark:text-indigo-100 tracking-tight">
                  考勤
                </span>
              </button>

              {/* 7. 互動投票專區 (炫彩漸變特色入口) */}
              <button
                type="button"
                onClick={() => setSubModule('VOTING')}
                className="bg-gradient-to-br from-rose-50/90 to-pink-50/90 dark:from-rose-950/40 dark:to-pink-950/40 hover:from-rose-100/90 hover:to-pink-100/90 border border-rose-200/70 dark:border-rose-900/50 rounded-2xl py-4.5 px-3 flex flex-col items-center justify-center gap-2.5 active:scale-[0.98] transition-all cursor-pointer shadow-2xs group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/25 group-hover:scale-105 transition-transform relative">
                  <Award size={26} className="stroke-[2.2]" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white animate-ping"></span>
                </div>
                <span className="text-xs font-black text-rose-950 dark:text-rose-100 tracking-tight">
                  互動投票
                </span>
              </button>

            </div>
          </div>
        )}

        {/* ================= 1.5 互動投票專區 - 頁面 1: 投票列表 (subModule === 'VOTING') ================= */}
        {activeBottomTab === 'DAILY_WORK' && subModule === 'VOTING' && (
          <div className="p-3.5 space-y-3">
            <AppVotingListView
              campaigns={votingCampaigns}
              onSelectCampaign={(campaign, voteItemId) => {
                setSelectedVotingCampaign(campaign);
                setSelectedVoteItemId(voteItemId);
              }}
              userVotes={userVotes}
              triggerSound={triggerSound}
            />
          </div>
        )}

        {/* ================= 2. 考勤頁面 - 釘釘風格 (activeBottomTab === 'DAILY_WORK' && subModule === 'CLOCK_IN') ================= */}
        {activeBottomTab === 'DAILY_WORK' && subModule === 'CLOCK_IN' && (
          <div className="p-3.5 space-y-3.5">
            
            {/* 釘釘風格 1. 用戶與考勤組信息頭部卡片 */}
            <div className="bg-white dark:bg-slate-950 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
                    Lily
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">陳莉莉 (Lily)</h2>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mt-0.5">
                      綜藝節目部
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 釘釘風格 2. 巨型藍色圓形即時打卡按鈕 */}
            <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              
              <div className="relative py-2">
                {/* 釘釘外圍藍色擴展光圈 */}
                <div className="absolute -inset-5 rounded-full blur-2xl opacity-20 animate-pulse bg-blue-600"></div>
                <div className="absolute -inset-2 rounded-full border-2 border-blue-400/30 animate-ping"></div>

                {/* 釘釘核心藍色大按鈕 */}
                <button
                  type="button"
                  onClick={() => executeClockIn()}
                  className="w-44 h-44 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 hover:from-blue-600 hover:to-indigo-800 active:scale-95 shadow-2xl shadow-blue-500/40 flex flex-col items-center justify-center text-white font-black relative z-10 cursor-pointer border-4 border-white/20 transition-all group"
                >
                  <span className="text-sm font-black tracking-wider uppercase opacity-95">
                    CLOCK OUT
                  </span>
                  
                  {/* 即時時間動態流轉 */}
                  <span className="text-2xl font-mono font-black tracking-tight my-1 drop-shadow-xs">
                    {currentTime.toLocaleTimeString('zh-TW', { hour12: false })}
                  </span>
                </button>
              </div>

              {/* 考勤範圍與刷新按鈕 */}
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-4 py-2 rounded-full border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs">
                <CheckCircle2 size={15} />
                <span>已進入考勤範圍</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsScanning(true);
                    setTimeout(() => setIsScanning(false), 500);
                  }}
                  className="ml-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
                  <span>刷新</span>
                </button>
              </div>
            </div>

            {/* 釘釘風格 3. 今日考勤記錄時間軸 */}
            <div className="bg-white dark:bg-slate-950 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-blue-600" />
                  <span>考勤記錄</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">2026-08-12</span>
              </div>

              {/* 時間軸 */}
              <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {/* CLOCK IN 項 */}
                <div className="relative flex items-start justify-between text-xs">
                  <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950"></div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">CLOCK IN</span>
                    <span className="text-[10px] text-slate-400">09:00:00 (Wi-Fi校驗)</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                </div>

                {/* CLOCK OUT 項 */}
                <div className="relative flex items-start justify-between text-xs">
                  <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">CLOCK OUT</span>
                    <span className="text-[10px] text-slate-400">--</span>
                  </div>
                  <div></div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= 4. 考勤記錄與統計頁面 - 釘釘風格 (subModule === 'CLOCK_RECORD') ================= */}
        {subModule === 'CLOCK_RECORD' && (
          <div className="p-3.5 space-y-3.5">
            
            {/* 蘋果風格 1. 年份與月份下拉選擇選單 */}
            <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">考勤月份</span>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold px-3 py-1.5 rounded-xl border-none outline-none appearance-none cursor-pointer pr-7"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%206b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '0.85rem' }}
                >
                  <option value="2025">2025年</option>
                  <option value="2026">2026年</option>
                  <option value="2027">2027年</option>
                </select>

                <select
                  value={selectedMonthNum}
                  onChange={(e) => setSelectedMonthNum(e.target.value)}
                  className="bg-blue-600 text-white text-xs font-black px-3 py-1.5 rounded-xl border-none outline-none appearance-none cursor-pointer pr-7 shadow-xs"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%20ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '0.85rem' }}
                >
                  {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                    <option key={m} value={m} className="text-slate-900 bg-white">{parseInt(m)}月</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 釘釘風格 2. 3欄月度統計指標卡片 (已去掉遲到/早退) */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] text-slate-400 block font-medium">出勤天數</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400 mt-0.5 block">22 天</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] text-slate-400 block font-medium">休息天數</span>
                <span className="text-sm font-black text-slate-600 dark:text-slate-300 mt-0.5 block">8 天</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] text-slate-400 block font-medium">考勤異常</span>
                <span className="text-sm font-black text-amber-500 mt-0.5 block">1 次</span>
              </div>
            </div>

            {/* 釘釘風格 3. 月度考勤日曆 (正常: 綠色勾標示; 異常: 黃色警告圖案表示) */}
            <div className="bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2.5">
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center font-mono">
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map(d => {
                  const dateStr = `${selectedYear}-${selectedMonthNum}-${String(d).padStart(2, '0')}`;
                  const isSelected = selectedRecordDate === dateStr;
                  const isWeekend = d === 1 || d === 2 || d === 8 || d === 9 || d === 15 || d === 16 || d === 22 || d === 23 || d === 29 || d === 30;
                  const isAnomaly = d === 6;
                  const isNormal = d <= 12 && !isWeekend && !isAnomaly;

                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedRecordDate(dateStr)}
                      className={`relative py-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer min-h-[44px] ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 ring-offset-1'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="leading-none text-[11px]">{d}</span>
                      
                      {/* 綠色圓圈勾標示 / 黃色警告圖案標示 / 休 */}
                      {isWeekend && (
                        <span className={`text-[9px] font-normal leading-none mt-1 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                          休
                        </span>
                      )}
                      {isNormal && (
                        <div className={`mt-1 w-4 h-4 rounded-full flex items-center justify-center ${isSelected ? 'bg-white text-blue-600' : 'bg-emerald-500 text-white'}`}>
                          <Check size={11} className="stroke-[3]" />
                        </div>
                      )}
                      {isAnomaly && (
                        <div className={`mt-1 w-4 h-4 rounded-full flex items-center justify-center font-black text-[10px] leading-none ${isSelected ? 'bg-amber-300 text-slate-900' : 'bg-amber-500 text-white'}`}>
                          !
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. 選定日期的考勤記錄 */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="text-xs font-black text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center justify-between">
                <span>考勤記錄 ({selectedRecordDate})</span>
              </div>

              <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                <div className="relative flex items-start justify-between text-xs">
                  <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">CLOCK IN</span>
                    <span className="text-[10px] text-slate-400">09:00:00 (Wi-Fi校驗)</span>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                </div>

                <div className="relative flex items-start justify-between text-xs">
                  <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">CLOCK OUT</span>
                    <span className="text-[10px] text-slate-400">
                      {selectedRecordDate === '2026-08-12' ? '--' : '18:05:12'}
                    </span>
                  </div>
                  <div>
                    {selectedRecordDate !== '2026-08-12' && (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Check size={12} className="stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= 3. CALENDAR SUB-MODULE ================= */}
        {subModule === 'CALENDAR' && (
          <div className="p-3.5 space-y-3">
            <div className="bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Calendar size={16} className="text-purple-500" />
                <span>電視城綜藝節目部 8月工作排班</span>
              </h3>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setCalendarSelectedDate(`2026-08-${String(d).padStart(2, '0')}`)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      d === 10
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-2">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300 block">
                📅 今日錄影行程 (2026-08-10)
              </span>
              <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl text-xs space-y-1 shadow-2xs">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>14:00 - 18:00 《獎門人》錄影</span>
                  <span className="text-purple-600 font-mono text-[10px]">1號錄影廠</span>
                </div>
                <p className="text-[10px] text-slate-500">主持及嘉賓已由訪客系統完成入廠預約登記。</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. CANTEEN SUB-MODULE ================= */}
        {subModule === 'CANTEEN' && (
          <div className="p-3.5 space-y-3">
            <div className="bg-amber-500 text-white p-3.5 rounded-2xl shadow-md flex justify-between items-center">
              <div>
                <span className="text-[10px] text-amber-100 font-bold">TVB 員工餐廳 E-Card</span>
                <h3 className="text-sm font-black">陳大文 • 員工飯卡餘額 $280</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
                🍱
              </div>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">今日精選午餐 (11:30 - 14:30)</h4>
              
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 flex justify-between items-center border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">A餐：港式明爐燒鴨油雞飯</span>
                    <span className="text-[10px] text-slate-400">附送每日例湯及熱飲</span>
                  </div>
                  <span className="font-bold font-mono text-amber-600">$38</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 flex justify-between items-center border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">B餐：黑椒焗豬扒飯</span>
                    <span className="text-[10px] text-slate-400">新鮮現焗 • 限量供應</span>
                  </div>
                  <span className="font-bold font-mono text-amber-600">$42</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. BUS SUB-MODULE ================= */}
        {subModule === 'BUS' && (
          <div className="p-3.5 space-y-3">
            <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-md space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-emerald-100">將軍澳電視城 Shuttle Bus</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">LIVE</span>
              </div>
              <h3 className="text-sm font-black">下班班次倒數：00:24:15</h3>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">路線與發車時間</h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">TVB 城 ➔ 調景嶺 MTR (15分鐘一班)</span>
                    <span className="text-[10px] text-slate-400">下一班：18:15 / 18:30</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg">
                    候車中
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">TVB 城 ➔ 旺角雅蘭中心 (直達特快)</span>
                    <span className="text-[10px] text-slate-400">下一班：18:30</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-lg">
                    預備中
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* BOTTOM NAVIGATION BAR (要求: TVB快訊、人事福利、工作日常、活動優化、資源中心) */}
      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-1.5 flex items-center justify-around shrink-0 select-none z-20">
        
        {/* 1. TVB快訊 */}
        <button
          type="button"
          onClick={() => handleTabClick('NEWS', 'TVB快訊')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all cursor-pointer ${
            activeBottomTab === 'NEWS'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Newspaper size={18} />
          <span className="text-[9px] mt-0.5 font-bold">TVB快訊</span>
        </button>

        {/* 2. 人事福利 */}
        <button
          type="button"
          onClick={() => handleTabClick('BENEFITS', '人事福利')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all cursor-pointer ${
            activeBottomTab === 'BENEFITS'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Users size={18} />
          <span className="text-[9px] mt-0.5 font-bold">人事福利</span>
        </button>

        {/* 3. 工作日常 (ACTIVE & FUNCTIONAL) */}
        <button
          type="button"
          onClick={() => handleTabClick('DAILY_WORK', '工作日常')}
          className={`flex flex-col items-center justify-center p-1 px-2 rounded-xl transition-all cursor-pointer relative ${
            activeBottomTab === 'DAILY_WORK'
              ? 'text-blue-600 dark:text-blue-400 font-black'
              : 'text-slate-400'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-blue-600 absolute -top-0.5 left-1/2 -translate-x-1/2"></div>
          <Briefcase size={19} />
          <span className="text-[9.5px] mt-0.5 font-black">工作日常</span>
        </button>

        {/* 4. 活動優化 */}
        <button
          type="button"
          onClick={() => handleTabClick('EVENTS', '活動優化')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all cursor-pointer ${
            activeBottomTab === 'EVENTS'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles size={18} />
          <span className="text-[9px] mt-0.5 font-bold">活動優化</span>
        </button>

        {/* 5. 資源中心 */}
        <button
          type="button"
          onClick={() => handleTabClick('RESOURCES', '資源中心')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all cursor-pointer ${
            activeBottomTab === 'RESOURCES'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <FolderKanban size={18} />
          <span className="text-[9px] mt-0.5 font-bold">資源中心</span>
        </button>

      </div>

    </div>
  );
};
