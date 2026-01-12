-- join table for shelves and books
CREATE TABLE IF NOT EXISTS shelf_books (
    shelf_id INT REFERENCES shelves(id) ON DELETE CASCADE,
    book_id INT REFERENCES books(id) ON DELETE CASCADE,
    PRIMARY KEY (shelf_id, book_id)
);
