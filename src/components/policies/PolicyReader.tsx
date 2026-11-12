import {ArticleBody} from '../voting/ArticleBody';
import React,{useEffect,useRef,useState} from 'react';


import type {VoteArticle} from '../../types';
import {GoButton,GoSurface,GoModalClose,GoNotice} from '../ui/GoUI';
import {resolveLocalMedia} from '../../utils/localMedia';
import {downloadPolicyFile} from './PolicySettings';
import {policyUser,usePolicyRecords,writePolicyRecord,PolicyFile} from './policyModel';

function confirmationTime(value:string){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value));
 const get=(type:string)=>parts.find(p=>p.type===type)?.value||'';
 const hour=Number(get('hour'));
 return `${get('year')} 年 ${Number(get('month'))} 月 ${Number(get('day'))} 日${hour<12?'上午':'下午'} ${hour%12||12}:${get('minute')}`;
}
function Signature({onCancel,onSubmit}:{onCancel:()=>void;onSubmit:(data:string)=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),drawing=useRef(false),length=useRef(0),last=useRef({x:0,y:0});const [valid,setValid]=useState(false);
 const point=(e:React.PointerEvent<HTMLCanvasElement>)=>{const rect=e.currentTarget.getBoundingClientRect();return {x:(e.clientX-rect.left)*600/rect.width,y:(e.clientY-rect.top)*240/rect.height}};
 return <div role="dialog" aria-modal="true" aria-label="手寫簽名" className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-3"><GoSurface className="go-type p-4 w-full space-y-4"><div className="flex justify-between"><h3>手寫簽名</h3><GoModalClose onClick={onCancel}/></div><p>請在下方簽名，確認已閱讀並同意本版本政策。</p><canvas ref={canvas} width={600} height={240} aria-label="簽名區" className="w-full bg-white border rounded-xl touch-none" onPointerDown={e=>{drawing.current=true;last.current=point(e);e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(!drawing.current)return;const next=point(e),ctx=canvas.current!.getContext('2d')!;ctx.strokeStyle='#111827';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(last.current.x,last.current.y);ctx.lineTo(next.x,next.y);ctx.stroke();length.current+=Math.hypot(next.x-last.current.x,next.y-last.current.y);last.current=next;setValid(length.current>20)}} onPointerUp={()=>drawing.current=false} onPointerCancel={()=>drawing.current=false}/><div className="flex flex-wrap gap-2"><GoButton variant="secondary" onClick={()=>{canvas.current!.getContext('2d')!.clearRect(0,0,600,240);length.current=0;setValid(false)}}>清除重簽</GoButton><GoButton variant="secondary" onClick={onCancel}>取消</GoButton><GoButton disabled={!valid} onClick={()=>onSubmit(canvas.current!.toDataURL('image/png'))}>提交</GoButton></div></GoSurface></div>
}
export function PolicyReader({article,onBack,preview=false}:{article:VoteArticle;onBack:()=>void;preview?:boolean;key?:string}){
 const p=article.policy!,v=p.versions.at(-1);const records=usePolicyRecords();const [bottom,setBottom]=useState(false),[loaded,setLoaded]=useState(v?.mode!=='PDF'&&v?.contentType!=='VIDEO'),[error,setError]=useState(''),[sign,setSign]=useState(false);const reader=useRef<HTMLDivElement>(null),end=useRef<HTMLDivElement>(null);
 const delay=Math.max(0,v?.readDelaySeconds||0);
 const timerKey=article.id+':'+v?.version;
 const [timer,setTimer]=useState(()=>({key:timerKey,remaining:delay}));
 const remaining=timer.key===timerKey?timer.remaining:delay;
 useEffect(()=>{
  const deadline=Date.now()+delay*1000;
  setTimer({key:timerKey,remaining:delay});setSign(false);
  if(!delay)return;
  const id=window.setInterval(()=>{const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));setTimer({key:timerKey,remaining:left});if(!left)window.clearInterval(id)},250);
  return()=>window.clearInterval(id);
 },[timerKey,delay]);
 const targeted=p.targets.includes(policyUser.employeeId);const record=records.find(r=>r.articleId===article.id&&r.round===v?.round&&r.employeeId===policyUser.employeeId);
 useEffect(()=>{if(v&&targeted&&!preview){try{writePolicyRecord({articleId:article.id,round:v.round,employeeId:policyUser.employeeId,openedAt:new Date().toISOString()})}catch{setError('閱讀記錄保存失敗，請檢查瀏覽器儲存空間。')}}},[article.id,v?.round,targeted,preview]);
 useEffect(()=>{if(!loaded||!end.current)return;const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))setBottom(true)},{root:reader.current,threshold:1});observer.observe(end.current);return()=>observer.disconnect()},[loaded]);
 if(!v)return <div className="p-5 space-y-4"><GoButton onClick={onBack}>返回</GoButton><p>此政策尚未發布。</p></div>;
 const submit=(signature?:string)=>{if(remaining>0||!bottom||!loaded)return;if(v.signature&&!signature){setError('請完成手寫簽名後一併提交確認。');return;}if(preview){setSign(false);setError('這是預覽，不會保存確認或簽名。');return;}try{writePolicyRecord({articleId:article.id,round:v.round,employeeId:policyUser.employeeId,openedAt:record?.openedAt||new Date().toISOString(),agreedAt:new Date().toISOString(),version:v.version,signature});setSign(false)}catch{setError('確認保存失敗，請重試。')}};
 return <div className="relative h-full bg-white go-type flex flex-col"><div className="go-app-header"><GoButton variant="quiet" onClick={onBack}>← 返回</GoButton><span>政策與程序</span></div><div className="p-4 space-y-3"><h2>{v.title}</h2><p className="text-xs text-slate-500">版本 V{v.version} · {article.author}</p>{preview&&<p>文章預覽 · 不會保存確認記錄</p>}</div>
 <div ref={reader} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5" style={{minHeight:180}}><ArticleBody article={{...v,pdfFile:v.pdf,contentType:v.contentType||(v.mode==='PDF'?'PDF':'TEXT')}} onLoaded={()=>setLoaded(true)} onError={setError}/>

 {!!v.attachments.length&&<section className="space-y-2"><h3>附件下載</h3>{v.attachments.map(f=><div key={f.ref}><GoButton variant="secondary" onClick={()=>downloadPolicyFile(f).catch(()=>setError('附件下載失敗，請重試。'))}>{f.name}</GoButton></div>)}</section>}{loaded&&<div ref={end} className="h-2"/>}</div>
 <div className="p-4 border-t space-y-3">{error&&<GoNotice>{error}</GoNotice>}{record?.agreedAt&&(!p.versions.find(x=>x.version===record.version)?.signature||!!record.signature)?<div className="rounded-xl bg-emerald-50 text-emerald-800 p-3"><p>✓ 已於 {confirmationTime(record.agreedAt)} 確認</p>{record.signature&&<p>已提交手寫簽名</p>}{record.version!==v.version&&<p>目前為 V{v.version}，本次更新毋須重新確認。</p>}</div>:!targeted&&!preview?<p>你不在本政策的確認名單中。</p>:<><p className="text-xs text-slate-500">{v.contentType==='VIDEO'&&!loaded?'請播放視頻至結束後確認。':bottom?(remaining>0?'請等待倒數結束後確認。':'已閱讀至底部，可提交確認。'):'請閱讀至內容底部後確認。'}{v.signature?'本政策需要手寫簽名。':''}</p><GoButton className="w-full" disabled={!bottom||!loaded||remaining>0} onClick={()=>v.signature?setSign(true):submit()}>{v.buttonText||'已閱讀並同意'}{remaining>0?`（${remaining} 秒）`:''}</GoButton></>}</div>{sign&&<Signature onCancel={()=>setSign(false)} onSubmit={submit}/>}</div>
}
