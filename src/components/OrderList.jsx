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

export default function OrderList({ onBack, selectedMainOrderId, onCall }) {
  const [activeFilter, setActiveFilter] = useState('全部');
  const [expandedProducts, setExpandedProducts] = useState({});

  // Flatten all sub-orders with parent order info
  const flatSubOrders = useMemo(() => {
    const result = [];
    mockStores.forEach(store => {
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
  }, [selectedMainOrderId]);

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
    return Object.values(groups);
  }, [flatSubOrders]);

  // Filter sub-orders
  const filteredSubOrders = activeFilter === '全部'
    ? flatSubOrders
    : flatSubOrders.filter(s => s.status === activeFilter);

  // Check if any shipped sub-orders exist in current filter
  const hasShipped = filteredSubOrders.some(s => s.status === '已发货');

  // Total sub-orders count
  const totalSubOrders = flatSubOrders.length;

  // Store name (use first store or combined)
  const storeNames = [...new Set(mockStores.map(s => s.storeName))];
  const storeDisplay = storeNames.length === 1 ? storeNames[0] : storeNames.join('、');

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
            {selectedMainOrderId ? '订单详情' : '订单详情'}
          </h1>
          {selectedMainOrderId && (
            <p style={{ fontSize: '11px', color: '#8f959e', margin: '2px 0 0 0' }}>
              {selectedMainOrderId}
            </p>
          )}
        </div>
      </div>

      {/* Store Info */}
      <div style={{
        flexShrink: 0,
        padding: '10px 16px',
        background: '#fff',
        borderBottom: '1px solid #e5e6e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#1f2329' }}>
          {storeDisplay}
        </span>
        <span style={{ fontSize: '12px', color: '#8f959e' }}>
          共 {totalSubOrders} 个子订单
        </span>
      </div>

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
        {/* Driver Info (shown when shipped orders exist) */}
        {hasShipped && (
          <div style={{
            margin: '8px 12px',
            padding: '12px',
            background: '#fff',
            borderRadius: '8px',
            border: '1px solid #e5e6e8',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2329', marginBottom: '8px' }}>
              今日配送司机
            </div>
            {todayDrivers.map((driver, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 0',
                fontSize: '13px',
                color: '#3370ff',
              }}>
                <span>{driver.type} {driver.name}：</span>
                <span
                  onClick={() => onCall && onCall(driver.name, driver.phone)}
                  style={{ color: '#3370ff', cursor: 'pointer', fontWeight: 500 }}
                >
                  {driver.phone} 📞
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Sub-order Blocks - grouped by main order */}
        {groupedOrders.map(group => {
          // Filter sub-orders within this group
          const filteredSubs = activeFilter === '全部'
            ? group.subOrders
            : group.subOrders.filter(s => s.status === activeFilter);

          if (filteredSubs.length === 0) return null;

          const mainStatusColor = STATUS_COLORS[group.mainOrderStatus] || STATUS_COLORS['处理中'];

          return (
            <div key={group.mainOrderId} style={{
              margin: '8px 12px',
              background: '#fff',
              borderRadius: '8px',
              border: '1px solid #e5e6e8',
              overflow: 'hidden',
            }}>
              {/* Main Order Header */}
              <div style={{
                padding: '10px 12px',
                borderBottom: '1px solid #f0f1f3',
                background: '#fafbfc',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1f2329' }}>
                    {group.mainOrderId}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: mainStatusColor.bg,
                    color: mainStatusColor.text,
                    fontWeight: 500,
                  }}>
                    {group.mainOrderStatus}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: '#8f959e' }}>
                    子订单 {group.subOrderCount}个
                  </span>
                  <span style={{ fontSize: '11px', color: '#8f959e' }}>|</span>
                  <span style={{ fontSize: '11px', color: '#8f959e' }}>
                    {group.createTime}
                  </span>
                  <span style={{ fontSize: '11px', color: '#8f959e' }}>|</span>
                  <span style={{ fontSize: '11px', color: '#8f959e' }}>
                    {group.storeName}
                  </span>
                </div>
              </div>

              {/* Sub-orders under this main order */}
              {filteredSubs.map(sub => (
                <SubOrderRow
                  key={sub._key}
                  sub={sub}
                  expanded={!!expandedProducts[sub._key]}
                  onToggle={() => toggleExpand(sub._key)}
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
function SubOrderRow({ sub, expanded, onToggle }) {
  const products = sub.products || [];
  const productLines = products.map(p => `${p.name}×${p.qty}×${p.unit}`);
  const hasMore = productLines.length > 5;
  const displayLines = expanded ? productLines : productLines.slice(0, 5);

  const statusColor = STATUS_COLORS[sub.status] || STATUS_COLORS['备货中'];

  return (
    <div style={{
      padding: '10px 12px',
      borderTop: '1px solid #f5f6f7',
    }}>
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
  );
}
