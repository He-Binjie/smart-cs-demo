const actions = [
  { label: '📦 查一下最近的订单', text: '帮我查一下最近的订单' },
  { label: '🚚 今天有司机来吗', text: '今天有配送司机来吗' },
  { label: '📋 我的货到哪了', text: '我的货到哪了' },
];

export default function QuickActions({ onAction }) {
  return (
    <div className="px-3 py-2 flex gap-2 overflow-x-auto">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onAction(action.text)}
          className="shrink-0 px-3 py-1.5 bg-[#F0F5FF] text-[#3370FF] text-[13px] rounded-full border border-[#3370FF]/20 hover:bg-[#3370FF] hover:text-white transition-all active:scale-95"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
