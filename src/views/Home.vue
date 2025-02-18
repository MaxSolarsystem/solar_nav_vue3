<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import QuickNav from '../components/QuickNav.vue';
import SearchBox from '../components/SearchBox.vue';
import QuickNote from '../components/QuickNote.vue';

const router = useRouter();

// 组件引用，用于调用子组件的方法
const quickNavRef = ref();
const quickNoteRef = ref();

// 组件挂载时初始化数据
onMounted(() => {
  // 加载导航数据
  quickNavRef.value?.loadNavData();
  // 加载笔记数据
  quickNoteRef.value?.loadNotes();
});

const goToSettings = () => {
  router.push('/setting');
};
</script>

<template>
  <div class="app-container">
    <div class="content-wrapper">
      <!-- 左侧导航栏 -->
      <aside class="sidebar">
        <QuickNav ref="quickNavRef" />
      </aside>
      
      <!-- 右侧主要内容区 -->
      <main class="main-content">

          <SearchBox />


          <QuickNote ref="quickNoteRef" />

      </main>
    </div>
    
    <!-- 设置按钮 -->
    <button class="settings-button" @click="goToSettings">
      <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* 主容器样式 */
.app-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 2rem;
  position: relative;
}

.content-wrapper {
  display: flex;
  gap: 2.5rem;
  max-width: 1600px;
  margin: 0 auto;
  height: calc(100vh - 4rem);
}

/* 侧边栏样式 */
.sidebar {
  width: 320px;
  flex-shrink: 0;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow-y: auto;
  height: 100%;
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-width: 0; /* 防止内容溢出 */
}

.search-section {
  background-color: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.note-section {
  background-color: white;
  border-radius: 16px;
  flex: 1;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: auto;
}

/* 设置按钮样式 */
.settings-button {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background-color: white;
  border: none;
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.settings-button:hover {
  transform: translateY(-2px) rotate(30deg);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.settings-icon {
  width: 24px;
  height: 24px;
  color: #4a5568;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .app-container {
    padding: 1.5rem;
  }

  .content-wrapper {
    gap: 2rem;
    height: calc(100vh - 3rem);
  }

  .sidebar {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }

  .content-wrapper {
    flex-direction: column;
    height: auto;
    gap: 1.5rem;
  }

  .sidebar {
    width: 100%;
  }

  .main-content {
    gap: 1.5rem;
  }

  .settings-button {
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
  }

  .settings-icon {
    width: 20px;
    height: 20px;
  }
}
</style>
