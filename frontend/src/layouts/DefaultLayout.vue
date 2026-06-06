<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '../components/navigation/AppHeader.vue'
import AppSidebar from '../components/navigation/AppSidebar.vue'
import BottomNav from '../components/navigation/BottomNav.vue'
import FabQuickAdd from '../components/navigation/FabQuickAdd.vue'
import NotificationCenter from '../components/navigation/NotificationCenter.vue'
import OfflineBanner from '../components/navigation/OfflineBanner.vue'
import HealthBanner from '../components/navigation/HealthBanner.vue'
import SessionTimeoutModal from '../components/common/SessionTimeoutModal.vue'
import { useSessionTimeout } from '../composables/useSessionTimeout'
import { useHealthCheck } from '../composables/useHealthCheck'

const props = withDefaults(
  defineProps<{
    panelName: 'doer' | 'captain' | 'admin'
    title?: string
  }>(),
  {
    title: '',
  },
)

const sidebarOpen = ref(false)
const notificationOpen = ref(false)

const { showWarning, countdown, extendSession, forceLogout } = useSessionTimeout()
const { start: startHealthCheck } = useHealthCheck()

onMounted(() => {
  startHealthCheck()
})

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function toggleNotifications() {
  notificationOpen.value = !notificationOpen.value
}
</script>

<template>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-3 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:text-body focus:font-semibold"
  >
    Skip to main content
  </a>
  <div class="flex h-screen bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
    <AppSidebar :panel-name="panelName" />

    <div class="flex-1 flex flex-col min-w-0">
      <OfflineBanner />
      <HealthBanner />
      <AppHeader
        :title="title"
        :panel-name="panelName"
        @toggle-sidebar="toggleSidebar"
        @toggle-notifications="toggleNotifications"
      />

      <main id="main-content" class="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div class="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <router-view />
        </div>
      </main>
    </div>

    <BottomNav :panel-name="panelName" />
    <FabQuickAdd />
    <NotificationCenter :open="notificationOpen" @close="notificationOpen = false" />
  </div>

  <SessionTimeoutModal
    v-if="showWarning"
    :countdown="countdown"
    @extend="extendSession"
    @logout="forceLogout"
  />
</template>
