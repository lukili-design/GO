import {resolveLocalMedia} from '../../utils/localMedia';
import type {Draw} from './LotteryManager';
import React,{useEffect,useState,useRef} from 'react';
import {lotteryPool,lotteryProgress} from '../../utils/lotteryRound';
import {pickLottery} from '../../utils/lottery';
import {seatLabel} from '../../utils/checkInLabels';
import {localTime} from '../../utils/checkIn';
import './lottery-stage.css';
export type ScreenRound={drawId:string;title:string;session:string;mode:string;prize:string;gift:string;revealAt:number;startedAt?:number;manual?:boolean;people:{name:string;department:string;group:string;seat:string}[]};
export const lotteryScreenId=(d:Draw)=>d.source==='ACTIVITY'?`${d.activityId}:${d.sessionId||'session-1'}`:d.id;
export const screenKey=(id:string)=>`go-lottery-screen-${id}`;
const readDraws=():Draw[]=>JSON.parse(localStorage.getItem('go-lottery-draws-v1')||'[]');
export function LotteryScreen({id}:{id:string}){
 const [round,setRound]=useState<ScreenRound|null>(null),[now,setNow]=useState(Date.now()),[draws,setDraws]=useState<Draw[]>([]),[selected,setSelected]=useState(''),[error,setError]=useState(''),[page,setPage]=useState(0),[history,setHistory]=useState(false);
 const [media,setMedia]=useState<Record<string,string>>({});
 const audio=useRef<HTMLAudioElement|null>(null);
 useEffect(()=>{try{setDraws(readDraws().map(d=>({...d,status:'PUBLISHED',winners:[],pending:[]})));setRound(null);setSelected(new URLSearchParams(window.location.search).get('draw')||'');}catch{setError('無法載入演示項目。');}const timer=setInterval(()=>setNow(Date.now()),120);return()=>clearInterval(timer);},[id]);

 const scoped=draws.filter(d=>lotteryScreenId(d)===id);
 const d=scoped.find(d=>d.id===selected)||scoped[0];
 const reset=(value:string)=>{setSelected(value);setDraws(prev=>prev.map(x=>({...x,winners:[],pending:[]})));setRound(null);setHistory(false);setPage(0);setError('');};
 useEffect(()=>{let active=true;const urls:string[]=[];setMedia({});const entries=[['background',d?.screenBackground],['waiting',d?.waitingMusic],['drawing',d?.drawingMusic],['reveal',d?.revealSound]];Promise.all(entries.map(async([key,value])=>{if(!value)return [key,''];try{const url=await resolveLocalMedia(value);if(url.startsWith('blob:'))urls.push(url);return [key,url];}catch{if(active)setError('部分媒體無法載入，請重新上傳。');return [key,''];}})).then(values=>{if(active)setMedia(Object.fromEntries(values));else urls.forEach(url=>URL.revokeObjectURL(url));});return()=>{active=false;urls.forEach(url=>URL.revokeObjectURL(url));};},[d?.screenBackground,d?.waitingMusic,d?.drawingMusic,d?.revealSound]);
 const pending=d?.pending||[];
 const revealing=!!round?.people.length&&(round.manual||now<round.revealAt);
 const current=d?.prizes.find(p=>lotteryProgress(d,p.id)<p.count);
 const shown=d?.prizes.find(p=>p.id===pending[0]?.prizeId)||current;
 const completed=!!d&&!current&&!pending.length;
 const audioUrl=revealing?media.drawing:round?.people.length?media.reveal:media.waiting;
 const audioLoop=revealing||!round?.people.length;
 useEffect(()=>{
  if(!audioUrl)return;
  const player=new Audio(audioUrl);audio.current=player;player.loop=audioLoop;
  const play=()=>{void player.play().then(()=>{window.removeEventListener('pointerdown',play);window.removeEventListener('keydown',play);}).catch(()=>{/* Browser may require a user gesture. */});};
  play();window.addEventListener('pointerdown',play,{once:true});window.addEventListener('keydown',play,{once:true});
  return()=>{window.removeEventListener('pointerdown',play);window.removeEventListener('keydown',play);player.pause();player.removeAttribute('src');player.load();if(audio.current===player)audio.current=null;};
 },[audioUrl,audioLoop,d?.id,round?.startedAt]);

 const act=(kind:'START'|'REVEAL'|'CONFIRM')=>{setError('');try{
  const live=d;if(!live)throw Error('暫無可用的演示項目。');
  if(kind==='REVEAL'){if(!round?.manual)return;if(Date.now()-(round.startedAt||0)<3000)return;setRound({...round,manual:false,revealAt:Date.now()});return;}
  if(kind==='CONFIRM'){if(revealing||!live.pending?.length)return;setDraws(prev=>prev.map(x=>x.id===live.id?{...x,winners:[...x.winners,...(x.pending||[])],pending:[]}:x));setRound(null);setHistory(false);setPage(0);return;}
  if(live.pending?.length)return;
  const prize=live.prizes.find(p=>lotteryProgress(live,p.id)<p.count);if(!prize)return;
  const pool=lotteryPool(live,draws,prize.id);if(!pool.length)throw Error('沒有剩餘的演示人員，請按「重新示範」從頭開始。');
  const seat=live.mode==='TABLE'?pickLottery([...new Set(pool.map(p=>seatLabel(p.seat)))],1)[0]:'';
  const result=(live.mode==='TABLE'?pool.filter(p=>seatLabel(p.seat)===seat):pickLottery(pool,1)).map(p=>({...p,prizeId:prize.id,prize:prize.name,gift:prize.gift,time:localTime()}));
  setDraws(prev=>prev.map(x=>x.id===live.id?{...x,pending:result}:x));
  setRound({drawId:live.id,title:live.title,session:'年會抽獎演示',mode:live.mode||'ALL',prize:prize.name,gift:prize.gift,startedAt:Date.now(),manual:true,revealAt:0,people:result.map(p=>({name:p.name,department:p.department,group:p.group,seat:seatLabel(p.seat)}))});setPage(0);setHistory(false);
 }catch(e){setError((e as Error).message);}};
 const winners=history?(d?.winners||[]).map(w=>({...w,seat:seatLabel(w.seat)})):round?.drawId===d?.id?round?.people||[]:[];
 const totalPages=Math.max(1,Math.ceil(winners.length/8));
 const names=d?.people||[];
 return <main className={`lottery-stage ${revealing?'is-drawing':''}`} style={media.background?{backgroundImage:`linear-gradient(#20051988,#200519cc),url("${media.background.replaceAll('"','%22')}")`}:undefined}>
 <div className="stage-beam left"/><div className="stage-beam right"/><div className="stage-stars"/>

 <div className="stage-content"><h1>{d?.title||'現場抽獎'}</h1>
 <select aria-label="抽獎項目" className="stage-select" value={d?.id||''} onChange={e=>reset(e.target.value)}>{!scoped.length&&<option>暫無抽獎項目</option>}{scoped.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select><button className="ml-3" onClick={()=>reset(d?.id||'')}>重新示範</button>
 <section className="stage-panel"><p className="stage-eyebrow">{history?'榮耀時刻 · 得獎名單':completed?'感謝每一份參與':pending.length&&!revealing?'恭喜得獎':revealing?'好運即將揭曉':'今晚，好運屬於誰'}</p>
 <h2>{history?'已公布得獎名單':winners.length?round?.prize:current?.name||'本場抽獎已結束'}</h2><p className="stage-gift">{!history&&(winners.length?round?.gift:current?.gift)}</p>
 {shown?.image&&!revealing&&!winners.length&&<img className="stage-prize-image" src={shown.image} alt={shown.gift}/>}
 {revealing?<div className="stage-reel" aria-label="抽獎中"><div className="stage-ring"/><strong>{d?.mode==='TABLE'?String.fromCharCode(65+Math.floor(now/100)%10):names[Math.floor(now/100)%Math.max(1,names.length)]?.name||'好運降臨'}</strong><p>LUCKY DRAW</p></div>:winners.length?<><div className="stage-confetti" key={`${round?.revealAt}-${history}`}>{Array.from({length:24},(_,i)=><i key={i} style={{left:`${i*4}%`,animationDelay:`${i%6*.1}s`}}/>)}</div>{!history&&d?.mode==='TABLE'&&<div className="stage-seat">得獎座位號碼 <strong>{winners[0]?.seat}</strong></div>}<div className="stage-winners">{winners.slice(Math.min(page,totalPages-1)*8,Math.min(page,totalPages-1)*8+8).map((p,i)=><article key={i}><span>★ WINNER ★</span><h3>{p.name}</h3><p>{p.department}{d?.mode==='TABLE'?` · 第 ${p.group} 枱 · ${p.seat} 號`:''}</p>{'prize' in p&&<p>{String(p.prize)}</p>}</article>)}</div>{totalPages>1&&<div className="stage-pagination"><button disabled={!page} onClick={()=>setPage(page-1)}>上一頁</button><span>{Math.min(page+1,totalPages)} / {totalPages}</span><button disabled={page>=totalPages-1} onClick={()=>setPage(page+1)}>下一頁</button></div>}</>:<div className="stage-ready"><span>✦</span><p>{d?.mode==='TABLE'?'抽取一個座位號，各枱符合資格的人員獲獎':'每次抽出一位幸運得獎者'}</p></div>}
 {error&&<p role="alert" className="stage-error">{error}</p>}
 <div className="stage-actions">{revealing?<button className="stage-primary" disabled={!round?.manual||now-(round.startedAt||0)<3000} onClick={()=>act('REVEAL')}>{round?.manual?'揭曉結果':'揭曉中…'}</button>:pending.length?<button className="stage-primary" onClick={()=>act('CONFIRM')}>確認得獎結果</button>:!completed?<button className="stage-primary" disabled={!d||d.status==='DRAFT'} onClick={()=>act('START')}>開始抽獎</button>:null}</div>
 <p className="stage-progress">{d&&shown?`獎項 ${d.prizes.findIndex(p=>p.id===shown.id)+1} / ${d.prizes.length} · 已抽 ${lotteryProgress(d,shown.id)} / ${shown.count} ${d.mode==='TABLE'?'個座位號':'人'}`:''}</p>
 </section><footer>一席團圓 · 好運同享</footer></div></main>;
}
