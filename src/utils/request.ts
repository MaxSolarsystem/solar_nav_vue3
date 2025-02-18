import axios from 'axios'
import type { AxiosInstance } from 'axios'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '', // 设置默认的基础URL
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

export default service