/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VotingCampaign, VoteArticle, VoteLogRecord } from '../types';

export const INITIAL_VOTING_CAMPAIGNS: VotingCampaign[] = [
  {
    id: 'CAMP-2026-001',
    title: '2026 萬千星輝最佳員工與藝員年度大獎',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    description: '年度電視城矚目焦點！全體同仁與觀眾共同票選年度最傑出幕前幕後同仁，見證榮耀時刻。本屆活動包含「最受歡迎男藝員」、「最受歡迎女藝員」、「最佳幕後製作團隊」等多個評選投票項目。',
    resultVisibility: 'AFTER_VOTE',
    status: 'ACTIVE',
    currentPhaseId: 'PHASE-02',
    totalParticipants: 38420,
    totalVotes: 115260,
    startTime: '2026-08-01 00:00:00',
    endTime: '2026-09-15 23:00:00',
    creator: '陳總監 (綜藝節目科)',
    createdAt: '2026-08-01 10:00:00',
    updatedAt: '2026-08-28 16:45:10',
    voteItems: [
      {
        id: 'ITEM-ACTOR',
        title: '🌟 最受歡迎男藝員評選',
        description: '表揚本年度表現最亮眼的男藝員與節目主持。',
        coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        status: 'ACTIVE',
        currentPhaseId: 'PHASE-02',
        totalParticipants: 38420,
        totalVotes: 115260,
        phases: [
          {
            id: 'PHASE-01',
            name: '40強初選淘汰賽',
            status: 'ENDED',
            startTime: '2026-08-01 00:00:00',
            endTime: '2026-08-15 23:59:59',
            mode: 'MULTIPLE',
            maxSelections: 5,
            frequencyLimit: 'ONCE_DAILY',
            requireAuth: true,
            options: [
              { id: 'OPT-P1-01', name: '01號 - 陳豪 (Moses Chan)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', description: '《企業強人》精湛演出，深受全港觀眾與台前幕後喜愛。', initialVotes: 1200, votes: 15480 },
              { id: 'OPT-P1-02', name: '02號 - 佘詩曼 (Charmaine Sheh)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', description: '《新聞女王2》氣場全開，專業演繹再創收視與口碑巔峰。', initialVotes: 1500, votes: 19820 },
              { id: 'OPT-P1-03', name: '03號 - 馬國明 (Kenneth Ma)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', description: '親和力滿分，敬業樂業，連續多年觀眾票選人氣前茅。', initialVotes: 980, votes: 12450 },
              { id: 'OPT-P1-04', name: '04號 - 李佳芯 (Ali Lee)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', description: '自然清新演技與親民形象，主持戲劇雙線發展出色。', initialVotes: 850, votes: 11200 },
              { id: 'OPT-P1-05', name: '05號 - 王浩信 (Vincent Wong)', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80', description: '實力派視帝，不斷突破角色界限，挑戰高難度動作與文戲。', initialVotes: 650, votes: 8900 },
            ]
          },
          {
            id: 'PHASE-02',
            name: '20強進7 晉級賽',
            status: 'ACTIVE',
            startTime: '2026-08-16 00:00:00',
            endTime: '2026-09-10 23:59:59',
            mode: 'MULTIPLE',
            maxSelections: 3,
            frequencyLimit: 'ONCE_DAILY',
            requireAuth: true,
            options: [
              { id: 'OPT-P2-01', name: '01號 - 陳豪 (Moses Chan)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', description: '《企業強人》精湛演出，角逐年度最受歡迎男藝員。', initialVotes: 2500, votes: 8420 },
              { id: 'OPT-P2-02', name: '02號 - 佘詩曼 (Charmaine Sheh)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', description: '《新聞女王2》強勢回歸，全城熱話角色。', initialVotes: 3200, votes: 12650 },
              { id: 'OPT-P2-03', name: '03號 - 馬國明 (Kenneth Ma)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', description: '穩健發揮，暖男形象深植人心，口碑極佳。', initialVotes: 1800, votes: 6890 },
              { id: 'OPT-P2-04', name: '04號 - 李佳芯 (Ali Lee)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', description: '多元綜藝與實力劇集雙豐收，全民票選大熱。', initialVotes: 2100, votes: 7340 },
              { id: 'OPT-P2-05', name: '05號 - 林家謙 (Terence Lam)', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80', description: '年度原創主題曲創作人，卓越音樂貢獻。', initialVotes: 1600, votes: 5120 },
              { id: 'OPT-P2-06', name: '06號 - 炎明熹 (Gigi Yim)', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80', description: '新生代實力唱將，唱腔動人，舞台表現力亮眼。', initialVotes: 2900, votes: 9860 }
            ]
          },
          {
            id: 'PHASE-03',
            name: '年度總決賽 巔峰對決',
            status: 'UPCOMING',
            startTime: '2026-09-15 20:00:00',
            endTime: '2026-09-15 23:00:00',
            mode: 'SINGLE',
            maxSelections: 1,
            frequencyLimit: 'ONCE_TOTAL',
            requireAuth: true,
            options: [
              { id: 'OPT-P3-01', name: '決賽入圍者待定 01', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80', description: '20進7 晉級賽結算後自動入列。', initialVotes: 0, votes: 0 },
              { id: 'OPT-P3-02', name: '決賽入圍者待定 02', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80', description: '20進7 晉級賽結算後自動入列。', initialVotes: 0, votes: 0 },
            ]
          }
        ]
      },
      {
        id: 'ITEM-ACTRESS',
        title: '👑 最受歡迎女藝員評選',
        description: '表揚本年度表現最傑出的女藝員與當紅花旦。',
        coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        status: 'ACTIVE',
        currentPhaseId: 'ACTRESS-P01',
        totalParticipants: 32000,
        totalVotes: 32000,
        phases: [
          {
            id: 'ACTRESS-P01',
            name: '決賽階段',
            status: 'ACTIVE',
            startTime: '2026-08-16 00:00:00',
            endTime: '2026-09-15 23:00:00',
            mode: 'SINGLE',
            maxSelections: 1,
            frequencyLimit: 'ONCE_TOTAL',
            requireAuth: true,
            options: [
              { id: 'OPT-ACT-01', name: '佘詩曼 (Charmaine Sheh)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', description: '《新聞女王2》氣場全開，大獲好評。', initialVotes: 12000, votes: 15800 },
              { id: 'OPT-ACT-02', name: '宣萱 (Jessica Hsuan)', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', description: '《巨塔之后》心臟外科權威。', initialVotes: 8500, votes: 10400 },
              { id: 'OPT-ACT-03', name: '李佳芯 (Ali Lee)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', description: '自然親和，國民度極高。', initialVotes: 4800, votes: 5800 }
            ]
          }
        ]
      }
    ],
    phases: [
      {
        id: 'PHASE-01',
        name: '40強初選淘汰賽',
        status: 'ENDED',
        startTime: '2026-08-01 00:00:00',
        endTime: '2026-08-15 23:59:59',
        mode: 'MULTIPLE',
        maxSelections: 5,
        frequencyLimit: 'ONCE_DAILY',
        requireAuth: true,
        options: [
          { id: 'OPT-P1-01', name: '01號 - 陳豪 (Moses Chan)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', description: '《企業強人》精湛演出，深受全港觀眾與台前幕後喜愛。', initialVotes: 1200, votes: 15480 },
          { id: 'OPT-P1-02', name: '02號 - 佘詩曼 (Charmaine Sheh)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', description: '《新聞女王2》氣場全開，專業演繹再創收視與口碑巔峰。', initialVotes: 1500, votes: 19820 },
          { id: 'OPT-P1-03', name: '03號 - 馬國明 (Kenneth Ma)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', description: '親和力滿分，敬業樂業，連續多年觀眾票選人氣前茅。', initialVotes: 980, votes: 12450 },
          { id: 'OPT-P1-04', name: '04號 - 李佳芯 (Ali Lee)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', description: '自然清新演技與親民形象，主持戲劇雙線發展出色。', initialVotes: 850, votes: 11200 },
          { id: 'OPT-P1-05', name: '05號 - 王浩信 (Vincent Wong)', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80', description: '實力派視帝，不斷突破角色界限，挑戰高難度動作與文戲。', initialVotes: 650, votes: 8900 },
        ]
      },
      {
        id: 'PHASE-02',
        name: '20強進7 晉級賽',
        status: 'ACTIVE',
        startTime: '2026-08-16 00:00:00',
        endTime: '2026-09-10 23:59:59',
        mode: 'MULTIPLE',
        maxSelections: 3,
        frequencyLimit: 'ONCE_DAILY',
        requireAuth: true,
        options: [
          { id: 'OPT-P2-01', name: '01號 - 陳豪 (Moses Chan)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', description: '《企業強人》精湛演出，角逐年度最受歡迎男藝員。', initialVotes: 2500, votes: 8420 },
          { id: 'OPT-P2-02', name: '02號 - 佘詩曼 (Charmaine Sheh)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', description: '《新聞女王2》強勢回歸，全城熱話角色。', initialVotes: 3200, votes: 12650 },
          { id: 'OPT-P2-03', name: '03號 - 馬國明 (Kenneth Ma)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', description: '穩健發揮，暖男形象深植人心，口碑極佳。', initialVotes: 1800, votes: 6890 },
          { id: 'OPT-P2-04', name: '04號 - 李佳芯 (Ali Lee)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', description: '多元綜藝與實力劇集雙豐收，全民票選大熱。', initialVotes: 2100, votes: 7340 },
          { id: 'OPT-P2-05', name: '05號 - 林家謙 (Terence Lam)', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80', description: '年度原創主題曲創作人，卓越音樂貢獻。', initialVotes: 1600, votes: 5120 },
          { id: 'OPT-P2-06', name: '06號 - 炎明熹 (Gigi Yim)', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80', description: '新生代實力唱將，唱腔動人，舞台表現力亮眼。', initialVotes: 2900, votes: 9860 }
        ]
      },
      {
        id: 'PHASE-03',
        name: '年度總決賽 巔峰對決',
        status: 'UPCOMING',
        startTime: '2026-09-15 20:00:00',
        endTime: '2026-09-15 23:00:00',
        mode: 'SINGLE',
        maxSelections: 1,
        frequencyLimit: 'ONCE_TOTAL',
        requireAuth: true,
        options: [
          { id: 'OPT-P3-01', name: '決賽入圍者待定 01', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80', description: '20進7 晉級賽結算後自動入列。', initialVotes: 0, votes: 0 },
          { id: 'OPT-P3-02', name: '決賽入圍者待定 02', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80', description: '20進7 晉級賽結算後自動入列。', initialVotes: 0, votes: 0 },
        ]
      }
    ]
  },
  {
    id: 'CAMP-2026-002',
    title: '2026 電視城最佳幕後創意節目策劃大獎',
    coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    description: '表揚幕後策劃團隊的無窮創意！為您最喜愛的劇集與綜藝製作幕後團隊投下神聖一票。',
    resultVisibility: 'ALWAYS_PUBLIC',
    status: 'ACTIVE',
    currentPhaseId: 'PHASE-BG-01',
    totalParticipants: 12580,
    totalVotes: 12580,
    startTime: '2026-08-10 00:00:00',
    endTime: '2026-09-01 23:59:59',
    creator: '李思婷 (互動研發處)',
    createdAt: '2026-08-10 14:00:00',
    updatedAt: '2026-08-29 09:20:00',
    phases: [
      {
        id: 'PHASE-BG-01',
        name: '全民決選階段',
        status: 'ACTIVE',
        startTime: '2026-08-10 00:00:00',
        endTime: '2026-09-01 23:59:59',
        mode: 'SINGLE',
        maxSelections: 1,
        frequencyLimit: 'ONCE_TOTAL',
        requireAuth: true,
        options: [
          { id: 'OPT-BG-01', name: '《新聞女王2》編劇與監製團隊', avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80', description: '緊湊劇情架構與職場金句，引發全網現象級討論。', initialVotes: 500, votes: 5420 },
          { id: 'OPT-BG-02', name: '《聲夢傳奇3》音樂製作與舞台指導組', avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80', description: '打造頂級聲光電舞台，挖掘新一代歌唱巨星。', initialVotes: 300, votes: 3890 },
          { id: 'OPT-BG-03', name: '《中年好聲音3》導演組', avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=300&q=80', description: '感動無數家庭的情感編排與熱血追夢舞台。', initialVotes: 400, votes: 3270 },
        ]
      }
    ]
  },
  {
    id: 'CAMP-2026-003',
    title: '2026 香港小姐競選 最上鏡小姐與全民人氣后',
    coverImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=80',
    description: '美麗與智慧並重！誠邀全港市民見證港姐誕生，即時為佳麗投票打氣，支持心目中的香港小姐。',
    resultVisibility: 'AFTER_CAMPAIGN_END',
    status: 'UPCOMING',
    currentPhaseId: 'PHASE-HKM-01',
    totalParticipants: 0,
    totalVotes: 0,
    startTime: '2026-09-05 12:00:00',
    endTime: '2026-09-20 22:30:00',
    creator: '黃志偉 (大型節目組)',
    createdAt: '2026-08-25 11:30:00',
    updatedAt: '2026-08-30 14:15:00',
    phases: [
      {
        id: 'PHASE-HKM-01',
        name: '準決賽 全民人氣榜',
        status: 'UPCOMING',
        startTime: '2026-09-05 12:00:00',
        endTime: '2026-09-20 22:30:00',
        mode: 'MULTIPLE',
        maxSelections: 3,
        frequencyLimit: 'ONCE_DAILY',
        requireAuth: true,
        options: [
          { id: 'OPT-HKM-01', name: '01號佳麗 - 梁雅慧 (Victoria Leung)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', description: '香港大學法律系碩士，精通多國語言，談吐優雅。', initialVotes: 0, votes: 0 },
          { id: 'OPT-HKM-02', name: '02號佳麗 - 張穎恩 (Chloe Cheung)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', description: '專業舞蹈編導，舞台魅力非凡，笑容甜美。', initialVotes: 0, votes: 0 },
          { id: 'OPT-HKM-03', name: '03號佳麗 - 鄧曉琳 (Sharon Tang)', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80', description: '國際環保公益倡導者，陽光活力，自信滿溢。', initialVotes: 0, votes: 0 }
        ]
      }
    ]
  }
];

export const INITIAL_VOTE_LOGS: VoteLogRecord[] = [
  {
    id: 'VLOG-20260829-0001',
    campaignId: 'CAMP-2026-001',
    campaignTitle: '2026 萬千星輝最佳員工與藝員年度大獎',
    phaseId: 'PHASE-02',
    phaseName: '20強進7 晉級賽',
    voterId: 'USR-892104',
    voterName: 'Karen Lau (劉嘉玲)',
    voterPhone: '+852 9***-1829',
    voterDevice: 'iOS App (TVB GO v4.2)',
    voterIp: '203.145.92.104',
    authType: 'TVB_GO_MEMBER',
    selectedOptionIds: ['OPT-P2-01', 'OPT-P2-02', 'OPT-P2-06'],
    selectedOptionNames: ['01號 - 陳豪', '02號 - 佘詩曼', '06號 - 炎明熹'],
    votedAt: '2026-08-29 14:28:35',
    status: 'VALID'
  },
  {
    id: 'VLOG-20260829-0002',
    campaignId: 'CAMP-2026-001',
    campaignTitle: '2026 萬千星輝最佳員工與藝員年度大獎',
    phaseId: 'PHASE-02',
    phaseName: '20強進7 晉級賽',
    voterId: 'USR-773821',
    voterName: 'David Wong (黃志豪)',
    voterPhone: '+852 6***-8921',
    voterDevice: 'Android App (TVB GO v4.2)',
    voterIp: '14.198.220.15',
    authType: 'TVB_GO_MEMBER',
    selectedOptionIds: ['OPT-P2-02', 'OPT-P2-03'],
    selectedOptionNames: ['02號 - 佘詩曼', '03號 - 馬國明'],
    votedAt: '2026-08-29 14:25:12',
    status: 'VALID'
  },
  {
    id: 'VLOG-20260829-0003',
    campaignId: 'CAMP-2026-001',
    campaignTitle: '2026 萬千星輝最佳員工與藝員年度大獎',
    phaseId: 'PHASE-02',
    phaseName: '20強進7 晉級賽',
    voterId: 'EMP-90214',
    voterName: '張偉強 (工程部)',
    voterPhone: '+852 9***-3342',
    voterDevice: 'Web Browser (Chrome/macOS)',
    voterIp: '192.168.10.88 (Intranet)',
    authType: 'STAFF_SSO',
    selectedOptionIds: ['OPT-P2-01'],
    selectedOptionNames: ['01號 - 陳豪'],
    votedAt: '2026-08-29 14:18:50',
    status: 'VALID'
  },
  {
    id: 'VLOG-20260829-0004',
    campaignId: 'CAMP-2026-001',
    campaignTitle: '2026 萬千星輝最佳員工與藝員年度大獎',
    phaseId: 'PHASE-02',
    phaseName: '20強進7 晉級賽',
    voterId: 'USR-481920',
    voterName: 'Chloe Chan (陳穎琳)',
    voterPhone: '+852 5***-6671',
    voterDevice: 'iOS App (TVB GO v4.2)',
    voterIp: '183.178.50.211',
    authType: 'SMS_VERIFIED',
    selectedOptionIds: ['OPT-P2-04', 'OPT-P2-06'],
    selectedOptionNames: ['04號 - 李佳芯', '06號 - 炎明熹'],
    votedAt: '2026-08-29 14:05:22',
    status: 'VALID'
  },
  {
    id: 'VLOG-20260829-0005',
    campaignId: 'CAMP-2026-002',
    campaignTitle: '2026 電視城最佳幕後創意節目策劃大獎',
    phaseId: 'PHASE-BG-01',
    phaseName: '全民決選階段',
    voterId: 'USR-619283',
    voterName: 'Raymond Ho (何文輝)',
    voterPhone: '+852 6***-4421',
    voterDevice: 'Web Browser (Safari/iOS)',
    voterIp: '119.237.18.90',
    authType: 'TVB_GO_MEMBER',
    selectedOptionIds: ['OPT-BG-01'],
    selectedOptionNames: ['《新聞女王2》編劇與監製團隊'],
    votedAt: '2026-08-29 13:52:10',
    status: 'VALID'
  },
  {
    id: 'VLOG-20260829-0006',
    campaignId: 'CAMP-2026-001',
    campaignTitle: '2026 萬千星輝最佳員工與藝員年度大獎',
    phaseId: 'PHASE-01',
    phaseName: '40強初選淘汰賽',
    voterId: 'USR-102938',
    voterName: 'Peggy Tse (謝敏儀)',
    voterPhone: '+852 9***-7712',
    voterDevice: 'Android App (TVB GO v4.1)',
    voterIp: '58.152.44.81',
    authType: 'TVB_GO_MEMBER',
    selectedOptionIds: ['OPT-P1-02', 'OPT-P1-03', 'OPT-P1-05'],
    selectedOptionNames: ['02號 - 佘詩曼', '03號 - 馬國明', '05號 - 王浩信'],
    votedAt: '2026-08-14 21:10:04',
    status: 'VALID'
  },
  {
    id: 'VLOG-20260829-0007',
    campaignId: 'CAMP-2026-001',
    campaignTitle: '2026 萬千星輝最佳員工與藝員年度大獎',
    phaseId: 'PHASE-02',
    phaseName: '20強進7 晉級賽',
    voterId: 'USR-BOT-9921',
    voterName: '訪客用戶 (異常請求)',
    voterPhone: '未綁定',
    voterDevice: 'Web Scraper / Automated Tool',
    voterIp: '45.132.18.2',
    authType: 'GUEST_DEVICE',
    selectedOptionIds: ['OPT-P2-05'],
    selectedOptionNames: ['05號 - 林家謙'],
    votedAt: '2026-08-29 03:12:00',
    status: 'ABNORMAL_INTERCEPTED'
  }
];

export const INITIAL_VOTE_ARTICLES: VoteArticle[] = [
  {
    id: 'ART-2026-001',
    title: '【年度盛事】2026 萬千星輝大獎 20進7 晉級賽正式打響！立即投票支持您的最愛',
    category: '焦點專題',
    author: 'TVB GO 互動編輯組',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    summary: '年度全城矚目的萬千星輝年度票選進入白熱化階段！多位實力派台前幕後同仁角逐榮譽，投票即日起全面開放，立即參與互動。',
    content: `一年一度的電視城年度盛典正式進入白熱化階段！經過第一輪「40強初選淘汰賽」超過十萬票的熱烈角逐，備受矚目的 20 強候選人已正式誕生！

本輪「20進7 晉級賽」自即日起至 9 月 10 日截止，每位 TVB GO 會員每日均可投下寶貴的 3 票。快為你心目中最具代表性的優秀藝員加油打氣！

[VOTE_ID: CAMP-2026-001]

除了最佳藝員大獎外，今年大會特別增設「最佳幕後創意節目策劃大獎」，向一眾默默耕耘、創造高收視口碑奇蹟的編導與製作團隊致敬。歡迎全體員工與觀眾一同參與單選投票：

[VOTE_ID: CAMP-2026-002]

感謝大家對 TVB 電視節目的熱愛與支持，更多後台花絮與賽況追蹤，請持續鎖定 TVB GO 官方資訊。`,
    linkedCampaignIds: ['CAMP-2026-001', 'CAMP-2026-002'],
    status: 'PUBLISHED',
    publishDate: '2026-08-20 12:00:00',
    viewCount: 68520
  },
  {
    id: 'ART-2026-002',
    title: '【幕後特輯】向默默耕耘的創作者致敬：2026 最佳幕後創意節目大獎全解析',
    category: '幕後花絮',
    author: '電視城特派記者',
    coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    summary: '好劇集的背後離不開精雕細琢的劇本與創新導播，走進本屆入圍團隊的幕後創作故事。',
    content: `一部深入人心的經典劇集或綜藝節目，背後凝聚著數百位編劇、導演、剪輯、道具、燈光及音響工程師的心血。

本屆「最佳幕後創意節目策劃大獎」競爭空前激烈，包括引發全網熱烈探討的《新聞女王2》編劇團隊、刷新大型音樂選秀標準的《聲夢傳奇3》製作組，以及引發全民共鳴的《中年好聲音3》。

[VOTE_ID: CAMP-2026-002]

投出您關鍵的一票，向所有為好內容全力以赴的幕後同仁致敬！`,
    linkedCampaignIds: ['CAMP-2026-002'],
    status: 'PUBLISHED',
    publishDate: '2026-08-22 15:30:00',
    viewCount: 24310
  }
];
