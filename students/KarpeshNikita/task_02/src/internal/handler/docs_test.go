package handler

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/example/books/internal/service"
	"github.com/example/books/pkg/models"
	"github.com/gin-gonic/gin"
)

// minimal in-memory repo implementing repository.Repository methods used by service
type tinyRepo struct{}

func (r *tinyRepo) CreateUser(u *models.User) error                   { u.ID = 1; return nil }
func (r *tinyRepo) GetUserByEmail(email string) (*models.User, error) { return nil, nil }
func (r *tinyRepo) CreateAuthor(a *models.Author) error               { return nil }
func (r *tinyRepo) ListBooks() ([]models.Book, error)                 { return []models.Book{}, nil }
func (r *tinyRepo) CreateBook(b *models.Book) error                   { return nil }
func (r *tinyRepo) GetBook(id int) (*models.Book, error)              { return nil, nil }
func (r *tinyRepo) UpdateBook(b *models.Book) error                   { return nil }
func (r *tinyRepo) DeleteBook(id int) error                           { return nil }
func (r *tinyRepo) CreateShelf(s *models.Shelf) error                 { return nil }
func (r *tinyRepo) ListShelves() ([]models.Shelf, error)              { return []models.Shelf{}, nil }
func (r *tinyRepo) CreateReview(rw *models.Review) error              { return nil }
func (r *tinyRepo) ListReviewsByBook(bookID int) ([]models.Review, error) {
	return []models.Review{}, nil
}

func (r *tinyRepo) GetShelf(id int) (*models.Shelf, error)            { return nil, nil }
func (r *tinyRepo) ListBooksByShelf(shelfID int) ([]models.Book, error) { return []models.Book{}, nil }
func (r *tinyRepo) AddBookToShelf(shelfID int, bookID int) error        { return nil }
func (r *tinyRepo) GetUserByID(id int) (*models.User, error)           { return nil, nil }
func (r *tinyRepo) UpdateUserRole(userID int, role string) error       { return nil }

func TestDocsPage(t *testing.T) {
	r := &tinyRepo{}
	svc := service.NewService(r)
	h := NewHandler(svc)

	rg := gin.New()
	rg.GET("/docs", h.SwaggerUI)
	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/docs", nil)
	rg.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("docs not served: %d", w.Code)
	}
	if len(w.Body.Bytes()) < 100 {
		t.Fatalf("docs body too short")
	}
}

func TestSwaggerStaticFile(t *testing.T) {
	cwd, _ := os.Getwd()
	path := filepath.Join(cwd, "docs", "swagger.yaml")
	if _, err := os.Stat(path); err != nil {
		t.Fatalf("swagger.yaml missing at %s: %v", path, err)
	}
	r := gin.New()
	// serve the generated file from the workspace (absolute path)
	r.StaticFile("/docs/swagger.yaml", path)
	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/docs/swagger.yaml", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("swagger.yaml not served: %d", w.Code)
	}
	if len(w.Body.Bytes()) < 10 {
		t.Fatalf("swagger.yaml empty")
	}
}
