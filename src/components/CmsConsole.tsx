/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Booking, BookingStatus, PurposeCode } from '../types';
import { PURPOSE_OPTIONS, getPurposeOption } from '../data/mockData';
import { CmsAttendanceManagement } from './CmsAttendanceManagement';
import { 
  Search, Filter, Check, X, Plus, FileText, Printer, 
  Trash2, Clock, Building, Calendar, Mail, Car, CheckCircle, 
  XCircle, AlertCircle, User, ShieldCheck, Sliders, Settings,
  ClipboardList, UserCheck, BookOpen, Save, Info, Sparkles, Laptop, FileSpreadsheet
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
  // Navigation: 'VISITORS' | 'EMPLOYEES' | 'EMAIL_TEMPLATES' | 'STAFF' | 'ATTENDANCE_LOGS' | 'ATTENDANCE_CONFIG' | 'ATTENDANCE_REPORT'
  const [activeCmsTab, setActiveCmsTab] = useState<'VISITORS' | 'EMPLOYEES' | 'EMAIL_TEMPLATES' | 'STAFF' | 'ATTENDANCE_LOGS' | 'ATTENDANCE_CONFIG' | 'ATTENDANCE_REPORT'>('VISITORS');

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
  const [filterVisitorName, setFilterVisitorName] = useState('');
  const [filterContactPerson, setFilterContactPerson] = useState('');
  const [filterLicensePlate, setFilterLicensePlate] = useState('');

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
  const insideBuildingCount = bookings.filter(b => b.status === BookingStatus.CHECKED_IN).length;
  const upcomingCount = bookings.filter(b => b.status === BookingStatus.UPCOMING).length;
  const completedCount = bookings.filter(b => b.status === BookingStatus.COMPLETED).length;

  // Filter Bookings logic
  const filteredBookings = bookings.filter(b => {
    // 1. 到訪日期 (Visit Date)
    let matchesVisitDate = true;
    if (filterVisitDate) {
      const visitDateStr = b.visitDateTime.split('T')[0];
      matchesVisitDate = visitDateStr === filterVisitDate;
    }

    // 2. 核銷日期 (Verification Date - checkedInAt, checkedOutAt, or createdAt)
    let matchesVerifyDate = true;
    if (filterVerifyDate) {
      const checkInDateStr = b.checkedInAt ? b.checkedInAt.split('T')[0] : '';
      const checkOutDateStr = b.checkedOutAt ? b.checkedOutAt.split('T')[0] : '';
      matchesVerifyDate = (checkInDateStr === filterVerifyDate) || (checkOutDateStr === filterVerifyDate);
    }

    // 3. 訪客姓名 (Visitor Name)
    let matchesVisitorName = true;
    if (filterVisitorName.trim()) {
      matchesVisitorName = b.visitorName.toLowerCase().includes(filterVisitorName.toLowerCase().trim());
    }

    // 4. 聯絡人 (Contact Person / Host / contactPerson)
    let matchesContactPerson = true;
    if (filterContactPerson.trim()) {
      const hostName = b.hostEmployeeName || '';
      const contactPersonName = b.contactPerson || '';
      matchesContactPerson = 
        hostName.toLowerCase().includes(filterContactPerson.toLowerCase().trim()) ||
        contactPersonName.toLowerCase().includes(filterContactPerson.toLowerCase().trim());
    }

    // 5. 車牌 (License Plate)
    let matchesLicensePlate = true;
    if (filterLicensePlate.trim()) {
      const plate = b.licensePlate || '';
      matchesLicensePlate = plate.toLowerCase().includes(filterLicensePlate.toLowerCase().trim());
    }

    return matchesVisitDate && matchesVerifyDate && matchesVisitorName && matchesContactPerson && matchesLicensePlate;
  });

  // Visitor verification records (must have checkedInAt/verification time and NOT walk-in)
  const visitorTabBookings = filteredBookings.filter(b => !b.isWalkIn && b.checkedInAt);

  // Employee booking records (NOT walk-in)
  const employeeTabBookings = filteredBookings.filter(b => !b.isWalkIn);

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
                    <span className="flex-1 text-left">員工預約記錄</span>
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
              
              {/* Header Title with quick stats */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-50">訪客記錄列表</h3>
                  <p className="text-xs text-slate-400 mt-0.5">即時追蹤訪客到訪狀態</p>
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

               {/* Advanced Filter Toolbar (Time filter, status, purpose) */}
              <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
                
                {/* Specific 5 Filters in a Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
                  
                  {/* 到訪日期 (Visit Date) */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">📅 到訪日期</label>
                    <input
                      type="date"
                      value={filterVisitDate}
                      onChange={(e) => {
                        setFilterVisitDate(e.target.value);
                        triggerSound(600, 'sine', 0.05);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* 核銷日期 (Verification Date) */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">⏱️ 掃碼日期</label>
                    <input
                      type="date"
                      value={filterVerifyDate}
                      onChange={(e) => {
                        setFilterVerifyDate(e.target.value);
                        triggerSound(600, 'sine', 0.05);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* 訪客姓名 (Visitor Name) */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">👤 訪客姓名</label>
                    <input
                      type="text"
                      placeholder="搜尋姓名"
                      value={filterVisitorName}
                      onChange={(e) => setFilterVisitorName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* 聯絡人 (Contact Person) */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">📞 聯絡人</label>
                    <input
                      type="text"
                      placeholder="對接人 / 聯絡人"
                      value={filterContactPerson}
                      onChange={(e) => setFilterContactPerson(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* 車牌 (License Plate) */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">🚗 車牌</label>
                    <input
                      type="text"
                      placeholder="車牌號碼"
                      value={filterLicensePlate}
                      onChange={(e) => setFilterLicensePlate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                </div>

                {/* Reset Buttons */}
                {(filterVisitDate || filterVerifyDate || filterVisitorName || filterContactPerson || filterLicensePlate) && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setFilterVisitDate('');
                        setFilterVerifyDate('');
                        setFilterVisitorName('');
                        setFilterContactPerson('');
                        setFilterLicensePlate('');
                        triggerSound(400, 'sine', 0.1);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      重置所有篩選
                    </button>
                  </div>
                )}

              </div>

              {/* Records Table Card */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3.5 whitespace-nowrap">ID</th>
                        <th className="p-3.5 whitespace-nowrap">公司名稱</th>
                        <th className="p-3.5 text-center whitespace-nowrap">到訪性質</th>
                        <th className="p-3.5 whitespace-nowrap">聯絡電郵</th>
                        <th className="p-3.5 whitespace-nowrap">到訪日期與時間</th>
                        <th className="p-3.5 whitespace-nowrap">掃碼時間</th>
                        <th className="p-3.5 whitespace-nowrap">聯絡人</th>
                        <th className="p-3.5 whitespace-nowrap">負責部門</th>
                        <th className="p-3.5 whitespace-nowrap">聯絡電話</th>
                        <th className="p-3.5 whitespace-nowrap">關聯員工預約 ID</th>
                        <th className="p-3.5 text-center whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                      {visitorTabBookings.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="p-12 text-center text-slate-400">
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

                              {/* 3. 公司名稱 */}
                              <td className="p-3.5 text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">
                                {b.company || <span className="text-slate-400 italic">個人代表</span>}
                              </td>

                              {/* 4. 到訪性質 */}
                              <td className="p-3.5 text-center whitespace-nowrap">
                                <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-bold border whitespace-nowrap ${purposeOpt.color} ${purposeOpt.bgColor}`}>
                                  {purposeOpt.label}
                                </span>
                              </td>

                              {/* 5. 聯絡電郵 */}
                              <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                {b.contactEmail}
                              </td>

                              {/* 6. 到訪日期與時間 */}
                              <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {formatDateToStandard(b.visitDateTime)}
                              </td>

                              {/* 7. 核銷時間 */}
                              <td className="p-3.5 font-semibold whitespace-nowrap">
                                {b.checkedInAt ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                    {formatDateToStandard(b.checkedInAt)}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">未核銷</span>
                                )}
                              </td>

                              {/* 8. 聯絡人 */}
                              <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                {b.contactPerson || 'May Tang'}
                              </td>

                              {/* 9. 負責部門 */}
                              <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                {b.responsibleDept || 'New Media Group'}
                              </td>

                              {/* 10. 聯絡電話 */}
                              <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                {b.contactPhone || '91946190'}
                              </td>

                              {/* 11. 關聯員工預約ID */}
                              <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {b.associatedBookingId || '-'}
                              </td>

                              {/* 12. 操作 */}
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

          {/* PAGE 2: 員工預約記錄 */}
          {activeCmsTab === 'EMPLOYEES' && (
            <div className="space-y-6">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-50">員工內部預約記錄台</h3>
                  <p className="text-xs text-slate-400 mt-0.5">查看電視城內部員工提交之訪客登記與預訂資訊</p>
                </div>
              </div>

              {/* Employee bookings table card */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">所有內部員工提交之訪客預約明細</h4>
                  <span className="text-[10px] font-semibold text-slate-400">僅顯示內部申報預約 (免審批即時制生效)</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3.5 whitespace-nowrap">ID</th>
                        <th className="p-3.5 whitespace-nowrap">預約員工姓名</th>
                        <th className="p-3.5 whitespace-nowrap">公司名稱</th>
                        <th className="p-3.5 text-center whitespace-nowrap">到訪性質</th>
                        <th className="p-3.5 whitespace-nowrap">聯絡電郵</th>
                        <th className="p-3.5 whitespace-nowrap">到訪日期與時間</th>
                        <th className="p-3.5 text-center whitespace-nowrap">狀態</th>
                        <th className="p-3.5 text-center whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                      {employeeTabBookings.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-12 text-center text-slate-400">
                            <AlertCircle size={32} className="mx-auto mb-2.5 text-slate-300 dark:text-slate-700" />
                            <span className="font-bold">目前無員工預約登記記錄。</span>
                          </td>
                        </tr>
                      ) : (
                        employeeTabBookings.map((b) => {
                          const purposeOpt = getPurposeOption(b.purpose);
                          return (
                            <tr key={b.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-900/30 transition-colors">
                              {/* 1. ID */}
                              <td className="p-3.5 font-mono font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {b.id}
                              </td>

                              {/* 2. 預約員工姓名 */}
                              <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                <span>{b.hostEmployeeName || b.contactPerson || '員工'}</span>
                              </td>

                              {/* 3. 公司名稱 */}
                              <td className="p-3.5 text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">
                                {b.company || <span className="text-slate-400 italic">個人代表</span>}
                              </td>

                              {/* 4. 到訪性質 */}
                              <td className="p-3.5 text-center whitespace-nowrap">
                                <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-bold border whitespace-nowrap ${purposeOpt.color} ${purposeOpt.bgColor}`}>
                                  {purposeOpt.label}
                                </span>
                              </td>

                              {/* 5. 聯絡電郵 */}
                              <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                {b.contactEmail}
                              </td>

                              {/* 6. 到訪日期與時間 */}
                              <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {formatDateToStandard(b.visitDateTime)}
                              </td>

                              {/* 7. 狀態 (待到訪、進行中、已完成、已取消) */}
                              <td className="p-3.5 text-center whitespace-nowrap">
                                {b.status === BookingStatus.UPCOMING ? (
                                  <span className="inline-flex px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-full border border-blue-200/30">
                                    待到訪
                                  </span>
                                ) : b.status === BookingStatus.CHECKED_IN ? (
                                  <span className="inline-flex px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-full border border-emerald-200/30">
                                    進行中
                                  </span>
                                ) : b.status === BookingStatus.COMPLETED ? (
                                  <span className="inline-flex px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200/30">
                                    已完成
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-0.5 text-[10px] font-bold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 rounded-full border border-rose-200/30">
                                    已取消
                                  </span>
                                )}
                              </td>

                              {/* 8. 操作 (查看) */}
                              <td className="p-3.5 text-center whitespace-nowrap">
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
                    
                    {/* Visitors List with ID Numbers */}
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <span className="text-slate-400 block text-[10px] mb-1.5 font-bold">已登記訪客名單 ({((viewingBooking.visitors && viewingBooking.visitors.length > 0) ? viewingBooking.visitors.length : 1)} 人)</span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {((viewingBooking.visitors && viewingBooking.visitors.length > 0) ? viewingBooking.visitors : [{ name: viewingBooking.visitorName, idNumber: '' }]).map((v, idx) => (
                          <div key={idx} className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800/60 text-xs font-bold text-slate-800 dark:text-slate-200">
                            {v.name}（證件號：<span className="font-mono font-bold text-slate-600 dark:text-slate-350">{v.idNumber || '未填寫'}</span>）
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <span className="text-slate-400 block text-[10px]">公司名稱</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold">{viewingBooking.company || '個人代表'}</strong>
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
                      {viewingBooking.checkedInAt && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">掃碼時間</span>
                          <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                            {formatDateToStandard(viewingBooking.checkedInAt)}
                          </strong>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400 block text-[10px]">目的地</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold">{viewingBooking.destination || '地下 A 廠影視大堂'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">車牌號碼</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold font-mono">{viewingBooking.licensePlate || '未安排泊車'}</strong>
                      </div>
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
                        <span className="text-slate-400 block text-[10px]">聯絡人</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold">{viewingBooking.contactPerson || 'May Tang'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">聯絡電話</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold font-mono">{viewingBooking.contactPhone || '91946190'}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px]">負責部門</span>
                        <strong className="text-slate-750 dark:text-slate-100 font-bold">{viewingBooking.responsibleDept || 'New Media Group'}</strong>
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
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Printer size={13} />
                <span>列印二維碼憑證</span>
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
      )}

    </div>
  );
};
