import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Roadmap, UserProgress } from '@/types'
import * as api from '@/api/client'

export const useRoadmapStore = defineStore('roadmap', () => {
  const currentRoadmap = ref<Roadmap | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const progressMap = ref<Record<string, string[]>>({})
  const favorites = ref<Set<string>>(new Set())

  async function generate(query: string, queryType: 'artist' | 'genre') {
    loading.value = true
    error.value = null
    try {
      currentRoadmap.value = await api.generateRoadmap(query, queryType)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to generate roadmap'
    } finally {
      loading.value = false
    }
  }

  async function fetchRoadmap(id: string) {
    loading.value = true
    error.value = null
    try {
      currentRoadmap.value = await api.getRoadmap(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load roadmap'
    } finally {
      loading.value = false
    }
  }

  async function fetchShared(shareCode: string) {
    loading.value = true
    error.value = null
    try {
      currentRoadmap.value = await api.getSharedRoadmap(shareCode)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load shared roadmap'
    } finally {
      loading.value = false
    }
  }

  async function toggleStepComplete(roadmapId: string, stepId: string) {
    const current = progressMap.value[roadmapId] || []
    const updated = current.includes(stepId)
      ? current.filter((id) => id !== stepId)
      : [...current, stepId]
    progressMap.value[roadmapId] = updated
    try {
      await api.updateProgress(roadmapId, updated)
    } catch {
      // revert on error
      progressMap.value[roadmapId] = current
    }
  }

  async function loadProgress() {
    try {
      const progress = await api.getProgress()
      for (const p of progress) {
        progressMap.value[p.roadmapId] = p.completedStepIds
      }
    } catch {
      // silent fail for anonymous users
    }
  }

  async function toggleFavorite(roadmapId: string) {
    if (favorites.value.has(roadmapId)) {
      favorites.value.delete(roadmapId)
      await api.removeFavorite(roadmapId).catch(() => favorites.value.add(roadmapId))
    } else {
      favorites.value.add(roadmapId)
      await api.addFavorite(roadmapId).catch(() => favorites.value.delete(roadmapId))
    }
  }

  function isStepComplete(roadmapId: string, stepId: string): boolean {
    return (progressMap.value[roadmapId] || []).includes(stepId)
  }

  function completedCount(roadmapId: string): number {
    return (progressMap.value[roadmapId] || []).length
  }

  return {
    currentRoadmap,
    loading,
    error,
    progressMap,
    favorites,
    generate,
    fetchRoadmap,
    fetchShared,
    toggleStepComplete,
    loadProgress,
    toggleFavorite,
    isStepComplete,
    completedCount,
  }
})
