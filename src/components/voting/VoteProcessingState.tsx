import React from 'react';
import { Clock } from 'lucide-react';

export function VoteProcessingState({ nextStartTime }: { nextStartTime?: string }) {
  return <section role="status" aria-live="polite" className="go-type px-6 py-12 text-center rounded-2xl" style={{ background: 'var(--activity-panel, rgba(148,163,184,.12))' }}>
    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-current/20"><Clock size={30} aria-hidden="true"/></div>
    <h2 className="text-lg font-semibold">投票已截止</h2>
    <p className="mt-3 text-sm">投票結果統計中</p>
    {nextStartTime && <p className="mt-2 text-xs opacity-70">下一階段投票將於 {nextStartTime} 開始</p>}
  </section>;
}
