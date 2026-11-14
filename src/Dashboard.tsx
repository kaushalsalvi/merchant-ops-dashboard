import {useState,KeyboardEvent} from 'react'
import {Merchant,Txn,inr} from './lib'
import {TODAY} from './data'
export default function Dashboard({merchants,txns}:{merchants:Merchant[];txns:Txn[]}){
  const [metric,setMetric]=useState<'volume'|'count'>('volume');const [idx,setIdx]=useState(29)
  const days=Array.from({length:30},(_,i)=>{const d=new Date(TODAY-(29-i)*864e5);return{label:d.toLocaleDateString('en-IN',{day:'numeric',month:'short'}),volume:0,count:0,key:d.toDateString()}})
  const ok=txns.filter(t=>t.status==='Success');ok.forEach(t=>{const d=days.find(x=>x.key===new Date(t.at).toDateString());if(d){d.volume+=t.amount;d.count++}})
  const cnt=(s:string)=>merchants.filter(m=>m.status===s).length,total=ok.reduce((a,t)=>a+t.amount,0)
  const cards=[['Total merchants',String(merchants.length)],['Pending KYC reviews',String(cnt('Pending')+cnt('Under Review'))],['Approved merchants',String(cnt('Approved'))],['Volume, last 30 days',inr(total)]]
  const W=640,H=220,P=28,max=Math.max(...days.map(d=>d[metric]),1)
  const x=(i:number)=>P+i*(W-2*P)/29,y=(v:number)=>H-P-v/max*(H-2*P)
  const path=days.map((d,i)=>`${i?'L':'M'}${x(i)},${y(d[metric])}`).join(' ')
  const key=(e:KeyboardEvent)=>{if(e.key==='ArrowLeft')setIdx(i=>Math.max(0,i-1));if(e.key==='ArrowRight')setIdx(i=>Math.min(29,i+1))}
  const d=days[idx]
  return <>
    <ul className="cards">{cards.map(([l,v])=><li key={l} className="card"><span className="muted">{l}</span><strong>{v}</strong></li>)}</ul>
    <section className="card chart" aria-labelledby="ch">
      <div className="row between"><h2 id="ch">Transaction trend</h2>
        <div className="seg" role="group" aria-label="Chart metric">{(['volume','count'] as const).map(m=><button key={m} aria-pressed={metric===m} onClick={()=>setMetric(m)}>{m==='volume'?'Volume (₹)':'Count'}</button>)}</div></div>
      <p className="muted" aria-live="polite">{d.label}: {metric==='volume'?inr(d.volume):`${d.count} successful transactions`}. Use ← → keys or hover to explore.</p>
      <svg viewBox={`0 0 ${W} ${H}`} tabIndex={0} role="img" aria-label="Daily successful transaction trend for the last 30 days" onKeyDown={key}
        onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();setIdx(Math.min(29,Math.max(0,Math.round(((e.clientX-r.left)/r.width*W-P)/((W-2*P)/29)))))}}>
        {[0,.5,1].map(f=><line key={f} x1={P} x2={W-P} y1={y(max*f)} y2={y(max*f)} className="grid"/>)}
        <path d={`${path} L${x(29)},${H-P} L${x(0)},${H-P}Z`} className="area"/><path d={path} className="line"/>
        <line x1={x(idx)} x2={x(idx)} y1={P/2} y2={H-P} className="cursor"/><circle cx={x(idx)} cy={y(d[metric])} r={5} className="dot"/>
        <text x={P} y={H-8} className="axis">{days[0].label}</text><text x={W-P} y={H-8} textAnchor="end" className="axis">{days[29].label}</text></svg>
    </section></>
}
