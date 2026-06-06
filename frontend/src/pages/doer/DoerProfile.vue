<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  UserIcon,
  PencilSquareIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  KeyIcon,
  BellIcon,
  LanguageIcon,
  SunIcon,
  MoonIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/vue/24/solid'
import { useStore } from '../../stores/useStore'
import type { Language } from '../../types'

const store = useStore()
const { t } = useI18n()

function buildEmployee() {
  const e = store.user.employee
  return {
    employee_id: e?.employee_id ?? '',
    name: e?.name ?? 'User',
    mobile: e?.mobile ?? '',
    email: '',
    department: e?.department ?? '',
    designation: e?.designation ?? '',
    reporting_captain: '',
    bank_holder: e?.name ?? 'User',
    bank_account: e?.bank_details?.account_number ?? '',
    bank_ifsc: e?.bank_details?.ifsc ?? '',
    bank_name: e?.bank_details?.bank_name ?? '',
    aadhaar: '',
  }
}

const employee = ref(buildEmployee())

const editMode = ref(false)
const editMobile = ref(employee.value.mobile)
const editEmail = ref(employee.value.email)
const saving = ref(false)
const saveSuccess = ref(false)
const error = ref('')
const showLogoutConfirm = ref(false)
const showBank = ref(false)
const showChangePassword = ref(false)

const passwordOld = ref('')
const passwordNew = ref('')
const passwordConfirm = ref('')
const passwordErrors = ref<Record<string, string>>({})
const passwordSuccess = ref(false)
const contactErrors = ref<Record<string, string>>({})

const language = ref<Language>(store.language || 'en')
const highContrast = ref(store.ui.theme === 'high-contrast')

const initials = computed(() =>
  employee.value.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

function startEdit() {
  editMode.value = true
  editMobile.value = employee.value.mobile
  editEmail.value = employee.value.email
  contactErrors.value = {}
  saveSuccess.value = false
}

function cancelEdit() {
  editMode.value = false
  editMobile.value = employee.value.mobile
  editEmail.value = employee.value.email
  contactErrors.value = {}
}

async function saveContact() {
  contactErrors.value = {}
  if (editMobile.value && !/^\+91-[0-9]{10}$/.test(editMobile.value))
    contactErrors.value.mobile = t('profile.validation.phoneFormat')
  if (editEmail.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.value))
    contactErrors.value.email = t('profile.validation.invalidEmail')
  if (Object.keys(contactErrors.value).length) return
  saving.value = true
  error.value = ''
  try {
    employee.value.mobile = editMobile.value
    employee.value.email = editEmail.value
    editMode.value = false
    saveSuccess.value = true
    setTimeout(() => (saveSuccess.value = false), 3000)
  } catch {
    error.value = t('profile.validation.saveFailed')
  }
  saving.value = false
}

function submitPasswordChange() {
  passwordErrors.value = {}
  if (!passwordOld.value) passwordErrors.value.old = t('profile.validation.required')
  if (!passwordNew.value) passwordErrors.value.new = t('profile.validation.required')
  else if (passwordNew.value.length < 8) passwordErrors.value.new = t('profile.validation.min8Chars')
  if (passwordNew.value !== passwordConfirm.value) passwordErrors.value.confirm = t('profile.validation.mismatch')
  if (Object.keys(passwordErrors.value).length) return
  passwordSuccess.value = true
}

const router = useRouter()

function confirmLogout() {
  showLogoutConfirm.value = false
  store.clearAuth()
  router.push('/login')
}

function toggleHighContrast() {
  highContrast.value = !highContrast.value
  store.setTheme(highContrast.value ? 'high-contrast' : 'light')
}

function setLang(l: Language) {
  language.value = l
  store.setLanguage(l)
}
</script>

<template>
  <h1 class="text-h2 text-neutral-900">{{ $t('profile.title') }}</h1>

    <div v-if="error" class="card p-4 text-center" role="alert" aria-live="polite">
      <ExclamationTriangleIcon class="h-10 w-10 text-danger-400 mx-auto mb-2" />
      <p class="text-body text-neutral-500">{{ error }}</p>
      <button
        class="mt-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
        @click="error = ''"
      >
        {{ $t('profile.dismiss') }}
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-card p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div
          class="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-display font-bold flex-shrink-0"
        >
          {{ initials }}
        </div>
        <div class="flex-1 text-center sm:text-left">
          <h2 class="text-h2 text-neutral-900">{{ employee.name }}</h2>
          <p class="text-body text-neutral-500 mt-0.5">{{ employee.designation }}</p>
          <div
            class="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-2 text-caption text-neutral-400"
          >
            <span class="flex items-center gap-1"
              ><BriefcaseIcon class="h-3.5 w-3.5" /> {{ employee.department }}</span
            >
            <span class="flex items-center gap-1"
              ><IdentificationIcon class="h-3.5 w-3.5" /> {{ employee.employee_id }}</span
            >
            <span class="flex items-center gap-1"
              ><UserIcon class="h-3.5 w-3.5" /> Reports to {{ employee.reporting_captain }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-card p-4 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-h3 text-neutral-900">{{ $t('profile.contactInfo') }}</h3>
        <button
          v-if="!editMode"
          class="inline-flex items-center gap-1 px-3 py-1.5 text-button text-brand-600 hover:text-brand-700"
          @click="startEdit"
        >
          <PencilSquareIcon class="h-4 w-4" /> {{ $t('profile.edit') }}
        </button>
      </div>

      <div
        v-if="saveSuccess"
        class="flex items-center gap-2 px-3 py-2 rounded-lg bg-success-50 text-caption text-success-600 mb-4"
      >
        <CheckCircleSolid class="h-4 w-4" /> {{ $t('profile.validation.updatedSuccessfully') }}
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <PhoneIcon class="h-5 w-5 text-neutral-300 flex-shrink-0" />
          <div class="flex-1">
            <p class="text-caption text-neutral-500">{{ $t('profile.mobile') }}</p>
            <input
              v-if="editMode"
              v-model="editMobile"
              type="text"
              id="input-mobile"
              class="w-full mt-0.5 px-3 py-2 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 outline-none"
              :class="contactErrors.mobile ? 'border-danger-500' : ''"
              :aria-describedby="contactErrors.mobile ? 'error-mobile' : undefined"
            />
            <p v-else class="text-body text-neutral-900">{{ employee.mobile }}</p>
            <p v-if="contactErrors.mobile" id="error-mobile" class="text-caption text-danger-600 mt-0.5">
              {{ contactErrors.mobile }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <EnvelopeIcon class="h-5 w-5 text-neutral-300 flex-shrink-0" />
          <div class="flex-1">
            <p class="text-caption text-neutral-500">{{ $t('profile.email') }}</p>
            <input
              v-if="editMode"
              v-model="editEmail"
              type="email"
              id="input-email"
              class="w-full mt-0.5 px-3 py-2 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 outline-none"
              :class="contactErrors.email ? 'border-danger-500' : ''"
              :placeholder="$t('profile.notSet')"
              :aria-describedby="contactErrors.email ? 'error-email' : undefined"
            />
            <p v-else class="text-body text-neutral-900">{{ employee.email || $t('profile.notSet') }}</p>
            <p v-if="contactErrors.email" id="error-email" class="text-caption text-danger-600 mt-0.5">
              {{ contactErrors.email }}
            </p>
          </div>
        </div>
        <div v-if="editMode" class="flex items-center gap-2 pt-2">
          <button
            :disabled="saving"
            class="px-4 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 disabled:opacity-50 min-h-touch"
            @click="saveContact"
          >
            {{ saving ? $t('profile.saving') : $t('profile.saveChanges') }}
          </button>
          <button
            class="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-button hover:bg-neutral-50 min-h-touch"
            @click="cancelEdit"
          >
            {{ $t('profile.cancel') }}
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-card p-4 sm:p-6">
      <h3 class="text-h3 text-neutral-900 mb-4">{{ $t('profile.sensitiveInfo') }}</h3>
      <div class="space-y-3">
        <div
          class="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 cursor-pointer"
          @click="showBank = !showBank"
        >
          <div class="flex items-center gap-3">
            <ShieldCheckIcon class="h-5 w-5 text-neutral-300" />
            <div>
              <p class="text-body-strong text-neutral-900">{{ $t('profile.bankDetails') }}</p>
              <p class="text-caption text-neutral-400">
                {{ showBank ? employee.bank_name + ' · ' + employee.bank_account : $t('profile.tapToView') }}
              </p>
            </div>
          </div>
          <span class="text-caption text-brand-600 font-semibold">{{
            showBank ? $t('common.hide') : $t('common.view')
          }}</span>
        </div>
        <div v-if="showBank" class="ml-8 pl-3 border-l-2 border-neutral-200 space-y-2 text-caption">
          <div class="flex justify-between">
            <span class="text-neutral-500">{{ $t('profile.accountHolder') }}</span
            ><span class="font-medium text-neutral-900">{{ employee.bank_holder }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500">{{ $t('profile.accountNumber') }}</span
            ><span class="font-medium text-neutral-900">{{ employee.bank_account }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500">{{ $t('profile.ifsc') }}</span
            ><span class="font-medium text-neutral-900">{{ employee.bank_ifsc }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500">{{ $t('profile.bank') }}</span
            ><span class="font-medium text-neutral-900">{{ employee.bank_name }}</span>
          </div>
          <button class="text-brand-600 font-semibold hover:text-brand-700 mt-1">
            {{ $t('profile.requestChange') }}
          </button>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg">
          <div class="flex items-center gap-3">
            <IdentificationIcon class="h-5 w-5 text-neutral-300" />
            <div>
              <p class="text-body-strong text-neutral-900">{{ $t('profile.aadhaar') }}</p>
              <p class="text-caption text-neutral-400">{{ employee.aadhaar }}</p>
            </div>
          </div>
          <button class="text-caption text-brand-600 font-semibold hover:text-brand-700">
            {{ $t('profile.requestChange') }}
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-card p-4 sm:p-6">
      <h3 class="text-h3 text-neutral-900 mb-4">{{ $t('profile.settings') }}</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <LanguageIcon class="h-5 w-5 text-neutral-300" />
            <span class="text-body text-neutral-900">{{ $t('profile.language') }}</span>
          </div>
          <div class="flex rounded-lg border border-neutral-200 overflow-hidden">
            <button
              v-for="l in ['en', 'hi', 'hinglish'] as Language[]"
              :key="l"
              class="px-3 py-1.5 text-caption font-semibold transition-colors"
              :class="language === l ? 'bg-brand-600 text-white' : 'text-neutral-600 hover:bg-neutral-50'"
              @click="setLang(l)"
            >
              {{ l === 'en' ? $t('profile.langEn') : l === 'hi' ? $t('profile.langHi') : $t('profile.langHinglish') }}
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <BellIcon class="h-5 w-5 text-neutral-300" />
            <span class="text-body text-neutral-900">{{ $t('profile.notifications') }}</span>
          </div>
        </div>
        <div class="ml-8 space-y-2">
          <label class="flex items-center justify-between py-1.5 cursor-pointer">
            <span class="text-body text-neutral-600">{{ $t('profile.taskUpdates') }}</span>
            <input
              :checked="store.notificationPrefs.tasks"
              type="checkbox"
              class="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-600"
              @change="store.setNotificationPref('tasks', ($event.target as HTMLInputElement).checked)"
            />
          </label>
          <label class="flex items-center justify-between py-1.5 cursor-pointer">
            <span class="text-body text-neutral-600">{{ $t('profile.leaveStatus') }}</span>
            <input
              :checked="store.notificationPrefs.leave"
              type="checkbox"
              class="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-600"
              @change="store.setNotificationPref('leave', ($event.target as HTMLInputElement).checked)"
            />
          </label>
          <label class="flex items-center justify-between py-1.5 cursor-pointer">
            <span class="text-body text-neutral-600">{{ $t('profile.trainingReminders') }}</span>
            <input
              :checked="store.notificationPrefs.training"
              type="checkbox"
              class="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-600"
              @change="store.setNotificationPref('training', ($event.target as HTMLInputElement).checked)"
            />
          </label>
          <label class="flex items-center justify-between py-1.5 cursor-pointer">
            <span class="text-body text-neutral-600">{{ $t('profile.ticketUpdates') }}</span>
            <input
              :checked="store.notificationPrefs.tickets"
              type="checkbox"
              class="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-600"
              @change="store.setNotificationPref('tickets', ($event.target as HTMLInputElement).checked)"
            />
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <SunIcon class="h-5 w-5 text-neutral-300" />
            <span class="text-body text-neutral-900">{{ $t('profile.highContrastMode') }}</span>
          </div>
          <button
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="highContrast ? 'bg-brand-600' : 'bg-neutral-300'"
            @click="toggleHighContrast"
          >
            <span
              class="inline-block h-4 w-4 rounded-full bg-white transition-transform"
              :class="highContrast ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <KeyIcon class="h-5 w-5 text-neutral-300" />
            <span class="text-body text-neutral-900">{{ $t('profile.password') }}</span>
          </div>
          <button
            class="px-3 py-1.5 text-button text-brand-600 hover:text-brand-700"
            @click="showChangePassword = true"
          >
            {{ $t('profile.change') }}
          </button>
        </div>
      </div>
    </div>

    <button
      class="w-full flex items-center justify-center gap-2 px-4 py-3 border border-danger-500 text-danger-600 rounded-lg text-button hover:bg-danger-50 transition-colors min-h-touch"
      @click="showLogoutConfirm = true"
    >
      <ArrowRightOnRectangleIcon class="h-5 w-5" /> {{ $t('profile.logOut') }}
    </button>

    <teleport to="body">
      <div
        v-if="showChangePassword"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 animate-fade-in"
        role="dialog" aria-modal="true"
      >
        <div
          class="bg-white w-full sm:max-w-sm rounded-t-xl sm:rounded-lg shadow-modal max-h-[90vh] overflow-y-auto animate-slide-up"
        >
          <div class="flex items-center justify-between p-4 border-b border-neutral-100">
            <h2 class="text-h3 text-neutral-900">{{ $t('profile.changePassword.title') }}</h2>
            <button
              class="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400"
              @click="showChangePassword = false"
              aria-label="Close"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
          <div v-if="passwordSuccess" class="p-6 text-center">
            <CheckCircleSolid class="h-12 w-12 text-success-600 mx-auto mb-3" />
            <p class="text-body-strong text-neutral-900">{{ $t('profile.changePassword.successTitle') }}</p>
            <p class="text-body text-neutral-500 mt-1">{{ $t('profile.changePassword.successMessage') }}</p>
            <button
              class="mt-4 w-full py-2.5 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700"
              @click="showChangePassword = false"
            >
              {{ $t('common.done') }}
            </button>
          </div>
          <form v-else class="p-4 space-y-3" @submit.prevent="submitPasswordChange">
            <div>
              <label class="block text-caption font-semibold text-neutral-700 mb-1"
                >{{ $t('profile.changePassword.currentPassword') }}</label
              >
              <input
                v-model="passwordOld"
                type="password"
                id="input-password-old"
                class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-body focus:ring-2 focus:ring-brand-600 outline-none"
                :class="passwordErrors.old ? 'border-danger-500' : ''"
                :aria-describedby="passwordErrors.old ? 'error-password-old' : undefined"
              />
              <p v-if="passwordErrors.old" id="error-password-old" class="text-caption text-danger-600 mt-1">
                {{ passwordErrors.old }}
              </p>
            </div>
            <div>
              <label class="block text-caption font-semibold text-neutral-700 mb-1"
                >{{ $t('profile.changePassword.newPassword') }}</label
              >
              <input
                v-model="passwordNew"
                type="password"
                id="input-password-new"
                class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-body focus:ring-2 focus:ring-brand-600 outline-none"
                :class="passwordErrors.new ? 'border-danger-500' : ''"
                :aria-describedby="passwordErrors.new ? 'error-password-new' : undefined"
              />
              <p v-if="passwordErrors.new" id="error-password-new" class="text-caption text-danger-600 mt-1">
                {{ passwordErrors.new }}
              </p>
            </div>
            <div>
              <label class="block text-caption font-semibold text-neutral-700 mb-1"
                >{{ $t('profile.changePassword.confirmNewPassword') }}</label
              >
              <input
                v-model="passwordConfirm"
                type="password"
                id="input-password-confirm"
                class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-body focus:ring-2 focus:ring-brand-600 outline-none"
                :class="passwordErrors.confirm ? 'border-danger-500' : ''"
                :aria-describedby="passwordErrors.confirm ? 'error-password-confirm' : undefined"
              />
              <p v-if="passwordErrors.confirm" id="error-password-confirm" class="text-caption text-danger-600 mt-1">
                {{ passwordErrors.confirm }}
              </p>
            </div>
            <button
              type="submit"
              class="w-full py-2.5 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700"
            >
              {{ $t('profile.changePassword.updatePassword') }}
            </button>
          </form>
        </div>
      </div>

      <div
        v-if="showLogoutConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in"
        role="dialog" aria-modal="true"
      >
        <div class="bg-white w-full max-w-xs mx-4 rounded-lg shadow-modal p-6 animate-scale-in">
          <p class="text-body-strong text-neutral-900 mb-2">{{ $t('profile.logoutConfirmLogout') }}</p>
          <p class="text-body text-neutral-500 mb-4">{{ $t('profile.logoutConfirm') }}</p>
          <div class="flex gap-2">
            <button
              class="flex-1 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg text-button hover:bg-neutral-50"
              @click="showLogoutConfirm = false"
            >
              {{ $t('profile.logoutConfirmCancel') }}
            </button>
            <button
              class="flex-1 py-2.5 bg-danger-600 text-white rounded-lg text-button hover:bg-danger-700"
              @click="confirmLogout"
            >
              {{ $t('profile.logoutConfirmLogout') }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
</template>
