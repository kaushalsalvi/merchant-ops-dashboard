import {ReactNode,useEffect,useRef,useState} from 'react'
export const Badge=({s}:{s:string})=><span className={`badge b-${s.toLowerCase().replace(/\s/g,'-')}`}>{s}</span>
export function State({loading,error,empty,onRetry,children}:{loading:boolean;error?:string;empty?:boolean;onRetry:()=>void;children:ReactNode}){
  if(loading)return <div className="skeletons" role="status" aria-label="Loading">{[0,1,2,3].map(i=><div key={i} className="sk"/>)}</div>
  if(error)return <div className="state" role="alert"><h3>Something went wrong</h3><p>{error}</p><button className="btn primary" onClick={onRetry}>Retry</button></div>
  if(empty)return <div className="state"><h3>No results</h3><p>Try clearing the search or changing filters.</p></div>
  return <>{children}</>
}
export function Panel({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
  const h=useRef<HTMLHeadingElement>(null)
  useEffect(()=>{h.current?.focus();const k=(e:KeyboardEvent)=>e.key==='Escape'&&onClose();addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[onClose])
  return <aside className="panel" aria-label={title}><div className="panel-head"><h2 ref={h} tabIndex={-1}>{title}</h2><button className="btn" onClick={onClose} aria-label="Close panel">Close</button></div>{children}</aside>
}
/** Native <dialog>: focus trap, Esc and backdrop handled by the browser. */
export function Confirm({title,body,label,danger,noteLabel,onConfirm,onCancel}:{title:string;body:string;label:string;danger?:boolean;noteLabel?:string;onConfirm:(note:string)=>void;onCancel:()=>void}){
  const r=useRef<HTMLDialogElement>(null);const [note,setNote]=useState('');const [err,setErr]=useState('')
  useEffect(()=>{r.current?.showModal()},[])
  const submit=(e:React.FormEvent)=>{e.preventDefault()
    if(noteLabel&&note.trim().length<10)return setErr('Enter at least 10 characters.')
    onConfirm(note.trim())}
  return <dialog ref={r} onClose={onCancel} aria-labelledby="dlg-t"><form onSubmit={submit} noValidate>
    <h2 id="dlg-t">{title}</h2><p>{body}</p>
    {noteLabel&&<><label htmlFor="note">{noteLabel}</label><textarea id="note" rows={3} value={note} aria-invalid={!!err} aria-describedby="note-e" onChange={e=>{setNote(e.target.value);setErr('')}}/><p id="note-e" className="err" role="alert">{err}</p></>}
    <div className="row end"><button type="button" className="btn" onClick={onCancel}>Cancel</button><button className={`btn ${danger?'danger':'primary'}`}>{label}</button></div></form></dialog>
}
export const Pager=({page,pages,onPage}:{page:number;pages:number;onPage:(p:number)=>void})=>
  <nav className="row between pager" aria-label="Pagination"><span>Page {page} of {pages}</span><span className="row"><button className="btn" disabled={page<=1} onClick={()=>onPage(page-1)}>Previous</button><button className="btn" disabled={page>=pages} onClick={()=>onPage(page+1)}>Next</button></span></nav>
export const SortTh=({k,cur,dir,onSort,children}:{k:string;cur:string;dir:'asc'|'desc';onSort:(k:string)=>void;children:ReactNode})=>
  <th scope="col" aria-sort={cur===k?(dir==='asc'?'ascending':'descending'):'none'}><button className="th" onClick={()=>onSort(k)}>{children}{cur===k?(dir==='asc'?' ▲':' ▼'):''}</button></th>
