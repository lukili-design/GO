import { Activity, VotingCampaign } from '../types';

// Separate demo IDs keep selections and CMS edits independent of existing campaigns.
export function createActivityDemos(templates: VotingCampaign[]) {
  const campaigns: VotingCampaign[] = (['ALL_REQUIRED', 'INDIVIDUAL'] as const).map((mode, index) => {
    const source = structuredClone(templates[index]);
    const id = `DEMO-VOTE-${mode}`;
    const startTime = '2026-09-01 00:00:00';
    const endTime = '2027-12-31 23:59:59';
    const voteItems = source.voteItems!.map((item, i) => {
      const phase = item.phases.find(p => p.id === item.currentPhaseId) || item.phases[0];
      const phaseId = `${id}-PHASE-${i + 1}`;
      return { ...item, description: `${item.description || item.title}\n\n請細閱候選項目的介紹，綜合考慮作品表現、創意及影響力後作出選擇。每個項目的可選數量以頁面提示為準，可在提交前修改選擇。\n\n${mode === 'ALL_REQUIRED' ? '本活動需要完成全部評選項目後統一提交，切換項目時會保留本次已選內容。' : '本活動支援各項獨立提交，可先為喜歡的項目投票，再繼續參與其他項目。'}`, id: `${id}-ITEM-${i + 1}`, publicationStatus: 'PUBLISHED' as const,
        status: 'ACTIVE' as const, currentPhaseId: phaseId, displayStartTime: startTime, displayEndTime: endTime,
        totalVotes: 0, totalParticipants: 0,
        phases: [{ ...phase, id: phaseId, status: 'ACTIVE' as const, startTime, endTime,
          advanceRuleEnabled: false, advanceSourcePhaseId: undefined, advanceTargetPhaseId: undefined,
          options: phase.options.map((o, j) => ({ ...o, id: `${id}-OPTION-${i}-${j}`, votes: 0, initialVotes: 0 })) }] };
    });
    return { ...source, id, title: source.title,
      description: source.description,
      submissionMode: mode, status: 'ACTIVE', startTime, endTime, voteItems,
      phases: voteItems[0].phases, currentPhaseId: voteItems[0].currentPhaseId, totalVotes: 0, totalParticipants: 0 };
  });
  const activities: Activity[] = campaigns.map(c => ({
    id: `ACT-${c.id}`, title: c.title, description: c.description, rules: `一、參與方式\n${c.description}\n\n二、投票安排\n${c.submissionMode === 'ALL_REQUIRED' ? '請完成所有評選項目後統一提交。提交前可以返回各項目檢查和修改選擇。' : '各評選項目可獨立提交，毋須完成全部項目。'}\n\n三、選票規則\n每個項目的可選數量及投票次數以該項目顯示為準。提交前請確認所選候選項目。\n\n四、示例說明\n此活動為介面演示，選票只用於本機體驗，不代表真實評選結果。`,
    coverImage: c.coverImage, headerBannerImage: banner(c.submissionMode === 'ALL_REQUIRED', false), footerBannerImage: banner(c.submissionMode === 'ALL_REQUIRED', true), headerBannerColor: '#990000', startTime: c.startTime, endTime: c.endTime, status: 'PUBLISHED',
    submissionMode: c.submissionMode, voterMethods: ['TVB_GO_MEMBER'], creator: '示例',
    createdAt: c.startTime, updatedAt: c.startTime,
    modules: c.voteItems!.map((item, i) => ({ id: `MOD-${item.id}`, type: 'VOTING',
      title: item.title, resourceId: `${c.id}::${item.id}`, enabled: true, order: i + 1 }))
  }));
  return { campaigns, activities };
}

export function includeMissingActivityDemos(existing: Activity[], demos: Activity[]) {
  const updated = existing.map(a => {
    const demo = demos.find(d => d.id === a.id);
    if (!demo) return a;
    // Upgrade the earlier generic samples once; retain later CMS customizations.
    if (a.title.startsWith('投票示例｜')) return { ...a, ...demo };
    const oldBanner = (value?: string) => value?.startsWith('data:image/svg+xml;charset=utf-8,') && decodeURIComponent(value).includes('width="960"');
    return { ...a,
      headerBannerColor: ['#fff8eb', '#eef2ff'].includes((a.headerBannerColor || '').toLowerCase()) ? demo.headerBannerColor : a.headerBannerColor,
      headerBannerImage: oldBanner(a.headerBannerImage) ? demo.headerBannerImage : a.headerBannerImage,
      footerBannerImage: oldBanner(a.footerBannerImage) ? demo.footerBannerImage : a.footerBannerImage };
  });
  return [...updated, ...demos.filter(d => !existing.some(a => a.id === d.id))];
}

function banner(gold: boolean, footer: boolean) {
  const accent = gold ? '#eed397' : '#c8c3ff';
  const bg = gold ? '#19140f' : '#17152f';
  const heading = footer ? '感謝每一份支持' : gold ? '萬千星輝台慶盛典' : '幕後製作與創意策劃';
  const subtitle = footer ? '每一票，讓精彩被看見' : gold ? '年度總選' : '年度大獎';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="glow" x2="1" y2="1"><stop stop-color="${accent}" stop-opacity=".28"/><stop offset="1" stop-color="${bg}" stop-opacity="0"/></linearGradient></defs><rect width="1280" height="720" fill="${bg}"/><path d="M760 0H1280V720H1030Z" fill="url(#glow)"/><g fill="none" stroke="${accent}" opacity=".28"><circle cx="1130" cy="310" r="270"/><circle cx="1130" cy="310" r="220"/><path d="M0 650H1280M70 60H1210V660H70Z"/></g><g fill="${accent}" font-family="sans-serif"><text x="110" y="140" font-size="28" letter-spacing="7">TVB GO / 2026</text><rect x="110" y="205" width="64" height="4"/><text x="110" y="330" font-size="60" font-weight="bold">${heading}</text><text x="110" y="420" font-size="50" font-weight="bold">${subtitle}</text><text x="110" y="565" font-size="24">${footer ? '一起期待更多精彩時刻' : '投選心中所愛 · 見證年度榮耀'}</text></g><path d="M1100 210L1120 270L1180 290L1120 310L1100 370L1080 310L1020 290L1080 270Z" fill="${accent}" opacity=".7"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
