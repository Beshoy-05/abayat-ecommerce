'use client';

import React, { useEffect, useState } from 'react';
import { subscribeToApiEvents } from '@/api/client';
import { AlertCircle, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalNotificationBanner() {
  const [notification, setNotification] = useState<{
    type: '429' | '401' | 'error';
    message: string;
  } | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = subscribeToApiEvents((event) => {
      setNotification(event);
      if (event.type === '429') {
        setCountdown(60);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setNotification(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          className="fixed top-4 inset-x-4 max-w-xl mx-auto z-[9999] shadow-2xl"
        >
          <div
            className={`flex items-center justify-between gap-3 px-5 py-4 rounded-xl border backdrop-blur-xl ${
              notification.type === '429'
                ? 'bg-[#1B1812]/95 border-[#E0B974]/50 text-[#F7F7F8]'
                : 'bg-[#1D1315]/95 border-rose-500/40 text-[#F7F7F8]'
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === '429' ? (
                <Clock className="w-5 h-5 text-[#E0B974] animate-spin" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              )}
              <div>
                <p className="text-sm font-medium">{notification.message}</p>
                {countdown > 0 && (
                  <p className="text-xs text-[#E0B974] mt-0.5 font-semibold">
                    Atelier security cooldown: {countdown}s remaining
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
