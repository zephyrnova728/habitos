import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useHabits } from '@/contexts/HabitContext';
import { HabitWithStatus } from '@/types/habit';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarStrip from '@/components/CalendarStrip';
import HabitList from '@/components/HabitList';
import NewHabitModal from '@/components/NewHabitModal';
import HabitDetailsModal from '@/components/HabitDetailsModal';
import { Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { 
    getTodayHabits, 
    addHabit, 
    updateHabit, 
    deleteHabit, 
    toggleHabitCompletion,
    getHabitCompletionRate,
    selectedDate,
    setSelectedDate,
    getHabitsForDate
  } = useHabits();
  
  const [newHabitModalVisible, setNewHabitModalVisible] = useState(false);
  const [habitDetailsModalVisible, setHabitDetailsModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<HabitWithStatus | undefined>(undefined);
  
  const dateHabits = getHabitsForDate(selectedDate);

  const handleAddHabit = (habitData: any) => {
    addHabit(habitData);
  };

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
      setNewHabitModalVisible(true);
    }, 300);
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
            HabitControl
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
        />
        
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            setSelectedHabit(undefined);
            setNewHabitModalVisible(true);
          }}
        >
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
        
        <NewHabitModal 
          visible={newHabitModalVisible}
          onClose={() => setNewHabitModalVisible(false)}
          onSave={handleAddHabit}
          habit={selectedHabit}
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
              setSelectedHabit({
                ...selectedHabit,
                isCompleted: completed
              });
            }
          }}
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
  fab: {
    position: 'absolute',
    bottom: 75,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});