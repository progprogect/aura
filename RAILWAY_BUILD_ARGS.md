# 🔧 Настройка Build Arguments на Railway

## ⚠️ Важно!

Для работы SSG (Static Site Generation) нужно передать DATABASE_URL во время сборки.

---

## 📝 Настройка на Railway:

### **Шаг 1: Открой Settings**

Railway → Твой Next.js сервис → **Settings**

### **Шаг 2: Включи Build Arguments**

Прокрути вниз до секции **"Build"**

Найди **"Pass service variables to build"** и **ВКЛЮЧИ** этот чекбокс ✅

**Это передаст все переменные окружения как build arguments!**

---

## ✅ Что это делает:

Railway автоматически передаст:
- `DATABASE_URL` → доступен во время `npm run build`
- `REDIS_URL` → доступен во время `npm run build`

Теперь `generateStaticParams` сможет подключиться к БД и сгенерировать статические страницы!

---

## 🚀 После включения:

1. Сохрани настройки
2. Railway автоматически начнет redeploy
3. Деплой должен пройти успешно!

---

## ⏱ Займет: 1 минута

