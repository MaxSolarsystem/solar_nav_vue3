<script setup lang="ts">
import { ref, computed } from 'vue';
import { getGitHubApiUrl } from '../config/github';

// 类型定义
interface Site {
  name: string;
  url: string;
  icon: string;
}

interface Category {
  name: string;
  icon: string;
  sites: Site[];
}

// 状态管理
const categories = ref<Category[]>([]);
const siteSearchQuery = ref('');

// 加载导航数据
const loadNavData = async () => {
  try {
    const response = await fetch(getGitHubApiUrl());
    const data = await response.json();
    // GitHub API 返回的文件内容是 Base64 编码的
    // 将 Base64 解码后的内容转换为 UTF-16 编码格式
    const decodedContent = atob(data.content);
    const uint8Array = new Uint8Array(decodedContent.length);
    for (let i = 0; i < decodedContent.length; i++) {
      uint8Array[i] = decodedContent.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    const content = JSON.parse(decoder.decode(uint8Array));
    categories.value = content.categories;
  } catch (error) {
    console.error('加载导航数据失败:', error);
  }
}

// 过滤导航项
const filteredCategories = computed(() => {
  const query = siteSearchQuery.value.toLowerCase().trim();
  if (!query) return categories.value;
  
  return categories.value.map(category => ({
    ...category,
    sites: category.sites.filter(site => 
      site.name.toLowerCase().includes(query)
    )
  })).filter(category => category.sites.length > 0);
});

// 导出方法供父组件调用
defineExpose({
  loadNavData
});
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>🎯 快捷导航</h2>
      <!-- 添加导航搜索框 -->
      <div class="site-search">
        <input 
          v-model="siteSearchQuery"
          type="text"
          placeholder="搜索导航..."
          class="site-search-input"
        >
        <span class="search-icon">🔍</span>
      </div>
    </div>
    <div class="categories">
      <div v-for="category in filteredCategories" :key="category.name" class="category">
        <h3>
          <span class="category-icon">{{ category.icon }}</span>
          {{ category.name }}
        </h3>
        <div class="sites">
          <a 
            v-for="site in category.sites" 
            :key="site.name"
            :href="site.url"
            target="_blank"
            class="site-card"
            :title="site.name"
          >
            <span class="site-icon">{{ site.icon }}</span>
            <span class="site-name">{{ site.name }}</span>
          </a>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 320px;
  background: white;
  padding: 1.8rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  height: calc(100vh - 3rem);
  position: sticky;
  top: 1.5rem;
}

.sidebar-header {
  margin-bottom: 2.5rem;
}

.sidebar-header h2 {
  margin-bottom: 1.2rem;
}

.site-search {
  position: relative;
  width: 100%;
}

.site-search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.8rem;
  font-size: 0.95rem;
  border: 1px solid #e8eaf6;
  border-radius: 10px;
  background-color: #fafbff;
  color: #1a237e;
  transition: all 0.3s ease;
  outline: none;
}

.site-search-input:focus {
  border-color: #3949ab;
  background-color: white;
  box-shadow: 0 2px 12px rgba(63, 81, 181, 0.1);
  outline: none;
}

.site-search-input::placeholder {
  color: #9fa8da;
}

.site-search .search-icon {
  position: absolute;
  left: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: #7986cb;
  pointer-events: none;
}

.category {
  margin-bottom: 2.5rem;
}

.category h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: #5c6bc0;
  margin-bottom: 1.2rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #e8eaf6;
  font-weight: 500;
}

.category-icon {
  font-size: 1.2rem;
}

.sites {
  display: grid;
  gap: 0.8rem;
}

.site-card {
  display: flex;
  align-items: center;
  padding: 0.8rem;
  background-color: #fafbff;
  border-radius: 10px;
  text-decoration: none;
  color: #3949ab;
  transition: all 0.2s ease;
  border: 1px solid #e8eaf6;
}

.site-card:hover {
  background-color: #eef2ff;
  transform: translateY(-2px);
  border-color: #c7d2fe;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.site-icon {
  font-size: 1.2rem;
  margin-right: 0.8rem;
  opacity: 1;
}

.site-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #4f46e5;
}

/* 自定义滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #c5cae9;
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #9fa8da;
}

/* 当搜索无结果时的样式 */
.categories:empty::after {
  content: "未找到匹配的导航项";
  display: block;
  text-align: center;
  padding: 2rem;
  color: #9fa8da;
  font-size: 0.95rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
    padding: 1.5rem;
  }

  .site-search-input {
    padding: 0.7rem 1rem 0.7rem 2.5rem;
    font-size: 0.9rem;
  }
  
  .site-search .search-icon {
    left: 0.7rem;
    font-size: 0.9rem;
  }
}
</style>