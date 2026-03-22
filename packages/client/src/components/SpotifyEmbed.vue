<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  spotifyUri: string | null
  title?: string
  artist?: string
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

const searchUrl = computed(() => {
  if (props.title && props.artist) {
    return `https://open.spotify.com/search/${encodeURIComponent(`${props.title} ${props.artist}`)}`
  }
  return null
})

const height = computed(() => (props.compact ? '80' : '152'))
</script>

<template>
  <div class="spotify-embed" :class="{ loaded: visible }">
    <template v-if="embedUrl">
      <div v-if="!visible" class="spotify-placeholder" @click="visible = true">
        <span class="play-icon">&#9654;</span>
        <span>Load preview</span>
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
    </template>
    <a
      v-else-if="searchUrl"
      :href="searchUrl"
      target="_blank"
      rel="noopener"
      class="spotify-search-link"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
      <span>Find on Spotify</span>
    </a>
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
  gap: 8px;
  height: 80px;
  cursor: pointer;
  color: #1db954;
  font-size: 14px;
  transition: background 0.2s;
}

.spotify-placeholder:hover {
  background: #333;
}

.play-icon {
  font-size: 16px;
}

.spotify-search-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  color: #1db954;
  font-size: 14px;
  text-decoration: none;
  transition: background 0.2s;
}

.spotify-search-link:hover {
  background: #333;
}

iframe {
  display: block;
  border-radius: var(--radius-sm);
}
</style>
