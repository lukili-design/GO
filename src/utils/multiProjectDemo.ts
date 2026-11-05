import type {Activity} from '../types';
import type {Draw} from '../components/activity/LotteryManager';
import {banquetDraws} from './banquetLotteryDemo';
import {withActivityProjects} from './activityProjects';
const activityId='APP-DEMO-BANQUET-PROJECTS';
const marker='go-cms-multi-project-demo-v1';
export function seedMultiProjectDemo(activities:Activity[]):Activity[]|null {
 if(localStorage.getItem(marker)||activities.some(a=>a.id===activityId))return null;
 const base=activities.find(a=>a.id==='ACT-DEMO-BANQUET');
 if(!base?.checkIn)return null;
 const stamp=new Date().toISOString();
 const checkIns=['盆菜宴項目簽到','同樂會簽到'].map((title,index):Activity=>{
  const id=`CHECKIN-MULTI-DEMO-${index+1}`;
  return {...structuredClone(base),id,title,isCheckInResource:true,sourceActivityId:activityId,verificationStaff:[],projects:undefined,modules:[{id:`${id}-module`,type:'CHECK_IN',enabled:true,order:1,title:'簽到',resourceId:id}],status:'PUBLISHED',startTime:'2026-10-01 00:00:00',endTime:'2027-12-31 23:59:59',checkIn:{...structuredClone(base.checkIn!),opensAt:'2026-10-01 00:00:00',closesAt:'2027-12-31 23:59:59',sessions:base.checkIn!.sessions?.map(s=>({...s,opensAt:'2026-10-01 00:00:00',closesAt:'2027-12-31 23:59:59'})),people:base.checkIn!.people.map(p=>({...p,token:crypto.randomUUID()}))},createdAt:stamp,updatedAt:stamp};
 });
 const templates=banquetDraws(checkIns[0]);
 const draws:Draw[]=[0,1,2].map((index)=>({...structuredClone(templates[index===0?0:1]),id:`LOTTERY-MULTI-DEMO-${index+1}`,title:['盆菜宴每枱幸運抽獎','盆菜宴全場大抽獎','新春幸運抽獎'][index],status:'PUBLISHED',activityId:index===2?'':checkIns[0].id,source:index===2?'CSV':'ACTIVITY',sourceActivityId:activityId,winners:[],pending:[],verificationStaff:[]}));
 const saved:Draw[]=JSON.parse(localStorage.getItem('go-lottery-draws-v1')||'[]');
 localStorage.setItem('go-lottery-draws-v1',JSON.stringify([...saved,...draws.filter(d=>!saved.some(x=>x.id===d.id))]));
 const activity=withActivityProjects({...structuredClone(base),id:activityId,title:'新春盆菜宴（多項目）',isCheckInResource:false,checkIn:undefined,verificationStaff:[],status:'PUBLISHED',startTime:'2026-10-01 00:00:00',endTime:'2027-12-31 23:59:59',modules:[],createdAt:stamp,updatedAt:stamp},[
  {id:'PROJECT-MULTI-1',name:'盆菜宴簽到及抽獎',checkInId:checkIns[0].id,lotteryIds:[draws[0].id,draws[1].id],order:1},
  {id:'PROJECT-MULTI-2',name:'同樂會簽到',checkInId:checkIns[1].id,lotteryIds:[],order:2},
  {id:'PROJECT-MULTI-3',name:'新春幸運抽獎',lotteryIds:[draws[2].id],order:3}
 ]);
 localStorage.setItem(marker,'1');
 return [...checkIns.filter(c=>!activities.some(a=>a.id===c.id)),activity];
}
