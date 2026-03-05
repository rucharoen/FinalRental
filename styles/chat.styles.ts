import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },
    header: {
        height: 100,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 45,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
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
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    shopName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    chatList: {
        flex: 1,
    },
    messageListContainer: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20,
    },
    dateHeader: {
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 8,
        marginVertical: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    dateText: {
        fontSize: 12,
        color: '#7F8C8D',
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    rightRow: {
        justifyContent: 'flex-end',
    },
    leftRow: {
        justifyContent: 'flex-start',
    },
    messageContainer: {
        maxWidth: '80%',
        padding: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        position: 'relative',
    },
    leftMessage: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    rightMessage: {
        backgroundColor: '#D6EAF8',
    },
    messageContent: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
    },
    messageText: {
        fontSize: 15,
        color: '#333',
        lineHeight: 20,
    },
    timeText: {
        fontSize: 10,
        color: '#7F8C8D',
        marginLeft: 8,
        marginBottom: -2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 30 : 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    iconButton: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#F2F3F5',
        borderRadius: 20,
        paddingHorizontal: 15,
        fontSize: 15,
        color: '#333',
        marginRight: 10,
    },
    sendButton: {
        width: 48,
        height: 38,
        backgroundColor: '#3498DB',
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    // Booking Summary Card Styles
    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        marginHorizontal: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    summaryImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#F7F8FA',
    },
    summaryInfo: {
        flex: 1,
        marginLeft: 12,
    },
    summaryName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2C3E50',
    },
    summaryPrice: {
        fontSize: 14,
        color: '#E74C3C',
        fontWeight: 'bold',
        marginTop: 4,
    },
    summaryButton: {
        backgroundColor: '#F7F8FA',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    summaryButtonText: {
        fontSize: 12,
        color: '#34495E',
        fontWeight: '500',
    },
});

export default styles;
