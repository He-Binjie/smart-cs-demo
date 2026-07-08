import { useState } from 'react';
import { logisticsData, humanAgents } from '../data/mockFAQ';
import { mockStores, aggregateSubOrderStatus } from '../data/mockOrders';

// 霸王茶姬 SVG 头像 (32x32)
function BotAvatar() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bwg-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B1A1A" />
          <stop offset="100%" stopColor="#C41E3A" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#bwg-bg)" />
      <ellipse cx="16" cy="17" rx="9" ry="8.5" fill="#FFF8E7" />
      <path d="M16 5 C13 7, 11 10, 12 13 C13 11, 15 9, 16 8 C17 9, 19 11, 20 13 C21 10, 19 7, 16 5Z" fill="#4CAF50" />
      <path d="M16 6.5 C14.5 8, 13.5 10, 14 12" stroke="#2E7D32" strokeWidth="0.5" fill="none" />
      <circle cx="13" cy="17" r="1.2" fill="#3E2723" />
      <circle cx="19" cy="17" r="1.2" fill="#3E2723" />
      <circle cx="13.4" cy="16.6" r="0.4" fill="white" />
      <circle cx="19.4" cy="16.6" r="0.4" fill="white" />
      <ellipse cx="11" cy="19.5" rx="2" ry="1.2" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="21" cy="19.5" rx="2" ry="1.2" fill="#FFB6C1" opacity="0.6" />
      <path d="M14 21 Q16 23 18 21" stroke="#3E2723" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function ChatBubble({ msg, onViewOrderList, onViewMainOrder, onCall, onSelectStore, onBotAvatarClick }) {
  const isUser = msg.type === 'user';
  const isBot = msg.type === 'bot';
  const isOther = msg.type === 'other';

  const rowClass = isUser ? 'message-row user' : 'message-row bot';

  return (
    <div className={`${rowClass} animate-slideUp`}>
      {/* 头像 */}
      {isBot ? (
        <div className="avatar bot" onClick={onBotAvatarClick} style={onBotAvatarClick ? { cursor: 'pointer' } : undefined}><BotAvatar /></div>
      ) : (
        <div
          className={`avatar ${isUser ? 'user' : 'other'}`}
          style={!isUser && !isBot ? { background: msg.user.color, color: '#fff' } : undefined}
        >
          {msg.user.avatar}
        </div>
      )}

      {/* 消息体 */}
      <div className="message-content">
        {/* 发送者名称 */}
        <span className="message-name">{msg.user.name}</span>

        {/* 文本消息 */}
        {msg.text && !msg.cardType && (
          <div className="bubble">
            <p className="whitespace-pre-wrap">
              {isUser && msg.text.startsWith('@茶小链') ? (
                <>
                  <span className="at-mention">@茶小链</span>
                  {msg.text.slice(4)}
                </>
              ) : msg.text}
            </p>
          </div>
        )}

        {/* 卡片消息 */}
        {msg.cardType === 'store-select' && <StoreSelectCard onSelectStore={onSelectStore} stores={msg.stores} />}
        {msg.cardType === 'order' && <OrderCard onViewOrderList={onViewOrderList} onViewMainOrder={onViewMainOrder} storeId={msg.storeId} />}
        {msg.cardType === 'logistics' && <LogisticsCard onCall={onCall} />}
        {msg.cardType === 'faq' && <FAQCard faq={msg.faqData} />}
        {msg.cardType === 'transfer' && <TransferCard />}
        {msg.cardType === 'transfer-with-history' && <TransferWithHistoryCard />}
        {msg.cardType === 'transfer-thread' && <TransferThreadCard />}
        {msg.cardType === 'transfer-group' && <TransferGroupCard />}
        {msg.cardType === 'workorder' && <WorkOrderCard />}
        {msg.cardType === 'complaint' && <ComplaintCard description={msg.complaintDescription} />}
        {msg.cardType === 'complaint-transfer' && <ComplaintTransferCard />}
      </div>
    </div>
  );
}

// ===== 状态颜色映射 =====
const STATUS_COLORS = {
  '处理中': '#3370ff',
  '已发货': '#3370ff',
  '待审核': '#3370ff',
  '待支付': '#34c759',
  '备货中': '#8f959e',
  '待发货': '#ff9500',
  '部分签收': '#ff9500',
};

// ===== 多门店选店卡片 =====
function StoreSelectCard({ onSelectStore, stores }) {
  const displayStores = stores || mockStores;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e6e8',
        borderRadius: 16,
        maxWidth: 280,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #f0f1f3',
          background: '#3370ff',
          color: '#fff',
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        🏪 请选择门店
      </div>
      <div style={{ padding: '4px 0' }}>
        {displayStores.map((store, idx) => {
          const isLast = idx === displayStores.length - 1;
          return (
            <div
              key={store.storeId}
              onClick={() => onSelectStore && onSelectStore(store.storeId)}
              style={{
                padding: '12px 14px',
                borderBottom: isLast ? 'none' : '1px solid #f5f6f7',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f7fa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2329' }}>
                {store.storeName}
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8f959e" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f1f3' }}>
        <div style={{ fontSize: 11, color: '#8f959e' }}>
          👆 请选择您要查询的门店
        </div>
      </div>
    </div>
  );
}

// ===== 订单查询卡片（飞书卡片风格） =====
function OrderCard({ onViewOrderList, onViewMainOrder, storeId }) {
  // 如果指定了storeId，只显示该门店的订单；否则显示所有门店
  const stores = storeId
    ? mockStores.filter(s => s.storeId === storeId)
    : mockStores;
  const allOrders = stores.flatMap(s => 
    s.orders.map(o => ({ ...o, storeName: s.storeName }))
  ).sort((a, b) => new Date(a.createTime) - new Date(b.createTime)); // 由远到近
  const storeName = stores.length === 1 ? stores[0].storeName : '全部门店';

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e6e8',
        borderRadius: 16,
        maxWidth: 280,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #f0f1f3',
          background: '#3370ff',
          color: '#fff',
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        📋 {storeName} · 订单查询
      </div>

      {/* Order List - each row clickable */}
      {allOrders.map((order, idx) => {
        const statusColor = STATUS_COLORS[order.status] || '#8f959e';
        const isLast = idx === allOrders.length - 1;

        return (
          <div
            key={order.mainOrderId}
            onClick={() => onViewMainOrder && onViewMainOrder(order.mainOrderId, storeId)}
            style={{
              padding: '8px 12px',
              borderBottom: isLast ? 'none' : '1px solid #f5f6f7',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f7fa'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Top row: order info + status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {/* Left: order number + time */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2329', lineHeight: '18px' }}>
                  {order.mainOrderId}
                </div>
                <div style={{ fontSize: 11, color: '#8f959e', marginTop: 2, lineHeight: '16px' }}>
                  {order.createTime}
                </div>
              </div>

              {/* Right: status pill */}
              <div
                style={{
                  flexShrink: 0,
                  marginLeft: 8,
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 500,
                  color: statusColor,
                  background: `${statusColor}14`,
                  border: `1px solid ${statusColor}30`,
                  whiteSpace: 'nowrap',
                }}
              >
                {order.status}
              </div>
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid #f0f1f3',
        }}
      >
        <button
          onClick={() => onViewOrderList && onViewOrderList(storeId)}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#3370ff',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          查看所有近7天未完成的订单
        </button>
        <div style={{ fontSize: 11, color: '#8f959e', marginTop: 6 }}>
          👆 点击上方单个订单可查看详情
        </div>
      </div>
    </div>
  );
}

// ===== 物流追踪卡片 =====
function LogisticsCard({ onCall }) {
  const data = logisticsData;

  return (
    <div className="card">
      <div className="card-header">
        <h3>📦 今日配送信息</h3>
        <span className="tag">月亮湾店</span>
      </div>
      <div className="card-body">
        <div className="field"><span className="label">发货时间</span><span className="value">{data.shipTime}</span></div>
        <div className="field"><span className="label">司机姓名</span><span className="value">{data.driverName}</span></div>
        <div className="field">
          <span className="label">司机电话</span>
          <span
            className="value phone"
            onClick={() => onCall && onCall(data.driverName, data.driverPhone)}
            style={{ cursor: 'pointer', color: '#3370ff', fontWeight: 500 }}
          >
            {data.driverPhone} 📞
          </span>
        </div>
      </div>
    </div>
  );
}

// ===== FAQ问答卡片 =====
function FAQCard({ faq }) {
  return (
    <div className="bubble">
      <p className="whitespace-pre-wrap">
        📋 <b>{faq.question}</b>{'\n\n'}
        {faq.answer}
      </p>
    </div>
  );
}

// ===== 转人工卡片（旧版，保留兼容） =====
function TransferCard() {
  return <TransferWithHistoryCard />;
}

// ===== 转人工方式1：群内@BP + 前3轮对话 =====
function TransferWithHistoryCard() {
  const historyRounds = [
    { round: 1, user: '今天月亮湾店鲜奶到了吗？', bot: '已为您查询，月亮湾店的鲜奶订单（XSD-20260705-04451）状态为"已发货"，预计今天下午到达。' },
    { round: 2, user: '司机电话多少？', bot: '配送司机王师傅，电话 138****5678。如需联系可直接拨打。' },
    { round: 3, user: '我好像下错单了，能帮我处理一下吗', bot: '实在抱歉，我们紧急处理，正在为您转接对应BP人工服务' },
  ];

  return (
    <div className="bubble" style={{ maxWidth: 300 }}>
      <p style={{ marginBottom: 8 }}>
        <span className="at-mention">@李BP</span> 门店需要人工协助，以下是近期对话记录：
      </p>
      <div style={{
        background: '#f5f7fa', borderRadius: 8, padding: '10px 12px',
        fontSize: 12, lineHeight: '18px', color: '#1f2329',
      }}>
        {historyRounds.map((r, i) => (
          <div key={i} style={{ marginBottom: i < historyRounds.length - 1 ? 10 : 0 }}>
            <div style={{ color: '#8f959e', fontSize: 11, marginBottom: 2 }}>【第{r.round}轮】</div>
            <div><span style={{ color: '#8B5CF6', fontWeight: 500 }}>店长：</span>{r.user}</div>
            <div><span style={{ color: '#C41E3A', fontWeight: 500 }}>茶小链：</span>{r.bot}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== 转人工方式2：创建话题 + 话题内@BP =====
function TransferThreadCard() {
  const [expanded, setExpanded] = useState(false);
  const historyRounds = [
    { round: 1, user: '今天月亮湾店鲜奶到了吗？', bot: '已为您查询，月亮湾店的鲜奶订单状态为"已发货"，预计今天下午到达。' },
    { round: 2, user: '司机电话多少？', bot: '配送司机王师傅，电话 138****5678。' },
    { round: 3, user: '这个问题你解决不了，帮我转人工吧', bot: '实在抱歉，我们紧急处理，正在为您转接对应BP人工服务' },
  ];

  return (
    <div className="card" style={{ maxWidth: 300 }}>
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>📌</span>
        <h3 style={{ margin: 0, fontSize: 14 }}>已创建话题</h3>
      </div>
      <div className="card-body" style={{ padding: '10px 14px' }}>
        <div style={{
          background: '#f0f5ff', borderRadius: 6, padding: '8px 10px',
          marginBottom: 8, fontSize: 13, color: '#3370ff', fontWeight: 500,
        }}>
          话题：【转人工】
        </div>
        <div style={{ fontSize: 12, color: '#646a73', marginBottom: 8 }}>
          已 <span className="at-mention" style={{ fontSize: 12 }}>@李BP</span> 并带入近期对话记录，请在话题中继续沟通。
        </div>
        <div style={{ fontSize: 11, color: '#8f959e', marginBottom: 4 }}>
          参与人：张店长、李BP、茶小链
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none', border: 'none', color: '#3370ff',
            fontSize: 12, cursor: 'pointer', padding: 0, marginTop: 4,
          }}
        >
          {expanded ? '收起对话记录 ▲' : '查看对话记录 ▼'}
        </button>
        {expanded && (
          <div style={{
            background: '#f5f7fa', borderRadius: 6, padding: '8px 10px',
            marginTop: 8, fontSize: 12, lineHeight: '18px',
          }}>
            {historyRounds.map((r, i) => (
              <div key={i} style={{ marginBottom: i < historyRounds.length - 1 ? 8 : 0 }}>
                <div style={{ color: '#8f959e', fontSize: 11, marginBottom: 2 }}>【第{r.round}轮】</div>
                <div><span style={{ color: '#8B5CF6', fontWeight: 500 }}>店长：</span>{r.user}</div>
                <div><span style={{ color: '#C41E3A', fontWeight: 500 }}>茶小链：</span>{r.bot}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== 转人工方式3：私聊拉群 =====
function TransferGroupCard() {
  return (
    <div className="card" style={{ maxWidth: 300 }}>
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>👥</span>
        <h3 style={{ margin: 0, fontSize: 14 }}>已创建专属服务群</h3>
      </div>
      <div className="card-body" style={{ padding: '10px 14px' }}>
        <div style={{
          background: '#f0f5ff', borderRadius: 6, padding: '8px 10px',
          marginBottom: 8, fontSize: 13, color: '#3370ff', fontWeight: 500,
        }}>
          群名：张店长-李BP-茶小链
        </div>
        <div style={{ fontSize: 12, color: '#646a73', marginBottom: 6 }}>
          群成员：张店长、李BP、茶小链
        </div>
        <div style={{ fontSize: 12, color: '#646a73', marginBottom: 8 }}>
          已将近期对话记录发送至群内，<span className="at-mention" style={{ fontSize: 12 }}>@李BP</span> 将尽快回复您。
        </div>
        <div style={{
          background: '#f5f7fa', borderRadius: 6, padding: '8px 10px',
          fontSize: 12, lineHeight: '18px',
        }}>
          <div style={{ marginBottom: 6 }}>
            <div style={{ color: '#8f959e', fontSize: 11, marginBottom: 2 }}>【第1轮】</div>
            <div><span style={{ color: '#8B5CF6', fontWeight: 500 }}>店长：</span>今天月亮湾店鲜奶到了吗？</div>
            <div><span style={{ color: '#C41E3A', fontWeight: 500 }}>茶小链：</span>已为您查询，鲜奶订单状态为"已发货"，预计今天下午到达。</div>
          </div>
          <div style={{ marginBottom: 6 }}>
            <div style={{ color: '#8f959e', fontSize: 11, marginBottom: 2 }}>【第2轮】</div>
            <div><span style={{ color: '#8B5CF6', fontWeight: 500 }}>店长：</span>司机电话多少？</div>
            <div><span style={{ color: '#C41E3A', fontWeight: 500 }}>茶小链：</span>配送司机王师傅，电话 138****5678。</div>
          </div>
          <div>
            <div style={{ color: '#8f959e', fontSize: 11, marginBottom: 2 }}>【第3轮】</div>
            <div><span style={{ color: '#8B5CF6', fontWeight: 500 }}>店长：</span>我好像下错单了，能帮我处理一下吗</div>
            <div><span style={{ color: '#C41E3A', fontWeight: 500 }}>茶小链：</span>实在抱歉，我们紧急处理，正在为您转接对应BP人工服务</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 工单卡片 =====
function WorkOrderCard() {
  return (
    <div className="card">
      <div className="card-header">
        <h3>📋 提交工单</h3>
      </div>
      <div className="card-body">
        <p style={{ fontSize: 13, lineHeight: '20px', color: '#1f2329' }}>
          请点击以下链接提交工单：
        </p>
        <a href="#" className="value phone" style={{ fontSize: 13, display: 'inline-block', marginTop: 4 }}>
          工单填写页面 →
        </a>
      </div>
    </div>
  );
}

// ===== 投诉反馈卡片 =====
function ComplaintCard({ description }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>📝 投诉反馈</h3>
        <span className="tag" style={{ background: '#fff5f5', color: '#ff3b30' }}>待处理</span>
      </div>
      <div className="card-body">
        <p style={{ fontSize: 13, lineHeight: '20px', color: '#1f2329' }}>
          已记录您的问题：{description || '今天到货少了两箱鲜奶'}。
          {'\n'}建议处理方式：补发或退款。
          {'\n'}如需进一步协助，请输入「转人工」。
        </p>
      </div>
    </div>
  );
}

// ===== 投诉/举报 → 直接转人工卡片 =====
function ComplaintTransferCard() {
  return (
    <div className="card">
      <div className="card-header" style={{ background: '#fff5f5' }}>
        <h3>⚠️ 投诉/举报处理</h3>
        <span className="tag" style={{ background: '#fff0f0', color: '#ff3b30' }}>转人工</span>
      </div>
      <div className="card-body">
        <p style={{ fontSize: 13, lineHeight: '20px', color: '#1f2329', marginBottom: 8 }}>
          收到您的投诉反馈，此类问题需要人工客服介入处理。已在群里 @BP：
        </p>
        <div style={{
          padding: '10px 12px',
          background: '#f0f9ff',
          borderRadius: 6,
          border: '1px solid #bae0ff',
          marginBottom: 8,
        }}>
          <div style={{ fontSize: 13, color: '#1f2329', lineHeight: 1.8 }}>
            <span style={{ color: '#3370ff', fontWeight: 500 }}>@李BP</span> 月亮湾店有投诉/举报需要处理，请协助跟进，谢谢🙏
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#8f959e' }}>
          BP 将在群内协助您处理投诉/举报事宜，包括核实情况、协调供应商及后续跟进。
        </p>
      </div>
    </div>
  );
}
