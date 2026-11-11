import React,{useState} from 'react';
import type {VoteArticle} from '../../types';
import {GoSurface,GoNotice,GoButton,formControlClass} from '../ui/GoUI';
import {newPolicy,PolicyFile} from './policyModel';
import {saveLocalMedia,resolveLocalMedia} from '../../utils/localMedia';
export async function downloadPolicyFile(file:PolicyFile){const url=await resolveLocalMedia(file.ref);const a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();if(url.startsWith('blob:'))setTimeout(()=>URL.revokeObjectURL(url),30000);}
export function PolicySettings({article,onChange,contentConfigured=false}:{article:VoteArticle;onChange:(a:VoteArticle)=>void;contentConfigured?:boolean}){
 const [error,setError]=useState(''),[uploading,setUploading]=useState(false);const p=article.policy||newPolicy();
 const change=(patch:Partial<typeof p>)=>onChange({...article,policy:{...p,...patch}});
 async function upload(file:File|undefined,pdf:boolean){if(!file)return;if(pdf&&!/\.pdf$/i.test(file.name)){setError('請上傳 PDF 文件。');return;}if(file.size>15*1024*1024){setError('檔案大小不可超過 15 MB。');return;}setUploading(true);setError('');try{const entry={name:file.name,ref:await saveLocalMedia(file)};change(pdf?{pdf:entry}:{attachments:[...p.attachments,entry]});}catch{setError('上傳失敗，請重試。')}finally{setUploading(false)}}
 return <GoSurface className="go-type p-5 space-y-4"><h3>政策閱讀確認</h3><label className="flex gap-2"><input type="checkbox" checked={!!article.policy?.enabled} onChange={e=>change({enabled:e.target.checked})}/>需要閱讀確認</label><p className="text-xs text-slate-500">開啟後，員工須閱讀文章內容並點擊確認按鈕，系統會記錄確認時間。</p>{article.policy?.enabled&&<>
 <label className="block space-y-2"><span>確認按鈕文案 <span className="text-red-500">*</span></span><input aria-label="確認按鈕文案" className={formControlClass} required maxLength={30} value={p.buttonText??'已閱讀並同意'} onChange={e=>change({buttonText:e.target.value})}/></label>
 {!contentConfigured&&<> <div className="grid sm:grid-cols-2 gap-4"><label>內容形式<select className={formControlClass} value={p.mode} onChange={e=>change({mode:e.target.value as 'TEXT'|'PDF'})}><option value="TEXT">文章正文</option><option value="PDF">PDF 文件</option></select></label><div><p>最新發布版本</p><p className="mt-2">{p.versions.length?`V${p.versions.at(-1)!.version}`:'尚未發布'}</p></div></div>
 {p.mode==='PDF'&&<label className="block">政策 PDF（必填）<input aria-label="上傳政策 PDF" type="file" accept="application/pdf,.pdf" disabled={uploading} className={formControlClass} onChange={e=>{void upload(e.target.files?.[0],true);e.target.value=''}}/>{p.pdf&&<span>{p.pdf.name}</span>}<p className="text-xs text-slate-500">可在線閱讀及下載，毋須重複輸入正文。每個檔案最多 15 MB。</p></label>}
</>}
 <label className="flex gap-2"><input type="checkbox" checked={p.signature} onChange={e=>change({signature:e.target.checked})}/>需要手機手寫簽名</label><p className="text-xs text-slate-500">開啟後，員工點擊確認按鈕時須完成手寫簽名並提交，才算完成確認。</p>
 {!!p.versions.length&&<label className="flex gap-2"><input type="checkbox" checked={p.reconfirm} onChange={e=>change({reconfirm:e.target.checked})}/>發布新版本時要求重新確認</label>}
 {!!p.versions.length&&p.reconfirm&&<p className="text-xs text-amber-700">發布需重新確認的新版本後，舊版本尚未執行的排程將停止。請於新版本「提醒與跟進」確認設定後重新啟用。</p>}
 <p className="text-xs text-slate-500">發布後修改政策內容將建立新版本，保留舊版本及確認記錄。通知模板及排程可在文章列表的「提醒與跟進」設定。</p>
 <label className="block">可下載附件（選填）<input aria-label="上傳政策附件" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg" disabled={uploading} className={formControlClass} onChange={e=>{void upload(e.target.files?.[0],false);e.target.value=''}}/></label>
 {p.attachments.map((f,i)=><div className="flex justify-between gap-3" key={f.ref}><span>{f.name}</span><GoButton variant="secondary" onClick={()=>change({attachments:p.attachments.filter((_,n)=>n!==i)})}>移除</GoButton></div>)}
 {uploading&&<p>正在上傳，請稍候…</p>}
 </>}{error&&<GoNotice>{error}</GoNotice>}</GoSurface>
}
