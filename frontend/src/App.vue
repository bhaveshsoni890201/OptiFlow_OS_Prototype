<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from './stores/useStore'
import { getProfile } from './services/authService'

const store = useStore()
const { locale } = useI18n()
const router = useRouter()
const isRouteLoading = ref(false)

router.beforeResolve(() => {
  isRouteLoading.value = true
})

router.afterEach(() => {
  isRouteLoading.value = false
})

watch(() => store.language, (lang) => {
  locale.value = lang
}, { immediate: true })

onMounted(() => {
  try {
    const saved = localStorage.getItem('optiflow-theme') as 'light' | 'dark' | 'high-contrast' | null
    if (saved) store.setTheme(saved)
  } catch {
    // localStorage unavailable (incognito, storage blocked)
  }
  // Restore auth session on refresh if already hydrated from localStorage
  if (!store.isAuthenticated) {
    const token = localStorage.getItem('auth_token')
    if (token) {
      getProfile().then((result) => {
        if (result) {
          store.setUser({
            isAuthenticated: true,
            currentRole: result.role,
            employee: result.employee,
          })
        }
      }).catch(() => {
        localStorage.removeItem('auth_token')
      })
    }
  }
})
</script>

<template>
  <div class="relative">
    <div
      v-if="isRouteLoading"
      class="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-brand-600 animate-pulse"
    />
    <router-view />
  </div>
</template>
