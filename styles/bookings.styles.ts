import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2C3E50',
        marginLeft: 20,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F3F4',
    },
    tabItem: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#3498DB',
    },
    tabText: {
        fontSize: 16,
        color: '#7F8C8D',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#2C3E50',
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    bookingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    shopHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    shopName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginLeft: 8,
    },
    productSection: {
        flexDirection: 'row',
    },
    productImage: {
        width: 100,
        height: 120,
        borderRadius: 8,
        backgroundColor: '#F0F3F4',
    },
    productDetails: {
        flex: 1,
        marginLeft: 15,
    },
    productTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        lineHeight: 22,
        marginBottom: 8,
    },
    infoRow: {
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    priceText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#E74C3C',
        marginVertical: 4,
    },
    warningText: {
        fontSize: 12,
        color: '#E67E22',
        marginTop: 4,
    },
    actionSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 15,
    },
    statusText: {
        fontSize: 14,
        color: '#F1C40F',
        marginRight: 10,
        fontWeight: '500',
    },
    actionButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#3498DB',
    },
    pendingButton: {
        backgroundColor: '#AED6F1',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
