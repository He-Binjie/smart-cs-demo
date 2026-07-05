# 智能客服 Demo

霸王茶姬供应链智能客服"茶小链"0.5 期交互演示系统。

## 在线体验

👉 https://he-binjie.github.io/smart-cs-demo/

## 功能范围（0.5 期）

| 场景 | 说明 |
|------|------|
| 🚚 货到哪了 | 物流查询 + 司机联系方式（模拟拨号） |
| 📦 查订单 | 订单状态查询 + H5 详情页 |
| ❓ 问 FAQ | 常见问题知识库问答 |
| 👤 转人工 | 精准路由 + 上下文传递 |
| 🎫 转工单 | 一键跳转工单填写 |
| 📝 投诉举报 | 直接 @群里 BP 处理 |

## 技术栈

- React 19 + Vite 6 + TailwindCSS v4
- 纯前端 Mock 数据，无后端依赖
- GitHub Pages 部署

## 本地开发

```bash
npm install
npm run dev
# 访问 http://localhost:3021
```

## 部署

推送 main 分支自动触发 GitHub Actions 构建部署。

```bash
git push origin main
# 检查状态：gh run list --repo He-Binjie/smart-cs-demo
```
