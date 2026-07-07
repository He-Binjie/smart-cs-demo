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
  { label: '🤷 FAQ未命中', text: '你们公司年会什么时候开', scenario: 'faq-miss' },
  { label: '👋 闲聊', text: '你好', scenario: 'chitchat' },
  { label: '👤 转人工方式1', text: '司机今天态度不太好，帮我找个人处理一下', scenario: 'transfer1' },
  { label: '👤 转人工方式1→确认', text: '转人工', scenario: 'transfer1-confirm' },
  { label: '👤 转人工方式2', text: '这个问题你解决不了，帮我转人工吧', scenario: 'transfer2' },
  { label: '🎫 转工单', text: '帮我提交工单' },
  { label: '📝 投诉举报', text: '我要投诉 今天到货少了两箱鲜奶 举报供应商' },
];

// ===== Welcome message text =====
const WELCOME_TEXT = '大家好，我是茶小链，已加入本群。我可以帮您：\n📦 查询物流配送信息\n📋 查询订单状态\n❓ 解答供应链常见问题\n👤 转接人工客服\n🎫 提交工单\n\n有任何问题随时 @我 即可。';

export default forwardRef(function ChatInterface({ onViewOrderList, onViewMainOrder, onCall, onOpenPrivateChat, onOpenTopic }, ref) {
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
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
      if (scenarioType === 'transfer1' || scenarioType === 'transfer1-confirm' || scenarioType === 'transfer2') {
        if (scenarioType === 'transfer1') {
          // 方式1第一步：先引导用户输入"转人工"，确认后才执行
          addMessage({ 
            type: 'bot', 
            user: BOT, 
            text: '好的，我理解您的需求。如需转接人工服务，请输入「转人工」，我将为您联系对应BP并携带本次对话记录。', 
            time: getTime() 
          });
        } else if (scenarioType === 'transfer1-confirm') {
          // 方式1第二步：用户确认输入"转人工" → 执行转人工（带前三轮对话@BP）
          addMessage({ type: 'bot', user: BOT, text: '实在抱歉，我们紧急处理，正在为您转接对应BP人工服务', time: getTime() });
          setTimeout(() => {
            addMessage({ type: 'bot', user: BOT, cardType: 'transfer-with-history', time: getTime() });
          }, 600);
        } else {
          // 方式2：跳转到话题页面
          addMessage({ type: 'bot', user: BOT, text: '实在抱歉，我们紧急处理，正在为您转接对应BP人工服务', time: getTime() });
          setTimeout(() => {
            onOpenTopic && onOpenTopic();
          }, 800);
        }
        return;
      }

      // 1b. 闲聊场景：问候语 → 标准回复+能力介绍
      if (scenarioType === 'chitchat' || /^(你好|hello|hi|在吗|嗨|hey|早上好|下午好|晚上好)/i.test(text)) {
        addMessage({
          type: 'bot',
          user: BOT,
          time: getTime(),
          text: '你好！我是茶小链，您的供应链智能助手 🍵\n\n我可以帮您：\n📦 查询物流配送信息\n📋 查询订单状态\n❓ 解答供应链常见问题\n👤 转接人工客服\n\n有任何问题随时 @我 即可~',
        });
        return;
      }

      // 1c. FAQ未命中场景：明确引导转人工
      if (scenarioType === 'faq-miss') {
        addMessage({
          type: 'bot',
          user: BOT,
          time: getTime(),
          text: '抱歉，这个问题暂时无法解答 😅\n\n我的能力范围包括：\n📦 查询物流配送信息\n📋 查询订单状态\n❓ 解答供应链常见问题\n\n如需人工协助，请输入「转人工」联系对应BP。',
        });
        return;
      }
      // 转人工确认阶段：用户明确输入"转人工" → 执行转人工（带前三轮对话@BP）
      if (/^转人工$|转人工服务|我要转人工|帮我转人工/.test(text)) {
        addMessage({ type: 'bot', user: BOT, text: '实在抱歉，我们紧急处理，正在为您转接对应BP人工服务', time: getTime() });
        setTimeout(() => {
          addMessage({ type: 'bot', user: BOT, cardType: 'transfer-with-history', time: getTime() });
        }, 600);
        return;
      }

      // 投诉/态度问题引导阶段：识别到投诉意图 → 引导用户输入"转人工"确认
      if (/态度.*不好|找个人.*处理|解决不了|处理一下|不满意|投诉.*态度|态度.*差|服务.*差/.test(text)) {
        addMessage({ 
          type: 'bot', 
          user: BOT, 
          text: '非常抱歉给您带来不好的体验 🙏\n\n我理解您希望有人协助处理这个问题。如需转接对应BP人工服务，请输入「转人工」，我将携带本次对话记录为您转接。', 
          time: getTime() 
        });
        return;
      }

      // 2. 转工单
      if (/工单|提交工单/.test(text)) {
        addMessage({ type: 'bot', user: BOT, cardType: 'workorder', time: getTime() });
        return;
      }

      // 3. 投诉/举报/少货 → 统一走转人工流程（带历史对话@BP）
      if (/投诉|举报|少了|漏了|漏发|少发|破损|差评|数量不对|没到齐/.test(text)) {
        addMessage({ type: 'bot', user: BOT, text: '实在抱歉，我们紧急处理，正在为您转接对应BP人工服务', time: getTime() });
        setTimeout(() => {
          addMessage({ type: 'bot', user: BOT, cardType: 'transfer-with-history', time: getTime() });
        }, 600);
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

      // 9. 兜底回复 — 引导用户输入"转人工"
      addMessage({
        type: 'bot',
        user: BOT,
        time: getTime(),
        text: '抱歉，这个问题暂时无法解答。\n\n您可以尝试：\n📦 查询物流配送信息\n📋 查询订单状态\n❓ 换个方式描述您的问题\n\n如需人工协助，请输入「转人工」联系对应BP。',
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

  // ===== Entry 1: Bot avatar click → profile card =====
  const handleBotAvatarClick = () => {
    setShowProfileCard(true);
  };

  const handleProfileSendMessage = () => {
    setShowProfileCard(false);
    onOpenPrivateChat && onOpenPrivateChat();
  };

  // ===== Entry 2: Tab click =====
  const handleTabClick = (tab) => {
    if (tab === '茶小链') {
      onOpenPrivateChat && onOpenPrivateChat();
    }
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
          {/* Entry 1: clickable avatar */}
          <div className="avatar bot" onClick={handleBotAvatarClick} style={{ cursor: 'pointer' }} title="点击查看茶小链资料">
            <BotAvatar />
          </div>
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
          onBotAvatarClick={handleBotAvatarClick}
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

  const GROUP_TABS = ['消息', '云文档', '文件', '日历', '茶小链'];

  return (
    <div className="h-full flex flex-col" style={{ background: '#f5f6f7', position: 'relative' }}>
      {/* 顶部导航栏 */}
      <div className="chat-header">
        <div className="header-avatar">
          <BotAvatar />
        </div>
        <div className="header-info">
          <h1>霸王茶姬-杭州仓供应链服务群</h1>
          <p>563人 · 供应链BP、承运商、门店店长</p>
        </div>
      </div>

      {/* Entry 2: 群标签页 */}
      <div style={{
        display: 'flex',
        gap: 0,
        background: '#fff',
        borderBottom: '1px solid #e5e6e8',
        padding: '0 8px',
        flexShrink: 0,
        overflowX: 'auto',
      }}>
        {GROUP_TABS.map(tab => {
          const isBot = tab === '茶小链';
          const isActive = tab === '消息';
          return (
            <div
              key={tab}
              onClick={() => handleTabClick(tab)}
              style={{
                padding: '7px 12px',
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#3370ff' : '#646a73',
                cursor: (isBot || isActive) ? 'pointer' : 'default',
                borderBottom: isActive ? '2px solid #3370ff' : '2px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              {isBot && <span style={{ fontSize: 11 }}>🤖</span>}
              {tab}
            </div>
          );
        })}
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

      {/* 底部输入区 + Entry 3 */}
      <div className="input-area" style={{ position: 'relative' }}>
        {/* Entry 3: Plus toggle button */}
        <div
          onClick={() => setShowPlusMenu(!showPlusMenu)}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: showPlusMenu ? '#3370ff' : '#f0f1f3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
            transition: 'all 0.2s',
          }}
        >
          {showPlusMenu ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#646a73" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </div>

        {showPlusMenu ? (
          /* 输入框变为"茶小链"按钮 */
          <button
            onClick={() => { setShowPlusMenu(false); onOpenPrivateChat && onOpenPrivateChat(); }}
            style={{
              flex: 1, padding: '10px 0',
              background: 'linear-gradient(135deg, #8B1A1A, #C41E3A)',
              border: 'none', borderRadius: 20,
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: '0 2px 8px rgba(196,30,58,0.3)',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 16 }}>🤖</span>
            茶小链
          </button>
        ) : (
          <>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="@茶小链 输入您的问题..."
              style={{ flex: 1 }}
            />
            <button onClick={handleSend} disabled={!input.trim()}>发送</button>
          </>
        )}
      </div>

      {/* Entry 1: Profile Card Overlay */}
      {showProfileCard && (
        <>
          <div onClick={() => setShowProfileCard(false)}
            style={{
              position: 'absolute', inset: 0, zIndex: 80,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: 16,
                width: 280, overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              {/* Profile header */}
              <div style={{
                background: 'linear-gradient(135deg, #8B1A1A, #C41E3A)',
                padding: '24px 20px 20px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: '#fff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}>
                  <BotAvatar size={48} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>茶小链</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                  供应链智能客服机器人
                </div>
              </div>

              {/* Profile info */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, color: '#8f959e', width: 60 }}>所属</span>
                    <span style={{ fontSize: 13, color: '#1f2329', fontWeight: 500 }}>霸王茶姬供应链</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, color: '#8f959e', width: 60 }}>能力</span>
                    <span style={{ fontSize: 13, color: '#1f2329' }}>物流查询 · 订单查询 · FAQ · 转人工</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, color: '#8f959e', width: 60 }}>状态</span>
                    <span style={{
                      fontSize: 12, color: '#34c759', fontWeight: 500,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34c759', display: 'inline-block' }} />
                      在线
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowProfileCard(false)}
                  style={{
                    flex: 1, padding: '10px 0',
                    background: '#f5f6f7', border: '1px solid #e5e6e8',
                    borderRadius: 8, fontSize: 13, color: '#646a73',
                    cursor: 'pointer', fontWeight: 500,
                  }}
                >
                  关闭
                </button>
                <button
                  onClick={handleProfileSendMessage}
                  style={{
                    flex: 1, padding: '10px 0',
                    background: '#3370ff', border: 'none',
                    borderRadius: 8, fontSize: 13, color: '#fff',
                    cursor: 'pointer', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}
                >
                  💬 发送消息
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});
