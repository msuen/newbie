<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoadmapStore } from '@/stores/roadmap'
import type { Roadmap } from '@/types'
import * as api from '@/api/client'

const auth = useAuthStore()
const roadmapStore = useRoadmapStore()

const favoriteRoadmaps = ref<Roadmap[]>([])
const showLogin = ref(false)
const showRegister = ref(false)
const email = ref('')
const password = ref('')
const displayName = ref('')
const authError = ref<string | null>(null)

onMounted(async () => {
  try {
    favoriteRoadmaps.value = await api.getFavorites()
  } catch {
    // not logged in or no favorites
  }
})

async function handleLogin() {
  authError.value = null
  try {
    await auth.loginUser(email.value, password.value)
    showLogin.value = false
    favoriteRoadmaps.value = await api.getFavorites()
  } catch (e) {
    authError.value = e instanceof Error ? e.message : 'Login failed'
  }
}

async function handleRegister() {
  authError.value = null
  try {
    await auth.registerUser(email.value, password.value, displayName.value)
    showRegister.value = false
    favoriteRoadmaps.value = await api.getFavorites()
  } catch (e) {
    authError.value = e instanceof Error ? e.message : 'Registration failed'
  }
}
</script>

<template>
  <div class="profile-view">
    <h1>Library</h1>

    <template v-if="auth.isLoggedIn && auth.user">
      <div class="user-info">
        <p>Welcome, <strong>{{ auth.user.displayName }}</strong></p>
        <button class="logout-btn" @click="auth.logout()">Log out</button>
      </div>
    </template>
    <template v-else>
      <div class="auth-prompt">
        <p>Create an account to sync your progress across devices.</p>
        <div class="auth-buttons">
          <button class="btn-primary" @click="showLogin = true">Log in</button>
          <button class="btn-secondary" @click="showRegister = true">Sign up</button>
        </div>
      </div>
    </template>

    <!-- Login Modal -->
    <div v-if="showLogin" class="modal-overlay" @click.self="showLogin = false">
      <div class="modal">
        <h2>Log in</h2>
        <form @submit.prevent="handleLogin">
          <input v-model="email" type="email" placeholder="Email" required />
          <input v-model="password" type="password" placeholder="Password" required />
          <div v-if="authError" class="auth-error">{{ authError }}</div>
          <button type="submit" class="btn-primary">Log in</button>
        </form>
      </div>
    </div>

    <!-- Register Modal -->
    <div v-if="showRegister" class="modal-overlay" @click.self="showRegister = false">
      <div class="modal">
        <h2>Create account</h2>
        <form @submit.prevent="handleRegister">
          <input v-model="displayName" type="text" placeholder="Display name" required />
          <input v-model="email" type="email" placeholder="Email" required />
          <input v-model="password" type="password" placeholder="Password" required minlength="8" />
          <div v-if="authError" class="auth-error">{{ authError }}</div>
          <button type="submit" class="btn-primary">Sign up</button>
        </form>
      </div>
    </div>

    <section class="favorites-section">
      <h2>Favorites</h2>
      <div v-if="favoriteRoadmaps.length === 0" class="empty">
        <p>No favorites yet. Explore some roadmaps!</p>
      </div>
      <div v-else class="favorites-list">
        <router-link
          v-for="r in favoriteRoadmaps"
          :key="r.id"
          :to="`/roadmap/${r.id}`"
          class="favorite-card"
        >
          <h3>{{ r.title }}</h3>
          <p>{{ r.description }}</p>
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.profile-view {
  padding: 24px 16px;
  max-width: 700px;
  margin: 0 auto;
}

h1 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--color-surface);
  border-radius: var(--radius);
  margin-bottom: 24px;
}

.logout-btn {
  background: none;
  color: var(--color-text-muted);
  font-size: 14px;
}

.auth-prompt {
  padding: 24px;
  background: var(--color-surface);
  border-radius: var(--radius);
  text-align: center;
  margin-bottom: 24px;
}

.auth-prompt p {
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

.auth-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary {
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: white;
  font-weight: 600;
}

.btn-secondary {
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-light);
  color: var(--color-text);
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: var(--color-surface);
  padding: 32px;
  border-radius: var(--radius);
  width: 90%;
  max-width: 400px;
}

.modal h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

.modal form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal input {
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 16px;
}

.auth-error {
  color: #f87171;
  font-size: 14px;
}

.favorites-section h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}

.empty p {
  color: var(--color-text-muted);
  text-align: center;
  padding: 32px;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.favorite-card {
  display: block;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  color: var(--color-text);
  transition: border-color 0.2s;
}

.favorite-card:hover {
  border-color: var(--color-primary);
}

.favorite-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.favorite-card p {
  font-size: 14px;
  color: var(--color-text-muted);
}
</style>
