import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'https://tesis-agutierrez-jlincango-aviteri.onrender.com/api/usuario';

function ModificarPerfil() {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userForm, setUserForm] = useState({
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    email: ''
  });
  const [profileImage, setProfileImage] = useState(null);


  useEffect(() => {
    loadUserProfile();
  }, []);


  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  };

  const getUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      return userId;
    } catch (error) {
      console.error('Error obteniendo userId:', error);
      return null;
    }
  };


  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/perfil`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserForm({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          direccion: data.direccion || '',
          telefono: data.telefono ? data.telefono.toString() : '',
          email: data.email || ''
        });
      } else {
        if (response.status === 401) {
          Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente', [
            { text: 'OK', onPress: () => router.replace('/login') }
          ]);
        } else {
          Alert.alert('Error', 'No se pudo cargar el perfil del usuario');
        }
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      Alert.alert('Error', 'Error de conexión. Verifica tu internet e intenta nuevamente');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserProfile();
  };

  const showError = (mensaje) => {
    setFormError(mensaje);
    setTimeout(() => setFormError(null), 2000);
  };

  const validateForm = (form) => {
    const { nombre, apellido, email, telefono, direccion } = form;

    const letrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,12}$/;
    const telefonoRegex = /^[0-9]{10}$/;
    const direccionRegex = /^[a-zA-Z0-9\s]{1,20}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombre.trim()) {
      showError('El nombre es obligatorio');
      return false;
    }
    if (!letrasRegex.test(nombre.trim())) {
      showError('El nombre debe tener entre 3 y 12 letras y solo letras');
      return false;
    }

    if (!apellido.trim()) {
      showError('El apellido es obligatorio');
      return false;
    }
    if (!letrasRegex.test(apellido.trim())) {
      showError('El apellido debe tener entre 3 y 12 letras y solo letras');
      return false;
    }

    if (!email.trim()) {
      showError('El email es obligatorio');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      showError('Por favor ingresa un email válido');
      return false;
    }

    if (telefono.trim()) {
      if (!telefonoRegex.test(telefono.trim())) {
        showError('El teléfono debe tener 10 dígitos');
        return false;
      }
    }

    if (direccion.trim()) {
      if (!direccionRegex.test(direccion.trim())) {
        showError('La dirección debe tener entre 1 y 20 caracteres, solo letras y números');
        return false;
      }
    }

    return true;
  };



  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permiso requerido", "Se necesita acceso a la cámara para tomar una foto.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };


  const updateProfile = async () => {
    try {
      if (!validateForm(userForm)) {
        return;
      }

      setLoading(true);
      const token = await getToken();
      const userId = await getUserId();

      if (!token) {
        Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente');
        return;
      }

      if (!userId) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario');
        return;
      }

      const updateData = {
        nombre: userForm.nombre.trim(),
        apellido: userForm.apellido.trim(),
        direccion: userForm.direccion.trim(),
        telefono: userForm.telefono.trim(),
        email: userForm.email.trim()
      };

      console.log('Enviando datos a:', `${API_BASE_URL}/actualizar-perfil/${userId}`);
      console.log('Datos:', updateData);

      const response = await fetch(`${API_BASE_URL}/actualizar-perfil/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        await AsyncStorage.setItem('userData', JSON.stringify(updateData));
        Alert.alert('🎉 ¡Éxito!', 'Perfil actualizado correctamente', [
          {
            text: 'OK',
            onPress: () => {
              console.log('Perfil actualizado exitosamente');
              router.back();
            }
          }
        ]);
      } else {
        let errorMessage = 'Error al actualizar el perfil';
        try {
          const errorData = await response.json();
          console.log('Error response:', errorData);
          errorMessage = errorData.mensaje || errorData.message || errorMessage;
        } catch (e) {
          console.log('No se pudo parsear error response');
          // Intentar obtener el texto de la respuesta si no es JSON
          try {
            const errorText = await response.text();
            console.log('Error response text:', errorText);
            if (errorText) {
              errorMessage = errorText;
            }
          } catch (textError) {
            console.log('Tampoco se pudo obtener el texto del error');
          }
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => router.back();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {formError && (
        <View style={styles.messageError}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            {formError}
          </Text>
        </View>
      )}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['#4CAF50', '#388E3C', '#2E7D32']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FFFFFF']}
              tintColor="#FFFFFF"
            />
          }
        >
          <View style={styles.mainContent}>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                  <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modificar Perfil</Text>
                <View style={styles.placeholder} />
              </View>
              <Text style={styles.headerSubtitle}>
                Actualiza tu información personal
              </Text>
            </View>

            <View style={styles.formContainer}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.formGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.photoContainer}>
                  {profileImage && (
                    <Image source={{ uri: profileImage }} style={styles.photoImage} />
                  )}
                  <TouchableOpacity onPress={openCamera} style={styles.photoButton}>
                    <Text style={styles.photoButtonText}>📷 Foto de perfil</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>👤 Nombre *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={userForm.nombre}
                    onChangeText={(text) => setUserForm(prev => ({ ...prev, nombre: text }))}
                    placeholder="Ingresa tu nombre"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>👤 Apellido *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={userForm.apellido}
                    onChangeText={(text) => setUserForm(prev => ({ ...prev, apellido: text }))}
                    placeholder="Ingresa tu apellido"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>📧 Email *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={userForm.email}
                    onChangeText={(text) => setUserForm(prev => ({ ...prev, email: text }))}
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>📞 Teléfono</Text>
                  <TextInput
                    style={styles.textInput}
                    value={userForm.telefono}
                    onChangeText={(text) => setUserForm(prev => ({ ...prev, telefono: text }))}
                    placeholder="0987654321"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    keyboardType="phone-pad"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>🏠 Dirección</Text>
                  <TextInput
                    style={[styles.textInput, styles.textAreaInput]}
                    value={userForm.direccion}
                    onChangeText={(text) => setUserForm(prev => ({ ...prev, direccion: text }))}
                    placeholder="Ingresa tu dirección"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    multiline={true}
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.updateButton, loading && styles.buttonDisabled]}
                  onPress={updateProfile}
                  disabled={loading}
                >
                  <Text style={styles.updateButtonText}>
                    {loading ? '⏳ Actualizando...' : '💾 Actualizar Perfil'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D32', // Verde profesional corporativo
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
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  backButtonText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  placeholder: {
    width: 44,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#E8F5E9',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  formGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 6,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 13,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    fontSize: 15,
  },
  textAreaInput: {
    height: 90,
    paddingTop: 14,
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(56, 142, 60, 0.6)',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  photoContainer: {
    marginBottom: 18,
    alignItems: 'center',
  },
  photoImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 10,
  },
  photoButton: {
    backgroundColor: '#43A047',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 0.5,
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  messageError: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.95)',
    borderWidth: 1.5,
    borderColor: '#F44336',
    borderRadius: 14,
    padding: 10,
    zIndex: 1000,
  },
});


export default ModificarPerfil;