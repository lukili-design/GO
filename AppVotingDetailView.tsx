/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VotingCampaign } from '../../types';
import { AppVotingWidget } from './AppVotingWidget';
import { 
  ArrowLeft, Share2, CheckCircle2, 
  FileText, Clock, HelpCircle
} from 'lucide-react';

interface AppVotingDetailViewProps {
  campaign: VotingCampaign;
  initialVoteItemId?: string;
  onBack: () => void;
  onVoteSubmit?: (campaignId: string, phaseId: string, optionIds: string[]) => void;
  userVotes?: Record<string, string[]>;
  triggerSound: (freq: number, type: OscillatorType, duration: number) => void;
}

export const AppVotingDetailView: React.FC<AppVotingDetailViewProps> = ({
  campaign,
  initialVoteItemId,
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
          <span>返回投票活動列表</span>
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
        
        {/* 核心投票組件 (包含頂部封面與狀態、投票1~5切換、標題/簡介/選項、上個投票/下個投票/提交所有投票) */}
        <AppVotingWidget
          campaign={campaign}
          initialVoteItemId={initialVoteItemId}
          onVoteSubmit={onVoteSubmit}
          userVotedOptionIds={userVotes[campaign.id] || []}
          isLoggedIn={true}
          triggerSound={triggerSound}
        />

        {/* ========================================================================= */}
        {/* 最下方：活動規則說明 */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 text-xs">
          
          {/* 活動規則 */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white text-sm">
              <FileText size={16} className="text-rose-600" />
              <span>活動規則說明</span>
            </div>
            
            <div className="space-y-2 text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <Clock size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">投票時間：</strong>
                  <span>即日起至 {campaign.endTime || '官方指定截止日'} 止，逾期投票系統將自動關閉並鎖定票數。</span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <HelpCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">選票與提交規則：</strong>
                  <span>
                    {campaign.submissionMode === 'ALL_REQUIRED'
                      ? '本活動包含多個投票項目，需依序為每個投票項目選取候選項後統一提交全部選票。'
                      : '本活動支持各投票項目單獨選取並隨時投選提交。'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
