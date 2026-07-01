// OSINT Reconnaissance Engine - Frontend
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
        const savedTheme = localStorage.getItem('theme') || 'dark-mode';
        
        document.documentElement.classList.add(savedTheme);
        this.updateThemeIcon(savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
            const newTheme = currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode';
            
            document.documentElement.classList.remove(currentTheme);
            document.documentElement.classList.add(newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(newTheme);
        });
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('.toggle-icon');
        icon.textContent = theme === 'dark-mode' ? '☀️' : '🌙';
    }

    setupEventListeners() {
        // Type selector
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentType = btn.dataset.type;
                this.updateInputHint();
            });
        });

        // Search button
        document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                
                btn.classList.add('active');
                document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
            });
        });

        // Export & Clear
        document.getElementById('exportBtn').addEventListener('click', () => this.exportResults());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearResults());
    }

    updateInputHint() {
        const hints = {
            phone: 'Format: +1234567890 or 1234567890',
            username: 'Enter username or handle (e.g., john.doe)',
            name: 'Enter full name (e.g., John Doe)'
        };
        document.getElementById('inputHint').textContent = hints[this.currentType];
    }

    showStatus(visible, message = '') {
        const panel = document.getElementById('statusPanel');
        if (visible) {
            document.getElementById('statusText').textContent = message;
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    }

    showError(message) {
        const panel = document.getElementById('errorPanel');
        document.getElementById('errorText').textContent = message;
        panel.style.display = 'block';
    }

    async performSearch() {
        const input = document.getElementById('searchInput').value.trim();
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
        searchBtn.disabled = true;
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
            document.getElementById('resultsPanel').style.display = 'block';

        } catch (error) {
            this.showError(error.message);
            this.showStatus(false);
        } finally {
            searchBtn.disabled = false;
        }
    }

    displayResults(data) {
        // Summary tab
        const summaryGrid = document.getElementById('summaryGrid');
        summaryGrid.innerHTML = '';
        
        const summaryItems = [
            { label: 'Target', value: data.target },
            { label: 'Type', value: data.type.toUpperCase() },
            { label: 'Matches Found', value: data.summary.total_matches },
            { label: 'Sources', value: data.summary.sources_checked },
            { label: 'Risk Score', value: `${data.summary.risk_score}%` },
            { label: 'Scan Time', value: data.summary.scan_time }
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

        // Social tab
        this.displayTab('social', data.results.social, '🌐');
        
        // Breaches tab
        this.displayTab('breaches', data.results.breaches, '⚠️');
        
        // Domains tab
        this.displayTab('domains', data.results.domains, '🔗');
        
        // Public tab
        this.displayTab('public', data.results.public, '📋');

        // Raw data
        document.getElementById('rawData').textContent = JSON.stringify(data, null, 2);
    }

    displayTab(tabName, results, icon) {
        const container = document.getElementById(`${tabName}Results`);
        container.innerHTML = '';

        if (!results || results.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">No results found</p>';
            return;
        }

        results.forEach(item => {
            const resultEl = document.createElement('div');
            resultEl.className = 'result-item';
            
            let html = `<div class="result-title">${icon} ${item.source}</div>`;
            html += '<div class="result-info">';

            Object.entries(item).forEach(([key, value]) => {
                if (key === 'source') return;
                
                if (Array.isArray(value)) {
                    html += `<div class="result-line"><span class="result-line-label">${key}:</span><span class="result-line-value">`;
                    html += value.map(v => `<span class="badge">${this.escapeHtml(v)}</span>`).join('');
                    html += `</span></div>`;
                } else if (typeof value === 'object') {
                    html += `<div class="result-line"><span class="result-line-label">${key}:</span></div>`;
                    Object.entries(value).forEach(([k, v]) => {
                        html += `<div class="result-line" style="margin-left: 20px;"><span class="result-line-label">${k}:</span><span class="result-line-value">${this.escapeHtml(String(v))}</span></div>`;
                    });
                } else {
                    html += `<div class="result-line"><span class="result-line-label">${key}:</span><span class="result-line-value">${this.escapeHtml(String(value))}</span></div>`;
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
    }

    clearResults() {
        document.getElementById('resultsPanel').style.display = 'none';
        document.getElementById('searchInput').value = '';
        this.currentResults = null;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new OSINTEngine();
});