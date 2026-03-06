import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "../../firebase/auth";

type Props = {
  onDone?: () => void;
};

export function RegisterForm({ onDone }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      onDone?.();
    } catch (err: any) {
      setError(err?.message ?? "Failed to register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleRegister} style={{ display: "grid", gap: 10, width: 320 }}>
      <h2 style={{ margin: 0 }}>Register</h2>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Email</span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Password</span>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create account"}
      </button>

      {error && <p style={{ color: "tomato", margin: 0 }}>{error}</p>}

      <p style={{ margin: 0, opacity: 0.8, fontSize: 12 }}>
        Password must be at least 6 characters.
      </p>
    </form>
  );
}