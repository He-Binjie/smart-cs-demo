import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { validateToken } from './auth'

const rootEl = document.getElementById('root')

// token 校验：线上环境必须携带当天有效的 token 参数
const hostname = window.location.hostname
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'
const params = new URLSearchParams(window.location.search)
const token = params.get('token')

if (!isLocal && !validateToken(token)) {
  rootEl.innerHTML = `
    <div style="
      display:flex;align-items:center;justify-content:center;
      min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;
      color:#1e293b;background:#f1f3f8;
    ">
      <div style="text-align:center;max-width:360px;padding:40px 24px;">
        <div style="font-size:48px;margin-bottom:16px;">🔒</div>
        <h1 style="font-size:20px;font-weight:700;margin:0 0 8px;">访问链接已过期</h1>
        <p style="font-size:14px;color:#64748b;margin:0 0 24px;line-height:1.6;">
          今日访问链接已失效，请通过<br/>
          <strong>smart_cs_demo.shanghai.work/smart-cs-demo/token.html</strong><br/>
          获取新的访问链接
        </p>
        <a href="http://smart_cs_demo.shanghai.work/smart-cs-demo/token.html"
           style="display:inline-block;padding:10px 28px;background:#2563eb;color:#fff;
                  border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
          获取新链接
        </a>
      </div>
    </div>
  `
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
