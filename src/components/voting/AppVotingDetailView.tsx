/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VotingCampaign } from '../../types';
import { AppVotingWidget } from './AppVotingWidget';
import { 
  ArrowLeft, Share2, CheckCircle2, ShieldCheck, 
  Info, Users, Award, Flame, Sparkles 
} from 'lucide-react';

interface AppVotingDetailViewProps {
  campaign: VotingCampaign;
  onBack: () => void;
  onVoteSubmit?: (campaignId: string, phaseId: string, optionIds: string[]) => void;
  userVotes?: Record<string, string[]>;
  triggerSound: (freq: number, type: OscillatorType, duration: number) => void;
}

export const AppVotingDetailView: React.FC<AppVotingDetailViewProps> = ({
  campaign,
  onBack,
  onVoteSubmit,
  userVotes = {},
  triggerSound
}) => {
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = () => {
    setShowShareToast(true);
    triggerSound(900, 'sine', 0.1);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col font-sans select-none pb-16 overscroll-contain">
      
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/95 text-white text-xs font-bold rounded-full shadow-lg border border-slate-700 flex items-center gap-1.5 animate-bounce">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>投票活動連結已複製到剪貼簿！</span>
        </div>
      )}

      {/* 頂部單一導航返回欄 */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
        <button
          type="button"
          onClick={() => {
            onBack();
            triggerSound(500, 'sine', 0.08);
          }}
          className="p-1.5 -ml-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
        >
          <ArrowLeft size={17} />
          <span>返回投票列表</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            title="分享投票"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* 活動投票主要詳情內容 */}
      <div className="p-3.5 space-y-4">
        
        {/* 核心投票組件 (包含多階段導航、候選項卡片/列表、單選多選判定、百分比走勢) */}
        <AppVotingWidget
          campaign={campaign}
          onVoteSubmit={onVoteSubmit}
          userVotedOptionIds={userVotes[campaign.id] || []}
          isLoggedIn={true}
          triggerSound={triggerSound}
        />

        {/* 活動主辦與規則聲明 */}
        <div className="p-3.5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-black text-slate-800 dark:text-slate-200">
            <ShieldCheck size={16} className="text-blue-600" />
            <span>TVB 官方認證與防刷票機制</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            本投票活動由電視城管理平台全程加密校驗，實施實名制會員單次投票限制及異常流量監控，確保投票結果公正透明。
          </p>
        </div>

      </div>

    </div>
  );
};
