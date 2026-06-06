<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useOfflineStore } from '../../stores/offlineStore'
import { WifiIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/vue/20/solid'

const offlineStore = useOfflineStore()
const dismissed = ref(false)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const RETRY_INTERVAL = 30

function startCountdown() {
  countdown.value = RETRY_INTERVAL
  timer = setInterval(() => {
    if (countdown.value > 0) countdown.value--
    else {
      countdown.value = RETRY_INTERVAL
      if (offlineStore.pendingCount > 0) {
        offlineStore.syncQueue().catch(() => {})
      }
    }
  }, 1000)
}

function stopCountdown() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

watch(
  () => offlineStore.isOnline,
  (online) => {
    if (online) {
      dismissed.value = false
      stopCountdown()
    } else {
      startCountdown()
    }
  },
  { immediate: true },
)

function dismiss() {
  dismissed.value = true
}

onUnmounted(stopCountdown)
</script>

<template>
  <Transition name="banner">
    <div
      v-if="!offlineStore.isOnline && !dismissed"
      class="flex items-center gap-3 px-4 py-2.5 bg-warning-500 text-white text-body font-semibold"
    >
      <WifiIcon class="h-5 w-5 shrink-0" />
      <span class="flex-1">
        You're offline
        <span v-if="offlineStore.pendingCount > 0">
          — {{ offlineStore.pendingCount }} pending change{{ offlineStore.pendingCount > 1 ? 's' : '' }} &middot; retry in {{ countdown }}s
        </span>
        <span v-else>— changes will be saved locally</span>
      </span>
      <span
        v-if="offlineStore.pendingCount > 0"
        class="flex items-center gap-1 text-sm"
      >
        <ArrowPathIcon class="h-4 w-4 animate-spin" />
      </span>
      <button
        class="p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
        @click="dismiss"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: all 0.3s ease;
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
