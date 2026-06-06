<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '../../layouts/AuthLayout.vue'
import OptInput from '../../components/common/OptInput.vue'
import OptButton from '../../components/common/OptButton.vue'

type Step = 1 | 2 | 3

const router = useRouter()

const step = ref<Step>(1)
const employeeId = ref('')
const otpDigits = ref(['', '', '', '', '', ''])
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const resendCooldown = ref(30)
const resendEnabled = ref(false)
let timerHandle: ReturnType<typeof setInterval> | undefined

const stepTitles: Record<Step, string> = {
  1: 'Identify Account',
  2: 'Verify OTP',
  3: 'Reset Password',
}

const stepLabels = ['Identify', 'Verify', 'Reset']

const isStep1Valid = computed(() => employeeId.value.trim().length > 0)

const isOtpComplete = computed(() => otpDigits.value.every((d) => /^\d$/.test(d)))

const passwordScore = computed(() => {
  const p = newPassword.value
  if (!p) return { score: 0, label: '', color: '', width: '0%' }
  let s = 0
  if (p.length >= 8) s++
  if (/[a-z]/.test(p)) s++
  if (/[A-Z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^a-zA-Z0-9]/.test(p)) s++
  const map: Record<number, { label: string; color: string; width: string }> = {
    0: { label: 'Very weak', color: 'bg-danger-500', width: '10%' },
    1: { label: 'Weak', color: 'bg-danger-500', width: '25%' },
    2: { label: 'Fair', color: 'bg-warning-500', width: '50%' },
    3: { label: 'Strong', color: 'bg-success-600', width: '75%' },
    4: { label: 'Very strong', color: 'bg-success-600', width: '100%' },
    5: { label: 'Very strong', color: 'bg-success-600', width: '100%' },
  }
  return { score: s, ...map[s] }
})

const passwordsMatch = computed(
  () => newPassword.value === confirmPassword.value && confirmPassword.value.length > 0,
)

const isStep3Valid = computed(() => passwordScore.value.score >= 3 && passwordsMatch.value)

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
  otpDigits.value[index] = val
  if (val && index < 5) {
    const next = document.getElementById(`fp-otp-${index + 1}`) as HTMLInputElement
    next?.focus()
  }
}

function onDigitKeydown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    const prev = document.getElementById(`fp-otp-${index - 1}`) as HTMLInputElement
    prev?.focus()
  }
}

function onPaste(e: ClipboardEvent) {
  const data = e.clipboardData?.getData('text') || ''
  const cleaned = data.replace(/\D/g, '').slice(0, 6)
  for (let i = 0; i < 6; i++) otpDigits.value[i] = cleaned[i] || ''
  const focusIdx = Math.min(cleaned.length, 5)
  document.getElementById(`fp-otp-${focusIdx}`)?.focus()
}

async function handleSendReset() {
  if (!isStep1Valid.value) return
  loading.value = true
  error.value = ''
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    step.value = 2
    startTimer()
    setTimeout(() => document.getElementById('fp-otp-0')?.focus(), 100)
  } catch {
    error.value = 'Failed to send reset code.'
  } finally {
    loading.value = false
  }
}

async function handleVerifyOtp() {
  if (!isOtpComplete.value) return
  loading.value = true
  error.value = ''
  try {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otpDigits.value.join('') === '111111') resolve(true)
        else reject(new Error('Invalid or expired OTP.'))
      }, 1500)
    })
    step.value = 3
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function handleResetPassword() {
  if (!isStep3Valid.value) return
  loading.value = true
  error.value = ''
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    router.push({ path: '/login', query: { reset: 'success' } })
  } catch {
    error.value = 'Failed to reset password.'
  } finally {
    loading.value = false
  }
}

function handleBack() {
  if (step.value === 2) {
    step.value = 1
    error.value = ''
  } else if (step.value === 3) {
    step.value = 2
    error.value = ''
  }
}

function handleResend() {
  if (!resendEnabled.value) return
  otpDigits.value = ['', '', '', '', '', '']
  error.value = ''
  startTimer()
}

onUnmounted(() => clearInterval(timerHandle))
</script>

<template>
  <AuthLayout :title="stepTitles[step]" subtitle="Follow the steps to reset your password">
    <div class="flex items-center justify-between mb-6">
      <div v-for="(label, idx) in stepLabels" :key="idx" class="flex items-center">
        <div class="flex items-center gap-2">
          <span
            class="w-7 h-7 rounded-full flex items-center justify-center text-caption font-semibold transition-colors duration-200"
            :class="
              idx + 1 < step
                ? 'bg-success-600 text-white'
                : idx + 1 === step
                  ? 'bg-brand-600 text-white'
                  : 'bg-neutral-200 text-neutral-500'
            "
          >
            <svg v-if="idx + 1 < step" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clip-rule="evenodd"
              />
            </svg>
            <span v-else>{{ idx + 1 }}</span>
          </span>
          <span
            class="hidden sm:inline text-caption font-semibold"
            :class="
              idx + 1 === step
                ? 'text-brand-600'
                : idx + 1 < step
                  ? 'text-success-600'
                  : 'text-neutral-400'
            "
          >
            {{ label }}
          </span>
        </div>
        <div
          v-if="idx < stepLabels.length - 1"
          class="w-8 sm:w-12 h-0.5 mx-2"
          :class="idx + 1 < step ? 'bg-success-600' : 'bg-neutral-200'"
        />
      </div>
    </div>

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

    <!-- Step 1: Identify -->
    <form v-if="step === 1" novalidate @submit.prevent="handleSendReset">
      <OptInput
        v-model="employeeId"
        label="Employee ID or Mobile Number"
        placeholder="Enter Employee ID or mobile"
        required
        :disabled="loading"
      />
      <div class="mt-6">
        <OptButton
          variant="primary"
          size="lg"
          :full-width="true"
          :loading="loading"
          :disabled="!isStep1Valid"
          type="submit"
        >
          Send Reset Code
        </OptButton>
      </div>
    </form>

    <!-- Step 2: Verify OTP -->
    <form v-else-if="step === 2" novalidate @submit.prevent="handleVerifyOtp">
      <p class="text-center text-body text-neutral-600 mb-4">
        Enter the code sent to your registered mobile
      </p>
      <fieldset class="border-0 p-0 m-0" :disabled="loading">
        <legend class="sr-only">Enter 6-digit OTP</legend>
        <div class="flex items-center justify-between gap-2 sm:gap-3 mb-4">
          <input
            v-for="(digit, idx) in otpDigits"
            :id="`fp-otp-${idx}`"
            :key="idx"
            v-model="otpDigits[idx]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            autocomplete="one-time-code"
            class="w-11 h-12 sm:w-12 sm:h-14 text-center text-h2 font-semibold text-neutral-900 bg-white border border-neutral-300 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
            :class="{ 'border-danger-500': error && !digit }"
            aria-label="Digit {{ idx + 1 }}"
            @input="onDigitInput(idx, $event)"
            @keydown="onDigitKeydown(idx, $event)"
            @paste="idx === 0 ? onPaste($event) : undefined"
          />
        </div>
      </fieldset>

      <div class="text-center mb-4">
        <p v-if="!resendEnabled" class="text-caption text-neutral-500">
          Resend in
          <span class="font-semibold text-neutral-700">{{ formatTime(resendCooldown) }}</span>
        </p>
        <button
          v-else
          type="button"
          class="text-button text-brand-600 hover:text-brand-700 font-semibold"
          @click="handleResend"
        >
          Resend OTP
        </button>
      </div>

      <OptButton
        variant="primary"
        size="lg"
        :full-width="true"
        :loading="loading"
        :disabled="!isOtpComplete"
        type="submit"
      >
        Verify OTP
      </OptButton>
    </form>

    <!-- Step 3: Reset Password -->
    <form v-else-if="step === 3" novalidate @submit.prevent="handleResetPassword">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <OptInput
            v-model="newPassword"
            label="New Password"
            type="password"
            placeholder="Create new password"
            required
            :disabled="loading"
          />
          <div v-if="newPassword" class="mt-1">
            <div class="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="passwordScore.color"
                :style="{ width: passwordScore.width }"
              />
            </div>
            <p
              class="text-caption mt-1"
              :class="passwordScore.score >= 3 ? 'text-success-600' : 'text-neutral-500'"
            >
              {{ passwordScore.label }}
            </p>
          </div>
          <div v-if="newPassword" class="flex flex-col gap-1 mt-1">
            <p
              class="text-caption"
              :class="newPassword.length >= 8 ? 'text-success-600' : 'text-neutral-400'"
            >
              {{ newPassword.length >= 8 ? '✓' : '○' }} At least 8 characters
            </p>
            <p
              class="text-caption"
              :class="/[a-z]/.test(newPassword) ? 'text-success-600' : 'text-neutral-400'"
            >
              {{ /[a-z]/.test(newPassword) ? '✓' : '○' }} One lowercase letter
            </p>
            <p
              class="text-caption"
              :class="/[A-Z]/.test(newPassword) ? 'text-success-600' : 'text-neutral-400'"
            >
              {{ /[A-Z]/.test(newPassword) ? '✓' : '○' }} One uppercase letter
            </p>
            <p
              class="text-caption"
              :class="/\d/.test(newPassword) ? 'text-success-600' : 'text-neutral-400'"
            >
              {{ /\d/.test(newPassword) ? '✓' : '○' }} One number
            </p>
            <p
              class="text-caption"
              :class="/[^a-zA-Z0-9]/.test(newPassword) ? 'text-success-600' : 'text-neutral-400'"
            >
              {{ /[^a-zA-Z0-9]/.test(newPassword) ? '✓' : '○' }} One special character
            </p>
          </div>
        </div>
        <OptInput
          v-model="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Re-enter new password"
          required
          :disabled="loading"
          :error="confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined"
        />
      </div>

      <div class="mt-6">
        <OptButton
          variant="primary"
          size="lg"
          :full-width="true"
          :loading="loading"
          :disabled="!isStep3Valid"
          type="submit"
        >
          Update Password
        </OptButton>
      </div>
    </form>

    <div v-if="step > 1" class="mt-4 text-center">
      <button
        type="button"
        class="text-caption text-neutral-500 hover:text-neutral-700 transition-colors"
        :disabled="loading"
        @click="handleBack"
      >
        Back to {{ step === 2 ? 'identification' : 'verification' }}
      </button>
    </div>
  </AuthLayout>
</template>
