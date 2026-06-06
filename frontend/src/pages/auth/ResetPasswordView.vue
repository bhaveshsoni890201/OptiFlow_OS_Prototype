<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '../../stores/useStore'
import AuthLayout from '../../layouts/AuthLayout.vue'
import OptInput from '../../components/common/OptInput.vue'
import OptButton from '../../components/common/OptButton.vue'

const router = useRouter()
const route = useRoute()
const store = useStore()

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const token = ref((route.query.token as string) || '')

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

const canSubmit = computed(
  () => passwordScore.value.score >= 3 && passwordsMatch.value && !loading.value,
)

const rules = computed(() => [
  { met: newPassword.value.length >= 8, text: 'At least 8 characters' },
  { met: /[a-z]/.test(newPassword.value), text: 'One lowercase letter' },
  { met: /[A-Z]/.test(newPassword.value), text: 'One uppercase letter' },
  { met: /\d/.test(newPassword.value), text: 'One number' },
  { met: /[^a-zA-Z0-9]/.test(newPassword.value), text: 'One special character' },
])

async function handleSubmit() {
  if (!canSubmit.value) return
  loading.value = true
  error.value = ''

  try {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (token.value) resolve(true)
        else reject(new Error('Invalid or expired reset link.'))
      }, 1500)
    })
    store.clearAuth()
    router.push({ path: '/login', query: { reset: 'success' } })
  } catch (err: any) {
    error.value = err.message || 'Failed to reset password.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout title="Reset Password" subtitle="Enter your new password below">
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

    <form novalidate @submit.prevent="handleSubmit">
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
              v-for="rule in rules"
              :key="rule.text"
              class="text-caption"
              :class="rule.met ? 'text-success-600' : 'text-neutral-400'"
            >
              {{ rule.met ? '✓' : '○' }} {{ rule.text }}
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
          :disabled="!canSubmit"
          type="submit"
        >
          Reset Password
        </OptButton>
      </div>
    </form>
  </AuthLayout>
</template>
