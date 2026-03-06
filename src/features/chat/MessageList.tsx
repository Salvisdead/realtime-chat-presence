import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "../../firebase/firestore";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";

type Message = {
  id: string;
  text: string;
  uid: string;
  email: string | null;
  createdAt: Timestamp | null;
};

function formatTime(ts: Timestamp | null) {
  if (!ts) return "";
  const d = ts.toDate();
  return d.toLocaleString();
}

type Props = {
  roomId: string;
  uid: string;
  email: string | null;
};

const PAGE_SIZE = 30;

export function MessageList({ roomId, uid, email }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canLoadMore, setCanLoadMore] = useState(false);

  const oldestDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setMessages([]);
    oldestDocRef.current = null;
    setCanLoadMore(false);

    const messagesRef = collection(db, "rooms", roomId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"), limit(PAGE_SIZE));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs;
        oldestDocRef.current = docs.length > 0 ? docs[docs.length - 1] : null;
        setCanLoadMore(docs.length === PAGE_SIZE);

        const page: Message[] = docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            text: data.text ?? "",
            uid: data.uid ?? "",
            email: data.email ?? null,
            createdAt: data.createdAt ?? null,
          };
        });

        setMessages(page.reverse());
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [roomId]);

  async function loadMore() {
    if (!oldestDocRef.current) return;

    setLoadingMore(true);
    setError(null);

    try {
      const messagesRef = collection(db, "rooms", roomId, "messages");
      const qMore = query(
        messagesRef,
        orderBy("createdAt", "desc"),
        startAfter(oldestDocRef.current),
        limit(PAGE_SIZE)
      );

      const snap = await getDocs(qMore);
      const docs = snap.docs;

      if (docs.length > 0) oldestDocRef.current = docs[docs.length - 1];
      setCanLoadMore(docs.length === PAGE_SIZE);

      const older: Message[] = docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          text: data.text ?? "",
          uid: data.uid ?? "",
          email: data.email ?? null,
          createdAt: data.createdAt ?? null,
        };
      });

      setMessages((prev) => [...older.reverse(), ...prev]);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 10, height: 460 }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Messages</h2>
        {canLoadMore && (
          <button onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        )}
      </div>

      {error && <div style={{ color: "tomato" }}>Messages error: {error}</div>}

      {/* Scroll area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: 6,
          borderRadius: 10,
        }}
      >
        {loading && <div>Loading messages...</div>}

        {!loading && !error && messages.length === 0 && (
          <p style={{ margin: 0, opacity: 0.8 }}>No messages yet.</p>
        )}

        {!loading && !error && messages.length > 0 && (
          <div style={{ display: "grid", gap: 10 }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <b style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.email ?? m.uid}
                  </b>
                  <span style={{ opacity: 0.7, fontSize: 12 }}>{formatTime(m.createdAt)}</span>
                </div>
                <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{m.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TypingIndicator roomId={roomId} selfUid={uid} />
      <MessageInput roomId={roomId} uid={uid} email={email} />
    </div>
  );
}