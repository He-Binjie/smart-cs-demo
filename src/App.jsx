import { useState, useEffect, useRef } from 'react';
import ChatInterface from './components/ChatInterface';
import PrivateChat, { DEMO_SCENARIOS } from './components/PrivateChat';
import OrderList from './components/OrderList';
import TopicView from './components/TopicView';
import GroupChatView from './components/GroupChatView';

// 群聊入口演示场景（@机器人 → 引导卡片 → 点击跳转私聊）
const GROUP_SCENARIOS = [
  { label: '🚚 群里问物流', text: '今天的货什么时候到 司机电话多少' },
  { label: '📦 群里查订单', text: '查一下我的订单' },
  { label: '❓ 群里问FAQ', text: '下午四点以后下单今天能到吗' },
  { label: '👤 群里要转人工', text: '这个问题你解决不了，帮我找个人处理' },
];

// ===== Phone Call Simulation Overlay =====
function PhoneCallOverlay({ name, phone, onClose }) {
  const [phase, setPhase] = useState('sheet'); // sheet → calling → connected → ended
  const [seconds, setSeconds] = useState(0);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Animate sheet in on mount
  useEffect(() => {
    requestAnimationFrame(() => setSheetVisible(true));
  }, []);

  useEffect(() => {
    if (phase !== 'calling') return;
    const connectTimer = setTimeout(() => setPhase('connected'), 2000);
    return () => clearTimeout(connectTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'connected') return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleDial = () => setPhase('calling');

  const handleHangUp = () => {
    setPhase('ended');
    setTimeout(onClose, 800);
  };

  const handleCloseSheet = () => {
    setSheetVisible(false);
    setTimeout(onClose, 300);
  };

  // Phase: iOS dialing screen
  if (phase === 'calling' || phase === 'connected' || phase === 'ended') {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, #1c1c1e 0%, #2c2c2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '60px 24px 40px',
        zIndex: 110,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 28,
          }}>📞</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{name}</div>
          <div style={{ fontSize: 15, color: '#98989d', marginBottom: 8 }}>{phone}</div>
          <div style={{ fontSize: 14, color: phase === 'calling' ? '#f5a623' : phase === 'connected' ? '#4CAF50' : '#ff3b30' }}>
            {phase === 'calling' ? '呼叫中...' : phase === 'connected' ? formatTime(seconds) : '通话已结束'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={handleHangUp} style={{
            width: 64, height: 64, borderRadius: '50%', background: '#ff3b30',
            border: 'none', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto',
            boxShadow: '0 4px 12px rgba(255,59,48,0.4)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.18-.29-.43-.29-.71 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.51-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
            </svg>
          </button>
          <div style={{ fontSize: 12, color: '#98989d', marginTop: 8 }}>
            {phase === 'ended' ? '点击任意处关闭' : '挂断'}
          </div>
          {phase === 'ended' && (
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} />
          )}
        </div>
      </div>
    );
  }

  // Phase: bottom sheet
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleCloseSheet}
        style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: sheetVisible ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
          transition: 'background 0.3s ease',
        }}
      />
      {/* Sheet */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 101,
        background: '#fff',
        borderRadius: '16px 16px 0 0',
        padding: '20px 24px 34px',
        transform: sheetVisible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
      }}>
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, background: '#d1d5db', borderRadius: 2, margin: '0 auto 16px' }} />

        {/* Contact info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>📞</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2329' }}>{name}</div>
            <div style={{ fontSize: 13, color: '#8f959e' }}>配送司机</div>
          </div>
        </div>

        {/* Phone number - clickable to dial */}
        <div
          onClick={handleDial}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 0',
            background: '#f0f9ff',
            borderRadius: 12,
            border: '1px solid #bae0ff',
            cursor: 'pointer',
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 18 }}>📱</span>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#3370ff', letterSpacing: 1 }}>{phone}</span>
        </div>

        {/* Cancel button */}
        <div
          onClick={handleCloseSheet}
          style={{
            textAlign: 'center', padding: '10px 0',
            fontSize: 14, color: '#8f959e', cursor: 'pointer',
          }}
        >
          取消
        </div>
      </div>
    </>
  );
}

// ===== iOS Status Bar =====
function StatusBar() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(`${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      height: 44,
      background: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 24px',
      fontSize: 14,
      fontWeight: 600,
      color: '#1f2329',
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
    }}>
      <span>{time}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {/* Signal */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="#1f2329">
          <rect x="0" y="8" width="3" height="4" rx="0.5"/>
          <rect x="4.5" y="5" width="3" height="7" rx="0.5"/>
          <rect x="9" y="2" width="3" height="10" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" opacity="0.3"/>
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="#1f2329" strokeWidth="1.5">
          <path d="M1 4.5C3.5 1.5 6.5 0 8 0s4.5 1.5 7 4.5" strokeLinecap="round"/>
          <path d="M3.5 7C5.2 5.2 6.5 4.5 8 4.5s2.8.7 4.5 2.5" strokeLinecap="round"/>
          <circle cx="8" cy="10" r="1.5" fill="#1f2329" stroke="none"/>
        </svg>
        {/* Battery */}
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="#1f2329" strokeWidth="1"/>
          <rect x="2" y="2" width="18" height="8" rx="1.5" fill="#1f2329"/>
          <path d="M24 4v4a2 2 0 0 0 0-4z" fill="#1f2329" opacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

// ===== Home Indicator =====
function HomeIndicator() {
  return (
    <div style={{
      height: 34,
      background: '#fff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    }}>
      <div style={{
        width: 134,
        height: 5,
        background: '#1f2329',
        borderRadius: 3,
      }} />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('chat');
  const [showNewFeature, setShowNewFeature] = useState(false); // 订单维度智能转人工 -功能预览
  const [selectedMainOrderId, setSelectedMainOrderId] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [containerScale, setContainerScale] = useState(1);
  const [phoneCall, setPhoneCall] = useState(null); // { name, phone }
  const [pendingQuery, setPendingQuery] = useState(null); // { text, scenarioType }
  const [groupChatContext, setGroupChatContext] = useState(null); // { complaintType } or null for transfer
  const [orderTransferContext, setOrderTransferContext] = useState(null); // { sub, deliveryType } for order-level transfer
  const containerRef = useRef(null);
  const chatRef = useRef(null);
  const privateChatRef = useRef(null);

  useEffect(() => {
    function calcScale() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const phoneW = 390 + 24;
      const phoneH = 844 + 24;
      const totalW = phoneW + 180 + 180 + 32 + 32; // phone + 2 panels + gaps
      const scaleX = (vw - 32) / totalW;
      const scaleY = (vh - 32) / phoneH;
      setContainerScale(Math.min(scaleX, scaleY, 1));
    }
    calcScale();
    window.addEventListener('resize', calcScale);
    return () => window.removeEventListener('resize', calcScale);
  }, []);

  const handleViewOrderList = (storeId) => { setSelectedMainOrderId(null); if (storeId) setSelectedStoreId(storeId); setView('orderList'); };
  const handleViewMainOrder = (mainOrderId, storeId) => { setSelectedMainOrderId(mainOrderId); if (storeId) setSelectedStoreId(storeId); setView('orderList'); };
  const handleBack = () => setView('chat');
  const handleCall = (name, phone) => setPhoneCall({ name, phone });
  const handleCloseCall = () => setPhoneCall(null);
  const handleOpenPrivateChat = () => setView('privateChat');
  const handleGroupScenario = (scenario) => {
    // 切到群聊页面，再触发群聊场景
    setView('chat');
    setTimeout(() => {
      chatRef.current?.handleScenario(scenario);
    }, 100);
  };
  const handleScenarioFromPanel = (scenario) => {
    // 先切到私聊页面，再触发场景
    setView('privateChat');
    // 用 setTimeout 确保页面渲染后再调用
    setTimeout(() => {
      privateChatRef.current?.handleScenario(scenario);
    }, 100);
  };
  const handleRedirectToPrivateChat = (text, scenarioType) => {
    setPendingQuery({ text, scenarioType, timestamp: Date.now() });
    setView('privateChat');
  };
  const handleBackFromPrivateChat = () => setView('chat');
  const handleOpenTopic = () => setView('topic');
  const handleBackFromTopic = () => setView('chat');
  const handleOpenGroupChat = (complaintType) => { setGroupChatContext(complaintType ? { complaintType } : null); setOrderTransferContext(null); setView('groupChat'); };
  const handleOrderTransfer = (sub) => {
    const deliveryType = sub.isDirectDelivery ? '直配' : '仓配';
    setOrderTransferContext({ sub, deliveryType });
    setGroupChatContext(null);
    setView('groupChat');
  };
  const handleBackFromGroupChat = () => { setOrderTransferContext(null); setView('orderList'); };

  return (
    <div className="h-full w-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      <div
        ref={containerRef}
        style={{ transform: `scale(${containerScale})`, transformOrigin: 'center center', display: 'flex', alignItems: 'center', gap: '32px' }}
      >
        {/* Left annotation */}
        <div style={{
          width: 180,
          padding: '20px 16px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
            📋 0.5期功能范围
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.8 }}>
            <div style={{ marginBottom: 8 }}>✅ 物流查询 + 司机联系方式</div>
            <div style={{ marginBottom: 8 }}>✅ 订单状态查询</div>
            <div style={{ marginBottom: 8 }}>✅ FAQ 常见问题解答</div>
            <div style={{ marginBottom: 8 }}>✅ 转人工 / 转工单</div>
            <div style={{ marginBottom: 8 }}>✅ 投诉举报 → 转人工</div>
            <div style={{ color: '#64748b', marginTop: 12, fontSize: 11 }}>
              ⚠️ 群聊@→引导去私聊<br/>
              ⚠️ 所有功能在私聊完成<br/>
              ⚠️ 纯文字交互（无图片/语音）
            </div>
          </div>
        </div>

        {/* 新功能预览 Toggle */}
        <div style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>
            🔮 新功能预览
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8, lineHeight: 1.5 }}>
            订单维度智能转人工
          </div>
          <div
            onClick={() => setShowNewFeature(!showNewFeature)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              background: showNewFeature ? '#3370ff' : 'rgba(255,255,255,0.15)',
              position: 'relative',
              transition: 'background 0.2s',
            }}>
              <div style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: 2,
                left: showNewFeature ? 18 : 2,
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
            <span style={{ fontSize: 11, color: showNewFeature ? '#93c5fd' : '#64748b' }}>
              {showNewFeature ? '已开启' : '已关闭'}
            </span>
          </div>
        </div>

        {/* Phone */}
        <div className="phone-frame" style={{ width: 390 + 24, height: 844 + 24 }}>
          {/* 侧边按键 */}
          <div className="phone-btn-left" style={{ top: 140, height: 32 }} />
          <div className="phone-btn-left" style={{ top: 200, height: 56 }} />
          <div className="phone-btn-left" style={{ top: 270, height: 56 }} />
          <div className="phone-btn-right" style={{ top: 200, height: 80 }} />

          <div className="phone-screen" style={{ width: 390, height: 844, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* iOS Status Bar */}
            <StatusBar />

            {/* Main Content */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {view === 'chat' && (
                <ChatInterface ref={chatRef} onViewOrderList={handleViewOrderList} onViewMainOrder={handleViewMainOrder} onCall={handleCall} onOpenPrivateChat={handleOpenPrivateChat} onOpenTopic={handleOpenTopic} onRedirectToPrivateChat={handleRedirectToPrivateChat} />
              )}
              {view === 'privateChat' && (
                <div className="page-slide-in h-full">
                  <PrivateChat ref={privateChatRef} onBack={handleBackFromPrivateChat} onViewOrderList={handleViewOrderList} onViewMainOrder={handleViewMainOrder} onCall={handleCall} onOpenGroupChat={handleOpenGroupChat} pendingQuery={pendingQuery} />
                </div>
              )}
              {view === 'orderList' && (
                <div className="page-slide-in h-full">
                  <OrderList onBack={handleBack} selectedMainOrderId={selectedMainOrderId} selectedStoreId={selectedStoreId} onCall={handleCall} showNewFeature={showNewFeature} onTransferToHuman={handleOrderTransfer} />
                </div>
              )}
              {view === 'topic' && (
                <div className="page-slide-in h-full">
                  <TopicView onBack={handleBackFromTopic} />
                </div>
              )}
              {view === 'groupChat' && (
                <div className="page-slide-in h-full">
                  <GroupChatView key={orderTransferContext ? `ot-${orderTransferContext.deliveryType}-${orderTransferContext.sub.subOrderId}` : `ct-${groupChatContext?.complaintType || 'default'}`} onBack={handleBackFromGroupChat} complaintType={groupChatContext?.complaintType} orderTransfer={orderTransferContext} />
                </div>
              )}
            </div>

            {/* Home Indicator */}
            <HomeIndicator />

            {/* Phone Call Overlay */}
            {phoneCall && (
              <PhoneCallOverlay
                name={phoneCall.name}
                phone={phoneCall.phone}
                onClose={handleCloseCall}
              />
            )}
          </div>
        </div>

        {/* Right annotation + scenario buttons */}
        <div style={{
          width: 180,
          padding: '20px 16px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
            💡 Demo 说明
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.8 }}>
            <div style={{ marginBottom: 10 }}>
              右侧场景按钮<span style={{ color: '#fbbf24', fontWeight: 500 }}>仅用于演示</span>，实际产品中不存在。
            </div>
            <div style={{ marginBottom: 10 }}>
              实际交互：飞书群中 <span style={{ color: '#60a5fa' }}>@茶小链</span> → 引导去私聊 → 私聊中查看回复。
            </div>
          </div>

          {/* Group Chat Scenarios */}
          <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
              🎬 群聊入口
            </div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 8 }}>
              @机器人 → 引导卡片 → 点击跳转私聊
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {GROUP_SCENARIOS.map((s, i) => (
                <button
                  key={`g-${i}`}
                  onClick={() => handleGroupScenario(s)}
                  style={{
                    padding: '6px 10px',
                    background: 'rgba(251,191,36,0.12)',
                    border: '1px solid rgba(251,191,36,0.3)',
                    borderRadius: 6,
                    color: '#fcd34d',
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,191,36,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,191,36,0.12)'; }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Private Chat Scenarios */}
          <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
              🎬 私聊入口
            </div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 8 }}>
              直接发送 → 机器人即时回复
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DEMO_SCENARIOS.map((s, i) => (
                <button
                  key={`p-${i}`}
                  onClick={() => handleScenarioFromPanel(s)}
                  style={{
                    padding: '6px 10px',
                    background: 'rgba(51,112,255,0.15)',
                    border: '1px solid rgba(51,112,255,0.3)',
                    borderRadius: 6,
                    color: '#93c5fd',
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(51,112,255,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(51,112,255,0.15)'; }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 新功能场景按钮 — 非0.5期 */}
          <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
              🔮 订单维度转人工
            </div>
            <div style={{ fontSize: 10, color: '#c084fc', marginBottom: 8, fontWeight: 500 }}>
              ⚠️ 非0.5期内容
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => {
                  setShowNewFeature(true);
                  setOrderTransferContext({
                    sub: { subOrderId: 'XSD-20260705-04451-001', status: '已发货', isDirectDelivery: false, products: [{ name: '茉莉雪芽', qty: 5, unit: '箱' }], storeName: '月亮湾店', deliveryMethod: '仓配' },
                    deliveryType: '仓配',
                  });
                  setGroupChatContext(null);
                  setView('groupChat');
                }}
                style={{
                  padding: '6px 10px',
                  background: 'rgba(168,85,247,0.12)',
                  border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: 6,
                  color: '#c084fc',
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.12)'; }}
              >
                📦 仓配订单 → 转3PL
              </button>
              <button
                onClick={() => {
                  setShowNewFeature(true);
                  setOrderTransferContext({
                    sub: { subOrderId: 'XSD-20260630-03293-001', status: '备货中', isDirectDelivery: true, products: [{ name: '定制杯材', qty: 200, unit: '个' }], storeName: '金茂大厦店', deliveryMethod: '直配' },
                    deliveryType: '直配',
                  });
                  setGroupChatContext(null);
                  setView('groupChat');
                }}
                style={{
                  padding: '6px 10px',
                  background: 'rgba(168,85,247,0.12)',
                  border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: 6,
                  color: '#c084fc',
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.12)'; }}
              >
                🚚 直配订单 → 转采购履约
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
