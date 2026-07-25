"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { type WebsocketProvider } from "y-websocket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface RemotePointerState {
  id: string;
  name: string;
  color: string;
  image?: string;
  x: number;
  y: number;
  timestamp: number;
}

interface LiveMousePointersProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  provider: WebsocketProvider | null;
  currentUser?: {
    id: string;
    name: string;
    color: string;
    image?: string;
  } | null;
}

export function LiveMousePointers({
  containerRef,
  provider,
  currentUser,
}: LiveMousePointersProps) {
  const [pointers, setPointers] = useState<RemotePointerState[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const lastSentTimeRef = useRef<number>(0);
  const lastPointerEventRef = useRef<number>(0);
  const hideTimeoutRef = useRef<number | null>(null);

  // 1. Listen for mouse movements on the container and update local awareness state (~30 FPS)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !provider || !provider.awareness || !currentUser) return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      lastPointerEventRef.current = now;

      if (now - lastSentTimeRef.current < 33) return; // ~30 FPS throttle

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
        const relativeY = ((e.clientY - rect.top) / rect.height) * 100;

        const clampedX = Math.max(0, Math.min(100, relativeX));
        const clampedY = Math.max(0, Math.min(100, relativeY));
        const timestamp = Date.now();

        lastSentTimeRef.current = timestamp;
        provider.awareness.setLocalStateField("pointer", {
          x: clampedX,
          y: clampedY,
          timestamp,
        });
        provider.awareness.setLocalStateField("lastActiveAt", timestamp);
      });
    };

    const handleMouseLeave = () => {
      provider.awareness.setLocalStateField("pointer", null);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        provider.awareness.setLocalStateField("pointer", null);
      }
    };

    const hideInactivePointer = () => {
      if (Date.now() - lastPointerEventRef.current > 3500) {
        provider.awareness.setLocalStateField("pointer", null);
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    hideTimeoutRef.current = window.setInterval(hideInactivePointer, 1000);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (hideTimeoutRef.current) {
        window.clearInterval(hideTimeoutRef.current);
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [containerRef, provider, currentUser]);

  // 2. Listen to Awareness changes and sync remote collaborators' pointer locations
  useEffect(() => {
    if (!provider || !provider.awareness) return;

    const awareness = provider.awareness;

    const updatePointers = () => {
      const states = awareness.getStates();
      const now = Date.now();
      const activePointers: RemotePointerState[] = [];

      states.forEach((state: Record<string, unknown>, clientID: number) => {
        // Skip local client's own pointer
        if (clientID === awareness.clientID) return;

        const userObj = state.user as {
          id?: string;
          name?: string;
          color?: string;
          image?: string;
        } | undefined;

        const pointerObj = state.pointer as {
          x?: number;
          y?: number;
          timestamp?: number;
        } | undefined;

        if (
          userObj &&
          userObj.id &&
          pointerObj &&
          typeof pointerObj.x === "number" &&
          typeof pointerObj.y === "number" &&
          pointerObj.timestamp &&
          now - pointerObj.timestamp < 4000 // Inactivity timeout: hide after 4 seconds
        ) {
          activePointers.push({
            id: `${userObj.id}-${clientID}`,
            name: userObj.name || "Collaborator",
            color: userObj.color || "#1565C0",
            image: userObj.image,
            x: pointerObj.x,
            y: pointerObj.y,
            timestamp: pointerObj.timestamp,
          });
        }
      });

      setPointers(activePointers);
    };

    awareness.on("change", updatePointers);
    updatePointers();

    // Timer interval to periodically hide inactive pointers
    const interval = setInterval(updatePointers, 1000);

    return () => {
      awareness.off("change", updatePointers);
      clearInterval(interval);
    };
  }, [provider]);

  const renderedPointers = useMemo(
    () =>
      pointers.map((pointer) => (
        <div
          key={pointer.id}
          className="absolute transition-all duration-100 ease-out flex items-center gap-x-1"
          style={{
            left: `${pointer.x}%`,
            top: `${pointer.y}%`,
            transform: "translate(-2px, -2px)",
          }}
        >
          <svg
            className="size-5 drop-shadow-md shrink-0"
            viewBox="0 0 24 24"
            fill={pointer.color}
            stroke="white"
            strokeWidth="1.5"
          >
            <path d="M5.5 3.5L19 12L12 14.5L8.5 21L5.5 3.5Z" />
          </svg>

          <div
            className="flex items-center gap-x-1 px-2 py-0.5 rounded-full text-white text-[10px] font-semibold shadow-md whitespace-nowrap"
            style={{ backgroundColor: pointer.color }}
          >
            <Avatar className="size-3.5 border border-white/40">
              <AvatarImage src={pointer.image} alt={pointer.name} />
              <AvatarFallback className="bg-black/20 text-[8px]">
                {pointer.name.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{pointer.name}</span>
          </div>
        </div>
      )),
    [pointers]
  );

  if (pointers.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {renderedPointers}
    </div>
  );
}
