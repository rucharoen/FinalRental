import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F7F8FA',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        overflow: 'hidden',
        marginBottom: 15,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 14,
        color: '#7F8C8D',
        marginBottom: 15,
    },
    addressPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 20,
        maxWidth: '85%',
    },
    addressText: {
        fontSize: 12,
        color: '#7F8C8D',
        marginLeft: 8,
        marginRight: 8,
        flexShrink: 1,
    },
    statusButton: {
        paddingHorizontal: 40,
        paddingVertical: 10,
        borderRadius: 20,
    },
    statusButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    // Status types
    statusNone: {
        backgroundColor: '#FFCDD2',
    },
    statusNoneText: {
        color: '#E53935',
    },
    statusPending: {
        backgroundColor: '#FFF9C4',
    },
    statusPendingText: {
        color: '#FBC02D',
    },
    statusVerified: {
        backgroundColor: '#E8F5E9',
    },
    statusVerifiedText: {
        color: '#43A047',
    },
    section: {
        marginTop: 10,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 15,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 25,
        marginBottom: 15,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        // Elevation for Android
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    menuIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },


    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    menuSubTitle: {
        fontSize: 12,
        color: '#95A5A6',
        marginTop: 2,
    },
    logoutButton: {
        marginTop: 20,
        marginHorizontal: 20,
        height: 55,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#E74C3C',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    logoutText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E74C3C',
    }
});

export default styles;
