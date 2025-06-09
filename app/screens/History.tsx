import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import HeadPage from "../components/HeadPage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { WebView } from "react-native-webview";

type Item = {
    name: string;
    price: number;
    quantity: number;
};

type Invoice = {
    id: string;
    name: string;
    date: string;
    amount: number;
    invoiceNumber: string;
    items: Item[];
};

const generateInvoiceHtml = (invoice: Invoice) => {
    const itemsRows = invoice.items
        .map(
            (item) => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.price.toFixed(2)} جنيه</td>
                    <td>${item.quantity}</td>
                </tr>
            `,
        )
        .join("");

    return `
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
                <p><strong>العميل:</strong> ${invoice.name}</p>
                <p><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>تاريخ الإصدار:</strong> ${invoice.date}</p>
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
                        ${itemsRows}
                    </tbody>
                </table>
                <p class="total">الإجمالي: ${invoice.amount.toFixed(2)} جنيه</p>
                <p style="text-align: center; margin-top: 40px;">شكراً لتعاملكم معنا</p>
            </body>
        </html>
    `;
};

const shareInvoicePdf = async (invoice: Invoice) => {
    const html = generateInvoiceHtml(invoice);
    try {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
        } else {
            Alert.alert("خطأ", "المشاركة غير مدعومة على هذا الجهاز.");
        }
    } catch (err) {
        console.error("PDF Error:", err);
        Alert.alert("خطأ", "فشل إنشاء ملف PDF.");
    }
};

export default function PreviousInvoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState<"all" | "week" | "month">(
        "all",
    );
    const [sortOption, setSortOption] = useState<
        "dateDesc" | "dateAsc" | "name" | "mostInvoices"
    >("dateDesc");

    const [modalVisible, setModalVisible] = useState(false);
    const [pdfHtml, setPdfHtml] = useState<string | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
        null,
    );
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(
                "https://fatora-backend.vercel.app/api/invoices",
            );
            const data = await res.json();
            const mappedInvoices = data.map((inv: any) => ({
                id: inv._id,
                name: inv.customerName,
                date: inv.invoiceDate,
                amount: inv.total,
                invoiceNumber: inv.invoiceNumber,
                items: inv.items || [],
            }));
            setInvoices(mappedInvoices);
        } catch (error) {
            Alert.alert("خطأ", "فشل تحميل الفواتير من السيرفر.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchInvoices();
        }, [fetchInvoices]),
    );

    useEffect(() => {
        const lowerSearch = searchQuery.toLowerCase();
        const now = new Date();

        let filtered = invoices.filter((invoice) => {
            const matchSearch =
                invoice.name.toLowerCase().includes(lowerSearch) ||
                invoice.invoiceNumber.toLowerCase().includes(lowerSearch);

            const invoiceDate = new Date(invoice.date);
            const diffDays =
                (now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24);

            const matchDate =
                dateFilter === "all"
                    ? true
                    : dateFilter === "week"
                      ? diffDays <= 7
                      : diffDays <= 30;

            return matchSearch && matchDate;
        });

        if (sortOption === "dateDesc") {
            filtered.sort(
                (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
        } else if (sortOption === "dateAsc") {
            filtered.sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime(),
            );
        } else if (sortOption === "name") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === "mostInvoices") {
            const counts: Record<string, number> = {};
            invoices.forEach((inv) => {
                counts[inv.name] = (counts[inv.name] || 0) + 1;
            });
            filtered.sort(
                (a, b) => (counts[b.name] || 0) - (counts[a.name] || 0),
            );
        }

        setFilteredInvoices(filtered);
    }, [searchQuery, dateFilter, sortOption, invoices]);

    const openInvoiceHtml = (invoice: Invoice) => {
        const html = generateInvoiceHtml(invoice);
        setSelectedInvoice(invoice);
        setPdfHtml(html);
        setModalVisible(true);
    };

    const deleteInvoice = async (invoiceId: string, invoiceName: string) => {
        Alert.alert(
            "تأكيد الحذف",
            `هل أنت متأكد من حذف فاتورة "${invoiceName}"؟\nلا يمكن التراجع عن هذا الإجراء.`,
            [
                {
                    text: "إلغاء",
                    style: "cancel",
                },
                {
                    text: "حذف",
                    style: "destructive",
                    onPress: async () => {
                        setDeletingId(invoiceId);
                        try {
                            const response = await fetch(
                                `https://fatora-backend.vercel.app/api/invoices/${invoiceId}`,
                                {
                                    method: "DELETE",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                },
                            );

                            if (response.ok) {
                                setInvoices((prev) =>
                                    prev.filter((inv) => inv.id !== invoiceId),
                                );
                                Alert.alert("نجح", "تم حذف الفاتورة بنجاح.");
                            } else {
                                const errorData = await response.json();
                                Alert.alert(
                                    "خطأ",
                                    errorData.message || "فشل في حذف الفاتورة.",
                                );
                            }
                        } catch (error) {
                            console.error("Delete error:", error);
                            Alert.alert("خطأ", "فشل في الاتصال بالسيرفر.");
                        } finally {
                            setDeletingId(null);
                        }
                    },
                },
            ],
        );
    };

    const handleRefresh = useCallback(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    return (
        <View className="w-full flex-1 bg-gray-100">
            <HeadPage title="سجل الفواتير" />

            <View className="z-10 mb-3 rounded-lg bg-white p-3">
                <TextInput
                    placeholder="ابحث باسم العميل أو رقم الفاتورة"
                    className="h-12 rounded-lg border border-gray-300 bg-gray-100 px-4 text-right"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <View className="mt-4 flex-row gap-3">
                    <TouchableOpacity
                        onPress={() =>
                            setDateFilter((prev) =>
                                prev === "all"
                                    ? "week"
                                    : prev === "week"
                                      ? "month"
                                      : "all",
                            )
                        }
                        className="flex-row items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2"
                    >
                        <MaterialIcons
                            name="calendar-month"
                            size={20}
                            color="#141414"
                        />
                        <Text className="text-sm font-medium text-[#141414]">
                            {dateFilter === "all"
                                ? "كل الفواتير"
                                : dateFilter === "week"
                                  ? "آخر أسبوع"
                                  : "آخر شهر"}
                        </Text>
                        <MaterialIcons
                            name="arrow-drop-down"
                            size={20}
                            color="#141414"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() =>
                            setSortOption((prev) =>
                                prev === "dateDesc"
                                    ? "dateAsc"
                                    : prev === "dateAsc"
                                      ? "name"
                                      : prev === "name"
                                        ? "mostInvoices"
                                        : "dateDesc",
                            )
                        }
                        className="flex-row items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2"
                    >
                        <MaterialIcons name="sort" size={20} color="#141414" />
                        <Text className="text-sm font-medium text-[#141414]">
                            {sortOption === "dateDesc"
                                ? "الأحدث أولاً"
                                : sortOption === "dateAsc"
                                  ? "الأقدم أولاً"
                                  : sortOption === "name"
                                    ? "الاسم"
                                    : "الأكثر فواتير"}
                        </Text>
                        <MaterialIcons
                            name="arrow-drop-down"
                            size={20}
                            color="#141414"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#1A202C" />
                    <Text className="mt-2 text-gray-600">
                        جاري تحميل الفواتير...
                    </Text>
                </View>
            ) : filteredInvoices.length === 0 ? (
                <View className="mt-8 items-center justify-center px-6">
                    <View className="items-center rounded-2xl bg-white p-8 shadow-sm">
                        <View className="mb-4 rounded-full bg-gray-100 p-6">
                            <MaterialIcons
                                name="receipt-long"
                                size={64}
                                color="#9CA3AF"
                            />
                        </View>
                        <Text className="mb-2 text-xl font-bold text-gray-800">
                            لا توجد فواتير
                        </Text>
                        <Text className="mb-6 text-center leading-6 text-gray-500">
                            {searchQuery || dateFilter !== "all"
                                ? "لم يتم العثور على فواتير تطابق البحث أو الفلترة المحددة"
                                : "لم يتم إنشاء أي فواتير بعد. ابدأ بإنشاء فاتورتك الأولى!"}
                        </Text>
                        <TouchableOpacity
                            onPress={handleRefresh}
                            className="flex-row items-center rounded-lg bg-[#1A202C] px-6 py-3"
                        >
                            <MaterialIcons
                                name="refresh"
                                size={20}
                                color="white"
                            />
                            <Text className="ml-2 font-medium text-white">
                                تحديث الفواتير
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={filteredInvoices}
                    keyExtractor={(item) => item.id}
                    onRefresh={handleRefresh}
                    refreshing={loading}
                    renderItem={({ item }) => (
                        <View className="mx-3 mb-3 rounded-lg bg-white p-4">
                            {/* زر الحذف في الأعلى */}
                            <View className="absolute right-5 top-5 z-10">
                                <TouchableOpacity
                                    onPress={() =>
                                        deleteInvoice(item.id, item.name)
                                    }
                                    disabled={deletingId === item.id}
                                    className="rounded-full bg-red-400 p-2"
                                >
                                    {deletingId === item.id ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="white"
                                        />
                                    ) : (
                                        <MaterialIcons
                                            name="delete"
                                            size={20}
                                            color="white"
                                        />
                                    )}
                                </TouchableOpacity>
                            </View>

                            <Text className="pr-12 text-base font-semibold text-[#141414]">
                                {item.name}
                            </Text>
                            <Text className="text-sm text-gray-600">
                                التاريخ: {item.date}
                            </Text>
                            <Text className="text-sm text-gray-600">
                                رقم الفاتورة: {item.invoiceNumber}
                            </Text>
                            <Text className="mt-1 text-lg font-bold text-[#141414]">
                                الإجمالي: {item.amount} جنيه
                            </Text>
                            <View className="mt-2 flex-row justify-end gap-2">
                                <TouchableOpacity
                                    onPress={() => openInvoiceHtml(item)}
                                    className="flex-row items-center rounded-lg bg-[#1A202C] px-4 py-2"
                                >
                                    <MaterialIcons
                                        name="visibility"
                                        size={18}
                                        color="white"
                                    />
                                    <Text className="ml-2 text-sm text-white">
                                        عرض PDF
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => shareInvoicePdf(item)}
                                    className="flex-row items-center rounded-md border border-gray-300 bg-white px-3 py-2"
                                >
                                    <MaterialIcons
                                        name="share"
                                        size={16}
                                        color="#141414"
                                    />
                                    <Text className="ml-1 text-sm text-[#141414]">
                                        مشاركة
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            <Modal visible={modalVisible} animationType="slide">
                <View style={{ flex: 1 }}>
                    <View className="flex-row items-center justify-between bg-[#1A202C] px-4 py-3">
                        <Text className="text-lg font-semibold text-white">
                            معاينة الفاتورة
                        </Text>
                        <Pressable onPress={() => setModalVisible(false)}>
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="white"
                            />
                        </Pressable>
                    </View>
                    <WebView
                        originWhitelist={["*"]}
                        source={{ html: pdfHtml || "<p>لا يوجد محتوى</p>" }}
                        style={{ flex: 1 }}
                    />
                </View>
            </Modal>
        </View>
    );
}
