/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VotingCampaign, VoteItem, VotePhase, VoteCampaignStatus } from '../types';

/**
 * 獲取活動內的所有投票項目 (Vote Items)
 * 若活動未顯式定義 voteItems，則將活動的 phases 自動包裝為預設的第 1 個投票項目以保證 100% 向下兼容。
 */
export function getCampaignVoteItems(campaign: VotingCampaign): VoteItem[] {
  if (campaign.voteItems && campaign.voteItems.length > 0) {
    return campaign.voteItems;
  }
  
  return [
    {
      id: `${campaign.id}-ITEM-01`,
      title: campaign.title || '默認投票項目',
      description: campaign.description || '',
      coverImage: campaign.coverImage || '',
      status: campaign.status || 'ACTIVE',
      currentPhaseId: campaign.currentPhaseId || (campaign.phases?.[0]?.id ?? 'PHASE-01'),
      totalParticipants: campaign.totalParticipants || 0,
      totalVotes: campaign.totalVotes || 0,
      phases: campaign.phases && campaign.phases.length > 0 ? campaign.phases : [
        {
          id: 'PHASE-01',
          name: '第一階段 全民投票',
          status: 'ACTIVE',
          startTime: campaign.startTime || '2026-08-01 00:00:00',
          endTime: campaign.endTime || '2026-09-30 23:59:59',
          mode: 'SINGLE',
          maxSelections: 1,
          frequencyLimit: 'ONCE_TOTAL',
          requireAuth: true,
          options: []
        }
      ]
    }
  ];
}

/**
 * 計算投票階段的時間狀態
 */
export function calculatePhaseAutoStatus(phases: VotePhase[]): VoteCampaignStatus {
  if (!phases || phases.length === 0) return 'UPCOMING';
  const now = new Date().getTime();

  let hasActive = false;
  let allEnded = true;
  let allUpcoming = true;

  for (const p of phases) {
    const start = new Date(p.startTime.replace(' ', 'T')).getTime();
    const end = new Date(p.endTime.replace(' ', 'T')).getTime();

    if (!isNaN(start) && !isNaN(end)) {
      if (now >= start && now <= end) {
        hasActive = true;
        allEnded = false;
        allUpcoming = false;
      } else if (now < start) {
        allEnded = false;
      } else if (now > end) {
        allUpcoming = false;
      }
    }
  }

  if (hasActive) return 'ACTIVE';
  if (allEnded) return 'ENDED';
  if (allUpcoming) return 'UPCOMING';
  return 'ACTIVE';
}

/**
 * 將多個投票項目的數據同步回活動主對象 (計算總票數、總參與人數、整體排程時間與整體狀態)
 */
export function syncCampaignFromVoteItems(campaign: VotingCampaign, voteItems?: VoteItem[]): VotingCampaign {
  const items = voteItems && voteItems.length > 0 ? voteItems : getCampaignVoteItems(campaign);
  
  let totalVotes = 0;
  let totalParticipants = 0;
  const allStartTimes: string[] = [];
  const allEndTimes: string[] = [];
  let hasActive = false;
  let allEnded = true;

  const normalizedItems = items.map((item, idx) => {
    let itemVotes = 0;
    item.phases.forEach(p => {
      p.options.forEach(o => {
        itemVotes += (o.votes || 0);
      });
      if (p.startTime) allStartTimes.push(p.startTime);
      if (p.endTime) allEndTimes.push(p.endTime);
    });

    const itemStatus = calculatePhaseAutoStatus(item.phases);
    if (itemStatus === 'ACTIVE') {
      hasActive = true;
      allEnded = false;
    } else if (itemStatus !== 'ENDED') {
      allEnded = false;
    }

    const itemParticipants = Math.max(item.totalParticipants || 0, Math.round(itemVotes * 0.45));
    totalVotes += itemVotes;
    totalParticipants += itemParticipants;

    return {
      ...item,
      id: item.id || `ITEM-${String(idx + 1).padStart(2, '0')}`,
      status: itemStatus,
      totalVotes: itemVotes,
      totalParticipants: itemParticipants,
      currentPhaseId: item.currentPhaseId || item.phases[0]?.id || 'PHASE-01'
    };
  });

  allStartTimes.sort();
  allEndTimes.sort();

  const earliestStart = allStartTimes[0] || campaign.startTime || '2026-08-01 00:00:00';
  const latestEnd = allEndTimes[allEndTimes.length - 1] || campaign.endTime || '2026-09-30 23:59:59';
  const overallStatus: VoteCampaignStatus = hasActive ? 'ACTIVE' : (allEnded ? 'ENDED' : 'UPCOMING');

  const primaryItem = normalizedItems[0];

  return {
    ...campaign,
    voteItems: normalizedItems,
    phases: primaryItem.phases,
    currentPhaseId: primaryItem.currentPhaseId,
    totalVotes,
    totalParticipants: Math.max(campaign.totalParticipants, totalParticipants),
    startTime: earliestStart,
    endTime: latestEnd,
    status: overallStatus
  };
}
