/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { VotingCampaign, VotePhase, VoteOption, VoteItem } from '../../types';
import { getCampaignVoteItems } from '../../utils/votingHelpers';
import { 
  Check, Clock, ShieldCheck, AlertCircle, Sparkles, CheckCircle2, 
  Flame, Award, Share2, Info, Lock, ChevronRight, ChevronLeft, 
  BarChart3, LayoutGrid, List, ArrowRight, Layers, Send
} from 'lucide-react';

interface AppVotingWidgetProps {
  campaign: VotingCampaign;
  onVoteSubmit?: (campaignId: string, phaseId: string, optionIds: string[]) => void;
  userVotedOptionIds?: string[];
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
  triggerSound?: (freq: number, type: OscillatorType, duration: number) => void;
  initialVoteItemId?: string;
}

export const AppVotingWidget: React.FC<AppVotingWidgetProps> = ({
  campaign,
  onVoteSubmit,
  userVotedOptionIds = [],
  isLoggedIn = true,
  onRequireLogin,
  triggerSound,
  initialVoteItemId
}) => {
  // Extract all VoteItems
  const voteItems = getCampaignVoteItems(campaign);
  const isAllRequiredMode = campaign.submissionMode === 'ALL_REQUIRED';

  // ---------------------------------------------------------------------------
  // Step & Item State
  // ---------------------------------------------------------------------------
  // In ALL_REQUIRED mode, stepIndex drives active item (0 -> voteItems.length - 1)
  const [stepIndex, setStepIndex] = useState<number>(0);

  // In INDIVIDUAL mode, activeVoteItemId drives active item
  const defaultItemId = initialVoteItemId && voteItems.some(v => v.id === initialVoteItemId)
    ? initialVoteItemId
    : (voteItems[0]?.id || 'item_default');
  const [activeVoteItemId, setActiveVoteItemId] = useState<string>(defaultItemId);

  // Synchronize stepIndex if initialVoteItemId is given in ALL_REQUIRED mode
  useEffect(() => {
    if (initialVoteItemId) {
      const idx = voteItems.findIndex(v => v.id === initialVoteItemId);
      if (idx !== -1) {
        setStepIndex(idx);
        setActiveVoteItemId(initialVoteItemId);
      }
    }
  }, [initialVoteItemId, campaign]);

  // Derive current vote item based on submission mode
  const currentVoteItem: VoteItem = isAllRequiredMode
    ? (voteItems[stepIndex] || voteItems[0] || {
        id: 'item_default',
        title: campaign.title,
        name: campaign.title,
        phases: campaign.phases,
        currentPhaseId: campaign.currentPhaseId || campaign.phases[0]?.id || 'PHASE-01',
        status: campaign.status
      })
    : (voteItems.find(v => v.id === activeVoteItemId) || voteItems[0] || {
        id: 'item_default',
        title: campaign.title,
        name: campaign.title,
        phases: campaign.phases,
        currentPhaseId: campaign.currentPhaseId || campaign.phases[0]?.id || 'PHASE-01',
        status: campaign.status
      });

  const currentVoteItemTitle = currentVoteItem.title || currentVoteItem.name || campaign.title;

  // Phases of current item
  const currentItemPhases = currentVoteItem.phases && currentVoteItem.phases.length > 0
    ? currentVoteItem.phases
    : campaign.phases;
  
  const initialPhase = currentItemPhases.find(p => p.id === currentVoteItem.currentPhaseId || p.id === campaign.currentPhaseId) || currentItemPhases[0];
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>(initialPhase?.id || 'phase_default');

  // Track phase selection whenever active vote item changes
  useEffect(() => {
    const phases = currentVoteItem.phases && currentVoteItem.phases.length > 0 ? currentVoteItem.phases : campaign.phases;
    const matchedPhase = phases.find(p => p.id === selectedPhaseId) || phases[0];
    if (matchedPhase) {
      setSelectedPhaseId(matchedPhase.id);
    }
  }, [currentVoteItem.id, campaign]);

  const currentPhase: VotePhase = currentItemPhases.find(p => p.id === selectedPhaseId) || initialPhase || {
    id: 'phase_default',
    name: '全民決選',
    startTime: '2026-08-01 00:00:00',
    endTime: '2026-09-30 23:59:59',
    mode: 'SINGLE' as const,
    maxSelections: 1,
    requireAuth: true,
    frequencyLimit: 'ONCE_TOTAL' as const,
    advanceRuleEnabled: false,
    options: [],
    status: 'ACTIVE' as const
  };

  // ---------------------------------------------------------------------------
  // Selections & Submissions State
  // ---------------------------------------------------------------------------
  // For ALL_REQUIRED mode: stores draft selections for all items: { [itemId]: string[] }
  const [allRequiredDrafts, setAllRequiredDrafts] = useState<Record<string, string[]>>({});
  
  // For INDIVIDUAL mode: stores selected draft options for each item: { [itemId]: string[] }
  const [individualDraftsMap, setIndividualDraftsMap] = useState<Record<string, string[]>>({});

  // Maps itemId -> optionIds[] that have been submitted to server/database
  // 預設第 1、第 2 個投票 tab 為已完成投票狀態，第 3、第 4、第 5 個為未投票狀態
  const [votedItemsMap, setVotedItemsMap] = useState<Record<string, string[]>>(() => {
    const initialMap: Record<string, string[]> = {};
    if (voteItems.length >= 1 && voteItems[0]?.phases?.[0]?.options?.[0]?.id) {
      initialMap[voteItems[0].id] = [voteItems[0].phases[0].options[0].id];
    }
    if (voteItems.length >= 2 && voteItems[1]?.phases?.[0]?.options?.[0]?.id) {
      initialMap[voteItems[1].id] = [voteItems[1].phases[0].options[0].id];
    }
    return initialMap;
  });

  // Has all items been submitted (for ALL_REQUIRED mode)
  const [isAllSubmitted, setIsAllSubmitted] = useState(false);

  // View mode for options: 'LIST' | 'GRID'
  const [layoutMode, setLayoutMode] = useState<'LIST' | 'GRID'>('LIST');

  // Modal / Feedback state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBatchSuccessModal, setShowBatchSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Check if current item or all items are voted
  const currentItemVotedIds = votedItemsMap[currentVoteItem.id] || [];
  const isPhaseEnded = currentPhase.status === 'ENDED';
  const hasUserVotedThisItem = currentItemVotedIds.length > 0;
  const isCompletedAll = voteItems.every(v => votedItemsMap[v.id] && votedItemsMap[v.id].length > 0);

  // Should show results percentage bars for current item (when voted or phase ended)
  const shouldShowResults = isPhaseEnded || hasUserVotedThisItem || isAllSubmitted;

  // Active selections for current view
  const currentSelectedOptionIds = isAllRequiredMode
    ? (allRequiredDrafts[currentVoteItem.id] || [])
    : (individualDraftsMap[currentVoteItem.id] || []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  // Toggle selection for an option
  const handleToggleOption = (optId: string) => {
    if (hasUserVotedThisItem || isPhaseEnded) return; // Read-only once submitted or phase ended

    setErrorMessage(null);
    const existing = currentSelectedOptionIds;

    let updated: string[];
    if (currentPhase.mode === 'SINGLE') {
      updated = [optId];
      if (triggerSound) triggerSound(700, 'sine', 0.05);
    } else {
      if (existing.includes(optId)) {
        updated = existing.filter(id => id !== optId);
        if (triggerSound) triggerSound(500, 'sine', 0.05);
      } else {
        if (existing.length >= currentPhase.maxSelections) {
          setErrorMessage(`最多只能選擇 ${currentPhase.maxSelections} 項！`);
          if (triggerSound) triggerSound(300, 'triangle', 0.15);
          return;
        }
        updated = [...existing, optId];
        if (triggerSound) triggerSound(750, 'sine', 0.06);
      }
    }

    if (isAllRequiredMode) {
      setAllRequiredDrafts(prev => ({
        ...prev,
        [currentVoteItem.id]: updated
      }));
    } else {
      setIndividualDraftsMap(prev => ({
        ...prev,
        [currentVoteItem.id]: updated
      }));
    }
  };

  // Switch Vote Item (INDIVIDUAL mode)
  const handleSelectVoteItem = (item: VoteItem) => {
    setActiveVoteItemId(item.id);
    setErrorMessage(null);
    const targetPhases = item.phases && item.phases.length > 0 ? item.phases : campaign.phases;
    const initialP = targetPhases.find(p => p.id === item.currentPhaseId) || targetPhases[0];
    if (initialP) {
      setSelectedPhaseId(initialP.id);
    }
    if (triggerSound) triggerSound(680, 'sine', 0.06);
  };

  // Jump to specific step (ALL_REQUIRED mode)
  const handleJumpToStep = (targetStep: number) => {
    setErrorMessage(null);
    setStepIndex(targetStep);
    const targetItem = voteItems[targetStep];
    if (targetItem) {
      const targetPhases = targetItem.phases && targetItem.phases.length > 0 ? targetItem.phases : campaign.phases;
      const initialP = targetPhases.find(p => p.id === targetItem.currentPhaseId) || targetPhases[0];
      if (initialP) {
        setSelectedPhaseId(initialP.id);
      }
    }
    if (triggerSound) triggerSound(650 + targetStep * 40, 'sine', 0.06);
  };

  // Next Step (ALL_REQUIRED mode)
  const handleNextStep = () => {
    setErrorMessage(null);
    const curDraft = allRequiredDrafts[currentVoteItem.id] || [];

    // Validation: Current step must have selection
    if (curDraft.length === 0) {
      setErrorMessage(`請先為「${currentVoteItemTitle}」選取欲支持的候選項！`);
      if (triggerSound) triggerSound(350, 'triangle', 0.15);
      return;
    }

    if (stepIndex < voteItems.length - 1) {
      const nextStep = stepIndex + 1;
      setStepIndex(nextStep);
      const nextItem = voteItems[nextStep];
      if (nextItem) {
        const targetPhases = nextItem.phases && nextItem.phases.length > 0 ? nextItem.phases : campaign.phases;
        const initialP = targetPhases.find(p => p.id === nextItem.currentPhaseId) || targetPhases[0];
        if (initialP) {
          setSelectedPhaseId(initialP.id);
        }
      }
      if (triggerSound) triggerSound(780, 'sine', 0.08);
      // Smooth scroll back to top of container
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Previous Step (ALL_REQUIRED mode)
  const handlePrevStep = () => {
    setErrorMessage(null);
    if (stepIndex > 0) {
      const prevStep = stepIndex - 1;
      setStepIndex(prevStep);
      const prevItem = voteItems[prevStep];
      if (prevItem) {
        const targetPhases = prevItem.phases && prevItem.phases.length > 0 ? prevItem.phases : campaign.phases;
        const initialP = targetPhases.find(p => p.id === prevItem.currentPhaseId) || targetPhases[0];
        if (initialP) {
          setSelectedPhaseId(initialP.id);
        }
      }
      if (triggerSound) triggerSound(600, 'sine', 0.06);
    }
  };

  // Submit All Votes Together (ALL_REQUIRED mode)
  const handleSubmitAllVotes = () => {
    setErrorMessage(null);

    // Auth check
    if (currentPhase.requireAuth && !isLoggedIn) {
      setShowLoginModal(true);
      if (triggerSound) triggerSound(350, 'triangle', 0.15);
      return;
    }

    // Validate that every item has at least one selection
    for (let i = 0; i < voteItems.length; i++) {
      const item = voteItems[i];
      const selections = allRequiredDrafts[item.id] || [];
      if (selections.length === 0) {
        setStepIndex(i);
        const targetPhases = item.phases && item.phases.length > 0 ? item.phases : campaign.phases;
        const initialP = targetPhases.find(p => p.id === item.currentPhaseId) || targetPhases[0];
        if (initialP) setSelectedPhaseId(initialP.id);

        setErrorMessage(`第 ${i + 1} 項「${item.title || item.name}」尚未完成選取，請完成所有項目後再提交！`);
        if (triggerSound) triggerSound(350, 'triangle', 0.15);
        return;
      }
    }

    setIsSubmitting(true);
    if (triggerSound) triggerSound(880, 'sine', 0.2);

    setTimeout(() => {
      setIsSubmitting(false);
      // Batch record all votes
      const newVotedMap: Record<string, string[]> = { ...votedItemsMap };
      voteItems.forEach(item => {
        const itemSelections = allRequiredDrafts[item.id] || [];
        newVotedMap[item.id] = itemSelections;
        const targetPhases = item.phases && item.phases.length > 0 ? item.phases : campaign.phases;
        const targetPhase = targetPhases.find(p => p.id === item.currentPhaseId) || targetPhases[0];
        if (onVoteSubmit && targetPhase) {
          onVoteSubmit(campaign.id, targetPhase.id, itemSelections);
        }
      });

      setVotedItemsMap(newVotedMap);
      setIsAllSubmitted(true);
      setShowBatchSuccessModal(true);

      if (triggerSound) {
        triggerSound(950, 'sine', 0.3);
        setTimeout(() => triggerSound && triggerSound(1200, 'sine', 0.4), 200);
      }
    }, 500);
  };

  // Submit Individual Item (INDIVIDUAL mode) - 提交投票並自動跳轉至下一個投票 tab（第五個不跳轉直接 toast "投票成功"）
  const handleSubmitIndividualVote = () => {
    setErrorMessage(null);

    // Auth check
    if (currentPhase.requireAuth && !isLoggedIn) {
      setShowLoginModal(true);
      if (triggerSound) triggerSound(350, 'triangle', 0.15);
      return;
    }

    const currentDrafts = individualDraftsMap[currentVoteItem.id] || [];

    // Selection empty check
    if (currentDrafts.length === 0) {
      setErrorMessage('請先選擇您欲支持的候選項！');
      if (triggerSound) triggerSound(350, 'triangle', 0.15);
      return;
    }

    // Max selection check
    if (currentPhase.mode === 'MULTIPLE' && currentDrafts.length > currentPhase.maxSelections) {
      setErrorMessage(`最多只能選擇 ${currentPhase.maxSelections} 項！`);
      return;
    }

    setIsSubmitting(true);
    if (triggerSound) triggerSound(880, 'sine', 0.2);

    const submittedItemId = currentVoteItem.id;
    const submittedSelections = [...currentDrafts];

    setTimeout(() => {
      setIsSubmitting(false);
      
      const newVotedMap: Record<string, string[]> = {
        ...votedItemsMap,
        [submittedItemId]: submittedSelections
      };
      setVotedItemsMap(newVotedMap);

      if (onVoteSubmit) {
        onVoteSubmit(campaign.id, currentPhase.id, submittedSelections);
      }
      if (triggerSound) triggerSound(950, 'sine', 0.3);

      // 觸發 Toast 提示「投票成功」
      showToast('投票成功');

      const currentIdx = voteItems.findIndex(v => v.id === submittedItemId);
      const isLastItem = currentIdx === voteItems.length - 1;

      // 如果不是最後一個投票 tab（例如第三、第四個），投票成功後自動跳轉到下一個投票 tab
      // 如果是第五個投票（最後一個投票 tab），不需要跳轉，直接留在當前 tab
      if (!isLastItem && currentIdx + 1 < voteItems.length) {
        const nextItem = voteItems[currentIdx + 1];
        handleSelectVoteItem(nextItem);
      }
    }, 400);
  };

  // Navigate to next unvoted item (INDIVIDUAL mode)
  const handleGoNextUnvotedItem = () => {
    const nextUnvoted = voteItems.find(v => !votedItemsMap[v.id] || votedItemsMap[v.id].length === 0);
    if (nextUnvoted) {
      handleSelectVoteItem(nextUnvoted);
    }
  };

  // Calculate phase total votes
  const phaseTotalVotes = (currentPhase.options || []).reduce((sum, o) => sum + o.votes, 0) || 1;
  const completedCount = voteItems.filter(v => votedItemsMap[v.id] && votedItemsMap[v.id].length > 0).length;
  const nextUnvotedItem = voteItems.find(v => v.id !== currentVoteItem.id && (!votedItemsMap[v.id] || votedItemsMap[v.id].length === 0));

  // Count draft completions in ALL_REQUIRED mode
  const draftCompletedCount = voteItems.filter(v => (allRequiredDrafts[v.id] || []).length > 0).length;
  const activeStepNum = isAllRequiredMode
    ? stepIndex + 1
    : (voteItems.findIndex(v => v.id === activeVoteItemId) + 1 || 1);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden font-sans select-none transition-all">
      
      {/* ========================================================================= */}
      {/* 頂部封面圖與投票狀態（進行中） */}
      {/* ========================================================================= */}
      <div className="relative w-full h-40 sm:h-48 bg-slate-950 overflow-hidden">
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

        {/* 投票狀態（進行中）標籤 */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            {campaign.status === 'ACTIVE' && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-md inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                <span>進行中</span>
              </span>
            )}
            {campaign.status === 'UPCOMING' && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-md inline-flex items-center whitespace-nowrap">
                即將開始
              </span>
            )}
            {campaign.status === 'ENDED' && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-600 text-white shadow-md inline-flex items-center whitespace-nowrap">
                已結束
              </span>
            )}
          </div>

          <div className="text-[11px] font-mono font-bold text-slate-200 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
            共 {voteItems.length} 個投票
          </div>
        </div>

        {/* 活動主標題 */}
        <div className="absolute bottom-3 left-3 right-3 z-10 text-white space-y-1">
          <h2 className="text-base sm:text-lg font-black tracking-tight leading-snug drop-shadow-md line-clamp-1">
            {campaign.title}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
            <span className="flex items-center gap-1 text-amber-300 font-bold">
              <Clock size={12} />
              <span>截止時間：{campaign.endTime || (currentPhase ? currentPhase.endTime : '依官方公告')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 顯示投票1 / 投票2 / 投票3 / 投票4 / 投票5 Tab 切換列 + 進度條 */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white p-2.5 border-b border-slate-800 space-y-2">
        {/* 投票1 ~ 投票N 按鈕 Tab 列 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {voteItems.map((item, idx) => {
            const currentItemIdx = isAllRequiredMode ? stepIndex : voteItems.findIndex(v => v.id === activeVoteItemId);
            const isCurrent = idx === currentItemIdx;
            const hasDraftSelection = (allRequiredDrafts[item.id] || []).length > 0;
            const isSubmitted = Boolean(votedItemsMap[item.id] && votedItemsMap[item.id].length > 0);
            const isFinished = hasDraftSelection || isSubmitted;

            return (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => {
                  if (isAllRequiredMode) {
                    handleJumpToStep(idx);
                  } else {
                    handleSelectVoteItem(item);
                  }
                }}
                className={`py-2 px-3.5 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white font-black shadow-md'
                    : isFinished
                    ? 'bg-slate-800/90 text-emerald-400 border border-emerald-500/40 hover:bg-slate-700 font-bold'
                    : 'bg-slate-800/60 text-slate-300 border border-slate-700/80 hover:bg-slate-800 font-medium'
                }`}
              >
                {isFinished ? (
                  <Check size={13} strokeWidth={3} className="text-emerald-400 shrink-0" />
                ) : null}
                <span className="text-xs">投票{idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* 進度條 */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-amber-400 transition-all duration-300"
            style={{ 
              width: `${(isAllRequiredMode 
                ? ((stepIndex + 1) / voteItems.length) 
                : (((voteItems.findIndex(v => v.id === activeVoteItemId) + 1) || 1) / voteItems.length)) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 下方切換對應的標題、簡介、選項 */}
      {/* ========================================================================= */}
      <div className="px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 space-y-1.5">
        <div className="space-y-1">
          {/* 直接顯示標題，去掉切換按鈕與「投票1」標籤 */}
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
            {currentVoteItemTitle}
          </h3>
          {currentVoteItem.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {currentVoteItem.description}
            </p>
          )}
        </div>

        {/* 模式提示：單選 / 多選(最多可選3項) */}
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60">
            {currentPhase.mode === 'SINGLE' ? '單選' : `多選(最多可選${currentPhase.maxSelections || 3}項)`}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 dark:text-slate-400 font-medium">候選項目共 {currentPhase.options.length} 項</span>
        </div>
      </div>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="mx-4 mt-3 p-3 bg-slate-900/95 dark:bg-slate-800/95 border border-slate-700 text-white rounded-2xl flex items-center gap-2 text-xs font-bold shadow-lg animate-bounce z-20">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
          <span className="flex-1">{toastMessage}</span>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="mx-4 mt-3 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold animate-shake">
          <AlertCircle size={15} className="shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 候選選項列表 (Options Container) */}
      {/* ========================================================================= */}
      <div className="p-4 space-y-3">
        {currentPhase.options.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Award size={32} className="mx-auto text-slate-300" />
            <p className="text-xs font-bold">本階段暫未公佈候選名單</p>
          </div>
        ) : (
          <div className={layoutMode === 'GRID' ? 'grid grid-cols-2 gap-3' : 'space-y-2.5'}>
            {currentPhase.options.map((option, idx) => {
              const isSelected = currentSelectedOptionIds.includes(option.id);
              const isVotedByMe = currentItemVotedIds.includes(option.id);
              const votePercent = ((option.votes / phaseTotalVotes) * 100).toFixed(1);

              return (
                <div
                  key={option.id}
                  onClick={() => handleToggleOption(option.id)}
                  className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    isVotedByMe
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                      : isSelected
                      ? 'bg-purple-50/90 dark:bg-purple-950/50 border-purple-500 shadow-md ring-2 ring-purple-500/30 active:scale-[0.99]'
                      : hasUserVotedThisItem
                      ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-90'
                      : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-purple-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 active:scale-[0.99]'
                  }`}
                >
                  {/* Avatar / Info / Status Indicator */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Avatar */}
                      {option.avatar ? (
                        <img
                          src={option.avatar}
                          alt={option.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                          #{idx + 1}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black text-xs sm:text-sm truncate ${
                            isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-900 dark:text-white'
                          }`}>
                            {option.name}
                          </span>
                        </div>
                        {option.description && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Voted Indicator (已投票完成時顯示 ✅) */}
                    {isVotedByMe && (
                      <div className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-2xs shrink-0">
                        <Check size={13} strokeWidth={3.5} />
                        <span>已投</span>
                      </div>
                    )}

                    {/* 勾選按鈕 (未投票狀態時顯示醒目的勾選圓圈/選中狀態) */}
                    {!hasUserVotedThisItem && (
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/40 scale-105'
                            : 'border-2 border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {isSelected && <Check size={14} strokeWidth={3.5} />}
                      </div>
                    )}
                  </div>

                  {/* Real-time Percentage Bar (When Showing Results) */}
                  {shouldShowResults && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-medium font-mono">
                        <span className="text-slate-500 dark:text-slate-400">
                          {option.votes.toLocaleString()} 票
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {votePercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isVotedByMe ? 'bg-emerald-500' : 'bg-purple-600'
                          }`}
                          style={{ width: `${votePercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 底部投票控制列 (Action Bottom Bar) */}
      {/* ========================================================================= */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        
        {/* 🌟 1. ALL_REQUIRED 統一提交模式下的底部控制列 (上個投票 / 下個投票 / 提交所有投票) */}
        {isAllRequiredMode && (
          <div>
            {!shouldShowResults ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                  <span>
                    第 <strong>{stepIndex + 1}</strong> / {voteItems.length} 項：
                    {currentSelectedOptionIds.length > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">已選取候選人</span>
                    ) : (
                      <span className="text-amber-600 font-bold ml-1">尚未選取</span>
                    )}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    已選取 {draftCompletedCount} / {voteItems.length} 項
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* 上個投票按鈕 (Step > 0 時顯示) */}
                  {stepIndex > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="py-3.5 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs shrink-0"
                    >
                      <ChevronLeft size={16} />
                      <span>上個投票</span>
                    </button>
                  )}

                  {/* 核心按鈕：下個投票 OR 到最後一個變為 提交所有投票 */}
                  {stepIndex < voteItems.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-2xl text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <span>下個投票</span>
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSubmitAllVotes}
                      className="flex-1 py-3.5 px-4 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={15} />
                          <span>提交所有投票</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <CheckCircle2 size={16} />
                    <span>您已完成全部 {voteItems.length} 項評選投票！</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    票數即時統計中
                  </span>
                </div>

                {/* 切換查看其他項目的實時開票結果 */}
                <div className="flex items-center gap-1 overflow-x-auto pt-1 scrollbar-none">
                  {voteItems.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() => handleJumpToStep(idx)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                        stepIndex === idx
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      投票 {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🌟 2. INDIVIDUAL 模式下的底部控制列 (投選當前項目 / 已投票狀態) */}
        {!isAllRequiredMode && (
          <div>
            {!hasUserVotedThisItem ? (
              /* 未投票樣式：下方顯示「提交投票」 */
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isSubmitting || currentSelectedOptionIds.length === 0}
                  onClick={handleSubmitIndividualVote}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>提交投票中...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>提交投票</span>
                      <ChevronRight size={15} />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* 已投票樣式：下方顯示「已投票」，旁邊顯示「下一個投票」 */
              <div className="flex items-center justify-between gap-3 p-1">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <span>已投票</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const currentIdx = voteItems.findIndex(v => v.id === currentVoteItem.id);
                    if (currentIdx !== -1 && currentIdx + 1 < voteItems.length) {
                      handleSelectVoteItem(voteItems[currentIdx + 1]);
                    } else {
                      // 若已是最後一個 tab，切換至未投項目或回到第 1 個
                      const nextUnvoted = voteItems.find(v => !votedItemsMap[v.id] || votedItemsMap[v.id].length === 0);
                      if (nextUnvoted) {
                        handleSelectVoteItem(nextUnvoted);
                      } else {
                        handleSelectVoteItem(voteItems[0]);
                      }
                    }
                    if (triggerSound) triggerSound(600, 'sine', 0.05);
                  }}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <span>下一個投票</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 🌟 統一提交成功彈窗 (Batch Submit Success Celebration Modal) */}
      {/* ========================================================================= */}
      {showBatchSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-purple-800 p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-rose-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30 animate-bounce">
              <Award size={28} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg">
                🎉 投票成功提交！
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                感謝您的熱情參與！您已成功完成本活動全部 <strong>{voteItems.length}</strong> 個評選項目的投票，所有選票已計入總選票池！
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl text-left space-y-1 text-xs">
              <div className="text-[11px] font-bold text-slate-400">已提交評選項目：</div>
              {voteItems.map((v, i) => (
                <div key={v.id || i} className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                  <span className="truncate">投票 {i + 1}. {v.title || v.name}</span>
                  <Check size={13} className="text-emerald-500 shrink-0" />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowBatchSuccessModal(false)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-black shadow-md cursor-pointer hover:opacity-90 transition-all"
            >
              查看即時開票榜單
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 未登入防呆提示 Modal */}
      {/* ========================================================================= */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
              <Award size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                請先登入會員帳號
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                登入會員帳號後方可投下您神聖的一票。
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                稍後再說
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  if (onRequireLogin) onRequireLogin();
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                立即登入
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
