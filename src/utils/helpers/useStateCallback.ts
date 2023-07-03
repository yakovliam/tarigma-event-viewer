import * as React from "react";

// Clever mod of useState that runs a callback immediately after state is updated
// Removes the need for useffect in some cases
export function useStateCallback<T>(
    initialState: T
  ): [T, (state: T, cb?: (state: T) => void) => void] {
    const [state, setState] = React.useState(initialState);
    const cbRef = React.useRef<((state: T) => void) | undefined>(undefined); // init mutable ref container for callbacks
  
    const setStateCallback = React.useCallback((state: T, cb?: (state: T) => void) => {
      cbRef.current = cb; // store current, passed callback in ref
      setState(state);
    }, []); // keep object reference stable, exactly like `useState`
  
    React.useEffect(() => {
      // cb.current is `undefined` on initial render,
      // so we only invoke callback on state *updates*
      if (cbRef.current) {
        cbRef.current(state);
        cbRef.current = undefined; // reset callback after execution
      }
    }, [state]);
  
    return [state, setStateCallback];
  }