import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // When coming back online, refetch all stale queries
      queryClient.refetchQueries({
        type: "active",
        stale: true,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queryClient]);

  return isOnline;
}
