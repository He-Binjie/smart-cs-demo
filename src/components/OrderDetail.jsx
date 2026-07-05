export default function OrderDetail({ order, onBack, onSelectSubOrder }) {
  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--feishu-bg)' }}>
      {/* 顶部导航 */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-12 pb-3" style={{ background: 'var(--feishu-white)', borderBottom: '0.5px solid var(--feishu-border)' }}>
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--feishu-text-1)" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[16px] font-semibold truncate" style={{ color: 'var(--feishu-text-1)' }}>
            {order.mainOrderId}
          </h1>
          <p className="text-[11px]" style={{ color: 'var(--feishu-text-3)' }}>
            {order.storeName} · {order.createTime}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* 子订单列表 */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        <div className="flex items-center gap-2 px-1 mb-1">
          <span className="text-[13px] font-semibold" style={{ color: 'var(--feishu-text-1)' }}>
            子订单明细
          </span>
          <span className="text-[11px]" style={{ color: 'var(--feishu-text-3)' }}>
            共 {order.subOrders.length} 个
          </span>
        </div>

        {order.subOrders.map((sub, idx) => (
          <SubOrderCard
            key={sub.subOrderId}
            subOrder={sub}
            index={idx + 1}
            onClick={() => onSelectSubOrder(sub)}
          />
        ))}
      </div>
    </div>
  );
}

function SubOrderCard({ subOrder, index, onClick }) {
  const hasDriver = subOrder.drivers && subOrder.drivers.length > 0;
  const productCount = subOrder.products.length;
  const totalQty = subOrder.products.reduce((sum, p) => sum + p.qty, 0);

  return (
    <button
      onClick={onClick}
      className="order-card w-full text-left"
    >
      {/* 子订单头部：序号 + ID + 状态 */}
      <div className="flex items-center justify-between mb-3" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--feishu-border)' }}>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded flex items-center justify-center text-[12px] font-bold" style={{ background: 'var(--status-shipped-bg)', color: 'var(--feishu-brand)' }}>
            {index}
          </span>
          <span className="text-[13px] font-medium" style={{ color: 'var(--feishu-text-1)' }}>
            {subOrder.subOrderId.slice(-3)}
          </span>
        </div>
        <StatusBadge status={subOrder.status} />
      </div>

      {/* 司机信息（已发货时优先展示） - 浅蓝背景块 */}
      {hasDriver && (
        <div className="driver-info-block mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[13px]">🚚</span>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--feishu-text-1)' }}>
              今日配送司机
            </span>
          </div>
          {subOrder.drivers.map((d, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <div className="feishu-avatar" style={{ width: 32, height: 32, fontSize: 12, background: i === 0 ? '#3370FF' : '#8B5CF6' }}>
                  {d.name[0]}
                </div>
                <div>
                  <div className="text-[12px] font-medium" style={{ color: 'var(--feishu-text-1)' }}>{d.name}</div>
                  <div className="text-[10px]" style={{ color: 'var(--feishu-text-3)' }}>{d.type}</div>
                </div>
              </div>
              <a
                href={`tel:${d.phone}`}
                onClick={e => e.stopPropagation()}
                className="text-[12px] font-medium flex items-center gap-1"
                style={{ color: 'var(--feishu-brand-light)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                {d.phone}
              </a>
            </div>
          ))}
        </div>
      )}

      {/* 商品概览 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px]" style={{ color: 'var(--feishu-text-3)' }}>
            {productCount} 种商品 · 共 {totalQty} 件
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--feishu-text-4)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </div>
        {/* 前3个商品预览 */}
        <div className="space-y-1">
          {subOrder.products.slice(0, 3).map((p, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[12px] truncate max-w-[200px]" style={{ color: 'var(--feishu-text-2)' }}>
                {p.name}
              </span>
              <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--feishu-text-3)' }}>
                ×{p.qty}{p.unit}
              </span>
            </div>
          ))}
          {productCount > 3 && (
            <span className="text-[11px]" style={{ color: 'var(--feishu-brand-light)' }}>
              +{productCount - 3} 查看全部商品
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function StatusBadge({ status }) {
  const config = {
    '已发货': { bg: 'var(--status-shipped-bg)', color: 'var(--status-shipped-text)' },
    '备货中': { bg: 'var(--status-stock-bg)', color: 'var(--status-stock-text)' },
    '待发货': { bg: 'var(--status-processing-bg)', color: 'var(--status-processing-text)' },
    '部分签收': { bg: '#F9F0FF', color: '#722ED1' },
  };
  const c = config[status] || { bg: 'var(--status-stock-bg)', color: 'var(--status-stock-text)' };
  return (
    <span className="feishu-tag" style={{ background: c.bg, color: c.color }}>{status}</span>
  );
}
