import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;

  const animalFloat1 = useRef(new Animated.Value(0)).current;
  const animalFloat2 = useRef(new Animated.Value(0)).current;
  const animalFloat3 = useRef(new Animated.Value(0)).current;
  const animalFloat4 = useRef(new Animated.Value(0)).current;
  const animalRotate1 = useRef(new Animated.Value(0)).current;
  const animalRotate2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeAnimations();
  }, []);

  const initializeAnimations = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(200, [
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(formAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ]).start();

    startBackgroundAnimations();
  };

  const startBackgroundAnimations = () => {
    const createFloatingAnimation = (animValue, duration, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const createRotationAnimation = (animValue, duration, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createFloatingAnimation(animalFloat1, 3000, 0).start();
    createFloatingAnimation(animalFloat2, 3500, 1000).start();
    createFloatingAnimation(animalFloat3, 4000, 2000).start();
    createFloatingAnimation(animalFloat4, 2800, 1500).start();

    createRotationAnimation(animalRotate1, 8000, 0).start();
    createRotationAnimation(animalRotate2, 10000, 3000).start();
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);

    Animated.sequence([
      Animated.timing(messageAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(messageAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setMessage('');
      setMessageType('');
    });
  };

  const getUserProfile = async (token) => {
    try {
      const response = await fetch('https://tesis-agutierrez-jlincango-aviteri.onrender.com/api/usuario/perfil', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        return profileData;
      } else {
        throw new Error('Error al obtener perfil del usuario');
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  };

  const saveUserData = async (loginData) => {
    try {
      await AsyncStorage.setItem('userToken', loginData.token);

      const profileData = await getUserProfile(loginData.token);

      const userData = {
        id: profileData._id,
        nombre: profileData.nombre,
        apellido: profileData.apellido,
        email: profileData.email,
        direccion: profileData.direccion,
        telefono: profileData.telefono,
        rol: profileData.rol,
        imagen: profileData.imagen,
        estado: profileData.estado,
        confirmEmail: profileData.confirmEmail,
        favoritos: profileData.favoritos || [],
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt
      };

      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('userId', profileData._id);

      console.log('Datos del usuario guardados correctamente:', userData);
      return userData;
    } catch (error) {
      console.error('Error al guardar datos del usuario:', error);
      throw error;
    }
  };

  const validateInputs = () => {
    if (!email || !password) {
      showMessage('Por favor completa todos los campos', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('Por favor ingresa un email válido', 'error');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    showMessage('Iniciando sesión...', 'info');

    try {
      const response = await fetch('https://tesis-agutierrez-jlincango-aviteri.onrender.com/api/usuario/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password
        }),
      });

      const loginData = await response.json();

      if (response.ok) {
        const userData = await saveUserData(loginData);

        showMessage(`¡Bienvenido ${userData.nombre}! ✅`, 'success');

        setTimeout(() => {
          router.replace('/inicio');
        }, 2000);
      } else {
        showMessage('❌ Credenciales incorrectas', 'error');
        Alert.alert(
          '❌ Error de Autenticación',
          'Las credenciales ingresadas son incorrectas. Por favor verifica tu email y contraseña.',
          [{ text: 'Intentar de nuevo', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error en el login:', error);
      showMessage('❌ Error de conexión', 'error');
      Alert.alert(
        '❌ Error de Conexión',
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        [{ text: 'Reintentar', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/recuperar_contrasena');
  };

  const handleRegister = () => {
    router.push('/registrarse');
  };

  const handleBackToWelcome = () => {
    router.back();
  };

  const getMessageStyle = () => {
    switch (messageType) {
      case 'success':
        return [styles.messageBox, styles.messageSuccess];
      case 'error':
        return [styles.messageBox, styles.messageError];
      case 'info':
        return [styles.messageBox, styles.messageInfo];
      default:
        return styles.messageBox;
    }
  };

  const floatInterpolate1 = animalFloat1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const floatInterpolate2 = animalFloat2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const floatInterpolate3 = animalFloat3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const floatInterpolate4 = animalFloat4.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const rotateInterpolate1 = animalRotate1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateInterpolate2 = animalRotate2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['#4CAF50', '#388E3C', '#2E7D32']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={['rgba(76, 175, 80, 0.8)', 'rgba(56, 142, 60, 0.9)', 'rgba(46, 125, 50, 0.95)']}
          style={styles.overlayGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        <View style={styles.backgroundDecorations}>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '8%', left: '15%' },
              { transform: [{ translateY: floatInterpolate1 }] }
            ]}
          >
            🦁
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '12%', right: '10%' },
              { transform: [{ rotate: rotateInterpolate1 }] }
            ]}
          >
            🐘
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '20%', left: '5%' },
              { transform: [{ translateY: floatInterpolate2 }] }
            ]}
          >
            🦒
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '75%', right: '20%' },
              { transform: [{ translateY: floatInterpolate3 }] }
            ]}
          >
            🐅
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '80%', left: '10%' },
              { transform: [{ rotate: rotateInterpolate2 }] }
            ]}
          >
            🐧
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '85%', right: '5%' },
              { transform: [{ translateY: floatInterpolate4 }] }
            ]}
          >
            🦘
          </Animated.Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {message ? (
            <Animated.View
              style={[
                getMessageStyle(),
                {
                  opacity: messageAnim,
                  transform: [{
                    translateY: messageAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.messageText}>{message}</Text>
            </Animated.View>
          ) : null}

          <Animated.View
            style={[
              styles.header,
              { opacity: logoAnim, transform: [{ scale: logoAnim }] }
            ]}
          >
            <TouchableOpacity onPress={handleBackToWelcome} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🐕</Text>
            </View>
            <Text style={styles.title}>Iniciar Sesión</Text>
            <Text style={styles.subtitle}>Accede a tu Tienda Animal</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formContainer,
              { opacity: formAnim, transform: [{ scale: formAnim }] }
            ]}
          >
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>📧 Correo Electrónico</Text>
              <TextInput
                style={styles.textInput}
                placeholder="tu@email.com"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>🔒 Contraseña</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordTextInput}
                  placeholder="Tu contraseña"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text>{showPassword ? '👁️' : '👁️🚫'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.buttonsContainer,
              { opacity: buttonAnim, transform: [{ scale: buttonAnim }] }
            ]}
          >
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9E9E9E', '#757575', '#616161'] : ['#66BB6A', '#4CAF50', '#43A047']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? '🔄 Iniciando sesión...' : '🚀 Entrar'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.registerSection}>
              <Text style={styles.registerText}>¿No tienes cuenta?</Text>
              <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
                <Text style={[styles.registerLink, isLoading && { opacity: 0.5 }]}>
                  Regístrate aquí
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  gradientBackground: {
    flex: 1,
  },
  overlayGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backgroundDecorations: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  bgAnimal: {
    position: 'absolute',
    fontSize: 32,
    opacity: 0.15,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    minHeight: height,
  },
  messageBox: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  messageSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  messageError: {
    backgroundColor: 'rgba(244, 67, 54, 0.95)',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  messageInfo: {
    backgroundColor: 'rgba(33, 150, 243, 0.95)',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  logoIcon: {
    fontSize: 65,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E9',
    textAlign: 'center',
    fontWeight: '300',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.3,
  },
  formContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  passwordTextInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingVertical: 5,
  },
  forgotPasswordText: {
    color: '#E8F5E9',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    borderRadius: 30,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    marginBottom: 25,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingHorizontal: 45,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 200,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  registerSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  registerText: {
    color: '#E8F5E9',
    fontSize: 16,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  registerLink: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default Login;
