<script setup lang="ts">
import { ref } from 'vue'
import { FunnelIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import OptButton from './OptButton.vue'
import OptInput from './OptInput.vue'
import OptChip from './OptChip.vue'

export interface FilterOption {
  value: string
  label: string
}

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'multi-select' | 'date-range' | 'search'
  options?: FilterOption[]
  placeholder?: string
}

const props = withDefaults(
  defineProps<{
    filters: FilterConfig[]
    modelValue: Record<string, any>
    loading?: boolean
    compact?: boolean
  }>(),
  {
    loading: false,
    compact: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  search: [term: string]
  reset: []
}>()

const openDropdown = ref<string | null>(null)

function updateFilter(key: string, value: any) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function removeFilter(key: string) {
  const updated = { ...props.modelValue }
  delete updated[key]
  emit('update:modelValue', updated)
}

function clearAll() {
  emit('reset')
}

function toggleDropdown(key: string) {
  openDropdown.value = openDropdown.value === key ? null : key
}

function hasActiveFilters(): boolean {
  return Object.values(props.modelValue).some((v) => v != null && v !== '' && !(Array.isArray(v) && v.length === 0))
}
</script>

<template>
  <div :class="['flex flex-wrap items-center gap-2', compact ? '' : 'py-3']">
    <div
      v-for="filter in filters"
      :key="filter.key"
      class="relative"
    >
      <!-- Search filter -->
      <div v-if="filter.type === 'search'" class="relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          :value="modelValue[filter.key] || ''"
          :placeholder="filter.placeholder || 'Search...'"
          class="h-9 pl-9 pr-3 text-body bg-white border border-neutral-300 rounded-md placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 w-48"
          @input="(e) => updateFilter(filter.key, (e.target as HTMLInputElement).value)"
        />
        <button
          v-if="modelValue[filter.key]"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          @click="updateFilter(filter.key, '')"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Select filter -->
      <div
        v-else-if="filter.type === 'select'"
        class="relative"
        @click.stop="toggleDropdown(filter.key)"
      >
        <button
          type="button"
          class="inline-flex items-center gap-2 h-9 px-3 text-body bg-white border border-neutral-300 rounded-md hover:border-neutral-400 transition-colors whitespace-nowrap"
          :class="[modelValue[filter.key] ? 'text-neutral-900' : 'text-neutral-400']"
        >
          <span>{{ modelValue[filter.key] ? filter.options?.find(o => o.value === modelValue[filter.key])?.label || modelValue[filter.key] : filter.label }}</span>
          <ChevronDownIcon class="w-4 h-4 text-neutral-400" />
        </button>
        <div
          v-if="openDropdown === filter.key"
          class="absolute top-full left-0 mt-1 z-20 min-w-[180px] bg-white border border-neutral-200 rounded-lg shadow-lg py-1"
        >
          <button
            v-for="opt in filter.options"
            :key="opt.value"
            type="button"
            class="w-full text-left px-3 py-2 text-body hover:bg-neutral-50 transition-colors"
            :class="[modelValue[filter.key] === opt.value ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-neutral-700']"
            @click="updateFilter(filter.key, opt.value); openDropdown = null"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Multi-select filter -->
      <div
        v-else-if="filter.type === 'multi-select'"
        class="relative"
        @click.stop="toggleDropdown(filter.key)"
      >
        <button
          type="button"
          class="inline-flex items-center gap-2 h-9 px-3 text-body bg-white border border-neutral-300 rounded-md hover:border-neutral-400 transition-colors whitespace-nowrap"
          :class="[modelValue[filter.key]?.length ? 'text-neutral-900' : 'text-neutral-400']"
        >
          <span>{{ modelValue[filter.key]?.length ? `${filter.label} (${modelValue[filter.key].length})` : filter.label }}</span>
          <ChevronDownIcon class="w-4 h-4 text-neutral-400" />
        </button>
        <div
          v-if="openDropdown === filter.key"
          class="absolute top-full left-0 mt-1 z-20 min-w-[200px] bg-white border border-neutral-200 rounded-lg shadow-lg py-1"
        >
          <div
            v-for="opt in filter.options"
            :key="opt.value"
            class="flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 cursor-pointer"
            @click="
              (() => {
                const current = modelValue[filter.key] || []
                const next = current.includes(opt.value)
                  ? current.filter((v: string) => v !== opt.value)
                  : [...current, opt.value]
                updateFilter(filter.key, next)
              })()
            "
          >
            <input
              type="checkbox"
              :checked="(modelValue[filter.key] || []).includes(opt.value)"
              class="w-4 h-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-600"
            />
            <span class="text-body text-neutral-700">{{ opt.label }}</span>
          </div>
        </div>
      </div>

      <!-- Date range filter -->
      <div
        v-else-if="filter.type === 'date-range'"
        class="flex items-center gap-1"
      >
        <input
          type="date"
          :value="modelValue[`${filter.key}_from`] || ''"
          class="h-9 px-2 text-body bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
          :placeholder="'From'"
          @input="updateFilter(`${filter.key}_from`, ($event.target as HTMLInputElement).value)"
        />
        <span class="text-neutral-400">–</span>
        <input
          type="date"
          :value="modelValue[`${filter.key}_to`] || ''"
          class="h-9 px-2 text-body bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
          :placeholder="'To'"
          @input="updateFilter(`${filter.key}_to`, ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <div v-if="hasActiveFilters()" class="flex items-center gap-2">
      <span class="w-px h-6 bg-neutral-200" />
      <button
        type="button"
        class="text-caption text-neutral-500 hover:text-neutral-700 transition-colors whitespace-nowrap"
        @click="clearAll"
      >
        Clear all
      </button>
    </div>

    <div
      v-if="hasActiveFilters()"
      class="flex flex-wrap items-center gap-1.5 w-full"
    >
      <template v-for="(value, key) in modelValue" :key="key">
        <OptChip
          v-if="value != null && value !== '' && !(Array.isArray(value) && value.length === 0)"
          variant="default"
          size="sm"
          removable
          @remove="removeFilter(key)"
        >
          {{ key }}: {{ Array.isArray(value) ? value.join(', ') : value }}
        </OptChip>
      </template>
    </div>
  </div>
</template>
