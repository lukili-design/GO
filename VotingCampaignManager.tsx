/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Activity, VotingCampaign, VoteItem, VotePhase, VoteOption, VoteResultVisibility, 
  VoteCampaignStatus, VoteSelectionMode, VoteFrequencyLimit, VoteLogRecord,
  VoteSubmissionMode
} from '../../types';
import { INITIAL_VOTE_LOGS } from '../../data/voteMockData';
import { getCampaignVoteItems, syncCampaignFromVoteItems, calculatePhaseAutoStatus } from '../../utils/votingHelpers';
import { 
  Search, Plus, Edit3, BarChart2, Trash2, CheckCircle2, 
  Calendar, Layers, Clock, ShieldCheck, ChevronDown, ChevronUp, 
  Sparkles, Image as ImageIcon, Check, Copy, AlertCircle, ArrowLeft,
  Users, Award, HelpCircle, Eye, Sliders, X, Upload, RefreshCw, Lock, Vote,
  FileSpreadsheet, Download, Filter, User, Smartphone, Laptop, Globe,
  CalendarCheck, ArrowUpDown, CheckCircle, AlertTriangle, TrendingUp, PieChart,
  ListOrdered, ExternalLink, Tag, Grid, Columns, LayoutGrid, CheckSquare,
  Square, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, FileText, Settings2,
  Sparkle, Move, CheckCheck, ChevronRight
} from 'lucide-react';

// 🌟 經典大型活動 20~30 投票組件預設模板 (供管理員一鍵快速生成)
export const VOTE_ITEM_BATCH_PRESETS: { [key: string]: { name: string; icon: string; desc: string; items: string[] } } = {
  TVB_AWARDS_20: {
    name: '🏆 TVB 萬千星輝頒獎典禮 (20大核心榮譽獎項)',
    icon: '🏆',
    desc: '包含最佳劇集、最佳男女主角、最受歡迎男女角色、最佳男女配角等 20 個經典獎項',
    items: [
      '最佳劇集',
      '最佳男主角',
      '最佳女主角',
      '最受歡迎電視男角色',
      '最受歡迎電視女角色',
      '最佳男配角',
      '最佳女配角',
      '飛躍進步男藝員',
      '飛躍進步女藝員',
      '最佳綜藝節目',
      '最佳資訊及專題節目',
      '最受歡迎電視歌曲',
      '最上鏡小姐',
      '友誼小姐',
      '最佳電視節目主持',
      '最佳劇集主題曲',
      '萬千光輝演藝大獎',
      '大灣區最受歡迎男藝員',
      '大灣區最受歡迎女藝員',
      '大灣區最受歡迎綜藝節目'
    ]
  },
  MUSIC_AWARDS_12: {
    name: '🎵 勁歌金曲 / 年度音樂盛典 (12大評選獎項)',
    icon: '🎵',
    desc: '包含金曲金獎、男女歌星、樂隊、填詞、作曲、新人和年度唱片等 12 個評選項目',
    items: [
      '勁歌金曲金獎',
      '最受歡迎男歌星',
      '最受歡迎女歌星',
      '最佳樂隊 / 組合',
      '最佳填詞',
      '最佳作曲',
      '最佳編曲',
      '最佳監製',
      '最受歡迎新人獎',
      '年度最佳唱片',
      '最佳合唱歌曲',
      '樂壇至尊卓越成就獎'
    ]
  },
  EMPLOYEE_AWARDS_10: {
    name: '🎖️ 年度優秀員工與團隊 (10大表彰項目)',
    icon: '🎖️',
    desc: '包含傑出員工、創新團隊、服務之星、技術突破等 10 大表彰項目',
    items: [
      '年度傑出員工金獎',
      '最佳創新先鋒團隊',
      '卓越客戶服務之星',
      '核心技術突破獎',
      '卓越領導力獎',
      '年度明日之星',
      '最佳協同合作團隊',
      '幕後英雄奉獻獎',
      '最佳業務拓展獎',
      '年度終身榮譽獎'
    ]
  },
  VARIETY_AWARDS_8: {
    name: '🎭 綜藝選秀與人氣決選 (8大項目)',
    icon: '🎭',
    desc: '包含年度總冠軍、最佳舞台、最具人氣、最佳才藝等 8 大評選項目',
    items: [
      '年度總冠軍 (金獎)',
      '最佳舞台表現獎',
      '最具人氣偶像獎',
      '最佳才藝突破獎',
      '最受評審青睞獎',
      '最具潛力新星獎',
      '最佳造型風采獎',
      '現場觀眾票選大獎'
    ]
  }
};

interface VotingCampaignManagerProps {
  report?: { campaign: VotingCampaign; logs: VoteLogRecord[]; mode: 'STATS' | 'DETAILS'; onClose: () => void };
  campaigns: VotingCampaign[];
  activities?: Activity[];
  onSaveCampaign: (campaign: VotingCampaign) => void;
  onDeleteCampaign: (campaignId: string) => void;
  triggerSound: (freq: number, type: OscillatorType, duration: number) => void;
}

export const VotingCampaignManager: React.FC<VotingCampaignManagerProps> = ({
  campaigns,
  report,
  activities = [],
  onSaveCampaign,
  onDeleteCampaign,
  triggerSound
}) => {
  // Mode: 'LIST' (活動總列表) | 'WORKFLOW' (三步流程：生成活動 -> 投票管理/列表 -> 每個投票的編輯頁面)
  const [viewMode, setViewMode] = useState<'LIST' | 'WORKFLOW'>('LIST');

  // 🌟 3 步核心流程步驟：
  // 1: 'GENERATE_CAMPAIGN' - 首先是生成活動
  // 2: 'VOTE_LIST' - 然後是投票管理 (有個投票列表)
  // 3: 'VOTE_ITEM_EDIT' - 最後再是每個投票的編輯頁面
  const [workflowStep, setWorkflowStep] = useState<'GENERATE_CAMPAIGN' | 'VOTE_LIST' | 'VOTE_ITEM_EDIT'>('GENERATE_CAMPAIGN');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | VoteCampaignStatus>('ALL');

  // Selected campaign for viewing Overall Statistics Modal
  const [statsCampaign, setStatsCampaign] = useState<VotingCampaign | null>(report?.mode === 'STATS' ? report.campaign : null);
  const [statsActiveVoteItemTab, setStatsActiveVoteItemTab] = useState<string>('ALL');
  const [statsActivePhaseTab, setStatsActivePhaseTab] = useState<string>('ALL');

  // Selected campaign for viewing Detail Logs Modal
  const [detailLogsCampaign, setDetailLogsCampaign] = useState<VotingCampaign | null>(report?.mode === 'DETAILS' ? report.campaign : null);
  const [detailSearchTerm, setDetailSearchTerm] = useState('');
  const [detailVoteItemFilter, setDetailVoteItemFilter] = useState('ALL');
  const [detailPhaseFilter, setDetailPhaseFilter] = useState('ALL');
  const [detailStatusFilter, setDetailStatusFilter] = useState('ALL');
  const [detailAuthFilter, setDetailAuthFilter] = useState('ALL');

  // Stored Vote Logs state (Mock repository for audit inspection)
  const [voteLogs, setVoteLogs] = useState<VoteLogRecord[]>(() => {
    if (report) return report.logs;
    try {
      const saved = localStorage.getItem('tvb_voting_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_VOTE_LOGS;
  });

  useEffect(() => {
    if (report && !statsCampaign && !detailLogsCampaign) report.onClose();
  }, [report, statsCampaign, detailLogsCampaign]);

  // Form Editing State
  const [editingCampaign, setEditingCampaign] = useState<VotingCampaign | null>(null);
  const [activeVoteItemIndex, setActiveVoteItemIndex] = useState<number>(0);
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [advanceSuccessMessage, setAdvanceSuccessMessage] = useState<string | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const voteItemCoverInputRef = useRef<HTMLInputElement>(null);

  // 🌟 二三十個投票組件專屬高效交互狀態
  const [voteItemLayoutMode, setVoteItemLayoutMode] = useState<'SPLIT' | 'GRID' | 'TABS'>('SPLIT');
  const [voteItemSearchQuery, setVoteItemSearchQuery] = useState('');
  const [voteItemStatusFilter, setVoteItemStatusFilter] = useState<'ALL' | VoteCampaignStatus>('ALL');

  // 批量創建組件彈出視窗狀態
  const [showBatchAddModal, setShowBatchAddModal] = useState(false);
  const [batchAddText, setBatchAddText] = useState('');
  const [batchAddPreset, setBatchAddPreset] = useState<string>('TVB_AWARDS_20');
  const [batchAddPhasesCount, setBatchAddPhasesCount] = useState<number>(1);
  const [batchAddMode, setBatchAddMode] = useState<VoteSelectionMode>('SINGLE');
  const [batchAddMaxSelections, setBatchAddMaxSelections] = useState<number>(1);

  // 批量選中與批量操作狀態
  const [isBatchSelectMode, setIsBatchSelectMode] = useState(false);
  const [selectedVoteItemIndices, setSelectedVoteItemIndices] = useState<number[]>([]);

  // 順序調整抽屜/視窗狀態
  const [showReorderModal, setShowReorderModal] = useState(false);

  // 批量添加候選人彈出視窗狀態
  const [showBatchAddOptionsModal, setShowBatchAddOptionsModal] = useState(false);
  const [batchAddOptionsText, setBatchAddOptionsText] = useState('');

  // 🌟 依據活動階段時間自動推算活動整體狀態 (ACTIVE / UPCOMING / ENDED)
  const calculateAutoCampaignStatus = (phases: VotePhase[]): VoteCampaignStatus => {
    if (!phases || phases.length === 0) return 'UPCOMING';
    const now = new Date().getTime();

    let hasActive = false;
    let allEnded = true;
    let allUpcoming = true;

    for (const p of phases) {
      const start = new Date(p.startTime.replace(' ', 'T')).getTime();
      const end = new Date(p.endTime.replace(' ', 'T')).getTime();

      if (!isNaN(start) && !isNaN(end)) {
        if (now >= start && now <= end) {
          hasActive = true;
          allEnded = false;
          allUpcoming = false;
        } else if (now < start) {
          allEnded = false;
        } else if (now > end) {
          allUpcoming = false;
        }
      }
    }

    if (hasActive) return 'ACTIVE';
    if (allEnded) return 'ENDED';
    if (allUpcoming) return 'UPCOMING';
    return 'ACTIVE';
  };

  // 自動推算活動的最早開始時間與最晚結束時間
  const getCalculatedCampaignTimeRange = (phases: VotePhase[]) => {
    if (!phases || phases.length === 0) {
      return { start: '2026-08-01 00:00:00', end: '2026-09-30 23:59:59' };
    }
    const starts = phases.map(p => p.startTime).filter(Boolean).sort();
    const ends = phases.map(p => p.endTime).filter(Boolean).sort();
    return {
      start: starts[0] || '2026-08-01 00:00:00',
      end: ends[ends.length - 1] || '2026-09-30 23:59:59'
    };
  };

  // 處理活動封面手動圖片上傳
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCampaign) return;

    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片格式檔案 (JPG, PNG, WebP)！');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setEditingCampaign({
          ...editingCampaign,
          coverImage: event.target.result
        });
        triggerSound(800, 'sine', 0.1);
      }
    };
    reader.readAsDataURL(file);
  };

  // 🌟 處理投票項目專屬封面圖片手動上傳
  const handleVoteItemCoverUpload = (voteItemIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCampaign) return;

    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片格式檔案 (JPG, PNG, WebP)！');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        const items = getCampaignVoteItems(editingCampaign);
        if (items[voteItemIdx]) {
          items[voteItemIdx].coverImage = event.target.result;
          const updated = syncCampaignFromVoteItems({ ...editingCampaign, voteItems: items });
          setEditingCampaign(updated);
          triggerSound(800, 'sine', 0.1);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // 🌟 處理選項圖片手動上傳
  const handleOptionImageUpload = (voteItemIdx: number, phaseIdx: number, optIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCampaign) return;

    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片格式檔案 (JPG, PNG, WebP)！');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        const items = getCampaignVoteItems(editingCampaign);
        if (items[voteItemIdx]?.phases[phaseIdx]?.options[optIdx]) {
          items[voteItemIdx].phases[phaseIdx].options[optIdx].avatar = event.target.result;
          const updated = syncCampaignFromVoteItems({ ...editingCampaign, voteItems: items });
          setEditingCampaign(updated);
          triggerSound(850, 'sine', 0.1);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // 移除選項圖片
  const handleRemoveOptionImage = (voteItemIdx: number, phaseIdx: number, optIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingCampaign) return;
    const items = getCampaignVoteItems(editingCampaign);
    if (items[voteItemIdx]?.phases[phaseIdx]?.options[optIdx]) {
      items[voteItemIdx].phases[phaseIdx].options[optIdx].avatar = '';
      const updated = syncCampaignFromVoteItems({ ...editingCampaign, voteItems: items });
      setEditingCampaign(updated);
    }
  };

  // Filtered Campaign List
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.creator && c.creator.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          getCampaignVoteItems(c).some(item => `${item.id} ${item.title}`.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter || getCampaignVoteItems(c).some(item => item.status === statusFilter);
      return matchSearch && matchStatus;
    });
  }, [campaigns, searchTerm, statusFilter]);

  const flatVoteRows = useMemo(() => filteredCampaigns.flatMap(campaign => getCampaignVoteItems(campaign)
    .map((item, itemIndex) => ({ campaign, item, itemIndex }))
    .filter(({ item }) => statusFilter === 'ALL' || item.status === statusFilter)), [filteredCampaigns, statusFilter]);

  // Open Create Form
  const handleOpenCreate = () => {
    const newId = `CAMP-2026-${String(campaigns.length + 1).padStart(3, '0')}`;
    const initialPhase: VotePhase = {
      id: `PHASE-01`,
      name: '第一階段 初選淘汰賽',
      status: 'ACTIVE',
      startTime: '2026-08-20 00:00:00',
      endTime: '2026-09-10 23:59:59',
      mode: 'MULTIPLE',
      maxSelections: 3,
      frequencyLimit: 'ONCE_DAILY',
      requireAuth: true,
      options: [
        {
          id: `OPT-${Date.now()}-1`,
          name: '01號 - 候選人名稱',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          description: '候選人簡短自我介紹與代表作品。',
          initialVotes: 100,
          votes: 100
        },
        {
          id: `OPT-${Date.now()}-2`,
          name: '02號 - 候選人名稱',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
          description: '候選人簡短自我介紹與代表作品。',
          initialVotes: 100,
          votes: 100
        }
      ]
    };

    const initialItem: VoteItem = {
      id: 'ITEM-01',
      title: '最佳劇集 20強進7決選',
      description: '請為你支持的年度旗艦劇集投下神聖一票！',
      status: 'ACTIVE',
      currentPhaseId: initialPhase.id,
      phases: [initialPhase]
    };

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const baseCampaign: VotingCampaign = {
      id: newId,
      title: '',
      coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      description: '',
      resultVisibility: 'AFTER_VOTE',
      submissionMode: 'ALL_REQUIRED',
      status: 'ACTIVE',
      currentPhaseId: initialPhase.id,
      phases: [initialPhase],
      voteItems: [initialItem],
      totalParticipants: 0,
      totalVotes: 0,
      startTime: initialPhase.startTime,
      endTime: initialPhase.endTime,
      creator: 'TVB GO 互動運營組',
      createdAt: nowStr,
      updatedAt: nowStr
    };

    setEditingCampaign(syncCampaignFromVoteItems(baseCampaign));
    setActiveVoteItemIndex(0);
    setActivePhaseIndex(0);
    setFormErrors([]);
    setWorkflowStep('GENERATE_CAMPAIGN');
    setViewMode('WORKFLOW');
    triggerSound(600, 'sine', 0.1);
  };

  // Open Edit Form
  const handleOpenEdit = (campaign: VotingCampaign, initialStep: 'GENERATE_CAMPAIGN' | 'VOTE_LIST' | 'VOTE_ITEM_EDIT' = 'GENERATE_CAMPAIGN', itemIndex = 0) => {
    const items = getCampaignVoteItems(campaign);
    const timeRange = getCalculatedCampaignTimeRange(campaign.phases);
    const campaignCopy = JSON.parse(JSON.stringify(campaign));
    campaignCopy.voteItems = items;
    
    setEditingCampaign({
      ...campaignCopy,
      submissionMode: campaign.submissionMode || 'ALL_REQUIRED',
      startTime: campaign.startTime || timeRange.start,
      endTime: campaign.endTime || timeRange.end,
      creator: campaign.creator || '系統管理員 (TVB GO)',
      createdAt: campaign.createdAt || '2026-08-01 10:00:00',
      updatedAt: campaign.updatedAt || new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
    setActiveVoteItemIndex(itemIndex);
    setActivePhaseIndex(0);
    setFormErrors([]);
    setWorkflowStep(initialStep);
    setViewMode('WORKFLOW');
    triggerSound(650, 'sine', 0.1);
  };

  const deleteVoteFromList = (campaign: VotingCampaign, itemIndex: number, title: string) => {
    if (!confirm(`確定要刪除投票「${title}」嗎？`)) return;
    const items = getCampaignVoteItems(campaign);
    if (items.length === 1) onDeleteCampaign(campaign.id);
    else onSaveCampaign(syncCampaignFromVoteItems({ ...campaign, voteItems: items.filter((_, index) => index !== itemIndex), updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }));
    triggerSound(350, 'triangle', 0.15);
  };

  // 🌟 新增投票項目 (Add VoteItem)
  const handleAddVoteItem = () => {
    if (!editingCampaign) return;
    const items = getCampaignVoteItems(editingCampaign);
    const newNum = items.length + 1;
    const initialPhase: VotePhase = {
      id: `PHASE-01`,
      name: '第一階段 初選淘汰賽',
      status: 'ACTIVE',
      startTime: editingCampaign.startTime || '2026-08-20 00:00:00',
      endTime: editingCampaign.endTime || '2026-09-10 23:59:59',
      mode: 'MULTIPLE',
      maxSelections: 3,
      frequencyLimit: 'ONCE_DAILY',
      requireAuth: true,
      options: [
        {
          id: `OPT-${Date.now()}-1`,
          name: '01號 - 候選人名稱',
          avatar: '',
          description: '候選人自我介紹與演藝代表作品。',
          initialVotes: 100,
          votes: 100
        },
        {
          id: `OPT-${Date.now()}-2`,
          name: '02號 - 候選人名稱',
          avatar: '',
          description: '候選人自我介紹與演藝代表作品。',
          initialVotes: 100,
          votes: 100
        }
      ]
    };

    const newItem: VoteItem = {
      id: `ITEM-${String(newNum).padStart(2, '0')}`,
      title: `新增評選獎項 #${newNum}`,
      description: '請為本獎項或評選類別設置候選人名單與投票須知...',
      status: 'ACTIVE',
      currentPhaseId: initialPhase.id,
      phases: [initialPhase]
    };

    const updatedItems = [...items, newItem];
    const updatedCampaign = syncCampaignFromVoteItems({
      ...editingCampaign,
      voteItems: updatedItems
    });

    setEditingCampaign(updatedCampaign);
    setActiveVoteItemIndex(updatedItems.length - 1);
    setActivePhaseIndex(0);
    triggerSound(750, 'sine', 0.1);
  };

  // 🌟 複製投票項目 (Duplicate VoteItem)
  const handleDuplicateVoteItem = (itemIdx: number) => {
    if (!editingCampaign) return;
    const items = getCampaignVoteItems(editingCampaign);
    const target = items[itemIdx];
    if (!target) return;

    const cloned: VoteItem = JSON.parse(JSON.stringify(target));
    cloned.id = `ITEM-${Date.now().toString().slice(-4)}`;
    cloned.title = `${target.title} (副本)`;

    const updatedItems = [...items, cloned];
    const updatedCampaign = syncCampaignFromVoteItems({
      ...editingCampaign,
      voteItems: updatedItems
    });

    setEditingCampaign(updatedCampaign);
    setActiveVoteItemIndex(updatedItems.length - 1);
    setActivePhaseIndex(0);
    triggerSound(800, 'sine', 0.1);
  };

  // 🌟 刪除投票項目 (Remove VoteItem)
  const handleRemoveVoteItem = (itemIdx: number) => {
    if (!editingCampaign) return;
    const items = getCampaignVoteItems(editingCampaign);
    if (items.length <= 1) {
      alert('此投票至少需要保留一個投票項目！');
      return;
    }
    const target = items[itemIdx];
    if (confirm(`確定要刪除投票組件「${target.title}」嗎？其下包含的所有賽制階段與候選人/名單將一併清除。`)) {
      const updatedItems = items.filter((_, idx) => idx !== itemIdx);
      const updatedCampaign = syncCampaignFromVoteItems({
        ...editingCampaign,
        voteItems: updatedItems
      });
      setEditingCampaign(updatedCampaign);
      setActiveVoteItemIndex(Math.max(0, itemIdx - 1));
      setActivePhaseIndex(0);
      triggerSound(400, 'triangle', 0.1);
    }
  };

  // 🌟 移動投票組件順序 (Move VoteItem: UP, DOWN, TOP, BOTTOM)
  const handleMoveVoteItemDirect = (itemIdx: number, direction: 'TOP' | 'UP' | 'DOWN' | 'BOTTOM') => {
    if (!editingCampaign) return;
    const items = getCampaignVoteItems(editingCampaign);
    if (items.length <= 1) return;

    let targetIdx = itemIdx;
    if (direction === 'TOP') targetIdx = 0;
    else if (direction === 'BOTTOM') targetIdx = items.length - 1;
    else if (direction === 'UP') targetIdx = Math.max(0, itemIdx - 1);
    else if (direction === 'DOWN') targetIdx = Math.min(items.length - 1, itemIdx + 1);

    if (targetIdx === itemIdx) return;

    const newItems = [...items];
    const [moved] = newItems.splice(itemIdx, 1);
    newItems.splice(targetIdx, 0, moved);

    const updatedCampaign = syncCampaignFromVoteItems({
      ...editingCampaign,
      voteItems: newItems
    });
    setEditingCampaign(updatedCampaign);
    setActiveVoteItemIndex(targetIdx);
    triggerSound(550, 'sine', 0.05);
  };

  const handleMoveVoteItem = (itemIdx: number, direction: 'LEFT' | 'RIGHT') => {
    handleMoveVoteItemDirect(itemIdx, direction === 'LEFT' ? 'UP' : 'DOWN');
  };

  // 🌟 核心功能：批量快捷創建投票組件 (Batch Create VoteItems)
  const handleApplyBatchAdd = (overrideTitles?: string[]) => {
    if (!editingCampaign) return;
    const currentItems = getCampaignVoteItems(editingCampaign);
    
    let titlesToCreate: string[] = [];
    if (overrideTitles && overrideTitles.length > 0) {
      titlesToCreate = overrideTitles;
    } else if (batchAddText.trim()) {
      titlesToCreate = batchAddText
        .split(/[\n,;，；]+/)
        .map(t => t.trim())
        .filter(t => t.length > 0);
    } else if (batchAddPreset && VOTE_ITEM_BATCH_PRESETS[batchAddPreset]) {
      titlesToCreate = VOTE_ITEM_BATCH_PRESETS[batchAddPreset].items;
    }

    if (titlesToCreate.length === 0) {
      alert('請輸入或選擇要批量創建的投票組件名稱！');
      return;
    }

    const newVoteItems: VoteItem[] = titlesToCreate.map((title, idx) => {
      const itemNum = currentItems.length + idx + 1;
      const initialPhases: VotePhase[] = [];

      const p1: VotePhase = {
        id: `PHASE-01`,
        name: batchAddPhasesCount > 1 ? '第一階段 初選淘汰賽' : '第一階段 全民投選',
        status: 'ACTIVE',
        startTime: editingCampaign.startTime || '2026-08-20 00:00:00',
        endTime: editingCampaign.endTime || '2026-09-10 23:59:59',
        mode: batchAddMode,
        maxSelections: batchAddMaxSelections,
        frequencyLimit: 'ONCE_DAILY',
        requireAuth: true,
        options: [
          {
            id: `OPT-${Date.now()}-${itemNum}-1`,
            name: '01號 - 候選人名稱',
            avatar: '',
            description: '候選人自我介紹與演藝代表作品。',
            initialVotes: 100,
            votes: 100
          },
          {
            id: `OPT-${Date.now()}-${itemNum}-2`,
            name: '02號 - 候選人名稱',
            avatar: '',
            description: '候選人自我介紹與演藝代表作品。',
            initialVotes: 100,
            votes: 100
          }
        ]
      };
      initialPhases.push(p1);

      if (batchAddPhasesCount > 1) {
        const p2: VotePhase = {
          id: `PHASE-02`,
          name: '第二階段 晉級決選賽',
          status: 'UPCOMING',
          startTime: '2026-09-11 00:00:00',
          endTime: '2026-09-30 23:59:59',
          mode: 'SINGLE',
          maxSelections: 1,
          frequencyLimit: 'ONCE_TOTAL',
          requireAuth: true,
          advanceSourcePhaseId: 'PHASE-01',
          advanceSourceTopCount: 7,
          options: []
        };
        initialPhases.push(p2);
      }

      return {
        id: `ITEM-${String(itemNum).padStart(2, '0')}`,
        title: title,
        description: `請為「${title}」投下神聖一票！`,
        status: 'ACTIVE',
        currentPhaseId: initialPhases[0].id,
        phases: initialPhases
      };
    });

    const updatedItems = [...currentItems, ...newVoteItems];
    const updatedCampaign = syncCampaignFromVoteItems({
      ...editingCampaign,
      voteItems: updatedItems
    });

    setEditingCampaign(updatedCampaign);
    setActiveVoteItemIndex(currentItems.length); // 焦點切換至新增的第一個組件
    setActivePhaseIndex(0);
    setShowBatchAddModal(false);
    setBatchAddText('');
    setSelectedVoteItemIndices([]);
    triggerSound(880, 'sine', 0.2);
  };

  // 🌟 批量刪除選中的組件 (Batch Delete Selected VoteItems)
  const handleBatchDeleteSelected = () => {
    if (!editingCampaign || selectedVoteItemIndices.length === 0) return;
    const items = getCampaignVoteItems(editingCampaign);
    if (items.length - selectedVoteItemIndices.length < 1) {
      alert('此投票至少需要保留 1 個投票項目，無法全部刪除！');
      return;
    }

    if (confirm(`確定要批量刪除選中的 ${selectedVoteItemIndices.length} 個投票組件嗎？`)) {
      const updatedItems = items.filter((_, idx) => !selectedVoteItemIndices.includes(idx));
      const updatedCampaign = syncCampaignFromVoteItems({
        ...editingCampaign,
        voteItems: updatedItems
      });
      setEditingCampaign(updatedCampaign);
      setActiveVoteItemIndex(0);
      setActivePhaseIndex(0);
      setSelectedVoteItemIndices([]);
      setIsBatchSelectMode(false);
      triggerSound(400, 'triangle', 0.15);
    }
  };

  // 🌟 批量同步活動時間至組件階段 (Batch Sync Dates to VoteItems)
  const handleBatchSyncDates = () => {
    if (!editingCampaign) return;
    const items = getCampaignVoteItems(editingCampaign);
    const start = editingCampaign.startTime || '2026-08-20 00:00:00';
    const end = editingCampaign.endTime || '2026-09-30 23:59:59';

    const targetIndices = selectedVoteItemIndices.length > 0 
      ? selectedVoteItemIndices 
      : items.map((_, i) => i);

    const newItems = items.map((item, idx) => {
      if (!targetIndices.includes(idx)) return item;
      const newPhases = item.phases.map(p => ({
        ...p,
        startTime: start,
        endTime: end
      }));
      return { ...item, phases: newPhases };
    });

    const updatedCampaign = syncCampaignFromVoteItems({
      ...editingCampaign,
      voteItems: newItems
    });
    setEditingCampaign(updatedCampaign);
    triggerSound(750, 'sine', 0.1);
    alert(`✅ 已成功將投票起止時間 (${start} ~ ${end}) 同步給 ${targetIndices.length} 個投票項目！`);
  };

  // 🌟 批量設置組件狀態 (Batch Set Status)
  const handleBatchSetStatus = (status: VoteCampaignStatus) => {
    if (!editingCampaign) return;
    const items = getCampaignVoteItems(editingCampaign);
    const targetIndices = selectedVoteItemIndices.length > 0 
      ? selectedVoteItemIndices 
      : items.map((_, i) => i);

    const newItems = items.map((item, idx) => {
      if (!targetIndices.includes(idx)) return item;
      return { ...item, status };
    });

    const updatedCampaign = syncCampaignFromVoteItems({
      ...editingCampaign,
      voteItems: newItems
    });
    setEditingCampaign(updatedCampaign);
    triggerSound(700, 'sine', 0.1);
  };

  // 🌟 批量添加候選人名單 (Batch Add Options to Current Phase)
  const handleApplyBatchAddOptions = () => {
    if (!editingCampaign) return;
    const items = getCampaignVoteItems(editingCampaign);
    const curItem = items[activeVoteItemIndex];
    if (!curItem) return;
    const currentPhase = curItem.phases[activePhaseIndex];
    if (!currentPhase) return;

    const names = batchAddOptionsText
      .split(/[\n,;，；]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length === 0) {
      alert('請輸入候選人名單（每行一個）！');
      return;
    }

    const newOpts: VoteOption[] = names.map((name, idx) => {
      const num = currentPhase.options.length + idx + 1;
      const formattedName = name.match(/^\d+/) ? name : `${String(num).padStart(2, '0')}號 - ${name}`;
      return {
        id: `OPT-${Date.now()}-${num}`,
        name: formattedName,
        avatar: '',
        description: '入圍候選人介紹及代表作。',
        initialVotes: 100,
        votes: 100
      };
    });

    currentPhase.options = [...currentPhase.options, ...newOpts];
    const updatedCampaign = syncCampaignFromVoteItems({
      ...editingCampaign,
      voteItems: items
    });

    setEditingCampaign(updatedCampaign);
    setShowBatchAddOptionsModal(false);
    setBatchAddOptionsText('');
    triggerSound(820, 'sine', 0.15);
  };

  // 🌟 為當前投票項目新增階段 (Add Phase to Current VoteItem)
  const handleAddPhase = () => {
    if (!editingCampaign) return;
    const items = getCampaignVoteItems(editingCampaign);
    const curItem = items[activeVoteItemIndex];
    if (!curItem) return;

    const phaseCount = curItem.phases.length + 1;
    const prevPhase = curItem.phases[curItem.phases.length - 1];
    const newPhaseId = `PHASE-${String(phaseCount).padStart(2, '0')}`;
    
    const defaultTopCount = prevPhase?.advanceTopCount || (phaseCount === 2 ? 20 : phaseCount === 3 ? 7 : 3);
    
    const newPhase: VotePhase = {
      id: newPhaseId,
      name: phaseCount === 2 ? '第二階段 20進7 晉級賽' : phaseCount === 3 ? '第三階段 7強總決賽' : `第${phaseCount}階段 決選晉級賽`,
      status: 'UPCOMING',
      startTime: '2026-09-11 00:00:00',
      endTime: '2026-09-30 23:59:59',
      mode: 'SINGLE',
      maxSelections: 1,
      frequencyLimit: 'ONCE_TOTAL',
      requireAuth: true,
      advanceSourcePhaseId: prevPhase ? prevPhase.id : undefined,
      advanceSourceTopCount: defaultTopCount,
      options: [
        {
          id: `OPT-${Date.now()}-01`,
          name: '晉級候選人 01',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
          description: '入圍晉級候選人介紹。',
          initialVotes: 0,
          votes: 0
        }
      ]
    };

    curItem.phases.push(newPhase);
    const updatedCampaign = syncCampaignFromVoteItems({
      ...editingCampaign,
      voteItems: items
    });

    setEditingCampaign(updatedCampaign);
    setActivePhaseIndex(curItem.phases.length - 1);
    triggerSound(750, 'sine', 0.1);
  };

  // 🌟 刪除當前投票項目中的階段 (Remove Phase from Current VoteItem)
  const handleRemovePhase = (phaseIndex: number) => {
    if (!editingCampaign) return;
    const items = getCampaignVoteItems(editingCampaign);
    const curItem = items[activeVoteItemIndex];
    if (!curItem) return;

    if (curItem.phases.length <= 1) {
      alert('該投票項目至少需要保留一個投票階段！');
      return;
    }
    const targetPhase = curItem.phases[phaseIndex];
    if (confirm(`確定要刪除「${targetPhase.name}」嗎？該階段內的所有選項與票數都將被清除。`)) {
      curItem.phases = curItem.phases.filter((_, idx) => idx !== phaseIndex);
      if (curItem.currentPhaseId === targetPhase.id) {
        curItem.currentPhaseId = curItem.phases[0].id;
      }
      const updatedCampaign = syncCampaignFromVoteItems({
        ...editingCampaign,
        voteItems: items
      });
      setEditingCampaign(updatedCampaign);
      setActivePhaseIndex(Math.max(0, phaseIndex - 1));
      triggerSound(400, 'triangle', 0.1);
    }
  };

  // Add Option to Active Phase
  const handleAddOption = () => {
    if (!editingCampaign) return;
    const items = getCampaignVoteItems(editingCampaign);
    const curItem = items[activeVoteItemIndex];
    if (!curItem) return;
    const currentPhase = curItem.phases[activePhaseIndex];
    if (!currentPhase) return;

    const optNumber = currentPhase.options.length + 1;
    const newOption: VoteOption = {
      id: `OPT-${Date.now()}-${optNumber}`,
      name: `${String(optNumber).padStart(2, '0')}號 - 候選人名稱`,
      avatar: '',
      description: '候選人簡介與演藝代表作品。',
      initialVotes: 0,
      votes: 0
    };

    currentPhase.options.push(newOption);
    const updatedCampaign = syncCampaignFromVoteItems({
      ...editingCampaign,
      voteItems: items
    });
    setEditingCampaign(updatedCampaign);
    triggerSound(800, 'sine', 0.08);
  };

  // Remove Option from Active Phase
  const handleRemoveOption = (optIndex: number) => {
    if (!editingCampaign) return;
    const items = getCampaignVoteItems(editingCampaign);
    const curItem = items[activeVoteItemIndex];
    if (!curItem) return;
    const currentPhase = curItem.phases[activePhaseIndex];
    if (!currentPhase) return;

    if (currentPhase.options.length <= 1) {
      alert('每個投票階段至少需包含一個投票選項！');
      return;
    }

    currentPhase.options = currentPhase.options.filter((_, idx) => idx !== optIndex);
    const updatedCampaign = syncCampaignFromVoteItems({
      ...editingCampaign,
      voteItems: items
    });
    setEditingCampaign(updatedCampaign);
    triggerSound(450, 'triangle', 0.08);
  };

  // 🌟 核心功能：執行「手動/即刻晉級導入 (Advance Options)」
  const handleExecuteAdvanceImport = (targetPhaseIndex: number) => {
    if (!editingCampaign) return;
    const items = getCampaignVoteItems(editingCampaign);
    const curItem = items[activeVoteItemIndex];
    if (!curItem) return;
    const targetPhase = curItem.phases[targetPhaseIndex];
    if (!targetPhase) return;

    const sourcePhaseId = targetPhase.advanceSourcePhaseId;
    const topCount = targetPhase.advanceSourceTopCount || 7;

    if (!sourcePhaseId) {
      alert('請先在下方「晉級來源關聯」中選擇前置階段！');
      return;
    }

    const sourcePhase = curItem.phases.find(p => p.id === sourcePhaseId);
    if (!sourcePhase) {
      alert('找不到指定的來源階段！');
      return;
    }

    const sortedSourceOptions = [...sourcePhase.options].sort((a, b) => b.votes - a.votes);
    const qualifyingOptions = sortedSourceOptions.slice(0, topCount);

    if (qualifyingOptions.length === 0) {
      alert('來源階段尚無任何候選人或得票數據！');
      return;
    }

    const importedOptions: VoteOption[] = qualifyingOptions.map((opt, rank) => ({
      id: `OPT-ADV-${targetPhase.id}-${opt.id}`,
      name: opt.name,
      avatar: opt.avatar,
      description: opt.description ? `${opt.description} (第 ${rank + 1} 名晉級)` : `上一輪以第 ${rank + 1} 名強勢晉級`,
      initialVotes: 0,
      votes: 0
    }));

    targetPhase.options = importedOptions;
    const updatedCampaign = syncCampaignFromVoteItems({
      ...editingCampaign,
      voteItems: items
    });

    setEditingCampaign(updatedCampaign);
    setAdvanceSuccessMessage(`🎉 成功由「${sourcePhase.name}」依得票排行導入前 ${qualifyingOptions.length} 名候選人至當前階段！`);
    triggerSound(880, 'sine', 0.2);

    setTimeout(() => {
      setAdvanceSuccessMessage(null);
    }, 4000);
  };

  // Save/Submit Campaign Form
  const handleSaveCampaignSubmit = (e?: React.FormEvent, publicationStatus: 'DRAFT' | 'PUBLISHED' = 'PUBLISHED') => {
    if (e) e.preventDefault();
    if (!editingCampaign) return;

    const errors: string[] = [];

    if (!editingCampaign.title.trim()) {
      errors.push('投票名稱不能為空！');
    }

    const items = getCampaignVoteItems(editingCampaign);
    if (items.length === 0) {
      errors.push('投票必須包含至少一個投票項目！');
    }

    items.forEach((item, itemIdx) => {
      if (!item.title.trim()) {
        errors.push(`投票項目 #${itemIdx + 1} 的名稱不能為空！`);
      }
      if (publicationStatus === 'DRAFT') return;
      if (item.phases.length === 0) {
        errors.push(`投票項目【${item.title || `#${itemIdx + 1}`}】必須包含至少一個賽制階段！`);
      }
      item.phases.forEach((p, idx) => {
        if (!p.name.trim()) errors.push(`項目【${item.title}】第 ${idx + 1} 階段名稱不能為空！`);
        if (p.options.length === 0) errors.push(`項目【${item.title}】第 ${idx + 1} 階段必須包含至少一個投票選項！`);
        p.options.forEach((opt, optIdx) => {
          if (!opt.name.trim()) {
            errors.push(`項目【${item.title}】第 ${idx + 1} 階段【${p.name || '未命名'}】的選項 #${optIdx + 1} 請填寫選項名 (必填)！`);
          }
        });
      });
    });

    if (errors.length > 0) {
      setFormErrors(errors);
      triggerSound(300, 'triangle', 0.2);
      return;
    }

    const syncedCampaign = syncCampaignFromVoteItems({
      ...editingCampaign,
      voteItems: items.map((item, index) => index === activeVoteItemIndex ? { ...item, publicationStatus } : item)
    });

    const calculatedTimes = getCalculatedCampaignTimeRange(syncedCampaign.phases);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const finalCampaign: VotingCampaign = {
      ...syncedCampaign,
      startTime: syncedCampaign.startTime || calculatedTimes.start,
      endTime: syncedCampaign.endTime || calculatedTimes.end,
      creator: syncedCampaign.creator?.trim() || '系統管理員 (TVB GO)',
      createdAt: syncedCampaign.createdAt || nowStr,
      updatedAt: nowStr
    };

    onSaveCampaign(finalCampaign);
    setViewMode('LIST');
    triggerSound(880, 'sine', 0.15);
  };

  // 🌟 流程導航控制：從步驟1進入步驟2 (投票管理列表)
  const handleProceedToVoteList = () => {
    if (!editingCampaign) return;
    if (!editingCampaign.title.trim()) {
      setFormErrors(['請填寫投票名稱後再進入投票項目管理！']);
      triggerSound(300, 'triangle', 0.2);
      return;
    }
    setFormErrors([]);
    setWorkflowStep('VOTE_LIST');
    triggerSound(600, 'sine', 0.08);
  };

  // 🌟 流程導航控制：從步驟2進入步驟3 (進入特定投票項目的編輯頁面)
  const handleEditVoteItem = (index: number) => {
    setActiveVoteItemIndex(index);
    setActivePhaseIndex(0);
    setWorkflowStep('VOTE_ITEM_EDIT');
    triggerSound(650, 'sine', 0.08);
  };

  // 🌟 流程導航控制：從步驟2新增投票項目並直接跳轉至步驟3 (編輯頁面)
  const handleCreateAndEditVoteItem = () => {
    handleAddVoteItem();
    setWorkflowStep('VOTE_ITEM_EDIT');
  };

  // 🌟 流程導航控制：從步驟3返回步驟2 (投票管理列表)
  const handleReturnToVoteList = () => {
    setFormErrors([]);
    setWorkflowStep('VOTE_LIST');
    triggerSound(500, 'sine', 0.08);
  };

  // 📥 匯出當前活動的投票日誌為 CSV 檔案
  const handleExportCSV = (campaign: VotingCampaign) => {
    const logs = voteLogs.filter(log => log.campaignId === campaign.id);
    if (logs.length === 0) {
      alert('目前該投票尚無日誌明細可匯出！');
      return;
    }

    // CSV Headers
    const headers = [
      '日誌單號 (Log ID)',
      '投票人ID (Voter ID)',
      '投票人姓名 (Voter Name)',
      '綁定手機 (Phone)',
      '投票ID (Vote ID)',
      '投票組件 (Vote Title)',
      '賽制階段 (Phase)',
      '選項 (Selected Options)',
      '認證方式 (Auth Type)',
      '終端設備 (Device)',
      'IP地址 (IP Address)',
      '投票時間 (Voted At)',
      '計票狀態 (Status)'
    ];

    const rows = logs.map(l => [
      `"${l.id}"`,
      `"${l.voterId}"`,
      `"${l.voterName.replace(/"/g, '""')}"`,
      `"${l.voterPhone || '未綁定'}"`,
      `"${l.voteItemId || l.campaignId}"`,
      `"${(l.voteItemTitle || l.campaignTitle).replace(/"/g, '""')}"`,
      `"${l.phaseName}"`,
      `"${l.selectedOptionNames.join('; ').replace(/"/g, '""')}"`,
      `"${l.authType}"`,
      `"${l.voterDevice}"`,
      `"${l.voterIp}"`,
      `"${l.votedAt}"`,
      `"${l.status === 'VALID' ? '正常計票' : '異常攔截'}"`
    ]);

    // 加入 UTF-8 BOM 避免 Excel 開啟繁體中文時亂碼
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TVB_Voting_Details_${campaign.id}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerSound(800, 'sine', 0.15);
  };

  // 依條件篩選出明細列表 (保留搜尋ID、姓名、手機號、投票ID等)
  const filteredDetailLogs = useMemo(() => {
    if (!detailLogsCampaign) return [];
    return voteLogs.filter(log => {
      if (log.campaignId !== detailLogsCampaign.id) return false;
      
      if (!detailSearchTerm.trim()) return true;
      const term = detailSearchTerm.toLowerCase();
      return (
        log.id.toLowerCase().includes(term) ||
        log.voterId.toLowerCase().includes(term) ||
        log.voterName.toLowerCase().includes(term) ||
        (log.voterPhone && log.voterPhone.toLowerCase().includes(term)) ||
        (log.voteItemId && log.voteItemId.toLowerCase().includes(term)) ||
        (log.voteItemTitle && log.voteItemTitle.toLowerCase().includes(term)) ||
        log.selectedOptionNames.some(opt => opt.toLowerCase().includes(term))
      );
    });
  }, [detailLogsCampaign, voteLogs, detailSearchTerm]);

  return (
    <div className="w-full space-y-6">

      {/* ========================================================================= */}
      {/* 視圖一：獨立投票管理列表 */}
      {/* ========================================================================= */}
      {!report && viewMode === 'LIST' && (
        <div className="space-y-6">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40">
                  互動投票管理模組
                </span>
                <span className="text-xs text-slate-400">中台配置與數據審計中心</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                投票管理列表
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                每次新增一個獨立投票；建立後可由活動管理一次勾選多個投票，並支援題目、階段、排程與投票日誌設定。
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              type="button"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>新建投票</span>
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-88">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="按投票名稱、編號或創建人搜尋..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">狀態篩選：</span>
              {(['ALL', 'ACTIVE', 'UPCOMING', 'ENDED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  type="button"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' && '全部投票'}
                  {st === 'ACTIVE' && '進行中'}
                  {st === 'UPCOMING' && '未開始'}
                  {st === 'ENDED' && '已結束'}
                </button>
              ))}
            </div>
          </div>

          {/* 每一列代表一個可獨立關聯的投票 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead><tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold whitespace-nowrap">
                  <th className="py-3 px-3.5 min-w-[150px]">關聯活動 ID</th><th className="py-3 px-3.5">投票 ID</th><th className="py-3 px-3.5 min-w-[240px]">投票名稱</th><th className="py-3 px-3.5 min-w-[180px]">所屬投票組</th><th className="py-3 px-3.5 text-center">候選項</th><th className="py-3 px-3.5 text-center min-w-[80px]">狀態</th><th className="py-3 px-3.5">開始時間</th><th className="py-3 px-3.5">結束時間</th><th className="py-3 px-3.5 text-center">累計票數</th><th className="py-3 px-3.5">創建人</th><th className="py-3 px-3.5 text-right whitespace-nowrap min-w-[110px] sticky right-0 bg-slate-50 dark:bg-slate-800">操作</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {flatVoteRows.map(({ campaign, item, itemIndex }) => {
                    const phase = item.phases.find(value => value.id === item.currentPhaseId) || item.phases[0];
                    const resourceId = `${campaign.id}::${item.id}`;
                    const linkedActivities = activities.filter(activity => activity.modules.some(module => module.type === 'VOTING' && (module.resourceId === resourceId || module.resourceId === campaign.id)));
                    const optionCount = item.phases.reduce((max, value) => Math.max(max, value.options.length), 0);
                    return <tr key={resourceId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-3.5">{linkedActivities.length ? <div className="flex flex-wrap gap-1">{linkedActivities.map(activity => <span key={activity.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-mono font-bold">{activity.id}</span>)}</div> : <span className="text-[10px] text-slate-400">未關聯</span>}</td>
                      <td className="py-3.5 px-3.5 font-mono font-bold text-blue-600 whitespace-nowrap">{item.id}</td>
                      <td className="py-3.5 px-3.5"><div className="flex items-center gap-3">{item.coverImage || campaign.coverImage ? <img src={item.coverImage || campaign.coverImage} alt="" className="w-12 h-9 object-cover rounded-lg border border-slate-200"/> : <div className="w-12 h-9 bg-rose-50 rounded-lg flex items-center justify-center"><Vote size={14} className="text-rose-500"/></div>}<div><div className="font-bold text-slate-900 dark:text-white">{item.title}</div><div className="text-[10px] text-slate-400 line-clamp-1">{item.description || '暫無投票說明'}</div></div></div></td>
                      <td className="py-3.5 px-3.5 text-[10px] text-slate-500">{campaign.title}</td>
                      <td className="py-3.5 px-3.5 text-center font-mono font-bold">{optionCount}</td>
                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap"><span className={`inline-flex whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : item.status === 'UPCOMING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{item.publicationStatus === 'DRAFT' ? '草稿' : item.status === 'ACTIVE' ? '進行中' : item.status === 'UPCOMING' ? '未開始' : '已結束'}</span></td>
                      <td className="py-3.5 px-3.5 font-mono text-[10px] text-slate-500 whitespace-nowrap">{phase?.startTime || campaign.startTime || '—'}</td><td className="py-3.5 px-3.5 font-mono text-[10px] text-slate-500 whitespace-nowrap">{phase?.endTime || campaign.endTime || '—'}</td>
                      <td className="py-3.5 px-3.5 text-center font-mono font-bold text-blue-600">{(item.totalVotes || item.phases.reduce((sum, value) => sum + value.options.reduce((total, option) => total + option.votes, 0), 0)).toLocaleString()}</td>
                      <td className="py-3.5 px-3.5 text-[10px] text-slate-500 whitespace-nowrap">{campaign.creator || '系統管理員'}</td>
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap min-w-[110px] sticky right-0 bg-white/95 dark:bg-slate-900/95"><div className="flex flex-nowrap justify-end gap-1.5"><button type="button" onClick={() => handleOpenEdit(campaign, 'VOTE_ITEM_EDIT', itemIndex)} className="shrink-0 whitespace-nowrap px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px] flex items-center gap-1"><Edit3 size={12}/>編輯</button><button type="button" onClick={() => deleteVoteFromList(campaign, itemIndex, item.title)} className="shrink-0 p-1.5 text-slate-400 hover:text-rose-600"><Trash2 size={13}/></button></div></td>
                    </tr>;
                  })}
                  {!flatVoteRows.length && <tr><td colSpan={11} className="py-14 text-center text-slate-400"><Award size={34} className="mx-auto mb-2 opacity-40"/>未找到符合條件的投票</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* 舊版分組表格保留供資料兼容，不在介面顯示 */}
          <div className="hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold whitespace-nowrap">
                    <th className="py-3 px-3.5">投票編號</th>
                    <th className="py-3 px-3.5 min-w-[200px]">投票名稱</th>
                    <th className="py-3 px-3.5 text-center">題目數量</th>
                    <th className="py-3 px-3.5 min-w-[160px]">引用活動</th>
                    <th className="py-3 px-3.5 text-center">參與人數 / 總票數</th>
                    <th className="py-3 px-3.5 text-center">狀態</th>
                    <th className="py-3 px-3.5">開始時間</th>
                    <th className="py-3 px-3.5">結束時間</th>
                    <th className="py-3 px-3.5">創建人</th>
                    <th className="py-3 px-3.5">創建時間</th>
                    <th className="py-3 px-3.5">更新時間</th>
                    <th className="py-3 px-3.5 text-right sticky right-0 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-xs">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-14 text-center text-slate-400">
                        <Award size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="font-bold">未找到符合條件的投票</p>
                        <p className="text-[11px] text-slate-400 mt-1">請嘗試調整搜尋關鍵字或狀態篩選器</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((camp) => {
                      const voteItems = getCampaignVoteItems(camp);
                      const curPhase = camp.phases.find(p => p.id === camp.currentPhaseId) || camp.phases[0];
                      const calcRange = getCalculatedCampaignTimeRange(camp.phases);
                      const displayStartTime = camp.startTime || calcRange.start;
                      const displayEndTime = camp.endTime || calcRange.end;
                      const displayCreator = camp.creator || '系統管理員 (TVB GO)';
                      const displayCreatedAt = camp.createdAt || '2026-08-01 10:00:00';
                      const displayUpdatedAt = camp.updatedAt || displayCreatedAt;
                      const referencedActivities = activities.filter(activity => activity.modules.some(module => module.type === 'VOTING' && (module.resourceId === camp.id || module.resourceId?.startsWith(`${camp.id}::`))));

                      return (
                        <tr key={camp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          {/* 投票編號 */}
                          <td className="py-3.5 px-3.5 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            {camp.id}
                          </td>

                          {/* 投票名稱 & 封面 */}
                          <td className="py-3.5 px-3.5">
                            <div className="flex items-center gap-3 min-w-[200px]">
                              <img
                                src={camp.coverImage}
                                alt={camp.title}
                                className="w-12 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
                              />
                              <div className="font-bold text-slate-900 dark:text-white line-clamp-2" title={camp.title}>
                                {camp.title}
                              </div>
                            </div>
                          </td>

                          {/* 關聯投票組件數量 */}
                          <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-xs">
                              {voteItems.length}
                            </span>
                          </td>

                          {/* 引用活動 */}
                          <td className="py-3.5 px-3.5">
                            {referencedActivities.length ? (
                              <div className="flex flex-wrap gap-1">
                                {referencedActivities.map(activity => <span key={activity.id} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md text-[10px] font-bold" title={activity.id}>{activity.title}</span>)}
                              </div>
                            ) : <span className="text-[10px] text-slate-400">未被活動引用</span>}
                          </td>

                          {/* 參與人數 / 總票數 */}
                          <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                            <div className="text-slate-800 dark:text-slate-200 font-bold">
                              {camp.totalParticipants.toLocaleString()} 人
                            </div>
                            <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                              {camp.totalVotes.toLocaleString()} 票
                            </div>
                          </td>

                          {/* 狀態 */}
                          <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                            {camp.status === 'ACTIVE' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                進行中
                              </span>
                            )}
                            {camp.status === 'UPCOMING' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-full text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                                <Clock size={11} />
                                未開始
                              </span>
                            )}
                            {camp.status === 'ENDED' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full text-slate-500 dark:text-slate-400 font-bold text-[11px]">
                                已結束
                              </span>
                            )}
                          </td>

                          {/* 開始時間 */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                            <div className="flex items-center gap-1">
                              <Calendar size={11} className="text-slate-400 shrink-0" />
                              <span>{displayStartTime}</span>
                            </div>
                          </td>

                          {/* 結束時間 */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                            <div className="flex items-center gap-1">
                              <Clock size={11} className="text-amber-500 shrink-0" />
                              <span>{displayEndTime}</span>
                            </div>
                          </td>

                          {/* 創建人 */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                              <User size={12} className="text-blue-500 shrink-0" />
                              <span className="truncate max-w-[110px]" title={displayCreator}>{displayCreator}</span>
                            </div>
                          </td>

                          {/* 創建時間 */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                            {displayCreatedAt}
                          </td>

                          {/* 更新時間 */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                            {displayUpdatedAt}
                          </td>

                          {/* 操作按鈕 (去除短碼，包含：總體數據、明細、編輯、刪除) */}
                          <td className="py-3.5 px-3.5 text-right whitespace-nowrap sticky right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 總體數據按鈕 */}
                              <button
                                onClick={() => {
                                  setStatsCampaign(camp);
                                  setStatsActivePhaseTab('ALL');
                                  triggerSound(750, 'sine', 0.08);
                                }}
                                type="button"
                                title="查看投票總體統計數據看板"
                                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              >
                                <BarChart2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                                <span>總體數據</span>
                              </button>

                              {/* 明細按鈕 */}
                              <button
                                onClick={() => {
                                  setDetailLogsCampaign(camp);
                                  setDetailSearchTerm('');
                                  setDetailPhaseFilter('ALL');
                                  setDetailStatusFilter('ALL');
                                  setDetailAuthFilter('ALL');
                                  triggerSound(700, 'sine', 0.08);
                                }}
                                type="button"
                                title="查看投票人ID、所選選項、投票時間等明細日誌"
                                className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              >
                                <ListOrdered size={13} className="text-indigo-600 dark:text-indigo-400" />
                                <span>明細</span>
                              </button>

                              {/* 投票管理按鈕 (直接跳轉至步驟2：投票管理列表) */}
                              <button
                                onClick={() => handleOpenEdit(camp, 'VOTE_LIST')}
                                type="button"
                                title="進入投票題目設定"
                                className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              >
                                <Layers size={12} className="text-rose-600 dark:text-rose-400" />
                                <span>題目設定 ({voteItems.length})</span>
                              </button>

                              {/* 編輯活動按鈕 (跳轉至步驟1：生成活動設定) */}
                              <button
                                onClick={() => handleOpenEdit(camp, 'GENERATE_CAMPAIGN')}
                                type="button"
                                title="編輯投票基本設置與排程"
                                className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              >
                                <Edit3 size={12} className="text-blue-600 dark:text-blue-400" />
                                <span>編輯投票</span>
                              </button>

                              {/* 刪除按鈕 */}
                              <button
                                onClick={() => {
                                  if (confirm(`確定要刪除「${camp.title}」投票嗎？已關聯活動將保留，但需重新選擇投票。`)) {
                                    onDeleteCampaign(camp.id);
                                    triggerSound(350, 'triangle', 0.15);
                                  }
                                }}
                                type="button"
                                title="刪除投票"
                                className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 size={13} />
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
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 視圖二：活動配置工作流 (三步：1.生成活動 ➔ 2.投票管理/投票列表 ➔ 3.每個投票的編輯頁面) */}
      {/* ========================================================================= */}
      {(viewMode === 'WORKFLOW' || viewMode === 'FORM') && editingCampaign && (
        <form onSubmit={e=>handleSaveCampaignSubmit(e)} className="space-y-6">
          {/* 🌟 頂部全域主導航與 3 步流程指示器 (Step Flow Navigation Bar) */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* 左側：返回列表與活動資訊 */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setViewMode('LIST');
                  triggerSound(500, 'sine', 0.08);
                }}
                className="inline-flex items-center gap-2 p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-all cursor-pointer shrink-0"
                title="返回投票列表"
              >
                <ArrowLeft size={16} />
                <span className="text-xs font-bold">返回</span>
              </button>
              <div className="hidden min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold rounded-md border border-blue-200/60 dark:border-blue-900/60">
                    {editingCampaign.id}
                  </span>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    {editingCampaign.title || '未命名投票'}
                  </h2>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                  {campaigns.some(c => c.id === editingCampaign.id) ? '編輯既有投票' : '建立新投票'} • 共 {getCampaignVoteItems(editingCampaign).length} 個投票題目
                </p>
              </div>
            </div>

            {/* 中間：核心 3 步導航標籤 */}
            <div className="hidden items-center justify-center gap-1.5 sm:gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 overflow-x-auto">
              {/* 步驟 1: 生成活動 */}
              <button
                type="button"
                onClick={() => {
                  setWorkflowStep('GENERATE_CAMPAIGN');
                  triggerSound(600, 'sine', 0.05);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  workflowStep === 'GENERATE_CAMPAIGN'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  workflowStep === 'GENERATE_CAMPAIGN' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  1
                </span>
                <span>建立投票</span>
              </button>

              <ChevronRight size={14} className="text-slate-400 shrink-0" />

              {/* 步驟 2: 投票管理 (投票列表) */}
              <button
                type="button"
                onClick={() => {
                  handleProceedToVoteList();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  workflowStep === 'VOTE_LIST'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  workflowStep === 'VOTE_LIST' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  2
                </span>
                <span>投票題目清單</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  workflowStep === 'VOTE_LIST' ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                }`}>
                  {getCampaignVoteItems(editingCampaign).length}
                </span>
              </button>

              <ChevronRight size={14} className="text-slate-400 shrink-0" />

              {/* 步驟 3: 編輯投票 */}
              <button
                type="button"
                onClick={() => {
                  if (getCampaignVoteItems(editingCampaign).length > 0) {
                    setWorkflowStep('VOTE_ITEM_EDIT');
                    triggerSound(650, 'sine', 0.05);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  workflowStep === 'VOTE_ITEM_EDIT'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  workflowStep === 'VOTE_ITEM_EDIT' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  3
                </span>
                <span className="truncate max-w-[120px]">
                  編輯投票
                </span>
              </button>
            </div>

            {/* 右側：返回列表與保存按鈕 */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="hidden px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                返回列表
              </button>
              <button type="button" onClick={()=>handleSaveCampaignSubmit(undefined, 'DRAFT')} className="px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold whitespace-nowrap">保存草稿</button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Check size={15} />
                <span>發佈</span>
              </button>
            </div>
          </div>

          {/* Form Error Toast */}
          {formErrors.length > 0 && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-2.5 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-1">請修正以下錯誤：</strong>
                <ul className="list-disc list-inside space-y-0.5">
                  {formErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Advance Success Toast */}
          {advanceSuccessMessage && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-fadeIn shadow-xs">
              <Sparkles size={18} className="text-amber-500 shrink-0 animate-spin" />
              <span>{advanceSuccessMessage}</span>
            </div>
          )}

          {/* ========================================== */}
          {/* 🌟 步驟 1：生成活動 (全域基礎設置、提交模式、時間排程與活動封面) */}
          {/* ========================================== */}
          {workflowStep === 'GENERATE_CAMPAIGN' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-blue-500" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      步驟 1：建立投票 (基礎設置與排程)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">第 1 步 / 共 3 步</span>
                </div>
              <span className="text-xs text-slate-400">全域基礎設定</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 投票名稱 */}
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  投票名稱 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingCampaign.title}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, title: e.target.value })}
                  placeholder="例如：2026 萬千星輝最佳員工與藝員年度大獎"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 投票設置 (提交模式) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    投票設置 <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">組件提交規則</span>
                </div>
                <select
                  value={editingCampaign.submissionMode || 'ALL_REQUIRED'}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, submissionMode: e.target.value as VoteSubmissionMode })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL_REQUIRED">所有的投票組件都投完後統一提交</option>
                  <option value="INDIVIDUAL">支持單個投票組件提交</option>
                </select>
              </div>

              {/* 結果公開規則 */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  結果公開規則
                </label>
                <select
                  value={editingCampaign.resultVisibility}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, resultVisibility: e.target.value as VoteResultVisibility })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="AFTER_VOTE">投票後可見 (用戶投完票即刻顯示實時進度)</option>
                  <option value="ALWAYS_PUBLIC">一直公開 (無需投票即可查看當前票數)</option>
                  <option value="ADMIN_ONLY">僅後台可見 (完全隱藏結果，僅管理端可查看)</option>
                  <option value="AFTER_CAMPAIGN_END">投票結束後公開 (進行中保密，結束後公佈)</option>
                </select>
              </div>

              {/* 開始時間 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    投票開始時間 <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const range = getCalculatedCampaignTimeRange(editingCampaign.phases);
                      setEditingCampaign({ ...editingCampaign, startTime: range.start });
                    }}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>⚡ 依階段自動計算</span>
                  </button>
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={editingCampaign.startTime || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, startTime: e.target.value })}
                    placeholder="YYYY-MM-DD HH:mm:ss"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 結束時間 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    投票結束時間 <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const range = getCalculatedCampaignTimeRange(editingCampaign.phases);
                      setEditingCampaign({ ...editingCampaign, endTime: range.end });
                    }}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>⚡ 依階段自動計算</span>
                  </button>
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" size={14} />
                  <input
                    type="text"
                    value={editingCampaign.endTime || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, endTime: e.target.value })}
                    placeholder="YYYY-MM-DD HH:mm:ss"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 活動封面圖 */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  投票封面圖 <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileUpload}
                    className="hidden"
                  />

                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => coverImageInputRef.current?.click()}
                      className="w-36 h-20 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer relative group hover:border-blue-500 transition-all shadow-xs"
                      title="點擊上傳或更換封面"
                    >
                      {editingCampaign.coverImage ? (
                        <>
                          <img src={editingCampaign.coverImage} alt="投票封面預覽" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity">
                            <Upload size={14} />
                            <span className="mt-0.5 text-[10px]">更換封面</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors p-2 text-center">
                          <ImageIcon size={20} />
                          <span className="text-[10px] font-bold mt-1">上傳封面</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => coverImageInputRef.current?.click()}
                          className="px-3 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs"
                        >
                          <Upload size={14} />
                          <span>{editingCampaign.coverImage ? '更換圖片' : '上傳封面圖片'}</span>
                        </button>

                        {editingCampaign.coverImage && (
                          <button
                            type="button"
                            onClick={() => setEditingCampaign({ ...editingCampaign, coverImage: '' })}
                            className="px-2.5 py-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <X size={14} />
                            <span>清除</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        支援 JPG, PNG, WebP 格式 (建議 16:9 比例)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 活動簡介 */}
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  投票簡介
                </label>
                <textarea
                  rows={3}
                  value={editingCampaign.description}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, description: e.target.value })}
                  placeholder="介紹本投票的背景、賽制與簡要說明..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 活動規則 */}
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  投票規則
                </label>
                <textarea
                  rows={4}
                  value={editingCampaign.rules || ''}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, rules: e.target.value })}
                  placeholder="詳細填寫投票規則、防作弊規範、投票時間限制與免責條款說明..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* 步驟 1 底部操作導航條 */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                返回投票列表
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSaveCampaignSubmit()}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  保存草稿
                </button>
                <button
                  type="button"
                  onClick={handleProceedToVoteList}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span>下一步：投票管理 (投票列表)</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 🌟 步驟 2 & 步驟 3 的數據上下文與視圖渲染 */}
        {/* ========================================================================= */}
        {(workflowStep === 'VOTE_LIST' || workflowStep === 'VOTE_ITEM_EDIT') && (() => {
          const voteItems = getCampaignVoteItems(editingCampaign);
          const currentItemIndex = Math.min(activeVoteItemIndex, Math.max(0, voteItems.length - 1));
          const currentItem = voteItems[currentItemIndex] || voteItems[0];
          const phases = currentItem ? currentItem.phases : [];
          const safePhaseIndex = Math.min(activePhaseIndex, Math.max(0, phases.length - 1));
          const curPhase = phases[safePhaseIndex];

          const updateCurrentItem = (updater: (item: VoteItem) => VoteItem) => {
            const newItems = [...voteItems];
            newItems[currentItemIndex] = updater(newItems[currentItemIndex]);
            const updated = syncCampaignFromVoteItems({
              ...editingCampaign,
              voteItems: newItems
            });
            setEditingCampaign(updated);
          };

          const updateCurrentPhase = (updater: (p: VotePhase) => VotePhase) => {
            const newItems = [...voteItems];
            const itemToUpdate = newItems[currentItemIndex];
            if (itemToUpdate && itemToUpdate.phases[safePhaseIndex]) {
              itemToUpdate.phases[safePhaseIndex] = updater(itemToUpdate.phases[safePhaseIndex]);
              const updated = syncCampaignFromVoteItems({
                ...editingCampaign,
                voteItems: newItems
              });
              setEditingCampaign(updated);
            }
          };

          // 投票列表過濾篩選
          const filteredVoteItemsWithIndex = voteItems
            .map((item, originalIndex) => ({ item, originalIndex }))
            .filter(({ item }) => {
              const matchesSearch = !voteItemSearchQuery.trim() || 
                item.title.toLowerCase().includes(voteItemSearchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(voteItemSearchQuery.toLowerCase())) ||
                item.phases.some(p => p.options.some(o => o.name.toLowerCase().includes(voteItemSearchQuery.toLowerCase())));
              const matchesStatus = voteItemStatusFilter === 'ALL' || item.status === voteItemStatusFilter;
              return matchesSearch && matchesStatus;
            });

          return (
            <>
              {/* ========================================================================= */}
              {/* 🌟 步驟 2：投票管理 (活動專屬投票列表) */}
              {/* ========================================================================= */}
              {workflowStep === 'VOTE_LIST' && (
                <div className="space-y-6">
                  {/* 頂部：投票管理總結卡片 */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200/60 dark:border-rose-900/60">
                          <Layers size={22} />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>步驟 2：投票管理 (投票列表)</span>
                            <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold rounded-md">
                              第 2 步 / 共 3 步
                            </span>
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            此投票共包含 <strong className="text-rose-600 font-bold">{voteItems.length}</strong> 個投票項目。您可在此檢視清單、新增項目或點擊「編輯投票」進入具體設定頁面。
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setWorkflowStep('GENERATE_CAMPAIGN')}
                        className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Edit3 size={13} />
                        <span>修改投票基礎設置 (步驟 1)</span>
                      </button>
                    </div>

                    {/* 操作工具條：搜尋、狀態過濾、新增投票、模板、排序 */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-4">
                      <div className="flex flex-wrap items-center gap-2.5 flex-1">
                        {/* 搜尋框 */}
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input
                            type="text"
                            value={voteItemSearchQuery}
                            onChange={(e) => setVoteItemSearchQuery(e.target.value)}
                            placeholder="搜尋投票項目名稱或候選人..."
                            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                          />
                        </div>

                        {/* 狀態過濾 */}
                        <select
                          value={voteItemStatusFilter}
                          onChange={(e) => setVoteItemStatusFilter(e.target.value as any)}
                          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
                        >
                          <option value="ALL">全部狀態 ({voteItems.length})</option>
                          <option value="ACTIVE">進行中</option>
                          <option value="UPCOMING">未開始</option>
                          <option value="ENDED">已結束</option>
                        </select>
                      </div>

                      {/* 快捷操作按鈕群 */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* 調整排序按鈕 */}
                        <button
                          type="button"
                          onClick={() => setShowReorderModal(true)}
                          className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          title="調整各投票在前端的排序"
                        >
                          <ArrowUpDown size={14} className="text-amber-500" />
                          <span>調整順序</span>
                        </button>

                        {/* 一鍵套用經典模板 */}
                        <button
                          type="button"
                          onClick={() => setShowBatchAddModal(true)}
                          className="px-3.5 py-2 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          title="套用 TVB 頒獎典禮 20大獎項或音樂盛典模板"
                        >
                          <Sparkles size={14} />
                          <span>一鍵套用模板</span>
                        </button>

                        {/* ＋ 新增投票按鈕 */}
                        <button
                          type="button"
                          onClick={handleCreateAndEditVoteItem}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <Plus size={15} />
                          <span>＋ 新增投票</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 🌟 核心：專屬投票列表 (Vote Items Table) */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          投票項目清單
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] font-bold rounded-md">
                          共 {voteItems.length} 項
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        點擊「編輯投票」即可單獨進入每個投票的編輯頁面
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                            <th className="py-3 px-4 w-16 text-center">序號</th>
                            <th className="py-3 px-4 w-20">封面</th>
                            <th className="py-3 px-4 min-w-[220px]">投票項目名稱</th>
                            <th className="py-3 px-4 min-w-[160px]">賽制階段</th>
                            <th className="py-3 px-4 w-24 text-center">候選人</th>
                            <th className="py-3 px-4 min-w-[140px]">投票規則</th>
                            <th className="py-3 px-4 w-20 text-center">狀態</th>
                            <th className="py-3 px-4 w-24 text-right">累計得票</th>
                            <th className="py-3 px-4 w-52 text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                          {filteredVoteItemsWithIndex.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="py-12 text-center text-slate-400">
                                <Layers size={36} className="mx-auto mb-2 opacity-30" />
                                <p className="font-bold text-sm">暫無符合條件的投票項目</p>
                                <p className="text-xs mt-1 text-slate-500">點擊「＋ 新增投票」或「一鍵套用模板」開始配置！</p>
                              </td>
                            </tr>
                          ) : (
                            filteredVoteItemsWithIndex.map(({ item, originalIndex }, displayIdx) => {
                              const totalCandidates = item.phases.reduce((sum, p) => sum + (p.options?.length || 0), 0);
                              const totalVotes = item.phases.reduce((sum, p) => sum + (p.options?.reduce((s, o) => s + (o.votes || 0), 0) || 0), 0);
                              const firstPhase = item.phases[0];

                              return (
                                <tr
                                  key={item.id || originalIndex}
                                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                  {/* 序號 */}
                                  <td className="py-3.5 px-4 text-center">
                                    <span className="font-mono text-xs font-black text-slate-400">
                                      #{displayIdx + 1}
                                    </span>
                                  </td>

                                  {/* 封面 */}
                                  <td className="py-3.5 px-4">
                                    <div className="w-14 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                      {item.coverImage ? (
                                        <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                                      ) : editingCampaign.coverImage ? (
                                        <img src={editingCampaign.coverImage} alt={item.title} className="w-full h-full object-cover opacity-60" />
                                      ) : (
                                        <Award size={18} className="text-slate-400" />
                                      )}
                                    </div>
                                  </td>

                                  {/* 投票項目名稱與ID */}
                                  <td className="py-3.5 px-4">
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                          {item.id}
                                        </span>
                                        <span className="font-bold text-slate-900 dark:text-white text-xs hover:text-blue-600 transition-colors">
                                          {item.title}
                                        </span>
                                      </div>
                                      {item.description && (
                                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                  </td>

                                  {/* 賽制階段 */}
                                  <td className="py-3.5 px-4">
                                    <div className="space-y-0.5">
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-800/60">
                                        <Clock size={11} />
                                        <span>{item.phases.length} 個階段</span>
                                      </span>
                                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                        {item.phases.map(p => p.name).join(' ➔ ')}
                                      </p>
                                    </div>
                                  </td>

                                  {/* 候選人數量 */}
                                  <td className="py-3.5 px-4 text-center">
                                    <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                      {totalCandidates} 位
                                    </span>
                                  </td>

                                  {/* 投票規則 */}
                                  <td className="py-3.5 px-4">
                                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                                      <span className="font-bold">
                                        {firstPhase?.mode === 'MULTIPLE' ? `多選 (最多${firstPhase.maxSelections || 3}票)` : '單選'}
                                      </span>
                                      <span className="text-slate-400 block text-[10px]">
                                        {firstPhase?.frequencyLimit === 'ONCE_DAILY' ? '每日 1 次' : firstPhase?.frequencyLimit === 'ONCE_TOTAL' ? '終生 1 次' : '不限頻率'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* 狀態 */}
                                  <td className="py-3.5 px-4 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      item.status === 'ACTIVE'
                                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                        : item.status === 'UPCOMING'
                                        ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                                    }`}>
                                      {item.status === 'ACTIVE' ? '進行中' : item.status === 'UPCOMING' ? '未開始' : '已結束'}
                                    </span>
                                  </td>

                                  {/* 累計得票 */}
                                  <td className="py-3.5 px-4 text-right">
                                    <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                                      {totalVotes.toLocaleString()}
                                    </span>
                                  </td>

                                  {/* 操作按鈕 */}
                                  <td className="py-3.5 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* 🌟 進入步驟 3：編輯該投票 */}
                                      <button
                                        type="button"
                                        onClick={() => handleEditVoteItem(originalIndex)}
                                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                        title="進入編輯此投票的詳細配置與候選人"
                                      >
                                        <Edit3 size={12} />
                                        <span>編輯投票</span>
                                      </button>

                                      {/* 複製 */}
                                      <button
                                        type="button"
                                        onClick={() => handleDuplicateVoteItem(originalIndex)}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors cursor-pointer"
                                        title="複製此投票項目"
                                      >
                                        <Copy size={13} />
                                      </button>

                                      {/* 上移 */}
                                      <button
                                        type="button"
                                        disabled={originalIndex === 0}
                                        onClick={() => handleMoveVoteItemDirect(originalIndex, 'UP')}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-20 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                                        title="上移"
                                      >
                                        <ArrowUp size={13} />
                                      </button>

                                      {/* 下移 */}
                                      <button
                                        type="button"
                                        disabled={originalIndex === voteItems.length - 1}
                                        onClick={() => handleMoveVoteItemDirect(originalIndex, 'DOWN')}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-20 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                                        title="下移"
                                      >
                                        <ArrowDown size={13} />
                                      </button>

                                      {/* 刪除 */}
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveVoteItem(originalIndex)}
                                        className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                        title="刪除此投票"
                                      >
                                        <Trash2 size={13} />
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
                  </div>

                  {/* 步驟 2 底部導航條 */}
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setWorkflowStep('GENERATE_CAMPAIGN')}
                      className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>上一步：投票基礎設置</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleCreateAndEditVoteItem}
                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>＋ 新增另一個投票</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveCampaignSubmit()}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                      >
                        <Check size={16} />
                        <span>保存並發布投票</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* 🌟 步驟 3：每個投票的編輯頁面 (單個投票專屬配置：基本資料、賽制階段、候選人名單) */}
              {/* ========================================================================= */}
              {workflowStep === 'VOTE_ITEM_EDIT' && currentItem && (
                <div className="space-y-6">
                  {/* 步驟 3 頂部專屬導航與快速切換欄 */}
                  <div className="hidden bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleReturnToVoteList}
                        className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-rose-200/60 dark:border-rose-900/60 shadow-2xs"
                      >
                        <ArrowLeft size={14} />
                        <span>返回投票列表</span>
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono px-2 py-0.5 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold rounded-md">
                            {currentItem.id}
                          </span>
                          <h3 className="font-black text-slate-900 dark:text-white text-base truncate">
                            {currentItem.title}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          步驟 3：編輯每個投票的詳細配置 • 共 {currentItem.phases.length} 個賽制階段
                        </p>
                      </div>
                    </div>

                    {/* 快速切換當前編輯的投票項目 */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <span className="text-xs text-slate-400 font-bold shrink-0">切換投票：</span>
                      <select
                        value={currentItemIndex}
                        onChange={(e) => {
                          const newIdx = parseInt(e.target.value);
                          setActiveVoteItemIndex(newIdx);
                          setActivePhaseIndex(0);
                          triggerSound(600, 'sine', 0.05);
                        }}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                      >
                        {voteItems.map((item, idx) => (
                          <option key={item.id || idx} value={idx}>
                            #{idx + 1} {item.title} ({item.id})
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleReturnToVoteList}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Check size={14} />
                        <span>完成此投票編輯</span>
                      </button>
                    </div>
                  </div>

                  {/* 每個投票的詳細配置編輯區 (Step 3 專屬表單) */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                    {/* Item Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-200/60 dark:border-slate-700/60 pb-5">
                      {/* 投票ID */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          投票ID <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={currentItem.id || ''}
                          onChange={(e) => updateCurrentItem(item => ({ ...item, id: e.target.value }))}
                          placeholder="例如：ITEM-01 或 BEST-ACTOR"
                          className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      {/* 投票標題 */}
                      <div className="md:col-span-2 space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          投票標題 <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={currentItem.title}
                          onChange={(e) => updateCurrentItem(item => ({ ...item, title: e.target.value }))}
                          placeholder="例如：最佳劇集 / 最受歡迎女藝員 / 最佳綜藝節目"
                          className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      {/* 投票封面圖展示 */}
                      <div className="md:col-span-3 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          投票封面圖展示
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <input
                            ref={voteItemCoverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleVoteItemCoverUpload(currentItemIndex, e)}
                            className="hidden"
                          />

                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => voteItemCoverInputRef.current?.click()}
                              className="w-32 h-20 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer relative group hover:border-rose-500 transition-all shadow-xs"
                              title="點擊上傳或更換投票封面"
                            >
                              {currentItem.coverImage ? (
                                <>
                                  <img src={currentItem.coverImage} alt="投票封面預覽" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity">
                                    <Upload size={14} />
                                    <span className="mt-0.5 text-[10px]">更換封面</span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors p-2 text-center">
                                  <ImageIcon size={20} />
                                  <span className="text-[10px] font-bold mt-1">上傳封面</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => voteItemCoverInputRef.current?.click()}
                                  className="px-3 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs"
                                >
                                  <Upload size={14} />
                                  <span>{currentItem.coverImage ? '更換圖片' : '上傳投票封面圖片'}</span>
                                </button>

                                {currentItem.coverImage && (
                                  <button
                                    type="button"
                                    onClick={() => updateCurrentItem(item => ({ ...item, coverImage: '' }))}
                                    className="px-2.5 py-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  >
                                    <X size={14} />
                                    <span>清除</span>
                                  </button>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">
                                支援 JPG, PNG, WebP 格式 (選填，未上傳則默認使用投票封面)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 展示時間 */}
                      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          展示開始時間
                          <input
                            type="datetime-local"
                            value={(currentItem.displayStartTime || currentItem.phases[0]?.startTime || '').replace(' ', 'T').slice(0, 16)}
                            onChange={(e) => updateCurrentItem(item => ({ ...item, displayStartTime: e.target.value.replace('T', ' ') }))}
                            className="mt-1.5 w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                          />
                        </label>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          展示結束時間
                          <input
                            type="datetime-local"
                            value={(currentItem.displayEndTime || currentItem.phases[0]?.endTime || '').replace(' ', 'T').slice(0, 16)}
                            onChange={(e) => updateCurrentItem(item => ({ ...item, displayEndTime: e.target.value.replace('T', ' ') }))}
                            className="mt-1.5 w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                          />
                        </label>
                      </div>

                      {/* 投票說明 */}
                      <div className="md:col-span-3 space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          投票說明
                        </label>
                        <input
                          type="text"
                          value={currentItem.description || ''}
                          onChange={(e) => updateCurrentItem(item => ({ ...item, description: e.target.value }))}
                          placeholder="請為你支持的候選人或作品投票，本組件共設初賽與決賽多階段..."
                          className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>

                    {/* Level 3: Phases for Current Vote Item */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                            賽制階段配置
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddPhase}
                          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs"
                        >
                          <Plus size={14} />
                          <span>+新增賽制階段</span>
                        </button>
                      </div>

                      {/* Phase Navigation Tabs */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {phases.map((phase, idx) => (
                          <button
                            key={phase.id || idx}
                            type="button"
                            onClick={() => {
                              setActivePhaseIndex(idx);
                              triggerSound(600, 'sine', 0.05);
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer border ${
                              safePhaseIndex === idx
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <Layers size={13} />
                            <span>階段 {idx + 1}：{phase.name || '未命名階段'}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              safePhaseIndex === idx ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}>
                              {phase.options.length} 選項
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Active Phase Configuration Box */}
                      {curPhase && (
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md font-mono">
                                {curPhase.id}
                              </span>
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                階段規則與投票參數
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {currentItem.currentPhaseId !== curPhase.id ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateCurrentItem(item => ({ ...item, currentPhaseId: curPhase.id }));
                                    triggerSound(700, 'sine', 0.08);
                                  }}
                                  className="px-2.5 py-1 text-slate-500 hover:text-blue-600 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                                >
                                  設為此項目默認進行階段
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle2 size={12} />
                                  默認進行中階段
                                </span>
                              )}

                              {phases.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhase(safePhaseIndex)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-all cursor-pointer"
                                  title="刪除此階段"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Phase Fields */}
                          <div className="space-y-4">
                            {/* 1. 階段名稱 */}
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                階段名稱 <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={curPhase.name}
                                onChange={(e) => updateCurrentPhase(p => ({ ...p, name: e.target.value }))}
                                placeholder="例如：第一階段 初選40進20淘汰賽"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            {/* 2. 階段開始時間 階段結束時間 (同一行) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                  階段開始時間 <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={curPhase.startTime}
                                  onChange={(e) => updateCurrentPhase(p => ({ ...p, startTime: e.target.value }))}
                                  placeholder="2026-08-01 00:00:00"
                                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                  階段結束時間 <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={curPhase.endTime}
                                  onChange={(e) => updateCurrentPhase(p => ({ ...p, endTime: e.target.value }))}
                                  placeholder="2026-08-15 23:59:59"
                                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>

                            {/* 3. 單選 / 多選模式 */}
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                單選 / 多選模式
                              </label>
                              <select
                                value={curPhase.mode}
                                onChange={(e) => updateCurrentPhase(p => ({ ...p, mode: e.target.value as VoteSelectionMode }))}
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                              >
                                <option value="SINGLE">單選 (僅能選 1 項)</option>
                                <option value="MULTIPLE">多選 (限制最多選 N 項)</option>
                              </select>
                            </div>

                            {/* 4. 最多可選票數 (當選擇多選模式時) */}
                            {curPhase.mode === 'MULTIPLE' ? (
                              <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                  最多可選票數 (上限)
                                </label>
                                <input
                                  type="number"
                                  min={2}
                                  max={20}
                                  value={curPhase.maxSelections || 3}
                                  onChange={(e) => updateCurrentPhase(p => ({ ...p, maxSelections: parseInt(e.target.value) || 3 }))}
                                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            ) : null}

                            {/* 5. 投票頻率 */}
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                投票頻率
                              </label>
                              <select
                                value={curPhase.frequencyLimit}
                                onChange={(e) => updateCurrentPhase(p => ({ ...p, frequencyLimit: e.target.value as VoteFrequencyLimit }))}
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                              >
                                <option value="ONCE_TOTAL">整個階段僅能投票一次 (終生限制)</option>
                                <option value="ONCE_DAILY">每日一次 (每天零點刷新)</option>
                                <option value="UNLIMITED">不限制 (用於測試)</option>
                              </select>
                            </div>
                          </div>

                          {/* 晉級規則配置 */}
                          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`advance_rule_${curPhase.id}_${currentItemIndex}`}
                                  checked={!!curPhase.advanceRuleEnabled}
                                  onChange={(e) => updateCurrentPhase(p => ({
                                    ...p,
                                    advanceRuleEnabled: e.target.checked
                                  }))}
                                  className="w-4 h-4 text-amber-600 rounded cursor-pointer accent-amber-600"
                                />
                                <label
                                  htmlFor={`advance_rule_${curPhase.id}_${currentItemIndex}`}
                                  className="text-xs font-black text-amber-900 dark:text-amber-200 cursor-pointer flex items-center gap-1.5"
                                >
                                  <Award size={16} className="text-amber-600 dark:text-amber-400" />
                                  <span>晉級規則配置</span>
                                </label>
                              </div>

                              {/* 依前一階段排行手動導入按鈕 */}
                              {curPhase.advanceRuleEnabled && safePhaseIndex > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleExecuteAdvanceImport(safePhaseIndex)}
                                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                >
                                  <Sparkles size={13} />
                                  <span>從上一階段導入前 {curPhase.advanceSourceTopCount || 7} 名</span>
                                </button>
                              )}
                            </div>

                            {/* 勾選後才顯示具體名額與來源階段配置 */}
                            {curPhase.advanceRuleEnabled && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-amber-200/60 dark:border-amber-900/40 animate-fadeIn">
                                <div className="space-y-1">
                                  <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300">
                                    本階段結算後晉級下一輪的名額配置 (Top N)
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={curPhase.advanceTopCount || ''}
                                    onChange={(e) => updateCurrentPhase(p => ({
                                      ...p,
                                      advanceTopCount: parseInt(e.target.value) || undefined
                                    }))}
                                    placeholder="例如：20 (即前20名入圍下一輪)"
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-lg text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-amber-500"
                                  />
                                </div>

                                {safePhaseIndex > 0 && (
                                  <div className="space-y-1">
                                    <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300">
                                      晉級候選人來源階段 (前置階段)
                                    </label>
                                    <select
                                      value={curPhase.advanceSourcePhaseId || ''}
                                      onChange={(e) => updateCurrentPhase(p => ({ ...p, advanceSourcePhaseId: e.target.value }))}
                                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-lg text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-amber-500"
                                    >
                                      <option value="">-- 請選擇來源階段 --</option>
                                      {phases.slice(0, safePhaseIndex).map((p, pIdx) => (
                                        <option key={p.id} value={p.id}>
                                          階段 {pIdx + 1}：{p.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Options List */}
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                  項目投票候選項 ({curPhase.options.length} 項)
                                </h4>
                                <p className="text-[11px] text-slate-400">
                                  候選人/選項名稱為必填項目；可上傳代表照片並填寫簡介。
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={handleAddOption}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              >
                                <Plus size={14} />
                                <span>新增選項</span>
                              </button>
                            </div>

                            <div className="space-y-3">
                              {curPhase.options.map((opt, optIdx) => (
                                <div
                                  key={opt.id || optIdx}
                                  className="p-4 bg-slate-50/70 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col sm:flex-row items-start gap-4 transition-all hover:border-slate-300"
                                >
                                  {/* 選項頭像 / 圖片 */}
                                  <div className="relative group shrink-0 sm:pt-1">
                                    <label
                                      htmlFor={`opt_file_${currentItemIndex}_${safePhaseIndex}_${optIdx}`}
                                      className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all block"
                                      title="點擊上傳選項圖片"
                                    >
                                      {opt.avatar ? (
                                        <img src={opt.avatar} alt={opt.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="text-slate-400 flex flex-col items-center">
                                          <ImageIcon size={18} />
                                          <span className="text-[9px] mt-0.5 font-bold">加圖</span>
                                        </div>
                                      )}
                                    </label>
                                    <input
                                      id={`opt_file_${currentItemIndex}_${safePhaseIndex}_${optIdx}`}
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleOptionImageUpload(currentItemIndex, safePhaseIndex, optIdx, e)}
                                      className="hidden"
                                    />
                                    {opt.avatar && (
                                      <button
                                        type="button"
                                        onClick={(e) => handleRemoveOptionImage(currentItemIndex, safePhaseIndex, optIdx, e)}
                                        className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        title="清除圖片"
                                      >
                                        <X size={10} />
                                      </button>
                                    )}
                                  </div>

                                  {/* 選項名稱與簡介 (一個字段一行) */}
                                  <div className="flex-1 space-y-3 w-full">
                                    {/* 1. 選項名稱 */}
                                    <div className="space-y-1">
                                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                        選項名稱 <span className="text-rose-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={opt.name}
                                        onChange={(e) => {
                                          const newItems = [...voteItems];
                                          newItems[currentItemIndex].phases[safePhaseIndex].options[optIdx].name = e.target.value;
                                          const updated = syncCampaignFromVoteItems({
                                            ...editingCampaign,
                                            voteItems: newItems
                                          });
                                          setEditingCampaign(updated);
                                        }}
                                        placeholder="請輸入"
                                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500"
                                      />
                                    </div>

                                    {/* 2. 簡介 */}
                                    <div className="space-y-1">
                                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                        簡介
                                      </label>
                                      <input
                                        type="text"
                                        value={opt.description || ''}
                                        onChange={(e) => {
                                          const newItems = [...voteItems];
                                          newItems[currentItemIndex].phases[safePhaseIndex].options[optIdx].description = e.target.value;
                                          const updated = syncCampaignFromVoteItems({
                                            ...editingCampaign,
                                            voteItems: newItems
                                          });
                                          setEditingCampaign(updated);
                                        }}
                                        placeholder="請輸入"
                                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                  </div>

                                   {/* 刪除選項按鈕 */}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(optIdx)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-all cursor-pointer shrink-0 sm:self-center"
                                    title="刪除此選項"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </>
          );
        })()}
      </form>
    )}

      {/* ========================================================================= */}
      {/* 彈出視窗 1：總體數據統計看板 (Overall Statistics Modal) */}
      {/* ========================================================================= */}
      {statsCampaign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-4xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 border border-emerald-200/60 dark:border-emerald-800">
                  <BarChart2 size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950 px-2 py-0.5 rounded-md font-mono">
                      {statsCampaign.id}
                    </span>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      {statsCampaign.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                    <span>創建人：{statsCampaign.creator || '系統管理員'}</span>
                    <span>•</span>
                    <span>時段：{statsCampaign.startTime || '2026-08-01'} 至 {statsCampaign.endTime || '2026-09-30'}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStatsCampaign(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 核心 KPI 統計指標卡 (僅保留總參與人數與累計投票總數) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-xs font-bold">總參與人數</span>
                  <Users size={16} className="text-blue-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {statsCampaign.totalParticipants.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">獨立用戶 (Unique Voters)</span>
              </div>

              <div className="p-4.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/40 rounded-2xl">
                <div className="flex items-center justify-between text-blue-500 mb-1.5">
                  <span className="text-xs font-bold">累計投票總數</span>
                  <TrendingUp size={16} />
                </div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {statsCampaign.totalVotes.toLocaleString()}
                </div>
                <span className="text-[11px] text-blue-500 font-bold mt-1 block">有效選票計入數</span>
              </div>
            </div>

            {report && <p className="text-xs text-slate-500">參與人數按現有有效明細去重；票數及排行榜按已關聯投票的各階段數據汇總。</p>}
            {report && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                { title: '投票終端設備分佈', field: 'voterDevice', icon: <Smartphone size={14}/> },
                { title: '投票者認證方式佔比', field: 'authType', icon: <ShieldCheck size={14}/> },
              ] as const).map(({title, field, icon}) => {
                const allValidLogs = report.logs.filter(log => log.status === 'VALID');
                const authLabels: Record<string, string> = { TVB_GO_MEMBER: 'TVB GO 會員', EMAIL_INVITE: '電郵邀請投票', INVITATION_CODE: '邀請碼投票' };
                const deviceLabel = (device: string) => /^ios\s*app/i.test(device) ? 'iOS APP' : /^android\s*app/i.test(device) ? 'Android App' : /^web\s*browser/i.test(device) ? 'Web Browser' : null;
                const validLogs = allValidLogs.filter(log => field === 'authType' ? Boolean(authLabels[log.authType]) : Boolean(deviceLabel(log.voterDevice)));
                const labels = field === 'authType' ? Object.values(authLabels) : ['iOS APP', 'Android App', 'Web Browser'];
                const groups = new Map(labels.map(label => [label, 0]));
                validLogs.forEach(log => { const label = field === 'authType' ? authLabels[log.authType] : deviceLabel(log.voterDevice)!; groups.set(label, (groups.get(label) || 0) + 1); });
                return <div key={field} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold flex items-center gap-1.5">{icon}{title}</h4>
                  <p className="text-[10px] text-slate-500">按本活動 {validLogs.length} 筆有效投票記錄計算</p>
                  {[...groups].map(([label,count]) => { const percent = validLogs.length ? count / validLogs.length * 100 : 0; return <div key={label}>
                    <div className="flex justify-between gap-3 text-[11px] mb-1"><span>{label}</span><span className="font-mono whitespace-nowrap">{percent.toFixed(1)}%（{count} 筆）</span></div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className={field==='authType'?'h-full bg-emerald-500':'h-full bg-blue-500'} style={{width: `${percent}%`}}/></div>
                  </div>; })}
                  {!validLogs.length && <p className="text-xs text-slate-400 py-4">暫無有效投票記錄</p>}
                  {allValidLogs.length > validLogs.length && <p className="text-[10px] text-slate-500">另有 {allValidLogs.length-validLogs.length} 筆舊分類記錄，未計入以上佔比。</p>}
                </div>;
              })}
            </div>}
            {/* 分析維度使用報告中的實際設備與認證記錄計算 */}
            {/* 賽制各階段得票排行榜 */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Award size={14} className="text-amber-500" />
                  <span>各賽制階段候選人得票分佈與即時排行榜</span>
                </h4>

                {/* 階段切換 Tab */}
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setStatsActivePhaseTab('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      statsActivePhaseTab === 'ALL'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    全部階段
                  </button>
                  {statsCampaign.phases.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setStatsActivePhaseTab(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        statsActivePhaseTab === p.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      階段 {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {statsCampaign.phases
                .filter(p => statsActivePhaseTab === 'ALL' || p.id === statsActivePhaseTab)
                .map((phase) => {
                  const phaseTotalVotes = phase.options.reduce((sum, o) => sum + o.votes, 0) || 1;
                  const sortedOptions = [...phase.options].sort((a, b) => b.votes - a.votes);

                  return (
                    <div key={phase.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {phase.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full font-bold text-slate-700 dark:text-slate-300">
                            {phase.status === 'ACTIVE' ? '進行中' : phase.status === 'ENDED' ? '已結算' : '未開始'}
                          </span>
                          {phase.advanceRuleEnabled && phase.advanceTopCount && (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-full font-bold flex items-center gap-1">
                              <Award size={10} className="text-amber-600" />
                              <span>前 {phase.advanceTopCount} 名晉級區</span>
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                          階段總票數：{phaseTotalVotes.toLocaleString()} 票
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {sortedOptions.map((opt, rank) => {
                          const percent = ((opt.votes / phaseTotalVotes) * 100).toFixed(1);
                          const isAdvancing = !!(phase.advanceRuleEnabled && phase.advanceTopCount && rank < phase.advanceTopCount);
                          const isCutoffLine = !!(phase.advanceRuleEnabled && phase.advanceTopCount && rank === phase.advanceTopCount - 1 && rank < sortedOptions.length - 1);

                          return (
                            <React.Fragment key={opt.id}>
                              <div className={`p-2 rounded-xl transition-all ${isAdvancing ? 'bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60' : 'bg-white dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800'}`}>
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-xs font-medium">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                        rank === 0 ? 'bg-amber-500 text-white' : rank === 1 ? 'bg-slate-400 text-white' : rank === 2 ? 'bg-amber-700 text-white' : isAdvancing ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                      }`}>
                                        {rank + 1}
                                      </span>
                                      <span className="font-bold text-slate-900 dark:text-slate-100">{opt.name}</span>
                                      {isAdvancing && (
                                        <span className="text-[9px] px-1.5 py-0.2 bg-amber-500 text-white font-bold rounded shadow-2xs">
                                          晉級安全席位
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 font-mono text-slate-600 dark:text-slate-300 text-[11px]">
                                      <span className="font-bold text-slate-900 dark:text-white">{opt.votes.toLocaleString()} 票</span>
                                      <span className="text-slate-400">({percent}%)</span>
                                    </div>
                                  </div>

                                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        rank === 0 ? 'bg-amber-500' : rank === 1 ? 'bg-blue-500' : isAdvancing ? 'bg-amber-500' : 'bg-indigo-500'
                                      }`}
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* 晉級安全分界線 */}
                              {isCutoffLine && (
                                <div className="py-1 flex items-center gap-2 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                  <div className="h-px bg-amber-300 dark:bg-amber-800 flex-1 border-dashed border-t" />
                                  <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                                    <Award size={11} className="text-amber-500" />
                                    <span>── 以上為前 {phase.advanceTopCount} 名晉級安全線 ──</span>
                                  </div>
                                  <div className="h-px bg-amber-300 dark:bg-amber-800 flex-1 border-dashed border-t" />
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const target = statsCampaign;
                  setStatsCampaign(null);
                  setDetailLogsCampaign(target);
                }}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ListOrdered size={14} />
                <span>切換至投票明細日誌</span>
              </button>

              <button
                type="button"
                onClick={() => setStatsCampaign(null)}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 彈出視窗 2：投票明細審計視窗 (Voting Details & Logs Modal) */}
      {/* ========================================================================= */}
      {detailLogsCampaign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-5xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-indigo-600 border border-indigo-200/60 dark:border-indigo-800">
                  <ListOrdered size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-950 px-2 py-0.5 rounded-md font-mono">
                      {detailLogsCampaign.id}
                    </span>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      投票明細審計日誌
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {detailLogsCampaign.title} • 包含投票人ID、所選選項、投票時間、來源IP及防刷票攔截狀態
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* 匯出 CSV 按鈕 */}
                <button
                  type="button"
                  onClick={() => handleExportCSV(detailLogsCampaign)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="匯出當前投票的全部日誌 (CSV 格式)"
                >
                  <Download size={14} />
                  <span>匯出 CSV 明細</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDetailLogsCampaign(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Filter Toolbar (保留第一個搜尋ID 姓名 手機號的篩選) */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0 text-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="搜尋投票人ID、姓名、手機號、投票ID..."
                  value={detailSearchTerm}
                  onChange={(e) => setDetailSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Table Box */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold sticky top-0 backdrop-blur-xs whitespace-nowrap">
                    <th className="py-2.5 px-3">日誌單號</th>
                    <th className="py-2.5 px-3">投票人ID</th>
                    <th className="py-2.5 px-3">投票ID</th>
                    <th className="py-2.5 px-3">選項</th>
                    <th className="py-2.5 px-3">終端設備 & IP</th>
                    <th className="py-2.5 px-3">投票時間</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDetailLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Filter size={30} className="mx-auto mb-1.5 opacity-40" />
                        <p className="font-bold">查無符合條件的投票明細日誌</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDetailLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        {/* 日誌單號 */}
                        <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {log.id}
                        </td>

                        {/* 投票人ID */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                            {log.voterId}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <span>{log.voterName}</span>
                            {log.voterPhone && <span>• {log.voterPhone}</span>}
                          </div>
                        </td>

                        {/* 投票ID */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded font-mono font-bold text-[11px] border border-rose-200 dark:border-rose-900/50">
                            {log.voteItemId || log.campaignId}
                          </span>
                          {log.voteItemTitle && (
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]">
                              {log.voteItemTitle}
                            </div>
                          )}
                        </td>

                        {/* 選項 */}
                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {log.selectedOptionNames.map((name, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 rounded font-bold text-[10px]"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* 終端設備 & IP */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                            {log.voterDevice}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            IP: {log.voterIp}
                          </div>
                        </td>

                        {/* 投票時間 */}
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          {log.votedAt}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary & Close */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs shrink-0">
              <span className="text-slate-400 font-medium">
                共找到 <strong className="text-slate-900 dark:text-white">{filteredDetailLogs.length}</strong> 筆投票明細紀錄
              </span>

              <button
                type="button"
                onClick={() => setDetailLogsCampaign(null)}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
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
