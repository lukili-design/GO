/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Booking, BookingStatus, PurposeOption, PurposeCode,
  BeaconRule, WifiRule, GpsConfig, GpsFenceRule, ClockInLog, MonthlyReportSummary, MonthlyReportDetail,
  VotingCampaign, VoteArticle
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

export const getVisitorTypeLabel = (type?: string): string => {
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
    id: 'B000-PENDING-SINGLE',
    visitorName: '李偉強 (Lee Wai Keung)',
    visitorType: 'SINGLE',
    totalVisitorsCount: 1,
    clientTier: 'NORMAL',
    company: 'DHL 快捷速遞 (DHL Express)',
    visitDateTime: '2026.07.21 15:30',
    visitMode: 'SINGLE_VISIT',
    licensePlate: 'JD 9381',
    purpose: 'D',
    destination: '地下 收發處 (G/F Mailroom)',
    notes: '緊急宣傳物料運送。',
    contactEmail: 'lee.wk@dhl.com',
    status: BookingStatus.PENDING,
    createdAt: '2026-07-21T09:00:00',
    invitationCode: 'TVB-8821-PENDING',
    hostEmployeeName: '陳莉莉 (Lily Chan)',
    hostEmployeeDept: '綜藝節目部',
    visitors: [
      { name: '李偉強 (Lee Wai Keung)', email: 'lee.wk@dhl.com' }
    ]
  },
  {
    id: 'B001-PENDING-MULTI',
    visitorName: '李偉強 (Lee Wai Keung)',
    visitorType: 'MULTI',
    totalVisitorsCount: 2,
    clientTier: 'VIP',
    company: 'DHL 快捷速遞 (DHL Express)',
    visitDateTime: '2026.07.21 15:30-2026.08.20 15:30',
    visitMode: 'MULTI_PASS',
    startDateTime: '2026-07-21T15:30',
    endDateTime: '2026-08-20T15:30',
    licensePlate: '粵Z A888港, JD 9381',
    purpose: 'D',
    destination: '地下 收發處 (G/F Mailroom)',
    notes: '一個月內常規節目快遞派送。',
    contactEmail: 'lee.wk@dhl.com',
    status: BookingStatus.PENDING,
    createdAt: '2026-07-20T14:30:00',
    invitationCode: 'TVB-8392-XM7',
    hostEmployeeName: '陳莉莉 (Lily Chan)',
    hostEmployeeDept: '綜藝節目部',
    visitors: [
      { name: '李偉強 (Lee Wai Keung)', email: 'lee.wk@dhl.com' },
      { name: '王大同', email: 'datong.wong@dhl.com' }
    ]
  },
  {
    id: 'B002-PENDING-TEAM',
    visitorName: '李偉強 (Lee Wai Keung)',
    visitorType: 'TEAM',
    totalVisitorsCount: 3,
    clientTier: 'NORMAL',
    company: 'DHL 快捷速遞 (DHL Express)',
    visitDateTime: '2026.07.21 15:30-2026.08.20 15:30',
    visitMode: 'MULTI_PASS',
    startDateTime: '2026-07-21T15:30',
    endDateTime: '2026-08-20T15:30',
    licensePlate: 'AB 8888, CD 6666',
    purpose: 'D',
    destination: '一號錄影廠與電視城物流區',
    notes: '團隊參觀與設備搬運。',
    contactEmail: 'lee.wk@dhl.com',
    status: BookingStatus.PENDING,
    createdAt: '2026-07-21T09:15:00',
    invitationCode: 'TVB-1029-TEAM3',
    hostEmployeeName: '陳莉莉 (Lily Chan)',
    hostEmployeeDept: '綜藝節目部',
    visitors: [
      { name: '李偉強 (Lee Wai Keung)', email: 'lee.wk@dhl.com' }
    ]
  },
  {
    id: 'B008-PENDING-VIP',
    visitorName: '郭建國 (Kin Kwok Kwok)',
    visitorType: 'SINGLE',
    totalVisitorsCount: 1,
    clientTier: 'VIP',
    company: '聲威音樂 (Soundway Music HK)',
    visitDateTime: '2026.08.19 14:00',
    visitMode: 'SINGLE_VISIT',
    licensePlate: 'VIP 8888',
    purpose: 'M',
    destination: '7樓 藝員及唱片事業部 (7F Music Dept)',
    notes: '新歌合作與台慶表演商效洽談會議。',
    contactEmail: 'kinkwok.kwok@soundway.com',
    status: BookingStatus.PENDING,
    createdAt: '2026-08-18T08:30:00',
    invitationCode: 'TVB-7701-VIP',
    hostEmployeeName: '黃美玲 (May Wong)',
    hostEmployeeDept: '藝員管理部',
    hostEmployeeId: 'EMP005',
    visitors: [
      { name: '郭建國 (Kin Kwok Kwok)', email: 'kinkwok.kwok@soundway.com' }
    ]
  },
  {
    id: 'B009-PENDING-VENDOR',
    visitorName: '周國強 (Kwok Keung Chow)',
    visitorType: 'MULTI',
    totalVisitorsCount: 2,
    clientTier: 'NORMAL',
    company: '華星音響工程公司',
    visitDateTime: '2026.08.19 09:00',
    visitMode: 'SINGLE_VISIT',
    licensePlate: 'WF 3321',
    purpose: 'C',
    destination: '二號錄影廠 音響控制室',
    notes: '大型現場節目收音控制台年度例行保養與測試。',
    contactEmail: 'kkchow@wasing-eng.com',
    status: BookingStatus.PENDING,
    createdAt: '2026-08-18T09:10:00',
    invitationCode: 'TVB-3321-ENG',
    hostEmployeeName: '王小明 (Siu Ming Wong)',
    hostEmployeeDept: '工程及設施部',
    hostEmployeeId: 'EMP001',
    visitors: [
      { name: '周國強 (Kwok Keung Chow)', email: 'kkchow@wasing-eng.com' },
      { name: '陳國華', email: 'kwchan@wasing-eng.com' }
    ]
  },
  {
    id: 'B010-PENDING-INTERVIEW',
    visitorName: '許詠詩 (Wing Sze Hui)',
    visitorType: 'SINGLE',
    totalVisitorsCount: 1,
    clientTier: 'NORMAL',
    company: '香港大學新聞及傳媒研究中心',
    visitDateTime: '2026.08.20 10:30',
    visitMode: 'SINGLE_VISIT',
    purpose: 'I',
    destination: '4樓 新聞部編輯室 (4F Newsroom)',
    notes: '秋季新聞實習生面試與採訪實驗室試音。',
    contactEmail: 'wingsze.hui@hku.hk',
    status: BookingStatus.PENDING,
    createdAt: '2026-08-18T10:00:00',
    invitationCode: 'TVB-4012-INT',
    hostEmployeeName: '李麗華 (Lai Wah Lee)',
    hostEmployeeDept: '新聞及公共事務部',
    hostEmployeeId: 'EMP003',
    visitors: [
      { name: '許詠詩 (Wing Sze Hui)', email: 'wingsze.hui@hku.hk' }
    ]
  },
  {
    id: 'B011-PENDING-AUDIT',
    visitorName: '麥永安 (Wing On Mak)',
    visitorType: 'TEAM',
    totalVisitorsCount: 4,
    clientTier: 'VIP',
    company: '畢馬威會計師事務所 (KPMG)',
    visitDateTime: '2026.08.20 09:30-2026.08.22 18:00',
    visitMode: 'MULTI_PASS',
    startDateTime: '2026-08-20T09:30',
    endDateTime: '2026-08-22T18:00',
    licensePlate: 'KM 8888, KM 9999',
    purpose: 'V',
    destination: '6樓 董事局審計會議室 (6F Boardroom)',
    notes: 'Q3 企業資產與合規性專項審核小組入場。',
    contactEmail: 'wingon.mak@kpmg.com.hk',
    status: BookingStatus.PENDING,
    createdAt: '2026-08-18T11:20:00',
    invitationCode: 'TVB-6088-KPMG',
    hostEmployeeName: '張志強 (Chi Keung Cheung)',
    hostEmployeeDept: '財務及合規部',
    hostEmployeeId: 'EMP004',
    visitors: [
      { name: '麥永安 (Wing On Mak)', email: 'wingon.mak@kpmg.com.hk' }
    ]
  },
  {
    id: 'B001-UPCOMING',
    visitorName: '李偉強 (Lee Wai Keung)',
    visitorType: 'MULTI',
    totalVisitorsCount: 2,
    clientTier: 'VIP',
    company: 'DHL 快捷速遞 (DHL Express)',
    visitDateTime: '2026.07.21 15:30-2026.08.20 15:30',
    visitMode: 'MULTI_PASS',
    startDateTime: '2026-07-21T15:30',
    endDateTime: '2026-08-20T15:30',
    licensePlate: '粵Z A888港, JD 9381',
    purpose: 'D',
    destination: '地下 收發處 (G/F Mailroom)',
    notes: '一個月內常規節目快遞派送。',
    contactEmail: 'lee.wk@dhl.com',
    status: BookingStatus.UPCOMING,
    createdAt: '2026-07-20T14:30:00',
    invitationCode: 'TVB-8392-XM7',
    hostEmployeeName: '陳莉莉 (Lily Chan)',
    hostEmployeeDept: '綜藝節目部',
    visitors: [
      { name: '李偉強 (Lee Wai Keung)', email: 'lee.wk@dhl.com' },
      { name: '王大同', email: 'datong.wong@dhl.com' }
    ]
  },
  {
    id: 'B007-SHARED-UPCOMING',
    visitorName: '張家豪 (Ka Ho Cheung)',
    visitorType: 'MULTI_SHARED',
    totalVisitorsCount: 3,
    clientTier: 'VIP',
    company: '創世紀音響媒體有限公司',
    visitDateTime: '2026.08.19 10:00',
    visitMode: 'SINGLE_VISIT',
    licensePlate: 'GEN 8888',
    purpose: 'M',
    destination: '一號錄影廠 音樂控制室',
    notes: '「多人同行」共用通行證核銷測試卡片（共用二維碼）',
    contactEmail: 'kaho.cheung@genesis-audio.com',
    status: BookingStatus.UPCOMING,
    createdAt: '2026-08-19T09:00:00',
    invitationCode: 'TVB-8888-SHARED',
    hostEmployeeName: '陳大文 (Tai Man Chan)',
    hostEmployeeDept: '綜藝節目部',
    visitors: [
      { name: '張家豪 (Ka Ho Cheung)', email: 'kaho.cheung@genesis-audio.com' },
      { name: '林偉強 (Wai Keung Lam)', email: 'waikeung.lam@genesis-audio.com' },
      { name: '黃志明 (Chi Ming Wong)', email: 'chiming.wong@genesis-audio.com' }
    ]
  },
  {
    id: 'B008-INDIV-UPCOMING',
    visitorName: '陳永康 (Wing Hong Chan)',
    visitorType: 'MULTI',
    totalVisitorsCount: 2,
    clientTier: 'VIP',
    company: '先鋒傳媒娛樂公司',
    visitDateTime: '2026.08.19 14:00',
    visitMode: 'SINGLE_VISIT',
    licensePlate: 'PNR 9999',
    purpose: 'M',
    destination: '7樓 藝員及唱片事業部',
    notes: '「多人分行」獨立個人通行證核銷測試卡片（獨立二維碼）',
    contactEmail: 'winghong.chan@pioneer-ent.com',
    status: BookingStatus.UPCOMING,
    createdAt: '2026-08-19T08:30:00',
    invitationCode: 'TVB-9999-INDIV',
    hostEmployeeName: '黃美玲 (May Wong)',
    hostEmployeeDept: '藝員管理部',
    visitors: [
      { name: '陳永康 (Wing Hong Chan)', email: 'winghong.chan@pioneer-ent.com' },
      { name: '趙德明 (Tak Ming Chiu)', email: 'takming.chiu@pioneer-ent.com' }
    ]
  },
  {
    id: 'B003',
    visitorName: '陳美玲 (Chan May Ling)',
    visitorType: 'SINGLE',
    totalVisitorsCount: 1,
    company: '羅兵咸永道會計師事務所 (PwC HK)',
    visitDateTime: '2026.07.21 09:30',
    visitMode: 'SINGLE_VISIT',
    licensePlate: '',
    purpose: 'M',
    destination: '5樓 財務審計部 (5F Audit Dept)',
    notes: '年度中段財務審計工作會議。',
    contactEmail: 'mayling.chan@pwc.com',
    status: BookingStatus.CHECKED_IN,
    createdAt: '2026-07-20T10:00:00',
    checkedInAt: '2026-07-21T09:28:00',
    invitationCode: 'TVB-4482-CL2',
    hostEmployeeName: '陳大文 (Tai Man Chan)',
    hostEmployeeDept: '財務部 (Finance Dept)',
    visitors: [
      { name: '陳美玲 (Chan May Ling)', email: 'mayling.chan@pwc.com' }
    ]
  },
  {
    id: 'B004',
    visitorName: '王大同 (Wong Tai Tung)',
    visitorType: 'SINGLE',
    totalVisitorsCount: 1,
    company: '順豐速運 (SF Express)',
    visitDateTime: '2026.07.20 11:00',
    visitMode: 'SINGLE_VISIT',
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
    hostEmployeeName: '劉偉傑 (Wai Kit Lau)',
    hostEmployeeDept: '總經理辦公室',
    visitors: [
      { name: '王大同 (Wong Tai Tung)', email: 'datong.wong@sf.express.com' }
    ]
  },
  {
    id: 'B005',
    visitorName: '林志豪 (Lam Chi Ho)',
    visitorType: 'SINGLE',
    totalVisitorsCount: 1,
    company: '星輝工程有限公司 (Starry Engineering)',
    visitDateTime: '2026.07.19 08:30',
    visitMode: 'SINGLE_VISIT',
    licensePlate: 'GD 5240',
    purpose: 'C',
    destination: '電視城一號錄影廠 (Studio 1)',
    notes: '錄影廠舞台燈光線路保養與檢修工作。',
    contactEmail: 'chiho.lam@starryeng.com.hk',
    status: BookingStatus.CANCELLED,
    createdAt: '2026-07-18T16:20:00',
    invitationCode: 'TVB-5012-LH9',
    hostEmployeeName: '陸浩宇 (Howard Luk)',
    hostEmployeeDept: '工程及設施部',
    visitors: [
      { name: '林志豪 (Lam Chi Ho)', email: 'chiho.lam@starryeng.com.hk' }
    ]
  },
  {
    id: 'B006-REJECTED',
    visitorName: '張偉民 (Cheung Wai Man)',
    visitorType: 'SINGLE',
    totalVisitorsCount: 1,
    company: '港島地產顧問公司',
    visitDateTime: '2026.07.18 14:00',
    visitMode: 'SINGLE_VISIT',
    licensePlate: 'HK 9988',
    purpose: 'S',
    destination: '行政大樓 7樓',
    notes: '未有預先登記對接員工，經核查後拒絕批核入場。',
    contactEmail: 'waiman.cheung@hkre.com',
    status: BookingStatus.CANCELLED,
    approvalNotes: 'REJECTED',
    createdAt: '2026-07-18T10:00:00',
    invitationCode: 'TVB-9988-REJ',
    hostEmployeeName: '胡家寶 (Ka Po Wu)',
    hostEmployeeDept: '行政部',
    visitors: [
      { name: '張偉民 (Cheung Wai Man)', email: 'waiman.cheung@hkre.com' }
    ]
  },
  {
    id: 'B007-CANCELLED',
    visitorName: '郭兆強 (Kwok Siu Keung)',
    visitorType: 'SINGLE',
    totalVisitorsCount: 1,
    company: '電訊盈科 (PCCW)',
    visitDateTime: '2026.07.17 11:30',
    visitMode: 'SINGLE_VISIT',
    licensePlate: 'PC 1020',
    purpose: 'I',
    destination: '網絡數據中心',
    notes: '訪客行程變更，申請人自行取消預約。',
    contactEmail: 'siukeung.kwok@pccw.com',
    status: BookingStatus.CANCELLED,
    createdAt: '2026-07-16T15:00:00',
    invitationCode: 'TVB-1020-CAN',
    hostEmployeeName: '林世榮 (Sai Wing Lam)',
    hostEmployeeDept: '資訊科技部',
    visitors: [
      { name: '郭兆強 (Kwok Siu Keung)', email: 'siukeung.kwok@pccw.com' }
    ]
  }
];

// ==========================================
// 互動投票中台初始範例數據 (Voting Campaigns & Articles)
// ==========================================
export const INITIAL_VOTING_CAMPAIGNS: VotingCampaign[] = [
  {
    id: 'VOTE-CAMP-001',
    title: '2026 TVB 萬千星輝頒獎典禮 • 全民大票選',
    coverImage: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&auto=format&fit=crop&q=80',
    description: '一年一度電視界盛事！由全港觀眾及電視城全體同仁共同投選出心目中的五大年度殊榮。本活動包含「最佳劇集」、「最佳女演員」、「最佳男演員」、「最佳女主持」與「最佳電視歌曲」五大評選項目，敬請踴躍投票！',
    resultVisibility: 'AFTER_VOTE',
    status: 'ACTIVE',
    currentPhaseId: 'PHASE-02',
    totalParticipants: 48920,
    totalVotes: 101030,
    startTime: '2026-08-01 00:00:00',
    endTime: '2026-08-28 20:00:00',
    creator: '陳總監 (綜藝節目科)',
    createdAt: '2026-08-01 10:00:00',
    updatedAt: '2026-08-28 16:45:10',
    voteItems: [
      {
        id: 'ITEM-BEST-DRAMA',
        title: '🏆 最佳劇集 20強晉級賽',
        description: '由40部強勢入圍劇集逐輪晉級，角逐年度最佳劇集榮譽！',
        coverImage: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        currentPhaseId: 'PHASE-02',
        totalParticipants: 48920,
        totalVotes: 101030,
        phases: [
          {
            id: 'PHASE-01',
            name: '初賽：40 進 20 淘汰賽',
            status: 'ENDED',
            startTime: '2026-08-01 00:00:00',
            endTime: '2026-08-07 23:59:59',
            mode: 'MULTIPLE',
            maxSelections: 3,
            frequencyLimit: 'ONCE_TOTAL',
            requireAuth: true,
            advanceRuleEnabled: true,
            advanceTopCount: 20,
            advanceTargetPhaseId: 'PHASE-02',
            options: [
              { id: 'OPT-01', name: '《新聞女王 2》', initialVotes: 20000, votes: 24500, avatar: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&auto=format&fit=crop&q=80', description: '原班人馬強勢回歸，SNK News 再掀職場新聞風雲！' },
              { id: 'OPT-02', name: '《反黑英雄 2》', initialVotes: 15000, votes: 19800, avatar: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80', description: '警匪槍戰巔峰對決，正邪交鋒熱血燃爆。' },
              { id: 'OPT-03', name: '《巨塔之后》', initialVotes: 11000, votes: 14200, avatar: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&fit=crop&q=80', description: '醫療豪門暗湧，權力與情感交織的頂級巨作。' },
              { id: 'OPT-04', name: '《法證先鋒 VI》', initialVotes: 8000, votes: 9920, avatar: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80', description: '科學搜證破奇案，經典IP全新升級。' }
            ]
          },
          {
            id: 'PHASE-02',
            name: '複賽：20 進 7 準決賽 (進行中)',
            status: 'ACTIVE',
            startTime: '2026-08-08 00:00:00',
            endTime: '2026-08-20 23:59:59',
            mode: 'SINGLE',
            maxSelections: 1,
            frequencyLimit: 'ONCE_TOTAL',
            requireAuth: true,
            advanceRuleEnabled: true,
            advanceTopCount: 7,
            advanceTargetPhaseId: 'PHASE-03',
            options: [
              { id: 'OPT-P2-01', name: '《新聞女王 2》', initialVotes: 10000, votes: 14850, avatar: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&auto=format&fit=crop&q=80', description: '文慧心強勢復出，女主播台前幕後激烈交鋒。' },
              { id: 'OPT-P2-02', name: '《巨塔之后》', initialVotes: 6000, votes: 9240, avatar: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&fit=crop&q=80', description: '宣萱攜手實力派演員，深沉刻畫醫療權力集團。' },
              { id: 'OPT-P2-03', name: '《反黑英雄 2》', initialVotes: 4000, votes: 5820, avatar: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80', description: '陳山聰、張振朗再度聯手，緝毒反黑硬核出擊。' },
              { id: 'OPT-P2-04', name: '《巾幗梟雄之懸崖》', initialVotes: 1800, votes: 2700, avatar: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=400&auto=format&fit=crop&q=80', description: '經典傳奇再現，亂世江湖中守護初心與大義。' }
            ]
          },
          {
            id: 'PHASE-03',
            name: '終極總決賽：7強爭冠',
            status: 'UPCOMING',
            startTime: '2026-08-21 00:00:00',
            endTime: '2026-08-28 20:00:00',
            mode: 'SINGLE',
            maxSelections: 1,
            frequencyLimit: 'ONCE_TOTAL',
            requireAuth: true,
            options: []
          }
        ]
      },
      {
        id: 'ITEM-BEST-ACTRESS',
        title: '👑 最佳女演員 (最佳女主角)',
        description: '群芳爭妍，演技巔峰！投選你心目中的視后之冠。',
        coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        currentPhaseId: 'ACTRESS-P01',
        totalParticipants: 39650,
        totalVotes: 39650,
        phases: [
          {
            id: 'ACTRESS-P01',
            name: '決賽：四大熱門視后票選',
            status: 'ACTIVE',
            startTime: '2026-08-08 00:00:00',
            endTime: '2026-08-28 20:00:00',
            mode: 'SINGLE',
            maxSelections: 1,
            frequencyLimit: 'ONCE_TOTAL',
            requireAuth: true,
            options: [
              { id: 'ACTRESS-01', name: '佘詩曼 飾 文慧心 (Man姐)', initialVotes: 18000, votes: 21850, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80', description: '《新聞女王 2》霸氣回歸，眼神與氣場精準拿捏，職場大女主天花板！' },
              { id: 'ACTRESS-02', name: '宣萱 飾 董以晴', initialVotes: 11000, votes: 13420, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', description: '《巨塔之后》心臟外科權威，細膩演繹醫者仁心與權力博弈。' },
              { id: 'ACTRESS-03', name: '胡定欣 飾 鄧桂嬋 (七爺)', initialVotes: 4500, votes: 6180, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80', description: '《巾幗梟雄之懸崖》商界女強人，跌宕起伏演繹江湖傳奇。' },
              { id: 'ACTRESS-04', name: '李施嬅 飾 張家妍', initialVotes: 3200, votes: 4200, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', description: '《新聞女王 2》黑化轉變層次分明，演技大爆發備受好評。' }
            ]
          }
        ]
      },
      {
        id: 'ITEM-BEST-ACTOR',
        title: '🌟 最佳男演員 (最佳男主角)',
        description: '實力視帝巔峰對決！誰將榮登 2026 萬千星輝最佳男主角寶座？',
        coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        currentPhaseId: 'ACTOR-P01',
        totalParticipants: 35120,
        totalVotes: 35120,
        phases: [
          {
            id: 'ACTOR-P01',
            name: '決賽：四大熱門視帝票選',
            status: 'ACTIVE',
            startTime: '2026-08-08 00:00:00',
            endTime: '2026-08-28 20:00:00',
            mode: 'SINGLE',
            maxSelections: 1,
            frequencyLimit: 'ONCE_TOTAL',
            requireAuth: true,
            options: [
              { id: 'ACTOR-01', name: '黃宗澤 飾 關智軒', initialVotes: 14000, votes: 16900, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', description: '《反黑英雄 2》熱血警探，搏命動作與深情內心戲兼備。' },
              { id: 'ACTOR-02', name: '陳豪 飾 柯政綱', initialVotes: 12000, votes: 14350, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80', description: '《巨塔之后》院長權謀沉穩大氣，舉手投足盡顯戲骨風範。' },
              { id: 'ACTOR-03', name: '陳山聰 飾 彭穎傑', initialVotes: 4800, votes: 6120, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80', description: '《反黑英雄 2》硬核緝毒，層次感分明，演技精湛。' },
              { id: 'ACTOR-04', name: '黎耀祥 飾 柴十七', initialVotes: 3500, votes: 4750, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80', description: '《巾幗梟雄之懸崖》神機妙算智勇雙全，再創經典角色。' }
            ]
          }
        ]
      },
      {
        id: 'ITEM-BEST-HOST',
        title: '🎙️ 最佳女主持',
        description: '大方得體、執生一流！投選你最喜愛的 TVB 最佳女主持！',
        coverImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        currentPhaseId: 'HOST-P01',
        totalParticipants: 22400,
        totalVotes: 22400,
        phases: [
          {
            id: 'HOST-P01',
            name: '決賽：最佳女主持票選',
            status: 'ACTIVE',
            startTime: '2026-08-08 00:00:00',
            endTime: '2026-08-28 20:00:00',
            mode: 'SINGLE',
            maxSelections: 1,
            frequencyLimit: 'ONCE_TOTAL',
            requireAuth: true,
            options: [
              { id: 'HOST-01', name: '陳貝兒', initialVotes: 10500, votes: 12800, avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80', description: '《無窮之路 IV》深度主持感人至深，國際視野真誠流露。' },
              { id: 'HOST-02', name: '車婉婉', initialVotes: 6200, votes: 7450, avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80', description: '《中年好聲音 3》暖心陪伴參賽者，控場流暢情真意切。' },
              { id: 'HOST-03', name: '麥美恩', initialVotes: 3400, votes: 4120, avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80', description: '《獎門人感謝篇》搞笑幽默活力爆棚，綜藝氣氛擔當。' },
              { id: 'HOST-04', name: '陳庭欣', initialVotes: 1800, votes: 2030, avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80', description: '《東張西望》為民請命深入社區，專業親和深入民心。' }
            ]
          }
        ]
      },
      {
        id: 'ITEM-BEST-SONG',
        title: '🎵 最佳電視歌曲',
        description: '動人旋律，唱響劇迷回憶！投選本年度最深入民心的最佳電視歌曲！',
        coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        currentPhaseId: 'SONG-P01',
        totalParticipants: 28900,
        totalVotes: 28900,
        phases: [
          {
            id: 'SONG-P01',
            name: '決賽：最佳電視歌曲票選',
            status: 'ACTIVE',
            startTime: '2026-08-08 00:00:00',
            endTime: '2026-08-28 20:00:00',
            mode: 'SINGLE',
            maxSelections: 1,
            frequencyLimit: 'ONCE_TOTAL',
            requireAuth: true,
            options: [
              { id: 'SONG-01', name: '《Crystal Clear》- 炎明熹', initialVotes: 12000, votes: 14600, avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80', description: '《新聞女王 2》英文主題曲，空靈聲線演繹職場迷局。' },
              { id: 'SONG-02', name: '《無名英雄》- 周吉佩', initialVotes: 8500, votes: 10200, avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80', description: '《反黑英雄 2》熱血激昂主題曲，唱出正義男兒本色。' },
              { id: 'SONG-03', name: '《心跳回憶》- 谷婭溦', initialVotes: 5100, votes: 6800, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', description: '《巨塔之后》片尾曲，細膩唱腔觸動心靈深處。' },
              { id: 'OPT-S04', name: '《追夢同盟》- 吳業坤 & 戴祖儀', initialVotes: 3300, votes: 4250, avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80', description: '《職場風雲》輕快插曲，朗朗上口人氣爆棚。' }
            ]
          }
        ]
      }
    ],
    phases: [
      {
        id: 'PHASE-01',
        name: '初賽：40 進 20 淘汰賽',
        status: 'ENDED',
        startTime: '2026-08-01 00:00:00',
        endTime: '2026-08-07 23:59:59',
        mode: 'MULTIPLE',
        maxSelections: 3,
        frequencyLimit: 'ONCE_TOTAL',
        requireAuth: true,
        advanceRuleEnabled: true,
        advanceTopCount: 20,
        advanceTargetPhaseId: 'PHASE-02',
        options: [
          { id: 'OPT-01', name: '《新聞女王 2》', initialVotes: 20000, votes: 24500, avatar: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&auto=format&fit=crop&q=80', description: '原班人馬強勢回歸，SNK News 再掀職場新聞風雲！' },
          { id: 'OPT-02', name: '《反黑英雄 2》', initialVotes: 15000, votes: 19800, avatar: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80', description: '警匪槍戰巔峰對決，正邪交鋒熱血燃爆。' },
          { id: 'OPT-03', name: '《巨塔之后》', initialVotes: 11000, votes: 14200, avatar: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&fit=crop&q=80', description: '醫療豪門暗湧，權力與情感交織的頂級巨作。' },
          { id: 'OPT-04', name: '《法證先鋒 VI》', initialVotes: 8000, votes: 9920, avatar: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80', description: '科學搜證破奇案，經典IP全新升級。' }
        ]
      },
      {
        id: 'PHASE-02',
        name: '複賽：20 進 7 準決賽 (進行中)',
        status: 'ACTIVE',
        startTime: '2026-08-08 00:00:00',
        endTime: '2026-08-20 23:59:59',
        mode: 'SINGLE',
        maxSelections: 1,
        frequencyLimit: 'ONCE_TOTAL',
        requireAuth: true,
        advanceRuleEnabled: true,
        advanceTopCount: 7,
        advanceTargetPhaseId: 'PHASE-03',
        options: [
          { id: 'OPT-P2-01', name: '《新聞女王 2》', initialVotes: 10000, votes: 14850, avatar: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&auto=format&fit=crop&q=80', description: '文慧心強勢復出，女主播台前幕後激烈交鋒。' },
          { id: 'OPT-P2-02', name: '《巨塔之后》', initialVotes: 6000, votes: 9240, avatar: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&fit=crop&q=80', description: '宣萱攜手實力派演員，深沉刻畫醫療權力集團。' },
          { id: 'OPT-P2-03', name: '《反黑英雄 2》', initialVotes: 4000, votes: 5820, avatar: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80', description: '陳山聰、張振朗再度聯手，緝毒反黑硬核出擊。' },
          { id: 'OPT-P2-04', name: '《巾幗梟雄之懸崖》', initialVotes: 1800, votes: 2700, avatar: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=400&auto=format&fit=crop&q=80', description: '經典傳奇再現，亂世江湖中守護初心與大義。' }
        ]
      },
      {
        id: 'PHASE-03',
        name: '終極總決賽：7強爭冠',
        status: 'UPCOMING',
        startTime: '2026-08-21 00:00:00',
        endTime: '2026-08-28 20:00:00',
        mode: 'SINGLE',
        maxSelections: 1,
        frequencyLimit: 'ONCE_TOTAL',
        requireAuth: true,
        options: []
      }
    ]
  },
  {
    id: 'VOTE-CAMP-BEST-ACTRESS',
    title: '2026 TVB 萬千星輝頒獎典禮 • 最佳女演員 (最佳女主角)',
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    description: '群芳爭妍，演技巔峰！投選你心目中的視后之冠，誰能捧起本年度萬千星輝最佳女主角獎座？',
    resultVisibility: 'AFTER_VOTE',
    status: 'ACTIVE',
    currentPhaseId: 'ACTRESS-P01',
    totalParticipants: 39650,
    totalVotes: 39650,
    startTime: '2026-08-08 00:00:00',
    endTime: '2026-08-28 20:00:00',
    creator: '梁副總監 (製作部)',
    createdAt: '2026-08-08 09:00:00',
    updatedAt: '2026-08-28 17:00:00',
    phases: [
      {
        id: 'ACTRESS-P01',
        name: '決賽：四大熱門視后票選',
        status: 'ACTIVE',
        startTime: '2026-08-08 00:00:00',
        endTime: '2026-08-28 20:00:00',
        mode: 'SINGLE',
        maxSelections: 1,
        frequencyLimit: 'ONCE_TOTAL',
        requireAuth: true,
        options: [
          { id: 'ACTRESS-01', name: '佘詩曼 飾 文慧心 (Man姐)', initialVotes: 18000, votes: 21850, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80', description: '《新聞女王 2》霸氣回歸，眼神與氣場精準拿捏，職場大女主天花板！' },
          { id: 'ACTRESS-02', name: '宣萱 飾 董以晴', initialVotes: 11000, votes: 13420, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', description: '《巨塔之后》心臟外科權威，細膩演繹醫者仁心與權力博弈。' },
          { id: 'ACTRESS-03', name: '胡定欣 飾 鄧桂嬋 (七爺)', initialVotes: 4500, votes: 6180, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80', description: '《巾幗梟雄之懸崖》商界女強人，跌宕起伏演繹江湖傳奇。' },
          { id: 'ACTRESS-04', name: '李施嬅 飾 張家妍', initialVotes: 3200, votes: 4200, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', description: '《新聞女王 2》黑化轉變層次分明，演技大爆發備受好評。' }
        ]
      }
    ]
  },
  {
    id: 'VOTE-CAMP-BEST-ACTOR',
    title: '2026 TVB 萬千星輝頒獎典禮 • 最佳男演員 (最佳男主角)',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    description: '實力視帝巔峰對決！誰將榮登 2026 萬千星輝頒獎典禮最佳男主角寶座？立即投下關鍵一票！',
    resultVisibility: 'AFTER_VOTE',
    status: 'ACTIVE',
    currentPhaseId: 'ACTOR-P01',
    totalParticipants: 35120,
    totalVotes: 35120,
    startTime: '2026-08-08 00:00:00',
    endTime: '2026-08-28 20:00:00',
    creator: '梁副總監 (製作部)',
    createdAt: '2026-08-08 09:30:00',
    updatedAt: '2026-08-28 17:15:00',
    phases: [
      {
        id: 'ACTOR-P01',
        name: '決賽：四大熱門視帝票選',
        status: 'ACTIVE',
        startTime: '2026-08-08 00:00:00',
        endTime: '2026-08-28 20:00:00',
        mode: 'SINGLE',
        maxSelections: 1,
        frequencyLimit: 'ONCE_TOTAL',
        requireAuth: true,
        options: [
          { id: 'ACTOR-01', name: '黃宗澤 飾 關智軒', initialVotes: 14000, votes: 16900, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', description: '《反黑英雄 2》熱血警探，搏命動作與深情內心戲兼備。' },
          { id: 'ACTOR-02', name: '陳豪 飾 柯政綱', initialVotes: 12000, votes: 14350, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80', description: '《巨塔之后》院長權謀沉穩大氣，舉手投足盡顯戲骨風範。' },
          { id: 'ACTOR-03', name: '陳山聰 飾 彭穎傑', initialVotes: 4800, votes: 6120, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80', description: '《反黑英雄 2》硬核緝毒，層次感分明，演技精湛。' },
          { id: 'ACTOR-04', name: '黎耀祥 飾 柴十七', initialVotes: 3500, votes: 4750, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80', description: '《巾幗梟雄之懸崖》神機妙算智勇雙全，再創經典角色。' }
        ]
      }
    ]
  },
  {
    id: 'VOTE-CAMP-BEST-HOST',
    title: '2026 TVB 萬千星輝頒獎典禮 • 最佳女主持',
    coverImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop&q=80',
    description: '大方得體、執生一流！投選你最喜愛的 TVB 綜藝與資訊節目最佳女主持！',
    resultVisibility: 'AFTER_VOTE',
    status: 'ACTIVE',
    currentPhaseId: 'HOST-P01',
    totalParticipants: 22400,
    totalVotes: 22400,
    startTime: '2026-08-08 00:00:00',
    endTime: '2026-08-28 20:00:00',
    creator: '黃監製 (非戲劇製作)',
    createdAt: '2026-08-08 11:00:00',
    updatedAt: '2026-08-28 16:30:00',
    phases: [
      {
        id: 'HOST-P01',
        name: '決賽：最佳女主持票選',
        status: 'ACTIVE',
        startTime: '2026-08-08 00:00:00',
        endTime: '2026-08-28 20:00:00',
        mode: 'SINGLE',
        maxSelections: 1,
        frequencyLimit: 'ONCE_TOTAL',
        requireAuth: true,
        options: [
          { id: 'HOST-01', name: '陳貝兒', initialVotes: 10500, votes: 12800, avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80', description: '《無窮之路 IV》深度主持感人至深，國際視野真誠流露。' },
          { id: 'HOST-02', name: '車婉婉', initialVotes: 6200, votes: 7450, avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80', description: '《中年好聲音 3》暖心陪伴參賽者，控場流暢情真意切。' },
          { id: 'HOST-03', name: '麥美恩', initialVotes: 3400, votes: 4120, avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80', description: '《獎門人感謝篇》搞笑幽默活力爆棚，綜藝氣氛擔當。' },
          { id: 'HOST-04', name: '陳庭欣', initialVotes: 1800, votes: 2030, avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80', description: '《東張西望》為民請命深入社區，專業親和深入民心。' }
        ]
      }
    ]
  },
  {
    id: 'VOTE-CAMP-BEST-SONG',
    title: '2026 TVB 萬千星輝頒獎典禮 • 最佳電視歌曲',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    description: '動人旋律，唱響劇迷回憶！投選本年度最深入民心的最佳電視主題曲及片尾曲！',
    resultVisibility: 'AFTER_VOTE',
    status: 'ACTIVE',
    currentPhaseId: 'SONG-P01',
    totalParticipants: 28900,
    totalVotes: 28900,
    startTime: '2026-08-08 00:00:00',
    endTime: '2026-08-28 20:00:00',
    creator: '星夢娛樂音樂組',
    createdAt: '2026-08-08 11:30:00',
    updatedAt: '2026-08-28 17:30:00',
    phases: [
      {
        id: 'SONG-P01',
        name: '決賽：最佳電視歌曲票選',
        status: 'ACTIVE',
        startTime: '2026-08-08 00:00:00',
        endTime: '2026-08-28 20:00:00',
        mode: 'SINGLE',
        maxSelections: 1,
        frequencyLimit: 'ONCE_TOTAL',
        requireAuth: true,
        options: [
          { id: 'SONG-01', name: '《Crystal Clear》- 炎明熹', initialVotes: 12000, votes: 14600, avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80', description: '《新聞女王 2》英文主題曲，空靈聲線演繹職場迷局。' },
          { id: 'SONG-02', name: '《無名英雄》- 周吉佩', initialVotes: 8500, votes: 10200, avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80', description: '《反黑英雄 2》熱血激昂主題曲，唱出正義男兒本色。' },
          { id: 'SONG-03', name: '《雪落無聲》- 谷婭溦', initialVotes: 4800, votes: 5900, avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80', description: '《巨塔之后》深情片尾曲，旋律淒美直擊心靈。' },
          { id: 'SONG-04', name: '《相愛萬年》- 吳業坤 / 戴祖儀', initialVotes: 2600, votes: 3200, avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80', description: '《巾幗梟雄之懸崖》經典對唱插曲，亂世情懷餘音裊裊。' }
        ]
      }
    ]
  },
  {
    id: 'VOTE-CAMP-002',
    title: '電視城員工餐廳 2026 第三季「最受歡迎港式美食」評選',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    description: '民以食為天！行政及設施部為提升同仁用餐體驗，特舉辦本季美食票選活動，獲勝菜式將享有每日特價及常駐窗口供應！',
    resultVisibility: 'ALWAYS_PUBLIC',
    status: 'ACTIVE',
    currentPhaseId: 'P01-CANTEEN',
    totalParticipants: 1840,
    totalVotes: 1840,
    startTime: '2026-08-05 00:00:00',
    endTime: '2026-08-25 23:59:59',
    creator: '李思婷 (行政及設施部)',
    createdAt: '2026-08-05 14:20:00',
    updatedAt: '2026-08-29 09:20:00',
    phases: [
      {
        id: 'P01-CANTEEN',
        name: '全城熱選：心水菜式單選',
        status: 'ACTIVE',
        startTime: '2026-08-05 00:00:00',
        endTime: '2026-08-25 23:59:59',
        mode: 'SINGLE',
        maxSelections: 1,
        frequencyLimit: 'ONCE_TOTAL',
        requireAuth: true,
        options: [
          { id: 'CANT-01', name: '秘制深井脆皮燒鵝皇配絲苗飯', initialVotes: 500, votes: 780, avatar: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80', description: '皮脆肉嫩，秘制酸梅醬汁濃郁開胃！' },
          { id: 'CANT-02', name: '香港道地沙爹牛肉公仔麵配滑蛋多士', initialVotes: 300, votes: 530, avatar: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80', description: '濃郁花生沙爹香氣，配搭香脆黃金牛油多士。' },
          { id: 'CANT-03', name: '順德古法薑蔥生蠔煲', initialVotes: 200, votes: 340, avatar: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&auto=format&fit=crop&q=80', description: '肥厚生蠔佐以老薑青蔥爆炒，鑊氣十足。' },
          { id: 'CANT-04', name: '經典港式滑蛋蝦仁炒河粉', initialVotes: 100, votes: 190, avatar: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&auto=format&fit=crop&q=80', description: '鮮蝦爽口彈牙，蛋香滑嫩覆蓋寬河粉。' }
        ]
      }
    ]
  }
];

export const INITIAL_VOTE_ARTICLES: VoteArticle[] = [
  {
    id: 'ART-2026-001',
    title: '【熱爆專題】2026 萬千星輝頒獎典禮 20強激戰！即刻投選各大獎項心水',
    coverImage: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&auto=format&fit=crop&q=80',
    summary: '請為你喜歡的明星或電視劇投票！年度壓軸盛典《2026萬千星輝頒獎典禮》正式進入準決賽激戰階段！多部口碑旗艦劇與實力巨星同台爭霸，包括「最佳劇集」、「最佳女演員」、「最佳男演員」、「最佳女主持」及「最佳電視歌曲」，快來投下決定性的一票！',
    category: '年度盛典',
    author: 'TVB 娛樂新聞組',
    publishDate: '2026-08-11 12:00:00',
    status: 'PUBLISHED',
    viewCount: 15820,
    linkedCampaignIds: ['VOTE-CAMP-001', 'VOTE-CAMP-BEST-ACTRESS', 'VOTE-CAMP-BEST-ACTOR', 'VOTE-CAMP-BEST-HOST', 'VOTE-CAMP-BEST-SONG'],
    content: `[VOTE_ID: VOTE-CAMP-001]

[VOTE_ID: VOTE-CAMP-BEST-ACTRESS]

[VOTE_ID: VOTE-CAMP-BEST-ACTOR]

[VOTE_ID: VOTE-CAMP-BEST-HOST]

[VOTE_ID: VOTE-CAMP-BEST-SONG]

### 📋 全民投票規則須知
1. 每位合資格會員於各獎項限投 **1** 票。
2. 投票後即時解鎖最新即時得票走勢與各選項百分比。
3. 準決賽將於 **2026年8月28日 20:00** 截止計票，敬請把握時間踴躍投票！
`
  },
  {
    id: 'ART-2026-002',
    title: '【員工福利】電視城餐廳美食大升級！八月心水菜式你話事',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    summary: '為回饋全體員工辛勤付出，行政及設施部聯同餐廳大廚推出全新菜式票選，最高票菜式將享有專屬八五折優惠！',
    category: '福利生活',
    author: '行政及設施部',
    publishDate: '2026-08-09 10:30:00',
    status: 'PUBLISHED',
    viewCount: 4620,
    linkedCampaignIds: ['VOTE-CAMP-002'],
    content: `## 電視城餐廳八月份美食大改造

為營造更優質的員工餐飲環境，行政及設施部特別邀請星級主廚團隊研發四款經典與創新兼備的港式料理。

同仁只需透過 TVB GO 系統動動手指，即可為你心水的美味投下神聖一票：

[VOTE_ID: VOTE-CAMP-002]

期待全體同事的熱烈參與，共同打造更美味的電視城工作日常！
`
  }
];

