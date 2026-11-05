import type {Activity,ActivityModuleLink,ActivityProject} from '../types';
export function withActivityProjects(activity:Activity,projects:ActivityProject[]):Activity {
 const links:ActivityModuleLink[]=projects.flatMap((p,index)=>[
  ...(p.checkInId?[{id:`${p.id}-checkin`,type:'CHECK_IN' as const,title:p.name,resourceId:p.checkInId,enabled:true,order:index*100}]:[]),
  ...p.lotteryIds.map((id,i)=>({id:`${p.id}-lottery-${id}`,type:'LOTTERY' as const,title:p.name,resourceId:id,enabled:true,order:index*100+i+1}))
 ]);
 return {...activity,projects:projects.map((p,i)=>({...p,order:i+1})),modules:[...activity.modules.filter(m=>m.type!=='CHECK_IN'&&m.type!=='LOTTERY'),...links]};
}
export function activityProjectsProblem(a:Activity,activities:Activity[],drawIds:string[]):string {
 if(!a.projects)return '';
 if(!a.projects.length)return '請新增至少一個活動項目。';
 for(const p of a.projects){
  if(!p.name.trim())return '請填寫項目名稱。';
  if(!p.checkInId&&!p.lotteryIds.length)return `${p.name}：請至少關聯一個簽到或抽獎。`;
  if(p.checkInId&&!activities.some(item=>item.id===p.checkInId&&item.checkIn))return `${p.name}：關聯簽到已不存在，請重新選擇。`;
  if(p.lotteryIds.some(id=>!drawIds.includes(id)))return `${p.name}：關聯抽獎已不存在，請重新選擇。`;
 }
 return '';
}

// Source managers own these relations. Activity projects are a read-only projection.
export function relatedActivityProjects(activity:Activity,activities:Activity[],draws:{id:string;title:string;sourceActivityId?:string;source:string;activityId:string;sourceCheckInId?:string}[]):ActivityProject[]{
 const legacy=!activity.projects;
 const checkIns=activities.filter(c=>c.checkIn&&(c.sourceActivityId===activity.id||(legacy&&!c.sourceActivityId&&activity.modules.some(m=>m.enabled&&m.type==='CHECK_IN'&&(m.resourceId||activity.id)===c.id))));
 const linkedDraws=draws.filter(d=>d.sourceActivityId===activity.id||(legacy&&!d.sourceActivityId&&activity.modules.some(m=>m.enabled&&m.type==='LOTTERY'&&m.resourceId===d.id)));
 const used=new Set<string>();
 const projects:ActivityProject[]=checkIns.map((c,index)=>{const lotteryIds=linkedDraws.filter(d=>(d.source==='CSV'?d.sourceCheckInId:d.activityId)===c.id).map(d=>{used.add(d.id);return d.id;});return {id:`relation-${c.id}`,name:c.title,checkInId:c.id,lotteryIds,order:index+1};});
 linkedDraws.filter(d=>!used.has(d.id)).forEach(d=>projects.push({id:`relation-${d.id}`,name:d.title,lotteryIds:[d.id],order:projects.length+1}));
 return projects;
}
