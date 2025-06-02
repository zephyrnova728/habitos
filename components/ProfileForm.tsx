import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/lib/supabase';

interface ProfileFormProps {
  onClose: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const { profile, updateProfile } = useProfile();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Por favor, insira seu nome');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Atenção', 'Por favor, insira seu e-mail');
      return;
    }

    if (!profile && !password.trim()) {
      Alert.alert('Atenção', 'Por favor, insira sua senha');
      return;
    }

    try {
      setIsLoading(true);

      if (!profile) {
        // New user registration
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('Failed to create user');

        // Insert into profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              name: name.trim(),
              email: email.trim(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ]);

        if (profileError) throw profileError;

        await updateProfile({
          name: name.trim(),
          email: email.trim(),
        });

        Alert.alert('Sucesso', 'Perfil criado com sucesso!');
      } else {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            name: name.trim(),
            email: email.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        if (updateError) throw updateError;

        await updateProfile({
          name: name.trim(),
          email: email.trim(),
        });

        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      }

      onClose();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Erro', 'Não foi possível salvar seu perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Nome</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                borderColor: theme.colors.border,
                backgroundColor: theme.dark ? theme.colors.background : '#F9FAFC',
              },
            ]}
            placeholder="Seu nome"
            placeholderTextColor={theme.colors.inactive}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { color: theme.colors.text }]}>E-mail</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                borderColor: theme.colors.border,
                backgroundColor: theme.dark ? theme.colors.background : '#F9FAFC',
              },
            ]}
            placeholder="Seu e-mail"
            placeholderTextColor={theme.colors.inactive}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {!profile && (
            <>
              <Text style={[styles.label, { color: theme.colors.text }]}>Senha</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.dark ? theme.colors.background : '#F9FAFC',
                  },
                ]}
                placeholder="Sua senha"
                placeholderTextColor={theme.colors.inactive}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: theme.colors.primary },
              isLoading && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Salvando...' : profile ? 'Atualizar' : 'Criar Conta'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
  saveButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileForm; 