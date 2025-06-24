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
  Modal,
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
import Markdown from 'react-native-markdown-display';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'https://tesis-agutierrez-jlincango-aviteri.onrender.com/api/mascota';

const activityLevels = ['Mucha', 'Normal', 'Regular', 'Baja', 'Nula'];

function GestionMascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDietModal, setShowDietModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [presupuesto, setPresupuesto] = useState('');
  const [dieta, setDieta] = useState(null);
  const [petForm, setPetForm] = useState({
    nombre: '',
    raza: '',
    edad: '',
    actividad: 'Normal',
    peso: '',
    imagen: null,
    enfermedades: ''
  });

  useEffect(() => {
    loadMascotas();
  }, []);

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token obtenido:', token ? 'Token presente' : 'Token no encontrado');
      return token;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  };

  const loadMascotas = async () => {
    try {
      const token = await getToken();

      if (!token) {
        console.log('No se encontró token, redirigiendo al login');
        Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
        return;
      }

      console.log('Realizando petición para listar mascotas...');
      const response = await fetch(`${API_BASE_URL}/listar`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Status de respuesta:', response.status);
      const responseText = await response.text();
      console.log('Respuesta cruda:', responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log('Datos recibidos:', data);
        setMascotas(Array.isArray(data.mascotas) ? data.mascotas : Array.isArray(data) ? data : []);
      } else {
        console.error('Error en la respuesta:', response.status, responseText);
        if (response.status === 401) {
          Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente', [
            { text: 'OK', onPress: () => router.replace('/login') }
          ]);
        } else {
          Alert.alert('Error', 'No se pudieron cargar las mascotas');
        }
      }
    } catch (error) {
      console.error('Error cargando mascotas:', error);
      Alert.alert('Error', 'Error de conexión. Verifica tu internet e intenta nuevamente');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMascotas();
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Se necesita permiso para usar la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPetForm(prev => ({ ...prev, imagen: result.assets[0] }));
    }
  };



  const saveMascota = async () => {
    try {
      if (!petForm.nombre.trim() || !petForm.raza.trim() || !petForm.edad || !petForm.peso) {
        Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
        return;
      }

      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente');
        return;
      }

      const formData = new FormData();
      formData.append('nombre', petForm.nombre.trim());
      formData.append('raza', petForm.raza.trim());
      formData.append('edad', parseInt(petForm.edad).toString());
      formData.append('actividad', petForm.actividad);
      formData.append('peso', parseFloat(petForm.peso).toString());
      formData.append('enfermedades', petForm.enfermedades.trim());

      if (petForm.imagen && petForm.imagen.uri) {
        const imageUri = petForm.imagen.uri;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('imagen', { uri: imageUri, name: filename || 'mascota.jpg', type });
      }

      const url = editingPet ? `${API_BASE_URL}/actualizar/${editingPet._id}` : `${API_BASE_URL}/registro`;
      const method = editingPet ? 'PUT' : 'POST';

      console.log(`${method} request to:`, url);

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      const responseText = await response.text();
      console.log('Save response:', response.status, responseText);

      if (response.ok) {
        Alert.alert('Exito', editingPet ? 'Mascota actualizada correctamente' : 'Mascota registrada correctamente', [
          { text: 'OK', onPress: () => { closeModal(); loadMascotas(); } }
        ]);
      } else {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.mensaje || 'Error al guardar mascota');
      }
    } catch (error) {
      console.error('Error guardando mascota:', error);
      Alert.alert('Error', error.message || 'No se pudo guardar la mascota');
    }
  };

  const deleteMascota = async (mascotaId) => {
    Alert.alert('Eliminar Mascota', 'Estas seguro de que deseas eliminar esta mascota? Esta accion no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            if (!token) {
              Alert.alert('Error', 'Sesion expirada. Por favor inicia sesion nuevamente');
              return;
            }

            console.log('Eliminando mascota:', mascotaId);
            const response = await fetch(`${API_BASE_URL}/eliminar/${mascotaId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            const responseText = await response.text();
            console.log('Delete response:', response.status, responseText);

            if (response.ok) {
              Alert.alert('Exito', 'Mascota eliminada correctamente');
              loadMascotas();
            } else {
              const errorData = JSON.parse(responseText);
              throw new Error(errorData.mensaje || 'Error al eliminar mascota');
            }
          } catch (error) {
            console.error('Error eliminando mascota:', error);
            Alert.alert('Error', error.message || 'No se pudo eliminar la mascota');
          }
        }
      }
    ]);
  };

  const generarDieta = async (mascotaId) => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Sesion expirada. Por favor inicia sesion nuevamente');
        return;
      }

      if (!presupuesto) {
        Alert.alert('Error', 'Por favor ingresa un presupuesto');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/generar-dieta/${mascotaId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ presupuesto }),
      });

      const responseText = await response.text();
      console.log('Generate Diet response:', response.status, responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        setDieta(data.dieta);
        setShowDietModal(true);
      } else {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.msg || 'Error al generar la dieta');
      }
    } catch (error) {
      console.error('Error generando dieta:', error);
      Alert.alert('Error', error.message || 'No se pudo generar la dieta');
    }
  };

  const openModal = (mascota = null) => {
    setEditingPet(mascota);
    setPetForm(mascota ? {
      nombre: mascota.nombre || '',
      raza: mascota.raza || '',
      edad: mascota.edad?.toString() || '',
      actividad: mascota.actividad || 'Normal',
      peso: mascota.peso?.toString() || '',
      imagen: null,
      enfermedades: mascota.enfermedades || ''
    } : {
      nombre: '',
      raza: '',
      edad: '',
      actividad: 'Normal',
      peso: '',
      imagen: null,
      enfermedades: ''
    });
    setShowModal(true);
  };

  const openDietModal = (mascotaId) => {
    setEditingPet(mascotaId);
    setShowDietModal(true);
  };

  const renderDietaText = (text) => {
  if (!text) return null;

  // Divide el texto en líneas
  return text.split('\n').map((line, index) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      // Texto en negrita
      return (
        <Text key={index} style={styles.boldText}>
          {line.replace(/\*\*/g, '')}
        </Text>
      );
    } else if (line.startsWith('* ') && !line.startsWith('* *')) {
      // Elemento de lista
      return (
        <Text key={index} style={styles.listItem}>
          • {line.substring(2)}
        </Text>
      );
    } else {
      // Texto normal
      return (
        <Text key={index} style={styles.normalText}>
          {line}
        </Text>
      );
    }
  });
};

  const closeModal = () => {
    setShowModal(false);
    setEditingPet(null);
    setPetForm({ nombre: '', raza: '', edad: '', actividad: 'Normal', peso: '', imagen: null, enfermedades: '' });
  };

  const closeDietModal = () => {
    setShowDietModal(false);
    setEditingPet(null);
    setPresupuesto('');
  };

  const goBack = () => router.back();

  const handleCloseDietaModal = () => {
    setDieta(null);
    setShowDietModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.backgroundContainer}>
        <LinearGradient colors={['#4CAF50', '#388E3C', '#2E7D32']} style={styles.gradientBackground} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFFFFF']} tintColor="#FFFFFF" />}
      >
        <View style={styles.mainContent}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Gestion de Mascotas</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.headerSubtitle}>
              {mascotas.length > 0 ? `Tienes ${mascotas.length} mascota${mascotas.length > 1 ? 's' : ''} registrada${mascotas.length > 1 ? 's' : ''}` : 'Administra la informacion de tus mascotas'}
            </Text>
          </View>

          <View style={styles.petsContainer}>
            {mascotas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🐾</Text>
                <Text style={styles.emptyText}>No tienes mascotas registradas</Text>
                <Text style={styles.emptySubtext}>Presiona el boton "+" para agregar tu primera mascota y comenzar a cuidar mejor de ella</Text>
                <TouchableOpacity style={styles.emptyButton} onPress={() => openModal()}>
                  <Text style={styles.emptyButtonText}>➕ Agregar Primera Mascota</Text>
                </TouchableOpacity>
              </View>
            ) : (
              mascotas.map((mascota, index) => (
                <View key={mascota._id || index} style={styles.petCard}>
                  <LinearGradient colors={['#66BB6A', '#4CAF50', '#43A047']} style={styles.petCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <View style={styles.petCardContent}>
                      <View style={styles.petInfo}>
                        <View style={styles.petImageContainer}>
                          {mascota.imagen ? (
                            <Image source={{ uri: mascota.imagen }} style={styles.petImage} onError={(error) => console.log('Error cargando imagen:', error)} />
                          ) : (
                            <Text style={styles.petImagePlaceholder}>🐕</Text>
                          )}
                        </View>
                        <View style={styles.petDetails}>
                          <Text style={styles.petName}>{mascota.nombre}</Text>
                          <Text style={styles.petBreed}>{mascota.raza}</Text>
                          <View style={styles.petMetrics}>
                            <Text style={styles.petMetric}>📅 {mascota.edad} años</Text>
                            <Text style={styles.petMetric}>⚖️ {mascota.peso} kg</Text>
                          </View>
                          <Text style={styles.petActivity}>🐕🏃 Actividad: {mascota.actividad}</Text>
                        </View>
                      </View>
                      <View style={styles.petActions}>
                        <TouchableOpacity style={styles.editButton} onPress={() => openModal(mascota)}>
                          <Text style={styles.actionButtonText}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteMascota(mascota._id)}>
                          <Text style={styles.actionButtonText}>🗑️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dietButton} onPress={() => openDietModal(mascota._id)}>
                          <Text style={styles.actionButtonText}>🍽️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient colors={['#66BB6A', '#4CAF50', '#43A047']} style={styles.modalGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{editingPet ? '✏️ Editar Mascota' : '➕ Agregar Mascota'}</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>🏷️ Nombre *</Text>
                      <TextInput style={styles.textInput} value={petForm.nombre} onChangeText={(text) => setPetForm(prev => ({ ...prev, nombre: text }))} placeholder="Ej: Firulais, Max, Luna..." placeholderTextColor="rgba(255, 255, 255, 0.7)" />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>🐕 Raza *</Text>
                      <TextInput style={styles.textInput} value={petForm.raza} onChangeText={(text) => setPetForm(prev => ({ ...prev, raza: text }))} placeholder="Ej: Labrador, Pastor Aleman, Mestizo..." placeholderTextColor="rgba(255, 255, 255, 0.7)" />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>📅 Edad (años) *</Text>
                      <TextInput style={styles.textInput} value={petForm.edad} onChangeText={(text) => setPetForm(prev => ({ ...prev, edad: text }))} placeholder="Ej: 3" placeholderTextColor="rgba(255, 255, 255, 0.7)" keyboardType="numeric" />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>⚖️ Peso (kg) *</Text>
                      <TextInput style={styles.textInput} value={petForm.peso} onChangeText={(text) => setPetForm(prev => ({ ...prev, peso: text }))} placeholder="Ej: 25.5" placeholderTextColor="rgba(255, 255, 255, 0.7)" keyboardType="decimal-pad" />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>🏃 Nivel de Actividad</Text>
                      <View style={styles.activityContainer}>
                        {activityLevels.map((nivel) => (
                          <TouchableOpacity key={nivel} style={[styles.activityButton, petForm.actividad === nivel && styles.activityButtonSelected]} onPress={() => setPetForm(prev => ({ ...prev, actividad: nivel }))}>
                            <Text style={[styles.activityButtonText, petForm.actividad === nivel && styles.activityButtonTextSelected]}>{nivel}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>💊 Enfermedades</Text>
                      <TextInput style={styles.textInput} value={petForm.enfermedades} onChangeText={(text) => setPetForm(prev => ({ ...prev, enfermedades: text }))} placeholder="Ej: Diabetes, Alergias..." placeholderTextColor="rgba(255, 255, 255, 0.7)" />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>📷 Foto de tu mascota</Text>
                      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                        {petForm.imagen ? (
                          <Image source={{ uri: petForm.imagen.uri }} style={styles.selectedImage} />
                        ) : (
                          <View style={styles.imagePlaceholder}>
                            <Text style={styles.imagePlaceholderText}>📷</Text>
                            <Text style={styles.imagePlaceholderSubtext}>Toca para seleccionar una foto</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>

                    <View style={styles.buttonContainer}>
                      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.saveButton} onPress={saveMascota}>
                        <Text style={styles.saveButtonText}>{editingPet ? '✏️ Actualizar' : '💾 Guardar'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </LinearGradient>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showDietModal} animationType="slide" transparent={true} onRequestClose={closeDietModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient colors={['#66BB6A', '#4CAF50', '#43A047']} style={styles.modalGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Generar Dieta con IA</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={closeDietModal}>
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>💰 Presupuesto</Text>
                      <TextInput
                        style={styles.textInput}
                        value={presupuesto}
                        onChangeText={setPresupuesto}
                        placeholder="Ej: 100"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.buttonContainer}>
                      <TouchableOpacity style={styles.cancelButton} onPress={closeDietModal}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.saveButton} onPress={() => generarDieta(editingPet)}>
                        <Text style={styles.saveButtonText}>Generar Dieta</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </LinearGradient>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={dieta !== null} animationType="slide" transparent={true} onRequestClose={handleCloseDietaModal}>
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <LinearGradient colors={['#66BB6A', '#4CAF50', '#43A047']} style={styles.modalGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dieta Personalizada asistida por IA</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleCloseDietaModal}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              {dieta && (
                <View style={styles.dietaContainer}>
                  <Markdown style={{
                    body: { color: '#FFFFFF', fontSize: 16 },
                    heading1: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
                    heading2: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
                    strong: { color: '#FFFFFF', fontWeight: 'bold' },
                    em: { color: '#FFFFFF', fontStyle: 'italic' },
                    bullet_list: { color: '#FFFFFF' },
                    list_item: { color: '#FFFFFF' },
                    text: { color: '#FFFFFF' },
                    paragraph: { marginBottom: 10 }
                  }}>
                    {dieta}
                  </Markdown>
                </View>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleCloseDietaModal}>
                  <Text style={styles.saveButtonText}>Perfecto, Gracias</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </View>
  </KeyboardAvoidingView>
</Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundContainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  gradientBackground: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  mainContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  header: { marginBottom: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backButton: { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 25, width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  backButtonText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', flex: 1, textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 6 },
  addButton: { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 25, width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  addButtonText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  headerSubtitle: { fontSize: 16, color: '#E8F5E9', textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  petsContainer: { flex: 1, paddingBottom: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 60, marginBottom: 20, textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 5 },
  emptyText: { fontSize: 20, color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center', marginBottom: 10, textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  emptySubtext: { fontSize: 16, color: '#E8F5E9', textAlign: 'center', paddingHorizontal: 40, textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  emptyButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 15, paddingHorizontal: 25, marginTop: 20 },
  emptyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  petCard: {
    marginBottom: 20,
    borderRadius: 20,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15
  },
  boldText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
  },
  normalText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
  },
  listItem: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
    marginLeft: 10,
  },
  petCardGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  petCardContent: {
    flexDirection: 'column'
  },
  petInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    marginBottom: 15
  },
  petImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden'
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  petImagePlaceholder: {
    fontSize: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  petDetails: {
    flex: 1
  },
  petName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  petBreed: {
    fontSize: 18,
    color: '#F1F8E9',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  petMetrics: {
    flexDirection: 'row',
    marginBottom: 5
  },
  petMetric: {
    fontSize: 16,
    color: '#E8F5E9',
    marginRight: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  petActivity: {
    fontSize: 16,
    color: '#E8F5E9',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  petActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  dietButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  actionButtonText: {
    fontSize: 20,
    color: '#FFFFFF'
  },
  modalContainer: { flex: 1 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '90%', borderRadius: 20, overflow: 'hidden' },
  modalGradient: { padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', flex: 1, textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  closeButton: { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  formContainer: { flex: 1 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 16, color: '#FFFFFF', marginBottom: 8, fontWeight: 'bold' },
  textInput: { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 10, padding: 15, color: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  activityContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  activityButton: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 15, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  activityButtonSelected: { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  activityButtonText: { color: '#FFFFFF', fontSize: 14 },
  activityButtonTextSelected: { fontWeight: 'bold' },
  imageButton: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10, height: 150, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  selectedImage: { width: '100%', height: '100%', borderRadius: 10 },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderText: { fontSize: 40, color: '#FFFFFF', marginBottom: 10 },
  imagePlaceholderSubtext: { fontSize: 14, color: '#FFFFFF' },
  buttonContainer: { flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 20 },
  cancelButton: { backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: 10,
    padding: 15, 
    flex: 1, 
    marginRight: 10, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.2)' },
  cancelButtonText: { color: '#FFFFFF', textAlign: 'center', fontSize: 16 },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    flex: 1,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
 },
  saveButtonText: { color: '#FFFFFF', textAlign: 'center', fontSize: 16},
  dietaContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: 10,
    padding: 15, 
    flex: 1, 
    marginRight: 10, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  dietaText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'justify',
    lineHeight: 24,
  },
});

export default GestionMascotas;