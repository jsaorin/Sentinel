#!/bin/bash

echo "Starting development environment..."

if ! pnpm build; then
  echo "Build failed. Exiting."
  exit 1
fi

COMMANDS=()

COMMANDS+=("nodemon --watch 'apps/api' --watch 'packages/common/src' --watch 'packages/domain/src' --watch 'packages/infrastructure/src' --watch 'packages/application/src' --exec 'pnpm --dir apps/api dev'")
COMMANDS+=("nodemon --watch 'apps/webhooks' --watch 'packages/common/src' --watch 'packages/domain/src' --watch 'packages/infrastructure/src' --watch 'packages/application/src' --exec 'pnpm --dir apps/webhooks dev'")
COMMANDS+=("nodemon --watch 'apps/reactor' --watch 'packages/common/src' --watch 'packages/domain/src' --watch 'packages/infrastructure/src' --watch 'packages/application/src' --exec 'pnpm --dir apps/reactor dev'")
COMMANDS+=("nodemon --watch 'apps/watcher' --watch 'packages/common/src' --watch 'packages/domain/src' --watch 'packages/infrastructure/src' --watch 'packages/application/src' --exec 'pnpm --dir apps/watcher dev'")

npx concurrently --raw "${COMMANDS[@]}"
