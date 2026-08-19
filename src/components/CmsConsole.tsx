/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Booking, BookingStatus, PurposeCode } from '../types';
import { PURPOSE_OPTIONS, getPurposeOption, getVisitorTypeLabel } from '../data/mockData';
import { CmsAttendanceManagement } from './CmsAttendanceManagement';
import { 
  Search, Filter, Check, X, Plus, FileText, Printer, 
  Trash2, Clock, Building, Calendar, Mail, Car, CheckCircle, 
  XCircle, AlertCircle, User, ShieldCheck, Sliders, Settings,
  ClipboardList, UserCheck, BookOpen, Save, Info, Sparkles, Laptop, FileSpreadsheet,
  Crown, Download, RefreshCw, ShieldAlert, Bell, UserPlus, FileUp, AlertTriangle,
  ToggleLeft, ToggleRight, Shield, Upload
} from 'lucide-react';

interface CmsConsoleProps {
  bookings: Booking[];
  onAddBooking: (newBookingData: Omit<Booking, 'id' | 'status' | 'createdAt' | 'invitationCode'> & { isWalkIn?: boolean, isPendingApproval?: boolean }) => void;
  onUpdateBookingStatus: (id: string, status: BookingStatus, checkedInOrOutTime?: string) => void;
  onCancelBooking: (id: string) => void;
  onDeleteBooking: (id: string) => void;
  triggerSound: (frequency: number, type: OscillatorType, duration: number) => void;
}

export const CmsConsole: React.FC<CmsConsoleProps> = ({
  bookings,
  onAddBooking,
  onUpdateBookingStatus,
  onCancelBooking,
  onDeleteBooking,
  triggerSound
}) => {
  // Navigation: 'VISITORS' | 'EMPLOYEES' | 'EMAIL_TEMPLATES' | 'WHITELIST' | 'BLACKLIST' | 'PUSH_CONFIG' | 'STAFF' | 'ATTENDANCE_LOGS' | 'ATTENDANCE_CONFIG' | 'ATTENDANCE_REPORT'
  const [activeCmsTab, setActiveCmsTab] = useState<'VISITORS' | 'EMPLOYEES' | 'EMAIL_TEMPLATES' | 'WHITELIST' | 'BLACKLIST' | 'PUSH_CONFIG' | 'STAFF' | 'ATTENDANCE_LOGS' | 'ATTENDANCE_CONFIG' | 'ATTENDANCE_REPORT'>('VISITORS');

  // 1. Employee Whitelist Management & Approval Config States (審核配置與員工白名單配置)
  const [isBookingApprovalRequired, setIsBookingApprovalRequired] = useState<boolean>(() => {
    const saved = localStorage.getItem('tvb_booking_approval_required');
    return saved !== null ? saved === 'true' : true;
  });
  const [whitelistEnabled, setWhitelistEnabled] = useState(true);
  const [whitelistEmployees, setWhitelistEmployees] = useState<Array<{
    id: string;
    employeeId: string;
    name: string;
    dept: string;
    email: string;
    status: 'ACTIVE' | 'DISABLED';
    addedAt: string;
  }>>([
    { id: 'WL-001', employeeId: 'EMP001', name: '王小明 (Siu Ming Wong)', dept: '綜藝節目部', email: 'siuming.wong@tvb.com.hk', status: 'ACTIVE', addedAt: '2026-08-01' },
    { id: 'WL-002', employeeId: 'EMP005', name: '黃美玲 (May Wong)', dept: '藝員管理部', email: 'may.wong@tvb.com.hk', status: 'ACTIVE', addedAt: '2026-08-05' },
    { id: 'WL-003', employeeId: 'EMP003', name: '李麗華 (Lai Wah Lee)', dept: '新聞及公共事務部', email: 'laiwah.lee@tvb.com.hk', status: 'ACTIVE', addedAt: '2026-08-10' },
    { id: 'WL-004', employeeId: 'EMP004', name: '張志強 (Chi Keung Cheung)', dept: '財務及合規部', email: 'chikeung.cheung@tvb.com.hk', status: 'DISABLED', addedAt: '2026-08-12' },
  ]);
  // Whitelist State & Modal Search Query
  const [whitelistSearchTerm, setWhitelistSearchTerm] = useState('');
  const [showAddWhitelistModal, setShowAddWhitelistModal] = useState(false);
  const [wlSearchQuery, setWlSearchQuery] = useState('');
  const [newWlEmpId, setNewWlEmpId] = useState('EMP002');
  const [newWlName, setNewWlName] = useState('陳大文 (Tai Man Chan)');
  const [newWlDept, setNewWlDept] = useState('製作部');
  const [newWlEmail, setNewWlEmail] = useState('taiman.chan@tvb.com.hk');

  // Predefined Staff Database for Whitelist Search Query
  const COMPANY_STAFF_DATABASE = [
    { employeeId: 'EMP001', name: '王小明 (Siu Ming Wong)', dept: '綜藝節目部', email: 'siuming.wong@tvb.com.hk' },
    { employeeId: 'EMP002', name: '陳大文 (Tai Man Chan)', dept: '製作部', email: 'taiman.chan@tvb.com.hk' },
    { employeeId: 'EMP003', name: '李麗華 (Lai Wah Lee)', dept: '新聞及公共事務部', email: 'laiwah.lee@tvb.com.hk' },
    { employeeId: 'EMP004', name: '張志強 (Chi Keung Cheung)', dept: '財務及合規部', email: 'chikeung.cheung@tvb.com.hk' },
    { employeeId: 'EMP005', name: '黃美玲 (May Wong)', dept: '藝員管理部', email: 'may.wong@tvb.com.hk' },
    { employeeId: 'EMP006', name: '黃志強 (Chi Keung Wong)', dept: '音樂及廣播部', email: 'chikeung.wong@tvb.com.hk' },
    { employeeId: 'EMP007', name: '馬小玲 (Siu Ling Ma)', dept: '行政及公關部', email: 'siuling.ma@tvb.com.hk' },
    { employeeId: 'EMP008', name: '胡家寶 (Ka Po Wu)', dept: '工程及設施部', email: 'kapo.wu@tvb.com.hk' },
    { employeeId: 'EMP009', name: '林世榮 (Sai Wing Lam)', dept: '資訊科技部', email: 'saiwing.lam@tvb.com.hk' },
    { employeeId: 'EMP010', name: '郭建國 (Kin Kwok Kwok)', dept: '戲劇製作部', email: 'kinkwok.kwok@tvb.com.hk' },
    { employeeId: 'EMP011', name: '許詠詩 (Wing Sze Hui)', dept: '藝員部', email: 'wingsze.hui@tvb.com.hk' }
  ];

  // 2. Visitor Blacklist Management States (訪客黑名單管理)
  const [blacklist, setBlacklist] = useState<Array<{
    id: string;
    name: string; // 必填 / Required
    idCard: string;
    email: string;
    phone: string;
    company: string;
    reason: string;
    addedAt: string;
    status: 'ACTIVE' | 'EXPIRED';
  }>>([
    { id: 'BL-001', name: '黃志偉 (Wong Chi Wai)', idCard: 'HKID: D991283(4)', email: 'blacklisted.user1@test.com', phone: '91234567', company: '違規無牌傳媒', reason: '未經許可強行侵入錄影廠管制區拍攝公司機密', addedAt: '2026-07-15', status: 'ACTIVE' },
    { id: 'BL-002', name: '趙德明 (Chiu Tak Ming)', idCard: 'G8829103(9)', email: 'chiu.tm@badmail.org', phone: '61122334', company: '失信物流公司', reason: '多次填寫虛假車牌號碼與提供偽造通行證件', addedAt: '2026-08-02', status: 'ACTIVE' },
    { id: 'BL-003', name: '劉建國 (Lau Kin Kwok)', idCard: 'P102938(1)', email: 'lau.kk@blocked-domain.com', phone: '55667788', company: '個人訪客', reason: '大樓內違反安全規範與失信踰矩', addedAt: '2026-08-11', status: 'ACTIVE' },
  ]);
  const [blacklistSearchTerm, setBlacklistSearchTerm] = useState('');
  const [showAddBlacklistModal, setShowAddBlacklistModal] = useState(false);
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);
  const [csvInputText, setCsvInputText] = useState('');
  const [csvImportError, setCsvImportError] = useState('');
  
  // Manual add blacklist form states
  const [blName, setBlName] = useState('');
  const [blIdCard, setBlIdCard] = useState('');
  const [blEmail, setBlEmail] = useState('');
  const [blPhone, setBlPhone] = useState('');
  const [blCompany, setBlCompany] = useState('');
  const [blReason, setBlReason] = useState('');
  const [blError, setBlError] = useState('');

  // 3. Automated Visitor Push Notification Configurations (訪客自動 Push 通知配置)
  const [pushPreArrivalEnabled, setPushPreArrivalEnabled] = useState(true);
  const [pushPreArrivalMinutes, setPushPreArrivalMinutes] = useState<number>(30); // 提前 X 分鐘提醒 Push
  const [pushPreArrivalTitle, setPushPreArrivalTitle] = useState('⏱️ 到訪倒數提醒：訪客 {visitorName} 即將於 {advanceMinutes} 分鐘後抵達');
  const [pushPreArrivalBody, setPushPreArrivalBody] = useState('提醒：訪客 {visitorName}（{company}）預約於 {visitTime} 到訪 {destination}，請留意接待準備。');

  const [pushArrivalEnabled, setPushArrivalEnabled] = useState(true);
  const [pushArrivalTitle, setPushArrivalTitle] = useState('🔔 訪客抵達提醒：{visitorName} 已完成大樓門禁核銷放行');
  const [pushArrivalBody, setPushArrivalBody] = useState('尊敬的 {hostName}：您的訪客 {visitorName}（{company}）已於 {checkInTime} 抵達 {destination} 並完成核銷放行，請準備接引。');

  const [pushTestToast, setPushTestToast] = useState<{ title: string; body: string; time: string } | null>(null);

  // Format date to standard format: YYYY.MM.DD HH:mm
  const formatDateToStandard = (dateStr: string | undefined): string => {
    if (!dateStr) return '-';
    const dt = new Date(dateStr);
    if (isNaN(dt.getTime())) return dateStr;
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const date = String(dt.getDate()).padStart(2, '0');
    const hours = String(dt.getHours()).padStart(2, '0');
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${date} ${hours}:${minutes}`;
  };

  // Search & Filter States
  const [filterVisitDate, setFilterVisitDate] = useState('');
  const [filterVerifyDate, setFilterVerifyDate] = useState('');
  const [filterVisitorType, setFilterVisitorType] = useState<'ALL' | 'SINGLE' | 'MULTI_SHARED' | 'MULTI' | 'TEAM'>('ALL');
  const [filterVisitorName, setFilterVisitorName] = useState('');
  const [filterClientTier, setFilterClientTier] = useState<'ALL' | 'NORMAL' | 'VIP'>('ALL');
  const [filterLicensePlate, setFilterLicensePlate] = useState('');
  const [filterContactEmail, setFilterContactEmail] = useState('');
  const [filterContactPerson, setFilterContactPerson] = useState('');
  const [appointmentApprovalFilter, setAppointmentApprovalFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'>('ALL');
  const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([]);
  const [rejectedBookingIds, setRejectedBookingIds] = useState<Set<string>>(new Set(['B006-REJECTED']));

  // Staff Configuration states
  const KNOWN_EMPLOYEES: Record<string, string> = {
    'EMP001': '王小明 (Siu Ming Wong)',
    'EMP002': '陳大文 (Tai Man Chan)',
    'EMP003': '李麗華 (Lai Wah Lee)',
    'EMP004': '張志強 (Chi Keung Cheung)',
    'EMP005': '黃美玲 (May Wong)',
    'EMP006': '劉偉傑 (Wai Kit Lau)',
    'EMP007': '馬小玲 (Siu Ling Ma)',
    'EMP008': '胡家寶 (Ka Po Wu)',
    'EMP009': '林世榮 (Sai Wing Lam)'
  };

  const [verificationStaff, setVerificationStaff] = useState<Array<{ employeeId: string; name: string }>>([
    { employeeId: 'EMP001', name: '王小明 (Siu Ming Wong)' },
    { employeeId: 'EMP005', name: '黃美玲 (May Wong)' },
    { employeeId: 'EMP003', name: '李麗華 (Lai Wah Lee)' }
  ]);
  const [newStaffId, setNewStaffId] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [staffError, setStaffError] = useState('');

  // Modal State for viewing a booking details
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  // Walk-in form expand state inside Page 1
  const [showWalkInForm, setShowWalkInForm] = useState(false);

  // Walk-in form states
  const [walkInName, setWalkInName] = useState('');
  const [walkInClientTier, setWalkInClientTier] = useState<'NORMAL' | 'VIP'>('NORMAL');
  const [walkInCompany, setWalkInCompany] = useState('');
  const [walkInContact, setWalkInContact] = useState('');
  const [walkInPurpose, setWalkInPurpose] = useState<PurposeCode>('V');
  const [walkInDestination, setWalkInDestination] = useState('地下 A 廠影視大堂');
  const [walkInPlate, setWalkInPlate] = useState('');
  const [walkInNotes, setWalkInNotes] = useState('');
  const [walkInErrors, setWalkInErrors] = useState<Record<string, string>>({});
  const [printedPass, setPrintedPass] = useState<Booking | null>(null);

  // Email Template states (Page 3) - Only Invitation template is retained
  const [emailTemplates, setEmailTemplates] = useState({
    INVITATION: {
      subject: '【訪客預約通知】新預約成功登記 - 代碼 {invitationCode}',
      body: `系統已成功登記一筆訪客預約，請做好相關接待與放行准入準備。

| 日期 | 時間 | 姓名（全名） | 公司 | #車牌 | * 到訪性質 | 聯絡人 | 負責部門 | 電話 | 目的地 | 備註 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| {visitDate} | {visitTimeOnly} | {visitorName} | {company} | {licensePlate} | {purpose} | {hostName} | {hostDept} | {hostPhone} | {destination} | {notes} |`,
    }
  });

  const [activeTemplate, setActiveTemplate] = useState<'INVITATION'>('INVITATION');
  const [tempSubject, setTempSubject] = useState(emailTemplates.INVITATION.subject);
  const [tempBody, setTempBody] = useState(emailTemplates.INVITATION.body);
  const [securityEmail, setSecurityEmail] = useState('security-ops@tvb.com.hk');
  const [receptionEmail, setReceptionEmail] = useState('reception-desk@tvb.com.hk');

  // Live Preview Helper
  const renderTemplatePreview = (subject: string, body: string) => {
    const mockReplacements = {
      visitorName: '張小明 (Cheung Siu Ming)',
      company: '騰訊香港 (Tencent HK)',
      visitTime: '2026-07-25 10:00',
      visitDate: '2026/07/25',
      visitTimeOnly: '10:00 AM',
      invitationCode: 'TVB-8392-XM7',
      destination: '7樓 行政會議室 A',
      purpose: 'M（開會）',
      hostName: '王小明 (Siu Ming Wong)',
      hostDept: '綜藝節目部',
      licensePlate: '粵Z A888港',
      hostPhone: '2335-7111',
      notes: '無',
    };

    let renderedSubject = subject;
    let renderedBody = body;

    Object.entries(mockReplacements).forEach(([key, val]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      renderedSubject = renderedSubject.replace(regex, val);
      renderedBody = renderedBody.replace(regex, val);
    });

    return { subject: renderedSubject, body: renderedBody };
  };

  const selectTemplate = (type: 'INVITATION' | 'REMINDER' | 'CHECK_IN') => {
    setActiveTemplate(type);
    setTempSubject(emailTemplates[type].subject);
    setTempBody(emailTemplates[type].body);
    triggerSound(600, 'sine', 0.05);
  };

  const handleSaveTemplate = () => {
    setEmailTemplates(prev => ({
      ...prev,
      [activeTemplate]: {
        subject: tempSubject,
        body: tempBody
      }
    }));
    triggerSound(900, 'sine', 0.15);
    alert('電郵範本儲存成功！已套用至系統郵件發送服務。');
  };

  const insertPlaceholder = (tag: string) => {
    setTempBody(prev => prev + `{${tag}}`);
    triggerSound(500, 'sine', 0.05);
  };

  // Stats
  const totalBookings = bookings.length;
  const vipBookingsCount = bookings.filter(b => b.clientTier === 'VIP').length;
  const insideBuildingCount = bookings.filter(b => b.status === BookingStatus.CHECKED_IN).length;
  const upcomingCount = bookings.filter(b => b.status === BookingStatus.UPCOMING).length;
  const completedCount = bookings.filter(b => b.status === BookingStatus.COMPLETED).length;

  // Helper for visitor type & mode
  const getVisitorTypeLabel = (type?: string) => {
    switch (type) {
      case 'MULTI_SHARED':
        return '多人同行';
      case 'MULTI':
      case 'MULTI_INDIVIDUAL':
        return '多人分行';
      case 'TEAM':
        return '團隊訪客';
      case 'SINGLE':
      default:
        return '個人訪客';
    }
  };

  const getVisitModeLabel = (mode?: string) => {
    if (mode === 'MULTI_PASS') return '有效期內多次訪問';
    return '單次訪問';
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = ['預約ID', '訪客類型', '訪客姓名', '總人數', '客戶類型', '公司名稱', '到訪模式', '到訪日期與時間', '目的地', '車牌號碼', '到訪性質', '聯絡電郵', '對接員工/聯絡人', '負責部門', '聯絡電話', '核銷時間', '關聯預約ID', '備註', '狀態'];
    const rows = filteredBookings.map(b => [
      b.id,
      getVisitorTypeLabel(b.visitorType),
      `"${b.visitorName.replace(/"/g, '""')}"`,
      b.totalVisitorsCount || 1,
      b.clientTier === 'VIP' ? 'VIP客戶' : '普通客戶',
      `"${(b.company || '-').replace(/"/g, '""')}"`,
      getVisitModeLabel(b.visitMode),
      `"${(b.visitDateTime || '-').replace(/"/g, '""')}"`,
      `"${(b.destination || '-').replace(/"/g, '""')}"`,
      `"${(b.licensePlate || '-').replace(/"/g, '""')}"`,
      getPurposeOption(b.purpose).label,
      b.contactEmail || '-',
      `"${(b.contactPerson || b.hostEmployeeName || '-').replace(/"/g, '""')}"`,
      `"${(b.responsibleDept || b.hostEmployeeDept || '-').replace(/"/g, '""')}"`,
      b.contactPhone || '-',
      b.checkedInAt ? formatDateToStandard(b.checkedInAt) : '未核銷',
      b.associatedBookingId || '-',
      `"${(b.notes || '-').replace(/"/g, '""')}"`,
      b.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tvb_visitor_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerSound(900, 'sine', 0.15);
  };

  // Filter Bookings logic
  const filteredBookings = bookings.filter(b => {
    // 1. 到訪日期 (Visit Date)
    let matchesVisitDate = true;
    if (filterVisitDate) {
      const visitDateStr = b.visitDateTime.replace(/\./g, '-');
      matchesVisitDate = visitDateStr.includes(filterVisitDate);
    }

    // 2. 核銷日期 (Verification Date)
    let matchesVerifyDate = true;
    if (filterVerifyDate) {
      const checkInDateStr = b.checkedInAt ? b.checkedInAt.replace(/\./g, '-').split('T')[0] : '';
      const checkOutDateStr = b.checkedOutAt ? b.checkedOutAt.replace(/\./g, '-').split('T')[0] : '';
      matchesVerifyDate = checkInDateStr.includes(filterVerifyDate) || checkOutDateStr.includes(filterVerifyDate);
    }

    // 3. 訪客類型 (Visitor Type)
    let matchesVisitorType = true;
    if (filterVisitorType !== 'ALL') {
      const vType = b.visitorType || 'SINGLE';
      if (filterVisitorType === 'MULTI') {
        matchesVisitorType = vType === 'MULTI' || vType === 'MULTI_INDIVIDUAL';
      } else {
        matchesVisitorType = vType === filterVisitorType;
      }
    }

    // 4. 訪客姓名 (Visitor Name)
    let matchesVisitorName = true;
    if (filterVisitorName.trim()) {
      const term = filterVisitorName.toLowerCase().trim();
      const mainName = b.visitorName.toLowerCase();
      const visitorListNames = b.visitors?.map(v => v.name.toLowerCase()).join(' ') || '';
      matchesVisitorName = mainName.includes(term) || visitorListNames.includes(term);
    }

    // 5. 客戶類型 (Client Tier)
    let matchesClientTier = true;
    if (filterClientTier !== 'ALL') {
      const tier = b.clientTier || 'NORMAL';
      matchesClientTier = tier === filterClientTier;
    }

    // 6. 車牌號碼 (License Plate)
    let matchesLicensePlate = true;
    if (filterLicensePlate.trim()) {
      const term = filterLicensePlate.toLowerCase().trim();
      const mainPlate = (b.licensePlate || '').toLowerCase();
      const extraPlates = b.licensePlates?.map(p => p.toLowerCase()).join(' ') || '';
      matchesLicensePlate = mainPlate.includes(term) || extraPlates.includes(term);
    }

    // 7. 聯絡電郵 (Contact Email)
    let matchesContactEmail = true;
    if (filterContactEmail.trim()) {
      const term = filterContactEmail.toLowerCase().trim();
      const mainEmail = (b.contactEmail || '').toLowerCase();
      const visitorEmails = b.visitors?.map(v => (v.email || '').toLowerCase()).join(' ') || '';
      matchesContactEmail = mainEmail.includes(term) || visitorEmails.includes(term);
    }

    // 8. 聯絡人 (Contact Person / Host / 僱員ID)
    let matchesContactPerson = true;
    if (filterContactPerson.trim()) {
      const term = filterContactPerson.toLowerCase().trim();
      const hostName = (b.hostEmployeeName || '').toLowerCase();
      const contactPersonName = (b.contactPerson || '').toLowerCase();
      const hostId = (b.hostEmployeeId || '').toLowerCase();
      matchesContactPerson = hostName.includes(term) || contactPersonName.includes(term) || hostId.includes(term);
    }

    return matchesVisitDate && matchesVerifyDate && matchesVisitorType && matchesVisitorName && matchesClientTier && matchesLicensePlate && matchesContactEmail && matchesContactPerson;
  });

  // Helper to distinguish REJECTED vs CANCELLED
  const isRejectedBooking = (b: Booking) => {
    return b.status === BookingStatus.CANCELLED && (
      rejectedBookingIds.has(b.id) || 
      b.approvalNotes === 'REJECTED' || 
      b.approvalNotes?.includes('拒絕') || 
      b.notes?.includes('拒絕') ||
      b.id.includes('REJ')
    );
  };

  const isCancelledBooking = (b: Booking) => {
    return b.status === BookingStatus.CANCELLED && !isRejectedBooking(b);
  };

  // Visitor records for CMS Visitor Tab
  const visitorTabBookings = filteredBookings;

  // Appointment Records for CMS Appointment Tab with Approval Filtering
  const appointmentTabBookings = filteredBookings.filter(b => {
    if (appointmentApprovalFilter === 'PENDING') {
      return b.status === BookingStatus.PENDING || b.isPendingApproval;
    }
    if (appointmentApprovalFilter === 'APPROVED') {
      return b.status === BookingStatus.UPCOMING || b.status === BookingStatus.CHECKED_IN || b.status === BookingStatus.COMPLETED;
    }
    if (appointmentApprovalFilter === 'REJECTED') {
      return isRejectedBooking(b);
    }
    if (appointmentApprovalFilter === 'CANCELLED') {
      return isCancelledBooking(b);
    }
    return true;
  });

  // Approval Counts
  const pendingAppointmentsCount = bookings.filter(b => b.status === BookingStatus.PENDING || b.isPendingApproval).length;
  const approvedAppointmentsCount = bookings.filter(b => b.status === BookingStatus.UPCOMING || b.status === BookingStatus.CHECKED_IN || b.status === BookingStatus.COMPLETED).length;
  const rejectedAppointmentsCount = bookings.filter(b => isRejectedBooking(b)).length;
  const cancelledAppointmentsCount = bookings.filter(b => isCancelledBooking(b)).length;

  // Batch Selection logic for Pending items
  const visiblePendingBookings = appointmentTabBookings.filter(b => b.status === BookingStatus.PENDING || b.isPendingApproval);
  const isAllPendingSelected = visiblePendingBookings.length > 0 && visiblePendingBookings.every(b => selectedPendingIds.includes(b.id));

  const handleToggleSelectAllPending = () => {
    if (isAllPendingSelected) {
      setSelectedPendingIds([]);
    } else {
      setSelectedPendingIds(visiblePendingBookings.map(b => b.id));
    }
    triggerSound(500, 'sine', 0.05);
  };

  const handleToggleSelectPending = (id: string) => {
    setSelectedPendingIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    triggerSound(600, 'sine', 0.05);
  };

  const handleBatchApprove = () => {
    if (selectedPendingIds.length === 0) return;
    const count = selectedPendingIds.length;
    selectedPendingIds.forEach(id => {
      onUpdateBookingStatus(id, BookingStatus.UPCOMING);
    });
    setSelectedPendingIds([]);
    triggerSound(900, 'sine', 0.2);
    alert(`已成功批量核准通過 ${count} 筆訪客預約申請！`);
  };

  const handleBatchReject = () => {
    if (selectedPendingIds.length === 0) return;
    const count = selectedPendingIds.length;
    setRejectedBookingIds(prev => {
      const next = new Set(prev);
      selectedPendingIds.forEach(id => next.add(id));
      return next;
    });
    selectedPendingIds.forEach(id => {
      onCancelBooking(id);
    });
    setSelectedPendingIds([]);
    triggerSound(300, 'triangle', 0.2);
    alert(`已成功批量拒絕 ${count} 筆訪客預約申請。`);
  };

  // Handle Walk-In Form Submit
  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!walkInName.trim()) errors.walkInName = '請輸入訪客姓名';
    if (!walkInContact.trim()) errors.walkInContact = '請輸入聯絡電話或電郵';
    if (!walkInDestination.trim()) errors.walkInDestination = '請輸入目的地';

    if (Object.keys(errors).length > 0) {
      setWalkInErrors(errors);
      triggerSound(250, 'triangle', 0.25);
      return;
    }

    const tempId = `WALK-${Date.now()}`;
    const codeNum = Math.floor(1000 + Math.random() * 9000);
    const codeChar = walkInName.slice(0, 2).replace(/[^a-zA-Z]/g, 'WK').toUpperCase();
    const tempCode = `TEMP-${codeNum}-${codeChar || 'WI'}`;

    const newWalkInBooking: Booking = {
      id: tempId,
      visitorName: walkInName,
      company: walkInCompany || '現場臨時登記 (Walk-In)',
      visitDateTime: new Date().toISOString(),
      licensePlate: walkInPlate || undefined,
      purpose: walkInPurpose,
      destination: walkInDestination,
      notes: walkInNotes ? `【臨時登記備註】${walkInNotes}` : '臨時登記/現場直通',
      contactEmail: walkInContact.includes('@') ? walkInContact : `${walkInContact}@temp-phone.tvb`,
      status: BookingStatus.CHECKED_IN,
      createdAt: new Date().toISOString(),
      checkedInAt: new Date().toISOString(),
      invitationCode: tempCode,
      isWalkIn: true,
      hostEmployeeName: '保安處服務台 (Front Desk Security)',
      hostEmployeeDept: '安全與物業部 (Security Dept)',
      contactPerson: 'May Tang',
      responsibleDept: 'New Media Group',
      contactPhone: '91946190'
    };

    onAddBooking({
      visitorName: newWalkInBooking.visitorName,
      company: newWalkInBooking.company,
      visitDateTime: newWalkInBooking.visitDateTime,
      licensePlate: newWalkInBooking.licensePlate,
      purpose: newWalkInBooking.purpose,
      destination: newWalkInBooking.destination,
      notes: newWalkInBooking.notes,
      contactEmail: newWalkInBooking.contactEmail,
      isWalkIn: true,
      hostEmployeeName: newWalkInBooking.hostEmployeeName,
      hostEmployeeDept: newWalkInBooking.hostEmployeeDept,
      contactPerson: 'May Tang',
      responsibleDept: 'New Media Group',
      contactPhone: '91946190'
    });

    setPrintedPass(newWalkInBooking);

    // Reset Form
    setWalkInName('');
    setWalkInCompany('');
    setWalkInContact('');
    setWalkInPlate('');
    setWalkInNotes('');
    setWalkInErrors({});
    setShowWalkInForm(false);
    
    triggerSound(800, 'sine', 0.15);
  };

  const handlePrint = () => {
    triggerSound(1200, 'sine', 0.05);
    setTimeout(() => triggerSound(1500, 'sine', 0.05), 100);
    alert('正在連接前台標籤印表機...\n訪客識別胸牌/通行證條碼已列印成功！');
  };

  // 1. Whitelist Handlers
  const handleAddWhitelistEmployee = () => {
    if (!newWlName.trim()) {
      alert('請填寫員工姓名！');
      return;
    }
    const newEntry = {
      id: `WL-${Date.now().toString().slice(-4)}`,
      employeeId: newWlEmpId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: newWlName.trim(),
      dept: newWlDept.trim() || '未分派部門',
      email: newWlEmail.trim() || 'employee@tvb.com.hk',
      status: 'ACTIVE' as const,
      addedAt: new Date().toISOString().slice(0, 10)
    };
    setWhitelistEmployees(prev => [newEntry, ...prev]);
    setShowAddWhitelistModal(false);
    triggerSound(900, 'sine', 0.15);
  };

  const handleToggleWhitelistStatus = (id: string) => {
    setWhitelistEmployees(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: item.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' };
      }
      return item;
    }));
    triggerSound(600, 'sine', 0.05);
  };

  const handleDeleteWhitelistEmployee = (id: string) => {
    if (confirm('確定要將該員工從白名單中移除嗎？')) {
      setWhitelistEmployees(prev => prev.filter(item => item.id !== id));
      triggerSound(400, 'sine', 0.1);
    }
  };

  // 2. Blacklist Handlers
  const handleAddBlacklistMember = () => {
    // 姓名為必填驗證 (Name required validation)
    if (!blName.trim()) {
      setBlError('【姓名】為必填欄位，請輸入訪客姓名！');
      triggerSound(250, 'triangle', 0.25);
      return;
    }
    const newEntry = {
      id: `BL-${Date.now().toString().slice(-4)}`,
      name: blName.trim(),
      idCard: blIdCard.trim() || '未提供證件號',
      email: blEmail.trim() || '-',
      phone: blPhone.trim() || '-',
      company: blCompany.trim() || '-',
      reason: blReason.trim() || '管理員手動錄入拉黑原因',
      addedAt: new Date().toISOString().slice(0, 10),
      status: 'ACTIVE' as const
    };
    setBlacklist(prev => [newEntry, ...prev]);
    setShowAddBlacklistModal(false);
    setBlName('');
    setBlIdCard('');
    setBlEmail('');
    setBlPhone('');
    setBlCompany('');
    setBlReason('');
    setBlError('');
    triggerSound(900, 'sine', 0.15);
  };

  const handleImportCsvBlacklist = () => {
    if (!csvInputText.trim()) {
      setCsvImportError('請貼上或匯入 CSV 數據文本！');
      triggerSound(250, 'triangle', 0.25);
      return;
    }

    const lines = csvInputText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      setCsvImportError('CSV 內容為空');
      return;
    }

    const newEntries: Array<{
      id: string;
      name: string;
      idCard: string;
      email: string;
      phone: string;
      company: string;
      reason: string;
      addedAt: string;
      status: 'ACTIVE' | 'EXPIRED';
    }> = [];

    let errorMsg = '';
    let startRow = 0;
    // Skip CSV header if exists
    if (lines[0].includes('姓名') || lines[0].toLowerCase().includes('name')) {
      startRow = 1;
    }

    for (let i = startRow; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      const name = cols[0] || '';
      const idCard = cols[1] || '';
      const email = cols[2] || '';
      const phone = cols[3] || '';
      const company = cols[4] || '';
      const reason = cols[5] || cols[4] || 'CSV 批量匯入拉黑';

      // 姓名為必填驗證 (Name required validation)
      if (!name) {
        errorMsg = `第 ${i + 1} 行數據無效：【姓名】為必填欄位，不得為空！`;
        break;
      }

      newEntries.push({
        id: `BL-CSV-${Date.now().toString().slice(-4)}-${i}`,
        name,
        idCard: idCard || '未填寫證件號',
        email: email || '-',
        phone: phone || '-',
        company: company || '-',
        reason: reason || 'CSV 批量匯入拉黑',
        addedAt: new Date().toISOString().slice(0, 10),
        status: 'ACTIVE'
      });
    }

    if (errorMsg) {
      setCsvImportError(errorMsg);
      triggerSound(250, 'triangle', 0.25);
      return;
    }

    if (newEntries.length === 0) {
      setCsvImportError('未解析出有效的黑名單記錄');
      return;
    }

    setBlacklist(prev => [...newEntries, ...prev]);
    setShowCsvImportModal(false);
    setCsvInputText('');
    setCsvImportError('');
    triggerSound(900, 'sine', 0.15);
    alert(`🎉 成功解析並匯入 ${newEntries.length} 筆訪客黑名單記錄！`);
  };

  const handleDeleteBlacklistMember = (id: string) => {
    if (confirm('確定要將該人員從訪客黑名單中解除/移除嗎？')) {
      setBlacklist(prev => prev.filter(item => item.id !== id));
      triggerSound(400, 'sine', 0.1);
    }
  };

  // 3. Push Configuration Handlers
  const handleSavePushConfig = () => {
    triggerSound(900, 'sine', 0.15);
    alert(' Push 通知配置（訪客到達前提醒 & 訪客抵達即時提醒）已成功儲存！');
  };

  const handleTestTriggerPush = () => {
    let title = pushArrivalTitle;
    let body = pushArrivalBody;

    title = title.replace('{visitorName}', '鄭嘉穎 (Kevin Cheng)')
                 .replace('{advanceMinutes}', String(pushPreArrivalMinutes));
    
    body = body.replace('{visitorName}', '鄭嘉穎 (Kevin Cheng)')
               .replace('{hostName}', '王小明')
               .replace('{company}', '索尼音樂 Sony Music')
               .replace('{checkInTime}', '14:30')
               .replace('{visitTime}', '15:00')
               .replace('{destination}', '7樓 行政會議室 A')
               .replace('{advanceMinutes}', String(pushPreArrivalMinutes));

    setPushTestToast({
      title,
      body,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    triggerSound(1000, 'sine', 0.1);
    setTimeout(() => triggerSound(1400, 'sine', 0.15), 120);

    setTimeout(() => {
      setPushTestToast(null);
    }, 6000);
  };

  // Render Reusable 8-Condition Filter Toolbar
  const renderFilterToolbar = () => (
    <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* 8 Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 items-end">
        
        {/* 1. 訪客類型 (Visitor Type) */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">👥 訪客類型</label>
          <select
            value={filterVisitorType}
            onChange={(e) => {
              setFilterVisitorType(e.target.value as any);
              triggerSound(600, 'sine', 0.05);
            }}
            className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">全部訪客類型</option>
            <option value="SINGLE">個人訪客</option>
            <option value="MULTI_SHARED">多人同行</option>
            <option value="MULTI">多人分行</option>
            <option value="TEAM">團隊訪客</option>
          </select>
        </div>

        {/* 2. 訪客姓名 (Visitor Name) */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">👤 訪客姓名</label>
          <input
            type="text"
            placeholder="搜尋訪客姓名"
            value={filterVisitorName}
            onChange={(e) => setFilterVisitorName(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* 3. 客戶類型 (Client Tier) */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">👑 客戶類型</label>
          <select
            value={filterClientTier}
            onChange={(e) => {
              setFilterClientTier(e.target.value as any);
              triggerSound(600, 'sine', 0.05);
            }}
            className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">全部客戶類型</option>
            <option value="NORMAL">普通客戶</option>
            <option value="VIP">👑 VIP客戶</option>
          </select>
        </div>

        {/* 4. 車牌號碼 (License Plate) */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">🚗 車牌號碼</label>
          <input
            type="text"
            placeholder="搜尋車牌"
            value={filterLicensePlate}
            onChange={(e) => setFilterLicensePlate(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* 5. 聯絡電郵 (Contact Email) */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">✉️ 聯絡電郵</label>
          <input
            type="text"
            placeholder="搜尋電郵"
            value={filterContactEmail}
            onChange={(e) => setFilterContactEmail(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* 6. 聯絡人 (Contact Person / Host) */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">📞 聯絡人</label>
          <input
            type="text"
            placeholder="對接人 / 僱員ID"
            value={filterContactPerson}
            onChange={(e) => setFilterContactPerson(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* 7. 到訪日期 (Visit Date) */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">📅 到訪日期</label>
          <input
            type="date"
            value={filterVisitDate}
            onChange={(e) => {
              setFilterVisitDate(e.target.value);
              triggerSound(600, 'sine', 0.05);
            }}
            className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* 8. 掃碼日期 (Verification Date) */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">⏱️ 掃碼日期</label>
          <input
            type="date"
            value={filterVerifyDate}
            onChange={(e) => {
              setFilterVerifyDate(e.target.value);
              triggerSound(600, 'sine', 0.05);
            }}
            className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

      </div>

      {/* Active Filter Indicator & Reset */}
      {(filterVisitDate || filterVerifyDate || filterVisitorType !== 'ALL' || filterVisitorName || filterClientTier !== 'ALL' || filterLicensePlate || filterContactEmail || filterContactPerson) && (
        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
            🔍 已開啟條件篩選（搜尋出 {filteredBookings.length} 筆記錄）
          </span>
          <button
            onClick={() => {
              setFilterVisitDate('');
              setFilterVerifyDate('');
              setFilterVisitorType('ALL');
              setFilterVisitorName('');
              setFilterClientTier('ALL');
              setFilterLicensePlate('');
              setFilterContactEmail('');
              setFilterContactPerson('');
              triggerSound(400, 'sine', 0.1);
            }}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            重置所有篩選
          </button>
        </div>
      )}

    </div>
  );

  return (
    <div id="cms-dashboard" className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full min-h-[750px]">
      
      {/* CMS Top Header Bar */}
      <div className="px-6 py-4.5 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Building size={20} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-wide text-slate-100 flex items-center gap-2">
              <span>TVB GO CMS</span>
              <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                ADMIN
              </span>
            </h2>
            <p className="text-xs text-slate-400">TVB GO 企業後台管理系統</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm('確定要載入/重置全部預設測試資料（包含多筆待審核、VIP、團隊預約記錄）嗎？')) {
              localStorage.removeItem('tvb_go_bookings_v8');
              localStorage.removeItem('tvb_go_bookings_v10');
              window.location.reload();
            }
          }}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <RefreshCw size={13} className="text-blue-400 animate-spin-slow" />
          <span>重置/重新載入所有測試記錄</span>
        </button>
      </div>

      {/* Main Grid: Left Sidebar & Right Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-slate-50 dark:bg-slate-900">
        
        {/* Left Side Sidebar */}
        <aside className="w-full lg:w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-850">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">系統功能選單</h3>
            </div>
            
            <nav className="space-y-4">
              {/* 訪客管理 主菜單 */}
              <div className="space-y-1.5">
                <div className="px-2 py-1 flex items-center gap-2 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <UserCheck size={14} className="text-blue-500" />
                  <span>訪客管理</span>
                </div>

                <div className="pl-1.5 space-y-1 border-l-2 border-slate-100 dark:border-slate-800/80 ml-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCmsTab('VISITORS');
                      triggerSound(600, 'sine', 0.05);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeCmsTab === 'VISITORS'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <UserCheck size={15} />
                    <span className="flex-1 text-left">訪客記錄</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCmsTab('EMPLOYEES');
                      triggerSound(650, 'sine', 0.05);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeCmsTab === 'EMPLOYEES'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <BookOpen size={15} />
                    <span className="flex-1 text-left flex items-center justify-between">
                      <span>訪客預約記錄</span>
                      {pendingAppointmentsCount > 0 && (
                        <span className="px-1.5 py-0.2 text-[10px] font-black bg-amber-500 text-white rounded-full animate-pulse">
                          {pendingAppointmentsCount}
                        </span>
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCmsTab('WHITELIST');
                      triggerSound(760, 'sine', 0.05);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeCmsTab === 'WHITELIST'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Sliders size={15} className="text-emerald-500 shrink-0" />
                    <span className="flex-1 text-left flex items-center justify-between min-w-0">
                      <span className="truncate">審核與白名單配置</span>
                      <span className={`px-1.5 py-0.2 text-[9px] font-black rounded shrink-0 ml-1 ${
                        isBookingApprovalRequired ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                      }`}>
                        {isBookingApprovalRequired ? '需審核' : '免審核'}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCmsTab('BLACKLIST');
                      triggerSound(770, 'sine', 0.05);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeCmsTab === 'BLACKLIST'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <ShieldAlert size={15} className="text-rose-400" />
                    <span className="flex-1 text-left flex items-center justify-between">
                      <span>訪客黑名單</span>
                      <span className="px-1.5 py-0.2 text-[9.5px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">
                        {blacklist.length}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCmsTab('EMAIL_TEMPLATES');
                      triggerSound(700, 'sine', 0.05);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeCmsTab === 'EMAIL_TEMPLATES'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Mail size={15} />
                    <span className="flex-1 text-left">電郵模版配置</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCmsTab('STAFF');
                      triggerSound(750, 'sine', 0.05);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeCmsTab === 'STAFF'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Sliders size={15} />
                    <span className="flex-1 text-left">掃碼人員配置</span>
                  </button>
                </div>
              </div>

              {/* Push 管理 主菜單 */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-850">
                <div className="px-2 py-1 flex items-center gap-2 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <Bell size={14} className="text-amber-500" />
                  <span>Push 管理</span>
                </div>

                <div className="pl-1.5 space-y-1 border-l-2 border-slate-100 dark:border-slate-800/80 ml-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCmsTab('PUSH_CONFIG');
                      triggerSound(780, 'sine', 0.05);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeCmsTab === 'PUSH_CONFIG'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Bell size={15} className="text-amber-400" />
                    <span className="flex-1 text-left">Push 通知配置</span>
                  </button>
                </div>
              </div>

              {/* 考勤管理 主菜單 */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-850">
                <div className="px-2 py-1 flex items-center gap-2 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <Clock size={14} className="text-blue-500" />
                  <span>考勤管理</span>
                </div>

                <div className="pl-1.5 space-y-1 border-l-2 border-slate-100 dark:border-slate-800/80 ml-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCmsTab('ATTENDANCE_LOGS');
                      triggerSound(800, 'sine', 0.05);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeCmsTab === 'ATTENDANCE_LOGS'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Clock size={15} />
                    <span className="flex-1 text-left">考勤記錄</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCmsTab('ATTENDANCE_CONFIG');
                      triggerSound(820, 'sine', 0.05);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeCmsTab === 'ATTENDANCE_CONFIG'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <ShieldCheck size={15} />
                    <span className="flex-1 text-left">考勤配置</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCmsTab('ATTENDANCE_REPORT');
                      triggerSound(840, 'sine', 0.05);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeCmsTab === 'ATTENDANCE_REPORT'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <FileSpreadsheet size={15} />
                    <span className="flex-1 text-left">月度考勤報表</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>

          {/* Sidebar Stats Widget */}
          <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-850 space-y-2">
            <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold">
              <span>控制中心狀態</span>
              <span className="text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                連線中
              </span>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 p-6 overflow-y-auto min-w-0">

          {/* PAGE 1: 訪客核銷記錄 */}
          {activeCmsTab === 'VISITORS' && (
            <div className="space-y-6">
              
              {/* Header Title & Summary Cards */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-50">訪客記錄列表</h3>
                  <p className="text-xs text-slate-400 mt-0.5">即時追蹤訪客登記狀態、核銷紀錄與客戶類型</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Download size={14} />
                  <span>匯出 CSV 報表</span>
                </button>
              </div>

              {/* KPI Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">總訪客預約數</div>
                  <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{totalBookings}</div>
                </div>
                <div className="bg-amber-500/10 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-900/40 shadow-2xs">
                  <div className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Crown size={12} className="fill-current" />
                    <span>VIP 客戶數</span>
                  </div>
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{vipBookingsCount}</div>
                </div>
                <div className="bg-emerald-500/10 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/40 shadow-2xs">
                  <div className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">在大樓內 / 進行中</div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{insideBuildingCount}</div>
                </div>
                <div className="bg-blue-500/10 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-200/50 dark:border-blue-900/40 shadow-2xs">
                  <div className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">待到訪預約</div>
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{upcomingCount}</div>
                </div>
              </div>

              {/* Printed Pass Card Preview */}
              {printedPass && (
                <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row gap-5 items-center justify-between animate-fade-in">
                  <div className="space-y-2 flex-1">
                    <span className="text-[10px] font-black text-emerald-400 tracking-wider block">● 訪客胸牌通行證打印預覽 (LOBBY GATE PASS)</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[9px]">訪客姓名</span>
                        <strong className="text-white text-sm">{printedPass.visitorName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">到訪性質</span>
                        <span className={`inline-flex px-1.5 py-0.2 mt-0.5 rounded text-[10px] font-bold border ${getPurposeOption(printedPass.purpose).color} ${getPurposeOption(printedPass.purpose).bgColor}`}>
                          {getPurposeOption(printedPass.purpose).label}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">目的地 / 處所</span>
                        <strong className="text-slate-300">{printedPass.destination}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">通行邀請代碼</span>
                        <strong className="text-amber-400 font-mono text-xs">{printedPass.invitationCode}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => setPrintedPass(null)}
                      className="px-3.5 py-2 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      關閉預覽
                    </button>
                    <button 
                      onClick={handlePrint}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Printer size={13} />
                      <span>列印訪客貼紙 / Pass</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Advanced Filter Toolbar */}
              {renderFilterToolbar()}

      {/* Records Table Card */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3.5 whitespace-nowrap">ID</th>
                        <th className="p-3.5 text-center whitespace-nowrap">訪客類型</th>
                        <th className="p-3.5 whitespace-nowrap">訪客姓名</th>
                        <th className="p-3.5 text-center whitespace-nowrap">客戶類型</th>
                        <th className="p-3.5 whitespace-nowrap">公司名稱</th>
                        <th className="p-3.5 text-center whitespace-nowrap">到訪模式</th>
                        <th className="p-3.5 whitespace-nowrap">到訪日期與時間</th>
                        <th className="p-3.5 whitespace-nowrap">目的地</th>
                        <th className="p-3.5 whitespace-nowrap">車牌號碼</th>
                        <th className="p-3.5 text-center whitespace-nowrap">到訪性質</th>
                        <th className="p-3.5 whitespace-nowrap">聯絡電郵</th>
                        <th className="p-3.5 whitespace-nowrap">對接員工</th>
                        <th className="p-3.5 whitespace-nowrap">負責部門</th>
                        <th className="p-3.5 whitespace-nowrap">掃碼時間</th>
                        <th className="p-3.5 whitespace-nowrap">關聯預約 ID</th>
                        <th className="p-3.5 text-center whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                      {visitorTabBookings.length === 0 ? (
                        <tr>
                          <td colSpan={16} className="p-12 text-center text-slate-400">
                            <AlertCircle size={32} className="mx-auto mb-2.5 text-slate-300 dark:text-slate-700" />
                            <span className="font-bold">無符合條件的訪客記錄。</span>
                          </td>
                        </tr>
                      ) : (
                        visitorTabBookings.map((b) => {
                          const purposeOpt = getPurposeOption(b.purpose);
                          return (
                            <tr key={b.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-900/30 transition-colors">
                              {/* 1. ID */}
                              <td className="p-3.5 font-mono font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {b.id}
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
                                  {b.clientTier === 'VIP' && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] font-black rounded shadow-2xs">
                                      <Crown size={9} className="fill-current" />
                                      <span>VIP</span>
                                    </span>
                                  )}
                                  {b.totalVisitorsCount && b.totalVisitorsCount > 1 && (
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      (共{b.totalVisitorsCount}人)
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* 4. 客戶類型 */}
                              <td className="p-3.5 text-center whitespace-nowrap">
                                {b.clientTier === 'VIP' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800 text-[10.5px] font-bold rounded-md">
                                    <Crown size={11} className="fill-current" />
                                    <span>VIP客戶</span>
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
                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                                  b.visitMode === 'MULTI_PASS'
                                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/50'
                                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                                }`}>
                                  {getVisitModeLabel(b.visitMode)}
                                </span>
                              </td>

                              {/* 7. 到訪日期與時間 */}
                              <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {formatDateToStandard(b.visitDateTime)}
                              </td>

                              {/* 8. 目的地 */}
                              <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {b.destination || <span className="text-slate-400 italic">地下 A 廠影視大堂</span>}
                              </td>

                              {/* 9. 車牌號碼 */}
                              <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                                {b.licensePlate ? (
                                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[11px]">
                                    {b.licensePlate}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">-</span>
                                )}
                              </td>

                              {/* 10. 到訪性質 */}
                              <td className="p-3.5 text-center whitespace-nowrap">
                                <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-bold border whitespace-nowrap ${purposeOpt.color} ${purposeOpt.bgColor}`}>
                                  {purposeOpt.label}
                                </span>
                              </td>

                              {/* 11. 聯絡電郵 */}
                              <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                {b.contactEmail || '-'}
                              </td>

                              {/* 12. 對接員工 */}
                              <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                {b.contactPerson || b.hostEmployeeName || 'May Tang'}
                              </td>

                              {/* 13. 負責部門 */}
                              <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                {b.responsibleDept || b.hostEmployeeDept || 'New Media Group'}
                              </td>

                              {/* 14. 掃碼時間 */}
                              <td className="p-3.5 font-semibold whitespace-nowrap">
                                {b.checkedInAt ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                    {formatDateToStandard(b.checkedInAt)}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">未核銷</span>
                                )}
                              </td>

                              {/* 15. 關聯員工預約 ID */}
                              <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {b.associatedBookingId || '-'}
                              </td>

                              {/* 操作 */}
                              <td className="p-3.5 text-center">
                                <button
                                  onClick={() => {
                                    setViewingBooking(b);
                                    triggerSound(600, 'sine', 0.05);
                                  }}
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[11px] font-bold rounded-lg cursor-pointer transition-all border border-blue-200/20 whitespace-nowrap"
                                >
                                  查看
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer counters */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  <span>顯示 {filteredBookings.length} / 共 {totalBookings} 筆記錄</span>
                </div>
              </div>

            </div>
          )}

          {/* PAGE 2: 訪客預約記錄 */}
          {activeCmsTab === 'EMPLOYEES' && (
            <div className="space-y-6">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <span>訪客預約記錄與審核中心</span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-300 dark:border-amber-800">
                      審核管理
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">查看與審核用戶端 APP 提交之訪客預約，發放入場放行權限</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Download size={14} />
                  <span>匯出預約 CSV 報表</span>
                </button>
              </div>

              {/* Advanced 8-Condition Filter Toolbar */}
              {renderFilterToolbar()}

              {/* Approval KPI Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div 
                  onClick={() => setAppointmentApprovalFilter('ALL')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    appointmentApprovalFilter === 'ALL'
                      ? 'bg-slate-900 text-white border-slate-700 shadow-md ring-2 ring-slate-400'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider opacity-70">全部預約</div>
                  <div className="text-xl font-black mt-1">{bookings.length}</div>
                </div>

                <div 
                  onClick={() => setAppointmentApprovalFilter('PENDING')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    appointmentApprovalFilter === 'PENDING'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                      : 'bg-amber-500/10 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/40 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Clock size={12} />
                    <span>待審核</span>
                  </div>
                  <div className="text-xl font-black mt-1">{pendingAppointmentsCount}</div>
                </div>

                <div 
                  onClick={() => setAppointmentApprovalFilter('APPROVED')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    appointmentApprovalFilter === 'APPROVED'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                      : 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle size={12} />
                    <span>已核准</span>
                  </div>
                  <div className="text-xl font-black mt-1">{approvedAppointmentsCount}</div>
                </div>

                <div 
                  onClick={() => setAppointmentApprovalFilter('REJECTED')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    appointmentApprovalFilter === 'REJECTED'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-300'
                      : 'bg-rose-500/10 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/40 text-rose-700 dark:text-rose-400'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <XCircle size={12} />
                    <span>已拒絕</span>
                  </div>
                  <div className="text-xl font-black mt-1">{rejectedAppointmentsCount}</div>
                </div>

                <div 
                  onClick={() => setAppointmentApprovalFilter('CANCELLED')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    appointmentApprovalFilter === 'CANCELLED'
                      ? 'bg-slate-700 text-white border-slate-800 shadow-md ring-2 ring-slate-400'
                      : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <X size={12} />
                    <span>已取消</span>
                  </div>
                  <div className="text-xl font-black mt-1">{cancelledAppointmentsCount}</div>
                </div>
              </div>

              {/* Quick Approval Sub-tabs */}
              <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
                <button
                  onClick={() => setAppointmentApprovalFilter('ALL')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    appointmentApprovalFilter === 'ALL'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  全部預約 ({filteredBookings.length})
                </button>
                <button
                  onClick={() => setAppointmentApprovalFilter('PENDING')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    appointmentApprovalFilter === 'PENDING'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  }`}
                >
                  <span>⏳ 待審核</span>
                  <span className="px-1.5 py-0.2 bg-amber-600 text-white text-[10px] rounded-full font-extrabold">{pendingAppointmentsCount}</span>
                </button>
                <button
                  onClick={() => setAppointmentApprovalFilter('APPROVED')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    appointmentApprovalFilter === 'APPROVED'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  }`}
                >
                  ✅ 已核准 ({approvedAppointmentsCount})
                </button>
                <button
                  onClick={() => setAppointmentApprovalFilter('REJECTED')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    appointmentApprovalFilter === 'REJECTED'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                  }`}
                >
                  ❌ 已拒絕 ({rejectedAppointmentsCount})
                </button>
                <button
                  onClick={() => setAppointmentApprovalFilter('CANCELLED')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    appointmentApprovalFilter === 'CANCELLED'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  🚫 已取消 ({cancelledAppointmentsCount})
                </button>
              </div>

              {/* Batch Action Bar */}
              {selectedPendingIds.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-3.5 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-black">
                    <CheckCircle size={16} className="text-white animate-pulse" />
                    <span>已勾選 <strong className="text-sm underline px-1">{selectedPendingIds.length}</strong> 筆待審核預約</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleBatchApprove}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle size={14} />
                      <span>批量通過 ({selectedPendingIds.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleBatchReject}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <XCircle size={14} />
                      <span>批量拒絕 ({selectedPendingIds.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPendingIds([])}
                      className="px-3 py-1.5 bg-black/20 hover:bg-black/30 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      取消選擇
                    </button>
                  </div>
                </div>
              )}

              {/* Visitor Bookings Table Card */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">訪客線上預約登記審核明細</h4>
                  <span className="text-[10px] font-semibold text-slate-400">支援勾選批量審核、批核發放通行條碼或撤銷預約</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3.5 text-center whitespace-nowrap w-10">
                          <input
                            type="checkbox"
                            checked={isAllPendingSelected}
                            onChange={handleToggleSelectAllPending}
                            disabled={visiblePendingBookings.length === 0}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-30"
                            title={visiblePendingBookings.length > 0 ? "全選/取消全選待審核項" : "當前頁面無待審核項"}
                          />
                        </th>
                        <th className="p-3.5 whitespace-nowrap">ID</th>
                        <th className="p-3.5 whitespace-nowrap">申報/對接員工</th>
                        <th className="p-3.5 text-center whitespace-nowrap">訪客類型</th>
                        <th className="p-3.5 whitespace-nowrap">訪客姓名</th>
                        <th className="p-3.5 text-center whitespace-nowrap">客戶類型</th>
                        <th className="p-3.5 whitespace-nowrap">公司名稱</th>
                        <th className="p-3.5 text-center whitespace-nowrap">到訪模式</th>
                        <th className="p-3.5 whitespace-nowrap">到訪日期與時間</th>
                        <th className="p-3.5 whitespace-nowrap">目的地</th>
                        <th className="p-3.5 whitespace-nowrap">車牌號碼</th>
                        <th className="p-3.5 text-center whitespace-nowrap">到訪性質</th>
                        <th className="p-3.5 whitespace-nowrap">聯絡電郵</th>
                        <th className="p-3.5 text-center whitespace-nowrap">到訪狀態</th>
                        <th className="p-3.5 text-center whitespace-nowrap">審核狀態</th>
                        <th className="p-3.5 text-center whitespace-nowrap">審核操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                      {appointmentTabBookings.length === 0 ? (
                        <tr>
                          <td colSpan={16} className="p-12 text-center text-slate-400">
                            <AlertCircle size={32} className="mx-auto mb-2.5 text-slate-300 dark:text-slate-700" />
                            <span className="font-bold">目前無符合條件之訪客預約記錄。</span>
                          </td>
                        </tr>
                      ) : (
                        appointmentTabBookings.map((b) => {
                          const purposeOpt = getPurposeOption(b.purpose);
                          const isPending = b.status === BookingStatus.PENDING || b.isPendingApproval;
                          return (
                            <tr key={b.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-900/30 transition-colors">
                              {/* 0. Checkbox for Batch Selection */}
                              <td className="p-3.5 text-center whitespace-nowrap">
                                {isPending ? (
                                  <input
                                    type="checkbox"
                                    checked={selectedPendingIds.includes(b.id)}
                                    onChange={() => handleToggleSelectPending(b.id)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                ) : (
                                  <span className="text-slate-300 dark:text-slate-700 font-mono text-[10px]">•</span>
                                )}
                              </td>

                              {/* 1. ID */}
                              <td className="p-3.5 font-mono font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {b.id}
                              </td>

                              {/* 2. 申報員工 */}
                              <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                <div>
                                  <span>{b.hostEmployeeName || b.contactPerson || '員工'}</span>
                                  {(b.hostEmployeeDept || b.responsibleDept) && (
                                    <span className="block text-[10px] text-slate-400 font-normal">
                                      {b.hostEmployeeDept || b.responsibleDept}
                                    </span>
                                  )}
                                  <span className="block text-[9.5px] font-mono text-blue-500 font-bold">
                                    {b.hostEmployeeId || 'EMP-88210'}
                                  </span>
                                </div>
                              </td>

                              {/* 3. 訪客類型 */}
                              <td className="p-3.5 text-center whitespace-nowrap">
                                <span className="inline-flex px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 text-[10px] font-bold rounded-md">
                                  {getVisitorTypeLabel(b.visitorType)}
                                </span>
                              </td>

                              {/* 4. 訪客姓名 */}
                              <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span>{b.visitorName}</span>
                                  {b.clientTier === 'VIP' && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] font-black rounded shadow-2xs">
                                      <Crown size={9} className="fill-current" />
                                      <span>VIP</span>
                                    </span>
                                  )}
                                  {b.totalVisitorsCount && b.totalVisitorsCount > 1 && (
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      (共{b.totalVisitorsCount}人)
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* 5. 客戶類型 */}
                              <td className="p-3.5 text-center whitespace-nowrap">
                                {b.clientTier === 'VIP' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800 text-[10.5px] font-bold rounded-md">
                                    <Crown size={11} className="fill-current" />
                                    <span>VIP客戶</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10.5px] font-semibold rounded-md border border-slate-200 dark:border-slate-700">
                                    普通客戶
                                  </span>
                                )}
                              </td>

                              {/* 6. 公司名稱 */}
                              <td className="p-3.5 text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">
                                {b.company || <span className="text-slate-400 italic">個人代表</span>}
                              </td>

                              {/* 7. 到訪模式 */}
                              <td className="p-3.5 text-center whitespace-nowrap">
                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                                  b.visitMode === 'MULTI_PASS'
                                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/50'
                                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                                }`}>
                                  {getVisitModeLabel(b.visitMode)}
                                </span>
                              </td>

                              {/* 8. 到訪日期與時間 */}
                              <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {formatDateToStandard(b.visitDateTime)}
                              </td>

                              {/* 9. 目的地 */}
                              <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {b.destination || <span className="text-slate-400 italic">地下 A 廠影視大堂</span>}
                              </td>

                              {/* 10. 車牌號碼 */}
                              <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                                {b.licensePlate ? (
                                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[11px]">
                                    {b.licensePlate}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">-</span>
                                )}
                              </td>

                              {/* 11. 到訪性質 */}
                              <td className="p-3.5 text-center whitespace-nowrap">
                                <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-bold border whitespace-nowrap ${purposeOpt.color} ${purposeOpt.bgColor}`}>
                                  {purposeOpt.label}
                                </span>
                              </td>

                              {/* 12. 聯絡電郵 */}
                              <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                {b.contactEmail || '-'}
                              </td>

                              {/* 13. 到訪狀態 */}
                              <td className="p-3.5 text-center whitespace-nowrap">
                                {isPending ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 rounded-full border border-amber-300 dark:border-amber-800">
                                    <Clock size={11} className="animate-spin" />
                                    <span>PENDING 待到訪</span>
                                  </span>
                                ) : b.status === BookingStatus.CHECKED_IN ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-full border border-blue-300 dark:border-blue-800">
                                    <span>🟢 進行中</span>
                                  </span>
                                ) : b.status === BookingStatus.UPCOMING ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 rounded-full border border-emerald-300 dark:border-emerald-800">
                                    <span>📅 待到訪</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-black text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-700">
                                    <span>🚫 已取消</span>
                                  </span>
                                )}
                              </td>

                              {/* 14. 審核狀態 */}
                              <td className="p-3.5 text-center whitespace-nowrap">
                                {isPending ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 rounded-full border border-amber-300 dark:border-amber-800">
                                    <Clock size={11} className="animate-spin" />
                                    <span>⏳ 待審核</span>
                                  </span>
                                ) : isRejectedBooking(b) ? (
                                  <span className="inline-flex px-2.5 py-0.5 text-[10.5px] font-black text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 rounded-full border border-rose-300 dark:border-rose-800">
                                    ❌ 已拒絕
                                  </span>
                                ) : b.status === BookingStatus.CANCELLED ? (
                                  <span className="inline-flex px-2.5 py-0.5 text-[10.5px] font-black text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-700">
                                    🚫 已取消
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2.5 py-0.5 text-[10.5px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 rounded-full border border-emerald-300 dark:border-emerald-800">
                                    ✅ 已核准放行
                                  </span>
                                )}
                              </td>

                              {/* 14. 審核操作 */}
                              <td className="p-3.5 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1.5">
                                  {isPending && (
                                    <>
                                      <button
                                        onClick={() => {
                                          onUpdateBookingStatus(b.id, BookingStatus.UPCOMING);
                                          triggerSound(900, 'sine', 0.15);
                                          alert(`預約 ${b.id} 核准成功！已開放該訪客入場通行。`);
                                        }}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all shadow-2xs flex items-center gap-1"
                                        title="同意該預約申請"
                                      >
                                        <CheckCircle size={12} />
                                        <span>同意</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          onCancelBooking(b.id);
                                          setRejectedBookingIds(prev => new Set(prev).add(b.id));
                                          triggerSound(300, 'triangle', 0.15);
                                          alert(`已拒絕預約申請 ${b.id}`);
                                        }}
                                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all shadow-2xs flex items-center gap-1"
                                        title="拒絕該預約申請"
                                      >
                                        <XCircle size={12} />
                                        <span>拒絕</span>
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => {
                                      setViewingBooking(b);
                                      triggerSound(600, 'sine', 0.05);
                                    }}
                                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[11px] font-bold rounded-lg cursor-pointer transition-all border border-blue-200/20 whitespace-nowrap"
                                  >
                                    詳情
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer counters */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  <span>顯示 {appointmentTabBookings.length} / 共 {bookings.length} 筆預約記錄</span>
                </div>
              </div>

            </div>
          )}

          {/* PAGE 3: 電郵模版配置 */}
          {activeCmsTab === 'EMAIL_TEMPLATES' && (
            <div className="space-y-6">
              
              {/* Header Title */}
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-50">內部通知郵件配置 (Internal Notification Mail Configurations)</h3>
                <p className="text-xs text-slate-400 mt-0.5">預約成功後發送通知電郵給保安及安全科、接待處</p>
              </div>

              {/* Configuration Panel (Full Width) */}
              <div className="max-w-4xl mx-auto space-y-4">
                
                {/* Editor Column */}
                <div className="space-y-4">

                  {/* Notification Recipients Settings */}
                  <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-250 dark:border-slate-800 shadow-xs space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                      <Settings size={14} className="text-blue-500" />
                      <span>通知郵箱配置 (Notification Recipients)</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          保安及安全科通知郵箱
                        </label>
                        <input
                          type="email"
                          value={securityEmail}
                          onChange={(e) => setSecurityEmail(e.target.value)}
                          placeholder="例如: security-ops@tvb.com.hk"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          接待處通知郵箱
                        </label>
                        <input
                          type="email"
                          value={receptionEmail}
                          onChange={(e) => setReceptionEmail(e.target.value)}
                          placeholder="例如: reception-desk@tvb.com.hk"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-medium"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Subject and Body editors */}
                  <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-250 dark:border-slate-800 shadow-xs space-y-4">
                    
                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">電郵郵件主旨 (Email Subject)</label>
                      <input
                        type="text"
                        value={tempSubject}
                        onChange={(e) => setTempSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                      />
                    </div>

                    {/* Body */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        電郵內文範本 (HTML / Plain text Template Body)
                      </label>
                      <textarea
                        value={tempBody}
                        onChange={(e) => setTempBody(e.target.value)}
                        rows={11}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono resize-none leading-relaxed"
                      />
                    </div>

                    {/* Interactive Placeholder variables panel */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                      <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">
                        📋 點擊下方變數標籤，自動在內文末尾追加：
                      </span>
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('visitorName')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-300 text-blue-600 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                          title="訪客姓名"
                        >
                          {"{visitorName}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('company')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-300 text-blue-600 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                          title="代表公司"
                        >
                          {"{company}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('visitTime')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-300 text-blue-600 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                          title="到訪時間"
                        >
                          {"{visitTime}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('visitDate')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-300 text-blue-600 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                          title="到訪日期"
                        >
                          {"{visitDate}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('visitTimeOnly')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-300 text-blue-600 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                          title="時間"
                        >
                          {"{visitTimeOnly}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('purpose')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-300 text-blue-600 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                          title="到訪性質"
                        >
                          {"{purpose}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('destination')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-300 text-blue-600 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                          title="目的地"
                        >
                          {"{destination}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('invitationCode')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-300 text-blue-600 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                          title="預約代碼"
                        >
                          {"{invitationCode}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('notes')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-300 text-blue-600 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                          title="備註"
                        >
                          {"{notes}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('hostName')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-300 text-blue-600 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                          title="對接員工"
                        >
                          {"{hostName}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('hostDept')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-300 text-blue-600 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                          title="員工部門"
                        >
                          {"{hostDept}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('hostPhone')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-300 text-blue-600 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                          title="員工電話"
                        >
                          {"{hostPhone}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('licensePlate')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-300 text-blue-600 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                          title="車牌登記"
                        >
                          {"{licensePlate}"}
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleSaveTemplate}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-550 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <Save size={13} />
                        <span>儲存範本配置</span>
                      </button>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* WHITELIST: 審核與白名單配置 */}
          {activeCmsTab === 'WHITELIST' && (
            <div className="space-y-6">
              
              {/* Header Title */}
              <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <Sliders className="text-emerald-500" size={20} />
                  <span>審核與白名單配置</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">統一管理「訪客預約是否需要審核」之系統全域開關，以及「授權發起訪客邀請之員工白名單」。</p>
              </div>

              {/* CARD 1: 訪客預約審核開關配置 */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-blue-500" />
                        <span>訪客預約審核開關</span>
                      </h4>
                      <span className={`text-[10.5px] px-2.5 py-0.5 rounded-full font-black border ${
                        isBookingApprovalRequired
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      }`}>
                        {isBookingApprovalRequired ? '⏳ 審核流程已啟用 (預約需審核通過)' : '⚡ 免審核 (提交後自動放行)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                      控制系統中發起的訪客預約是否需要經過管理員/接洽人員審核。開啟後預約將進入「待審核」清單；關閉後預約自動通過。
                    </p>
                  </div>

                  {/* Switch Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !isBookingApprovalRequired;
                      setIsBookingApprovalRequired(nextVal);
                      localStorage.setItem('tvb_booking_approval_required', String(nextVal));
                      triggerSound(800, 'sine', 0.1);
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs border shrink-0 ${
                      isBookingApprovalRequired
                        ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-400'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                    }`}
                  >
                    {isBookingApprovalRequired ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    <span>{isBookingApprovalRequired ? '已啟用審核 (點擊切換為免審核)' : '已關閉審核 (點擊開啟人工審核)'}</span>
                  </button>
                </div>

                {/* Info Note */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                  <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-[11px] leading-relaxed">
                    <p className="font-bold text-slate-800 dark:text-slate-200">審核開關邏輯說明：</p>
                    <p>• <strong>開啟審核（需審核）</strong>：訪客或員工提交預約後，狀態為「⏳ 待審核」，需在 CMS 看板中點擊「通過審核」後方可生成放行條碼通行證。</p>
                    <p>• <strong>關閉審核（免審核）</strong>：預約提交後直接自動核準，狀態設為「📅 待到訪」，並可立即保存或發送電子通行證。</p>
                  </div>
                </div>
              </div>

              {/* CARD 2: 員工白名單管理 Header Title & Switch */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <UserPlus size={16} className="text-emerald-500" />
                    <span>訪客邀請 員工白名單配置</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      whitelistEnabled 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' 
                        : 'bg-slate-100 text-slate-500 border-slate-300'
                    }`}>
                      {whitelistEnabled ? '● 白名單限制生效中' : '○ 已開放全員申請'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">前期僅開放白名單員工在 App 中發起訪客邀請。不在白名單內的員工暫無法發起預約。</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setWhitelistEnabled(!whitelistEnabled);
                      triggerSound(800, 'sine', 0.1);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                      whitelistEnabled
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {whitelistEnabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    <span>{whitelistEnabled ? '開啓白名單限制' : '關閉白名單限制 (開放全員)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAddWhitelistModal(true);
                      triggerSound(600, 'sine', 0.05);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-550 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <Plus size={14} />
                    <span>新增白名單員工</span>
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">白名單總員工人數</span>
                  <span className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5 block">{whitelistEmployees.length} 人</span>
                </div>
                <div className="p-4 bg-emerald-500/10 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/40">
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">正常可邀請員工</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {whitelistEmployees.filter(e => e.status === 'ACTIVE').length} 人
                  </span>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">已暫停邀請權限</span>
                  <span className="text-xl font-black text-slate-500 dark:text-slate-400 mt-0.5 block">
                    {whitelistEmployees.filter(e => e.status === 'DISABLED').length} 人
                  </span>
                </div>
              </div>

              {/* Table Card */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <UserPlus size={14} className="text-blue-500" />
                    <span>授權員工白名單明細</span>
                  </h4>

                  <div className="w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="搜尋僱員ID、姓名或部門..."
                      value={whitelistSearchTerm}
                      onChange={(e) => setWhitelistSearchTerm(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3.5 whitespace-nowrap">僱員 ID</th>
                        <th className="p-3.5 whitespace-nowrap">員工姓名</th>
                        <th className="p-3.5 whitespace-nowrap">所屬部門</th>
                        <th className="p-3.5 whitespace-nowrap">聯絡電郵</th>
                        <th className="p-3.5 text-center whitespace-nowrap">權限狀態</th>
                        <th className="p-3.5 whitespace-nowrap">加入日期</th>
                        <th className="p-3.5 text-center whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                      {whitelistEmployees
                        .filter(emp => {
                          if (!whitelistSearchTerm.trim()) return true;
                          const term = whitelistSearchTerm.toLowerCase();
                          return emp.employeeId.toLowerCase().includes(term) || emp.name.toLowerCase().includes(term) || emp.dept.toLowerCase().includes(term);
                        })
                        .map(emp => (
                          <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                            <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{emp.employeeId}</td>
                            <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{emp.name}</td>
                            <td className="p-3.5 text-slate-600 dark:text-slate-300">{emp.dept}</td>
                            <td className="p-3.5 font-mono text-slate-500">{emp.email}</td>
                            <td className="p-3.5 text-center">
                              {emp.status === 'ACTIVE' ? (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold rounded-md">
                                  啟用中
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold rounded-md">
                                  已停用
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 font-mono text-slate-400">{emp.addedAt}</td>
                            <td className="p-3.5 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleWhitelistStatus(emp.id)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                                >
                                  {emp.status === 'ACTIVE' ? '停用' : '啟用'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteWhitelistEmployee(emp.id)}
                                  className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                                  title="移除"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* BLACKLIST: 訪客黑名單管理 (含 CSV 匯入、姓名必填驗證) */}
          {activeCmsTab === 'BLACKLIST' && (
            <div className="space-y-6">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <ShieldAlert className="text-rose-500" size={20} />
                    <span>訪客黑名單管理中心</span>
                    <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full font-bold border border-rose-300 dark:border-rose-800">
                      門禁管制黑名單 ({blacklist.length} 筆)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">維護不可進場之訪客黑名單。黑名單人員進行預約或在大門掃碼時將直接觸發攔截提示。</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCsvImportModal(true);
                      triggerSound(600, 'sine', 0.05);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <Upload size={14} />
                    <span>匯入黑名單 CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAddBlacklistModal(true);
                      setBlError('');
                      triggerSound(600, 'sine', 0.05);
                    }}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <Plus size={14} />
                    <span>手動新增黑名單</span>
                  </button>
                </div>
              </div>

              {/* Blacklist Table */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-rose-500" />
                    <span>黑名單警示數據表（姓名為必填對比項目）</span>
                  </h4>

                  <div className="w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="搜尋黑名單姓名、證件號、電郵或原因..."
                      value={blacklistSearchTerm}
                      onChange={(e) => setBlacklistSearchTerm(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3.5 whitespace-nowrap">訪客姓名 <span className="text-rose-500">* (必填)</span></th>
                        <th className="p-3.5 whitespace-nowrap">證件號碼</th>
                        <th className="p-3.5 whitespace-nowrap">聯絡電郵</th>
                        <th className="p-3.5 whitespace-nowrap">電話 / 機構公司</th>
                        <th className="p-3.5 whitespace-nowrap">管制/拉黑原因</th>
                        <th className="p-3.5 whitespace-nowrap">錄入日期</th>
                        <th className="p-3.5 text-center whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                      {blacklist
                        .filter(item => {
                          if (!blacklistSearchTerm.trim()) return true;
                          const term = blacklistSearchTerm.toLowerCase();
                          return item.name.toLowerCase().includes(term) || item.idCard.toLowerCase().includes(term) || item.email.toLowerCase().includes(term) || item.reason.toLowerCase().includes(term);
                        })
                        .map(item => (
                          <tr key={item.id} className="hover:bg-rose-50/20 dark:hover:bg-rose-950/20">
                            <td className="p-3.5 font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                              <span>{item.name}</span>
                              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-black rounded">黑名單</span>
                            </td>
                            <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 font-semibold">{item.idCard}</td>
                            <td className="p-3.5 font-mono text-slate-500">{item.email}</td>
                            <td className="p-3.5 text-slate-600 dark:text-slate-300">
                              <div>{item.company}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{item.phone}</div>
                            </td>
                            <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium max-w-xs">{item.reason}</td>
                            <td className="p-3.5 font-mono text-slate-400">{item.addedAt}</td>
                            <td className="p-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteBlacklistMember(item.id)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                              >
                                解除/移除
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

          {/* PUSH_CONFIG: Push 通知配置 */}
          {activeCmsTab === 'PUSH_CONFIG' && (
            <div className="space-y-6">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Bell className="text-amber-500" size={20} />
                    <span>Push 通知配置中心</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">分別設定「訪客到達前 X 分鐘提醒 Push」與「訪客抵達即時 Push」之開啟/關閉狀態、提前時間 X、標題與內文。</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleSavePushConfig}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-550 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer flex items-center gap-2 transition-all"
                  >
                    <Save size={15} />
                    <span>儲存 Push 配置</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Tags Helper Banner */}
              <div className="p-4 bg-amber-500/10 border border-amber-200/50 dark:border-amber-900/40 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <FileText size={14} />
                  <span>Push 文案動態變數標籤（在輸入框中插入即可於發送時自動替換）：</span>
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { tag: '{visitorName}', desc: '訪客姓名' },
                    { tag: '{hostName}', desc: '接洽員工姓名' },
                    { tag: '{company}', desc: '訪客公司/機構' },
                    { tag: '{destination}', desc: '到訪目的地' },
                    { tag: '{visitTime}', desc: '預約到訪時間' },
                    { tag: '{checkInTime}', desc: '核銷抵達時間' },
                    { tag: '{advanceMinutes}', desc: '提前提醒分鐘數' }
                  ].map(item => (
                    <span
                      key={item.tag}
                      className="px-2 py-1 bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-lg text-[11px] font-mono font-bold"
                    >
                      {item.tag} <span className="font-normal text-slate-500 text-[10px]">({item.desc})</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Two Full-Width Rows for Push Configurations */}
              <div className="space-y-6">
                
                {/* Row 1: 訪客到達前 X 分鐘提醒 Push */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Clock size={18} className="text-amber-500" />
                      <span>1. 訪客到達前 X 分鐘提醒 Push</span>
                    </h4>

                    {/* Enable / Disable Switch */}
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <span className={`text-xs font-bold ${pushPreArrivalEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {pushPreArrivalEnabled ? '已開啟' : '已關閉'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPushPreArrivalEnabled(!pushPreArrivalEnabled);
                          triggerSound(600, 'sine', 0.05);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          pushPreArrivalEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            pushPreArrivalEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </label>
                  </div>

                  <div className="space-y-4">
                    {/* Advance Time X */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                        <span>提醒時間 X (到達前分鐘數)</span>
                        <span className="text-amber-500 font-bold">*</span>
                      </label>
                      <select
                        value={pushPreArrivalMinutes}
                        onChange={(e) => {
                          setPushPreArrivalMinutes(Number(e.target.value));
                          triggerSound(600, 'sine', 0.05);
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                        <option value={15}>提前 15 分鐘提醒</option>
                        <option value={30}>提前 30 分鐘提醒 (預設)</option>
                        <option value={45}>提前 45 分鐘提醒</option>
                        <option value={60}>提前 60 分鐘 (1小時) 提醒</option>
                        <option value={120}>提前 120 分鐘 (2小時) 提醒</option>
                      </select>
                    </div>

                    {/* Push Title */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">標題</label>
                      <input
                        type="text"
                        value={pushPreArrivalTitle}
                        onChange={(e) => setPushPreArrivalTitle(e.target.value)}
                        placeholder="請輸入標題..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    {/* Push Body */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">內容</label>
                      <textarea
                        rows={3}
                        value={pushPreArrivalBody}
                        onChange={(e) => setPushPreArrivalBody(e.target.value)}
                        placeholder="請輸入內容..."
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Row 2: 訪客抵達即時 Push */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <CheckCircle size={18} className="text-blue-500" />
                      <span>2. 訪客抵達即時 Push</span>
                    </h4>

                    {/* Enable / Disable Switch */}
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <span className={`text-xs font-bold ${pushArrivalEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {pushArrivalEnabled ? '已開啟' : '已關閉'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPushArrivalEnabled(!pushArrivalEnabled);
                          triggerSound(600, 'sine', 0.05);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          pushArrivalEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            pushArrivalEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </label>
                  </div>

                  <div className="space-y-4">
                    {/* Push Title */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">標題</label>
                      <input
                        type="text"
                        value={pushArrivalTitle}
                        onChange={(e) => setPushArrivalTitle(e.target.value)}
                        placeholder="請輸入標題..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Push Body */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">內容</label>
                      <textarea
                        rows={3}
                        value={pushArrivalBody}
                        onChange={(e) => setPushArrivalBody(e.target.value)}
                        placeholder="請輸入內容..."
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      ></textarea>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* PAGE 4: 訪客核銷人員配置 */}
          {activeCmsTab === 'STAFF' && (
            <div className="space-y-6">
              
              {/* Header Title */}
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-50">掃碼授權人員配置 (Gatekeepers Configuration)</h3>
                <p className="text-xs text-slate-400 mt-0.5">請添加掃碼授權人員</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left side: Add new staff card */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-850">
                    ➕ 新增訪客掃碼授權人員
                  </h4>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                        員工 ID
                      </label>
                      <input
                        type="text"
                        placeholder="例如: EMP005 或 EMP002"
                        value={newStaffId}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setNewStaffId(val);
                          setStaffError('');
                          // Auto lookup name if available
                          if (KNOWN_EMPLOYEES[val]) {
                            setNewStaffName(KNOWN_EMPLOYEES[val]);
                          } else {
                            setNewStaffName('');
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                        員工姓名
                      </label>
                      <input
                        type="text"
                        placeholder="自動偵測或手動輸入姓名"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      {KNOWN_EMPLOYEES[newStaffId] && (
                        <span className="text-[10px] text-emerald-500 font-bold mt-1 block">
                          ✨ 系統已配對內部員工：{KNOWN_EMPLOYEES[newStaffId]}
                        </span>
                      )}
                    </div>

                    {staffError && (
                      <div className="text-rose-500 text-[10.5px] font-bold">
                        ⚠️ {staffError}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (!newStaffId.trim()) {
                          setStaffError('請輸入員工 ID');
                          triggerSound(300, 'sine', 0.1);
                          return;
                        }
                        if (!newStaffName.trim()) {
                          setStaffError('請輸入或確認員工姓名');
                          triggerSound(300, 'sine', 0.1);
                          return;
                        }
                        if (verificationStaff.some(s => s.employeeId === newStaffId.trim())) {
                          setStaffError('該員工 ID 已存在於掃碼授權人員名單中');
                          triggerSound(300, 'sine', 0.1);
                          return;
                        }

                        setVerificationStaff(prev => [
                          ...prev,
                          { employeeId: newStaffId.trim(), name: newStaffName.trim() }
                        ]);
                        setNewStaffId('');
                        setNewStaffName('');
                        setStaffError('');
                        triggerSound(800, 'sine', 0.15);
                      }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-all flex items-center justify-center gap-1"
                    >
                      <span>新增訪客掃碼授權人員</span>
                    </button>
                  </div>


                </div>

                {/* Right side: Configured list */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">已授權掃碼人員名單</h4>
                    <span className="text-[10px] font-semibold text-slate-400">已授權員工名冊</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-850">
                    {verificationStaff.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                        <AlertCircle className="mx-auto mb-2 text-slate-300 dark:text-slate-700" size={24} />
                        <p className="text-xs font-bold">目前無配置任何掃碼授權人員，請於左側新增。</p>
                      </div>
                    ) : (
                      verificationStaff.map((staff) => (
                        <div key={staff.employeeId} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center">
                              <ShieldCheck size={14} />
                            </div>
                            <div>
                              <div className="font-black text-slate-900 dark:text-white text-xs">
                                {staff.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5 font-bold">
                                員工編號: <span className="text-slate-600 dark:text-slate-300">{staff.employeeId}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setVerificationStaff(prev => prev.filter(s => s.employeeId !== staff.employeeId));
                              triggerSound(400, 'sine', 0.15);
                            }}
                            className="px-2.5 py-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-[10px] font-black rounded-lg cursor-pointer transition-colors"
                          >
                            撤銷授權
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 考勤管理 三個子菜單 View */}
          {activeCmsTab === 'ATTENDANCE_LOGS' && (
            <CmsAttendanceManagement initialTab="LOGS" triggerSound={triggerSound} />
          )}

          {activeCmsTab === 'ATTENDANCE_CONFIG' && (
            <CmsAttendanceManagement initialTab="RULES" triggerSound={triggerSound} />
          )}

          {activeCmsTab === 'ATTENDANCE_REPORT' && (
            <CmsAttendanceManagement initialTab="REPORTS" triggerSound={triggerSound} />
          )}

        </main>
      </div>

      {/* Booking Details View Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-950 max-w-lg w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-400" />
                <h4 className="font-black text-sm tracking-wide">預約訪客詳細簽照資訊</h4>
              </div>
              <button 
                onClick={() => {
                  setViewingBooking(null);
                  triggerSound(400, 'sine', 0.05);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              
              {/* QR Code & Status Banner */}
              <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">專屬二維碼 (Pass Code: {viewingBooking.invitationCode})</span>
                
                <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center shadow-xs">
                  <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col items-center justify-center p-1 relative overflow-hidden">
                    <div className="grid grid-cols-4 gap-1 w-full h-full opacity-90">
                      {Array.from({ length: 16 }).map((_, i) => {
                        const isCorner = i === 0 || i === 3 || i === 12 || i === 15;
                        return (
                          <div 
                            key={i} 
                            className={`rounded-xs ${
                              isCorner 
                                ? 'bg-blue-600 border border-white' 
                                : Math.sin(i * 1.5 + 4) > -0.1 ? 'bg-slate-900' : 'bg-transparent'
                            }`}
                          ></div>
                        );
                      })}
                    </div>
                    <span className="absolute bg-white text-blue-600 text-[8px] font-bold px-1 rounded border border-blue-600 font-mono scale-90">
                      TVB PASS
                    </span>
                  </div>
                </div>

                <div className="mt-1">
                  {viewingBooking.status === BookingStatus.UPCOMING ? (
                    <span className="inline-flex text-[10.5px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-200/30">
                      ● 待到訪 (隨時生效中)
                    </span>
                  ) : viewingBooking.status === BookingStatus.CHECKED_IN ? (
                    <span className="inline-flex text-[10.5px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/30 animate-pulse">
                      ● 進行中 (已核銷簽入在大樓內)
                    </span>
                  ) : viewingBooking.status === BookingStatus.COMPLETED ? (
                    <span className="inline-flex text-[10.5px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/30">
                      ● 已結束 (已辦理離場)
                    </span>
                  ) : (
                    <span className="inline-flex text-[10.5px] font-black text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-3 py-1 rounded-full border border-rose-200/30">
                      ● 已取消 (無效登記)
                    </span>
                  )}
                </div>
              </div>

              {/* Data Grids */}
              <div className="space-y-4">
                
                {/* Section 1: Core Visitor Info */}
                <div>
                  <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-850 pb-1">👤 訪客登記資訊</h5>
                  <div className="space-y-3 bg-slate-50/50 dark:bg-slate-900/10 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850">
                    
                    {/* Visitors List */}
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <span className="text-slate-400 block text-[10px] mb-1.5 font-bold">
                        已登記訪客名單 ({viewingBooking.totalVisitorsCount || (viewingBooking.visitors && viewingBooking.visitors.length > 0 ? viewingBooking.visitors.length : 1)} 人)
                      </span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {((viewingBooking.visitors && viewingBooking.visitors.length > 0) ? viewingBooking.visitors : [{ name: viewingBooking.visitorName, email: viewingBooking.contactEmail, idNumber: viewingBooking.visitorIdCard || '' }]).map((v, idx) => {
                          const cardNum = v.idNumber || (idx === 0 ? viewingBooking.visitorIdCard : '') || '';
                          return (
                            <div key={idx} className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-slate-900 dark:text-slate-100">{v.name}</span>
                                {cardNum ? (
                                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 font-mono text-[10.5px] font-bold rounded-md">
                                    登記證件號碼: {cardNum}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono text-[10.5px] rounded-md">
                                    登記證件號碼: 未登記
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[11px] font-normal text-slate-500">
                                {v.email || viewingBooking.contactEmail || '未提供電郵'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <span className="text-slate-400 block text-[10px]">訪客類型</span>
                        <span className="inline-flex px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 text-[10px] font-bold rounded-md">
                          {getVisitorTypeLabel(viewingBooking.visitorType)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">客戶類型</span>
                        {viewingBooking.clientTier === 'VIP' ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-black">
                            <Crown size={12} className="fill-current" />
                            <span>👑 VIP客戶</span>
                          </span>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-200 font-bold">普通客戶</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">公司名稱</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold">{viewingBooking.company || '個人代表'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">到訪模式</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold">{getVisitModeLabel(viewingBooking.visitMode)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">到訪性質</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold">{getPurposeOption(viewingBooking.purpose).label}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">到訪日期與時間</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold font-mono">
                          {formatDateToStandard(viewingBooking.visitDateTime)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">目的地</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold">{viewingBooking.destination || '地下 A 廠影視大堂'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">車牌號碼</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold font-mono">{viewingBooking.licensePlate || '未安排泊車'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">聯絡電郵</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold font-mono">{viewingBooking.contactEmail || '-'}</strong>
                      </div>
                      {viewingBooking.checkedInAt && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">掃碼時間</span>
                          <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                            {formatDateToStandard(viewingBooking.checkedInAt)}
                          </strong>
                        </div>
                      )}
                      {activeCmsTab !== 'EMPLOYEES' && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">關聯員工預約 ID</span>
                          <strong className="text-blue-600 dark:text-blue-400 font-mono font-bold">{viewingBooking.associatedBookingId || '-'}</strong>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Section 2: Administrative Info */}
                <div>
                  <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-850 pb-1">📞 聯絡對接詳情</h5>
                  <div className="bg-slate-50/50 dark:bg-slate-900/10 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <div className="grid grid-cols-2 gap-3.5 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">對接員工 / 聯絡人</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold">{viewingBooking.contactPerson || viewingBooking.hostEmployeeName || 'May Tang'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">僱員 ID</span>
                        <strong className="text-blue-600 dark:text-blue-400 font-bold font-mono">{viewingBooking.hostEmployeeId || 'EMP-88210'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">聯絡電話</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold font-mono">{viewingBooking.contactPhone || '2335-7111'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">負責部門</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold">{viewingBooking.responsibleDept || viewingBooking.hostEmployeeDept || '綜藝節目部'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {viewingBooking.notes && (
                  <div>
                    <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">📝 備註說明</h5>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed">
                      "{viewingBooking.notes}"
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3">
              {(viewingBooking.status === BookingStatus.PENDING || viewingBooking.isPendingApproval) ? (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      onUpdateBookingStatus(viewingBooking.id, BookingStatus.UPCOMING);
                      setViewingBooking(prev => prev ? { ...prev, status: BookingStatus.UPCOMING, isPendingApproval: false } : null);
                      triggerSound(900, 'sine', 0.15);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <CheckCircle size={14} />
                    <span>同意放行</span>
                  </button>
                  <button
                    onClick={() => {
                      onCancelBooking(viewingBooking.id);
                      setViewingBooking(prev => prev ? { ...prev, status: BookingStatus.CANCELLED, isPendingApproval: false } : null);
                      triggerSound(300, 'triangle', 0.15);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <XCircle size={14} />
                    <span>拒絕預約</span>
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 font-semibold">
                  通行碼: <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">{viewingBooking.invitationCode}</span>
                </div>
              )}

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Printer size={13} />
                  <span>列印憑證</span>
                </button>
                <button
                  onClick={() => {
                    setViewingBooking(null);
                    triggerSound(400, 'sine', 0.05);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-550 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all"
                >
                  關閉
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Push Test Toast Popup Alert */}
      {pushTestToast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-amber-500/50 animate-bounce-short space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
              <Bell size={12} className="fill-current animate-pulse" />
              <span>TVB GO App Live Push</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{pushTestToast.time}</span>
          </div>
          <h5 className="text-xs font-bold text-slate-100">{pushTestToast.title}</h5>
          <p className="text-[11px] text-slate-300 leading-relaxed">{pushTestToast.body}</p>
        </div>
      )}

      {/* Modal 1: Add Whitelist Staff */}
      {showAddWhitelistModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserPlus size={16} className="text-blue-500" />
                <span>新增訪客邀請 白名單員工</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddWhitelistModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Single Search Query Field for Employee ID or Name */}
              <div className="relative">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>員工搜尋 (僱員 ID 或 員工姓名)</span>
                  <span className="text-blue-500 font-normal text-[10px]">自動匹配企業內部員工數據庫</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={wlSearchQuery}
                    onChange={(e) => {
                      const query = e.target.value;
                      setWlSearchQuery(query);
                      const match = COMPANY_STAFF_DATABASE.find(staff => 
                        staff.employeeId.toLowerCase().includes(query.toLowerCase()) ||
                        staff.name.toLowerCase().includes(query.toLowerCase())
                      );
                      if (match) {
                        setNewWlEmpId(match.employeeId);
                        setNewWlName(match.name);
                        setNewWlDept(match.dept);
                        setNewWlEmail(match.email);
                      } else {
                        setNewWlName(query);
                      }
                    }}
                    placeholder="請輸入僱員ID或僱員姓名查詢"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                </div>

                {/* Dropdown Auto-Complete Suggestions */}
                {wlSearchQuery.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {COMPANY_STAFF_DATABASE.filter(staff => 
                      staff.employeeId.toLowerCase().includes(wlSearchQuery.toLowerCase()) ||
                      staff.name.toLowerCase().includes(wlSearchQuery.toLowerCase())
                    ).map(staff => (
                      <button
                        type="button"
                        key={staff.employeeId}
                        onClick={() => {
                          setWlSearchQuery(`${staff.employeeId} - ${staff.name}`);
                          setNewWlEmpId(staff.employeeId);
                          setNewWlName(staff.name);
                          setNewWlDept(staff.dept);
                          setNewWlEmail(staff.email);
                          triggerSound(600, 'sine', 0.05);
                        }}
                        className="w-full text-left p-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 mr-2">{staff.employeeId}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{staff.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{staff.dept}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Candidate Preview Card */}
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl space-y-2">
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block">將新增白名單員工資訊預覽：</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">僱員 ID</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{newWlEmpId || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">員工姓名</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{newWlName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">所屬部門</span>
                    <input
                      type="text"
                      value={newWlDept}
                      onChange={(e) => setNewWlDept(e.target.value)}
                      placeholder="部門名稱"
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">公司電郵</span>
                    <input
                      type="email"
                      value={newWlEmail}
                      onChange={(e) => setNewWlEmail(e.target.value)}
                      placeholder="電郵地址"
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddWhitelistModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleAddWhitelistEmployee}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-550 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                確認新增白名單
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Add Blacklist Member (Manual) */}
      {showAddBlacklistModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldAlert size={16} className="text-rose-500" />
                <span>手動新增訪客黑名單成員</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddBlacklistModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {blError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{blError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  訪客姓名 <span className="text-rose-500">* (必填)</span>
                </label>
                <input
                  type="text"
                  value={blName}
                  onChange={(e) => {
                    setBlName(e.target.value);
                    if (blError) setBlError('');
                  }}
                  placeholder="請輸入訪客全名 (必填)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">證件號碼 (身分證/護照/通行證)</label>
                <input
                  type="text"
                  value={blIdCard}
                  onChange={(e) => setBlIdCard(e.target.value)}
                  placeholder="例如: HKID A123456(7) / 護照號"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">聯絡電郵</label>
                  <input
                    type="email"
                    value={blEmail}
                    onChange={(e) => setBlEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">電話號碼</label>
                  <input
                    type="text"
                    value={blPhone}
                    onChange={(e) => setBlPhone(e.target.value)}
                    placeholder="例如: 98765432"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">所屬機構 / 公司</label>
                <input
                  type="text"
                  value={blCompany}
                  onChange={(e) => setBlCompany(e.target.value)}
                  placeholder="例如: 某違規媒體公司"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">拉黑 / 管制原因說明</label>
                <textarea
                  rows={2}
                  value={blReason}
                  onChange={(e) => setBlReason(e.target.value)}
                  placeholder="請詳細說明拉黑原因 (例如: 未經授權闖入、偷拍公司機密)"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddBlacklistModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleAddBlacklistMember}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                確認拉入黑名單
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Import Blacklist CSV */}
      {showCsvImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload size={16} className="text-emerald-500" />
                <span>匯入訪客黑名單 CSV (支持文字貼上與驗證)</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowCsvImportModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-900/50 rounded-2xl flex justify-between items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              <div>
                <strong>CSV 格式提示：</strong> 每列依序為 <code>姓名, 證件號, 電郵, 電話, 公司, 原因</code>。
                <br /><span className="text-[11px] text-rose-500 font-bold">* 【姓名】為必填欄位，缺乏姓名的數據行將自動拒絕匯入。</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCsvInputText(`姓名,證件號,電郵,電話,公司,拉黑原因
張三強,HKID: A889123(4),sanqiang.zhang@bad.com,98765432,高風險媒體,未經授權強行闖入錄影廠
李大業,HKID: B102938(0),daye.lee@fake-firm.com,61234567,虛假快遞,多次填寫假車牌號碼進場
王小菲,G7781290,xiaofei.wong@blacklisted.org,55443322,個人訪客,失信違反內部安全規則`);
                  setCsvImportError('');
                  triggerSound(600, 'sine', 0.05);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
              >
                一鍵載入範例 CSV
              </button>
            </div>

            {csvImportError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{csvImportError}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">CSV 數據文本內容</label>
              <textarea
                rows={7}
                value={csvInputText}
                onChange={(e) => {
                  setCsvInputText(e.target.value);
                  if (csvImportError) setCsvImportError('');
                }}
                placeholder={`姓名,證件號,電郵,電話,公司,拉黑原因\n張三,HKID A123456(7),zhangsan@test.com,91234567,某公司,違規越界進場`}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono focus:outline-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowCsvImportModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleImportCsvBlacklist}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1"
              >
                <Check size={14} />
                <span>解析並匯入黑名單</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
