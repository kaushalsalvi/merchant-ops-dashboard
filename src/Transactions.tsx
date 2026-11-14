import {useMemo,useState} from 'react'
import {Txn,fmtDate,inr,toCSV,useLocalStorage} from './lib'
import {Badge,Pager,Panel,SortTh,State} from './ui'
const SIZE=10
export default function Transactions({txns,loading,error,reload}:{txns:Txn[];loading:boolean;error?:string;reload:()=>void}){
  const [f,setF]=useLocalStorage('mo.tfilter',{q:'',status:'All',from:'',to:'',sort:'at',dir:'desc' as 'asc'|'desc',page:1})
  const [sel,setSel]=useState<string|null>(null)
  const rows=useMemo(()=>{const q=f.q.toLowerCase();const k=f.sort as 'at'|'amount'
    return txns.filter(t=>(f.status==='All'||t.status===f.status)&&(t.ref+t.merchant).toLowerCase().includes(q)&&(!f.from||t.at.slice(0,10)>=f.from)&&(!f.to||t.at.slice(0,10)<=f.to))
      .sort((a,b)=>(a[k]>b[k]?1:-1)*(f.dir==='asc'?1:-1))},[txns,f])
  const pages=Math.max(1,Math.ceil(rows.length/SIZE)),page=Math.min(f.page,pages),t=txns.find(x=>x.id===sel)
  const set=(p:Partial<typeof f>)=>setF({...f,page:1,...p})
  const sort=(k:string)=>setF({...f,sort:k,dir:f.sort===k&&f.dir==='desc'?'asc':'desc'})
  const download=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([toCSV(rows)],{type:'text/csv'}));a.download='transactions.csv';a.click()}
  return <>
    <div className="row filters wrap">
      <div><label htmlFor="tq">Search</label><input id="tq" type="search" placeholder="Reference or merchant" value={f.q} onChange={e=>set({q:e.target.value})}/></div>
      <div><label htmlFor="ts">Status</label><select id="ts" value={f.status} onChange={e=>set({status:e.target.value})}>{['All','Success','Pending','Failed','Refunded'].map(s=><option key={s}>{s}</option>)}</select></div>
      <div><label htmlFor="tf">From</label><input id="tf" type="date" value={f.from} max={f.to||undefined} onChange={e=>set({from:e.target.value})}/></div>
      <div><label htmlFor="tt">To</label><input id="tt" type="date" value={f.to} min={f.from||undefined} onChange={e=>set({to:e.target.value})}/></div>
      <button className="btn" onClick={download} disabled={!rows.length}>Download CSV</button></div>
    <State loading={loading} error={error} empty={!rows.length} onRetry={reload}>
      <div className="card tablewrap"><table><caption className="sr">Transactions</caption><thead><tr><th scope="col">Reference</th><th scope="col">Merchant</th>
        <SortTh k="at" cur={f.sort} dir={f.dir} onSort={sort}>Time</SortTh><SortTh k="amount" cur={f.sort} dir={f.dir} onSort={sort}>Amount</SortTh><th scope="col">Status</th></tr></thead>
        <tbody>{rows.slice((page-1)*SIZE,page*SIZE).map(r=><tr key={r.id} className={sel===r.id?'sel':''}>
          <td><button className="link" onClick={()=>setSel(r.id)}>{r.ref}</button></td><td>{r.merchant}</td><td>{fmtDate(r.at)}</td><td className="num">{inr(r.amount)}</td><td><Badge s={r.status}/></td></tr>)}</tbody></table></div>
      <Pager page={page} pages={pages} onPage={p=>setF({...f,page:p})}/></State>
    {t&&<Panel title={t.ref} onClose={()=>setSel(null)}><p><Badge s={t.status}/></p>
      <dl><dt>Amount</dt><dd>{inr(t.amount)}</dd><dt>Merchant</dt><dd>{t.merchant} ({t.merchantId})</dd><dt>Method</dt><dd>{t.method}</dd><dt>Time</dt><dd>{fmtDate(t.at)}</dd></dl></Panel>}
  </>
}
