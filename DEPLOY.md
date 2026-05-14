# Деплой и хранилище (Deploy)

## 1. Одноразовая настройка Supabase Storage (нужно сделать ОДИН раз)

Фото товаров теперь хранятся в **Supabase Storage** (бакет `products`),
а не в Cloudinary. Старые фото, уже загруженные в Cloudinary, продолжают
работать — их URL хранятся в БД и просто отдаются как есть.

### Шаги (≈3 минуты)

1. Открыть Supabase Dashboard → **SQL Editor** → **New query**.
2. Вставить содержимое файла `supabase/storage-setup.sql` и нажать **Run**.
   Это создаёт публичный бакет `products` и политики доступа.
3. Открыть **Settings → API**, скопировать значение **`service_role` secret**
   и добавить в `.env`:

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...  # сюда вставить секрет
```

После этого перезапустить дев-сервер (`npm run dev`).
На Vercel — добавить ту же переменную в **Environment Variables** и
сделать redeploy.

### Зачем service-role?

Загрузка/удаление файлов в Supabase Storage и удаление товаров идёт
с сервера. Политики бакета `products` разрешают запись только service-роли
(публикуемый ключ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
доступен в браузере — давать ему права на запись небезопасно).

---

## 2. Полный список переменных окружения

Обязательные:

- `NEXT_PUBLIC_SUPABASE_URL` — URL проекта Supabase
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — publishable/anon ключ
- `SUPABASE_SERVICE_ROLE_KEY` — service-role секрет (см. выше)
- `ADMIN_LOGIN`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` — учётка админки

Необязательные (только если остаются старые фото в Cloudinary —
для возможности их удалить из админки):

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

---

## 3. Автоматическое обновление публичного сайта

Любое изменение в админке (создать/обновить/удалить товар, добавить/
удалить/переставить фото, изменить позицию обрезки) сразу инвалидирует
кэш с тегом `products`. Главная, галерея и страница товара рендерятся
заново при следующем запросе — без ожидания 5-минутного TTL.

---

## 4. Что админка умеет автономно

После настройки выше клиент может полностью сам:

- создавать, редактировать, удалять товары;
- загружать, переставлять, удалять, обрезать фото (хранятся в Supabase Storage);
- скрывать/показывать товары, отмечать «New», менять порядок.

Все изменения сразу попадают в Supabase и сразу же видны на сайте.

---

## 5. Если на проде нет блока «New / Latest pieces»

Блок показывается только если:

1. Заданы `NEXT_PUBLIC_SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` на хостинге.
2. В таблице `products` есть записи с `is_new = true` и `is_active = true`.
