"use client";
import { useEffect, useRef } from "react";

/**
 * useScrollSpeed — tracks the user's average scroll speed
 * and periodically sends it to your backend.
 *
 * @param {object} options
 * @param {string} options.userId - Logged-in user's ID
 * @param {string} [options.apiPath="/api/analytics/scroll"] - API endpoint
 * @param {number} [options.intervalMs=1000] - Sampling interval (ms)
 * @param {number} [options.cooldownMs=5000] - Upload period (ms)
 */
export default function useScrollSpeed({
    userId,
    apiPath = "/api/analytics/scroll",
    intervalMs = 1000,
    cooldownMs = 5000,
} = {}) {
    const lastScrollTop = useRef(typeof window !== "undefined" ? window.scrollY : 0);
    const distance = useRef(0);
    const lastSent = useRef(0);

    useEffect(() => {
        if (!userId) return; // stop if no user

        const handleScroll = () => {
            const currentY = window.scrollY;
            distance.current += Math.abs(currentY - lastScrollTop.current);
            lastScrollTop.current = currentY;
        };

        const sendToServer = async () => {
            const now = Date.now();
            if (now - lastSent.current < cooldownMs) return;
            lastSent.current = now;

            // Calculate average pixels/sec since last send
            const avgSpeed = distance.current / (cooldownMs / 1000);
            distance.current = 0; // reset counter

            if (avgSpeed === 0) return; // skip if idle

            try {
                await fetch(apiPath, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId,
                        speed: avgSpeed,
                        timestamp: new Date().toISOString(),
                    }),
                });
            } catch (err) {
                console.error("Failed to log scroll speed", err);
            }
        };

        // attach listeners
        window.addEventListener("scroll", handleScroll, { passive: true });
        const interval = setInterval(sendToServer, intervalMs);

        return () => {
            clearInterval(interval);
            window.removeEventListener("scroll", handleScroll);
        };
    }, [userId, apiPath, intervalMs, cooldownMs]);
}
