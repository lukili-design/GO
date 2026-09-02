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
  
  // For INDIVIDUAL mode: stores selected options for currently active item
  const [individualSelections, setIndividualSelections] = useState<string[]>([]);

  // Maps itemId -> optionIds[] that have been submitted to server/database
  const [votedItemsMap, setVotedItemsMap] = useState<Record<string, string[]>>({});

  // Has all items been submitted (for ALL_REQUIRED mode)
  const [isAllSubmitted, setIsAllSubmitted] = useState(false);

  // View mode for options: 'LIST' | 'GRID'
  const [layoutMode, setLayoutMode] = useState<'LIST' | 'GRID'>('LIST');

  // Modal / Feedback state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBatchSuccessModal, setShowBatchSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync external voted state on mount
  useEffect(() => {
    if (userVotedOptionIds.length > 0) {
      setVotedItemsMap(prev => ({
        ...prev,
        [currentVoteItem.id]: userVotedOptionIds
      }));
    }
  }, [userVotedOptionIds]);

  // Check if current item or all items are voted
  const currentItemVotedIds = votedItemsMap[currentVoteItem.id] || [];
  const isPhaseEnded = currentPhase.status === 'ENDED';
  const hasUserVotedThisItem = currentItemVotedIds.length > 0;
  const isCompletedAll = voteItems.every(v => votedItemsMap[v.id] && votedItemsMap[v.id].length > 0);

  // Should show results for current item
  const shouldShowResults = isPhaseEnded || hasUserVotedThisItem || isAllSubmitted || campaign.resultVisibility === 'ALWAYS_PUBLIC';

  // Active selections for current view
  const currentSelectedOptionIds = isAllRequiredMode
    ? (allRequiredDrafts[currentVoteItem.id] || [])
    : individualSelections;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  // Toggle selection for an option
  const handleToggleOption = (optId: string) => {
    if (shouldShowResults) return; // Read-only once submitted or phase ended

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
      setIndividualSelections(updated);
    }
  };

  // Switch Vote Item (INDIVIDUAL mode)
  const handleSelectVoteItem = (item: VoteItem) => {
    setActiveVoteItemId(item.id);
    setIndividualSelections([]);
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

  // Submit Individual Item (INDIVIDUAL mode)
  const handleSubmitIndividualVote = () => {
    setErrorMessage(null);

    // Auth check
    if (currentPhase.requireAuth && !isLoggedIn) {
      setShowLoginModal(true);
      if (triggerSound) triggerSound(350, 'triangle', 0.15);
      return;
    }

    // Selection empty check
    if (individualSelections.length === 0) {
      setErrorMessage('請先選擇您欲支持的候選項！');
      if (triggerSound) triggerSound(350, 'triangle', 0.15);
      return;
    }

    // Max selection check
    if (currentPhase.mode === 'MULTIPLE' && individualSelections.length > currentPhase.maxSelections) {
      setErrorMessage(`最多只能選擇 ${currentPhase.maxSelections} 項！`);
      return;
    }

    setIsSubmitting(true);
    if (triggerSound) triggerSound(880, 'sine', 0.2);

    setTimeout(() => {
      setIsSubmitting(false);
      setVotedItemsMap(prev => ({
        ...prev,
        [currentVoteItem.id]: individualSelections
      }));
      if (onVoteSubmit) {
        onVoteSubmit(campaign.id, currentPhase.id, individualSelections);
      }
      if (triggerSound) triggerSound(950, 'sine', 0.3);
    }, 450);
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

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden font-sans select-none transition-all">
      
      {/* ========================================================================= */}
      {/* 頂部封面與活動標題 */}
      {/* ========================================================================= */}
      <div className="relative w-full h-36 sm:h-44 bg-slate-950 overflow-hidden">
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        {/* Status Badge & Mode */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[11px] font-bold border border-white/20">
            <Sparkles size={12} className="text-amber-400" />
            <span>TVB GO 互動投票</span>
          </div>

          <div className="inline-flex items-center gap-1.5">
            {isAllRequiredMode ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600/90 backdrop-blur-md rounded-full text-white text-[11px] font-bold shadow-xs">
                <Layers size={11} />
                <span>需全部投完統一提交</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/90 backdrop-blur-md rounded-full text-white text-[11px] font-bold shadow-xs">
                <span>支持單個投票組件提交</span>
              </span>
            )}
          </div>
        </div>

        {/* Campaign Title & Current VoteItem Name */}
        <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
          <h2 className="text-base sm:text-lg font-black tracking-tight leading-snug line-clamp-1 drop-shadow-md">
            {campaign.title}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-200">
            {isAllRequiredMode ? (
              <span className="font-bold text-amber-300">
                評選進度：第 {stepIndex + 1} / {voteItems.length} 項（{currentVoteItemTitle}）
              </span>
            ) : (
              <span className="font-bold text-amber-300">
                當前項目：{currentVoteItemTitle}
              </span>
            )}
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-slate-300" />
              <span>進行中</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 模式一：ALL_REQUIRED 專用 Wizard 步驟進度導航條 (Sequential Stepper) */}
      {/* ========================================================================= */}
      {isAllRequiredMode && voteItems.length > 1 && (
        <div className="bg-slate-900 text-white p-3 border-b border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1.5 font-black text-amber-300">
              <Layers size={14} className="text-purple-400" />
              <span>依序評選流程：第 {stepIndex + 1} / {voteItems.length} 項</span>
            </div>
            <div className="text-[11px] font-mono text-slate-300">
              已選 <strong className="text-amber-400">{draftCompletedCount}</strong> / {voteItems.length} 項
            </div>
          </div>

          {/* Stepper Steps Bar */}
          <div className="grid grid-cols-5 gap-1.5">
            {voteItems.map((item, idx) => {
              const isCurrent = idx === stepIndex;
              const hasDraftSelection = (allRequiredDrafts[item.id] || []).length > 0;
              const isSubmitted = Boolean(votedItemsMap[item.id] && votedItemsMap[item.id].length > 0);
              const isFinished = hasDraftSelection || isSubmitted;

              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => handleJumpToStep(idx)}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 relative ${
                    isCurrent
                      ? 'bg-gradient-to-b from-purple-600 to-indigo-600 text-white ring-2 ring-purple-400 shadow-md scale-[1.02]'
                      : isFinished
                      ? 'bg-slate-800/90 text-emerald-400 border border-emerald-500/50 hover:bg-slate-700'
                      : 'bg-slate-800/40 text-slate-400 border border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[11px] font-black">
                    {isFinished ? (
                      <Check size={11} strokeWidth={3} className="text-emerald-400" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold truncate max-w-[56px] leading-tight block">
                    {item.title ? item.title.replace(/[🎬🎼💡🎨📽️🌟👑💐🎵]/g, '').trim().substring(0, 4) : `項目${idx + 1}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-rose-500 to-amber-400 transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / voteItems.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 模式二：INDIVIDUAL 專用多投票項目切換 Tab (Free Tabs Selector) */}
      {/* ========================================================================= */}
      {!isAllRequiredMode && voteItems.length > 1 && (
        <div className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 p-2.5 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Sparkles size={13} className="text-rose-500" />
              <span>本活動設有 {voteItems.length} 個評選獎項（支持隨時單獨投選）</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              已投選 <strong className="text-rose-600 dark:text-rose-400">{completedCount}</strong> / {voteItems.length}
            </div>
          </div>

          {/* Vote Items Tab Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {voteItems.map((item, idx) => {
              const isSelected = item.id === currentVoteItem.id;
              const isVoted = Boolean(votedItemsMap[item.id] && votedItemsMap[item.id].length > 0);
              const itemLabel = item.title || item.name || `項目 #${idx + 1}`;

              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => handleSelectVoteItem(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs whitespace-nowrap ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-xs'
                      : isVoted
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="whitespace-nowrap">{itemLabel}</span>
                  {isVoted ? (
                    <CheckCircle2 size={12} className={isSelected ? 'text-white' : 'text-emerald-500'} />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 當前評選項目標題橫幅 (Current Active Step Headline) */}
      {/* ========================================================================= */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-black rounded-md shrink-0">
              {isAllRequiredMode ? `評選項目 #${stepIndex + 1}` : `當前評選`}
            </span>
            <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
              {currentVoteItemTitle}
            </h3>
          </div>
          {currentVoteItem.description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {currentVoteItem.description}
            </p>
          )}
        </div>

        {/* Layout Switcher (List / Grid) */}
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setLayoutMode('LIST')}
            className={`p-1 rounded-md text-xs transition-all cursor-pointer ${
              layoutMode === 'LIST' ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-600' : 'text-slate-400'
            }`}
            title="列表視圖"
          >
            <List size={14} />
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode('GRID')}
            className={`p-1 rounded-md text-xs transition-all cursor-pointer ${
              layoutMode === 'GRID' ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-600' : 'text-slate-400'
            }`}
            title="網格卡片視圖"
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="mx-4 mt-3 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold animate-shake">
          <AlertCircle size={15} className="shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Notification Banner for continuous voting in INDIVIDUAL mode */}
      {!isAllRequiredMode && hasUserVotedThisItem && nextUnvotedItem && (
        <div className="mx-4 mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>已完成本項投票！前往下一個獎項：</span>
          </div>
          <button
            type="button"
            onClick={handleGoNextUnvotedItem}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-xs"
          >
            <span>{nextUnvotedItem.title || nextUnvotedItem.name}</span>
            <ArrowRight size={13} />
          </button>
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
              const isLeading = idx === 0;

              return (
                <div
                  key={option.id}
                  onClick={() => handleToggleOption(option.id)}
                  className={`relative p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 shadow-sm'
                      : isVotedByMe
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {/* Selection Check Circle / Avatar / Info */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar */}
                      {option.avatar ? (
                        <img
                          src={option.avatar}
                          alt={option.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                          #{idx + 1}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                            {option.name}
                          </span>
                          {isLeading && shouldShowResults && (
                            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded text-[9px] font-black">
                              領先
                            </span>
                          )}
                        </div>
                        {option.description && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Radio / Checkbox Indicator */}
                    {!shouldShowResults && (
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    )}

                    {/* Voted Indicator */}
                    {isVotedByMe && (
                      <div className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                        <Check size={11} strokeWidth={3} />
                        <span>已投</span>
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
                            isLeading ? 'bg-amber-500' : isVotedByMe ? 'bg-emerald-500' : 'bg-purple-600'
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
        
        {/* 🌟 1. ALL_REQUIRED 模式下的底部控制列 (下一步 / 提交所有投票) */}
        {isAllRequiredMode && (
          <div>
            {!shouldShowResults ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>
                    第 <strong>{stepIndex + 1}</strong> / {voteItems.length} 項：
                    {currentSelectedOptionIds.length > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">已選取候選人</span>
                    ) : (
                      <span className="text-amber-600 font-bold">尚未選取</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    <span>實名認證防刷機制</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* 上一步按鈕 (Step > 0 時顯示) */}
                  {stepIndex > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="py-3.5 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <ChevronLeft size={16} />
                      <span>上一步</span>
                    </button>
                  )}

                  {/* 核心主按鈕：下一步 OR 提交所有投票 */}
                  {stepIndex < voteItems.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-2xl text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <span>下一步（第 {stepIndex + 2} / {voteItems.length} 項）</span>
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSubmitAllVotes}
                      className="flex-1 py-3.5 px-4 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] animate-pulse"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={15} />
                          <span>提交所有投票（共 {voteItems.length} 項評選）</span>
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
                      {idx + 1}. {item.title ? item.title.replace(/[🎬🎼💡🎨📽️🌟👑💐🎵]/g, '').trim().substring(0, 4) : `項目${idx + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🌟 2. INDIVIDUAL 模式下的底部控制列 (投選當前項目) */}
        {!isAllRequiredMode && (
          <div>
            {!shouldShowResults ? (
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
                  <span>
                    {currentPhase.mode === 'MULTIPLE' ? (
                      <span>已選擇 <strong>{individualSelections.length}</strong> / {currentPhase.maxSelections} 項</span>
                    ) : (
                      <span>請選取 1 項候選人</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    <span>實名認證安全投票</span>
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting || individualSelections.length === 0}
                  onClick={handleSubmitIndividualVote}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>投選「{currentVoteItemTitle}」</span>
                      <ChevronRight size={15} />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 px-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                  <CheckCircle2 size={13} />
                  <span>您已完成「{currentVoteItemTitle}」投票，結果實時累計中</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  累計票數：{phaseTotalVotes.toLocaleString()}
                </div>
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
                感謝您的熱情參與！您已成功完成本活動全部 <strong>{voteItems.length}</strong> 個評選項目的投票，所有選票已上鏈計入總選票池！
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl text-left space-y-1 text-xs">
              <div className="text-[11px] font-bold text-slate-400">已提交評選項目：</div>
              {voteItems.map((v, i) => (
                <div key={v.id || i} className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                  <span className="truncate">{i + 1}. {v.title || v.name}</span>
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
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 mx-auto flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                請先登入 TVB GO 會員
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                本活動強制開啟實名認證防刷機制，需登入官方會員帳號後方可投下神聖的一票。
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
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
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
