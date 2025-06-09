import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import HeadPage from "./../components/HeadPage";
import * as Print from "expo-print";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";
import { RootStackParamList } from "../index";

type InvoicePreviewScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "InvoicePreview"
>;

export default function InvoicePreview() {
    const route = useRoute();
    const navigation = useNavigation<InvoicePreviewScreenNavigationProp>();
    const [isLoading, setIsLoading] = useState(false);

    const {
        customerName,
        phoneNumber,
        items,
        total,
        invoiceDate,
        invoiceNumber,
    } = route.params as {
        customerName: string;
        phoneNumber: string;
        invoiceDate: string;
        invoiceNumber: string;
        items: {
            id: number;
            name: string;
            price: number;
            quantity: number;
        }[];
        total: number;
    };

    const handleSave = async () => {
        setIsLoading(true);

        const invoiceData = {
            customerName,
            phoneNumber,
            invoiceDate,
            invoiceNumber,
            items: items.map(({ name, price, quantity }) => ({
                name,
                price,
                quantity,
            })),
            total,
        };

        try {
            const response = await fetch(
                "https://fatora-backend.vercel.app/api/invoices",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(invoiceData),
                },
            );

            if (!response.ok) {
                throw new Error("فشل في حفظ الفاتورة في قاعدة البيانات");
            }

            const html = `
            <html dir="rtl">
                <head>
                    <meta charset="utf-8" />
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        h1 { text-align: center; color: #1A202C; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
                        .total { font-weight: bold; color: #1A202C; }
                    </style>
                </head>
                <body>
                    <h1>فاتورة</h1>
                    <p><strong>العميل:</strong> ${customerName}</p>
                    <p><strong>رقم الفاتورة:</strong> ${invoiceNumber}</p>
                    <p><strong>تاريخ الإصدار:</strong> ${invoiceDate}</p>

                    <h3>العناصر:</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>الصنف</th>
                                <th>السعر</th>
                                <th>الكمية</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items
                                .map(
                                    (item) => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.price.toFixed(2)} جنيه</td>
                                    <td>${item.quantity}</td>
                                </tr>`,
                                )
                                .join("")}
                        </tbody>
                    </table>

                    <p class="total">الإجمالي: ${total.toFixed(2)} جنيه</p>
                    <p style="text-align: center; margin-top: 40px;">شكراً لتعاملكم معنا</p>
                </body>
            </html>`;

            const { uri } = await Print.printToFileAsync({ html });

            navigation.navigate("SuccessSaved", { pdfUri: uri });
        } catch (err) {
            console.log("PDF أو API error", err);
            alert("حدث خطأ أثناء حفظ الفاتورة.");
        } finally {
            setIsLoading(false);
        }
    };

    // Modern Loader Component
    const ModernLoader = () => (
        <Modal
            transparent={true}
            animationType="fade"
            visible={isLoading}
            statusBarTranslucent={true}
        >
            <View className="flex-1 items-center justify-center bg-black/50">
                <View className="items-center justify-center rounded-3xl bg-white p-8 shadow-2xl">
                    {/* Animated circles loader */}
                    <View className="relative mb-6 h-16 w-16">
                        <View className="absolute inset-0 animate-spin rounded-full border-4 border-gray-200" />
                        <View className="absolute inset-0 animate-spin rounded-full border-4 border-[#1A202C] border-t-transparent" />
                        <View className="absolute inset-2 animate-pulse rounded-full bg-[#1A202C]/10" />
                    </View>

                    {/* Loading text with gradient effect */}
                    <Text className="text-lg font-bold text-[#1A202C]">
                        جاري الحفظ...
                    </Text>
                    <Text className="mt-1 text-sm text-gray-500">
                        يرجى الانتظار
                    </Text>

                    {/* Progress dots */}
                    <View className="mt-4 flex-row space-x-1 space-x-reverse">
                        <View className="h-2 w-2 animate-pulse rounded-full bg-[#1A202C]" />
                        <View
                            className="h-2 w-2 animate-pulse rounded-full bg-[#1A202C] opacity-75"
                            style={{ animationDelay: "0.2s" }}
                        />
                        <View
                            className="h-2 w-2 animate-pulse rounded-full bg-[#1A202C] opacity-50"
                            style={{ animationDelay: "0.4s" }}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <View className="flex-1 bg-gray-100">
            <HeadPage title="معاينة الفاتورة" />

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View className="rounded-xl bg-white shadow-xl">
                    {/* عنوان الفاتورة */}
                    <View className="border-b border-gray-200 p-6">
                        <Text className="mb-2 text-right text-3xl font-bold text-[#1A202C]">
                            فاتورة
                        </Text>
                        <Text className="text-right text-sm text-gray-500">
                            رقم الفاتورة:{" "}
                            <Text className="font-medium text-gray-800">
                                {invoiceNumber}
                            </Text>
                        </Text>
                        <Text className="text-right text-sm text-gray-500">
                            تاريخ الإصدار:{" "}
                            <Text className="font-medium text-gray-800">
                                {invoiceDate}
                            </Text>
                        </Text>
                    </View>

                    {/* بيانات العميل */}
                    <View className="border-b border-gray-200 p-6">
                        <Text className="mb-4 text-right text-lg font-semibold text-gray-800">
                            تفاصيل العميل:
                        </Text>
                        <View className="gap-y-3">
                            <View className="flex-row-reverse items-center space-x-2 space-x-reverse">
                                <Text className="text-gray-500">الاسم: </Text>
                                <Text className="text-right font-medium text-gray-800">
                                    {customerName}
                                </Text>
                            </View>

                            <View className="flex-row-reverse items-center space-x-2 space-x-reverse">
                                <Text className="text-gray-500">الهاتف: </Text>
                                <Text className="text-right font-medium text-gray-800">
                                    {phoneNumber}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* جدول العناصر */}
                    <View className="p-6">
                        <Text className="mb-4 text-right text-lg font-semibold text-gray-800">
                            عناصر الفاتورة:
                        </Text>
                        <View className="overflow-hidden rounded-md border border-gray-200">
                            {/* Header */}
                            <View className="flex-row-reverse bg-gray-100 p-3">
                                <Text className="flex-1 text-right font-semibold">
                                    اسم الصنف
                                </Text>
                                <Text className="w-24 text-center font-semibold">
                                    السعر
                                </Text>
                                <Text className="w-20 text-center font-semibold">
                                    الكمية
                                </Text>
                            </View>

                            {/* العناصر الفعلية */}
                            {items.map((item) => (
                                <View
                                    key={item.id}
                                    className="flex-row-reverse border-t border-gray-200 p-3"
                                >
                                    <Text className="flex-1 text-right">
                                        {item.name}
                                    </Text>
                                    <Text className="w-24 text-center">
                                        {item.price.toFixed(2)} جنيه
                                    </Text>
                                    <Text className="w-20 text-center">
                                        {item.quantity}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* الإجمالي */}
                    <View className="border-t border-gray-200 bg-gray-50 p-6">
                        <View className="flex-row-reverse justify-between border-t border-gray-300 pt-3">
                            <Text className="text-lg font-bold text-[#1A202C]">
                                الإجمالي:
                            </Text>
                            <Text className="text-lg font-bold text-[#1A202C]">
                                {total.toFixed(2)} جنيه
                            </Text>
                        </View>
                        <Text className="mt-8 text-center text-xs text-gray-500">
                            شكراً لتعاملكم معنا.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View className="flex-row border-t border-gray-200 bg-white p-4">
                <TouchableOpacity
                    className={`mr-2 h-12 flex-1 items-center justify-center rounded-lg ${
                        isLoading ? "bg-gray-400" : "bg-[#1A202C]"
                    }`}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <View className="flex-row items-center">
                            <ActivityIndicator size="small" color="white" />
                            <Text className="ml-2 font-semibold text-white">
                                جاري الحفظ...
                            </Text>
                        </View>
                    ) : (
                        <Text className="font-semibold text-white">حفظ</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Modern Loader Modal */}
            <ModernLoader />
        </View>
    );
}
