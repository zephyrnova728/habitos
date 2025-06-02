import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Habit, RepeatType } from '@/types/habit';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X } from 'lucide-react-native';

interface NewHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  habit?: Habit;
}

const NewHabitModal: React.FC<NewHabitModalProps> = ({
  visible,
  onClose,
  onSave,
  habit
}) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [time, setTime] = useState(new Date());
  const [repeatType, setRepeatType] = useState<RepeatType>('daily');
  const [repeatValue, setRepeatValue] = useState(1);
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [repeatDates, setRepeatDates] = useState<number[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeString, setTimeString] = useState('');
  
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      
      // Parse time string to Date
      const [hours, minutes] = habit.time.split(':').map(Number);
      const timeDate = new Date();
      timeDate.setHours(hours, minutes, 0, 0);
      setTime(timeDate);
      setTimeString(habit.time);
      
      setRepeatType(habit.repeatType);
      setRepeatValue(habit.repeatValue);
      setRepeatDays(habit.repeatDays || []);
      setRepeatDates(habit.repeatDates || []);
    } else {
      // Default values for new habits
      resetForm();
    }
  }, [habit, visible]);

  const resetForm = () => {
    setName('');
    const now = new Date();
    setTime(now);
    setTimeString(format(now, 'HH:mm'));
    setRepeatType('daily');
    setRepeatValue(1);
    setRepeatDays([]);
    setRepeatDates([]);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
      setTimeString(format(selectedTime, 'HH:mm'));
    }
  };

  const toggleDaySelection = (day: number) => {
    if (repeatDays.includes(day)) {
      setRepeatDays(repeatDays.filter(d => d !== day));
    } else {
      setRepeatDays([...repeatDays, day]);
    }
  };

  const toggleDateSelection = (date: number) => {
    if (repeatDates.includes(date)) {
      setRepeatDates(repeatDates.filter(d => d !== date));
    } else {
      setRepeatDates([...repeatDates, date]);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(
        "Atenção",
        "Por favor, insira um nome para o hábito"
      );
      return;
    }

    // Validate repeat settings
    if (repeatType === 'weekly' && repeatDays.length === 0) {
      Alert.alert(
        "Atenção",
        "Por favor, selecione pelo menos um dia da semana"
      );
      return;
    }

    if (repeatType === 'monthly' && repeatDates.length === 0) {
      Alert.alert(
        "Atenção",
        "Por favor, selecione pelo menos um dia do mês"
      );
      return;
    }

    const newHabit = {
      name,
      time: timeString,
      repeatType,
      repeatValue,
      repeatDays: repeatType === 'weekly' ? repeatDays : undefined,
      repeatDates: repeatType === 'monthly' ? repeatDates : undefined,
    };

    onSave(newHabit);
    resetForm();
    onClose();
  };

  const renderDaysOfWeek = () => {
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return (
      <View style={styles.daysContainer}>
        {daysOfWeek.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              repeatDays.includes(index) && { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => toggleDaySelection(index)}
          >
            <Text style={[
              styles.dayText,
              repeatDays.includes(index) && { color: '#FFF' }
            ]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderDaysOfMonth = () => {
    const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);
    
    return (
      <View style={styles.monthDaysContainer}>
        {daysOfMonth.map((date) => (
          <TouchableOpacity
            key={date}
            style={[
              styles.monthDayButton,
              repeatDates.includes(date) && { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => toggleDateSelection(date)}
          >
            <Text style={[
              styles.monthDayText,
              repeatDates.includes(date) && { color: '#FFF' }
            ]}>
              {date}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.headerContainer}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {habit ? 'Editar Hábito' : 'Novo Hábito'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Nome</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.dark ? theme.colors.background : '#F9FAFC'
                  }
                ]}
                placeholder="Nome do hábito"
                placeholderTextColor={theme.colors.inactive}
                value={name}
                onChangeText={setName}
              />
              
              <Text style={[styles.label, { color: theme.colors.text }]}>Horário</Text>
              <TouchableOpacity
                style={[
                  styles.timePickerButton,
                  { 
                    borderColor: theme.colors.border,
                    backgroundColor: theme.dark ? theme.colors.background : '#F9FAFC'
                  }
                ]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={{ color: theme.colors.text }}>
                  {timeString || 'Selecionar horário'}
                </Text>
              </TouchableOpacity>
              
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
              
              <Text style={[styles.label, { color: theme.colors.text }]}>Repetição</Text>
              <View style={styles.repeatTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.repeatTypeButton,
                    repeatType === 'daily' && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setRepeatType('daily')}
                >
                  <Text style={[
                    styles.repeatTypeText,
                    repeatType === 'daily' && { color: '#FFF' }
                  ]}>
                    Diário
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.repeatTypeButton,
                    repeatType === 'weekly' && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setRepeatType('weekly')}
                >
                  <Text style={[
                    styles.repeatTypeText,
                    repeatType === 'weekly' && { color: '#FFF' }
                  ]}>
                    Semanal
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.repeatTypeButton,
                    repeatType === 'monthly' && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setRepeatType('monthly')}
                >
                  <Text style={[
                    styles.repeatTypeText,
                    repeatType === 'monthly' && { color: '#FFF' }
                  ]}>
                    Mensal
                  </Text>
                </TouchableOpacity>
              </View>
              
              {repeatType === 'weekly' && renderDaysOfWeek()}
              {repeatType === 'monthly' && renderDaysOfMonth()}
              
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {habit ? 'Atualizar' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '90%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  timePickerButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  repeatTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  repeatTypeButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  repeatTypeText: {
    fontWeight: '500',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  dayButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  dayText: {
    fontWeight: '500',
    fontSize: 12,
  },
  monthDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  monthDayButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  monthDayText: {
    fontWeight: '500',
    fontSize: 14,
  },
  saveButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewHabitModal;