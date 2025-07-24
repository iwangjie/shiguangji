# 部署说明

## 前置要求

1. 安装 Node.js (推荐 18+ 版本)
2. 安装 Wrangler CLI: `npm install -g wrangler`
3. 拥有 Cloudflare 账户

## 部署步骤

### 1. 登录 Cloudflare
```bash
wrangler login
```

### 2. 创建 KV 命名空间
```bash
# 创建生产环境 KV
wrangler kv:namespace create "WISHES_KV"

# 创建预览环境 KV
wrangler kv:namespace create "WISHES_KV" --preview
```

### 3. 更新 wrangler.toml
将上一步生成的 KV namespace ID 填入 `wrangler.toml` 文件中：

```toml
[[kv_namespaces]]
binding = "WISHES_KV"
id = "your-production-kv-namespace-id"  # 替换为实际的 ID
preview_id = "your-preview-kv-namespace-id"  # 替换为实际的 ID
```

### 4. 本地开发
```bash
npm install
npm run dev
```

### 5. 部署到生产环境
```bash
npm run deploy
```

## 功能说明

### 主要功能
- 匿名许愿提交
- 群体数据隔离
- 管理界面查看统计
- 目的地热度排行
- 许愿完成标记

### API 接口
- `POST /api/wishes` - 创建许愿
- `GET /api/wishes?group=xxx` - 获取群体许愿列表
- `POST /api/wishes/complete` - 标记许愿完成

### 页面路由
- `/` - 许愿表单页面
- `/admin` - 管理界面

## 数据结构

### 许愿数据
```json
{
  "id": "唯一标识",
  "group": "群体编码",
  "destination": "目的地",
  "travelMode": "出行方式",
  "timeframe": "出行时间",
  "days": "出行天数",
  "completed": false,
  "createdAt": "创建时间",
  "completedAt": "完成时间"
}
```

## 注意事项

1. KV 存储有一定的延迟，数据可能不会立即生效
2. 免费版 Cloudflare Worker 有请求限制
3. 建议定期备份重要数据
4. 群体编码区分大小写