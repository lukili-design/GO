import { GoBanner, GoButton } from '../ui/GoUI';
import React, { useState } from 'react';
import { Activity, VoteItem, VotingCampaign } from '../../types';
import { getCampaignVoteItems } from '../../utils/votingHelpers';
import { AppVotingWidget } from '../voting/AppVotingWidget';
import { ArrowLeft, Calendar, ChevronRight, Users, Award } from 'lucide-react';

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

export const ActivityCard: React.FC<{ activity: Activity; campaigns?: VotingCampaign[]; onOpen: () => void }> = ({ activity, campaigns = [], onOpen }) => {
  const state = activityState(activity);
  const bundle = activityVotingBundle(activity, campaigns);
  const campaignIds = new Set([...bundle.sources.values()].map(source => source.campaignId));
  const participants = campaigns.filter(c => campaignIds.has(c.id)).reduce((sum, c) => sum + (c.totalParticipants || 0), 0);
  const voteCount = bundle.campaign.voteItems?.length || 0;
  return <button type="button" onClick={onOpen} className="w-full text-left overflow-hidden rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm">
    {activity.coverImage ? <img src={activity.coverImage} alt="" className="w-full aspect-[2/1] object-cover" /> : <div className="h-24 flex items-center justify-center text-white" style={{ backgroundColor: activity.headerBannerColor || '#2563eb' }}><Calendar size={32}/></div>}
    <div className="p-4 space-y-2">
      <div className="flex justify-between text-[10px] font-bold"><span className="text-blue-600">活動</span><span className={state === '進行中' ? 'text-emerald-600' : 'text-slate-500'}>{state === '未開始' ? '待開始' : state}</span></div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activity.title}</h3>
      <p className="text-xs text-slate-500 line-clamp-2">{activity.description}</p>
      <p className="text-[10px] text-slate-500">{activity.startTime} — {activity.endTime}</p>
      <div className="pt-1"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-100 dark:border-rose-900/50"><Award size={13} className="text-rose-500 shrink-0"/>共 {voteCount} 個投票</span></div>
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <span className="inline-flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Users size={13} className="text-blue-500 shrink-0"/><strong className="text-slate-800 dark:text-slate-200">{participants.toLocaleString()}</strong><span>人參與投票{campaignIds.size > 1 ? '（累計）' : ''}</span></span>
        <span className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 shadow-xs whitespace-nowrap shrink-0">查看活動<ChevronRight size={13}/></span>
      </div>
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
  const [detailTab, setDetailTab] = useState('list');
  const [trendItemId, setTrendItemId] = useState('');
  const bundle = activityVotingBundle(activity, campaigns);
  const trendItem = bundle.campaign.voteItems?.find(item => item.id === trendItemId) || bundle.campaign.voteItems?.[0];
  const trendPhase = trendItem?.phases.find(phase => phase.id === trendItem.currentPhaseId) || trendItem?.phases[0];
  const trendTotal = trendPhase?.options.reduce((sum, option) => sum + option.votes, 0) || 0;
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
    ? <GoBanner src={activity.footerBannerImage} alt="活動底部圖片"/>
    : <svg viewBox="0 0 640 200" role="img" aria-label="TVB GO 活動頁尾" className="w-full aspect-video block" preserveAspectRatio="xMidYMid slice">
        <path d="M0 70 Q160 0 320 80 T640 70 V200 H0Z" fill="currentColor" opacity=".08"/>
        <path d="M0 130 Q160 50 320 125 T640 120 V200 H0Z" fill="currentColor" opacity=".10"/>
        <text x="320" y="120" textAnchor="middle" fill="currentColor" fontFamily="sans-serif" fontSize="32" fontWeight="800">TVB GO</text>
        <text x="320" y="153" textAnchor="middle" fill="currentColor" fontFamily="sans-serif" fontSize="16">精彩活動 · 一起參與</text>
      </svg>;
  return <div className="h-full overflow-y-auto activity-detail-flat" style={{ backgroundColor: background, color: foreground, '--activity-bg': background, '--activity-ink': foreground, '--activity-panel': `color-mix(in srgb, ${background} 50%, ${foreground === '#ffffff' ? '#000000' : '#ffffff'})` } as React.CSSProperties}>
    <div className="go-app-header" style={{ backgroundColor: background }}><GoButton variant="quiet" onClick={onBack}><ArrowLeft size={16}/>返回 TVB 快訊</GoButton></div>
    {(activity.headerBannerImage || activity.coverImage) && <GoBanner src={activity.headerBannerImage || activity.coverImage} alt={activity.title}/>}
    <div className="go-app-body">
      <section className="space-y-3"><span className="text-xs font-bold opacity-75">{state === '未開始' ? '待開始' : state}</span><h1 className="text-2xl font-black leading-snug">{activity.title}</h1><p className="text-xs opacity-75">{activity.startTime} — {activity.endTime}</p><p className="text-sm whitespace-pre-wrap leading-relaxed">{activity.description}</p></section>
      {state !== '進行中' && <p className="py-3 text-sm">{state === '未開始' ? '活動尚未開始，請於開始時間後參與。' : '活動已結束，感謝支持。'}</p>}
      <nav aria-label="投票詳情" className="activity-detail-tabs">
        {([['list', '投票列表'], ['rules', '投票細則'], ['trends', '投票走勢']] as const).map(([id, label]) => <GoButton key={id} variant="quiet" aria-pressed={detailTab === id} aria-controls={`vote-panel-${id}`} onClick={() => setDetailTab(id)}>{label}</GoButton>)}
      </nav>
      <section id="vote-panel-list" aria-label="投票列表" hidden={detailTab !== 'list'} className="space-y-4">
        {bundle.campaign.voteItems?.length ? canVote ? <AppVotingWidget key={`${activity.id}:${activity.submissionMode}`} campaign={bundle.campaign} hideHeader userVotedOptionIds={[...bundle.optionSources].filter(([,source]) => userVotes[source.campaignId]?.includes(source.optionId)).map(([id]) => id)} onVoteSubmit={(_,phaseId,ids) => {
          if (activityState(activity) !== '進行中') return;
          const source = bundle.sources.get(phaseId);
          if (source) onVoteSubmit?.(source.campaignId, source.phaseId, ids.map(id => source.options.get(id)).filter((id): id is string => Boolean(id)));
        }}/> : bundle.campaign.voteItems.map(item => <div key={item.id} className="py-4 border-b border-current/20 text-sm">{item.title}<p className="mt-1 text-xs opacity-75">目前不可提交投票</p></div>) : <p className="py-4 text-sm">活動內容即將公布。</p>}
      </section>
      <section id="vote-panel-rules" aria-label="投票細則" hidden={detailTab !== 'rules'} className="activity-detail-panel"><h2 className="text-base font-bold">投票細則</h2><p className="pt-3 text-sm whitespace-pre-wrap break-words leading-7">{rules}</p></section>
      <section id="vote-panel-trends" aria-label="投票走勢" hidden={detailTab !== 'trends'} className="activity-detail-panel space-y-4">
        <div className="activity-trend-navigation" aria-label="選擇查看的投票">{bundle.campaign.voteItems?.map(item => <GoButton key={item.id} variant="quiet" aria-pressed={trendItem?.id === item.id}  onClick={() => setTrendItemId(item.id)}>{item.title.replace(/^[^\p{L}\p{N}]+/u, '')}</GoButton>)}</div>
        <h2 className="font-bold text-base">{trendItem?.title || '投票走勢'}</h2>
        <p className="text-xs opacity-70">累計 {trendTotal.toLocaleString()} 票 · 演示數據，佔比按本投票總票數計算</p>
        {trendPhase?.options.length ? [...trendPhase.options].sort((a, b) => b.votes - a.votes).map(option => {
          const percent = trendTotal ? option.votes / trendTotal * 100 : 0;
          return <div key={option.id} className="space-y-2 rounded-xl border border-current/20 p-3">
            <p className="text-sm font-bold break-words">{option.name}</p>
            <div className="flex justify-between text-xs"><span>{option.votes.toLocaleString()} 票</span><span>{percent.toFixed(1)}%</span></div>
            <div role="progressbar" aria-label={option.name} aria-valuenow={Number(percent.toFixed(1))} aria-valuemin={0} aria-valuemax={100} className="h-2 rounded-full bg-current/10 overflow-hidden"><div className="h-full rounded-full bg-current opacity-70" style={{width: `${percent}%`}}/></div>
          </div>;
        }) : <p className="text-sm opacity-70">暫無投票數據</p>}
      </section>
    </div>
    {footerLink ? <a href={footerLink} target="_blank" rel="noopener noreferrer" className="block">{footer}</a> : footer}
  </div>;
}
