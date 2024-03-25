DEPCRUISE_CONFIG := .dependency-cruiser.cjs
GRAPHS_DIR      := graphs
IMAGE           := kevinrutherford/rookery-commands
IMAGE_VERSION := $(shell git describe --tags)
MK_IMAGE  := .mk-built
MK_PUBLISHED    := .mk-published
MK_COMPILED     := .mk-compiled
MK_LINTED       := .mk-linted
SOURCES         := $(shell find src -type f)

depcruise := npx depcruise --config $(DEPCRUISE_CONFIG)

.PHONY: all build-dev ci-* clean clobber dev lint watch-*

# Software development - - - - - - - - - - - - - - - - - - - - - - - - - - - -

all: $(GRAPHS_DIR)/modules.svg $(GRAPHS_DIR)/arch.svg $(MK_LINTED)

watch-compiler: node_modules
	npx tsc --watch

$(MK_COMPILED): node_modules $(SOURCES) tsconfig.json
	npx tsc --noEmit
	@touch $@

$(MK_LINTED): node_modules .eslintrc.js $(SOURCES)
	npx eslint src --ext .ts
	npx ts-unused-exports tsconfig.json --silent --ignoreTestFiles
	$(depcruise) src
	@touch $@

# CI pipeline - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

ci-test: clean $(MK_COMPILED) $(MK_LINTED)

# Production build - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

$(MK_IMAGE): $(SOURCES) prod.Dockerfile node_modules
	docker build -f prod.Dockerfile --tag $(IMAGE) .
	@touch $@

preview: $(MK_IMAGE)
	docker run -e FORCE_COLOR=3 -p 44002:44002 -it --rm $(IMAGE)

release: $(MK_IMAGE) git-status-clean
	docker tag $(IMAGE):latest $(IMAGE):$(IMAGE_VERSION)
	docker push $(IMAGE):$(IMAGE_VERSION)
	docker push $(IMAGE):latest

git-status-clean:
	@test -z "$$(git status --porcelain)"

# Artefacts - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

node_modules: package.json
	npm install
	@touch $@

$(GRAPHS_DIR)/modules.svg: $(SOURCES) $(GRAPHS_DIR) node_modules $(DEPCRUISE_CONFIG)
	$(depcruise) --validate -T dot src | dot -Tsvg > $@

$(GRAPHS_DIR)/arch.svg: $(SOURCES) $(GRAPHS_DIR) node_modules $(DEPCRUISE_CONFIG)
	$(depcruise) -T archi --collapse 2 src | dot -Tsvg > $@

$(GRAPHS_DIR):
	mkdir -p $@

# Utilities - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

clean:
	rm -f $(MK_IMAGE) $(MK_PUBLISHED) $(MK_LINTED)
	rm -rf $(GRAPHS_DIR)

clobber: clean
	rm -rf node_modules
	docker system prune --force --volumes

