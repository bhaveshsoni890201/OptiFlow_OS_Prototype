import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import type { UserState, UiState, Role, Language, Toast } from '../types'
import { clearUserContext } from '../utils/errorTracking'

const defaultUserState: UserState = {
  employee: null,
  isAuthenticated: false,
  currentRole: 'doer',
  language: 'en',
  sessionTimeout: 30,
}

const defaultUiState: UiState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'light',
  modals: [],
  toasts: [],
}

export const useStore = defineStore('root', () => {
  const user = ref<UserState>({ ...defaultUserState })
  const ui = ref<UiState>({ ...defaultUiState })
  const currentRole = ref<Role>('doer')
  const language = ref<Language>('en')

  // Hydrate auth state from localStorage
  try {
    const savedAuth = localStorage.getItem('optiflow-auth')
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth)
      Object.assign(user.value, parsed)
      if (parsed.currentRole) currentRole.value = parsed.currentRole
      if (parsed.language) language.value = parsed.language
    }
  } catch { /* ignore */ }

  const isAuthenticated = computed(() => user.value.isAuthenticated)
  const isDoer = computed(() => currentRole.value === 'doer')
  const isCaptain = computed(() => currentRole.value === 'captain')
  const isAdmin = computed(() => currentRole.value === 'admin')
  const isMultiRole = computed(() => (user.value.employee?.roles.length ?? 0) > 1)

  const defaultPrefs = { tasks: true, leave: true, training: true, tickets: true }
  let savedPrefs: Record<string, boolean> = {}
  try {
    savedPrefs = JSON.parse(localStorage.getItem('optiflow-notif-prefs') ?? '{}')
  } catch { /* ignore */ }
  const notificationPrefs = reactive<Record<string, boolean>>({ ...defaultPrefs, ...savedPrefs })

  function setNotificationPref(key: string, value: boolean) {
    notificationPrefs[key] = value
    try {
      localStorage.setItem('optiflow-notif-prefs', JSON.stringify({ ...notificationPrefs }))
    } catch {
      // localStorage unavailable
    }
  }

  function setUser(payload: Partial<UserState>) {
    Object.assign(user.value, payload)
    if (payload.currentRole) currentRole.value = payload.currentRole
    if (payload.language) language.value = payload.language
    try {
      localStorage.setItem('optiflow-auth', JSON.stringify(user.value))
    } catch { /* localStorage unavailable */ }
  }

  function clearAuth() {
    clearUserContext()
    Object.assign(user.value, { ...defaultUserState })
    currentRole.value = 'doer'
    try {
      localStorage.removeItem('optiflow-auth')
      localStorage.removeItem('auth_token')
    } catch { /* ignore */ }
  }

  function setRole(role: Role) {
    currentRole.value = role
    user.value.currentRole = role
  }

  function setLanguage(lang: Language) {
    language.value = lang
    user.value.language = lang
  }

  function setTheme(theme: UiState['theme']) {
    ui.value.theme = theme
    const html = document.documentElement
    html.classList.remove('dark')
    html.removeAttribute('data-theme')
    if (theme === 'dark') {
      html.classList.add('dark')
    } else if (theme === 'high-contrast') {
      html.setAttribute('data-theme', 'high-contrast')
    }
    try {
      localStorage.setItem('optiflow-theme', theme)
    } catch {
      // localStorage unavailable
    }
  }

  function toggleTheme() {
    const themes: UiState['theme'][] = ['light', 'dark', 'high-contrast']
    const idx = themes.indexOf(ui.value.theme)
    setTheme(themes[(idx + 1) % themes.length])
  }

  function toggleSidebar() {
    ui.value.sidebarOpen = !ui.value.sidebarOpen
  }

  function addToast(toast: Omit<Toast, 'id'>) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const entry: Toast = { id, ...toast }
    ui.value.toasts.push(entry)
    if (entry.duration > 0) {
      setTimeout(() => removeToast(id), entry.duration)
    }
  }

  function removeToast(id: string) {
    ui.value.toasts = ui.value.toasts.filter((t) => t.id !== id)
  }

  return {
    user,
    ui,
    currentRole,
    language,
    isAuthenticated,
    isDoer,
    isCaptain,
    isAdmin,
    isMultiRole,
    notificationPrefs,
    setNotificationPref,
    setUser,
    clearAuth,
    setRole,
    setLanguage,
    toggleTheme,
    toggleSidebar,
    addToast,
    removeToast,
  }
})
