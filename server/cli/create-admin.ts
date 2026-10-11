/**
 * Создание администратора или смена его пароля — выполняется на сервере:
 *
 *   npm run admin:create -- --email admin@example.ru [--name "Имя"]
 *   npm run admin:create -- --email admin@example.ru --reset   # смена пароля
 *
 * Пароль запрашивается в терминале (не отображается при вводе) или берётся из
 * переменной окружения ADMIN_PASSWORD (для автоматизации). В исходном коде паролей нет.
 */
import readline from "node:readline";
import { getDb, closeDb } from "../db";
import { seed } from "../db/seed";
import { hashPassword, validatePasswordStrength } from "../auth/password";
import { destroyAllSessions } from "../auth/session";

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const out = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
    let muted = false;
    out._writeToOutput = (s: string) => {
      if (!muted) out.output.write(s);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  const email = (arg("email") ?? "").trim().toLowerCase();
  const name = arg("name") ?? "";
  const reset = process.argv.includes("--reset");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Укажите e-mail: npm run admin:create -- --email admin@example.ru");
    process.exit(1);
  }
  const db = getDb();
  seed(db);
  const existing = db.prepare("SELECT id FROM admins WHERE email = ?").get(email) as { id: number } | undefined;
  if (existing && !reset) {
    console.error("Администратор с таким e-mail уже есть. Для смены пароля добавьте --reset");
    process.exit(1);
  }
  if (!existing && reset) {
    console.error("Администратор не найден");
    process.exit(1);
  }

  let password = process.env.ADMIN_PASSWORD ?? "";
  if (!password) {
    if (!process.stdin.isTTY) {
      console.error("Нет терминала для ввода пароля: задайте переменную окружения ADMIN_PASSWORD");
      process.exit(1);
    }
    password = await askHidden("Пароль: ");
    const repeat = await askHidden("Повторите пароль: ");
    if (password !== repeat) {
      console.error("Пароли не совпадают");
      process.exit(1);
    }
  }
  const weak = validatePasswordStrength(password);
  if (weak) {
    console.error(weak);
    process.exit(1);
  }
  const hash = await hashPassword(password);
  if (existing) {
    db.prepare("UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?").run(hash, new Date().toISOString(), existing.id);
    destroyAllSessions(db, existing.id);
    console.log(`Пароль администратора ${email} изменён, все его сессии завершены.`);
  } else {
    db.prepare("INSERT INTO admins (email, name, password_hash) VALUES (?, ?, ?)").run(email, name, hash);
    console.log(`Администратор ${email} создан. Вход: /admin`);
  }
  closeDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
