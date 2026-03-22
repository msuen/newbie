<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoadmapStore } from '@/stores/roadmap'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'

const route = useRoute()
const router = useRouter()
const store = useRoadmapStore()

const shareCode = computed(() => route.params.shareCode as string)

onMounted(() => {
  store.fetchShared(shareCode.value)
})

function saveToLibrary() {
  if (store.currentRoadmap) {
    router.push(`/roadmap/${store.currentRoadmap.id}`)
  }
}
</script>

<template>
  <div class="shared-view">
    <LoadingSkeleton v-if="store.loading" :lines="6" />
    <div v-else-if="store.error" class="error">{{ store.error }}</div>
    <template v-else-if="store.currentRoadmap">
      <header>
        <span class="shared-badge">Shared roadmap</span>
        <h1>{{ store.currentRoadmap.title }}</h1>
        <p class="desc">{{ store.currentRoadmap.description }}</p>
      </header>

      <div class="steps-preview">
        <div
          v-for="step in store.currentRoadmap.steps"
          :key="step.id"
          class="step-preview"
        >
          <h3>{{ step.order }}. {{ step.title }}</h3>
          <p>{{ step.description }}</p>
          <span class="item-count">{{ step.items.length }} items</span>
        </div>
      </div>

      <button class="save-btn" @click="saveToLibrary">
        Save to my library
      </button>
    </template>
  </div>
</template>

<style scoped>
.shared-view {
  padding: 16px;
  max-width: 700px;
  margin: 0 auto;
}

.shared-badge {
  display: inline-block;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-accent);
  background: rgba(245, 158, 11, 0.15);
  padding: 4px 12px;
  border-radius: 4px;
  margin-bottom: 12px;
}

header h1 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
}

.desc {
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.steps-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.step-preview {
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.step-preview h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.step-preview p {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.item-count {
  font-size: 12px;
  color: var(--color-primary);
}

.save-btn {
  width: 100%;
  padding: 16px;
  border-radius: var(--radius);
  background: var(--color-primary);
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.error {
  padding: 16px;
  border-radius: var(--radius);
  background: #3b1c1c;
  color: #f87171;
  text-align: center;
}
</style>
