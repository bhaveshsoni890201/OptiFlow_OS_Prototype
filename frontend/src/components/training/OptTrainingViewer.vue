<script setup lang="ts">
import { ref, watch } from 'vue'
import { getTrainingContent } from '../../services'
import type { TrainingContent } from '../../types'
import {
  DocumentTextIcon,
  VideoCameraIcon,
  BookOpenIcon,
  PlayIcon,
  PauseIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  contentId: string
  contentType: 'sop' | 'video' | 'guide'
}>()

const emit = defineEmits<{
  loaded: []
  error: []
}>()

const content = ref<TrainingContent | null>(null)
const loading = ref(true)
const loadError = ref(false)
const videoPlaying = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
const contentViewed = ref(false)

watch(
  () => props.contentId,
  () => loadContent(),
  { immediate: true },
)

async function loadContent() {
  loading.value = true
  loadError.value = false
  content.value = null
  contentViewed.value = false
  videoPlaying.value = false
  try {
    const result = await getTrainingContent(props.contentId)
    if (!result) throw new Error('Content not found')
    content.value = result
    emit('loaded')
  } catch {
    loadError.value = true
    emit('error')
  } finally {
    loading.value = false
  }
}

function markViewed() {
  if (!contentViewed.value) {
    contentViewed.value = true
  }
}

function toggleVideo() {
  if (!videoRef.value) return
  if (videoPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
  videoPlaying.value = !videoPlaying.value
  markViewed()
}

function handleVideoEnded() {
  videoPlaying.value = false
}

function getIcon() {
  switch (props.contentType) {
    case 'sop':
      return DocumentTextIcon
    case 'video':
      return VideoCameraIcon
    case 'guide':
      return BookOpenIcon
  }
}
</script>

<template>
  <div class="min-h-[200px]">
    <div v-if="loading" class="flex items-center justify-center min-h-[200px]">
      <div class="h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <div
      v-else-if="loadError"
      class="flex flex-col items-center justify-center min-h-[200px] text-center"
    >
      <XCircleIcon class="h-8 w-8 text-danger-500 mx-auto mb-2" />
      <p class="text-body text-neutral-500">Failed to load content. Please try again.</p>
      <button
        class="mt-2 text-button text-brand-600 hover:text-brand-700"
        @click="loadContent"
      >
        Retry
      </button>
    </div>

    <div v-else-if="content">
      <!-- SOP: embedded HTML document -->
      <div
        v-if="contentType === 'sop'"
        class="prose prose-sm max-w-none text-neutral-700 leading-relaxed"
        @mouseenter="markViewed"
        @click="markViewed"
      >
        <div v-if="content.body" v-html="content.body" />
        <p v-else class="text-neutral-400 italic">No document content available.</p>
      </div>

      <!-- Video: HTML5 player with play/pause -->
      <div v-else-if="contentType === 'video'" class="space-y-3" @click="markViewed">
        <div
          class="relative bg-black rounded-lg overflow-hidden cursor-pointer"
          @click="toggleVideo"
        >
          <video
            ref="videoRef"
            :src="content.videoUrl"
            class="w-full max-h-[320px] object-contain bg-black"
            :poster="content.videoUrl ? undefined : undefined"
            @ended="handleVideoEnded"
            @play="markViewed"
          />
          <div
            v-if="!videoPlaying"
            class="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40"
          >
            <div
              class="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center transition-transform hover:scale-110"
            >
              <PlayIcon class="h-6 w-6 text-neutral-900 ml-0.5" />
            </div>
          </div>
        </div>
        <p v-if="content.body" class="text-caption text-neutral-500">{{ content.body }}</p>
        <div v-if="videoPlaying" class="flex items-center gap-2">
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-700 text-button hover:bg-neutral-200 transition-colors"
            @click="toggleVideo"
          >
            <PauseIcon class="h-4 w-4" /> Pause
          </button>
        </div>
      </div>

      <!-- Guide: rendered formatted text -->
      <div
        v-else-if="contentType === 'guide'"
        class="prose prose-sm max-w-none text-neutral-700 leading-relaxed"
        @mouseenter="markViewed"
        @click="markViewed"
      >
        <div v-if="content.body" v-html="content.body" />
        <p v-else class="text-neutral-400 italic">No guide content available.</p>
      </div>
    </div>
  </div>
</template>
