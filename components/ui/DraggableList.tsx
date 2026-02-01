import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Platform, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    runOnJS,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

const SPRING_CONFIG = {
    damping: 25,
    stiffness: 250,
    mass: 0.8,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
};

const TIMING_CONFIG = {
    duration: 150,
    easing: Easing.inOut(Easing.ease),
};

const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
};

interface DraggableItemProps<T> {
    item: T;
    index: number;
    // itemHeight matches the FULL height of the item slot (content + margin)
    itemHeight: number;
    renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
    onDragEnd: (from: number, to: number) => void;
    itemCount: number;
    activeIndex: SharedValue<number>;
    translationY: SharedValue<number>;
    onDragStart: () => void;
}

function DraggableItem<T>({
    item,
    index,
    itemHeight,
    renderItem,
    onDragEnd,
    itemCount,
    activeIndex,
    translationY,
    onDragStart,
}: DraggableItemProps<T>) {
    const gesture = Gesture.Pan()
        .activateAfterLongPress(200)
        .onStart(() => {
            if (activeIndex.value !== -1) return;
            activeIndex.value = index;
            runOnJS(triggerHaptic)();
            runOnJS(onDragStart)();
        })
        .onUpdate((event) => {
            if (activeIndex.value === index) {
                translationY.value = event.translationY;
            }
        })
        .onEnd(() => {
            if (activeIndex.value === index) {
                const moveBy = Math.round(translationY.value / itemHeight);
                const finalIndex = Math.max(0, Math.min(itemCount - 1, index + moveBy));
                const offset = (finalIndex - index) * itemHeight;

                // Animate to the final slot ("New Physical Postion Offset")
                // Then trigger the JS callback to update state.
                // We do NOT reset activeIndex here. The local state update will trigger a reset.
                translationY.value = withSpring(offset, SPRING_CONFIG, (finished) => {
                    if (finished) {
                        runOnJS(onDragEnd)(index, finalIndex);
                    }
                });
            }
        });

    const animatedStyle = useAnimatedStyle(() => {
        const isActive = activeIndex.value === index;
        const currentTranslation = translationY.value;
        const activeIdx = activeIndex.value;

        // Use zIndex to keep dragged item on top
        const zIndex = isActive ? 999 : 1;
        const scale = withSpring(isActive ? 1.05 : 1, SPRING_CONFIG);

        if (isActive) {
            return {
                transform: [
                    { translateY: currentTranslation },
                    { scale }
                ],
                zIndex,
                shadowOpacity: withSpring(0.2),
                shadowRadius: 10,
                elevation: 10,
            };
        }

        // Logic for shifting other items
        let translateY = 0;
        if (activeIdx !== -1) {
            // Calculate where the dragged item effectively is right now
            const dragRow = activeIdx + Math.round(currentTranslation / itemHeight);

            // If dragging down (target > source)
            if (activeIdx < index && dragRow >= index) {
                translateY = -itemHeight;
            }
            // If dragging up (target < source)
            else if (activeIdx > index && dragRow <= index) {
                translateY = itemHeight;
            }
        }

        return {
            transform: [
                { translateY: withSpring(translateY, SPRING_CONFIG) },
                { scale }
            ],
            zIndex,
            elevation: 0
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
    // itemHeight must include the bottom margin!
    itemHeight?: number;
    keyExtractor: (item: T, index: number) => string;
    style?: ViewStyle;
}

export function DraggableList<T>({
    data,
    renderItem,
    onReorder,
    itemHeight = 120, // Default assumption
    keyExtractor,
    style,
}: DraggableListProps<T>) {
    // Local state for optimistic updates to avoid flash
    const [items, setItems] = useState(data);

    // Derived shared values
    const activeIndex = useSharedValue(-1);
    const translationY = useSharedValue(0);

    // Sync local state with props if they diverge (external updates)
    useEffect(() => {
        setItems(data);
    }, [data]);

    // Cleanup shared values when layout changes (the drop/reorder)
    // using useLayoutEffect ensures this runs before paint, preventing the flash
    useLayoutEffect(() => {
        if (activeIndex.value !== -1) {
            activeIndex.value = -1;
            translationY.value = 0;
            // Trigger drop haptic
            runOnJS(triggerHaptic)();
        }
    }, [items]);

    const handleDragStart = useCallback(() => {
        // Optional: Disable parent scroll here if possible
    }, []);

    const handleDragEnd = useCallback((from: number, to: number) => {
        if (from !== to) {
            // Optimistic update
            const newItems = [...items];
            const [removed] = newItems.splice(from, 1);
            newItems.splice(to, 0, removed);
            setItems(newItems);

            // Commit
            onReorder(from, to);
        } else {
            // No change, just reset
            activeIndex.value = -1;
            translationY.value = 0;
        }
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
                    onDragEnd={handleDragEnd}
                    onDragStart={handleDragStart}
                    itemCount={items.length}
                    activeIndex={activeIndex}
                    translationY={translationY}
                />
            ))}
        </View>
    );
}
