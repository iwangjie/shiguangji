// 页面HTML生成函数

// 主页HTML - 添加了用户信息模态框
export function getIndexHTML() {
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
        
        .user-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .user-info strong {
            color: #667eea;
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
        
        .btn-secondary {
            background: #6c757d;
            margin-top: 10px;
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
        
        /* 模态框样式 */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        }
        
        .modal-content {
            background-color: white;
            margin: 15% auto;
            padding: 30px;
            border-radius: 15px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        
        .modal-header {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .modal-header h2 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .modal-header p {
            color: #666;
        }
    </style>
</head>
<body>
    <!-- 用户信息模态框 -->
    <div id="userModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>👋 欢迎使用时光机</h2>
                <p>请先填写您的基本信息</p>
            </div>
            <form id="userForm">
                <div class="form-group">
                    <label for="modalGroup">群组名称</label>
                    <input type="text" id="modalGroup" placeholder="例如：开发小组" required>
                </div>
                <div class="form-group">
                    <label for="modalUserName">您的姓名</label>
                    <input type="text" id="modalUserName" placeholder="例如：张三" required>
                </div>
                <button type="submit" class="btn">开始许愿 ✨</button>
            </form>
        </div>
    </div>

    <div class="container">
        <div class="header">
            <h1>🌟 时光机</h1>
            <p>许下你的旅行愿望</p>
        </div>
        
        <div id="userInfo" class="user-info" style="display: none;">
            <p>群组：<strong id="displayGroup"></strong> | 用户：<strong id="displayUserName"></strong></p>
            <button type="button" class="btn btn-secondary" onclick="changeUserInfo()">更改信息</button>
        </div>
        
        <div id="message"></div>
        
        <form id="wishForm">
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
        let userInfo = null;
        
        // 页面加载时检查用户信息
        window.addEventListener('load', function() {
            const savedUserInfo = localStorage.getItem('userInfo');
            if (savedUserInfo) {
                userInfo = JSON.parse(savedUserInfo);
                showUserInfo();
            } else {
                showUserModal();
            }
        });
        
        // 显示用户信息模态框
        function showUserModal() {
            document.getElementById('userModal').style.display = 'block';
        }
        
        // 隐藏用户信息模态框
        function hideUserModal() {
            document.getElementById('userModal').style.display = 'none';
        }
        
        // 显示用户信息
        function showUserInfo() {
            document.getElementById('displayGroup').textContent = userInfo.group;
            document.getElementById('displayUserName').textContent = userInfo.userName;
            document.getElementById('userInfo').style.display = 'block';
        }
        
        // 更改用户信息
        function changeUserInfo() {
            showUserModal();
        }
        
        // 用户信息表单提交
        document.getElementById('userForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const group = document.getElementById('modalGroup').value.trim();
            const userName = document.getElementById('modalUserName').value.trim();
            
            if (!group || !userName) {
                alert('请填写完整信息');
                return;
            }
            
            userInfo = { group, userName };
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            
            hideUserModal();
            showUserInfo();
        });
        
        // 许愿表单提交
        document.getElementById('wishForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!userInfo) {
                showUserModal();
                return;
            }
            
            const submitBtn = document.getElementById('submitBtn');
            const messageDiv = document.getElementById('message');
            
            submitBtn.disabled = true;
            submitBtn.textContent = '许愿中...';
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            // 添加用户信息
            data.group = userInfo.group;
            data.userName = userInfo.userName;
            
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
                console.error('Error:', error);
            }
            
            submitBtn.disabled = false;
            submitBtn.textContent = '许愿 ✨';
        });
    </script>
</body>
</html>`;
}

// 管理页面HTML
export function getAdminHTML() {
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
            justify-content: space-between;
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
        
        .wish-user {
            color: #667eea;
            font-weight: 500;
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
                    <input type="text" id="groupSelect" placeholder="输入群体编码，例如：开发小组">
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
                console.error('Error:', error);
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
                            <div class="wishes-list" id="wishes-\${dest.destination.replace(/[^a-zA-Z0-9]/g, '_')}">
                                \${dest.wishes.map(wish => \`
                                    <div class="wish-item">
                                        <div class="wish-info">
                                            <div><strong>\${wish.destination}</strong> - <span class="wish-user">\${wish.userName || '未知用户'}</span></div>
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
            const wishesDiv = document.getElementById('wishes-' + destination.replace(/[^a-zA-Z0-9]/g, '_'));
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
                console.error('Error:', error);
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