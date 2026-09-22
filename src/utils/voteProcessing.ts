import type { VotePhase } from '../types';

export function getVoteProcessingUntil(phases: VotePhase[], now = Date.now()): number | null {
  for (let i = 1; i < phases.length; i++) {
    if (!phases[i].advanceRuleEnabled) continue;
    const end = new Date(phases[i - 1].endTime.replace(' ', 'T')).getTime();
    if (Number.isFinite(end) && now >= end && now < end + 300000) return end + 300000;
  }
  return null;
}
