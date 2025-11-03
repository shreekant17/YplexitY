"use client";

import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

/**
 * Tracks how often a user opens the app (frequency metric)
 * @param {Object} options
 * @param {string} options.userId - Required user ID
 * @param {string} [options.apiPath="/api/analytics/open"]
 * @param {number} [options.cooldownMs=3000]
 * @param {string} [options.platform="web"]
 */
export default function useAppOpenTracker({
    userId,
    apiPath = "/api/analytics/open",
    cooldownMs = 3000,
    platform = "web",
} = {}) {
    const lastSentRef = useRef(0);
    const sessionIdRef = useRef(null);

    // Initialize session ID (once per browser tab/session)
    if (typeof window !== "undefined" && !sessionIdRef.current) {
        sessionIdRef.current =
            sessionStorage.getItem("appSessionId") || uuidv4();
        sessionStorage.setItem("appSessionId", sessionIdRef.current);
    }

    useEffect(() => {
        if (!userId) return; // Don't send events if user is not logged in

        const sendOpen = async () => {
            try {
                const now = Date.now();
                if (now - lastSentRef.current < cooldownMs) return;
                lastSentRef.current = now;

                await fetch(apiPath, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId, // include if your API accepts it; otherwise remove
                        sessionId: sessionIdRef.current,
                        platform,
                    }),
                    credentials: "include",
                });
            } catch (e) {
                console.warn("Failed to send open event:", e);
            }
        };

        // Trigger when the app becomes visible again
        const handleVisibility = () => {
            if (document.visibilityState === "visible") sendOpen();
        };

        // Trigger when window gains focus
        const handleFocus = () => sendOpen();

        // Register listeners
        window.addEventListener("focus", handleFocus);
        document.addEventListener("visibilitychange", handleVisibility);

        // Fire once on mount
        sendOpen();

        // Cleanup
        return () => {
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [userId, apiPath, cooldownMs, platform]);
}
