import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 5,
    },
    imageContainer: {
        width: width,
        height: width,
        backgroundColor: '#F7F8FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    productImage: {
        width: '80%',
        height: '90%',
    },
    infoContainer: {
        padding: 20,
        borderBottomWidth: 8,
        borderBottomColor: '#F7F8FA',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 5,
    },
    price: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#E74C3C',
    },
    priceUnit: {
        fontSize: 18,
        color: '#E74C3C',
        marginLeft: 5,
        fontWeight: '500',
    },
    deposit: {
        fontSize: 14,
        color: '#7F8C8D',
        marginBottom: 10,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    shippingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 8,
        borderBottomColor: '#F7F8FA',
        justifyContent: 'space-between',
    },
    shippingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    shippingText: {
        fontSize: 14,
        color: '#2C3E50',
        marginLeft: 10,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ECF0F1',
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
    tabLabel: {
        fontSize: 16,
        color: '#7F8C8D',
    },
    activeTabLabel: {
        color: '#2C3E50',
        fontWeight: 'bold',
    },
    detailsContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#34495E',
        lineHeight: 22,
        marginBottom: 20,
    },
    metaInfo: {
        fontSize: 14,
        color: '#7F8C8D',
        marginBottom: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderTopWidth: 1,
        borderTopColor: '#ECF0F1',
        paddingBottom: 10,
    },
    footerIcons: {
        flexDirection: 'row',
        marginRight: 15,
    },
    iconButton: {
        alignItems: 'center',
        marginHorizontal: 10,
    },
    iconLabel: {
        fontSize: 10,
        color: '#7F8C8D',
        marginTop: 2,
    },
    rentButton: {
        flex: 1,
        backgroundColor: '#3498DB',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rentButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Timeline Styles
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timelineContent: {
        marginLeft: 15,
        paddingVertical: 10,
    },
    timelineDotOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#C5CAE9',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    timelineDotInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#5C6BC0',
    },
    timelineConnector: {
        alignItems: 'center',
        width: 20,
        marginVertical: -2,
    },
    timelineStepText: {
        fontSize: 14,
        color: '#2C3E50',
    },

});

export default styles;
