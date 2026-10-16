/** Keep stored seat identities stable; display numeric legacy seats as letters. */
export function seatLabel(value:string){
 if(!/^[1-9]\d*$/.test(value))return value;
 let n=Number(value),label='';
 if(!Number.isSafeInteger(n))return value;
 while(n>0){n--;label=String.fromCharCode(65+n%26)+label;n=Math.floor(n/26);}
 return label;
}
export const groupLabel=(value:string|undefined)=>value==='桌'?'枱':value||'組';
