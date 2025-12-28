from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
from typing import List, Optional
import sqlite3
import json
import logging

from DB import get_db, init_db
from objects import *
from utilities import hash_password, verify_password, create_access_token, verify_token

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="Cooking Recipe API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials.credentials)
    if not payload or not (user_id := payload.get("user_id")):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id, email, name, role, created_at FROM User WHERE id = ?", 
            (user_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="User not found")
        return UserResponse(**{
            "id": row[0], "email": row[1], "name": row[2],
            "role": UserRole(row[3]), "created_at": row[4]
        })
    finally:
        conn.close()

async def get_current_admin(current: UserResponse = Depends(get_current_user)):
    if current.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current

def execute_db(query: str, params: tuple = (), fetchone: bool = False, fetchall: bool = False):
    """Универсальная функция для выполнения SQL запросов"""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(query, params)
        if fetchone:
            return cur.fetchone()
        if fetchall:
            return cur.fetchall()
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/register")
def register(user: UserCreate):
    """Регистрация пользователя с возвратом токена"""
    try:
        if execute_db("SELECT id FROM User WHERE email = ?", (user.email,), fetchone=True):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_id = execute_db(
            "INSERT INTO User (email, name, password, role) VALUES (?, ?, ?, ?)",
            (user.email, user.name, hash_password(user.password), user.role.value)
        )
        
        row = execute_db(
            "SELECT id, email, role FROM User WHERE id = ?",
            (user_id,), fetchone=True
        )
        
        if not row:
            raise HTTPException(status_code=500, detail="User creation failed")
        
        user_id, email, role = row
        
        token = create_access_token(
            {"sub": email, "user_id": user_id, "role": role}
        )
        
        return {"user_token": token}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Register error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/login")
def login(data: LoginRequest):
    """Авторизация пользователя с возвратом токена"""
    row = execute_db(
        "SELECT id, email, password, role FROM User WHERE email = ?",
        (data.email,), fetchone=True
    )
    if not row:
        raise HTTPException(status_code=400, detail="User not found")
    
    user_id, email, hashed, role = row
    if not verify_password(data.password, hashed):
        raise HTTPException(status_code=400, detail="Invalid password")
    
    token = create_access_token(
        {"sub": email, "user_id": user_id, "role": role}
    )
    
    return {"user_token": token}

@app.get("/profile", response_model=UserResponse)
def profile(current: UserResponse = Depends(get_current_user)):
    return current

@app.post("/ingredients", response_model=IngredientResponse)
def create_ingredient(
    ingredient: IngredientCreate,
    current: UserResponse = Depends(get_current_admin)
):
    ingredient_id = execute_db(
        "INSERT INTO Ingredient (name, category, unit, description, calories_per_unit, image) VALUES (?, ?, ?, ?, ?, ?)",
        (ingredient.name, ingredient.category, ingredient.unit, 
         ingredient.description, ingredient.calories_per_unit, ingredient.image)
    )
    
    row = execute_db(
        "SELECT id, name, category, unit, description, calories_per_unit, image, created_at FROM Ingredient WHERE id = ?",
        (ingredient_id,), fetchone=True
    )
    
    return IngredientResponse(**{
        "id": row[0], "name": row[1], "category": row[2], "unit": row[3],
        "description": row[4], "calories_per_unit": row[5], 
        "image": row[6], "created_at": row[7]
    })

@app.get("/ingredients", response_model=List[IngredientResponse])
def get_ingredients(
    category: Optional[str] = None,
    search: Optional[str] = None,
    current: UserResponse = Depends(get_current_user)
):
    query = "SELECT id, name, category, unit, description, calories_per_unit, image, created_at FROM Ingredient WHERE 1=1"
    params = []
    
    if category:
        query += " AND category = ?"
        params.append(category)
    
    if search:
        query += " AND (name LIKE ? OR description LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    
    query += " ORDER BY name"
    
    rows = execute_db(query, tuple(params), fetchall=True)
    
    return [IngredientResponse(**{
        "id": r[0], "name": r[1], "category": r[2], "unit": r[3],
        "description": r[4], "calories_per_unit": r[5], 
        "image": r[6], "created_at": r[7]
    }) for r in rows]

@app.get("/ingredients/{ingredient_id}", response_model=IngredientResponse)
def get_ingredient_by_id(
    ingredient_id: int,
    current: UserResponse = Depends(get_current_user)
):
    row = execute_db(
        "SELECT id, name, category, unit, description, calories_per_unit, image, created_at FROM Ingredient WHERE id = ?",
        (ingredient_id,),
        fetchone=True
    )

    if not row:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    return IngredientResponse(**{
        "id": row[0],
        "name": row[1],
        "category": row[2],
        "unit": row[3],
        "description": row[4],
        "calories_per_unit": row[5],
        "image": row[6],
        "created_at": row[7],
    })

@app.put("/ingredients/{ingredient_id}", response_model=IngredientResponse)
def update_ingredient(
    ingredient_id: int,
    ingredient: IngredientUpdate,
    current: UserResponse = Depends(get_current_admin)
):
    if not execute_db("SELECT id FROM Ingredient WHERE id = ?", (ingredient_id,), fetchone=True):
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    updates = []
    params = []
    fields = {
        "name": ingredient.name,
        "category": ingredient.category,
        "unit": ingredient.unit,
        "description": ingredient.description,
        "calories_per_unit": ingredient.calories_per_unit,
        "image": ingredient.image  # Добавлено
    }
    
    for field, value in fields.items():
        if value is not None:
            updates.append(f"{field} = ?")
            params.append(value)
    
    if updates:
        params.append(ingredient_id)
        execute_db(f"UPDATE Ingredient SET {', '.join(updates)} WHERE id = ?", tuple(params))
    
    row = execute_db(
        "SELECT id, name, category, unit, description, calories_per_unit, image, created_at FROM Ingredient WHERE id = ?",
        (ingredient_id,), fetchone=True
    )
    
    return IngredientResponse(**{
        "id": row[0], "name": row[1], "category": row[2], "unit": row[3],
        "description": row[4], "calories_per_unit": row[5], 
        "image": row[6], "created_at": row[7]
    })

@app.delete("/ingredients/{ingredient_id}")
def delete_ingredient(
    ingredient_id: int,
    current: UserResponse = Depends(get_current_admin)
):
    # Проверка использования в рецептах
    used_in = execute_db(
        "SELECT COUNT(*) FROM RecipeIngredient WHERE ingredient_id = ?",
        (ingredient_id,), fetchone=True
    )
    
    if used_in and used_in[0] > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete ingredient used in {used_in[0]} recipes"
        )
    
    execute_db("DELETE FROM Ingredient WHERE id = ?", (ingredient_id,))
    return {"message": "Ingredient deleted"}

@app.post("/recipes", response_model=RecipeResponse)
def create_recipe(
    recipe: RecipeCreate,
    current: UserResponse = Depends(get_current_admin)
):
    for ri in recipe.ingredients:
        if not execute_db("SELECT id FROM Ingredient WHERE id = ?", (ri.ingredient_id,), fetchone=True):
            raise HTTPException(status_code=400, detail=f"Ingredient {ri.ingredient_id} not found")
    
    recipe_id = execute_db(
        "INSERT INTO Recipe (title, description, cooking_time_minutes, difficulty, instructions, user_id, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (recipe.title, recipe.description, recipe.cooking_time_minutes, 
         recipe.difficulty, json.dumps(recipe.instructions), current.id, recipe.image)
    )
    
    for ri in recipe.ingredients:
        execute_db(
            "INSERT INTO RecipeIngredient (recipe_id, ingredient_id, quantity, note) VALUES (?, ?, ?, ?)",
            (recipe_id, ri.ingredient_id, ri.quantity, ri.note)
        )
    
    return get_recipe_details(recipe_id)

@app.get("/recipes", response_model=List[RecipeResponse])
def get_recipes(
    max_time: Optional[int] = None,
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
    ingredient_ids: Optional[str] = None,
):
    query = """
        SELECT DISTINCT r.id, r.title, r.description, r.cooking_time_minutes, 
               r.difficulty, r.instructions, r.user_id, r.image, r.created_at
        FROM Recipe r
        LEFT JOIN RecipeIngredient ri ON r.id = ri.recipe_id
        LEFT JOIN Ingredient i ON ri.ingredient_id = i.id
        WHERE 1=1
    """
    params = []
    
    if max_time:
        query += " AND r.cooking_time_minutes <= ?"
        params.append(max_time)
    
    if difficulty:
        query += " AND r.difficulty = ?"
        params.append(difficulty)
    
    if category:
        query += " AND i.category = ?"
        params.append(category)
    
    if ingredient_ids:
        ids = [int(id.strip()) for id in ingredient_ids.split(",") if id.strip()]
        if ids:
            placeholders = ",".join(["?"] * len(ids))
            query += f" AND ri.ingredient_id IN ({placeholders})"
            params.extend(ids)
    
    query += " ORDER BY r.created_at DESC"
    
    rows = execute_db(query, tuple(params), fetchall=True)
    
    recipes = []
    for row in rows:
        recipe_id = row[0]
        recipes.append(get_recipe_details(recipe_id))
    
    return recipes

@app.get("/recipes/{recipe_id}", response_model=RecipeResponse)
def get_recipe(
    recipe_id: int,
):
    return get_recipe_details(recipe_id)

def get_recipe_details(recipe_id: int):
    """Вспомогательная функция для получения полной информации о рецепте"""
    row = execute_db("""
        SELECT r.id, r.title, r.description, r.cooking_time_minutes, 
               r.difficulty, r.instructions, r.user_id, r.image, r.created_at
        FROM Recipe r WHERE r.id = ?
    """, (recipe_id,), fetchone=True)
    if not row:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    ingredients_rows = execute_db("""
        SELECT ri.ingredient_id, ri.quantity, ri.note, i.name, i.category, i.unit, i.image
        FROM RecipeIngredient ri
        JOIN Ingredient i ON ri.ingredient_id = i.id
        WHERE ri.recipe_id = ?
    """, (recipe_id,), fetchall=True)
    
    ingredients = []
    for ir in ingredients_rows:
        ingredients.append({
            "ingredient_id": ir[0],
            "quantity": ir[1],
            "note": ir[2],
            "name": ir[3],
            "category": ir[4],
            "unit": ir[5],
            "image": ir[6]
        })
    
    return RecipeResponse(**{
        "id": row[0], "title": row[1], "description": row[2], 
        "cooking_time_minutes": row[3], "difficulty": row[4],
        "instructions": json.loads(row[5]), "ingredients": ingredients,
        "user_id": row[6], "image": row[7], "created_at": row[8]
    })

def get_user_recipe_details(user_id: int, recipe_id: int):
    row = execute_db(
        """
        SELECT id, user_id, recipe_id, checklist, notes, is_completed, created_at, updated_at
        FROM UserRecipe
        WHERE user_id = ? AND recipe_id = ?
        """,
        (user_id, recipe_id),
        fetchone=True
    )
    if not row:
        raise HTTPException(status_code=404, detail="Recipe not found in your collection")

    recipe = get_recipe_details(row[2])

    return UserRecipeWithRecipeResponse(**{
        "id": row[0],
        "user_id": row[1],
        "recipe": recipe,
        "checklist": json.loads(row[3]) if row[3] else [],
        "notes": row[4],
        "is_completed": bool(row[5]),
        "created_at": row[6],
        "updated_at": row[7],
    })


@app.put("/recipes/{recipe_id}", response_model=RecipeResponse)
def update_recipe(
    recipe_id: int,
    recipe: RecipeUpdate,
    current: UserResponse = Depends(get_current_admin)
):
    conn = get_db()
    try:
        owner = conn.execute("SELECT user_id FROM Recipe WHERE id = ?", (recipe_id,)).fetchone()
        if not owner or owner[0] != current.id:
            raise HTTPException(status_code=403, detail="Not your recipe")

        # ✅ если пришли ингредиенты — проверим что они существуют
        if recipe.ingredients is not None:
            for ri in recipe.ingredients:
                exists = conn.execute(
                    "SELECT id FROM Ingredient WHERE id = ?",
                    (ri.ingredient_id,)
                ).fetchone()
                if not exists:
                    raise HTTPException(status_code=400, detail=f"Ingredient {ri.ingredient_id} not found")

        # ✅ обновляем поля Recipe
        updates = []
        params = []

        if recipe.title is not None:
            updates.append("title = ?")
            params.append(recipe.title)

        if recipe.description is not None:
            updates.append("description = ?")
            params.append(recipe.description)

        if recipe.cooking_time_minutes is not None:
            updates.append("cooking_time_minutes = ?")
            params.append(recipe.cooking_time_minutes)

        if recipe.difficulty is not None:
            updates.append("difficulty = ?")
            params.append(recipe.difficulty)

        if recipe.instructions is not None:
            updates.append("instructions = ?")
            params.append(json.dumps(recipe.instructions))

        if recipe.image is not None:
            updates.append("image = ?")
            params.append(recipe.image)

        if updates:
            params.append(recipe_id)
            conn.execute(
                f"UPDATE Recipe SET {', '.join(updates)} WHERE id = ?",
                tuple(params)
            )

        if recipe.ingredients is not None:
            conn.execute("DELETE FROM RecipeIngredient WHERE recipe_id = ?", (recipe_id,))
            for ri in recipe.ingredients:
                conn.execute(
                    "INSERT INTO RecipeIngredient (recipe_id, ingredient_id, quantity, note) VALUES (?, ?, ?, ?)",
                    (recipe_id, ri.ingredient_id, ri.quantity, ri.note)
                )

        conn.commit()
        return get_recipe_details(recipe_id)

    finally:
        conn.close()

@app.delete("/recipes/{recipe_id}")
def delete_recipe(
    recipe_id: int,
    current: UserResponse = Depends(get_current_admin)
):
    owner = execute_db("SELECT user_id FROM Recipe WHERE id = ?", (recipe_id,), fetchone=True)
    if not owner or owner[0] != current.id:
        raise HTTPException(status_code=403, detail="Not your recipe")
    
    execute_db("DELETE FROM Recipe WHERE id = ?", (recipe_id,))
    return {"message": "Recipe deleted"}

@app.post("/user-recipes", response_model=UserRecipeWithRecipeResponse)
def add_recipe_to_user(
    data: UserRecipeCreate,
    current: UserResponse = Depends(get_current_user)
):
    if not execute_db("SELECT id FROM Recipe WHERE id = ?", (data.recipe_id,), fetchone=True):
        raise HTTPException(status_code=404, detail="Recipe not found")

    existing = execute_db(
        "SELECT id FROM UserRecipe WHERE user_id = ? AND recipe_id = ?",
        (current.id, data.recipe_id), fetchone=True
    )
    if existing:
        raise HTTPException(status_code=400, detail="Recipe already added to your collection")

    execute_db(
        "INSERT INTO UserRecipe (user_id, recipe_id, checklist, notes) VALUES (?, ?, ?, ?)",
        (current.id, data.recipe_id, json.dumps(data.checklist), data.notes)
    )

    return get_user_recipe_details(current.id, data.recipe_id)

@app.get("/user-recipes", response_model=List[UserRecipeWithRecipeResponse])
def get_user_recipes(
    is_completed: Optional[bool] = None,
    current: UserResponse = Depends(get_current_user)
):
    query = """
        SELECT id, user_id, recipe_id, checklist, notes, is_completed, created_at, updated_at
        FROM UserRecipe
        WHERE user_id = ?
    """
    params = [current.id]

    if is_completed is not None:
        query += " AND is_completed = ?"
        params.append(1 if is_completed else 0)

    query += " ORDER BY updated_at DESC"
    rows = execute_db(query, tuple(params), fetchall=True)

    result = []
    for r in rows:
        recipe = get_recipe_details(r[2])
        result.append(UserRecipeWithRecipeResponse(**{
            "id": r[0],
            "user_id": r[1],
            "recipe": recipe,
            "checklist": json.loads(r[3]) if r[3] else [],
            "notes": r[4],
            "is_completed": bool(r[5]),
            "created_at": r[6],
            "updated_at": r[7],
        }))

    return result

@app.get("/user-recipes/{recipe_id}", response_model=UserRecipeResponse)
def get_user_recipe(
    recipe_id: int,
    current: UserResponse = Depends(get_current_user)
):
    row = execute_db(
        """
        SELECT id, user_id, recipe_id, checklist, notes, is_completed, created_at, updated_at
        FROM UserRecipe
        WHERE user_id = ? AND recipe_id = ?
        """,
        (current.id, recipe_id),
        fetchone=True
    )

    if not row:
        raise HTTPException(status_code=404, detail="Recipe not found in your collection")

    return UserRecipeResponse(**{
        "id": row[0],
        "user_id": row[1],
        "recipe_id": row[2],
        "checklist": json.loads(row[3]) if row[3] else [],
        "notes": row[4],
        "is_completed": bool(row[5]),
        "created_at": row[6],
        "updated_at": row[7],
    })

@app.put("/user-recipes/{recipe_id}", response_model=UserRecipeWithRecipeResponse)
def update_user_recipe(
    recipe_id: int,
    data: UserRecipeUpdate,
    current: UserResponse = Depends(get_current_user)
):
    existing = execute_db(
        "SELECT id FROM UserRecipe WHERE user_id = ? AND recipe_id = ?",
        (current.id, recipe_id), fetchone=True
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Recipe not found in your collection")

    updates = ["updated_at = CURRENT_TIMESTAMP"]
    params = []

    if data.checklist is not None:
        updates.append("checklist = ?")
        params.append(json.dumps(data.checklist))

    if data.notes is not None:
        updates.append("notes = ?")
        params.append(data.notes)

    if data.is_completed is not None:
        updates.append("is_completed = ?")
        params.append(1 if data.is_completed else 0)

    params.extend([current.id, recipe_id])

    execute_db(
        f"UPDATE UserRecipe SET {', '.join(updates)} WHERE user_id = ? AND recipe_id = ?",
        tuple(params)
    )

    return get_user_recipe_details(current.id, recipe_id)

@app.delete("/user-recipes/{recipe_id}")
def remove_user_recipe(
    recipe_id: int,
    current: UserResponse = Depends(get_current_user)
):
    execute_db(
        "DELETE FROM UserRecipe WHERE user_id = ? AND recipe_id = ?",
        (current.id, recipe_id)
    )
    return {"message": "Recipe removed from your collection"}

@app.post("/recipes/find-by-ingredients", response_model=List[RecipeResponse])
def find_recipes_by_ingredients(
    filter_data: RecipeFilter,
    current: UserResponse = Depends(get_current_user)
):
    conn = get_db()
    try:
        query = """
            SELECT r.id, r.title, r.description, r.cooking_time_minutes, 
                   r.difficulty, r.instructions, r.user_id, r.created_at,
                   r.image
            FROM Recipe r
            WHERE 1=1
        """
        params = []
        
        if filter_data.max_time:
            query += " AND r.cooking_time_minutes <= ?"
            params.append(filter_data.max_time)
        
        if filter_data.difficulty:
            query += " AND r.difficulty = ?"
            params.append(filter_data.difficulty)
        
        if filter_data.ingredients:
            ingredient_count = len(filter_data.ingredients)
            placeholders = ",".join(["?"] * ingredient_count)
            
            query += f"""
                AND r.id IN (
                    SELECT recipe_id FROM RecipeIngredient 
                    WHERE ingredient_id IN ({placeholders})
                    GROUP BY recipe_id 
                    HAVING COUNT(DISTINCT ingredient_id) = ?
                )
            """
            params.extend(filter_data.ingredients)
            params.append(ingredient_count)
        
        if filter_data.category:
            query += """
                AND r.id IN (
                    SELECT ri.recipe_id FROM RecipeIngredient ri
                    JOIN Ingredient i ON ri.ingredient_id = i.id
                    WHERE i.category = ?
                )
            """
            params.append(filter_data.category)
        
        query += " ORDER BY r.created_at DESC"
        
        rows = conn.execute(query, tuple(params)).fetchall()
        
        recipes = []
        for row in rows:
            recipe_id = row[0]
            
            recipe_row = conn.execute("""
                SELECT r.id, r.title, r.description, r.cooking_time_minutes, 
                       r.difficulty, r.instructions, r.user_id, r.created_at,
                       r.image
                FROM Recipe r WHERE r.id = ?
            """, (recipe_id,)).fetchone()
            
            ingredients_rows = conn.execute("""
                SELECT ri.ingredient_id, ri.quantity, ri.note, i.name, i.category, i.unit
                FROM RecipeIngredient ri
                JOIN Ingredient i ON ri.ingredient_id = i.id
                WHERE ri.recipe_id = ?
            """, (recipe_id,)).fetchall()
            
            ingredients = []
            for ir in ingredients_rows:
                ingredients.append({
                    "ingredient_id": ir[0],
                    "quantity": ir[1],
                    "note": ir[2],
                    "name": ir[3],
                    "category": ir[4],
                    "unit": ir[5]
                })
            
            recipes.append(RecipeResponse(**{
                "id": recipe_row[0],
                "title": recipe_row[1],
                "description": recipe_row[2],
                "cooking_time_minutes": recipe_row[3],
                "difficulty": recipe_row[4],
                "instructions": json.loads(recipe_row[5]),
                "ingredients": ingredients,
                "user_id": recipe_row[6],
                "created_at": recipe_row[7],
                "image": recipe_row[8],
            }))


        
        return recipes
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)