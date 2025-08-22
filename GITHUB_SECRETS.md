# Секреты для GitHub Actions

## ГДЕ ДОБАВЛЯТЬ В GITHUB:
Settings > Secrets and variables > Actions > New repository secret

## КАКИЕ СЕКРЕТЫ НУЖНЫ В GITHUB:

### 1. BOT_TOKEN
Имя: BOT_TOKEN  
Значение: 8374658030:AAGic3F9KTovkklZcxq-Bq1chzteSqB3_6E

### 2. VERCEL_TOKEN  
Имя: VERCEL_TOKEN
Как получить:
- Идите на https://vercel.com/account/tokens
- Нажмите "Create Token"
- Скопируйте созданный токен

### 3. VERCEL_ORG_ID
Имя: VERCEL_ORG_ID  
Как получить:
- Идите в ваш проект на Vercel: https://vercel.com/dashboard
- Выберите проект "poistenie-gm-bot"  
- Settings > General
- Найдите "Team ID" (если личный аккаунт, то "Personal Account ID")

### 4. VERCEL_PROJECT_ID
Имя: VERCEL_PROJECT_ID
Как получить:
- Там же в Settings > General
- Найдите "Project ID"

---

## В VERCEL НИЧЕГО ДОБАВЛЯТЬ НЕ НУЖНО!

GitHub Action сам задеплоит проект и установит webhook.
Vercel переменные нужны только если хотите добавить BOT_TOKEN в Vercel для удобства (необязательно).
