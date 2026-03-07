import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA', // พื้นหลังเทาอ่อนตามรูปแบบ App ทั่วไป
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
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
    listContent: {
        padding: 16,
    },
    productItem: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 15,
        marginBottom: 16,
        // Shadow สำหรับ iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        // Shadow สำหรับ Android
        elevation: 4,
    },
    productImage: {
        width: 90,
        height: 90,
        borderRadius: 12,
        backgroundColor: '#F7F8FA',
    },
    productInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2C3E50',
        lineHeight: 22,
    },
    productPrice: {
        fontSize: 14,
        color: '#E74C3C', // สีแดงตามรูป
        fontWeight: '500',
        marginTop: 5,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    editButton: {
        backgroundColor: '#F5B041', // สีส้มอ่อนตามรูป
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: '#D94436', // สีแดงตามรูป
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: 'bold',
    },
    // Edit Form Styles
    imagePreviewContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    largePreviewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    formSection: {
        paddingHorizontal: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D5DBDB',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 14,
        fontSize: 15,
        color: '#2C3E50',
        backgroundColor: '#FFFFFF',
    },
    updateButton: {
        backgroundColor: '#F5B041',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    deleteFullButton: {
        backgroundColor: '#D94436',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    deleteFullButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: '85%',
        padding: 30,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 15,
    },
    modalMessage: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
        marginBottom: 30,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        backgroundColor: '#EBEDEF',
        paddingVertical: 12,
        borderRadius: 10,
        flex: 1,
        marginRight: 15,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#2C3E50',
        fontWeight: '600',
        fontSize: 15,
    },
    confirmDeleteButton: {
        backgroundColor: '#D94436',
        paddingVertical: 12,
        borderRadius: 10,
        flex: 1,
        alignItems: 'center',
    },
    confirmDeleteButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 15,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        color: '#BDC3C7',
        fontSize: 16,
        marginTop: 15,
    }
});
