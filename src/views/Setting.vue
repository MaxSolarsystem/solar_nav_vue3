<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const gitConfig = ref({
  repository: '',
  branch: '',
  username: '',
  token: ''
})

const saveConfig = () => {
  // TODO: 实现保存配置的逻辑
  console.log('保存配置:', gitConfig.value)
}

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="app-container">
    <div class="setting-container">
      <div class="header">
        <button class="back-button" @click="goBack">
          <span class="back-icon">←</span> 返回主页
        </button>
        <h2 class="setting-title">Git 配置</h2>
      </div>
      <form @submit.prevent="saveConfig" class="setting-form">
        <div class="form-section">
          <h3 class="section-title">仓库信息</h3>
          <div class="form-group">
            <label for="repository">仓库地址</label>
            <input
              id="repository"
              v-model="gitConfig.repository"
              type="text"
              placeholder="请输入Git仓库地址"
              required
            >
          </div>
          <div class="form-group">
            <label for="branch">分支名称</label>
            <input
              id="branch"
              v-model="gitConfig.branch"
              type="text"
              placeholder="请输入分支名称"
              required
            >
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">认证信息</h3>
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              id="username"
              v-model="gitConfig.username"
              type="text"
              placeholder="请输入Git用户名"
              required
            >
          </div>
          <div class="form-group">
            <label for="token">访问令牌</label>
            <input
              id="token"
              v-model="gitConfig.token"
              type="password"
              placeholder="请输入访问令牌"
              required
            >
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="save-button">保存配置</button>
        </div>
      </form>
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

.setting-container {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  width: 100%;
  max-width: 680px;
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

.setting-title {
  color: #2c3e50;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.setting-form {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.form-section {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1.2rem 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.2rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

label {
  color: #4a5568;
  font-weight: 500;
  font-size: 0.95rem;
}

input {
  padding: 0.8rem 1rem;
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

input::placeholder {
  color: #a0aec0;
}

.form-actions {
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

.save-button:active {
  transform: translateY(0);
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }

  .setting-container {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .header {
    margin-bottom: 2rem;
    gap: 1rem;
  }

  .setting-title {
    font-size: 1.5rem;
  }

  .form-section {
    padding: 1.2rem;
  }

  .save-button {
    width: 100%;
  }
}
</style>