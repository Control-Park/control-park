import { Image, StyleSheet, View } from "react-native"
import Icon from "../../assets/icon.png"

export default function SplashScreen(){
    return (
        <View style={styles.container}>
            <View>
                <Image source={Icon} style={styles.image} />                
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
    },
    image: {
        width: 250, 
        height: 250, 
        resizeMode: "cover",
    }
});