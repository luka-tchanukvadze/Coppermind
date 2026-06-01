"use client";

import { useEffect } from "react";

// last-resort boundary: catches throws in the root layout itself, where the
// (main)/error.tsx shell isn't mounted. must render its own <html>/<body>
// because it REPLACES the root layout. kept dependency-free (no app fonts/
// providers) so it can't fail to render
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#faf7f0",
          color: "#1a1a1a",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: 500, margin: 0 }}>
          Something went wrong
        </h2>
        <p style={{ marginTop: "0.5rem", maxWidth: "24rem", color: "#6b6456" }}>
          The app ran into an unexpected error. Reloading usually fixes it.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1.25rem",
            borderRadius: "0.375rem",
            border: "none",
            background: "#2d4a3e",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
