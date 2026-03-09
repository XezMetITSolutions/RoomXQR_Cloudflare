import React, { useEffect, useState } from "react";

const OfflineNotice = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      background: "#ffcc00",
      color: "#222",
      textAlign: "center",
      padding: "10px",
      zIndex: 9999
    }}>
      Şu anda çevrimdışısınız. Son kaydedilen menü gösteriliyor.
    </div>
  );
};

export default OfflineNotice;
