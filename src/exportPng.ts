import { formatDate, itemName, message, signed, styles, totals, verdict, type Receipt } from './engine.ts';
const FONT='"Noto Sans Mono CJK SC", "Microsoft YaHei", "PingFang SC", monospace';
const WIDTH=420, PAD=32, ROW=24, GAP=8, MAX_CANVAS=16000;
export type Measure=(text:string,size:number)=>number;
export function wrapText(text:string,maxWidth:number,size:number,measure:Measure){
  const lines:string[]=[];let line='';
  for(const char of Array.from(text)){if(char==='\n'){lines.push(line);line='';continue;}if(measure(line+char,size)>maxWidth&&line){lines.push(line);line=char;}else line+=char;}
  if(line)lines.push(line);return lines.length?lines:[''];
}
// Pure layout: height must always cover the drawing walk (contentBottom), with room for the zigzag edge.
export function layoutReceipt(receipt:Receipt,measure:Measure){
  const rows=receipt.items.map(i=>({i,lines:wrapText(itemName(i,receipt.style),224,15,measure)}));
  const quote=wrapText(message(receipt),WIDTH-PAD*2,14,measure);
  const extra=rows.reduce((a,r)=>a+r.lines.length*ROW+GAP,0)+quote.length*ROW;
  return {rows,quote,height:600+extra,contentBottom:573+extra,scale:Math.min(2,MAX_CANVAS/(600+extra))};
}
export async function exportPng(receipt: Receipt): Promise<void> {
  await document.fonts.ready;
  await document.fonts.load(`16px ${FONT}`, '今日生活超市');
  const measure2d=document.createElement('canvas').getContext('2d');
  if (!measure2d) throw new Error('Canvas unavailable');
  const measure:Measure=(text,size)=>{measure2d.font=`${size}px ${FONT}`;return measure2d.measureText(text).width;};
  const {rows,quote,height,scale}=layoutReceipt(receipt,measure);
  const width=WIDTH, pad=PAD, right=width-pad;
  const canvas=document.createElement('canvas'); canvas.width=Math.ceil(width*scale);canvas.height=Math.ceil(height*scale);
  const ctx=canvas.getContext('2d'); if(!ctx) throw new Error('Canvas unavailable');ctx.scale(scale,scale);
  ctx.fillStyle='#fbf8ef';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(width,0);ctx.lineTo(width,height-8);for(let x=width;x>=0;x-=10)ctx.lineTo(x,height-(Math.round(x/10)%2?0:8));ctx.closePath();ctx.fill();
  // Deterministic thermal-paper grain, no network assets or screenshot dependency.
  ctx.fillStyle='rgba(92,74,42,.035)';for(let k=0;k<width*height/55;k++){const x=(k*97)%width,y=(k*193.17)%height;ctx.fillRect(x,y,1,1);}
  function text(s:string,x:number,y:number,size=14,bold=false,align:CanvasTextAlign='left'){ctx!.font=`${bold?'700':'400'} ${size}px ${FONT}`;ctx!.fillStyle='#302e28';ctx!.textAlign=align;ctx!.fillText(s,x,y);}
  function dash(y:number){ctx!.strokeStyle='#999488';ctx!.lineWidth=1;ctx!.setLineDash([5,4]);ctx!.beginPath();ctx!.moveTo(pad,y);ctx!.lineTo(right,y);ctx!.stroke();ctx!.setLineDash([]);}
  text('今日生活超市',width/2,49,27,true,'center');text('LIFE IS A LITTLE ABSURD',width/2,71,11,false,'center');text('什么都卖，就是不卖后悔药。',width/2,99,13,false,'center');dash(119);
  text('今日消费明细',pad,145,16,true);text(receipt.example?'示例小票':styles.find(s=>s.id===receipt.style)!.name,right,145,11,false,'right');text('商品',pad,172);text('数量',302,172,12,false,'right');text('电量',right,172,12,false,'right');dash(184);
  let y=209;for(const {i,lines} of rows){lines.forEach((line,n)=>text(line,pad,y+n*24,15));text(`×${i.quantity}`,302,y,14,false,'right');text(signed(i.unit*i.quantity),right,y,14,false,'right');y+=lines.length*24+8;}dash(y);y+=26;
  const total=totals(receipt.items);for(const [label,value] of [['初始电量','100'],['今日收入',signed(total.income)],['今日支出',String(total.expense)]]){text(label,pad,y);text(value,right,y,15,false,'right');y+=25;}
  text('当前电量余额',pad,y+10,16,true);text(String(total.balance),right,y+51,43,true,'right');
  ctx.save();ctx.translate(pad+130,y+35);ctx.rotate(-.16);ctx.strokeStyle='#c05b37';ctx.fillStyle='#c05b37';ctx.lineWidth=2;ctx.strokeRect(-4,-20,105,29);ctx.font=`bold 15px ${FONT}`;ctx.textAlign='left';ctx.fillText(verdict(total.balance),1,0);ctx.restore();y+=77;dash(y);y+=26;
  text('收银员说：',pad,y);y+=25;quote.forEach(line=>{text(line,pad,y);y+=24;});dash(y-7);y+=19;
  text(formatDate(receipt.date),pad,y,11);text('虚构流水号',right,y,10,false,'right');y+=21;text(receipt.id,width/2,y,11,false,'center');y+=15;
  ctx.fillStyle='#38362f';for(let x=pad;x<right;x+=5){const n=receipt.id.charCodeAt(Math.floor(x/5)%receipt.id.length);ctx.fillRect(x,y,1+n%3,36);}y+=57;
  text('娱乐数值，不是身心状态评估',width/2,y,11,false,'center');text('本地趣味生成 · 小票请收好',width/2,y+23,10,false,'center');
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG encoding failed')),'image/png'));
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`人生离谱小票-${receipt.id}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
