package models

import "time"

type User struct {
	ID           int    `db:"id" json:"id"`
	Email        string `db:"email" json:"email"`
	PasswordHash string `db:"password_hash" json:"-"`
	Name         string `db:"name" json:"name"`
	Role         string `db:"role" json:"role"`
}

type Author struct {
	ID   int    `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
}

type Book struct {
	ID          int       `db:"id" json:"id"`
	Title       string    `db:"title" json:"title"`
	Description string    `db:"description" json:"description"`
	AuthorID    int       `db:"author_id" json:"author_id"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
}

type Shelf struct {
	ID     int    `db:"id" json:"id"`
	UserID int    `db:"user_id" json:"user_id"`
	Name   string `db:"name" json:"name"`
}

type Review struct {
	ID        int       `db:"id" json:"id"`
	UserID    int       `db:"user_id" json:"user_id"`
	BookID    int       `db:"book_id" json:"book_id"`
	Text      string    `db:"text" json:"text"`
	Rating    int       `db:"rating" json:"rating"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}
