// static/main.js
// Глобальные переменные
let currentPage = 1;
let totalPages = 1;
let currentTitleId = null;
let userRole = null;
let userId = null;



// Декодирование JWT токена
function decodeToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
}

// Функции для работы с API
async function apiRequest(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    try {
        const response = await fetch(endpoint, options);
        const responseData = await response.json();
        if (!response.ok) {
            const errorMsg = responseData.message || responseData.error || `Error: ${response.status}`;
            throw new Error(errorMsg);
        }
        return responseData;
    } catch (error) {
        console.error('API Error:', error);
        showMessage('auth-message', error.message, true);
    }
}

// Отображение сообщений
function showMessage(elementId, message, isError = false) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.style.color = isError ? 'red' : 'green';
}

// Аутентификация
async function handleAuth(isLogin = true) {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const endpoint = isLogin ? '/login' : '/register';
    const data = { username, password };

    const response = await apiRequest(endpoint, 'POST', data);
    if (response && response.token) {
        localStorage.setItem('token', response.token);
        showAuthState(true);
        loadTitles();
    } else if (response) {
        showMessage('auth-message', response.message || 'Успех');
    }
}

// Выход
function logout() {
    localStorage.removeItem('token');
    showAuthState(false);
}

// Показать/скрыть элементы по авторизации
function showAuthState(isLoggedIn) {
    document.getElementById('login-btn').style.display = isLoggedIn ? 'none' : 'inline';
    document.getElementById('register-btn').style.display = isLoggedIn ? 'none' : 'inline';
    document.getElementById('logout-btn').style.display = isLoggedIn ? 'inline' : 'none';
    document.getElementById('profile-btn').style.display = isLoggedIn ? 'inline' : 'none';
    document.getElementById('auth-section').style.display = isLoggedIn ? 'none' : 'block';
    document.getElementById('search-section').style.display = isLoggedIn ? 'block' : 'none';
    document.getElementById('titles-section').style.display = isLoggedIn ? 'block' : 'none';

    if (isLoggedIn) {
        const token = localStorage.getItem('token');
        const decoded = decodeToken(token);
        userRole = decoded ? decoded.role : null;
        userId = decoded ? decoded.sub : null;
        const isAdmin = userRole === 'admin';
        document.getElementById('admin-section').style.display = isAdmin ? 'block' : 'none';
    } else {
        document.getElementById('admin-section').style.display = 'none';
        userRole = null;
        userId = null;
    }
}

// Загрузка тайтлов
async function loadTitles(page = 1) {
    const name = document.getElementById('search-name').value;
    const genre = document.getElementById('filter-genre').value;
    const year = document.getElementById('filter-year').value;
    const status = document.getElementById('filter-status').value;
    let query = `/titles?page=${page}&per_page=10`;
    if (name) query += `&name=${name}`;
    if (genre) query += `&genre=${genre}`;
    if (year) query += `&year=${year}`;
    if (status) query += `&status=${status}`;

    const data = await apiRequest(query);
    if (data) {
        renderTitles(data.items);
        currentPage = page;
        totalPages = data.pages;
        document.getElementById('page-info').textContent = `Страница ${page} из ${data.pages}`;
    }
}

function renderTitles(titles) {
    const list = document.getElementById('titles-list');
    list.innerHTML = '';
    titles.forEach(title => {
        const li = document.createElement('li');
        li.textContent = `${title.name} (${title.year}) - ${title.genre}`;
        li.onclick = () => openModal(title);
        list.appendChild(li);
    });
}

// Модальное окно
function openModal(title) {
    currentTitleId = title.id;
    document.getElementById('modal-title').textContent = title.name;
    document.getElementById('modal-details').textContent = `Тип: ${title.type}, Год: ${title.year}, Жанр: ${title.genre}`;
    document.getElementById('modal').style.display = 'block';
}

document.querySelector('.close').onclick = () => {
    document.getElementById('modal').style.display = 'none';
};

// Добавление в список
document.getElementById('add-to-list').onclick = async () => {
    const status = document.getElementById('add-status').value;
    if (status && currentTitleId) {
        await apiRequest('/lists', 'POST', { title_id: currentTitleId, status });
        showMessage('modal-details', 'Добавлено в список!', false);
    }
};

// Добавление рейтинга
document.getElementById('submit-rating').onclick = async () => {
    const score = document.getElementById('add-rating').value;
    if (score && currentTitleId) {
        await apiRequest('/ratings', 'POST', { title_id: currentTitleId, score: parseInt(score) });
        showMessage('modal-details', 'Рейтинг добавлен!', false);
    }
};

// Добавление отзыва
document.getElementById('submit-review').onclick = async () => {
    const text = document.getElementById('add-review').value;
    if (text && currentTitleId) {
        await apiRequest('/reviews', 'POST', { title_id: currentTitleId, text });
        showMessage('modal-details', 'Отзыв отправлен!', false);
    }
};



// События
document.getElementById('auth-form').onsubmit = (e) => {
    e.preventDefault();
    handleAuth(true); // Логин по умолчанию
};

document.getElementById('register-btn').onclick = () => handleAuth(false);
document.getElementById('login-btn').onclick = () => handleAuth(true);
document.getElementById('logout-btn').onclick = logout;
document.getElementById('search-btn').onclick = () => loadTitles(1);
document.getElementById('prev-page').onclick = () => {
    if (currentPage > 1) loadTitles(currentPage - 1);
};
document.getElementById('next-page').onclick = () => {
    if (currentPage < totalPages) loadTitles(currentPage + 1);
};
document.getElementById('goto-page-btn').onclick = () => {
    const pageInput = document.getElementById('goto-page');
    const page = parseInt(pageInput.value);
    if (page && page >= 1 && page <= totalPages) {
        loadTitles(page);
        pageInput.value = '';
    } else {
        showMessage('page-info', `Пожалуйста, введите страницу от 1 до ${totalPages}`, true);
    }
};
document.getElementById('profile-btn').onclick = () => {
    window.location.href = '/profile';
};

// Загрузка фильмов из TMDB
document.getElementById('load-movies-btn').onclick = async () => {
    const btn = document.getElementById('load-movies-btn');
    const msgEl = document.getElementById('admin-message');
    const pageInput = document.getElementById('movies-page');
    const limitInput = document.getElementById('movies-limit');
    const page = parseInt(pageInput.value) || 1;
    const limit = parseInt(limitInput.value) || 20;
    
    btn.disabled = true;
    btn.textContent = 'Загружаю...';
    
    try {
        const response = await apiRequest('/admin/load_movies', 'POST', { 
            page: page,
            limit: limit,
            dry_run: false
        });
        
        if (response && response.inserted !== undefined) {
            showMessage('admin-message', `Загружено ${response.inserted} фильмов!`);
            loadTitles();
        } else if (response) {
            showMessage('admin-message', response.message || 'Фильмы загружены');
        }
    } catch (error) {
        console.error('Load movies error:', error);
    }
    
    btn.disabled = false;
    btn.textContent = 'Загрузить фильмы из TMDB';
};

// Инициализация
if (localStorage.getItem('token')) {
    showAuthState(true);
    loadTitles();
}