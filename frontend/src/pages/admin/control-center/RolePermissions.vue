<script setup lang="ts">
import { ref, computed } from 'vue'
import { ShieldCheckIcon, XMarkIcon, CheckIcon } from '@heroicons/vue/24/outline'

interface Permission {
  read: boolean
  write: boolean
  create: boolean
  delete: boolean
  submit: boolean
}

interface FieldPermission {
  field: string
  roles: Record<string, boolean>
}

const docTypes = [
  'Task',
  'Worklist',
  'Attendance',
  'Leave',
  'Ticket',
  'Training',
  'Department',
  'Employee',
  'Report',
]

const roles = ['Admin', 'Captain', 'Doer']

const defaultPerm: Permission = {
  read: false,
  write: false,
  create: false,
  delete: false,
  submit: false,
}

const permissionMatrix = ref<Record<string, Record<string, Permission>>>({
  Task: {
    Admin: { read: true, write: true, create: true, delete: true, submit: true },
    Captain: { read: true, write: true, create: true, delete: false, submit: true },
    Doer: { read: true, write: false, create: false, delete: false, submit: false },
  },
  Worklist: {
    Admin: { read: true, write: true, create: true, delete: true, submit: true },
    Captain: { read: true, write: true, create: true, delete: true, submit: true },
    Doer: { read: true, write: false, create: false, delete: false, submit: false },
  },
  Attendance: {
    Admin: { read: true, write: true, create: true, delete: true, submit: true },
    Captain: { read: true, write: true, create: false, delete: false, submit: true },
    Doer: { read: true, write: false, create: false, delete: false, submit: false },
  },
  Leave: {
    Admin: { read: true, write: true, create: true, delete: true, submit: true },
    Captain: { read: true, write: true, create: false, delete: false, submit: true },
    Doer: { read: true, write: false, create: true, delete: false, submit: true },
  },
  Ticket: {
    Admin: { read: true, write: true, create: true, delete: true, submit: true },
    Captain: { read: true, write: true, create: true, delete: false, submit: true },
    Doer: { read: true, write: true, create: true, delete: false, submit: true },
  },
  Training: {
    Admin: { read: true, write: true, create: true, delete: true, submit: true },
    Captain: { read: true, write: true, create: true, delete: false, submit: true },
    Doer: { read: true, write: false, create: false, delete: false, submit: false },
  },
  Department: {
    Admin: { read: true, write: true, create: true, delete: true, submit: true },
    Captain: { read: true, write: false, create: false, delete: false, submit: false },
    Doer: { read: false, write: false, create: false, delete: false, submit: false },
  },
  Employee: {
    Admin: { read: true, write: true, create: true, delete: true, submit: true },
    Captain: { read: true, write: false, create: false, delete: false, submit: false },
    Doer: { read: false, write: false, create: false, delete: false, submit: false },
  },
  Report: {
    Admin: { read: true, write: true, create: true, delete: true, submit: true },
    Captain: { read: true, write: false, create: true, delete: false, submit: true },
    Doer: { read: true, write: false, create: false, delete: false, submit: false },
  },
})

const sensitiveFields = ref<Record<string, FieldPermission>>({
  'Employee.Bank Details': {
    field: 'Bank Details',
    roles: { Admin: true, Captain: false, Doer: false },
  },
  'Employee.Salary': {
    field: 'Salary Info',
    roles: { Admin: true, Captain: false, Doer: false },
  },
  'Task.Escalation Notes': {
    field: 'Escalation Notes',
    roles: { Admin: true, Captain: true, Doer: false },
  },
  'Leave.Rejection Reason': {
    field: 'Rejection Reason',
    roles: { Admin: true, Captain: true, Doer: true },
  },
})

const permKeys: (keyof Permission)[] = ['read', 'write', 'create', 'delete', 'submit']

function togglePerm(docType: string, role: string, perm: keyof Permission) {
  if (role === 'Admin' && perm === 'delete' && !permissionMatrix.value[docType]?.[role]?.[perm]) {
    const allTrue = permKeys.every((k) => permissionMatrix.value[docType]?.[role]?.[k])
    if (allTrue) return
  }
  const current = permissionMatrix.value[docType]?.[role]
  if (current) {
    current[perm] = !current[perm]
  }
}

function toggleField(key: string, role: string) {
  const field = sensitiveFields.value[key]
  if (!field) return
  const currentlyOn = field.roles[role]
  if (role === 'Admin' && currentlyOn) {
    const adminFields = Object.values(sensitiveFields.value).filter((f) => f.roles['Admin'])
    if (adminFields.length <= 1) return
  }
  field.roles[role] = !field.roles[role]
}

const isAllAdminDelete = computed(() => {
  return docTypes.every((dt) => permissionMatrix.value[dt]?.Admin?.delete === true)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Permission Matrix -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100">
        <h2 class="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <ShieldCheckIcon class="w-4 h-4 text-slate-400" />
          DocType × Permission Matrix
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50">
              <th
                class="px-4 py-2.5 text-left font-semibold text-xs text-slate-500 uppercase tracking-wider min-w-[120px]"
              >
                DocType
              </th>
              <template v-for="role in roles" :key="role">
                <th
                  v-for="perm in permKeys"
                  :key="`${role}-${perm}`"
                  class="px-2 py-2.5 text-center font-semibold text-xs text-slate-500 uppercase tracking-wider"
                >
                  <span class="hidden sm:inline">{{ role }}.{{ perm }}</span>
                  <span class="sm:hidden">{{ perm.charAt(0).toUpperCase() }}</span>
                </th>
              </template>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="docType in docTypes" :key="docType" class="hover:bg-slate-50">
              <td class="px-4 py-2.5 font-medium text-slate-800 whitespace-nowrap">
                {{ docType }}
              </td>
              <template v-for="role in roles" :key="role">
                <td
                  v-for="perm in permKeys"
                  :key="`${docType}-${role}-${perm}`"
                  class="px-2 py-2.5 text-center"
                >
                  <button
                    class="w-7 h-7 rounded-md flex items-center justify-center mx-auto transition-colors"
                    :class="
                      permissionMatrix[docType]?.[role]?.[perm]
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                    "
                    :disabled="
                      role === 'Admin' &&
                      perm === 'delete' &&
                      !permissionMatrix[docType]?.[role]?.[perm] &&
                      isAllAdminDelete
                    "
                    @click="togglePerm(docType, role, perm)"
                  >
                    <CheckIcon v-if="permissionMatrix[docType]?.[role]?.[perm]" class="w-4 h-4" />
                    <XMarkIcon v-else class="w-4 h-4" />
                  </button>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Field-Level Permissions -->
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <h2 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <ShieldCheckIcon class="w-4 h-4 text-slate-400" />
        Field-Level Access
      </h2>
      <div class="space-y-3">
        <div
          v-for="(field, key) in sensitiveFields"
          :key="key"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-50"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">{{ key }}</p>
            <p class="text-xs text-slate-400">Restrict access to sensitive fields</p>
          </div>
          <div class="flex items-center gap-3">
            <div v-for="role in roles" :key="role" class="flex items-center gap-1.5">
              <span class="text-xs text-slate-500 w-12">{{ role }}</span>
              <button
                class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                :class="field.roles[role] ? 'bg-blue-500' : 'bg-slate-300'"
                @click="toggleField(key, role)"
              >
                <span
                  class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                  :class="field.roles[role] ? 'translate-x-[18px]' : 'translate-x-0.5'"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p class="text-xs text-slate-400 text-center">
      Admin role always retains full access to all DocTypes and sensitive fields.
    </p>
  </div>
</template>
