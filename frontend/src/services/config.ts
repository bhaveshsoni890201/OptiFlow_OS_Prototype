export function isMockMode(): boolean {
  return import.meta.env.VITE_ENABLE_MOCK === 'true'
}
