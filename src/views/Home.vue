<script setup lang="ts">
import { ref, onMounted } from 'vue';
import QuickNav from '../components/QuickNav.vue';
import SearchBox from '../components/SearchBox.vue';
import QuickNote from '../components/QuickNote.vue';

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
</script>

<template>
  <div class="app-container">
    <!-- 左侧导航栏 -->
    <QuickNav ref="quickNavRef" />
    
    <!-- 右侧主要内容区 -->
    <main class="main-content">
      <SearchBox />
      <QuickNote ref="quickNoteRef" />
    </main>
  </div>
</template>

<style scoped>
/* 主容器样式 */
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: #f0f4f8;
  gap: 2rem;
  padding: 1.5rem;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  margin: 0 auto;
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
    padding: 1rem;
    gap: 1.5rem;
  }

  .main-content {
    padding: 0;
  }
}
</style>
