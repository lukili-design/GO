import {sessionConfig,sessionActivity} from '../../utils/checkInSessions';
import {seatLabel} from '../../utils/checkInLabels';
import React,{useState} from 'react';
import type {Activity,VotingCampaign} from '../../types';
import type {Draw} from './LotteryManager';
import {GoButton,GoSurface,GoNotice,GoCmsTable,GoCmsListFilters,GoModalClose,formControlClass as control} from '../ui/GoUI';
import {VotingCampaignManager} from '../voting/VotingCampaignManager';
import {buildActivityReport} from './activityReport';
import {INITIAL_VOTE_LOGS} from '../../data/voteMockData';
import {checkInSendProblem,localTime} from '../../utils/checkIn';
export function ActivityDataReport({activity:a,mode,campaigns,onSave,onClose,triggerSound}:{activity:Activity;mode:'STATS'|'DETAILS';campaigns:VotingCampaign[];onSave:(a:Activity)=>void;onClose:()=>void;triggerSound:(f:number,t:OscillatorType,d:number)=>void}){
 const [sessionId,setSessionId]=useState(''),[drawMode,setDrawMode]=useState(''),[prize,setPrize]=useState('');
 const config=sessionConfig(a),sessionName=(id?:string)=>config.sessions!.find(s=>s.id===id)?.name||'未指定場次';
 const types=(['VOTING','CHECK_IN','LOTTERY'] as const).filter(type=>a.modules.some(m=>m.enabled&&m.type===type));
 const [tab,setTab]=useState<string>(types[0]||''),[notice,setNotice]=useState('');
 const navigation=<div className="go-type flex gap-2 flex-wrap">{types.map(type=><GoButton key={type} variant={tab===type?'primary':'secondary'} onClick={()=>{setTab(type);setNotice('');}}>{{VOTING:'投票',CHECK_IN:'簽到',LOTTERY:'抽獎'}[type]}</GoButton>)}</div>;
 if(tab==='VOTING'){
  let logs=INITIAL_VOTE_LOGS;try{const saved=JSON.parse(localStorage.getItem('tvb_voting_audit_logs')||'null');if(Array.isArray(saved))logs=saved;}catch{}
  return <VotingCampaignManager campaigns={campaigns} report={{...buildActivityReport(a,campaigns,logs),mode,onClose,navigation}} onSaveCampaign={()=>{}} onDeleteCampaign={()=>{}} triggerSound={triggerSound}/>;
 }
 const people=config.people.filter(p=>!sessionId||p.sessionId===sessionId),arrived=people.filter(p=>p.checkedAt).length;
 let draws:Draw[]=[];try{const saved=JSON.parse(localStorage.getItem('go-lottery-draws-v1')||'[]');if(Array.isArray(saved))draws=saved;}catch{}
 const ids=new Set(a.modules.filter(m=>m.enabled&&m.type==='LOTTERY').map(m=>m.resourceId));
 const linked=draws.filter(d=>ids.has(d.id));
 const filtered=linked.filter(d=>(!sessionId||d.sessionId===sessionId)&&(!drawMode||(d.mode||'ALL')===drawMode));
 const selected=filtered.filter(d=>!prize||d.prizes.some(p=>p.id===prize));
 const winners=selected.flatMap(d=>d.winners.filter(w=>!prize||w.prizeId===prize).map(w=>({...w,draw:d.title,mode:d.mode||'ALL',sessionId:d.sessionId})));
 const eligible=selected.flatMap(d=>d.people.filter(p=>d.mode!=='TABLE'||(d.groups||[]).includes(p.group)));
 const metrics=tab==='CHECK_IN'?[['參與人數',people.length],['已簽到',arrived],['未簽到',people.length-arrived],['簽到率',people.length?`${Math.round(arrived/people.length*100)}%`:'0%']]:[['抽獎項目',selected.length],['參與抽獎人數',new Set(eligible.map(p=>p.employeeId||p.id)).size],['中獎人數',new Set(winners.map(w=>w.employeeId||w.id)).size],['中獎人次',winners.length]];
 const resend=(id:string)=>{const p=people.find(p=>p.id===id);if(!p||!a.checkIn)return;const sendError=checkInSendProblem(sessionActivity(a,p.sessionId||config.sessions![0].id));if(sendError||!p.invitationReady){setNotice(sendError||'請先重新生成邀請函。');return;}onSave({...a,updatedAt:localTime(),checkIn:{...a.checkIn,people:config.people.map(p=>p.id===id?{...p,mailStatus:'SENT',sentAt:localTime(),needsResend:false}:p)}});setNotice('已模擬重發電郵，未實際寄信。');};
 const headers=tab==='CHECK_IN'?['場次','員工編號','姓名','部門','組別／枱號','座位號','簽到狀態','簽到時間']:['場次','抽獎項目','抽獎模式','獎項','獎品','中獎人','部門','枱號','座位號','抽獎時間'];
 return <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label={mode==='STATS'?'活動總體數據':'活動明細'}><GoSurface className="go-type w-full max-w-6xl max-h-[90vh] overflow-auto p-6 space-y-5">
 <div className="flex items-center justify-between gap-4"><h2>{a.title} · {mode==='STATS'?'總體數據':'明細'}</h2><GoModalClose onClick={onClose}/></div>{navigation}
 {!types.length?<p>尚未關聯活動功能</p>:<>
 <GoCmsListFilters><div className="flex flex-wrap items-end gap-3"><label className="block w-full sm:w-40">場次<select className={control} value={sessionId} onChange={e=>{setSessionId(e.target.value);setPrize('');}}><option value="">全部場次</option>{config.sessions!.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>{tab==='LOTTERY'&&<><label className="block w-full sm:w-40">抽獎模式<select className={control} value={drawMode} onChange={e=>{setDrawMode(e.target.value);setPrize('');}}><option value="">全部模式</option><option value="TABLE">按枱抽獎</option><option value="ALL">全場抽獎</option></select></label><label className="block w-full sm:w-80 min-w-0">獎項<select className={control} value={prize} onChange={e=>setPrize(e.target.value)}><option value="">全部獎項</option>{filtered.flatMap(d=>d.prizes.map(p=><option key={`${d.id}-${p.id}`} value={p.id}>{d.title} · {p.name}</option>))}</select></label></>}</div></GoCmsListFilters>
 {notice&&<GoNotice>{notice}</GoNotice>}
 {mode==='STATS'&&<div className="grid grid-cols-2 md:grid-cols-4 gap-3">{metrics.map(([label,value])=><GoSurface key={label} className="p-4"><p className="text-slate-500">{label}</p><strong className="text-2xl">{value}</strong></GoSurface>)}</div>}
 <h3>{tab==='CHECK_IN'?'簽到記錄':'抽獎記錄'}</h3>
 <GoCmsTable><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{tab==='CHECK_IN'?people.map(p=><tr key={p.id}>{[sessionName(p.sessionId),p.employeeId,p.name,p.department,p.group||'—',seatLabel(p.seat)||'—',p.checkedAt?'已簽到':'未簽到',p.checkedAt||'—'].map((v,i)=><td key={i}>{v}</td>)}</tr>):winners.map((w,i)=><tr key={i}>{[sessionName(w.sessionId),w.draw,w.mode==='TABLE'?'按枱抽獎':'全場抽獎',w.prize,w.gift,w.name,w.department,w.group||'—',seatLabel(w.seat)||'—',w.time].map((v,j)=><td key={j}>{v}</td>)}</tr>)}{(tab==='CHECK_IN'?!people.length:!winners.length)&&<tr><td colSpan={headers.length} className="text-center">暫無記錄</td></tr>}</tbody></GoCmsTable>
 {tab==='CHECK_IN'&&mode==='STATS'&&<details className="space-y-4"><summary className="cursor-pointer font-medium">部門、分組及電郵統計</summary><div className="grid md:grid-cols-2 gap-3">{[...new Set(people.map(p=>p.department))].map(d=><p key={d}>{d}：{people.filter(p=>p.department===d&&p.checkedAt).length}／{people.filter(p=>p.department===d).length} 人已簽到</p>)}{[...new Set(people.filter(p=>p.group).map(p=>`${p.sessionId}|${p.group}`))].map(g=><p key={g}>{sessionName(g.split('|')[0])} · 組別／枱號 {g.split('|')[1]}：{people.filter(p=>`${p.sessionId}|${p.group}`===g&&p.checkedAt).length}／{people.filter(p=>`${p.sessionId}|${p.group}`===g).length} 人已簽到</p>)}</div><div className="flex gap-6">{(['SENT','NOT_SENT','FAILED'] as const).map((s,i)=><p key={s}>{['已發送','未發送','發送失敗'][i]}：{people.filter(p=>p.mailStatus===s).length}</p>)}</div><GoCmsTable><thead><tr>{['姓名','電郵','發送狀態','最近發送時間','操作'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{people.map(p=><tr key={p.id}><td>{p.name}</td><td>{p.email}</td><td>{p.needsResend?'待重發':{SENT:'已發送',NOT_SENT:'未發送',FAILED:'發送失敗'}[p.mailStatus]}</td><td>{p.sentAt||'—'}</td><td>{p.mailStatus!=='NOT_SENT'&&<GoButton variant="quiet" onClick={()=>resend(p.id)}>重發電郵</GoButton>}</td></tr>)}</tbody></GoCmsTable></details>}
 </>}</GoSurface></div>;
}
