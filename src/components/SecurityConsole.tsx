/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { getPurposeOption, getVisitorTypeLabel } from '../data/mockData';
import { 
  ShieldCheck, QrCode, Scan, Search, CheckCircle2, Clock, 
  AlertTriangle, UserCheck, ShieldAlert, FileText, CheckCircle, 
  XCircle, Filter, Calendar, MapPin, Building, Phone, Car, 
  CreditCard, ArrowRight, User, Sparkles, RefreshCw, BarChart3,
  Layers, Lock, Users, Plus, Trash2, Eye, X
} from 'lucide-react';

interface SecurityConsoleProps {
  bookings: Booking[];
  onUpdateBookingStatus: (id: string, status: BookingStatus, checkedInAt?: string) => void;
  onUpdateBookingIdCard?: (id: string, idCard: string) => void;
  triggerSound: (freq: number, type: OscillatorType, duration: number) => void;
}

export interface GateScanRecord {
  id: string;
  bookingId: string;
  invitationCode: string;
  visitorName: string;
  visitorType?: string;
  clientTier?: string;
  visitMode?: string;
  company: string;
  visitorIdCard: string;
  idCardType: string;
  hostEmployeeName: string;
  hostEmployeeDept: string;
  responsibleDept?: string;
  destination: string;
  licensePlate?: string;
  gateLocation: string;
  scannedAt: string;
  operatorGuard: string;
  notes?: string;
}

export interface VisitorIdRecord {
  id: string;
  name: string;
  idCardType: string;
  idCardNumber: string;
  isPrimary?: boolean;
}

const getVisitModeLabel = (mode?: string) => {
  if (mode === 'MULTI_PASS') return '多次通行證';
  return '單次到訪';
};

const getHostEmployeeInfo = (name?: string, dept?: string) => {
  const hName = name || '王小明 (Siu Ming Wong)';
  const hDept = dept || '綜藝節目部';

  if (hName.includes('王小明')) {
    return { id: 'EMP001', empName: '王小明 (Siu Ming Wong)', phone: '2335-7111', dept: hDept };
  }
  if (hName.includes('陳大文')) {
    return { id: 'EMP002', empName: '陳大文 (Tai Man Chan)', phone: '2335-7890', dept: hDept };
  }
  if (hName.includes('黃美玲')) {
    return { id: 'EMP005', empName: '黃美玲 (May Wong)', phone: '2335-8822', dept: hDept };
  }
  if (hName.includes('李麗華')) {
    return { id: 'EMP003', empName: '李麗華 (Lai Wah Lee)', phone: '2335-9000', dept: hDept };
  }
  return { id: 'EMP008', empName: hName, phone: '2335-7788', dept: hDept };
};

export const SecurityConsole: React.FC<SecurityConsoleProps> = ({
  bookings,
  onUpdateBookingStatus,
  onUpdateBookingIdCard,
  triggerSound,
}) => {
  // Main Security Navigation Tab
  // 'SCANNER' (掃碼核銷與證件登記) | 'SCAN_LOGS' (今日掃碼記錄) | 'APPOINTMENTS' (訪客預約記錄與看板)
  const [securityTab, setSecurityTab] = useState<'SCANNER' | 'SCAN_LOGS' | 'APPOINTMENTS'>('SCANNER');

  // Scanner Simulator State
  const [scanInputCode, setScanInputCode] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    bookings.find(b => b.status === BookingStatus.UPCOMING || b.isPendingApproval)?.id || bookings[0]?.id || null
  );

  // Credential Entry Form States
  const [idCardType, setIdCardType] = useState('香港身份證 (HKID)');
  const [visitorIdCardInput, setVisitorIdCardInput] = useState('');
  const [gateLocation, setGateLocation] = useState('第一門崗 (電視城正門)');
  const [operatorGuard, setOperatorGuard] = useState('安保隊長 - 李國強 (Officer Lee)');
  const [securityNotes, setSecurityNotes] = useState('');
  const [scanToastMessage, setScanToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Today's Gate Scan Logs State
  const [scanLogs, setScanLogs] = useState<GateScanRecord[]>([
    {
      id: 'SCAN-1001',
      bookingId: 'B001',
      invitationCode: 'TVB-8831-XM',
      visitorName: '鄭嘉穎 (Kevin Cheng)',
      visitorType: 'SINGLE',
      clientTier: 'NORMAL',
      visitMode: 'SINGLE_VISIT',
      company: '索尼音樂 Sony Music',
      visitorIdCard: 'HKID: A928301(4)',
      idCardType: '香港身份證 (HKID)',
      hostEmployeeName: '王小明 (Siu Ming Wong)',
      hostEmployeeDept: '綜藝節目部',
      responsibleDept: '綜藝節目部',
      destination: '7樓 行政會議室 A',
      licensePlate: '粵Z A888港',
      gateLocation: '第一門崗 (電視城正門)',
      scannedAt: '2026-08-18 09:15:22',
      operatorGuard: '安保員 - 張志強',
      notes: '個人攝影裝備已辦理安保登記放行'
    },
    {
      id: 'SCAN-1002',
      bookingId: 'B005',
      invitationCode: 'TVB-3391-KC',
      visitorName: '古天樂 (Louis Koo)',
      visitorType: 'SINGLE',
      clientTier: 'VIP',
      visitMode: 'SINGLE_VISIT',
      company: '天下一電影 One Cool Film',
      visitorIdCard: 'HKID: D109283(8)',
      idCardType: '香港身份證 (HKID)',
      hostEmployeeName: '黃美玲 (May Wong)',
      hostEmployeeDept: '藝員管理部',
      responsibleDept: '藝員管理部',
      destination: '2樓 影視製作中心 B廠',
      licensePlate: 'TVB 8888',
      gateLocation: '行政大樓專用VIP門崗',
      scannedAt: '2026-08-18 10:42:09',
      operatorGuard: '安保隊長 - 李國強',
      notes: 'VIP綠色通道直接放行'
    },
    {
      id: 'SCAN-1003',
      bookingId: 'B006',
      invitationCode: 'TVB-5510-CL',
      visitorName: '劉德華 (Andy Lau)',
      visitorType: 'TEAM',
      clientTier: 'VIP',
      visitMode: 'MULTI_PASS',
      company: '映藝娛樂 Focus Group',
      visitorIdCard: 'HKID: E330192(1)',
      idCardType: '香港身份證 (HKID)',
      hostEmployeeName: '陳大文 (Tai Man Chan)',
      hostEmployeeDept: '製作部',
      responsibleDept: '製作部',
      destination: '1號 錄影廠 (Studio 1)',
      licensePlate: 'VIP 999',
      gateLocation: '第一門崗 (電視城正門)',
      scannedAt: '2026-08-18 11:30:00',
      operatorGuard: '安保隊長 - 李國強',
      notes: '攜帶車輛證件通行'
    },
    {
      id: 'SCAN-1000',
      bookingId: 'B003',
      invitationCode: 'TVB-4482-CL2',
      visitorName: '陳美玲 (Chan May Ling)',
      visitorType: 'SINGLE',
      clientTier: 'NORMAL',
      visitMode: 'SINGLE_VISIT',
      company: '羅兵咸永道會計師事務所 (PwC HK)',
      visitorIdCard: 'HKID: G881290(3)',
      idCardType: '香港身份證 (HKID)',
      hostEmployeeName: '陳大文 (Tai Man Chan)',
      hostEmployeeDept: '財務部 (Finance Dept)',
      responsibleDept: '財務部',
      destination: '5樓 財務審計部 (5F Audit Dept)',
      gateLocation: '第一門崗 (電視城正門)',
      scannedAt: '2026-08-17 14:20:10',
      operatorGuard: '安保員 - 張志強',
      notes: '中期會計核查進場'
    },
    {
      id: 'SCAN-0999',
      bookingId: 'B004',
      invitationCode: 'TVB-9921-SF',
      visitorName: '王大同 (Wong Tai Tung)',
      visitorType: 'SINGLE',
      clientTier: 'NORMAL',
      visitMode: 'SINGLE_VISIT',
      company: '順豐速運 (SF Express)',
      visitorIdCard: 'HKID: F301928(4)',
      idCardType: '香港身份證 (HKID)',
      hostEmployeeName: '張志強 (Chi Keung Cheung)',
      hostEmployeeDept: '行政處',
      responsibleDept: '行政處',
      destination: '2樓 行政大堂 (2F Admin Lobby)',
      licensePlate: 'SF 8899',
      gateLocation: '第一門崗 (電視城正門)',
      scannedAt: '2026-08-16 10:15:00',
      operatorGuard: '安保員 - 李大膽',
      notes: '快遞件簽收核銷放行'
    }
  ]);

  // Filters & Time Range Scope State (Default: 'TODAY')
  const [scanLogsTimeRange, setScanLogsTimeRange] = useState<'TODAY' | 'ALL'>('TODAY');
  const [appointmentsTimeRange, setAppointmentsTimeRange] = useState<'TODAY' | 'ALL'>('TODAY');
  const [scanLogsSearchTerm, setScanLogsSearchTerm] = useState('');
  const [appointmentsSearchTerm, setAppointmentsSearchTerm] = useState('');
  const [appointmentsStatusFilter, setAppointmentsStatusFilter] = useState<'ALL' | 'UPCOMING' | 'CHECKED_IN' | 'HISTORY_CANCELLED'>('ALL');

  // Viewing Details Modal State
  const [viewingSecurityBooking, setViewingSecurityBooking] = useState<Booking | GateScanRecord | null>(null);

  // Helper to extract visitor list with ID card numbers for modal
  const getModalVisitorsList = (item: Booking | GateScanRecord) => {
    if ('visitors' in item && item.visitors && item.visitors.length > 0) {
      return item.visitors.map((v, i) => ({
        name: v.name,
        email: v.email || ('contactEmail' in item ? item.contactEmail : ''),
        idNumber: v.idNumber || (i === 0 ? item.visitorIdCard : '')
      }));
    }

    if (item.visitorIdCard && item.visitorIdCard.includes('|')) {
      const parts = item.visitorIdCard.split('|').map(s => s.trim());
      return parts.map((part, i) => {
        const colonIdx = part.indexOf(':');
        let name = i === 0 ? item.visitorName : `隨行訪客 #${i + 1}`;
        let idNum = part;
        if (colonIdx > 0) {
          const left = part.slice(0, colonIdx).trim();
          const right = part.slice(colonIdx + 1).trim();
          if (left.includes('(')) {
            name = left.split('(')[0].trim();
          }
          idNum = right;
        }
        return {
          name: name || item.visitorName,
          email: 'contactEmail' in item ? item.contactEmail : '',
          idNumber: idNum
        };
      });
    }

    return [{
      name: item.visitorName,
      email: 'contactEmail' in item ? item.contactEmail : '',
      idNumber: item.visitorIdCard || ''
    }];
  };

  // Currently Selected Visitor Booking for Scanning Verification
  const activeBooking = bookings.find(b => b.id === selectedBookingId) || bookings[0];

  // Multi-Visitor ID Entries State
  const [multiVisitorEntries, setMultiVisitorEntries] = useState<VisitorIdRecord[]>([]);

  // Sync multiVisitorEntries when selected booking changes
  React.useEffect(() => {
    if (activeBooking) {
      const count = Math.max(activeBooking.totalVisitorsCount || 1, 1);
      const existingRaw = activeBooking.visitorIdCard || activeBooking.visitors?.[0]?.idNumber || '';
      const existingIdCards = existingRaw ? existingRaw.split('|').map(s => s.trim()) : [];

      const initialEntries: VisitorIdRecord[] = [];

      // 1. Primary Visitor
      initialEntries.push({
        id: 'v-1',
        name: activeBooking.visitorName,
        idCardType: '香港身份證 (HKID)',
        idCardNumber: existingIdCards[0]?.replace(/^[^:]+:\s*/, '') || visitorIdCardInput || '',
        isPrimary: true,
      });

      // 2. Accompanying Visitors up to totalVisitorsCount
      for (let i = 2; i <= count; i++) {
        const rawExisting = existingIdCards[i - 1] || '';
        initialEntries.push({
          id: `v-${i}`,
          name: `隨行訪客 #${i}`,
          idCardType: '香港身份證 (HKID)',
          idCardNumber: rawExisting.replace(/^[^:]+:\s*/, '') || '',
          isPrimary: false,
        });
      }

      setMultiVisitorEntries(initialEntries);
      setVisitorIdCardInput(existingIdCards[0] || '');
    }
  }, [selectedBookingId, activeBooking?.id, activeBooking?.totalVisitorsCount]);

  const handleUpdateVisitorEntry = (id: string, field: keyof VisitorIdRecord, value: string) => {
    setMultiVisitorEntries(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddVisitorEntry = () => {
    setMultiVisitorEntries(prev => [
      ...prev,
      {
        id: `v-${Date.now()}`,
        name: `隨行訪客 #${prev.length + 1}`,
        idCardType: '香港身份證 (HKID)',
        idCardNumber: '',
        isPrimary: false,
      }
    ]);
  };

  const handleRemoveVisitorEntry = (id: string) => {
    setMultiVisitorEntries(prev => prev.filter(item => item.id !== id));
  };

  // Handler: Execute Barcode / QR Code Search
  const handleTriggerScannerSearch = (codeToSearch?: string) => {
    const code = (codeToSearch || scanInputCode).trim().toUpperCase();
    if (!code) {
      setScanToastMessage({ type: 'error', text: '請輸入或掃描有效的通行證代碼 (QR Code)！' });
      triggerSound(300, 'sawtooth', 0.2);
      setTimeout(() => setScanToastMessage(null), 3000);
      return;
    }

    const matched = bookings.find(
      b => b.invitationCode.toUpperCase().includes(code) || 
           b.id.toUpperCase() === code ||
           b.visitorName.toLowerCase().includes(code.toLowerCase())
    );

    if (matched) {
      setSelectedBookingId(matched.id);
      setScanInputCode(matched.invitationCode);
      setScanToastMessage({ type: 'success', text: `🎯 成功識別訪客通行證 [${matched.invitationCode}]：${matched.visitorName}` });
      triggerSound(1000, 'sine', 0.15);
      setTimeout(() => triggerSound(1400, 'sine', 0.2), 100);
      setTimeout(() => setScanToastMessage(null), 3500);
    } else {
      setScanToastMessage({ type: 'error', text: `❌ 未找到匹配通行證 [${code}] 的訪客預約記錄，請重新核對！` });
      triggerSound(250, 'square', 0.3);
      setTimeout(() => setScanToastMessage(null), 4000);
    }
  };

  // Handler: Confirm Security Clearance & Save Multi-Visitor ID Credentials
  const handleConfirmClearance = () => {
    if (!activeBooking) return;

    const validEntries = multiVisitorEntries.filter(v => v.idCardNumber.trim() !== '');

    if (validEntries.length === 0) {
      alert('⚠️ 請至少輸入主訪客的證件號碼 (如 HKID/護照號碼)，以完成安保放行備案！');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // Format all visitor ID cards into a single string for storage and logging
    // Example: "鄭嘉穎 (HKID): A928301(4) | 隨行訪客 #2 (HKID): B987654(3)"
    const combinedIdCardsString = multiVisitorEntries
      .filter(v => v.idCardNumber.trim() !== '')
      .map(v => `${v.name} (${v.idCardType.split(' ')[0]}): ${v.idCardNumber.trim()}`)
      .join(' | ');

    const hostInfo = getHostEmployeeInfo(activeBooking.hostEmployeeName, activeBooking.hostEmployeeDept);

    // 1. Update Booking Status to CHECKED_IN
    onUpdateBookingStatus(activeBooking.id, BookingStatus.CHECKED_IN, nowStr);
    if (onUpdateBookingIdCard) {
      onUpdateBookingIdCard(activeBooking.id, combinedIdCardsString);
    }

    // 2. Append new record to Today's Scan Logs
    const newLogItem: GateScanRecord = {
      id: `SCAN-${Date.now().toString().slice(-6)}`,
      bookingId: activeBooking.id,
      invitationCode: activeBooking.invitationCode,
      visitorName: activeBooking.visitorName,
      visitorType: activeBooking.visitorType,
      clientTier: activeBooking.clientTier,
      visitMode: activeBooking.visitMode,
      company: activeBooking.company || '個人訪客',
      visitorIdCard: combinedIdCardsString,
      idCardType: validEntries[0]?.idCardType || idCardType,
      hostEmployeeName: hostInfo.empName,
      hostEmployeeDept: hostInfo.dept,
      responsibleDept: activeBooking.responsibleDept || hostInfo.dept,
      destination: activeBooking.destination || '電視城大樓',
      licensePlate: activeBooking.licensePlate,
      gateLocation,
      scannedAt: nowStr,
      operatorGuard,
      notes: securityNotes.trim() || undefined
    };

    setScanLogs(prev => [newLogItem, ...prev]);

    // Play Success Chime & Toast
    triggerSound(800, 'sine', 0.12);
    setTimeout(() => triggerSound(1200, 'sine', 0.25), 100);

    setScanToastMessage({
      type: 'success',
      text: `🎉 已成功放行訪客 [${activeBooking.visitorName}]！已核銷登記 ${validEntries.length} 位訪客證件號碼。`
    });

    setSecurityNotes('');

    setTimeout(() => {
      setScanToastMessage(null);
    }, 5000);
  };

  // Date Helpers for 'TODAY' vs 'ALL' Filters
  const isTodayDateString = (dateStr?: string) => {
    if (!dateStr) return false;
    const todayDash = '2026-08-18';
    const todayDot = '2026.08.18';
    return dateStr.includes(todayDash) || dateStr.includes(todayDot);
  };

  const isTodayBooking = (b: Booking) => {
    if (isTodayDateString(b.visitDateTime) || isTodayDateString(b.startDateTime) || isTodayDateString(b.createdAt) || isTodayDateString(b.checkedInAt)) {
      return true;
    }
    return b.id.startsWith('B001') || b.id.startsWith('B005') || b.id.startsWith('B006') || b.id.includes('PENDING');
  };

  const isTodayScanLog = (log: GateScanRecord) => {
    return isTodayDateString(log.scannedAt);
  };

  // Filtered Scan Logs according to Time Range ('TODAY' vs 'ALL')
  const displayScanLogs = scanLogs.filter(log => {
    if (scanLogsTimeRange === 'TODAY' && !isTodayScanLog(log)) {
      return false;
    }
    if (!scanLogsSearchTerm.trim()) return true;
    const term = scanLogsSearchTerm.toLowerCase();
    return log.visitorName.toLowerCase().includes(term) ||
           log.visitorIdCard.toLowerCase().includes(term) ||
           log.invitationCode.toLowerCase().includes(term) ||
           log.hostEmployeeName.toLowerCase().includes(term) ||
           log.bookingId.toLowerCase().includes(term);
  });

  // Scoped Bookings according to Time Range ('TODAY' vs 'ALL')
  const scopedBookings = bookings.filter(b => {
    if (appointmentsTimeRange === 'TODAY') {
      return isTodayBooking(b);
    }
    return true; // 'ALL'
  });

  // Calculate Analytics Data for Selected Scope
  const totalAppointmentsCount = scopedBookings.length;
  const pendingArrivalCount = scopedBookings.filter(b => b.status === BookingStatus.UPCOMING || b.isPendingApproval || b.status === BookingStatus.PENDING).length;
  const inProgressCount = scopedBookings.filter(b => b.status === BookingStatus.CHECKED_IN).length;
  const historyCancelledCount = scopedBookings.filter(b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED).length;

  return (
    <div className="space-y-6">
      
      {/* Security Console Master Navigation Header */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase rounded-full tracking-wider flex items-center gap-1">
              <ShieldCheck size={12} /> 安保門禁控制台
            </span>
            <span className="text-xs text-slate-400 font-mono">Gate Security Portal v2.4</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
            <span>TVB 電視城安保門禁系統</span>
            <Lock size={18} className="text-amber-400" />
          </h2>
        </div>

        {/* Console Navigation Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800/80 gap-1 w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setSecurityTab('SCANNER');
              triggerSound(600, 'sine', 0.05);
            }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              securityTab === 'SCANNER'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Scan size={15} className="shrink-0" />
            <span className="whitespace-nowrap">掃碼核銷與證件登記</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSecurityTab('SCAN_LOGS');
              triggerSound(650, 'sine', 0.05);
            }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              securityTab === 'SCAN_LOGS'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText size={15} className="shrink-0" />
            <span className="whitespace-nowrap">今日掃碼記錄</span>
            <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded-full text-[10px] font-mono font-bold whitespace-nowrap">
              {scanLogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSecurityTab('APPOINTMENTS');
              triggerSound(700, 'sine', 0.05);
            }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              securityTab === 'APPOINTMENTS'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 size={15} className="shrink-0" />
            <span className="whitespace-nowrap">訪客預約記錄與看板</span>
          </button>
        </div>
      </div>

      {/* Global Toast Notification */}
      {scanToastMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-lg animate-bounce ${
          scanToastMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
        }`}>
          <div className="flex items-center gap-2">
            {scanToastMessage.type === 'success' ? <CheckCircle size={18} className="shrink-0" /> : <ShieldAlert size={18} className="shrink-0" />}
            <span>{scanToastMessage.text}</span>
          </div>
          <button type="button" onClick={() => setScanToastMessage(null)} className="text-xs opacity-60 hover:opacity-100 whitespace-nowrap shrink-0">關閉</button>
        </div>
      )}

      {/* TAB 1: 掃碼槍核銷與證件登記 (Scan Verification & Credentials Entry) */}
      {securityTab === 'SCANNER' && (
        <div className="space-y-6">
          
          {/* Top Barcode Scanner Gun Simulator Bar */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <QrCode size={18} className="text-blue-500 shrink-0" />
                  <span>掃碼槍輸入區 (Barcode / QR Code Scanner Simulator)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">使用硬體掃碼槍掃描訪客手機通行證 QR Code，或在下方直接輸入通行證代碼（例: TVB-8831-XM）</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs font-bold whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>掃碼槍連線正常 (Scanner Ready)</span>
                </span>
              </div>
            </div>

            {/* Input & Gun Trigger Button */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={scanInputCode}
                  onChange={(e) => setScanInputCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTriggerScannerSearch();
                  }}
                  placeholder="請掃描或輸入訪客通行證代碼 (例: TVB-8831-XM / B001)..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <Scan size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>

              <button
                type="button"
                onClick={() => handleTriggerScannerSearch()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-550 text-white font-bold rounded-2xl text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-all whitespace-nowrap shrink-0"
              >
                <Scan size={16} className="shrink-0" />
                <span className="whitespace-nowrap">🎯 觸發掃碼槍核驗</span>
              </button>
            </div>
          </div>

          {/* Detailed Visitor Profile & Security Verification Form */}
          {activeBooking ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Full Visitor Profile Card */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                
                {/* Header Profile Title */}
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-4">
                    {/* Visitor Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                      {activeBooking.visitorName.slice(0, 1)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold rounded-lg border border-blue-200 dark:border-blue-900/40">
                          {activeBooking.invitationCode}
                        </span>
                        {activeBooking.clientTier === 'VIP' && (
                          <span className="px-2 py-0.5 bg-amber-500 text-white font-black text-[10px] rounded-lg shadow-2xs">
                            👑 VIP 貴賓訪客
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-slate-50 mt-1">
                        {activeBooking.visitorName}
                      </h3>
                      <p className="text-xs text-slate-400">{activeBooking.company || '個人訪客'}</p>
                    </div>
                  </div>

                  {/* Booking Status Badge */}
                  <div>
                    {activeBooking.status === BookingStatus.CHECKED_IN ? (
                      <span className="px-3 py-1 bg-blue-600 text-white font-black text-xs rounded-xl shadow-2xs flex items-center gap-1">
                        🟢 進行中
                      </span>
                    ) : activeBooking.status === BookingStatus.UPCOMING ? (
                      <span className="px-3 py-1 bg-cyan-600 text-white font-black text-xs rounded-xl shadow-2xs flex items-center gap-1">
                        📅 待到訪
                      </span>
                    ) : activeBooking.isPendingApproval || activeBooking.status === BookingStatus.PENDING ? (
                      <span className="px-3 py-1 bg-amber-500 text-white font-black text-xs rounded-xl shadow-2xs flex items-center gap-1">
                        <Clock size={14} className="animate-spin" /> PENDING 待到訪
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-500 text-white font-black text-xs rounded-xl shadow-2xs flex items-center gap-1">
                        🚫 已取消
                      </span>
                    )}
                  </div>
                </div>

                {/* Visitor Info Details Grid */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={14} className="text-blue-500" />
                    <span>訪客基本資料與到訪目的</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] mb-0.5">預約 ID / 邀請碼</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <span className="text-slate-400">#{activeBooking.id}</span>
                        <span className="text-blue-600 dark:text-blue-400">({activeBooking.invitationCode})</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] mb-0.5">訪客類型 / 客戶類型</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-[10px] rounded border border-blue-200/50">
                          {getVisitorTypeLabel(activeBooking.visitorType)}
                        </span>
                        <span className="px-1.5 py-0.2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-bold text-[10px] rounded border border-purple-200/50">
                          {getVisitModeLabel(activeBooking.visitMode)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] mb-0.5">公司名稱</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {activeBooking.company || '個人代表'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] mb-0.5">到訪日期與時間</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <Calendar size={13} className="text-blue-500" />
                        {activeBooking.visitDateTime}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] mb-0.5">到訪性質</span>
                      <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-lg ${getPurposeOption(activeBooking.purpose).bgColor} ${getPurposeOption(activeBooking.purpose).color}`}>
                        {getPurposeOption(activeBooking.purpose).label}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] mb-0.5">隨行總人數</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {activeBooking.totalVisitorsCount || 1} 人到訪
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] mb-0.5">車牌號碼</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <Car size={13} className="text-amber-500" />
                        {activeBooking.licensePlate || '無車輛進出'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] mb-0.5">聯絡電郵</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 truncate block max-w-[150px]">
                        {activeBooking.contactEmail || '未登記'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Host Employee & Destination Info Grid */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building size={14} className="text-emerald-500" />
                    <span>對接員工與電視城目的地</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] mb-0.5">對接員工 (ID + 姓名)</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block text-sm">
                        {getHostEmployeeInfo(activeBooking.hostEmployeeName, activeBooking.hostEmployeeDept).id} {getHostEmployeeInfo(activeBooking.hostEmployeeName, activeBooking.hostEmployeeDept).empName}
                      </span>
                      <span className="text-[11px] text-slate-500 block font-mono">
                        工號: {getHostEmployeeInfo(activeBooking.hostEmployeeName, activeBooking.hostEmployeeDept).id}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] mb-0.5">對接員工聯絡電話 & 負責部門</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block text-sm flex items-center gap-1">
                        <Phone size={13} />
                        {getHostEmployeeInfo(activeBooking.hostEmployeeName, activeBooking.hostEmployeeDept).phone}
                      </span>
                      <span className="text-[11px] text-slate-500 block font-bold mt-0.5">
                        負責部門: {activeBooking.responsibleDept || getHostEmployeeInfo(activeBooking.hostEmployeeName, activeBooking.hostEmployeeDept).dept}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] mb-0.5">目的地 (Destination)</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 block text-sm flex items-center gap-1">
                        <MapPin size={15} />
                        {activeBooking.destination || '電視城主樓 7樓 A會議室'}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        請引導訪客前往該地點
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Remarks & Special Notes */}
                {activeBooking.notes && (
                  <div className="p-3 bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs space-y-1">
                    <span className="font-bold text-amber-700 dark:text-amber-400 block flex items-center gap-1">
                      <AlertTriangle size={13} /> 預約隨附備註事項：
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">{activeBooking.notes}</p>
                  </div>
                )}

              </div>

              {/* Right Column: Credential Entry & Gate Clearance Box (Multi-Visitor Style) */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
                
                <div className="space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <CreditCard size={18} className="text-emerald-500" />
                        <span>安保放行與多訪客證件號錄入</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">多訪客核銷模式：請逐一登記同行訪客證件號碼</p>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10.5px] font-bold rounded-xl border border-blue-200 dark:border-blue-800 whitespace-nowrap shrink-0">
                      👥 多人核銷
                    </span>
                  </div>

                  {/* Multi-Visitor ID Entry List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Users size={15} className="text-blue-500" />
                        <span>訪客名單證件登記 ({multiVisitorEntries.length} 人)</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddVisitorEntry}
                        className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-[11px] font-bold rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer flex items-center gap-1 transition-all whitespace-nowrap shrink-0"
                      >
                        <Plus size={12} />
                        <span>新增同行訪客</span>
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                      {multiVisitorEntries.map((visitor, idx) => (
                        <div
                          key={visitor.id}
                          className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 w-full pr-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black shrink-0">
                                {idx + 1}
                              </span>
                              <input
                                type="text"
                                value={visitor.name}
                                onChange={(e) => handleUpdateVisitorEntry(visitor.id, 'name', e.target.value)}
                                placeholder="訪客姓名"
                                className="bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 px-1 py-0.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 w-full"
                              />
                              {visitor.isPrimary && (
                                <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-600 font-bold text-[9.5px] rounded border border-amber-300 shrink-0 whitespace-nowrap">
                                  主訪客
                                </span>
                              )}
                            </div>

                            {!visitor.isPrimary && multiVisitorEntries.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveVisitorEntry(visitor.id)}
                                className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors shrink-0"
                                title="刪除此同行訪客"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* ID Type Dropdown */}
                            <select
                              value={visitor.idCardType}
                              onChange={(e) => handleUpdateVisitorEntry(visitor.id, 'idCardType', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                            >
                              <option value="香港身份證 (HKID)">香港身份證 (HKID)</option>
                              <option value="護照 (Passport)">護照 (Passport)</option>
                              <option value="港澳居民來往內地通行證">港澳通行證 (回鄉證)</option>
                              <option value="中華人民共和國居民身份證">內地居民身份證</option>
                              <option value="其它有效駕駛執照/工作證">其它駕駛執照/工作證</option>
                            </select>

                            {/* ID Number Input */}
                            <input
                              type="text"
                              value={visitor.idCardNumber}
                              onChange={(e) => handleUpdateVisitorEntry(visitor.id, 'idCardNumber', e.target.value)}
                              placeholder="請輸入證件號 (例: A123456)"
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security Clearance Notes */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      安保現場備註 (Security Remarks)
                    </label>
                    <textarea
                      rows={2}
                      value={securityNotes}
                      onChange={(e) => setSecurityNotes(e.target.value)}
                      placeholder="例如: 已發放臨時訪客證、大型器材已登記驗收..."
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                    ></textarea>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleConfirmClearance}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black rounded-2xl text-xs cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all whitespace-nowrap shrink-0"
                  >
                    <UserCheck size={18} className="shrink-0" />
                    <span className="whitespace-nowrap">確認核銷放行並登記證件</span>
                  </button>
                </div>

              </div>

            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <Scan size={36} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold">請在上方輸入框掃描或輸入訪客通行證代碼</p>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: 掃碼記錄 (Gate Scan Logs) */}
      {securityTab === 'SCAN_LOGS' && (
        <div className="space-y-6">
          
          {/* Header Title & Date Filter */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <FileText className="text-blue-500" size={20} />
                  <span>{scanLogsTimeRange === 'TODAY' ? '今日到訪訪客掃碼放行記錄' : '全量到訪訪客掃碼放行記錄'} (Gate Scan Logs)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">實時記錄安保門崗已完成掃碼核銷與證件登記之訪客放行日誌</p>
              </div>

              {/* Date Scope Filter Button Group */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setScanLogsTimeRange('TODAY')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                      scanLogsTimeRange === 'TODAY'
                        ? 'bg-blue-600 text-white shadow-xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Calendar size={13} />
                    <span>📅 今日記錄</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanLogsTimeRange('ALL')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                      scanLogsTimeRange === 'ALL'
                        ? 'bg-blue-600 text-white shadow-xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Layers size={13} />
                    <span>🌐 全部記錄</span>
                  </button>
                </div>

                <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-900/40 whitespace-nowrap shrink-0">
                  放行總計: {displayScanLogs.length} 人次
                </span>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={scanLogsSearchTerm}
                onChange={(e) => setScanLogsSearchTerm(e.target.value)}
                placeholder="搜尋訪客姓名、證件號碼、通行證代碼、接洽員工..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="p-3.5 whitespace-nowrap">預約 ID</th>
                    <th className="p-3.5 whitespace-nowrap">掃碼放行時間</th>
                    <th className="p-3.5 whitespace-nowrap">通行邀請代碼</th>
                    <th className="p-3.5 text-center whitespace-nowrap">訪客類型</th>
                    <th className="p-3.5 whitespace-nowrap">訪客姓名</th>
                    <th className="p-3.5 text-center whitespace-nowrap">客戶類型</th>
                    <th className="p-3.5 whitespace-nowrap">登記證件號碼</th>
                    <th className="p-3.5 whitespace-nowrap">公司名稱</th>
                    <th className="p-3.5 text-center whitespace-nowrap">到訪模式</th>
                    <th className="p-3.5 whitespace-nowrap">車牌號碼</th>
                    <th className="p-3.5 whitespace-nowrap">對接員工</th>
                    <th className="p-3.5 whitespace-nowrap">負責部門</th>
                    <th className="p-3.5 whitespace-nowrap">目的地</th>
                    <th className="p-3.5 whitespace-nowrap">執勤門崗</th>
                    <th className="p-3.5 text-center whitespace-nowrap">到訪狀態</th>
                    <th className="p-3.5 text-center whitespace-nowrap">安保操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                  {displayScanLogs.length > 0 ? (
                    displayScanLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                        {/* 1. 預約 ID */}
                        <td className="p-3.5 font-mono font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          #{log.bookingId}
                        </td>

                        {/* 2. 掃碼放行時間 */}
                        <td className="p-3.5 font-mono text-slate-500 font-medium whitespace-nowrap">
                          {log.scannedAt}
                        </td>

                        {/* 3. 通行邀請代碼 */}
                        <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {log.invitationCode}
                        </td>

                        {/* 4. 訪客類型 */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 text-[10px] font-bold rounded-md">
                            {getVisitorTypeLabel(log.visitorType)}
                          </span>
                        </td>

                        {/* 5. 訪客姓名 */}
                        <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {log.visitorName}
                        </td>

                        {/* 6. 客戶類型 */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          {log.clientTier === 'VIP' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800 text-[10.5px] font-bold rounded-md">
                              👑 VIP客戶
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10.5px] font-semibold rounded-md border border-slate-200 dark:border-slate-700">
                              普通客戶
                            </span>
                          )}
                        </td>

                        {/* 7. 登記證件號碼 */}
                        <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {log.visitorIdCard}
                        </td>

                        {/* 8. 公司名稱 */}
                        <td className="p-3.5 text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">
                          {log.company || <span className="text-slate-400 italic">個人代表</span>}
                        </td>

                        {/* 9. 到訪模式 */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-md">
                            {getVisitModeLabel(log.visitMode)}
                          </span>
                        </td>

                        {/* 10. 車牌號碼 */}
                        <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {log.licensePlate || <span className="text-slate-400 font-sans italic">無</span>}
                        </td>

                        {/* 11. 對接員工 */}
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {log.hostEmployeeName}
                        </td>

                        {/* 12. 負責部門 */}
                        <td className="p-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {log.responsibleDept || log.hostEmployeeDept}
                        </td>

                        {/* 13. 目的地 */}
                        <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {log.destination}
                        </td>

                        {/* 14. 執勤門崗 */}
                        <td className="p-3.5 text-slate-500 whitespace-nowrap">
                          {log.gateLocation}
                        </td>

                        {/* 15. 到訪狀態 */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-full border border-blue-300 dark:border-blue-800 whitespace-nowrap">
                            🟢 進行中
                          </span>
                        </td>

                        {/* 16. 安保操作 */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setViewingSecurityBooking(log)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 mx-auto transition-all whitespace-nowrap shrink-0"
                          >
                            <Eye size={13} className="shrink-0" />
                            <span className="whitespace-nowrap">詳情</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={16} className="p-8 text-center text-slate-400 font-bold">
                        暫無符合條件之掃碼放行記錄
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
      {securityTab === 'APPOINTMENTS' && (
        <div className="space-y-6">
          
          {/* Top Date Scope Selector Bar */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <BarChart3 className="text-blue-500" size={18} />
                <span>訪客預約數據看板與全量清單範圍篩選</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">預設選中【今日】預約數據，可切換至【全部】檢視歷年與未來預約總表</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAppointmentsTimeRange('TODAY')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  appointmentsTimeRange === 'TODAY'
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Calendar size={14} />
                <span>📅 今日預約 (Today)</span>
              </button>
              <button
                type="button"
                onClick={() => setAppointmentsTimeRange('ALL')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  appointmentsTimeRange === 'ALL'
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Layers size={14} />
                <span>🌐 全部預約 (All Records)</span>
              </button>
            </div>
          </div>

          {/* Top Analytics Dashboard Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Card 1: Total Appointments */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">
                  {appointmentsTimeRange === 'TODAY' ? '今日全部預約' : '全部預約總數'}
                </span>
                <Calendar size={18} className="text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-50 font-mono">
                {totalAppointmentsCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {appointmentsTimeRange === 'TODAY' ? '今日電視城全樓層總預約' : '全數據庫歷年與未來總預約'}
              </div>
            </div>

            {/* Card 2: Pending Arrival */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">待到訪</span>
                <Clock size={18} className="text-cyan-500" />
              </div>
              <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                {pendingArrivalCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">等候門崗掃碼核銷放行</div>
            </div>

            {/* Card 3: In Progress (Inside Building) */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">進行中 (在大樓內)</span>
                <CheckCircle2 size={18} className="text-blue-500" />
              </div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                {inProgressCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">已完成安保掃碼核銷放行</div>
            </div>

            {/* Card 4: History / Cancelled */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">歷史/已取消</span>
                <XCircle size={18} className="text-slate-500" />
              </div>
              <div className="text-2xl font-black text-slate-600 dark:text-slate-300 font-mono">
                {historyCancelledCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">已完成訪問或已取消之預約</div>
            </div>

          </div>

          {/* Bottom Visitor Appointments Table Section */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <UserCheck className="text-blue-500" size={20} />
                  <span>訪客預約記錄全表 (Visitor Appointment Master Records)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">點擊「詳情」可查看預約資訊與已登記訪客名單</p>
              </div>

              {/* Status Filter Tabs: 全部, 待到訪, 進行中, 歷史/已取消 */}
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setAppointmentsStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    appointmentsStatusFilter === 'ALL' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  全部 ({scopedBookings.length})
                </button>

                <button
                  type="button"
                  onClick={() => setAppointmentsStatusFilter('UPCOMING')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    appointmentsStatusFilter === 'UPCOMING' ? 'bg-white dark:bg-slate-800 text-cyan-600 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  待到訪 ({pendingArrivalCount})
                </button>

                <button
                  type="button"
                  onClick={() => setAppointmentsStatusFilter('CHECKED_IN')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    appointmentsStatusFilter === 'CHECKED_IN' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  進行中 ({inProgressCount})
                </button>

                <button
                  type="button"
                  onClick={() => setAppointmentsStatusFilter('HISTORY_CANCELLED')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    appointmentsStatusFilter === 'HISTORY_CANCELLED' ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  歷史/已取消 ({historyCancelledCount})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={appointmentsSearchTerm}
                onChange={(e) => setAppointmentsSearchTerm(e.target.value)}
                placeholder="搜尋預約訪客姓名、公司、接洽員工、通行證代碼..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            </div>

            {/* Master Appointments Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-850">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="p-3.5 whitespace-nowrap">預約 ID</th>
                    <th className="p-3.5 text-center whitespace-nowrap">訪客類型</th>
                    <th className="p-3.5 whitespace-nowrap">訪客姓名</th>
                    <th className="p-3.5 text-center whitespace-nowrap">客戶類型</th>
                    <th className="p-3.5 whitespace-nowrap">公司名稱</th>
                    <th className="p-3.5 text-center whitespace-nowrap">到訪模式</th>
                    <th className="p-3.5 whitespace-nowrap">到訪日期與時間</th>
                    <th className="p-3.5 whitespace-nowrap">目的地</th>
                    <th className="p-3.5 whitespace-nowrap">車牌號碼</th>
                    <th className="p-3.5 text-center whitespace-nowrap">到訪性質</th>
                    <th className="p-3.5 whitespace-nowrap">對接員工</th>
                    <th className="p-3.5 whitespace-nowrap">負責部門</th>
                    <th className="p-3.5 whitespace-nowrap">登記證件號碼</th>
                    <th className="p-3.5 text-center whitespace-nowrap">到訪狀態</th>
                    <th className="p-3.5 text-center whitespace-nowrap">安保操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                  {scopedBookings
                    .filter(b => {
                      if (appointmentsStatusFilter === 'UPCOMING') return b.status === BookingStatus.UPCOMING || b.isPendingApproval || b.status === BookingStatus.PENDING;
                      if (appointmentsStatusFilter === 'CHECKED_IN') return b.status === BookingStatus.CHECKED_IN;
                      if (appointmentsStatusFilter === 'HISTORY_CANCELLED') return b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED;
                      return true;
                    })
                    .filter(b => {
                      if (!appointmentsSearchTerm.trim()) return true;
                      const term = appointmentsSearchTerm.toLowerCase();
                      return b.visitorName.toLowerCase().includes(term) ||
                             (b.company && b.company.toLowerCase().includes(term)) ||
                             b.invitationCode.toLowerCase().includes(term) ||
                             (b.hostEmployeeName && b.hostEmployeeName.toLowerCase().includes(term)) ||
                             b.id.toLowerCase().includes(term) ||
                             (b.visitorIdCard && b.visitorIdCard.toLowerCase().includes(term));
                    })
                    .map(b => (
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

                        {/* 4. 客戶類型 */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          {b.clientTier === 'VIP' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800 text-[10.5px] font-bold rounded-md">
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

                        {/* 11. 對接員工 */}
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {b.hostEmployeeName || '陳大文'}
                        </td>

                        {/* 12. 負責部門 */}
                        <td className="p-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {b.responsibleDept || b.hostEmployeeDept || '行政處'}
                        </td>

                        {/* 13. 登記證件號碼 */}
                        <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {b.visitorIdCard || <span className="text-slate-400 font-sans italic">未核銷錄入</span>}
                        </td>

                        {/* 14. 到訪狀態 */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          {b.status === BookingStatus.CHECKED_IN ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-full border border-blue-300 dark:border-blue-800 whitespace-nowrap">
                              🟢 進行中
                            </span>
                          ) : (b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED) ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-black text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-700 whitespace-nowrap">
                              {b.status === BookingStatus.COMPLETED ? '📜 歷史/已完成' : '🚫 歷史/已取消'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-black text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 rounded-full border border-cyan-300 dark:border-cyan-800 whitespace-nowrap">
                              📅 待到訪
                            </span>
                          )}
                        </td>

                        {/* 15. 安保操作 */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setViewingSecurityBooking(b)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 mx-auto transition-all whitespace-nowrap shrink-0"
                          >
                            <Eye size={13} className="shrink-0" />
                            <span className="whitespace-nowrap">詳情</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* Security Console Booking / Scan Record Details Modal */}
      {viewingSecurityBooking && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-md">
                  {viewingSecurityBooking.visitorName.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                      {viewingSecurityBooking.invitationCode}
                    </span>
                    {viewingSecurityBooking.clientTier === 'VIP' && (
                      <span className="px-2 py-0.5 bg-amber-500 text-white font-black text-[10px] rounded shadow-2xs">
                        👑 VIP 貴賓
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
                    {viewingSecurityBooking.visitorName}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Status Badge */}
                {'status' in viewingSecurityBooking ? (
                  viewingSecurityBooking.status === BookingStatus.CHECKED_IN ? (
                    <span className="px-3 py-1 bg-blue-600 text-white font-black text-xs rounded-full shadow-2xs">
                      🟢 進行中 (在大樓內)
                    </span>
                  ) : (viewingSecurityBooking.status === BookingStatus.COMPLETED || viewingSecurityBooking.status === BookingStatus.CANCELLED) ? (
                    <span className="px-3 py-1 bg-slate-600 text-white font-black text-xs rounded-full shadow-2xs">
                      {viewingSecurityBooking.status === BookingStatus.COMPLETED ? '📜 歷史/已完成' : '🚫 歷史/已取消'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-cyan-600 text-white font-black text-xs rounded-full shadow-2xs">
                      📅 待到訪
                    </span>
                  )
                ) : (
                  <span className="px-3 py-1 bg-blue-600 text-white font-black text-xs rounded-full shadow-2xs">
                    🟢 進行中 (已掃碼放行)
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setViewingSecurityBooking(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Section 1: Registered Visitors List */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-slate-400 block text-[10px] mb-2 font-bold uppercase tracking-wider">
                  👥 已登記訪客名單 ({getModalVisitorsList(viewingSecurityBooking).length} 人)
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {getModalVisitorsList(viewingSecurityBooking).map((v, idx) => (
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
                        {v.email || ('contactEmail' in viewingSecurityBooking ? viewingSecurityBooking.contactEmail : '') || '未提供電郵'}
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
                      #{'bookingId' in viewingSecurityBooking ? viewingSecurityBooking.bookingId : viewingSecurityBooking.id}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">訪客類型 / 到訪模式</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      {getVisitorTypeLabel(viewingSecurityBooking.visitorType)} / {getVisitModeLabel(viewingSecurityBooking.visitMode)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">公司名稱</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold block">
                      {viewingSecurityBooking.company || '個人代表'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">到訪日期與時間</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono font-bold block">
                      {'scannedAt' in viewingSecurityBooking ? viewingSecurityBooking.scannedAt : ('visitDateTime' in viewingSecurityBooking ? viewingSecurityBooking.visitDateTime : '-')}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">到訪性質</span>
                    <span className={`inline-block px-2 py-0.5 text-[10.5px] font-bold rounded ${getPurposeOption('purpose' in viewingSecurityBooking ? viewingSecurityBooking.purpose : 'V').bgColor} ${getPurposeOption('purpose' in viewingSecurityBooking ? viewingSecurityBooking.purpose : 'V').color}`}>
                      {getPurposeOption('purpose' in viewingSecurityBooking ? viewingSecurityBooking.purpose : 'V').label}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">車牌號碼</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono font-bold block">
                      {viewingSecurityBooking.licensePlate || '無車牌登記'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Section 3: Host Employee & Destination Grid */}
              <div className="space-y-2">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  🏢 對接員工與目的地資訊
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">對接員工 (ID + 姓名)</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold block text-xs">
                      {getHostEmployeeInfo(viewingSecurityBooking.hostEmployeeName, viewingSecurityBooking.hostEmployeeDept).id} {getHostEmployeeInfo(viewingSecurityBooking.hostEmployeeName, viewingSecurityBooking.hostEmployeeDept).empName}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">聯絡電話 & 負責部門</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                      📞 {getHostEmployeeInfo(viewingSecurityBooking.hostEmployeeName, viewingSecurityBooking.hostEmployeeDept).phone}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {viewingSecurityBooking.responsibleDept || viewingSecurityBooking.hostEmployeeDept || '負責部門'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">目的地 (Destination)</span>
                    <strong className="text-blue-600 dark:text-blue-400 font-bold block">
                      📍 {viewingSecurityBooking.destination || '電視城主樓'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Section 4: Full Registration ID Card Strings & Remarks */}
              {viewingSecurityBooking.visitorIdCard && (
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                    💳 完整門禁登記證件備案：
                  </span>
                  <p className="font-mono text-slate-800 dark:text-slate-200 text-xs font-bold">
                    {viewingSecurityBooking.visitorIdCard}
                  </p>
                </div>
              )}

              {viewingSecurityBooking.notes && (
                <div className="p-3 bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                    ⚠️ 特殊備註事項：
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 text-xs">
                    {viewingSecurityBooking.notes}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewingSecurityBooking(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                關閉
              </button>

              {'invitationCode' in viewingSecurityBooking && (
                <button
                  type="button"
                  onClick={() => {
                    const bId = 'bookingId' in viewingSecurityBooking ? viewingSecurityBooking.bookingId : viewingSecurityBooking.id;
                    setSelectedBookingId(bId);
                    setScanInputCode(viewingSecurityBooking.invitationCode);
                    setViewingSecurityBooking(null);
                    setSecurityTab('SCANNER');
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-550 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Scan size={14} />
                  <span>載入至掃碼核銷頁</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
