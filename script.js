Promise.all([
    fetch('data.json').then(response => response.json()),  // Для предисловия и алфавита
    fetch('dictionary.json').then(response => response.json()) // Для терминов
])
.then(([data, terms]) => {
    const buttonsContainer = document.getElementById('buttonsContainer');
    const alphabetFilter = document.getElementById('alphabetFilter');
    const searchInput = document.getElementById('searchInput');
    const resetFilterButton = document.getElementById('resetFilterButton');
    const termCount = Object.keys(terms).length;
    const topTermsContainer = document.getElementById('topTerms');
    const topTerms = Object.keys(terms).slice(0, 4);

// Создаем кнопки для блока "Топ"
topTerms.forEach(term => {
    const button = document.createElement('button');
    button.textContent = term; // Название термина
    button.classList.add('term');
    button.setAttribute('data-key', term);

    // Добавляем обработчик события, чтобы открывалось окно с определением
    button.addEventListener('click', function () {
        const definition = terms[term]; // Получаем определение
        showModal(definition); // Показываем модальное окно
    });

    topTermsContainer.appendChild(button);
});


    // Функция для отображения терминов
    function displayTerms(filteredTerms) {
        buttonsContainer.innerHTML = '';  // Очистка контейнера

        // Если нет результатов
        if (filteredTerms.length === 0) {
            buttonsContainer.innerHTML = '<p>Нет результатов</p>';
            document.getElementById('visibleCount').textContent = '0';
            return;
        }

        const isMobile = window.innerWidth <= 768;
        const columnCount = isMobile ? 1 : 4;

        // Проверяем, есть ли выбранный фильтр
        const isFilterActive = alphabetFilter.querySelector('button.active') || searchInput.value;

        if (isFilterActive) {
            filteredTerms.sort();  // Сортируем термины в алфавитном порядке

            // Разбиваем термины на 4 колонки
            const chunkSize = Math.ceil(filteredTerms.length / columnCount);

            const columnsContainer = document.createElement('div');
            columnsContainer.classList.add('termColumns');

            for (let i = 0; i < columnCount; i++) {
                const column = document.createElement('div');
                column.classList.add('termColumn');

                const start = i * chunkSize;
                const end = (i + 1) * chunkSize;
                const columnTerms = filteredTerms.slice(start, end);

                columnTerms.forEach(term => {
                    const button = document.createElement('button');
                    button.textContent = term;  // Название кнопки — это термин
                    button.classList.add('term');
                    button.setAttribute('data-key', term);

                    // Устанавливаем padding для кнопок
                    button.style.padding = '10px';

                    // Добавляем обработчик для каждой кнопки
                    button.addEventListener('click', function() {
                        const definition = terms[term];  // Получаем определение для кнопки
                        showModal(definition);
                    });

                    column.appendChild(button);
                });

                columnsContainer.appendChild(column);
            }

            buttonsContainer.appendChild(columnsContainer);
        } else {
            // Если фильтр не выбран, показываем все термины, разделенные по первой букве
            const groupedTerms = {};

            // Группируем термины по первой букве
            Object.keys(terms).forEach(term => {
                const firstLetter = term.charAt(0).toUpperCase();
                if (!groupedTerms[firstLetter]) {
                    groupedTerms[firstLetter] = [];
                }
                groupedTerms[firstLetter].push(term);
            });

            // Сортируем буквы
            const alphabet = Object.keys(groupedTerms).sort();
            alphabet.forEach(letter => {
                const groupContainer = document.createElement('div');
                groupContainer.classList.add('termGroup');

                const header = document.createElement('h3');
                header.innerHTML = `<span class="letter-divider">${letter}</span>`;
                groupContainer.appendChild(header);

                const columnsContainer = document.createElement('div');
                columnsContainer.classList.add('termColumns');

                const group = groupedTerms[letter].sort();  // Сортируем термины внутри группы
                const chunkSize = Math.ceil(group.length / 4); // Разделим на 4 колонки
                for (let i = 0; i < 4; i++) {
                    const column = document.createElement('div');
                    column.classList.add('termColumn');

                    const start = i * chunkSize;
                    const end = (i + 1) * chunkSize;
                    const columnTerms = group.slice(start, end);

                    columnTerms.forEach(term => {
                        const button = document.createElement('button');
                        button.textContent = term;  // Название кнопки — это термин
                        button.classList.add('term');
                        button.setAttribute('data-key', term);

                        // Устанавливаем padding для кнопок
                        button.style.padding = '10px';

                        // Добавляем обработчик для каждой кнопки
                        button.addEventListener('click', function() {
                            const definition = terms[term];  // Получаем определение для кнопки
                            showModal(definition);
                        });

                        column.appendChild(button);
                    });

                    columnsContainer.appendChild(column);
                }

                groupContainer.appendChild(columnsContainer);
                buttonsContainer.appendChild(groupContainer);
            });
        }

        document.getElementById('visibleCount').textContent = filteredTerms.length;
    }

    // Предисловие
    document.getElementById('introTitle').textContent = data.intro.title;
    document.getElementById('introContent').textContent = data.intro.content;
    document.getElementById('categoryTitle').textContent = data.categoryInfo.title;

    // Фильтр по алфавиту
    data.alphabet.forEach(letter => {
        const button = document.createElement('button');
        button.classList.add('filter-button');
        button.setAttribute('data-letter', letter);
        button.textContent = letter;

        // Обработчик для кнопки фильтра
        button.addEventListener('click', function() {
            // Убираем подсветку с предыдущей активной кнопки
            const activeButton = alphabetFilter.querySelector('button.active');
            if (activeButton) {
                activeButton.classList.remove('active');
            }
            // Подсвечиваем выбранную букву
            button.classList.add('active');
            const filteredTerms = Object.keys(terms).filter(term => term.startsWith(button.textContent));
            displayTerms(filteredTerms);
            updateColumnWidth(filteredTerms);
        });

        alphabetFilter.appendChild(button);
    });

    // Поиск по строке
    searchInput.addEventListener('input', function() {
        const searchQuery = searchInput.value.toLowerCase();
        const filteredTerms = Object.keys(terms).filter(term => term.toLowerCase().includes(searchQuery));
        displayTerms(filteredTerms);
        updateColumnWidth(filteredTerms);
    });

    // Кнопка сброса фильтра
    resetFilterButton.addEventListener('click', function() {
        // Сброс фильтров
        alphabetFilter.querySelectorAll('button').forEach(button => button.classList.remove('active'));
        searchInput.value = '';
        displayTerms(Object.keys(terms));  // Отображаем все термины
    });

    // Отображаем все термины при загрузке
    displayTerms(Object.keys(terms));



})
.catch(error => console.error('Ошибка загрузки файлов:', error));

// Модальное окно
const modal = document.getElementById('definitionModal');
const definitionText = document.getElementById('definitionText');

function showModal(definition) {
    const trimmedDefinition = definition.slice(0, -1);
    definitionText.textContent = trimmedDefinition;
    modal.classList.add('show');  // Окно плавно появляется
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.classList.remove('show');  // Убираем класс для плавного исчезновения
    }
};


// Получаем кнопку "Наверх"
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

// Функция для проверки положения прокрутки
function toggleScrollToTopButton() {
    if (window.scrollY > 300) { // Показываем кнопку после прокрутки на 300px
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
}

// Прокрутка страницы вверх при клике на кнопку
scrollToTopBtn.onclick = function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Плавная прокрутка
    });
};

// Следим за прокруткой страницы
window.addEventListener('scroll', toggleScrollToTopButton);

window.addEventListener('resize', () => {
    const currentTerms = Array.from(document.querySelectorAll('.term')).map(btn => btn.textContent);
    updateColumnWidth(currentTerms);
});

function updateColumnWidth(filteredTerms) {
    const termColumns = document.querySelectorAll('.termColumn');
    
    if (filteredTerms.length < 10) {
        termColumns.forEach(column => {
            column.style.width = '100%';
            column.style.alignItems = 'center';  // Центрируем по горизонтали
            column.style.justifyContent = 'center';  // Центрируем по вертикали (если нужно)
        });
    } else {
        termColumns.forEach(column => {
            column.style.width = '20%';
            column.style.alignItems = 'flex-start';  // Возвращаем выравнивание по левому краю
            column.style.justifyContent = 'flex-start';
        });
    }
}

const modalOverlay = document.getElementById('modalOverlay');

window.addEventListener('scroll', function() {
    const blurOverlay = document.getElementById('blurOverlay');
    const scrollY = window.scrollY;

    if (scrollY > 50) { // Начинаем эффект после прокрутки на 50px
        blurOverlay.style.opacity = Math.min((scrollY - 50) / 50, 1); // Плавное увеличение прозрачности
    } else {
        blurOverlay.style.opacity = 0; // Скрываем эффект, если прокрутка меньше 50px
    }
});

// кнопка разработчики
document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('button[formaction="founders.html"]');
    if (button) {
      button.addEventListener('click', function(e) {
        e.preventDefault(); // Отменяем стандартное поведение
        window.location.href = 'founders.html'; // Перенаправляем
      });
    }
  });

// кнопка терминофф
document.addEventListener('DOMContentLoaded', function() {
    // Выбираем ВСЕ кнопки с нужным атрибутом
    const buttons = document.querySelectorAll('button[formaction="index.html"]');
    
    // Добавляем обработчик для каждой кнопки
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    });
});


// темная тема
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Проверяем сохранённую тему
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Обработчик клика - только переключает тему
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
});

// темная тема
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle2');
    
    // Проверяем сохранённую тему
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Обработчик клика - только переключает тему
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
});

function updateColumnWidth(filteredTerms) {
    const termColumns = document.querySelectorAll('.termColumn');
    const isMobile = window.innerWidth <= 768;

    termColumns.forEach(column => {
        if (isMobile) {
            column.style.width = '100%';
            column.style.alignItems = 'center';
            column.style.justifyContent = 'center';
        } else if (filteredTerms.length < 10) {
            column.style.width = '100%';
            column.style.alignItems = 'center';
            column.style.justifyContent = 'center';
        } else {
            column.style.width = '20%';
            column.style.alignItems = 'flex-start';
            column.style.justifyContent = 'flex-start';
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const burgerBtn = document.getElementById('burgerBtn');
    const burgerMenu = document.getElementById('burgerMenu');
    const goHome = document.getElementById('goHome');
    const goFounders = document.getElementById('goFounders');
    const toggleTheme = document.getElementById('toggleTheme');

    burgerBtn.addEventListener('click', function () {
        burgerBtn.classList.toggle('active'); // Для анимации линий
        burgerMenu.classList.toggle('show');  // Плавное открытие меню
    });

    goHome.addEventListener('click', function () {
        window.location.href = 'index.html';
    });

    goFounders.addEventListener('click', function () {
        window.location.href = 'founders.html';
    });

    toggleTheme.addEventListener('click', function () {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    // Закрытие меню при клике вне его
    window.addEventListener('click', function (e) {
        if (!burgerBtn.contains(e.target) && !burgerMenu.contains(e.target)) {
            burgerMenu.classList.remove('show');
            burgerBtn.classList.remove('active');  // Убираем анимацию линий
        }
    });
});

// Отключаем Enter в мобильной версии
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    
    // Проверяем мобильное устройство
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Обработчик нажатия клавиш
    searchInput.addEventListener('keydown', function(e) {
        if (isMobile() && e.key === 'Enter') {
            e.preventDefault(); // Блокируем стандартное действие
            // Дополнительно: скрываем клавиатуру после нажатия
            this.blur(); 
        }
    });
    
    // На случай изменения ориентации экрана
    window.addEventListener('resize', function() {
        if (isMobile()) {
            searchInput.removeEventListener('keydown', handleEnter);
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const titleBlock = document.querySelector('.title');
    const contentBlock = document.querySelector('.content');
    
    function handleSearch() {
        const isMobile = window.innerWidth <= 768;
        const hasText = searchInput.value.trim().length > 0;
        
        if (isMobile && hasText) {
            titleBlock.classList.add('hidden');
            contentBlock.style.marginTop = '-10px';
        } else {
            titleBlock.classList.remove('hidden');
            contentBlock.style.marginTop = '';
        }
    }

    searchInput.addEventListener('input', handleSearch);
    window.addEventListener('resize', handleSearch);
    handleSearch();
});