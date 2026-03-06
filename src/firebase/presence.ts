import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firestore";

type PresenceUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

async function setOnline(user: PresenceUser) {
  const ref = doc(db, "usersPresence", user.uid);
  await setDoc(
    ref,
    {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      status: "online",
      lastSeen: serverTimestamp(),
    },
    { merge: true }
  );
}

async function setOffline(user: PresenceUser) {
  const ref = doc(db, "usersPresence", user.uid);
  await setDoc(
    ref,
    {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      status: "offline",
      lastSeen: serverTimestamp(),
    },
    { merge: true }
  );
}

// Best-effort presence: online on mount, offline on unmount/hidden/unload
export function startPresence(user: PresenceUser) {
  let stopped = false;

  const goOnline = () => {
    if (stopped) return;
    void setOnline(user);
  };

  const goOffline = () => {
    if (stopped) return;
    void setOffline(user);
  };

  goOnline();

  const onVisibility = () => {
    if (document.visibilityState === "hidden") goOffline();
    if (document.visibilityState === "visible") goOnline();
  };

  const onPageHide = () => goOffline();
  const onBeforeUnload = () => goOffline();

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("beforeunload", onBeforeUnload);

  return () => {
    stopped = true;
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", onPageHide);
    window.removeEventListener("beforeunload", onBeforeUnload);
    goOffline();
  };
}