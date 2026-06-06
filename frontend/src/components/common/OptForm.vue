<script setup lang="ts">
import { ref, computed } from 'vue'
import OptInput from './OptInput.vue'
import OptSelect from './OptSelect.vue'
import OptButton from './OptButton.vue'

export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'password' | 'select' | 'textarea' | 'date' | 'file'

export interface FormField {
  key: string
  type: FieldType
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: { value: string; label: string }[]
  validators?: ((value: any, form: Record<string, any>) => string | null)[]
  hint?: string
  cols?: 1 | 2 | 3
}

export interface FormErrors {
  [key: string]: string | null
}

const props = withDefaults(
  defineProps<{
    fields: FormField[]
    modelValue: Record<string, any>
    submitLabel?: string
    cancelLabel?: string
    loading?: boolean
    columns?: 1 | 2
    validation?: 'on-submit' | 'on-blur' | 'on-change'
  }>(),
  {
    submitLabel: 'Save',
    cancelLabel: 'Cancel',
    loading: false,
    columns: 1,
    validation: 'on-submit',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  submit: [values: Record<string, any>]
  cancel: []
}>()

const errors = ref<FormErrors>({})
const touched = ref<Set<string>>(new Set())

function validateField(field: FormField): string | null {
  if (!field.validators) return null
  const value = props.modelValue[field.key]
  for (const validator of field.validators) {
    const error = validator(value, props.modelValue)
    if (error) return error
  }
  return null
}

function validateForm(): boolean {
  const newErrors: FormErrors = {}
  let valid = true
  for (const field of props.fields) {
    const error = validateField(field)
    if (error) {
      newErrors[field.key] = error
      valid = false
    }
  }
  errors.value = newErrors
  return valid
}

function handleBlur(field: FormField) {
  touched.value.add(field.key)
  if (props.validation === 'on-blur') {
    errors.value[field.key] = validateField(field)
  }
}

function handleInput(field: FormField, value: any) {
  emit('update:modelValue', { ...props.modelValue, [field.key]: value })
  if (props.validation === 'on-change' && touched.value.has(field.key)) {
    errors.value[field.key] = validateField(field)
  }
}

function handleSubmit() {
  if (!validateForm()) return
  emit('submit', { ...props.modelValue })
}

const gridCols = computed(() => {
  if (props.columns === 2) return 'sm:grid-cols-2'
  return 'sm:grid-cols-1'
})

function colSpan(field: FormField): string {
  if (field.cols === 2) return 'sm:col-span-2'
  if (field.cols === 3) return 'sm:col-span-3'
  return ''
}
</script>

<template>
  <form class="opt-form" @submit.prevent="handleSubmit">
    <div
      v-if="$slots.beforeFields"
    >
      <slot name="beforeFields" />
    </div>

    <div :class="['grid grid-cols-1 gap-4', gridCols]">
      <div
        v-for="field in fields"
        :key="field.key"
        :class="colSpan(field)"
      >
        <OptInput
          v-if="field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'number' || field.type === 'password'"
          :type="field.type === 'number' ? 'number' : field.type === 'tel' ? 'tel' : field.type === 'password' ? 'password' : 'text'"
          :label="field.label"
          :model-value="modelValue[field.key] ?? ''"
          :placeholder="field.placeholder"
          :required="field.required"
          :disabled="field.disabled || loading"
          :error="errors[field.key] || undefined"
          :hint="field.hint"
          :mask="field.type === 'tel'"
          @update:model-value="(v) => handleInput(field, v)"
          @blur="() => handleBlur(field)"
        />

        <OptSelect
          v-else-if="field.type === 'select'"
          :label="field.label"
          :model-value="modelValue[field.key] ?? ''"
          :options="field.options || []"
          :placeholder="field.placeholder"
          :disabled="field.disabled || loading"
          :error="errors[field.key] || undefined"
          :hint="field.hint"
          @update:model-value="(v) => handleInput(field, v)"
        />

        <div v-else-if="field.type === 'textarea'" class="flex flex-col gap-1.5">
          <label class="text-body-strong text-neutral-700">
            {{ field.label }}
            <span v-if="field.required" class="text-danger-500 ml-0.5">*</span>
          </label>
          <textarea
            :value="modelValue[field.key] ?? ''"
            :placeholder="field.placeholder"
            :disabled="field.disabled || loading"
            :required="field.required"
            :aria-invalid="!!errors[field.key]"
            class="w-full h-24 px-3 py-2.5 text-body text-neutral-900 bg-white border rounded-md transition-colors placeholder:text-neutral-400 disabled:bg-neutral-100 disabled:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 resize-y"
            :class="errors[field.key] ? 'border-danger-500 focus:ring-danger-500' : 'border-neutral-300'"
            @input="(e) => handleInput(field, (e.target as HTMLTextAreaElement).value)"
            @blur="() => handleBlur(field)"
          />
          <p v-if="errors[field.key]" class="text-caption text-danger-600" role="alert">
            {{ errors[field.key] }}
          </p>
          <p v-else-if="field.hint" class="text-caption text-neutral-500">
            {{ field.hint }}
          </p>
        </div>

        <div v-else-if="field.type === 'date'" class="flex flex-col gap-1.5">
          <label class="text-body-strong text-neutral-700">
            {{ field.label }}
            <span v-if="field.required" class="text-danger-500 ml-0.5">*</span>
          </label>
          <input
            type="date"
            :value="modelValue[field.key] ?? ''"
            :disabled="field.disabled || loading"
            :required="field.required"
            class="w-full h-touch px-3 py-2.5 text-body text-neutral-900 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
            :class="errors[field.key] ? 'border-danger-500' : 'border-neutral-300'"
            @input="(e) => handleInput(field, (e.target as HTMLInputElement).value)"
            @blur="() => handleBlur(field)"
          />
          <p v-if="errors[field.key]" class="text-caption text-danger-600" role="alert">
            {{ errors[field.key] }}
          </p>
        </div>

        <div v-else-if="field.type === 'file'" class="flex flex-col gap-1.5">
          <label class="text-body-strong text-neutral-700">
            {{ field.label }}
            <span v-if="field.required" class="text-danger-500 ml-0.5">*</span>
          </label>
          <div
            class="border-2 border-dashed border-neutral-300 rounded-lg px-4 py-6 text-center hover:border-brand-400 transition-colors cursor-pointer"
            @click="($refs as any)[`file-${field.key}`]?.click()"
            @dragover.prevent
            @drop.prevent="(e: DragEvent) => { const files = e.dataTransfer?.files; if (files?.length) handleInput(field, files[0]) }"
          >
            <input
              :ref="(el: any) => { if (el) { const input = el as HTMLInputElement; input.onchange = () => { if (input.files?.length) handleInput(field, input.files[0]) } } }"
              type="file"
              class="hidden"
              :accept="'image/*,.pdf,.doc,.docx'"
            />
            <p class="text-body text-neutral-500">
              {{ modelValue[field.key] instanceof File ? (modelValue[field.key] as File).name : 'Drag & drop or click to upload' }}
            </p>
            <p class="text-caption text-neutral-400 mt-1">JPG, PNG, PDF up to 5MB</p>
          </div>
          <p v-if="errors[field.key]" class="text-caption text-danger-600" role="alert">
            {{ errors[field.key] }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="$slots.afterFields"
      class="mt-4"
    >
      <slot name="afterFields" />
    </div>

    <div
      v-if="$slots.actions || submitLabel"
      class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-neutral-100"
    >
      <slot name="actions" :loading="loading" :valid="Object.keys(errors).length === 0">
        <OptButton
          v-if="cancelLabel"
          variant="ghost"
          type="button"
          :disabled="loading"
          @click="emit('cancel')"
        >
          {{ cancelLabel }}
        </OptButton>
        <OptButton
          variant="primary"
          type="submit"
          :loading="loading"
        >
          {{ submitLabel }}
        </OptButton>
      </slot>
    </div>
  </form>
