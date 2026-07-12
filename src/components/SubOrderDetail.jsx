import { useState } from 'react';

export default function SubOrderDetail({ subOrder, onBack }) {
  const [copied, setCopied] = useState(false);
  const hasDriver = subOrder.drivers && subOrder.drivers.length > 0;
  const totalQty = subOrder.products.reduce((sum, p) => sum + p.qty, 0);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--feishu-bg)' }}>
      {/* 顶部导航 */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-12 pb-3" style={{ background: 'var(--feishu-white)', borderBottom: '0.5px solid var(--feishu-border)' }}>
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--feishu-text-1)" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[16px] font-semibold truncate" style={{ color: 'var(--feishu-text-1)' }}>
            子订单详情
          </h1>
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] truncate" style={{ color: 'var(--feishu-text-3)' }}>
              {subOrder.subOrderId}
            </p>
            <button
              onClick={() => handleCopy(subOrder.subOrderId)}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded active:bg-gray-200"
              title="复制子订单号"
            >
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--feishu-text-3)" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        <StatusBadge status={subOrder.status} />
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">

        {/* 司机信息（已发货时优先展示在最顶部） - 浅蓝背景块 */}
        {hasDriver && (
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feishu-white)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--feishu-border)' }}>
              <span className="text-[14px]">🚚</span>
              <span className="text-[14px] font-semibold" style={{ color: 'var(--feishu-text-1)' }}>发货司机</span>
            </div>
            <div className="px-4 py-3 space-y-3">
              {subOrder.drivers.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="feishu-avatar" style={{ width: 40, height: 40, fontSize: 14, background: i === 0 ? '#3370FF' : '#8B5CF6' }}>
                      {d.name[0]}
                    </div>
                    <div>
                      <div className="text-[14px] font-medium" style={{ color: 'var(--feishu-text-1)' }}>{d.name}</div>
                      <div className="text-[12px]" style={{ color: 'var(--feishu-text-3)' }}>{d.type}</div>
                    </div>
                  </div>
                  <a
                    href={`tel:${d.phone}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium"
                    style={{ background: '#E8F8EE', color: '#34C759' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                    {d.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 订单信息 */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feishu-white)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--feishu-border)' }}>
            <span className="text-[14px] font-semibold" style={{ color: 'var(--feishu-text-1)' }}>📋 订单信息</span>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            <InfoRow label="子订单号" value={subOrder.subOrderId} />
            <div className="flex items-center justify-between">
              <span className="text-[13px]" style={{ color: 'var(--feishu-text-3)' }}>状态</span>
              <div className="flex items-center gap-2">
                {subOrder.isDirectDelivery && (
                  <span className="feishu-tag" style={{ background: '#E6F7FF', color: '#1890FF' }}>直配</span>
                )}
                <StatusBadge status={subOrder.status} />
              </div>
            </div>
            <InfoRow label="商品种类" value={`${subOrder.products.length} 种`} />
            <InfoRow label="总数量" value={`${totalQty} 件`} />
          </div>
        </div>

        {/* 商品清单 */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feishu-white)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--feishu-border)' }}>
            <span className="text-[14px] font-semibold" style={{ color: 'var(--feishu-text-1)' }}>📦 商品清单</span>
            <span className="text-[12px]" style={{ color: 'var(--feishu-text-3)' }}>
              {subOrder.products.length} 种 · {totalQty} 件
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--feishu-border)' }}>
            {subOrder.products.map((p, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: '#F0F1F5', color: 'var(--feishu-text-3)' }}>
                    {i + 1}
                  </span>
                  <span className="text-[13px] truncate" style={{ color: 'var(--feishu-text-1)' }}>
                    {p.name}
                  </span>
                </div>
                <span className="text-[13px] font-medium flex-shrink-0 ml-3" style={{ color: 'var(--feishu-text-2)' }}>
                  ×{p.qty}{p.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 直配订单：物流单号 */}
        {subOrder.isDirectDelivery && subOrder.trackingNumber && (
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--feishu-white)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--feishu-border)' }}>
              <span className="text-[14px] font-semibold" style={{ color: 'var(--feishu-text-1)' }}>📮 物流单号</span>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: '#F0F5FF', border: '1px solid #D6E4FF' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3370FF" strokeWidth="2" className="flex-shrink-0">
                    <rect x="1" y="3" width="15" height="13"/>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  <span className="text-[14px] font-mono font-semibold tracking-wide" style={{ color: '#3370FF' }}>{subOrder.trackingNumber}</span>
                </div>
                <button
                  onClick={() => handleCopy(subOrder.trackingNumber)}
                  className="flex-shrink-0 ml-2 px-2 py-1 rounded text-[12px] font-medium"
                  style={{ background: copied ? '#E8F8EE' : '#3370FF', color: copied ? '#34C759' : '#fff', transition: 'all 0.2s' }}
                >
                  {copied ? '✓ 已复制' : '复制'}
                </button>
              </div>
              <p className="text-[11px] mt-2 px-1" style={{ color: 'var(--feishu-text-3)' }}>
                可复制单号至快递100等平台查询物流进度
              </p>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-2 pb-4">
          <button className="flex-1 py-3 rounded-xl text-[14px] font-medium" style={{ background: '#F0F1F5', color: 'var(--feishu-text-2)' }}>
            申请补发
          </button>
          <button className="flex-1 py-3 rounded-xl text-[14px] font-medium" style={{ background: 'var(--feishu-brand)', color: 'white' }}>
            联系司机
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, isTag }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px]" style={{ color: 'var(--feishu-text-3)' }}>{label}</span>
      {isTag ? (
        <StatusBadge status={value} />
      ) : (
        <span className="text-[13px] font-medium" style={{ color: 'var(--feishu-text-1)' }}>{value}</span>
      )}
    </div>
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
