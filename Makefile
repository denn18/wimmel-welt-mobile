BACKEND_DIR ?= backend
BACKEND_FALLBACK := docs/backend-snapshot
BACKEND_PATH := $(if $(wildcard $(BACKEND_DIR)/package.json),$(BACKEND_DIR),$(BACKEND_FALLBACK))

.PHONY: backend-path backend-install backend-test backend-lint app-lint

backend-path:
@echo "Backend path: $(BACKEND_PATH)"

backend-install:
@echo "Installing backend dependencies in $(BACKEND_PATH)"
npm install --prefix $(BACKEND_PATH)

backend-test:
@echo "Running backend tests in $(BACKEND_PATH)"
npm test --prefix $(BACKEND_PATH)

backend-lint:
@echo "Running backend lint in $(BACKEND_PATH)"
npm run lint --prefix $(BACKEND_PATH)

app-lint:
npm run lint --prefix app
