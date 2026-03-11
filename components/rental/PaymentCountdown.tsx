import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaymentCountdownProps {
  approvedAt: string | Date;
  onExpire?: () => void;
}

const PaymentCountdown: React.FC<PaymentCountdownProps> = ({ approvedAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const approvedDate = new Date(approvedAt);
      const expiryDate = new Date(approvedDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
      const now = new Date();
      
      const difference = expiryDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        if (onExpire) onExpire();
        return false;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
      return true;
    };

    const hasTimeLeft = calculateTimeLeft();
    if (!hasTimeLeft) return;

    const timer = setInterval(() => {
      const stillRunning = calculateTimeLeft();
      if (!stillRunning) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [approvedAt]);

  if (isExpired) {
    return (
      <View style={styles.expiredContainer}>
        <Ionicons name="time-outline" size={14} color="#E74C3C" />
        <Text style={styles.expiredText}>หมดเวลาชำระเงิน</Text>
      </View>
    );
  }

  if (!timeLeft) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="time-outline" size={14} color="#F39C12" />
      <Text style={styles.timerText}>
        ชำระภายใน {timeLeft.hours.toString().padStart(2, '0')}:
        {timeLeft.minutes.toString().padStart(2, '0')}:
        {timeLeft.seconds.toString().padStart(2, '0')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9E7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  timerText: {
    fontSize: 12,
    color: '#F39C12',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  expiredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEDEC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  expiredText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default PaymentCountdown;
