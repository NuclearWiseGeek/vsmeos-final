// =============================================================================
// FILE: components/PageTransition.tsx
// PURPOSE: Wraps every page with a smooth fade + slide-up entrance animation.
//          Triggered on every route change by watching usePathname().
//          CSS animation is defined in globals.css (.page-enter class).
//
// HOW IT WORKS:
//   1. usePathname() detects when the route changes
//   2. We toggle a key on the wrapper div — React remounts it
//   3. CSS animation plays from the start on each remount
//
// RESULT: Every page click feels like a native app transition rather than
//         a hard white flash.
// =============================================================================

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const [key, setKey] = useState(pathname);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Brief invisible frame, then swap content + animate in
    setVisible(false);
    const t = setTimeout(() => {
      setKey(pathname);
      setVisible(true);
    }, 40);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div
      key={key}
      className={visible ? 'page-enter' : 'page-exit'}
    >
      {children}
    </div>
  );
}