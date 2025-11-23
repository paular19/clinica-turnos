"use client";

import React from "react";

type Props = { error: Error; reset: () => void };

export default function ErrorBoundary({ error, reset }: Props) {
  return (
    <div style={{ padding: 24 }}>
      <h2>Something went wrong</h2>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f8f8f8", padding: 12 }}>{error?.message}</pre>
      <button onClick={() => reset?.()}>Try again</button>
    </div>
  );
}
