import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "../../firebase/firestore";

type Props = {
  roomId: string;
  uid: string;
  email: string | null;
};

export function MessageInput({ roomId, uid, email }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typingTimer = useRef<number | null>(null);

  async function setTyping(isTyping: boolean) {
    const ref = doc(db, "rooms", roomId, "typing", uid);
    await setDoc(
      ref,
      {
        uid,
        email: email ?? null,
        isTyping,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  useEffect(() => {
    return () => {
      void setTyping(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  function handleChange(v: string) {
    setText(v);

    void setTyping(v.trim().length > 0);

    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      void setTyping(false);
    }, 1500);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      await setTyping(false);

      const messagesRef = collection(db, "rooms", roomId, "messages");
      await addDoc(messagesRef, {
        text: trimmed,
        uid,
        email: email ?? null,
        createdAt: serverTimestamp(),
      });

      setText("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to send");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <form onSubmit={handleSend} style={{ display: "flex", gap: 10 }}>
        <input
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "10px 12px", borderRadius: 8 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
      {error && <p style={{ color: "tomato", margin: "10px 0 0" }}>{error}</p>}
    </div>
  );
}