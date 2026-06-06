<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  Bars3Icon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
} from '@heroicons/vue/24/outline'

const props = withDefaults(
  defineProps<{
    title: string
    showBack?: boolean
    panelName: 'doer' | 'captain' | 'admin'
  }>(),
  {
    showBack: false,
  },
)

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
  (e: 'toggle-notifications'): void
}>()

const route = useRoute()

const unreadCount = ref(3)
const searchFocused = ref(false)
const avatarMenuOpen = ref(false)
const workspaceOpen = ref(false)
const langOpen = ref(false)

const panelColors: Record<string, string> = {
  doer: 'bg-blue-600',
  captain: 'bg-amber-600',
  admin: 'bg-slate-700',
}

const panelBadge = computed(() => panelColors[props.panelName])

function getInitials(): string {
  return 'JD'
}

function handleAvatarKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    avatarMenuOpen.value = !avatarMenuOpen.value
  }
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white border-b border-neutral-200">
    <!-- Mobile layout (xs/sm) -->
    <div class="flex items-center justify-between px-3 h-14 md:hidden">
      <div class="flex items-center gap-2 min-w-0">
        <button
          v-if="showBack"
          type="button"
          class="p-2 -ml-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Go back"
        >
          <ArrowLeftIcon class="w-5 h-5" />
        </button>
        <button
          v-else
          type="button"
          class="p-2 -ml-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Toggle sidebar"
          @click="emit('toggle-sidebar')"
        >
          <Bars3Icon class="w-5 h-5" />
        </button>
        <h1 class="text-sm font-semibold text-neutral-900 truncate">
          {{ title }}
        </h1>
      </div>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Search"
        >
          <MagnifyingGlassIcon class="w-5 h-5" />
        </button>
        <button
          type="button"
          class="relative p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Toggle notifications"
          @click="emit('toggle-notifications')"
        >
          <BellIcon class="w-5 h-5" />
          <span
            v-if="unreadCount > 0"
            class="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full"
          >
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </span>
        </button>
        <button
          type="button"
          class="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="User menu"
          :aria-expanded="avatarMenuOpen"
          @click="avatarMenuOpen = !avatarMenuOpen"
          @keydown="handleAvatarKeydown"
        >
          <div
            class="flex items-center justify-center w-8 h-8 text-xs font-semibold text-white rounded-full bg-primary-600"
          >
            {{ getInitials() }}
          </div>
        </button>
      </div>
    </div>

    <!-- Desktop layout (md+) -->
    <div class="hidden md:flex items-center h-16 px-4 lg:px-6 gap-4">
      <!-- Logo -->
      <router-link :to="`/${panelName}`" class="flex items-center gap-2 shrink-0">
        <div
          class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-lg"
          :class="panelBadge"
        >
          O
        </div>
        <span class="hidden lg:inline text-sm font-semibold text-neutral-900">OptiFlow</span>
      </router-link>

      <!-- Back button (conditional) -->
      <button
        v-if="showBack"
        type="button"
        class="p-2 -ml-1 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Go back"
      >
        <ArrowLeftIcon class="w-5 h-5" />
      </button>

      <!-- Title -->
      <h1 class="text-base font-semibold text-neutral-900 truncate min-w-0">
        {{ title }}
      </h1>

      <!-- Spacer -->
      <div class="flex-1 min-w-4" />

      <!-- Workspace switcher -->
      <div class="relative shrink-0">
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-600 rounded-lg hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          :aria-expanded="workspaceOpen"
          @click="workspaceOpen = !workspaceOpen"
        >
          <span class="w-2 h-2 rounded-full bg-green-500" />
          <span class="hidden lg:inline">Workspace 1</span>
          <ChevronDownIcon class="w-3.5 h-3.5" />
        </button>
        <div
          v-if="workspaceOpen"
          class="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50"
        >
          <button
            type="button"
            class="w-full px-3 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50"
            @click="workspaceOpen = false"
          >
            Workspace 1
          </button>
          <button
            type="button"
            class="w-full px-3 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50"
            @click="workspaceOpen = false"
          >
            Workspace 2
          </button>
        </div>
      </div>

      <!-- Language switcher -->
      <div class="relative shrink-0">
        <button
          type="button"
          class="flex items-center gap-1 px-3 py-1.5 text-sm text-neutral-600 rounded-lg hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          :aria-expanded="langOpen"
          @click="langOpen = !langOpen"
        >
          <span>EN</span>
          <ChevronDownIcon class="w-3.5 h-3.5" />
        </button>
        <div
          v-if="langOpen"
          class="absolute right-0 top-full mt-1 w-32 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50"
        >
          <button
            type="button"
            class="w-full px-3 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50"
            @click="langOpen = false"
          >
            English
          </button>
          <button
            type="button"
            class="w-full px-3 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50"
            @click="langOpen = false"
          >
            Español
          </button>
        </div>
      </div>

      <!-- Search field -->
      <div class="relative shrink-0" :class="searchFocused ? 'w-64' : 'w-48'">
        <MagnifyingGlassIcon
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
        />
        <input
          v-model="searchFocused"
          type="search"
          placeholder="Search..."
          class="w-full pl-9 pr-3 py-1.5 text-sm border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
        />
      </div>

      <!-- Notification bell -->
      <button
        type="button"
        class="relative p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 shrink-0"
        aria-label="Toggle notifications"
        @click="emit('toggle-notifications')"
      >
        <BellIcon class="w-5 h-5" />
        <span
          v-if="unreadCount > 0"
          class="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>

      <!-- Avatar menu -->
      <div class="relative shrink-0">
        <button
          type="button"
          class="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="User menu"
          :aria-expanded="avatarMenuOpen"
          @click="avatarMenuOpen = !avatarMenuOpen"
          @keydown="handleAvatarKeydown"
        >
          <div
            class="flex items-center justify-center w-8 h-8 text-xs font-semibold text-white rounded-full bg-primary-600"
          >
            {{ getInitials() }}
          </div>
          <ChevronDownIcon class="w-3.5 h-3.5 text-neutral-500 hidden lg:block" />
        </button>
        <div
          v-if="avatarMenuOpen"
          class="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50"
          @click="avatarMenuOpen = false"
        >
          <router-link
            :to="`/${panelName}/profile`"
            class="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            Profile
          </router-link>
          <router-link
            :to="`/${panelName}/settings`"
            class="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            Settings
          </router-link>
          <hr class="my-1 border-neutral-200" />
          <button
            type="button"
            class="w-full px-3 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
