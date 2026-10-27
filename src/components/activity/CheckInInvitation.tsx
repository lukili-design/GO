const festiveBackground = new URL('../../assets/invitation-festive.svg', import.meta.url).href;
import {checkInCode} from '../../utils/checkInSessions';
import {seatLabel,groupLabel} from '../../utils/checkInLabels';
import React,{useState,useEffect} from 'react';
import QRCode from 'qrcode';
import type {Activity,CheckInPerson} from '../../types';
import {GoNotice,GoSurface} from '../ui/GoUI';
import {invitationTemplate,renderInvitationText,invitationCopy,invitationEmailBody,invitationEmailSubject} from '../../utils/checkIn';
export function CheckInInvitation({activity:a,person,showEmail=false,qrStatus,showCheckedQr=false}:{activity:Activity;person?:CheckInPerson;showEmail?:boolean;qrStatus?:string;showCheckedQr?:boolean}){
 const [qr,setQr]=useState(''),[error,setError]=useState('');
 const c=a.checkIn;
 useEffect(()=>{let live=true;setQr('');setError('');if(person)QRCode.toDataURL(checkInCode(a,person),{width:240,margin:3,errorCorrectionLevel:'M'}).then(url=>{if(live)setQr(url);}).catch(()=>{if(live)setError('二維碼生成失敗，請重試。');});return()=>{live=false;};},[a.id,person?.token,person?.sessionId]);
 if(!c)return null;
 const background=c.invitationBackground??festiveBackground;
 const contentColor=/^#[0-9a-f]{6}$/i.test(c.invitationContentColor||'')?c.invitationContentColor!:'#ffffff';
 const rgb=[1,3,5].map(i=>parseInt(contentColor.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
 const dark=0.2126*rgb[0]+0.7152*rgb[1]+0.0722*rgb[2]<0.179;

 return <div className="space-y-4">{showEmail&&<GoSurface className="p-5 space-y-3 text-left"><p>收件人：{person?`${person.name} <${person.email}>`:'請選擇人員'}</p><p>主旨：{(c.emailSubject??invitationEmailSubject).replaceAll('{活動名稱}',a.title)}</p><hr/><p className="whitespace-pre-wrap">{renderInvitationText(invitationTemplate(c.emailBody,true),a,person)}</p></GoSurface>}
 {<div className="rounded-2xl overflow-hidden px-5 pt-24 pb-8 bg-slate-100" style={background?{backgroundImage:`url("${background}")`,backgroundSize:'cover',backgroundPosition:'center'}:undefined}><div className="rounded-xl p-5 text-center space-y-3" style={{backgroundColor:contentColor,color:dark?'#ffffff':'#0f172a'}}><p className="text-xs opacity-70">電子邀請函</p><h2>{a.title||'活動名稱'}</h2><p className="whitespace-pre-wrap">{renderInvitationText(invitationTemplate(c.invitationMessage),a,person)}</p>{qrStatus&&<div className="rounded-xl border border-slate-200 p-5"><strong>{qrStatus}</strong>{person?.checkedAt&&<p className="text-xs mt-2">簽到時間：{person.checkedAt}</p>}</div>}{(!qrStatus||showCheckedQr)&&qr&&<img src={qr} alt={`${person?.name}的個人簽到二維碼`} className="mx-auto w-52 h-52 bg-white p-2"/>}{!person&&<p className="bg-white text-slate-900 p-5 border rounded-lg">導入參加名單後可預覽個人二維碼</p>}{error&&<GoNotice>{error}</GoNotice>}</div></div>}
 </div>;
}
