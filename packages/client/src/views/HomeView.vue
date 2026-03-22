<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useRoadmapStore } from '@/stores/roadmap'
import SearchBar from '@/components/SearchBar.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'

const router = useRouter()
const store = useRoadmapStore()

const suggestions = [
  { label: 'Jazz', queryType: 'genre' as const },
  { label: 'Hip-Hop', queryType: 'genre' as const },
  { label: 'Classical', queryType: 'genre' as const },
  { label: 'Radiohead', queryType: 'artist' as const },
  { label: 'Beatles', queryType: 'artist' as const },
  { label: 'Electronic', queryType: 'genre' as const },
  { label: 'Kendrick Lamar', queryType: 'artist' as const },
  { label: 'R&B / Soul', queryType: 'genre' as const },
]

async function handleSearch(query: string, queryType: 'artist' | 'genre') {
  await store.generate(query, queryType)
  if (store.currentRoadmap) {
    router.push(`/roadmap/${store.currentRoadmap.id}`)
  }
}

function exploreSuggestion(s: { label: string; queryType: 'artist' | 'genre' }) {
  handleSearch(s.label, s.queryType)
}
</script>

<template>
  <div class="home">
    <header class="home-header">
      <h1 class="logo">Newbie</h1>
      <p class="tagline">Your music discovery roadmap</p>
    </header>

    <SearchBar @search="handleSearch" />

    <div v-if="store.loading" class="loading-state">
      <p class="loading-text">Generating your roadmap...</p>
      <LoadingSkeleton :lines="6" />
    </div>

    <div v-if="store.error" class="error-state">
      <p>{{ store.error }}</p>
    </div>

    <section class="suggestions">
      <h2>Popular starting points</h2>
      <div class="suggestion-grid">
        <button
          v-for="s in suggestions"
          :key="s.label"
          class="suggestion-card"
          :disabled="store.loading"
          @click="exploreSuggestion(s)"
        >
          <span class="suggestion-type">{{ s.queryType }}</span>
          <span class="suggestion-label">{{ s.label }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  padding: 24px 16px;
  max-width: 700px;
  margin: 0 auto;
}

.home-header {
  text-align: center;
  margin-bottom: 32px;
  padding-top: 32px;
}

.logo {
  font-size: 40px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  color: var(--color-text-muted);
  margin-top: 4px;
  font-size: 16px;
}

.loading-state {
  margin-top: 24px;
}

.loading-text {
  text-align: center;
  color: var(--color-primary);
  margin-bottom: 16px;
  font-weight: 500;
}

.error-state {
  margin-top: 24px;
  padding: 16px;
  border-radius: var(--radius);
  background: #3b1c1c;
  color: #f87171;
  text-align: center;
}

.suggestions {
  margin-top: 40px;
}

.suggestions h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text-muted);
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.suggestion-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  border-radius: var(--radius);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transition: all 0.2s;
  min-height: 44px;
}

.suggestion-card:hover:not(:disabled) {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.suggestion-card:disabled {
  opacity: 0.5;
}

.suggestion-type {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
  margin-bottom: 4px;
}

.suggestion-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

@media (min-width: 640px) {
  .suggestion-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
