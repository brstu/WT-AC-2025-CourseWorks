package service

import (
	"errors"
	"testing"

	"github.com/example/books/pkg/models"
)

// fakeRepo is a minimal in-memory repo for unit tests
type fakeRepo struct {
	users  map[string]*models.User
	books  map[int]*models.Book
	nextID int
}

func newFakeRepo() *fakeRepo {
	return &fakeRepo{users: make(map[string]*models.User), books: make(map[int]*models.Book), nextID: 1}
}

func (r *fakeRepo) CreateUser(u *models.User) error {
	if _, ok := r.users[u.Email]; ok {
		return errors.New("exists")
	}
	u.ID = r.nextID
	r.nextID++
	r.users[u.Email] = u
	return nil
}
func (r *fakeRepo) GetUserByEmail(email string) (*models.User, error) {
	if u, ok := r.users[email]; ok {
		return u, nil
	}
	return nil, errors.New("not found")
}
func (r *fakeRepo) CreateAuthor(a *models.Author) error { a.ID = r.nextID; r.nextID++; return nil }
func (r *fakeRepo) ListBooks() ([]models.Book, error)   { return []models.Book{}, nil }
func (r *fakeRepo) CreateBook(b *models.Book) error {
	b.ID = r.nextID
	r.nextID++
	r.books[b.ID] = b
	return nil
}
func (r *fakeRepo) GetBook(id int) (*models.Book, error) {
	if b, ok := r.books[id]; ok {
		return b, nil
	}
	return nil, errors.New("not found")
}
func (r *fakeRepo) UpdateBook(b *models.Book) error {
	if _, ok := r.books[b.ID]; !ok {
		return errors.New("not found")
	}
	r.books[b.ID] = b
	return nil
}
func (r *fakeRepo) DeleteBook(id int) error              { delete(r.books, id); return nil }
func (r *fakeRepo) CreateShelf(s *models.Shelf) error    { s.ID = r.nextID; r.nextID++; return nil }
func (r *fakeRepo) ListShelves() ([]models.Shelf, error) { return []models.Shelf{}, nil }
func (r *fakeRepo) CreateReview(rw *models.Review) error { rw.ID = r.nextID; r.nextID++; return nil }
func (r *fakeRepo) ListReviewsByBook(bookID int) ([]models.Review, error) {
	return []models.Review{}, nil
}

func (r *fakeRepo) GetShelf(id int) (*models.Shelf, error) { return nil, nil }
func (r *fakeRepo) ListBooksByShelf(shelfID int) ([]models.Book, error) { return []models.Book{}, nil }
func (r *fakeRepo) AddBookToShelf(shelfID int, bookID int) error { return nil }
func (r *fakeRepo) GetUserByID(id int) (*models.User, error) { return nil, nil }
func (r *fakeRepo) UpdateUserRole(userID int, role string) error { return nil }

func TestRegisterAndAuth(t *testing.T) {
	r := newFakeRepo()
	svc := NewService(r)
	// register
	u, err := svc.RegisterUser("a@example.com", "secret", "Alex")
	if err != nil {
		t.Fatalf("register failed: %v", err)
	}
	if u.ID == 0 {
		t.Fatalf("expected id assigned")
	}
	// duplicate
	if _, err := svc.RegisterUser("a@example.com", "secret2", "Alex2"); err == nil {
		t.Fatalf("expected duplicate error")
	}
	// authenticate
	au, err := svc.Authenticate("a@example.com", "secret")
	if err != nil {
		t.Fatalf("authenticate failed: %v", err)
	}
	if au.ID != u.ID {
		t.Fatalf("wrong user authenticated")
	}
	// wrong password
	if _, err := svc.Authenticate("a@example.com", "bad"); err == nil {
		t.Fatalf("expected auth failure")
	}
}

func TestCreateBookAndReview(t *testing.T) {
	r := newFakeRepo()
	svc := NewService(r)
	bm := &BookModel{Title: "T", Description: "D", AuthorID: 1}
	if err := svc.CreateBookFromModel(bm); err != nil {
		t.Fatalf("create book: %v", err)
	}
	if bm.ID == 0 {
		t.Fatalf("book id assigned")
	}
	b, err := svc.GetBook(bm.ID)
	if err != nil {
		t.Fatalf("get book: %v", err)
	}
	if b.Title != "T" {
		t.Fatalf("wrong title: %s", b.Title)
	}
	// create review
	rv := &ReviewModel{UserID: 1, BookID: bm.ID, Text: "nice", Rating: 5}
	if err := svc.CreateReviewFromModel(rv); err != nil {
		t.Fatalf("create review: %v", err)
	}
}
