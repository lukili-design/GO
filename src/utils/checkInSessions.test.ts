import test from 'node:test';
import assert from 'node:assert/strict';
import {completeBanquetDemo,parsePeopleCSV} from './checkIn';
import {sessionConfig,sessionActivity,mergeSession,transferSession,checkInCode} from './checkInSessions';
test('legacy list stays in first of two sessions; edits preserve other session',()=>{
 const a=completeBanquetDemo(),c=sessionConfig(a);assert.equal(c.sessions?.length,2);assert.equal(c.people.length,28);
 assert.equal(sessionActivity(a,'session-2').checkIn?.people.length,0);
 const scoped=sessionActivity(a,'session-2');scoped.checkIn!.location='第二場地';
 const saved=mergeSession(a,scoped,'session-2');assert.equal(saved.checkIn?.people.length,28);assert.equal(sessionActivity(saved,'session-1').checkIn?.location,a.checkIn?.location);
});
test('transfer clears seat and rotates code; checked in people cannot move',()=>{
 const a=completeBanquetDemo(),p=a.checkIn!.people[20];const moved=transferSession(a,p.id,'session-2');const q=moved.checkIn!.people.find(x=>x.id===p.id)!;
 assert.equal(q.sessionId,'session-2');assert.equal(q.seat,'');assert.equal(q.group,'');assert.notEqual(checkInCode(a,p),checkInCode(moved,q));assert.equal(q.needsResend,true);
 assert.throws(()=>transferSession(a,a.checkIn!.people[0].id,'session-2'));
});
test('cross-session import refuses same employee',()=>{
 const c=sessionConfig(completeBanquetDemo());const r=parsePeopleCSV('員工編號,姓名,部門,電郵\nDEMO1,測試,行政部,new@example.com',c.people);assert.equal(r.people.length,0);assert.equal(r.errors.length,1);
});
