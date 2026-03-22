import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import * as api from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('newbie-token'))
  const isLoggedIn = computed(() => !!token.value)

  async function checkAuth() {
    if (!token.value) return
    try {
      user.value = await api.getMe()
    } catch {
      logout()
    }
  }

  async function loginUser(email: string, password: string) {
    const result = await api.login(email, password)
    token.value = result.token
    user.value = result.user
    localStorage.setItem('newbie-token', result.token)
  }

  async function registerUser(email: string, password: string, displayName: string) {
    const result = await api.register(email, password, displayName)
    token.value = result.token
    user.value = result.user
    localStorage.setItem('newbie-token', result.token)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('newbie-token')
  }

  return { user, token, isLoggedIn, checkAuth, loginUser, registerUser, logout }
})
