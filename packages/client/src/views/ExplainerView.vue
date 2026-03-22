<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Explainer } from '@/types'
import * as api from '@/api/client'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'

const route = useRoute()
const router = useRouter()
const itemId = route.params.itemId as string

const explainer = ref<Explainer | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    explainer.value = await api.getExplainer(itemId)
  } catch {
    // Not cached, try generating
    try {
      explainer.value = await api.generateExplainer(itemId, '', '', null)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load explainer'
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="explainer-view">
    <button class="back-btn" @click="router.back()">&larr; Back</button>

    <LoadingSkeleton v-if="loading" :lines="10" />
    <div v-else-if="error" class="error">{{ error }}</div>
    <template v-else-if="explainer">
      <article class="explainer-content">
        <div class="summary" v-html="explainer.summary.replace(/\n/g, '<br>')" />

        <section class="significance">
          <h2>Why it matters</h2>
          <p>{{ explainer.significance }}</p>
        </section>

        <section v-if="explainer.criticQuotes.length" class="quotes">
          <h2>What critics say</h2>
          <blockquote v-for="(q, i) in explainer.criticQuotes" :key="i" class="critic-quote">
            <p>"{{ q.text }}"</p>
            <cite>— {{ q.attribution }}, <em>{{ q.source }}</em></cite>
          </blockquote>
        </section>

        <section v-if="explainer.listenFor.length" class="listen-for">
          <h2>Listen for...</h2>
          <ul>
            <li v-for="(tip, i) in explainer.listenFor" :key="i">{{ tip }}</li>
          </ul>
        </section>
      </article>
    </template>
  </div>
</template>

<style scoped>
.explainer-view {
  padding: 16px;
  max-width: 700px;
  margin: 0 auto;
}

.back-btn {
  background: none;
  color: var(--color-primary);
  font-size: 14px;
  padding: 8px 0;
  margin-bottom: 16px;
}

.explainer-content {
  font-size: 16px;
  line-height: 1.7;
}

.summary {
  margin-bottom: 32px;
}

section {
  margin-bottom: 28px;
}

h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--color-primary);
}

.critic-quote {
  margin: 16px 0;
  padding: 16px 20px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-surface);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.critic-quote p {
  font-style: italic;
  margin-bottom: 8px;
}

cite {
  font-size: 13px;
  color: var(--color-text-muted);
}

.listen-for ul {
  list-style: none;
  padding: 0;
}

.listen-for li {
  padding: 8px 0 8px 24px;
  position: relative;
  color: var(--color-text);
}

.listen-for li::before {
  content: '🎧';
  position: absolute;
  left: 0;
}

.error {
  padding: 16px;
  border-radius: var(--radius);
  background: #3b1c1c;
  color: #f87171;
  text-align: center;
}
</style>
