import React,{useState} from 'react';
import {GoSurface,GoCmsTable,formControlClass} from '../ui/GoUI';
import type {Coi} from './coiModel';
const events=[
 {id:'SYNC-20261109-003',time:'2026-11-09 10:30:00',result:'部分成功',count:8,error:'2 筆狀態更新未能完成，請查看異常記錄。'},
 {id:'SYNC-20261109-002',time:'2026-11-09 09:30:00',result:'失敗',count:0,error:'來源系統回應逾時，未取得更新資料。'},
 {id:'SYNC-20261109-001',time:'2026-11-09 08:30:00',result:'成功',count:3,error:'—'},
];
const exceptions=[
 {id:'EX-003',employee:'EMP004',name:'張志強',time:'2026-11-09 10:30:00',issue:'提交日期缺失',detail:'回傳狀態為已更新，但沒有提交日期。',state:'待處理'},
 {id:'EX-002',employee:'EMP009',name:'林世榮',time:'2026-11-09 10:30:00',issue:'申報狀態無法識別',detail:'回傳的狀態值不在已設定的對應範圍內。',state:'待處理'},
 {id:'EX-001',employee:'EMP007',name:'馬小玲',time:'2026-11-09 08:30:00',issue:'重複狀態更新',detail:'已核對參考編號，保留最新一筆記錄。',state:'已處理'},
];
export function CoiSyncStatus({item}:{item:Coi}){
 const [filter,setFilter]=useState('待處理');
 const logs=item.demo?events:[],issues=item.demo?exceptions:[],pending=issues.filter(x=>x.state==='待處理'),visible=issues.filter(x=>filter==='全部'||x.state===filter);
 const badge=(text:string)=> <span className={'inline-block rounded-full px-2 py-1 text-xs '+(text==='成功'||text==='已處理'?'bg-emerald-100 text-emerald-800':text==='失敗'?'bg-red-100 text-red-800':'bg-amber-100 text-amber-800')}>{text}</span>;
 return <div className="space-y-5"><div className="grid md:grid-cols-2 gap-4"><GoSurface className="p-5 space-y-2"><h3>上次同步時間</h3><p>{logs[0]?.time||'—'}</p><p className="text-xs text-slate-500">香港時間 {logs[0]&&'· '+logs[0].result}</p></GoSurface><GoSurface className="p-5 space-y-2"><h3>申報來源系統</h3><p>{item.demo?'COI 合規平台':'—'}</p></GoSurface><GoSurface className="p-5 space-y-2"><h3>同步錯誤</h3><p>{logs[0]?.error||'暫無同步記錄'}</p></GoSurface><GoSurface className="p-5 space-y-2"><h3>尚未處理的狀態更新異常</h3><p className="text-2xl font-semibold text-amber-700">{pending.length}</p></GoSurface></div><GoSurface className="p-5 space-y-4"><h3>同步記錄</h3><GoCmsTable><thead><tr>{['同步編號','同步時間（香港）','結果','已更新筆數','錯誤詳情'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{logs.map(x=><tr key={x.id}><td>{x.id}</td><td>{x.time}</td><td>{badge(x.result)}</td><td>{x.count}</td><td>{x.error}</td></tr>)}{!logs.length&&<tr><td colSpan={5}>暫無同步記錄</td></tr>}</tbody></GoCmsTable></GoSurface><GoSurface className="p-5 space-y-4"><div className="flex flex-wrap justify-between gap-4 items-center"><h3>狀態更新異常（{visible.length}）</h3><label>處理狀態<select className={formControlClass} value={filter} onChange={e=>setFilter(e.target.value)}>{['全部','待處理','已處理'].map(x=><option key={x}>{x}</option>)}</select></label></div><GoCmsTable><thead><tr>{['員工編號','姓名','發生時間（香港）','異常類型','詳情','處理狀態'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{visible.map(x=><tr key={x.id}><td>{x.employee}</td><td>{x.name}</td><td>{x.time}</td><td>{x.issue}</td><td>{x.detail}</td><td>{badge(x.state)}</td></tr>)}{!visible.length&&<tr><td colSpan={6}>沒有符合條件的異常記錄</td></tr>}</tbody></GoCmsTable></GoSurface></div>;
}
