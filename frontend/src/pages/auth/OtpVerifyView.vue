<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '../../stores/useStore'
import { verifyOtp } from '../../services/authService'
import AuthLayout from '../../layouts/AuthLayout.vue'
import OptButton from '../../components/common/OptButton.vue'

const router = useRouter()
const route = useRoute()
const store = useStore()

const mobile = ref((route.query.mobile as string) || '')
const digits = ref(['', '', '', '', '', ''])
const loading = ref(false)
const error = ref('')
const resendCooldown = ref(30)
const resendEnabled = ref(false)
let timerHandle: ReturnType<typeof setInterval> | undefined

const maskedMobile = computed(() => {
  if (!mobile.value) return ''
  const last4 = mobile.value.slice(-4)
  return `+91 ••••• ••${last4}`
})

const isComplete = computed(() => digits.value.every((d) => /^\d$/.test(d)))

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function startTimer() {
  resendCooldown.value = 30
  resendEnabled.value = false
  clearInterval(timerHandle)
  timerHandle = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      resendCooldown.value = 0
      resendEnabled.value = true
      clearInterval(timerHandle)
    }
  }, 1000)
}

function onDigitInput(index: number, e: Event) {
  const target = e.target as HTMLInputElement
  let val = target.value.replace(/\D/g, '')
  if (val.length > 1) val = val.slice(-1)
  digits.value[index] = val

  if (val && index < 5) {
    const next = document.getElementById(`otp-${index + 1}`) as HTMLInputElement
    next?.focus()
  }
}

function onDigitKeydown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !digits.value[index] && index > 0) {
    const prev = document.getElementById(`otp-${index - 1}`) as HTMLInputElement
    prev?.focus()
  }
  if (e.key === 'ArrowLeft' && index > 0) {
    const prev = document.getElementById(`otp-${index - 1}`) as HTMLInputElement
    prev?.focus()
  }
  if (e.key === 'ArrowRight' && index < 5) {
    const next = document.getElementById(`otp-${index + 1}`) as HTMLInputElement
    next?.focus()
  }
}

function onPaste(e: ClipboardEvent) {
  const data = e.clipboardData?.getData('text') || ''
  const cleaned = data.replace(/\D/g, '').slice(0, 6)
  for (let i = 0; i < 6; i++) {
    digits.value[i] = cleaned[i] || ''
  }
  const focusIdx = Math.min(cleaned.length, 5)
  const target = document.getElementById(`otp-${focusIdx}`) as HTMLInputElement
  target?.focus()
}

async function handleVerify() {
  if (!isComplete.value) return
  loading.value = true
  error.value = ''

  try {
    const otp = digits.value.join('')
    const result = await verifyOtp(mobile.value, otp)
    localStorage.setItem('auth_token', result.token)
    store.setUser({
      isAuthenticated: true,
      currentRole: result.role,
      employee: result.employee,
    })
    router.push(`/${result.role}`)
  } catch (err: any) {
    error.value = err.message || 'OTP verification failed.'
    digits.value = ['', '', '', '', '', '']
    document.getElementById('otp-0')?.focus()
  } finally {
    loading.value = false
  }
}

function handleResend() {
  if (!resendEnabled.value) return
  error.value = ''
  digits.value = ['', '', '', '', '', '']
  startTimer()
}

function handleChangeNumber() {
  router.push('/login')
}

onMounted(() => {
  startTimer()
  setTimeout(() => document.getElementById('otp-0')?.focus(), 100)
})

onUnmounted(() => {
  clearInterval(timerHandle)
})
</script>

<template>
  <AuthLayout title="Verify OTP" subtitle="Enter the code sent to your mobile">
    <p class="text-center text-body text-neutral-600 mb-6">
      OTP sent to
      <span class="font-semibold text-neutral-900">{{ maskedMobile }}</span>
    </p>

    <div
      v-if="error"
      class="mb-4 p-3 bg-danger-50 border border-danger-500 rounded-md flex items-start gap-2"
      role="alert"
    >
      <svg
        class="w-5 h-5 text-danger-600 shrink-0 mt-0.5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clip-rule="evenodd"
        />
      </svg>
      <p class="text-caption text-danger-700">{{ error }}</p>
    </div>

    <form novalidate @submit.prevent="handleVerify">
      <fieldset class="border-0 p-0 m-0" :disabled="loading">
        <legend class="sr-only">Enter 6-digit OTP</legend>
        <div class="flex items-center justify-between gap-2 sm:gap-3 mb-6">
          <input
            v-for="(digit, idx) in digits"
            :id="`otp-${idx}`"
            :key="idx"
            v-model="digits[idx]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            autocomplete="one-time-code"
            class="w-11 h-12 sm:w-12 sm:h-14 text-center text-h2 font-semibold text-neutral-900 bg-white border border-neutral-300 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
            :class="{
              'border-danger-500 focus:ring-danger-500 focus:border-danger-500': error && !digit,
            }"
            aria-label="Digit {{ idx + 1 }}"
            @input="onDigitInput(idx, $event)"
            @keydown="onDigitKeydown(idx, $event)"
            @paste="idx === 0 ? onPaste($event) : undefined"
          />
        </div>
      </fieldset>

      <OptButton
        variant="primary"
        size="lg"
        :full-width="true"
        :loading="loading"
        :disabled="!isComplete"
        type="submit"
      >
        Verify &amp; Continue
      </OptButton>
    </form>

    <div class="mt-4 text-center">
      <p v-if="!resendEnabled" class="text-caption text-neutral-500 mb-2">
        Resend in
        <span class="font-semibold text-neutral-700">{{ formatTime(resendCooldown) }}</span>
      </p>
      <button
        v-else
        type="button"
        class="text-button text-brand-600 hover:text-brand-700 font-semibold transition-colors"
        :disabled="loading"
        @click="handleResend"
      >
        Resend OTP
      </button>
    </div>

    <div class="mt-4 text-center">
      <button
        type="button"
        class="text-caption text-neutral-500 hover:text-neutral-700 transition-colors"
        :disabled="loading"
        @click="handleChangeNumber"
      >
        Change number
      </button>
    </div>
  </AuthLayout>
</template>
