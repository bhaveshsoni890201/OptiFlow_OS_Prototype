<script setup lang="ts">
import { watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/20/solid'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    position?: 'left' | 'right'
    width?: string
    showClose?: boolean
  }>(),
  {
    position: 'right',
    width: '320px',
    showClose: true,
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
    <Transition name="drawer">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex"
        :class="[position === 'right' ? 'justify-end' : 'justify-start']"
      >
        <div class="absolute inset-0 bg-black/30" @click="close"></div>
        <div
          class="relative bg-white dark:bg-neutral-800 h-full shadow-elevated flex flex-col"
          :style="{ width, maxWidth: '100vw' }"
        >
          <div
            v-if="title || showClose"
            class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-neutral-700"
          >
            <h3 class="text-h3 font-semibold text-gray-900 dark:text-neutral-100">{{ title }}</h3>
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
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease;
}
.drawer-enter-from .bg-black,
.drawer-leave-to .bg-black {
  opacity: 0;
}
.drawer-enter-from > div:last-child {
  transform: translateX(100%);
}
.drawer-leave-to > div:last-child {
  transform: translateX(100%);
}
</style>
