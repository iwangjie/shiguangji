# 🌟 时光机 - 旅行许愿

一个基于 Cloudflare Worker 的现代化旅行许愿平台，让团队成员可以匿名许愿，共同规划美好的旅行时光。

## ✨ 功能特色

### 🔐 群体隔离
- 支持使用群体编码隔离数据
- 不同群体（如小组1、小组2）的数据完全独立
- 保护隐私，确保数据安全

### 📝 简洁许愿
- 现代化的许愿表单设计
- 填写目的地、出行方式、时间和天数
- 匿名提交，无需注册登录

### 📊 智能统计
- 管理界面实时汇总数据
- 热门目的地排行榜
- 按目的地分组查看详细许愿
- 支持标记许愿完成状态

### 🚀 技术架构
- **前端**: 原生 HTML/CSS/JavaScript，响应式设计
- **后端**: Cloudflare Worker，边缘计算
- **存储**: Cloudflare KV，全球分布式
- **部署**: 自动化部署，零配置

## 🎯 使用场景

- 团队旅行规划
- 公司团建活动
- 朋友聚会出游
- 家庭旅行安排

## 🛠 快速开始

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 部署到生产环境
```bash
# 部署到 Cloudflare
npm run deploy
```

详细部署说明请查看 [DEPLOY.md](./DEPLOY.md)

## 📱 页面预览

### 许愿页面 (/)
- 简洁的表单界面
- 群体编码输入
- 目的地和出行信息填写
- 一键提交许愿

### 管理界面 (/admin)
- 数据统计概览
- 热门目的地排行
- 详细许愿列表
- 完成状态管理

## 🔧 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/wishes` | 创建新许愿 |
| GET | `/api/wishes?group=xxx` | 获取群体许愿列表 |
| POST | `/api/wishes/complete` | 标记许愿完成 |

## 📦 数据结构

```json
{
  "id": "唯一标识符",
  "group": "群体编码",
  "destination": "目的地名称",
  "travelMode": "出行方式",
  "timeframe": "出行时间",
  "days": 出行天数,
  "completed": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "completedAt": null
}
```

## 🌐 在线访问

项目部署地址：[http://shiguangji.pages.dev](http://shiguangji.pages.dev)

## 📄 许可证

MIT License