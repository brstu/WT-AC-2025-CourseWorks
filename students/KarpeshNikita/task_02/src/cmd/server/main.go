package main

import (
	"fmt"
	"log"
	"os"

	"github.com/example/books/internal/handler"
	"github.com/example/books/internal/repository"
	"github.com/example/books/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// default for local development
		dsn = "postgres://postgres:password@localhost:5432/books?sslmode=disable"
	}

	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer db.Close()

	// run simple migrations
	runMigrations(db)

	repo := repository.NewPostgresRepository(db)
	svc := service.NewService(repo)
	h := handler.NewHandler(svc)

	r := gin.Default()

	// register handler routes and static assets
	h.RegisterRoutes(r)

	// prometheus metrics endpoint
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Printf("listening on :%s\n", port)
	r.Run(":" + port)
}

func runMigrations(db *sqlx.DB) {
	files := []string{"migrations/001_init.sql", "migrations/002_seed.sql", "migrations/003_shelf_books.sql"}
	for _, f := range files {
		b, err := os.ReadFile(f)
		if err != nil {
			fmt.Printf("skip migration %s: %v\n", f, err)
			continue
		}
		_, err = db.Exec(string(b))
		if err != nil {
			fmt.Printf("migration %s failed: %v\n", f, err)
		}
	}
}
