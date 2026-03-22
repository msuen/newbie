<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRoadmapStore } from '@/stores/roadmap'

const router = useRouter()
const auth = useAuthStore()
const roadmap = useRoadmapStore()

onMounted(() => {
  auth.checkAuth()
  roadmap.loadProgress()
})
</script>

<template>
  <div class="app-shell">
    <main class="app-main">
      <router-view />
    </main>
    <nav class="bottom-nav">
      <button class="nav-item" :class="{ active: $route.name === 'home' }" @click="router.push('/')">
        <span class="nav-icon">&#9901;</span>
        <span class="nav-label">Home</span>
      </button>
      <button class="nav-item" :class="{ active: $route.name === 'profile' }" @click="router.push('/profile')">
        <span class="nav-icon">&#9734;</span>
        <span class="nav-label">Library</span>
      </button>
      <button class="nav-item" :class="{ active: $route.name === 'profile' }" @click="router.push('/profile')">
        <span class="nav-icon">&#9786;</span>
        <span class="nav-label">Profile</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  padding-bottom: 72px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 8px 0;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px;
  background: none;
  color: var(--color-text-muted);
  min-height: 44px;
  min-width: 44px;
  transition: color 0.2s;
}

.nav-item.active {
  color: var(--color-primary);
}

.nav-icon {
  font-size: 20px;
}

.nav-label {
  font-size: 11px;
}
</style>
