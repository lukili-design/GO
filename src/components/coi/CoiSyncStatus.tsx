import React,{useState} from 'react';
import {GoSurface,GoCmsTable,formControlClass} from '../ui/GoUI';
import {policyStaff} from '../policies/policyModel';
import type {Coi} from './coiModel';
// Each entry is one employee update. Earlier failures remain in history after recovery.
const events=[
 {id:'SYNC-006',employeeId:'EMP002',time:'2026-11-10 09:30:00',status:'已更新',result:'成功',error:'—'},
 {id:'SYNC-005',employeeId:'EMP004',time:'2026-11-10 09:28:00',status:'年度覆核到期',result:'失敗',error:'回傳資料缺少提交日期'},
 {id:'SYNC-004',employeeId:'EMP009',time:'2026-11-10 09:26:00',status:'年度覆核到期',result:'失敗',error:'回傳的申報狀態無法識別'},
 {id:'SYNC-003',employeeId:'EMP007',time:'2026-11-10 09:24:00',status:'已更新',result:'成功',error:'—'},
 {id:'SYNC-002',employeeId:'EMP007',time:'2026-11-10 09:20:00',status:'年度覆核到期',result:'失敗',error:'來源系統回應逾時'},
 {id:'SYNC-001',employeeId:'EMP003',time:'2026-11-10 09:18:00',status:'年度覆核到期',result:'成功',error:'—'},
];
export function CoiSyncStatus({item}:{item:Coi}){
 const [filter,setFilter]=useState('全部');
 const logs=item.demo?events.filter(x=>item.people.some(p=>p.employeeId===x.employeeId)):[];
 const latest=new Map<string,typeof events[number]>();
 for(const log of logs){if(!latest.has(log.employeeId))latest.set(log.employeeId,log)}
 const errors=[...latest.values()].filter(x=>x.result==='失敗').length;
 const visible=logs.filter(x=>filter==='全部'||x.result===filter);
 return <div className="space-y-5">
  <GoSurface className="p-5 space-y-5">
   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2"><h3>上次同步時間</h3><p>{logs[0]?.time||'—'}</p><p className="text-xs text-slate-500">香港時間</p></div>
    <div className="space-y-2"><h3>申報來源系統</h3><p>{item.demo?'COI 合規平台':'—'}</p></div>
   </div>
   <div className="flex items-center gap-3 border-t border-slate-100 pt-4"><h3>同步錯誤</h3><span className={'text-2xl font-semibold '+(errors?'text-red-700':'text-slate-700')}>{errors}</span></div>
  </GoSurface>
  <GoSurface className="p-5 space-y-4">
   <div className="flex flex-wrap justify-between gap-4 items-center"><h3>同步記錄</h3><label>同步結果<select className={formControlClass} value={filter} onChange={e=>setFilter(e.target.value)}>{['全部','成功','失敗'].map(x=><option key={x}>{x}</option>)}</select></label></div>
   <GoCmsTable><thead><tr>{['同步時間（香港）','姓名','部門','事業部','申報狀態','同步結果','錯誤原因'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>
    {visible.map(x=>{const staff=policyStaff.find(s=>s.employeeId===x.employeeId);return <tr key={x.id}><td>{x.time}</td><td>{staff?.name||x.employeeId}</td><td>{staff?.dept||'—'}</td><td>{staff?.division||'—'}</td><td>{x.status}</td><td><span className={'inline-block rounded-full px-2 py-1 text-xs '+(x.result==='成功'?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800')}>{x.result}</span></td><td>{x.error}</td></tr>})}
    {!visible.length&&<tr><td colSpan={7}>{logs.length?'沒有符合條件的同步記錄':'暫無同步記錄'}</td></tr>}
   </tbody></GoCmsTable>
  </GoSurface>
 </div>;
}
