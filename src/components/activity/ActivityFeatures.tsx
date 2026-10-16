import {seatLabel,groupLabel} from '../../utils/checkInLabels';
import React from 'react';
import type {Activity} from '../../types';
import {GoSurface,formControlClass as control} from '../ui/GoUI';
import {defaultCheckIn} from '../../utils/checkIn';
export function ActivityFeatures({activity:a,activities,onChange}:{activity:Activity;activities:Activity[];onChange:(a:Activity)=>void}){
 const choices=activities.filter(item=>item.checkIn&&!item.modules.some(m=>m.type==='CHECK_IN'&&m.resourceId&&m.resourceId!==item.id));
 const own=choices.some(item=>item.id===a.id);
 const selected=a.modules.find(m=>m.type==='CHECK_IN')?.resourceId??(own?a.id:'');
const enabled=(type:string)=>a.modules.some(m=>m.type===type&&m.enabled);

 let draws:{id:string;title:string}[]=[];try{draws=JSON.parse(localStorage.getItem('go-lottery-draws-v1')||'[]');}catch{}
 return <GoSurface className="go-type p-5 space-y-4"><h3>活動功能</h3><div className="flex gap-6">{([['VOTING','投票'],['CHECK_IN','活動簽到'],['LOTTERY','抽獎']] as const).map(([type,label])=><label className="flex gap-2" key={type}><input type="checkbox" checked={enabled(type)} onChange={e=>{const existing=a.modules.some(m=>m.type===type);const modules=existing?a.modules.map(m=>m.type===type?{...m,enabled:e.target.checked}:m):[...a.modules,{id:crypto.randomUUID(),type,title:label,enabled:true,order:a.modules.length+1}];onChange({...a,modules,...(type==='CHECK_IN'&&!a.checkIn?{checkIn:defaultCheckIn()}:{})});}}/>{label}</label>)}</div>
 {enabled('CHECK_IN')&&<div className="space-y-3"><label className="block space-y-2"><span>關聯活動簽到</span><select aria-label="關聯活動簽到" className={control} value={selected} onChange={e=>{const source=choices.find(item=>item.id===e.target.value);onChange({...a,modules:a.modules.map(m=>m.type==='CHECK_IN'?{...m,resourceId:e.target.value}:m),checkIn:source?.checkIn||defaultCheckIn()});}}><option value="">請選擇活動簽到</option>{choices.map(item=><option key={item.id} value={item.id}>{item.title}簽到（{item.id}）</option>)}</select></label><p className="text-sm text-slate-500">{choices.length?'選擇已建立的簽到項目，名單及簽到數據沿用所選項目。':'暫無簽到項目，請先保存草稿，再到「簽到管理」新增。'}請到「簽到管理」配置活動地點、簽到位置與時間、名單、分枱、邀請函及電郵；統計與記錄在活動的「總體數據／明細」查看。</p></div>}
 {enabled('LOTTERY')&&<label className="block">關聯抽獎<select className={control} value={a.modules.find(m=>m.type==='LOTTERY')?.resourceId||''} onChange={e=>onChange({...a,modules:a.modules.map(m=>m.type==='LOTTERY'?{...m,resourceId:e.target.value}:m)})}><option value="">可先保存活動，再到抽獎管理建立抽獎</option>{draws.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select></label>}
 </GoSurface>;
}
