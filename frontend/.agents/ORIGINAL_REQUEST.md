# Original User Request

## Initial Request — 2026-06-05T04:08:19Z

Revert the Kuya Kabaw mascot to a smaller, proportional size that matches the user's reference image (half-body peeking from the command center) and ensure the chat bubble is perfectly positioned and readable.

Working directory: c:\Users\Alan Serios\OneDrive - Department of Education\Desktop\Kabaw_AirMonitoring_System\frontend
Integrity mode: development

## Requirements

### R1. Mascot Proportions
Revert the mascot size to a proportional "good small" size (e.g., `w-32 h-32`).

### R2. Peeking Layout
Maintain the peeking layout where the mascot is anchored to the top of the KABAW Command Center card, and its bottom half is completely hidden behind the card.

### R3. Chat Bubble Integration
Ensure the chat bubble is readable, proportional to the smaller mascot, and positioned to its left with the directional pointer pointing accurately at the mascot.

## Acceptance Criteria

### Visual Layout
- [ ] Mascot is rendered at a small, proportional size.
- [ ] Mascot's bottom half is explicitly hidden behind the command center card's z-index.
- [ ] Chat bubble text is readable and the bubble is cleanly positioned.

### Build Verification
- [ ] Project compiles successfully without errors (`npm run build`).
