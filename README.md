# AI Model Monitor 🧠

实时 AI 模型性能监控仪表盘。追踪多个大模型的准确率、延迟、吞吐量和错误率趋势，支持多时间粒度切换。

## 功能

- **实时监控** — 模拟 AI 模型性能数据，每 1.5 秒自动更新
- **多模型对比** — 支持 GPT-4、Claude、Llama、Mistral、Gemini、DeepSeek V3 等 12 个模型
- **性能指标** — 准确率趋势图、延迟分析、吞吐量统计、错误率追踪
- **多时间粒度** — 1分钟/5分钟/15分钟/1小时/4小时/1天 视图切换
- **深色主题** — 紫色系暗色主题，适配桌面和移动端

## 技术栈

React 19 / Vite / Recharts / Tailwind CSS 4 / Framer Motion / Zustand

## 快速开始

```bash
npm install
npm run dev
```

## 在线体验

[在线演示](https://ai-model-monitor.vercel.app)

## 项目结构

```
src/
├── App.jsx                   # 主应用组件
├── index.css                 # 全局样式 (Tailwind + 紫色主题)
├── main.jsx                  # 入口
├── services/
│   └── marketData.js         # AI 模型性能数据模拟服务
├── stores/
│   └── marketStore.js        # Zustand 状态管理
└── components/ui/            # 通用 UI 组件
    ├── Badge.jsx / Button.jsx / Card.jsx / Input.jsx / Tabs.jsx
```
