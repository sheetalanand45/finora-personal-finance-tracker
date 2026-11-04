import { useState } from "react";
import { Wallet, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import "./Auth.css";

const API_URL = "http://localhost:5000/api/auth";

export default function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (mode === "signup" && !name.trim()) {
      toast.error("Enter your name.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/${mode === "signup" ? "signup" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(mode === "signup" ? { name: name.trim() } : {}),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Authentication failed.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("finora-user", JSON.stringify(data.user));

      toast.success(mode === "signup" ? "Account created!" : "Welcome back!");
      onAuthenticated(data.user);
    } catch (error) {
      toast.error(error.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo"><Wallet size={22} /></span>
          <span>Finora<span className="auth-dot">.</span></span>
        </div>

        <h1>{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-subtitle">
          {mode === "signup"
            ? "Start managing your money with Finora."
            : "Sign in to continue to your finance dashboard."}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <label>
              Full name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <span className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "signup"
              ? "Create account"
              : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "signup" ? "Already have an account?" : "New to Finora?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setPassword("");
            }}
          >
            {mode === "signup" ? "Log in" : "Create an account"}
          </button>
        </p>
      </section>
    </main>
  );
}