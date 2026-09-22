import type { VotePhase } from '../types';

// Use local calendar values, matching the CMS datetime-local fields.
export function getEarliestPhaseStart(phases: VotePhase[], index: number): string | null {
  if (index < 1 || !phases[index]?.advanceRuleEnabled) return null;
  const end = new Date((phases[index - 1]?.endTime || '').replace(' ', 'T'));
  if (!Number.isFinite(end.getTime())) return null;
  end.setMinutes(end.getMinutes() + 5);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}:${pad(end.getSeconds())}`;
}

export function getPhaseTimingError(phases: VotePhase[], index: number): string | null {
  const phase = phases[index];
  if (index < 1 || !phase?.advanceRuleEnabled) return null;
  const earliest = getEarliestPhaseStart(phases, index);
  if (!earliest) return '請先填寫上一階段的有效結束時間。';
  const start = new Date((phase.startTime || '').replace(' ', 'T')).getTime();
  if (!Number.isFinite(start)) return '請填寫本階段的有效投票開始時間。';
  if (start < new Date(earliest).getTime()) return `投票開始時間不得早於 ${earliest.replace('T', ' ')}，請預留 5 分鐘處理晉級結果。`;
  return null;
}
