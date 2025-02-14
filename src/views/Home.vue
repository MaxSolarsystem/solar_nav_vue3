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

// 添加搜索引擎接口
interface SearchEngine {
  name: string;
  icon: string;
  url: string;
}

// 添加笔记接口
interface Note {
  id: string;
  title: string;
  content: string;
  createTime: string;
}

const searchQuery = ref('');
const categories = ref<Category[]>([]); // 添加类型注解
const siteSearchQuery = ref('');
const isEngineDropdownOpen = ref(false);

// 定义搜索引擎列表
const searchEngines = ref<SearchEngine[]>([
  {
    name: 'Google',
    icon: '🔍',
    url: 'https://www.google.com/search?q='
  },
  {
    name: 'Bing',
    icon: '🔎',
    url: 'https://www.bing.com/search?q='
  },
  {
    name: 'Baidu',
    icon: '🌐',
    url: 'https://www.baidu.com/s?wd='
  },
  {
    name: 'DuckDuckGo',
    icon: '🦆',
    url: 'https://duckduckgo.com/?q='
  }
]);

const currentSearchEngine = ref<SearchEngine>(searchEngines.value[0]);

// 修改笔记相关的 ref
const notes = ref<Note[]>([{
  id: '1',
  title: '笔记 1',
  content: '',
  createTime: new Date().toLocaleString()
}]);
const currentNoteId = ref<string>('1');

// 添加编辑状态的 ref
const editingNoteId = ref<string | null>(null);
const editingTitle = ref('');

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
  const savedNotes = localStorage.getItem('quickNotes');
  const savedCurrentId = localStorage.getItem('currentNoteId');
  
  if (savedNotes) {
    notes.value = JSON.parse(savedNotes);
  }
  if (savedCurrentId) {
    currentNoteId.value = savedCurrentId;
  }
});

// 修改搜索处理函数
const handleSearch = (e: Event) => {
  e.preventDefault();
  if (searchQuery.value) {
    window.open(`${currentSearchEngine.value.url}${encodeURIComponent(searchQuery.value)}`, '_blank');
  }
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

// 清除当前笔记
const clearNote = () => {
  if (confirm('确定要清除当前笔记的内容吗？')) {
    const note = notes.value.find(note => note.id === currentNoteId.value);
    if (note) {
      note.content = '';
      saveNotes();
    }
  }
}

// 导出笔记内容为txt文件
const exportNote = () => {
  const note = notes.value.find(note => note.id === currentNoteId.value);
  if (!note) return;
  
  if (!note.content.trim()) {
    alert('笔记内容为空，无法导出！');
    return;
  }
  
  const blob = new Blob([note.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `${note.title}_${new Date().toLocaleDateString()}.txt`;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 计算当前笔记
const currentNote = computed(() => {
  return notes.value.find(note => note.id === currentNoteId.value) || notes.value[0];
});

// 添加新笔记
const addNote = () => {
  if (notes.value.length >= 10) {
    alert('最多只能创建10个笔记！');
    return;
  }
  
  const newNote: Note = {
    id: Date.now().toString(),
    title: `笔记 ${notes.value.length + 1}`,
    content: '',
    createTime: new Date().toLocaleString()
  };
  
  notes.value.push(newNote);
  currentNoteId.value = newNote.id;
  saveNotes();
}

// 删除笔记
const deleteNote = (noteId: string) => {
  if (notes.value.length <= 1) {
    alert('至少需要保留一个笔记！');
    return;
  }
  
  if (confirm('确定要删除这个笔记吗？')) {
    const index = notes.value.findIndex(note => note.id === noteId);
    notes.value.splice(index, 1);
    
    if (currentNoteId.value === noteId) {
      currentNoteId.value = notes.value[0].id;
    }
    
    saveNotes();
  }
}

// 保存笔记
const saveNotes = () => {
  localStorage.setItem('quickNotes', JSON.stringify(notes.value));
  localStorage.setItem('currentNoteId', currentNoteId.value);
}

// 更新笔记内容
const updateNoteContent = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  const note = notes.value.find(note => note.id === currentNoteId.value);
  if (note) {
    note.content = target.value;
    saveNotes();
  }
}

// 开始编辑标题
const startEditTitle = (note: Note) => {
  editingNoteId.value = note.id;
  editingTitle.value = note.title;
}

// 保存标题
const saveTitle = () => {
  if (!editingNoteId.value) return;
  
  const note = notes.value.find(note => note.id === editingNoteId.value);
  if (note && editingTitle.value.trim()) {
    note.title = editingTitle.value.trim();
    saveNotes();
  }
  editingNoteId.value = null;
}

// 处理按键事件
const handleTitleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    saveTitle();
  } else if (e.key === 'Escape') {
    editingNoteId.value = null;
  }
}

// 添加 ref 类型
const titleInput = ref<HTMLInputElement | null>(null);
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
          <div class="search-engine-selector">
            <button 
              type="button"
              class="current-engine"
              @click="isEngineDropdownOpen = !isEngineDropdownOpen"
            >
              <span class="engine-icon">{{ currentSearchEngine.icon }}</span>
              {{ currentSearchEngine.name }}
              <span class="dropdown-arrow">▼</span>
            </button>
            <div 
              v-show="isEngineDropdownOpen" 
              class="engine-dropdown"
            >
              <button
                v-for="engine in searchEngines"
                :key="engine.name"
                type="button"
                class="engine-option"
                @click="currentSearchEngine = engine; isEngineDropdownOpen = false"
              >
                <span class="engine-icon">{{ engine.icon }}</span>
                {{ engine.name }}
              </button>
            </div>
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            :placeholder="`搜索 ${currentSearchEngine.name}...`"
            autocomplete="off"
          >
          <button type="submit">
            <span class="search-icon">{{ currentSearchEngine.icon }}</span>
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
        
        <div class="note-tabs">
          <div class="tab-list">
            <button
              v-for="note in notes"
              :key="note.id"
              class="tab-item"
              :class="{ active: currentNoteId === note.id }"
              @click="currentNoteId = note.id"
              @dblclick.stop="startEditTitle(note)"
            >
              <template v-if="editingNoteId === note.id">
                <input
                  v-model="editingTitle"
                  class="title-input"
                  @keydown="handleTitleKeydown"
                  @blur="saveTitle"
                  @click.stop
                  ref="titleInput"
                  :maxlength="20"
                  type="text"
                >
              </template>
              <template v-else>
                {{ note.title }}
              </template>
              <span 
                v-if="notes.length > 1" 
                class="delete-tab" 
                @click.stop="deleteNote(note.id)"
              >
                ×
              </span>
            </button>
            <button 
              v-if="notes.length < 10"
              class="add-tab-btn" 
              @click="addNote"
            >
              + 新建笔记
            </button>
          </div>
        </div>
        
        <textarea 
          v-model="currentNote.content"
          @input="updateNoteContent"
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
  padding: 0.8rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e8eaf6;
  align-items: center;
}

.search-engine-selector {
  position: relative;
  min-width: 160px; /* 减小最小宽度 */
}

.current-engine {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem; /* 减小内边距 */
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem; /* 减小字体大小 */
  color: #475569;
  width: 100%;
  transition: all 0.2s ease;
}

.current-engine:hover {
  background: #e2e8f0;
}

.engine-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: hidden; /* 确保圆角效果 */
}

.engine-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem; /* 减小内边距 */
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  color: #475569;
  font-size: 0.85rem; /* 减小字体大小 */
  transition: all 0.2s ease;
}

.engine-option:hover {
  background: #f1f5f9;
}

.engine-icon {
  font-size: 1rem; /* 减小图标大小 */
}

.dropdown-arrow {
  font-size: 0.7rem;
  margin-left: auto;
  color: #94a3b8;
}

.search-form input {
  flex: 1;
  padding: 0.5rem 0.8rem; /* 减小内边距 */
  font-size: 0.95rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.2s ease;
}

.search-form input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-form input::placeholder {
  color: #94a3b8;
}

.search-form button[type="submit"] {
  padding: 0.5rem 1rem; /* 减小按钮内边距 */
  border: none;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
}

.search-form button[type="submit"]:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.search-form button[type="submit"] .search-icon {
  font-size: 0.9rem; /* 减小搜索图标大小 */
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
    padding: 0.6rem;
    gap: 0.5rem;
  }

  .search-engine-selector {
    width: 100%;
  }

  .current-engine,
  .engine-option {
    padding: 0.4rem 0.6rem;
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

.note-tabs {
  margin-bottom: 1rem;
}

.tab-list {
  display: flex;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #475569;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-item.active {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
}

.delete-tab {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  font-size: 0.8rem;
  margin-left: 0.25rem;
}

.tab-item.active .delete-tab {
  background: rgba(255, 255, 255, 0.2);
}

.delete-tab:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.add-tab-btn {
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border: 1px dashed #94a3b8;
  border-radius: 6px;
  color: #64748b;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.add-tab-btn:hover {
  background: #e2e8f0;
  border-color: #64748b;
}

/* 适配移动端 */
@media (max-width: 768px) {
  .tab-list {
    padding-bottom: 0.8rem;
    margin-bottom: 0.8rem;
  }
  
  .tab-item,
  .add-tab-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
}

.title-input {
  background: transparent;
  border: none;
  outline: none;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  padding: 0.2rem 0.4rem;
  margin: 0;
  width: 120px;
  max-width: 150px;
  border-radius: 4px;

  transition: all 0.2s ease;
}

.tab-item:not(.active) .title-input {
  background: rgba(0, 0, 0, 0.03);
}

.tab-item:not(.active) .title-input:focus {
  background: rgba(0, 0, 0, 0.05);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

/* 添加占位符样式 */
.title-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.tab-item:not(.active) .title-input::placeholder {
  color: rgba(0, 0, 0, 0.4);
}
</style>
