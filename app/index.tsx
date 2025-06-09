import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, Animated, Pressable, Text } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import Home from "./screens/Home";
import Settings from "./screens/Settings";
import AddInvoice from "./screens/AddInvoice";
import InvoicePreview from "./screens/InvoicePreview";
import History from "./screens/History";
import SuccessSaved from "./screens/SuccessSaved";
import NoInternetScreen from "./screens/NoInternetScreen";
import SplashScreen from "./screens/SplashScreen";

export type RootStackParamList = {
    Home: undefined;
    InvoiceScreen: undefined;
    AddInvoice: undefined;
    MainTabs: undefined;
    NoInternet: undefined;
    SuccessSaved: {
        pdfUri: string;
    };
    InvoicePreview: {
        customerName: string;
        phoneNumber: string;
        invoiceNumber: string;
        items: {
            id: number;
            name: string;
            price: number;
            quantity: number;
        }[];
        total: number;
        invoiceDate: string;
    };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    const [animatedValues] = useState(
        state.routes.map(() => new Animated.Value(0)),
    );

    const focusedOptions = descriptors[state.routes[state.index].key].options;
    if (focusedOptions.tabBarVisible === false) return null;

    return (
        <View
            style={{
                flexDirection: "row",
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
                paddingHorizontal: 20,
                paddingTop: 15,
                paddingBottom: 25,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -8 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 25,
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 95,
            }}
        >
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel ?? options.title ?? route.name;
                const isFocused = state.index === index;

                useEffect(() => {
                    Animated.spring(animatedValues[index], {
                        toValue: isFocused ? 1 : 0,
                        useNativeDriver: false,
                        tension: 150,
                        friction: 8,
                    }).start();
                }, [isFocused]);

                const onPress = () => {
                    const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: "tabLongPress",
                        target: route.key,
                    });
                };

                let iconName: keyof typeof Ionicons.glyphMap = "home-outline";
                if (route.name === "Home") {
                    iconName = isFocused ? "home" : "home-outline";
                } else if (route.name === "History") {
                    iconName = isFocused
                        ? "document-text"
                        : "document-text-outline";
                } else if (route.name === "Settings") {
                    iconName = isFocused ? "settings" : "settings-outline";
                }

                const backgroundOpacity = animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                });

                const scale = animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                });

                const translateY = animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -3],
                });

                return (
                    <Animated.View
                        key={route.key}
                        style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            transform: [{ translateY }],
                        }}
                    >
                        <Animated.View
                            style={{
                                backgroundColor: "#2D3748",
                                borderRadius: 25,
                                paddingHorizontal: 35,
                                paddingVertical: 30,
                                opacity: backgroundOpacity,
                                position: "absolute",
                                width: isFocused ? "auto" : 0,
                                minWidth: isFocused ? 50 : 0,
                            }}
                        />
                        <Animated.View
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                transform: [{ scale }],
                            }}
                        >
                            <Pressable
                                onPress={onPress}
                                onLongPress={onLongPress}
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 8,
                                }}
                            >
                                <Ionicons
                                    name={iconName}
                                    size={18}
                                    color={isFocused ? "#FFFFFF" : "#A0AEC0"}
                                />
                                <Animated.Text
                                    style={{
                                        marginTop: 3,
                                        color: isFocused
                                            ? "#FFFFFF"
                                            : "#A0AEC0",
                                        fontSize: 10,
                                        fontWeight: isFocused ? "600" : "400",
                                        opacity: animatedValues[
                                            index
                                        ].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.7, 1],
                                        }),
                                        textAlign: "center",
                                    }}
                                >
                                    {label}
                                </Animated.Text>
                            </Pressable>
                        </Animated.View>
                    </Animated.View>
                );
            })}
        </View>
    );
};

function MainTabs() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    title: "الرئيسية",
                    tabBarLabel: "الرئيسية",
                }}
            />
            <Tab.Screen
                name="History"
                component={History}
                options={{
                    title: "السجل",
                    tabBarLabel: "السجل",
                }}
            />
            <Tab.Screen
                name="Settings"
                component={Settings}
                options={{
                    title: "الضبط",
                    tabBarLabel: "الضبط",
                }}
            />
        </Tab.Navigator>
    );
}

function AppNavigator() {
    const [isConnected, setIsConnected] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const state = await NetInfo.fetch();
                setIsConnected(
                    Boolean(state.isConnected) &&
                        Boolean(state.isInternetReachable),
                );
            } catch {
                setIsConnected(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkConnection();

        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(
                Boolean(state.isConnected) &&
                    Boolean(state.isInternetReachable),
            );
        });

        return () => unsubscribe();
    }, []);

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    if (showSplash) {
        return <SplashScreen onFinish={handleSplashFinish} />;
    }

    if (isLoading) return null;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isConnected ? (
                <>
                    <Stack.Screen name="MainTabs" component={MainTabs} />
                    <Stack.Screen name="AddInvoice" component={AddInvoice} />
                    <Stack.Screen
                        name="InvoicePreview"
                        component={InvoicePreview}
                    />
                    <Stack.Screen
                        name="SuccessSaved"
                        component={SuccessSaved}
                    />
                </>
            ) : (
                <Stack.Screen name="NoInternet" component={NoInternetScreen} />
            )}
        </Stack.Navigator>
    );
}

export default function Index(): JSX.Element {
    return <AppNavigator />;
}
