import { BatteryMedium } from 'lucide-react';
import { formatDate, itemName, message, signed, styles, totals, type Receipt } from './engine';
export default function ReceiptPaper({ receipt }: { receipt: Receipt }) {
  const total=totals(receipt.items);
  return <article className="receipt" aria-label="今日生活小票" data-testid="receipt">
    <div className="paper-brand"><h2>今日生活超市</h2><div className="receipt-en">LIFE IS A LITTLE ABSURD</div><p>什么都卖，就是不卖后悔药。</p></div>
    <div className="receipt-section"><div className="receipt-heading"><b>今日消费明细</b><span>{receipt.example?'示例小票':styles.find(s=>s.id===receipt.style)?.name}</span></div>
      <div className="receipt-grid column-label"><span>商品</span><span>数量</span><span>电量</span></div>
      <div className="receipt-items">{receipt.items.map(item=><div className="receipt-grid item-row" key={item.id}><span title={item.raw}>{itemName(item,receipt.style)}</span><span>×{item.quantity}</span><span>{signed(item.quantity*item.unit)}</span></div>)}</div>
    </div>
    <div className="receipt-section"><div className="sum-row"><span>初始电量</span><span>100</span></div><div className="sum-row"><span>今日收入</span><span>{signed(total.income)}</span></div><div className="sum-row"><span>今日支出</span><span>{total.expense}</span></div><div className="balance"><div><b>当前电量余额</b><BatteryMedium size={29}/></div><span className="stamp">今日已结算</span><strong data-testid="balance">{total.balance}</strong></div></div>
    <div className="receipt-section cashier"><span>收银员说：</span><p>{message(receipt)}</p></div>
    <div className="receipt-meta"><span>{formatDate(receipt.date)}</span><span>虚构流水号</span></div><div className="serial">{receipt.id}</div><div className="barcode" aria-label="装饰条码，不可扫码"/><p className="receipt-disclaimer">娱乐数值，不是身心状态评估</p><div className="receipt-end">本地趣味生成 · 小票请收好</div>
  </article>;
}
