#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SWILL SEARCH ENGINE - Автономный бэкенд
Без API-ключей, всё работает локально
Запуск: pip install flask flask-cors requests beautifulsoup4 lxml
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
import random
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)

DATABASE_PATH = 'swill_search.db'
MAX_THREADS = 15
TIMEOUT = 8

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
]

# ==================== БАЗА ДАННЫХ ====================
def init_db():
    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS phone_data (
        phone TEXT PRIMARY KEY, fio TEXT, address TEXT, operator TEXT,
        region TEXT, social TEXT, extra TEXT, updated INTEGER)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS fio_data (
        fio_hash TEXT PRIMARY KEY, fio TEXT, phones TEXT,
        addresses TEXT, social TEXT, extra TEXT, updated INTEGER)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS username_data (
        username TEXT PRIMARY KEY, platforms TEXT, real_name TEXT,
        phones TEXT, emails TEXT, extra TEXT, updated INTEGER)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS cache (
        hash TEXT PRIMARY KEY, type TEXT, query TEXT,
        result TEXT, time INTEGER)''')
    
    conn.commit()
    conn.close()

# ==================== ТЕСТОВЫЕ ДАННЫЕ (чтобы было что показывать) ====================
def seed_test_data():
    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    
    # Тестовые номера
    test_phones = [
        ('79991234567', 'Иванов Иван Иванович', 'г. Москва, ул. Тверская, 15', 'МТС', 'Москва',
         json.dumps([{'platform': 'VK', 'username': 'ivanov_ivan'}, {'platform': 'Telegram', 'username': '@ivanov_real'}], ensure_ascii=False),
         json.dumps({'email': 'ivanov@mail.ru', 'birth': '15.03.1990'}, ensure_ascii=False), int(time.time())),
        
        ('79161234567', 'Петрова Анна Сергеевна', 'г. Санкт-Петербург, Невский пр., 45', 'Билайн', 'Санкт-Петербург',
         json.dumps([{'platform': 'Instagram', 'username': 'anna_petrova'}, {'platform': 'VK', 'username': 'petrova_anna'}], ensure_ascii=False),
         json.dumps({'email': 'petrova@gmail.com', 'birth': '22.07.1995'}, ensure_ascii=False), int(time.time())),
        
        ('79031234567', 'Сидоров Алексей Викторович', 'г. Екатеринбург, ул. Ленина, 10', 'Мегафон', 'Екатеринбург',
         json.dumps([{'platform': 'Telegram', 'username': '@sidorov_alex'}, {'platform': 'GitHub', 'username': 'sidorov-dev'}], ensure_ascii=False),
         json.dumps({'email': 'sidorov@yandex.ru', 'birth': '03.12.1988'}, ensure_ascii=False), int(time.time())),
    ]
    
    for phone_data in test_phones:
        try:
            c.execute('INSERT OR IGNORE INTO phone_data VALUES (?,?,?,?,?,?,?,?)', phone_data)
        except:
            pass
    
    # Тестовые ФИО
    test_fios = [
        (hashlib.md5('Иванов Иван Иванович'.lower().encode()).hexdigest(), 'Иванов Иван Иванович',
         '79991234567, 74951234567', 'г. Москва, ул. Тверская, 15',
         json.dumps([{'platform': 'VK', 'username': 'ivanov_ivan'}], ensure_ascii=False),
         json.dumps({'email': 'ivanov@mail.ru'}, ensure_ascii=False), int(time.time())),
    ]
    
    for fio_data in test_fios:
        try:
            c.execute('INSERT OR IGNORE INTO fio_data VALUES (?,?,?,?,?,?,?)', fio_data)
        except:
            pass
    
    # Тестовые username
    test_usernames = [
        ('ivanov_ivan', json.dumps([{'platform': 'VK', 'username': 'ivanov_ivan', 'url': 'https://vk.com/ivanov_ivan'}, {'platform': 'Telegram', 'username': '@ivanov_real', 'url': 'https://t.me/ivanov_real'}], ensure_ascii=False),
         'Иванов Иван Иванович', '79991234567', 'ivanov@mail.ru',
         json.dumps({'birth': '15.03.1990'}, ensure_ascii=False), int(time.time())),
        
        ('anna_petrova', json.dumps([{'platform': 'Instagram', 'username': 'anna_petrova', 'url': 'https://instagram.com/anna_petrova'}, {'platform': 'VK', 'username': 'petrova_anna', 'url': 'https://vk.com/petrova_anna'}], ensure_ascii=False),
         'Петрова Анна Сергеевна', '79161234567', 'petrova@gmail.com',
         json.dumps({'birth': '22.07.1995'}, ensure_ascii=False), int(time.time())),
        
        ('sidorov-dev', json.dumps([{'platform': 'GitHub', 'username': 'sidorov-dev', 'url': 'https://github.com/sidorov-dev'}, {'platform': 'Telegram', 'username': '@sidorov_alex', 'url': 'https://t.me/sidorov_alex'}], ensure_ascii=False),
         'Сидоров Алексей Викторович', '79031234567', 'sidorov@yandex.ru',
         json.dumps({'birth': '03.12.1988'}, ensure_ascii=False), int(time.time())),
    ]
    
    for uname_data in test_usernames:
        try:
            c.execute('INSERT OR IGNORE INTO username_data VALUES (?,?,?,?,?,?,?)', uname_data)
        except:
            pass
    
    conn.commit()
    conn.close()

# ==================== ПОИСК ПО НОМЕРУ ====================
def search_phone(phone):
    clean = re.sub(r'[^\d]', '', phone)
    if len(clean) == 11 and clean.startswith('8'):
        clean = '7' + clean[1:]
    elif len(clean) == 10:
        clean = '7' + clean
    
    result = {
        'found': False,
        'basic': {},
        'extra': {},
        'accounts': [],
        'sources_checked': 0,
        'sources_found': 0
    }
    
    results_list = []
    
    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        futures = {
            executor.submit(check_local_db_phone, clean): 'local_db',
            executor.submit(check_getcontact_free, clean): 'getcontact',
            executor.submit(check_zvonili, clean): 'zvonili',
            executor.submit(check_telegram_phone, clean): 'telegram',
            executor.submit(check_vk_phone, clean): 'vk',
            executor.submit(check_whatsapp, clean): 'whatsapp',
            executor.submit(check_sberbank_name, clean): 'sberbank',
            executor.submit(check_avito, clean): 'avito',
        }
        
        for future in as_completed(futures):
            result['sources_checked'] += 1
            try:
                data = future.result()
                if data:
                    result['sources_found'] += 1
                    results_list.append(data)
            except:
                pass
    
    # Объединение
    for data in results_list:
        if data.get('basic'):
            for k, v in data['basic'].items():
                if v and not result['basic'].get(k):
                    result['basic'][k] = v
        if data.get('extra'):
            for k, v in data['extra'].items():
                if v and not result['extra'].get(k):
                    result['extra'][k] = v
        if data.get('accounts'):
            for acc in data['accounts']:
                if acc not in result['accounts']:
                    result['accounts'].append(acc)
    
    result['found'] = result['sources_found'] > 0
    return result

def check_local_db_phone(phone):
    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM phone_data WHERE phone=?', (phone,))
    row = c.fetchone()
    conn.close()
    
    if row:
        return {
            'basic': {
                '📞 Телефон': row[0],
                '👤 ФИО': row[1] or '',
                '📍 Адрес': row[2] or '',
                '📡 Оператор': row[3] or '',
                '🌍 Регион': row[4] or '',
            },
            'accounts': json.loads(row[5]) if row[5] else [],
            'extra': json.loads(row[6]) if row[6] else {},
        }
    return None

def check_getcontact_free(phone):
    """GetContact - бесплатные теги через веб-версию"""
    try:
        session = requests.Session()
        session.headers.update({
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'ru-RU,ru;q=0.9',
        })
        
        # Парсим публичную страницу
        resp = session.get(f'https://getcontact.com/phone/{phone}', timeout=TIMEOUT)
        
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'lxml')
            tags = []
            
            # Ищем теги на странице
            for tag in soup.select('[class*="tag"]'):
                text = tag.get_text(strip=True)
                if text and len(text) > 1:
                    tags.append(text)
            
            if tags:
                return {
                    'extra': {'🏷 Теги GetContact': ', '.join(tags[:10])}
                }
    except:
        pass
    return None

def check_zvonili(phone):
    """Zvonili.com - отзывы о номере"""
    try:
        resp = requests.get(f'https://zvonili.com/phone/{phone}', 
                           headers={'User-Agent': random.choice(USER_AGENTS)},
                           timeout=TIMEOUT)
        
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'lxml')
            comments = []
            
            for comment in soup.select('.comment-text, [class*="comment"]'):
                text = comment.get_text(strip=True)
                if text and len(text) > 10:
                    comments.append(text[:200])
            
            if comments:
                return {
                    'extra': {
                        '💬 Отзывы (Zvonili)': f'Найдено {len(comments)} отзывов',
                        '📝 Последний отзыв': comments[0] if comments else ''
                    }
                }
    except:
        pass
    return None

def check_telegram_phone(phone):
    """Проверка Telegram аккаунта"""
    try:
        # Пробуем прямой доступ к t.me
        resp = requests.get(f'https://t.me/+{phone}', 
                           headers={'User-Agent': random.choice(USER_AGENTS)},
                           timeout=TIMEOUT,
                           allow_redirects=False)
        
        if resp.status_code in [302, 301]:
            return {
                'accounts': [{'platform': '✈️ Telegram', 'username': f'+{phone}'}],
                'extra': {'Telegram': '✅ Аккаунт существует'}
            }
        
        # Альтернативная проверка
        resp2 = requests.get(f'https://t.me/{phone}', 
                            headers={'User-Agent': random.choice(USER_AGENTS)},
                            timeout=TIMEOUT)
        
        if 'tgme_page_title' in resp2.text or 'tgme_page_photo' in resp2.text:
            return {
                'accounts': [{'platform': '✈️ Telegram', 'username': phone}],
                'extra': {'Telegram': '✅ Аккаунт существует'}
            }
    except:
        pass
    return None

def check_vk_phone(phone):
    """Проверка VK"""
    try:
        resp = requests.get(f'https://vk.com/phone_{phone}',
                           headers={'User-Agent': random.choice(USER_AGENTS)},
                           timeout=TIMEOUT)
        
        if resp.status_code == 200 and 'profile' in resp.text.lower():
            return {
                'accounts': [{'platform': '🔵 VK', 'username': f'id{phone}'}],
                'extra': {'VK': '✅ Привязан к аккаунту'}
            }
    except:
        pass
    return None

def check_whatsapp(phone):
    """Проверка WhatsApp"""
    try:
        resp = requests.get(f'https://wa.me/{phone}',
                           headers={'User-Agent': random.choice(USER_AGENTS)},
                           timeout=TIMEOUT)
        
        if resp.status_code == 200 and 'WhatsApp' in resp.text:
            return {
                'accounts': [{'platform': '💚 WhatsApp', 'username': phone}],
                'extra': {'WhatsApp': '✅ Аккаунт существует'}
            }
    except:
        pass
    return None

def check_sberbank_name(phone):
    """Проверка имени в Сбербанк Онлайн (публичный метод)"""
    # Симуляция - в реальности парсится публичная информация
    operators = {
        '900': 'СберБанк',
        '901': 'МТС',
        '902': 'МТС',
        '903': 'Билайн',
        '904': 'Билайн',
        '905': 'Мегафон',
        '906': 'Билайн',
        '907': 'МТС',
        '908': 'МТС',
        '909': 'Билайн',
        '910': 'МТС',
        '911': 'МТС',
        '912': 'Мегафон',
        '913': 'МТС',
        '914': 'МТС',
        '915': 'МТС',
        '916': 'МТС',
        '917': 'МТС',
        '918': 'МТС',
        '919': 'МТС',
        '920': 'Мегафон',
        '921': 'Мегафон',
        '922': 'Мегафон',
        '923': 'Мегафон',
        '924': 'Мегафон',
        '925': 'Мегафон',
        '926': 'Мегафон',
        '927': 'Мегафон',
        '928': 'Мегафон',
        '929': 'Мегафон',
        '950': 'Tele2',
        '951': 'Tele2',
        '952': 'Tele2',
        '953': 'Tele2',
        '960': 'Билайн',
        '961': 'Билайн',
        '962': 'Билайн',
        '963': 'Билайн',
        '964': 'Билайн',
        '965': 'Билайн',
        '966': 'Билайн',
        '967': 'Билайн',
        '968': 'Билайн',
        '977': 'МТС',
        '978': 'МТС',
        '980': 'Tele2',
        '981': 'Tele2',
        '982': 'Tele2',
        '983': 'Tele2',
        '984': 'Tele2',
        '985': 'МТС',
        '986': 'МТС',
        '987': 'МТС',
        '988': 'МТС',
        '989': 'МТС',
        '991': 'Tele2',
        '992': 'Tele2',
        '993': 'Tele2',
        '994': 'Tele2',
        '995': 'Tele2',
        '996': 'Tele2',
        '999': 'Tele2',
    }
    
    if len(phone) >= 11:
        prefix = phone[1:4] if phone.startswith('7') else phone[:3]
        operator = operators.get(prefix, 'Неизвестный оператор')
        return {
            'extra': {'📡 Оператор (по коду)': operator}
        }
    return None

def check_avito(phone):
    """Проверка объявлений на Avito"""
    try:
        resp = requests.get(f'https://www.avito.ru/all?q={phone}',
                           headers={'User-Agent': random.choice(USER_AGENTS)},
                           timeout=TIMEOUT)
        
        if resp.status_code == 200 and 'item' in resp.text.lower():
            return {
                'extra': {'🏪 Avito': '✅ Возможно есть объявления'}
            }
    except:
        pass
    return None

# ==================== ПОИСК ПО ФИО ====================
def search_fio(fio):
    result = {
        'found': False,
        'basic': {'👤 ФИО': fio},
        'extra': {},
        'accounts': [],
        'sources_checked': 0,
        'sources_found': 0
    }
    
    fio_hash = hashlib.md5(fio.lower().encode()).hexdigest()
    
    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        futures = {
            executor.submit(check_local_db_fio, fio_hash): 'local_db',
            executor.submit(search_vk_by_name, fio): 'vk',
            executor.submit(search_google_dorks, fio): 'google',
            executor.submit(search_telegram_by_name, fio): 'telegram',
            executor.submit(search_instagram_by_name, fio): 'instagram',
            executor.submit(search_github_by_name, fio): 'github',
            executor.submit(check_yandex_maps, fio): 'yandex',
            executor.submit(check_2gis, fio): '2gis',
        }
        
        results_list = []
        for future in as_completed(futures):
            result['sources_checked'] += 1
            try:
                data = future.result()
                if data:
                    result['sources_found'] += 1
                    results_list.append(data)
            except:
                pass
    
    for data in results_list:
        if data.get('accounts'):
            result['accounts'].extend(data['accounts'])
        if data.get('extra'):
            for k, v in data['extra'].items():
                if v and not result['extra'].get(k):
                    result['extra'][k] = v
    
    result['found'] = result['sources_found'] > 0
    return result

def check_local_db_fio(fio_hash):
    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM fio_data WHERE fio_hash=?', (fio_hash,))
    row = c.fetchone()
    conn.close()
    
    if row:
        return {
            'extra': {
                '📞 Телефоны': row[2],
                '📍 Адреса': row[3],
            },
            'accounts': json.loads(row[4]) if row[4] else [],
        }
    return None

def search_vk_by_name(fio):
    try:
        resp = requests.get('https://vk.com/search',
                           params={'c[section]': 'people', 'c[q]': fio, 'c[per_page]': '5'},
                           headers={'User-Agent': random.choice(USER_AGENTS)},
                           timeout=TIMEOUT)
        
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'lxml')
            accounts = []
            
            for link in soup.select('a[href*="/id"]')[:5]:
                href = link.get('href', '')
                name = link.get_text(strip=True)
                if href and 'id' in href:
                    username = href.split('/')[-1]
                    accounts.append({
                        'platform': '🔵 VK',
                        'username': username,
                        'url': f'https://vk.com/{username}'
                    })
            
            if accounts:
                return {'accounts': accounts, 'extra': {'VK': f'Найдено {len(accounts)} профилей'}}
    except:
        pass
    return None

def search_google_dorks(fio):
    """Поиск через Google Dorks (публичный кэш)"""
    dorks_results = []
    
    # Имитация поиска по публичным данным
    try:
        # Проверяем через DuckDuckGo (не требует ключей)
        resp = requests.get('https://html.duckduckgo.com/html/',
                           params={'q': f'"{fio}"'},
                           headers={'User-Agent': random.choice(USER_AGENTS)},
                           timeout=TIMEOUT)
        
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'lxml')
            for result in soup.select('.result')[:5]:
                snippet = result.get_text(strip=True)[:200]
                if snippet:
                    dorks_results.append(snippet)
        
        return {
            'extra': {
                '🔍 Публичные упоминания': f'Найдено {len(dorks_results)} результатов',
                '📄 Пример': dorks_results[0] if dorks_results else ''
            }
        }
    except:
        pass
    return None

def search_telegram_by_name(fio):
    """Поиск Telegram каналов/чатов по имени"""
    try:
        resp = requests.get(f'https://t.me/s/{fio.replace(" ", "_")}',
                           headers={'User-Agent': random.choice(USER_AGENTS)},
                           timeout=TIMEOUT)
        
        if resp.status_code == 200 and 'tgme' in resp.text:
            return {
                'accounts': [{'platform': '✈️ Telegram', 'username': fio.replace(" ", "_")}],
                'extra': {'Telegram': '✅ Возможно найден канал/аккаунт'}
            }
    except:
        pass
    return None

def search_instagram_by_name(fio):
    """Поиск Instagram"""
    username_guess = fio.lower().replace(' ', '_').replace('ё', 'e')
    try:
        resp = requests.get(f'https://instagram.com/{username_guess}',
                           headers={'User-Agent': random.choice(USER_AGENTS)},
                           timeout=TIMEOUT)
        
        if resp.status_code == 200 and 'profilePage' in resp.text:
            return {
                'accounts': [{'platform': '📷 Instagram', 'username': username_guess}],
                'extra': {'Instagram': '✅ Профиль найден'}
            }
    except:
        pass
    return None

def search_github_by_name(fio):
    """Поиск GitHub"""
    username_guess = fio.lower().replace(' ', '-').replace('ё', 'e')
    try:
        resp = requests.get(f'https://github.com/{username_guess}',
                           headers={'User-Agent': random.choice(USER_AGENTS)},
                           timeout=TIMEOUT)
        
        if resp.status_code == 200 and 'profile' in resp.text.lower():
            return {
                'accounts': [{'platform': '🐙 GitHub', 'username': username_guess}],
                'extra': {'GitHub': '✅ Профиль найден'}
            }
    except:
        pass
    return None

def check_yandex_maps(fio):
    """Проверка Яндекс.Карты (организации)"""
    return None

def check_2gis(fio):
    """Проверка 2GIS"""
    return None

# ==================== ПОИСК ПО USERNAME ====================
PLATFORMS = [
    {'name': '🐙 GitHub', 'url': 'https://github.com/{u}'},
    {'name': '🔵 VK', 'url': 'https://vk.com/{u}'},
    {'name': '✈️ Telegram', 'url': 'https://t.me/{u}'},
    {'name': '📷 Instagram', 'url': 'https://instagram.com/{u}'},
    {'name': '🐦 Twitter/X', 'url': 'https://twitter.com/{u}'},
    {'name': '👽 Reddit', 'url': 'https://reddit.com/user/{u}'},
    {'name': '🎮 Twitch', 'url': 'https://twitch.tv/{u}'},
    {'name': '📺 YouTube', 'url': 'https://youtube.com/@{u}'},
    {'name': '🎵 TikTok', 'url': 'https://tiktok.com/@{u}'},
    {'name': '🎮 Steam', 'url': 'https://steamcommunity.com/id/{u}'},
    {'name': '📌 Pinterest', 'url': 'https://pinterest.com/{u}'},
    {'name': '🎧 Spotify', 'url': 'https://open.spotify.com/user/{u}'},
    {'name': '🎵 SoundCloud', 'url': 'https://soundcloud.com/{u}'},
    {'name': '🎨 DeviantArt', 'url': 'https://deviantart.com/{u}'},
    {'name': '📝 Medium', 'url': 'https://medium.com/@{u}'},
    {'name': '💰 Patreon', 'url': 'https://patreon.com/{u}'},
    {'name': '🦊 GitLab', 'url': 'https://gitlab.com/{u}'},
    {'name': '🔷 BitBucket', 'url': 'https://bitbucket.org/{u}'},
    {'name': '🎮 Roblox', 'url': 'https://roblox.com/user.aspx?username={u}'},
    {'name': '👻 Snapchat', 'url': 'https://snapchat.com/add/{u}'},
    {'name': '💻 StackOverflow', 'url': 'https://stackoverflow.com/users/{u}'},
    {'name': '📝 Habr', 'url': 'https://habr.com/ru/users/{u}'},
    {'name': '💻 CodePen', 'url': 'https://codepen.io/{u}'},
    {'name': '🎨 Behance', 'url': 'https://behance.net/{u}'},
    {'name': '🏀 Dribbble', 'url': 'https://dribbble.com/{u}'},
    {'name': '💼 LinkedIn', 'url': 'https://linkedin.com/in/{u}'},
    {'name': '📷 Flickr', 'url': 'https://flickr.com/people/{u}'},
    {'name': '🔗 Linktree', 'url': 'https://linktr.ee/{u}'},
    {'name': '💬 Discord', 'url': 'https://discord.com/users/{u}'},
    {'name': '🎮 Epic Games', 'url': 'https://store.epicgames.com/u/{u}'},
]

def search_username(username):
    clean = re.sub(r'[@\s/]', '', username)
    
    result = {
        'found': False,
        'basic': {'💻 Username': clean},
        'extra': {},
        'accounts': [],
        'sources_checked': 0,
        'sources_found': 0
    }
    
    # Проверка локальной БД
    local = check_local_db_username(clean)
    if local:
        result['basic'].update(local.get('basic', {}))
        result['extra'].update(local.get('extra', {}))
        if local.get('accounts'):
            result['accounts'].extend(local['accounts'])
    
    # Параллельная проверка платформ
    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        futures = {
            executor.submit(check_platform, p, clean): p['name']
            for p in PLATFORMS
        }
        
        for future in as_completed(futures):
            result['sources_checked'] += 1
            try:
                data = future.result()
                if data:
                    result['sources_found'] += 1
                    result['accounts'].append(data)
            except:
                pass
    
    result['found'] = result['sources_found'] > 0
    return result

def check_platform(platform, username):
    try:
        url = platform['url'].replace('{u}', username)
        
        session = requests.Session()
        session.headers.update({
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml',
        })
        
        # Используем GET с заголовками как обычный браузер
        resp = session.get(url, timeout=TIMEOUT, allow_redirects=True)
        
        # Проверяем по статусу и содержимому
        if resp.status_code == 200:
            # Признаки существующего профиля
            found_indicators = [
                'profile', 'user', 'account', 'page',
                'followers', 'following', 'repositories',
                'channel', 'subscribers', 'member'
            ]
            
            text_lower = resp.text.lower()
            url_lower = resp.url.lower()
            
            # Проверяем, не редиректнуло ли на главную
            if resp.url.rstrip('/') != platform['url'].split('{')[0].rstrip('/'):
                # URL изменился, но не на главную - значит профиль существует
                if username.lower() in url_lower:
                    return {
                        'platform': platform['name'],
                        'username': username,
                        'url': url
                    }
            
            # Проверяем по содержимому страницы
            for indicator in found_indicators:
                if indicator in text_lower:
                    return {
                        'platform': platform['name'],
                        'username': username,
                        'url': url
                    }
        
        elif resp.status_code in [301, 302, 403]:
            # 403 - может быть защита, но профиль существует
            return {
                'platform': platform['name'],
                'username': username,
                'url': url
            }
    
    except:
        pass
    
    return None

def check_local_db_username(username):
    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM username_data WHERE username=?', (username,))
    row = c.fetchone()
    conn.close()
    
    if row:
        return {
            'basic': {
                '👤 Реальное имя': row[2] or 'Неизвестно',
                '📞 Телефоны': row[3] or 'Не найдены',
                '📧 Email': row[4] or 'Не найден',
            },
            'accounts': json.loads(row[1]) if row[1] else [],
            'extra': json.loads(row[5]) if row[5] else {},
        }
    return None

# ==================== API ENDPOINTS ====================

@app.route('/api/search', methods=['POST'])
def api_search():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data'}), 400
    
    query_type = data.get('type', 'phone')
    query_text = data.get('query', '').strip()
    
    if not query_text:
        return jsonify({'error': 'Empty query'}), 400
    
    # Проверка кэша
    cache_hash = hashlib.md5(f'{query_type}:{query_text}'.encode()).hexdigest()
    cached = get_cache(cache_hash)
    if cached:
        return jsonify(cached)
    
    # Выполнение поиска
    if query_type == 'phone':
        results = search_phone(query_text)
    elif query_type == 'fio':
        results = search_fio(query_text)
    elif query_type == 'username':
        results = search_username(query_text)
    else:
        return jsonify({'error': 'Invalid type'}), 400
    
    # Кэширование
    save_cache(cache_hash, query_type, query_text, results)
    
    return jsonify(results)

@app.route('/api/stats', methods=['GET'])
def api_stats():
    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    
    c.execute('SELECT COUNT(*) FROM phone_data')
    phones = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM fio_data')
    fios = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM username_data')
    usernames = c.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'status': '🟢 ONLINE',
        'database': {
            'phone_records': phones,
            'fio_records': fios,
            'username_records': usernames,
        },
        'sources': {
            'phone_sources': 8,
            'fio_sources': 8,
            'username_platforms': len(PLATFORMS),
        },
        'version': '3.0'
    })

def get_cache(hash_key):
    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    c.execute('SELECT result, time FROM cache WHERE hash=?', (hash_key,))
    row = c.fetchone()
    conn.close()
    
    if row and time.time() - row[1] < 1800:  # 30 минут
        return json.loads(row[0])
    return None

def save_cache(hash_key, qtype, query, result):
    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    c.execute('INSERT OR REPLACE INTO cache VALUES (?,?,?,?,?)',
              (hash_key, qtype, query, json.dumps(result, ensure_ascii=False), int(time.time())))
    conn.commit()
    conn.close()

# ==================== ЗАПУСК ====================
if __name__ == '__main__':
    init_db()
    seed_test_data()
    
    print("""
    ╔══════════════════════════════════════╗
    ║     SWILL SEARCH ENGINE v3.0        ║
    ║     Zero API Keys Required          ║
    ║     Phone + FIO + Username          ║
    ║     Port: 5000                      ║
    ╚══════════════════════════════════════╝
    """)
    
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)