# doctor-capabilities Specification (Delta)

## Modified Requirements

### Requirement: Manual-mode fallback

The resolver MUST handle doctors with `sacs_verified=false` by trusting the manually entered `specialty_id` and exposing two attention flags on its output: `verificationPending: boolean` and `sacsExpired: boolean`. (Previously: only `verification_pending` was exposed; `sacsExpired` is new and `verificationPending` is renamed to camelCase to match consumer typings.)

The new flags MUST be consumed by the sidebar attention dot and Advisor button in `app-shell-medico`.

#### Scenario: Manual doctor (medico1 case)

- GIVEN doctor `sacs_verified=false`, manual `specialty_id='gen-1'`
- WHEN resolver runs
- THEN result MUST include `always-on` + `specialty:gen-1`
- AND `verificationPending=true` MUST be set on output
- AND `sacsExpired=false` MUST be set on output

#### Scenario: SACS expired doctor

- GIVEN doctor `sacs_verified=true` with `sacs_expires_at` in the past
- WHEN resolver runs
- THEN `verificationPending=false` MUST be set
- AND `sacsExpired=true` MUST be set
- AND the Advisor button MUST receive a red-dot indicator from this flag

#### Scenario: Verified non-expired doctor

- GIVEN doctor `sacs_verified=true` with `sacs_expires_at` in the future
- WHEN resolver runs
- THEN both `verificationPending` and `sacsExpired` MUST be `false`
- AND the sidebar attention dot MUST NOT render for verification reasons

#### Scenario: Both flags true defensively

- GIVEN doctor `sacs_verified=false` and a stale `sacs_expires_at` value
- WHEN resolver runs
- THEN `verificationPending=true` MUST be set
- AND `sacsExpired=true` MUST also be set
- AND consumers MUST treat the union as a single critical-attention state
