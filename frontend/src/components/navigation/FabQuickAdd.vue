<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon, DocumentTextIcon, CalendarDaysIcon, LifebuoyIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'

const router = useRouter()
const isOpen = ref(false)
const sheetRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const focusedBeforeOpen = ref<HTMLElement | null>(null)
const showFab = ref(true)
const lastScrollY = ref(0)

interface Action {
  id: string
  label: string
  description: string
  icon: unknown
  variant: 'primary' | 'default'
  handler: () => void
}

const actions = ref<Action[]>([
  {
    id: 'delegation',
    label: 'New Delegation Task',
    description: 'Assign a task to a team member',
    icon: DocumentTextIcon,
    variant: 'primary',
    handler: () => router.push('/doer/tasks/create'),
  },
  {
    id: 'leave',
    label: 'Apply Leave',
    description: 'Submit a leave request',
    icon: CalendarDaysIcon,
    variant: 'default',
    handler: () => router.push('/doer/leave'),
  },
  {
    id: 'ticket',
    label: 'Raise Help Ticket',
    description: 'Get support for an issue',
    icon: LifebuoyIcon,
    variant: 'default',
    handler: () => router.push('/doer/tickets'),
  },
])

const checkinAction = ref<Action | null>({
  id: 'checkin',
  label: 'Check In',
  description: 'Start your shift',
  icon: CheckCircleIcon,
  variant: 'default',
  handler: () => {
    checkinAction.value = null
  },
})

function handleScroll() {
  const main = document.querySelector('main')
  if (!main) return
  const current = main.scrollTop
  showFab.value = current < lastScrollY.value || current < 50
  lastScrollY.value = current
}

function openSheet() {
  focusedBeforeOpen.value = document.activeElement as HTMLElement
  isOpen.value = true
  nextTick(() => {
    const firstItem = sheetRef.value?.querySelector<HTMLElement>('[data-fab-action]')
    firstItem?.focus()
  })
}

function closeSheet() {
  isOpen.value = false
  nextTick(() => {
    triggerRef.value?.focus()
  })
}

function onBackdropClick(e: MouseEvent) {
  if (sheetRef.value && !sheetRef.value.contains(e.target as Node)) {
    closeSheet()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return

  if (e.key === 'Escape') {
    e.preventDefault()
    closeSheet()
    return
  }

  if (e.key === 'Tab') {
    const focusable = sheetRef.value?.querySelectorAll<HTMLElement>(
      '[data-fab-action], [data-fab-close]',
    )
    if (!focusable || focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }
}

function selectAction(action: Action) {
  action.handler()
  closeSheet()
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', onKeydown)
  } else {
    document.removeEventListener('keydown', onKeydown)
  }
})

onMounted(() => {
  const main = document.querySelector('main')
  if (main) {
    main.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  const main = document.querySelector('main')
  if (main) {
    main.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <div class="md:hidden" :class="{ 'invisible opacity-0': !showFab }" style="transition: opacity 0.2s ease">
    <button
      ref="triggerRef"
      type="button"
      class="fixed bottom-20 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-brand-600 text-white shadow-fab hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-300 active:bg-brand-800 transition-colors"
      aria-label="Quick add"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      @click="openSheet"
    >
      <PlusIcon class="w-7 h-7 transition-transform duration-200" :class="{ 'rotate-45': isOpen }" />
    </button>

    <Teleport to="body">
      <div v-if="isOpen" class="fixed inset-0 z-[60] bg-black/40" @click="onBackdropClick">
        <div
          ref="sheetRef"
          role="dialog"
          aria-modal="true"
          aria-label="Quick actions"
          class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl pb-safe animate-slide-up"
          style="padding-bottom: env(safe-area-inset-bottom, 16px)"
          @click.stop
        >
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-10 h-1 rounded-full bg-neutral-300" />
          </div>

          <div class="flex items-center justify-between px-5 pt-2 pb-3">
            <h2 class="text-base font-semibold text-neutral-900">Quick Actions</h2>
            <button
              type="button"
              data-fab-close
              class="p-1 -mr-1 text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg"
              aria-label="Close"
              @click="closeSheet"
            >
              <span class="text-lg leading-none">&times;</span>
            </button>
          </div>

          <ul class="px-3 pb-4 space-y-1">
            <li v-for="action in actions" :key="action.id">
              <button
                type="button"
                data-fab-action
                class="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl text-left transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                :class="
                  action.variant === 'primary'
                    ? 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                    : 'text-neutral-700 hover:bg-neutral-50'
                "
                @click="selectAction(action)"
              >
                <div
                  class="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                  :class="
                    action.variant === 'primary'
                      ? 'bg-brand-100 text-brand-600'
                      : 'bg-neutral-100 text-neutral-500'
                  "
                >
                  <component :is="action.icon" class="w-5 h-5" />
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-medium">{{ action.label }}</div>
                  <div class="text-xs text-neutral-500">{{ action.description }}</div>
                </div>
              </button>
            </li>
            <li v-if="checkinAction">
              <button
                type="button"
                data-fab-action
                class="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl text-left text-neutral-700 hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                @click="selectAction(checkinAction)"
              >
                <div
                  class="flex items-center justify-center w-10 h-10 rounded-lg bg-success-50 text-success-600 shrink-0"
                >
                  <component :is="checkinAction.icon" class="w-5 h-5" />
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-medium">{{ checkinAction.label }}</div>
                  <div class="text-xs text-neutral-500">{{ checkinAction.description }}</div>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

.animate-slide-up {
  animation: slide-up 0.2s ease-out;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.rotate-45 {
  transition: transform 0.2s ease;
}

.invisible {
  visibility: hidden;
}
</style>
