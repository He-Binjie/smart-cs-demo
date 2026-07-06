import { useState, useEffect, useRef } from 'react';
import ChatInterface, { DEMO_SCENARIOS } from './components/ChatInterface';
import PrivateChat from './components/PrivateChat';
import OrderList from './components/OrderList';
import TopicView from './components/TopicView';

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
  const [selectedMainOrderId, setSelectedMainOrderId] = useState(null);
  const [containerScale, setContainerScale] = useState(1);
  const [phoneCall, setPhoneCall] = useState(null); // { name, phone }
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

  const handleViewOrderList = () => { setSelectedMainOrderId(null); setView('orderList'); };
  const handleViewMainOrder = (mainOrderId) => { setSelectedMainOrderId(mainOrderId); setView('orderList'); };
  const handleBack = () => setView('chat');
  const handleCall = (name, phone) => setPhoneCall({ name, phone });
  const handleCloseCall = () => setPhoneCall(null);
  const handleOpenPrivateChat = () => setView('privateChat');
  const handleBackFromPrivateChat = () => setView('chat');
  const handleOpenTopic = () => setView('topic');
  const handleBackFromTopic = () => setView('chat');

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
              ⚠️ 仅 @触发 + 欢迎语<br/>
              ⚠️ 纯文字交互（无图片/语音）
            </div>
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
                <ChatInterface ref={chatRef} onViewOrderList={handleViewOrderList} onViewMainOrder={handleViewMainOrder} onCall={handleCall} onOpenPrivateChat={handleOpenPrivateChat} onOpenTopic={handleOpenTopic} />
              )}
              {view === 'privateChat' && (
                <div className="page-slide-in h-full">
                  <PrivateChat ref={privateChatRef} onBack={handleBackFromPrivateChat} onViewOrderList={handleViewOrderList} onViewMainOrder={handleViewMainOrder} onCall={handleCall} onOpenTopic={handleOpenTopic} />
                </div>
              )}
              {view === 'orderList' && (
                <div className="page-slide-in h-full">
                  <OrderList onBack={handleBack} selectedMainOrderId={selectedMainOrderId} onCall={handleCall} />
                </div>
              )}
              {view === 'topic' && (
                <div className="page-slide-in h-full">
                  <TopicView onBack={handleBackFromTopic} />
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
              实际交互：飞书群中 <span style={{ color: '#60a5fa' }}>@茶小链</span> + 输入问题文字。
            </div>
          </div>

          {/* Scenario buttons */}
          <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>
              🎬 场景演示
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DEMO_SCENARIOS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => chatRef.current?.handleScenario(s)}
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
        </div>
      </div>
    </div>
  );
}
