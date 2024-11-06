"use client";

import { db } from "@/utils/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import useSWRSubscription from "swr/subscription";

export function useAdmin({ uid }) {
  const { data, error } = useSWRSubscription(
    uid ? [`admins/${uid}`] : null,
    ([path], { next }) => {
      try {
        const ref = doc(db, path);

        const unsub = onSnapshot(
          ref,
          (snapshot) => {
            next(null, snapshot.exists() ? snapshot.data() : null);
          },
          (error) => {
            console.error("Snapshot error:", error);
            next(error?.code || error?.message);
          }
        );

        return () => unsub();
      } catch (err) {
        console.error("Subscription error:", err);
        next(err?.message);
      }
    }
  );

  return {
    data,
    error,
    isLoading: !error && data === undefined,
  };
}
