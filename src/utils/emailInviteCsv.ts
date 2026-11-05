export function parseEmailInviteCsv(text:string){
 const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell.trim());cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw new Error('CSV 引號未閉合，請檢查檔案格式。');
 row.push(cell.trim());if(row.some(Boolean))rows.push(row);
 const headers=(rows[0]||[]).map(v=>v.replace(/^\uFEFF/,'').toLowerCase());
 const hasHeader=headers.includes('電郵')||headers.includes('email');
 const column=(names:string[],fallback:number)=>hasHeader?headers.findIndex(h=>names.includes(h)):fallback;
 const nameIndex=column(['姓名','name'],0),emailIndex=column(['電郵','email'],1),channelIndex=column(['渠道','組別','channel','group'],2);
 return (hasHeader?rows.slice(1):rows).map(r=>{const name=r[nameIndex]||'',email=r[emailIndex]||'',channelName=r[channelIndex]||'';return {name,email,channelName,valid:Boolean(name&&/^\S+@\S+\.\S+$/.test(email))};});
}
export function emailInviteCsv(people:{name:string;email:string;channelName?:string}[]){return '\uFEFF'+[['姓名','電郵','渠道'],...people.map(p=>[p.name,p.email,p.channelName||''])].map(row=>row.map(v=>'"'+v.replaceAll('"','""')+'"').join(',')).join('\r\n');}
