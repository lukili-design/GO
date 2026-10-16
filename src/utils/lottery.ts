export interface LotteryPerson {id:string;group:string;}
export function planLottery<T extends LotteryPerson>(people:T[],winners:(LotteryPerson&{prizeId:string})[],prizeId:string,count:number,repeat:boolean,groups?:string[]){
 const awarded=winners.filter(w=>w.prizeId===prizeId);
 const excluded=new Set((repeat?awarded:winners).map(w=>w.id));
 const unique=[...new Map(people.map(p=>[p.id,p])).values()];
 return (groups?[...new Set(groups)]:['']).map(group=>{
  const remaining=Math.max(0,count-awarded.filter(w=>!groups||w.group===group).length);
  const pool=unique.filter(p=>(!groups||p.group===group)&&!excluded.has(p.id));
  return {group,remaining,pool,take:Math.min(remaining,pool.length)};
 });
}
export function pickLottery<T>(pool:T[],count:number):T[]{const copy=[...pool],result:T[]=[];while(result.length<count&&copy.length){const n=new Uint32Array(1);const ceiling=Math.floor(4294967296/copy.length)*copy.length;do{crypto.getRandomValues(n);}while(n[0]>=ceiling);result.push(copy.splice(n[0]%copy.length,1)[0]);}return result;}
