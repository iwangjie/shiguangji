// 旅行许愿时光机 - Cloudflare Worker
import { handleAPI } from './handlers/api.js';
import { getIndexHTML, getAdminHTML } from './handlers/pages.js';
import { corsHeaders } from './utils/helpers.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
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
      console.error('Worker Error:', error);
      return new Response('Internal Server Error: ' + error.message, { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};