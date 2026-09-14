import assert from 'node:assert/strict';
import { activityState, activityVotingBundle, publishedActivities } from './AppActivityViews';
import { Activity, VotingCampaign } from '../../types';

const activity: Activity = {
  id: 'A', title: 'Activity', description: '', startTime: '2020-01-01 00:00:00', endTime: '2099-01-01 00:00:00',
  status: 'PUBLISHED', creator: '', createdAt: '', updatedAt: '', submissionMode: 'ALL_REQUIRED',
  modules: [
    { id: 'M2', type: 'VOTING', resourceId: 'C2::I', title: '', enabled: true, order: 2 },
    { id: 'OFF', type: 'VOTING', resourceId: 'C3::I', title: '', enabled: false, order: 0 },
    { id: 'M1', type: 'VOTING', resourceId: 'C1::I', title: '', enabled: true, order: 1 },
    { id: 'DUPLICATE', type: 'VOTING', resourceId: 'C1::I', title: '', enabled: true, order: 3 },
  ],
};
const campaigns = ['C1', 'C2', 'C3'].map(id => ({
  id, title: id, description: '', coverImage: '', status: 'ACTIVE', resultVisibility: 'AFTER_VOTE',
  totalVotes: 0, totalParticipants: 0, startTime: activity.startTime, endTime: activity.endTime,
  createdAt: '', updatedAt: '', phases: [], currentPhaseId: 'P',
  voteItems: [{ id: 'I', title: id, status: 'ACTIVE', currentPhaseId: 'P', phases: [{
    id: 'P', name: 'Phase', status: 'ACTIVE', startTime: activity.startTime, endTime: activity.endTime,
    mode: 'SINGLE', maxSelections: 1, frequencyLimit: 'ONCE_TOTAL', requireAuth: true,
    options: [{ id: 'O', name: 'Option', avatar: '', description: '', initialVotes: 0, votes: 0 }],
  }] }],
})) as VotingCampaign[];
const bundle = activityVotingBundle(activity, campaigns);
assert.deepEqual(bundle.campaign.voteItems?.map(item => item.title), ['C1', 'C2']);
assert.equal(bundle.campaign.submissionMode, 'ALL_REQUIRED');
const phases = bundle.campaign.voteItems!.flatMap(item => item.phases);
assert.equal(new Set(phases.map(phase => phase.id)).size, 2);
assert.equal(new Set(phases.flatMap(phase => phase.options.map(option => option.id))).size, 2);
phases.forEach((phase, i) => {
  const source = bundle.sources.get(phase.id)!;
  assert.equal(source.campaignId, `C${i + 1}`);
  assert.equal(source.phaseId, 'P');
  assert.equal(source.options.get(phase.options[0].id), 'O');
});
assert.equal(activityState({ ...activity, status: 'DRAFT' }), '草稿');
assert.equal(activityState({ ...activity, startTime: '2098-01-01 00:00:00' }), '未開始');
assert.equal(activityState({ ...activity, endTime: '2020-02-01 00:00:00' }), '已結束');
assert.deepEqual(publishedActivities([{ ...activity, id: 'draft', status: 'DRAFT' }, { ...activity, id: 'ended', status: 'ENDED' }, activity]).map(a => a.id), ['A', 'ended']);
console.log('Activity filtering, ordering, and vote source mapping passed.');
