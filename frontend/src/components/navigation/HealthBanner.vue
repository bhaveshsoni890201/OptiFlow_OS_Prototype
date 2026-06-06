<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useHealthCheck } from '../../composables/useHealthCheck'

const { status } = useHealthCheck()
</script>

<template>
  <Transition name="banner">
    <div
      v-if="!status.healthy && status.lastChecked"
      class="flex items-center gap-3 px-4 py-2.5 bg-red-500 text-white text-body font-semibold"
    >
      <ExclamationTriangleIcon class="h-5 w-5 shrink-0" />
      <span class="flex-1">
        Backend unreachable
        <span v-if="status.error">— {{ status.error }}</span>
      </span>
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