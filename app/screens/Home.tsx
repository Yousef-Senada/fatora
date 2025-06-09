import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    I18nManager,
    Animated,
    Easing,
    Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
I18nManager.forceRTL(true);

const Home = () => {
    const navigation = useNavigation();

    // Animation refs
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoRotate = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    // GM Logo specific animations
    const gmTextScale = useRef(new Animated.Value(1)).current;
    const ringRotate = useRef(new Animated.Value(0)).current;
    const shineAnim = useRef(new Animated.Value(0)).current;
    const dotPulse1 = useRef(new Animated.Value(0.6)).current;
    const dotPulse2 = useRef(new Animated.Value(0.6)).current;
    const dotPulse3 = useRef(new Animated.Value(0.6)).current;
    const dotPulse4 = useRef(new Animated.Value(0.6)).current;

    // Content animations
    const fadeInAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(50)).current;
    const buttonScale1 = useRef(new Animated.Value(0)).current;
    const buttonScale2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Logo entrance animation
        Animated.sequence([
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
                Animated.timing(logoRotate, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // Content fade in
        Animated.parallel([
            Animated.timing(fadeInAnim, {
                toValue: 1,
                duration: 800,
                delay: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideUpAnim, {
                toValue: 0,
                tension: 80,
                friction: 8,
                delay: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Buttons entrance
        Animated.stagger(200, [
            Animated.spring(buttonScale1, {
                toValue: 1,
                tension: 100,
                friction: 8,
                delay: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(buttonScale2, {
                toValue: 1,
                tension: 100,
                friction: 8,
                delay: 1200,
                useNativeDriver: true,
            }),
        ]).start();

        // Continuous animations
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ]),
        );

        const floatAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 3000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ]),
        );

        // GM Logo specific animations
        const gmTextAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(gmTextScale, {
                    toValue: 1.1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(gmTextScale, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ]),
        );

        const ringAnimation = Animated.loop(
            Animated.timing(ringRotate, {
                toValue: 1,
                duration: 15000,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        );

        const shineAnimation = Animated.loop(
            Animated.timing(shineAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        );

        // Dot pulse animations with delays
        const dotAnimations = [
            Animated.loop(
                Animated.sequence([
                    Animated.timing(dotPulse1, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dotPulse1, {
                        toValue: 0.6,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]),
            ),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(dotPulse2, {
                        toValue: 1,
                        duration: 1000,
                        delay: 250,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dotPulse2, {
                        toValue: 0.6,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]),
            ),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(dotPulse3, {
                        toValue: 1,
                        duration: 1000,
                        delay: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dotPulse3, {
                        toValue: 0.6,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]),
            ),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(dotPulse4, {
                        toValue: 1,
                        duration: 1000,
                        delay: 750,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dotPulse4, {
                        toValue: 0.6,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]),
            ),
        ];

        pulseAnimation.start();
        floatAnimation.start();
        gmTextAnimation.start();
        ringAnimation.start();
        shineAnimation.start();
        dotAnimations.forEach((anim) => anim.start());

        return () => {
            pulseAnimation.stop();
            floatAnimation.stop();
            gmTextAnimation.stop();
            ringAnimation.stop();
            shineAnimation.stop();
            dotAnimations.forEach((anim) => anim.stop());
        };
    }, []);

    const rotateInterpolate = logoRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const floatInterpolate = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10],
    });

    const ringRotateInterpolate = ringRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const shineInterpolate = shineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200],
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* Background decoration */}
            <View style={styles.backgroundDecoration}>
                <Animated.View
                    style={[styles.decorationCircle, styles.circle1]}
                />
                <Animated.View
                    style={[styles.decorationCircle, styles.circle2]}
                />
                <Animated.View
                    style={[styles.decorationCircle, styles.circle3]}
                />
            </View>

            {/* Header */}
            <View style={styles.header}>
                <View style={{ width: 40 }} />
                <Text style={styles.headerText}>الصفحة الرئيسية</Text>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => (navigation as any).navigate("Settings")}
                    activeOpacity={0.7}
                >
                    <Icon name="settings" size={24} color="#4B5563" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* GM Animated Logo */}
                <Animated.View
                    style={[
                        styles.gmLogoContainer,
                        {
                            opacity: logoOpacity,
                            transform: [
                                {
                                    scale: Animated.multiply(
                                        logoScale,
                                        pulseAnim,
                                    ),
                                },
                                { rotate: rotateInterpolate },
                                { translateY: floatInterpolate },
                            ],
                        },
                    ]}
                >
                    {/* Rotating Ring */}
                    <Animated.View
                        style={[
                            styles.rotatingRing,
                            {
                                transform: [{ rotate: ringRotateInterpolate }],
                            },
                        ]}
                    />

                    {/* Main Logo Circle */}
                    <View style={styles.gmLogoMain}>
                        {/* Shine Effect */}
                        <Animated.View
                            style={[
                                styles.shineEffect,
                                {
                                    transform: [
                                        { translateX: shineInterpolate },
                                    ],
                                },
                            ]}
                        />

                        {/* Top Arc with Arabic Text */}
                        <View style={styles.topArc}>
                            <Text style={styles.arabicText}>شــــرقــيــة</Text>
                        </View>

                        {/* Red Accent */}
                        <View style={styles.redAccent} />

                        {/* Main Text */}
                        <Animated.View
                            style={[
                                styles.mainTextContainer,
                                {
                                    transform: [{ scale: gmTextScale }],
                                },
                            ]}
                        >
                            <Text style={styles.gmText}>GM</Text>
                            <Text style={styles.dashText}>-</Text>
                            <Text style={styles.sharqiyaText}>SHARQIYA</Text>
                        </Animated.View>

                        {/* Bottom Text */}
                        <Text style={styles.bottomText}>
                            Region : Made In A.R.E
                        </Text>
                    </View>

                    {/* Pulsing Dots */}
                    <Animated.View
                        style={[
                            styles.pulsingDot,
                            styles.dot1,
                            {
                                opacity: dotPulse1,
                                transform: [{ scale: dotPulse1 }],
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.pulsingDot,
                            styles.dot2,
                            {
                                opacity: dotPulse2,
                                transform: [{ scale: dotPulse2 }],
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.pulsingDot,
                            styles.dot3,
                            {
                                opacity: dotPulse3,
                                transform: [{ scale: dotPulse3 }],
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.pulsingDot,
                            styles.dot4,
                            {
                                opacity: dotPulse4,
                                transform: [{ scale: dotPulse4 }],
                            },
                        ]}
                    />
                </Animated.View>

                {/* Welcome Content */}
                <Animated.View
                    style={[
                        styles.welcomeContainer,
                        {
                            opacity: fadeInAnim,
                            transform: [{ translateY: slideUpAnim }],
                        },
                    ]}
                >
                    <Text style={styles.welcomeText}>مرحباً بك في GM</Text>
                    <Text style={styles.subText}>
                        ابدأ بإنشاء فاتورة جديدة أو تصفح أعمالك بسهولة
                    </Text>
                </Animated.View>

                {/* Action Buttons */}
                <View style={styles.buttonsContainer}>
                    <Animated.View
                        style={[
                            styles.buttonWrapper,
                            { transform: [{ scale: buttonScale1 }] },
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={() =>
                                (navigation as any).navigate("AddInvoice")
                            }
                            activeOpacity={0.8}
                        >
                            <View style={styles.buttonContent}>
                                <View style={styles.iconContainer}>
                                    <Icon
                                        name="add-circle"
                                        size={24}
                                        color="#FFFFFF"
                                    />
                                </View>
                                <Text style={styles.btnText}>
                                    إنشاء فاتورة جديدة
                                </Text>
                            </View>
                            <View style={styles.buttonGlow} />
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.buttonWrapper,
                            { transform: [{ scale: buttonScale2 }] },
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={() =>
                                (navigation as any).navigate("History")
                            }
                            activeOpacity={0.8}
                        >
                            <View style={styles.buttonContent}>
                                <View style={styles.iconContainerSecondary}>
                                    <Icon
                                        name="history"
                                        size={24}
                                        color="#E53E3E"
                                    />
                                </View>
                                <Text style={styles.secondaryBtnText}>
                                    سجل الفواتير
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    backgroundDecoration: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    },
    decorationCircle: {
        position: "absolute",
        borderRadius: 100,
        backgroundColor: "#E53E3E",
        opacity: 0.03,
    },
    circle1: {
        width: 200,
        height: 200,
        top: -50,
        right: -50,
    },
    circle2: {
        width: 150,
        height: 150,
        bottom: 100,
        left: -30,
    },
    circle3: {
        width: 100,
        height: 100,
        top: height * 0.4,
        left: width * 0.8,
    },
    header: {
        padding: 20,
        paddingTop: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "transparent",
    },
    headerText: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1F2937",
        letterSpacing: 0.5,
    },
    settingsButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    gmLogoContainer: {
        marginTop: 30,
        marginBottom: 40,
        alignItems: "center",
        justifyContent: "center",
        width: 200,
        height: 200,
    },
    rotatingRing: {
        position: "absolute",
        width: 220,
        height: 220,
        borderRadius: 110,
        borderWidth: 2,
        borderColor: "#E53E3E",
        borderStyle: "dashed",
        opacity: 0.3,
    },
    gmLogoMain: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "#FFFFFF",
        borderWidth: 4,
        borderColor: "#333333",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
        overflow: "hidden",
        position: "relative",
    },
    shineEffect: {
        position: "absolute",
        top: 0,
        width: 40,
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        transform: [{ rotate: "45deg" }],
    },
    topArc: {
        position: "absolute",
        top: -2,
        width: 120,
        height: 50,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        borderWidth: 2,
        borderBottomWidth: 0,
        borderColor: "#333333",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 8,
    },
    arabicText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#E53E3E",
        textAlign: "center",
    },
    redAccent: {
        position: "absolute",
        top: 40,
        width: 80,
        height: 12,
        backgroundColor: "#E53E3E",
        borderRadius: 6,
    },
    mainTextContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    gmText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#E53E3E",
    },
    dashText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333333",
        marginHorizontal: 5,
    },
    sharqiyaText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333333",
    },
    bottomText: {
        position: "absolute",
        bottom: 15,
        fontSize: 10,
        color: "#333333",
        fontWeight: "600",
    },
    pulsingDot: {
        position: "absolute",
        width: 8,
        height: 8,
        backgroundColor: "#E53E3E",
        borderRadius: 4,
    },
    dot1: { top: 20, right: 20 },
    dot2: { top: 20, left: 20 },
    dot3: { bottom: 20, right: 20 },
    dot4: { bottom: 20, left: 20 },
    // Rest of styles remain the same
    welcomeContainer: {
        alignItems: "center",
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    welcomeText: {
        fontSize: 26,
        fontWeight: "700",
        color: "#1F2937",
        textAlign: "center",
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    subText: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
        maxWidth: 300,
    },
    buttonsContainer: {
        width: "100%",
        alignItems: "center",
        gap: 16,
        marginBottom: 40,
    },
    buttonWrapper: {
        width: "100%",
        maxWidth: 340,
    },
    primaryBtn: {
        backgroundColor: "#1A202C",
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#1A202C",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    secondaryBtn: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#E5E7EB",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        paddingHorizontal: 24,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    iconContainerSecondary: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(229, 62, 62, 0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    btnText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "600",
        letterSpacing: 0.3,
    },
    secondaryBtnText: {
        fontSize: 17,
        color: "#374151",
        fontWeight: "600",
        letterSpacing: 0.3,
    },
    buttonGlow: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        opacity: 0,
    },
    statsContainer: {
        flexDirection: "row",
        gap: 20,
        marginTop: 20,
    },
    statCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        minWidth: 120,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1F2937",
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#6B7280",
        fontWeight: "500",
        textAlign: "center",
    },
});

export default Home;
