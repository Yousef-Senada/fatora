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
    phoneNumber?: string;
    date: string;
    amount: number;
    invoiceNumber: string;
    items: Item[];
};

const generateInvoiceHtml = (invoice: Invoice): string => {
    const { invoiceNumber, name, phoneNumber, date, items, amount } = invoice;

    const itemsHtml = items
        .map(
            (item) => `
            <tr>
                <td data-label="الصنف">${item.name}</td>
                <td data-label="السعر" style="direction: ltr;">${item.price.toFixed(2)} ج.م</td>
                <td data-label="الكمية">${item.quantity}</td>
                <td data-label="الإجمالي" style="direction: ltr;">${(
                    item.price * item.quantity
                ).toFixed(2)} ج.م</td>
            </tr>
        `,
        )
        .join("");

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
                    font-size: 16px;
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
                    width: 60px; height: 60px; background: white; border-radius: 50%; 
                    display: flex; align-items: center; justify-content: center; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2); flex-shrink: 0;
                }
                .logo-text { font-size: 22px; font-weight: bold; color: #e53e3e; }
                .company-info h1 { font-size: 26px; margin: 0; font-weight: 700; text-shadow: 1px 1px 3px   rgba(0,0,0,0.2); }
                .company-info p { opacity: 0.9; font-size: 14px; margin-top: 4px; }
                .invoice-title h2 { font-size: 28px; margin: 0; text-align: left; }
                .invoice-title p { font-size: 14px; opacity: 0.9; text-align: left; margin-top: 4px; }
                .content { padding: 30px 40px; }
                .invoice-details { 
                    display: grid; grid-template-columns: 1fr 1fr; 
                    gap: 30px; margin-bottom: 40px; 
                }
                .detail-card h3 { 
                    color: #c53030; margin-bottom: 15px; font-size: 18px; 
                    padding-bottom: 10px; border-bottom: 2px solid #e53e3e;
                }
                .detail-item { margin-bottom: 10px; display: flex; justify-content: space-between;   font-size: 15px; }
                .detail-label { color: #555; font-weight: 600; }
                .detail-value { color: #333; font-weight: 400; }
                .section-title { font-size: 20px; color: #333; margin-bottom: 20px; border-bottom: 2px solid   #eee; padding-bottom: 10px;}
                .items-table { width: 100%; border-collapse: collapse; }
                .items-table thead { background-color: #f8f9fa; }
                .items-table th { 
                    padding: 15px; text-align: right; font-weight: 700; 
                    color: #333; border-bottom: 2px solid #dee2e6;
                }
                .items-table td { padding: 15px; text-align: right; border-bottom: 1px solid #eef2f7; }
                .items-table tr:last-child td { border-bottom: none; }
                .items-table th:nth-child(2), .items-table td:nth-child(2),
                .items-table th:nth-child(3), .items-table td:nth-child(3),
                .items-table th:nth-child(4), .items-table td:nth-child(4) { text-align: center; }
                .total-section {
                    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
                    color: white; padding: 20px 30px; border-radius: 12px;
                    text-align: center; margin-top: 30px;
                }
                .total-label { font-size: 16px; opacity: 0.9; margin-bottom: 5px; }
                .total-amount { font-size: 32px; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.  25); }
                .footer { 
                    text-align: center; padding: 30px 40px; background: #f8f9fa; 
                    border-top: 1px solid #dee2e6; color: #777;
                }
                .closing-signature { font-weight: 600; color: #c53030; font-size: 16px; }
    
                @media (max-width: 768px) {
                    body { padding: 0; font-size: 14px; }
                    .invoice-container { margin: 0; border-radius: 0; box-shadow: none; }
                    .header { 
                        flex-direction: column; gap: 15px; padding: 20px;
                        align-items: flex-start;
                    }
                    .invoice-title { text-align: right; align-self: flex-end; }
                    .invoice-title h2, .invoice-title p { text-align: right; }
                    
                    .company-info h1 { font-size: 20px; }
                    .company-info p { font-size: 13px; }
                    .invoice-title h2 { font-size: 22px; }
                    .invoice-title p { font-size: 13px; }
                    .detail-card h3 { font-size: 17px; }
                    .detail-item { font-size: 14px; }
                    .section-title { font-size: 18px; }
                    .total-label { font-size: 15px; }
                    .total-amount { font-size: 26px; }
                    .closing-signature { font-size: 14px; }
    
                    .content { padding: 20px; }
                    .invoice-details { grid-template-columns: 1fr; gap: 20px; }
    
                    .items-table thead { display: none; }
                    .items-table tr {
                        display: block; margin-bottom: 15px; border: 1px solid #dee2e6;
                        border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    }
                    .items-table td {
                        display: flex; justify-content: space-between; text-align: right;
                        padding: 12px 15px; border-bottom: 1px solid #eef2f7;
                        font-size: 14px;
                    }
                    .items-table td::before {
                        content: attr(data-label); font-weight: 600; color: #555;
                    }
                    .items-table td[data-label="السعر"],
                    .items-table td[data-label="الإجمالي"] {
                        flex-direction: row-reverse;
                    }
                    .items-table td:nth-child(n) { text-align: right; }
                .items-table tr:last-child td:last-child { border-bottom: none; }
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <div class="header">
                    <div class="logo-section">
                        <div class="logo"><span class="logo-text">GM</span></div>
                        <div class="company-info">
                            <h1>GM - SHARQIYA</h1>
                            <p>شركة شرقية - صنع في مصر</p>
                        </div>
                    </div>
                    <div class="invoice-title">
                        <h2>فاتورة</h2>
                        <p>رقم: ${invoiceNumber}</p>
                    </div>
                </div>
                <div class="content">
                    <div class="invoice-details">
                        <div class="detail-card">
                            <h3>بيانات العميل</h3>
                            <div class="detail-item">
                                <span class="detail-label">الاسم:</span>
                                <span class="detail-value">${name || "غير محدد"}</span>
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
                                <span class="detail-value">${new Date(
                                    date,
                                ).toLocaleDateString("ar-EG")}</span>
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
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <div class="total-section">
                        <div class="total-label">إجمالي المبلغ المستحق</div>
                        <div class="total-amount" style="direction: ltr;">${amount.toFixed(
                            2,
                        )} جنيه</div>
                    </div>
                </div>
                <div class="footer">
                    <div class="closing-signature">
                        GM-SHARQIYA
                    </div>
                </div>
            </div>
        </body>
        </html>`;
    return html;
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
