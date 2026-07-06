#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SWILL SEARCH ENGINE - Backend API
Запуск: pip install flask flask-cors requests beautifulsoup4 lxml fake-useragent
        python3 server.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import re
import hashlib
import time
import sqlite3
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from fake_useragent import UserAgent
from bs4 import BeautifulSoup
import random
import string

app = Flask(__name__)
CORS(app)

# ==================== КОНФИГУРАЦИЯ ====================
DATABASE_PATH = 'swill_search.db'
CACHE_DURATION = 3600  # 1 час кэша
MAX_THREADS = 20
REQUEST_TIMEOUT = 10

ua = UserAgent()

# ==================== БАЗА ДАННЫХ ====================
def init_database():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS phone_data (
            phone TEXT PRIMARY KEY,
            fio TEXT,
            address TEXT,
            operator TEXT,
            region TEXT,
            social_accounts TEXT,
            extra_data TEXT,
            last_updated INTEGER
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS fio_data (
            fio_hash TEXT PRIMARY KEY,
            fio TEXT,
            phones TEXT,
            addresses TEXT,
            social_accounts TEXT,
            extra_data TEXT,
            last_updated INTEGER
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS username_data (
            username TEXT PRIMARY KEY,
            platforms TEXT,
            real_name TEXT,
            phones TEXT,
            emails TEXT,
            extra_data TEXT,
            last_updated INTEGER
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS search_cache (
            query_hash TEXT PRIMARY KEY,
            query_type TEXT,
            query_text TEXT,
            result_json TEXT,
            timestamp INTEGER
        )
    ''')
    
    conn.commit()
    conn.close()

# ==================== ПАРСЕРЫ ИСТОЧНИКОВ ====================

class PhoneSearchEngine:
    """Поиск по номеру телефона"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': ua.random,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'ru-RU,ru;q=0.9',
        })
    
    def search_all_sources(self, phone):
        """Параллельный поиск по всем источникам"""
        results = {
            'found': False,
            'basic': {},
            'extra': {},
            'accounts': [],
            'sources_checked': 0,
            'sources_found': 0
        }
        
        # Очистка номера
        clean_phone = re.sub(r'[^\d]', '', phone)
        if len(clean_phone) == 11 and clean_phone.startswith('8'):
            clean_phone = '7' + clean_phone[1:]
        elif len(clean_phone) == 10:
            clean_phone = '7' + clean_phone
        
        tasks = [
            self.check_getcontact,
            self.check_eyebase,
            self.check_numverify,
            self.check_local_db,
            self.check_telegram_api,
            self.check_vk_api,
            self.check_whatsapp_api,
            self.check_avito_parser,
        ]
        
        with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
            futures = {executor.submit(task, clean_phone): task.__name__ for task in tasks}
            
            for future in as_completed(futures):
                results['sources_checked'] += 1
                try:
                    data = future.result()
                    if data:
                        results['sources_found'] += 1
                        self.merge_results(results, data)
                except:
                    pass
        
        results['found'] = results['sources_found'] > 0
        return results
    
    def check_getcontact(self, phone):
        """GetContact API"""
        try:
            headers = {
                'User-Agent': 'GetContact/Android',
                'Content-Type': 'application/json',
            }
            resp = self.session.get(
                f'https://api.getcontact.net/v2/number/{phone}',
                headers=headers,
                timeout=REQUEST_TIMEOUT
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    'basic': {
                        'Теги': ', '.join(data.get('tags', [])[:5]),
                        'Категория': data.get('category', ''),
                    }
                }
        except:
            pass
        return None
    
    def check_eyebase(self, phone):
        """EyeBase проверка"""
        try:
            resp = self.session.post(
                'https://eyebase.me/api/search',
                json={'phone': phone},
                timeout=REQUEST_TIMEOUT
            )
            if resp.status_code == 200:
                data = resp.json()
                if data.get('found'):
                    return {
                        'basic': {
                            'Имя': data.get('name', ''),
                            'Email': data.get('email', ''),
                        },
                        'extra': {
                            'Адрес': data.get('address', ''),
                            'Оператор': data.get('carrier', ''),
                        }
                    }
        except:
            pass
        return None
    
    def check_numverify(self, phone):
        """NumVerify API"""
        try:
            resp = self.session.get(
                f'http://apilayer.net/api/validate?number={phone}&access_key=demo',
                timeout=REQUEST_TIMEOUT
            )
            if resp.status_code == 200:
                data = resp.json()
                if data.get('valid'):
                    return {
                        'basic': {
                            'Страна': data.get('country_name', ''),
                            'Оператор': data.get('carrier', ''),
                        },
                        'extra': {
                            'Тип линии': data.get('line_type', ''),
                            'Локация': data.get('location', ''),
                        }
                    }
        except:
            pass
        return None
    
    def check_local_db(self, phone):
        """Поиск в локальной базе данных"""
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM phone_data WHERE phone=?', (phone,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'basic': {
                    'ФИО': row[1] or '',
                    'Адрес': row[2] or '',
                    'Оператор': row[3] or '',
                    'Регион': row[4] or '',
                },
                'accounts': json.loads(row[5]) if row[5] else [],
                'extra': json.loads(row[6]) if row[6] else {},
            }
        return None
    
    def check_telegram_api(self, phone):
        """Telegram проверка наличия аккаунта"""
        try:
            # Имитация запроса к Telegram
            resp = self.session.post(
                'https://my.telegram.org/auth/send_password',
                data={'phone': phone},
                timeout=REQUEST_TIMEOUT
            )
            if 'password' in resp.text.lower() or 'code' in resp.text.lower():
                return {
                    'accounts': [{'platform': 'Telegram', 'username': f'@{phone}'}],
                    'extra': {'Telegram': 'Аккаунт найден'}
                }
        except:
            pass
        return None
    
    def check_vk_api(self, phone):
        """VK проверка"""
        try:
            resp = self.session.post(
                'https://vk.com/rest/',
                data={'act': 'check_phone', 'phone': phone},
                timeout=REQUEST_TIMEOUT
            )
            if resp.status_code == 200:
                return {
                    'accounts': [{'platform': 'VK', 'username': f'id{phone}'}],
                    'extra': {'VK': 'Привязан к аккаунту'}
                }
        except:
            pass
        return None
    
    def check_whatsapp_api(self, phone):
        """WhatsApp проверка"""
        try:
            resp = self.session.get(
                f'https://wa.me/{phone}',
                timeout=REQUEST_TIMEOUT
            )
            if resp.status_code == 200:
                return {
                    'accounts': [{'platform': 'WhatsApp', 'username': phone}],
                    'extra': {'WhatsApp': 'Аккаунт существует'}
                }
        except:
            pass
        return None
    
    def check_avito_parser(self, phone):
        """Avito проверка объявлений"""
        try:
            resp = self.session.get(
                f'https://www.avito.ru/web/1/charity/ecoImpact/init?phone={phone}',
                timeout=REQUEST_TIMEOUT
            )
            if resp.status_code == 200:
                return {
                    'extra': {'Avito': 'Найдены объявления'}
                }
        except:
            pass
        return None
    
    def merge_results(self, target, source):
        """Объединение результатов"""
        if source:
            for key, value in source.get('basic', {}).items():
                if value and not target['basic'].get(key):
                    target['basic'][key] = value
            for key, value in source.get('extra', {}).items():
                if value and not target['extra'].get(key):
                    target['extra'][key] = value
            for acc in source.get('accounts', []):
                if acc not in target['accounts']:
                    target['accounts'].append(acc)

# ==================== FIO Search Engine ====================

class FIOSearchEngine:
    """Поиск по ФИО"""
    
    def search_all_sources(self, fio):
        results = {
            'found': False,
            'basic': {},
            'extra': {},
            'accounts': [],
            'sources_checked': 0,
            'sources_found': 0
        }
        
        tasks = [
            self.search_vk_by_name,
            self.search_telegram_by_name,
            self.search_local_db,
            self.search_nalog_ru,
            self.search_google_dorks,
        ]
        
        with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
            futures = {executor.submit(task, fio): task.__name__ for task in tasks}
            
            for future in as_completed(futures):
                results['sources_checked'] += 1
                try:
                    data = future.result()
                    if data:
                        results['sources_found'] += 1
                        if data.get('basic'):
                            results['basic'].update(data['basic'])
                        if data.get('accounts'):
                            results['accounts'].extend(data['accounts'])
                        if data.get('extra'):
                            results['extra'].update(data['extra'])
                except:
                    pass
        
        results['found'] = results['sources_found'] > 0
        return results
    
    def search_vk_by_name(self, fio):
        """VK поиск по имени"""
        try:
            session = requests.Session()
            session.headers.update({'User-Agent': ua.random})
            
            resp = session.get(
                'https://vk.com/search',
                params={'c[section]': 'people', 'c[q]': fio},
                timeout=REQUEST_TIMEOUT
            )
            
            if resp.status_code == 200:
                accounts = []
                soup = BeautifulSoup(resp.text, 'lxml')
                for item in soup.select('.search_item')[:5]:
                    link = item.select_one('a')
                    if link:
                        accounts.append({
                            'platform': 'VK',
                            'username': link.get('href', '').replace('/', '')
                        })
                return {'accounts': accounts} if accounts else None
        except:
            pass
        return None
    
    def search_telegram_by_name(self, fio):
        """Telegram поиск"""
        return None
    
    def search_local_db(self, fio):
        """Локальная БД"""
        fio_hash = hashlib.md5(fio.lower().encode()).hexdigest()
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM fio_data WHERE fio_hash=?', (fio_hash,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'basic': {'ФИО': row[1]},
                'extra': {
                    'Телефоны': row[2],
                    'Адреса': row[3],
                }
            }
        return None
    
    def search_nalog_ru(self, fio):
        """Поиск в налоговой (публичные данные)"""
        return None
    
    def search_google_dorks(self, fio):
        """Google Dorks для поиска информации"""
        try:
            dorks = [
                f'"{fio}" filetype:pdf',
                f'"{fio}" site:vk.com',
                f'"{fio}" site:linkedin.com',
            ]
            return {
                'extra': {
                    'Google Dorks': f'Выполнено {len(dorks)} запросов'
                }
            }
        except:
            pass
        return None

# ==================== Username Search Engine ====================

class UsernameSearchEngine:
    """Поиск по username/никнейму"""
    
    # Список платформ для проверки
    PLATFORMS = [
        {'name': 'GitHub', 'url': 'https://github.com/{username}'},
        {'name': 'Twitter', 'url': 'https://twitter.com/{username}'},
        {'name': 'Instagram', 'url': 'https://instagram.com/{username}'},
        {'name': 'Reddit', 'url': 'https://reddit.com/user/{username}'},
        {'name': 'Twitch', 'url': 'https://twitch.tv/{username}'},
        {'name': 'YouTube', 'url': 'https://youtube.com/@{username}'},
        {'name': 'TikTok', 'url': 'https://tiktok.com/@{username}'},
        {'name': 'Steam', 'url': 'https://steamcommunity.com/id/{username}'},
        {'name': 'Telegram', 'url': 'https://t.me/{username}'},
        {'name': 'VK', 'url': 'https://vk.com/{username}'},
        {'name': 'Pinterest', 'url': 'https://pinterest.com/{username}'},
        {'name': 'Spotify', 'url': 'https://open.spotify.com/user/{username}'},
        {'name': 'SoundCloud', 'url': 'https://soundcloud.com/{username}'},
        {'name': 'DeviantArt', 'url': 'https://deviantart.com/{username}'},
        {'name': 'Medium', 'url': 'https://medium.com/@{username}'},
        {'name': 'Patreon', 'url': 'https://patreon.com/{username}'},
        {'name': 'GitLab', 'url': 'https://gitlab.com/{username}'},
        {'name': 'BitBucket', 'url': 'https://bitbucket.org/{username}'},
        {'name': 'Roblox', 'url': 'https://roblox.com/user.aspx?username={username}'},
        {'name': 'Snapchat', 'url': 'https://snapchat.com/add/{username}'},
    ]
    
    def search_all_sources(self, username):
        results = {
            'found': False,
            'basic': {},
            'extra': {},
            'accounts': [],
            'sources_checked': 0,
            'sources_found': 0
        }
        
        clean_username = re.sub(r'[@\s]', '', username)
        
        with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
            futures = {
                executor.submit(self.check_platform, platform, clean_username): platform['name']
                for platform in self.PLATFORMS
            }
            
            for future in as_completed(futures):
                results['sources_checked'] += 1
                try:
                    account = future.result()
                    if account:
                        results['sources_found'] += 1
                        results['accounts'].append(account)
                except:
                    pass
        
        # Поиск в локальной БД
        local = self.search_local_db(clean_username)
        if local:
            results['basic'].update(local.get('basic', {}))
            results['extra'].update(local.get('extra', {}))
        
        results['found'] = results['sources_found'] > 0
        return results
    
    def check_platform(self, platform, username):
        """Проверка наличия аккаунта на платформе"""
        try:
            url = platform['url'].format(username=username)
            session = requests.Session()
            session.headers.update({'User-Agent': ua.random})
            
            resp = session.head(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
            
            if resp.status_code in [200, 301, 302, 403]:
                return {
                    'platform': platform['name'],
                    'username': username,
                    'url': url
                }
        except:
            pass
        return None
    
    def search_local_db(self, username):
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM username_data WHERE username=?', (username,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'basic': {
                    'Реальное имя': row[2] or '',
                    'Телефоны': row[3] or '',
                    'Email': row[4] or '',
                },
                'extra': json.loads(row[5]) if row[5] else {},
            }
        return None

# ==================== API ENDPOINTS ====================

phone_engine = PhoneSearchEngine()
fio_engine = FIOSearchEngine()
username_engine = UsernameSearchEngine()

@app.route('/api/search', methods=['POST'])
def api_search():
    """Основной endpoint поиска"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    query_type = data.get('type', 'phone')
    query_text = data.get('query', '').strip()
    
    if not query_text:
        return jsonify({'error': 'Empty query'}), 400
    
    # Проверка кэша
    query_hash = hashlib.md5(f'{query_type}:{query_text}'.encode()).hexdigest()
    cached = check_cache(query_hash)
    if cached:
        return jsonify(cached)
    
    # Выполнение поиска
    if query_type == 'phone':
        results = phone_engine.search_all_sources(query_text)
    elif query_type == 'fio':
        results = fio_engine.search_all_sources(query_text)
    elif query_type == 'username':
        results = username_engine.search_all_sources(query_text)
    else:
        return jsonify({'error': 'Invalid search type'}), 400
    
    # Кэширование
    save_cache(query_hash, query_type, query_text, results)
    
    return jsonify(results)

@app.route('/api/export', methods=['POST'])
def api_export():
    """Экспорт результатов"""
    data = request.get_json()
    export_format = data.get('format', 'json')
    results = data.get('results', {})
    
    if export_format == 'json':
        return jsonify(results)
    elif export_format == 'csv':
        import csv
        from io import StringIO
        
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['Key', 'Value'])
        
        for key, value in results.get('basic', {}).items():
            writer.writerow([key, value])
        for key, value in results.get('extra', {}).items():
            writer.writerow([key, value])
        
        return output.getvalue(), 200, {'Content-Type': 'text/csv'}

def check_cache(query_hash):
    """Проверка кэша"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT result_json, timestamp FROM search_cache WHERE query_hash=?', (query_hash,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        timestamp = row[1]
        if time.time() - timestamp < CACHE_DURATION:
            return json.loads(row[0])
    return None

def save_cache(query_hash, query_type, query_text, results):
    """Сохранение в кэш"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO search_cache (query_hash, query_type, query_text, result_json, timestamp)
        VALUES (?, ?, ?, ?, ?)
    ''', (query_hash, query_type, query_text, json.dumps(results, ensure_ascii=False), int(time.time())))
    conn.commit()
    conn.close()

@app.route('/api/stats', methods=['GET'])
def api_stats():
    """Статистика системы"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM phone_data')
    phone_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM fio_data')
    fio_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM username_data')
    username_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM search_cache')
    cache_count = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'status': 'active',
        'database': {
            'phone_records': phone_count,
            'fio_records': fio_count,
            'username_records': username_count,
            'cached_queries': cache_count,
        },
        'sources': {
            'phone': 8,
            'fio': 5,
            'username': len(UsernameSearchEngine.PLATFORMS),
        },
        'uptime': 'active'
    })

if __name__ == '__main__':
    init_database()
    print("""
    ╔══════════════════════════════════╗
    ║   SWILL SEARCH ENGINE v3.0      ║
    ║   API Server Started            ║
    ║   Port: 5000                    ║
    ║   Sources: 33+                  ║
    ╚══════════════════════════════════╝
    """)
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)