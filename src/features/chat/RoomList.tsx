import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firestore";

export type Room = {
  id: string;
  name: string;
};

type Props = {
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
};

export function RoomList({ selectedRoomId, onSelectRoom }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "rooms"), orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: Room[] = snap.docs.map((d) => ({
          id: d.id,
          name: (d.data().name as string) ?? d.id,
        }));
        setRooms(next);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  if (loading) return <div>Loading rooms...</div>;
  if (error) return <div style={{ color: "tomato" }}>Rooms error: {error}</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <h2 style={{ margin: 0 }}>Rooms</h2>

      {rooms.length === 0 && <p style={{ margin: 0 }}>No rooms yet.</p>}

      {rooms.map((r) => {
        const active = r.id === selectedRoomId;
        return (
          <button
            key={r.id}
            onClick={() => onSelectRoom(r.id)}
            style={{
              textAlign: "left",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              background: active ? "rgba(255,255,255,0.12)" : "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            #{r.name}
          </button>
        );
      })}
    </div>
  );
}