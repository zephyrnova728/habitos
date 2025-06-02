import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useProfile } from '@/contexts/ProfileContext';

export default function LoginScreen() {
  const { theme, themeType } = useTheme();
  const router = useRouter();
  const { profile } = useProfile();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (profile) {
      router.replace('/(tabs)');
    }
  }, [profile]);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) return;
      if (session?.user) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      // ignore
    }
  };

  const handleCreateAccount = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha.trim(),
        options: {
          emailRedirectTo: 'habitcontrol://confirm-email',
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user?.id) {
        throw new Error('Não foi possível criar o usuário');
      }

      // Não armazene a senha no banco de dados!
      const { error: dbError } = await supabase
        .from('usuarios')
        .insert([
          { 
            id: authData.user.id,
            email: email.trim()
          }
        ]);

      if (dbError) {
        // Não podemos usar a API admin no cliente, então apenas reportamos o erro
        console.error('Erro ao criar usuário no banco de dados:', dbError);
        throw new Error('Erro ao criar usuário no banco de dados: ' + dbError.message);
      }

      Alert.alert(
        'Sucesso', 
        'Conta criada com sucesso! Por favor, verifique seu email para confirmar sua conta.',
        [{ 
          text: 'OK', 
          onPress: () => {
            setEmail('');
            setSenha('');
            setIsLogin(true);
          }
        }]
      );
    } catch (error: any) {
      Alert.alert(
        'Erro', 
        error.message || 'Não foi possível criar a conta. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);

      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha.trim(),
      });

      if (loginError) throw loginError;

      if (!authData.user) {
        throw new Error('Não foi possível fazer login');
      }

      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', authData.user.email)
        .single();

      if (userError && userError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert([
            {
              id: authData.user.id,
              email: authData.user.email
            }
          ]);

        if (insertError) {
          throw new Error('Erro ao criar usuário no banco de dados');
        }
      } else if (userError) {
        throw userError;
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              HabitControl
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
              {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>E-mail</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    backgroundColor: themeType === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  },
                ]}
                placeholder="Seu e-mail"
                placeholderTextColor={theme.colors.inactive}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Senha</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    backgroundColor: themeType === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  },
                ]}
                placeholder="Sua senha"
                placeholderTextColor={theme.colors.inactive}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.colors.primary },
                loading && { opacity: 0.7 },
              ]}
              onPress={isLogin ? handleLogin : handleCreateAccount}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? 'Entrar' : 'Criar Conta'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsLogin(!isLogin);
                setEmail('');
                setSenha('');
              }}
            >
              <Text style={[styles.switchText, { color: theme.colors.primary }]}>
                {isLogin
                  ? 'Não tem uma conta? Criar conta'
                  : 'Já tem uma conta? Fazer login'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.7,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  input: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
