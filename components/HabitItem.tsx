import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { HabitWithStatus } from '@/types/habit';
import { Check, X, Clock } from 'lucide-react-native';
import { format, isAfter, parseISO } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface HabitItemProps {
  habit: HabitWithStatus;
  onToggleStatus: (completed: boolean) => void;
  onPress: () => void;
  disabled?: boolean;
}

const HabitItem: React.FC<HabitItemProps> = ({ 
  habit, 
  onToggleStatus, 
  onPress,
  disabled = false 
}) => {
  const { theme } = useTheme();
  const [hours, minutes] = habit.time.split(':').map(Number);
  
  const now = new Date();
  const habitTime = new Date();
  habitTime.setHours(hours, minutes, 0, 0);
  
  const isPastDue = isAfter(now, habitTime);
  
  const handleToggle = (completed: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onToggleStatus(completed);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.colors.card },
        disabled && styles.disabledContainer
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.content}>
        <View style={styles.timeContainer}>
          <Clock size={18} color={theme.colors.text} />
          <Text style={[styles.time, { color: theme.colors.text }]}>
            {habit.time}
          </Text>
        </View>
        
        <Text 
          style={[
            styles.title, 
            { color: theme.colors.text },
            habit.isCompleted && styles.completedTitle
          ]}
          numberOfLines={1}
        >
          {habit.name}
        </Text>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              { backgroundColor: habit.isCompleted ? theme.colors.success : 'transparent' },
              { borderColor: theme.colors.success }
            ]}
            onPress={() => handleToggle(true)}
            disabled={disabled || habit.isCompleted}
          >
            <Check 
              size={20} 
              color={habit.isCompleted ? '#FFF' : theme.colors.success} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.statusButton,
              { backgroundColor: !habit.isCompleted && isPastDue ? theme.colors.error : 'transparent' },
              { borderColor: theme.colors.error }
            ]}
            onPress={() => handleToggle(false)}
            disabled={disabled || (!habit.isCompleted && isPastDue)}
          >
            <X 
              size={20} 
              color={!habit.isCompleted && isPastDue ? '#FFF' : theme.colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledContainer: {
    opacity: 0.7,
  },
  content: {
    padding: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default HabitItem;