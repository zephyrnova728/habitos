import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { 
  format, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { pt } from 'date-fns/locale';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface CalendarStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const { width } = Dimensions.get('window');
const DAY_WIDTH = 60;

const CalendarStrip: React.FC<CalendarStripProps> = ({ selectedDate, onDateSelect }) => {
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(selectedDate);
  
  // Generate days for the current month
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Scroll to selected date
  useEffect(() => {
    const selectedIndex = days.findIndex(day => isSameDay(day, selectedDate));
    if (selectedIndex !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: selectedIndex * DAY_WIDTH - width / 2 + DAY_WIDTH / 2,
        animated: true
      });
    }
  }, [selectedDate, days]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.monthContainer}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.monthText, { color: theme.colors.text }]}>
          {format(currentMonth, 'MMMM yyyy', { locale: pt })}
        </Text>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
          <ChevronRight size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map(day => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={styles.dayContainer}
              onPress={() => onDateSelect(day)}
            >
              <Text style={[
                styles.weekday,
                { color: theme.colors.text }
              ]}>
                {format(day, 'EEE', { locale: pt })}
              </Text>
              
              <View style={[
                styles.dateContainer,
                isSelected && { backgroundColor: theme.colors.primary },
                isToday && !isSelected && { borderColor: theme.colors.primary, borderWidth: 1 }
              ]}>
                <Text style={[
                  styles.dateText,
                  { color: isSelected ? '#FFF' : theme.colors.text }
                ]}>
                  {format(day, 'd')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  monthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  monthButton: {
    padding: 5,
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  dayContainer: {
    width: DAY_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  weekday: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  dateContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CalendarStrip;