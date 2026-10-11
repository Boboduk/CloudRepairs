import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../auth";
import { errorText } from "../api";

export default function LoginPage() {
  const { login, expired } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Вход — админ-панель CloudRepairs";
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError("Введите e-mail и пароль");
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(errorText(err));
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="a-login">
      <form className="a-login-card" onSubmit={submit} noValidate>
        <img src="/brand/logo-horizontal.png" alt="CloudRepairs" width={180} height={40} style={{ objectFit: "contain", objectPosition: "left" }} />
        <h1>Вход в админ-панель</h1>
        <p>Управление содержимым сайта cloudrepairs.ru</p>
        {expired && !error && <div className="a-alert info">Сеанс завершён. Войдите снова.</div>}
        {error && (
          <div className="a-alert error" role="alert" data-testid="login-error">
            {error}
          </div>
        )}
        <div className="a-field">
          <label className="a-label" htmlFor="email">
            E-mail
          </label>
          <input id="email" name="email" type="email" className="a-input" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </div>
        <div className="a-field">
          <label className="a-label" htmlFor="password">
            Пароль
          </label>
          <input id="password" name="password" type="password" className="a-input" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="a-btn a-btn-primary" style={{ width: "100%", minHeight: 46, marginTop: 6 }} disabled={busy}>
          {busy ? "Вход…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
