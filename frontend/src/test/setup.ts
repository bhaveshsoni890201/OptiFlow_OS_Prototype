import { config } from '@vue/test-utils'

config.global.stubs = {
  transition: true,
  'router-link': true,
  'router-view': true,
}
