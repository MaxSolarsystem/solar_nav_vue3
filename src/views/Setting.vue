<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getGitHubConfig, updateGitHubConfig } from '../config/github'

const router = useRouter()
const gitConfig = ref(getGitHubConfig())

const saveConfig = () => {
  updateGitHubConfig(gitConfig.value)
  console.log('保存配置:', gitConfig.value)
  router.push('/')
}

const goBack = () => {
  router.push('/')
}

const openGitHubTokenPage = () => {
  window.open('https://github.com/settings/tokens/new', '_blank')
}
</script>

<template>
  <div class="app-container">
    <div class="setting-container">
      <div class="header">
        <button class="back-button" @click="goBack">
          <span class="back-icon">←</span> 返回主页
        </button>
        <h2 class="setting-title">GitHub 配置</h2>
      </div>
      <form @submit.prevent="saveConfig" class="setting-form">
        <div class="form-section">
          <h3 class="section-title">仓库信息</h3>
          <div class="form-group">
            <label for="owner">仓库所有者</label>
            <input
              id="owner"
              v-model="gitConfig.owner"
              type="text"
              placeholder="请输入仓库所有者名称"
              required
            >
          </div>
          <div class="form-group">
            <label for="repo">仓库名称</label>
            <input
              id="repo"
              v-model="gitConfig.repo"
              type="text"
              placeholder="请输入仓库名称"
              required
            >
          </div>
          <div class="form-group">
            <label for="path">文件路径</label>
            <input
              id="path"
              v-model="gitConfig.path"
              type="text"
              placeholder="请输入导航文件路径"
              required
            >
          </div>
          <div class="form-group">
            <label for="token">GitHub Token</label>
            <div class="token-input-group">
              <input
                id="token"
                v-model="gitConfig.token"
                type="password"
                placeholder="请输入 GitHub Token"
                required
              >
              <button type="button" class="token-button" @click="openGitHubTokenPage">
                <svg class="token-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <path d="M15 3h6v6" />
                  <path d="M10 14L21 3" />
                </svg>
                获取 Token
              </button>
            </div>
            <div class="token-help">
              <p class="help-text">点击"获取 Token"按钮跳转到 GitHub Token 生成页面，请确保：</p>
              <ul class="permission-list">
                <li>Token 名称可以设置为 "Solar-Nav-Token"</li>
                <li>Token 有效期建议设置为 "No expiration"</li>
                <li>必须勾选以下权限：
                  <ul>
                    <li>repo (完整的仓库访问权限)</li>
                  </ul>
                </li>
              </ul>
            </div>
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

.token-input-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.token-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.token-button:hover {
  background-color: #2d3748;
  transform: translateY(-1px);
}

.token-icon {
  width: 18px;
  height: 18px;
}

.token-help {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #edf2f7;
  border-radius: 8px;
}

.help-text {
  color: #4a5568;
  font-size: 0.9rem;
  margin: 0 0 0.8rem 0;
}

.permission-list {
  color: #4a5568;
  font-size: 0.9rem;
  margin: 0;
  padding-left: 1.2rem;
}

.permission-list ul {
  margin-top: 0.4rem;
  padding-left: 1.2rem;
}

.permission-list li {
  margin-bottom: 0.4rem;
}

.permission-list li:last-child {
  margin-bottom: 0;
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

  .token-input-group {
    flex-direction: column;
    align-items: stretch;
  }

  .token-button {
    justify-content: center;
  }

  .save-button {
    width: 100%;
  }
}
</style>