import sqlite3

DB_PATH = "cooking_db.db"

def get_db():
    return sqlite3.connect(DB_PATH)

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.cursor()
        
        tables = [
            """CREATE TABLE IF NOT EXISTS User (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )""",
            
            """CREATE TABLE IF NOT EXISTS Ingredient (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                category TEXT NOT NULL,
                unit TEXT NOT NULL,
                description TEXT,
                calories_per_unit REAL,
                image TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )""",
            
            """CREATE TABLE IF NOT EXISTS Recipe (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                cooking_time_minutes INTEGER NOT NULL CHECK (cooking_time_minutes > 0),
                difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
                instructions TEXT NOT NULL,  -- JSON массив строк
                user_id INTEGER NOT NULL,
                image TEXT, 
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE
            )""",
            
            """CREATE TABLE IF NOT EXISTS RecipeIngredient (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recipe_id INTEGER NOT NULL,
                ingredient_id INTEGER NOT NULL,
                quantity REAL NOT NULL CHECK (quantity > 0),
                note TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(recipe_id) REFERENCES Recipe(id) ON DELETE CASCADE,
                FOREIGN KEY(ingredient_id) REFERENCES Ingredient(id) ON DELETE CASCADE,
                UNIQUE(recipe_id, ingredient_id)
            )""",
            
            """CREATE TABLE IF NOT EXISTS UserRecipe (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                recipe_id INTEGER NOT NULL,
                checklist TEXT,
                notes TEXT,
                is_completed BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE,
                FOREIGN KEY(recipe_id) REFERENCES Recipe(id) ON DELETE CASCADE,
                UNIQUE(user_id, recipe_id)
            )"""
        ]
        
        for table in tables:
            cur.execute(table)
        
        conn.commit()