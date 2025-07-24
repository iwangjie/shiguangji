// API处理函数
import { generateId } from '../utils/helpers.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function handleAPI(request, env, path) {
  if (path === '/api/wishes' && request.method === 'POST') {
    return await createWish(request, env, corsHeaders);
  }
  
  if (path === '/api/wishes' && request.method === 'GET') {
    return await getWishes(request, env, corsHeaders);
  }
  
  if (path === '/api/wishes/complete' && request.method === 'POST') {
    return await completeWish(request, env, corsHeaders);
  }
  
  if (path === '/api/groups' && request.method === 'GET') {
    return await getGroups(request, env, corsHeaders);
  }
  
  return new Response('API Not Found', { status: 404, headers: corsHeaders });
}

// 创建许愿
async function createWish(request, env, corsHeaders) {
  try {
    const data = await request.json();
    const { group, userName, destination, travelMode, timeframe, days } = data;
    
    if (!group || !userName || !destination || !travelMode || !timeframe || !days) {
      return new Response(JSON.stringify({ error: '所有字段都是必填的' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const wishId = generateId();
    const wish = {
      id: wishId,
      group,
      userName,
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
    return new Response(JSON.stringify({ error: '创建许愿失败: ' + error.message }), {
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
    return new Response(JSON.stringify({ error: '获取许愿列表失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// 获取所有群组列表
async function getGroups(request, env, corsHeaders) {
  try {
    // 获取所有许愿记录
    const listResult = await env.WISHES_KV.list({ prefix: 'wish:' });
    const groups = new Set();
    
    for (const key of listResult.keys) {
      // 从key中提取群组名称: wish:群组名:许愿ID
      const parts = key.name.split(':');
      if (parts.length >= 2) {
        groups.add(parts[1]);
      }
    }
    
    return new Response(JSON.stringify({ 
      groups: Array.from(groups).sort()
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '获取群组列表失败: ' + error.message }), {
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
    return new Response(JSON.stringify({ error: '标记完成失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}