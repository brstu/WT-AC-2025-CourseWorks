package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"html/template"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/example/books/internal/service"
	"github.com/example/books/pkg/models"
	"github.com/gin-gonic/gin"
)

// in-memory repo implementing repository.Repository for handler tests
type memRepo struct {
	users map[string]*models.User
	next  int
}

func newMemRepo() *memRepo { return &memRepo{users: make(map[string]*models.User), next: 1} }
func (r *memRepo) CreateUser(u *models.User) error {
	u.ID = r.next
	r.next++
	r.users[u.Email] = u
	return nil
}
func (r *memRepo) GetUserByEmail(email string) (*models.User, error) {
	if u, ok := r.users[email]; ok {
		return u, nil
	}
	return nil, errors.New("not found")
}
func (r *memRepo) CreateAuthor(a *models.Author) error  { a.ID = r.next; r.next++; return nil }
func (r *memRepo) ListBooks() ([]models.Book, error)    { return []models.Book{}, nil }
func (r *memRepo) CreateBook(b *models.Book) error      { b.ID = r.next; r.next++; return nil }
func (r *memRepo) GetBook(id int) (*models.Book, error) { return nil, errors.New("not found") }
func (r *memRepo) UpdateBook(b *models.Book) error      { return nil }
func (r *memRepo) DeleteBook(id int) error              { return nil }
func (r *memRepo) CreateShelf(s *models.Shelf) error    { s.ID = r.next; r.next++; return nil }
func (r *memRepo) ListShelves() ([]models.Shelf, error) { return []models.Shelf{}, nil }
func (r *memRepo) CreateReview(rw *models.Review) error { rw.ID = r.next; r.next++; return nil }
func (r *memRepo) ListReviewsByBook(bookID int) ([]models.Review, error) {
	return []models.Review{}, nil
}

func (r *memRepo) GetShelf(id int) (*models.Shelf, error) { return nil, nil }
func (r *memRepo) ListBooksByShelf(shelfID int) ([]models.Book, error) { return []models.Book{}, nil }
func (r *memRepo) AddBookToShelf(shelfID int, bookID int) error { return nil }
func (r *memRepo) GetUserByID(id int) (*models.User, error) { return nil, nil }
func (r *memRepo) UpdateUserRole(userID int, role string) error { return nil }

func TestRegisterLoginProtected(t *testing.T) {
	r := newMemRepo()
	svc := service.NewService(r)
	h := NewHandler(svc)

	router := gin.New()
	router.POST("/api/register", h.Register)
	router.POST("/api/login", h.Login)
	router.POST("/api/shelves", h.AuthMiddleware(), h.CreateShelf)

	// register
	w := httptest.NewRecorder()
	reg := map[string]string{"email": "user@test.com", "password": "secret", "name": "User"}
	b, err := json.Marshal(reg)
	if err != nil {
		t.Fatalf("marshal register payload: %v", err)
	}
	req := httptest.NewRequest("POST", "/api/register", bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("register failed: %d %s", w.Code, w.Body.String())
	}

	// login
	w = httptest.NewRecorder()
	lg := map[string]string{"email": "user@test.com", "password": "secret"}
	b, err = json.Marshal(lg)
	if err != nil {
		t.Fatalf("marshal login payload: %v", err)
	}
	req = httptest.NewRequest("POST", "/api/login", bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("login failed: %d %s", w.Code, w.Body.String())
	}
	var res map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &res); err != nil {
		t.Fatalf("unmarshal login response: %v", err)
	}
	tok := res["token"]
	if tok == "" {
		t.Fatalf("no token returned")
	}

	// create shelf with auth
	w = httptest.NewRecorder()
	shelf := map[string]string{"name": "Favorites"}
	b, err = json.Marshal(shelf)
	if err != nil {
		t.Fatalf("marshal shelf payload: %v", err)
	}
	req = httptest.NewRequest("POST", "/api/shelves", bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+tok)
	router.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("create shelf failed: %d %s", w.Code, w.Body.String())
	}
}
func TestLoginRegisterPages(t *testing.T) {
	r := newMemRepo()
	svc := service.NewService(r)
	h := NewHandler(svc)

	router := gin.New()
	// parse only base + login + register templates to avoid template collision in test
	tmpl := template.Must(template.ParseFiles("../../web/templates/base.html", "../../web/templates/login.html", "../../web/templates/register.html"))
	router.SetHTMLTemplate(tmpl)
	router.GET("/login", h.LoginPage)
	router.GET("/register", h.RegisterPage)

	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/login", nil)
	router.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("login page failed: %d", w.Code)
	}
	if !strings.Contains(w.Body.String(), "Login") {
		t.Fatalf("login page content missing")
	}

	w = httptest.NewRecorder()
	req = httptest.NewRequest("GET", "/register", nil)
	router.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("register page failed: %d", w.Code)
	}
	if !strings.Contains(w.Body.String(), "reg-form") {
		t.Fatalf("register page content missing")
	}
}
