# 🚀 Как запустить FinTrack Pro

## ✅ Текущий статус:

- ✅ База данных: **Running** (PostgreSQL + Redis)
- ✅ Миграции: **Applied** (8 таблиц созданы)
- ✅ Зависимости: **Installed**
- ✅ Код: **Ready** (24 коммита, 0 ошибок)

## 🎯 Запуск (САМЫЙ ПРОСТОЙ СПОСОБ):

```bash
./START_APP.sh
```

**Готово!** Приложение запустится на:
- 🌐 **Frontend:** http://localhost:4000
- 🔌 **Backend:** http://localhost:4001/api/v1

---

## 📝 Пошаговая инструкция:

### 1. Убедись что Docker запущен:
```bash
docker-compose ps
```

Должны быть:
- ✅ fintrack-postgres (healthy)
- ✅ fintrack-redis (healthy)

### 2. Запусти backend:
```bash
cd /home/nod/money/backend
pnpm dev
```

Дождись сообщения:
```
🚀 FinTrack Pro Backend API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server: http://0.0.0.0:4001
📍 API: http://0.0.0.0:4001/api/v1
```

### 3. Запусти frontend (новый терминал):
```bash
cd /home/nod/money/frontend
PORT=4000 pnpm dev
```

Дождись сообщения:
```
✓ Ready in 3.5s
○ Local: http://localhost:4000
```

### 4. Открой браузер:
```
http://localhost:4000
```

---

## 🎨 Что делать после запуска:

### Шаг 1: Регистрация
1. Открой http://localhost:4000
2. Нажми **"Get Started"**
3. Заполни форму:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `Test123!@#` (мин 8 символов, uppercase, lowercase, число, спецсимвол)
4. Нажми **"Create Account"**

### Шаг 2: Добавь расход
1. Перейди в **"Expenses"** (📊)
2. Нажми **"+ New Expense"**
3. Заполни:
   - Amount: `45.50`
   - Description: `Groceries`
   - Date: сегодня
4. Нажми **"Save Expense"**

### Шаг 3: Добавь доход
1. Перейди в **"Income"** (💰)
2. Нажми **"+ New Income"**
3. Заполни:
   - Amount: `5000`
   - Source: `Monthly Salary`
   - Date: сегодня
4. Нажми **"Save Income"**

### Шаг 4: Создай категорию
1. Перейди в **"Categories"** (📁)
2. Нажми **"+ New Category"**
3. Заполни:
   - Name: `Food & Dining`
   - Выбери иконку: 🍔
   - Выбери цвет: Фиолетовый
   - Enable Budget: ✅
   - Budget: `500`
   - Period: Monthly
4. Нажми **"Save Category"**

### Шаг 5: Посмотри Dashboard
1. Перейди в **"Dashboard"**
2. Увидишь:
   - Total Balance: $4,954.50
   - Expenses: $45.50
   - Income: $5,000.00

### Шаг 6: Аналитика
1. Перейди в **"Analytics"** (📈)
2. Увидишь графики:
   - Category Breakdown (Pie chart)
   - Cash Flow (Bar chart)
   - Monthly Comparison
   - Top Expenses

### Шаг 7: Включи 2FA (опционально)
1. Перейди в профиль
2. Generate 2FA QR Code
3. Отсканируй в Google Authenticator
4. Введи 6-значный код
5. 2FA включен! 🔐

---

## 🔧 Troubleshooting:

### Если не запускается:

**Проверь порты:**
```bash
netstat -tlnp | grep -E ":(4000|4001)"
```

**Если заняты, убей процессы:**
```bash
pkill -9 -f "nest start"
pkill -9 -f "next dev"
```

**Проверь Docker:**
```bash
docker-compose ps
```

**Если база не работает:**
```bash
docker-compose restart postgres redis
```

**Посмотри логи:**
```bash
tail -f /tmp/fintrack-backend.log
tail -f /tmp/fintrack-frontend.log
```

---

## 📊 Endpoints для тестирования:

### Backend Health:
```bash
curl http://localhost:4001/api/v1/health
```

### Register User:
```bash
curl -X POST http://localhost:4001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "username": "demo",
    "password": "Demo123!@#"
  }'
```

### Login:
```bash
curl -X POST http://localhost:4001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "Demo123!@#"
  }'
```

---

## 🎯 Готово к использованию!

**Приложение запущено на:**
- 🌐 Frontend: **http://localhost:4000**
- 🔌 Backend: **http://localhost:4001/api/v1**

**Просто открой браузер и начни работать!** 🎉

---

## 📚 Дополнительно:

- **QUICK_START.md** - Быстрый старт
- **PROJECT_SUMMARY.md** - Полное описание проекта
- **docs/API.md** - Все 58 API endpoints
- **DEPLOY_NOW.md** - Деплой на production

**Enjoy FinTrack Pro!** 💰📊✨
