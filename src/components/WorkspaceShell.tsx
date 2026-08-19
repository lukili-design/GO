/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, PurposeCode, ClockInLog } from '../types';
import { INITIAL_BOOKINGS, INITIAL_CLOCK_IN_LOGS, INITIAL_BEACONS, INITIAL_WIFIS, INITIAL_GPS_CONFIG, getPurposeOption } from '../data/mockData';
import { BookingForm } from './BookingForm';
import { BookingRecords } from './BookingRecords';
import { InvitationCard } from './InvitationCard';
import { CmsConsole } from './CmsConsole';
import { SecurityConsole } from './SecurityConsole';
import { DailyWorkApp } from './DailyWorkApp';
import { PcVisitorPortal } from './PcVisitorPortal';
import { SystemRequirementsDoc } from './SystemRequirementsDoc';
import { 
  Smartphone, Mail, Shield, RefreshCw, CheckCircle, Clock, Trash2, 
  ArrowRight, MapPin, Sparkles, Building, User, Info, SmartphoneIcon, 
  ExternalLink, Laptop, Monitor, Sliders, Database, Calendar
} from 'lucide-react';

export const WorkspaceShell: React.FC = () => {
  // Sound synthesizer for UI feedback
  const triggerSound = (freq: number, type: OscillatorType, duration: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // Main Bookings State
  const [bookings, setBookings] = useState<Booking[]>(() => {
    // Clear legacy v8 cache to ensure new pending test records load seamlessly
    localStorage.removeItem('tvb_go_bookings_v8');
    const saved = localStorage.getItem('tvb_go_bookings_v10');
    if (saved) {
      try {
        const parsed: Booking[] = JSON.parse(saved);
        // Automatically merge any missing initial bookings (e.g. newly added pending mock records B008-B011)
        const existingIds = new Set(parsed.map(b => b.id));
        const missingInitial = INITIAL_BOOKINGS.filter(b => !existingIds.has(b.id));
        if (missingInitial.length > 0) {
          const merged = [...parsed, ...missingInitial];
          localStorage.setItem('tvb_go_bookings_v10', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse bookings from localStorage', e);
      }
    }
    localStorage.setItem('tvb_go_bookings_v10', JSON.stringify(INITIAL_BOOKINGS));
    return INITIAL_BOOKINGS;
  });

  // Clock-in logs state
  const [clockInLogs, setClockInLogs] = useState<ClockInLog[]>(() => {
    const saved = localStorage.getItem('tvb_go_clockin_logs_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CLOCK_IN_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('tvb_go_clockin_logs_v2', JSON.stringify(clockInLogs));
  }, [clockInLogs]);

  const handleAddClockInLog = (newLog: Omit<ClockInLog, 'id'>) => {
    const logItem: ClockInLog = {
      ...newLog,
      id: `LOG-${Date.now().toString().slice(-6)}`
    };
    setClockInLogs(prev => [logItem, ...prev]);
  };

  // Workspace view toggle: 'DUAL' (split screen phone + sandbox) | 'PC_PORTAL' (desktop employee visitor portal) | 'CMS' (full administration portal) | 'SECURITY' (gate security portal)
  const [workspaceMode, setWorkspaceMode] = useState<'DUAL' | 'PC_PORTAL' | 'CMS' | 'SECURITY'>('DUAL');

  const handleUpdateBookingIdCard = (id: string, idCard: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, visitorIdCard: idCard } : b))
    );
  };

  // Mobile App View States
  // 'WORKBENCH' | 'FORM' | 'RECORDS' | 'INVITATION'
  const [mobileView, setMobileView] = useState<'WORKBENCH' | 'FORM' | 'RECORDS' | 'INVITATION'>('WORKBENCH');
  const [activeInvitation, setActiveInvitation] = useState<Booking | null>(null);

  // Email Inbox Simulator States
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [showEmailViewer, setShowEmailViewer] = useState<boolean>(false);

  // Security Scanner Simulator States
  const [scannedMessage, setScannedMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('tvb_go_bookings_v10', JSON.stringify(bookings));
  }, [bookings]);

  // Action: Add New Booking
  const handleAddBooking = (newBookingData: Omit<Booking, 'id' | 'status' | 'createdAt' | 'invitationCode'> & { isWalkIn?: boolean, isPendingApproval?: boolean }) => {
    // Generate unique ID and booking code
    const newId = `B${String(bookings.length + 1).padStart(3, '0')}`;
    const codeNum1 = Math.floor(1000 + Math.random() * 9000);
    const codeChar = newBookingData.visitorName.slice(0, 2).replace(/[^a-zA-Z]/g, 'XM').toUpperCase();
    
    const isWalkIn = newBookingData.isWalkIn === true;
    const isPendingApproval = false;
    
    const newCode = isWalkIn 
      ? `TEMP-${codeNum1}-${codeChar || 'WK'}`
      : `TVB-${codeNum1}-${codeChar || 'GP'}`;

    const newBooking: Booking = {
      ...newBookingData,
      id: newId,
      status: isWalkIn ? BookingStatus.CHECKED_IN : BookingStatus.UPCOMING,
      createdAt: new Date().toISOString(),
      invitationCode: newCode,
      checkedInAt: isWalkIn ? new Date().toISOString() : undefined,
      isPendingApproval: isPendingApproval,
      // Default mock host info if not provided
      hostEmployeeName: newBookingData.hostEmployeeName || '陳大文 (Tai Man Chan)',
      hostEmployeeDept: newBookingData.hostEmployeeDept || '藝員管理部 (Talent Relations)',
      contactPerson: newBookingData.contactPerson || 'May Tang',
      responsibleDept: newBookingData.responsibleDept || 'New Media Group',
      contactPhone: newBookingData.contactPhone || '91946190'
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Only update mobile app state if NOT a walk-in registered from CMS
    if (!isWalkIn) {
      setActiveInvitation(newBooking);
      setMobileView('INVITATION');
      // Auto-select in the email inbox to show the visitor received the email immediately
      setSelectedEmailId(newBooking.id);
    }
    
    triggerSound(880, 'sine', 0.15); // Success chime
  };

  // Action: Cancel Booking (Transition: UPCOMING -> CANCELLED)
  const handleCancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: BookingStatus.CANCELLED, isPendingApproval: false } : b
      )
    );
    // If we're looking at this in the invitation, update active invitation state
    if (activeInvitation?.id === id) {
      setActiveInvitation((prev) => prev ? { ...prev, status: BookingStatus.CANCELLED, isPendingApproval: false } : null);
    }
    triggerSound(330, 'triangle', 0.2); // Cancel chime
  };

  // Action: Delete Booking completely
  const handleDeleteBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    if (activeInvitation?.id === id) {
      setActiveInvitation(null);
      setMobileView('FORM');
    }
    triggerSound(200, 'triangle', 0.2);
  };

  // Action: Approve Booking
  const handleApproveBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, isPendingApproval: false, status: BookingStatus.UPCOMING } : b
      )
    );
    if (activeInvitation?.id === id) {
      setActiveInvitation((prev) => prev ? { ...prev, isPendingApproval: false, status: BookingStatus.UPCOMING } : null);
    }
    setScannedMessage({
      type: 'success',
      text: `預約申請審核成功！已發送通知電郵給保安科及接待處。`,
    });
    triggerSound(900, 'sine', 0.15);
    setTimeout(() => setScannedMessage(null), 5000);
  };

  // Action: Reject Booking
  const handleRejectBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, isPendingApproval: false, status: BookingStatus.CANCELLED, approvalNotes: '申請遭後台退回' } : b
      )
    );
    if (activeInvitation?.id === id) {
      setActiveInvitation((prev) => prev ? { ...prev, isPendingApproval: false, status: BookingStatus.CANCELLED, approvalNotes: '申請遭後台退回' } : null);
    }
    setScannedMessage({
      type: 'success',
      text: `已駁回訪客預約登記申請。`,
    });
    triggerSound(300, 'triangle', 0.25);
    setTimeout(() => setScannedMessage(null), 5000);
  };

  // Action: Update direct Booking status (e.g. from table or simulation)
  const handleUpdateBookingStatus = (id: string, status: BookingStatus, checkInOrOutTime?: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const updated = { ...b, status };
        if (status === BookingStatus.CHECKED_IN) {
          updated.checkedInAt = checkInOrOutTime || new Date().toISOString();
        } else if (status === BookingStatus.COMPLETED) {
          updated.checkedOutAt = new Date().toISOString();
        }
        return updated;
      })
    );

    // Update active invitation
    if (activeInvitation?.id === id) {
      setActiveInvitation((prev) => {
        if (!prev) return null;
        const updated = { ...prev, status };
        if (status === BookingStatus.CHECKED_IN) {
          updated.checkedInAt = checkInOrOutTime || new Date().toISOString();
        } else if (status === BookingStatus.COMPLETED) {
          updated.checkedOutAt = new Date().toISOString();
        }
        return updated;
      });
    }

    const name = bookings.find((b) => b.id === id)?.visitorName || '訪客';
    setScannedMessage({
      type: 'success',
      text: status === BookingStatus.CHECKED_IN 
        ? `簽入核銷成功！已准予 [${name}] 通行入廠。` 
        : `離場簽出成功！訪客 [${name}] 已結束今日電視城到訪。`,
    });
    
    triggerSound(status === BookingStatus.CHECKED_IN ? 1000 : 600, 'sine', 0.12);
    setTimeout(() => setScannedMessage(null), 5000);
  };

  // Action: Check-In (Transition: UPCOMING -> CHECKED_IN)
  const handleSimulateCheckIn = (id: string) => {
    handleUpdateBookingStatus(id, BookingStatus.CHECKED_IN, new Date().toISOString());
  };

  // Action: Check-Out (Transition: CHECKED_IN -> COMPLETED)
  const handleSimulateCheckOut = (id: string) => {
    handleUpdateBookingStatus(id, BookingStatus.COMPLETED);
  };

  // Action: Rebook (Pre-fill details)
  const [rebookData, setRebookData] = useState<Booking | null>(null);
  const handleRebook = (booking: Booking) => {
    // To keep it simple, we just prefill a new booking using the form and alert the user
    // In our case we can simulate pre-filling in the form
    setMobileView('FORM');
    // Alert the user we filled it
    alert(`已為訪客 ${booking.visitorName} 載入預約資料，您可以直接修改到訪時間並重新生成邀請。`);
    // Find matching form input or let component re-render with state (we trigger state pre-fill in a neat way by using a component prop or reset)
  };

  const handleResetData = () => {
    if (window.confirm('確定要重設所有預約資料為預設範例嗎？')) {
      setBookings(INITIAL_BOOKINGS);
      setMobileView('WORKBENCH');
      setActiveInvitation(null);
      setSelectedEmailId(null);
      setShowEmailViewer(false);
      localStorage.removeItem('tvb_go_bookings_v3');
      localStorage.removeItem('tvb_go_clockin_logs_v2');
    }
  };

  // Select an active email
  const currentEmailBooking = bookings.find((b) => b.id === selectedEmailId);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      
      {/* Top Main Navigation Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-emerald-500 to-red-500 p-[2px] shadow-md">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[9px] flex items-center justify-center font-black text-sm text-slate-950 dark:text-white tracking-wider">
              TVB
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30">
                TVB Go 辦公套件
              </span>
              <span className="text-xs font-semibold text-slate-400">Step 1: 預約與邀請端</span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
              <span>訪客預約登記與邀請系統</span>
              <Sparkles size={16} className="text-amber-500 fill-amber-500" />
            </h1>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs flex items-center gap-2 border border-slate-200/50 dark:border-slate-700/50">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-600 dark:text-slate-400">雙端交互模擬器</span>
          </div>

          <button
            onClick={handleResetData}
            type="button"
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-all"
          >
            <RefreshCw size={13} />
            <span>重設範例資料</span>
          </button>
        </div>
      </header>

      {/* Workspace Module Selector / System Mode Tabs */}
      <div className="bg-slate-150/80 dark:bg-slate-900/45 border-b border-slate-200 dark:border-slate-800 p-2 flex justify-center">
        <div className="bg-white dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex shadow-xs gap-1 max-w-3xl w-full overflow-x-auto">
          <button
            onClick={() => {
              setWorkspaceMode('DUAL');
              triggerSound(600, 'sine', 0.08);
            }}
            type="button"
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              workspaceMode === 'DUAL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Smartphone size={14} className="shrink-0" />
            <span className="whitespace-nowrap">📱 手機與放行沙盒</span>
          </button>

          <button
            onClick={() => {
              setWorkspaceMode('PC_PORTAL');
              triggerSound(700, 'sine', 0.08);
            }}
            type="button"
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              workspaceMode === 'PC_PORTAL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Monitor size={14} className="shrink-0" />
            <span className="whitespace-nowrap">💻 PC版訪客預約中心</span>
          </button>
          
          <button
            onClick={() => {
              setWorkspaceMode('CMS');
              triggerSound(800, 'sine', 0.08);
            }}
            type="button"
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative cursor-pointer whitespace-nowrap shrink-0 ${
              workspaceMode === 'CMS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Laptop size={14} className="shrink-0" />
            <span className="whitespace-nowrap">🖥️ 電視城 CMS 管理系統</span>
          </button>

          <button
            onClick={() => {
              setWorkspaceMode('SECURITY');
              triggerSound(900, 'sine', 0.08);
            }}
            type="button"
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative cursor-pointer whitespace-nowrap shrink-0 ${
              workspaceMode === 'SECURITY'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Shield size={14} className="shrink-0" />
            <span className="whitespace-nowrap">🛡️ 安保門禁系統</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col">
        {workspaceMode === 'PC_PORTAL' ? (
          <PcVisitorPortal
            bookings={bookings}
            onAddBooking={handleAddBooking}
            onCancelBooking={handleCancelBooking}
            triggerSound={triggerSound}
          />
        ) : workspaceMode === 'SECURITY' ? (
          <SecurityConsole
            bookings={bookings}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onUpdateBookingIdCard={handleUpdateBookingIdCard}
            triggerSound={triggerSound}
          />
        ) : workspaceMode === 'CMS' ? (
          <CmsConsole
            bookings={bookings}
            onAddBooking={handleAddBooking}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onCancelBooking={handleCancelBooking}
            onDeleteBooking={handleDeleteBooking}
            triggerSound={triggerSound}
          />
        ) : (
          <div className="w-full py-4 space-y-4">
        
            <div className="w-full flex flex-col items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                <SmartphoneIcon size={14} className="text-blue-500" />
                <span>員工端 (TVB Go App 手機畫面)</span>
              </span>
              
              {/* Quick Screen Switcher */}
              <div className="inline-flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMobileView('WORKBENCH')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mobileView === 'WORKBENCH'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  📱 工作台
                </button>
                <button
                  type="button"
                  onClick={() => setMobileView('FORM')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mobileView === 'FORM'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  📝 訪客預約
                </button>
                <button
                  type="button"
                  onClick={() => setMobileView('RECORDS')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mobileView === 'RECORDS'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  📋 我的預約
                </button>
              </div>
            </div>

            {/* Layout Wrapper: Smartphone in center, Requirement Doc directly below */}
            <div className="flex flex-col items-center justify-center gap-8 w-full max-w-5xl mx-auto">
              
              {/* Smartphone Frame Wrapper */}
              <div className="w-full max-w-[375px] h-[720px] bg-slate-950 rounded-[48px] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-4 border-slate-800/90 relative flex flex-col shrink-0">
                
                {/* Phone Speaker & Camera Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
                  <div className="w-12 h-1 bg-slate-800 rounded-full mb-1"></div>
                  <div className="w-2.5 h-2.5 bg-slate-900 rounded-full mb-1 ml-2 border border-slate-800"></div>
                </div>

                {/* Inner phone screen */}
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[38px] overflow-hidden flex flex-col relative border border-slate-900/50">
                  
                  {/* Phone Status Bar */}
                  <div className="h-6 bg-white dark:bg-slate-950 px-6 pt-1 flex justify-between items-center text-[10px] text-slate-700 dark:text-slate-300 font-medium select-none z-10">
                    <span>09:41</span>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-slate-200 dark:bg-slate-800 px-1 py-0.2 rounded text-[8px] font-black">5G</span>
                      <div className="w-4 h-2 border border-slate-400 rounded-sm p-[1px] flex items-center">
                        <div className="w-full h-full bg-slate-700 dark:bg-slate-300 rounded-2xs"></div>
                      </div>
                    </div>
                  </div>

                  {/* Screen Content Switcher */}
                  <div className="flex-1 overflow-hidden relative">
                    
                    {/* 1. Daily Work / Workbench App */}
                    {mobileView === 'WORKBENCH' && (
                      <DailyWorkApp
                        clockInLogs={clockInLogs}
                        onAddClockInLog={handleAddClockInLog}
                        beacons={INITIAL_BEACONS}
                        wifis={INITIAL_WIFIS}
                        gpsConfig={INITIAL_GPS_CONFIG}
                        onOpenVisitorBooking={() => setMobileView('FORM')}
                        onOpenVisitorRecords={() => setMobileView('RECORDS')}
                        triggerSound={triggerSound}
                      />
                    )}

                    {/* 2. Registration Form view */}
                    {mobileView === 'FORM' && (
                      <BookingForm
                        onSubmit={handleAddBooking}
                        onViewRecords={() => setMobileView('RECORDS')}
                        onBackToWorkbench={() => setMobileView('WORKBENCH')}
                      />
                    )}

                    {/* 3. Booking Records view */}
                    {mobileView === 'RECORDS' && (
                      <BookingRecords
                        bookings={bookings}
                        onBack={() => setMobileView('FORM')}
                        onCancelBooking={handleCancelBooking}
                        onSimulateCheckIn={handleSimulateCheckIn}
                        onSimulateCheckOut={handleSimulateCheckOut}
                        onViewPass={(b) => {
                          setActiveInvitation(b);
                          setMobileView('INVITATION');
                        }}
                        onRebook={(b) => {
                          // Custom prefill rebooking details
                          setRebookData(b);
                          handleRebook(b);
                        }}
                      />
                    )}

                    {/* 4. Generated Pass View */}
                    {mobileView === 'INVITATION' && activeInvitation && (
                      <InvitationCard
                        booking={activeInvitation}
                        onBack={() => setMobileView('RECORDS')}
                        onSimulateCheckIn={handleSimulateCheckIn}
                        onSimulateCheckOut={handleSimulateCheckOut}
                      />
                    )}

                  </div>

                  {/* Bottom Home Indicator Bar (iOS Style) */}
                  <div className="h-5 bg-white dark:bg-slate-950 flex items-center justify-center pb-1">
                    <button
                      onClick={() => {
                        if (mobileView !== 'WORKBENCH') setMobileView('WORKBENCH');
                        else setMobileView('FORM');
                      }}
                      className="w-24 h-1 bg-slate-300 dark:bg-slate-700 rounded-full hover:bg-slate-400 transition-colors cursor-pointer"
                      title="回到手機工作台"
                    />
                  </div>

                </div>
              </div>

              {/* 系統需求與架構規格說明文檔 (放在 APP 下方) */}
              <div className="w-full">
                <SystemRequirementsDoc />
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Footer credits and system metadata */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TVB Go 辦公智能系統 v2.4 (React + Vite + Tailwind 4)</span>
          <span className="text-[11px]">本模組專供【Step 1: 預約與邀請 (Request & Invitation)】功能展示與業務核銷閉環模擬</span>
        </div>
      </footer>

    </div>
  );
};
