import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase/auth";
import { startPresence } from "../firebase/presence";
import { RoomList } from "../features/chat/RoomList";
import { MessageList } from "../features/chat/MessageList";
import { OnlineUsers } from "../features/chat/OnlineUsers";

type SelectedRoom = { id: string; name: string } | null;

export function AuthedApp({ user }: { user: User }) {
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom>({
    id: "general",
    name: "General",
  });

  useEffect(() => {
    const stop = startPresence({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    });
    return () => stop();
  }, [user.uid]);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        display: "grid",
        gap: 16,
        alignContent: "start",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Realtime Chat + Presence</h1>
          <p style={{ margin: 0, opacity: 0.8 }}>
            Signed in as <b>{user.email}</b>
          </p>
        </div>
        <button onClick={() => signOut(auth)} style={{ height: 40 }}>
          Logout
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div
          style={{
            padding: 16,
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
          }}
        >
          <RoomList
            selectedRoomId={selectedRoom?.id ?? null}
            onSelectRoom={(roomId) => {
              const name = roomId.charAt(0).toUpperCase() + roomId.slice(1);
              setSelectedRoom({ id: roomId, name });
            }}
          />
          <OnlineUsers />
        </div>

        <div
          style={{
            padding: 16,
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            minHeight: 520, // key: stop it shrinking/growing wildly per room
          }}
        >
          {selectedRoom ? (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ opacity: 0.85 }}>
                Room: <b>{selectedRoom.name}</b>
              </div>
              <MessageList roomId={selectedRoom.id} uid={user.uid} email={user.email} />
            </div>
          ) : (
            <p style={{ margin: 0 }}>Pick a room.</p>
          )}
        </div>
      </div>
    </div>
  );
}