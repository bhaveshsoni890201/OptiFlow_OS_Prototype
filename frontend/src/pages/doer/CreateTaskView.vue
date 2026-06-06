<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useStore } from '../../stores/useStore'
import {
  XMarkIcon,
  PaperClipIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'
import type { Priority, DelegationTask } from '../../types'
import OptButton from '../../components/common/OptButton.vue'

const { t } = useI18n()

const router = useRouter()
const store = useStore()
const currentEmployee = computed(() => store.user.employee)

const formTitle = ref('')
const formDescription = ref('')
const formPriority = ref<Priority>('medium')
const formDueDate = ref('')
const formFollowUp = ref('')
const formAttachments = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const saving = ref(false)
const saved = ref(false)
const error = ref('')
const touched = ref<Record<string, boolean>>({})
const errors = ref<Record<string, string>>({})

const _now = new Date()
const todayStr = _now.toISOString().split('T')[0]
const weekEnd = new Date(_now)
weekEnd.setDate(weekEnd.getDate() + (6 - weekEnd.getDay()))
const weekEndStr = weekEnd.toISOString().split('T')[0]

const isFormValid = computed(() => {
  return formTitle.value.trim().length > 0 && formDueDate.value && !errors.value.dueDate
})

function validateDueDate(val: string) {
  if (!val) {
    errors.value.dueDate = t('createTask.validation.dueDateRequired')
    return
  }
  if (val < todayStr) {
    errors.value.dueDate = t('createTask.validation.dueDatePast')
  } else {
    delete errors.value.dueDate
  }
}

function onDueDateInput(val: string) {
  formDueDate.value = val
  touched.value.dueDate = true
  validateDueDate(val)
}

function onFollowUpInput(val: string) {
  formFollowUp.value = val
  if (val && val > weekEndStr) {
    errors.value.followUp = t('createTask.validation.dueDateWithinWeek')
  } else {
    delete errors.value.followUp
  }
}

function triggerFilePicker() {
  fileInput.value?.click()
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  for (const file of Array.from(input.files)) {
    formAttachments.value.push(file)
  }
  input.value = ''
}

function removeAttachment(idx: number) {
  formAttachments.value.splice(idx, 1)
}

async function handleSave() {
  if (!isFormValid.value) return
  saving.value = true
  error.value = ''
  try {
  } catch {
    error.value = t('createTask.saveError')
    saving.value = false
    return
  }
  const newTask: Partial<DelegationTask> = {
    id: `DEL-${String(Date.now()).slice(-4)}`,
    title: formTitle.value,
    description: formDescription.value || undefined,
    priority: formPriority.value,
    due_date: new Date(formDueDate.value + 'T18:00:00+05:30').toISOString(),
    next_follow_up: formFollowUp.value
      ? new Date(formFollowUp.value + 'T14:00:00+05:30').toISOString()
      : undefined,
    assigned_to: currentEmployee.value?.employee_id ?? '',
    assigned_by: currentEmployee.value?.employee_id ?? '',
    status: 'pending',
    escalation_level: 0,
    last_activity: new Date().toISOString(),
    reminder_count: 0,
    created_on: new Date().toISOString(),
    type: 'delegation',
  }
  store.addToast({
    type: 'success',
    message: t('createTask.syncMessage'),
    duration: 3000,
  })
  saving.value = false
  saved.value = true
  setTimeout(() => router.push('/doer/tasks'), 800)
}

function handleCancel() {
  if (formTitle.value || formDescription.value) {
    if (!confirm(t('createTask.discardChanges'))) return
  }
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Saving overlay -->
    <div
      v-if="saving"
      class="fixed inset-0 z-30 bg-white/80 flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p class="text-body text-neutral-500">{{ $t('createTask.saving') || 'Saving...' }}</p>
      </div>
    </div>
    <div v-if="error" class="mx-4 mt-4 card p-4 text-center" role="alert" aria-live="polite">
      <ExclamationTriangleIcon class="h-8 w-8 text-danger-400 mx-auto mb-2" />
      <p class="text-body text-neutral-500">{{ error }}</p>
      <button
        class="mt-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
        @click="error = ''"
      >
        {{ $t('common.dismiss') }}
      </button>
    </div>
    <!-- Mobile: sheet-style header -->
    <div
      class="sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between"
    >
      <button
        aria-label="Cancel"
        class="text-neutral-500 hover:text-neutral-700 min-h-touch min-w-touch flex items-center justify-center"
        @click="handleCancel"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
      <h2 class="text-h3 text-neutral-900">{{ $t('createTask.title') }}</h2>
      <div class="w-10" />
    </div>

    <div class="p-4 max-w-lg mx-auto space-y-5">
      <!-- Title -->
      <div class="flex flex-col gap-1">
        <label class="text-body-strong text-neutral-700"
          >{{ $t('createTask.titleField') }} <span class="text-danger-500">*</span></label
        >
        <input
          v-model="formTitle"
          type="text"
          aria-label="Title"
          :placeholder="$t('createTask.titlePlaceholder')"
          class="w-full h-12 text-body bg-white border border-neutral-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 placeholder:text-neutral-400"
          maxlength="200"
          @blur="touched.title = true"
        />
        <p class="text-caption text-neutral-400 text-right">{{ formTitle.length }}/200</p>
      </div>

      <!-- Description -->
      <div class="flex flex-col gap-1">
        <label class="text-body-strong text-neutral-700">{{ $t('createTask.description') }}</label>
        <textarea
          v-model="formDescription"
          rows="3"
          aria-label="Description"
          :placeholder="$t('createTask.descriptionPlaceholder')"
          class="w-full text-body bg-white border border-neutral-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 placeholder:text-neutral-400"
        />
      </div>

      <!-- Priority -->
      <div class="flex flex-col gap-1">
        <label class="text-body-strong text-neutral-700">{{ $t('createTask.priority') }}</label>
        <div class="flex gap-2">
          <button
            v-for="p in ['low', 'medium', 'high', 'critical'] as const"
            :key="p"
            class="flex-1 h-11 rounded-lg text-caption font-semibold border transition-colors min-h-touch capitalize"
            :class="
              formPriority === p
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-neutral-600 border-neutral-300 hover:border-brand-600'
            "
            @click="formPriority = p"
          >
            {{ $t('createTask.priorityOptions.' + p) }}
          </button>
        </div>
      </div>

      <!-- Due date -->
      <div class="flex flex-col gap-1">
        <label class="text-body-strong text-neutral-700"
          >{{ $t('createTask.dueDate') }} <span class="text-danger-500">*</span></label
        >
        <input
          type="date"
          :min="todayStr"
          :value="formDueDate"
          aria-label="Due date"
          :id="'input-dueDate'"
          :aria-describedby="(errors.dueDate && touched.dueDate) ? 'error-dueDate' : undefined"
          class="w-full h-12 text-body bg-white border rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
          :class="errors.dueDate && touched.dueDate ? 'border-danger-500' : 'border-neutral-300'"
          @input="onDueDateInput(($event.target as HTMLInputElement).value)"
        />
        <p
          v-if="errors.dueDate && touched.dueDate"
          :id="'error-dueDate'"
          class="text-caption text-danger-600 flex items-center gap-1"
        >
          <ExclamationTriangleIcon class="w-3 h-3" />
          {{ errors.dueDate }}
        </p>
      </div>

      <!-- Next follow-up -->
      <div class="flex flex-col gap-1">
        <label class="text-body-strong text-neutral-700">{{ $t('createTask.nextFollowUp') }}</label>
        <input
          type="date"
          :min="todayStr"
          :max="weekEndStr"
          :value="formFollowUp"
          aria-label="Next follow-up"
          :id="'input-followUp'"
          :aria-describedby="errors.followUp ? 'error-followUp' : undefined"
          class="w-full h-12 text-body bg-white border rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
          :class="errors.followUp ? 'border-danger-500' : 'border-neutral-300'"
          @input="onFollowUpInput(($event.target as HTMLInputElement).value)"
        />
        <p v-if="errors.followUp" :id="'error-followUp'" class="text-caption text-danger-600 flex items-center gap-1">
          <ExclamationTriangleIcon class="w-3 h-3" />
          {{ errors.followUp }}
        </p>
        <p v-else class="text-caption text-neutral-400">
          {{ $t('createTask.dueDateHint', { start: todayStr, end: weekEndStr }) }}
        </p>
      </div>

      <!-- Attachments -->
      <div class="flex flex-col gap-1">
        <label class="text-body-strong text-neutral-700">{{ $t('createTask.attachments') }}</label>
        <input
          ref="fileInput"
          type="file"
          accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
          multiple
          class="hidden"
          @change="onFileSelected"
        />
        <button
          aria-label="Upload attachments"
          class="w-full h-12 border-2 border-dashed border-neutral-300 rounded-lg text-body text-neutral-500 hover:text-neutral-700 hover:border-brand-600 transition-colors flex items-center justify-center gap-2 min-h-touch"
          @click="triggerFilePicker"
        >
          <PaperClipIcon class="w-4 h-4" />
          {{ $t('createTask.uploadPrompt') }}
        </button>
        <div v-if="formAttachments.length > 0" class="space-y-1 mt-2">
          <div
            v-for="(file, idx) in formAttachments"
            :key="idx"
            class="flex items-center justify-between bg-neutral-50 rounded-lg px-3 py-2"
          >
            <div class="flex items-center gap-2 min-w-0">
              <PaperClipIcon class="w-4 h-4 text-neutral-400 shrink-0" />
              <span class="text-body text-neutral-700 truncate">{{ file.name }}</span>
              <span class="text-caption text-neutral-400 shrink-0"
                >({{ (file.size / 1024).toFixed(1) }} KB)</span
              >
            </div>
            <button
              aria-label="Remove attachment"
              class="text-neutral-400 hover:text-danger-600 min-h-touch min-w-touch flex items-center justify-center"
              @click="removeAttachment(idx)"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Pending sync chip -->
      <div
        v-if="saved"
        class="flex items-center gap-2 px-3 py-2 bg-warning-50 text-warning-700 rounded-lg"
      >
        <ArrowPathIcon class="w-4 h-4 animate-spin" />
        <span class="text-caption font-medium">{{ $t('createTask.pendingSync') }}</span>
      </div>
    </div>

    <!-- Bottom action bar -->
    <div
      class="fixed bottom-16 lg:bottom-0 left-0 right-0 z-20 bg-white border-t border-neutral-200 px-4 py-3" style="padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px))"
    >
      <div class="max-w-lg mx-auto flex items-center gap-3">
        <button
          class="flex-1 h-12 border border-neutral-300 text-neutral-700 rounded-lg text-button font-semibold hover:bg-neutral-50 transition-colors min-h-touch"
          @click="handleCancel"
        >
          {{ $t('createTask.cancel') }}
        </button>
        <OptButton
          class="flex-1"
          variant="primary"
          size="lg"
          full-width
          :loading="saving"
          :disabled="!isFormValid || saved"
          @click="handleSave"
        >
          {{ saved ? $t('createTask.taskCreated') : $t('createTask.saveTask') }}
        </OptButton>
      </div>
    </div>
  </div>
</template>
