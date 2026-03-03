import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        height: 100,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    backButton: {
        padding: 5,
    },
    shopInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 12,
    },
    shopName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    chatList: {
        flex: 1,
        padding: 15,
    },
    dateHeader: {
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
        marginVertical: 20,
    },
    dateText: {
        fontSize: 12,
        color: '#95A5A6',
    },
    messageContainer: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
    },
    leftMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 0,
    },
    rightMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#EBF5FB',
        borderTopRightRadius: 0,
    },
    messageText: {
        fontSize: 15,
        color: '#2C3E50',
    },
    timeText: {
        fontSize: 10,
        color: '#95A5A6',
        marginTop: 5,
        textAlign: 'right',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 10,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    iconButton: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#F7F8FA',
        borderRadius: 20,
        paddingHorizontal: 15,
        fontSize: 15,
        color: '#2C3E50',
        marginRight: 10,
    },
    sendButton: {
        width: 50,
        height: 40,
        backgroundColor: '#3498DB',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default styles;
