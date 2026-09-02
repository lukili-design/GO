/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VoteArticle, VotingCampaign } from '../../types';
import { getCampaignVoteItems } from '../../utils/votingHelpers';
import { AppVotingWidget } from './AppVotingWidget';
import { 
  ArrowLeft, Share2, Heart, MessageSquare, Bookmark, 
  Sparkles, Eye, Calendar, User, CheckCircle2, ShieldCheck,
  Clock, Users, Flame, ChevronRight, ChevronDown, ChevronUp, Vote, Award
} from 'lucide-react';

interface AppArticleDetailViewProps {
  article: VoteArticle;
  campaigns: VotingCampaign[];
  onBack: () => void;
  onSelectCampaign?: (campaign: VotingCampaign, voteItemId?: string) => void;
  onVoteSubmit?: (campaignId: string, phaseId: string, optionIds: string[]) => void;
  userVotes?: Record<string, string[]>;
  triggerSound: (freq: number, type: OscillatorType, duration: number) => void;
}

export const AppArticleDetailView: React.FC<AppArticleDetailViewProps> = ({
  article,
  campaigns,
  onBack,
  onSelectCampaign,
  onVoteSubmit,
  userVotes = {},
  triggerSound
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1280);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
    triggerSound(800, 'sine', 0.08);
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    triggerSound(700, 'sine', 0.08);
  };

  const handleShare = () => {
    setShowShareToast(true);
    triggerSound(900, 'sine', 0.1);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  // Parse article content and replace [VOTE_ID: xxx] with voting cards
  const contentParts = article.content.split(/(\[VOTE_ID:\s*[^\]]+\])/g);

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-100 dark:bg-slate-950 flex flex-col font-sans pb-24 overscroll-contain">
      
      {/* Top Mobile Bar */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={() => {
            onBack();
            triggerSound(500, 'sine', 0.08);
          }}
          className="p-1.5 -ml-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
        >
          <ArrowLeft size={18} />
          <span>返回 TVB 快訊</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleShare}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            title="分享文章"
          >
            <Share2 size={16} />
          </button>
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isBookmarked ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
            title="收藏文章"
          >
            <Bookmark size={16} className={isBookmarked ? 'fill-amber-500' : ''} />
          </button>
        </div>
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/95 text-white text-xs font-bold rounded-full shadow-lg border border-slate-700 flex items-center gap-1.5 animate-bounce">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>專屬文章與投票連結已複製到剪貼簿！</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full max-w-lg mx-auto p-3.5 space-y-4">
        
        {/* Article Header Card: 封面圖 + 介紹 (請為你喜歡的明星或電視劇投票) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="relative w-full h-48 bg-slate-950">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[11px] font-black shadow-xs flex items-center gap-1">
                <Sparkles size={11} className="text-amber-300" />
                <span>{article.category}</span>
              </span>
              <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white rounded-full text-[10px] font-bold">
                5大獎項投票
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-3">
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
              {article.title}
            </h1>

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-b border-slate-100 dark:border-slate-800/80 py-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">{article.author}</span>
                <span>•</span>
                <span>{article.publishDate.substring(0, 10)}</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <Eye size={13} />
                <span>{article.viewCount.toLocaleString()} 閱讀</span>
              </div>
            </div>

            {/* 介紹區塊 (白底黑字普通樣式) */}
            {article.summary && (
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal pt-1">
                {article.summary}
              </p>
            )}
          </div>
        </div>

        {/* Dynamic Body Rendering: Text and 5 Interactive Voting Cards (跟互動投票中的卡片一致) */}
        <div className="space-y-3.5">
          {contentParts.map((part, idx) => {
            const match = part.match(/\[VOTE_ID:\s*([^\]]+)\]/);
            if (match) {
              const campaignId = match[1].trim();
              const targetCampaign = campaigns.find(c => c.id === campaignId);

              if (!targetCampaign) {
                return (
                  <div key={idx} className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 font-bold">
                    【未找到編號為 {campaignId} 的投票活動】
                  </div>
                );
              }

              const voteItems = getCampaignVoteItems(targetCampaign);
              const currentPhase = targetCampaign.phases.find(p => p.id === targetCampaign.currentPhaseId) || targetCampaign.phases[0];
              const hasVoted = Boolean(userVotes[targetCampaign.id] && userVotes[targetCampaign.id].length > 0);

              return (
                <div key={idx} className="space-y-2 my-2">
                  {/* 互動投票卡片 (與 AppVotingListView 活動列表完全一致) */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all">
                    {/* 1. 封面圖 (Cover Image) - 點擊進入活動 */}
                    <div
                      onClick={() => {
                        if (onSelectCampaign) {
                          onSelectCampaign(targetCampaign);
                        }
                        triggerSound(700, 'sine', 0.08);
                      }}
                      className="relative w-full h-36 sm:h-40 bg-slate-900 overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={targetCampaign.coverImage}
                        alt={targetCampaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent"></div>

                      {/* 2. 狀態標籤 (Status Badges) */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {targetCampaign.status === 'ACTIVE' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-xs inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                              <span>進行中</span>
                            </span>
                          )}
                          {targetCampaign.status === 'UPCOMING' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs inline-flex items-center whitespace-nowrap shrink-0">
                              即將開始
                            </span>
                          )}
                          {targetCampaign.status === 'ENDED' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-600 text-white shadow-xs inline-flex items-center whitespace-nowrap shrink-0">
                              已結束
                            </span>
                          )}

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600/90 backdrop-blur-md text-white shadow-xs inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                            <Award size={11} />
                            <span>設有 {voteItems.length} 個評選項目</span>
                          </span>
                        </div>

                        {hasVoted && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white inline-flex items-center gap-1 shadow-xs whitespace-nowrap shrink-0">
                            <CheckCircle2 size={11} className="text-emerald-300" />
                            <span>已參與投票</span>
                          </span>
                        )}
                      </div>

                      {/* 標題與截止日期 */}
                      <div className="absolute bottom-2.5 left-3 right-3 z-10 text-white space-y-1">
                        <h3 className="text-sm sm:text-base font-black tracking-tight leading-snug drop-shadow-md truncate">
                          {targetCampaign.title}
                        </h3>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <Clock size={11} className="text-amber-400" />
                            <span>截止: {targetCampaign.endTime ? targetCampaign.endTime.substring(5, 16) : (currentPhase ? currentPhase.endTime.substring(5, 16) : '依賽程')}</span>
                          </span>
                          <span className="text-amber-300 font-bold whitespace-nowrap">
                            共 {targetCampaign.phases.length} 個賽制階段
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. 內容區：活動簡介 + 包含的多個投票項目清單 */}
                    <div className="p-3.5 space-y-3">
                      {/* 描述摘要 */}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {targetCampaign.description}
                      </p>

                      {/* 🌟 投票項目清單 */}
                      <div className="space-y-1.5 pt-0.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 px-0.5">
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <Sparkles size={12} className="text-rose-500" />
                            <span>本活動包含以下 {voteItems.length} 項評選投票：</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal whitespace-nowrap">
                            點選直達投票
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {voteItems.map((item, vIdx) => {
                            const curP = item.phases.find(p => p.id === item.currentPhaseId) || item.phases[0] || targetCampaign.phases[0];
                            const options = curP?.options || [];
                            const itemTitle = item.title || item.name || `評選項目 #${vIdx + 1}`;

                            return (
                              <div
                                key={item.id || vIdx}
                                onClick={() => {
                                  if (onSelectCampaign) {
                                    onSelectCampaign(targetCampaign, item.id);
                                  }
                                  triggerSound(750, 'sine', 0.08);
                                }}
                                className="group/item px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-rose-400 dark:hover:border-rose-800 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition-all cursor-pointer flex items-center justify-between gap-2.5"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  {/* 序號標籤 */}
                                  <div className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black text-[10px] flex items-center justify-center shrink-0 group-hover/item:border-rose-400 group-hover/item:text-rose-600 transition-colors">
                                    {vIdx + 1}
                                  </div>

                                  <div className="min-w-0 flex-1 space-y-0.5">
                                    {/* 項目標題 - 單行截斷 */}
                                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-rose-600 dark:group-hover/item:text-rose-400 transition-colors truncate whitespace-nowrap">
                                      {itemTitle}
                                    </div>
                                    {/* 階段與候選人數量標籤 */}
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 whitespace-nowrap overflow-hidden">
                                      <span className="px-1.5 py-0.2 bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[9px] font-medium shrink-0">
                                        {curP ? curP.name : `${item.phases.length}階段`}
                                      </span>
                                      <span className="shrink-0">•</span>
                                      <span className="shrink-0">{options.length} 位候選</span>
                                      <span className="shrink-0">•</span>
                                      <span className="text-slate-500 dark:text-slate-400 shrink-0">
                                        {curP?.mode === 'SINGLE' ? '單選' : `多選(最多${curP?.maxSelections}項)`}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* 候選頭像縮圖疊加 + 快捷按鈕 */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {options.length > 0 && (
                                    <div className="hidden sm:flex items-center -space-x-1.5 shrink-0">
                                      {options.slice(0, 3).map((opt, oIdx) => (
                                        <img
                                          key={opt.id || oIdx}
                                          src={opt.avatar}
                                          alt={opt.name}
                                          className="w-5 h-5 rounded-full object-cover border border-white dark:border-slate-900 shadow-2xs shrink-0"
                                        />
                                      ))}
                                    </div>
                                  )}

                                  <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover/item:bg-rose-600 group-hover/item:text-white transition-all whitespace-nowrap inline-flex items-center gap-0.5 shrink-0">
                                    <span>投選</span>
                                    <ChevronRight size={11} />
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 底部數據與進入活動主按鈕 */}
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap overflow-hidden">
                          <span className="inline-flex items-center gap-1">
                            <Users size={12} className="text-blue-500 shrink-0" />
                            <span className="font-bold text-slate-700 dark:text-slate-200">
                              {targetCampaign.totalParticipants.toLocaleString()}
                            </span>人
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Flame size={12} className="text-rose-500 shrink-0" />
                            <span className="font-bold text-slate-700 dark:text-slate-200">
                              {targetCampaign.totalVotes.toLocaleString()}
                            </span>票
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectCampaign) {
                              onSelectCampaign(targetCampaign);
                            }
                            triggerSound(700, 'sine', 0.08);
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                        >
                          <span>進入活動</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (!part.trim()) return null;

            // Simple formatting for markdown text (Headers, bold, lists, dividers)
            const lines = part.split('\n');
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed shadow-xs space-y-2.5"
              >
                {lines.map((line, lIdx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <div key={lIdx} className="h-1.5" />;

                  if (trimmed === '---') {
                    return <hr key={lIdx} className="border-t border-slate-100 dark:border-slate-800 my-2" />;
                  }

                  if (trimmed.startsWith('### ')) {
                    return (
                      <h3 key={lIdx} className="text-sm font-black text-slate-900 dark:text-slate-100 pt-2 pb-0.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                        <span>{trimmed.replace('### ', '')}</span>
                      </h3>
                    );
                  }
                  if (trimmed.startsWith('## ')) {
                    return (
                      <h2 key={lIdx} className="text-base font-black text-slate-900 dark:text-slate-100 pt-1 pb-1">
                        {trimmed.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (/^\d+\.\s/.test(trimmed)) {
                    return (
                      <div key={lIdx} className="flex items-start gap-2 pl-1.5 text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">{trimmed.match(/^\d+\./)?.[0]}</span>
                        <span>{trimmed.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                    );
                  }
                  if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                    return (
                      <div key={lIdx} className="flex items-start gap-2 pl-2 text-slate-600 dark:text-slate-300">
                        <span className="text-blue-500 font-bold shrink-0">•</span>
                        <span>{trimmed.replace(/^[-•]\s*/, '')}</span>
                      </div>
                    );
                  }

                  return (
                    <p key={lIdx} className="leading-relaxed">
                      {line}
                    </p>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Article Bottom Actions */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-around text-xs font-bold text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer ${
              isLiked ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Heart size={16} className={isLiked ? 'fill-rose-500' : ''} />
            <span>{likeCount} 點讚</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Share2 size={16} />
            <span>分享專題</span>
          </button>
        </div>

      </div>

    </div>
  );
};
