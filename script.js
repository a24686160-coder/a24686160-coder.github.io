/**
 * CodeNature — Основной скрипт
 * Архитектурный паттерн: Модульный с делегированием событий
 * Принципы: Single Responsibility, Event Delegation, Pure Functions
 */

'use strict';

// ============================================
// Константы и конфигурация
// ============================================

const CONFIG = {
    selectors: {
        nav: '#mainNav',
        themeToggle: '#themeToggle',
        mobileMenuBtn: '#mobileMenuBtn',
        mobileMenu: '#mobileMenu',
        navLinks: '.nav-link',
        natureBackground: '#natureBackground',
        particlesContainer: '#particlesContainer',
        languagesGrid: '#languagesGrid',
        langModal: '#langModal',
        modalBody: '#modalBody',
        modalClose: '#modalClose',
        codeEditor: '#codeEditor',
        btnRunCode: '#btnRunCode',
        outputContent: '#outputContent',
        filterBtns: '.filter-btn',
        faqItems: '.faq-question',
        statNumbers: '.stat-number',
        codeOrb: '#codeOrb',
        animateElements: '.roadmap-node, .structure-card, .tip-card, .language-card',
    },
    particles: {
        count: 30,
        minSize: 2,
        maxSize: 6,
        minDuration: 8,
        maxDuration: 16,
    },
    scroll: {
        throttleMs: 16,
    },
    storage: {
        themeKey: 'codenature-theme',
    },
};

// ============================================
// Утилитарные функции (Pure Functions)
// ============================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const createElement = (tag, attributes = {}, ...children) => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') element.className = value;
        else if (key === 'dataset') Object.entries(value).forEach(([k, v]) => element.dataset[k] = v);
        else if (key.startsWith('on')) element.addEventListener(key.slice(2).toLowerCase(), value);
        else element.setAttribute(key, value);
    });
    children.forEach(child => {
        if (typeof child === 'string') element.appendChild(document.createTextNode(child));
        else if (child instanceof Node) element.appendChild(child);
    });
    return element;
};

const throttle = (fn, delay) => {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        }
    };
};

const getRandomInRange = (min, max) => Math.random() * (max - min) + min;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// ============================================
// Управление темами
// ============================================

const ThemeManager = {
    init() {
        this.themeToggle = $(CONFIG.selectors.themeToggle);
        this.themeIcon = this.themeToggle.querySelector('.theme-icon');
        this.loadSavedTheme();
        this.bindEvents();
    },

    loadSavedTheme() {
        const saved = localStorage.getItem(CONFIG.storage.themeKey);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved || (prefersDark ? 'dark' : 'forest');
        this.setTheme(theme);
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem(CONFIG.storage.themeKey, theme);
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        this.setTheme(current === 'dark' ? 'forest' : 'dark');
    },

    bindEvents() {
        this.themeToggle.addEventListener('click', () => this.toggle());
    },
};

// ============================================
// Навигация
// ============================================

const Navigation = {
    init() {
        this.nav = $(CONFIG.selectors.nav);
        this.mobileMenuBtn = $(CONFIG.selectors.mobileMenuBtn);
        this.mobileMenu = $(CONFIG.selectors.mobileMenu);
        this.navLinks = $$(CONFIG.selectors.navLinks);
        this.progressBar = this.nav.querySelector('.nav-progress-bar');
        this.bindEvents();
    },

    bindEvents() {
        window.addEventListener('scroll', throttle(() => this.onScroll(), CONFIG.scroll.throttleMs), { passive: true });
        this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        this.mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });
        document.addEventListener('click', (e) => {
            if (!this.mobileMenu.contains(e.target) && !this.mobileMenuBtn.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        this.highlightActiveSection();
    },

    onScroll() {
        const scrollY = window.scrollY;
        // Обновление класса навигации
        this.nav.classList.toggle('scrolled', scrollY > 50);

        // Обновление прогресс-бара
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
        this.progressBar.style.width = `${clamp(progress, 0, 100)}%`;

        this.highlightActiveSection();
    },

    highlightActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[data-section="${id}"]`);

            if (link && scrollY >= top && scrollY < top + height) {
                this.navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    },

    toggleMobileMenu() {
        this.mobileMenuBtn.classList.toggle('active');
        this.mobileMenu.classList.toggle('active');
        document.body.style.overflow = this.mobileMenu.classList.contains('active') ? 'hidden' : '';
    },

    closeMobileMenu() {
        this.mobileMenuBtn.classList.remove('active');
        this.mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    },
};

// ============================================
// Природные партиклы
// ============================================

const ParticleSystem = {
    init() {
        this.container = $(CONFIG.selectors.particlesContainer);
        this.createParticles();
    },

    createParticle() {
        const particle = createElement('div', { className: 'particle' });
        const size = getRandomInRange(CONFIG.particles.minSize, CONFIG.particles.maxSize);
        const left = Math.random() * 100;
        const duration = getRandomInRange(CONFIG.particles.minDuration, CONFIG.particles.maxDuration);
        const delay = Math.random() * 5;

        Object.assign(particle.style, {
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            bottom: '-10px',
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
        });

        return particle;
    },

    createParticles() {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < CONFIG.particles.count; i++) {
            fragment.appendChild(this.createParticle());
        }
        this.container.appendChild(fragment);

        // Пересоздаём частицы для бесконечной анимации
        setInterval(() => {
            const particles = this.container.querySelectorAll('.particle');
            if (particles.length < CONFIG.particles.count + 10) {
                this.container.appendChild(this.createParticle());
            }
            // Удаляем старые
            particles.forEach(p => {
                if (p.getBoundingClientRect().top < -100) {
                    p.remove();
                }
            });
        }, 3000);
    },
};

// ============================================
// Параллакс-эффект
// ============================================

const Parallax = {
    init() {
        this.layers = $$('.parallax-layer');
        this.bindEvents();
    },

    bindEvents() {
        window.addEventListener('scroll', throttle(() => this.update(), CONFIG.scroll.throttleMs), { passive: true });
        document.addEventListener('mousemove', throttle((e) => this.onMouseMove(e), 50), { passive: true });
    },

    update() {
        const scrollY = window.scrollY;
        this.layers.forEach((layer, index) => {
            const speed = (index + 1) * 0.15;
            layer.style.transform = `translateY(${scrollY * speed}px)`;
        });
    },

    onMouseMove(e) {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        const orb = $(CONFIG.selectors.codeOrb);
        if (orb) {
            orb.style.transform = `translate(${x}px, ${y}px)`;
        }
    },
};

// ============================================
// Счётчики статистики
// ============================================

const CounterAnimation = {
    init() {
        this.counters = $$(CONFIG.selectors.statNumbers);
        this.animated = new Set();
        this.bindEvents();
    },

    bindEvents() {
        window.addEventListener('scroll', throttle(() => this.checkVisibility(), 100), { passive: true });
        this.checkVisibility(); // Проверка при загрузке
    },

    checkVisibility() {
        this.counters.forEach(counter => {
            if (this.animated.has(counter)) return;
            const rect = counter.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                this.animateCounter(counter);
                this.animated.add(counter);
            }
        });
    },

    animateCounter(counter) {
        const target = parseInt(counter.dataset.count, 10);
        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out функция
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);
            counter.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                counter.textContent = target;
            }
        };

        requestAnimationFrame(animate);
    },
};

// ============================================
// Фильтрация языков
// ============================================

const LanguageFilter = {
    init() {
        this.filterBtns = $$(CONFIG.selectors.filterBtns);
        this.cards = $$(CONFIG.selectors.languagesGrid + ' .language-card');
        this.bindEvents();
    },

    bindEvents() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.filter(btn));
        });
    },

    filter(activeBtn) {
        const category = activeBtn.dataset.filter;

        // Обновление активной кнопки
        this.filterBtns.forEach(b => b.classList.remove('active'));
        activeBtn.classList.add('active');

        // Фильтрация карточек с анимацией
        this.cards.forEach(card => {
            const cardCategory = card.dataset.category;
            if (category === 'all' || cardCategory === category) {
                card.style.display = '';
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    },
};

// ============================================
// Модальное окно с информацией о языке
// ============================================

const LanguageModal = {
    // Данные о языках (в production — отдельный JSON)
    languageData: {
        javascript: {
            title: 'JavaScript',
            icon: 'JS',
            description: 'Самый популярный язык программирования в мире. Основа веб-разработки.',
            pros: ['Работает в браузере без установки', 'Огромное сообщество', 'Full-stack разработка (Node.js)', 'Мгновенный результат'],
            cons: ['Динамическая типизация', 'Много странных особенностей', 'Сложная асинхронность для новичков'],
            roadmap: ['Основы синтаксиса →', 'DOM и события →', 'Асинхронность (Promises, async/await) →', 'Node.js и npm →', 'React/Vue/Angular →', 'TypeScript'],
            jobs: 'Junior JavaScript Developer: 70-90к ₽',
        },
        python: {
            title: 'Python',
            icon: 'Py',
            description: 'Универсальный язык с простым синтаксисом. Идеален для начинающих.',
            pros: ['Читаемый синтаксис', 'Мощные библиотеки', 'Data Science и AI', 'Быстрое прототипирование'],
            cons: ['Медленнее компилируемых языков', 'GIL ограничивает многопоточность', 'Не лучший выбор для мобильной разработки'],
            roadmap: ['Основы и типы данных →', 'Функции и модули →', 'ООП в Python →', 'Библиотеки (numpy, pandas) →', 'Веб (Django/FastAPI) →', 'Специализация'],
            jobs: 'Junior Python Developer: 80-100к ₽',
        },
    },

    init() {
        this.modal = $(CONFIG.selectors.langModal);
        this.modalBody = $(CONFIG.selectors.modalBody);
        this.modalClose = $(CONFIG.selectors.modalClose);
        this.bindEvents();
    },

    bindEvents() {
        // Делегирование событий для кнопок
        document.addEventListener('click', (e) => {
            const infoBtn = e.target.closest('.btn-info');
            const learnBtn = e.target.closest('.btn-learn');

            if (infoBtn) {
                const lang = infoBtn.dataset.lang;
                this.open(lang);
            }

            if (learnBtn) {
                const lang = learnBtn.dataset.lang;
                this.scrollToPractice();
            }
        });

        this.modalClose.addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    },

    open(lang) {
        const data = this.languageData[lang];
        if (!data) {
            this.showGenericInfo(lang);
            return;
        }

        const html = `
            <div class="modal-lang-header">
                <div class="lang-icon large">${data.icon}</div>
                <h2>${data.title}</h2>
            </div>
            <p class="modal-description">${data.description}</p>
            <div class="modal-columns">
                <div class="modal-column">
                    <h3>✅ Преимущества</h3>
                    <ul>${data.pros.map(p => `<li>${p}</li>`).join('')}</ul>
                </div>
                <div class="modal-column">
                    <h3>⚠️ Недостатки</h3>
                    <ul>${data.cons.map(c => `<li>${c}</li>`).join('')}</ul>
                </div>
            </div>
            <div class="modal-roadmap">
                <h3>🗺️ Путь изучения</h3>
                <p>${data.roadmap.join(' ')}</p>
            </div>
            <div class="modal-jobs">
                <strong>💰 ${data.jobs}</strong>
            </div>
        `;

        this.modalBody.innerHTML = html;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    showGenericInfo(lang) {
        this.modalBody.innerHTML = `
            <h2>${lang.toUpperCase()}</h2>
            <p>Подробная информация скоро появится. А пока изучите основы на практике!</p>
            <button class="btn-primary" onclick="document.querySelector('#practice').scrollIntoView({behavior:'smooth'})">Перейти к практике</button>
        `;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    },

    scrollToPractice() {
        this.close();
        document.querySelector('#practice').scrollIntoView({ behavior: 'smooth' });
    },
};

// ============================================
// Интерактивный редактор кода
// ============================================

const CodePlayground = {
    init() {
        this.editor = $(CONFIG.selectors.codeEditor);
        this.runBtn = $(CONFIG.selectors.btnRunCode);
        this.output = $(CONFIG.selectors.outputContent);
        this.bindEvents();
    },

    bindEvents() {
        this.runBtn.addEventListener('click', () => this.executeCode());
        this.editor.addEventListener('keydown', (e) => {
            // Tab для отступа
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.editor.selectionStart;
                const end = this.editor.selectionEnd;
                this.editor.value = this.editor.value.substring(0, start) + '    ' + this.editor.value.substring(end);
                this.editor.selectionStart = this.editor.selectionEnd = start + 4;
            }
            // Ctrl/Cmd + Enter для запуска
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.executeCode();
            }
        });
    },

    executeCode() {
        const code = this.editor.value.trim();
        if (!code) {
            this.showOutput('// Напишите код и нажмите "Выполнить"', '');
            return;
        }

        // Перехват console.log
        const logs = [];
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            logs.push({ type: 'log', content: args.map(this.formatArg).join(' ') });
        };
        console.error = (...args) => {
            logs.push({ type: 'error', content: args.map(this.formatArg).join(' ') });
        };
        console.warn = (...args) => {
            logs.push({ type: 'warn', content: args.map(this.formatArg).join(' ') });
        };

        try {
            // Используем Function вместо eval для лучшей изоляции
            const result = new Function(code)();

            // Восстановление console
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;

            this.showOutput(logs, result);
        } catch (error) {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;

            logs.push({ type: 'error', content: `${error.name}: ${error.message}` });
            this.showOutput(logs, undefined);
        }
    },

    formatArg(arg) {
        if (arg === undefined) return 'undefined';
        if (arg === null) return 'null';
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg, null, 2);
            } catch {
                return String(arg);
            }
        }
        return String(arg);
    },

    showOutput(logs, result) {
        let html = '';

        if (logs.length > 0) {
            logs.forEach(({ type, content }) => {
                const escapedContent = this.escapeHTML(content);
                html += `<span class="${type}">${escapedContent}</span>\n`;
            });
        }

        if (result !== undefined && logs.length === 0) {
            html += `<span class="log">${this.escapeHTML(this.formatArg(result))}</span>`;
        }

        if (html === '') {
            html = '<span class="log">// Код выполнен без вывода</span>';
        }

        this.output.innerHTML = html;
        this.output.scrollTop = this.output.scrollHeight;
    },

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
};

// ============================================
// FAQ аккордеон
// ============================================

const FAQ = {
    init() {
        this.items = $$(CONFIG.selectors.faqItems);
        this.bindEvents();
    },

    bindEvents() {
        this.items.forEach(item => {
            item.addEventListener('click', () => this.toggle(item));
        });
    },

    toggle(question) {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');

        // Закрываем все
        document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));

        // Открываем текущий, если был закрыт
        if (!isActive) {
            faqItem.classList.add('active');
        }
    },
};

// ============================================
// Анимация появления при скролле
// ============================================

const ScrollReveal = {
    init() {
        this.elements = $$(CONFIG.selectors.animateElements);
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        this.observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px',
            }
        );
        this.observe();
    },

    observe() {
        this.elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            this.observer.observe(el);
        });
    },
};

// ============================================
// Сохранение прогресса в локальном хранилище
// ============================================

const ProgressTracker = {
    storageKey: 'codenature-progress',

    init() {
        this.progress = this.load();
        this.bindEvents();
        this.restoreScroll();
    },

    load() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || {};
        } catch {
            return {};
        }
    },

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    },

    markSectionVisited(sectionId) {
        this.progress[sectionId] = Date.now();
        this.save();
    },

    bindEvents() {
        window.addEventListener('beforeunload', () => {
            this.progress.lastScrollPosition = window.scrollY;
            this.save();
        });

        // Отслеживание посещённых секций
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        if (id) this.markSectionVisited(id);
                    }
                });
            },
            { threshold: 0.5 }
        );

        document.querySelectorAll('section[id]').forEach(section => {
            observer.observe(section);
        });
    },

    restoreScroll() {
        const lastPosition = this.progress.lastScrollPosition;
        if (lastPosition && window.scrollY === 0) {
            setTimeout(() => {
                window.scrollTo({ top: lastPosition, behavior: 'smooth' });
            }, 500);
        }
    },
};

// ============================================
// Инициализация приложения
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    Navigation.init();
    ParticleSystem.init();
    Parallax.init();
    CounterAnimation.init();
    LanguageFilter.init();
    LanguageModal.init();
    CodePlayground.init();
    FAQ.init();
    ScrollReveal.init();
    ProgressTracker.init();

    // Глобальная обработка ошибок
    window.addEventListener('error', (e) => {
        console.warn('CodeNature: перехвачена ошибка —', e.message);
    });

    // Логирование инициализации
    console.log(
        '%c🌿 CodeNature %cактивирован',
        'color: #4a9c5d; font-weight: bold; font-size: 1.2em;',
        'color: inherit;'
    );
    console.log(
        '%cОбучение программированию без воды. Начните с выбора языка.',
        'color: #888; font-style: italic;'
    );
});