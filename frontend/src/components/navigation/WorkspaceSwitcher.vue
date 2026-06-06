<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDownIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/vue/20/solid'
import {
  Squares2X2Icon,
  ShieldCheckIcon,
  LifebuoyIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'

const props = withDefaults(
  defineProps<{
    currentRole: 'doer' | 'captain' | 'admin'
    userName?: string
  }>(),
  {
    userName: 'Raj Mehta',
  },
)

const router = useRouter()
const isOpen = ref(false)

interface RoleOption {
  role: 'doer' | 'captain' | 'admin'
  label: string
  description: string
  icon: unknown
  color: string
}

const roles: RoleOption[] = [
  {
    role: 'doer',
    label: 'Doer',
    description: 'Tasks, attendance, training',
    icon: Squares2X2Icon,
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
  },
  {
    role: 'captain',
    label: 'Captain',
    description: 'Team, rescue, approvals',
    icon: ShieldCheckIcon,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
  },
  {
    role: 'admin',
    label: 'Admin',
    description: 'Insights, employees, control',
    icon: LifebuoyIcon,
    color: 'text-slate-600 bg-slate-50 dark:bg-slate-900/20 dark:text-slate-400',
  },
]

function switchRole(role: 'doer' | 'captain' | 'admin') {
  isOpen.value = false
  router.push(`/${role}`)
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-success-600" />
        <span class="font-medium capitalize">{{ currentRole }}</span>
      </div>
      <ChevronDownIcon class="w-3.5 h-3.5" />
    </button>
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-elevated py-2 z-50"
      >
        <!-- User info -->
        <div class="px-4 py-2 border-b border-neutral-100 dark:border-neutral-700">
          <div class="flex items-center gap-3">
            <UserCircleIcon class="w-10 h-10 text-neutral-400" />
            <div>
              <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {{ userName }}
              </p>
              <p class="text-caption text-neutral-500">Workspace 1</p>
            </div>
          </div>
        </div>

        <!-- Role switcher -->
        <div class="px-2 py-2">
          <p class="px-2 py-1 text-caption font-semibold text-neutral-400 uppercase tracking-wider">
            Switch Role
          </p>
          <button
            v-for="role in roles"
            :key="role.role"
            type="button"
            class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors"
            :class="
              currentRole === role.role
                ? 'bg-neutral-100 dark:bg-neutral-700'
                : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
            "
            @click="switchRole(role.role)"
          >
            <div
              class="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
              :class="role.color"
            >
              <component :is="role.icon" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {{ role.label }}
              </div>
              <div class="text-caption text-neutral-500 truncate">{{ role.description }}</div>
            </div>
            <span
              v-if="currentRole === role.role"
              class="w-2 h-2 rounded-full bg-brand-600 shrink-0"
            />
          </button>
        </div>

        <!-- Settings & Logout -->
        <hr class="border-neutral-100 dark:border-neutral-700" />
        <div class="px-2 py-1">
          <button
            type="button"
            class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
          >
            <Cog6ToothIcon class="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
          >
            <ArrowRightOnRectangleIcon class="w-5 h-5" />
            <span>Sign out</span>
          </button>
        </div>
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
