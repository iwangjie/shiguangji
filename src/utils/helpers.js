// 工具函数

// 生成唯一ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// CORS头部
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};