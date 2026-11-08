import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/** True while the user has asked the system to reduce motion. */
export const usePrefersReducedMotion = () => {
    const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches);

    useEffect(() => {
        const query = window.matchMedia(QUERY);
        const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);

    return reduced;
};
