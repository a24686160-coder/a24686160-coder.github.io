// OSINT Reconnaissance Engine - Frontend Management
class OSINTEngine {
    constructor() {
        this.currentType = 'phone';
        this.currentResults = null;
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
    }

    setupTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        // По умолчанию используем dark-mode, если ничего не сохранено
        const savedTheme = localStorage.getItem('theme') || 'dark-mode';
        
        document.documentElement.classList.add(savedTheme);
        this.updateThemeIcon(savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark-mode');
            const newTheme = isDark ? 'light-mode' : 'dark-mode';
            const oldTheme = isDark ? 'dark-mode' : 'light-mode';
            
            document.documentElement.classList.remove(oldTheme);
            document.documentElement.classList.add(newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(newTheme);
        });
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('.toggle-icon');
        if (icon) {
            icon.textContent = theme === 'dark-mode' ? '☀️' : '🌙';
        }
    }

    setupEventListeners() {
        // Выбор типа идентификатора
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentType = btn.dataset.type;
                this.updateInputHint();
            });
        });

        // Кнопка поиска и отправка по Enter
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');

        if (searchBtn) searchBtn.addEventListener('click', () => this.performSearch());
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }

        // Переключение вкладок (Tabs)
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                
                const targetTab = document.getElementById('tab-' + btn.dataset.tab);
                if (targetTab) targetTab.classList.add('active');
            });
        });

        // Экспорт и Очистка
        const exportBtn = document.getElementById('exportBtn');
        const clearBtn = document.getElementById('clearBtn');
        const dismissErrorBtn = document.getElementById('dismissErrorBtn');

        if (exportBtn) exportBtn.addEventListener('click', () => this.exportResults());
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearResults());
        if (dismissErrorBtn) {
            dismissErrorBtn.addEventListener('click', () => {
                document.getElementById('errorPanel').style.display = 'none';
            });
        }
    }

    updateInputHint() {
        const hintEl = document.getElementById('inputHint');
        if (!hintEl) return;

        const hints = {
            phone: 'Format: +1234567890 or 1234567890',
            username: 'Enter username or handle (e.g., john.doe)',
            name: 'Enter full name (e.g., John Doe)'
        };
        hintEl.textContent = hints[this.currentType] || '';
    }

    showStatus(visible, message = '') {
        const panel = document.getElementById('statusPanel');
        const statusText = document.getElementById('statusText');
        if (!panel || !statusText) return;

        if (visible) {
            statusText.textContent = message;
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    }

    showError(message) {
        const panel = document.getElementById('errorPanel');
        const errorText = document.getElementById('errorText');
        if (!panel || !errorText) return;

        errorText.textContent = message;
        panel.style.display = 'block';
    }

    async performSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        const input = searchInput.value.trim();
        if (!input) {
            this.showError('Please enter search information');
            return;
        }

        const scopes = Array.from(document.querySelectorAll('input[name="scope"]:checked'))
            .map(el => el.value);

        if (scopes.length === 0) {
            this.showError('Please select at least one search scope');
            return;
        }

        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) searchBtn.disabled = true;
        
        this.showStatus(true, `Scanning ${this.currentType} across ${scopes.join(', ')}...`);

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: this.currentType,
                    query: input,
                    scopes: scopes
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            this.currentResults = data;
            this.displayResults(data);
            this.showStatus(false);
            
            const resultsPanel = document.getElementById('resultsPanel');
            if (resultsPanel) resultsPanel.style.display = 'block';

        } catch (error) {
            this.showError(error.message);
            this.showStatus(false);
        } finally {
            if (searchBtn) searchBtn.disabled = false;
        }
    }

    displayResults(data) {
        const summaryGrid = document.getElementById('summaryGrid');
        if (!summaryGrid || !data) return;

        summaryGrid.innerHTML = '';
        
        // Безопасное чтение вложенных объектов (защита от undefined)
        const summaryItems = [
            { label: 'Target', value: data.target || '-' },
            { label: 'Type', value: data.type ? data.type.toUpperCase() : '-' },
            { label: 'Matches Found', value: data.summary?.total_matches ?? 0 },
            { label: 'Sources', value: data.summary?.sources_checked ?? 0 },
            { label: 'Risk Score', value: `${data.summary?.risk_score ?? 0}%` },
            { label: 'Scan Time', value: data.summary?.scan_time || '-' }
        ];

        summaryItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'summary-card';
            card.innerHTML = `
                <div class="summary-card-label">${item.label}</div>
                <div class="summary-card-value">${item.value}</div>
            `;
            summaryGrid.appendChild(card);
        });

        // Наполнение вкладок результатами
        this.displayTab('social', data.results?.social, '🌐');
        this.displayTab('breaches', data.results?.breaches, '⚠️');
        this.displayTab('domains', data.results?.domains, '🔗');
        this.displayTab('public', data.results?.public, '📋');

        // Вкладка сырых данных JSON
        const rawDataEl = document.getElementById('rawData');
        if (rawDataEl) {
            rawDataEl.textContent = JSON.stringify(data, null, 2);
        }
    }

    displayTab(tabName, results, icon) {
        const container = document.getElementById(`${tabName}Results`);
        if (!container) return;
        
        container.innerHTML = '';

        if (!results || results.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">No results found</p>';
            return;
        }

        results.forEach(item => {
            const resultEl = document.createElement('div');
            resultEl.className = 'result-item';
            
            let html = `<div class="result-title">${icon} ${this.escapeHtml(item.source || 'Unknown')}</div>`;
            html += '<div class="result-info">';

            Object.entries(item).forEach(([key, value]) => {
                if (key === 'source') return;
                
                if (Array.isArray(value)) {
                    html += `<div class="result-line"><span class="result-line-label">${this.escapeHtml(key)}:</span><span class="result-line-value">`;
                    html += value.map(v => `<span class="badge">${this.escapeHtml(String(v))}</span>`).join('');
                    html += `</span></div>`;
                } else if (value && typeof value === 'object') {
                    html += `<div class="result-line"><span class="result-line-label">${this.escapeHtml(key)}:</span></div>`;
                    Object.entries(value).forEach(([k, v]) => {
                        html += `<div class="result-line" style="margin-left: 20px;"><span class="result-line-label">${this.escapeHtml(k)}:</span><span class="result-line-value">${this.escapeHtml(String(v))}</span></div>`;
                    });
                } else {
                    html += `<div class="result-line"><span class="result-line-label">${this.escapeHtml(key)}:</span><span class="result-line-value">${this.escapeHtml(String(value))}</span></div>`;
                }
            });

            html += '</div>';
            resultEl.innerHTML = html;
            container.appendChild(resultEl);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    exportResults() {
        if (!this.currentResults) return;
        
        const dataStr = JSON.stringify(this.currentResults, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `osint_report_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url); // Освобождаем память
    }

    clearResults() {
        const resultsPanel = document.getElementById('resultsPanel');
        const searchInput = document.getElementById('searchInput');
        
        if (resultsPanel) resultsPanel.style.display = 'none';
        if (searchInput) searchInput.value = '';
        this.currentResults = null;
    }
}

// Инициализация при полной загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    new OSINTEngine();
});
