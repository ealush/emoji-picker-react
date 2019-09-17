import { useRef, useEffect } from 'react';

const useScrollUpOnFilterChange = (value, emojiListRef) => {
    // The ref object is a generic container whose current property is mutable ...
    // ... and can hold any value, similar to an instance property on a class
    const ref = useRef();

    // Store current value in ref
    useEffect(() => {

        if (emojiListRef && emojiListRef.current) {
            emojiListRef.current.scrollTop = 0;
        }

        ref.current = value;
    }, [value]); // Only re-run if value changes

    // Return previous value (happens before update in useEffect above)
    return ref.current;
};

export default useScrollUpOnFilterChange;
