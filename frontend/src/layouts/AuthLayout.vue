<script setup lang="ts">
import { ref } from 'vue'
import type { Language } from '../types'

defineProps<{
  title: string
  subtitle: string
}>()

const currentLang = ref<Language>('en')

const languages: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'hinglish', label: 'Hinglish' },
]

function switchLang(lang: Language) {
  currentLang.value = lang
}
</script>

<template>
  <div class="flex min-h-screen">
    <div
      class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-50 to-brand-100 items-center justify-center p-12"
    >
      <div class="max-w-md">
        <div class="mb-6">
          <svg
            class="h-12 w-12 text-brand-600"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="40" rx="8" fill="currentColor" />
            <path
              d="M12 20L18 26L28 14"
              stroke="white"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-3">OptiFlow OS</h2>
        <p class="text-lg text-gray-600 leading-relaxed">
          Intelligent workflow orchestration for frontline teams. Assign, track, and optimize work
          in real-time.
        </p>
      </div>
    </div>

    <main
      class="flex-1 flex items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4 sm:p-6 lg:p-8"
    >
      <div class="w-full max-w-sm">
        <div class="text-center mb-8 lg:hidden">
          <svg
            class="h-10 w-10 text-brand-600 mx-auto mb-2"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="40" rx="8" fill="currentColor" />
            <path
              d="M12 20L18 26L28 14"
              stroke="white"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <h1 class="text-xl font-semibold text-gray-900">OptiFlow OS</h1>
        </div>

        <div class="flex justify-end mb-6">
          <select
            :value="currentLang"
            aria-label="Select language"
            class="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            @change="switchLang(($event.target as HTMLSelectElement).value as Language)"
          >
            <option v-for="lang in languages" :key="lang.value" :value="lang.value">
              {{ lang.label }}
            </option>
          </select>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div class="text-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
            <p v-if="subtitle" class="mt-1 text-sm text-gray-500">{{ subtitle }}</p>
          </div>

          <slot />
        </div>

        <p class="text-center text-xs text-gray-400 mt-8">
          &copy; {{ new Date().getFullYear() }} OptiFlow OS. All rights reserved.
        </p>
      </div>
    </main>
  </div>
</template>
