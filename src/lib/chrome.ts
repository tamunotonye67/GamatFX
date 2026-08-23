import { useEffect, useState } from "react";

/**
 * Lets a page tell the Navbar to render its solid (white) state even at
 * scroll-top. Needed on light-background screens that have no dark hero,
 * where transparent white nav text would be invisible.
 */

let count = 0;
const listeners = new Set<(v: boolean) => void>();

function emit() {
  listeners.forEach((l) => l(count > 0));
}

/** Call inside any page/screen that renders on a light background. */
export function useSolidNavbar(active = true) {
  useEffect(() => {
    if (!active) return;
    count += 1;
    emit();
    return () => {
      count = Math.max(0, count - 1);
      emit();
    };
  }, [active]);
}

/** Used by the Navbar to subscribe to the signal. */
export function useNavbarForcedSolid(): boolean {
  const [solid, setSolid] = useState(count > 0);
  useEffect(() => {
    listeners.add(setSolid);
    setSolid(count > 0);
    return () => {
      listeners.delete(setSolid);
    };
  }, []);
  return solid;
}
