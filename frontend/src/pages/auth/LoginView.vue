<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../../stores/useStore'
import { useAdminStore } from '../../stores/adminStore'
import AuthLayout from '../../layouts/AuthLayout.vue'
import OptInput from '../../components/common/OptInput.vue'
import OptButton from '../../components/common/OptButton.vue'
import { login } from '../../services/authService'

type LoginTab = 'password' | 'otp'

const router = useRouter()
const store = useStore()

const activeTab = ref<LoginTab>('password')
const employeeId = ref('')
const password = ref('')
const mobile = ref('')
const loading = ref(false)
const error = ref('')
const otpSent = ref(false)
const lastAttemptTime = ref(0)
const COOLDOWN_MS = 2000

const isPasswordValid = computed(
  () => employeeId.value.trim().length > 0 && password.value.length > 0,
)

const isMobileValid = computed(() => /^\d{10}$/.test(mobile.value))

const canSubmit = computed(() => {
  if (activeTab.value === 'password') return isPasswordValid.value && !loading.value
  return isMobileValid.value && !loading.value
})

function switchTab(tab: LoginTab) {
  activeTab.value = tab
  error.value = ''
}

async function handleLogin() {
  if (!canSubmit.value) return

  // Rate-limit: 2s cooldown between attempts
  const now = Date.now()
  if (now - lastAttemptTime.value < COOLDOWN_MS) return
  lastAttemptTime.value = now

  loading.value = true
  error.value = ''

  try {
    if (activeTab.value === 'password') {
      const result = await login(employeeId.value, password.value)
      localStorage.setItem('auth_token', result.token)
      store.setUser({
        isAuthenticated: true,
        currentRole: result.role,
        employee: result.employee,
      })
      // Redirect to profile wizard if profile is incomplete
      const profileComplete = !!result.employee?.bank_details?.account_number
      if (!profileComplete) {
        router.push('/profile-wizard')
        return
      }
      // Restore deep-linked redirect or fall back to role home
      let redirect = `/${result.role}`
      try {
        const saved = sessionStorage.getItem('optiflow-redirect')
        if (saved) {
          sessionStorage.removeItem('optiflow-redirect')
          redirect = saved
        }
      } catch { /* sessionStorage unavailable */ }
      router.push(redirect)
    } else {
      otpSent.value = true
      router.push({ name: 'OTP', query: { mobile: mobile.value } })
    }
  } catch (err: any) {
    error.value = err.message || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

function handleForgotPassword() {
  router.push('/forgot-password')
}
</script>

<template>
  <AuthLayout title="Welcome back" subtitle="Log in to your OptiFlow OS account">
    <div class="flex border border-neutral-200 rounded-md overflow-hidden mb-6">
      <button
        type="button"
        class="flex-1 py-2.5 text-button text-center transition-colors duration-150"
        :class="
          activeTab === 'password'
            ? 'bg-brand-600 text-white'
            : 'bg-white text-neutral-600 hover:bg-neutral-50'
        "
        @click="switchTab('password')"
      >
        Password
      </button>
      <button
        type="button"
        class="flex-1 py-2.5 text-button text-center transition-colors duration-150"
        :class="
          activeTab === 'otp'
            ? 'bg-brand-600 text-white'
            : 'bg-white text-neutral-600 hover:bg-neutral-50'
        "
        @click="switchTab('otp')"
      >
        Mobile OTP
      </button>
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
      <p class="text-caption text-danger-700 flex-1">{{ error }}</p>
      <button
        type="button"
        class="text-danger-600 hover:text-danger-800 shrink-0"
        @click="error = ''"
        aria-label="Dismiss error"
      >
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>

    <form novalidate @submit.prevent="handleLogin">
      <div v-if="activeTab === 'password'" class="flex flex-col gap-4">
        <OptInput
          v-model="employeeId"
          label="Employee ID"
          placeholder="Enter your Employee ID"
          required
          :disabled="loading"
          :error="
            employeeId && employeeId.trim().length === 0 ? 'Employee ID is required' : undefined
          "
        />
        <OptInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
          :disabled="loading"
          :error="password && password.length === 0 ? 'Password is required' : undefined"
        />
        <div class="flex justify-end">
          <button
            type="button"
            class="text-caption text-brand-600 hover:text-brand-700 font-semibold transition-colors"
            @click="handleForgotPassword"
          >
            Forgot password?
          </button>
        </div>
      </div>

      <div v-else class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-body-strong text-neutral-700">
            Mobile Number
            <span class="text-danger-500 ml-0.5">*</span>
          </label>
          <div class="flex items-stretch">
            <span
              class="inline-flex items-center px-3 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-md text-body text-neutral-600 whitespace-nowrap"
            >
              +91
            </span>
            <input
              v-model="mobile"
              type="tel"
              inputmode="numeric"
              maxlength="10"
              placeholder="Enter 10-digit number"
              class="flex-1 h-touch px-3 py-2.5 text-body text-neutral-900 bg-white border border-neutral-300 rounded-r-md transition-colors duration-150 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
              :class="{
                'border-danger-500 focus:ring-danger-500 focus:border-danger-500':
                  mobile && !isMobileValid,
              }"
              :disabled="loading"
              @input="(e: any) => (mobile = e.target.value.replace(/\D/g, '').slice(0, 10))"
            />
          </div>
          <p v-if="mobile && !isMobileValid" class="text-caption text-danger-600" role="alert">
            Enter a valid 10-digit mobile number
          </p>
        </div>
      </div>

      <div class="mt-6">
        <OptButton
          :variant="'primary'"
          size="lg"
          :full-width="true"
          :loading="loading"
          :disabled="!canSubmit"
          type="submit"
        >
          {{ activeTab === 'password' ? 'Log In' : otpSent ? 'Resend OTP' : 'Send OTP' }}
        </OptButton>
      </div>
    </form>

    <div
      v-if="activeTab === 'password'"
      class="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200"
    >
      <p class="text-caption font-semibold text-neutral-500 mb-1">Demo credentials</p>
      <div class="text-caption text-neutral-400 leading-relaxed">
        <div>EMP-0001 / Pass@123 — Admin</div>
        <div>EMP-0002 / Pass@123 — Captain</div>
        <div>EMP-0004 / Pass@123 — Doer</div>
      </div>
    </div>
  </AuthLayout>
</template>
