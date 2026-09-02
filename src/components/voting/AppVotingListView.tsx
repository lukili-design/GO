/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VotingCampaign } from '../../types';
import { getCampaignVoteItems } from '../../utils/votingHelpers';
import { 
  Sparkles, Users, Award, Clock, ChevronRight, 
  CheckCircle2, Flame, Calendar, Search, Filter, Layers 
} from 'lucide-react';

interface AppVotingListViewProps {
  campaigns: VotingCampaign[];
  onSelectCampaign: (campaign: VotingCampaign, initialVoteItemId?: string) => void;
  userVotes?: Record<string, string[]>;
  triggerSound: (freq: number, type: OscillatorType, duration: number) => void;
}

export const AppVotingListView: React.FC<AppVotingListViewProps> = ({
  campaigns,
  onSelectCampaign,
  userVotes = {},
  triggerSound
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'ENDED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCampaigns = campaigns.filter(camp => {
    const matchesFilter = 
      filterTab === 'ALL' || 
      (filterTab === 'ACTIVE' && camp.status === 'ACTIVE') || 
      (filterTab === 'ENDED' && camp.status === 'ENDED');
    
    const voteItems = getCampaignVoteItems(camp);
    const itemTitles = voteItems.map(v => v.title || v.name || '').join(' ');

    const matchesSearch = 
      camp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      camp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemTitles.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-8 font-sans">
      
      {/* 搜尋與篩選欄 */}
      <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋活動標題、評選獎項或關鍵字..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        {/* 狀態切換 Tab */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setFilterTab('ALL');
              triggerSound(600, 'sine', 0.05);
            }}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              filterTab === 'ALL'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            全部活動 ({campaigns.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterTab('ACTIVE');
              triggerSound(600, 'sine', 0.05);
            }}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              filterTab === 'ACTIVE'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            進行中 ({campaigns.filter(c => c.status === 'ACTIVE').length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterTab('ENDED');
              triggerSound(600, 'sine', 0.05);
            }}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              filterTab === 'ENDED'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            已結束 ({campaigns.filter(c => c.status === 'ENDED').length})
          </button>
        </div>
      </div>

      {/* 投票活動列表 */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <div className="p-10 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2.5">
            <Award size={36} className="mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs text-slate-500 font-bold">暫無匹配的投票活動</p>
          </div>
        ) : (
          filteredCampaigns.map(campaign => {
            const voteItems = getCampaignVoteItems(campaign);
            const currentPhase = campaign.phases.find(p => p.id === campaign.currentPhaseId) || campaign.phases[0];
            const hasVoted = Boolean(userVotes[campaign.id] && userVotes[campaign.id].length > 0);

            return (
              <div
                key={campaign.id}
                className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
                {/* 1. 封面圖 (Cover Image) - 點擊進入活動 */}
                <div
                  onClick={() => {
                    onSelectCampaign(campaign);
                    triggerSound(700, 'sine', 0.08);
                  }}
                  className="relative w-full h-36 sm:h-40 bg-slate-900 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={campaign.coverImage}
                    alt={campaign.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent"></div>

                  {/* 2. 狀態標籤 (Status Badges) - 避免任何折行 */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {campaign.status === 'ACTIVE' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-xs inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                          <span>進行中</span>
                        </span>
                      )}
                      {campaign.status === 'UPCOMING' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs inline-flex items-center whitespace-nowrap shrink-0">
                          即將開始
                        </span>
                      )}
                      {campaign.status === 'ENDED' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-600 text-white shadow-xs inline-flex items-center whitespace-nowrap shrink-0">
                          已結束
                        </span>
                      )}

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600/90 backdrop-blur-md text-white shadow-xs inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Award size={11} />
                        <span>設有 {voteItems.length} 個評選項目</span>
                      </span>

                      {campaign.submissionMode === 'ALL_REQUIRED' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-600/90 backdrop-blur-md text-white shadow-xs inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                          <Layers size={11} />
                          <span>所有的投票組件都投完後統一提交</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600/90 backdrop-blur-md text-white shadow-xs inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                          <Sparkles size={11} />
                          <span>支持單個投票組件提交</span>
                        </span>
                      )}
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
                      {campaign.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <Clock size={11} className="text-amber-400" />
                        <span>截止: {campaign.endTime ? campaign.endTime.substring(5, 16) : (currentPhase ? currentPhase.endTime.substring(5, 16) : '依賽程')}</span>
                      </span>
                      <span className="text-amber-300 font-bold whitespace-nowrap">
                        共 {campaign.phases.length} 個賽制階段
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. 內容區：活動簡介 + 包含的多個投票項目清單 */}
                <div className="p-3.5 space-y-3">
                  {/* 描述摘要 */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {campaign.description}
                  </p>

                  {/* 🌟 核心：活動內含的投票組件清單（支援 5 個投票項目美觀展示） */}
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
                      {voteItems.map((item, idx) => {
                        const curP = item.phases.find(p => p.id === item.currentPhaseId) || item.phases[0] || campaign.phases[0];
                        const options = curP?.options || [];
                        const itemTitle = item.title || item.name || `評選項目 #${idx + 1}`;

                        return (
                          <div
                            key={item.id || idx}
                            onClick={() => {
                              onSelectCampaign(campaign, item.id);
                              triggerSound(750, 'sine', 0.08);
                            }}
                            className="group/item px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-rose-400 dark:hover:border-rose-800 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition-all cursor-pointer flex items-center justify-between gap-2.5"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {/* 序號標籤 */}
                              <div className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black text-[10px] flex items-center justify-center shrink-0 group-hover/item:border-rose-400 group-hover/item:text-rose-600 transition-colors">
                                {idx + 1}
                              </div>

                              <div className="min-w-0 flex-1 space-y-0.5">
                                {/* 項目標題 - 單行截斷不折行 */}
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
                          {campaign.totalParticipants.toLocaleString()}
                        </span>人
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Flame size={12} className="text-rose-500 shrink-0" />
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {campaign.totalVotes.toLocaleString()}
                        </span>票
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectCampaign(campaign);
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
            );
          })
        )}
      </div>

    </div>
  );
};
