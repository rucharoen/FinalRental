import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    StatusBar,
    Image,
    LayoutAnimation,
    Platform,
    UIManager,
    BackHandler
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import walletService, { WalletTransaction } from '@/services/wallet.service';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TransactionHistoryScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            fetchHistory();

            const onBackPress = () => {
                router.push('/(tabs)/wallet');
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [])
    );

    const fetchHistory = async () => {
        try {
            const response = await walletService.getWalletHistory();
            if (response && response.transactions) {
                setTransactions(response.transactions);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    const formatThaiDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatThaiTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        }) + ' น.';
    };

    const renderItem = ({ item }: { item: any }) => {
        const isPayout = item.type === 'payout' || item.type === 'deposit';
        const isExpanded = expandedId === item.id;
        const amountColor = isPayout ? '#27AE60' : '#E74C3C';
        const sign = isPayout ? '+' : '-';
        const iconColor = isPayout ? '#27AE60' : '#E74C3C';

        return (
            <View style={styles.cardContainer}>
                <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => toggleExpand(item.id)}
                    style={styles.transactionHeader}
                >
                    <View style={styles.leftRow}>
                        <View style={[styles.statusCircle, { borderColor: iconColor }]}>
                            <View style={[styles.statusDot, { backgroundColor: iconColor }]} />
                        </View>
                        <View style={styles.infoCol}>
                            <Text style={[styles.amountText, { color: amountColor }]}>
                                {sign}{parseFloat(item.amount).toLocaleString()} บาท
                            </Text>
                            <Text style={styles.typeLabel}>
                                {isPayout ? 'รายการเงินเข้า' : 'รายการเงินออก'}
                            </Text>
                        </View>
                    </View>
                    <Ionicons 
                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                        size={24} 
                        color="#BDC3C7" 
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                                {isPayout ? 'ได้รับจากค่าเช่าสินค้า' : 'ยอดเงินออก'}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                                {formatThaiDate(item.timestamp)}, {formatThaiTime(item.timestamp)}
                            </Text>
                        </View>
                        {item.counterparty_name && isPayout && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                    รับจาก {item.counterparty_name}
                                </Text>
                            </View>
                        )}
                        {item.description && !isPayout && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                    {item.description}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/wallet')} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#2C3E50" />
                </TouchableOpacity>
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('@/assets/images/logo.png')} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.pageTitle}>ประวัติการทำรายการ</Text>

                {/* Filters */}
                <View style={styles.filterRow}>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>ปี</Text>
                        <Ionicons name="chevron-down" size={18} color="#BDC3C7" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>วันที่</Text>
                        <Ionicons name="chevron-down" size={18} color="#BDC3C7" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#27AE60" />
                    </View>
                ) : (
                    <FlatList
                        data={transactions}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="receipt-outline" size={60} color="#E0E0E0" />
                                <Text style={styles.emptyText}>ไม่พบประวัติการทำรายการ</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 5,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 80,
        height: 80,
    },
    contentContainer: {
        flex: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: '#FFFFFF',
        marginTop: -10,
        paddingTop: 20,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50',
        textAlign: 'center',
        marginBottom: 20,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginBottom: 25,
        gap: 15,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 130,
        height: 48,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 15,
        backgroundColor: '#FFFFFF',
    },
    filterText: {
        fontSize: 16,
        color: '#7F8C8D',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        // Elevation for Android
        elevation: 2,
    },
    transactionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    statusDot: {
        width: 10,
        height: 2,
        borderRadius: 1,
    },
    infoCol: {
        justifyContent: 'center',
    },
    amountText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    typeLabel: {
        fontSize: 13,
        color: '#95A5A6',
    },
    expandedContent: {
        marginTop: 12,
        paddingTop: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 12,
    },
    detailRow: {
        marginBottom: 6,
    },
    detailLabel: {
        fontSize: 14,
        color: '#7F8C8D',
        lineHeight: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#BDC3C7',
        marginTop: 15,
    }
});

export default TransactionHistoryScreen;
