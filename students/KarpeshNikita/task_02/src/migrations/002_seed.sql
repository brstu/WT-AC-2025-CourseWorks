-- seed some authors and books
INSERT INTO authors (name) VALUES ('Fyodor Dostoevsky') ON CONFLICT DO NOTHING;
INSERT INTO authors (name) VALUES ('Jane Austen') ON CONFLICT DO NOTHING;

INSERT INTO books (title, description, author_id) VALUES ('Crime and Punishment', 'A psychological drama', (SELECT id FROM authors WHERE name='Fyodor Dostoevsky')) ON CONFLICT DO NOTHING;
INSERT INTO books (title, description, author_id) VALUES ('Pride and Prejudice', 'Classic romance', (SELECT id FROM authors WHERE name='Jane Austen')) ON CONFLICT DO NOTHING;
