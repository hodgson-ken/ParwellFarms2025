'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top when pathname changes (navigation to a new page)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

