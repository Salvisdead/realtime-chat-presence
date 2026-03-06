import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firestore";

type Presence = {
  uid: string;
  email: string | null;
  displayName: string | null;
  status: "online" | "offline";
};

export function OnlineUsers() {
  const [users, setUsers] = useState<Presence[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "usersPresence"), where("status", "==", "online"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Presence);
        // sort by name/email for stable display
        list.sort((a, b) => (a.email ?? a.uid).localeCompare(b.email ?? b.uid));
        setUsers(list);
      },
      (err) => setError(err.message)
    );

    return () => unsub();
  }, []);

  return (
    <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
      <h3 style={{ margin: 0 }}>Online</h3>

      {error && <div style={{ color: "tomato" }}>Presence error: {error}</div>}

      {users.length === 0 ? (
        <p style={{ margin: 0, opacity: 0.8 }}>No one online.</p>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {users.map((u) => (
            <div
              key={u.uid}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: 13,
                opacity: 0.95,
              }}
              title={u.uid}
            >
              {u.displayName ?? u.email ?? u.uid}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}