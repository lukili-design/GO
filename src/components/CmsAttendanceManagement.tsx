/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BeaconRule, WifiRule, GpsConfig, GpsFenceRule, ClockInLog, 
  MonthlyReportSummary, MonthlyReportDetail 
} from '../types';
import { 
  INITIAL_BEACONS, INITIAL_WIFIS, INITIAL_GPS_CONFIG, INITIAL_GPS_FENCES,
  INITIAL_CLOCK_IN_LOGS, INITIAL_MONTHLY_REPORTS, INITIAL_MONTHLY_DETAILS 
} from '../data/mockData';
import { 
  Radio, Wifi, MapPin, Calendar, Clock, Download, Plus, 
  Trash2, Edit, CheckCircle2, AlertTriangle, Search, Filter, 
  RefreshCw, FileSpreadsheet, ShieldCheck, Check, X, Sparkles, Navigation, Layers
} from 'lucide-react';

interface CmsAttendanceManagementProps {
  triggerSound: (frequency: number, type: OscillatorType, duration: number) => void;
  initialTab?: 'LOGS' | 'RULES' | 'REPORTS';
}

export const CmsAttendanceManagement: React.FC<CmsAttendanceManagementProps> = ({ triggerSound, initialTab }) => {
  // Sub tab inside Attendance Management
  // 'RULES' | 'REPORTS' | 'LOGS'
  const [attendanceTab, setAttendanceTab] = useState<'RULES' | 'REPORTS' | 'LOGS'>(initialTab || 'LOGS');

  useEffect(() => {
    if (initialTab) {
      setAttendanceTab(initialTab);
    }
  }, [initialTab]);

  // Rules State
  const [beacons, setBeacons] = useState<BeaconRule[]>(INITIAL_BEACONS);
  const [wifis, setWifis] = useState<WifiRule[]>(INITIAL_WIFIS);
  const [gpsFences, setGpsFences] = useState<GpsFenceRule[]>(INITIAL_GPS_FENCES);

  // Live Logs State & Filters
  const [logs, setLogs] = useState<ClockInLog[]>(INITIAL_CLOCK_IN_LOGS);
  const [logEmpSearch, setLogEmpSearch] = useState('');
  const [logDeptFilter, setLogDeptFilter] = useState<string>('ALL');
  const [logStartTime, setLogStartTime] = useState<string>('');
  const [logEndTime, setLogEndTime] = useState<string>('');
  const [logTypeFilter, setLogTypeFilter] = useState<string>('ALL'); // ALL, CLOCK IN, CLOCK OUT
  const [logMethodFilter, setLogMethodFilter] = useState<string>('ALL'); // ALL, BEACON, WIFI, GPS, FIELD
  const [logStatusFilter, setLogStatusFilter] = useState<string>('ALL'); // ALL, NORMAL, ABNORMAL

  const handleResetLogFilters = () => {
    setLogEmpSearch('');
    setLogDeptFilter('ALL');
    setLogStartTime('');
    setLogEndTime('');
    setLogTypeFilter('ALL');
    setLogMethodFilter('ALL');
    setLogStatusFilter('ALL');
    triggerSound(600, 'sine', 0.05);
  };

  // Reports State & Filters
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07');
  const [reportEmpSearch, setReportEmpSearch] = useState('');
  const [reportDeptFilter, setReportDeptFilter] = useState<string>('ALL');
  const [reports, setReports] = useState<MonthlyReportSummary[]>(INITIAL_MONTHLY_REPORTS);
  const [reportDetails, setReportDetails] = useState<MonthlyReportDetail[]>(INITIAL_MONTHLY_DETAILS);
  const [batchRunning, setBatchRunning] = useState<boolean>(false);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);

  const handleResetReportFilters = () => {
    setReportEmpSearch('');
    setReportDeptFilter('ALL');
    triggerSound(600, 'sine', 0.05);
  };

  // Modal / Add Form States for Location Rules
  const [showAddBeaconModal, setShowAddBeaconModal] = useState(false);
  const [newBcnName, setNewBcnName] = useState('');
  const [newBcnUuid, setNewBcnUuid] = useState('');
  const [newBcnMajor, setNewBcnMajor] = useState('');
  const [newBcnMinor, setNewBcnMinor] = useState('');
  const [newBcnNote, setNewBcnNote] = useState('');

  const [showAddWifiModal, setShowAddWifiModal] = useState(false);
  const [newWifiSsid, setNewWifiSsid] = useState('');
  const [newWifiMac, setNewWifiMac] = useState('');
  const [newWifiNote, setNewWifiNote] = useState('');

  const [showAddGpsModal, setShowAddGpsModal] = useState(false);
  const [newGpsName, setNewGpsName] = useState('');
  const [newGpsAddress, setNewGpsAddress] = useState('');
  const [newGpsLat, setNewGpsLat] = useState(22.3789);
  const [newGpsLng, setNewGpsLng] = useState(114.2698);
  const [newGpsRadius, setNewGpsRadius] = useState(200);
  const [mapStyle, setMapStyle] = useState<'roadmap' | 'satellite'>('roadmap');
  const [mapSearchQuery, setMapSearchQuery] = useState('');

  // Map Search Handler
  const handleMapSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mapSearchQuery.trim()) return;
    const q = mapSearchQuery.trim();
    
    if (q.includes('將軍澳') || q.includes('電視城') || q.includes('廣播城')) {
      setNewGpsName('將軍澳電視廣播城總部');
      setNewGpsAddress('香港將軍澳工業邨駿才街77號電視廣播城');
      setNewGpsLat(22.3789);
      setNewGpsLng(114.2698);
    } else if (q.includes('灣仔') || q.includes('新聞')) {
      setNewGpsName('灣仔新聞採訪中心');
      setNewGpsAddress('香港灣仔告士打道160號海外信託銀行大廈');
      setNewGpsLat(22.2783);
      setNewGpsLng(114.1731);
    } else if (q.includes('西九') || q.includes('ICC') || q.includes('柯士甸')) {
      setNewGpsName('西九龍轉播錄影基地');
      setNewGpsAddress('香港九龍柯士甸道西1號環球貿易廣場');
      setNewGpsLat(22.3041);
      setNewGpsLng(114.1602);
    } else if (q.includes('中環') || q.includes('交易廣場')) {
      setNewGpsName('中環辦事處');
      setNewGpsAddress('香港中環康樂廣場8號交易廣場');
      setNewGpsLat(22.2835);
      setNewGpsLng(114.1582);
    } else if (q.includes('觀塘') || q.includes('創紀之城')) {
      setNewGpsName('觀塘媒體中心');
      setNewGpsAddress('香港九龍觀塘觀塘道388號創紀之城');
      setNewGpsLat(22.3129);
      setNewGpsLng(114.2255);
    } else {
      setNewGpsName(q);
      setNewGpsAddress(`香港 ${q}`);
      const hash = q.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const mockLat = Number((22.2800 + (hash % 100) * 0.0015).toFixed(4));
      const mockLng = Number((114.1500 + (hash % 120) * 0.0015).toFixed(4));
      setNewGpsLat(mockLat);
      setNewGpsLng(mockLng);
    }
    triggerSound(850, 'sine', 0.1);
  };

  // 1. Action: Toggle Beacon Enable
  const toggleBeacon = (id: string) => {
    setBeacons(prev => prev.map(b => b.id === id ? { ...b, isEnabled: !b.isEnabled } : b));
    triggerSound(800, 'sine', 0.08);
  };

  // Action: Add Beacon
  const handleAddBeacon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBcnName.trim() || !newBcnUuid.trim() || !newBcnMajor.trim()) return;
    const newBcn: BeaconRule = {
      id: `BCN-${String(beacons.length + 1).padStart(3, '0')}`,
      name: newBcnName,
      uuid: newBcnUuid,
      major: newBcnMajor,
      minor: newBcnMinor || '',
      locationNote: newBcnNote || '',
      isEnabled: true
    };
    setBeacons(prev => [...prev, newBcn]);
    setNewBcnName('');
    setNewBcnUuid('');
    setNewBcnMajor('');
    setNewBcnMinor('');
    setNewBcnNote('');
    setShowAddBeaconModal(false);
    triggerSound(900, 'sine', 0.12);
  };

  // Delete Beacon
  const deleteBeacon = (id: string) => {
    setBeacons(prev => prev.filter(b => b.id !== id));
    triggerSound(300, 'triangle', 0.15);
  };

  // 2. Action: Toggle Wi-Fi
  const toggleWifi = (id: string) => {
    setWifis(prev => prev.map(w => w.id === id ? { ...w, isEnabled: !w.isEnabled } : w));
    triggerSound(800, 'sine', 0.08);
  };

  // Action: Add Wi-Fi
  const handleAddWifi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWifiSsid.trim() || !newWifiMac.trim()) return;
    const newWifi: WifiRule = {
      id: `WIFI-${String(wifis.length + 1).padStart(3, '0')}`,
      ssid: newWifiSsid,
      mac: newWifiMac,
      locationNote: newWifiNote || '',
      isEnabled: true
    };
    setWifis(prev => [...prev, newWifi]);
    setNewWifiSsid('');
    setNewWifiMac('');
    setNewWifiNote('');
    setShowAddWifiModal(false);
    triggerSound(900, 'sine', 0.12);
  };

  // Delete Wi-Fi
  const deleteWifi = (id: string) => {
    setWifis(prev => prev.filter(w => w.id !== id));
    triggerSound(300, 'triangle', 0.15);
  };

  // 3. Action: GPS Geofence Actions
  const toggleGpsFence = (id: string) => {
    setGpsFences(prev => prev.map(g => g.id === id ? { ...g, isEnabled: !g.isEnabled } : g));
    triggerSound(800, 'sine', 0.08);
  };

  const deleteGpsFence = (id: string) => {
    setGpsFences(prev => prev.filter(g => g.id !== id));
    triggerSound(300, 'triangle', 0.15);
  };

  const handleAddGpsFence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGpsName.trim()) return;
    const newFence: GpsFenceRule = {
      id: `GPS-${String(gpsFences.length + 1).padStart(3, '0')}`,
      locationName: newGpsName,
      address: newGpsAddress || `${newGpsLat.toFixed(4)}, ${newGpsLng.toFixed(4)}`,
      centerLat: Number(newGpsLat),
      centerLng: Number(newGpsLng),
      radiusMeters: Number(newGpsRadius),
      isEnabled: true
    };
    setGpsFences(prev => [...prev, newFence]);
    setNewGpsName('');
    setNewGpsAddress('');
    setNewGpsLat(22.3789);
    setNewGpsLng(114.2698);
    setNewGpsRadius(200);
    setShowAddGpsModal(false);
    triggerSound(900, 'sine', 0.12);
  };

  // 3. Action: Run Monthly Batch Job (次月 1 號 02:00 AM 自動跑批歸檔)
  const handleRunMonthlyBatch = () => {
    setBatchRunning(true);
    triggerSound(1000, 'sine', 0.1);
    
    setTimeout(() => {
      setBatchRunning(false);
      const newMonth = '2026-08';
      const exists = reports.some(r => r.month === newMonth);
      
      if (!exists) {
        const newSummary: MonthlyReportSummary = {
          month: '2026-08',
          monthName: '2026年8月 (本月最新)',
          employeeCount: 385,
          totalPunches: 6420,
          abnormalCount: 19,
          generatedAt: new Date().toLocaleString()
        };
        setReports(prev => [newSummary, ...prev]);
        setSelectedMonth('2026-08');
      }

      setBatchNotice(`月度考勤自動跑批任務完成！已成功為自然月 [${selectedMonth}] 生成最新《月度考勤彙總表》與《月度打卡明細表》。`);
      triggerSound(1200, 'sine', 0.2);
      setTimeout(() => setBatchNotice(null), 5000);
    }, 1200);
  };

  // 4. Action: Export CSV
  const handleExportCsv = () => {
    const summary = reports.find(r => r.month === selectedMonth) || reports[0];
    let csvContent = "\uFEFF"; // UTF-8 BOM for Chinese Excel compatibility
    csvContent += `電視廣播有限公司 (TVB) - 自然月考勤自動彙總報表\n`;
    csvContent += `統計月份,${summary.monthName},考勤僱員數,${summary.employeeCount},總有效打卡數,${summary.totalPunches},異常打卡人次,${summary.abnormalCount},生成時間,${summary.generatedAt}\n\n`;
    csvContent += `雇員ID,姓名 (中文),姓名 (英文),雇員類型,部門,正常天數,異常天數,漏打卡,總有效工時\n`;

    filteredReportDetails.forEach(d => {
      csvContent += `"${d.employeeId}","${d.employeeNameZh || ''}","${d.employeeNameEn || ''}","${d.employeeType || '全職員工'}","${d.dept}",${d.normalDays},${d.abnormalDays},${d.missingPunches},${d.totalHours}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TVB_Monthly_Attendance_Report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerSound(1100, 'sine', 0.15);
  };

  // Filter logs
  const filteredLogs = logs.filter(l => {
    // 1. Employee search (姓名 / ID / 設備號)
    const empQ = logEmpSearch.trim().toLowerCase();
    const matchesEmp = !empQ || 
      l.employeeId.toLowerCase().includes(empQ) ||
      (l.employeeNameZh && l.employeeNameZh.toLowerCase().includes(empQ)) ||
      (l.employeeNameEn && l.employeeNameEn.toLowerCase().includes(empQ)) ||
      (l.employeeName && l.employeeName.toLowerCase().includes(empQ)) ||
      (l.deviceId && l.deviceId.toLowerCase().includes(empQ));

    // 2. Department filter (部門)
    const matchesDept = logDeptFilter === 'ALL' || l.dept === logDeptFilter;

    // 3. Time filter (打卡時間: 開始時間 - 結束時間)
    let matchesTime = true;
    if (logStartTime) {
      matchesTime = matchesTime && l.timestamp >= logStartTime;
    }
    if (logEndTime) {
      const endThreshold = logEndTime.length === 10 ? `${logEndTime} 23:59:59` : logEndTime;
      matchesTime = matchesTime && l.timestamp <= endThreshold;
    }

    // 4. Clock type filter (類型: CLOCK IN / CLOCK OUT)
    const matchesType = logTypeFilter === 'ALL' ||
      (logTypeFilter === 'CLOCK IN' && (l.clockType === 'CLOCK IN' || l.clockType === 'IN')) ||
      (logTypeFilter === 'CLOCK OUT' && (l.clockType === 'CLOCK OUT' || l.clockType === 'OUT'));

    // 5. Verification method filter (校驗方式 - 不變)
    const matchesMethod = logMethodFilter === 'ALL' || l.method === logMethodFilter;

    // 6. Attendance status filter (考勤狀態: 正常 異常)
    const matchesStatus = logStatusFilter === 'ALL' ||
      (logStatusFilter === 'NORMAL' && l.status === 'NORMAL') ||
      (logStatusFilter === 'ABNORMAL' && (l.status === 'ABNORMAL' || l.status === 'LATE' || l.status === 'EARLY_LEAVE' || l.status === 'MISSING'));

    return matchesEmp && matchesDept && matchesTime && matchesType && matchesMethod && matchesStatus;
  });

  const departmentList = Array.from(new Set(['綜藝節目部', 'New Media Group', '藝員管理部', '外景新聞組', '製作部', '工程及設施部', '財務部', ...logs.map(l => l.dept)]));

  const activeReport = reports.find(r => r.month === selectedMonth) || reports[0];

  const filteredReportDetails = reportDetails.filter(d => {
    if (d.month !== selectedMonth) return false;

    // 1. Employee search (姓名 / ID)
    const empQ = reportEmpSearch.trim().toLowerCase();
    const matchesEmp = !empQ ||
      d.employeeId.toLowerCase().includes(empQ) ||
      (d.employeeNameZh && d.employeeNameZh.toLowerCase().includes(empQ)) ||
      (d.employeeNameEn && d.employeeNameEn.toLowerCase().includes(empQ)) ||
      (d.employeeName && d.employeeName.toLowerCase().includes(empQ));

    // 2. Department filter
    const matchesDept = reportDeptFilter === 'ALL' || d.dept === reportDeptFilter;

    return matchesEmp && matchesDept;
  });

  return (
    <div className="space-y-5">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-950 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">
          考勤管理 / {attendanceTab === 'LOGS' ? '考勤記錄' : attendanceTab === 'RULES' ? '考勤配置' : '月度考勤報表'}
        </h2>
      </div>

      {/* ================= TAB 1: REAL-TIME LOGS (考勤記錄) ================= */}
      {attendanceTab === 'LOGS' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-100">
                <Filter size={15} className="text-blue-500" />
                <span>考勤記錄檢索與篩選</span>
              </div>
              <button
                type="button"
                onClick={handleResetLogFilters}
                className="text-[11px] font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw size={12} />
                <span>重置篩選</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              
              {/* 1. 僱員: 請輸入姓名、ID */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">僱員</label>
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={logEmpSearch}
                    onChange={e => setLogEmpSearch(e.target.value)}
                    placeholder="請輸入姓名、ID"
                    className="w-full text-xs pl-8 pr-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              {/* 2. 部門: 下拉篩選 */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">部門</label>
                <select
                  value={logDeptFilter}
                  onChange={e => setLogDeptFilter(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                >
                  <option value="ALL">全部部門</option>
                  {departmentList.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* 3. 打卡時間: 開始時間 - 結束時間 */}
              <div className="sm:col-span-2 grid grid-cols-2 gap-1.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">打卡時間 - 開始</label>
                  <input
                    type="date"
                    value={logStartTime}
                    onChange={e => setLogStartTime(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">打卡時間 - 結束</label>
                  <input
                    type="date"
                    value={logEndTime}
                    onChange={e => setLogEndTime(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* 4. 類型：CLOCK IN/CLOCK OUT */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">類型</label>
                <select
                  value={logTypeFilter}
                  onChange={e => setLogTypeFilter(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                >
                  <option value="ALL">全部類型</option>
                  <option value="CLOCK IN">CLOCK IN</option>
                  <option value="CLOCK OUT">CLOCK OUT</option>
                </select>
              </div>

              {/* 5. 校驗方式 */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">校驗方式</label>
                <select
                  value={logMethodFilter}
                  onChange={e => setLogMethodFilter(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                >
                  <option value="ALL">全部校驗方式</option>
                  <option value="BEACON">Beacon</option>
                  <option value="WIFI">Wi-Fi</option>
                  <option value="GPS">GPS 圍欄</option>
                </select>
              </div>

              {/* 6. 考勤狀態: 正常 異常 */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="text-[11px] font-bold text-slate-400 block mb-1">考勤狀態</label>
                <select
                  value={logStatusFilter}
                  onChange={e => setLogStatusFilter(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                >
                  <option value="ALL">全部狀態</option>
                  <option value="NORMAL">正常</option>
                  <option value="ABNORMAL">異常</option>
                </select>
              </div>

            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3.5 whitespace-nowrap">雇員ID</th>
                    <th className="p-3.5 whitespace-nowrap">姓名 (中文)</th>
                    <th className="p-3.5 whitespace-nowrap">姓名 (英文)</th>
                    <th className="p-3.5 whitespace-nowrap">雇員類型</th>
                    <th className="p-3.5 whitespace-nowrap">部門</th>
                    <th className="p-3.5 whitespace-nowrap">設備號</th>
                    <th className="p-3.5 whitespace-nowrap">打卡時間</th>
                    <th className="p-3.5 text-center whitespace-nowrap">類型</th>
                    <th className="p-3.5 text-center whitespace-nowrap">校驗方式</th>
                    <th className="p-3.5 whitespace-nowrap">定位細節</th>
                    <th className="p-3.5 text-center whitespace-nowrap">考勤狀態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-400 font-bold whitespace-nowrap">
                        暫無符合條件的考勤流水記錄。
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(l => {
                      const isClockIn = l.clockType === 'CLOCK IN' || l.clockType === 'IN';
                      const isNormal = l.status === 'NORMAL';
                      return (
                        <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-[11px] text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            {l.employeeId}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            {l.employeeNameZh || l.employeeName || '陳大文'}
                          </td>
                          <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                            {l.employeeNameEn || 'Tai Man Chan'}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {l.employeeType || '全職員工'}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                            {l.dept}
                          </td>
                          <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 font-bold text-[11px] whitespace-nowrap">
                            {l.deviceId || 'DEV-SYS-001'}
                          </td>
                          <td className="p-3.5 font-mono text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">
                            {l.timestamp}
                          </td>
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono tracking-wide ${
                              isClockIn 
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            }`}>
                              {isClockIn ? 'CLOCK IN' : 'CLOCK OUT'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {l.method === 'BEACON' && '🔵 Beacon'}
                              {l.method === 'WIFI' && '🟢 Wi-Fi'}
                              {l.method === 'GPS' && '📍 GPS 圍欄'}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-300 font-mono text-[11px] whitespace-nowrap">
                            {l.locationDetail}
                          </td>
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isNormal 
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            }`}>
                              {isNormal ? '正常' : '異常'}
                            </span>
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

      {/* ================= TAB 2: LOCATION RULES (考勤定位規則配置) ================= */}
      {attendanceTab === 'RULES' && (
        <div className="space-y-6">
          
          {/* SECTION 1: VENUE BEACONS */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Radio size={16} className="text-blue-500" />
                  <span>Venue Beacons 列表</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">解決室內及高樓層無 GPS 訊號問題，自動感應廣播識別碼。</p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddBeaconModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
              >
                <Plus size={14} />
                <span>新增 Beacon</span>
              </button>
            </div>

            {/* Beacons Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold text-[11px]">
                    <th className="p-2.5 whitespace-nowrap">編號</th>
                    <th className="p-2.5 whitespace-nowrap">Beacon Name</th>
                    <th className="p-2.5 whitespace-nowrap">UUID</th>
                    <th className="p-2.5 whitespace-nowrap">Major</th>
                    <th className="p-2.5 whitespace-nowrap">Minor</th>
                    <th className="p-2.5 whitespace-nowrap">部署位置備註</th>
                    <th className="p-2.5 text-center whitespace-nowrap">狀態</th>
                    <th className="p-2.5 text-right whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {beacons.map(b => (
                    <tr key={b.id}>
                      <td className="p-2.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">{b.id}</td>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{b.name}</td>
                      <td className="p-2.5 font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">{b.uuid}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap">{b.major}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">{b.minor || '-'}</td>
                      <td className="p-2.5 text-slate-500 whitespace-nowrap">{b.locationNote || '-'}</td>
                      <td className="p-2.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleBeacon(b.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            b.isEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
                          }`}
                        >
                          {b.isEnabled ? '已啟用' : '已停用'}
                        </button>
                      </td>
                      <td className="p-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => deleteBeacon(b.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="刪除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: OFFICE WI-FI */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Wifi size={16} className="text-emerald-500" />
                  <span>Office WiFi 配置</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">校驗手機連線之內部辦公 Wi-Fi SSID 與熱點 MAC 地址。</p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddWifiModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
              >
                <Plus size={14} />
                <span>新增 Wi-Fi 熱點</span>
              </button>
            </div>

            {/* Wi-Fi Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold text-[11px]">
                    <th className="p-2.5 whitespace-nowrap">編號</th>
                    <th className="p-2.5 whitespace-nowrap">Wi-Fi 名稱 (SSID)</th>
                    <th className="p-2.5 whitespace-nowrap">MAC地址</th>
                    <th className="p-2.5 whitespace-nowrap">位置與說明</th>
                    <th className="p-2.5 text-center whitespace-nowrap">狀態</th>
                    <th className="p-2.5 text-right whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {wifis.map(w => (
                    <tr key={w.id}>
                      <td className="p-2.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">{w.id}</td>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{w.ssid}</td>
                      <td className="p-2.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">{w.mac}</td>
                      <td className="p-2.5 text-slate-500 whitespace-nowrap">{w.locationNote || '-'}</td>
                      <td className="p-2.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleWifi(w.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            w.isEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
                          }`}
                        >
                          {w.isEnabled ? '已啟用' : '已停用'}
                        </button>
                      </td>
                      <td className="p-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => deleteWifi(w.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="刪除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: GPS BOUNDARIES */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MapPin size={16} className="text-amber-500" />
                  <span>GPS 地理圍欄配置</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">可配置多個辦公地點坐標、地址及允許打卡有效半徑。</p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddGpsModal(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
              >
                <Plus size={14} />
                <span>新增 GPS 電子圍欄</span>
              </button>
            </div>

            {/* GPS Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold text-[11px]">
                    <th className="p-2.5 whitespace-nowrap">編號</th>
                    <th className="p-2.5 whitespace-nowrap">圍欄名稱</th>
                    <th className="p-2.5 whitespace-nowrap">門牌地址 / 說明</th>
                    <th className="p-2.5 whitespace-nowrap">經緯度坐標 (Lat, Lng)</th>
                    <th className="p-2.5 text-center whitespace-nowrap">允許打卡有效半徑</th>
                    <th className="p-2.5 text-center whitespace-nowrap">狀態</th>
                    <th className="p-2.5 text-right whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {gpsFences.map(g => (
                    <tr key={g.id}>
                      <td className="p-2.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">{g.id}</td>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{g.locationName}</td>
                      <td className="p-2.5 text-slate-500 whitespace-nowrap">{g.address || '-'}</td>
                      <td className="p-2.5 font-mono text-[11px] text-amber-600 dark:text-amber-400 font-bold whitespace-nowrap">
                        {g.centerLat.toFixed(4)}, {g.centerLng.toFixed(4)}
                      </td>
                      <td className="p-2.5 font-mono text-center font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {g.radiusMeters} 米 (m)
                      </td>
                      <td className="p-2.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleGpsFence(g.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            g.isEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
                          }`}
                        >
                          {g.isEnabled ? '已啟用' : '已停用'}
                        </button>
                      </td>
                      <td className="p-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => deleteGpsFence(g.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="刪除"
                        >
                          <Trash2 size={14} />
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

      {/* ================= TAB 3: AUTOMATED MONTHLY REPORTS (自然月考勤統計與自動報表) ================= */}
      {attendanceTab === 'REPORTS' && (
        <div className="space-y-4">
          
          {/* Notification / Batch Alert */}
          {batchNotice && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span className="font-bold">{batchNotice}</span>
            </div>
          )}

          {/* Month Selector & Trigger Batch */}
          <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">選擇歸檔月份：</span>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
              >
                {reports.map(r => (
                  <option key={r.month} value={r.month}>{r.monthName}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Batch job trigger button (文案: 次月 1 號 02:00 AM 自動跑批歸檔) */}
              <button
                type="button"
                onClick={handleRunMonthlyBatch}
                disabled={batchRunning}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                <RefreshCw size={14} className={batchRunning ? 'animate-spin' : ''} />
                <span>{batchRunning ? '跑批計算中...' : '次月 1 號 02:00 AM 自動跑批歸檔'}</span>
              </button>

              {/* Export CSV Button (文案: 匯出Excel/CSV) */}
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                <Download size={14} />
                <span>匯出Excel/CSV</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-100">
                <Filter size={15} className="text-blue-500" />
                <span>月度考勤報表篩選</span>
              </div>
              <button
                type="button"
                onClick={handleResetReportFilters}
                className="text-[11px] font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw size={12} />
                <span>重置篩選</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. 僱員：支援輸入姓名或雇員 ID 搜尋 */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">僱員</label>
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={reportEmpSearch}
                    onChange={e => setReportEmpSearch(e.target.value)}
                    placeholder="請輸入姓名或雇員 ID..."
                    className="w-full text-xs pl-8 pr-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              {/* 2. 部門：下拉選單（包含「綜藝節目部」、「New Media Group」、「藝員管理部」等所有部門） */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">部門</label>
                <select
                  value={reportDeptFilter}
                  onChange={e => setReportDeptFilter(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                >
                  <option value="ALL">全部部門</option>
                  {departmentList.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Summary Metric Cards (考勤僱員數 / 總有效打卡數 / 異常打卡人次) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">考勤僱員數</span>
              <strong className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{activeReport.employeeCount} 人</strong>
            </div>

            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">總有效打卡數</span>
              <strong className="text-xl font-black text-blue-600 font-mono">{activeReport.totalPunches} 次</strong>
            </div>

            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">異常打卡人次</span>
              <strong className="text-xl font-black text-rose-600 font-mono">{activeReport.abnormalCount} 人次</strong>
            </div>
          </div>

          {/* MONTHLY SUMMARY TABLE (《月度考勤彙總表》) */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileSpreadsheet size={15} className="text-blue-500" />
                <span>《月度考勤彙總表》 ({activeReport.monthName})</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">自動跑批時間: {activeReport.generatedAt}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3.5 whitespace-nowrap">雇員ID</th>
                    <th className="p-3.5 whitespace-nowrap">姓名 (中文)</th>
                    <th className="p-3.5 whitespace-nowrap">姓名 (英文)</th>
                    <th className="p-3.5 whitespace-nowrap">雇員類型</th>
                    <th className="p-3.5 whitespace-nowrap">部門</th>
                    <th className="p-3.5 text-center whitespace-nowrap">正常天數</th>
                    <th className="p-3.5 text-center whitespace-nowrap">異常天數</th>
                    <th className="p-3.5 text-center whitespace-nowrap">漏打卡</th>
                    <th className="p-3.5 text-right whitespace-nowrap">總有效工時</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredReportDetails.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 font-bold whitespace-nowrap">
                        暫無符合條件的月度考勤明細記錄。
                      </td>
                    </tr>
                  ) : (
                    filteredReportDetails.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="p-3.5 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{d.employeeId}</td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{d.employeeNameZh || d.employeeName || '-'}</td>
                        <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">{d.employeeNameEn || '-'}</td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {d.employeeType || '全職員工'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">{d.dept}</td>
                        <td className="p-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{d.normalDays} 天</td>
                        <td className="p-3.5 text-center font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">{d.abnormalDays} 天</td>
                        <td className="p-3.5 text-center font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">{d.missingPunches} 次</td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{d.totalHours} 小時</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ADD BEACON MODAL */}
      {showAddBeaconModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddBeacon} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Radio size={16} className="text-blue-500" />
                <span>新增 Venue Beacon</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddBeaconModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Beacon Name <span className="text-rose-500">* (必填)</span>
                </label>
                <input
                  type="text"
                  required
                  value={newBcnName}
                  onChange={e => setNewBcnName(e.target.value)}
                  placeholder="例: 電視城一號廠門口 Beacon"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  UUID <span className="text-rose-500">* (必填)</span>
                </label>
                <input
                  type="text"
                  required
                  value={newBcnUuid}
                  onChange={e => setNewBcnUuid(e.target.value)}
                  placeholder="例: F7826DA6-4FA2-4E98-8024-BC5B71E0893E"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-blue-600 font-mono font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Major <span className="text-rose-500">* (必填)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newBcnMajor}
                    onChange={e => setNewBcnMajor(e.target.value)}
                    placeholder="例: 10001"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-100 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Minor <span className="text-slate-400 font-normal">(選填)</span>
                  </label>
                  <input
                    type="text"
                    value={newBcnMinor}
                    onChange={e => setNewBcnMinor(e.target.value)}
                    placeholder="例: 20001"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-100 font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  部署位置備註 <span className="text-slate-400 font-normal">(選填)</span>
                </label>
                <input
                  type="text"
                  value={newBcnNote}
                  onChange={e => setNewBcnNote(e.target.value)}
                  placeholder="例: 錄影廠區 1 號門連通道柱位"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-medium outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBeaconModal(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
              >
                新增 Beacon
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD WIFI MODAL */}
      {showAddWifiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddWifi} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Wifi size={16} className="text-emerald-500" />
                <span>新增 Office WiFi 配置</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddWifiModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Wi-Fi 名稱 (SSID) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newWifiSsid}
                  onChange={e => setNewWifiSsid(e.target.value)}
                  placeholder="例: TVB-Corp-5G"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  MAC地址 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newWifiMac}
                  onChange={e => setNewWifiMac(e.target.value)}
                  placeholder="例: 00:1A:2B:3C:4D:5E"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-emerald-600 font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  位置與說明
                </label>
                <input
                  type="text"
                  value={newWifiNote}
                  onChange={e => setNewWifiNote(e.target.value)}
                  placeholder="例: 將軍澳電視城內部專網"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-medium outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddWifiModal(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
              >
                新增 Wi-Fi 白名單
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD GPS GEOFENCE MODAL WITH SIMULATED GOOGLE MAP */}
      {showAddGpsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form onSubmit={handleAddGpsFence} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 max-w-xl w-full shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-amber-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">新增 GPS 電子圍欄 (Google 地圖模擬)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddGpsModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* SIMULATED GOOGLE MAP CONTAINER */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900 shadow-inner group">
              {/* Map Header Toolbar with Google Search Bar */}
              <div className="absolute top-2 left-2 right-2 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-md">
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-0.5 font-bold text-slate-800 dark:text-slate-200 shrink-0">
                    <span className="text-blue-500 font-extrabold font-serif text-sm">G</span>
                    <span className="text-rose-500 font-extrabold font-serif text-sm">o</span>
                    <span className="text-amber-500 font-extrabold font-serif text-sm">o</span>
                    <span className="text-blue-500 font-extrabold font-serif text-sm">g</span>
                    <span className="text-emerald-500 font-extrabold font-serif text-sm">l</span>
                    <span className="text-rose-500 font-extrabold font-serif text-sm">e</span>
                  </div>

                  {/* Google Search Bar */}
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="text"
                      value={mapSearchQuery}
                      onChange={e => setMapSearchQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleMapSearch();
                        }
                      }}
                      placeholder="搜尋 Google 地圖地點或地址 (例如: 將軍澳電視城)..."
                      className="w-full pl-8 pr-7 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <Search size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />
                    {mapSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setMapSearchQuery('')}
                        className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMapSearch()}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shrink-0 cursor-pointer transition-colors shadow-xs flex items-center gap-1"
                  >
                    <span>搜尋</span>
                  </button>
                </div>

                <div className="flex items-center justify-end gap-1 shrink-0 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMapStyle('roadmap')}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                      mapStyle === 'roadmap' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    地圖
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapStyle('satellite')}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                      mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    衛星
                  </button>
                </div>
              </div>

              {/* Map Canvas Visual (Interactive Simulated Grid) */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width - 0.5;
                  const y = (e.clientY - rect.top) / rect.height - 0.5;
                  setNewGpsLat(prev => parseFloat((prev - y * 0.002).toFixed(4)));
                  setNewGpsLng(prev => parseFloat((prev + x * 0.002).toFixed(4)));
                  triggerSound(700, 'sine', 0.05);
                }}
                className={`relative w-full h-56 cursor-crosshair select-none transition-colors duration-300 ${
                  mapStyle === 'satellite' 
                    ? 'bg-slate-800 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]'
                    : 'bg-emerald-950/20 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:20px_20px]'
                }`}
              >
                {/* Simulated Roads / Geography Lines */}
                <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M -50 100 Q 150 180 350 80 T 600 220" fill="none" stroke={mapStyle === 'satellite' ? '#94a3b8' : '#38bdf8'} strokeWidth="6" />
                  <path d="M 120 -20 Q 220 150 180 300" fill="none" stroke={mapStyle === 'satellite' ? '#64748b' : '#cbd5e1'} strokeWidth="4" />
                </svg>

                {/* Center Target Geofence Circle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    style={{
                      width: `${Math.min(220, Math.max(60, newGpsRadius * 0.5))}px`,
                      height: `${Math.min(220, Math.max(60, newGpsRadius * 0.5))}px`,
                    }}
                    className="rounded-full border-2 border-amber-500 bg-amber-500/20 dark:bg-amber-400/20 shadow-lg animate-pulse flex items-center justify-center transition-all duration-200"
                  >
                    <span className="text-[10px] font-bold text-amber-900 dark:text-amber-200 bg-amber-100/90 dark:bg-amber-950/90 px-1.5 py-0.5 rounded-full border border-amber-300 shadow-xs">
                      打卡半徑 {newGpsRadius}米
                    </span>
                  </div>

                  {/* Marker Pin Icon */}
                  <div className="absolute z-10 flex flex-col items-center -translate-y-4">
                    <MapPin size={28} className="text-rose-600 fill-rose-500 drop-shadow-md animate-bounce" />
                    <div className="w-2.5 h-1 bg-slate-900/40 rounded-full blur-[1px]"></div>
                  </div>
                </div>

                {/* Bottom Overlay Info Badge */}
                <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between text-[10px] font-mono font-bold bg-slate-950/80 text-white px-2.5 py-1 rounded-xl backdrop-blur-xs">
                  <span>點擊地圖任意位置可調整中心針腳</span>
                  <span className="text-amber-400">Lat: {newGpsLat}, Lng: {newGpsLng}</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    圍欄 / 地點名稱 <span className="text-rose-500">* (必填)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newGpsName}
                    onChange={e => setNewGpsName(e.target.value)}
                    placeholder="例: 將軍澳電視城主樓"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    門牌地址 / 地標說明
                  </label>
                  <input
                    type="text"
                    value={newGpsAddress}
                    onChange={e => setNewGpsAddress(e.target.value)}
                    placeholder="例: 香港將軍澳工業邨駿才街77號"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    中心緯度 (Latitude) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newGpsLat}
                    onChange={e => setNewGpsLat(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-amber-600 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    中心經度 (Longitude) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newGpsLng}
                    onChange={e => setNewGpsLng(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-amber-600 font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-700 dark:text-slate-300 font-bold block">
                    允許打卡有效半徑 (公尺/Meters)
                  </label>
                  <span className="font-mono font-bold text-amber-600 text-xs">{newGpsRadius} 米 (m)</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="30"
                    max="1000"
                    step="10"
                    value={newGpsRadius}
                    onChange={e => setNewGpsRadius(parseInt(e.target.value) || 100)}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex gap-1 shrink-0">
                    {[50, 100, 200, 300, 500].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNewGpsRadius(r)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
                          newGpsRadius === r ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        }`}
                      >
                        {r}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddGpsModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>儲存 GPS 圍欄</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
