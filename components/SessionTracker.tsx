'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SessionTrackerProps {
  page: string;
  data?: Record<string, string>;
}

export default function SessionTracker({ page, data = {} }: SessionTrackerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const pingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // تسجيل الصفحة الحالية
    async function trackPage() {
      try {
        const res = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ current_page: page, ...data }),
        });
        const result = await res.json();

        // التحقق من إعادة التوجيه
        if (result.redirect_to && result.redirect_to !== pathname) {
          router.push(result.redirect_to);
        }
      } catch {}
    }

    trackPage();

    // Ping كل 30 ثانية للإبقاء على الجلسة نشطة
    pingRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/ping', { method: 'POST' });
        const result = await res.json();

        if (result.redirect_to && result.redirect_to !== pathname) {
          router.push(result.redirect_to);
        }
      } catch {}
    }, 30000);

    return () => {
      if (pingRef.current) clearInterval(pingRef.current);
    };
  }, [page, pathname, router]);

  return null; // مكون غير مرئي
}
