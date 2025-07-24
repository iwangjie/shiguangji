// 旅行许愿时光机 - Cloudflare Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 处理CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // 路由处理
      if (path === '/' || path === '/index.html') {
        return new Response(getIndexHTML(), {
          headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders }
        });
      }
      
      if (path === '/admin' || path === '/admin.html') {
        return new Response(getAdminHTML(), {
          headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders }
        });
      }
      
      // API路由
      if (path.startsWith('/api/')) {
        return handleAPI(request, env, path);
      }
      
      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      return new Response('Internal Server Error: ' + error.message, { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};

// API处理函数
async function handleAPI(request, env, path) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  if (path === '/api/wishes' && request.method === 'POST') {
    return await createWish(request, env, corsHeaders);
  }
  
  if (path === '/api/wishes' && request.method === 'GET') {
    return await getWishes(request, env, corsHeaders);
  }
  
  if (path === '/api/wishes/complete' && request.method === 'POST') {
    return await completeWish(request, env, corsHeaders);
  }
  
  return new Response('API Not Found', { status: 404, headers: corsHeaders });
}

// 创建许愿
async function createWish(request, env, corsHeaders) {
  try {
    const data = await request.json();
    const { group, destination, travelMode, timeframe, days } = data;
    
    if (!group || !destination || !travelMode || !timeframe || !days) {
      return new Response(JSON.stringify({ error: '所有字段都是必填的' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const wishId = generateId();
    const wish = {
      id: wishId,
      group,
      destination,
      travelMode,
      timeframe,
      days: parseInt(days),
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    // 存储到KV
    const key = `wish:${group}:${wishId}`;
    await env.WISHES_KV.put(key, JSON.stringify(wish));
    
    return new Response(JSON.stringify({ success: true, id: wishId }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '创建许愿失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// 获取许愿列表
async function getWishes(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const group = url.searchParams.get('group');
    
    if (!group) {
      return new Response(JSON.stringify({ error: '需要指定群体' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // 从KV获取该群体的所有许愿
    const listResult = await env.WISHES_KV.list({ prefix: `wish:${group}:` });
    const wishes = [];
    
    for (const key of listResult.keys) {
      const wishData = await env.WISHES_KV.get(key.name);
      if (wishData) {
        wishes.push(JSON.parse(wishData));
      }
    }
    
    // 按目的地分组统计
    const destinationStats = {};
    wishes.forEach(wish => {
      if (!destinationStats[wish.destination]) {
        destinationStats[wish.destination] = {
          destination: wish.destination,
          count: 0,
          completed: 0,
          wishes: []
        };
      }
      destinationStats[wish.destination].count++;
      if (wish.completed) {
        destinationStats[wish.destination].completed++;
      }
      destinationStats[wish.destination].wishes.push(wish);
    });
    
    // 转换为数组并按数量排序
    const destinations = Object.values(destinationStats)
      .sort((a, b) => b.count - a.count);
    
    return new Response(JSON.stringify({ 
      wishes, 
      destinations,
      total: wishes.length 
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '获取许愿列表失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// 标记许愿完成
async function completeWish(request, env, corsHeaders) {
  try {
    const data = await request.json();
    const { group, wishId } = data;
    
    const key = `wish:${group}:${wishId}`;
    const wishData = await env.WISHES_KV.get(key);
    
    if (!wishData) {
      return new Response(JSON.stringify({ error: '许愿不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const wish = JSON.parse(wishData);
    wish.completed = true;
    wish.completedAt = new Date().toISOString();
    
    await env.WISHES_KV.put(key, JSON.stringify(wish));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '标记完成失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// 主页HTML
function getIndexHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>时光机 - 旅行许愿</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 100%;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #333;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #666;
            font-size: 1.1em;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }
        
        input, select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .admin-link {
            text-align: center;
            margin-top: 20px;
        }
        
        .admin-link a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        
        .admin-link a:hover {
            text-decoration: underline;
        }
        
        .message {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌟 时光机</h1>
            <p>许下你的旅行愿望</p>
        </div>
        
        <div id="message"></div>
        
        <form id="wishForm">
            <div class="form-group">
                <label for="group">群体编码</label>
                <input type="text" id="group" name="group" placeholder="例如：小组1" required>
            </div>
            
            <div class="form-group">
                <label for="destination">目的地</label>
                <input type="text" id="destination" name="destination" placeholder="例如：日本东京" required>
            </div>
            
            <div class="form-group">
                <label for="travelMode">出行方式</label>
                <select id="travelMode" name="travelMode" required>
                    <option value="">请选择出行方式</option>
                    <option value="飞机">飞机</option>
                    <option value="高铁">高铁</option>
                    <option value="汽车">汽车</option>
                    <option value="自驾">自驾</option>
                    <option value="其他">其他</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="timeframe">出行时间</label>
                <select id="timeframe" name="timeframe" required>
                    <option value="">请选择出行时间</option>
                    <option value="最近">最近</option>
                    <option value="一个月内">一个月内</option>
                    <option value="半年内">半年内</option>
                    <option value="长假">长假</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="days">出行天数</label>
                <select id="days" name="days" required>
                    <option value="">请选择天数</option>
                    <option value="1">1天</option>
                    <option value="2">2天</option>
                    <option value="3">3天</option>
                    <option value="4">4天</option>
                    <option value="5">5天</option>
                    <option value="7">7天</option>
                    <option value="10">10天</option>
                    <option value="15">15天以上</option>
                </select>
            </div>
            
            <button type="submit" class="btn" id="submitBtn">许愿 ✨</button>
        </form>
        
        <div class="admin-link">
            <a href="/admin">管理界面</a>
        </div>
    </div>
    
    <script>
        document.getElementById('wishForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const messageDiv = document.getElementById('message');
            
            submitBtn.disabled = true;
            submitBtn.textContent = '许愿中...';
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch('/api/wishes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    messageDiv.innerHTML = '<div class="message success">许愿成功！愿望已记录 🌟</div>';
                    e.target.reset();
                } else {
                    messageDiv.innerHTML = '<div class="message error">' + (result.error || '许愿失败') + '</div>';
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="message error">网络错误，请重试</div>';
            }
            
            submitBtn.disabled = false;
            submitBtn.textContent = '许愿 ✨';
        });
    </script>
</body>
</html>`;
}

// 管理页面HTML
function getAdminHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理界面 - 时光机</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            text-align: center;
        }
        
        .header h1 {
            color: #333;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .search-section {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .search-form {
            display: flex;
            gap: 15px;
            align-items: end;
        }
        
        .form-group {
            flex: 1;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            color: #333;
            font-weight: 500;
        }
        
        input, select {
            width: 100%;
            padding: 10px 15px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 16px;
        }
        
        .btn {
            padding: 10px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
        }
        
        .btn:hover {
            opacity: 0.9;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
        
        .destinations {
            background: white;
            border-radius: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .destinations-header {
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e1e5e9;
        }
        
        .destinations-header h2 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .destination-item {
            padding: 20px;
            border-bottom: 1px solid #f0f0f0;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .destination-item:hover {
            background: #f8f9fa;
        }
        
        .destination-item:last-child {
            border-bottom: none;
        }
        
        .destination-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .destination-name {
            font-size: 1.2em;
            font-weight: 600;
            color: #333;
        }
        
        .destination-count {
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            margin-left: auto;
        }
        
        .destination-stats {
            color: #666;
            font-size: 0.9em;
        }
        
        .wishes-list {
            margin-top: 15px;
            display: none;
        }
        
        .wish-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .wish-info {
            flex: 1;
        }
        
        .wish-details {
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
        }
        
        .wish-status {
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: 500;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-completed {
            background: #d4edda;
            color: #155724;
        }
        
        .complete-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.8em;
            margin-left: 10px;
        }
        
        .back-link {
            text-align: center;
            margin-top: 30px;
        }
        
        .back-link a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        
        .empty {
            text-align: center;
            padding: 40px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 管理界面</h1>
            <p>查看和管理旅行许愿数据</p>
        </div>
        
        <div class="search-section">
            <div class="search-form">
                <div class="form-group">
                    <label for="groupSelect">选择群体</label>
                    <input type="text" id="groupSelect" placeholder="输入群体编码，例如：小组1">
                </div>
                <button type="button" class="btn" onclick="loadData()">查询</button>
            </div>
        </div>
        
        <div id="content">
            <div class="empty">
                请输入群体编码查询数据
            </div>
        </div>
        
        <div class="back-link">
            <a href="/">← 返回许愿页面</a>
        </div>
    </div>
    
    <script>
        let currentData = null;
        
        async function loadData() {
            const group = document.getElementById('groupSelect').value.trim();
            if (!group) {
                alert('请输入群体编码');
                return;
            }
            
            const content = document.getElementById('content');
            content.innerHTML = '<div class="loading">加载中...</div>';
            
            try {
                const response = await fetch('/api/wishes?group=' + encodeURIComponent(group));
                const data = await response.json();
                
                if (response.ok) {
                    currentData = data;
                    renderData(data);
                } else {
                    content.innerHTML = '<div class="empty">加载失败：' + (data.error || '未知错误') + '</div>';
                }
            } catch (error) {
                content.innerHTML = '<div class="empty">网络错误，请重试</div>';
            }
        }
        
        function renderData(data) {
            const content = document.getElementById('content');
            
            if (data.total === 0) {
                content.innerHTML = '<div class="empty">暂无许愿数据</div>';
                return;
            }
            
            const completedCount = data.wishes.filter(w => w.completed).length;
            
            content.innerHTML = \`
                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-number">\${data.total}</div>
                        <div class="stat-label">总许愿数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">\${data.destinations.length}</div>
                        <div class="stat-label">目的地数量</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">\${completedCount}</div>
                        <div class="stat-label">已完成</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">\${data.total - completedCount}</div>
                        <div class="stat-label">待完成</div>
                    </div>
                </div>
                
                <div class="destinations">
                    <div class="destinations-header">
                        <h2>🏆 热门目的地</h2>
                        <p>点击查看详细许愿列表</p>
                    </div>
                    \${data.destinations.map(dest => \`
                        <div class="destination-item" onclick="toggleWishes('\${dest.destination}')">
                            <div class="destination-header">
                                <div class="destination-name">\${dest.destination}</div>
                                <div class="destination-count">\${dest.count}个许愿</div>
                            </div>
                            <div class="destination-stats">
                                已完成: \${dest.completed} | 待完成: \${dest.count - dest.completed}
                            </div>
                            <div class="wishes-list" id="wishes-\${dest.destination}">
                                \${dest.wishes.map(wish => \`
                                    <div class="wish-item">
                                        <div class="wish-info">
                                            <div><strong>\${wish.destination}</strong></div>
                                            <div class="wish-details">
                                                \${wish.travelMode} · \${wish.timeframe} · \${wish.days}天
                                                <br>创建时间: \${new Date(wish.createdAt).toLocaleString('zh-CN')}
                                            </div>
                                        </div>
                                        <div>
                                            <span class="wish-status \${wish.completed ? 'status-completed' : 'status-pending'}">
                                                \${wish.completed ? '已完成' : '待完成'}
                                            </span>
                                            \${!wish.completed ? \`<button class="complete-btn" onclick="completeWish('\${wish.group}', '\${wish.id}')">标记完成</button>\` : ''}
                                        </div>
                                    </div>
                                \`).join('')}
                            </div>
                        </div>
                    \`).join('')}
                </div>
            \`;
        }
        
        function toggleWishes(destination) {
            const wishesDiv = document.getElementById('wishes-' + destination);
            if (wishesDiv.style.display === 'none' || !wishesDiv.style.display) {
                wishesDiv.style.display = 'block';
            } else {
                wishesDiv.style.display = 'none';
            }
        }
        
        async function completeWish(group, wishId) {
            try {
                const response = await fetch('/api/wishes/complete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ group, wishId })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    // 重新加载数据
                    loadData();
                } else {
                    alert('标记失败：' + (result.error || '未知错误'));
                }
            } catch (error) {
                alert('网络错误，请重试');
            }
        }
        
        // 回车键查询
        document.getElementById('groupSelect').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadData();
            }
        });
    </script>
</body>
</html>`;
}