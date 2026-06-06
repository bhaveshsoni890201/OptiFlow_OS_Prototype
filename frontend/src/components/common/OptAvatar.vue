<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    src?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    status?: 'online' | 'away' | 'dnd' | 'offline'
  }>(),
  {
    size: 'md',
  },
)

const sizeMap = {
  sm: 'h-8 w-8 text-caption',
  md: 'h-10 w-10 text-body',
  lg: 'h-12 w-12 text-h3',
  xl: 'h-16 w-16 text-h2',
}
const statusSizeMap = { sm: 'h-2 w-2', md: 'h-2.5 w-2.5', lg: 'h-3 w-3', xl: 'h-3.5 w-3.5' }
const statusColorMap = {
  online: 'bg-success-600',
  away: 'bg-warning-500',
  dnd: 'bg-danger-500',
  offline: 'bg-neutral-300 dark:bg-neutral-600',
}

const initials = computed(() => {
  return props.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const bgColor = computed(() => {
  const colors = [
    'bg-brand-600',
    'bg-success-600',
    'bg-warning-500',
    'bg-danger-500',
    'bg-info-600',
  ]
  let hash = 0
  for (let i = 0; i < props.name.length; i++) hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
})
</script>

<template>
  <div
    class="relative inline-flex items-center justify-center rounded-full overflow-hidden"
    :class="[sizeMap[size], src ? '' : bgColor]"
  >
    <img v-if="src" :src="src" :alt="name" class="h-full w-full object-cover" />
    <span v-else class="font-semibold text-white">{{ initials }}</span>
    <span
      v-if="status"
      class="absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-neutral-900"
      :class="[statusSizeMap[size], statusColorMap[status]]"
    ></span>
  </div>
</template>
