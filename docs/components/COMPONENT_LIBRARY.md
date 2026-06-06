# OptiFlow OS Frontend — Component Library

## Summary

- **Total components**: 22
- **Common UI**: 15 — `OptButton`, `OptInput`, `OptSelect`, `OptDatePicker`, `OptChip`, `OptAvatar`, `OptBadge`, `OptProgress`, `OptSpinner`, `OptSkeleton`, `OptModal`, `OptDrawer`, `OptBottomSheet`, `OptToast`, `OptBanner`
- **Navigation**: 7 — `AppHeader`, `AppSidebar`, `BottomNav`, `FabQuickAdd`, `NotificationCenter`, `LanguageSwitcher`, `WorkspaceSwitcher`
- **Forms**: _(none yet)_
- **Tasks**: _(none yet)_
- **Dashboard**: _(none yet)_
- **Tables**: _(none yet)_
- **Charts**: _(none yet)_

---

## 1. Common UI Components

These are registered in `components/common/index.ts` (barrel export) and prefixed with `Opt`.

---

### OptButton

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'tertiary' \| 'ghost' \| 'danger'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Sizing preset |
| `loading` | `boolean` | `false` | Shows spinner, disables click |
| `disabled` | `boolean` | `false` | Grays out, prevents interaction |
| `icon` | `string?` | — | Heroicon name (kebab-case, e.g. `'arrow-left'`) |
| `fullWidth` | `boolean` | `false` | Stretches to container width |
| `type` | `'button' \| 'submit'` | `'button'` | Native button type |

| Emit | Payload | Description |
|------|---------|-------------|
| `click` | `MouseEvent` | Emitted on click when not disabled/loading |

| Slot | Description |
|------|-------------|
| `default` | Button label or child content |

**States**: loading (spinner replaces icon), disabled (opacity-50, cursor-not-allowed), focus-visible ring per variant, dark mode via parent `.dark` context.

```vue
<OptButton variant="primary" size="md" icon="plus" @click="handleAdd">
  Add Task
</OptButton>
<OptButton :loading="isSaving">Saving…</OptButton>
```

---

### OptInput

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label text |
| `modelValue` | `string \| number` | — | v-model binding |
| `type` | `'text' \| 'email' \| 'tel' \| 'number' \| 'password'` | `'text'` | Input type |
| `placeholder` | `string` | `''` | Placeholder text |
| `required` | `boolean` | `false` | Shows asterisk, sets aria-required |
| `disabled` | `boolean` | `false` | Disabled state |
| `readonly` | `boolean` | `false` | Read-only state |
| `error` | `string?` | — | Error message (red border + alert role) |
| `helper` | `string?` | — | Helper text below input |
| `hint` | `string?` | — | Additional hint text |
| `mask` | `boolean` | `false` | When type=tel, strips non-digits, max 10 |

| Emit | Payload | Description |
|------|---------|-------------|
| `update:modelValue` | `string` | Updated value |
| `blur` | `FocusEvent` | Input blur |
| `focus` | `FocusEvent` | Input focus |

**States**: error (red border + ring + `role="alert"`), disabled (gray bg + cursor-not-allowed), password toggle (eye icon button), required (asterisk indicator), dark mode via `.dark` class.

```vue
<OptInput label="Employee ID" v-model="empId" required />
<OptInput label="Phone" type="tel" v-model="phone" mask :error="phoneError" />
<OptInput label="Password" type="password" v-model="pwd" />
```

---

### OptSelect

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | — | v-model binding (selected value) |
| `options` | `{ value: string; label: string }[]` | — | Options list |
| `label` | `string?` | — | Visible label |
| `placeholder` | `string` | `'Select...'` | Placeholder text |
| `disabled` | `boolean?` | — | Disabled state |
| `clearable` | `boolean` | `false` | Shows X button to clear selection |
| `error` | `string?` | — | Error message |
| `hint` | `string?` | — | Hint text |

| Emit | Payload | Description |
|------|---------|-------------|
| `update:modelValue` | `string` | Selected option value |

**States**: open (ring-2), closed, disabled (opacity-50), error (danger border), dark mode. Dropdown uses absolute positioning with `z-50`.

```vue
<OptSelect
  v-model="dept"
  label="Department"
  :options="[{ value: 'weaving', label: 'Weaving' }, { value: 'spinning', label: 'Spinning' }]"
  clearable
/>
```

---

### OptDatePicker

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | — | v-model binding (ISO date string `YYYY-MM-DD`) |
| `label` | `string?` | — | Visible label |
| `placeholder` | `string` | `'Select date...'` | Placeholder |
| `disabled` | `boolean?` | — | Disabled state |
| `error` | `string?` | — | Error message |
| `min` | `string?` | — | Minimum selectable date (ISO) |
| `max` | `string?` | — | Maximum selectable date (ISO) |

| Emit | Payload | Description |
|------|---------|-------------|
| `update:modelValue` | `string` | Selected date (ISO) |

**States**: open (calendar dropdown), closed, disabled, error, range-constrained (min/max enforced). Calendar shows month navigation with prev/next arrows.

```vue
<OptDatePicker v-model="startDate" label="Start Date" :min="today" />
```

---

### OptChip

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'pending' \| 'in-progress' \| 'blocked' \| 'escalated' \| 'completed' \| 'reviewed' \| 'default'` | `'default'` | Semantic color |
| `size` | `'sm' \| 'md'` | `'sm'` | Sizing preset |
| `removable` | `boolean` | `false` | Shows X remove button |
| `icon` | `string?` | — | Heroicon name (kebab-case, solid) |

| Emit | Payload | Description |
|------|---------|-------------|
| `remove` | — | Fired when X is clicked |

| Slot | Description |
|------|-------------|
| `default` | Chip label |

**States**: 7 semantic variants with matching colors, removable (X button), icon prefix.

```vue
<OptChip variant="in-progress" icon="clock">In Progress</OptChip>
<OptChip variant="blocked" removable @remove="handleRemove">Blocked</OptChip>
```

---

### OptAvatar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Used for initials and deterministic background color |
| `src` | `string?` | — | Image URL (overrides initials) |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Sizing preset |
| `status` | `'online' \| 'away' \| 'dnd' \| 'offline'`? | — | Presence indicator dot |

**States**: image-loaded vs initials fallback, status dot (4 colors), dark mode ring on status dot.

```vue
<OptAvatar name="Raj Mehta" size="lg" status="online" />
<OptAvatar name="Priya Sharma" src="/avatars/priya.jpg" />
```

---

### OptBadge

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | — | Numeric count (0 hides badge) |
| `max` | `number` | `99` | Max before showing `{max}+` |
| `dot` | `boolean` | `false` | Renders as small dot (no number) |

**States**: visible (count > 0), dot mode, overflow mode (99+).

```vue
<OptBadge :count="unread" />
<OptBadge :count="3" dot />
```

---

### OptProgress

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current value |
| `max` | `number` | `100` | Maximum value |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Bar thickness |
| `variant` | `'brand' \| 'success' \| 'warning' \| 'danger'` | `'brand'` | Bar color |
| `showLabel` | `boolean` | `false` | Shows label + percentage |
| `label` | `string?` | — | Label text (requires showLabel) |

**States**: determinate progress, 0–100% range clamped, dark mode track.

```vue
<OptProgress :value="75" variant="success" showLabel label="Completion" />
```

---

### OptSpinner

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Sizing preset |
| `color` | `string` | `'text-brand-600'` | Tailwind text color class |

**States**: spinning animation (animate-spin).

```vue
<OptSpinner size="lg" color="text-white" />
```

---

### OptSkeleton

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text' \| 'circular' \| 'rectangular'` | `'text'` | Shape |
| `width` | `string?` | — | CSS width |
| `height` | `string?` | — | CSS height (circular/rectangular) |
| `lines` | `number` | `3` | Number of lines (text variant only) |
| `rounded` | `boolean` | `false` | Forces rounded corners (text variant) |

**States**: pulsing animation (animate-pulse), multi-line text with last line at 60% width, dark mode.

```vue
<OptSkeleton variant="text" :lines="4" />
<OptSkeleton variant="circular" width="48px" height="48px" />
```

---

### OptModal

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Visibility (v-model:open) |
| `title` | `string` | `''` | Dialog title |
| `size` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Max-width preset |
| `closeable` | `boolean` | `true` | Allows close via backdrop/X/escape |

| Emit | Payload | Description |
|------|---------|-------------|
| `close` | — | User dismissed modal |
| `confirm` | — | User confirmed (if applicable) |

| Slot | Description |
|------|-------------|
| `default` | Modal body |
| `footer` | Footer action area (renders when present) |

**States**: open (z-50 overlay, body scroll locked), closed, transition (opacity + scale), size variants, close button in header, backdrop click closes. Built on Headless UI Dialog.

```vue
<OptModal :open="showModal" title="Confirm" size="sm" @close="showModal = false">
  <p>Are you sure?</p>
  <template #footer>
    <OptButton @click="showModal = false">Cancel</OptButton>
  </template>
</OptModal>
```

---

### OptDrawer

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | — | v-model for visibility |
| `title` | `string?` | — | Drawer header title |
| `position` | `'left' \| 'right'` | `'right'` | Slide-in direction |
| `width` | `string` | `'320px'` | CSS width of drawer panel |
| `showClose` | `boolean` | `true` | Shows/hides X close button |

| Emit | Payload | Description |
|------|---------|-------------|
| `update:modelValue` | `boolean` | Fired on close |

| Slot | Description |
|------|-------------|
| `default` | Drawer body |

**States**: open (Teleport to body, scroll lock), closed, slide transition (0.3s ease), backdrop click closes, dark mode.

```vue
<OptDrawer v-model="showDrawer" title="Details" position="right" width="400px">
  <p>Panel content here...</p>
</OptDrawer>
```

---

### OptBottomSheet

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | — | v-model for visibility |
| `title` | `string?` | — | Sheet header title |
| `showClose` | `boolean` | `true` | Shows/hides X close button |
| `maxHeight` | `string` | `'80vh'` | Max height of sheet |

| Emit | Payload | Description |
|------|---------|-------------|
| `update:modelValue` | `boolean` | Fired on close |

| Slot | Description |
|------|-------------|
| `default` | Sheet body |

**States**: open (Teleport to body, scroll lock), closed, slide-up transition (0.3s ease), drag handle indicator bar, backdrop click closes, dark mode.

```vue
<OptBottomSheet v-model="showSheet" title="Quick Actions">
  <button>Option 1</button>
  <button>Option 2</button>
</OptBottomSheet>
```

---

### OptToast

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | Toast variant |
| `message` | `string` | — | Message text |
| `duration` | `number` | `3000` | Auto-dismiss milliseconds |

| Emit | Payload | Description |
|------|---------|-------------|
| `close` | — | Fired after dismiss animation completes |

**States**: 4 color variants (left border + icon), visible/animated (opacity + translateY), auto-dismiss with timer, manual dismiss via X button, `role="alert"` + `aria-live="polite"`.

```vue
<OptToast type="success" message="Task assigned successfully" @close="toast = null" />
```

---

### OptBanner

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | — | v-model for visibility |
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Banner variant |
| `message` | `string` | — | Banner message |
| `dismissible` | `boolean` | `true` | Shows/hides X dismiss button |

| Emit | Payload | Description |
|------|---------|-------------|
| `update:modelValue` | `boolean` | Fired on dismiss |

**States**: visible (with Transition), 4 color variants with icon, dismissible, slide-down animation.

```vue
<OptBanner v-model="showBanner" type="warning" message="Shift change in 30 minutes" />
```

---

## 2. Navigation Components

---

### AppHeader

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Page title |
| `showBack` | `boolean` | `false` | Shows back arrow instead of hamburger |
| `panelName` | `'doer' \| 'captain' \| 'admin'` | — | Panel context (affects logo badge color) |

| Emit | Payload | Description |
|------|---------|-------------|
| `toggle-sidebar` | — | Hamburger clicked (mobile) |
| `toggle-notifications` | — | Bell icon clicked |

**States**: mobile layout (h-14, hamburger/back, search bell avatar), desktop layout (h-16, logo, title, workspace dropdown, language dropdown, search input, bell with unread count, avatar menu), panel badge colors (blue/amber/slate).

```vue
<AppHeader title="Dashboard" :panelName="currentPanel" @toggle-sidebar="sidebarOpen = !sidebarOpen" />
```

---

### AppSidebar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `panelName` | `'doer' \| 'captain' \| 'admin'` | — | Determines nav items and branding |

**States**: collapsed (w-16) / expanded (w-60), desktop only (`hidden md:flex`), active item indicator (accent bar + icon color), panel-specific nav items, collapse toggle, version + support link.

| Item | doer | captain | admin |
|------|------|---------|-------|
| 1 | Home | Dashboard | Dashboard |
| 2 | My Tasks | Rescue | Insights |
| 3 | My Worklist | Team | Employees |
| 4 | Attendance | Worklists | Departments |
| 5 | Leave | Training & SOPs | Attendance |
| 6 | Training | Leave Approvals | Leave |
| 7 | Help Tickets | Attendance | Control Center |
| 8 | Notifications | Tickets | Tickets |
| 9 | — | — | Training |

```vue
<AppSidebar panelName="captain" />
```

---

### BottomNav

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `panelName` | `'doer' \| 'captain' \| 'admin'` | — | Determines tab items |

**States**: mobile only (`md:hidden`), 5 tabs per panel (last is "More"), active tab uses solid icon + primary color, respects `safe-area-inset-bottom`.

```vue
<BottomNav panelName="doer" />
```

---

### FabQuickAdd

No props. Self-contained component.

**States**: closed (floating action button bottom-right), open (bottom sheet via Teleport with backdrop), keyboard-trap (Tab cycling, Escape), focus-return to trigger, action list with primary/default variants, conditional check-in action, slide-up animation.

**Slots**: none (actions are hardcoded).

```vue
<FabQuickAdd />
```

---

### NotificationCenter

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Panel visibility |

| Emit | Payload | Description |
|------|---------|-------------|
| `close` | — | User dismissed panel |

**States**: open (Teleport to body, slide-in from right on desktop, full on mobile), tabs (All/Unread/Mentions/Tasks/System), empty state (bell icon + "No notifications"), unread indicator, mark all read, notification type icons + colors, dark mode.

```vue
<NotificationCenter :open="notifOpen" @close="notifOpen = false" />
```

---

### LanguageSwitcher

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `'en'` | Current language code |
| `showOriginal` | `boolean` | `false` | Toggle "View Original" checkbox |

| Emit | Payload | Description |
|------|---------|-------------|
| `update:modelValue` | `string` | Selected language code |
| `update:showOriginal` | `boolean` | Original toggle state |

**Languages**: `en` (English), `hi` (Hindi / हिन्दी), `hinglish` (Hinglish). Dropdown shows native + English label.

```vue
<LanguageSwitcher v-model="lang" v-model:showOriginal="showOrig" />
```

---

### WorkspaceSwitcher

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentRole` | `'doer' \| 'captain' \| 'admin'` | — | Active role |
| `userName` | `string` | `'Raj Mehta'` | Display name |

**States**: dropdown with user info, role switching (3 roles with icons/colors/descriptions), settings + sign out buttons, active role indicator dot, dark mode.

```vue
<WorkspaceSwitcher :currentRole="role" userName="Raj Mehta" />
```

---

## 3. Form Components

No form-specific components exist yet. Use common components (`OptInput`, `OptSelect`, `OptDatePicker`) for form building.

---

## 4. Task Components

No task-specific components exist yet.

---

## 5. Dashboard Components

No dashboard-specific components exist yet.

---

## 6. Table Components

No table-specific components exist yet.

---

## 7. Chart Components

No chart-specific components exist yet.

---

## 8. Design Principles

All components adhere to the following conventions:

| Principle | Implementation |
|-----------|---------------|
| **v-model** | Form controls (`OptInput`, `OptSelect`, `OptDatePicker`) and overlay components (`OptDrawer`, `OptBottomSheet`, `OptBanner`) use `v-model` / `modelValue` + `update:modelValue` |
| **Teleport** | `OptDrawer`, `OptBottomSheet`, `NotificationCenter`, `FabQuickAdd` use `<Teleport to="body">` to escape DOM nesting |
| **Transition** | `OptModal` uses Headless UI `TransitionRoot`/`TransitionChild`; `OptDrawer`/`OptBottomSheet`/`OptBanner` use scoped CSS transitions; `LanguageSwitcher`/`WorkspaceSwitcher` use named `.dropdown-*` transitions |
| **Dark mode** | All components support `.dark` class via `dark:` Tailwind variants |
| **Aria** | `aria-disabled`, `aria-busy`, `aria-invalid`, `aria-describedby`, `aria-required`, `aria-expanded`, `aria-haspopup`, `aria-modal`, `aria-label`, `aria-live="polite"`, `role="alert"` |
| **Focus rings** | `focus-visible:ring-2` with matching color rings on all interactive elements |
| **Touch targets** | `min-h-touch` / `min-w-touch` utility classes on all interactive controls |
| **Typography scale** | `text-button`, `text-body`, `text-caption`, `text-h1`–`text-h3` design tokens |
| **Spacing scale** | Tailwind spacing, `gap-*`, `p-*`, `px-*`, `py-*` throughout |
| **Color tokens** | `brand-*`, `neutral-*`, `success-*`, `warning-*`, `danger-*`, `info-*` semantic palettes |
| **Scroll lock** | `OptModal`, `OptDrawer`, `OptBottomSheet`, `NotificationCenter` set/reset `document.body.style.overflow` on open/close |
| **Icon system** | Heroicons v24 (outline + solid) via dynamic `icon` prop resolution (kebab-case to PascalCase) |
