import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import ChatBubble from './ChatBubble';
import { matchFAQ, logisticsData, humanAgents, faqData } from '../data/mockFAQ';
import { mockStores } from '../data/mockOrders';

// ===== 茶小链 Bot Avatar (霸王茶姬 brand style) =====
function BotAvatar() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="botBgGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B1A1A" />
          <stop offset="100%" stopColor="#C41E3A" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#botBgGrad)" />
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

// ===== Identity constants =====
const BOT = { name: '茶小链', avatar: 'bot', color: '#C41E3A' };
const USER = { name: '张店长（月亮湾店）', avatar: '张', color: '#8B5CF6' };
const OTHER = { name: '李BP', avatar: '李', color: '#10B981' };

// ===== Demo scenarios (7 items) =====
export const DEMO_SCENARIOS = [
  { label: '🚚 货到哪了', text: '今天的货什么时候到 司机电话多少' },
  { label: '📦 查订单(多店)', text: '查一下我的订单', scenario: 'multi' },
  { label: '📦 查订单(单店)', text: '查一下我的订单', scenario: 'single' },
  { label: '❓ 问FAQ', text: '下午四点以后下单今天能到吗' },
  { label: '👤 转人工', text: '转人工' },
  { label: '🎫 转工单', text: '帮我提交工单' },
  { label: '📝 投诉举报', text: '我要投诉 今天到货少了两箱鲜奶 举报供应商' },
];

// ===== Welcome message text =====
const WELCOME_TEXT = '大家好，我是茶小链，已加入本群。我可以帮您：\n📦 查询物流配送信息\n📋 查询订单状态\n❓ 解答供应链常见问题\n👤 转接人工客服\n🎫 提交工单\n\n有任何问题随时 @我 即可。';

export default forwardRef(function ChatInterface({ onViewOrderList, onViewMainOrder, onCall }, ref) {
  const [messages, setMessages] = useState([
    { id: 1, type: 'system', text: '「茶小链」已加入群聊' },
    { id: 2, type: 'bot', user: BOT, cardType: 'welcome', text: WELCOME_TEXT, time: '09:10' },
    { id: 3, type: 'other', user: { name: '王承运商', avatar: '王', color: '#F59E0B' }, text: '今天月亮湾店的货已经装车了，预计下午2点到', time: '09:12' },
    { id: 4, type: 'user', user: USER, text: '好的，收到', time: '09:15' },
    { id: 5, type: 'other', user: OTHER, text: '@王承运商 德力新天地店那边也是今天下午送吗？', time: '09:18' },
    { id: 6, type: 'other', user: { name: '王承运商', avatar: '王', color: '#F59E0B' }, text: '是的，一起送，大概3点左右到', time: '09:20' },
    { id: 7, type: 'other', user: { name: '周店长', avatar: '周', color: '#EC4899' }, text: '我这边永旺梦乐城店的鲜奶好像少了一箱，能帮忙确认下吗？', time: '09:25' },
    { id: 8, type: 'other', user: OTHER, text: '@周店长 我让仓库查一下，稍等', time: '09:28' },
    { id: 9, type: 'user', user: USER, text: '今天月亮湾店鲜奶到了吗？', time: '09:30' },
    { id: 10, type: 'other', user: { name: '王承运商', avatar: '王', color: '#F59E0B' }, text: '到了，刚签收', time: '09:32' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const nextId = useRef(5);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addMessage = (msg) => {
    setMessages(prev => [...prev, { ...msg, id: nextId.current++ }]);
  };

  // 选店后展示该门店的订单
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

      // 1. 转人工
      if (/人工|真人|客服/.test(text)) {
        addMessage({ type: 'bot', user: BOT, cardType: 'transfer', time: getTime() });
        return;
      }

      // 2. 转工单
      if (/工单|提交工单/.test(text)) {
        addMessage({ type: 'bot', user: BOT, cardType: 'workorder', time: getTime() });
        return;
      }

      // 3. 投诉/举报/少货 → 直接转人工
      if (/投诉|举报|少了|漏了|漏发|少发|破损|差评|数量不对|没到齐/.test(text)) {
        addMessage({ type: 'bot', user: BOT, cardType: 'complaint-transfer', time: getTime() });
        return;
      }

      // 4. 订单查询 → 根据场景分流
      if (/订单|查订单|订货/.test(text)) {
        if (scenarioType === 'single') {
          // 单店：跳过选店，直接展示该店订单
          const singleStore = mockStores.find(s => s.storeId === '317336068380740992');
          addMessage({ type: 'bot', user: BOT, text: `您绑定了1家门店「${singleStore.storeName}」，直接为您查询近7天未完成订单。`, time: getTime() });
          setTimeout(() => {
            addMessage({ type: 'bot', user: BOT, cardType: 'order', storeId: '317336068380740992', time: getTime() });
          }, 400);
        } else {
          // 多店：展示选店卡片（仅展示多店的3个南通门店）
          const multiStores = mockStores.filter(s => s.storeId !== '317336068380740992');
          addMessage({ type: 'bot', user: BOT, text: '您绑定了3家门店，请选择要查询的门店：', time: getTime() });
          setTimeout(() => {
            addMessage({ type: 'bot', user: BOT, cardType: 'store-select', stores: multiStores, time: getTime() });
          }, 400);
        }
        return;
      }

      // 5. 物流 (specific keywords - check before FAQ)
      if (/司机|电话|配送|物流|到哪|追踪|货.*到|到.*货/.test(text)) {
        addMessage({ type: 'bot', user: BOT, cardType: 'logistics', time: getTime() });
        return;
      }

      // 6. FAQ匹配
      const faq = matchFAQ(text);
      if (faq) {
        addMessage({ type: 'bot', user: BOT, cardType: 'faq', faqData: faq, time: getTime() });
        return;
      }

      // 7. Extended FAQ check
      if (/下单.*到|几点.*到|能到吗|什么时候.*到/.test(text)) {
        const deliveryFaq = faqData.find(f => f.question.includes('配送时间'));
        if (deliveryFaq) {
          addMessage({ type: 'bot', user: BOT, cardType: 'faq', faqData: deliveryFaq, time: getTime() });
          return;
        }
      }

      // 8. 物流 (broader keywords)
      if (/货|到/.test(text)) {
        addMessage({ type: 'bot', user: BOT, cardType: 'logistics', time: getTime() });
        return;
      }

      // 9. 兜底回复
      addMessage({
        type: 'bot',
        user: BOT,
        time: getTime(),
        text: '抱歉，暂时没有找到相关答案，您可以尝试换个方式描述，或输入「转人工」联系BP。',
      });
    }, delay);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    addMessage({ type: 'user', user: USER, text: `@茶小链 ${text}`, time: getTime() });
    setInput('');
    simulateBotReply(text);
  };

  const handleScenario = (scenario) => {
    addMessage({ type: 'user', user: USER, text: `@茶小链 ${scenario.text}`, time: getTime() });
    simulateBotReply(scenario.text, scenario.scenario);
  };

  useImperativeHandle(ref, () => ({
    handleScenario,
  }));

  const getTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderMessage = (msg) => {
    if (msg.type === 'system') {
      return (
        <div key={msg.id} className="text-center">
          <span className="system-msg">{msg.text}</span>
        </div>
      );
    }

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
        <ChatBubble
          key={msg.id}
          msg={botMsg}
          onViewOrderList={onViewOrderList}
          onViewMainOrder={onViewMainOrder}
          onCall={onCall}
          onSelectStore={handleSelectStore}
        />
      );
    }

    return (
      <ChatBubble
        key={msg.id}
        msg={msg}
        onViewOrderList={onViewOrderList}
        onViewMainOrder={onViewMainOrder}
        onCall={onCall}
        onSelectStore={handleSelectStore}
      />
    );
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#f5f6f7' }}>
      {/* 顶部导航栏 - 对齐HTML原型 */}
      <div className="chat-header">
        <div className="header-avatar">
          <BotAvatar />
        </div>
        <div className="header-info">
          <h1>霸王茶姬-供应链服务群</h1>
          <p>5人 · 供应链BP、承运商、门店店长</p>
        </div>
      </div>

      {/* 聊天消息区 */}
      <div ref={scrollRef} className="chat-area">
        <div className="time-divider">—— 今天 09:10 ——</div>
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

      {/* 底部输入区 - 对齐HTML原型 */}
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="@茶小链 输入您的问题..."
        />
        <button onClick={handleSend} disabled={!input.trim()}>发送</button>
      </div>
    </div>
  );
});
