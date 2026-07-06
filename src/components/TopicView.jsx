import { useState, useRef, useEffect } from 'react';

// ===== 茶小链 Bot Avatar =====
function BotAvatar({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="topicBotBg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B1A1A" />
          <stop offset="100%" stopColor="#C41E3A" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#topicBotBg)" />
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

// ===== 用户头像 =====
function UserAvatar({ name, color, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.4, fontWeight: 600, flexShrink: 0,
    }}>
      {name.charAt(0)}
    </div>
  );
}

// ===== 话题消息气泡 =====
function TopicMessage({ user, text, time, isBot }) {
  return (
    <div style={{
      display: 'flex', gap: 8, marginBottom: 16,
      flexDirection: 'row',
    }}>
      <div style={{ flexShrink: 0 }}>
        {isBot ? <BotAvatar size={28} /> : <UserAvatar name={user.name} color={user.color} size={28} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2329' }}>{user.name}</span>
          <span style={{ fontSize: 11, color: '#8f959e' }}>{time}</span>
        </div>
        <div style={{
          background: isBot ? '#f5f7fa' : '#fff',
          border: isBot ? 'none' : '1px solid #e5e6e8',
          borderRadius: 12,
          padding: '8px 12px',
          fontSize: 13,
          lineHeight: '20px',
          color: '#1f2329',
          maxWidth: '100%',
          wordBreak: 'break-word',
        }}>
          {text}
        </div>
      </div>
    </div>
  );
}

// ===== 历史对话摘要卡片 =====
function HistorySummaryCard() {
  const rounds = [
    { round: 1, user: '今天月亮湾店鲜奶到了吗？', bot: '已为您查询，月亮湾店的鲜奶订单（XSD-20260705-04451）状态为"已发货"，预计今天下午2点到达。' },
    { round: 2, user: '司机电话多少？', bot: '配送司机王师傅，电话 138****5678。如需联系可直接拨打。' },
    { round: 3, user: '转人工', bot: '好的，正在为您转接人工客服...' },
  ];

  return (
    <div style={{
      background: '#f5f7fa',
      borderRadius: 10,
      padding: '12px 14px',
      marginBottom: 16,
      border: '1px solid #e5e6e8',
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#646a73', marginBottom: 10 }}>
        📋 近期对话记录（共3轮）
      </div>
      {rounds.map((r, i) => (
        <div key={i} style={{
          marginBottom: i < rounds.length - 1 ? 10 : 0,
          paddingBottom: i < rounds.length - 1 ? 10 : 0,
          borderBottom: i < rounds.length - 1 ? '1px solid #e5e6e8' : 'none',
        }}>
          <div style={{ fontSize: 11, color: '#8f959e', marginBottom: 4 }}>【第{r.round}轮】</div>
          <div style={{ fontSize: 12, lineHeight: '18px', marginBottom: 2 }}>
            <span style={{ color: '#8B5CF6', fontWeight: 500 }}>张店长：</span>
            <span style={{ color: '#1f2329' }}>{r.user}</span>
          </div>
          <div style={{ fontSize: 12, lineHeight: '18px' }}>
            <span style={{ color: '#C41E3A', fontWeight: 500 }}>茶小链：</span>
            <span style={{ color: '#1f2329' }}>{r.bot}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TopicView({ onBack }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, {
      id: nextId.current++,
      user: { name: '张店长', color: '#8B5CF6' },
      text,
      time: getTime(),
      isBot: false,
    }]);
    setInput('');

    // 模拟BP回复
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: nextId.current++,
        user: { name: '李BP', color: '#3370ff' },
        text: '收到，我看一下对话记录，马上回复您。',
        time: getTime(),
        isBot: false,
      }]);
    }, 1500);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f5f6f7' }}>
      {/* 话题顶部导航 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px',
        background: '#fff',
        borderBottom: '1px solid #e5e6e8',
        flexShrink: 0,
      }}>
        <div onClick={onBack} style={{ cursor: 'pointer', padding: '4px 8px 4px 0', display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f2329" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15 }}>📌</span>
            <h1 style={{ fontSize: 15, fontWeight: 600, color: '#1f2329', margin: 0 }}>话题：【转人工】</h1>
          </div>
          <div style={{ fontSize: 11, color: '#8f959e', marginTop: 2 }}>
            参与人：张店长、李BP、茶小链
          </div>
        </div>
      </div>

      {/* 话题来源标识 */}
      <div style={{
        textAlign: 'center', padding: '10px 0 4px',
        fontSize: 11, color: '#8f959e',
      }}>
        —— 由茶小链自动创建 ——
      </div>

      {/* 话题消息区 */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', padding: '8px 16px 16px',
      }}>
        {/* 系统消息：茶小链创建话题并@BP */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 16,
        }}>
          <div style={{ flexShrink: 0 }}>
            <BotAvatar size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2329' }}>茶小链</span>
              <span style={{ fontSize: 11, color: '#8f959e' }}>{getTime()}</span>
            </div>
            <div style={{
              background: '#f0f5ff',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 13,
              lineHeight: '20px',
              color: '#1f2329',
              border: '1px solid #d6e4ff',
            }}>
              <span style={{ color: '#3370ff', fontWeight: 500 }}>@李BP</span> 门店需要人工协助，已将近3轮对话记录带入话题，请及时响应。
            </div>
          </div>
        </div>

        {/* 历史对话摘要 */}
        <HistorySummaryCard />

        {/* 后续对话消息 */}
        {messages.map(msg => (
          <TopicMessage key={msg.id} {...msg} />
        ))}
      </div>

      {/* 底部输入区 */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 16px',
        background: '#fff',
        borderTop: '1px solid #e5e6e8',
        flexShrink: 0,
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="在话题中回复..."
          style={{
            flex: 1, padding: '8px 12px',
            border: '1px solid #e5e6e8',
            borderRadius: 8,
            fontSize: 13,
            outline: 'none',
            background: '#f5f7fa',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            padding: '8px 16px',
            background: input.trim() ? '#3370ff' : '#e5e6e8',
            color: input.trim() ? '#fff' : '#8f959e',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            cursor: input.trim() ? 'pointer' : 'default',
            transition: 'all 0.15s',
          }}
        >
          发送
        </button>
      </div>
    </div>
  );
}
