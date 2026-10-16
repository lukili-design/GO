import {test} from 'node:test';
import assert from 'node:assert/strict';
import {movePeople,applySeating,seatingProblem,seatingGroups} from './checkInSeating';
import {defaultCheckIn} from './checkIn';
import type {CheckInPerson} from '../types';
const person=(id:string,group:string,seat:string):CheckInPerson=>({id,name:id,employeeId:id,department:'A',email:'a@example.com',group,seat,token:id,mailStatus:'SENT',invitationReady:true,checkedAt:'2026-09-01 18:00:00'});
test('full table is rejected; bulk move allocates only available seats',()=>{const p=[person('a','1','1'),person('b','2','1'),person('c','2','2')];assert.throws(()=>movePeople(p,['a'],'2',2,true));const moved=movePeople(p,['b','c'],'3',2,true);assert.deepEqual(moved.slice(1).map(p=>p.seat),['1','2']);assert.equal(seatingProblem(moved,2,true),'');assert.throws(()=>movePeople(p,['a'],'2',3,true,'1'));});
test('save preserves live checkin and tokens, invalidating only changed invitations',()=>{const p=[person('a','1','1'),person('b','1','2')];const draft=movePeople(p,['a'],'2',10,true);const result=applySeating(p,draft);assert.equal(result[0].checkedAt,p[0].checkedAt);assert.equal(result[0].token,'a');assert.equal(result[0].needsResend,true);assert.equal(result[0].invitationReady,false);assert.equal(result[1],p[1]);assert.equal(p[0].group,'1');});
test('empty tables survive and duplicate seats are rejected',()=>{const p=[person('a','1','1'),person('b','1','1')];assert.ok(seatingProblem(p,10,true));assert.deepEqual(seatingGroups({...defaultCheckIn(),groups:['1','2'],people:p}),['1','2']);});
