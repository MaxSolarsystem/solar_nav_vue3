<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

// 添加类型定义
interface Site {
  name: string;
  url: string;
  icon: string;
  description: string;
}

interface Category {
  name: string;
  icon: string;
  sites: Site[];
}

const searchQuery = ref('');
const noteContent = ref('');
const categories = ref<Category[]>([]); // 添加类型注解
const siteSearchQuery = ref('');

// 从localStorage加载笔记
const savedNote = localStorage.getItem('quickNote');
if (savedNote) {
  noteContent.value = savedNote;
}

// 加载导航数据
const loadNavData = async () => {
  try {
    const response = await fetch('/data/nav.json');
    const data = await response.json();
    categories.value = data.categories;
  } catch (error) {
    console.error('加载导航数据失败:', error);
  }
}

onMounted(() => {
  loadNavData();
});

const handleSearch = (e: Event) => {
  e.preventDefault();
  if (searchQuery.value) {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery.value)}`, '_blank');
  }
}

// 自动保存笔记
const saveNote = () => {
  localStorage.setItem('quickNote', noteContent.value);
}

// 计算属性：过滤后的分类和网站
const filteredCategories = computed(() => {
  const query = siteSearchQuery.value.toLowerCase().trim();
  
  if (!query) return categories.value;
  
  return categories.value.map(category => ({
    ...category,
    sites: category.sites.filter(site => 
      site.name.toLowerCase().includes(query) || 
      site.description.toLowerCase().includes(query)
    )
  })).filter(category => category.sites.length > 0);
});

// 清除笔记内容
const clearNote = () => {
  if (confirm('确定要清除所有笔记内容吗？')) {
    noteContent.value = '';
    localStorage.removeItem('quickNote');
  }
}

// 导出笔记内容为txt文件
const exportNote = () => {
  if (!noteContent.value.trim()) {
    alert('笔记内容为空，无法导出！');
    return;
  }
  
  const blob = new Blob([noteContent.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `我的笔记_${new Date().toLocaleDateString()}.txt`;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="app-container">
    <!-- 左侧导航区域 -->
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
        <!-- 使用 filteredCategories 替换原来的 categories -->
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
              :title="site.description"
            >
              <span class="site-icon">{{ site.icon }}</span>
              <div class="site-info">
                <span class="site-name">{{ site.name }}</span>
                <span class="site-description">{{ site.description }}</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧主要内容区域 -->
    <main class="main-content">
      <!-- 搜索区域 -->
      <div class="search-section">
        <form @submit="handleSearch" class="search-form">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索 Google..."
            autocomplete="off"
          >
          <button type="submit">
            <span class="search-icon">🔍</span>
          </button>
        </form>
      </div>

      <!-- 笔记区域 -->
      <div class="note-section">
        <div class="note-header">
          <h3>📝 快速笔记</h3>
          <div class="note-actions">
            <button 
              @click="clearNote" 
              class="note-action-btn clear-btn" 
              title="清除笔记内容"
            >
              🗑️ 清除
            </button>
            <button 
              @click="exportNote" 
              class="note-action-btn export-btn" 
              title="导出为txt文件"
            >
              💾 导出
            </button>
          </div>
        </div>
        <textarea 
          v-model="noteContent"
          @input="saveNote"
          placeholder="在这里写下临时笔记..."
        ></textarea>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: #f0f4f8;
  gap: 2rem;
  padding: 1.5rem;
}

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
  margin-bottom: 1.2rem; /* 减小标题下方间距 */
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
  padding: 1rem;
  background-color: #fafbff;
  border-radius: 12px;
  text-decoration: none;
  color: #3949ab;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.site-card:hover {
  background-color: #e8eaf6;
  transform: translateX(8px);
  border: 1px solid #c5cae9;
}

.site-icon {
  font-size: 1.4rem;
  margin-right: 1rem;
  opacity: 0.9;
}

.site-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.site-name {
  font-size: 1rem;
  font-weight: 500;
}

.site-description {
  font-size: 0.8rem;
  color: #7986cb;
  opacity: 0.8;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  margin: 0 auto;
  width: 100%;
}

.search-section {
  margin-top: 1rem;
}

.search-form {
  display: flex;
  gap: 0.8rem;
  background: white;
  padding: 0.6rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaf6;
  transition: all 0.3s ease;
}

.search-form:focus-within {
  border-color: #3949ab;
  box-shadow: 0 2px 12px rgba(63, 81, 181, 0.1);
}

.search-form input {
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  border: none;
  outline: none;
  background: transparent;
  color: #1a237e;
}

.search-form input::placeholder {
  color: #9fa8da;
}

.search-form button {
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.search-form button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(63, 81, 181, 0.1);
}

.note-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e8eaf6;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.note-header h3 {
  margin-bottom: 0; /* 覆盖原来的 margin-bottom */
}

.note-actions {
  display: flex;
  gap: 0.8rem;
}

.note-action-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f8fafc;
  color: #4b5563;
  border: 1px solid #e2e8f0;
}

.clear-btn {
  background-color: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.clear-btn:hover {
  background-color: #fecaca;
  border-color: #991b1b;
  box-shadow: 0 2px 12px rgba(153, 27, 27, 0.1);
}

.export-btn {
  background-color: #e0e7ff;
  color: #3730a3;
  border-color: #c7d2fe;
}

.export-btn:hover {
  background-color: #c7d2fe;
  border-color: #3730a3;
  box-shadow: 0 2px 12px rgba(55, 48, 163, 0.1);
}

textarea {
  flex: 1;
  min-height: 350px;
  padding: 1.2rem;
  border: 1px solid #e8eaf6;
  border-radius: 12px;
  background: #fafbff;
  resize: none;
  font-size: 1rem;
  line-height: 1.6;
  outline: none;
  transition: all 0.3s ease;
  color: #3949ab;
}

textarea::placeholder {
  color: #9fa8da;
}

textarea:focus {
  border-color: #3949ab;
  background-color: white;
  box-shadow: 0 2px 12px rgba(63, 81, 181, 0.1);
}

/* 自定义滚动条样式 */
.sidebar::-webkit-scrollbar,
textarea::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-track,
textarea::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb,
textarea::-webkit-scrollbar-thumb {
  background: #c5cae9;
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb:hover,
textarea::-webkit-scrollbar-thumb:hover {
  background: #9fa8da;
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
    padding: 1rem;
    gap: 1.5rem;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: static;
    padding: 1.5rem;
  }

  .main-content {
    padding: 0;
  }

  .search-form {
    flex-direction: column;
  }

  .search-form button {
    width: 100%;
    justify-content: center;
  }

  .note-section {
    padding: 1.5rem;
  }

  textarea {
    min-height: 250px;
  }

  .site-search-input {
    padding: 0.7rem 1rem 0.7rem 2.5rem;
    font-size: 0.9rem;
  }
  
  .site-search .search-icon {
    left: 0.7rem;
    font-size: 0.9rem;
  }

  .note-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .note-actions {
    width: 100%;
  }

  .note-action-btn {
    flex: 1;
    justify-content: center;
  }
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
</style>
