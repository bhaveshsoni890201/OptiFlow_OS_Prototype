<script setup lang="ts">
import { watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/20/solid'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    showClose?: boolean
    maxHeight?: string
  }>(),
  {
    showClose: true,
    maxHeight: '80vh',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="bottom-sheet">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end">
        <div class="absolute inset-0 bg-black/30" @click="close"></div>
        <div
          class="relative w-full bg-white dark:bg-neutral-800 rounded-t-2xl shadow-modal flex flex-col"
          :style="{ maxHeight }"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-neutral-700 shrink-0"
          >
            <div class="flex items-center gap-2">
              <div class="w-10 h-1 rounded-full bg-gray-300 dark:bg-neutral-600 -ml-1"></div>
              <h3 v-if="title" class="text-h3 font-semibold text-gray-900 dark:text-neutral-100">
                {{ title }}
              </h3>
            </div>
            <button
              v-if="showClose"
              class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400"
              aria-label="Close"
              @click="close"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-4">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  transition: all 0.3s ease;
}
.bottom-sheet-enter-from .bg-black,
.bottom-sheet-leave-to .bg-black {
  opacity: 0;
}
.bottom-sheet-enter-from > div:last-child {
  transform: translateY(100%);
}
.bottom-sheet-leave-to > div:last-child {
  transform: translateY(100%);
}
</style>
