import type { VotingCampaign, VoteLogRecord } from '../../types';
export function voteChannel(log: VoteLogRecord): string {
 if(log.authType==='TVB_GO_MEMBER')return '員工投票';
 if(log.authType==='INVITATION_CODE')return '邀請碼';
 if(log.authType==='EMAIL_INVITATION')return log.channelName?.trim()?`電郵－${log.channelName.trim()}`:'電郵-未分類';
 return '其他渠道';
}
export function channelVoteStats(campaign:VotingCampaign,logs:VoteLogRecord[],phaseLogIds:Record<string,string[]>,channel:string){
 const valid=logs.filter(l=>l.status==='VALID'&&(channel==='ALL'||voteChannel(l)===channel));
 if(channel==='ALL')return {...campaign,logs:valid};
 const counted=new Set<string>();
 const phases=campaign.phases.map(phase=>{
  const ids=new Set(phaseLogIds[phase.id]||[]);
  const counts=new Map<string,number>();
  for(const log of valid.filter(l=>ids.has(l.id))){
   for(const id of new Set(log.selectedOptionIds))if(phase.options.some(o=>o.id===id)){counts.set(id,(counts.get(id)||0)+1);counted.add(log.id);}
  }
  return {...phase,options:phase.options.map(o=>({...o,votes:counts.get(o.id)||0}))};
 });
 return {phases,logs:valid,totalVotes:phases.reduce((n,p)=>n+p.options.reduce((v,o)=>v+o.votes,0),0),totalParticipants:new Set(valid.filter(l=>counted.has(l.id)).map(l=>l.voterId)).size};
}
