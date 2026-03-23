

import { useState, useEffect, useRef } from "react";

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia(query).matches;
    });
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        const media = window.matchMedia(query);

        const listener = (e: MediaQueryListEvent) => {
            if (mountedRef.current) {
                setMatches(e.matches);
            }
        };
        
        media.addEventListener("change", listener);

        return () => {
            mountedRef.current = false;
            media.removeEventListener("change", listener);
        };
    }, [query]);

    return matches;
}
