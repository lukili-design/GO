import {test} from 'node:test';
import assert from 'node:assert/strict';
import {planLottery,pickLottery} from './lottery';
const people=[{id:'a',group:'1'},{id:'b',group:'1'},{id:'c',group:'2'},{id:'d',group:''}];
test('per-table quota, unassigned exclusion and shortage',()=>{const plan=planLottery(people,[],'p',2,false,['1','2','3']);assert.deepEqual(plan.map(p=>p.take),[2,1,0]);assert.equal(plan.flatMap(p=>p.pool).some(p=>p.id==='d'),false);});
test('same prize never repeats; cross prize repeat is optional',()=>{const winners=[{id:'a',group:'1',prizeId:'p'},{id:'b',group:'1',prizeId:'old'}];assert.equal(planLottery(people,winners,'p',2,false,['1'])[0].take,0);const plan=planLottery(people,winners,'p',2,true,['1'])[0];assert.equal(plan.remaining,1);assert.deepEqual(plan.pool.map(p=>p.id),['b']);});
test('global mode and unique random winners preserve source pool',()=>{const plan=planLottery(people,[],'p',3,false);assert.equal(plan.length,1);const picked=pickLottery(plan[0].pool,3);assert.equal(picked.length,3);assert.equal(new Set(picked.map(p=>p.id)).size,3);assert.equal(people.length,4);});
test('completed prize cannot be redrawn and duplicate people are deduplicated',()=>{const winners=people.map(p=>({...p,prizeId:'p'}));assert.equal(planLottery(people,winners,'p',1,true,['1','2'])[0].remaining,0);assert.equal(planLottery([...people,people[0]],[],'p',10,false)[0].take,4);});
