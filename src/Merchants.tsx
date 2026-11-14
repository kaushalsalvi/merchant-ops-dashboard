import {useMemo,useState} from 'react'
import {Action,ACTION_LABEL,Merchant,Role,fmtDate,inr,nextStatus,useLocalStorage} from './lib'
import {Badge,Confirm,Pager,Panel,SortTh,State} from './ui'
const STATUSES=['All','Pending','Under Review','Approved','Rejected'],SIZE=8
const COPY:Record<Action,{title:string;body:string;note?:string;danger?:boolean}>={
  approve:{title:'Approve merchant?',body:'The merchant will be activated and can start accepting payments.'},
  reject:{title:'Reject merchant?',body:'This is final. The merchant will be notified.',note:'Reason for rejection',danger:true},
  request:{title:'Request more information?',body:'The merchant will be asked to supply the details below.',note:'What information is needed?'}}
export default function Merchants({merchants,role,onAct,loading,error,reload}:{merchants:Merchant[];role:Role;onAct:(id:string,a:Action,note:string)=>void;loading:boolean;error?:string;reload:()=>void}){
  const [f,setF]=useLocalStorage('mo.mfilter',{q:'',status:'All',sort:'createdAt',dir:'desc' as 'asc'|'desc',page:1})
  const [sel,setSel]=useState<string|null>(null);const [pending,setPending]=useState<Action|null>(null)
  const rows=useMemo(()=>{
    const q=f.q.toLowerCase(),k=f.sort as 'name'|'status'|'volume'|'createdAt'
    return merchants.filter(m=>(f.status==='All'||m.status===f.status)&&(m.name+m.id+m.city).toLowerCase().includes(q))
      .sort((a,b)=>(a[k]>b[k]?1:a[k]<b[k]?-1:0)*(f.dir==='asc'?1:-1))},[merchants,f])
  const pages=Math.max(1,Math.ceil(rows.length/SIZE)),page=Math.min(f.page,pages),m=merchants.find(x=>x.id===sel)
  const set=(p:Partial<typeof f>)=>setF({...f,page:1,...p})
  const sort=(k:string)=>setF({...f,sort:k,dir:f.sort===k&&f.dir==='asc'?'desc':'asc'})
  return <>
    <div className="row filters"><div><label htmlFor="mq">Search merchants</label><input id="mq" type="search" placeholder="Name, ID or city" value={f.q} onChange={e=>set({q:e.target.value})}/></div>
      <div><label htmlFor="ms">Status</label><select id="ms" value={f.status} onChange={e=>set({status:e.target.value})}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div></div>
    <State loading={loading} error={error} empty={!rows.length} onRetry={reload}>
      <div className="card tablewrap"><table><caption className="sr">Merchants</caption><thead><tr>
        <SortTh k="name" cur={f.sort} dir={f.dir} onSort={sort}>Merchant</SortTh><th scope="col">City</th><SortTh k="status" cur={f.sort} dir={f.dir} onSort={sort}>Status</SortTh>
        <SortTh k="volume" cur={f.sort} dir={f.dir} onSort={sort}>Volume</SortTh><SortTh k="createdAt" cur={f.sort} dir={f.dir} onSort={sort}>Applied</SortTh></tr></thead>
        <tbody>{rows.slice((page-1)*SIZE,page*SIZE).map(r=><tr key={r.id} className={sel===r.id?'sel':''}>
          <td><button className="link" onClick={()=>setSel(r.id)}>{r.name}</button><div className="muted small">{r.id} · {r.category}</div></td><td>{r.city}</td><td><Badge s={r.status}/></td>
          <td className="num">{inr(r.volume)}</td><td>{fmtDate(r.createdAt).split(',')[0]}</td></tr>)}</tbody></table></div>
      <Pager page={page} pages={pages} onPage={p=>setF({...f,page:p})}/></State>
    {m&&<Panel title={m.name} onClose={()=>setSel(null)}>
      <p><Badge s={m.status}/> <span className="muted">{m.id} · {m.category} · {m.city}</span></p>
      <h3>Contact</h3><dl><dt>Name</dt><dd>{m.contact.name}</dd><dt>Email</dt><dd>{m.contact.email}</dd><dt>Phone</dt><dd>{m.contact.phone}</dd></dl>
      <h3>Document checklist</h3><ul className="checks">{m.docs.map(d=><li key={d.name}><span aria-hidden>{d.done?'✔':'○'}</span> {d.name}<span className="sr">{d.done?' – received':' – missing'}</span></li>)}</ul>
      <h3>Onboarding timeline</h3><ol className="timeline">{m.timeline.map((t,i)=><li key={i}><strong>{t.label}</strong><span className="muted small">{fmtDate(t.at)}</span></li>)}</ol>
      <h3>Review actions</h3>
      {role==='Admin'?<div className="row wrap">{(Object.keys(COPY) as Action[]).map(a=>{const ok=!!nextStatus(m.status,a)
        return <button key={a} className={`btn ${a==='approve'?'primary':a==='reject'?'danger':''}`} disabled={!ok} title={ok?undefined:`Not allowed while ${m.status}`} onClick={()=>setPending(a)}>{ACTION_LABEL[a]}</button>})}</div>
        :<p className="note">Read-only view. Only admins can change review status.</p>}
    </Panel>}
    {m&&pending&&<Confirm title={COPY[pending].title} body={`${m.name}: ${COPY[pending].body}`} label={ACTION_LABEL[pending]} danger={COPY[pending].danger} noteLabel={COPY[pending].note}
      onCancel={()=>setPending(null)} onConfirm={n=>{onAct(m.id,pending,n);setPending(null)}}/>}
  </>
}
