interface GitHubConfig {
  owner: string
  repo: string
  path: string
  token?: string
}

const defaultConfig: GitHubConfig = {
  owner: 'MaxCosmos2001',
  repo: 'nav_data',
  path: 'nav.json',
  token: ''
}

const STORAGE_KEY = 'github_config'

// 从 localStorage 加载保存的配置
const loadSavedConfig = (): GitHubConfig => {
  try {
    const savedConfig = localStorage.getItem(STORAGE_KEY)
    return savedConfig ? { ...defaultConfig, ...JSON.parse(savedConfig) } : { ...defaultConfig }
  } catch (error) {
    console.error('Failed to load saved config:', error)
    return { ...defaultConfig }
  }
}

let currentConfig: GitHubConfig = loadSavedConfig()

export const getGitHubConfig = (): GitHubConfig => {
  return currentConfig
}

export const updateGitHubConfig = (newConfig: Partial<GitHubConfig>): void => {
  currentConfig = { ...currentConfig, ...newConfig }
  // 保存更新后的配置到 localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig))
  } catch (error) {
    console.error('Failed to save config:', error)
  }
}

export const resetGitHubConfig = (): void => {
  currentConfig = { ...defaultConfig }
  // 清除保存的配置
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear saved config:', error)
  }
}

export const getGitHubApiUrl = (): string => {
  const { owner, repo, path } = currentConfig
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
}

export const getGitHubToken = (): string => {
  return currentConfig.token || ''
}

export const updateGitHubFile = async (content: string): Promise<void> => {
  const { token } = currentConfig
  if (!token) {
    throw new Error('GitHub Token is required')
  }

  try {
    // 首先获取文件的当前 SHA
    const getResponse = await fetch(getGitHubApiUrl(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!getResponse.ok) {
      const errorData = await getResponse.json()
      throw new Error(`获取文件信息失败: ${errorData.message}`)
    }

    const data = await getResponse.json()
    const sha = data.sha

    // 准备更新的内容
    const encodedContent = btoa(unescape(encodeURIComponent(content)))
    
    // 更新文件
    const updateResponse = await fetch(getGitHubApiUrl(), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Update navigation data',
        content: encodedContent,
        sha
      })
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json()
      throw new Error(`保存文件失败: ${errorData.message}`)
    }
  } catch (error) {
    console.error('Failed to update GitHub file:', error)
    throw error instanceof Error ? error : new Error('保存导航数据时发生未知错误')
  }
}