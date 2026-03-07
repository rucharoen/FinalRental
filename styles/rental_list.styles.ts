import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginLeft: 10,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#3498DB',
    },
    tabText: {
        fontSize: 14,
        color: '#BDC3C7',
    },
    activeTabText: {
        color: '#3498DB',
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    rentalItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F9F9F9',
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 10,
    },
    itemContent: {
        flexDirection: 'row',
    },
    productImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        backgroundColor: '#F8F9FA',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 13,
        color: '#7F8C8D',
        marginBottom: 4,
    },
    priceText: {
        fontSize: 13,
        color: '#E74C3C',
        fontWeight: '500',
    },
    renterName: {
        fontSize: 12,
        color: '#34495E',
        marginTop: 2,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    approveButton: {
        backgroundColor: '#1B9B75', // เขียวตามรูป
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 20,
        marginLeft: 8,
    },
    rejectButton: {
        backgroundColor: '#D94136', // แดงตามรูป
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 20,
        marginLeft: 8,
    },
    shipButton: {
        backgroundColor: '#16A085',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 15,
    },
    receiveButton: {
        backgroundColor: '#2980B9',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 15,
        marginLeft: 8,
    },
    damageButton: {
        backgroundColor: '#E74C3C',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 15,
    },
    pendingPaymentPill: {
        backgroundColor: '#3498DB', // ฟ้าตามรูป
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#BDC3C7',
        marginTop: 10,
    },
    // Damage Report Styles
    reportCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        margin: 16,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    reportProductInfo: {
        flex: 1,
        marginLeft: 15,
    },
    deductionText: {
        fontSize: 14,
        color: '#E74C3C',
        fontWeight: 'bold',
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginLeft: 16,
        marginTop: 10,
        marginBottom: 10,
    },
    inputContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        marginHorizontal: 16,
        padding: 5,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    descriptionInput: {
        height: 80,
        padding: 15,
        textAlignVertical: 'top',
        fontSize: 14,
    },
    evidenceContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        marginHorizontal: 16,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    evidenceBox: {
        width: (width - 80) / 3,
        height: 100,
        borderWidth: 1.5,
        borderColor: '#BDC3C7',
        borderStyle: 'dashed',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    evidenceLabel: {
        fontSize: 12,
        color: '#95A5A6',
        marginTop: 8,
    },
    submitButton: {
        backgroundColor: '#E74C3C',
        height: 55,
        borderRadius: 15,
        margin: 16,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
