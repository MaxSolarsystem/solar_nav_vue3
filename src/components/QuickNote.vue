<script setup lang="ts">
import { ref, computed } from 'vue';

// 笔记接口定义
interface Note {
  id: string;
  title: string;
  content: string;
  createTime: string;
}

// 笔记状态管理
const notes = ref<Note[]>([{
  id: '1',
  title: '笔记 1',
  content: '',
  createTime: new Date().toLocaleString()
}]);
const currentNoteId = ref<string>('1');

// 编辑状态管理
const editingNoteId = ref<string | null>(null);
const editingTitle = ref('');

// 计算当前笔记
const currentNote = computed(() => {
  return notes.value.find(note => note.id === currentNoteId.value) || notes.value[0];
});

// 笔记操作方法
const clearNote = () => {
  if (confirm('确定要清除当前笔记的内容吗？')) {
    const note = notes.value.find(note => note.id === currentNoteId.value);
    if (note) {
      note.content = '';
      saveNotes();
    }
  }
}

const clearAllNotes = () => {
  if (confirm('确定要清空所有笔记吗？此操作不可恢复！')) {
    notes.value = [{
      id: Date.now().toString(),
      title: '笔记 1',
      content: '',
      createTime: new Date().toLocaleString()
    }];
    currentNoteId.value = notes.value[0].id;
    saveNotes();
  }
}

const exportNote = () => {
  const note = notes.value.find(note => note.id === currentNoteId.value);
  if (!note || !note.content.trim()) {
    alert('笔记内容为空，无法导出！');
    return;
  }
  
  // 创建并触发下载
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

// 笔记管理方法
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

// 数据持久化
const saveNotes = () => {
  localStorage.setItem('quickNotes', JSON.stringify(notes.value));
  localStorage.setItem('currentNoteId', currentNoteId.value);
}

// 笔记内容更新
const updateNoteContent = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  const note = notes.value.find(note => note.id === currentNoteId.value);
  if (note) {
    note.content = target.value;
    saveNotes();
  }
}

// 标题编辑相关方法
const startEditTitle = (note: Note) => {
  editingNoteId.value = note.id;
  editingTitle.value = note.title;
}

const saveTitle = () => {
  if (!editingNoteId.value) return;
  
  const note = notes.value.find(note => note.id === editingNoteId.value);
  if (note && editingTitle.value.trim()) {
    note.title = editingTitle.value.trim();
    saveNotes();
  }
  editingNoteId.value = null;
}

const handleTitleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    saveTitle();
  } else if (e.key === 'Escape') {
    editingNoteId.value = null;
  }
}

// 数据加载
const loadNotes = () => {
  const savedNotes = localStorage.getItem('quickNotes');
  const savedCurrentId = localStorage.getItem('currentNoteId');
  
  if (savedNotes) {
    notes.value = JSON.parse(savedNotes);
  }
  if (savedCurrentId) {
    currentNoteId.value = savedCurrentId;
  }
}

// 导出方法供父组件调用
defineExpose({
  loadNotes
});
// 处理标签栏的水平滚动
const handleTabScroll = (event: WheelEvent) => {
  event.preventDefault();
  const tabList = event.currentTarget as HTMLElement;
  tabList.scrollLeft += event.deltaY;
}
</script>

<template>
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
          @click="clearAllNotes" 
          class="note-action-btn clear-all-btn" 
          title="删除所有笔记"
        >
          🗑️ 删除所有笔记
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
      <div 
        class="tab-list" 
        @wheel.prevent="handleTabScroll"
      >
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
</template>

<style scoped>
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
  margin-bottom: 0;
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

textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb {
  background: #c5cae9;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #9fa8da;
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
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.tab-list::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
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
.title-input {
  background: transparent;
  border: none;
  outline: none;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  padding: 0;
  margin: 0;
  width: auto;
  min-width: 60px;
  max-width: 120px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.tab-item:not(.active) .title-input {
  background: transparent;
}

.tab-item:not(.active) .title-input:focus {
  background: rgba(0, 0, 0, 0.05);
  box-shadow: none;
  padding: 0 0.2rem;
}

.title-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.tab-item:not(.active) .title-input::placeholder {
  color: rgba(0, 0, 0, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .note-section {
    padding: 1.5rem;
  }

  textarea {
    min-height: 250px;
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
</style>