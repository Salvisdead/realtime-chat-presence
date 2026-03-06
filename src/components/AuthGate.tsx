import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { auth } from "../firebase/auth";
import { RegisterForm } from "../features/auth/RegisterForm";
import { LoginForm } from "../features/auth/LoginForm";

type Props = {
  children: (user: User) => ReactNode;
};

export function AuthGate({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"register" | "login">("register");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  if (!user) {
    return (
      <div
        style={{
          padding: 24,
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ display: "grid", gap: 14, justifyItems: "center" }}>
          <h1 style={{ margin: 0 }}>Realtime Chat + Presence</h1>

          {mode === "register" ? <RegisterForm /> : <LoginForm />}

          <button
            type="button"
            onClick={() => setMode((m) => (m === "register" ? "login" : "register"))}
            style={{ background: "transparent", border: "none", color: "white", opacity: 0.9 }}
          >
            {mode === "register"
              ? "Already have an account? Login"
              : "New here? Create an account"}
          </button>
        </div>
      </div>
    );
  }

  return <>{children(user)}</>;
}