import React from 'react';
import { Activity, VoteItem, VotingCampaign } from '../../types';
import { getCampaignVoteItems } from '../../utils/votingHelpers';
import { AppVotingWidget } from '../voting/AppVotingWidget';
import { ArrowLeft, Calendar, ChevronRight } from 'lucide-react';

export function activityState(activity: Activity, now = Date.now()) {
  if (activity.status === 'DRAFT') return '草稿';
  if (activity.status === 'ENDED' || Date.parse(activity.endTime.replace(' ', 'T')) < now) return '已結束';
  if (Date.parse(activity.startTime.replace(' ', 'T')) > now) return '未開始';
  return '進行中';
}

export function publishedActivities(activities: Activity[]) {
  const order = { '進行中': 0, '未開始': 1, '已結束': 2, '草稿': 3 };
  return activities.filter(a => a.status !== 'DRAFT').sort((a, b) => order[activityState(a)] - order[activityState(b)] || b.startTime.localeCompare(a.startTime));
}

export const ActivityCard: React.FC<{ activity: Activity; onOpen: () => void }> = ({ activity, onOpen }) => {
  const state = activityState(activity);
  return <button type="button" onClick={onOpen} className="w-full text-left overflow-hidden rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm">
    {activity.coverImage ? <img src={activity.coverImage} alt="" className="w-full aspect-[2/1] object-cover" /> : <div className="h-24 flex items-center justify-center text-white" style={{ backgroundColor: activity.headerBannerColor || '#2563eb' }}><Calendar size={32}/></div>}
    <div className="p-4 space-y-2">
      <div className="flex justify-between text-[10px] font-bold"><span className="text-blue-600">活動</span><span className={state === '進行中' ? 'text-emerald-600' : 'text-slate-500'}>{state}</span></div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activity.title}</h3>
      <p className="text-xs text-slate-500 line-clamp-2">{activity.description}</p>
      <p className="text-[10px] text-slate-500">{activity.startTime} — {activity.endTime}</p>
      <span className="flex items-center justify-between text-xs font-bold text-blue-600 pt-2">查看活動<ChevronRight size={14}/></span>
    </div>
  </button>;
}

// Keep source identities when combining votes from different campaigns into an activity.
export function activityVotingBundle(activity: Activity, campaigns: VotingCampaign[]) {
  const sources = new Map<string, { campaignId: string; phaseId: string; options: Map<string, string> }>();
  const optionSources = new Map<string, { campaignId: string; optionId: string }>();
  const seen = new Set<string>();
  const items: VoteItem[] = [];
  for (const module of [...activity.modules].filter(m => m.enabled && m.type === 'VOTING').sort((a,b) => a.order-b.order)) {
    const [campaignId, itemId] = (module.resourceId || '').split('::');
    const source = campaigns.find(c => c.id === campaignId);
    if (!source) continue;
    for (const item of getCampaignVoteItems(source).filter(i => !itemId || i.id === itemId)) {
      const key = `${source.id}::${item.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const phases = item.phases.map(phase => {
        const id = `${key}::${phase.id}`;
        const options = phase.options.map(option => {
          const optionKey = `${id}::${option.id}`;
          optionSources.set(optionKey, { campaignId: source.id, optionId: option.id });
          return { ...option, id: optionKey };
        });
        sources.set(id, { campaignId: source.id, phaseId: phase.id, options: new Map(options.map((o,i) => [o.id, phase.options[i].id])) });
        return { ...phase, id, options };
      });
      items.push({ ...item, id: key, currentPhaseId: `${key}::${item.currentPhaseId}`, phases });
    }
  }
  const campaign: VotingCampaign = {
    id: activity.id, title: activity.title, description: activity.description, coverImage: '',
    rules: activity.rules, resultVisibility: 'AFTER_VOTE', submissionMode: activity.submissionMode || 'ALL_REQUIRED',
    status: activityState(activity) === '進行中' ? 'ACTIVE' : activityState(activity) === '未開始' ? 'UPCOMING' : 'ENDED',
    currentPhaseId: items[0]?.currentPhaseId || '', phases: items[0]?.phases || [], voteItems: items,
    totalParticipants: 0, totalVotes: items.reduce((sum,i) => sum + (i.totalVotes || 0), 0),
    startTime: activity.startTime, endTime: activity.endTime,
    createdAt: activity.createdAt, updatedAt: activity.updatedAt,
  };
  return { campaign, sources, optionSources };
}

export const AppActivityDetail: React.FC<{
  activity: Activity; campaigns: VotingCampaign[]; userVotes: Record<string, string[]>;
  onVoteSubmit?: (campaignId: string, phaseId: string, optionIds: string[]) => void; onBack: () => void;
}> = ({ activity, campaigns, userVotes, onVoteSubmit, onBack }) => {
  const bundle = activityVotingBundle(activity, campaigns);
  const state = activityState(activity);
  const canVote = state === '進行中' && (activity.voterMethods || ['TVB_GO_MEMBER']).includes('TVB_GO_MEMBER');
  const background = /^#[0-9a-f]{6}$/i.test(activity.headerBannerColor || '') ? activity.headerBannerColor! : '#dbeafe';
  const rgb = [1, 3, 5].map(index => parseInt(background.slice(index, index + 2), 16));
  const foreground = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 < 150 ? '#ffffff' : '#172554';
  const rules = activity.rules?.trim() || [
    `活動時間：${activity.startTime} 至 ${activity.endTime}。`,
    activity.submissionMode === 'INDIVIDUAL' ? '每項投票可獨立選擇並提交。' : '請完成所有投票項目的選擇後統一提交。',
    '各投票的可選數量及投票時段，請參閱對應項目說明。',
  ].join('\n');
  const footerLink = activity.footerBannerLink && /^https?:\/\//i.test(activity.footerBannerLink) ? activity.footerBannerLink : undefined;
  const footer = activity.footerBannerImage
    ? <img src={activity.footerBannerImage} alt="活動底部圖片" className="w-full h-auto block"/>
    : <svg viewBox="0 0 640 200" role="img" aria-label="TVB GO 活動頁尾" className="w-full block">
        <path d="M0 70 Q160 0 320 80 T640 70 V200 H0Z" fill="currentColor" opacity=".08"/>
        <path d="M0 130 Q160 50 320 125 T640 120 V200 H0Z" fill="currentColor" opacity=".10"/>
        <text x="320" y="120" textAnchor="middle" fill="currentColor" fontFamily="sans-serif" fontSize="32" fontWeight="800">TVB GO</text>
        <text x="320" y="153" textAnchor="middle" fill="currentColor" fontFamily="sans-serif" fontSize="16">精彩活動 · 一起參與</text>
      </svg>;
  return <div className="h-full overflow-y-auto activity-detail-flat" style={{ backgroundColor: background, color: foreground }}>
    <div className="sticky top-0 z-20 p-3 backdrop-blur border-b border-current/15" style={{ backgroundColor: background }}><button onClick={onBack} className="flex items-center gap-2 text-xs font-bold"><ArrowLeft size={16}/>返回 TVB 快訊</button></div>
    {(activity.headerBannerImage || activity.coverImage) && <img src={activity.headerBannerImage || activity.coverImage} alt={activity.title} className="w-full h-auto block"/>}
    <div className="px-5 py-6 space-y-7">
      <section className="space-y-3"><span className="text-xs font-bold opacity-75">{state}</span><h1 className="text-2xl font-black leading-snug">{activity.title}</h1><p className="text-xs opacity-75">{activity.startTime} — {activity.endTime}</p><p className="text-sm whitespace-pre-wrap leading-relaxed">{activity.description}</p></section>
      <section className="pt-5 border-t border-current/20 space-y-3"><h2 className="text-base font-bold">活動規則</h2><p className="text-sm whitespace-pre-wrap leading-relaxed">{rules}</p></section>
      {state !== '進行中' && <p className="py-3 text-sm">{state === '未開始' ? '活動尚未開始，請於開始時間後參與。' : '活動已結束，感謝支持。'}</p>}
      <section className="space-y-4 pt-5 border-t border-current/20"><h2 className="text-base font-bold">活動投票</h2><p className="text-xs opacity-75">{activity.submissionMode === 'INDIVIDUAL' ? '各項獨立提交' : '完成所有投票後統一提交'}</p>
        {bundle.campaign.voteItems?.length ? canVote ? <AppVotingWidget key={`${activity.id}:${activity.submissionMode}`} campaign={bundle.campaign} hideHeader userVotedOptionIds={[...bundle.optionSources].filter(([,source]) => userVotes[source.campaignId]?.includes(source.optionId)).map(([id]) => id)} onVoteSubmit={(_,phaseId,ids) => {
          if (activityState(activity) !== '進行中') return;
          const source = bundle.sources.get(phaseId);
          if (source) onVoteSubmit?.(source.campaignId, source.phaseId, ids.map(id => source.options.get(id)).filter((id): id is string => Boolean(id)));
        }}/> : bundle.campaign.voteItems.map(item => <div key={item.id} className="py-4 border-b border-current/20 text-sm">{item.title}<p className="mt-1 text-xs opacity-75">目前不可提交投票</p></div>) : <p className="py-4 text-sm">活動內容即將公布。</p>}
      </section>
    </div>
    {footerLink ? <a href={footerLink} target="_blank" rel="noopener noreferrer" className="block">{footer}</a> : footer}
  </div>;
}
