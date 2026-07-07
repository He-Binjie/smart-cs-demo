import { useState, useMemo } from 'react';
import { mockStores, todayDrivers, getProductSummary } from '../data/mockOrders';

const STATUS_FILTERS = ['全部', '备货中', '待发货', '已发货', '部分签收'];

const STATUS_COLORS = {
  '备货中': { bg: '#fff7e6', text: '#d48806' },
  '待发货': { bg: '#e6f7ff', text: '#1890ff' },
  '已发货': { bg: '#f6ffed', text: '#52c41a' },
  '部分签收': { bg: '#f9f0ff', text: '#722ed1' },
  '处理中': { bg: '#e6f7ff', text: '#1890ff' },
  '待审核': { bg: '#fff7e6', text: '#d48806' },
  '待支付': { bg: '#fff1f0', text: '#f5222d' },
};

export default function OrderList({ onBack, selectedMainOrderId, selectedStoreId: parentStoreId, onCall }) {
  const [activeFilter, setActiveFilter] = useState('全部');
  const [expandedProducts, setExpandedProducts] = useState({});
  const [internalStoreId, setInternalStoreId] = useState(null);

  // Use parent storeId if provided, otherwise manage internally
  const selectedStoreId = parentStoreId || internalStoreId;

  // Get all unique stores
  const allStores = useMemo(() => {
    return mockStores.map(s => ({ storeId: s.storeId, storeName: s.storeName }));
  }, []);

  // Initialize internal selectedStoreId on mount (only if no parent storeId)
  useMemo(() => {
    if (!parentStoreId && !internalStoreId) {
      if (selectedMainOrderId) {
        for (const store of mockStores) {
          if (store.orders.some(o => o.mainOrderId === selectedMainOrderId)) {
            setInternalStoreId(store.storeId);
            break;
          }
        }
      } else {
        setInternalStoreId(allStores[0]?.storeId);
      }
    }
  }, [selectedMainOrderId, internalStoreId, allStores, parentStoreId]);

  // Flatten all sub-orders with parent order info, filtered by selected store
  const flatSubOrders = useMemo(() => {
    const result = [];
    mockStores.forEach(store => {
      // Filter by selected store
      if (selectedStoreId && store.storeId !== selectedStoreId) return;
      store.orders.forEach(order => {
        // If selectedMainOrderId is set, only include that main order
        if (selectedMainOrderId && order.mainOrderId !== selectedMainOrderId) return;
        order.subOrders.forEach((sub, idx) => {
          result.push({
            ...sub,
            mainOrderId: order.mainOrderId,
            mainOrderStatus: order.status,
            createTime: order.createTime,
            storeName: order.storeName || store.storeName,
            subOrderCount: order.subOrders.length,
            _key: `${order.mainOrderId}-${idx}`,
          });
        });
      });
    });
    return result;
  }, [selectedMainOrderId, selectedStoreId]);

  // Group sub-orders by mainOrderId
  const groupedOrders = useMemo(() => {
    const groups = {};
    flatSubOrders.forEach(sub => {
      if (!groups[sub.mainOrderId]) {
        groups[sub.mainOrderId] = {
          mainOrderId: sub.mainOrderId,
          mainOrderStatus: sub.mainOrderStatus,
          createTime: sub.createTime,
          storeName: sub.storeName,
          subOrderCount: sub.subOrderCount,
          subOrders: [],
        };
      }
      groups[sub.mainOrderId].subOrders.push(sub);
    });
    return Object.values(groups).sort((a, b) => new Date(a.createTime) - new Date(b.createTime)); // 由远到近
  }, [flatSubOrders]);

  // Filter sub-orders
  const filteredSubOrders = activeFilter === '全部'
    ? flatSubOrders
    : flatSubOrders.filter(s => s.status === activeFilter);

  // Check if any shipped sub-orders exist in current filter
  const hasShipped = filteredSubOrders.some(s => s.status === '已发货');

  // Total sub-orders count
  const totalSubOrders = flatSubOrders.length;

  const toggleExpand = (key) => {
    setExpandedProducts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f5f6f7' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: '#fff',
        borderBottom: '1px solid #e5e6e8',
      }}>
        <button
          onClick={onBack}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f2329" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '17px', fontWeight: 600, color: '#1f2329', margin: 0, lineHeight: 1.3 }}>
            订单详情
          </h1>
        </div>
      </div>

      {/* Store Selector (dropdown) */}
      {allStores.length > 1 && (
        <div style={{
          flexShrink: 0,
          padding: '8px 16px',
          background: '#fff',
          borderBottom: '1px solid #e5e6e8',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '13px', color: '#646a73', flexShrink: 0 }}>门店：</span>
          <select
            value={selectedStoreId || ''}
            onChange={e => setInternalStoreId(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #e5e6e8',
              fontSize: '13px',
              color: '#1f2329',
              background: '#f5f6f7',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {allStores.map(store => (
              <option key={store.storeId} value={store.storeId}>
                {store.storeName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{
        flexShrink: 0,
        padding: '10px 12px',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        background: '#fff',
        borderBottom: '1px solid #e5e6e8',
      }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: '18px',
              fontSize: '13px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              border: activeFilter === f ? '1px solid #3370ff' : '1px solid #e5e6e8',
              background: activeFilter === f ? '#e8f3ff' : '#f5f6f7',
              color: activeFilter === f ? '#3370ff' : '#646a73',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px' }}>
        {/* Sub-order Blocks - grouped by main order */}
        {groupedOrders.map(group => {
          // Filter sub-orders within this group
          const filteredSubs = activeFilter === '全部'
            ? group.subOrders
            : group.subOrders.filter(s => s.status === activeFilter);

          if (filteredSubs.length === 0) return null;

          return (
            <div key={group.mainOrderId} style={{
              margin: '8px 12px',
              background: '#fff',
              borderRadius: '8px',
              border: '1px solid #e5e6e8',
              overflow: 'hidden',
            }}>
              {/* Main Order Header - only order number */}
              <div style={{
                padding: '10px 12px',
                borderBottom: '1px solid #f0f1f3',
                background: '#fafbfc',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1f2329' }}>
                  {group.mainOrderId}
                </span>
              </div>

              {/* Sub-orders under this main order */}
              {filteredSubs.map(sub => (
                <SubOrderRow
                  key={sub._key}
                  sub={sub}
                  expanded={!!expandedProducts[sub._key]}
                  onToggle={() => toggleExpand(sub._key)}
                  onCall={onCall}
                />
              ))}
            </div>
          );
        })}

        {filteredSubOrders.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 16px',
            color: '#8f959e',
            fontSize: '14px',
          }}>
            暂无{activeFilter === '全部' ? '' : `「${activeFilter}」`}子订单
          </div>
        )}
      </div>
    </div>
  );
}

function SubOrderBlock({ sub, expanded, onToggle }) {
  const products = sub.products || [];
  const productLines = products.map(p => `${p.name}×${p.qty}×${p.unit}`);
  const hasMore = productLines.length > 5;
  const displayLines = expanded ? productLines : productLines.slice(0, 5);

  const statusColor = STATUS_COLORS[sub.status] || STATUS_COLORS['备货中'];
  const mainStatusColor = STATUS_COLORS[sub.mainOrderStatus] || STATUS_COLORS['处理中'];

  return (
    <div style={{
      margin: '8px 12px',
      background: '#fff',
      borderRadius: '8px',
      border: '1px solid #e5e6e8',
      overflow: 'hidden',
    }}>
      {/* Main Order Info Header */}
      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid #f0f1f3',
      }}>
        {/* Row 1: Order number + main status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1f2329' }}>
            {sub.mainOrderId}
          </span>
          <span style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: mainStatusColor.bg,
            color: mainStatusColor.text,
            fontWeight: 500,
          }}>
            {sub.mainOrderStatus}
          </span>
        </div>
        {/* Row 2: Meta info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: '#8f959e' }}>
            子订单 {sub.subOrderCount}个
          </span>
          <span style={{ fontSize: '11px', color: '#8f959e' }}>|</span>
          <span style={{ fontSize: '11px', color: '#8f959e' }}>
            {sub.createTime}
          </span>
          <span style={{ fontSize: '11px', color: '#8f959e' }}>|</span>
          <span style={{ fontSize: '11px', color: '#8f959e' }}>
            {sub.storeName}
          </span>
        </div>
      </div>

      {/* Sub-order Detail */}
      <div style={{ padding: '10px 12px' }}>
        {/* Sub-order number + status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#646a73' }}>
            子单号：{sub.subOrderId}
          </span>
          <span style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: statusColor.bg,
            color: statusColor.text,
            fontWeight: 500,
          }}>
            {sub.status}
          </span>
        </div>

        {/* Products */}
        <div style={{ fontSize: '12px', color: '#1f2329', lineHeight: 1.8 }}>
          {displayLines.map((line, i) => (
            <div key={i} style={{ color: '#646a73' }}>
              {line}
            </div>
          ))}
          {hasMore && !expanded && (
            <button
              onClick={onToggle}
              style={{
                border: 'none',
                background: 'none',
                color: '#3370ff',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '2px 0',
              }}
            >
              ... 展开全部 {products.length} 项
            </button>
          )}
          {hasMore && expanded && (
            <button
              onClick={onToggle}
              style={{
                border: 'none',
                background: 'none',
                color: '#3370ff',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '2px 0',
              }}
            >
              收起
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Sub-order row (no main order header, used inside grouped view) =====
function SubOrderRow({ sub, expanded, onToggle, onCall }) {
  const [copied, setCopied] = useState(false);
  const products = sub.products || [];
  const productLines = products.map(p => `${p.name}×${p.qty}×${p.unit}`);
  const hasMore = productLines.length > 5;
  const displayLines = expanded ? productLines : productLines.slice(0, 5);

  const statusColor = STATUS_COLORS[sub.status] || STATUS_COLORS['备货中'];

  // Mock driver and date info based on status
  const isShipped = sub.status === '已发货' || sub.status === '部分签收';
  const driver = isShipped ? todayDrivers[0] : null;
  const shipDate = isShipped ? '2026-07-06' : null;
  const estimatedArrival = isShipped ? '2026-07-06' : null;

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
    <div style={{
      padding: '10px 12px',
      borderTop: '1px solid #f5f6f7',
    }}>
      {/* Driver info (above sub-order number, only for shipped orders) */}
      {driver && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 8px',
          marginBottom: '8px',
          background: '#f0f9ff',
          borderRadius: '6px',
          border: '1px solid #bae0ff',
          fontSize: '12px',
        }}>
          <span style={{ color: '#646a73' }}>🚚 配送司机：</span>
          <span style={{ color: '#1f2329', fontWeight: 500 }}>{driver.name}</span>
          <span
            onClick={() => onCall && onCall(driver.name, driver.phone)}
            style={{ color: '#3370ff', cursor: 'pointer', fontWeight: 500, marginLeft: 'auto' }}
          >
            {driver.phone} 📞
          </span>
        </div>
      )}

      {/* Sub-order number + copy button + status badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: '#646a73' }}>
            子单号：{sub.subOrderId}
          </span>
          <button
            onClick={() => handleCopy(sub.subOrderId)}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="复制子订单号"
          >
            {copied ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8f959e" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            )}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {sub.isDirectDelivery && (
            <span style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#E6F7FF',
              color: '#1890FF',
              fontWeight: 500,
            }}>
              直配
            </span>
          )}
          <span style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: statusColor.bg,
            color: statusColor.text,
            fontWeight: 500,
          }}>
            {sub.status}
          </span>
        </div>
      </div>

      {/* Shipping date + estimated arrival (below sub-order number) */}
      {shipDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', fontSize: '11px', color: '#8f959e', flexWrap: 'wrap' }}>
          <span>发货：{shipDate}</span>
          <span>预计到达：{estimatedArrival}</span>
        </div>
      )}

      {/* Direct delivery logistics links */}
      {sub.isDirectDelivery && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '8px',
          flexWrap: 'wrap',
        }}>
          <a
            href="https://chagee.feishu.cn/share/base/query/shrcnjpLSTyKJGy4CXc8hY7GUqh"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#F0F5FF',
              border: '1px solid #D6E4FF',
              color: '#3370FF',
              fontSize: '11px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            📘 飞书共享表格
          </a>
          <a
            href="https://www.kuaidi100.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#F6FFED',
              border: '1px solid #B7EB8F',
              color: '#52C41A',
              fontSize: '11px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            🚚 快递100查询
          </a>
        </div>
      )}

      {/* Products */}
      <div style={{ fontSize: '12px', color: '#1f2329', lineHeight: 1.8 }}>
        {displayLines.map((line, i) => (
          <div key={i} style={{ color: '#646a73' }}>
            {line}
          </div>
        ))}
        {hasMore && !expanded && (
          <button
            onClick={onToggle}
            style={{
              border: 'none',
              background: 'none',
              color: '#3370ff',
              fontSize: '12px',
              cursor: 'pointer',
              padding: '2px 0',
            }}
          >
            ... 展开全部 {products.length} 项
          </button>
        )}
        {hasMore && expanded && (
          <button
            onClick={onToggle}
            style={{
              border: 'none',
              background: 'none',
              color: '#3370ff',
              fontSize: '12px',
              cursor: 'pointer',
              padding: '2px 0',
            }}
          >
            收起
          </button>
        )}
      </div>
    </div>
  );
}
