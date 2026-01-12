.PHONY: build up run

build:
	go build -o books ./cmd/server

up:
	docker-compose up --build

run: build
	./books


.PHONY: run-local
run-local:
	go run ./cmd/server