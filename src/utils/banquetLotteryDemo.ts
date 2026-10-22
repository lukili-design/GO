import type {Activity} from '../types';
import type {Draw} from '../components/activity/LotteryManager';
import {sessionConfig} from './checkInSessions';
export const banquetDrawIds=['BANQUET-DEMO-TABLE','BANQUET-DEMO-ALL'];
export function banquetDraws(a:Activity):Draw[]{
 const c=sessionConfig(a),sessionId=c.sessions![0].id;
 const people=c.people.filter(p=>p.sessionId===sessionId).map(({id,name,department,employeeId,group,seat})=>({id,name,department,employeeId,group,seat}));
 const groups=[...new Set(people.map(p=>p.group).filter(Boolean))];
 return (['TABLE','ALL'] as const).map((mode,i)=>{
 const id=banquetDrawIds[i],prizeId=id+'-PRIZE',prize=i?'全場幸運獎':'每枱幸運獎',gift=i?'購物禮券':'新春禮盒';
 const chosen=i?people.slice(0,3):groups.flatMap(g=>people.filter(p=>p.group===g).slice(0,1));
 return {id,title:`新春盆菜宴 · ${i?'全場':'按枱'}抽獎（演示）`,source:'ACTIVITY',activityId:a.id,sessionId,mode,groups,checkedOnly:false,repeat:true,people,prizes:[{id:prizeId,name:prize,gift,count:i?3:1},{id:id+'-PRIZE-2',name:i?'全場大獎':'每枱驚喜獎',gift:i?'平板電腦':'購物禮券',count:1}],winners:chosen.map(p=>({...p,prizeId,prize,gift,time:(a.startTime||'2026-09-24').slice(0,10)+(i?' 20:30:00':' 20:00:00')}))};
 });
}

/** Add the requested second prize only to the identified legacy demo. */
export function upgradeBanquetPrizes(draws:Draw[]):Draw[]{
 return draws.map(d=>d.id==='BANQUET-DEMO-TABLE'&&d.prizes.length===1&&d.prizes[0].id===d.id+'-PRIZE'?{...d,prizes:[...d.prizes,{id:d.id+'-PRIZE-2',name:'每枱驚喜獎',gift:'購物禮券',count:1}]}:d);
}

export function upgradeBanquetGlobalPrizes(draws:Draw[]):Draw[]{
 return draws.map(d=>d.id==='BANQUET-DEMO-ALL'&&d.prizes.length===1&&d.prizes[0].id===d.id+'-PRIZE'?{...d,prizes:[...d.prizes,{id:d.id+'-PRIZE-2',name:'全場大獎',gift:'平板電腦',count:1}]}:d);
}
