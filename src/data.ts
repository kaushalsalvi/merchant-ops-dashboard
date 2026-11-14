import type {Merchant,Status,Txn,TxnStatus} from './lib'
let seed=42;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647
const pick=<T,>(a:T[])=>a[Math.floor(rnd()*a.length)]
const NOW=new Date('2026-11-14T10:00:00Z').getTime(),DAY=864e5
const names=['Kaveri Textiles','Lotus Organics','Bluefin Seafoods','Marigold Stays','Tantra Tech Labs','Saffron & Co','Nilgiri Tea House','Zenith Auto Parts','Pixel Paan','Ganga Handlooms','Orchid Pharmacy','Deccan Cycles','Monsoon Books','Indus Fitness','Vayu Logistics','Rangoli Crafts','Silverline Jewels','Aarav Electronics','Banyan Wellness','Chai Stop Express','Dhruv Stationers','Ember Kitchens','Fable Toys','Himalaya Trek Co']
const cats=['Retail','Food & Beverage','Travel','Healthcare','Electronics','Services'],cities=['Mumbai','Pune','Thane','Bengaluru','Chennai','Delhi','Jaipur','Kochi']
const order:Status[]=['Pending','Under Review','Approved','Approved','Approved','Rejected']
const docNames=['PAN card','GST certificate','Bank account proof','Address proof','Director ID']
const doneCount:Record<Status,number>={Pending:1,'Under Review':3,Approved:5,Rejected:2}
const iso=(t:number)=>new Date(t).toISOString()
export const merchants:Merchant[]=names.map((name,i)=>{
  const status=order[i%6],created=NOW-(10+i*9)*DAY,slug=name.toLowerCase().replace(/[^a-z]+/g,'')
  const timeline=[{label:'Application submitted',at:iso(created)},{label:'Documents uploaded',at:iso(created+DAY)}]
  if(status!=='Pending')timeline.push({label:'Review started',at:iso(created+3*DAY)})
  if(status==='Approved'||status==='Rejected')timeline.push({label:status==='Approved'?'Approved by admin':'Rejected by admin',at:iso(created+6*DAY)})
  return{id:`M${1001+i}`,name,category:pick(cats),city:pick(cities),status,createdAt:iso(created),volume:0,
    contact:{name:pick(['Asha Rao','Rohan Mehta','Priya Nair','Imran Sheikh','Neha Kulkarni','Vikram Singh']),email:`accounts@${slug}.example`,phone:`+91 98${String(10000000+Math.floor(rnd()*89999999))}`},
    docs:docNames.map((n,k)=>({name:n,done:k<doneCount[status]})),timeline}})
const approved=merchants.filter(m=>m.status==='Approved')
const tStatus:TxnStatus[]=['Success','Success','Success','Success','Success','Failed','Pending','Refunded']
export const txns:Txn[]=Array.from({length:120},(_,i)=>{
  const m=pick(approved),amount=Math.round((200+rnd()*rnd()*90000)/10)*10,status=pick(tStatus)
  return{id:`t${i}`,ref:`TXN${String(48200000+Math.floor(rnd()*999999))}`,merchantId:m.id,merchant:m.name,amount,status,method:pick(['UPI','Card','Net banking','Wallet']),at:iso(NOW-rnd()*30*DAY)}
}).sort((a,b)=>b.at.localeCompare(a.at))
txns.forEach(t=>{if(t.status==='Success')merchants.find(m=>m.id===t.merchantId)!.volume+=t.amount})
export const TODAY=NOW
