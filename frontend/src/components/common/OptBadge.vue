<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    count: number
    max?: number
    dot?: boolean
  }>(),
  {
    max: 99,
  },
)

const display = computed(() => {
  if (props.dot) return ''
  return props.count > props.max ? `${props.max}+` : String(props.count)
})
</script>

<template>
  <span
    v-if="count > 0"
    class="inline-flex items-center justify-center font-semibold text-white bg-danger-500 rounded-full"
    :class="[dot ? 'h-2 w-2 min-w-0' : 'h-5 min-w-5 px-1.5 text-caption']"
  >
    {{ display }}
  </span>
</template>
