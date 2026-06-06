import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    process.env.ANALYZE === 'true'
      ? visualizer({ open: true, filename: 'dist/stats.html' })
      : undefined,
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/vue')) return 'vendor-vue'
          if (id.includes('node_modules/@heroicons')) return 'vendor-icons'
          if (id.includes('node_modules')) return 'vendor'
          if (id.includes('/pages/auth/')) return 'page-auth'
          if (id.includes('/pages/doer/')) return 'page-doer'
          if (id.includes('/pages/captain/')) return 'page-captain'
          if (id.includes('/pages/admin/control-center/')) return 'page-admin-control'
          if (id.includes('/pages/admin/EmployeeManagement')) return 'page-admin-employees'
          if (id.includes('/pages/admin/AdminDashboard')) return 'page-admin-dash'
          if (id.includes('/pages/admin/InsightsOverview')) return 'page-admin-insights'
          if (id.includes('/pages/admin/WeeklyReviewView')) return 'page-admin-weekly'
          if (id.includes('/pages/admin/AdminTicketsView') || id.includes('/pages/admin/AdminTicketDetail')) return 'page-admin-tickets'
          if (id.includes('/pages/admin/Doer360View') || id.includes('/pages/admin/CaptainIndexView')) return 'page-admin-360'
          if (id.includes('/pages/admin/EmployeeDetail')) return 'page-admin-empdetail'
          if (id.includes('/pages/admin/AdminLeaveView')) return 'page-admin-leave'
          if (id.includes('/pages/admin/AdminTrainingView')) return 'page-admin-training'
          if (id.includes('/pages/admin/')) return 'page-admin'
        },
      },
    },
  },
})
