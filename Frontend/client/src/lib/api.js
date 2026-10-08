// src/lib/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: '/api', // Replace with your actual backend URL
})

api.interceptors.request.use(
  (config) => {
    // Look specifically for 'servicedesk_token'
    const token = localStorage.getItem('servicedesk_token')

    if (token) {
      const cleanToken = token.replace(/^"(.*)"$/, '$1').trim()
      config.headers.Authorization = `Bearer ${cleanToken}`
    } else {
      console.warn('⚠️ No servicedesk_token found in localStorage!')
    }

    return config
  },
  (error) => Promise.reject(error)
)

export const getErrorMessage = (error) => {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    'An unexpected error occurred.'
  )
}

export default api