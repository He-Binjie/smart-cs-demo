import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import ChatBubble from './ChatBubble';
import { matchFAQ, logisticsData, humanAgents, faqData } from '../data/mockFAQ';
import { mockStores } from '../data/mockOrders';

// ===== 茶小链 Bot Avatar =====
function BotAvatar({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pvtBotBg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B1A1A" />
          <stop offset="100%" stopColor="#C41E3A" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#pvtBotBg)" />
      <ellipse cx="16" cy="17.5" rx="9.5" ry="9" fill="#FFF8E7" />
      <circle cx="12.5" cy="16.5" r="1.6" fill="#2D2D2D" />
      <circle cx="19.5" cy="16.5" r="1.6" fill="#2D2D2D" />
      <circle cx="13.1" cy="15.8" r="0.55" fill="white" />
      <circle cx="20.1" cy="15.8" r="0.55" fill="white" />
      <path d="M13.5 20 Q16 22.5 18.5 20" stroke="#2D2D2D" strokeWidth="1" fill="none" strokeLinecap="round" />
      <ellipse cx="9.5" cy="19" rx="2.2" ry="1.3" fill="#FFB6C1" opacity="0.55" />
      <ellipse cx="22.5" cy="19" rx="2.2" ry="1.3" fill="#FFB6C1" opacity="0.55" />
      <path d="M16 5.5 Q18.5 8 16 11.5 Q13.5 8 16 5.5Z" fill="#4CAF50" />
      <path d="M16 6 Q17.2 8 16 10.5" stroke="#2E7D32" strokeWidth="0.5" fill="none" />
      <line x1="16" y1="11.5" x2="16" y2="13" stroke="#2E7D32" strokeWidth="0.7" />
    </svg>
  );
}

const BOT = { name: '茶小链', avatar: 'bot', color: '#C41E3A' };
const USER = { name: '张店长（月亮湾店）', avatar: '张', color: '#8B5CF6' };

const PVT_WELCOME = '你好！我是茶小链，您的供应链智能助手。\n\n我可以帮您：\n📦 查询物流配送信息\n📋 查询订单状态\n❓ 解答供应链常见问题\n👤 转接人工客服\n🎫 提交工单\n\n请直接输入您的问题。';

export default forwardRef(function PrivateChat({ onBack, onViewOrderList, onViewMainOrder, onCall, onOpenGroupChat }, ref) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const nextId = useRef(10);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addMessage = (msg) => {
    setMessages(prev => [...prev, { ...msg, id: nextId.current++ }]);
  };

  const handleSelectStore = (storeId) => {
    const store = mockStores.find(s => s.storeId === storeId);
    if (!store) return;
    addMessage({ type: 'user', user: USER, text: `查看${store.storeName}的订单`, time: getTime() });
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ type: 'bot', user: BOT, cardType: 'order', storeId, time: getTime() });
    }, 600);
  };

  const simulateBotReply = (userText, scenarioType) => {
    setIsTyping(true);
    const delay = 800 + Math.random() * 600;
    setTimeout(() => {
      setIsTyping(false);
      const text = userText;

      if (/人工|真人|客服|态度.*不好|找个人|解决不了|处理一下|不满意|投诉.*态度/.test(text)) {
        addMessage({ type: 'bot', user: BOT, text: '实在抱歉，我们紧急处理，正在为您转接对应BP人工服务', time: getTime() });
        setTimeout(() => {
          onOpenGroupChat && onOpenGroupChat();
        }, 800);
        return;
      }
      if (/工单|提交工单/.test(text)) {
        addMessage({ type: 'bot', user: BOT, cardType: 'workorder', time: getTime() });
        return;
      }
      if (/投诉|举报|少了|漏了|漏发|少发|破损|差评|数量不对|没到齐/.test(text)) {
        addMessage({ type: 'bot', user: BOT, cardType: 'complaint-transfer', time: getTime() });
        return;
      }
      if (/订单|查订单|订货/.test(text)) {
        if (scenarioType === 'single') {
          const singleStore = mockStores.find(s => s.storeId === '317336068380740992');
          addMessage({ type: 'bot', user: BOT, text: `您绑定了1家门店「${singleStore.storeName}」，直接为您查询近7天未完成订单。`, time: getTime() });
          setTimeout(() => {
            addMessage({ type: 'bot', user: BOT, cardType: 'order', storeId: '317336068380740992', time: getTime() });
          }, 400);
        } else {
          const multiStores = mockStores.filter(s => s.storeId !== '317336068380740992');
          addMessage({ type: 'bot', user: BOT, text: '您绑定了3家门店，请选择要查询的门店：', time: getTime() });
          setTimeout(() => {
            addMessage({ type: 'bot', user: BOT, cardType: 'store-select', stores: multiStores, time: getTime() });
          }, 400);
        }
        return;
      }
      if (/司机|电话|配送|物流|到哪|追踪|货.*到|到.*货/.test(text)) {
        addMessage({ type: 'bot', user: BOT, cardType: 'logistics', time: getTime() });
        return;
      }
      const faq = matchFAQ(text);
      if (faq) {
        addMessage({ type: 'bot', user: BOT, cardType: 'faq', faqData: faq, time: getTime() });
        return;
      }
      if (/下单.*到|几点.*到|能到吗|什么时候.*到/.test(text)) {
        const deliveryFaq = faqData.find(f => f.question.includes('配送时间'));
        if (deliveryFaq) {
          addMessage({ type: 'bot', user: BOT, cardType: 'faq', faqData: deliveryFaq, time: getTime() });
          return;
        }
      }
      if (/货|到/.test(text)) {
        addMessage({ type: 'bot', user: BOT, cardType: 'logistics', time: getTime() });
        return;
      }
      addMessage({
        type: 'bot', user: BOT, time: getTime(),
        text: '抱歉，暂时没有找到相关答案，您可以尝试换个方式描述，或输入「转人工」联系BP。',
      });
    }, delay);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    addMessage({ type: 'user', user: USER, text, time: getTime() });
    setInput('');
    simulateBotReply(text);
  };

  const handleScenario = (scenario) => {
    addMessage({ type: 'user', user: USER, text: scenario.text, time: getTime() });
    simulateBotReply(scenario.text, scenario.scenario);
  };

  useImperativeHandle(ref, () => ({ handleScenario }));

  const renderMessage = (msg) => {
    if (msg.type === 'bot' && msg.cardType === 'welcome') {
      return (
        <div key={msg.id} className="message-row bot animate-slideUp">
          <div className="avatar bot"><BotAvatar /></div>
          <div className="message-content">
            <span className="message-name">{msg.user.name}</span>
            <div className="bubble">
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        </div>
      );
    }
    if (msg.type === 'bot') {
      const botMsg = { ...msg, user: { ...msg.user, avatar: <BotAvatar /> } };
      return (
        <ChatBubble key={msg.id} msg={botMsg}
          onViewOrderList={onViewOrderList} onViewMainOrder={onViewMainOrder}
          onCall={onCall} onSelectStore={handleSelectStore} />
      );
    }
    return (
      <ChatBubble key={msg.id} msg={msg}
        onViewOrderList={onViewOrderList} onViewMainOrder={onViewMainOrder}
        onCall={onCall} onSelectStore={handleSelectStore} />
    );
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#f5f6f7' }}>
      {/* 私聊顶部导航 */}
      <div className="chat-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div onClick={onBack} style={{ cursor: 'pointer', padding: '4px 8px 4px 0', display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f2329" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>
        <div className="header-avatar">
          <BotAvatar />
        </div>
        <div className="header-info" style={{ flex: 1 }}>
          <h1 style={{ fontSize: 16 }}>茶小链</h1>
          <p style={{ fontSize: 11, color: '#8f959e' }}>供应链智能客服 · 在线</p>
        </div>
      </div>

      {/* 私聊标识 */}
      <div style={{
        textAlign: 'center', padding: '8px 0 4px',
        fontSize: 11, color: '#8f959e',
      }}>
        —— 私聊对话 ——
      </div>

      {/* 聊天消息区 */}
      <div ref={scrollRef} className="chat-area">
        {messages.map(renderMessage)}
        {isTyping && (
          <div className="message-row bot animate-fadeIn">
            <div className="avatar bot"><BotAvatar /></div>
            <div className="message-content">
              <div className="bubble typing-bubble">
                <span className="typing-dot" style={{ animationDelay: '0s' }} />
                <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
                <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 悬浮快捷菜单 */}
      <div style={{
        display: 'flex', gap: 8, padding: '8px 16px',
        background: '#fff',
        borderTop: '1px solid #f0f1f3',
      }}>
        <button
          onClick={() => {
            addMessage({ type: 'user', user: USER, text: '查物流', time: getTime() });
            setTimeout(() => {
              addMessage({ type: 'bot', user: BOT, cardType: 'logistics', time: getTime() });
            }, 400);
          }}
          style={{
            flex: 1, padding: '8px 0',
            background: '#f5f7fa',
            border: '1px solid #e5e6e8',
            borderRadius: 8,
            fontSize: 13, fontWeight: 500,
            color: '#1f2329',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e8ecf3'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f5f7fa'; }}
        >
          <span>🚚</span> 查物流
        </button>
        <button
          onClick={() => {
            onViewOrderList && onViewOrderList();
          }}
          style={{
            flex: 1, padding: '8px 0',
            background: '#f5f7fa',
            border: '1px solid #e5e6e8',
            borderRadius: 8,
            fontSize: 13, fontWeight: 500,
            color: '#1f2329',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e8ecf3'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f5f7fa'; }}
        >
          <span>📦</span> 查订单
        </button>
      </div>

      {/* 底部输入区 */}
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="输入您的问题..."
        />
        <button onClick={handleSend} disabled={!input.trim()}>发送</button>
      </div>
    </div>
  );
});

function getTime() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}
