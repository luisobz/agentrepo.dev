# Linux Agent

Reusable server administration kit. Never put real tokens, IDs, addresses, hostnames,
credentials, production output or private configuration in this directory.
Do not run install.sh or privileged helpers on the development host or an existing
server. Validate with isolated tests and a disposable VM/container first.
Runtime account and bot account must stay separate. Only the owner in the configured
private Telegram chat can approve root; model messages never authorize elevation.
Root leases do not stop existing elevated processes. State this limitation explicitly.
