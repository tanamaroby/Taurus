"use client";

import { useEffect, useState } from "react";

export function ServiceWorkerRegister() {
  const [showUpdateNotice, setShowUpdateNotice] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [updateDetectedAt, setUpdateDetectedAt] = useState<number | null>(null);

  const showNotice = () => {
    setUpdateDetectedAt(Date.now());
    setShowUpdateNotice(true);
  };

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    let hasPendingUpdate = false;

    const onControllerChange = () => {
      if (hasPendingUpdate) {
        showNotice();
      }
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        if (registration.waiting && !dismissed) {
          showNotice();
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;

          if (!newWorker) {
            return;
          }

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              hasPendingUpdate = true;
              if (!dismissed) {
                showNotice();
              }
            }
          });
        });
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    };

    registerServiceWorker();

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, [dismissed]);

  if (!showUpdateNotice) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        right: "1rem",
        bottom: "1rem",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        maxWidth: "min(92vw, 28rem)",
        borderRadius: "0.875rem",
        border: "1px solid rgba(15, 118, 110, 0.35)",
        background: "rgba(240, 253, 250, 0.95)",
        padding: "0.75rem 0.875rem",
        boxShadow: "0 8px 30px rgba(15, 23, 42, 0.15)",
        color: "#0f172a",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          fontSize: "0.92rem",
          lineHeight: 1.3,
          display: "flex",
          flexDirection: "column",
          gap: "0.15rem",
        }}
      >
        <span>New version available.</span>
        <span
          style={{
            fontSize: "0.76rem",
            color: "#334155",
          }}
        >
          Detected at{" "}
          {updateDetectedAt
            ? new Date(updateDetectedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "just now"}
        </span>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          border: "none",
          borderRadius: "0.625rem",
          background: "#0f766e",
          color: "#ffffff",
          fontSize: "0.86rem",
          fontWeight: 600,
          padding: "0.45rem 0.7rem",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Refresh
      </button>
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          setShowUpdateNotice(false);
        }}
        style={{
          border: "1px solid rgba(15, 118, 110, 0.45)",
          borderRadius: "0.625rem",
          background: "transparent",
          color: "#0f766e",
          fontSize: "0.82rem",
          fontWeight: 600,
          padding: "0.4rem 0.65rem",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
