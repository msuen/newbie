<script setup lang="ts">
defineProps<{
  lines?: number
}>()
</script>

<template>
  <div class="skeleton-container">
    <div v-for="i in (lines || 4)" :key="i" class="skeleton-line" :style="{ width: `${60 + Math.random() * 40}%` }" />
  </div>
</template>

<style scoped>
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.skeleton-line {
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    var(--color-surface-light) 25%,
    var(--color-surface) 50%,
    var(--color-surface-light) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
