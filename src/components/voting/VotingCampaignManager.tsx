/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { 
  VotingCampaign, VoteItem, VotePhase, VoteOption, VoteResultVisibility, 
  VoteCampaignStatus, VoteSelectionMode, VoteFrequencyLimit, VoteLogRecord,
  VoteSubmissionMode
} from '../../types';
import { INITIAL_VOTE_LOGS } from '../../data/voteMockData';
import { getCampaignVoteItems, syncCampaignFromVoteItems, calculatePhaseAutoStatus } from '../../utils/votingHelpers';
import { 
  Search, Plus, Edit3, BarChart2, Trash2, CheckCircle2, 
  Calendar, Layers, Clock, ShieldCheck, ChevronDown, ChevronUp, 
  Sparkles, Image as ImageIcon, Check, Copy, AlertCircle, ArrowLeft,
  Users, Award, HelpCircle, Eye, Sliders, X, Upload, RefreshCw, Lock,
  FileSpreadsheet, Download, Filter, User, Smartphone, Laptop, Globe,
  CalendarCheck, ArrowUpDown, CheckCircle, AlertTriangle, TrendingUp, PieChart,
  ListOrdered, ExternalLink, Tag, Grid, Columns, LayoutGrid, CheckSquare,
  Square, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, FileText, Settings2,
  Sparkle, Move, CheckCheck
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
  campaigns: VotingCampaign[];
  onSaveCampaign: (campaign: VotingCampaign) => void;
  onDeleteCampaign: (campaignId: string) => void;
  triggerSound: (freq: number, type: OscillatorType, duration: number) => void;
}

export const VotingCampaignManager: React.FC<VotingCampaignManagerProps> = ({
  campaigns,
  onSaveCampaign,
  onDeleteCampaign,
  triggerSound
}) => {
  // Mode: 'LIST' | 'FORM'
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | VoteCampaignStatus>('ALL');

  // Selected campaign for viewing Overall Statistics Modal
  const [statsCampaign, setStatsCampaign] = useState<VotingCampaign | null>(null);
  const [statsActiveVoteItemTab, setStatsActiveVoteItemTab] = useState<string>('ALL');
  const [statsActivePhaseTab, setStatsActivePhaseTab] = useState<string>('ALL');

  // Selected campaign for viewing Detail Logs Modal
  const [detailLogsCampaign, setDetailLogsCampaign] = useState<VotingCampaign | null>(null);
  const [detailSearchTerm, setDetailSearchTerm] = useState('');
  const [detailVoteItemFilter, setDetailVoteItemFilter] = useState('ALL');
  const [detailPhaseFilter, setDetailPhaseFilter] = useState('ALL');
  const [detailStatusFilter, setDetailStatusFilter] = useState('ALL');
  const [detailAuthFilter, setDetailAuthFilter] = useState('ALL');

  // Stored Vote Logs state (Mock repository for audit inspection)
  const [voteLogs, setVoteLogs] = useState<VoteLogRecord[]>(() => {
    try {
      const saved = localStorage.getItem('tvb_voting_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_VOTE_LOGS;
  });

  // Form Editing State
  const [editingCampaign, setEditingCampaign] = useState<VotingCampaign | null>(null);
  const [activeVoteItemIndex, setActiveVoteItemIndex] = useState<number>(0);
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [advanceSuccessMessage, setAdvanceSuccessMessage] = useState<string | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

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
                          (c.creator && c.creator.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [campaigns, searchTerm, statusFilter]);

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
    setViewMode('FORM');
    triggerSound(600, 'sine', 0.1);
  };

  // Open Edit Form
  const handleOpenEdit = (campaign: VotingCampaign) => {
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
    setActiveVoteItemIndex(0);
    setActivePhaseIndex(0);
    setFormErrors([]);
    setViewMode('FORM');
    triggerSound(650, 'sine', 0.1);
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
      alert('活動至少需要保留一個投票組件！');
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
      alert('活動至少需要保留 1 個投票組件，無法全部刪除！');
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
    alert(`✅ 已成功將活動起止時間 (${start} ~ ${end}) 同步給 ${targetIndices.length} 個投票組件！`);
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
  const handleSaveCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    const errors: string[] = [];

    if (!editingCampaign.title.trim()) {
      errors.push('活動名稱不能為空！');
    }

    const items = getCampaignVoteItems(editingCampaign);
    if (items.length === 0) {
      errors.push('活動必須包含至少一個評選投票項目！');
    }

    items.forEach((item, itemIdx) => {
      if (!item.title.trim()) {
        errors.push(`投票項目 #${itemIdx + 1} 的名稱不能為空！`);
      }
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
      voteItems: items
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

  // 📥 匯出當前活動的投票日誌為 CSV 檔案
  const handleExportCSV = (campaign: VotingCampaign) => {
    const logs = voteLogs.filter(log => log.campaignId === campaign.id);
    if (logs.length === 0) {
      alert('目前該活動尚無投票日誌明細可匯出！');
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
      {/* 視圖一：投票活動管理列表 (Campaign List) */}
      {/* ========================================================================= */}
      {viewMode === 'LIST' && (
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
                投票活動管理列表
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                完整管理全台多階段賽制投票活動，支援開始/結束時間排程、創建審計追蹤、總體數據指標與投票日誌明細查詢。
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              type="button"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>新建投票活動</span>
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-88">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="按活動名稱、編號或創建人搜尋..."
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
                  {st === 'ALL' && '全部活動'}
                  {st === 'ACTIVE' && '進行中'}
                  {st === 'UPCOMING' && '未開始'}
                  {st === 'ENDED' && '已結束'}
                </button>
              ))}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold whitespace-nowrap">
                    <th className="py-3 px-3.5">活動編號</th>
                    <th className="py-3 px-3.5 min-w-[200px]">活動名稱</th>
                    <th className="py-3 px-3.5 text-center">關聯投票組件數量</th>
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
                      <td colSpan={11} className="py-14 text-center text-slate-400">
                        <Award size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="font-bold">未找到符合條件的投票活動</p>
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

                      return (
                        <tr key={camp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          {/* 活動編號 */}
                          <td className="py-3.5 px-3.5 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            {camp.id}
                          </td>

                          {/* 活動名稱 & 封面 */}
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
                                title="查看活動總體統計數據看板"
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

                              {/* 編輯按鈕 */}
                              <button
                                onClick={() => handleOpenEdit(camp)}
                                type="button"
                                title="編輯投票活動配置"
                                className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              >
                                <Edit3 size={12} className="text-blue-600 dark:text-blue-400" />
                                <span>編輯</span>
                              </button>

                              {/* 刪除按鈕 */}
                              <button
                                onClick={() => {
                                  if (confirm(`確定要刪除「${camp.title}」投票活動嗎？此操作無法撤銷。`)) {
                                    onDeleteCampaign(camp.id);
                                    triggerSound(350, 'triangle', 0.15);
                                  }
                                }}
                                type="button"
                                title="刪除投票活動"
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
      {/* 視圖二：新建/編輯投票活動表單 (🌟 核心頁面 - 基礎設定 + 賽制階段 + 選項) */}
      {/* ========================================================================= */}
      {viewMode === 'FORM' && editingCampaign && (
        <form onSubmit={handleSaveCampaignSubmit} className="space-y-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setViewMode('LIST');
                  triggerSound(500, 'sine', 0.08);
                }}
                className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {campaigns.some(c => c.id === editingCampaign.id) ? '編輯投票活動' : '新建投票活動'}
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  活動編號：{editingCampaign.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Check size={15} />
                <span>保存並發布</span>
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
          {/* 活動基礎設置 (增加開始/結束時間、創建人等) */}
          {/* ========================================== */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  活動基礎設置與排程
                </h3>
              </div>
              <span className="text-xs text-slate-400">全域基礎設定</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 活動名稱 */}
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  活動名稱 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingCampaign.title}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, title: e.target.value })}
                  placeholder="例如：2026 萬千星輝最佳員工與藝員年度大獎"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 創建人 */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  活動創建人 / 負責部門 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={editingCampaign.creator || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, creator: e.target.value })}
                    placeholder="例如：陳總監 (綜藝節目科) / TVB GO 運營組"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
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

              {/* 開始時間 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    活動開始時間 <span className="text-rose-500">*</span>
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
                    活動結束時間 <span className="text-rose-500">*</span>
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

              {/* 結果公開規則 */}
              <div className="md:col-span-2 space-y-1">
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
                  <option value="AFTER_CAMPAIGN_END">活動結束後公開 (進行中保密，結束後公佈)</option>
                </select>
              </div>

              {/* 活動封面圖 */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  活動封面圖 <span className="text-rose-500">*</span>
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
                          <img src={editingCampaign.coverImage} alt="活動封面預覽" className="w-full h-full object-cover" />
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
                  活動簡介 (富文本/詳細規則說明)
                </label>
                <textarea
                  rows={3}
                  value={editingCampaign.description}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, description: e.target.value })}
                  placeholder="介紹本投票活動之背景、多階段晉級賽制與投票須知..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* 🌟 評選投票項目管理 (Multiple VoteItems & Phases) */}
          {/* ========================================== */}
          {(() => {
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

            // Filtered vote items based on search query and status filter
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
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Award size={18} className="text-rose-500" />
                      <span>投票組件配置</span>
                    </h3>
                    <span className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-mono text-[11px] font-bold rounded-full border border-rose-200 dark:border-rose-900/60">
                      已配置 {voteItems.length} 個組件
                    </span>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setShowReorderModal(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                      title="調整所有組件的排列順序"
                    >
                      <ArrowUpDown size={13} />
                      <span>順序調度</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicateVoteItem(currentItemIndex)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                      title="複製當前選中的投票組件"
                    >
                      <Copy size={13} />
                      <span>複製組件</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddVoteItem}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Plus size={14} />
                      <span>＋ 新增組件</span>
                    </button>
                  </div>
                </div>

                {/* 🌟 控制列：搜尋、快速跳轉下拉選單、檢視模式切換 */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  {/* Left: Quick Search & Status Filter */}
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        value={voteItemSearchQuery}
                        onChange={(e) => setVoteItemSearchQuery(e.target.value)}
                        placeholder="快速檢索組件名稱或候選人..."
                        className="w-full pl-8.5 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                      />
                      {voteItemSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setVoteItemSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Status Filter */}
                    <select
                      value={voteItemStatusFilter}
                      onChange={(e) => setVoteItemStatusFilter(e.target.value as any)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
                    >
                      <option value="ALL">全部狀態 ({voteItems.length})</option>
                      <option value="ACTIVE">🟢 進行中 ({voteItems.filter(i => i.status === 'ACTIVE').length})</option>
                      <option value="UPCOMING">⚪ 未開始 ({voteItems.filter(i => i.status === 'UPCOMING').length})</option>
                      <option value="ENDED">🔴 已結束 ({voteItems.filter(i => i.status === 'ENDED').length})</option>
                    </select>

                    {/* Direct Jump Dropdown */}
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <span className="font-bold shrink-0 hidden sm:inline">直達跳轉:</span>
                      <select
                        value={currentItemIndex}
                        onChange={(e) => {
                          const targetIdx = parseInt(e.target.value);
                          setActiveVoteItemIndex(targetIdx);
                          setActivePhaseIndex(0);
                          triggerSound(600, 'sine', 0.05);
                        }}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-black focus:outline-none focus:border-rose-500 max-w-[180px] sm:max-w-[220px] truncate"
                      >
                        {voteItems.map((item, idx) => (
                          <option key={item.id || idx} value={idx}>
                            #{idx + 1} {item.title || `投票組件 #${idx + 1}`} ({item.status === 'ACTIVE' ? '進行中' : item.status === 'UPCOMING' ? '未開始' : '已結束'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right: Layout Switcher */}
                  <div className="flex items-center gap-1 self-end md:self-auto bg-slate-200/70 dark:bg-slate-700/60 p-0.5 rounded-lg border border-slate-300/50 dark:border-slate-600">
                    <button
                      type="button"
                      onClick={() => setVoteItemLayoutMode('SPLIT')}
                      className={`px-2.5 py-1 rounded-md text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                        voteItemLayoutMode === 'SPLIT'
                          ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                      title="雙欄目錄專注佈局"
                    >
                      <Columns size={13} />
                      <span>雙欄目錄</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVoteItemLayoutMode('GRID')}
                      className={`px-2.5 py-1 rounded-md text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                        voteItemLayoutMode === 'GRID'
                          ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                      title="矩陣看板總覽"
                    >
                      <LayoutGrid size={13} />
                      <span>矩陣總覽</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVoteItemLayoutMode('TABS')}
                      className={`px-2.5 py-1 rounded-md text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                        voteItemLayoutMode === 'TABS'
                          ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                      title="經典橫向標籤頁"
                    >
                      <Layers size={13} />
                      <span>標籤欄</span>
                    </button>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* 模式 1：矩陣看板總覽視圖 (GRID Overview) */}
                {/* ========================================================================= */}
                {voteItemLayoutMode === 'GRID' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>組件矩陣看板 ({filteredVoteItemsWithIndex.length} / {voteItems.length})：點擊任意卡片可直接進入配置</span>
                      <span className="text-slate-400 text-[11px]">支援拖動、複製、刪除或切換雙欄檢視</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                      {filteredVoteItemsWithIndex.map(({ item, originalIndex }) => {
                        const totalCandidates = item.phases.reduce((sum, p) => sum + (p.options?.length || 0), 0);
                        const isCurrent = currentItemIndex === originalIndex;

                        return (
                          <div
                            key={item.id || originalIndex}
                            onClick={() => {
                              setActiveVoteItemIndex(originalIndex);
                              setActivePhaseIndex(0);
                              setVoteItemLayoutMode('SPLIT');
                              triggerSound(600, 'sine', 0.05);
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                              isCurrent
                                ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-500 shadow-md ring-2 ring-rose-500/20'
                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-sm'
                            }`}
                          >
                            <div>
                              {/* Top Bar: Index & Status */}
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black ${
                                    isCurrent ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}>
                                    #{originalIndex + 1}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    item.status === 'ACTIVE'
                                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                                      : item.status === 'UPCOMING'
                                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 border border-blue-200 dark:border-blue-800'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                                  }`}>
                                    {item.status === 'ACTIVE' ? '進行中' : item.status === 'UPCOMING' ? '未開始' : '已結束'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveVoteItemDirect(originalIndex, 'UP');
                                    }}
                                    disabled={originalIndex === 0}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 rounded text-slate-500"
                                    title="上移"
                                  >
                                    <ArrowUp size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveVoteItemDirect(originalIndex, 'DOWN');
                                    }}
                                    disabled={originalIndex === voteItems.length - 1}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 rounded text-slate-500"
                                    title="下移"
                                  >
                                    <ArrowDown size={12} />
                                  </button>
                                </div>
                              </div>

                              {/* Title & Description */}
                              <h4 className="font-black text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-rose-600 transition-colors">
                                {item.title || `投票組件 #${originalIndex + 1}`}
                              </h4>
                              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 min-h-[32px]">
                                {item.description || '點擊進入配置階段與候選人名單...'}
                              </p>
                            </div>

                            {/* Bottom stats & quick buttons */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-2 text-slate-500">
                                <span className="font-mono font-bold bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                  {item.phases.length} 階段
                                </span>
                                <span className="font-mono font-bold bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                  {totalCandidates} 候選人
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateVoteItem(originalIndex);
                                  }}
                                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-700"
                                  title="複製"
                                >
                                  <Copy size={12} />
                                </button>
                                {voteItems.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveVoteItem(originalIndex);
                                    }}
                                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded text-slate-400 hover:text-rose-600"
                                    title="刪除"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* 模式 2 & 3：雙欄目錄 (SPLIT) 或 橫向標籤 (TABS) 視圖 */}
                {/* ========================================================================= */}
                {voteItemLayoutMode !== 'GRID' && (
                  <div className={voteItemLayoutMode === 'SPLIT' ? 'flex flex-col lg:flex-row gap-5 items-start' : 'space-y-4'}>
                    {/* Level 1 Sidebar or Ribbon Tabs */}
                    {voteItemLayoutMode === 'SPLIT' ? (
                      /* Left Sidebar Master List */
                      <div className="w-full lg:w-80 shrink-0 bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex flex-col space-y-2 lg:max-h-[820px] lg:overflow-y-auto sticky top-2 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700 px-1">
                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <ListOrdered size={14} className="text-rose-500" />
                            <span>組件目錄 ({filteredVoteItemsWithIndex.length})</span>
                          </span>
                          <span className="text-[11px] text-slate-400">上下鍵/點擊切換</span>
                        </div>

                        {/* List Items */}
                        <div className="space-y-1.5 pr-0.5">
                          {filteredVoteItemsWithIndex.map(({ item, originalIndex }) => {
                            const totalCandidates = item.phases.reduce((sum, p) => sum + (p.options?.length || 0), 0);
                            const isCurrent = currentItemIndex === originalIndex;

                            return (
                              <div
                                key={item.id || originalIndex}
                                onClick={() => {
                                  setActiveVoteItemIndex(originalIndex);
                                  setActivePhaseIndex(0);
                                  triggerSound(600, 'sine', 0.05);
                                }}
                                className={`group p-2.5 rounded-xl text-xs transition-all cursor-pointer border relative flex items-center justify-between gap-2 ${
                                  isCurrent
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                    : 'bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    isCurrent ? 'bg-white text-rose-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                  }`}>
                                    {originalIndex + 1}
                                  </div>

                                  <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold truncate text-xs leading-tight">
                                        {item.title || `投票組件 #${originalIndex + 1}`}
                                      </span>
                                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold shrink-0 ${
                                        isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-rose-600 dark:text-rose-400'
                                      }`}>
                                        ID: {item.id}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                                      <span className={`px-1 py-0.2 rounded font-mono ${
                                        isCurrent ? 'bg-white/20 text-white' : 'text-slate-400'
                                      }`}>
                                        {item.phases.length} 階段 • {totalCandidates} 候選
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Hover Reorder Buttons */}
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveVoteItemDirect(originalIndex, 'UP');
                                    }}
                                    disabled={originalIndex === 0}
                                    className={`p-1 rounded opacity-60 hover:opacity-100 disabled:opacity-20 ${
                                      isCurrent ? 'hover:bg-rose-700 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600'
                                    }`}
                                    title="向上移"
                                  >
                                    <ChevronUp size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveVoteItemDirect(originalIndex, 'DOWN');
                                    }}
                                    disabled={originalIndex === voteItems.length - 1}
                                    className={`p-1 rounded opacity-60 hover:opacity-100 disabled:opacity-20 ${
                                      isCurrent ? 'hover:bg-rose-700 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600'
                                    }`}
                                    title="向下移"
                                  >
                                    <ChevronDown size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* Mode: TABS Horizontal Ribbon */
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>活動投票組件清單 ({filteredVoteItemsWithIndex.length} / {voteItems.length})：</span>
                          <span className="text-[11px] text-slate-400 font-normal">點擊切換配置，可點擊箭頭調整先後順序</span>
                        </div>
                        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5">
                          {filteredVoteItemsWithIndex.map(({ item, originalIndex }) => {
                            const totalCandidates = item.phases.reduce((sum, p) => sum + (p.options?.length || 0), 0);
                            const isCurrent = currentItemIndex === originalIndex;

                            return (
                              <div
                                key={item.id || originalIndex}
                                onClick={() => {
                                  setActiveVoteItemIndex(originalIndex);
                                  setActivePhaseIndex(0);
                                  triggerSound(600, 'sine', 0.05);
                                }}
                                className={`group px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 shrink-0 transition-all cursor-pointer border ${
                                  isCurrent
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                  isCurrent ? 'bg-white text-rose-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}>
                                  {originalIndex + 1}
                                </div>

                                <div className="flex flex-col items-start">
                                  <div className="flex items-center gap-1.5">
                                    <span className="truncate max-w-[130px] leading-tight">
                                      {item.title || `投票組件 #${originalIndex + 1}`}
                                    </span>
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${
                                      isCurrent ? 'bg-white/20 text-white' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                                    }`}>
                                      ID: {item.id}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span className={`text-[9px] px-1 py-0.1 rounded font-mono ${
                                      isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200/70 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                    }`}>
                                      {item.phases.length} 階段
                                    </span>
                                    <span className={`text-[9px] px-1 py-0.1 rounded font-mono ${
                                      isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200/70 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                    }`}>
                                      {totalCandidates} 候選
                                    </span>
                                  </div>
                                </div>

                                {/* Quick Move */}
                                <div className="flex items-center gap-0.5 ml-1 border-l border-white/20 dark:border-slate-700 pl-1">
                                  {originalIndex > 0 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveVoteItemDirect(originalIndex, 'UP');
                                      }}
                                      className={`p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity ${
                                        isCurrent ? 'hover:bg-rose-700 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500'
                                      }`}
                                      title="向前移動此組件"
                                    >
                                      ←
                                    </button>
                                  )}
                                  {originalIndex < voteItems.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveVoteItemDirect(originalIndex, 'DOWN');
                                      }}
                                      className={`p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity ${
                                        isCurrent ? 'hover:bg-rose-700 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500'
                                      }`}
                                      title="向後移動此組件"
                                    >
                                      →
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Level 2: Current Vote Item Details */}
                {currentItem && (
                  <div className="flex-1 min-w-0 w-full p-5 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-6">
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

                      <div className="md:col-span-2 space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          投票組件名稱 (獎項/主題/類別) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={currentItem.title}
                          onChange={(e) => updateCurrentItem(item => ({ ...item, title: e.target.value }))}
                          placeholder="例如：最佳劇集 / 最受歡迎女藝員 / 最佳綜藝節目"
                          className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="md:col-span-3 space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          組件評選須知 / 規則說明 (選填)
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
                            賽制階段配置 ({phases.length} 階段)
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            (支援 40進20、20進7 淘汰賽與獨立單/多選防刷票規則)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddPhase}
                          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs"
                        >
                          <Plus size={14} />
                          <span>為此項目新增賽制階段</span>
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

                          {/* Phase Fields (One field per row, with start/end time together on one row) */}
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

                            {/* 3. 投票人 */}
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                投票人
                              </label>
                              <select
                                value="TVB_GO_MEMBER"
                                disabled
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold cursor-default focus:outline-none"
                              >
                                <option value="TVB_GO_MEMBER">TVB GO會員</option>
                              </select>
                            </div>

                            {/* 4. 單選 / 多選模式 */}
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

                            {/* 5. 最多可選票數 (當選擇多選模式時獨立佔一行) */}
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

                            {/* 6. 投票頻率 (防刷票限制頻率) */}
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
                )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Form Bottom Bar */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Check size={16} />
              <span>保存並發布投票活動</span>
            </button>
          </div>
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

            {/* 額外分析維度：終端設備與認證方式佔比 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 終端設備分佈 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Smartphone size={14} className="text-blue-500" />
                  <span>投票終端設備分佈</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span className="text-slate-600 dark:text-slate-300">iOS App (TVB GO)</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">58.4% (22,437人)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '58.4%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span className="text-slate-600 dark:text-slate-300">Android App (TVB GO)</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">32.2% (12,371人)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '32.2%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span className="text-slate-600 dark:text-slate-300">Web 網頁端 (手機/電腦瀏覽器)</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">9.4% (3,612人)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '9.4%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 認證身分分佈 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>投票者認證方式佔比</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span className="text-slate-600 dark:text-slate-300">TVB GO 正式註冊會員</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">74.5%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '74.5%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span className="text-slate-600 dark:text-slate-300">電視城員工內部 SSO 認證</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">16.8%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '16.8%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span className="text-slate-600 dark:text-slate-300">香港手機簡訊實名驗證</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">8.7%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '8.7%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 賽制各階段得票排行榜 */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Award size={14} className="text-amber-500" />
                  <span>各賽制階段候選人得票分佈與即時排行榜</span>
                </h4>

                {/* 階段切換 Tab */}
                <div className="flex items-center gap-1">
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
                  title="匯出當前活動的全部投票日誌 (CSV 格式)"
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
