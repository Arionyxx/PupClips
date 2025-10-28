import { useEffect, useState } from "react";

/**
 * Hook to check if the component is mounted
 * Useful for preventing hydration mismatches
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return mounted;
}
