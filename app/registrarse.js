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

function Registrarse() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  const animalFloat5 = useRef(new Animated.Value(0)).current;
  const animalFloat6 = useRef(new Animated.Value(0)).current;

  const animalRotate1 = useRef(new Animated.Value(0)).current;
  const animalRotate2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
    createFloatingAnimation(animalFloat5, 3200, 500).start();
    createFloatingAnimation(animalFloat6, 3800, 2500).start();

    createRotationAnimation(animalRotate1, 8000, 0).start();
    createRotationAnimation(animalRotate2, 10000, 3000).start();
  }, []);

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

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (password.length < minLength) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!hasUpperCase) {
      return 'La contraseña debe tener al menos una letra mayúscula';
    }
    if (!hasLowerCase) {
      return 'La contraseña debe tener al menos una letra minúscula';
    }
    if (!hasNumbers) {
      return 'La contraseña debe tener al menos un número';
    }
    return null;
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+593|593|0)[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const handleRegister = async () => {
    if (!nombre || !apellido || !direccion || !telefono || !email || !password || !confirmPassword) {
      showMessage('Por favor completa todos los campos', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('Por favor ingresa un email válido', 'error');
      return;
    }

    if (!validatePhone(telefono)) {
      showMessage('Ingresa un número de teléfono válido (Ecuador)', 'error');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      showMessage(passwordError, 'error');
      return;
    }

    if (password !== confirmPassword) {
      showMessage('Las contraseñas no coinciden', 'error');
      return;
    }

    setIsLoading(true);
    showMessage('Creando cuenta...', 'info');

    try {
      const response = await fetch('https://tesis-agutierrez-jlincango-aviteri.onrender.com/api/usuario/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          direccion: direccion.trim(),
          telefono: telefono.trim(),
          email: email.toLowerCase().trim(),
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('¡Cuenta creada exitosamente! Se ha enviado un correo de verificación. ✅', 'success');
        Alert.alert(
          '🎉 ¡Registro Exitoso!',
          `¡Bienvenido ${nombre}! Tu cuenta ha sido creada correctamente. Se ha enviado un correo de verificación a tu dirección de correo electrónico. Por favor, verifica tu correo antes de iniciar sesión.`,
          [
            {
              text: 'Ir a Iniciar Sesión',
              style: 'default',
              onPress: () => {
                setTimeout(() => {
                  router.replace('/login');
                }, 500);
              }
            }
          ]
        );
      } else {
        const errorMessage = data.message || 'Error al crear la cuenta';
        showMessage(`❌ ${errorMessage}`, 'error');
        Alert.alert(
          '❌ Error de Registro',
          errorMessage === 'Usuario ya existe'
            ? 'Ya existe una cuenta con este email. Intenta con otro email o inicia sesión.'
            : `Error: ${errorMessage}`,
          [{ text: 'Intentar de nuevo', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error en el registro:', error);
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

  const handleBackToLogin = () => {
    router.back();
  };

  const handleGoToLogin = () => {
    router.push('/login');
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

  const floatInterpolate5 = animalFloat5.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  const floatInterpolate6 = animalFloat6.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -22],
  });

  const rotateInterpolate1 = animalRotate1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateInterpolate2 = animalRotate2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

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
              { top: '5%', left: '10%' },
              { transform: [{ translateY: floatInterpolate1 }] }
            ]}
          >
            🦁
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '8%', right: '15%' },
              { transform: [{ rotate: rotateInterpolate1 }] }
            ]}
          >
            🐘
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '15%', left: '5%' },
              { transform: [{ translateY: floatInterpolate2 }] }
            ]}
          >
            🦒
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '25%', right: '8%' },
              { transform: [{ translateY: floatInterpolate3 }] }
            ]}
          >
            🐅
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '70%', left: '12%' },
              { transform: [{ rotate: rotateInterpolate2 }] }
            ]}
          >
            🐧
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '75%', right: '10%' },
              { transform: [{ translateY: floatInterpolate4 }] }
            ]}
          >
            🦘
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '82%', left: '8%' },
              { transform: [{ translateY: floatInterpolate5 }] }
            ]}
          >
            🐨
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '88%', right: '5%' },
              { transform: [{ translateY: floatInterpolate6 }] }
            ]}
          >
            🦓
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
            <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🐕</Text>
            </View>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a nuestra Tienda Animal</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formContainer,
              { opacity: formAnim, transform: [{ scale: formAnim }] }
            ]}
          >
            <View style={styles.rowContainer}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>👤 Nombre</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tu nombre"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>👤 Apellido</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tu apellido"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={apellido}
                  onChangeText={setApellido}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>📍 Dirección</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Tu dirección completa"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={direccion}
                onChangeText={setDireccion}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>📱 Teléfono</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0939629767"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

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
                  placeholder="Mínimo 8 caracteres, mayúscula, minúscula y número"
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

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>🔒 Confirmar Contraseña</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordTextInput}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text>{showConfirmPassword ? '👁️' : '👁️🚫'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.buttonsContainer,
              { opacity: buttonAnim, transform: [{ scale: buttonAnim }] }
            ]}
          >
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9E9E9E', '#757575', '#616161'] : ['#66BB6A', '#4CAF50', '#388E3C']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? '🔄 Creando cuenta...' : '🎉 Crear Cuenta'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginSection}>
              <Text style={styles.loginText}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={handleGoToLogin} disabled={isLoading}>
                <Text style={[styles.loginLink, isLoading && { opacity: 0.5 }]}>
                  Iniciar Sesión
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
    paddingVertical: 20,
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
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfWidth: {
    width: '48%',
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
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  registerButton: {
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
  loginSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#FFF3E0',
    fontSize: 16,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loginLink: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default Registrarse;
