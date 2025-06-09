import React, { useState } from "react";
import {
    View,
    Text,
    Switch,
    Pressable,
    Alert,
    ActivityIndicator,
} from "react-native";
import { FontAwesome, MaterialIcons, Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import HeadPage from "../components/HeadPage";

type RootStackParamList = {
    Settings: undefined;
    Language: undefined;
};

export default function Settings() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [isAutoShare, setIsAutoShare] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleLanguagePress = () => {
        navigation.navigate("Language");
    };

    const deleteAllInvoices = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(
                "https://fatora-backend.vercel.app/api/invoices",
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            if (response.ok) {
                const result = await response.json();
                Alert.alert("تم بنجاح", `تم حذف جميع الفواتير`, [
                    {
                        text: "موافق",
                        onPress: () => {
                            console.log("تم حذف جميع الفواتير بنجاح");
                        },
                    },
                ]);
            } else {
                const errorData = await response.json();
                Alert.alert("خطأ", errorData.message || "فشل في حذف الفواتير");
            }
        } catch (error) {
            console.error("خطأ في حذف الفواتير:", error);
            Alert.alert(
                "خطأ في الشبكة",
                "تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.",
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteData = () => {
        Alert.alert(
            "تأكيد الحذف",
            "هل أنت متأكد من مسح جميع الفواتير المحفوظة؟\n\n⚠️ تحذير: لا يمكن التراجع عن هذا الإجراء!",
            [
                {
                    text: "إلغاء",
                    style: "cancel",
                },
                {
                    text: "نعم، احذف الكل",
                    style: "destructive",
                    onPress: () => {
                        // تأكيد إضافي للأمان
                        Alert.alert(
                            "تأكيد نهائي",
                            "هذا الإجراء سيحذف جميع الفواتير نهائياً!\nهل أنت متأكد 100%؟",
                            [
                                {
                                    text: "لا، تراجع",
                                    style: "cancel",
                                },
                                {
                                    text: "نعم، احذف نهائياً",
                                    style: "destructive",
                                    onPress: deleteAllInvoices,
                                },
                            ],
                        );
                    },
                },
            ],
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
            <HeadPage title="الإعدادات   " />

            {/* Language Option */}
            <View
                style={{
                    backgroundColor: "#fff",
                    margin: 16,
                    borderRadius: 12,
                    overflow: "hidden",
                }}
            >
                <Pressable
                    onPress={handleLanguagePress}
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 16,
                        borderBottomWidth: 1,
                        borderColor: "#eee",
                    }}
                >
                    <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                    >
                        <FontAwesome name="globe" size={20} color="#000" />
                        <Text style={{ marginLeft: 10, fontSize: 16 }}>
                            اللغة
                        </Text>
                    </View>
                    <Text style={{ fontSize: 16, color: "#555" }}>العربية</Text>
                </Pressable>

                {/* WhatsApp Share Option */}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 16,
                    }}
                >
                    <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                    >
                        <Entypo name="share" size={20} color="#000" />
                        <Text style={{ marginLeft: 10, fontSize: 16 }}>
                            المشاركة التلقائية على واتس آب
                        </Text>
                    </View>
                    <Switch
                        value={isAutoShare}
                        onValueChange={setIsAutoShare}
                    />
                </View>
            </View>

            {/* Delete All Data */}
            <View
                style={{
                    backgroundColor: "#fff",
                    marginHorizontal: 16,
                    borderRadius: 12,
                }}
            >
                <Pressable
                    onPress={handleDeleteData}
                    disabled={isDeleting}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 16,
                        opacity: isDeleting ? 0.6 : 1,
                    }}
                >
                    <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                    >
                        <MaterialIcons
                            name="delete"
                            size={24}
                            color={isDeleting ? "#999" : "red"}
                        />
                        <Text
                            style={{
                                marginLeft: 10,
                                color: isDeleting ? "#999" : "red",
                                fontSize: 16,
                            }}
                        >
                            {isDeleting
                                ? "جاري حذف البيانات..."
                                : "مسح جميع الفواتير المحفوظة"}
                        </Text>
                    </View>

                    {isDeleting && (
                        <ActivityIndicator
                            size="small"
                            color="red"
                            style={{ marginRight: 10 }}
                        />
                    )}
                </Pressable>
            </View>

            {/* Warning Text */}
            <View
                style={{
                    marginHorizontal: 16,
                    marginTop: 8,
                    padding: 12,
                    backgroundColor: "#FFF3CD",
                    borderRadius: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: "#FFC107",
                }}
            >
                <Text
                    style={{
                        fontSize: 12,
                        color: "#856404",
                        textAlign: "center",
                    }}
                >
                    ⚠️ تحذير: حذف البيانات لا يمكن التراجع عنه
                </Text>
            </View>
        </View>
    );
}
