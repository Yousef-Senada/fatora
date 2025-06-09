import * as React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

interface HeadPageProps {
    title: string;
}

const HeadPage: React.FC<HeadPageProps> = ({ title }) => {
    const navigation = useNavigation();

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleBack}>
                <Image
                    source={require("../../assets/images/arrow.png")}
                    style={styles.image}
                />
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 70,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        backgroundColor: "white",
    },
    image: {
        height: 40,
        width: 40,
        marginRight: 90,
        marginLeft: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "800",
        color: "#262626",
    },
});

export default HeadPage;
