<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import OptButton from './OptButton.vue'
import OptSpinner from './OptSpinner.vue'

type ModalSize = 'sm' | 'md' | 'lg' | 'full'
type ModalVariant = 'default' | 'confirm'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    size?: ModalSize
    variant?: ModalVariant
    closeable?: boolean
    loading?: boolean
    confirmLabel?: string
    cancelLabel?: string
    confirmDanger?: boolean
    preventClose?: boolean
    stack?: number
  }>(),
  {
    title: '',
    size: 'md',
    variant: 'default',
    closeable: true,
    loading: false,
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    confirmDanger: false,
    preventClose: false,
    stack: 0,
  },
)

const emit = defineEmits<{
  close: []
  confirm: []
  cancel: []
}>()

const panelRef = ref<InstanceType<typeof DialogPanel>>()

const maxWidthClasses: Record<ModalSize, string> = {
  sm: 'sm:max-w-[400px]',
  md: 'sm:max-w-[560px]',
  lg: 'sm:max-w-[720px]',
  full: 'sm:max-w-[90vw]',
}

const isStacked = computed(() => props.stack > 0)
const backdropOpacity = computed(() => {
  if (props.stack === 0) return 'bg-black/50'
  if (props.stack === 1) return 'bg-black/30'
  return 'bg-black/10'
})

function handleClose() {
  if (props.closeable && !props.preventClose) {
    emit('close')
  }
}

async function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
  if (!props.preventClose) {
    emit('close')
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="handleClose">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div :class="['fixed inset-0', backdropOpacity]" aria-hidden="true" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              ref="panelRef"
              :class="[
                'relative w-full bg-white rounded-lg shadow-modal flex flex-col max-h-[90vh]',
                isStacked ? 'scale-[0.97] translate-y-1' : '',
                maxWidthClasses[size],
              ]"
            >
              <!-- Confirm variant header -->
              <div
                v-if="variant === 'confirm'"
                class="flex flex-col items-center px-6 pt-8 pb-2 text-center"
              >
                <div
                  :class="[
                    'w-14 h-14 rounded-full flex items-center justify-center mb-4',
                    confirmDanger ? 'bg-danger-50' : 'bg-brand-50',
                  ]"
                >
                  <ExclamationTriangleIcon
                    :class="[
                      'w-7 h-7',
                      confirmDanger ? 'text-danger-600' : 'text-brand-600',
                    ]"
                  />
                </div>
                <DialogTitle as="h2" class="text-h2 text-neutral-900 m-0">
                  {{ title }}
                </DialogTitle>
              </div>

              <!-- Default variant header -->
              <div
                v-else-if="title || closeable"
                class="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0"
              >
                <DialogTitle as="h2" class="text-h2 text-neutral-900 m-0">
                  {{ title }}
                </DialogTitle>
                <button
                  v-if="closeable"
                  type="button"
                  class="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors min-h-touch min-w-touch flex items-center justify-center"
                  :disabled="loading"
                  :aria-label="'Close dialog'"
                  @click="emit('close')"
                >
                  <XMarkIcon class="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <!-- Body -->
              <div class="px-6 py-4 overflow-y-auto flex-1">
                <template v-if="loading">
                  <div class="flex items-center justify-center py-8">
                    <OptSpinner size="lg" />
                  </div>
                </template>
                <slot v-else />
              </div>

              <!-- Confirm variant footer -->
              <div
                v-if="variant === 'confirm'"
                class="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 shrink-0"
              >
                <OptButton
                  variant="ghost"
                  :disabled="loading"
                  @click="handleCancel"
                >
                  {{ cancelLabel }}
                </OptButton>
                <OptButton
                  :variant="confirmDanger ? 'danger' : 'primary'"
                  :loading="loading"
                  @click="handleConfirm"
                >
                  {{ confirmLabel }}
                </OptButton>
              </div>

              <!-- Default variant footer -->
              <div
                v-else-if="$slots.footer"
                class="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 shrink-0"
              >
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
