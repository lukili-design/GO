/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { VotingCampaign, VotePhase, VoteOption, VoteItem } from '../../types';
import { getCampaignVoteItems } from '../../utils/votingHelpers';
import { 
  Check, Clock, ShieldCheck, AlertCircle, Sparkles, CheckCircle2, 
  Flame, Award, Share2, Info, Lock, ChevronRight, BarChart3, LayoutGrid, List,
  ArrowRight
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
  // Extract all VoteItems (supporting both new multi-item structure and legacy single-phase structure)
  const voteItems = getCampaignVoteItems(campaign);

  // Active VoteItem
  const defaultItemId = initialVoteItemId && voteItems.some(v => v.id === initialVoteItemId)
    ? initialVoteItemId
    : (voteItems[0]?.id || 'item_default');
  const [activeVoteItemId, setActiveVoteItemId] = useState<string>(defaultItemId);

  useEffect(() => {
    if (initialVoteItemId && voteItems.some(v => v.id === initialVoteItemId)) {
      setActiveVoteItemId(initialVoteItemId);
    }
  }, [initialVoteItemId, campaign]);

  const currentVoteItem: VoteItem = voteItems.find(v => v.id === activeVoteItemId) || voteItems[0] || {
    id: 'item_default',
    title: campaign.title,
    name: campaign.title,
    phases: campaign.phases,
    currentPhaseId: campaign.currentPhaseId || campaign.phases[0]?.id || 'PHASE-01',
    status: campaign.status
  };

  const currentVoteItemTitle = currentVoteItem.title || currentVoteItem.name || campaign.title;

  // Find current phase of the active vote item
  const currentItemPhases = currentVoteItem.phases && currentVoteItem.phases.length > 0
    ? currentVoteItem.phases
    : campaign.phases;
  
  const initialPhase = currentItemPhases.find(p => p.id === campaign.currentPhaseId) || currentItemPhases[0];
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>(initialPhase.id);

  // Track phase selection whenever active vote item changes
  useEffect(() => {
    const phases = currentVoteItem.phases && currentVoteItem.phases.length > 0 ? currentVoteItem.phases : campaign.phases;
    const matchedPhase = phases.find(p => p.id === selectedPhaseId) || phases[0];
    if (matchedPhase) {
      setSelectedPhaseId(matchedPhase.id);
    }
  }, [activeVoteItemId, campaign]);

  const currentPhase = currentItemPhases.find(p => p.id === selectedPhaseId) || initialPhase || {
    id: 'phase_default',
    name: '決賽評選',
    startTime: '2026-08-01 00:00:00',
    endTime: '2026-09-30 23:59:59',
    mode: 'SINGLE' as const,
    maxSelections: 1,
    requireAuth: true,
    frequencyLimit: 'ONCE_DAILY' as const,
    advanceRuleEnabled: false,
    options: [],
    status: 'ACTIVE' as const
  };

  // Selected Option IDs for current unvoted state
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  // Local voted state simulation per item: itemId -> optionIds[]
  const [votedItemsMap, setVotedItemsMap] = useState<Record<string, string[]>>({});
  // View mode for options: 'LIST' | 'GRID'
  const [layoutMode, setLayoutMode] = useState<'LIST' | 'GRID'>('LIST');

  // Login Prompt Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  // Toast error message
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Success animation state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync external voted state on mount / update
  useEffect(() => {
    if (userVotedOptionIds.length > 0) {
      setVotedItemsMap(prev => ({
        ...prev,
        [currentVoteItem.id]: userVotedOptionIds
      }));
    }
  }, [userVotedOptionIds]);

  // Is this phase already voted by user or naturally ended?
  const currentItemVotedIds = votedItemsMap[currentVoteItem.id] || [];
  const isPhaseEnded = currentPhase.status === 'ENDED';
  const isPhaseUpcoming = currentPhase.status === 'UPCOMING';
  const hasUserVoted = currentItemVotedIds.length > 0;
  // Should show result view? (If phase ended, or user has voted, or result is always public)
  const shouldShowResults = isPhaseEnded || hasUserVoted || campaign.resultVisibility === 'ALWAYS_PUBLIC';

  // Toggle selection
  const handleToggleOption = (optId: string) => {
    if (shouldShowResults) return; // cannot select in result view

    setErrorMessage(null);
    if (currentPhase.mode === 'SINGLE') {
      setSelectedOptionIds([optId]);
      if (triggerSound) triggerSound(700, 'sine', 0.05);
    } else {
      if (selectedOptionIds.includes(optId)) {
        setSelectedOptionIds(selectedOptionIds.filter(id => id !== optId));
        if (triggerSound) triggerSound(500, 'sine', 0.05);
      } else {
        if (selectedOptionIds.length >= currentPhase.maxSelections) {
          setErrorMessage(`最多只能選擇 ${currentPhase.maxSelections} 項！`);
          if (triggerSound) triggerSound(300, 'triangle', 0.15);
          return;
        }
        setSelectedOptionIds([...selectedOptionIds, optId]);
        if (triggerSound) triggerSound(750, 'sine', 0.06);
      }
    }
  };

  // Submit Vote Action
  const handleSubmitVote = () => {
    setErrorMessage(null);

    // Auth check
    if (currentPhase.requireAuth && !isLoggedIn) {
      setShowLoginModal(true);
      if (triggerSound) triggerSound(350, 'triangle', 0.15);
      return;
    }

    // Selection empty check
    if (selectedOptionIds.length === 0) {
      setErrorMessage('請先選擇您欲支持的候選項！');
      if (triggerSound) triggerSound(350, 'triangle', 0.15);
      return;
    }

    // Max selection check
    if (currentPhase.mode === 'MULTIPLE' && selectedOptionIds.length > currentPhase.maxSelections) {
      setErrorMessage(`最多只能選擇 ${currentPhase.maxSelections} 項！`);
      return;
    }

    setIsSubmitting(true);
    if (triggerSound) triggerSound(880, 'sine', 0.2);

    setTimeout(() => {
      setIsSubmitting(false);
      setVotedItemsMap(prev => ({
        ...prev,
        [currentVoteItem.id]: selectedOptionIds
      }));
      if (onVoteSubmit) {
        onVoteSubmit(campaign.id, currentPhase.id, selectedOptionIds);
      }
    }, 450);
  };

  // Switch Vote Item
  const handleSelectVoteItem = (item: VoteItem) => {
    setActiveVoteItemId(item.id);
    setSelectedOptionIds([]);
    setErrorMessage(null);
    const targetPhases = item.phases && item.phases.length > 0 ? item.phases : campaign.phases;
    const initialP = targetPhases.find(p => p.id === campaign.currentPhaseId) || targetPhases[0];
    if (initialP) {
      setSelectedPhaseId(initialP.id);
    }
    if (triggerSound) triggerSound(680, 'sine', 0.06);
  };

  // Navigate to Next unvoted item
  const handleGoNextUnvotedItem = () => {
    const nextUnvoted = voteItems.find(v => !votedItemsMap[v.id] || votedItemsMap[v.id].length === 0);
    if (nextUnvoted) {
      handleSelectVoteItem(nextUnvoted);
    }
  };

  // Calculate phase total votes
  const phaseTotalVotes = (currentPhase.options || []).reduce((sum, o) => sum + o.votes, 0) || 1;

  // Completed items count
  const completedCount = voteItems.filter(v => votedItemsMap[v.id] && votedItemsMap[v.id].length > 0).length;
  const nextUnvotedItem = voteItems.find(v => v.id !== currentVoteItem.id && (!votedItemsMap[v.id] || votedItemsMap[v.id].length === 0));

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

          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/90 backdrop-blur-md rounded-full text-white text-[11px] font-bold shadow-xs">
            <span>{currentPhase.mode === 'SINGLE' ? '單選投票' : `多選 (最多選 ${currentPhase.maxSelections} 項)`}</span>
          </div>
        </div>

        {/* Campaign Title & Current VoteItem Name */}
        <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
          <h2 className="text-base sm:text-lg font-black tracking-tight leading-snug line-clamp-1 drop-shadow-md">
            {campaign.title}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-200">
            {voteItems.length > 1 ? (
              <span className="font-bold text-amber-300">項目：{currentVoteItemTitle}（階段：{currentPhase.name}）</span>
            ) : (
              <span className="font-bold text-amber-300">當前階段：{currentPhase.name}</span>
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
      {/* 🌟 核心升級：多投票項目切換欄 (Multiple Vote Items Selector) */}
      {/* ========================================================================= */}
      {voteItems.length > 1 && (
        <div className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 p-2.5 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Sparkles size={13} className="text-rose-500" />
              <span>本活動設有 {voteItems.length} 個評選獎項</span>
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
      {/* 🌟 賽制階段導航 (Phase Timeline / Steps) */}
      {/* ========================================================================= */}
      {currentItemPhases.length > 1 && (
        <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 p-2.5">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Award size={12} className="text-indigo-500" />
              <span>賽制進程階段 (點擊切換查看)</span>
            </span>
            <span className="text-[10px] text-slate-400">共 {currentItemPhases.length} 個階段</span>
          </div>

          {/* Phase Timeline Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {currentItemPhases.map((p, idx) => {
              const isSelected = p.id === selectedPhaseId;
              const isEnded = p.status === 'ENDED';
              const isActive = p.status === 'ACTIVE';

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPhaseId(p.id);
                    setErrorMessage(null);
                    if (triggerSound) triggerSound(650 + idx * 50, 'sine', 0.06);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isEnded
                      ? 'bg-slate-200/80 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                      : isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <span>{p.name}</span>
                  {isEnded && (
                    <span className="text-[10px] px-1 py-0.2 bg-black/20 rounded font-normal">已結算</span>
                  )}
                  {isActive && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 晉級規則提示條 (Promotion Rule Banner) */}
      {/* ========================================================================= */}
      {currentPhase.advanceRuleEnabled && currentPhase.advanceTopCount && (
        <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 px-4 py-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
            <Award size={14} className="text-amber-500 shrink-0" />
            <span>
              賽制晉級規則：本階段票選排名前 <strong>{currentPhase.advanceTopCount}</strong> 名選手將自動晉級下一輪！
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full shrink-0 shadow-2xs">
            TOP {currentPhase.advanceTopCount} 晉級
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Header 提示區 & 佈局切換 */}
      {/* ========================================================================= */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
            <Clock size={13} className="text-amber-500" />
            <span>距離結束還有 <strong>2天 14:05:00</strong></span>
          </div>

          <span className="text-slate-300">•</span>

          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
            {currentPhase.frequencyLimit === 'ONCE_DAILY' ? '每日限投一次' : '活動限投一次'}
          </span>
        </div>

        {/* Layout Switcher (List / Grid) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
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

      {/* Success Notification Banner for multi-item continuous voting */}
      {hasUserVoted && nextUnvotedItem && (
        <div className="mx-4 mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>已投選「{currentVoteItemTitle}」！前往下一個獎項：</span>
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
              const isSelected = selectedOptionIds.includes(option.id);
              const isVotedByMe = currentItemVotedIds.includes(option.id);
              const votePercent = ((option.votes / phaseTotalVotes) * 100).toFixed(1);
              const isLeading = idx === 0;

              return (
                <div
                  key={option.id}
                  onClick={() => handleToggleOption(option.id)}
                  className={`relative p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                      : isVotedByMe
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {/* Selection Check Circle / Rank Badge */}
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
                            ? 'bg-blue-600 text-white shadow-xs'
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
                            isLeading ? 'bg-amber-500' : isVotedByMe ? 'bg-emerald-500' : 'bg-blue-600'
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
      {currentPhase.options.length > 0 && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
          {!shouldShowResults && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
                <span>
                  {currentPhase.mode === 'MULTIPLE' ? (
                    <span>已選擇 <strong>{selectedOptionIds.length}</strong> / {currentPhase.maxSelections} 項</span>
                  ) : (
                    <span>請選取 1 項候選人</span>
                  )}
                </span>
                <span className="flex items-center gap-1 text-[11px]">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  <span>實名認證安全投票</span>
                </span>
              </div>

              {/* [ 立即投票 ] Button */}
              <button
                type="button"
                disabled={isSubmitting || selectedOptionIds.length === 0}
                onClick={handleSubmitVote}
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
          )}

          {/* Voted Footer Banner */}
          {shouldShowResults && (
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
