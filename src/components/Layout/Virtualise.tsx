import sum from 'lodash/sum';
import React, { useState, useCallback, useMemo } from 'react';

import useMeasure from '../../hooks/useMeasure';

const Virtualise = React.memo(({ children, itemHeights, overscan = 0, className }: {
    children: React.ReactNode[];
    itemHeights: number[];
    overscan?: number;
    className?: string;
}) => {
    const [containerMeasure, { height: containerHeight }] = useMeasure<HTMLDivElement>();
    const [scrollOffset, setScrollOffset] = useState(0);
    const totalHeight = useMemo(() => sum(itemHeights), [itemHeights]);

    const calculateVisibleItems = useCallback(() => {
        let start = 0;
        let currentHeight = 0;

        // Find the first item in the viewport
        for (let i = 0; i < itemHeights.length; i++) {
            if (currentHeight + itemHeights[i] > scrollOffset) {
                start = Math.max(i - overscan, 0);
                break;
            }
            currentHeight += itemHeights[i];
        }

        let end = start;
        currentHeight = sum(itemHeights.slice(0, start));

        // Find the last item in the viewport
        for (let i = start; i < itemHeights.length; i++) {
            currentHeight += itemHeights[i];
            if (currentHeight > scrollOffset + containerHeight || i === itemHeights.length - 1) {
                end = Math.min(i + overscan + 1, itemHeights.length);
                break;
            }
        }

        // Adjust end to include the last element if we're near the bottom
        if (scrollOffset + containerHeight >= totalHeight) {
            end = itemHeights.length;
        }

        return itemHeights.slice(start, end).map((_, index) => {
            const itemIndex = start + index;
            const top = sum(itemHeights.slice(0, itemIndex));
            return {
                index: itemIndex,
                top,
                height: itemHeights[itemIndex],
                element: children[itemIndex],
            };
        });
    }, [scrollOffset, containerHeight, itemHeights, overscan, children, totalHeight]);

    const visibleItems = useMemo(() => calculateVisibleItems(), [calculateVisibleItems]);

    const handleScroll: React.UIEventHandler<HTMLDivElement> = useCallback((e) => {
        setScrollOffset(e.currentTarget.scrollTop);
    }, []);

    return (
        <div
            ref={containerMeasure}
            onScroll={handleScroll}
            style={{ position: 'relative', height: '100%', overflowY: 'auto' }}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
               <ul className={className} style={{ margin: 0, padding: 0 }}>
                  {visibleItems.map(({ index, top, height, element }) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            top: `${top}px`,
                            height: `${height}px`,
                            width: '100%',
                        }}
                    >
                        {element}
                    </div>
                ))}
               </ul>
            </div>
        </div>
    );
});

Virtualise.displayName = 'Virtualise';
export default Virtualise;
