import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector, PanGesture } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    runOnJS,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
};

// Timing config for non-dragging item shifts
const SHIFT_TIMING_CONFIG = {
    duration: 200,
    easing: Easing.out(Easing.cubic),
};

// Props passed to the drag handle element
export interface DragHandleProps {
    // For web: attach these to the drag handle element
    onPointerDown?: (e: React.PointerEvent<any>) => void;
    onPointerMove?: (e: React.PointerEvent<any>) => void;
    onPointerUp?: (e: React.PointerEvent<any>) => void;
    onPointerLeave?: () => void;
    // For native: wrap the drag handle with GestureDetector using this gesture
    gesture?: PanGesture;
    // Style to apply (cursor, touch-action)
    style?: ViewStyle & { cursor?: string; touchAction?: string };
}

interface DraggableItemProps<T> {
    item: T;
    index: number;
    itemHeight: number;
    renderItem: (item: T, index: number, isDragging: boolean, dragHandleProps: DragHandleProps) => React.ReactNode;
    itemCount: number;
    activeIndex: SharedValue<number>;
    translationY: SharedValue<number>;
    onDragStart: () => void;
    onReorder: (from: number, to: number) => void;
}

function DraggableItem<T>({
    item,
    index,
    itemHeight,
    renderItem,
    itemCount,
    activeIndex,
    translationY,
    onDragStart,
    onReorder,
}: DraggableItemProps<T>) {
    // Shared values for animation
    const isDragging = useSharedValue(false);

    // Refs for web pointer tracking
    const startY = useRef(0);
    const pointerIdRef = useRef<number | null>(null);
    const elementRef = useRef<any>(null);

    // Web pointer handlers for drag handle
    const handlePointerDown = useCallback((e: React.PointerEvent<any>) => {
        if (Platform.OS !== 'web') return;

        startY.current = e.clientY;
        pointerIdRef.current = e.pointerId;
        elementRef.current = e.currentTarget;

        // Immediately start dragging (no long press needed for the handle)
        isDragging.value = true;
        activeIndex.value = index;

        // Capture pointer to track moves even outside the element
        if (elementRef.current && pointerIdRef.current !== null) {
            elementRef.current.setPointerCapture(pointerIdRef.current);
        }

        triggerHaptic();
        onDragStart();
    }, [index, onDragStart]);

    const handlePointerMove = useCallback((e: React.PointerEvent<any>) => {
        if (Platform.OS !== 'web') return;
        if (!isDragging.value) return;

        const deltaY = e.clientY - startY.current;
        e.preventDefault();
        translationY.value = deltaY;
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent<any>) => {
        if (Platform.OS !== 'web') return;

        // Release pointer capture
        if (elementRef.current && pointerIdRef.current !== null) {
            try {
                elementRef.current.releasePointerCapture(pointerIdRef.current);
            } catch { }
        }
        pointerIdRef.current = null;

        if (isDragging.value) {
            const moveBy = Math.round(translationY.value / itemHeight);
            const finalIndex = Math.max(0, Math.min(itemCount - 1, index + moveBy));
            const targetOffset = (finalIndex - index) * itemHeight;

            translationY.value = withTiming(targetOffset, {
                duration: 150,
                easing: Easing.out(Easing.cubic)
            }, () => {
                isDragging.value = false;
                runOnJS(onReorder)(index, finalIndex);
            });
        }
    }, [itemHeight, itemCount, index, onReorder]);

    const handlePointerLeave = useCallback(() => {
        // Pointer capture handles this case, no action needed
    }, []);

    // Native gesture handler for drag handle
    const panGesture = Gesture.Pan()
        .onStart(() => {
            isDragging.value = true;
            activeIndex.value = index;
            runOnJS(triggerHaptic)();
            runOnJS(onDragStart)();
        })
        .onUpdate((event) => {
            translationY.value = event.translationY;
        })
        .onEnd(() => {
            const moveBy = Math.round(translationY.value / itemHeight);
            const finalIndex = Math.max(0, Math.min(itemCount - 1, index + moveBy));
            const targetOffset = (finalIndex - index) * itemHeight;

            translationY.value = withTiming(targetOffset, {
                duration: 150,
                easing: Easing.out(Easing.cubic)
            }, () => {
                isDragging.value = false;
                runOnJS(onReorder)(index, finalIndex);
            });
        })
        .onFinalize((_, success) => {
            if (!success && activeIndex.value === index) {
                isDragging.value = false;
                activeIndex.value = -1;
                translationY.value = 0;
            }
        });

    // Drag handle props to pass to renderItem
    const dragHandleProps: DragHandleProps = Platform.OS === 'web'
        ? {
            onPointerDown: handlePointerDown,
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp,
            onPointerLeave: handlePointerLeave,
            style: {
                cursor: 'grab',
                touchAction: 'none',
            } as any,
        }
        : {
            gesture: panGesture,
            style: {},
        };

    const animatedStyle = useAnimatedStyle(() => {
        const isActive = activeIndex.value === index;
        const activeIdx = activeIndex.value;
        const currentTranslation = translationY.value;

        // If not dragging anyone, return to rest
        if (activeIdx === -1) {
            return {
                transform: [{ translateY: 0 }, { scale: 1 }],
                zIndex: 1,
                opacity: 1
            };
        }

        if (isActive) {
            return {
                transform: [
                    { translateY: currentTranslation },
                    { scale: 1.03 }
                ],
                zIndex: 999,
                opacity: 0.95,
            };
        }

        // Logic for shifting other items
        let translateYVal = 0;
        const dragRow = activeIdx + Math.round(currentTranslation / itemHeight);

        if (activeIdx < index && dragRow >= index) {
            translateYVal = -itemHeight;
        } else if (activeIdx > index && dragRow <= index) {
            translateYVal = itemHeight;
        }

        return {
            transform: [
                { translateY: withTiming(translateYVal, SHIFT_TIMING_CONFIG) },
                { scale: 1 }
            ],
            zIndex: 1,
            opacity: 1,
        };
    });

    return (
        <Animated.View style={[{ marginBottom: 16 }, animatedStyle]}>
            {renderItem(item, index, activeIndex.value === index, dragHandleProps)}
        </Animated.View>
    );
}

interface DraggableListProps<T> {
    data: T[];
    renderItem: (item: T, index: number, isDragging: boolean, dragHandleProps: DragHandleProps) => React.ReactNode;
    onReorder: (fromIndex: number, toIndex: number) => void;
    itemHeight?: number;
    keyExtractor: (item: T, index: number) => string;
    style?: ViewStyle;
}

export function DraggableList<T>({
    data,
    renderItem,
    onReorder,
    itemHeight = 120,
    keyExtractor,
    style,
}: DraggableListProps<T>) {
    const [items, setItems] = useState(data);
    const activeIndex = useSharedValue(-1);
    const translationY = useSharedValue(0);

    // Sync with external data
    useEffect(() => {
        setItems(data);
    }, [data]);

    const handleDragStart = useCallback(() => { }, []);

    const handleReorder = useCallback((from: number, to: number) => {
        if (from === to) {
            activeIndex.value = -1;
            translationY.value = 0;
            return;
        }

        // Optimistic update
        const newItems = [...items];
        const [removed] = newItems.splice(from, 1);
        newItems.splice(to, 0, removed);
        setItems(newItems);

        onReorder(from, to);

        // Reset shared values after a frame to allow React to render new order
        requestAnimationFrame(() => {
            activeIndex.value = -1;
            translationY.value = 0;
        });
    }, [items, onReorder]);

    return (
        <View style={style}>
            {items.map((item, index) => (
                <DraggableItem
                    key={keyExtractor(item, index)}
                    item={item}
                    index={index}
                    itemHeight={itemHeight}
                    renderItem={renderItem}
                    itemCount={items.length}
                    activeIndex={activeIndex}
                    translationY={translationY}
                    onDragStart={handleDragStart}
                    onReorder={handleReorder}
                />
            ))}
        </View>
    );
}

// Convenience component for the drag handle (optional use)
interface DragHandleComponentProps {
    dragHandleProps: DragHandleProps;
    children: React.ReactNode;
    style?: ViewStyle;
}

export function DragHandle({ dragHandleProps, children, style }: DragHandleComponentProps) {
    if (Platform.OS === 'web') {
        return (
            <View
                style={[dragHandleProps.style, style] as any}
                onPointerDown={dragHandleProps.onPointerDown as any}
                onPointerMove={dragHandleProps.onPointerMove as any}
                onPointerUp={dragHandleProps.onPointerUp as any}
                onPointerLeave={dragHandleProps.onPointerLeave as any}
            >
                {children}
            </View>
        );
    }

    // Native: wrap with GestureDetector
    return (
        <GestureDetector gesture={dragHandleProps.gesture!}>
            <Animated.View style={style}>
                {children}
            </Animated.View>
        </GestureDetector>
    );
}
