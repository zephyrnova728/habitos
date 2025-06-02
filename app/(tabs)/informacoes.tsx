import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Linking, Modal } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Sun, Github, Heart, Mail, User, LogOut } from 'lucide-react-native';
import Constants from 'expo-constants';
import ProfileForm from '@/components/ProfileForm';

export default function InformacoesScreen() {
  const { theme, themeType, toggleTheme } = useTheme();
  const { profile, signOut } = useProfile();
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Informações
          </Text>
        </View>
        
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Perfil
            </Text>
            {profile ? (
              <>
                <View style={styles.profileInfo}>
                  <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.avatarText}>
                      {profile.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.profileDetails}>
                    <Text style={[styles.profileName, { color: theme.colors.text }]}>
                      {profile.name}
                    </Text>
                    <Text style={[styles.profileEmail, { color: theme.colors.inactive }]}>
                      {profile.email}
                    </Text>
                  </View>
                </View>
                <View style={styles.profileActions}>
                  <TouchableOpacity
                    style={[styles.profileButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => setProfileModalVisible(true)}
                  >
                    <User size={20} color="#FFF" />
                    <Text style={styles.profileButtonText}>Editar Perfil</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.profileButton, { backgroundColor: theme.colors.error }]}
                    onPress={handleSignOut}
                  >
                    <LogOut size={20} color="#FFF" />
                    <Text style={styles.profileButtonText}>Sair</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.profileButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setProfileModalVisible(true)}
              >
                <User size={20} color="#FFF" />
                <Text style={styles.profileButtonText}>Criar Perfil</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Sobre o App
            </Text>
            <Text style={[styles.appName, { color: theme.colors.primary }]}>
              HabitControl
            </Text>
            <Text style={[styles.description, { color: theme.colors.text }]}>
              Um aplicativo simples e eficiente para o controle e acompanhamento de hábitos diários.
            </Text>
            <Text style={[styles.version, { color: theme.colors.inactive }]}>
              Versão {Constants.expoConfig?.version || '1.0.0'}
            </Text>
          </View>
          
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Aparência
            </Text>
            <View style={styles.themeSelector}>
              <View style={styles.themeOption}>
                <Sun size={24} color={themeType === 'light' ? theme.colors.primary : theme.colors.inactive} />
                <Text style={[
                  styles.themeText, 
                  { color: themeType === 'light' ? theme.colors.primary : theme.colors.text }
                ]}>
                  Claro
                </Text>
              </View>
              
              <Switch
                value={themeType === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
              
              <View style={styles.themeOption}>
                <Moon size={24} color={themeType === 'dark' ? theme.colors.primary : theme.colors.inactive} />
                <Text style={[
                  styles.themeText, 
                  { color: themeType === 'dark' ? theme.colors.primary : theme.colors.text }
                ]}>
                  Escuro
                </Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Desenvolvido por
            </Text>
            <Text style={[styles.devName, { color: theme.colors.text }]}>
              Desenvolvedor do HabitControl
            </Text>
            
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => Linking.openURL('mailto:dev@habitcontrol.com')}
              >
                <Mail size={20} color="#FFF" />
                <Text style={styles.contactButtonText}>Contato</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: '#333' }]}
                onPress={() => Linking.openURL('https://github.com/habticontrol')}
              >
                <Github size={20} color="#FFF" />
                <Text style={styles.contactButtonText}>GitHub</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.inactive }]}>
            Feito com 
          </Text>
          <Heart size={16} color={theme.colors.error} style={{ marginHorizontal: 4 }} />
          <Text style={[styles.footerText, { color: theme.colors.inactive }]}>
            em React Native
          </Text>
        </View>
      </SafeAreaView>

      <Modal
        visible={profileModalVisible}
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {profile ? 'Editar Perfil' : 'Criar Perfil'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setProfileModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <ProfileForm onClose={() => setProfileModalVisible(false)} />
        </View>
      </Modal>
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
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  profileButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
  },
  themeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  themeOption: {
    alignItems: 'center',
    width: 60,
  },
  themeText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  devName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  contactButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
});