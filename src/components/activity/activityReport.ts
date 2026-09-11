import { Activity, VotingCampaign, VoteLogRecord } from '../../types';

export function buildActivityReport(activity: Activity, campaigns: VotingCampaign[], allLogs: VoteLogRecord[]) {
  const links = new Set(activity.modules.filter(m => m.type === 'VOTING' && m.enabled).map(m => m.resourceId));
  const phases = campaigns.flatMap(campaign => {
    const items = campaign.voteItems || [];
    if (!items.length) return links.has(campaign.id) ? campaign.phases.map(p => ({ ...p, id: `${campaign.id}::${p.id}`, name: `${campaign.title} · ${p.name}` })) : [];
    return items.filter(item => links.has(campaign.id) || links.has(`${campaign.id}::${item.id}`)).flatMap(item => item.phases.map(p => ({ ...p, id: `${campaign.id}::${item.id}::${p.id}`, name: `${item.title} · ${p.name}` })));
  });
  const logs = allLogs.filter(log => links.has(log.campaignId) || Boolean(log.voteItemId && links.has(`${log.campaignId}::${log.voteItemId}`))).map(log => ({ ...log, campaignId: activity.id, campaignTitle: activity.title }));
  const campaign: VotingCampaign = {
    id: activity.id, title: activity.title, description: activity.description, coverImage: activity.coverImage || '',
    status: activity.status === 'ENDED' ? 'ENDED' : activity.status === 'PUBLISHED' ? 'ACTIVE' : 'UPCOMING',
    phases, currentPhaseId: phases[0]?.id || '', resultVisibility: 'ADMIN_ONLY',
    totalParticipants: new Set(logs.filter(log => log.status === 'VALID').map(log => log.voterId)).size,
    totalVotes: phases.reduce((sum, phase) => sum + phase.options.reduce((n, option) => n + option.votes, 0), 0),
    startTime: activity.startTime, endTime: activity.endTime, creator: activity.creator,
    createdAt: activity.createdAt, updatedAt: activity.updatedAt,
  };
  return { campaign, logs };
}
