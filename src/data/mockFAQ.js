// FAQ知识库 - 模拟智能客服FAQ问答
export const faqData = [
  {
    keywords: ['四点', '下午', '截止', '下单时间', '几点前'],
    question: '下午四点以后下单今天能到吗？',
    answer: '每日16:00前下单，当日发货，预计次日到达。\n16:00后下单，次日发货，预计第三日到达。\n\n如需加急，请联系BP处理。',
  },
  {
    keywords: ['保质期', '鲜奶', '过期', '有效期'],
    question: '鲜奶的保质期是多久？',
    answer: '鲜牛奶保质期为7天（2-6°C冷藏），到货后请及时放入冷藏柜。如发现胀包、异味或超过保质期，请立即停止使用并提交工单反馈。',
  },
  {
    keywords: ['退货', '退换', '换货', '退回'],
    question: '如何申请退换货？',
    answer: '收货后24小时内可申请退换货：\n1. 拍照留存问题商品\n2. 在本群 @我 发送「退货+订单号」\n3. 供应链BP将在2小时内确认处理方案\n\n⚠️ 定制品和已拆封食品不支持无理由退货。',
  },
  {
    keywords: ['缺货', '少了', '漏发', '少发', '数量不对'],
    question: '收到货物数量不对怎么办？',
    answer: '如遇缺货或少发：\n1. 签收时在单据上标注实际数量\n2. 拍照留存\n3. @我 发送「缺货+订单号+缺少的商品名」\n\n补发将在下一个配送周期优先安排，紧急需求可输入「转人工」联系BP。',
  },
  {
    keywords: ['配送', '几点', '什么时候到', '到货', '送达'],
    question: '每天配送时间是几点？',
    answer: '常规品配送时间：凌晨4:00-7:00\n鲜奶品配送时间：凌晨3:00-6:00\n\n如遇特殊情况延迟，可在订单详情中查看司机联系方式。',
  },
  {
    keywords: ['加急', '急', '催', '快点'],
    question: '可以加急下单吗？',
    answer: '加急订单需在当日12:00前提交申请，由供应链BP审批后优先安排发货。\n\n请输入「转人工」联系BP处理加急需求。',
  },
];

// 物流追踪数据
export const logisticsData = {
  shipTime: '2026-07-06',
  storeName: '月亮湾店',
  driverName: '王师傅',
  driverPhone: '138-1234-5678',
};

// 转人工配置
export const humanAgents = [
  { name: '李经理', role: '华东承运商', online: true },
  { name: '李BP', role: '供应链BP', online: true },
];

// 匹配FAQ
export function matchFAQ(text) {
  const lower = text.toLowerCase();
  for (const faq of faqData) {
    if (faq.keywords.some(kw => lower.includes(kw))) {
      return faq;
    }
  }
  return null;
}
