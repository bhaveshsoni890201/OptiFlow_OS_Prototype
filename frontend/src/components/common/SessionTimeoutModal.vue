<script setup lang="ts">
defineProps<{
  countdown: number
}>()

const emit = defineEmits<{
  (e: 'extend'): void
  (e: 'logout'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
        <div class="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 mb-2">Session Expiring</h3>
        <p class="text-sm text-slate-500 mb-4">
          Your session will expire in <strong>{{ countdown }}</strong> second{{ countdown !== 1 ? 's' : '' }} due to inactivity.
        </p>
        <div class="flex items-center justify-center gap-3">
          <button
            class="px-4 h-10 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            @click="emit('logout')"
          >
            Log Out Now
          </button>
          <button
            class="px-4 h-10 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            @click="emit('extend')"
          >
            Stay Signed In
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>