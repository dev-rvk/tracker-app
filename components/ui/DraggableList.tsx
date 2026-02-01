import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
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

interface DraggableItemProps<T> {
    item: T;
    index: number;
    itemHeight: number;
    renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
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
    // Only enable pan gesture after long press
    const isDragging = useSharedValue(false);

    const longPress = Gesture.LongPress()
        .minDuration(200)
        .onStart(() => {
            isDragging.value = true;
            activeIndex.value = index;
            runOnJS(triggerHaptic)();
            runOnJS(onDragStart)();
        });

    const pan = Gesture.Pan()
        .manualActivation(true)
        .onTouchesMove((_e, stateManager) => {
            if (!isDragging.value) {
                stateManager.fail();
            } else {
                stateManager.activate();
            }
        })
        .onUpdate((event) => {
            if (isDragging.value) {
                translationY.value = event.translationY;
            }
        })
        .onEnd(() => {
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
        })
        .onFinalize(() => {
            // Ensure cleanup
            if (!isDragging.value && activeIndex.value === index) {
                activeIndex.value = -1;
                translationY.value = 0;
            }
        });

    // Race the gestures: LongPress wins -> Drag allowed. Scroll wins -> LongPress fails.
    const gesture = Gesture.Simultaneous(longPress, pan);

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
            <GestureDetector gesture={gesture}>
                <Animated.View>
                    {renderItem(item, index, activeIndex.value === index)}
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
        // This makes the transition seamless because visual positions match new layout
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
