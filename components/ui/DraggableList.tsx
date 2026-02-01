import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
};

interface DraggableItemProps<T> {
    item: T;
    index: number;
    itemHeight: number;
    renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
    onDragEnd: (from: number, to: number) => void;
    itemCount: number;
    isBeingDragged: boolean;
    dragTranslation: number;
    onDragStart: (index: number) => void;
    onDragUpdate: (translation: number) => void;
    pendingShift: number;
}

function DraggableItem<T>({
    item,
    index,
    itemHeight,
    renderItem,
    onDragEnd,
    itemCount,
    isBeingDragged,
    dragTranslation,
    onDragStart,
    onDragUpdate,
    pendingShift,
}: DraggableItemProps<T>) {
    const localTranslation = useSharedValue(0);
    const localScale = useSharedValue(1);
    const localOpacity = useSharedValue(1);
    const shiftOffset = useSharedValue(0);

    // Handle pending shift after reorder
    useEffect(() => {
        if (pendingShift !== 0) {
            // Start from shifted position, animate to 0
            shiftOffset.value = pendingShift;
            shiftOffset.value = withTiming(0, {
                duration: 200,
                easing: Easing.out(Easing.cubic)
            });
        }
    }, [pendingShift]);

    // Sync with parent drag state
    useEffect(() => {
        if (isBeingDragged) {
            localTranslation.value = dragTranslation;
            localScale.value = withTiming(1.03, { duration: 100 });
            localOpacity.value = withTiming(0.9, { duration: 100 });
        } else {
            localTranslation.value = 0;
            localScale.value = withTiming(1, { duration: 100 });
            localOpacity.value = withTiming(1, { duration: 100 });
        }
    }, [isBeingDragged, dragTranslation]);

    const isDragging = useRef(false);
    const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (longPressTimeout.current) {
                clearTimeout(longPressTimeout.current);
            }
        };
    }, []);

    const panGesture = Gesture.Pan()
        .manualActivation(true)
        .onTouchesDown((event, stateManager) => {
            // Start long press detection
            longPressTimeout.current = setTimeout(() => {
                isDragging.current = true;
                stateManager.activate();
                runOnJS(triggerHaptic)();
                runOnJS(onDragStart)(index);
            }, 200);
        })
        .onTouchesMove((event, stateManager) => {
            // If we moved before long press completed, cancel and let scroll handle it
            if (!isDragging.current && longPressTimeout.current) {
                clearTimeout(longPressTimeout.current);
                longPressTimeout.current = null;
                stateManager.fail();
            }
        })
        .onTouchesUp((event, stateManager) => {
            if (longPressTimeout.current) {
                clearTimeout(longPressTimeout.current);
                longPressTimeout.current = null;
            }
            if (!isDragging.current) {
                stateManager.fail();
            }
        })
        .onTouchesCancelled((event, stateManager) => {
            if (longPressTimeout.current) {
                clearTimeout(longPressTimeout.current);
                longPressTimeout.current = null;
            }
            stateManager.fail();
        })
        .onUpdate((event) => {
            if (isDragging.current) {
                localTranslation.value = event.translationY;
                runOnJS(onDragUpdate)(event.translationY);
            }
        })
        .onEnd(() => {
            if (isDragging.current) {
                const moveBy = Math.round(localTranslation.value / itemHeight);
                const finalIndex = Math.max(0, Math.min(itemCount - 1, index + moveBy));
                const targetOffset = (finalIndex - index) * itemHeight;

                localTranslation.value = withTiming(targetOffset, {
                    duration: 150,
                    easing: Easing.out(Easing.cubic)
                }, () => {
                    runOnJS(onDragEnd)(index, finalIndex);
                });
            }
            isDragging.current = false;
        })
        .onFinalize(() => {
            isDragging.current = false;
            if (longPressTimeout.current) {
                clearTimeout(longPressTimeout.current);
                longPressTimeout.current = null;
            }
        });

    const gesture = panGesture;

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: localTranslation.value + shiftOffset.value },
                { scale: localScale.value }
            ],
            zIndex: isBeingDragged ? 999 : 1,
            opacity: localOpacity.value,
        };
    });

    return (
        <Animated.View style={[{ marginBottom: 16 }, animatedStyle]}>
            <GestureDetector gesture={gesture}>
                <Animated.View>
                    {renderItem(item, index, isBeingDragged)}
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );
}

interface DraggableListProps<T> {
    data: T[];
    renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
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
    const [activeIndex, setActiveIndex] = useState(-1);
    const [dragTranslation, setDragTranslation] = useState(0);
    const [pendingShifts, setPendingShifts] = useState<Record<string, number>>({});

    // Sync with external data changes
    useEffect(() => {
        setItems(data);
    }, [data]);

    const handleDragStart = useCallback((index: number) => {
        setActiveIndex(index);
    }, []);

    const handleDragUpdate = useCallback((translation: number) => {
        setDragTranslation(translation);
    }, []);

    const handleDragEnd = useCallback((from: number, to: number) => {
        setActiveIndex(-1);
        setDragTranslation(0);

        if (from !== to) {
            // Calculate shifts for affected items
            const shifts: Record<string, number> = {};
            const newItems = [...items];

            // The dragged item needs no shift (it's already at target)
            const draggedKey = keyExtractor(items[from], from);
            shifts[draggedKey] = 0;

            // Items between from and to need to shift
            if (from < to) {
                // Moved down: items between shift up
                for (let i = from + 1; i <= to; i++) {
                    const key = keyExtractor(items[i], i);
                    shifts[key] = itemHeight; // They were shifted up, now going back down
                }
            } else {
                // Moved up: items between shift down
                for (let i = to; i < from; i++) {
                    const key = keyExtractor(items[i], i);
                    shifts[key] = -itemHeight; // They were shifted down, now going back up
                }
            }

            setPendingShifts(shifts);

            // Update the data
            const [removed] = newItems.splice(from, 1);
            newItems.splice(to, 0, removed);
            setItems(newItems);

            triggerHaptic();
            onReorder(from, to);

            // Clear shifts after animation
            setTimeout(() => {
                setPendingShifts({});
            }, 250);
        }
    }, [items, keyExtractor, itemHeight, onReorder]);

    return (
        <View style={style}>
            {items.map((item, index) => {
                const key = keyExtractor(item, index);
                return (
                    <DraggableItem
                        key={key}
                        item={item}
                        index={index}
                        itemHeight={itemHeight}
                        renderItem={renderItem}
                        onDragEnd={handleDragEnd}
                        onDragStart={handleDragStart}
                        onDragUpdate={handleDragUpdate}
                        itemCount={items.length}
                        isBeingDragged={activeIndex === index}
                        dragTranslation={dragTranslation}
                        pendingShift={pendingShifts[key] || 0}
                    />
                );
            })}
        </View>
    );
}
