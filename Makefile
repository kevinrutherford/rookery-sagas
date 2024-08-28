DEPCRUISE_CONFIG := .dependency-cruiser.cjs
GRAPHS_DIR      := graphs
IMAGE           := kevinrutherford/rookery-sagas
IMAGE_VERSION := $(shell git describe --tags)
MK_IMAGE  := .mk-built
MK_COMPILED     := .mk-compiled
MK_LINTED       := .mk-linted
MK_TESTED := .mk-tested
SOURCES         := $(shell find src -type f)
TESTS := $(shell find test -type f)

depcruise := npx depcruise --config $(DEPCRUISE_CONFIG)

.PHONY: all build-dev ci-* clean clobber dev diagrams lint watch-*

# Software development - - - - - - - - - - - - - - - - - - - - - - - - - - - -

all: diagrams $(MK_TESTED) $(MK_LINTED)

$(MK_COMPILED): node_modules $(SOURCES) $(TESTS) tsconfig.json
	npx tsc --noEmit
	@touch $@

$(MK_TESTED): node_modules $(SOURCES) $(TESTS) jest.config.js
	npx jest
	@touch $@

$(MK_LINTED): node_modules .eslintrc.js $(SOURCES) $(TESTS)
	npx eslint src test --ext .ts
	npx ts-unused-exports tsconfig.json --silent --ignoreTestFiles
	$(depcruise) src
	@touch $@

watch-compiler: node_modules
	npx tsc --watch

watch-tests: node_modules
	 npx jest --watch

# CI pipeline - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

ci-test: clean $(MK_COMPILED) $(MK_TESTED) $(MK_LINTED)

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
	git tag $(IMAGE_VERSION)

git-status-clean:
	@test -z "$$(git status --porcelain)"

# Artefacts - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

node_modules: package.json .nvmrc
	npm install
	@touch $@

diagrams: $(GRAPHS_DIR)/modules.svg $(GRAPHS_DIR)/components.svg $(GRAPHS_DIR)/arch.svg

$(GRAPHS_DIR)/components.svg: $(SOURCES) $(GRAPHS_DIR) node_modules $(DEPCRUISE_CONFIG)
	$(depcruise) --validate -T dot --collapse 3 src | dot -Tsvg > $@

$(GRAPHS_DIR)/modules.svg: $(SOURCES) $(GRAPHS_DIR) node_modules $(DEPCRUISE_CONFIG)
	$(depcruise) --validate -T dot src | dot -Tsvg > $@

$(GRAPHS_DIR)/arch.svg: $(SOURCES) $(GRAPHS_DIR) node_modules $(DEPCRUISE_CONFIG)
	$(depcruise) -T archi --collapse 2 src | dot -Tsvg > $@

$(GRAPHS_DIR):
	mkdir -p $@

# Utilities - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

clean:
	rm -f $(MK_COMPILED) $(MK_LINTED) $(MK_TESTED)
	rm -rf $(GRAPHS_DIR)

clobber: clean
	rm -f $(MK_IMAGE)
	rm -rf node_modules

