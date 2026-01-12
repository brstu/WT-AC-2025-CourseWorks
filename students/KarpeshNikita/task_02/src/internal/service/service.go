package service

import (
	"errors"

	"github.com/example/books/internal/repository"
	"github.com/example/books/pkg/models"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo repository.Repository
}

func NewService(r repository.Repository) *Service {
	return &Service{repo: r}
}

func (s *Service) RegisterUser(email, password, name string) (*models.User, error) {
	// check existing
	if u, _ := s.repo.GetUserByEmail(email); u != nil && u.ID != 0 {
		return nil, errors.New("user exists")
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	u := &models.User{Email: email, PasswordHash: string(hash), Name: name, Role: "user"}
	if err := s.repo.CreateUser(u); err != nil {
		return nil, err
	}
	return u, nil
}

func (s *Service) Authenticate(email, password string) (*models.User, error) {
	u, err := s.repo.GetUserByEmail(email)
	if err != nil {
		return nil, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}
	return u, nil
}

func (s *Service) ListBooks() ([]models.Book, error) {
	return s.repo.ListBooks()
}

// Adapter types used by handlers

type BookModel = models.Book
type ShelfModel = models.Shelf
type ReviewModel = models.Review

func (s *Service) CreateBook(b *models.Book) error {
	return s.repo.CreateBook(b)
}

func (s *Service) CreateBookFromModel(m *BookModel) error {
	b := &models.Book{Title: m.Title, Description: m.Description, AuthorID: m.AuthorID}
	if err := s.repo.CreateBook(b); err != nil {
		return err
	}
	// propagate generated fields back to model
	m.ID = b.ID
	m.CreatedAt = b.CreatedAt
	return nil
}

func (s *Service) GetBook(id int) (*models.Book, error) {
	return s.repo.GetBook(id)
}

func (s *Service) UpdateBook(b *models.Book) error {
	return s.repo.UpdateBook(b)
}

func (s *Service) UpdateBookFromModel(m *BookModel) error {
	b := &models.Book{ID: m.ID, Title: m.Title, Description: m.Description, AuthorID: m.AuthorID}
	return s.repo.UpdateBook(b)
}

func (s *Service) DeleteBook(id int) error {
	return s.repo.DeleteBook(id)
}

func (s *Service) CreateShelf(sh *models.Shelf) error {
	return s.repo.CreateShelf(sh)
}

func (s *Service) CreateShelfFromModel(m *ShelfModel) error {
	shelf := &models.Shelf{UserID: m.UserID, Name: m.Name}
	if err := s.repo.CreateShelf(shelf); err != nil {
		return err
	}
	m.ID = shelf.ID
	return nil
}

func (s *Service) ListShelves() ([]models.Shelf, error) {
	return s.repo.ListShelves()
}

func (s *Service) GetShelf(id int) (*models.Shelf, error) {
	return s.repo.GetShelf(id)
}

func (s *Service) ListBooksByShelf(shelfID int) ([]models.Book, error) {
	return s.repo.ListBooksByShelf(shelfID)
}

func (s *Service) AddBookToShelf(shelfID int, bookID int) error {
	return s.repo.AddBookToShelf(shelfID, bookID)
}

func (s *Service) GetUserByID(id int) (*models.User, error) {
	return s.repo.GetUserByID(id)
}

func (s *Service) UpdateUserRole(userID int, role string) error {
	return s.repo.UpdateUserRole(userID, role)
}

func (s *Service) CreateReview(rv *models.Review) error {
	return s.repo.CreateReview(rv)
}

func (s *Service) CreateReviewFromModel(m *ReviewModel) error {
	r := &models.Review{UserID: m.UserID, BookID: m.BookID, Text: m.Text, Rating: m.Rating}
	if err := s.repo.CreateReview(r); err != nil {
		return err
	}
	m.ID = r.ID
	m.CreatedAt = r.CreatedAt
	return nil
}

func (s *Service) ListReviews(bookID int) ([]models.Review, error) {
	return s.repo.ListReviewsByBook(bookID)
}
