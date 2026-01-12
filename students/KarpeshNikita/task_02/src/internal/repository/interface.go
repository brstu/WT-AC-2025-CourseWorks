package repository

import "github.com/example/books/pkg/models"

type Repository interface {
	CreateUser(u *models.User) error
	GetUserByEmail(email string) (*models.User, error)
	CreateAuthor(a *models.Author) error
	ListBooks() ([]models.Book, error)
	CreateBook(b *models.Book) error
	GetBook(id int) (*models.Book, error)
	UpdateBook(b *models.Book) error
	DeleteBook(id int) error
	CreateShelf(s *models.Shelf) error
	ListShelves() ([]models.Shelf, error)
	GetShelf(id int) (*models.Shelf, error)
	ListBooksByShelf(shelfID int) ([]models.Book, error)
	AddBookToShelf(shelfID int, bookID int) error
	GetUserByID(id int) (*models.User, error)
	UpdateUserRole(userID int, role string) error
	CreateReview(r *models.Review) error
	ListReviewsByBook(bookID int) ([]models.Review, error)
}
