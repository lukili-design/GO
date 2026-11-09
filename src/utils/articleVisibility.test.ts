import {test} from 'node:test';
import assert from 'node:assert/strict';
import {articleIsVisible} from './articleVisibility';
import type {VoteArticle} from '../types';
const article={status:'PUBLISHED'} as VoteArticle;
const employee={employeeId:'EMP002',dept:'製作部'};
test('visibility respects department and employee scope',()=>{
 assert.equal(articleIsVisible(article,employee),true);
 assert.equal(articleIsVisible({...article,visibility:{mode:'DEPARTMENTS',ids:['行政部']}},employee),false);
 assert.equal(articleIsVisible({...article,visibility:{mode:'DEPARTMENTS',ids:['製作部']}},employee),true);
 assert.equal(articleIsVisible({...article,visibility:{mode:'EMPLOYEES',ids:[]}},employee),false);
 assert.equal(articleIsVisible({...article,visibility:{mode:'EMPLOYEES',ids:['EMP002']}},employee),true);
});
test('scheduled article is visible only within its Hong Kong time window',()=>{
 const scheduled={...article,autoSchedule:true,onlineAt:'2026-11-05T10:00',offlineAt:'2026-11-05T12:00'};
 assert.equal(articleIsVisible(scheduled,employee,Date.parse('2026-11-05T01:59:59Z')),false);
 assert.equal(articleIsVisible(scheduled,employee,Date.parse('2026-11-05T02:00:00Z')),true);
 assert.equal(articleIsVisible(scheduled,employee,Date.parse('2026-11-05T04:00:00Z')),false);
 assert.equal(articleIsVisible({...scheduled,offlineAt:''},employee),false);
});

test('staff categories support multiple selections and deny missing or unselected types',()=>{
 const scoped={...article,visibility:{mode:'STAFF_TYPES' as const,ids:['S','A']}};
 assert.equal(articleIsVisible(scoped,{...employee,staffType:'S'}),true);
 assert.equal(articleIsVisible(scoped,{...employee,staffType:'A'}),true);
 assert.equal(articleIsVisible(scoped,{...employee,staffType:'E'}),false);
 assert.equal(articleIsVisible(scoped,employee),false);
 assert.equal(articleIsVisible({...scoped,visibility:{mode:'STAFF_TYPES',ids:[]}},{...employee,staffType:'S'}),false);
});
