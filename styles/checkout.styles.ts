import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        marginLeft: 10,
    },
    content: {
        flex: 1,
        padding: 15,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    addressName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#34495E',
    },
    addressDetail: {
        fontSize: 14,
        color: '#7F8C8D',
        marginLeft: 30,
        lineHeight: 20,
    },
    shopHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    shopName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#000',
    },
    productInfoRow: {
        flexDirection: 'row',
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    productDetails: {
        flex: 1,
        marginLeft: 15,
    },
    productTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    rentDate: {
        fontSize: 12,
        color: '#7F8C8D',
        marginBottom: 8,
    },
    priceDayRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    pricePerDay: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E74C3C',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
    },
    infoCol: {
        flex: 1,
    },
    infoLabelBold: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    infoLabelNormal: {
        fontWeight: 'normal',
        color: '#7F8C8D',
    },
    infoSubText: {
        fontSize: 12,
        color: '#7F8C8D',
        marginTop: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    infoRowSmall: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoValueSmall: {
        fontSize: 14,
        color: '#333',
    },
    paymentSection: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 100,
    },
    paymentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
    },
    paymentOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    paymentOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentIconBox: {
        width: 40,
        height: 30,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    paymentOptionText: {
        fontSize: 15,
        color: '#000',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#ECF0F1',
        paddingBottom: 35,
    },
    totalContainer: {
        flex: 1,
    },
    totalLabel: {
        fontSize: 14,
        color: '#000',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#E74C3C',
        marginTop: 2,
    },
    reserveButton: {
        backgroundColor: '#3498DB',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 8,
    },
    reserveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
