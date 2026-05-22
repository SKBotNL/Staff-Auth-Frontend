import { Accessor } from "solid-js";

export function throwIfFatal(err: Accessor<Error | null>, clear: () => void) {
  return () => {
    const e = err();
    if (e) {
      clear();
      throw e;
    }
  };
}
