<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronUpIcon, ChevronDownIcon, ChevronRightIcon, ChevronDownIcon as ChevronDownSm } from '@heroicons/vue/20/solid'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import OptSpinner from './OptSpinner.vue'
import OptButton from './OptButton.vue'
import OptPaginator from './OptPaginator.vue'

export interface Column<T = any> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (row: T) => any
  cellClass?: string
}

const props = withDefaults(
  defineProps<{
    columns: Column[]
    rows: any[]
    loading?: boolean
    error?: string
    emptyMessage?: string
    emptyIcon?: string
    sortable?: boolean
    stickyHeader?: boolean
    paginated?: boolean
    pageSize?: number
    currentPage?: number
    totalItems?: number
    selectable?: boolean
    expandable?: boolean
    rowKey?: string
    compact?: boolean
    hoverable?: boolean
  }>(),
  {
    loading: false,
    error: undefined,
    emptyMessage: 'No data found',
    emptyIcon: undefined,
    sortable: false,
    stickyHeader: false,
    paginated: false,
    pageSize: 20,
    currentPage: 1,
    totalItems: 0,
    selectable: false,
    expandable: false,
    rowKey: 'id',
    compact: false,
    hoverable: true,
  },
)

const emit = defineEmits<{
  sort: [key: string, direction: 'asc' | 'desc']
  'update:currentPage': [page: number]
  select: [row: any]
  expand: [row: any]
  'row-click': [row: any]
}>()

const sortKey = ref('')
const sortDir = ref<'asc' | 'desc'>('asc')
const expandedRows = ref<Set<string>>(new Set())
const selectedRow = ref<any>(null)

const internalPage = ref(props.currentPage)

const sortedRows = computed(() => {
  if (!sortKey.value) return props.rows
  return [...props.rows].sort((a, b) => {
    const aVal = a[sortKey.value]
    const bVal = b[sortKey.value]
    if (aVal == null) return 1
    if (bVal == null) return -1
    const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

function toggleSort(key: string) {
  if (!props.sortable) return
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
  emit('sort', sortKey.value, sortDir.value)
}

function toggleExpand(row: any) {
  const id = row[props.rowKey]
  if (expandedRows.value.has(id)) {
    expandedRows.value.delete(id)
  } else {
    expandedRows.value.add(id)
  }
  emit('expand', row)
}

function selectRow(row: any) {
  selectedRow.value = row
  emit('select', row)
}

function handleRowClick(row: any) {
  emit('row-click', row)
}

function onPageChange(page: number) {
  internalPage.value = page
  emit('update:currentPage', page)
}
</script>

<template>
  <div class="opt-table w-full">
    <div
      v-if="loading"
      class="flex items-center justify-center py-16"
    >
      <OptSpinner size="lg" />
    </div>

    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <div class="w-12 h-12 rounded-full bg-danger-50 flex items-center justify-center mb-4">
        <ExclamationTriangleIcon class="w-6 h-6 text-danger-600" />
      </div>
      <p class="text-body-strong text-neutral-700 mb-1">Failed to load data</p>
      <p class="text-caption text-neutral-500 mb-4">{{ error }}</p>
      <OptButton variant="secondary" size="sm" @click="$emit('retry')">
        Retry
      </OptButton>
    </div>

    <div
      v-else-if="rows.length === 0"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <p class="text-body-strong text-neutral-500 mb-1">{{ emptyMessage }}</p>
      <slot name="empty" />
    </div>

    <template v-else>
      <div :class="['overflow-x-auto rounded-lg border border-neutral-200', stickyHeader ? 'max-h-[600px] overflow-y-auto' : '']">
        <table class="w-full border-collapse">
          <thead :class="[stickyHeader ? 'sticky top-0 z-10' : '', compact ? 'bg-neutral-50' : 'bg-neutral-50']">
            <tr>
              <th
                v-if="expandable"
                class="w-10 px-3 py-3 text-left"
              />
              <th
                v-for="col in columns"
                :key="col.key"
                :class="[
                  'text-overline text-neutral-500 tracking-wide',
                  col.sortable || sortable ? 'cursor-pointer select-none hover:text-neutral-700' : '',
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                  compact ? 'px-3 py-2' : 'px-4 py-3',
                  col.width ? `w-[${col.width}]` : '',
                ]"
                @click="col.sortable || sortable ? toggleSort(col.key) : undefined"
              >
                <div class="inline-flex items-center gap-1">
                  {{ col.label }}
                  <span v-if="sortKey === col.key" class="inline-flex">
                    <ChevronUpIcon
                      v-if="sortDir === 'asc'"
                      class="w-3.5 h-3.5 text-brand-600"
                    />
                    <ChevronDownIcon
                      v-else
                      class="w-3.5 h-3.5 text-brand-600"
                    />
                  </span>
                </div>
              </th>
              <th
                v-if="$slots.actions"
                class="w-16 px-4 py-3 text-right text-overline text-neutral-500 tracking-wide"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr
              v-for="(row, rowIdx) in sortedRows"
              :key="row[rowKey] || rowIdx"
              :class="[
                'transition-colors',
                hoverable ? 'hover:bg-neutral-50' : '',
                selectedRow === row ? 'bg-brand-50' : '',
                selectable ? 'cursor-pointer' : '',
              ]"
              @click="selectable ? selectRow(row) : handleRowClick(row)"
            >
              <td
                v-if="expandable"
                class="w-10 px-3 py-3 text-center"
                @click.stop="toggleExpand(row)"
              >
                <button
                  type="button"
                  class="text-neutral-400 hover:text-neutral-600 transition-colors"
                  :aria-label="'Expand row'"
                >
                  <ChevronRightIcon
                    v-if="!expandedRows.has(row[rowKey])"
                    class="w-4 h-4"
                  />
                  <ChevronDownSm
                    v-else
                    class="w-4 h-4"
                  />
                </button>
              </td>
              <td
                v-for="col in columns"
                :key="`${row[rowKey] || rowIdx}-${col.key}`"
                :class="[
                  'text-body text-neutral-700',
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                  compact ? 'px-3 py-2' : 'px-4 py-3',
                  col.cellClass || '',
                ]"
              >
                <slot
                  :name="`cell-${col.key}`"
                  :row="row"
                  :value="row[col.key]"
                >
                  {{ col.render ? col.render(row) : row[col.key] }}
                </slot>
              </td>
              <td
                v-if="$slots.actions"
                class="px-4 py-3 text-right"
                @click.stop
              >
                <slot name="actions" :row="row" />
              </td>
            </tr>
            <tr
              v-for="(row, rowIdx) in sortedRows"
              v-if="expandable"
              :key="`exp-${row[rowKey] || rowIdx}`"
            >
              <td
                v-if="expandedRows.has(row[rowKey])"
                :colspan="columns.length + 1 + ($slots.actions ? 1 : 0)"
                class="px-6 py-4 bg-neutral-50 border-b border-neutral-100"
              >
                <slot name="expanded-row" :row="row" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="paginated"
        class="flex items-center justify-between pt-4"
      >
        <p class="text-caption text-neutral-500">
          Showing {{ ((internalPage - 1) * pageSize) + 1 }}–{{ Math.min(internalPage * pageSize, totalItems || rows.length) }} of {{ totalItems || rows.length }}
        </p>
        <OptPaginator
          :current-page="internalPage"
          :total-items="totalItems || rows.length"
          :page-size="pageSize"
          @update:current-page="onPageChange"
        />
      </div>
    </template>
  </div>
</template>
