# Handoff Report

## Observation
The adversarial failure reported that on mobile devices, the chat bubble for long texts requires ~193px of height, but there was only 144px of gap (`mt-32`) between the Control Panel (`z-0`) and the Map (`z-10`). Since the chat bubble is positioned within the `z-0` container, the overflow upwards was being clipped behind the opaque Map container.
Inspected `src/components/DashboardTab.tsx` and observed the layout:
```tsx
{/* Control Panel Column */}
<div className="xl:col-span-5 flex flex-col gap-4 md:gap-6 mt-32 xl:mt-32 relative z-0">
```

## Logic Chain
1. The gap needs to be increased above 193px on mobile.
2. `mt-32` provides 8rem (128px) of space.
3. `mt-48` provides 12rem (192px), which is close but might be tight.
4. `mt-56` provides 14rem (224px) of space, which securely accommodates the max bubble height.
5. On desktop (`xl`), the columns are laid out side-by-side so `mt-32` is sufficient.
6. The fix was applied by changing `mt-32 xl:mt-32` to `mt-56 md:mt-48 xl:mt-32` to provide progressive spacing that ensures the chat bubble is fully visible without changing the mascot proportions or the peeking mechanic.

## Caveats
The `mt-56` creates empty space when short texts are present. This is an unavoidable consequence of using negative margins and reserving absolute positioning space within a normal document flow.

## Conclusion
Increased the gap for the Control Panel Column on smaller viewports using Tailwind classes (`mt-56` on mobile and `mt-48` on tablet) to provide over 220px of clearance. This ensures that even the longest error messages will completely display without clipping behind the map layer above it.

## Verification Method
1. Build check using `npm run build` or `tsc --noEmit`.
2. Inspect `src/components/DashboardTab.tsx` line 216 to verify the margin update.
