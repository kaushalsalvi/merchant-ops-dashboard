import {useCallback,useRef,useState} from 'react'
import {Action,ACTION_LABEL,Role,fakeFetch,nextStatus,useAsync,useLocalStorage} from './lib'
import {merchants,txns} from './data'
import Dashboard from './Dashboard'
import Merchants from './Merchants'
import Transactions from './Transactions'
import {State} from './ui'
const TABS=['Dashboard','Merchants','Transactions'] as const
export default function App(){
  const [tab,setTab]=useLocalStorage<typeof TABS[number]>('mo.tab','Dashboard');const [role,setRole]=useLocalStorage<Role>('mo.role','Admin')
  const [toast,setToast]=useState('');const [fail,setFail]=useState(false);const failRef=useRef(false)
  const load=useCallback(()=>fakeFetch({merchants:structuredClone(merchants),txns},()=>failRef.current),[])
  const {data,loading,error,reload,update}=useAsync(load)
  const act=(id:string,a:Action,note:string)=>{
    if(role!=='Admin')return
    update(d=>({...d,merchants:d.merchants.map(m=>{const to=nextStatus(m.status,a);if(m.id!==id||!to)return m
      return{...m,status:to,docs:a==='approve'?m.docs.map(x=>({...x,done:true})):m.docs,timeline:[...m.timeline,{label:`${ACTION_LABEL[a]}${note?` – ${note}`:''}`,at:new Date().toISOString()}]}})}))
    setToast(`${ACTION_LABEL[a]} recorded.`);setTimeout(()=>setToast(''),3500)}
  return <div className="app">
    <a className="skip" href="#main">Skip to content</a>
    <header className="top"><h1>Paisa Desk</h1>
      <nav aria-label="Primary">{TABS.map(t=><button key={t} className="tab" aria-current={tab===t?'page':undefined} onClick={()=>setTab(t)}>{t}</button>)}</nav>
      <div className="row"><label className="inline"><input type="checkbox" checked={fail} onChange={e=>{failRef.current=e.target.checked;setFail(e.target.checked);if(e.target.checked)reload()}}/>Simulate API error</label>
        <label className="inline" htmlFor="role">Role</label><select id="role" value={role} onChange={e=>setRole(e.target.value as Role)}><option>Admin</option><option>Merchant</option></select></div></header>
    <main id="main"><h2 className="page">{tab}</h2>
      {tab==='Dashboard'?<State loading={loading} error={error} onRetry={reload}>{data&&<Dashboard merchants={data.merchants} txns={data.txns}/>}</State>
       :tab==='Merchants'?<Merchants merchants={data?.merchants??[]} role={role} onAct={act} loading={loading} error={error} reload={reload}/>
       :<Transactions txns={data?.txns??[]} loading={loading} error={error} reload={reload}/>}</main>
    <div className="toast" role="status" aria-live="polite">{toast}</div></div>
}
