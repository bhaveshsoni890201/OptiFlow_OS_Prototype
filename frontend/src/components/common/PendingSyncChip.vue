<script setup lang="ts">
import { computed } from 'vue'
import { useOfflineStore } from '../../stores/offlineStore'
import { ArrowPathIcon } from '@heroicons/vue/20/solid'

const props = defineProps<{
  entityType: string
  entityId: string
}>()

const offlineStore = useOfflineStore()
const isPending = computed(() => offlineStore.hasPending(props.entityType, props.entityId))
</script>

<template>
  <span
    v-if="isPending"
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-50 text-warning-500 text-overline font-semibold whitespace-nowrap"
  >
    <ArrowPathIcon class="h-3 w-3" />
    Pending sync
  </span>
</template>
