<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../../stores/useStore'
import AuthLayout from '../../layouts/AuthLayout.vue'
import OptInput from '../../components/common/OptInput.vue'
import OptButton from '../../components/common/OptButton.vue'

type Step = 1 | 2 | 3 | 4

const router = useRouter()
const store = useStore()

const step = ref<Step>(1)

const steps = [
  { num: 1, label: 'Welcome' },
  { num: 2, label: 'Contact' },
  { num: 3, label: 'Bank' },
  { num: 4, label: 'Documents' },
]

const employeeId = ref(store.user.employee?.employee_id || 'EMP001')
const employeeName = ref(store.user.employee?.name || 'Rahul Sharma')

const mobile = ref(store.user.employee?.mobile || '')
const alternateContact = ref('')
const email = ref(store.user.employee?.email || '')

const accountHolder = ref('')
const accountNumber = ref('')
const ifsc = ref('')
const bankName = ref('')

const documents = ref<{ name: string; size: number; type: string }[]>([])

const loading = ref(false)
const error = ref('')
const mobileVerified = ref(false)

const isStep1Valid = computed(
  () => employeeName.value.trim().length > 0 && employeeId.value.trim().length > 0,
)

const isMobileValid = computed(() => /^\d{10}$/.test(mobile.value))

const isStep2Valid = computed(() => isMobileValid.value)

const isIfscValid = computed(() => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.value))

const isAccountNumValid = computed(() => /^\d{9,18}$/.test(accountNumber.value.replace(/\s/g, '')))

const isStep3Valid = computed(
  () =>
    accountHolder.value.trim().length > 0 &&
    isAccountNumValid.value &&
    isIfscValid.value &&
    bankName.value.trim().length > 0,
)

const isStep4Valid = computed(() => documents.value.length > 0)

const canProceed = computed(() => {
  switch (step.value) {
    case 1:
      return isStep1Valid.value
    case 2:
      return isStep2Valid.value
    case 3:
      return isStep3Valid.value
    case 4:
      return isStep4Valid.value
    default:
      return false
  }
})

const stepTitles: Record<Step, string> = {
  1: 'Welcome to OptiFlow OS',
  2: 'Contact Information',
  3: 'Bank Details',
  4: 'Upload Documents',
}

const stepSubtitles: Record<Step, string> = {
  1: "Let's set up your profile to get started.",
  2: 'Add your contact details for communication.',
  3: 'Provide bank information for salary disbursement.',
  4: 'Upload identity documents for verification.',
}

function handleNext() {
  error.value = ''
  if (step.value < 4) step.value = (step.value + 1) as Step
}

function handleBack() {
  error.value = ''
  if (step.value > 1) step.value = (step.value - 1) as Step
}

function handleSkip() {
  if (step.value === 2) {
    step.value = 3
    error.value = ''
  } else if (step.value === 4) {
    finishWizard()
  }
}

async function handleSubmit() {
  if (step.value < 4) {
    handleNext()
    return
  }
  await finishWizard()
}

async function finishWizard() {
  if (!canProceed.value && step.value === 4) return
  loading.value = true
  error.value = ''

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    store.setUser({ isAuthenticated: true })
    router.push('/doer')
  } catch {
    error.value = 'Failed to save profile. Please try again.'
  } finally {
    loading.value = false
  }
}

function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files?.length) return
  processFiles(Array.from(files))
  input.value = ''
}

function handleDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (!files?.length) return
  processFiles(Array.from(files))
}

function processFiles(files: File[]) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      error.value = 'Only JPG, PNG, and PDF files are allowed.'
      continue
    }
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'File size must be under 5 MB.'
      continue
    }
    documents.value.push({
      name: file.name,
      size: file.size,
      type: file.type,
    })
  }
}

function removeDocument(index: number) {
  documents.value.splice(index, 1)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const ifscError = computed(() => {
  if (!ifsc.value || isIfscValid.value) return undefined
  return 'Invalid IFSC format (e.g. SBIN0012345)'
})

const accountError = computed(() => {
  if (!accountNumber.value || isAccountNumValid.value) return undefined
  return 'Enter a valid account number (9-18 digits)'
})

const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileUpload() {
  fileInput.value?.click()
}
</script>

<template>
  <AuthLayout :title="stepTitles[step]" :subtitle="stepSubtitles[step]">
    <!-- Stepper -->
    <div class="flex items-center justify-between mb-6">
      <div v-for="(s, idx) in steps" :key="s.num" class="flex items-center">
        <div class="flex items-center gap-2">
          <span
            class="w-7 h-7 rounded-full flex items-center justify-center text-caption font-semibold transition-colors duration-200"
            :class="
              s.num < step
                ? 'bg-success-600 text-white'
                : s.num === step
                  ? 'bg-brand-600 text-white'
                  : 'bg-neutral-200 text-neutral-500'
            "
          >
            <svg v-if="s.num < step" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clip-rule="evenodd"
              />
            </svg>
            <span v-else>{{ s.num }}</span>
          </span>
          <span
            class="hidden sm:inline text-caption font-semibold"
            :class="
              s.num === step
                ? 'text-brand-600'
                : s.num < step
                  ? 'text-success-600'
                  : 'text-neutral-400'
            "
          >
            {{ s.label }}
          </span>
        </div>
        <div
          v-if="idx < steps.length - 1"
          class="w-8 sm:w-12 h-0.5 mx-2"
          :class="s.num < step ? 'bg-success-600' : 'bg-neutral-200'"
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

    <form novalidate @submit.prevent="handleSubmit">
      <!-- Step 1: Welcome -->
      <div v-if="step === 1" class="flex flex-col gap-4">
        <div class="text-center mb-2">
          <div
            class="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-3"
          >
            <svg
              class="w-8 h-8 text-brand-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <p class="text-body text-neutral-500">Welcome aboard! Let's get your profile ready.</p>
        </div>
        <OptInput
          v-model="employeeName"
          label="Full Name"
          placeholder="Enter your full name"
          required
          :disabled="loading"
        />
        <OptInput
          v-model="employeeId"
          label="Employee ID"
          placeholder="Enter your Employee ID"
          required
          readonly
          :disabled="loading"
          helper="This cannot be changed"
        />
      </div>

      <!-- Step 2: Contact -->
      <div v-if="step === 2" class="flex flex-col gap-4">
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

        <div class="flex items-center gap-2 mb-2">
          <input
            id="mobile-verify"
            v-model="mobileVerified"
            type="checkbox"
            class="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-600"
          />
          <label for="mobile-verify" class="text-caption text-neutral-600">
            I confirm this mobile number is correct
          </label>
        </div>

        <OptInput
          v-model="alternateContact"
          label="Alternate Contact (optional)"
          type="tel"
          placeholder="Alternate mobile number"
          :disabled="loading"
          mask
        />
        <OptInput
          v-model="email"
          label="Email (optional)"
          type="email"
          placeholder="email@example.com"
          :disabled="loading"
        />
      </div>

      <!-- Step 3: Bank Details -->
      <div v-if="step === 3" class="flex flex-col gap-4">
        <OptInput
          v-model="accountHolder"
          label="Account Holder Name"
          placeholder="As per bank records"
          required
          :disabled="loading"
        />
        <OptInput
          v-model="accountNumber"
          label="Account Number"
          type="number"
          placeholder="Enter account number"
          required
          :disabled="loading"
          :error="accountError"
        />
        <div class="flex flex-col gap-1.5">
          <label class="text-body-strong text-neutral-700">
            IFSC Code
            <span class="text-danger-500 ml-0.5">*</span>
          </label>
          <input
            v-model="ifsc"
            type="text"
            maxlength="11"
            placeholder="e.g. SBIN0012345"
            class="w-full h-touch px-3 py-2.5 text-body text-neutral-900 bg-white border rounded-md transition-colors duration-150 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 uppercase"
            :class="
              ifsc && !isIfscValid
                ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
                : 'border-neutral-300'
            "
            :disabled="loading"
            @input="
              (e: any) =>
                (ifsc = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, '')
                  .slice(0, 11))
            "
          />
          <p v-if="ifsc && !isIfscValid" class="text-caption text-danger-600" role="alert">
            {{ ifscError }}
          </p>
        </div>
        <OptInput
          v-model="bankName"
          label="Bank Name"
          placeholder="Enter bank name"
          required
          :disabled="loading"
        />
        <p class="text-caption text-neutral-400 flex items-center gap-1">
          <svg class="w-4 h-4 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clip-rule="evenodd"
            />
          </svg>
          Your bank details are encrypted and secure.
        </p>
      </div>

      <!-- Step 4: Documents -->
      <div v-if="step === 4" class="flex flex-col gap-4">
        <div
          class="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-brand-600 transition-colors cursor-pointer"
          :class="{ 'opacity-50 pointer-events-none': loading }"
          @click="triggerFileUpload"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <svg
            class="w-10 h-10 text-neutral-400 mx-auto mb-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 16V4M8 8l4-4 4 4" />
            <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>
          <p class="text-body-strong text-neutral-600 mb-1">Upload Aadhaar / ID Proof</p>
          <p class="text-caption text-neutral-400">JPG, PNG or PDF. Max 5 MB each.</p>
          <input
            ref="fileInput"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            multiple
            class="hidden"
            :disabled="loading"
            @change="handleFileUpload"
          />
        </div>

        <div v-if="documents.length > 0" class="flex flex-col gap-2">
          <div
            v-for="(doc, idx) in documents"
            :key="idx"
            class="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-md"
          >
            <div class="flex items-center gap-2 min-w-0">
              <svg
                class="w-5 h-5 text-brand-600 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <div class="min-w-0">
                <p class="text-body text-neutral-900 truncate">{{ doc.name }}</p>
                <p class="text-caption text-neutral-400">{{ formatFileSize(doc.size) }}</p>
              </div>
            </div>
            <button
              type="button"
              class="text-neutral-400 hover:text-danger-600 transition-colors p-1"
              :disabled="loading"
              aria-label="Remove {{ doc.name }}"
              @click="removeDocument(idx)"
            >
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="mt-6 flex flex-col gap-3">
        <OptButton
          variant="primary"
          size="lg"
          :full-width="true"
          :loading="loading"
          :disabled="!canProceed && step !== 4"
          type="submit"
        >
          {{ step < 4 ? 'Next' : 'Complete Setup' }}
        </OptButton>

        <div class="flex items-center justify-between">
          <button
            v-if="step > 1"
            type="button"
            class="text-button text-neutral-500 hover:text-neutral-700 transition-colors"
            :disabled="loading"
            @click="handleBack"
          >
            Back
          </button>
          <button
            v-if="step === 2 || step === 4"
            type="button"
            class="text-button text-neutral-500 hover:text-neutral-700 transition-colors ml-auto"
            :disabled="loading"
            @click="handleSkip"
          >
            Skip for now
          </button>
        </div>
      </div>
    </form>
  </AuthLayout>
</template>
