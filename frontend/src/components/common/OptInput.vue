<script setup lang="ts">
import { ref, computed } from 'vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

type InputType = 'text' | 'email' | 'tel' | 'number' | 'password'

const props = withDefaults(
  defineProps<{
    label: string
    modelValue: string | number
    type?: InputType
    placeholder?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    error?: string
    helper?: string
    hint?: string
    mask?: boolean
  }>(),
  {
    type: 'text',
    placeholder: '',
    required: false,
    disabled: false,
    readonly: false,
    error: undefined,
    helper: undefined,
    hint: undefined,
    mask: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const showPassword = ref(false)
const inputId = `opt-input-${Math.random().toString(36).slice(2, 9)}`

const isPassword = computed(() => props.type === 'password')

const inputType = computed(() => {
  if (isPassword.value && showPassword.value) return 'text'
  return props.type
})

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  let value = target.value
  if (props.mask && props.type === 'tel') {
    value = value.replace(/\D/g, '').slice(0, 10)
  }
  emit('update:modelValue', value)
}

function onBlur(e: FocusEvent) {
  emit('blur', e)
}

function onFocus(e: FocusEvent) {
  emit('focus', e)
}

function togglePassword() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="inputId" class="text-body-strong text-neutral-700">
      {{ label }}
      <span v-if="required" class="text-danger-500 ml-0.5" aria-hidden="true">*</span>
    </label>
    <div class="relative">
      <input
        :id="inputId"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined"
        :aria-required="required"
        class="w-full h-touch px-3 py-2.5 text-body text-neutral-900 bg-white border rounded-md transition-colors duration-150 placeholder:text-neutral-400 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed readonly:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
        :class="[
          error
            ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
            : 'border-neutral-300',
        ]"
        @input="onInput"
        @blur="onBlur"
        @focus="onFocus"
      />
      <button
        v-if="isPassword"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 min-h-touch min-w-touch flex items-center justify-center"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        :aria-pressed="showPassword"
        @click="togglePassword"
      >
        <EyeIcon v-if="!showPassword" class="w-5 h-5" aria-hidden="true" />
        <EyeSlashIcon v-else class="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
    <p v-if="error" :id="`${inputId}-error`" class="text-caption text-danger-600" role="alert">
      {{ error }}
    </p>
    <p v-else-if="helper" :id="`${inputId}-helper`" class="text-caption text-neutral-500">
      {{ helper }}
    </p>
    <p v-if="hint && !error" class="text-caption text-neutral-400">
      {{ hint }}
    </p>
  </div>
</template>
