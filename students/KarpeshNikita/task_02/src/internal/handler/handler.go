package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/example/books/internal/auth"
	"github.com/example/books/internal/metrics"
	"github.com/example/books/internal/service"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *service.Service
}

func NewHandler(s *service.Service) *Handler {
	return &Handler{svc: s}
}

// RegisterRoutes registers all HTTP routes on the provided Gin engine.
func (h *Handler) RegisterRoutes(r *gin.Engine) {
	// instrumentation middleware (Prometheus)
	r.Use(metrics.GinMiddleware())

	// static assets & templates
	r.Static("/assets", "./web/static")
	r.LoadHTMLGlob("web/templates/*")

	api := r.Group("/api")
	{
		api.POST("/register", h.Register)
		api.POST("/login", h.Login)
		api.GET("/me", h.AuthMiddleware(), h.Me)

		// admin: update user role
		api.PUT("/users/:id/role", h.AuthMiddleware(), h.RequireRole("admin"), h.UpdateUserRole)

		books := api.Group("/books")
		{
			books.GET("", h.ListBooks)
			books.POST("", h.AuthMiddleware(), h.RequireRole("admin"), h.CreateBook)
			books.GET(":id", h.GetBook)
			books.PUT(":id", h.AuthMiddleware(), h.UpdateBook)
			books.DELETE(":id", h.AuthMiddleware(), h.DeleteBook)

			// Import/Export
			books.GET("/export/json", h.AuthMiddleware(), h.ExportBooksJSON)
			books.GET("/export/csv", h.AuthMiddleware(), h.ExportBooksCSV)
			books.POST("/import/json", h.AuthMiddleware(), h.RequireRole("admin"), h.ImportBooksJSON)
			books.POST("/import/csv", h.AuthMiddleware(), h.RequireRole("admin"), h.ImportBooksCSV)
		}

		shelves := api.Group("/shelves")
		{
			shelves.GET("", h.ListShelves)
			shelves.POST("", h.AuthMiddleware(), h.CreateShelf)
			shelves.POST(":id/books", h.AuthMiddleware(), h.AddBookToShelf)
		}

		reviews := api.Group("/reviews")
		{
			reviews.POST("", h.AuthMiddleware(), h.CreateReview)
		}
	}

	// UI pages
	r.GET("/", h.Index)
	r.GET("/books/new", h.NewBookPage)
	r.GET("/books/:id", h.BookPage)
	r.GET("/shelves", h.ShelvesPage)
	r.GET("/shelves/:id", h.ShelfPage)
	r.GET("/login", h.LoginPage)
	r.GET("/register", h.RegisterPage)
	r.GET("/profile", h.ProfilePage)

	// docs
	r.GET("/docs", h.SwaggerUI)
	r.StaticFile("/docs/swagger.yaml", "docs/swagger.yaml")
	r.StaticFile("/docs/swagger.json", "docs/swagger.json")
	// legacy
	r.StaticFile("/docs/openapi.yaml", "docs/openapi.yaml")
}

func (h *Handler) Index(c *gin.Context) {
	books, err := h.svc.ListBooks()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// prevent caching of the main page which may show auth-dependent content
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	c.Header("Pragma", "no-cache")
	c.HTML(http.StatusOK, "index.html", gin.H{"books": books})
}

func (h *Handler) BookPage(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	b, err := h.svc.GetBook(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "book not found"})
		return
	}
	reviews, err := h.svc.ListReviews(id)
	if err != nil {
		reviews = []service.ReviewModel{} // allow page to render even if reviews fail, but handle error
	}
	c.HTML(http.StatusOK, "book.html", gin.H{"book": b, "reviews": reviews})
}

// Swagger UI page; loads OpenAPI from /docs/openapi.yaml
func (h *Handler) SwaggerUI(c *gin.Context) {
	html := `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.0/swagger-ui.css" />
  <title>API Docs</title>
</head>
<body>
  <div id="swagger"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({ url: '/docs/swagger.yaml', dom_id: '#swagger' });
    };
  </script>
</body>
</html>`
	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}

func (h *Handler) RegisterPage(c *gin.Context) {
	// prevent caching to avoid clients showing stale/incorrect pages
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	c.Header("Pragma", "no-cache")
	c.HTML(http.StatusOK, "register.html", nil)
}

func (h *Handler) LoginPage(c *gin.Context) {
	// prevent caching to avoid clients showing stale/incorrect pages
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	c.Header("Pragma", "no-cache")
	c.HTML(http.StatusOK, "login.html", nil)
}

func (h *Handler) ShelvesPage(c *gin.Context) {
	// prevent caching because shelves content is auth-dependent
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	c.Header("Pragma", "no-cache")
	// pagination params
	pageStr := c.DefaultQuery("page", "1")
	sizeStr := c.DefaultQuery("size", "10")
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	size, err := strconv.Atoi(sizeStr)
	if err != nil || size < 1 {
		size = 10
	}

	shelves, err := h.svc.ListShelves()
	if err != nil {
		c.HTML(http.StatusOK, "shelves.html", gin.H{"shelves": []interface{}{}, "page": page, "size": size, "total": 0, "totalPages": 0})
		return
	}
	total := len(shelves)
	start := (page - 1) * size
	if start > total {
		start = total
	}
	end := start + size
	if end > total {
		end = total
	}
	pageShelves := shelves[start:end]
	totalPages := 0
	if size > 0 {
		totalPages = (total + size - 1) / size
	}
	prevPage := page - 1
	if prevPage < 1 {
		prevPage = 1
	}
	nextPage := page + 1
	if nextPage > totalPages {
		nextPage = totalPages
	}

	c.HTML(http.StatusOK, "shelves.html", gin.H{
		"shelves":    pageShelves,
		"page":       page,
		"size":       size,
		"total":      total,
		"totalPages": totalPages,
		"prevPage":   prevPage,
		"nextPage":   nextPage,
		"hasPrev":    page > 1,
		"hasNext":    page < totalPages,
	})
}

func (h *Handler) NewBookPage(c *gin.Context) {
	c.HTML(http.StatusOK, "new_book.html", nil)
}

// API handlers
// Register godoc
// @Summary Register a new user
// @Description Register a new user with email and password
// @Tags Auth
// @Accept json
// @Produce json
// @Param payload body models.User true "Register payload"
// @Success 201 {object} models.User
// @Failure 400 {object} map[string]string
// @Router /api/register [post]
func (h *Handler) Register(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		Name     string `json:"name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	u, err := h.svc.RegisterUser(req.Email, req.Password, req.Name)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, u)
}

// Login godoc
// @Summary Authenticate user and return JWT
// @Description Authenticate with email and password
// @Tags Auth
// @Accept json
// @Produce json
// @Param payload body map[string]string true "Login payload"
// @Success 200 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /api/login [post]
func (h *Handler) Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	u, err := h.svc.Authenticate(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	// generate JWT
	tok, err := auth.GenerateToken(u.ID, u.Role, 24*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token generation failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": tok})
}

// ListBooks godoc
// @Summary List books
// @Description Get list of books
// @Tags Books
// @Produce json
// @Success 200 {array} models.Book
// @Failure 500 {object} map[string]string
// @Router /api/books [get]
func (h *Handler) ListBooks(c *gin.Context) {
	bs, err := h.svc.ListBooks()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, bs)
}

// CreateBook godoc
// @Summary Create a new book
// @Description Create a book (authenticated)
// @Tags Books
// @Accept json
// @Produce json
// @Param payload body models.Book true "Book payload"
// @Success 201 {object} models.Book
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Security bearerAuth
// @Router /api/books [post]
func (h *Handler) CreateBook(c *gin.Context) {
	var b struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
		AuthorID    int    `json:"author_id"`
	}
	if err := c.ShouldBindJSON(&b); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	bk := &service.BookModel{Title: b.Title, Description: b.Description, AuthorID: b.AuthorID}
	if err := h.svc.CreateBookFromModel(bk); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, bk)
}

// UpdateUserRole API handler (admin only)
func (h *Handler) UpdateUserRole(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	var req struct {
		Role string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.UpdateUserRole(id, req.Role); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": id, "role": req.Role})
}

// GetBook godoc
// @Summary Get book by id
// @Description Get book details
// @Tags Books
// @Produce json
// @Param id path int true "Book ID"
// @Success 200 {object} models.Book
// @Failure 404 {object} map[string]string
// @Router /api/books/{id} [get]
func (h *Handler) GetBook(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	b, err := h.svc.GetBook(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, b)
}

// UpdateBook godoc
// @Summary Update a book
// @Description Update book details (authenticated)
// @Tags Books
// @Accept json
// @Produce json
// @Param id path int true "Book ID"
// @Param payload body models.Book true "Book payload"
// @Success 200 {object} models.Book
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Security bearerAuth
// @Router /api/books/{id} [put]
func (h *Handler) UpdateBook(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var b struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		AuthorID    int    `json:"author_id"`
	}
	if err := c.ShouldBindJSON(&b); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	bk := &service.BookModel{ID: id, Title: b.Title, Description: b.Description, AuthorID: b.AuthorID}
	if err := h.svc.UpdateBookFromModel(bk); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, bk)
}

// DeleteBook godoc
// @Summary Delete a book
// @Description Delete book by id (authenticated)
// @Tags Books
// @Param id path int true "Book ID"
// @Success 204
// @Failure 401 {object} map[string]string
// @Security bearerAuth
// @Router /api/books/{id} [delete]
func (h *Handler) DeleteBook(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.svc.DeleteBook(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

// ListShelves godoc
// @Summary List shelves
// @Description List all shelves
// @Tags Shelves
// @Produce json
// @Success 200 {array} models.Shelf
// @Router /api/shelves [get]
func (h *Handler) ListShelves(c *gin.Context) {
	s, err := h.svc.ListShelves()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, s)
}

// CreateShelf godoc
// @Summary Create a shelf
// @Description Create a shelf for authenticated user
// @Tags Shelves
// @Accept json
// @Produce json
// @Param payload body models.Shelf true "Shelf payload"
// @Success 201 {object} models.Shelf
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Security bearerAuth
// @Router /api/shelves [post]
func (h *Handler) CreateShelf(c *gin.Context) {
	var sh struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&sh); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	uidVal, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	uid, ok := uidVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user id"})
		return
	}
	shelf := &service.ShelfModel{UserID: uid, Name: sh.Name}
	if err := h.svc.CreateShelfFromModel(shelf); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, shelf)
}

// CreateReview godoc
// @Summary Create a review
// @Description Create a review for a book (authenticated)
// @Tags Reviews
// @Accept json
// @Produce json
// @Param payload body models.Review true "Review payload"
// @Success 201 {object} models.Review
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Security bearerAuth
// @Router /api/reviews [post]
func (h *Handler) CreateReview(c *gin.Context) {
	var r struct {
		BookID int    `json:"book_id" binding:"required"`
		Text   string `json:"text"`
		Rating int    `json:"rating" binding:"required,min=1,max=5"`
	}
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	uidVal, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	uid, ok := uidVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user id"})
		return
	}
	rev := &service.ReviewModel{UserID: uid, BookID: r.BookID, Text: r.Text, Rating: r.Rating}
	if err := h.svc.CreateReviewFromModel(rev); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, rev)
}

// AddBookToShelf API: POST /api/shelves/:id/books
func (h *Handler) AddBookToShelf(c *gin.Context) {
	sid, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid shelf id"})
		return
	}
	var req struct {
		BookID int `json:"book_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.AddBookToShelf(sid, req.BookID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"shelf_id": sid, "book_id": req.BookID})
}

// ShelfPage UI: show shelf and its books
func (h *Handler) ShelfPage(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, "invalid shelf id")
		return
	}
	shelf, err := h.svc.GetShelf(id)
	if err != nil {
		c.String(http.StatusNotFound, "shelf not found")
		return
	}
	books, err := h.svc.ListBooksByShelf(id)
	if err != nil {
		books = []service.BookModel{}
	}
	allBooks, err := h.svc.ListBooks()
	if err != nil {
		allBooks = []service.BookModel{}
	}
	c.HTML(http.StatusOK, "shelf_detail.html", gin.H{"shelf": shelf, "books": books, "allBooks": allBooks})
}

// Me returns current authenticated user (API)
func (h *Handler) Me(c *gin.Context) {
	uidVal, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	uid, ok := uidVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user id"})
		return
	}
	u, err := h.svc.GetUserByID(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, u)
}

// ProfilePage UI
func (h *Handler) ProfilePage(c *gin.Context) {
	c.HTML(http.StatusOK, "profile.html", nil)
}

// Auth middleware using real JWT
func (h *Handler) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokh := c.GetHeader("Authorization")
		if tokh == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		var tok string
		_, err := fmt.Sscanf(tokh, "Bearer %s", &tok)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		claims, err := auth.ParseToken(tok)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// RequireRole middleware checks user role
func (h *Handler) RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		r, ok := c.Get("role")
		if !ok || r.(string) != role {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		c.Next()
	}
}

func envOrDefault(k, def string) string {
	v := os.Getenv(k)
	if v == "" {
		return def
	}
	return v
}

func (h *Handler) ExportBooksJSON(c *gin.Context) {
	data, err := h.svc.ExportBooksJSON()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Header("Content-Disposition", "attachment; filename=books.json")
	c.Data(http.StatusOK, "application/json", data)
}

func (h *Handler) ExportBooksCSV(c *gin.Context) {
	data, err := h.svc.ExportBooksCSV()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Header("Content-Disposition", "attachment; filename=books.csv")
	c.Data(http.StatusOK, "text/csv", data)
}

func (h *Handler) ImportBooksJSON(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}
	f, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer f.Close()
	content, err := io.ReadAll(f)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := h.svc.ImportBooksJSON(content); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "imported successfully"})
}

func (h *Handler) ImportBooksCSV(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}
	f, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer f.Close()
	content, err := io.ReadAll(f)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := h.svc.ImportBooksCSV(content); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "imported successfully"})
}
