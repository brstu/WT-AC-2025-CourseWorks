from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
import re
from enum import Enum

EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    role: UserRole = UserRole.USER

    @validator("email")
    def validate_email(cls, v):
        if not re.match(EMAIL_REGEX, v):
            raise ValueError("Invalid email format")
        return v

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: UserRole
    created_at: Optional[datetime] = None

class IngredientCreate(BaseModel):
    name: str = Field(..., max_length=100)
    category: str = Field(..., max_length=50) 
    unit: str = Field(..., max_length=20)
    description: Optional[str] = Field(None, max_length=500)
    calories_per_unit: Optional[float] = None
    image: Optional[str] = None  # URL или путь к изображению

class IngredientResponse(BaseModel):
    id: int
    name: str
    category: str
    unit: str
    description: Optional[str] = None
    calories_per_unit: Optional[float] = None
    image: Optional[str] = None  # URL или путь к изображению
    created_at: Optional[datetime] = None

class IngredientUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=50)
    unit: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = Field(None, max_length=500)
    calories_per_unit: Optional[float] = None
    image: Optional[str] = None  # URL или путь к изображению

class RecipeIngredient(BaseModel):
    ingredient_id: int
    quantity: float
    note: Optional[str] = None

class RecipeCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: str = Field(..., max_length=2000)
    cooking_time_minutes: int = Field(..., ge=1)
    difficulty: str = Field(..., max_length=20) 
    ingredients: List[RecipeIngredient]
    instructions: List[str] = Field(..., min_items=1)
    image: Optional[str] = None  # URL или путь к изображению

class RecipeResponse(BaseModel):
    id: int
    title: str
    description: str
    cooking_time_minutes: int
    difficulty: str
    ingredients: List[dict]  # список ингредиентов с деталями
    instructions: List[str]
    user_id: int
    image: Optional[str] = None  # URL или путь к изображению
    created_at: Optional[datetime] = None

class RecipeUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    cooking_time_minutes: Optional[int] = Field(None, ge=1)
    difficulty: Optional[str] = Field(None, max_length=20)
    ingredients: Optional[List[RecipeIngredient]] = None
    instructions: Optional[List[str]] = None
    image: Optional[str] = None

class UserRecipeCreate(BaseModel):
    recipe_id: int
    checklist: List[str] = []
    notes: Optional[str] = None

class UserRecipeResponse(BaseModel):
    id: int
    user_id: int
    recipe_id: int
    checklist: List[str]
    notes: Optional[str] = None
    is_completed: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class UserRecipeUpdate(BaseModel):
    checklist: Optional[List[str]] = None
    notes: Optional[str] = None
    is_completed: Optional[bool] = None

class RecipeFilter(BaseModel):
    ingredients: Optional[List[int]] = None 
    max_time: Optional[int] = None
    difficulty: Optional[str] = None
    category: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

    @validator("email")
    def validate_email(cls, v):
        if not re.match(EMAIL_REGEX, v):
            raise ValueError("Invalid email format")
        return v
    
class UserRecipeWithRecipeResponse(BaseModel):
    id: int
    user_id: int
    recipe: RecipeResponse

    checklist: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    is_completed: bool

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
