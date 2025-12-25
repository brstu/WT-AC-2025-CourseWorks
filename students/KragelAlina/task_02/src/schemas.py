# schemas.py
from pydantic import BaseModel, Field, field_validator

class UserSchema(BaseModel):
    username: str = Field(min_length=3)
    password: str = Field(min_length=6)

class TitleSchema(BaseModel):
    name: str
    type: str
    genre: str | None = None
    year: int | None = None

class ListSchema(BaseModel):
    title_id: int
    status: str

class ReviewSchema(BaseModel):
    title_id: int
    text: str

class RatingSchema(BaseModel):
    title_id: int
    score: int

    @field_validator('score')
    @classmethod
    def score_range(cls, v: int):
        if not 1 <= v <= 10:
            raise ValueError('Score must be between 1 and 10')
        return v