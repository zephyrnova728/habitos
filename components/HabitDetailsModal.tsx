import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { HabitWithStatus } from '@/types/habit';
import { X, CreditCard as Edit, Trash, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useHabits } from '@/contexts/HabitContext';

interface HabitDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  habit?: HabitWithStatus;
  onEdit: () => void;
  onDelete: () => void;
  completionRate: number;
  onToggleStatus: (completed: boolean) => void;
}

const HabitDetailsModal: React.FC<HabitDetailsModalProps> = ({
  visible,
  onClose,
  habit,
  onEdit,
  onDelete,
  completionRate,
  onToggleStatus
}) => {
  const { theme } = useTheme();
  const { deleteHabit } = useHabits();
  
  if (!habit) return null;
  
  const handleToggle = (completed: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onToggleStatus(completed);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.headerContainer}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Detalhes do Hábito
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            <View style={styles.contentContainer}>
              <Text style={[styles.habitTitle, { color: theme.colors.text }]}>
                {habit.name}
              </Text>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.inactive }]}>
                  Horário:
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {habit.time}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.inactive }]}>
                  Repetição:
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {habit.repeatType === 'daily' && 'Diário'}
                  {habit.repeatType === 'weekly' && 'Semanal'}
                  {habit.repeatType === 'monthly' && 'Mensal'}
                </Text>
              </View>
              
              {habit.repeatType === 'weekly' && habit.repeatDays && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.inactive }]}>
                    Dias:
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {habit.repeatDays
                      .map(day => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][day])
                      .join(', ')}
                  </Text>
                </View>
              )}
              
              {habit.repeatType === 'monthly' && habit.repeatDates && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.inactive }]}>
                    Dias do mês:
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {habit.repeatDates.join(', ')}
                  </Text>
                </View>
              )}
              
              <View style={[styles.statsContainer, { borderColor: theme.colors.border }]}>
                <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
                  Desempenho
                </Text>
                
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { backgroundColor: theme.colors.border }
                    ]}
                  >
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          backgroundColor: completionRate >= 70 
                            ? theme.colors.success 
                            : completionRate >= 40 
                              ? theme.colors.accent 
                              : theme.colors.error,
                          width: `${completionRate}%` 
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: theme.colors.text }]}>
                    {completionRate.toFixed(0)}% concluído
                  </Text>
                </View>
              </View>
              
              <View style={styles.statusButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    { backgroundColor: theme.colors.success }
                  ]}
                  onPress={() => handleToggle(true)}
                >
                  <CheckCircle size={24} color="#FFF" />
                  <Text style={styles.statusButtonText}>
                    Marcar como Feito
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    { backgroundColor: theme.colors.error }
                  ]}
                  onPress={() => handleToggle(false)}
                >
                  <XCircle size={24} color="#FFF" />
                  <Text style={styles.statusButtonText}>
                    Marcar como Não Feito
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={onEdit}
                >
                  <Edit size={20} color="#FFF" />
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.error }
                  ]}
                  onPress={() => {
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
                            if (habit) {
                              deleteHabit(habit.id);
                              onClose();
                            }
                          },
                          style: "destructive"
                        }
                      ]
                    );
                  }}
                >
                  <Trash size={20} color="#FFF" />
                  <Text style={styles.actionButtonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
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
  contentContainer: {
    padding: 20,
  },
  habitTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    flex: 1,
  },
  statsContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  statusButtonsContainer: {
    marginBottom: 20,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    marginBottom: 10,
  },
  statusButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HabitDetailsModal;