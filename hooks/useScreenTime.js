// hooks/useScreenTime.js
"use client";
import { useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

/**
 * useScreenTime
 * - userId (string) required
 * - options: { heartbeatIntervalMs, idleThresholdMs, apiBase }
 */
export default function useScreenTime(userId, options = {}) {
    
    const {
        heartbeatIntervalMs = 15000,
        idleThresholdMs = 60000, // 60s idle -> pause counting
        apiBase = "/api/usage",
    } = options;

    const sessionIdRef = useRef(uuidv4());
    const activeStartRef = useRef(null); // timestamp when active period started
    const accumulatedRef = useRef(0);    // seconds accumulated in current session (not yet sent)
    const lastActivityRef = useRef(Date.now());
    const heartbeatTimerRef = useRef(null);

    const isDocumentVisible = () => document.visibilityState === "visible";
    const isWindowFocused = () => document.hasFocus();

    const handleActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
        // If previously idle and now visible & focused, start active
        if (!activeStartRef.current && isDocumentVisible() && isWindowFocused()) {
            activeStartRef.current = Date.now();
        }
    }, []);

    const pauseActive = useCallback(() => {
        if (activeStartRef.current) {
            const deltaMs = Date.now() - activeStartRef.current;
            accumulatedRef.current += Math.floor(deltaMs / 1000);
            activeStartRef.current = null;
        }
    }, []);

    // returns seconds since session start included accumulated
    const getCurrentActiveSeconds = useCallback(() => {
        let secs = accumulatedRef.current;
        if (activeStartRef.current) {
            secs += Math.floor((Date.now() - activeStartRef.current) / 1000);
        }
        return secs;
    }, []);

    // Send heartbeat to server
    const sendHeartbeat = useCallback(async (final = false) => {
        const seconds = getCurrentActiveSeconds();
        const payload = {
            userId,
            sessionId: sessionIdRef.current,
            secondsDelta: seconds, // server will compute incremental if you prefer
            timestamp: new Date().toISOString(),
            final: !!final
        };

        try {
            // Prefer sendBeacon for final (unload)
            if (final && navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
                navigator.sendBeacon(`${apiBase}/heartbeat`, blob);
                return;
            }

            // Normal fetch for periodic heartbeat
            await fetch(`${apiBase}/heartbeat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                keepalive: true
            });

            // on success, reset accumulated on client so we don't resend whole total
            // We'll reset accumulatedRef to 0 but keep activeStart so counting continues.
            accumulatedRef.current = 0;
            if (activeStartRef.current) activeStartRef.current = Date.now();
        } catch (err) {
            // don't crash; try again on next heartbeat
            console.warn("heartbeat error", err);
        }
    }, [apiBase, getCurrentActiveSeconds, userId]);

    useEffect(() => {
        if (!userId) return;

        // start session
        sessionIdRef.current = uuidv4();
        lastActivityRef.current = Date.now();

        // If visible & focused and not idle, start active
        if (isDocumentVisible() && isWindowFocused()) activeStartRef.current = Date.now();

        // activity events
        const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
        activityEvents.forEach(ev => window.addEventListener(ev, handleActivity, { passive: true }));

        // visibility/focus handlers
        const onVisibilityChange = () => {
            if (isDocumentVisible() && isWindowFocused() && (Date.now() - lastActivityRef.current) < idleThresholdMs) {
                // resume
                if (!activeStartRef.current) activeStartRef.current = Date.now();
            } else {
                pauseActive();
            }
        };
        const onFocus = () => {
            if ((Date.now() - lastActivityRef.current) < idleThresholdMs) {
                if (!activeStartRef.current) activeStartRef.current = Date.now();
            }
        };
        const onBlur = () => pauseActive();

        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("focus", onFocus);
        window.addEventListener("blur", onBlur);

        // idle checker
        const idleCheckInterval = setInterval(() => {
            if (Date.now() - lastActivityRef.current > idleThresholdMs) {
                // idle -> pause
                pauseActive();
            } else {
                // not idle -> ensure active if visible and focused
                if (!activeStartRef.current && isDocumentVisible() && isWindowFocused()) {
                    activeStartRef.current = Date.now();
                }
            }
        }, 2000);

        // heartbeat
        heartbeatTimerRef.current = setInterval(() => sendHeartbeat(false), heartbeatIntervalMs);

        // beforeunload/send final heartbeat
        const onBeforeUnload = () => {
            pauseActive();
            // final send via sendBeacon if possible
            sendHeartbeat(true);
        };
        window.addEventListener("pagehide", onBeforeUnload);
        window.addEventListener("beforeunload", onBeforeUnload);

        return () => {
            // cleanup
            activityEvents.forEach(ev => window.removeEventListener(ev, handleActivity));
            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("blur", onBlur);
            clearInterval(idleCheckInterval);
            clearInterval(heartbeatTimerRef.current);
            window.removeEventListener("pagehide", onBeforeUnload);
            window.removeEventListener("beforeunload", onBeforeUnload);
            // final send
            pauseActive();
            sendHeartbeat(true);
        };
    }, [userId, idleThresholdMs, heartbeatIntervalMs, handleActivity, pauseActive, sendHeartbeat]);

    // expose getter if component needs to show current time
    return {
        getCurrentActiveSeconds,
        sessionId: sessionIdRef.current
    };
}
