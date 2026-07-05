// 真实飞书卡片JSON - 订单查询结果卡片
// 参考飞书开放平台 Interactive Card 文档

import { mockStores, getSubOrderStats } from './mockOrders';

// 构建飞书卡片JSON（真实格式，可直接用于飞书API发送）
export function buildFeishuCardJSON() {
  const allOrders = mockStores.flatMap(s => s.orders);

  const orderElements = [];

  allOrders.forEach((order, idx) => {
    const stats = getSubOrderStats(order);
    const statusColor = getStatusColor(order.status);

    // 子订单状态标签
    const statusTags = Object.entries(stats)
      .map(([status, count]) => `${status}×${count}`)
      .join('  ');

    // 订单信息行
    orderElements.push({
      tag: "div",
      text: {
        tag: "lark_md",
        content: `**${order.storeName}**  ${statusTag(order.status)}\n${order.mainOrderId}\n${order.createTime}  ·  子订单${order.subOrders.length}笔\n${statusTags}`
      }
    });

    // 分割线（非最后一条）
    if (idx < allOrders.length - 1) {
      orderElements.push({ tag: "hr" });
    }
  });

  return {
    config: {
      wide_screen_mode: true
    },
    header: {
      title: {
        tag: "plain_text",
        content: "📦 订单查询结果"
      },
      template: "blue"
    },
    elements: [
      ...orderElements,
      { tag: "hr" },
      {
        tag: "note",
        elements: [
          {
            tag: "plain_text",
            content: "👆 点击卡片 查看订单详情，并获取今日发货司机联系方式"
          }
        ]
      },
      {
        tag: "action",
        actions: [
          {
            tag: "button",
            text: {
              tag: "plain_text",
              content: "查看订单详情"
            },
            type: "primary",
            multi_url: {
              url: "",
              android_url: "",
              ios_url: "",
              pc_url: ""
            }
          }
        ]
      }
    ]
  };
}

function statusTag(status) {
  const map = {
    "处理中": "🟠 处理中",
    "待审核": "🔵 待审核",
    "待支付": "🟢 待支付"
  };
  return map[status] || status;
}

function getStatusColor(status) {
  const map = {
    "处理中": "orange",
    "待审核": "blue",
    "待支付": "green"
  };
  return map[status] || "grey";
}

export { getStatusColor };
