import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useHabits } from '@/contexts/HabitContext';
import { HabitWithStatus } from '@/types/habit';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarStrip from '@/components/CalendarStrip';
import HabitList from '@/components/HabitList';
import HabitDetailsModal from '@/components/HabitDetailsModal';
import NewHabitModal from '@/components/NewHabitModal';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function HistoricoScreen() {
  const { theme } = useTheme();
  const { 
    getHabitsForDate, 
    updateHabit, 
    deleteHabit, 
    toggleHabitCompletion,
    getHabitCompletionRate,
    selectedDate,
    setSelectedDate
  } = useHabits();
  
  const [habitDetailsModalVisible, setHabitDetailsModalVisible] = useState(false);
  const [editHabitModalVisible, setEditHabitModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<HabitWithStatus | undefined>(undefined);
  
  const dateHabits = getHabitsForDate(selectedDate);

  const handleToggleStatus = (habitId: string, completed: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleHabitCompletion(habitId, selectedDate, completed);
  };

  const handleHabitPress = (habit: HabitWithStatus) => {
    setSelectedHabit(habit);
    setHabitDetailsModalVisible(true);
  };

  const handleEditHabit = () => {
    setHabitDetailsModalVisible(false);
    setTimeout(() => {
      setEditHabitModalVisible(true);
    }, 300);
  };

  const handleUpdateHabit = (habitData: any) => {
    if (selectedHabit) {
      updateHabit({
        ...selectedHabit,
        ...habitData,
      });
    }
  };

  const handleDeleteHabit = () => {
    Alert.alert(
      "Excluir Hábito",
      "Tem certeza que deseja excluir este hábito? Esta ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Excluir", 
          onPress: () => {
            if (selectedHabit) {
              deleteHabit(selectedHabit.id);
              setHabitDetailsModalVisible(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Histórico
          </Text>
        </View>
        
        <CalendarStrip 
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
        
        <HabitList 
          habits={dateHabits}
          onToggleStatus={handleToggleStatus}
          onHabitPress={handleHabitPress}
          isHistoryMode
        />
        
        <HabitDetailsModal 
          visible={habitDetailsModalVisible}
          onClose={() => setHabitDetailsModalVisible(false)}
          habit={selectedHabit}
          onEdit={handleEditHabit}
          onDelete={handleDeleteHabit}
          completionRate={selectedHabit ? getHabitCompletionRate(selectedHabit.id) : 0}
          onToggleStatus={(completed) => {
            if (selectedHabit) {
              toggleHabitCompletion(selectedHabit.id, selectedDate, completed);
              // Update the selected habit to reflect the new status
              setSelectedHabit({
                ...selectedHabit,
                isCompleted: completed
              });
            }
          }}
        />
        
        <NewHabitModal 
          visible={editHabitModalVisible}
          onClose={() => setEditHabitModalVisible(false)}
          onSave={handleUpdateHabit}
          habit={selectedHabit}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
});