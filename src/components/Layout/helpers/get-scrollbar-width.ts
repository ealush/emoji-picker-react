let cachedScrollWidth: number | null = null;

export function getScrollbarWidth() {
    if (cachedScrollWidth !== null) {
        return cachedScrollWidth;
    }

    // Create a temporary div to measure
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);

    // Create inner div
    const inner = document.createElement('div');
    outer.appendChild(inner);

    // Calculate the width difference
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

    // Clean up
    outer.parentNode?.removeChild(outer);

    cachedScrollWidth = scrollbarWidth;
    return scrollbarWidth;
}