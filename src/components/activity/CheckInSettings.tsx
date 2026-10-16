import {Trash2} from 'lucide-react';
import {sessionConfig,sessionActivity,mergeSession} from '../../utils/checkInSessions';
import {seatLabel,groupLabel} from '../../utils/checkInLabels';
import React,{useState} from 'react';
import type {Activity,CheckInConfig} from '../../types';
import {GoButton,GoNotice,GoSurface,formControlClass as control} from '../ui/GoUI';
import {invitationTemplate,defaultCheckIn,invitationCopy,invitationEmailBody,invitationEmailSubject} from '../../utils/checkIn';
import {CheckInInvitation} from './CheckInInvitation';
function SessionSettings({activity:a,onChange,times}:{times?:React.ReactNode;key?:string;activity:Activity;onChange:(a:Activity)=>void}){
 const c=a.checkIn||defaultCheckIn();
 const [preview,setPreview]=useState<'CARD'|'EMAIL'|null>(null),[personId,setPersonId]=useState(c.people[0]?.id||''),[error,setError]=useState('');
 const change=(patch:Partial<CheckInConfig>,affectsCard=true)=>onChange({...a,checkIn:{...c,...patch,people:affectsCard?c.people.map(p=>({...p,invitationReady:false,needsResend:p.mailStatus==='SENT'||p.needsResend})):c.people}});
 const person=c.people.find(p=>p.id===personId)||c.people[0];
 return <div className="space-y-6">
 <GoSurface className="p-5 space-y-4"><h3>簽到設定</h3><div className="grid md:grid-cols-2 gap-4">
 <label>活動地點 <span className="text-rose-600">*</span><input className={control} value={c.location} onChange={e=>change({location:e.target.value})} placeholder="例如：TVB 電視城三樓宴會廳"/></label>
 <label>簽到位置（選填）<input className={control} value={c.checkInLocation||''} onChange={e=>change({checkInLocation:e.target.value})} placeholder="例如：一樓大堂接待處"/><span className="text-xs text-slate-500">留空時顯示「於活動地點簽到」。</span></label>
 {times}
 <label>分組方式<select className={control} value={c.grouping} onChange={e=>change({grouping:e.target.value as typeof c.grouping})}><option value="NONE">不分組</option><option value="GROUP">按組分配</option></select></label>{c.grouping==='GROUP'&&<><label>組別稱呼<select className={control} value={c.groupLabel} onChange={e=>change({groupLabel:e.target.value as typeof c.groupLabel})}><option value="組">組</option><option value="桌">枱</option></select></label><label>每{groupLabel(c.groupLabel)}人數<input type="number" min={1} max={100} step={1} className={control} value={c.capacity} onChange={e=>change({capacity:Number(e.target.value)})}/></label><label className="flex gap-2 items-center"><input type="checkbox" checked={c.seats} onChange={e=>change({seats:e.target.checked})}/>分配座位號</label></>}
 </div></GoSurface>
 <GoSurface className="p-5 space-y-4"><h3>電子邀請函配置</h3><p className="text-sm text-slate-500">活動名稱讀取關聯活動，日期及位置讀取所選場次；姓名、部門、枱號及座位讀取該場次名單，二維碼綁定人員與場次。</p>
 <label className="block">邀請函背景圖<input type="file" accept="image/png,image/jpeg,image/webp" className={control} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2*1024*1024){setError('請上傳 2 MB 以內的 JPG、PNG 或 WebP 圖片。');return;}const reader=new FileReader();reader.onload=()=>{change({invitationBackground:String(reader.result)});setError('');};reader.onerror=()=>setError('讀取圖片失敗，請重試。');reader.readAsDataURL(file);}}/></label>
 <p className="text-xs text-slate-500">獨立於活動 Banner，圖片作背景裝飾；文字及二維碼保留清晰底色。</p>
 {c.invitationBackground&&<div className="flex gap-4 items-center"><img src={c.invitationBackground} alt="邀請函背景圖" className="w-24 h-32 rounded-lg object-cover"/><GoButton variant="secondary" onClick={()=>change({invitationBackground:''})}>移除背景圖</GoButton></div>}
 <label className="block">邀請文案<textarea className={control} value={invitationTemplate(c.invitationMessage)} onChange={e=>change({invitationMessage:e.target.value})}/></label>
 <GoButton variant="secondary" onClick={()=>setPreview('CARD')}>預覽電子邀請函</GoButton></GoSurface>
 <GoSurface className="p-5 space-y-4"><h3>電郵配置</h3><label className="block">電郵主旨 <span className="text-rose-600">*</span><input className={control} value={c.emailSubject??invitationEmailSubject} onChange={e=>change({emailSubject:e.target.value},false)}/><span className="text-xs text-slate-500">使用「{'{活動名稱}'}」可自動帶入關聯活動名稱。</span></label>
 <label className="block">電郵正文 <span className="text-rose-600">*</span><textarea className={control} value={invitationTemplate(c.emailBody,true)} onChange={e=>change({emailBody:e.target.value},false)}/></label>
 <label className="block">電郵發送日期與時間（選填）<input type="datetime-local" className={control} value={(c.emailSendAt||'').replace(' ','T')} onChange={e=>change({emailSendAt:e.target.value.replace('T',' ')},false)}/></label>
 <p className="text-xs text-slate-500">留空可手動發送；設定時間後，需到達該時間才可模擬發送。本演示不會自動或實際寄信。</p>
 <GoButton variant="secondary" onClick={()=>setPreview('EMAIL')}>測試預覽電郵</GoButton></GoSurface>
 {error&&<GoNotice>{error}</GoNotice>}
 {preview&&<div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label="邀請函及電郵預覽"><GoSurface className="max-w-xl w-full max-h-[90vh] overflow-auto p-5 space-y-4"><div className="flex justify-between items-center"><h3>{preview==='CARD'?'電子邀請函預覽':'電郵預覽'}</h3><GoButton variant="quiet" onClick={()=>setPreview(null)}>關閉</GoButton></div><label className="block">預覽人員<select className={control} value={person?.id||''} onChange={e=>setPersonId(e.target.value)}>{!c.people.length&&<option value="">尚未導入參加名單</option>}{c.people.map(p=><option key={p.id} value={p.id}>{p.name} · {p.department}</option>)}</select></label><CheckInInvitation activity={a} person={person} showEmail={preview==='EMAIL'}/></GoSurface></div>}
 </div>;
}

export function CheckInSettings({activity,onChange}:{key?:string;activity:Activity;onChange:(a:Activity)=>void}) {
 const c=sessionConfig(activity),a={...activity,checkIn:c};
 const changeTime=(id:string,field:'opensAt'|'closesAt',value:string)=>onChange({...a,checkIn:{...c,sessions:c.sessions!.map(s=>s.id===id?{...s,[field]:value}:s),people:c.people.map(p=>p.sessionId===id?{...p,invitationReady:false,needsResend:p.mailStatus==='SENT'||p.needsResend}:p)}});
 const times=<div className="md:col-span-2 space-y-3"><h3>各場次簽到時間</h3>{c.sessions!.map(s=><GoSurface key={s.id} className="p-4 space-y-3"><div className="flex justify-end"><button type="button" aria-label={`刪除${s.name}`} title={c.sessions!.length<=1?'至少保留一個場次':c.people.some(p=>p.sessionId===s.id)?'此場次已有參與人員，請先調整至其他場次':'刪除場次'} disabled={c.sessions!.length<=1||c.people.some(p=>p.sessionId===s.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed" onClick={()=>onChange({...a,checkIn:{...c,sessions:c.sessions!.filter(item=>item.id!==s.id)}})}><Trash2 size={16}/></button></div><label className="block">場次名稱 *<input aria-label={`${s.name}場次名稱`} className={control} value={s.name} onChange={e=>onChange({...a,checkIn:{...c,sessions:c.sessions!.map(item=>item.id===s.id?{...item,name:e.target.value}:item),people:c.people.map(p=>p.sessionId===s.id?{...p,invitationReady:false,needsResend:p.mailStatus==='SENT'||p.needsResend}:p)}})}/></label><div className="grid md:grid-cols-2 gap-4"><label>簽到開放時間 *<input aria-label={`${s.name}簽到開放時間`} type="datetime-local" step="1" className={control} value={s.opensAt.replace(' ','T')} onChange={e=>changeTime(s.id,'opensAt',e.target.value.replace('T',' '))}/></label><label>簽到截止時間 *<input aria-label={`${s.name}簽到截止時間`} type="datetime-local" step="1" className={control} value={(s.closesAt||a.endTime).replace(' ','T')} onChange={e=>changeTime(s.id,'closesAt',e.target.value.replace('T',' '))}/></label></div></GoSurface>)}<GoButton variant="secondary" onClick={()=>onChange({...a,checkIn:{...c,sessions:[...c.sessions!,{...c.sessions![0],id:crypto.randomUUID(),name:`場次 ${c.sessions!.length+1}`,opensAt:'',closesAt:'',groups:[]}]}})}>新增場次</GoButton><p className="text-sm text-slate-500">各場次可設定名稱及簽到時間，其餘設定共用；參與名單及簽到記錄仍按場次管理。</p></div>;
 return <SessionSettings activity={sessionActivity(a,c.sessions![0].id)} times={times} onChange={next=>{
 const {people,sessions,activeSessionId,opensAt,closesAt,groups,...shared}=next.checkIn!;
 onChange({...a,checkIn:{...c,...shared,sessions:c.sessions!.map(s=>({...s,...shared,id:s.id,name:s.name})),people:c.people.map(p=>{const changed=people.find(x=>x.id===p.id);return changed?{...p,invitationReady:changed.invitationReady,needsResend:changed.needsResend}:{...p,invitationReady:false,needsResend:p.mailStatus==='SENT'||p.needsResend};})}});
 }}/>;
}
