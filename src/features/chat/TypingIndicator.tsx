import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firestore";

type TypingDoc = {
  uid: string;
  email: string | null;
  isTyping: boolean;
  updatedAt?: Timestamp;
};

type Props = {
  roomId: string;
  selfUid: string;
};

export function TypingIndicator({ roomId, selfUid }: Props) {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    const ref = collection(db, "rooms", roomId, "typing");
    const q = query(ref, where("isTyping", "==", true));

    const unsub = onSnapshot(q, (snap) => {
      const now = Date.now();
      const active = snap.docs
        .map((d) => d.data() as TypingDoc)
        .filter((t) => t.uid !== selfUid)
        // best-effort: only show if updated in last 10s
        .filter((t) => {
          const ms = t.updatedAt?.toDate?.()?.getTime?.();
          return ms ? now - ms < 10_000 : true;
        })
        .map((t) => t.email ?? t.uid);

      setNames(active);
    });

    return () => unsub();
  }, [roomId, selfUid]);

  if (names.length === 0) return null;

  const label =
    names.length === 1 ? `${names[0]} is typing...` : `Multiple people are typing...`;

  return <div style={{ marginTop: 6, opacity: 0.8, fontSize: 13 }}>{label}</div>;
}