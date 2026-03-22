<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoadmapStore } from '@/stores/roadmap'
import SpotifyEmbed from '@/components/SpotifyEmbed.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'

const route = useRoute()
const router = useRouter()
const store = useRoadmapStore()

const roadmapId = computed(() => route.params.roadmapId as string)
const stepId = computed(() => route.params.stepId as string)
const expandedItem = ref<string | null>(null)

const step = computed(() => {
  return store.currentRoadmap?.steps.find((s) => s.id === stepId.value)
})

onMounted(() => {
  if (!store.currentRoadmap || store.currentRoadmap.id !== roadmapId.value) {
    store.fetchRoadmap(roadmapId.value)
  }
})

function toggleItem(itemId: string) {
  expandedItem.value = expandedItem.value === itemId ? null : itemId
}

function goToExplainer(itemId: string) {
  router.push(`/explainer/${itemId}`)
}
</script>

<template>
  <div class="step-detail">
    <LoadingSkeleton v-if="store.loading" :lines="6" />
    <template v-else-if="step">
      <header>
        <button class="back-btn" @click="router.push(`/roadmap/${roadmapId}`)">
          &larr; Back to roadmap
        </button>
        <h1>{{ step.title }}</h1>
        <p class="step-desc">{{ step.description }}</p>
      </header>

      <div class="items-list">
        <div
          v-for="item in step.items"
          :key="item.id"
          class="item-card"
          :class="{ expanded: expandedItem === item.id }"
        >
          <div class="item-header" @click="toggleItem(item.id)">
            <div class="item-info">
              <span class="item-type">{{ item.type }}</span>
              <h3>{{ item.title }}</h3>
              <p class="item-artist">{{ item.artist }}<span v-if="item.year"> ({{ item.year }})</span></p>
            </div>
            <span class="expand-icon">{{ expandedItem === item.id ? '&#9650;' : '&#9660;' }}</span>
          </div>

          <div v-if="expandedItem === item.id" class="item-expanded">
            <p class="why-listen">{{ item.whyListen }}</p>
            <SpotifyEmbed :spotify-uri="item.spotifyUri" compact />
            <div class="item-actions">
              <button class="action-btn" @click="goToExplainer(item.id)">
                Read explainer
              </button>
              <a
                v-if="item.spotifyUri"
                :href="`https://open.spotify.com/${item.spotifyUri.replace('spotify:', '').replace(':', '/')}`"
                target="_blank"
                class="action-link"
              >
                Open in Spotify
              </a>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.step-detail {
  padding: 16px;
  max-width: 700px;
  margin: 0 auto;
}

.back-btn {
  background: none;
  color: var(--color-primary);
  font-size: 14px;
  padding: 8px 0;
  margin-bottom: 8px;
}

header h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.step-desc {
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: border-color 0.2s;
}

.item-card.expanded {
  border-color: var(--color-primary);
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  min-height: 44px;
}

.item-info {
  flex: 1;
}

.item-type {
  display: inline-block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-accent);
  background: rgba(245, 158, 11, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.item-info h3 {
  font-size: 16px;
  font-weight: 600;
}

.item-artist {
  font-size: 14px;
  color: var(--color-text-muted);
}

.expand-icon {
  color: var(--color-text-muted);
  font-size: 12px;
  padding: 8px;
}

.item-expanded {
  padding: 0 16px 16px;
}

.why-listen {
  font-size: 14px;
  color: var(--color-text);
  margin-bottom: 12px;
  font-style: italic;
}

.item-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.action-link {
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-light);
  color: var(--color-text);
  font-size: 14px;
  display: inline-flex;
  align-items: center;
}
</style>
