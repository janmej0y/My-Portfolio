"use client";

import { useEffect } from "react";

const RELOAD_FLAG = "portfolio-stale-service-worker-cleaned";

export default function StaleServiceWorkerCleaner() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const cleanStaleServiceWorkers = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length === 0) return;

        await Promise.all(registrations.map((registration) => registration.unregister()));

        if ("caches" in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
        }

        if (navigator.serviceWorker.controller && sessionStorage.getItem(RELOAD_FLAG) !== "true") {
          sessionStorage.setItem(RELOAD_FLAG, "true");
          window.location.reload();
        }
      } catch (error) {
        console.warn("Unable to clear stale service worker caches.", error);
      }
    };

    void cleanStaleServiceWorkers();
  }, []);

  return null;
}
