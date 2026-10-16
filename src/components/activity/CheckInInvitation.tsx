const festiveBackground = new URL('../../assets/invitation-festive.svg', import.meta.url).href;
import {checkInCode} from '../../utils/checkInSessions';
import {seatLabel,groupLabel} from '../../utils/checkInLabels';
import React,{useState,useEffect} from 'react';
import QRCode from 'qrcode';
import type {Activity,CheckInPerson} from '../../types';
import {GoButton,GoNotice,GoSurface} from '../ui/GoUI';
import {invitationTemplate,renderInvitationText,invitationCopy,invitationEmailBody,invitationEmailSubject} from '../../utils/checkIn';
export function CheckInInvitation({activity:a,person,showEmail=false}:{activity:Activity;person?:CheckInPerson;showEmail?:boolean}){
 const [qr,setQr]=useState(''),[error,setError]=useState(''),[card,setCard]=useState(!showEmail);
 const c=a.checkIn;
 useEffect(()=>{setCard(!showEmail);},[showEmail,person?.id]);
 useEffect(()=>{let live=true;setQr('');setError('');if(person)QRCode.toDataURL(checkInCode(a,person),{width:240,margin:3,errorCorrectionLevel:'M'}).then(url=>{if(live)setQr(url);}).catch(()=>{if(live)setError('二維碼生成失敗，請重試。');});return()=>{live=false;};},[a.id,person?.token,person?.sessionId]);
 if(!c)return null;
 const background=c.invitationBackground??festiveBackground;
 return <div className="space-y-4">{showEmail&&<GoSurface className="p-5 space-y-3 text-left"><h3>電郵預覽</h3><p>收件人：{person?`${person.name} <${person.email}>`:'請選擇人員'}</p><p>主旨：{(c.emailSubject??invitationEmailSubject).replaceAll('{活動名稱}',a.title)}</p><hr/><p className="whitespace-pre-wrap">{renderInvitationText(invitationTemplate(c.emailBody,true),a,person)}</p><GoButton onClick={()=>setCard(true)}>查看電子邀請函</GoButton><p className="text-xs text-slate-500">預覽按鈕在本頁打開個人卡片，不會發送電郵。</p></GoSurface>}
 {card&&<div className="rounded-2xl overflow-hidden px-5 pt-24 pb-8 bg-slate-100" style={background?{backgroundImage:`url("${background}")`,backgroundSize:'cover',backgroundPosition:'center'}:undefined}><div className="rounded-xl bg-white/95 p-5 text-slate-900 text-center space-y-3"><p className="text-xs text-slate-500">電子邀請函</p><h2>{a.title||'活動名稱'}</h2><p className="whitespace-pre-wrap">{renderInvitationText(invitationTemplate(c.invitationMessage),a,person)}</p>{qr&&<img src={qr} alt={`${person?.name}的個人簽到二維碼`} className="mx-auto w-52 h-52 bg-white p-2"/>}{!person&&<p className="bg-white p-5 border rounded-lg">導入參加名單後可預覽個人二維碼</p>}{error&&<GoNotice>{error}</GoNotice>}</div></div>}
 </div>;
}
