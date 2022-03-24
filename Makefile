SHELL := /bin/bash

BLACK        := $(shell printf "\033[30m")
BLACK_BOLD   := $(shell printf "\033[30;1m")
RED          := $(shell printf "\033[31m")
RED_BOLD     := $(shell printf "\033[31;1m")
GREEN        := $(shell printf "\033[32m")
GREEN_BOLD   := $(shell printf "\033[32;1m")
YELLOW       := $(shell printf "\033[33m")
YELLOW_BOLD  := $(shell printf "\033[33;1m")
BLUE         := $(shell printf "\033[34m")
BLUE_BOLD    := $(shell printf "\033[34;1m")
MAGENTA      := $(shell printf "\033[35m")
MAGENTA_BOLD := $(shell printf "\033[35;1m")
CYAN         := $(shell printf "\033[36m")
CYAN_BOLD    := $(shell printf "\033[36;1m")
WHITE        := $(shell printf "\033[37m")
WHITE_BOLD   := $(shell printf "\033[37;1m")
CNone        := $(shell printf "\033[0m")

TIME = ${WHITE}[$(shell date +%Y-%m-%d' '%H:%M:%S)]

OK = @echo ${TIME}${GREEN}$1${CNone}${SPACE}
INFO = echo ${TIME}${BLUE}$1${CNone}${SPACE}


start-dependencies:
	scripts/setup.sh
	$(call OK, start-dependencies complete...)

stop-dependencies:
	scripts/teardown.sh
	$(call OK, stop-dependencies complete...)

integration-test:
	@make start-dependencies
	@npm run-script integration-test
	@make stop-dependencies
	$(call OK, integration-test complete...)
