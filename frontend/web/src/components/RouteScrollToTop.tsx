import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Reset document scroll when the route changes so each page starts at the top. */
export function RouteScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
