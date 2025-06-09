import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Platform,
    ToastAndroid,
    BackHandler,
    Animated,
    Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import IconSharp from "react-native-vector-icons/MaterialIcons";
import IconOutlined from "react-native-vector-icons/MaterialIcons";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import {
    useRoute,
    useNavigation,
    RouteProp,
    useFocusEffect,
    CommonActions,
} from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

type SuccessSavedRouteParams = {
    pdfUri: string;
};

type RootStackParamList = {
    SuccessSaved: SuccessSavedRouteParams;
};

const SuccessSaved = () => {
    const route = useRoute<RouteProp<RootStackParamList, "SuccessSaved">>();
    const navigation = useNavigation();
    const { pdfUri } = route.params;

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const buttonSlideAnim = useRef(new Animated.Value(100)).current;
    const floatingAnim = useRef(new Animated.Value(0)).current;

    // Particle animations
    const particle1 = useRef(new Animated.Value(0)).current;
    const particle2 = useRef(new Animated.Value(0)).current;
    const particle3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start entrance animations
        Animated.sequence([
            // Fade in the container
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            // Scale and rotate the success icon
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // Slide up text and buttons
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            delay: 400,
            useNativeDriver: true,
        }).start();

        Animated.timing(buttonSlideAnim, {
            toValue: 0,
            duration: 800,
            delay: 600,
            useNativeDriver: true,
        }).start();

        // Continuous floating animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatingAnim, {
                    toValue: -10,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatingAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ]),
        ).start();

        // Pulse animation for the icon
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ]),
        ).start();

        // Particle animations
        startParticleAnimations();
    }, []);

    const startParticleAnimations = () => {
        const animateParticle = (
            particle: Animated.Value | Animated.ValueXY,
            delay = 0,
        ) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(particle, {
                        toValue: 1,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(particle, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        };

        animateParticle(particle1, 0);
        animateParticle(particle2, 1000);
        animateParticle(particle3, 2000);
    };

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: "MainTabs" }],
                    }),
                );
                return true;
            };

            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress,
            );

            return () => backHandler.remove();
        }, [navigation]),
    );

    const goToHome = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "MainTabs" }],
            }),
        );
    };

    const handleDownloadPDF = async () => {
        try {
            const fileName = pdfUri.split("/").pop();
            if (!FileSystem.documentDirectory) {
                Alert.alert(
                    "خطأ",
                    "لا يمكن تحديد مجلد المستندات على هذا الجهاز",
                );
                return;
            }
            const destPath = FileSystem.documentDirectory + fileName;

            await FileSystem.copyAsync({
                from: pdfUri,
                to: destPath,
            });

            if (Platform.OS === "android") {
                ToastAndroid.show(
                    "تم تحميل الفاتورة في مجلد المستندات 📄",
                    ToastAndroid.SHORT,
                );
            } else {
                Alert.alert("تم التحميل", "تم تحميل الفاتورة بنجاح ✅");
            }
        } catch (error) {
            console.error("خطأ أثناء التحميل:", error);
            Alert.alert("خطأ", "فشل في تحميل الملف");
        }
    };

    const handleWhatsAppShare = async () => {
        try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert("خطأ", "المشاركة غير مدعومة على هذا الجهاز");
                return;
            }

            await Sharing.shareAsync(pdfUri, {
                dialogTitle: "مشاركة الفاتورة عبر واتساب",
                mimeType: "application/pdf",
            });

            if (Platform.OS === "android") {
                ToastAndroid.show("تمت المشاركة بنجاح 🎉", ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error("خطأ أثناء المشاركة:", error);
            Alert.alert("خطأ", "حدث خطأ أثناء المشاركة");
        }
    };

    const handleGoHome = () => {
        goToHome();
    };

    const AnimatedTouchable =
        Animated.createAnimatedComponent(TouchableOpacity);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const particleOpacity = (particle: Animated.Value) =>
        particle.interpolate({
            inputRange: [0, 0.3, 0.7, 1],
            outputRange: [0, 1, 1, 0],
        });

    const particleTranslateY = (particle: Animated.Value) =>
        particle.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -200],
        });

    return (
        <View style={styles.container}>
            {/* Animated Background Particles */}
            <Animated.View
                style={[
                    styles.particle,
                    styles.particle1,
                    {
                        opacity: particleOpacity(particle1),
                        transform: [
                            { translateY: particleTranslateY(particle1) },
                        ],
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.particle,
                    styles.particle2,
                    {
                        opacity: particleOpacity(particle2),
                        transform: [
                            { translateY: particleTranslateY(particle2) },
                        ],
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.particle,
                    styles.particle3,
                    {
                        opacity: particleOpacity(particle3),
                        transform: [
                            { translateY: particleTranslateY(particle3) },
                        ],
                    },
                ]}
            />

            {/* Background Gradient Effect */}
            <View style={styles.backgroundGradient} />

            <Animated.View
                style={[
                    styles.main,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: floatingAnim }],
                    },
                ]}
            >
                {/* Success Icon with Glow Effect */}
                <View style={styles.iconContainer}>
                    <View style={styles.glowEffect} />
                    <Animated.View
                        style={[
                            styles.iconWrapper,
                            {
                                transform: [
                                    {
                                        scale: Animated.multiply(
                                            scaleAnim,
                                            pulseAnim,
                                        ),
                                    },
                                    { rotate: rotation },
                                ],
                            },
                        ]}
                    >
                        <IconSharp
                            name="check-circle"
                            size={100}
                            color="#22c55e"
                        />
                    </Animated.View>
                </View>

                {/* Animated Text */}
                <Animated.View
                    style={[
                        styles.textContainer,
                        {
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Text style={styles.successTitle}>
                        تم حفظ الفاتورة بنجاح
                    </Text>
                    <Text style={styles.description}>
                        تم حفظ فاتورتك وهي جاهزة للمشاركة أو التنزيل.
                    </Text>
                </Animated.View>

                {/* Animated Buttons */}
                <Animated.View
                    style={[
                        styles.buttonGroup,
                        {
                            transform: [{ translateY: buttonSlideAnim }],
                        },
                    ]}
                >
                    <AnimatedTouchable
                        style={[styles.button, styles.pdfButton]}
                        onPress={handleDownloadPDF}
                        activeOpacity={0.8}
                    >
                        <View style={styles.buttonContent}>
                            <IconOutlined
                                name="picture-as-pdf"
                                size={24}
                                color="white"
                            />
                            <Text style={styles.buttonText}>
                                تحميل الفاتورة PDF
                            </Text>
                        </View>
                        <View style={styles.buttonGlow} />
                    </AnimatedTouchable>

                    <AnimatedTouchable
                        style={[styles.button, styles.whatsappButton]}
                        onPress={handleWhatsAppShare}
                        activeOpacity={0.8}
                    >
                        <View style={styles.buttonContent}>
                            <Icon name="chat" size={24} color="white" />
                            <Text style={styles.buttonText}>
                                مشاركة عبر واتساب
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.buttonGlow,
                                { backgroundColor: "#25D366" },
                            ]}
                        />
                    </AnimatedTouchable>

                    <AnimatedTouchable
                        style={styles.homeButton}
                        onPress={handleGoHome}
                        activeOpacity={0.7}
                    >
                        <View style={styles.buttonContent}>
                            <IconOutlined name="home" size={24} color="#666" />
                            <Text
                                style={[styles.buttonText, { color: "#666" }]}
                            >
                                العودة إلى القائمة الرئيسية
                            </Text>
                        </View>
                    </AnimatedTouchable>
                </Animated.View>
            </Animated.View>

            {/* Modern Bottom Indicator */}
            <View style={styles.footer}>
                <View style={styles.footerIndicator} />
            </View>
        </View>
    );
};

export default SuccessSaved;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fafafa",
        justifyContent: "space-between",
    },
    backgroundGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.4,
        backgroundColor: "rgba(34, 197, 94, 0.03)",
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
    },
    particle: {
        position: "absolute",
        width: 8,
        height: 8,
        backgroundColor: "#22c55e",
        borderRadius: 4,
    },
    particle1: {
        top: height * 0.2,
        left: width * 0.2,
    },
    particle2: {
        top: height * 0.25,
        right: width * 0.25,
    },
    particle3: {
        top: height * 0.3,
        left: width * 0.7,
    },
    main: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    iconContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
    },
    glowEffect: {
        position: "absolute",
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "#22c55e",
        opacity: 0.1,
    },
    iconWrapper: {
        alignItems: "center",
        justifyContent: "center",
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(34, 197, 94, 0.05)",
        borderWidth: 2,
        borderColor: "rgba(34, 197, 94, 0.1)",
    },
    textContainer: {
        alignItems: "center",
        marginBottom: 40,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1a1a1a",
        marginBottom: 12,
        textAlign: "center",
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 17,
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
        fontWeight: "400",
    },
    buttonGroup: {
        width: "100%",
        gap: 16,
        alignItems: "center",
    },
    button: {
        height: 60,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        width: "100%",
        overflow: "hidden",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        zIndex: 2,
    },
    buttonGlow: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#000",
        opacity: 0.9,
        borderRadius: 20,
    },
    pdfButton: {
        backgroundColor: "#1a1a1a",
    },
    whatsappButton: {
        backgroundColor: "#25D366",
    },
    homeButton: {
        marginTop: 8,
        borderWidth: 2,
        borderColor: "#e5e5e5",
        borderRadius: 20,
        paddingHorizontal: 32,
        height: 60,
        backgroundColor: "#ffffff",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        fontSize: 17,
        color: "#fff",
        fontWeight: "600",
        letterSpacing: -0.2,
    },
    footer: {
        padding: 24,
        alignItems: "center",
        backgroundColor: "transparent",
    },
    footerIndicator: {
        height: 4,
        width: 50,
        borderRadius: 2,
        backgroundColor: "#d1d5db",
    },
});
