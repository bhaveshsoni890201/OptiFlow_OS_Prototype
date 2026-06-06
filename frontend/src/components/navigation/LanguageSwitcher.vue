<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'

const props = withDefaults(
  defineProps<{
    modelValue: string
    showOriginal?: boolean
  }>(),
  {
    modelValue: 'en',
    showOriginal: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:showOriginal': [value: boolean]
}>()

const isOpen = ref(false)

const languages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'hinglish', label: 'Hinglish', native: 'Hinglish' },
]

const currentLabel = ref(languages.find((l) => l.code === props.modelValue)?.native || 'English')

function select(code: string) {
  emit('update:modelValue', code)
  currentLabel.value = languages.find((l) => l.code === code)?.native || 'English'
  isOpen.value = false
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="flex items-center gap-1 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="isOpen = !isOpen"
    >
      <span>{{ currentLabel }}</span>
      <ChevronDownIcon class="w-3.5 h-3.5" />
    </button>
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg shadow-elevated py-1 z-50"
      >
        <button
          v-for="lang in languages"
          :key="lang.code"
          type="button"
          class="w-full px-3 py-2 text-sm text-left transition-colors"
          :class="
            modelValue === lang.code
              ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/20 font-medium'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
          "
          @click="select(lang.code)"
        >
          <span>{{ lang.native }}</span>
          <span class="text-caption text-neutral-400 ml-1">({{ lang.label }})</span>
        </button>
        <hr class="my-1 border-neutral-200 dark:border-neutral-600" />
        <label
          class="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="showOriginal"
            class="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
            @change="emit('update:showOriginal', ($event.target as HTMLInputElement).checked)"
          />
          <span>View Original</span>
        </label>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
