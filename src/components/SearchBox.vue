<script setup lang="ts">
import { ref } from 'vue';

// 搜索引擎接口定义
interface SearchEngine {
  name: string;
  icon: string;
  url: string;
}

// 状态管理
const searchQuery = ref('');
const isEngineDropdownOpen = ref(false);

// 搜索引擎列表配置
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

// 当前选中的搜索引擎
const currentSearchEngine = ref<SearchEngine>(searchEngines.value[0]);

// 处理搜索提交
const handleSearch = (e: Event) => {
  e.preventDefault();
  if (searchQuery.value) {
    window.open(
      `${currentSearchEngine.value.url}${encodeURIComponent(searchQuery.value)}`,
      '_blank'
    );
  }
}
</script>

<template>
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
</template>

<style scoped>
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
  min-width: 160px;
}

.current-engine {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
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
  overflow: hidden;
}

.engine-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  color: #475569;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.engine-option:hover {
  background: #f1f5f9;
}

.engine-icon {
  font-size: 1rem;
}

.dropdown-arrow {
  font-size: 0.7rem;
  margin-left: auto;
  color: #94a3b8;
}

.search-form input {
  flex: 1;
  padding: 0.5rem 0.8rem;
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
  padding: 0.5rem 1rem;
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
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
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
}
</style> 