let userId = null;
let userRole = null;

let listsPage = 1;
let listsPages = 1;
let reviewsPage = 1;
let reviewsPages = 1;
let ratingsPage = 1;
let ratingsPages = 1;

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

async function apiRequest(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return null;
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
        alert(`Error: ${error.message}`);
        return null;
    }
}

async function loadLists(page = 1) {
    const data = await apiRequest(`/lists?page=${page}&per_page=5`);
    if (data) {
        renderLists(data.items);
        listsPage = page;
        listsPages = data.pages;
        document.getElementById('lists-page-info').textContent = `Страница ${page} из ${data.pages}`;
        document.getElementById('lists-prev-page').disabled = page === 1;
        document.getElementById('lists-next-page').disabled = page === data.pages || data.pages === 0;
    }
}

function renderLists(items) {
    const list = document.getElementById('user-lists');
    list.innerHTML = '';
    if (items.length === 0) {
        list.innerHTML = '<li>Ваши списки пусты</li>';
        return;
    }
    items.forEach(item => {
        const li = document.createElement('li');
        const statusText = {
            'watching': '📺 Смотрю',
            'planned': '📋 Буду смотреть',
            'completed': '✅ Просмотрено',
            'dropped': '❌ Брошено'
        }[item.status] || item.status;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => deleteListItem(item.id);
        li.innerHTML = `<strong>${item.title_name}</strong><br><span>${statusText}</span>`;
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

async function loadReviews(page = 1) {
    const data = await apiRequest(`/reviews?user_id=${userId}&page=${page}&per_page=5`);
    if (data) {
        renderReviews(data.items);
        reviewsPage = page;
        reviewsPages = data.pages;
        document.getElementById('reviews-page-info').textContent = `Страница ${page} из ${data.pages}`;
        document.getElementById('reviews-prev-page').disabled = page === 1;
        document.getElementById('reviews-next-page').disabled = page === data.pages || data.pages === 0;
    }
}

function renderReviews(items) {
    const list = document.getElementById('user-reviews');
    list.innerHTML = '';
    if (items.length === 0) {
        list.innerHTML = '<li>Ваши отзывы отсутствуют</li>';
        return;
    }
    items.forEach(item => {
        const li = document.createElement('li');
        const date = new Date(item.created_at).toLocaleDateString('ru-RU');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => deleteReviewItem(item.id);
        li.innerHTML = `<strong>${item.title_name}</strong><br><p>${item.text}</p><small>${date}</small>`;
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

async function loadRatings(page = 1) {
    const data = await apiRequest(`/ratings?user_id=${userId}&page=${page}&per_page=5`);
    if (data) {
        renderRatings(data.items);
        ratingsPage = page;
        ratingsPages = data.pages;
        document.getElementById('ratings-page-info').textContent = `Страница ${page} из ${data.pages}`;
        document.getElementById('ratings-prev-page').disabled = page === 1;
        document.getElementById('ratings-next-page').disabled = page === data.pages || data.pages === 0;
    }
}

function renderRatings(items) {
    const list = document.getElementById('user-ratings');
    list.innerHTML = '';
    if (items.length === 0) {
        list.innerHTML = '<li>Вы еще не оценили ничего</li>';
        return;
    }
    items.forEach(item => {
        const li = document.createElement('li');
        const stars = '⭐'.repeat(item.score) + '☆'.repeat(10 - item.score);
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => deleteRatingItem(item.id);
        li.innerHTML = `<strong>${item.title_name}</strong><br><span>${stars} ${item.score}/10</span>`;
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

async function deleteListItem(listId) {
    if (!confirm('Вы уверены, что хотите удалить этот элемент из списка?')) {
        return;
    }
    const data = await apiRequest(`/lists/${listId}`, 'DELETE');
    if (data) {
        await loadLists(listsPage);
    }
}

async function deleteReviewItem(reviewId) {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) {
        return;
    }
    const data = await apiRequest(`/reviews/${reviewId}`, 'DELETE');
    if (data) {
        await loadReviews(reviewsPage);
    }
}

async function deleteRatingItem(ratingId) {
    if (!confirm('Вы уверены, что хотите удалить эту оценку?')) {
        return;
    }
    const data = await apiRequest(`/ratings/${ratingId}`, 'DELETE');
    if (data) {
        await loadRatings(ratingsPage);
    }
}

async function loadProfile() {
    listsPage = 1;
    reviewsPage = 1;
    ratingsPage = 1;
    await loadLists(1);
    await loadReviews(1);
    await loadRatings(1);
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

document.getElementById('home-btn').onclick = () => {
    window.location.href = '/';
};

document.getElementById('logout-btn').onclick = logout;

document.getElementById('lists-prev-page').onclick = () => {
    if (listsPage > 1) loadLists(listsPage - 1);
};
document.getElementById('lists-next-page').onclick = () => {
    if (listsPage < listsPages) loadLists(listsPage + 1);
};

document.getElementById('reviews-prev-page').onclick = () => {
    if (reviewsPage > 1) loadReviews(reviewsPage - 1);
};
document.getElementById('reviews-next-page').onclick = () => {
    if (reviewsPage < reviewsPages) loadReviews(reviewsPage + 1);
};

document.getElementById('ratings-prev-page').onclick = () => {
    if (ratingsPage > 1) loadRatings(ratingsPage - 1);
};
document.getElementById('ratings-next-page').onclick = () => {
    if (ratingsPage < ratingsPages) loadRatings(ratingsPage + 1);
};

window.addEventListener('load', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
    } else {
        const decoded = decodeToken(token);
        if (decoded) {
            userId = decoded.sub;
            userRole = decoded.role;
            loadProfile();
        } else {
            window.location.href = '/';
        }
    }
});
