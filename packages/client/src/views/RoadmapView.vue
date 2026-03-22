<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoadmapStore } from '@/stores/roadmap'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import * as api from '@/api/client'

const route = useRoute()
const router = useRouter()
const store = useRoadmapStore()

const roadmapId = computed(() => route.params.id as string)
const roadmap = computed(() => store.currentRoadmap)
const totalSteps = computed(() => roadmap.value?.steps.length || 0)
const completed = computed(() => store.completedCount(roadmapId.value))
const progressPercent = computed(() =>
  totalSteps.value > 0 ? Math.round((completed.value / totalSteps.value) * 100) : 0
)

onMounted(() => {
  if (!roadmap.value || roadmap.value.id !== roadmapId.value) {
    store.fetchRoadmap(roadmapId.value)
  }
})

function goToStep(stepId: string) {
  router.push(`/roadmap/${roadmapId.value}/step/${stepId}`)
}

async function share() {
  try {
    const result = await api.shareRoadmap(roadmapId.value)
    const url = `${window.location.origin}/s/${result.shareCode}`
    if (navigator.share) {
      await navigator.share({ title: roadmap.value?.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  } catch {
    // user cancelled share
  }
}
</script>

<template>
  <div class="roadmap-view">
    <LoadingSkeleton v-if="store.loading" :lines="8" />
    <div v-else-if="store.error" class="error">{{ store.error }}</div>
    <template v-else-if="roadmap">
      <header class="roadmap-header">
        <button class="back-btn" @click="router.push('/')">&larr; Back</button>
        <h1>{{ roadmap.title }}</h1>
        <p class="roadmap-desc">{{ roadmap.description }}</p>

        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
          </div>
          <span class="progress-label">{{ completed }}/{{ totalSteps }} steps</span>
        </div>
      </header>

      <div class="timeline">
        <div
          v-for="step in roadmap.steps"
          :key="step.id"
          class="timeline-step"
          :class="{ completed: store.isStepComplete(roadmapId, step.id) }"
        >
          <div class="timeline-node">
            <div class="node-circle" @click="store.toggleStepComplete(roadmapId, step.id)">
              <span v-if="store.isStepComplete(roadmapId, step.id)">&#10003;</span>
              <span v-else>{{ step.order }}</span>
            </div>
            <div class="node-line" />
          </div>
          <div class="step-card" @click="goToStep(step.id)">
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
            <span class="item-count">{{ step.items.length }} items</span>
          </div>
        </div>
      </div>

      <button class="share-fab" @click="share" title="Share roadmap">
        &#8599;
      </button>
    </template>
  </div>
</template>

<style scoped>
.roadmap-view {
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

.roadmap-header h1 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
}

.roadmap-desc {
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--color-surface-light);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-label {
  font-size: 13px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.timeline {
  display: flex;
  flex-direction: column;
}

.timeline-step {
  display: flex;
  gap: 16px;
}

.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.node-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-surface-light);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-muted);
}

.timeline-step.completed .node-circle {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.node-line {
  width: 2px;
  flex: 1;
  background: var(--color-border);
  min-height: 20px;
}

.timeline-step:last-child .node-line {
  display: none;
}

.step-card {
  flex: 1;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  margin-bottom: 16px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.step-card:hover {
  border-color: var(--color-primary);
}

.step-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.step-card p {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.item-count {
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 500;
}

.share-fab {
  position: fixed;
  bottom: 88px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  transition: transform 0.2s;
}

.share-fab:hover {
  transform: scale(1.1);
}

.error {
  padding: 16px;
  border-radius: var(--radius);
  background: #3b1c1c;
  color: #f87171;
  text-align: center;
}
</style>
