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
  onSelectCampaign: (campaign: VotingCampaign) => void;
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
    const matchesSearch = 
      camp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      camp.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-3.5 pb-8 font-sans">
      
      {/* 搜尋與篩選欄 */}
      <div className="bg-white dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋活動標題或關鍵字..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-1 focus:ring-rose-500"
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
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              filterTab === 'ALL'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            全部 ({campaigns.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterTab('ACTIVE');
              triggerSound(600, 'sine', 0.05);
            }}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
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
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
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
      <div className="space-y-3.5">
        {filteredCampaigns.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <Award size={32} className="mx-auto text-slate-300 dark:text-slate-700" />
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
                onClick={() => {
                  onSelectCampaign(campaign);
                  triggerSound(700, 'sine', 0.08);
                }}
                className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md hover:border-rose-300 dark:hover:border-rose-900 transition-all cursor-pointer group active:scale-[0.99]"
              >
                {/* 1. 封面圖 (Cover Image) */}
                <div className="relative w-full h-36 bg-slate-900 overflow-hidden">
                  <img
                    src={campaign.coverImage}
                    alt={campaign.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

                  {/* 2. 狀態標籤 (Status Badges) */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                    <div className="flex items-center gap-1.5">
                      {campaign.status === 'ACTIVE' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                          <span>進行中</span>
                        </span>
                      )}
                      {campaign.status === 'UPCOMING' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs">
                          即將開始
                        </span>
                      )}
                      {campaign.status === 'ENDED' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-600 text-white shadow-xs">
                          已結束
                        </span>
                      )}

                      {voteItems.length > 1 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600/90 backdrop-blur-md text-white shadow-xs">
                          {voteItems.length} 大評選獎項
                        </span>
                      ) : currentPhase ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                          {currentPhase.name}
                        </span>
                      ) : null}
                    </div>

                    {hasVoted && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white flex items-center gap-1 shadow-xs">
                        <CheckCircle2 size={11} className="text-emerald-300" />
                        <span>已參與投票</span>
                      </span>
                    )}
                  </div>

                  {/* 截止日期 / 倒數 */}
                  {currentPhase && (
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[10px] font-mono z-10">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock size={11} />
                        <span>截止: {currentPhase.endTime.substring(5, 16)}</span>
                      </span>
                      <span className="text-amber-300 font-bold">
                        {currentPhase.mode === 'SINGLE' ? '單選' : `多選(最多${currentPhase.maxSelections}項)`}
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. 內容區：標題 + 項目標籤 + 簡介 + 數據欄 */}
                <div className="p-3.5 space-y-2.5">
                  {/* 標題 (Title) */}
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug line-clamp-2">
                    {campaign.title}
                  </h3>

                  {/* 多項目預覽 Chips */}
                  {voteItems.length > 1 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {voteItems.slice(0, 4).map((item, i) => (
                        <span
                          key={item.id || i}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {item.name}
                        </span>
                      ))}
                      {voteItems.length > 4 && (
                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-md text-[10px] font-mono">
                          +{voteItems.length - 4} 項
                        </span>
                      )}
                    </div>
                  )}

                  {/* 描述摘要 */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {campaign.description}
                  </p>

                  {/* 底部數據與進入按鈕 */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Users size={12} className="text-blue-500" />
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {campaign.totalParticipants.toLocaleString()}
                        </span> 人參與
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame size={12} className="text-rose-500" />
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {campaign.totalVotes.toLocaleString()}
                        </span> 總票數
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 text-xs font-black text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform">
                      <span>{hasVoted ? '查看票數走勢' : '立即投票'}</span>
                      <ChevronRight size={14} />
                    </div>
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
