import test from 'node:test';
import assert from 'node:assert/strict';
Object.defineProperty(globalThis,'localStorage',{value:{getItem:()=>null,setItem:()=>{}},configurable:true});
Object.defineProperty(globalThis,'window',{value:{addEventListener:()=>{}},configurable:true});
const {demo,importIds,personStatus,coiRows,validLink}=await import('./coiModel');
test('imports flag existing IDs, duplicate file rows and unknown employees',()=>{
 const rows=importIds('\uFEFF員工編號\r\nEMP001\r\nEMP002\r\nEMP002\r\nUNKNOWN',['EMP001']);
 assert.deepEqual(rows.map(r=>r.result),['重複／已在名單','可匯入','重複／已在名單','找不到員工']);
});
test('external statuses remain authoritative regardless of date',()=>{
 const c={...demo,demo:false,deadline:'2020-01-01T18:00'};
 for(const status of ['UPDATED','REVIEW','EXEMPT'] as const)assert.equal(personStatus(c,{employeeId:'EMP001',status}),status);
});
test('demo has three statuses and per-person external due dates',()=>{
 const rows=coiRows(demo);assert.equal(new Set(rows.map(r=>r.status)).size,3);assert.equal(rows.filter(r=>r.status!=='EXEMPT').length,9);
 assert.ok(rows.find(r=>r.status==='UPDATED')?.nextDue?.startsWith('2027'));
 assert.equal(rows.find(r=>r.status==='EXEMPT')?.nextDue,undefined);
});
test('only web links allowed',()=>{assert.equal(validLink('https://example.com/coi'),true);assert.equal(validLink('javascript:alert(1)'),false);assert.equal(validLink(''),false)});
