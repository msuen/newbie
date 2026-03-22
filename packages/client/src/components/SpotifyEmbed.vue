<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  spotifyUri: string | null
  compact?: boolean
}>()

const visible = ref(false)

const embedUrl = computed(() => {
  if (!props.spotifyUri) return null
  // Convert spotify:album:xxx or spotify:track:xxx to embed URL
  const parts = props.spotifyUri.replace('spotify:', '').split(':')
  if (parts.length === 2) {
    return `https://open.spotify.com/embed/${parts[0]}/${parts[1]}?theme=0`
  }
  return null
})

const height = computed(() => (props.compact ? '80' : '152'))
</script>

<template>
  <div
    v-if="embedUrl"
    class="spotify-embed"
    :class="{ loaded: visible }"
  >
    <div v-if="!visible" class="spotify-placeholder" @click="visible = true">
      <span>&#9654; Load preview</span>
    </div>
    <iframe
      v-if="visible"
      :src="embedUrl"
      :height="height"
      width="100%"
      frameborder="0"
      allow="encrypted-media"
      loading="lazy"
    />
  </div>
</template>

<style scoped>
.spotify-embed {
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: #282828;
}

.spotify-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  cursor: pointer;
  color: #1db954;
  font-size: 14px;
  transition: background 0.2s;
}

.spotify-placeholder:hover {
  background: #333;
}

iframe {
  display: block;
  border-radius: var(--radius-sm);
}
</style>
