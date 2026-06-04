# Original User Request

## Initial Request — 2026-06-04T15:37:47+08:00

# Teamwork Project Prompt — Draft

Fix dark mode in the Kabaw frontend.

Working directory: c:\Users\Alan Serios\OneDrive - Department of Education\Desktop\Kabaw_AirMonitoring_System\frontend
Integrity mode: development

## Requirements

### R1. Fix Tailwind v4 Dark Mode Variant
Update the `@custom-variant dark` in `globals.css` so that it correctly triggers the dark variant when the `dark` class is applied to the root element. Currently, `&:is(.dark *)` fails to style the element containing the class itself. Change it to `&:where(.dark, .dark *)`.

### R2. Verify next-themes functionality
Ensure `page.tsx` toggle correctly toggles `next-themes` theme between light and dark.

## Acceptance Criteria

### Dark Mode
- [ ] Toggling the theme from light to dark changes the background of the app.
- [ ] The `html` tag correctly receives the `class="dark"`.
- [ ] UI components accurately show their `dark:` prefix Tailwind utility styles.

## Follow-up — 2026-06-04T15:49:45+08:00

Verify and polish three recent changes to the KABAW Air Monitoring System frontend:
(1) The settings popover (gear icon) must fully support dark mode styling.
(2) The loading animation in the Analytics/Historical Trends section must use three water buffalo hoof SVG shapes with a clear sequential stomping pattern.
(3) All remaining UI elements must respect the dark mode toggle.

Working directory: c:\Users\Alan Serios\OneDrive - Department of Education\Desktop\Kabaw_AirMonitoring_System\frontend
Integrity mode: development

### R1. Settings Popover Dark Mode
The settings popover (opened via the gear icon in the top-right header) must have full dark mode support. The popover panel background, text labels, scan radius badge, and description text must all switch correctly when dark mode is toggled.

### R2. Water Buffalo Hoof Loader Animation
The LoaderTwo component in `src/components/ui/unique-loader-components.tsx` must render three water buffalo cloven hoof SVGs that animate in a clear left-to-right sequential stomping pattern. The animation must be smooth, with staggered delays so hooves appear to gallop in sequence.

### R3. Overall Dark Mode Consistency
All visible UI elements (header, search bar, AQI widget, footer) must respect the dark mode toggle without any hardcoded white backgrounds bleeding through.

### Acceptance Criteria

#### Dark Mode Popover
- [ ] Popover panel has dark background (dark:bg-slate-900) when dark mode is active
- [ ] All text in the popover is readable in dark mode
- [ ] Gear button itself has dark mode styling

#### Hoof Loader
- [ ] Three hoof shapes are visible (not circles/orbs)
- [ ] Animation follows a clear left-to-right sequence
- [ ] Animation loops smoothly without jarring resets

#### Build
- [ ] `npm run build` completes without errors
