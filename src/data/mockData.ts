/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Booking, BookingStatus, PurposeOption, PurposeCode,
  BeaconRule, WifiRule, GpsConfig, GpsFenceRule, ClockInLog, MonthlyReportSummary, MonthlyReportDetail
} from '../types';

export const PURPOSE_OPTIONS: PurposeOption[] = [
  { code: 'C', label: '承辦商', color: 'text-white border-orange-700 dark:border-orange-600', bgColor: 'bg-orange-600 dark:bg-orange-700' },
  { code: 'D', label: '送貨', color: 'text-slate-950 border-amber-500 dark:border-amber-400', bgColor: 'bg-amber-400 dark:bg-amber-500' },
  { code: 'F', label: '散工', color: 'text-slate-950 border-yellow-500 dark:border-yellow-400', bgColor: 'bg-yellow-400 dark:bg-yellow-500' },
  { code: 'I', label: '面試', color: 'text-white border-purple-700 dark:border-purple-600', bgColor: 'bg-purple-600 dark:bg-purple-700' },
  { code: 'M', label: '開會', color: 'text-white border-blue-700 dark:border-blue-600', bgColor: 'bg-blue-600 dark:bg-blue-700' },
  { code: 'N', label: '新返工', color: 'text-white border-emerald-750 dark:border-emerald-600', bgColor: 'bg-emerald-600 dark:bg-emerald-750' },
  { code: 'S', label: '入廠', color: 'text-white border-rose-700 dark:border-rose-600', bgColor: 'bg-rose-600 dark:bg-rose-700' },
  { code: 'V', label: '訪客', color: 'text-white border-indigo-700 dark:border-indigo-600', bgColor: 'bg-indigo-600 dark:bg-indigo-700' },
];

export const getPurposeLabel = (code: PurposeCode): string => {
  const found = PURPOSE_OPTIONS.find(opt => opt.code === code);
  return found ? found.label : code;
};

export const getPurposeOption = (code: PurposeCode): PurposeOption => {
  return PURPOSE_OPTIONS.find(opt => opt.code === code) || PURPOSE_OPTIONS[7];
};

// Initial Attendance Location Configuration
export const INITIAL_BEACONS: BeaconRule[] = [
  {
    id: 'BCN-001',
    name: '電視城主樓 1F 大堂 Beacon',
    uuid: 'F7826DA6-4FA2-4E98-8024-BC5B71E0893E',
    major: 10001,
    minor: 20001,
    locationNote: '主樓地下大堂接待處入口旁',
    isEnabled: true
  },
  {
    id: 'BCN-002',
    name: '綜藝大樓 3F 錄影廠區 Beacon',
    uuid: 'E2C56DB5-8F12-4E23-9123-BC5B71E0999A',
    major: 10002,
    minor: 20002,
    locationNote: '1廠及2廠通道中央柱位',
    isEnabled: true
  },
  {
    id: 'BCN-003',
    name: '行政大樓 7F 會議中心 Beacon',
    uuid: 'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
    major: 10003,
    minor: '',
    locationNote: '高層行政會議室走廊入口',
    isEnabled: true
  }
];

export const INITIAL_WIFIS: WifiRule[] = [
  {
    id: 'WIFI-001',
    ssid: 'TVB-Corp-5G',
    mac: '00:1A:2B:3C:4D:5E',
    locationNote: '將軍澳電視城內部高速辦公網絡',
    isEnabled: true
  },
  {
    id: 'WIFI-002',
    ssid: 'TVB-Staff-Secure',
    mac: '00:1A:2B:88:99:AA',
    locationNote: '員工專用加密網關 (全廠覆蓋)',
    isEnabled: true
  },
  {
    id: 'WIFI-003',
    ssid: 'TVB-Studio-Production',
    mac: '12:34:56:78:9A:BC',
    locationNote: '錄影廠與外景車隊專用專網',
    isEnabled: true
  }
];

export const INITIAL_GPS_CONFIG: GpsConfig = {
  centerLat: 22.3789,
  centerLng: 114.2698,
  radiusMeters: 300,
  locationName: '香港將軍澳工業邨駿才街77號電視廣播城',
  isEnabled: true
};

export const INITIAL_GPS_FENCES: GpsFenceRule[] = [
  {
    id: 'GPS-001',
    locationName: '將軍澳電視廣播城總部',
    address: '香港將軍澳工業邨駿才街77號電視廣播城',
    centerLat: 22.3789,
    centerLng: 114.2698,
    radiusMeters: 300,
    isEnabled: true
  },
  {
    id: 'GPS-002',
    locationName: '灣仔新聞採訪專區',
    address: '香港灣仔告士打道160號海外信託銀行大廈',
    centerLat: 22.2783,
    centerLng: 114.1731,
    radiusMeters: 150,
    isEnabled: true
  }
];

// Initial Real-time Attendance Logs
export const INITIAL_CLOCK_IN_LOGS: ClockInLog[] = [
  {
    id: 'LOG-1001',
    employeeId: 'TVB-8821',
    employeeNameZh: '陳大文',
    employeeNameEn: 'Tai Man Chan',
    employeeName: '陳大文 (Tai Man Chan)',
    employeeType: '全職員工',
    dept: '綜藝節目部',
    deviceId: 'DEV-IP15P-8821',
    timestamp: '2026-08-10 08:55:12',
    clockType: 'CLOCK IN',
    method: 'BEACON',
    locationDetail: 'TVB主樓大堂 Beacon (RSSI: -68dBm)',
    status: 'NORMAL',
    notes: '準時上班打卡'
  },
  {
    id: 'LOG-1002',
    employeeId: 'TVB-9123',
    employeeNameZh: '鄧美儀',
    employeeNameEn: 'May Tang',
    employeeName: '鄧美儀 (May Tang)',
    employeeType: '全職員工',
    dept: 'New Media Group',
    deviceId: 'DEV-SAM24-9123',
    timestamp: '2026-08-10 09:12:45',
    clockType: 'CLOCK IN',
    method: 'WIFI',
    locationDetail: 'TVB-Corp-5G (MAC: 00:1A:2B:3C:4D:5E)',
    status: 'ABNORMAL',
    notes: '遲到12分鐘'
  },
  {
    id: 'LOG-1003',
    employeeId: 'TVB-7654',
    employeeNameZh: '李麗華',
    employeeNameEn: 'Lai Wah Lee',
    employeeName: '李麗華 (Lai Wah Lee)',
    employeeType: '合約員工',
    dept: '藝員管理部',
    deviceId: 'DEV-IP14-7654',
    timestamp: '2026-08-10 08:48:30',
    clockType: 'CLOCK IN',
    method: 'GPS',
    locationDetail: 'GPS 電視廣播城 (距離中心: 45m)',
    status: 'NORMAL',
    notes: ''
  },
  {
    id: 'LOG-1004',
    employeeId: 'TVB-5432',
    employeeNameZh: '張偉傑',
    employeeNameEn: 'Wai Kit Cheung',
    employeeName: '張偉傑 (Wai Kit Cheung)',
    employeeType: '全職員工',
    dept: '外景新聞組',
    deviceId: 'DEV-IP15-5432',
    timestamp: '2026-08-10 09:15:00',
    clockType: 'CLOCK IN',
    method: 'GPS',
    locationDetail: '灣仔立法會綜合大樓 (GPS定位: 22.281, 114.165)',
    status: 'NORMAL',
    notes: '已向主管報備外勤採訪'
  },
  {
    id: 'LOG-1005',
    employeeId: 'TVB-8821',
    employeeNameZh: '陳大文',
    employeeNameEn: 'Tai Man Chan',
    employeeName: '陳大文 (Tai Man Chan)',
    employeeType: '全職員工',
    dept: '綜藝節目部',
    deviceId: 'DEV-IP15P-8821',
    timestamp: '2026-08-09 18:05:20',
    clockType: 'CLOCK OUT',
    method: 'BEACON',
    locationDetail: 'TVB主樓大堂 Beacon (RSSI: -71dBm)',
    status: 'NORMAL',
    notes: '正常下班打卡'
  },
  {
    id: 'LOG-1006',
    employeeId: 'TVB-3392',
    employeeNameZh: '黃家強',
    employeeNameEn: 'Ka Keung Wong',
    employeeName: '黃家強 (Ka Keung Wong)',
    employeeType: '兼職員工',
    dept: '製作部',
    deviceId: 'DEV-MI13-3392',
    timestamp: '2026-08-09 17:10:00',
    clockType: 'CLOCK OUT',
    method: 'WIFI',
    locationDetail: 'TVB-Studio-Production (MAC: 12:34:56:78:9A:BC)',
    status: 'ABNORMAL',
    notes: '早退 50 分鐘'
  },
  {
    id: 'LOG-1007',
    employeeId: 'TVB-4410',
    employeeNameZh: '林志豪',
    employeeNameEn: 'Chi Ho Lam',
    employeeName: '林志豪 (Chi Ho Lam)',
    employeeType: '外判人員',
    dept: '工程及設施部',
    deviceId: 'DEV-HW30-4410',
    timestamp: '2026-08-08 08:30:15',
    clockType: 'CLOCK IN',
    method: 'GPS',
    locationDetail: 'GPS 電視廣播城一號廠 (距離: 12m)',
    status: 'NORMAL',
    notes: '設備保養進場'
  },
  {
    id: 'LOG-1008',
    employeeId: 'TVB-9123',
    employeeNameZh: '鄧美儀',
    employeeNameEn: 'May Tang',
    employeeName: '鄧美儀 (May Tang)',
    employeeType: '全職員工',
    dept: 'New Media Group',
    deviceId: 'DEV-SAM24-9123',
    timestamp: '2026-08-08 18:30:00',
    clockType: 'CLOCK OUT',
    method: 'WIFI',
    locationDetail: 'TVB-Corp-5G (MAC: 00:1A:2B:3C:4D:5E)',
    status: 'NORMAL',
    notes: '正常下班打卡'
  }
];

// Natural Month Automated Attendance Reports (自然月考勤報表)
export const INITIAL_MONTHLY_REPORTS: MonthlyReportSummary[] = [
  {
    month: '2026-07',
    monthName: '2026年7月',
    employeeCount: 382,
    totalPunches: 16808,
    abnormalCount: 65,
    generatedAt: '2026-08-01 02:00:00'
  },
  {
    month: '2026-06',
    monthName: '2026年6月',
    employeeCount: 378,
    totalPunches: 16632,
    abnormalCount: 55,
    generatedAt: '2026-07-01 02:00:00'
  },
  {
    month: '2026-05',
    monthName: '2026年5月',
    employeeCount: 375,
    totalPunches: 16500,
    abnormalCount: 74,
    generatedAt: '2026-06-01 02:00:00'
  }
];

export const INITIAL_MONTHLY_DETAILS: MonthlyReportDetail[] = [
  {
    id: 'RPT-001',
    employeeId: 'TVB-8821',
    employeeNameZh: '陳大文',
    employeeNameEn: 'Tai Man Chan',
    employeeName: '陳大文 (Tai Man Chan)',
    employeeType: '全職員工',
    dept: '綜藝節目部',
    month: '2026-07',
    normalDays: 22,
    abnormalDays: 1,
    missingPunches: 0,
    totalHours: 184.5
  },
  {
    id: 'RPT-002',
    employeeId: 'TVB-9123',
    employeeNameZh: '鄧美儀',
    employeeNameEn: 'May Tang',
    employeeName: '鄧美儀 (May Tang)',
    employeeType: '全職員工',
    dept: 'New Media Group',
    month: '2026-07',
    normalDays: 20,
    abnormalDays: 3,
    missingPunches: 1,
    totalHours: 178.0
  },
  {
    id: 'RPT-003',
    employeeId: 'TVB-7654',
    employeeNameZh: '李麗華',
    employeeNameEn: 'Lai Wah Lee',
    employeeName: '李麗華 (Lai Wah Lee)',
    employeeType: '合約員工',
    dept: '藝員管理部',
    month: '2026-07',
    normalDays: 23,
    abnormalDays: 0,
    missingPunches: 0,
    totalHours: 188.0
  },
  {
    id: 'RPT-004',
    employeeId: 'TVB-5432',
    employeeNameZh: '張偉傑',
    employeeNameEn: 'Wai Kit Cheung',
    employeeName: '張偉傑 (Wai Kit Cheung)',
    employeeType: '全職員工',
    dept: '外景新聞組',
    month: '2026-07',
    normalDays: 21,
    abnormalDays: 2,
    missingPunches: 1,
    totalHours: 176.0
  },
  {
    id: 'RPT-005',
    employeeId: 'TVB-3392',
    employeeNameZh: '黃家強',
    employeeNameEn: 'Ka Keung Wong',
    employeeName: '黃家強 (Ka Keung Wong)',
    employeeType: '兼職員工',
    dept: '製作部',
    month: '2026-07',
    normalDays: 18,
    abnormalDays: 4,
    missingPunches: 2,
    totalHours: 142.5
  },
  {
    id: 'RPT-006',
    employeeId: 'TVB-4410',
    employeeNameZh: '林志豪',
    employeeNameEn: 'Chi Ho Lam',
    employeeName: '林志豪 (Chi Ho Lam)',
    employeeType: '外判人員',
    dept: '工程及設施部',
    month: '2026-07',
    normalDays: 22,
    abnormalDays: 1,
    missingPunches: 0,
    totalHours: 176.0
  }
];


export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'B001',
    visitorName: '王大同',
    company: '騰訊香港 (Tencent HK)',
    visitDateTime: '2026-07-25T10:00',
    licensePlate: '粵Z A888港',
    purpose: 'M',
    destination: '7樓 行政會議室 A (7F Boardroom A)',
    notes: '討論下半年廣告合作事宜，預計需要 2 小時。',
    contactEmail: 'xiaoming.zhang@tencent.com',
    status: BookingStatus.UPCOMING,
    createdAt: '2026-07-20T14:30:00',
    invitationCode: 'TVB-8392-XM7',
    hostEmployeeName: '王小明 (Siu Ming Wong)',
    hostEmployeeDept: '綜藝節目部 (Variety Dept)',
    contactPerson: 'May Tang',
    responsibleDept: 'New Media Group',
    contactPhone: '91946190',
    visitors: [
      { name: '王大同', idNumber: '3043344343' },
      { name: '張曉明', idNumber: '3432424234' }
    ]
  },
  {
    id: 'B002',
    visitorName: '李偉強 (Lee Wai Keung)',
    company: 'DHL 快捷速遞 (DHL Express)',
    visitDateTime: '2026-07-21T15:30',
    licensePlate: 'JD 9381',
    purpose: 'D',
    destination: '地下 收發處 (G/F Mailroom)',
    notes: '緊急宣傳物料運送。',
    contactEmail: 'wk.lee@dhl.com',
    status: BookingStatus.UPCOMING,
    createdAt: '2026-07-21T09:15:00',
    invitationCode: 'TVB-1029-LK4',
    hostEmployeeName: '溫家偉 (Alan Wan)',
    hostEmployeeDept: '製作部 (Production Dept)',
    contactPerson: 'May Tang',
    responsibleDept: 'New Media Group',
    contactPhone: '91946190'
  },
  {
    id: 'B006',
    visitorName: '王大同',
    company: '阿里影業 (Alibaba Pictures)',
    visitDateTime: '2026-07-23T14:00',
    licensePlate: '粵Z B666港',
    purpose: 'M',
    destination: '8樓 總裁辦公室 (8F Executive Suite)',
    notes: '合拍電視劇項目意向書簽約儀式。',
    contactEmail: 'yl.ma@alibaba-pictures.com',
    status: BookingStatus.UPCOMING,
    createdAt: '2026-07-21T11:00:00',
    invitationCode: 'TVB-9981-ML8',
    hostEmployeeName: '李麗華 (Lai Wah Lee)',
    hostEmployeeDept: '藝員管理部 (Talent Relations)',
    contactPerson: 'May Tang',
    responsibleDept: 'New Media Group',
    contactPhone: '91946190',
    visitors: [
      { name: '王大同', idNumber: '3043344343' },
      { name: '張曉明', idNumber: '3432424234' }
    ]
  },
  {
    id: 'B007',
    visitorName: '霍建華 (Wallace Huo)',
    company: '華傑工作室 (HJH Studio)',
    visitDateTime: '2026-07-24T16:30',
    licensePlate: 'AB 8888',
    purpose: 'I',
    destination: '3樓 藝員甄選室 (3F Audition Room)',
    notes: '特邀嘉賓出席台慶劇面試及角色檔期洽談。',
    contactEmail: 'wallace@hjhstudio.com',
    status: BookingStatus.UPCOMING,
    createdAt: '2026-07-21T12:30:00',
    invitationCode: 'TVB-7729-WH5',
    hostEmployeeName: '王小明 (Siu Ming Wong)',
    hostEmployeeDept: '綜藝節目部 (Variety Dept)',
    contactPerson: 'May Tang',
    responsibleDept: 'New Media Group',
    contactPhone: '91946190'
  },
  {
    id: 'B003',
    visitorName: '陳美玲 (Chan May Ling)',
    company: '羅兵咸永道會計師事務所 (PwC HK)',
    visitDateTime: '2026-07-21T09:30',
    licensePlate: '',
    purpose: 'M',
    destination: '5樓 財務審計部 (5F Audit Dept)',
    notes: '年度中段財務審計工作會議。',
    contactEmail: 'mayling.chan@pwc.com',
    status: BookingStatus.CHECKED_IN,
    createdAt: '2026-07-20T10:00:00',
    checkedInAt: '2026-07-21T09:28:00',
    invitationCode: 'TVB-4482-CL2',
    associatedBookingId: 'EM-4482-99',
    hostEmployeeName: '陳大文 (Tai Man Chan)',
    hostEmployeeDept: '財務部 (Finance Dept)',
    contactPerson: 'May Tang',
    responsibleDept: 'New Media Group',
    contactPhone: '91946190'
  },
  {
    id: 'B004',
    visitorName: '王大同 (Wong Tai Tung)',
    company: '順豐速運 (SF Express)',
    visitDateTime: '2026-07-20T11:00',
    licensePlate: 'SF 8899',
    purpose: 'D',
    destination: '2樓 行政大堂 (2F Admin Lobby)',
    notes: '高層合約文件回執。',
    contactEmail: 'datong.wong@sf.express.com',
    status: BookingStatus.COMPLETED,
    createdAt: '2026-07-20T08:30:00',
    checkedInAt: '2026-07-20T10:55:00',
    checkedOutAt: '2026-07-20T11:40:00',
    invitationCode: 'TVB-2918-WD1',
    associatedBookingId: 'EM-2918-05',
    hostEmployeeName: '劉偉傑 (Wai Kit Lau)',
    hostEmployeeDept: '總經理辦公室 (General Manager Office)',
    contactPerson: 'May Tang',
    responsibleDept: 'New Media Group',
    contactPhone: '91946190'
  },
  {
    id: 'B005',
    visitorName: '林志豪 (Lam Chi Ho)',
    company: '星輝工程有限公司 (Starry Engineering)',
    visitDateTime: '2026-07-19T08:30',
    licensePlate: 'GD 5240',
    purpose: 'C',
    destination: '電視城一號錄影廠 (Studio 1)',
    notes: '錄影廠舞台燈光線路保養與檢修工作。',
    contactEmail: 'chiho.lam@starryeng.com.hk',
    status: BookingStatus.CANCELLED,
    createdAt: '2026-07-18T16:20:00',
    invitationCode: 'TVB-5012-LH9',
    hostEmployeeName: '陸浩宇 (Howard Luk)',
    hostEmployeeDept: '工程及設施部 (Engineering Dept)',
    contactPerson: 'May Tang',
    responsibleDept: 'New Media Group',
    contactPhone: '91946190'
  }
];
