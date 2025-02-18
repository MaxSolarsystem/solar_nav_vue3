<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getGitHubApiUrl, getGitHubToken, updateGitHubFile } from '../config/github'

interface Site {
  name: string
  url: string
  icon: string
}

interface Category {
  name: string
  icon: string
  sites: Site[]
}

interface NavData {
  categories: Category[]
}

const router = useRouter()
const navData = ref<NavData>({ categories: [] })
const loading = ref(false)
const error = ref('')

// 加载导航数据
const loadNavData = async () => {
  loading.value = true
  error.value = ''
  try {
    const token = getGitHubToken()
    if (!token) {
      router.push('/setting')
      return
    }

    const response = await fetch(getGitHubApiUrl(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    const data = await response.json()
    const decodedContent = atob(data.content)
    const uint8Array = new Uint8Array(decodedContent.length)
    for (let i = 0; i < decodedContent.length; i++) {
      uint8Array[i] = decodedContent.charCodeAt(i)
    }
    const decoder = new TextDecoder('utf-8')
    navData.value = JSON.parse(decoder.decode(uint8Array))
  } catch (err) {
    error.value = '加载导航数据失败'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 添加新分类
const addCategory = () => {
  navData.value.categories.push({
    name: '新分类',
    icon: '📁',
    sites: []
  })
}

// 删除分类
const deleteCategory = (index: number) => {
  navData.value.categories.splice(index, 1)
}

// 添加新站点
const addSite = (categoryIndex: number) => {
  navData.value.categories[categoryIndex].sites.push({
    name: '新站点',
    url: 'https://',
    icon: '🔗'
  })
}

// 删除站点
const deleteSite = (categoryIndex: number, siteIndex: number) => {
  navData.value.categories[categoryIndex].sites.splice(siteIndex, 1)
}

// 保存导航数据
const saveNavData = async () => {
  loading.value = true
  error.value = ''
  try {
    await updateGitHubFile(JSON.stringify(navData.value, null, 2))
    router.push('/')
  } catch (err) {
    error.value = '保存导航数据失败'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 返回主页
const goBack = () => {
  router.push('/')
}

onMounted(() => {
  // 检查 GitHub Token 是否已设置
  const token = getGitHubToken()
  if (!token) {
    router.push('/setting')
    return
  }
  loadNavData()
})
</script>

<template>
  <div class="app-container">
    <div class="edit-container">
      <div class="header">
        <button class="back-button" @click="goBack">
          <span class="back-icon">←</span> 返回主页
        </button>
        <h2 class="edit-title">编辑导航</h2>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <template v-else>
        <div class="categories">
          <div v-for="(category, categoryIndex) in navData.categories" 
               :key="categoryIndex" 
               class="category-item">
            <div class="category-header">
              <div class="form-group">
                <input 
                  v-model="category.icon"
                  type="text"
                  placeholder="图标"
                  class="icon-input"
                >
                <input 
                  v-model="category.name"
                  type="text"
                  placeholder="分类名称"
                  class="name-input"
                >
              </div>
              <button 
                @click="deleteCategory(categoryIndex)"
                class="delete-button"
                title="删除分类"
              >×</button>
            </div>

            <div class="sites">
              <div 
                v-for="(site, siteIndex) in category.sites" 
                :key="siteIndex"
                class="site-item"
              >
                <div class="form-group">
                  <input 
                    v-model="site.icon"
                    type="text"
                    placeholder="图标"
                    class="icon-input"
                  >
                  <input 
                    v-model="site.name"
                    type="text"
                    placeholder="站点名称"
                    class="name-input"
                  >
                  <input 
                    v-model="site.url"
                    type="text"
                    placeholder="URL"
                    class="url-input"
                  >
                </div>
                <button 
                  @click="deleteSite(categoryIndex, siteIndex)"
                  class="delete-button"
                  title="删除站点"
                >×</button>
              </div>
              <button 
                @click="addSite(categoryIndex)"
                class="add-button"
              >添加站点</button>
            </div>
          </div>

          <button 
            @click="addCategory"
            class="add-button category-add"
          >添加分类</button>
        </div>

        <div class="actions">
          <button 
            @click="saveNavData"
            class="save-button"
            :disabled="loading"
          >保存更改</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f0f4f8;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.edit-container {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  width: 100%;
  max-width: 800px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 2.5rem;
  gap: 1.5rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background-color: #f0f4f8;
  border: none;
  border-radius: 8px;
  color: #4a5568;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #e2e8f0;
  transform: translateX(-2px);
}

.back-icon {
  font-size: 1.2rem;
}

.edit-title {
  color: #2c3e50;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: #4a5568;
}

.error {
  color: #e53e3e;
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.category-item {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  gap: 0.8rem;
  flex: 1;
}

.icon-input {
  width: 60px;
}

.name-input {
  flex: 1;
}

.url-input {
  flex: 2;
}

input {
  padding: 0.6rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: white;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.sites {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.site-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.delete-button {
  padding: 0.4rem 0.8rem;
  background-color: #fee2e2;
  border: none;
  border-radius: 6px;
  color: #dc2626;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-button:hover {
  background-color: #fecaca;
}

.add-button {
  padding: 0.8rem;
  background-color: #f0fdf4;
  border: 2px dashed #86efac;
  border-radius: 8px;
  color: #16a34a;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.add-button:hover {
  background-color: #dcfce7;
  border-color: #4ade80;
}

.category-add {
  margin-top: 1rem;
}

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.save-button {
  padding: 0.8rem 2rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.save-button:hover {
  background-color: #3aa876;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.2);
}

.save-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }

  .edit-container {
    padding: 1.5rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .form-group {
    flex-direction: column;
  }

  .icon-input,
  .name-input,
  .url-input {
    width: 100%;
  }

  .site-item {
    flex-direction: column;
  }

  .delete-button {
    align-self: flex-end;
  }
}
</style>