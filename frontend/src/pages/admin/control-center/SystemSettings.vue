<script setup lang="ts">
import { ref } from 'vue'
import {
  Cog6ToothIcon,
  GlobeAltIcon,
  LinkIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline'

// Org Settings
const companyName = ref('Sharma Fabrics Pvt. Ltd.')
const officeStartTime = ref('09:00')
const workingWeek = ref(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const leaveTypes = ref(['Sick Leave', 'Casual Leave', 'Annual Leave', 'Comp-off'])
const ticketCategories = ref([
  'Software Bug',
  'Network Issue',
  'Equipment',
  'Training',
  'HR',
  'Safety',
  'Other',
])
const newLeaveType = ref('')
const newTicketCategory = ref('')

// Localization
const defaultLanguage = ref('en')
const dateFormat = ref('DD/MM/YYYY')
const numberFormat = ref('1,234.56')

// Integrations
const whatsappEnabled = ref(false)
const whatsappKey = ref('****-wa-key-1234')
const smsEnabled = ref(false)
const smsKey = ref('****-sms-key-5678')
const emailEnabled = ref(true)
const emailConfig = ref('smtp.sendgrid.net:587')
const testConnectionStatus = ref<'idle' | 'testing' | 'success' | 'fail'>('idle')

// Session / Security
const sessionTimeout = ref(30)
const minPasswordLength = ref(8)
const requireSpecialChar = ref(true)
const requireUppercase = ref(true)
const maxLoginAttempts = ref(5)

const saveMessage = ref('')
const saving = ref(false)

function toggleWeekDay(day: string) {
  const idx = workingWeek.value.indexOf(day)
  if (idx === -1) workingWeek.value.push(day)
  else workingWeek.value.splice(idx, 1)
  if (workingWeek.value.length === 0) workingWeek.value.push(day)
}

function addLeaveType() {
  const val = newLeaveType.value.trim()
  if (val && !leaveTypes.value.includes(val)) {
    leaveTypes.value.push(val)
    newLeaveType.value = ''
  }
}

function removeLeaveType(idx: number) {
  leaveTypes.value.splice(idx, 1)
}

function addTicketCategory() {
  const val = newTicketCategory.value.trim()
  if (val && !ticketCategories.value.includes(val)) {
    ticketCategories.value.push(val)
    newTicketCategory.value = ''
  }
}

function removeTicketCategory(idx: number) {
  ticketCategories.value.splice(idx, 1)
}

async function testConnection() {
  testConnectionStatus.value = 'testing'
  await new Promise((r) => setTimeout(r, 1500))
  testConnectionStatus.value = Math.random() > 0.3 ? 'success' : 'fail'
  setTimeout(() => {
    testConnectionStatus.value = 'idle'
  }, 3000)
}

async function saveSettings() {
  saving.value = true
  await new Promise((r) => setTimeout(r, 600))
  saveMessage.value = 'Settings saved successfully'
  saving.value = false
  setTimeout(() => {
    saveMessage.value = ''
  }, 3000)
}
</script>

<template>
  <div class="space-y-6 max-w-4xl">
    <!-- Org Settings -->
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <h2 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Cog6ToothIcon class="w-4 h-4 text-slate-400" />
        Organization Settings
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
          <input
            v-model="companyName"
            type="text"
            class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Office Start Time</label>
          <input
            v-model="officeStartTime"
            type="time"
            class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-slate-700 mb-2">Working Week</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="day in weekDays"
            :key="day"
            class="px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors"
            :class="
              workingWeek.includes(day)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-300'
            "
            @click="toggleWeekDay(day)"
          >
            {{ day }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Leave Types -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Leave Types</label>
          <div class="flex flex-wrap gap-1.5 mb-2">
            <span
              v-for="(lt, idx) in leaveTypes"
              :key="lt"
              class="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
            >
              {{ lt }}
              <button class="text-slate-400 hover:text-red-500" @click="removeLeaveType(idx)">
                <svg
                  class="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
          <div class="flex gap-2">
            <input
              v-model="newLeaveType"
              placeholder="Add leave type"
              class="flex-1 h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              @keyup.enter="addLeaveType"
            />
            <button
              class="px-3 h-9 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              @click="addLeaveType"
            >
              Add
            </button>
          </div>
        </div>

        <!-- Ticket Categories -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Ticket Categories</label>
          <div class="flex flex-wrap gap-1.5 mb-2">
            <span
              v-for="(cat, idx) in ticketCategories"
              :key="cat"
              class="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
            >
              {{ cat }}
              <button class="text-slate-400 hover:text-red-500" @click="removeTicketCategory(idx)">
                <svg
                  class="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
          <div class="flex gap-2">
            <input
              v-model="newTicketCategory"
              placeholder="Add category"
              class="flex-1 h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              @keyup.enter="addTicketCategory"
            />
            <button
              class="px-3 h-9 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              @click="addTicketCategory"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Localization -->
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <h2 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <GlobeAltIcon class="w-4 h-4 text-slate-400" />
        Localization
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Default Language</label>
          <select
            v-model="defaultLanguage"
            class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Date Format</label>
          <select
            v-model="dateFormat"
            class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Number Format</label>
          <select
            v-model="numberFormat"
            class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="1,234.56">1,234.56</option>
            <option value="1.234,56">1.234,56</option>
            <option value="1 234,56">1 234,56</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Integrations -->
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <h2 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <LinkIcon class="w-4 h-4 text-slate-400" />
        Integrations
      </h2>
      <div class="space-y-4">
        <!-- WhatsApp -->
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-50"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">WhatsApp API</p>
            <p class="text-xs text-slate-400">Send notifications via WhatsApp Business API</p>
          </div>
          <div class="flex items-center gap-3">
            <input
              :value="whatsappKey"
              type="password"
              readonly
              class="w-40 h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-400"
            />
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="whatsappEnabled ? 'bg-emerald-500' : 'bg-slate-300'"
              @click="whatsappEnabled = !whatsappEnabled"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="whatsappEnabled ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>

        <!-- SMS -->
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-50"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">SMS Gateway</p>
            <p class="text-xs text-slate-400">Transactional SMS for alerts and OTPs</p>
          </div>
          <div class="flex items-center gap-3">
            <input
              :value="smsKey"
              type="password"
              readonly
              class="w-40 h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-400"
            />
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="smsEnabled ? 'bg-emerald-500' : 'bg-slate-300'"
              @click="smsEnabled = !smsEnabled"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="smsEnabled ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>

        <!-- Email -->
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-50"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">Email</p>
            <p class="text-xs text-slate-400">SMTP configuration for system emails</p>
          </div>
          <div class="flex items-center gap-3">
            <input
              :value="emailConfig"
              type="text"
              readonly
              class="w-40 h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-400"
            />
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="emailEnabled ? 'bg-emerald-500' : 'bg-slate-300'"
              @click="emailEnabled = !emailEnabled"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="emailEnabled ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>

        <!-- Test Connection -->
        <div class="flex items-center gap-3 pt-2">
          <button
            :disabled="testConnectionStatus === 'testing'"
            class="px-4 h-9 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
            @click="testConnection"
          >
            <span v-if="testConnectionStatus === 'testing'">Testing...</span>
            <span v-else>Test Connection</span>
          </button>
          <span
            v-if="testConnectionStatus === 'success'"
            class="inline-flex items-center gap-1 text-sm text-emerald-600"
          >
            <CheckCircleIcon class="w-4 h-4" /> Connected
          </span>
          <span
            v-else-if="testConnectionStatus === 'fail'"
            class="inline-flex items-center gap-1 text-sm text-red-600"
          >
            <XCircleIcon class="w-4 h-4" /> Failed
          </span>
        </div>
      </div>
    </div>

    <!-- Session & Security -->
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <h2 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <ShieldCheckIcon class="w-4 h-4 text-slate-400" />
        Session & Security
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Session Timeout (min)</label>
          <input
            v-model.number="sessionTimeout"
            type="number"
            min="5"
            max="480"
            class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Min Password Length</label>
          <input
            v-model.number="minPasswordLength"
            type="number"
            min="6"
            max="32"
            class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Max Login Attempts</label>
          <input
            v-model.number="maxLoginAttempts"
            type="number"
            min="3"
            max="20"
            class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex flex-col gap-2 pt-6">
          <label class="flex items-center gap-2 text-sm">
            <input
              v-model="requireSpecialChar"
              type="checkbox"
              class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Require special char
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input
              v-model="requireUppercase"
              type="checkbox"
              class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Require uppercase
          </label>
        </div>
      </div>
    </div>

    <!-- Save -->
    <div class="flex items-center gap-3">
      <button
        :disabled="saving"
        class="px-6 h-10 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        @click="saveSettings"
      >
        <span v-if="saving">Saving...</span>
        <span v-else>Save Settings</span>
      </button>
      <span v-if="saveMessage" class="inline-flex items-center gap-1 text-sm text-emerald-600">
        <CheckCircleIcon class="w-4 h-4" /> {{ saveMessage }}
      </span>
    </div>
  </div>
</template>
