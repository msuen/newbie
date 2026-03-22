<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  search: [query: string, queryType: 'artist' | 'genre']
}>()

const query = ref('')
const queryType = ref<'artist' | 'genre'>('artist')

function submit() {
  const q = query.value.trim()
  if (!q) return
  emit('search', q, queryType.value)
}
</script>

<template>
  <div class="search-bar">
    <div class="search-toggle">
      <button
        :class="{ active: queryType === 'artist' }"
        @click="queryType = 'artist'"
      >
        Artist
      </button>
      <button
        :class="{ active: queryType === 'genre' }"
        @click="queryType = 'genre'"
      >
        Genre
      </button>
    </div>
    <form class="search-form" @submit.prevent="submit">
      <input
        v-model="query"
        type="text"
        :placeholder="queryType === 'artist' ? 'Enter an artist name...' : 'Enter a genre...'"
        class="search-input"
      />
      <button type="submit" class="search-btn">Explore</button>
    </form>
  </div>
</template>

<style scoped>
.search-bar {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.search-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  justify-content: center;
}

.search-toggle button {
  padding: 8px 20px;
  border-radius: 20px;
  background: var(--color-surface-light);
  color: var(--color-text-muted);
  font-size: 14px;
  transition: all 0.2s;
}

.search-toggle button.active {
  background: var(--color-primary);
  color: white;
}

.search-form {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 14px 18px;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--color-primary);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-btn {
  padding: 14px 24px;
  border-radius: var(--radius);
  background: var(--color-primary);
  color: white;
  font-size: 16px;
  font-weight: 600;
  transition: background 0.2s;
}

.search-btn:hover {
  background: var(--color-primary-dark);
}
</style>
