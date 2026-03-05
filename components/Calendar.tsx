import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface CalendarProps {
  onSelectRange: (startDate: string, endDate: string) => void;
  onClose: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ onSelectRange, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 4)); // March 2026
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);

  // Today is March 4, 2026
  const lockUntil = new Date(2026, 2, 8); // Today + 4 days (4, 5, 6, 7 locked)

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const weekDays = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // Fill empty days for previous month
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, disabled: true });
    }

    // Fill days of current month
    for (let i = 1; i <= daysCount; i++) {
      const dateObj = new Date(year, month, i);
      const isDisabled = dateObj < lockUntil;

      let isInRange = false;
      let isStart = startDate === i;
      let isEnd = endDate === i;

      if (startDate && endDate) {
        isInRange = i > startDate && i < endDate;
      }

      days.push({
        day: i,
        disabled: isDisabled,
        isStart,
        isEnd,
        isInRange
      });
    }

    return days;
  };

  const handleSelect = (day: number) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (day < startDate) {
        setStartDate(day);
        setEndDate(null);
      } else if (day === startDate) {
        setStartDate(null);
      } else {
        setEndDate(day);
        // Automatically confirm selection once both are selected
        const startStr = `${startDate} ${monthNames[currentDate.getMonth()]}`;
        const endStr = `${day} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear() + 543}`;
        onSelectRange(startStr, endStr);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.monthTitle}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</Text>
        <TouchableOpacity style={styles.nextButton}>
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Week Days */}
      <View style={styles.headerWeekDaysRow}>
        {weekDays.map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysGrid}>
        {renderDays().map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayItem,
              item.isInRange && styles.inRangeDay,
              item.isStart && styles.rangeStartDay,
              item.isEnd && styles.rangeEndDay,
            ]}
            disabled={item.disabled || item.day === null}
            onPress={() => item.day !== null && handleSelect(Number(item.day))}
          >
            <Text style={[
              styles.dayText,
              item.disabled && styles.disabledDayText,
              (item.isStart || item.isEnd) && styles.rangeDayText
            ]}>
              {item.day}
            </Text>
            {item.isStart && <Text style={styles.rangeLabel}>เริ่ม</Text>}
            {item.isEnd && <Text style={styles.rangeLabel}>จบ</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    backgroundColor: '#3498DB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
    paddingBottom: 10,
  },
  monthTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  nextButton: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  headerWeekDaysRow: {
    flexDirection: 'row',
    backgroundColor: '#3498DB',
    paddingBottom: 15,
    paddingHorizontal: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  dayItem: {
    width: (width - 70) / 7,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '400',
  },
  disabledDayText: {
    color: '#BDC3C7',
  },
  inRangeDay: {
    backgroundColor: '#E3F2FD',
  },
  rangeStartDay: {
    backgroundColor: '#3498DB',
    borderRadius: 8,
  },
  rangeEndDay: {
    backgroundColor: '#3498DB',
    borderRadius: 8,
  },
  rangeDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  rangeLabel: {
    fontSize: 9,
    color: '#FFFFFF',
    position: 'absolute',
    bottom: 4,
    fontWeight: '500',
  },
});

export default Calendar;
