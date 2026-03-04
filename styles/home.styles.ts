import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 34) / 2;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },
    header: {
        backgroundColor: '#3498DB',
        paddingTop: 15,
        paddingBottom: 15,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginRight: 8,
        height: 40,
    },
    searchPlaceholder: {
        marginLeft: 8,
        color: '#95A5A6',
        fontSize: 16,
    },
    cartButton: {
        padding: 2,
    },
    categoryWrapper: {
        backgroundColor: '#FFFFFF',
        margin: 12,
        borderRadius: 8,
        padding: 6,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    categoryList: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    categoryItem: {
        alignItems: 'center',
        width: 100,
    },
    categoryIcon: {
        width: 65,
        height: 65,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        borderWidth: 1,
        borderColor: '#AAAAAA',
    },
    categoryText: {
        fontSize: 13,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },
    productList: {
        paddingHorizontal: 12,
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productCard: {
        width: (width - 34) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    productImage: {
        width: '100%',
        height: cardWidth,
        backgroundColor: '#F1F3F5',
    },
    productInfo: {
        padding: 8,
    },
    productName: {
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
        height: 36,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    productPrice: {
        fontSize: 15,
        color: '#E74C3C',
        fontWeight: '600',
    },
    priceUnit: {
        fontSize: 12,
        color: '#E74C3C',
        marginLeft: 2,
    },
});
