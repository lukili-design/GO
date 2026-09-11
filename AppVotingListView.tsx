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
                  className="relative w-full h-36 sm:h-44 bg-slate-900 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={campaign.coverImage}
                    alt={campaign.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

                  {/* 2. 狀態標籤 (Status Badges) - 去掉「設有5個評選項目」 */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
                    <div className="flex items-center gap-1.5">
                      {campaign.status === 'ACTIVE' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500 text-white shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                          <span>進行中</span>
                        </span>
                      )}
                      {campaign.status === 'UPCOMING' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500 text-white shadow-xs inline-flex items-center whitespace-nowrap shrink-0">
                          即將開始
                        </span>
                      )}
                      {campaign.status === 'ENDED' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-slate-600 text-white shadow-xs inline-flex items-center whitespace-nowrap shrink-0">
                          已結束
                        </span>
                      )}
                    </div>

                    {hasVoted && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-600 text-white inline-flex items-center gap-1 shadow-xs whitespace-nowrap shrink-0">
                        <CheckCircle2 size={11} className="text-emerald-300" />
                        <span>已參與投票</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. 卡片主體內容區 */}
                <div className="p-3.5 space-y-2.5">
                  {/* 投票標題 */}
                  <h3
                    onClick={() => {
                      onSelectCampaign(campaign);
                      triggerSound(700, 'sine', 0.08);
                    }}
                    className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors leading-snug line-clamp-2"
                  >
                    {campaign.title}
                  </h3>

                  {/* 截止時間（已去掉共X個賽制階段） */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <Clock size={12} className="text-amber-500 shrink-0" />
                    <span>截止時間：{campaign.endTime || (currentPhase ? currentPhase.endTime : '依官方公告')}</span>
                  </div>

                  {/* 活動簡介：最多顯示兩行 */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {campaign.description}
                  </p>

                  {/* 共 X 個投票 */}
                  <div className="pt-1 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-100 dark:border-rose-900/50">
                      <Award size={13} className="text-rose-500 shrink-0" />
                      <span>共 {voteItems.length} 個投票</span>
                    </div>
                  </div>

                  {/* 4. 底部數據與進入活動按鈕：人數 票數 進入活動 */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap overflow-hidden">
                      <span className="inline-flex items-center gap-1">
                        <Users size={13} className="text-blue-500 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {campaign.totalParticipants.toLocaleString()}
                        </span>人
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Flame size={13} className="text-rose-500 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
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
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0"
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
