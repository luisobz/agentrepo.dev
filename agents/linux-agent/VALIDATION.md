# Validation · 0.1.1 candidate

The source and distribution contain generic examples with empty credentials.
An automated publication check rejects private deployment identifiers, common
credential formats, private network addresses, symlinks and state/log files.
This is a prevention check, not a mathematical guarantee that arbitrary secrets
can always be detected. The release is built from an explicit file manifest.

## Automated checks

- Python standard-library unit tests: owner/chat authorization, confirmation
  scope/expiry/single use, duration limits, fixed-command allowlists, SQL routing,
  relay capability restrictions, sustained alarms/recovery and publication hygiene.
- Disposable Debian 13 container: actual fresh installation, root-owned harness
  and helpers, bot credential isolation, real sudo grant/revoke, expired NOTAFTER,
  refusal of arbitrary sudo commands and existing installations. Only systemctl
  scheduling is mocked: the container does not run systemd as PID 1.
- Codex app-server protocol initialization and thread creation checked against
  Codex CLI 0.160.0 and its generated schema. Empty threads are persisted only after their first
  turn; initialization schedules a harmless ready response after owner consent.

## Required before production

A fresh VM running systemd must verify timers, closure after reboot, a real
Telegram private topic, provider authentication, two-session routing, interrupted
turn recovery and maintenance on disposable packages. These end-to-end checks
have not been performed against a production server. No real bot token or provider
credential is shipped or reused for testing.

Root expiry prevents new sudo invocations; it cannot terminate already elevated
processes or undo their modifications. Runtime approvals and sudo authorization
remain independent. Keep an independent administrative SSH session and backups.
