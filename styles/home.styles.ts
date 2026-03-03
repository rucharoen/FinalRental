import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },
    header: {
        backgroundColor: '#3498DB',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginRight: 10,
        height: 45,
    },
    searchPlaceholder: {
        flex: 1,
        marginLeft: 8,
        color: '#2C3E50',
        fontSize: 16,
    },

    cartButton: {
        padding: 5,
    },
    categoryWrapper: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        borderRadius: 12,
        padding: 16,
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
        width: 80,
    },
    categoryIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F1F3F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    categoryText: {
        fontSize: 12,
        color: '#34495E',
        textAlign: 'center',
        fontWeight: '500',
    },
    productList: {
        paddingHorizontal: 16,
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productCard: {
        width: cardWidth,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
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
        padding: 10,
    },
    productName: {
        fontSize: 14,
        color: '#2C3E50',
        fontWeight: '500',
        marginBottom: 4,
        height: 40,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    productPrice: {
        fontSize: 16,
        color: '#E74C3C',
        fontWeight: 'bold',
    },
    priceUnit: {
        fontSize: 12,
        color: '#E74C3C',
        marginLeft: 2,
    },
});
