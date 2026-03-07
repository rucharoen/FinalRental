import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import walletService, { WalletTransaction } from '@/services/wallet.service';

const TransactionHistoryScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

    useEffect(() => {
        fetchHistory();
    }, []);

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

    const renderItem = ({ item }: { item: WalletTransaction }) => {
        const isWithdrawal = item.type === 'withdrawal';
        const amountColor = isWithdrawal ? '#E74C3C' : '#2ECC71';
        const sign = isWithdrawal ? '-' : '+';

        return (
            <View style={styles.transactionItem}>
                <View style={[styles.iconContainer, { backgroundColor: isWithdrawal ? '#FDEDEC' : '#EAFAF1' }]}>
                    <MaterialCommunityIcons
                        name={isWithdrawal ? "bank-transfer-out" : "bank-transfer-in"}
                        size={24}
                        color={amountColor}
                    />
                </View>
                <View style={styles.content}>
                    <Text style={styles.title}>{item.description || (isWithdrawal ? 'ถอนเงิน' : 'เติมเงิน')}</Text>
                    <Text style={styles.date}>{item.timestamp ? new Date(item.timestamp).toLocaleDateString('th-TH') : ''}</Text>
                </View>
                <Text style={[styles.amount, { color: amountColor }]}>
                    {sign}{item.amount.toLocaleString()} บาท
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#2C3E50" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ประวัติธุรกรรม</Text>
                <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#3498DB" />
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item._id || index.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="history" size={60} color="#BDC3C7" />
                            <Text style={styles.emptyText}>ไม่พบประวัติการทำธุรกรรม</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    },
    listContent: {
        padding: 16,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F6F7',
    },
    iconContainer: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#95A5A6',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#BDC3C7',
        marginTop: 10,
    }
});

export default TransactionHistoryScreen;
