package service

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

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
	if u, err := s.repo.GetUserByEmail(email); err == nil && u != nil && u.ID != 0 {
		return nil, errors.New("user exists")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
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
	
func (s *Service) ExportBooksJSON() ([]byte, error) {
	books, err := s.repo.ListBooks()
	if err != nil {
		return nil, err
	}
	return json.MarshalIndent(books, "", "  ")
}

func (s *Service) ExportBooksCSV() ([]byte, error) {
	books, err := s.repo.ListBooks()
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	w := csv.NewWriter(&buf)

	// header
	if err := w.Write([]string{"ID", "Title", "Description", "AuthorID", "CreatedAt"}); err != nil {
		return nil, err
	}

	for _, b := range books {
		row := []string{
			strconv.Itoa(b.ID),
			b.Title,
			b.Description,
			strconv.Itoa(b.AuthorID),
			b.CreatedAt.String(),
		}
		if err := w.Write(row); err != nil {
			return nil, err
		}
	}
	w.Flush()
	if err := w.Error(); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
func (s *Service) ImportBooksJSON(data []byte) error {
	var books []models.Book
	if err := json.Unmarshal(data, &books); err != nil {
		return err
	}
	for _, b := range books {
		// reset ID to let DB generate it if needed, or keep it if we want to preserve IDs?
		// usually import creates new records.
		b.ID = 0 
		if err := s.repo.CreateBook(&b); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) ImportBooksCSV(data []byte) error {
	r := csv.NewReader(bytes.NewReader(data))
	rows, err := r.ReadAll()
	if err != nil {
		return err
	}
	if len(rows) < 2 {
		return nil
	}

	for i, row := range rows {
		if i == 0 {
			continue // skip header
		}
		if len(row) < 4 {
			continue
		}
		title := row[1]
		desc := row[2]
		authorID, err := strconv.Atoi(row[3])
		if err != nil {
			return fmt.Errorf("invalid author id on row %d: %w", i+1, err)
		}

		b := &models.Book{
			Title:       title,
			Description: desc,
			AuthorID:    authorID,
		}
		if err := s.repo.CreateBook(b); err != nil {
			return err
		}
	}
	return nil
}
