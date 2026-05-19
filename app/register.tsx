import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');

  const handleRegister = () => {
    // Navigate directly to the main layout
    router.replace('/(tabs)' as any);
  };

  const handleGoToLogin = () => {
    router.push('/login' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo Container */}
          <View style={styles.logoOuter}>
            <View style={styles.logoBg}>
              <FontAwesome5 name="theater-masks" size={38} color="#FFFFFF" />
            </View>
          </View>

          {/* Titles */}
          <Text style={styles.title}>Crea Account</Text>
          <Text style={styles.subtitle}>Inizia la tua avventura teatrale</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Field */}
            <Text style={styles.label}>Nome</Text>
            <View style={styles.inputRow}>
              <FontAwesome5 name="user" size={16} color="#90A4AE" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mario Rossi"
                placeholderTextColor="#B0BEC5"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email Field */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <FontAwesome5 name="envelope" size={16} color="#90A4AE" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="mario.rossi@email.com"
                placeholderTextColor="#B0BEC5"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Field */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <FontAwesome5 name="lock" size={16} color="#90A4AE" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#B0BEC5"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* City Field */}
            <Text style={styles.label}>Città</Text>
            <View style={styles.inputRow}>
              <FontAwesome5 name="map-marker-alt" size={16} color="#90A4AE" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Bari"
                placeholderTextColor="#B0BEC5"
                value={city}
                onChangeText={setCity}
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <FontAwesome5 name="user-plus" size={16} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.registerButtonText}>REGISTRATI</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Card */}
          <View style={styles.footerCard}>
            <Text style={styles.footerText}>Hai già un account?</Text>
            <TouchableOpacity style={styles.loginOutlineButton} onPress={handleGoToLogin}>
              <Text style={styles.loginOutlineButtonText}>ACCEDI</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9E6', // Warm cream background
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  logoOuter: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  logoBg: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#FF7043', // Primary orange/coral
    borderWidth: 2.5,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#333333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
    fontWeight: '600',
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#555555',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
    fontWeight: '500',
  },
  registerButton: {
    flexDirection: 'row',
    backgroundColor: '#FF7043',
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 6,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 5,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#757575',
    marginBottom: 8,
  },
  loginOutlineButton: {
    borderWidth: 2,
    borderColor: '#FF7043',
    borderRadius: 14,
    width: '100%',
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginOutlineButtonText: {
    color: '#FF7043',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
