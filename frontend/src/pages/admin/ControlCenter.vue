<script setup lang="ts">
import { ref } from 'vue'
import {
  ShieldCheckIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

const tabs = [
  { key: 'permissions', label: 'Role & Permissions', icon: ShieldCheckIcon },
  { key: 'settings', label: 'System Settings', icon: Cog6ToothIcon },
  { key: 'audit-logs', label: 'Audit Logs', icon: ClipboardDocumentListIcon },
  { key: 'exceptions', label: 'Exception Monitor', icon: ExclamationTriangleIcon },
] as const

type TabKey = (typeof tabs)[number]['key']

const activeTab = ref<TabKey>('permissions')

const tabsWithComponents: Record<TabKey, any> = {
  permissions: null,
  settings: null,
  'audit-logs': null,
  exceptions: null,
}

const tabErrors: Record<string, string> = {}

async function loadComponent(key: TabKey) {
  try {
    let mod: any
    switch (key) {
      case 'permissions':
        mod = await import('./control-center/RolePermissions.vue')
        break
      case 'settings':
        mod = await import('./control-center/SystemSettings.vue')
        break
      case 'audit-logs':
        mod = await import('./control-center/AuditLogs.vue')
        break
      case 'exceptions':
        mod = await import('./control-center/ExceptionMonitor.vue')
        break
    }
    tabsWithComponents[key] = mod.default
    delete tabErrors[key]
  } catch {
    tabErrors[key] = 'Failed to load tab'
  }
}

function switchTab(key: TabKey) {
  activeTab.value = key
  if (!tabsWithComponents[key] && !tabErrors[key]) loadComponent(key)
}

function retryLoad(key: TabKey) {
  delete tabErrors[key]
  tabsWithComponents[key] = null
  loadComponent(key)
}

// Preload first tab
loadComponent('permissions')
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold text-slate-900">Control Center</h1>
      <p class="text-sm text-slate-500 mt-0.5">System configuration, security, and monitoring</p>
    </div>

    <!-- Tabs -->
    <div class="border-b border-slate-200">
      <nav class="flex gap-1 -mb-px overflow-x-auto scrollbar-thin">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
          :class="
            activeTab === tab.key
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          "
          @click="switchTab(tab.key)"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="min-h-[50vh]">
      <div v-if="tabErrors[activeTab]" class="flex flex-col items-center justify-center py-20 text-center">
        <ExclamationTriangleIcon class="h-10 w-10 text-danger-400 mb-3" />
        <p class="text-body-strong text-neutral-900 mb-1">{{ tabErrors[activeTab] }}</p>
        <button
          class="mt-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors flex items-center gap-1.5"
          @click="retryLoad(activeTab)"
        >
          <ArrowPathIcon class="w-4 h-4" /> Retry
        </button>
      </div>
      <component
        v-else-if="tabsWithComponents[activeTab]"
        :is="tabsWithComponents[activeTab]"
        :key="activeTab"
      />
      <div v-else class="flex items-center justify-center py-20">
        <div
          class="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"
        />
      </div>
    </div>
  </div>
</template>
