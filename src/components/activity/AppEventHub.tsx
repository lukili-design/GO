import {lotteryProgress} from '../../utils/lotteryRound';
import {GoExpandableText} from '../ui/GoExpandableText';
import {createPortal} from 'react-dom';
import React,{useState,useEffect,useRef} from 'react';
import type {Activity,VotingCampaign} from '../../types';
import type {Draw} from './LotteryManager';
import {ActivityCard,AppActivityDetail,publishedActivities} from './AppActivityViews';
import {GoButton,GoBanner,GoNotice,GoBackButton,formControlClass} from '../ui/GoUI';
import {CheckInInvitation} from './CheckInInvitation';
import {sessionConfig,sessionActivity} from '../../utils/checkInSessions';
import {appEmployee,registerActivity} from '../../utils/activityRegistration';
import {seatLabel} from '../../utils/checkInLabels';
const eventTimeRange=(start:string,end:string)=>{const from=start.replace('T',' ').slice(0,16),to=end.replace('T',' ').slice(0,16);return `${from}–${from.slice(0,10)===to.slice(0,10)?to.slice(11):to}`;};
export function AppEventHub({activities,campaigns,userVotes,onVoteSubmit,onSave,onBack,initialId}:{activities:Activity[];campaigns:VotingCampaign[];userVotes:Record<string,string[]>;onVoteSubmit?:(c:string,p:string,o:string[])=>void;onSave?:(a:Activity)=>void;onBack:()=>void;initialId?:string}){
 const [registrationDemo,setRegistrationDemo]=useState('UNREGISTERED'),[resultDemo,setResultDemo]=useState('WAITING');
 const [lotterySession,setLotterySession]=useState('');
 const top=useRef<HTMLDivElement>(null);
 const [selected,setSelected]=useState(initialId||''),[tab,setTab]=useState('INFO'),[session,setSession]=useState(''),[notice,setNotice]=useState(''),[vote,setVote]=useState(false),[draws,setDraws]=useState<Draw[]>([]);
 useEffect(()=>{const read=()=>{try{setDraws(JSON.parse(localStorage.getItem('go-lottery-draws-v1')||'[]'));}catch{}};read();const timer=setInterval(read,1000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{top.current?.scrollTo({top:0});},[selected,tab]);
 const base=publishedActivities(activities);
 const banquet=base.find(a=>a.id==='ACT-DEMO-BANQUET');
 const available=base.map(a=>a.id==='ACT-DEMO-BANQUET'?{...a,status:'PUBLISHED' as const,startTime:'2027-02-05 18:00:00',endTime:'2027-02-06 23:59:59'}:a);
 if(banquet)available.push({...banquet,id:'APP-DEMO-BANQUET-ENDED',title:'新春盆菜宴（已結束）',status:'ENDED'});
 const order=(id:string)=>id==='ACT-DEMO-BANQUET'?0:id==='APP-DEMO-BANQUET-ENDED'?1:2;
 available.sort((a,b)=>order(a.id)-order(b.id));
 const a=available.find(a=>a.id===selected);
 if(!a)return <div ref={top} className="go-type h-full min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4"><GoBackButton onClick={onBack}/>{available.map(a=><ActivityCard key={a.id} activity={a} campaigns={campaigns} onOpen={()=>{setSelected(a.id);setLotterySession('');setTab('INFO');setNotice('');setSession('');}}/>)}{!available.length&&<p>暫時沒有已發布的活動。</p>}</div>;
 if(vote)return <AppActivityDetail activity={a} campaigns={campaigns} userVotes={userVotes} onVoteSubmit={onVoteSubmit} onBack={()=>setVote(false)}/>;
 const demo=a.id==='ACT-DEMO-BANQUET'||a.id==='APP-DEMO-BANQUET-ENDED';
 const demoEnded=a.id==='APP-DEMO-BANQUET-ENDED';
 const c=sessionConfig(a);
 if(demo&&!demoEnded)c.sessions=c.sessions!.map((s,i)=>({...s,registrationMode:'OPEN',registrationStart:'2026-01-01 00:00:00',registrationEnd:'2027-02-05 17:00:00',registrationCapacity:100,opensAt:`2027-02-${i?'06':'05'} 18:00:00`,closesAt:`2027-02-${i?'06':'05'} 23:59:59`}));
 const demoPerson={...appEmployee,id:'APP-PREVIEW-PERSON',sessionId:session||c.sessions![0].id,group:tab==='INFO'&&registrationDemo==='UNASSIGNED'?'':'1',seat:tab==='INFO'&&registrationDemo==='UNASSIGNED'?'':'A',token:'APP-PREVIEW-ONLY',invitationReady:true,mailStatus:'SENT' as const,checkedAt:registrationDemo==='CHECKED'?`${(c.sessions!.find(s=>s.id===session)||c.sessions![0]).opensAt.slice(0,10)} 18:05:00`:undefined};
 const person=demo?(demoEnded?undefined:tab==='INFO'&&registrationDemo==='UNREGISTERED'?undefined:demoPerson):c.people.find(p=>p.employeeId===appEmployee.employeeId),has=(type:string)=>a.modules.some(m=>m.enabled&&m.type===type);
 const color=(v:string|undefined,f:string)=>/^#[\da-f]{6}$/i.test(v||'')?v!:f;
 const start=color(a.backgroundGradientStart,color(a.headerBannerColor,'#e0edff')),end=color(a.backgroundGradientEnd,start);
 const dark=a.contentOverlay!=='LIGHT';
 const linked=new Set(a.modules.filter(m=>m.enabled&&m.type==='LOTTERY').map(m=>m.resourceId));
 const chosen=c.sessions!.find(s=>s.id===session),now=Date.now();
 const canRegister=demo?!demoEnded&&!!session:a.status==='PUBLISHED'&&Date.parse(a.endTime.replace(' ','T'))>now&&chosen?.registrationMode==='OPEN'&&Date.parse((chosen.registrationStart||'').replace(' ','T'))<=now&&Date.parse((chosen.registrationEnd||'').replace(' ','T'))>now&&c.people.filter(p=>p.sessionId===session).length<(chosen.registrationCapacity||0);
 const ended=a.status==='ENDED'||Date.parse(a.endTime.replace(' ','T'))<=now;
 const activeLotterySession=c.sessions!.find(s=>s.id===lotterySession)||c.sessions!.find(s=>s.id===person?.sessionId)||c.sessions![0];
 const results=draws.filter(d=>d.status!=='DRAFT'&&linked.has(d.id)&&(d.sessionId||c.sessions![0].id)===activeLotterySession.id);
 if(demo){
   const prizes=[{id:'preview-prize',name:'幸運獎',gift:'新春禮盒',count:1},{id:'preview-grand',name:'大獎',gift:'購物禮券',count:1}];
   const winner=resultDemo==='WON'&&!demoEnded?demoPerson:{...demoPerson,id:'APP-PREVIEW-OTHER',employeeId:'APP-PREVIEW-OTHER',name:'李嘉欣',department:'行政部',seat:'C'};
   const finished=demoEnded||resultDemo==='WON'||resultDemo==='LOST';
   const awarded=(finished?prizes:resultDemo==='DRAWING'?prizes.slice(0,1):[]).map((prize,i)=>({...winner,...(i?{id:'APP-PREVIEW-SECOND',employeeId:'APP-PREVIEW-SECOND',name:'黃偉文',seat:'D'}:{}),prizeId:prize.id,prize:prize.name,gift:prize.gift,time:demoEnded?'2026-09-24 20:00:00':'2027-02-05 20:00:00'}));
   results.splice(0,results.length,{id:'APP-PREVIEW-DRAW',title:'全場抽獎',source:'ACTIVITY',activityId:a.id,sessionId:activeLotterySession.id,mode:'ALL',people:[winner],repeat:false,prizes,winners:awarded});
 }
 // Keep unpublished results out of every APP result presentation.
 results.forEach((d,i)=>{if(d.publicResults===false)results[i]={...d,winners:[],pending:[]};});
 const drawState=(d:Draw)=>d.prizes.length>0&&d.prizes.every(p=>lotteryProgress(d,p.id)>=p.count)?'已抽獎':d.winners.length||d.pending?.length?'抽獎中':'未開始';
 const published=results.filter(d=>d.winners.length>0);
 const allDrawsDone=results.length>0&&results.every(d=>drawState(d)==='已抽獎');
 const myWins=results.flatMap(d=>d.winners.filter(w=>w.employeeId===appEmployee.employeeId).map(w=>({drawId:d.id,winner:w})));

 const host=document.getElementById('app-event-demo-controls');
 const choices=tab==='INFO'?[['UNREGISTERED','未報名'],['REGISTERED','報名成功'],['UNASSIGNED','未分配枱號及座位號'],['CHECKED','已簽到']]:[['WAITING','未開始'],['DRAWING','抽獎中'],['WON','已得獎'],['LOST','未得獎']];
 const state=tab==='INFO'?registrationDemo:resultDemo;
 const controls=demo&&host?createPortal(<div className="go-type rounded-xl border border-slate-200 bg-white p-3 flex flex-wrap items-center justify-center gap-2"><span className="text-xs text-slate-500">演示狀態</span>{demoEnded?<span className="text-sm">活動已結束</span>:choices.map(([id,label])=><GoButton key={id} variant={state===id?'primary':'secondary'} onClick={()=>{(tab==='INFO'?setRegistrationDemo:setResultDemo)(id);setNotice('');}}>{label}</GoButton>)}</div>,host):null;
 return <>{controls}<div ref={top} className="go-type h-full min-h-0 overflow-y-auto overscroll-contain go-event-detail" style={{background:`linear-gradient(${start},${end})`}}><div className="bg-white p-3"><GoBackButton onClick={()=>initialId?onBack():setSelected('')}/></div>{a.headerBannerImage&&<GoBanner src={a.headerBannerImage} alt={a.title}/>}
 <div className="go-event-body" style={{background:dark?'rgba(20,20,30,.86)':'rgba(255,255,255,.96)',color:dark?'white':'#0f172a'}}><div className="go-event-intro"><span className="go-event-badge">{ended?'已結束':Date.parse(a.startTime.replace(' ','T'))>now?'即將開始':'進行中'}</span><h2>{a.title}</h2><p className="text-xs whitespace-nowrap overflow-x-auto">{eventTimeRange(a.startTime,a.endTime)}</p></div><div className="go-event-tabs">{[['INFO','簽到活動'],...(has('LOTTERY')?[['RESULT','抽獎活動']]:[])].map(([id,title])=><GoButton key={id} variant={tab===id?'primary':'secondary'} onClick={()=>setTab(id)}>{title}</GoButton>)}</div>
 {tab==='INFO'&&<><section className="go-event-section"><h3>活動介紹</h3><GoExpandableText text={a.description}/></section>{has('CHECK_IN')&&<>{person?<section className="go-event-section"><h3>我的參與</h3><p>已報名／獲邀 · {c.sessions!.find(s=>s.id===person.sessionId)?.name}</p><p>{person.group?`第 ${person.group} 枱`:'枱號待安排'}{person.seat?` · ${seatLabel(person.seat)} 號座位`:' · 座位號待安排'}</p>{ended?<p>活動已結束，電子邀請函已失效。</p>:person.invitationReady?<CheckInInvitation showCheckedQr qrStatus={person.checkedAt?'已簽到':undefined} activity={sessionActivity({...a,checkIn:c,id:demo?'APP-PREVIEW-ONLY':a.modules.find(m=>m.enabled&&m.type==='CHECK_IN')?.resourceId||a.id},person.sessionId!)} person={person}/>:<p>您已報名／獲邀，電子邀請函尚未發放，請稍後查看。</p>}</section>:ended?<section className="go-event-section"><h3>活動已圓滿結束</h3><p>感謝您的關注，期待下次與您相聚。</p>{has('LOTTERY')&&<GoButton onClick={()=>setTab('RESULT')}>查看抽獎結果</GoButton>}</section>:<><label className="block">選擇場次<select className={formControlClass} value={session} onChange={e=>setSession(e.target.value)}><option value="">請選擇場次</option>{c.sessions!.map(s=><option key={s.id} value={s.id}>{s.name} · {s.opensAt} · {s.registrationMode==='OPEN'?`${c.people.filter(p=>p.sessionId===s.id).length}/${s.registrationCapacity||0} 人`:'指定名單'}</option>)}</select></label><GoButton disabled={!canRegister||(!demo&&!onSave)} onClick={()=>{try{if(demo){setRegistrationDemo('REGISTERED');}else{onSave?.(registerActivity(a,session));}setNotice('報名成功，邀請函發放後可在此查看。');}catch(e){setNotice((e as Error).message);}}}>確認報名</GoButton>{chosen&&<p className="text-xs">{chosen.registrationMode==='OPEN'?`報名時間：${chosen.registrationStart||'待配置'} — ${chosen.registrationEnd||'待配置'}${!canRegister?'（目前不可報名）':''}`:'此場次由指定名單邀請參加。'}</p>}</>}<section className="go-event-section"><h3>場次安排</h3>{c.sessions!.map(s=><div key={s.id} className="go-event-session"><strong>{s.name}</strong><p className="text-xs whitespace-nowrap overflow-x-auto">簽到：{eventTimeRange(s.opensAt,s.closesAt||a.endTime)}</p><p className="text-xs">活動地點：{s.location||c.location||'待公布'}</p><p className="text-xs">簽到位置：{s.checkInLocation||c.checkInLocation||'於活動地點簽到'}</p></div>)}</section></>}{has('VOTING')&&<GoButton onClick={()=>setVote(true)}>參與投票</GoButton>}{a.rules&&<><h3>活動規則</h3><p className="whitespace-pre-wrap">{a.rules}</p></>}</>}
 {tab==='RESULT'&&<>
 <div className="flex flex-wrap gap-2" aria-label="抽獎場次">{c.sessions!.map(s=><GoButton key={s.id} variant={activeLotterySession.id===s.id?'primary':'secondary'} aria-pressed={activeLotterySession.id===s.id} onClick={()=>setLotterySession(s.id)}>{s.name}</GoButton>)}</div>
 {demoEnded&&<GoNotice>活動已結束，以下為已公布抽獎結果。</GoNotice>}
 {(published.length>0||allDrawsDone)&&<section className="go-event-section"><h3>我的得獎結果</h3>{myWins.length?myWins.map(({drawId,winner:w})=><p key={`${drawId}-${w.prizeId}`}>恭喜您得獎！{w.prize} · {w.gift}</p>):<p>{!person?'您未參與此活動，可查看下方已公布得獎名單。':allDrawsDone?'本次未得獎，感謝您的參與。':'暫未得獎，其他獎項將陸續公布。'}</p>}</section>}
 <section className="go-event-section"><h3>抽獎項目</h3>{!results.length&&<p>抽獎項目尚未公布。</p>}{results.flatMap(d=>d.prizes.map(p=><div key={`${d.id}-${p.id}`} className="go-event-session space-y-2"><div className="flex flex-wrap items-center gap-2"><strong>{d.title} · {p.name}</strong>{d.winners.some(w=>w.employeeId===appEmployee.employeeId&&w.prizeId===p.id)&&<span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">中獎</span>}</div><p>獎品：{p.gift}</p><p>得獎名額：{d.mode==='TABLE'?`每枱 ${p.count} 個座位號`:`${p.count} 人`}</p></div>))}</section>
 <section className="go-event-section"><h3>已公布得獎名單</h3>{!published.length?<p>暫無已公布得獎名單，敬請期待。</p>:published.map(d=><div key={d.id} className="go-event-session space-y-3"><strong>{d.title}</strong><p>{c.sessions!.find(s=>s.id===(d.sessionId||'session-1'))?.name}</p>{d.prizes.filter(p=>d.winners.some(w=>w.prizeId===p.id)).map(p=><div key={p.id}><strong>{p.name} · {p.gift}</strong>{d.winners.filter(w=>w.prizeId===p.id).map((w,i)=><p key={i}>{w.employeeId===appEmployee.employeeId?'恭喜您得獎！ ':''}{w.name} · {w.department}{d.mode==='TABLE'?` · 第 ${w.group} 枱 · ${seatLabel(w.seat)} 號`:''}</p>)}</div>)}</div>)}</section>
 </>}{notice&&<GoNotice>{notice}</GoNotice>}</div>{a.footerBannerImage&&(a.footerBannerLink?<a href={a.footerBannerLink}><GoBanner src={a.footerBannerImage} alt="活動頁尾"/></a>:<GoBanner src={a.footerBannerImage} alt="活動頁尾"/>)}</div></>;
}
