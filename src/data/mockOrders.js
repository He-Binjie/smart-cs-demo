// 多门店模拟数据
// store1: 真实数据（上海金茂大厦店）
// store2/3: 模拟数据（春熙路店、天府广场店），用于演示多店选店流程

export const mockStores = [
  {
    storeId: '317336068380741',
    storeCode: '31011503',
    storeName: '上海金茂大厦店',
    orders: [
      {
        mainOrderId: 'XSD-20260630-10845',
        storeName: '上海金茂大厦店',
        status: '处理中',
        createTime: '2026-06-30 10:25:00',
        subOrders: [
          {
            subOrderId: 'XSD-20260630-10845-001',
            status: '已发货',
            products: [
              { name: '室内香薰液体', qty: 1, unit: '瓶' },
            ]
          },
          {
            subOrderId: 'XSD-20260630-10845-002',
            status: '备货中',
            products: [
              { name: '大号纸杯-蓝银款-1', qty: 1, unit: '箱' },
              { name: '单杯保温打包袋-蓝银款-5', qty: 2, unit: '箱' },
              { name: '大号纸杯-红茶款-1', qty: 1, unit: '箱' },
              { name: 'PLA透杯平盖4.0-6.9', qty: 1, unit: '箱' },
              { name: '外卖封口贴-蓝银款-3', qty: 2, unit: '箱' },
              { name: '大号PP杯-透明-4', qty: 2, unit: '箱' },
              { name: '6mm全降解吸管4.1-1', qty: 1, unit: '箱' },
              { name: '栀香毛峰茶-A', qty: 1, unit: '箱' },
              { name: '火腿芝士滑蛋可颂（面包）', qty: 1, unit: '箱' },
              { name: '90-PET大开口盖-1', qty: 1, unit: '箱' },
              { name: '黑醋栗石崖甜茶（调味茶）-B', qty: 1, unit: '箱' },
              { name: '复合标签纸3.1（简化）-米色款-3', qty: 6, unit: '箱' },
              { name: '东方美人乌龙茶-A', qty: 2, unit: '箱' },
              { name: '杯套-金色款-1', qty: 1, unit: '箱' },
              { name: '茉莉雪芽-D1', qty: 1, unit: '箱' },
              { name: '卡美罗糖-A', qty: 1, unit: '箱' },
            ]
          },
          {
            subOrderId: 'XSD-20260630-10845-003',
            status: '备货中',
            products: [
              { name: '冷冻橙汁-E', qty: 10, unit: '瓶' },
              { name: '白巧芒果麻薯-A', qty: 1, unit: '箱' },
              { name: '速冻调制罗勒水蜜桃汁', qty: 8, unit: '瓶' },
            ]
          },
        ]
      },
      {
        mainOrderId: 'XSD-20260630-10825',
        storeName: '上海金茂大厦店',
        status: '处理中',
        createTime: '2026-06-30 09:50:00',
        subOrders: [
          {
            subOrderId: 'XSD-20260630-10825-001',
            status: '已发货',
            products: [
              { name: '味全鲜牛奶-定制版', qty: 168, unit: '瓶' },
            ]
          },
          {
            subOrderId: 'XSD-20260630-10825-002',
            status: '备货中',
            products: [
              { name: '芝士轻乳-B', qty: 2, unit: '箱' },
            ]
          },
        ]
      },
      {
        mainOrderId: 'XSD-20260630-10351',
        storeName: '上海金茂大厦店',
        status: '处理中',
        createTime: '2026-06-30 08:15:00',
        subOrders: [
          {
            subOrderId: 'XSD-20260630-10351-001',
            status: '已发货',
            products: [
              { name: '抹茶粉-C', qty: 1, unit: '箱' },
            ]
          },
        ]
      },
      {
        mainOrderId: 'XSD-20260629-11029',
        storeName: '上海金茂大厦店',
        status: '处理中',
        createTime: '2026-06-29 16:30:00',
        subOrders: [
          {
            subOrderId: 'XSD-20260629-11029-001',
            status: '备货中',
            products: [
              { name: '杯套-金色款-1', qty: 3, unit: '箱' },
            ]
          },
        ]
      },
      {
        mainOrderId: 'XSD-20260629-08063',
        storeName: '上海金茂大厦店',
        status: '处理中',
        createTime: '2026-06-29 11:20:00',
        subOrders: [
          {
            subOrderId: 'XSD-20260629-08063-001',
            status: '备货中',
            products: [
              { name: '霸王茶姬礼品袋-中号-1', qty: 1, unit: '箱' },
              { name: '霸王茶姬礼品袋-大号-1', qty: 1, unit: '箱' },
              { name: '霸王茶姬礼品袋-小号-1', qty: 1, unit: '箱' },
            ]
          },
        ]
      },
      {
        mainOrderId: 'XSD-20260629-06733',
        storeName: '上海金茂大厦店',
        status: '处理中',
        createTime: '2026-06-29 09:05:00',
        subOrders: [
          {
            subOrderId: 'XSD-20260629-06733-001',
            status: '备货中',
            products: [
              { name: '肉桂风味糖浆（调味糖浆）', qty: 2, unit: '瓶' },
            ]
          },
        ]
      },
    ]
  },
  {
    storeId: '51010501',
    storeCode: '51010501',
    storeName: '成都春熙路店',
    orders: [
      {
        mainOrderId: 'XSD-20260630-20101',
        storeName: '成都春熙路店',
        status: '处理中',
        createTime: '2026-06-30 11:00:00',
        subOrders: [
          {
            subOrderId: 'XSD-20260630-20101-001',
            status: '待发货',
            products: [
              { name: '伯牙绝弦原叶鲜奶茶原料-A', qty: 5, unit: '箱' },
              { name: '茉莉雪芽-D1', qty: 3, unit: '箱' },
            ]
          },
          {
            subOrderId: 'XSD-20260630-20101-002',
            status: '备货中',
            products: [
              { name: '大号纸杯-蓝银款-1', qty: 2, unit: '箱' },
              { name: '杯套-金色款-1', qty: 2, unit: '箱' },
            ]
          },
        ]
      },
      {
        mainOrderId: 'XSD-20260629-20055',
        storeName: '成都春熙路店',
        status: '处理中',
        createTime: '2026-06-29 14:20:00',
        subOrders: [
          {
            subOrderId: 'XSD-20260629-20055-001',
            status: '已发货',
            products: [
              { name: '味全鲜牛奶-定制版', qty: 120, unit: '瓶' },
            ]
          },
        ]
      },
    ]
  },
  {
    storeId: '51010502',
    storeCode: '51010502',
    storeName: '成都天府广场店',
    orders: [
      {
        mainOrderId: 'XSD-20260630-30201',
        storeName: '成都天府广场店',
        status: '处理中',
        createTime: '2026-06-30 09:30:00',
        subOrders: [
          {
            subOrderId: 'XSD-20260630-30201-001',
            status: '备货中',
            products: [
              { name: '东方美人乌龙茶-A', qty: 4, unit: '箱' },
              { name: '黑醋栗石崖甜茶（调味茶）-B', qty: 2, unit: '箱' },
              { name: '栀香毛峰茶-A', qty: 2, unit: '箱' },
            ]
          },
        ]
      },
      {
        mainOrderId: 'XSD-20260628-30100',
        storeName: '成都天府广场店',
        status: '处理中',
        createTime: '2026-06-28 15:45:00',
        subOrders: [
          {
            subOrderId: 'XSD-20260628-30100-001',
            status: '部分签收',
            products: [
              { name: '冷冻橙汁-E', qty: 8, unit: '瓶' },
              { name: '速冻调制罗勒水蜜桃汁', qty: 6, unit: '瓶' },
            ]
          },
          {
            subOrderId: 'XSD-20260628-30100-002',
            status: '待发货',
            products: [
              { name: '外卖封口贴-蓝银款-3', qty: 3, unit: '箱' },
            ]
          },
        ]
      },
    ]
  },
];

// Driver info for today's shipped orders
export const todayDrivers = [
  { type: '常规货品配送', name: '张三', phone: '138-1234-5678' },
  { type: '鲜奶货品配送', name: '李四', phone: '139-8765-4321' },
];

// Helper: aggregate sub-order count by status for a main order
export function aggregateSubOrderStatus(order) {
  const map = {};
  order.subOrders.forEach(sub => {
    map[sub.status] = (map[sub.status] || 0) + 1;
  });
  return Object.entries(map).map(([status, count]) => ({ status, count }));
}

// Helper: get product summary string (max 5, then ...)
export function getProductSummary(subOrder) {
  const items = subOrder.products.map(p => `${p.name}×${p.qty}${p.unit || ''}`);
  if (items.length <= 5) return items.join('、');
  return items.slice(0, 5).join('、') + '...';
}
