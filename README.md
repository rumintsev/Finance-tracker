## Перед запуском

Приложение обращается к пулу:

```bash
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'finance_tracker',
  password: '0000',
  port: 5432,
});
```

А это значит, что перед использованием должна быть настроена PostgreSQL база данных finance_tracker с таблицей expenses и столбцами id:int, name:char var, amount:int, date:date (yyyy-mm-dd)

## Команды запуска

Чтобы запустить приложение:

```bash
npm run dev
```

Чтобы запустить тесты:

```bash
npm run test
```
