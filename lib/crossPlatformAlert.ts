import { Alert, Platform } from "react-native";

interface AlertButton {
    text: string;
    style?: "default" | "cancel" | "destructive";
    onPress?: () => void;
}

/**
 * Cross-platform alert that works on both native and web
 */
export const crossPlatformAlert = (
    title: string,
    message: string,
    buttons: AlertButton[]
) => {
    if (Platform.OS === "web") {
        // On web, use browser's confirm dialog
        const destructiveButton = buttons.find(b => b.style === "destructive");
        const cancelButton = buttons.find(b => b.style === "cancel");

        if (destructiveButton && cancelButton) {
            // For delete confirmations, use confirm()
            const confirmed = window.confirm(`${title}\n\n${message}`);
            if (confirmed) {
                destructiveButton.onPress?.();
            } else {
                cancelButton.onPress?.();
            }
        } else {
            // For simple alerts, use alert()
            window.alert(`${title}\n\n${message}`);
            buttons[0]?.onPress?.();
        }
    } else {
        // On native, use React Native's Alert
        Alert.alert(title, message, buttons);
    }
};
