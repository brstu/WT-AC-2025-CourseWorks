import axios from 'axios'

const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const instance = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' }
})

// helper to set auth header programmatically
export function setAuthToken(token?: string | null){
  if(token){
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }else{
    delete instance.defaults.headers.common['Authorization']
  }
}

// добавляем Authorization если есть token в localStorage
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    if (!config.headers) config.headers = {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default instance
