export type UserRole = 'doer' | 'captain' | 'admin'

const roleHierarchy: Record<UserRole, number> = {
  doer: 0,
  captain: 1,
  admin: 2,
}

export type AppFeature =
  | 'tasks.create'
  | 'tasks.assign'
  | 'tasks.review'
  | 'tasks.delete'
  | 'leave.approve'
  | 'leave.reject'
  | 'leave.escort'
  | 'attendance.correct'
  | 'attendance.view-all'
  | 'tickets.assign'
  | 'tickets.resolve'
  | 'employees.create'
  | 'employees.edit'
  | 'employees.delete'
  | 'employees.view-all'
  | 'departments.manage'
  | 'insights.view'
  | 'insights.view-all'
  | 'training.create'
  | 'training.assign'
  | 'notifications.broadcast'
  | 'system.settings'
  | 'audit.logs'
  | 'rescue.escalate'
  | 'rescue.reassign'

const featurePermissions: Record<AppFeature, UserRole[]> = {
  'tasks.create': ['doer', 'captain', 'admin'],
  'tasks.assign': ['captain', 'admin'],
  'tasks.review': ['captain', 'admin'],
  'tasks.delete': ['admin'],
  'leave.approve': ['captain', 'admin'],
  'leave.reject': ['captain', 'admin'],
  'leave.escort': ['admin'],
  'attendance.correct': ['captain', 'admin'],
  'attendance.view-all': ['captain', 'admin'],
  'tickets.assign': ['captain', 'admin'],
  'tickets.resolve': ['captain', 'admin'],
  'employees.create': ['admin'],
  'employees.edit': ['admin'],
  'employees.delete': ['admin'],
  'employees.view-all': ['captain', 'admin'],
  'departments.manage': ['admin'],
  'insights.view': ['captain', 'admin'],
  'insights.view-all': ['admin'],
  'training.create': ['captain', 'admin'],
  'training.assign': ['captain', 'admin'],
  'notifications.broadcast': ['admin'],
  'system.settings': ['admin'],
  'audit.logs': ['admin'],
  'rescue.escalate': ['captain', 'admin'],
  'rescue.reassign': ['captain', 'admin'],
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function canAccessPanel(userRoles: UserRole[], panelRole: UserRole): boolean {
  return userRoles.includes(panelRole)
}

export function isAtLeast(userRole: UserRole, minimumRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[minimumRole]
}

export function canUseFeature(userRole: UserRole | undefined, feature: AppFeature): boolean {
  if (!userRole) return false
  const allowed = featurePermissions[feature]
  return allowed ? allowed.includes(userRole) : false
}

export function getAccessibleFeatures(userRole: UserRole | undefined): AppFeature[] {
  if (!userRole) return []
  return (Object.keys(featurePermissions) as AppFeature[]).filter((f) =>
    featurePermissions[f].includes(userRole),
  )
}
