# Контрольний деплой виправлення пам’яті

## Що змінюється

Next.js зафіксовано на **16.3.4**. `patches/next+16.3.4.patch` переносить cleanup з [upstream PR #97476](https://github.com/vercel/next.js/pull/97476) у CommonJS та ESM файли встановленого пакета. Після завершення cache prerender скасовується допоміжний composite signal, щоб React відпустив його listener. Стан справжнього timeout зберігається **до** cleanup; прямий timeout signal без composite не скасовується.

`npm ci` автоматично застосовує патч через `postinstall`. Docker копіює `patches/` до встановлення залежностей, тому зміна патча також скидає відповідний build cache. `prebuild` перевіряє обидва модулі, `postbuild` перевіряє, що standalone містить той самий виправлений CommonJS файл. Невдала перевірка зупиняє збірку.

Node у першому контрольному образі залишається **24.13.0-slim**, щоб оцінити вплив виправлення Next окремо. **24.20.0 — LTS**, Docker-тег `24.20.0-slim` перевірено; це доречне наступне оновлення. Локальний GC probe відтворив утримання сигналів і на 24.13.0, і на 24.20.0, тому перехід Node сам по собі не є виправленням знайденого механізму. [Реліз Node](https://nodejs.org/en/blog/release/v24.20.0).

Повернення на історичну **Next 16.2.10** не обране: після неї вийшли критичні security fixes, опубліковані для 16.3.3 і 15.5.24. Відкат старого framework потребує окремої оцінки цих виправлень. [Security release](https://nextjs.org/blog/august-2026-security-release).

## Порядок дій

1. Перевірити diff і включити у коміт `package.json`, `package-lock.json`, `Dockerfile`, `patches/next+16.3.4.patch`, `scripts/verify-next-cache-patch.mjs`, `scripts/next-cache-cleanup.test.ts` та документацію. У workspace також є раніше підготовлені Clarity/ESLint зміни та окрема правка каталогу; перед staging переглянути їх, не робити сліпий `git add .`. Поточний package/lock уже включає Clarity, отже не публікувати відповідні UI imports без цієї залежності.
2. Зробити commit і push у `main`. Саме push у `main` запускає `.github/workflows/build-docker.yaml`.
3. Дочекатися успіху **Build Docker image** і **Push Docker image**. У build log мають бути застосування `next@16.3.4` та `[next-cache-patch] Verified Next 16.3.4 and standalone.`
4. Зберегти тег/digest поточного Aruba образу для повернення. Новий образ публікується як `serhiioberemchuk/on-smart:<повний SHA коміту>` і `:latest`. Для однозначної перевірки обрати SHA нового успішного workflow.
5. У Aruba виконати **Redeploy** application container на цей образ. Поточний workflow лише публікує Docker image: автоматичний Aruba redeploy закоментований. Звичайний restart старого контейнера не встановлює новий образ.
6. Перевірити startup log, каталог, товар, кошик, вхід і адмінку. Перевірку оплати виконувати у sandbox провайдера. Код не додає міграцій; чинний startup script як і раніше перевіряє/застосовує раніше наявні pending migrations, тому перед redeploy звірити їхній стан.
7. Залишити поточний ліміт **896 MiB** і збирати memory log **24–48 годин** під звичайним трафіком. Після прогрівання порівнювати нижній рівень `heapUsed` та `arrayBuffers`, а також RSS. Падіння пам’яті одразу після restart очікуване й саме по собі не доводить виправлення. Не робити heap snapshot під час порівняння RSS.
8. Якщо криві далі ростуть або з’явиться функціональна регресія, зафіксувати image SHA та журнал; повернути попередній перевірений образ за потреби й продовжити аналіз утримувачів heap. Кодова перевірка cleanup не доводить, що всі production-причини усунуті.

## Подальше оновлення Next

Локальна перевірка: [patch-validation.json](patch-validation.json). Усі 56 тестів та production build проходять; два regression tests падали до cleanup і проходять після. Нові scripts проходять ESLint, але загальний lint залишається червоним через 94 наявні помилки та 26 попереджень. MySQL локально недоступний, тому успішна збірка не замінює runtime-перевірку магазину. Повний Linux Docker image локально не збирався; його перевіряє GitHub Actions після push. Production ще не змінено.

Коли стабільний реліз включить upstream cleanup, перевірити його реалізацію, прибрати backport, `patch-package` і спеціальні build hooks, адаптувати/прибрати прив’язані до старого вихідного коду тести та виконати quality gates. Не оновлювати Next з ігноруванням помилки патча.
