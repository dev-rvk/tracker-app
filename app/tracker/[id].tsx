import { GoalTrackerDetail } from "@/components/GoalTrackerDetail";
import { MeasurementTrackerDetail } from "@/components/MeasurementTrackerDetail";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function TrackerDetailScreen() {
    const { id, type } = useLocalSearchParams<{ id: string; type: string }>();

    if (type === "goal") {
        return <GoalTrackerDetail trackerId={id} />;
    }

    if (type === "measurement") {
        return <MeasurementTrackerDetail trackerId={id} />;
    }

    return (
        <View className="flex-1 items-center justify-center bg-background">
            <Text className="text-foreground">Tracker not found</Text>
        </View>
    );
}
