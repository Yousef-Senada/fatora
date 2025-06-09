import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    Animated,
    Dimensions,
    StyleSheet,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleTranslateY = useRef(new Animated.Value(30)).current;
    const loadingOpacity = useRef(new Animated.Value(0)).current;
    const loadingRotation = useRef(new Animated.Value(0)).current;
    const backgroundOpacity = useRef(new Animated.Value(0)).current;

    // Animation for the circular loading indicator
    const pulseAnimation = useRef(new Animated.Value(1)).current;
    const circleScale1 = useRef(new Animated.Value(0)).current;
    const circleScale2 = useRef(new Animated.Value(0)).current;
    const circleScale3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startAnimations = () => {
            // Background fade in
            Animated.timing(backgroundOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();

            // Logo animations
            Animated.sequence([
                Animated.delay(300),
                Animated.parallel([
                    Animated.spring(logoScale, {
                        toValue: 1,
                        tension: 100,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.timing(logoOpacity, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();

            // Title animations
            Animated.sequence([
                Animated.delay(800),
                Animated.parallel([
                    Animated.timing(titleOpacity, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.spring(titleTranslateY, {
                        toValue: 0,
                        tension: 80,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();

            // Loading indicator
            Animated.sequence([
                Animated.delay(1200),
                Animated.timing(loadingOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start();

            // Continuous loading rotation
            Animated.loop(
                Animated.timing(loadingRotation, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ).start();

            // Pulse animation for logo
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnimation, {
                        toValue: 1.1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnimation, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ]),
            ).start();

            // Ripple effect circles
            const createRipple = (scale: Animated.Value, delay: number) => {
                Animated.loop(
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(scale, {
                            toValue: 1,
                            duration: 2000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scale, {
                            toValue: 0,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ]),
                ).start();
            };

            setTimeout(() => {
                createRipple(circleScale1, 0);
                createRipple(circleScale2, 600);
                createRipple(circleScale3, 1200);
            }, 1500);

            // Finish splash screen after 3 seconds
            setTimeout(() => {
                Animated.parallel([
                    Animated.timing(logoOpacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(titleOpacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(loadingOpacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(backgroundOpacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    onFinish();
                });
            }, 3000);
        };

        startAnimations();
    }, []);

    const spin = loadingRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#1A202C" />
            <Animated.View
                style={[styles.container, { opacity: backgroundOpacity }]}
            >
                {/* Background gradient circles */}
                <View style={styles.backgroundCircles}>
                    <Animated.View
                        style={[
                            styles.rippleCircle,
                            styles.ripple1,
                            {
                                transform: [{ scale: circleScale1 }],
                                opacity: circleScale1.interpolate({
                                    inputRange: [0, 0.5, 1],
                                    outputRange: [0.3, 0.1, 0],
                                }),
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.rippleCircle,
                            styles.ripple2,
                            {
                                transform: [{ scale: circleScale2 }],
                                opacity: circleScale2.interpolate({
                                    inputRange: [0, 0.5, 1],
                                    outputRange: [0.2, 0.05, 0],
                                }),
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.rippleCircle,
                            styles.ripple3,
                            {
                                transform: [{ scale: circleScale3 }],
                                opacity: circleScale3.interpolate({
                                    inputRange: [0, 0.5, 1],
                                    outputRange: [0.15, 0.03, 0],
                                }),
                            },
                        ]}
                    />
                </View>

                {/* Main content */}
                <View style={styles.content}>
                    {/* Logo container with pulse effect */}
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            {
                                opacity: logoOpacity,
                                transform: [
                                    {
                                        scale: Animated.multiply(
                                            logoScale,
                                            pulseAnimation,
                                        ),
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.logoBackground}>
                            <Ionicons
                                name="document-text"
                                size={50}
                                color="#FFFFFF"
                            />
                        </View>
                    </Animated.View>

                    {/* App title */}
                    <Animated.View
                        style={[
                            styles.titleContainer,
                            {
                                opacity: titleOpacity,
                                transform: [{ translateY: titleTranslateY }],
                            },
                        ]}
                    >
                        <Text style={styles.title}>Invoice Manager</Text>
                        <Text style={styles.subtitle}>إدارة الفواتير</Text>
                    </Animated.View>

                    {/* Loading indicator */}
                    <Animated.View
                        style={[
                            styles.loadingContainer,
                            {
                                opacity: loadingOpacity,
                            },
                        ]}
                    >
                        <Animated.View
                            style={[
                                styles.loadingSpinner,
                                {
                                    transform: [{ rotate: spin }],
                                },
                            ]}
                        >
                            <View style={styles.spinnerDot} />
                            <View
                                style={[styles.spinnerDot, styles.spinnerDot2]}
                            />
                            <View
                                style={[styles.spinnerDot, styles.spinnerDot3]}
                            />
                        </Animated.View>
                        <Text style={styles.loadingText}>جاري التحضير...</Text>
                    </Animated.View>
                </View>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1A202C", // Dark background - مريح جداً للعين
        justifyContent: "center",
        alignItems: "center",
    },
    backgroundCircles: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    rippleCircle: {
        position: "absolute",
        borderRadius: 500,
        borderWidth: 1,
        borderColor: "#E53E3E", // Soft red for ripples - هادئ ومريح
    },
    ripple1: {
        width: 300,
        height: 300,
        top: height * 0.2,
        left: width * 0.1,
    },
    ripple2: {
        width: 200,
        height: 200,
        top: height * 0.6,
        right: width * 0.1,
    },
    ripple3: {
        width: 150,
        height: 150,
        top: height * 0.3,
        right: width * 0.3,
    },
    content: {
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    },
    logoContainer: {
        marginBottom: 30,
    },
    logoBackground: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#E53E3E", // Soft red - مريح للعين
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#E53E3E",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    titleContainer: {
        alignItems: "center",
        marginBottom: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "400",
        color: "#A0AEC0", // Light gray - مريح جداً للعين
        textAlign: "center",
    },
    loadingContainer: {
        alignItems: "center",
    },
    loadingSpinner: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    spinnerDot: {
        position: "absolute",
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#FFFFFF",
        top: 0,
    },
    spinnerDot2: {
        transform: [{ rotate: "120deg" }],
    },
    spinnerDot3: {
        transform: [{ rotate: "240deg" }],
    },
    loadingText: {
        fontSize: 16,
        color: "#A0AEC0",
        fontWeight: "500",
    },
});

export default SplashScreen;
