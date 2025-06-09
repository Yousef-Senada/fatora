import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import HeadPage from "./../components/HeadPage";
import * as Print from "expo-print";
import { StackNavigationProp } from "@react-navigation/stack";
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
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>فاتورة ${invoiceNumber}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: 'Cairo', sans-serif; 
                            background-color: #f5f7fa; 
                            padding: 20px; 
                        }
                        .invoice-container { 
                            max-width: 800px; 
                            margin: 20px auto; 
                            background: #ffffff; 
                            border-radius: 15px; 
                            box-shadow: 0 10px 40px rgba(0,0,0,0.1); 
                            overflow: hidden;
                        }
                        .header { 
                            background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); 
                            color: white; 
                            padding: 30px 40px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        }
                        .logo-section { display: flex; align-items: center; gap: 15px; }
                        .logo { 
                            width: 60px; 
                            height: 60px; 
                            background: white; 
                            border-radius: 50%; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                        }
                        .logo-text { font-size: 22px; font-weight: bold; color: #e53e3e; }
                        .company-info { text-align: left; }
                        .company-info h1 { font-size: 26px; margin: 0; font-weight: 700; text-shadow: 1px 1px 3px rgba(0,0,0,0.2); }
                        .company-info p { opacity: 0.9; font-size: 14px; margin-top: 4px; }
                        .invoice-title h2 { font-size: 28px; margin: 0; text-align: right; }
                        .invoice-title p { font-size: 14px; opacity: 0.9; text-align: right; margin-top: 4px; }
                        .content { padding: 30px 40px; }
                        .invoice-details { 
                            display: grid; 
                            grid-template-columns: 1fr 1fr; 
                            gap: 30px; 
                            margin-bottom: 40px; 
                        }
                        .detail-card h3 { 
                            color: #c53030; 
                            margin-bottom: 15px; 
                            font-size: 18px; 
                            padding-bottom: 10px;
                            border-bottom: 2px solid #e53e3e;
                        }
                        .detail-item { 
                            margin-bottom: 10px; 
                            display: flex; 
                            justify-content: flex-start;
                            align-items: baseline;
                            gap: 8px;
                        }
                        .detail-label { color: #555; font-weight: 600; }
                        .detail-value { color: #333; font-weight: 400; }
                        .section-title { font-size: 20px; color: #333; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px;}
                        .items-table { width: 100%; border-collapse: collapse; }
                        .items-table thead { background-color: #f8f9fa; }
                        .items-table th { 
                            padding: 15px; 
                            text-align: right; 
                            font-weight: 700; 
                            color: #333;
                            border-bottom: 2px solid #dee2e6;
                        }
                        .items-table td { padding: 15px; text-align: right; border-bottom: 1px solid #eef2f7; }
                        .items-table tr:last-child td { border-bottom: none; }
                        .items-table th:nth-child(2), .items-table td:nth-child(2),
                        .items-table th:nth-child(3), .items-table td:nth-child(3),
                        .items-table th:nth-child(4), .items-table td:nth-child(4) { text-align: center; }
                        .summary-section {
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 2px solid #eef2f7;
                            text-align: left;
                        }
                        .summary-item {
                            display: flex;
                            justify-content: space-between;
                            padding: 8px 0;
                            font-size: 16px;
                        }
                        .summary-label {
                            color: #555;
                            font-weight: 600;
                        }
                        .summary-value {
                            color: #333;
                            font-weight: 400;
                            direction: ltr;
                        }
                        .grand-total .summary-label {
                            font-size: 18px;
                            color: #333;
                        }
                        .grand-total .summary-value {
                            font-size: 22px;
                            font-weight: 700;
                            color: #333;
                        }
                        .thank-you-note {
                            text-align: right;
                            margin-top: 25px;
                            font-style: italic;
                            color: #777;
                        }
                        .footer { 
                            text-align: center; 
                            padding: 30px 40px; 
                            background: #f8f9fa; 
                            border-top: 1px solid #dee2e6; 
                            color: #777;
                        }
                        .closing-signature { 
                            font-weight: 600; 
                            color: #c53030; 
                            font-size: 16px; 
                        }
                    </style>
                </head>
                <body>
                    <div class="invoice-container">
                        <div class="header">
                            <div class="invoice-title">
                                <h2>فاتورة</h2>
                                <p>رقم: ${invoiceNumber}</p>
                            </div>
                            <div class="logo-section">
                                <div class="logo"><span class="logo-text">GM</span></div>
                                <div class="company-info">
                                    <h1>GM - SHARQIYA</h1>
                                    <p>شركة شرقية - صنع في مصر</p>
                                </div>
                            </div>
                        </div>
                        <div class="content">
                            <div class="invoice-details">
                                <div class="detail-card">
                                    <h3>بيانات العميل</h3>
                                    <div class="detail-item">
                                        <span class="detail-label">الاسم:</span>
                                        <span class="detail-value">${customerName || "غير محدد"}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">رقم الهاتف:</span>
                                        <span class="detail-value">${phoneNumber || "---"}</span>
                                    </div>
                                </div>
                                <div class="detail-card">
                                    <h3>تفاصيل الفاتورة</h3>
                                    <div class="detail-item">
                                        <span class="detail-label">تاريخ الإصدار:</span>
                                        <span class="detail-value">${new Date(invoiceDate).toLocaleDateString("ar-EG")}</span>
                                    </div>
                                </div>
                            </div>
                            <h3 class="section-title">قائمة الأصناف</h3>
                            <table class="items-table">
                                <thead>
                                    <tr>
                                        <th>الصنف</th>
                                        <th>السعر</th>
                                        <th>الكمية</th>
                                        <th>الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${items
                                        .map(
                                            (item) => `
                                        <tr>
                                            <td>${item.name}</td>
                                            <td style="direction: ltr;">${item.price.toFixed(2)} ج.م</td>
                                            <td>${item.quantity}</td>
                                            <td style="direction: ltr;">${(item.price * item.quantity).toFixed(2)} ج.م</td>
                                        </tr>
                                    `,
                                        )
                                        .join("")}
                                </tbody>
                            </table>
                            
                            <div class="summary-section">
                                <div class="summary-item grand-total">
                                    <span class="summary-label">الإجمالي النهائي المستحق</span>
                                    <span class="summary-value">${total.toFixed(2)} ج.م</span>
                                </div>
                            </div>
                        </div>
                        <div class="footer">
                            <div class="closing-signature">
                                GM-SHARQIYA
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html });
            navigation.navigate("SuccessSaved", { pdfUri: uri });
        } catch (err) {
            console.log("PDF أو API error", err);
            alert("حدث خطأ أثناء حفظ الفاتورة.");
        } finally {
            setIsLoading(false);
        }
    };

    const ModernLoader = () => (
        <Modal
            transparent={true}
            animationType="fade"
            visible={isLoading}
            statusBarTranslucent={true}
        >
            <View className="flex-1 items-center justify-center bg-black/50">
                <View className="items-center justify-center rounded-3xl bg-white p-8 shadow-2xl">
                    <View className="relative mb-6 h-16 w-16">
                        <View className="absolute inset-0 animate-spin rounded-full border-4 border-gray-200" />
                        <View className="absolute inset-0 animate-spin rounded-full border-4 border-[#1A202C] border-t-transparent" />
                        <View className="absolute inset-2 animate-pulse rounded-full bg-[#1A202C]/10" />
                    </View>
                    <Text className="text-lg font-bold text-[#1A202C]">
                        جاري الحفظ...
                    </Text>
                    <Text className="mt-1 text-sm text-gray-500">
                        يرجى الانتظار
                    </Text>
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

                    <View className="p-6">
                        <Text className="mb-4 text-right text-lg font-semibold text-gray-800">
                            عناصر الفاتورة:
                        </Text>
                        <View className="overflow-hidden rounded-md border border-gray-200">
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

            <ModernLoader />
        </View>
    );
}
