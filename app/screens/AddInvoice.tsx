import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
    FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HeadPage from "../components/HeadPage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../index";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

type AddInvoiceScreenProp = StackNavigationProp<
    RootStackParamList,
    "AddInvoice"
>;

type Item = {
    id: number;
    name: string;
    price: number;
    quantity: number;
};

const suggestedItems = [
    "شاي",
    "قهوة",
    "سكر",
    "أرز",
    "زيت",
    "دقيق",
    "معكرونة",
    "صابون",
    "شامبو",
    "مناديل",
    "منظف",
    "ملح",
    "فلفل أسود",
    "كمون",
    "عدس",
    "فول",
    "حمص",
    "طحينة",
    "زيتون",
    "جبنة",
    "لبن",
    "بيض",
    "خبز",
    "لحمة",
    "فراخ",
    "سمك",
    "طماطم",
    "بصل",
    "جزر",
    "بطاطس",
    "خيار",
    "فلفل",
    "باذنجان",
    "كوسة",
    "ملوخية",
    "تفاح",
    "موز",
    "برتقال",
    "عنب",
    "مانجو",
    "بطيخ",
    "شمام",
    "بسكويت",
    "شوكولاتة",
    "حلويات",
];

const toastConfig = {
    error: (props: any) => (
        <ErrorToast
            {...props}
            style={{
                borderLeftColor: "#E53E3E",
                height: 70,
                zIndex: 9999,
                borderRadius: 8,
                marginHorizontal: 20,
            }}
            contentContainerStyle={{
                paddingHorizontal: 10,
                paddingVertical: 6,
            }}
            text1Style={{
                fontSize: 14,
                fontWeight: "bold",
                textAlign: "right",
            }}
            text2Style={{
                fontSize: 12,
                textAlign: "right",
            }}
        />
    ),
    success: (props: any) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: "#38A169",
                height: 70,
                zIndex: 9999,
                borderRadius: 8,
                marginHorizontal: 20,
            }}
            contentContainerStyle={{
                paddingHorizontal: 10,
                paddingVertical: 6,
            }}
            text1Style={{
                fontSize: 14,
                fontWeight: "bold",
                textAlign: "right",
            }}
            text2Style={{
                fontSize: 12,
                textAlign: "right",
            }}
        />
    ),
};

export default function AddInvoice() {
    const [items, setItems] = useState<Item[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");
    const [newItemQty, setNewItemQty] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(
        [],
    );
    const navigation = useNavigation<AddInvoiceScreenProp>();

    const [invoiceDate] = useState(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    });

    const generateUniqueCode = () => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).slice(2, 4);
        return (timestamp + random).toUpperCase().slice(-6);
    };

    const [invoiceNumber] = useState(generateUniqueCode());

    // حساب المسافة بين النصوص (Levenshtein distance)
    const getEditDistance = (str1: string, str2: string): number => {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1,
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    };

    // فلترة الاقتراحات حسب النص المكتوب مع البحث الذكي
    const handleItemNameChange = (text: string) => {
        setNewItemName(text);

        if (text.length > 0) {
            let filtered = [];

            // البحث المباشر أولاً
            const exactMatches = suggestedItems.filter(
                (item) => item.includes(text) || item.startsWith(text),
            );

            // إذا لم نجد نتائج مباشرة، نبحث عن أقرب النتائج
            if (exactMatches.length === 0) {
                const similarities = suggestedItems.map((item) => ({
                    item,
                    distance: getEditDistance(
                        text.toLowerCase(),
                        item.toLowerCase(),
                    ),
                }));

                // ترتيب حسب المسافة (أقل مسافة = أكثر تشابه)
                similarities.sort((a, b) => a.distance - b.distance);

                // أخذ أفضل 5 نتائج قريبة
                filtered = similarities.slice(0, 5).map((s) => s.item);
            } else {
                filtered = exactMatches;
            }

            setFilteredSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
            setFilteredSuggestions([]);
        }
    };

    // اختيار صنف من القائمة المقترحة (بدون إغلاق الكيبورد)
    const selectSuggestion = (suggestion: string) => {
        setNewItemName(suggestion);
        setShowSuggestions(false);
        setFilteredSuggestions([]);
    };

    const handleAddItem = () => {
        const price = parseFloat(newItemPrice);
        const quantity = parseInt(newItemQty);

        if (!newItemName || isNaN(price) || isNaN(quantity)) {
            Toast.show({
                type: "error",
                text1: "بيانات غير مكتملة",
                text2: "الرجاء ملء جميع بيانات الصنف بشكل صحيح",
            });
            return;
        }

        const newItem = {
            id: Date.now(),
            name: newItemName,
            price,
            quantity,
        };

        setItems([...items, newItem]);
        setModalVisible(false);
        setNewItemName("");
        setNewItemPrice("");
        setNewItemQty("");
        setShowSuggestions(false);
        setFilteredSuggestions([]);
    };

    const handleDeleteItem = (itemId: number) => {
        setItems(items.filter((item) => item.id !== itemId));
        Toast.show({
            type: "success",
            text1: "تم الحذف",
            text2: "تم حذف الصنف بنجاح",
        });
    };

    const total = items.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0,
    );

    const handleModalClose = () => {
        setModalVisible(false);
        setNewItemName("");
        setNewItemPrice("");
        setNewItemQty("");
        setShowSuggestions(false);
        setFilteredSuggestions([]);
    };

    return (
        <View style={{ flex: 1 }}>
            <HeadPage title="فاتورة جديدة" />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.label}>اسم العميل</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ادخل اسم العميل"
                        placeholderTextColor="#A0AEC0"
                        value={customerName}
                        onChangeText={setCustomerName}
                    />

                    <Text style={[styles.label, { marginTop: 20 }]}>
                        رقم الهاتف
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ادخل رقم الهاتف"
                        placeholderTextColor="#A0AEC0"
                        keyboardType="numeric"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                    />

                    <Text style={[styles.label, { marginTop: 20 }]}>
                        تاريخ الفاتورة
                    </Text>
                    <TouchableOpacity style={styles.dateInput}>
                        <Ionicons
                            name="calendar-outline"
                            size={20}
                            color="#4A5568"
                        />
                        <Text style={styles.dateText}>{invoiceDate}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>العناصر</Text>

                    {items.map((item) => (
                        <View style={styles.itemBox} key={item.id}>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeleteItem(item.id)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={16}
                                    color="#E53E3E"
                                />
                            </TouchableOpacity>

                            <View style={styles.itemContent}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.itemSub}>
                                        {item.quantity} ×{" "}
                                        {item.price.toFixed(2)} جنيه
                                    </Text>
                                </View>
                                <Text style={styles.itemPrice}>
                                    {(item.quantity * item.price).toFixed(2)}{" "}
                                    جنيه
                                </Text>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity
                        style={styles.addItemBox}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons name="add" size={20} color="#4A5568" />
                        <Text style={styles.addItemText}>إضافة صنف جديد</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 160 }} />
            </ScrollView>

            <View style={styles.fixedFooter}>
                <View style={styles.footer}>
                    <Text style={styles.totalLabel}>المجموع:</Text>
                    <Text style={styles.totalText}>
                        {total.toFixed(2)} جنيه
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        if (!customerName.trim()) {
                            Toast.show({
                                type: "error",
                                text1: "اسم العميل مطلوب",
                                text2: "من فضلك أدخل اسم العميل",
                            });
                            return;
                        }

                        if (items.length === 0) {
                            Toast.show({
                                type: "error",
                                text1: "لا توجد عناصر",
                                text2: "الرجاء إضافة صنف واحد على الأقل",
                            });
                            return;
                        }

                        navigation.navigate("InvoicePreview", {
                            customerName,
                            phoneNumber,
                            items,
                            total,
                            invoiceDate,
                            invoiceNumber,
                        });
                    }}
                >
                    <Text style={styles.buttonText}>التالي</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleModalClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalModernContainer}>
                        <Text style={styles.modalTitle}>إضافة صنف جديد</Text>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputGroup}>
                                <Ionicons
                                    name="pricetag-outline"
                                    size={20}
                                    color="#A0AEC0"
                                    style={styles.icon}
                                />
                                <TextInput
                                    style={styles.inputModern}
                                    placeholder="اسم الصنف"
                                    placeholderTextColor="#A0AEC0"
                                    value={newItemName}
                                    onChangeText={handleItemNameChange}
                                    textAlign="right"
                                    autoFocus={false}
                                    blurOnSubmit={false}
                                />
                            </View>

                            {/* قائمة الاقتراحات */}
                            {showSuggestions && (
                                <View style={styles.suggestionsContainer}>
                                    <FlatList
                                        data={filteredSuggestions}
                                        keyExtractor={(item, index) =>
                                            index.toString()
                                        }
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.suggestionItem}
                                                onPress={() =>
                                                    selectSuggestion(item)
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.suggestionText
                                                    }
                                                >
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        style={styles.suggestionsList}
                                        showsVerticalScrollIndicator={false}
                                        nestedScrollEnabled={true}
                                        keyboardShouldPersistTaps="handled"
                                    />
                                </View>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Ionicons
                                name="cash-outline"
                                size={20}
                                color="#A0AEC0"
                                style={styles.icon}
                            />
                            <TextInput
                                style={styles.inputModern}
                                placeholder="السعر"
                                placeholderTextColor="#A0AEC0"
                                keyboardType="numeric"
                                value={newItemPrice}
                                onChangeText={setNewItemPrice}
                                textAlign="right"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Ionicons
                                name="cube-outline"
                                size={20}
                                color="#A0AEC0"
                                style={styles.icon}
                            />
                            <TextInput
                                style={styles.inputModern}
                                placeholder="الكمية"
                                placeholderTextColor="#A0AEC0"
                                keyboardType="numeric"
                                value={newItemQty}
                                onChangeText={setNewItemQty}
                                textAlign="right"
                            />
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.buttonModern, styles.addButton]}
                                onPress={handleAddItem}
                            >
                                <Text style={styles.buttonTextModern}>
                                    إضافة
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.buttonModern,
                                    styles.cancelButton,
                                ]}
                                onPress={handleModalClose}
                            >
                                <Text
                                    style={[
                                        styles.buttonTextModern,
                                        { color: "#2D3748" },
                                    ]}
                                >
                                    إلغاء
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Toast config={toastConfig} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F9FBFC",
        paddingHorizontal: 10,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    label: {
        color: "#4A5568",
        fontWeight: "600",
        marginBottom: 6,
        textAlign: "right",
    },
    input: {
        borderWidth: 1,
        borderColor: "#CBD5E0",
        borderRadius: 10,
        padding: 12,
        color: "#2D3748",
        marginBottom: 10,
    },
    dateInput: {
        flexDirection: "row-reverse",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#CBD5E0",
        borderRadius: 10,
        padding: 12,
    },
    dateText: {
        marginRight: 10,
        color: "#2D3748",
    },
    itemBox: {
        backgroundColor: "#F7FAFC",
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
        flexDirection: "row-reverse",
        alignItems: "center",
    },
    itemContent: {
        flex: 1,
        flexDirection: "row-reverse",
        justifyContent: "space-between",
        alignItems: "center",
    },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#FED7D7",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 12,
        borderWidth: 1,
        borderColor: "#FEB2B2",
    },
    itemPrice: {
        fontWeight: "bold",
        color: "#1A202C",
    },
    itemName: {
        textAlign: "right",
        fontWeight: "600",
        color: "#1A202C",
    },
    itemSub: {
        textAlign: "right",
        fontSize: 12,
        color: "#718096",
    },
    addItemBox: {
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        marginTop: 15,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#CBD5E0",
    },
    addItemText: {
        marginRight: 10,
        color: "#4A5568",
        fontWeight: "600",
        fontSize: 16,
    },
    fixedFooter: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 20,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    footer: {
        flexDirection: "row-reverse",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    totalLabel: {
        fontWeight: "bold",
        fontSize: 18,
        color: "#2D3748",
    },
    totalText: {
        fontWeight: "bold",
        fontSize: 18,
        color: "#1A202C",
    },
    button: {
        backgroundColor: "#1A202C",
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    modalModernContainer: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 15,
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1A202C",
        textAlign: "center",
        marginBottom: 24,
    },
    inputContainer: {
        position: "relative",
        zIndex: 1,
    },
    inputGroup: {
        flexDirection: "row-reverse",
        alignItems: "center",
        backgroundColor: "#F7FAFC",
        borderRadius: 14,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    icon: {
        marginLeft: 12,
    },
    inputModern: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: "#2D3748",
        paddingVertical: 10,
    },
    suggestionsContainer: {
        position: "absolute",
        top: 65,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        shadowColor: "#1A202C",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 10,
        zIndex: 1000,
        maxHeight: 180,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#F0F2F5",
    },

    suggestionsList: {
        maxHeight: 180,
        paddingVertical: 8,
    },

    suggestionItem: {
        paddingHorizontal: 20,
        paddingVertical: 14,
    },

    suggestionItemActive: {
        backgroundColor: "#F7FAFC",
    },

    suggestionText: {
        fontSize: 16,
        color: "#2D3748",
        textAlign: "right",
        fontWeight: "500",
    },

    buttonRow: {
        flexDirection: "row-reverse",
        justifyContent: "space-between",
        marginTop: 10,
    },
    buttonModern: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: "#E2E8F0",
    },
    addButton: {
        backgroundColor: "#1A202C",
    },
    buttonTextModern: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
});
