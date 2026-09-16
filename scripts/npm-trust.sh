#!/usr/bin/env bash
#
# Configures npm trusted publishing (OIDC) for every public package in
# packages/, so .github/workflows/release.yml can publish without NPM_TOKEN.
#
# Run this locally, logged in to npm as a maintainer with 2FA enabled. The
# first request asks for 2FA; tick the npm website's "skip 2FA for 5 minutes"
# option so the rest of the loop runs without further prompts.
#
# Usage:
#   scripts/npm-trust.sh            # print the commands without running them
#   scripts/npm-trust.sh --apply    # configure trusted publishing
#
# Requires npm >= 11.15.0 (https://docs.npmjs.com/cli/v11/commands/npm-trust/).
# A package must already exist on npm before trust can be configured, so
# unpublished packages are skipped and listed at the end; publish those once
# by hand, then re-run this script.

set -euo pipefail

REPO="jspsych/jsPsych"
WORKFLOW="release.yml"
MIN_NPM="11.15.0"

apply=false
if [[ "${1:-}" == "--apply" ]]; then
  apply=true
elif [[ $# -gt 0 ]]; then
  echo "Usage: $0 [--apply]" >&2
  exit 2
fi

cd "$(dirname "$0")/.."

npm_version="$(npm --version)"
if [[ "$(printf '%s\n' "$MIN_NPM" "$npm_version" | sort -V | head -n1)" != "$MIN_NPM" ]]; then
  echo "npm $npm_version is too old; npm trust needs $MIN_NPM or later." >&2
  echo "Run: npm install -g npm@latest" >&2
  exit 1
fi

if $apply; then
  echo "Logged in to npm as: $(npm whoami)"
fi

configured=()
unpublished=()
failed=()

for manifest in packages/*/package.json; do
  name="$(node -p "const p = require('./$manifest'); p.private ? '' : p.name")"
  [[ -z "$name" ]] && continue

  if ! npm view "$name" name >/dev/null 2>&1; then
    unpublished+=("$name")
    continue
  fi

  cmd=(npm trust github "$name" --file "$WORKFLOW" --repo "$REPO" --allow-publish --yes)

  if ! $apply; then
    echo "${cmd[*]}"
    continue
  fi

  echo "==> $name"
  if "${cmd[@]}"; then
    configured+=("$name")
  else
    failed+=("$name")
  fi
done

echo
if $apply; then
  echo "Configured: ${#configured[@]}"
  if [[ ${#failed[@]} -gt 0 ]]; then
    echo "Failed (re-run to retry; check with 'npm trust list <package>'):"
    printf '  %s\n' "${failed[@]}"
  fi
else
  echo "Dry run. Re-run with --apply to configure trusted publishing."
fi

if [[ ${#unpublished[@]} -gt 0 ]]; then
  echo "Not on npm yet (publish once by hand, then re-run):"
  printf '  %s\n' "${unpublished[@]}"
fi

[[ ${#failed[@]} -eq 0 ]]
