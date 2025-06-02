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
  const { theme } = useTheme();
  const router = useRouter();
  const { profile } = useProfile();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    console.log('Profile state changed:', profile?.email);
    if (profile) {
      console.log('Redirecting to tabs due to profile presence');
      router.replace('/(tabs)');
    }
  }, [profile]);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Current session:', session?.user?.email);
      
      if (error) {
        console.error('Session check error:', error);
        return;
      }

      if (session?.user) {
        console.log('Active session found, redirecting...');
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const handleCreateAccount = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting account creation for:', email);
      
      // 1. Criar usuário na autenticação do Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha.trim(),
        options: {
          emailRedirectTo: 'habitcontrol://confirm-email',
        },
      });

      console.log('Signup response:', { user: authData?.user?.email, error: signUpError });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      if (!authData.user?.id) {
        throw new Error('Não foi possível criar o usuário');
      }

      // 2. Inserir usuário na tabela usuarios
      console.log('Creating user in database:', {
        id: authData.user.id,
        email: authData.user.email
      });

      const { data: insertData, error: dbError } = await supabase
        .from('usuarios')
        .insert([
          { 
            id: authData.user.id,
            email: email.trim(),
            senha: senha.trim() 
          }
        ])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        
        // Se houver erro ao criar na tabela, tentar deletar o usuário da autenticação
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        throw new Error('Erro ao criar usuário no banco de dados: ' + dbError.message);
      }

      console.log('User created successfully:', insertData);

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
      console.error('Account creation error:', error);
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
      console.log('Attempting login for:', email);

      // 1. Tentar fazer login
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha.trim(),
      });

      if (loginError) throw loginError;

      if (!authData.user) {
        throw new Error('Não foi possível fazer login');
      }

      // 2. Verificar se o usuário existe na tabela usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', authData.user.email)
        .single();

      // Se o usuário não existir na tabela, criar
      if (userError && userError.code === 'PGRST116') {
        console.log('User not found in database, creating...');
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert([
            {
              id: authData.user.id,
              email: authData.user.email,
              senha: senha.trim()
            }
          ]);

        if (insertError) {
          console.error('Error creating user in database:', insertError);
          throw new Error('Erro ao criar usuário no banco de dados');
        }
      } else if (userError) {
        throw userError;
      }

      console.log('Login successful, redirecting...');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
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
                    backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
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
                    backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
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