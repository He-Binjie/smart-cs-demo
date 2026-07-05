import { mockStores, getSubOrderStats } from '../data/mockOrders';

export default function FeishuCard({ onCardClick }) {
  const allOrders = mockStores.flatMap(s => s.orders);

  return (
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-sm">
        <svg viewBox="0 0 32 32" width="32" height="32"><defs><linearGradient id="fcbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8B1A1A"/><stop offset="100%" stopColor="#C41E3A"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#fcbg)"/><ellipse cx="16" cy="14" rx="6.5" ry="6" fill="#FFF8E7"/><circle cx="13.8" cy="13" r="1" fill="#5C3317"/><circle cx="18.2" cy="13" r="1" fill="#5C3317"/><path d="M13.5 16 Q16 18.5 18.5 16" stroke="#5C3317" strokeWidth="0.8" fill="none" strokeLinecap="round"/><path d="M16 5 Q18 7 17 9.5 Q16 8 15 9.5 Q14 7 16 5Z" fill="#4CAF50"/><circle cx="11" cy="14.5" r="1.5" fill="#FFB6C1" opacity="0.5"/><circle cx="21" cy="14.5" r="1.5" fill="#FFB6C1" opacity="0.5"/></svg>
      </div>
      <div className="flex-1 max-w-[82%]">
        <div className="text-[11px] text-gray-400 mb-1">茶小链</div>
        <div
          className="feishu-card bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer"
          onClick={onCardClick}
          style={{ border: '1px solid var(--feishu-border)' }}
        >
          {/* 卡片头部 - 蓝色渐变 */}
          <div className="bg-gradient-to-r from-[#3370FF] to-[#4B83FF] px-4 py-3 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-[14px]">📦</span>
            </div>
            <div>
              <div className="text-white font-semibold text-[15px]">订单查询结果</div>
              <div className="text-white/70 text-[11px] mt-0.5">近7天未完成订单 · {allOrders.length}笔主订单</div>
            </div>
          </div>

          {/* 订单列表 - 按门店分组 */}
          <div className="px-4 py-3 max-h-[320px] overflow-y-auto">
            {mockStores.map((store, storeIdx) => (
              <div key={store.storeId}>
                {/* 门店标题 */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[12px]">🏪</span>
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--feishu-text-1)' }}>
                    {store.storeName}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--feishu-text-3)' }}>
                    {store.orders.length}单
                  </span>
                </div>

                {/* 该门店的订单 */}
                {store.orders.slice(0, 2).map((order, idx) => (
                  <OrderRow key={order.mainOrderId} order={order} />
                ))}

                {store.orders.length > 2 && (
                  <div className="text-[11px] py-1.5" style={{ color: 'var(--feishu-text-4)' }}>
                    还有 {store.orders.length - 2} 个订单...
                  </div>
                )}

                {storeIdx < mockStores.length - 1 && (
                  <div className="border-b my-3" style={{ borderColor: 'var(--feishu-border)' }} />
                )}
              </div>
            ))}
          </div>

          {/* 卡片底部提示 */}
          <div className="px-4 py-3" style={{ borderTop: '1px solid var(--feishu-border)', background: '#FAFBFC' }}>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--feishu-text-3)' }}>
              👆 <span style={{ color: 'var(--feishu-brand)', fontWeight: 500 }}>点击卡片</span> 查看订单详情，并获取今日发货司机联系方式
            </p>
          </div>
        </div>
        <div className="text-[10px] text-gray-400 mt-1">
          {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order }) {
  const stats = getSubOrderStats(order);

  return (
    <div className="py-2">
      {/* 第一行：订单号 + 状态 */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] font-mono tracking-tight" style={{ color: 'var(--feishu-text-2)' }}>
          {order.mainOrderId.slice(-5)}
        </span>
        <StatusBadge status={order.status} />
      </div>
      {/* 第二行：时间 + 子订单统计 */}
      <div className="flex items-center gap-2">
        <span className="text-[11px]" style={{ color: 'var(--feishu-text-3)' }}>
          {order.createTime}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--feishu-text-4)' }}>·</span>
        <span className="text-[11px]" style={{ color: 'var(--feishu-text-3)' }}>
          子订单{order.subOrders.length}笔
        </span>
      </div>
      {/* 第三行：子订单状态标签 */}
      <div className="flex gap-1.5 mt-1.5 flex-wrap">
        {Object.entries(stats).map(([status, count]) => (
          <SubStatusTag key={status} status={status} count={count} />
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    '处理中': { bg: 'var(--status-processing-bg)', color: 'var(--status-processing-text)' },
    '待审核': { bg: 'var(--status-review-bg)', color: 'var(--status-review-text)' },
    '待支付': { bg: 'var(--status-payment-bg)', color: 'var(--status-payment-text)' },
  };
  const s = styles[status] || { bg: 'var(--status-stock-bg)', color: 'var(--status-stock-text)' };
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function SubStatusTag({ status, count }) {
  const styles = {
    '备货中': { bg: 'var(--status-stock-bg)', color: 'var(--status-stock-text)' },
    '待发货': { bg: 'var(--status-processing-bg)', color: 'var(--status-processing-text)' },
    '已发货': { bg: 'var(--status-shipped-bg)', color: 'var(--status-shipped-text)' },
    '部分签收': { bg: '#F9F0FF', color: '#722ED1' },
  };
  const s = styles[status] || { bg: 'var(--status-stock-bg)', color: 'var(--status-stock-text)' };
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {count}{status}
    </span>
  );
}
