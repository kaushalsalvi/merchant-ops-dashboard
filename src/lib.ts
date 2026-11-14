import {useCallback,useEffect,useState} from 'react'
export type Status='Pending'|'Under Review'|'Approved'|'Rejected'
export type Action='approve'|'reject'|'request'
export type Role='Admin'|'Merchant'
export type TxnStatus='Success'|'Failed'|'Pending'|'Refunded'
export interface Merchant{id:string;name:string;category:string;city:string;status:Status;createdAt:string;volume:number;
  contact:{name:string;email:string;phone:string};docs:{name:string;done:boolean}[];timeline:{label:string;at:string}[]}
export interface Txn{id:string;ref:string;merchantId:string;merchant:string;at:string;amount:number;status:TxnStatus;method:string}

/** Single source of truth for allowed status changes. Missing key = invalid transition. */
export const TRANSITIONS:Record<Status,Partial<Record<Action,Status>>>={
  Pending:{request:'Under Review',reject:'Rejected'},
  'Under Review':{approve:'Approved',reject:'Rejected',request:'Under Review'},
  Approved:{},Rejected:{}}
export const nextStatus=(s:Status,a:Action):Status|undefined=>TRANSITIONS[s][a]
export const ACTION_LABEL:Record<Action,string>={approve:'Approve',reject:'Reject',request:'Request information'}
export const inr=(n:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n)
export const fmtDate=(s:string)=>new Date(s).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})

export function useLocalStorage<T>(key:string,init:T):[T,(v:T|((p:T)=>T))=>void]{
  const [v,set]=useState<T>(()=>{try{const s=localStorage.getItem(key);return s?JSON.parse(s):init}catch{return init}})
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(v))}catch{/* ignore */}},[key,v])
  return [v,set]
}
export const fakeFetch=<T,>(d:T,shouldFail:()=>boolean,ms=700)=>new Promise<T>((res,rej)=>
  setTimeout(()=>shouldFail()?rej(new Error('Could not reach the mock API (simulated).')):res(d),ms))

export function useAsync<T>(fn:()=>Promise<T>){
  const [s,set]=useState<{data?:T;error?:string;loading:boolean}>({loading:true})
  const run=useCallback(()=>{set(p=>({...p,loading:true,error:undefined}));fn().then(data=>set({data,loading:false}),e=>set({loading:false,error:e.message}))},[fn])
  useEffect(run,[run])
  const update=(f:(d:T)=>T)=>set(p=>p.data?{...p,data:f(p.data)}:p)
  return {...s,reload:run,update}
}
export function toCSV(rows:Txn[]){
  const q=(x:string|number)=>`"${String(x).replace(/"/g,'""')}"`
  return [['Reference','Merchant','Timestamp','Amount (INR)','Status','Method'].join(','),
    ...rows.map(t=>[t.ref,t.merchant,t.at,t.amount,t.status,t.method].map(q).join(','))].join('\n')
}
