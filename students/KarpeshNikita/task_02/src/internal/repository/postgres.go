package repository

import (
	"github.com/example/books/pkg/models"
	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

type PostgresRepository struct {
	db *sqlx.DB
}

// compile-time interface check
var _ Repository = (*PostgresRepository)(nil)

func NewPostgresRepository(db *sqlx.DB) *PostgresRepository {
	return &PostgresRepository{db: db}
}

// Users
func (r *PostgresRepository) CreateUser(u *models.User) error {
	// ensure password is hashed; if the provided PasswordHash doesn't look like a bcrypt hash, hash it
	if u.PasswordHash != "" && !(len(u.PasswordHash) > 3 && (u.PasswordHash[:3] == "$2a" || u.PasswordHash[:3] == "$2b" || u.PasswordHash[:3] == "$2y")) {
		hash, err := bcrypt.GenerateFromPassword([]byte(u.PasswordHash), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u.PasswordHash = string(hash)
	}
	row := r.db.QueryRowx("INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,$4) RETURNING id", u.Email, u.PasswordHash, u.Name, u.Role)
	return row.Scan(&u.ID)
}

func (r *PostgresRepository) GetUserByEmail(email string) (*models.User, error) {
	var u models.User
	if err := r.db.Get(&u, "SELECT * FROM users WHERE email=$1", email); err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *PostgresRepository) CreateAuthor(a *models.Author) error {
	row := r.db.QueryRowx("INSERT INTO authors (name) VALUES ($1) RETURNING id", a.Name)
	return row.Scan(&a.ID)
}

func (r *PostgresRepository) ListBooks() ([]models.Book, error) {
	var books []models.Book
	if err := r.db.Select(&books, "SELECT * FROM books ORDER BY created_at DESC"); err != nil {
		return nil, err
	}
	return books, nil
}

func (r *PostgresRepository) CreateBook(b *models.Book) error {
	row := r.db.QueryRowx("INSERT INTO books (title, description, author_id) VALUES ($1,$2,$3) RETURNING id, created_at", b.Title, b.Description, b.AuthorID)
	if err := row.Scan(&b.ID, &b.CreatedAt); err != nil {
		return err
	}
	return nil
}

func (r *PostgresRepository) GetBook(id int) (*models.Book, error) {
	var b models.Book
	if err := r.db.Get(&b, "SELECT * FROM books WHERE id=$1", id); err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *PostgresRepository) UpdateBook(b *models.Book) error {
	_, err := r.db.Exec("UPDATE books SET title=$1, description=$2, author_id=$3 WHERE id=$4", b.Title, b.Description, b.AuthorID, b.ID)
	return err
}

func (r *PostgresRepository) DeleteBook(id int) error {
	_, err := r.db.Exec("DELETE FROM books WHERE id=$1", id)
	return err
}

func (r *PostgresRepository) CreateShelf(s *models.Shelf) error {
	row := r.db.QueryRowx("INSERT INTO shelves (user_id, name) VALUES ($1,$2) RETURNING id", s.UserID, s.Name)
	return row.Scan(&s.ID)
}

func (r *PostgresRepository) ListShelves() ([]models.Shelf, error) {
	var s []models.Shelf
	if err := r.db.Select(&s, "SELECT * FROM shelves"); err != nil {
		return nil, err
	}
	return s, nil
}

func (r *PostgresRepository) GetShelf(id int) (*models.Shelf, error) {
	var sh models.Shelf
	if err := r.db.Get(&sh, "SELECT * FROM shelves WHERE id=$1", id); err != nil {
		return nil, err
	}
	return &sh, nil
}

func (r *PostgresRepository) ListBooksByShelf(shelfID int) ([]models.Book, error) {
	var books []models.Book
	query := `SELECT b.* FROM books b JOIN shelf_books sb ON sb.book_id = b.id WHERE sb.shelf_id=$1 ORDER BY b.created_at DESC`
	if err := r.db.Select(&books, query, shelfID); err != nil {
		return nil, err
	}
	return books, nil
}

func (r *PostgresRepository) AddBookToShelf(shelfID int, bookID int) error {
	_, err := r.db.Exec("INSERT INTO shelf_books (shelf_id, book_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", shelfID, bookID)
	return err
}

func (r *PostgresRepository) GetUserByID(id int) (*models.User, error) {
	var u models.User
	if err := r.db.Get(&u, "SELECT * FROM users WHERE id=$1", id); err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *PostgresRepository) UpdateUserRole(userID int, role string) error {
	_, err := r.db.Exec("UPDATE users SET role=$1 WHERE id=$2", role, userID)
	return err
}

func (r *PostgresRepository) CreateReview(rv *models.Review) error {
	row := r.db.QueryRowx("INSERT INTO reviews (user_id, book_id, text, rating) VALUES ($1,$2,$3,$4) RETURNING id, created_at", rv.UserID, rv.BookID, rv.Text, rv.Rating)
	return row.Scan(&rv.ID, &rv.CreatedAt)
}

func (r *PostgresRepository) ListReviewsByBook(bookID int) ([]models.Review, error) {
	var rs []models.Review
	if err := r.db.Select(&rs, "SELECT * FROM reviews WHERE book_id=$1 ORDER BY created_at DESC", bookID); err != nil {
		return nil, err
	}
	return rs, nil
}
