# E2E Test Infra: kabaw_android

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Android Project Initialization | ORIGINAL_REQUEST R1 | 5      | 5      | ✓      |
| 2 | Spacious Dashboard UI | ORIGINAL_REQUEST R2 | 5      | 5      | ✓      |

## Test Architecture
- Test runner: Android emulator via Gradle (`./gradlew connectedAndroidTest`)
- Test case format: Espresso / UI Automator
- Directory layout: `app/src/androidTest/java/com/kabaw/airmonitoring/`

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | First launch on small screen | F1, F2 | Medium |
| 2 | Large font accessibility mode | F2 | Medium |
| 3 | Landscape orientation | F2 | High |
| 4 | Dashboard under memory pressure | F1, F2 | Medium |
| 5 | Screen reader traversal | F2 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature
- Tier 2: ≥5 per feature (where boundaries exist)
- Tier 3: pairwise coverage of major feature interactions
- Tier 4: ≥5 realistic application scenarios
