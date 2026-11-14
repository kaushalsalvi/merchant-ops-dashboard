import {describe,expect,it} from 'vitest'
import {nextStatus,toCSV} from './lib'
describe('status transitions',()=>{
  it('allows review flow',()=>{expect(nextStatus('Pending','request')).toBe('Under Review');expect(nextStatus('Under Review','approve')).toBe('Approved')})
  it('blocks invalid moves',()=>{expect(nextStatus('Pending','approve')).toBeUndefined();expect(nextStatus('Approved','reject')).toBeUndefined();expect(nextStatus('Rejected','approve')).toBeUndefined()})
})
describe('csv',()=>{it('escapes quotes',()=>{expect(toCSV([{id:'1',ref:'R',merchantId:'m',merchant:'A "B"',at:'t',amount:5,status:'Success',method:'UPI'}])).toContain('"A ""B"""')})})
