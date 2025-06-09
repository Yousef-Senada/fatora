import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";

const { width, height } = Dimensions.get("window");

const NoInternetScreen = () => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.8));
    const [pulseAnim] = useState(new Animated.Value(1));
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        // Animation for screen entrance
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse animation for the icon
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]),
        );
        pulseAnimation.start();

        return () => pulseAnimation.stop();
    }, []);

    const handleRetry = async () => {
        setIsRetrying(true);

        try {
            const state = await NetInfo.fetch();
            if (state.isConnected && state.isInternetReachable) {
            }
        } catch (error) {
            console.log("فشل في فحص الاتصال:", error);
        }

        setTimeout(() => {
            setIsRetrying(false);
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            {/* Background gradient effect */}
            <View style={styles.backgroundGradient} />

            {/* Floating circles for decoration */}
            <View style={[styles.floatingCircle, styles.circle1]} />
            <View style={[styles.floatingCircle, styles.circle2]} />
            <View style={[styles.floatingCircle, styles.circle3]} />

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {/* Icon with pulse animation */}
                <Animated.View
                    style={[
                        styles.iconContainer,
                        { transform: [{ scale: pulseAnim }] },
                    ]}
                >
                    <Ionicons name="wifi-outline" size={80} color="#ef4444" />
                    <View style={styles.crossLine} />
                </Animated.View>

                {/* Main title */}
                <Text style={styles.title}>لا يوجد اتصال بالإنترنت</Text>

                {/* Subtitle */}
                <Text style={styles.subtitle}>
                    يبدو أنك غير متصل بالإنترنت.{"\n"}
                    تحقق من اتصالك وحاول مرة أخرى
                </Text>

                {/* Retry button */}
                <TouchableOpacity
                    style={[
                        styles.retryButton,
                        isRetrying && styles.retryButtonDisabled,
                    ]}
                    onPress={handleRetry}
                    disabled={isRetrying}
                    activeOpacity={0.8}
                >
                    <View style={styles.buttonContent}>
                        {isRetrying ? (
                            <Animated.View style={styles.loadingSpinner}>
                                <Ionicons
                                    name="refresh"
                                    size={20}
                                    color="#fff"
                                />
                            </Animated.View>
                        ) : (
                            <Ionicons name="refresh" size={20} color="#fff" />
                        )}
                        <Text style={styles.retryText}>
                            {isRetrying ? "جاري المحاولة..." : "إعادة المحاولة"}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    backgroundGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        opacity: 0.8,
    },
    floatingCircle: {
        position: "absolute",
        borderRadius: 100,
        backgroundColor: "rgba(16, 185, 129, 0.08)",
    },
    circle1: {
        width: 120,
        height: 120,
        top: height * 0.1,
        right: -60,
    },
    circle2: {
        width: 80,
        height: 80,
        bottom: height * 0.2,
        left: -40,
        backgroundColor: "rgba(239, 68, 68, 0.08)",
    },
    circle3: {
        width: 200,
        height: 200,
        top: height * 0.3,
        left: -100,
        backgroundColor: "rgba(59, 130, 246, 0.06)",
    },
    content: {
        alignItems: "center",
        zIndex: 1,
    },
    iconContainer: {
        position: "relative",
        marginBottom: 30,
        padding: 20,
        borderRadius: 80,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.1)",
    },
    crossLine: {
        position: "absolute",
        width: 100,
        height: 3,
        backgroundColor: "#ef4444",
        top: "50%",
        left: "50%",
        transform: [
            { translateX: -50 },
            { translateY: -1.5 },
            { rotate: "45deg" },
        ],
        borderRadius: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1e293b",
        textAlign: "center",
        marginBottom: 16,
        fontFamily: "System",
    },
    subtitle: {
        fontSize: 16,
        color: "#64748b",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 40,
        maxWidth: width * 0.8,
    },
    retryButton: {
        backgroundColor: "#1A202C",
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 25,
        marginBottom: 40,
        shadowColor: "#1A202C",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
        minWidth: 200,
    },
    retryButtonDisabled: {
        backgroundColor: "#94a3b8",
        shadowOpacity: 0.1,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingSpinner: {
        marginRight: 8,
    },
    retryText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
});

export default NoInternetScreen;
