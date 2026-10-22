import React,{useState} from 'react';
import type {Activity} from '../../types';
import type {Draw} from './LotteryManager';
import {sessionConfig} from '../../utils/checkInSessions';
import {lotteryScreenId} from './LotteryScreen';
import {GoButton,GoSurface,formControlClass} from '../ui/GoUI';
export function LotteryScreenLauncher({activities}:{activities:Activity[]}) {
 const [draws]=useState<Draw[]>(()=>{try{return JSON.parse(localStorage.getItem('go-lottery-draws-v1')||'[]');}catch{return [];}});
 const [selected,setSelected]=useState(draws[0]?.id||'');
 const draw=draws.find(d=>d.id===selected);
 const source=activities.find(a=>a.id===draw?.activityId);
 const session=source&&sessionConfig(source).sessions!.find(s=>s.id===(draw?.sessionId||'session-1'));
 return <GoSurface className="go-type p-6 space-y-5 max-w-2xl w-full mx-auto"><h2>抽獎大屏</h2><p>選擇抽獎項目後開啟大屏，在大屏體驗開始抽獎、揭曉及結果公布；每次開啟均從第一個獎項開始。</p><label className="block">抽獎項目<select className={formControlClass} value={selected} onChange={e=>setSelected(e.target.value)}>{!draws.length&&<option value="">暫無抽獎項目</option>}{draws.map(d=><option key={d.id} value={d.id}>{d.title} · {activities.find(a=>a.id===d.activityId)?.checkIn?.sessions?.find(s=>s.id===d.sessionId)?.name||'場次一'}</option>)}</select></label>{draw&&<p>{source?.title||draw.title}{session?` · ${session.name}`:''}</p>}<GoButton disabled={!draw} onClick={()=>{if(!draw)return;const id=lotteryScreenId(draw);const url=new URL(window.location.href);url.search='';url.searchParams.set('lotteryScreen',id);window.open(url.href,'_blank','noopener');}}>開啟抽獎大屏</GoButton><p className="text-xs text-slate-500">大屏在新分頁開啟，可移到現場顯示器並切換全螢幕。演示結果不會修改 CMS 記錄。</p></GoSurface>;
}
