import test from 'node:test';
import assert from 'node:assert/strict';
Object.defineProperty(globalThis,'localStorage',{value:{getItem:()=>null,setItem:()=>{}},configurable:true});
Object.defineProperty(globalThis,'window',{value:{addEventListener:()=>{}},configurable:true});
const {demo,importIds,personStatus,coiRows,validLink}=await import('./coiModel');
test('imports flag existing IDs, duplicate file rows and unknown employees',()=>{
 const rows=importIds('\uFEFF員工編號\r\nEMP001\r\nEMP002\r\nEMP002\r\nUNKNOWN',['EMP001']);
 assert.deepEqual(rows.map(r=>r.result),['重複／已在名單','可匯入','重複／已在名單','找不到員工']);
});
test('overdue calculation preserves completion and exemption, demos remain fixed',()=>{
 const c={...demo,demo:false,deadline:'2020-01-01T18:00'};
 assert.equal(personStatus(c,{employeeId:'EMP001',status:'PENDING'}),'OVERDUE');
 for(const status of ['UPDATED','EXEMPT'] as const)assert.equal(personStatus(c,{employeeId:'EMP001',status}),status);
 assert.equal(personStatus({...c,demo:true},{employeeId:'EMP001',status:'PENDING'}),'PENDING');
});
test('demo includes all five statuses and nine required employees',()=>{
 const rows=coiRows(demo);assert.equal(new Set(rows.map(r=>r.status)).size,5);assert.equal(rows.filter(r=>r.status!=='EXEMPT').length,9);
});
test('only web links allowed',()=>{assert.equal(validLink('https://example.com/coi'),true);assert.equal(validLink('javascript:alert(1)'),false);assert.equal(validLink(''),false)});
