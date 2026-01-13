FROM golang:1.25.5-alpine AS build
WORKDIR /app
COPY . .
# build static binary for linux to avoid glibc mismatch in distroless base
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags='-s -w' -o /books ./cmd/server

FROM gcr.io/distroless/base-debian11:nonroot
COPY --from=build /books /books
# include generated docs for Swagger UI
COPY docs /docs
# include templates and migrations so the server can load them at runtime
COPY web /web
COPY migrations /migrations
EXPOSE 8080
CMD ["/books"]
