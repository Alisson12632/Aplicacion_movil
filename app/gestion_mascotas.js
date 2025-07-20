import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext.js';
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
  const { darkMode, toggleTheme } = useTheme();
  const [mascotas, setMascotas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDietModal, setShowDietModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [presupuesto, setPresupuesto] = useState('');
  const [dieta, setDieta] = useState(null);
  const [formError, setFormError] = useState(null);
  const [dietasPorMascota, setDietasPorMascota] = useState({});
  const [showVerDietaModal, setShowVerDietaModal] = useState(false);
  const [fechasDietaPorMascota, setFechasDietaPorMascota] = useState({});
  const [petForm, setPetForm] = useState({
    nombre: '',
    raza: '',
    edad: '',
    actividad: 'Normal',
    peso: '',
    imagen: null,
    enfermedades: '',
  });
  useEffect(() => {
    loadMascotas();
  }, []);


  useEffect(() => {
    if (mascotas.length > 0) {
      loadFechasYDietasGuardadas();
    }
  }, [mascotas]);


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
        Alert.alert('❌Error', 'Sesión expirada. Por favor inicia sesión nuevamente', [
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
          Alert.alert('❌Error', 'Sesión expirada. Por favor inicia sesión nuevamente', [
            { text: 'OK', onPress: () => router.replace('/login') }
          ]);
        } else {
          Alert.alert('❌Error', 'No se pudieron cargar las mascotas');
        }
      }
    } catch (error) {
      console.error('❌Error cargando mascotas:', error);
      Alert.alert('❌Error', 'Error de conexión. Verifica tu internet e intenta nuevamente');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMascotas();
  };

  const deleteMascota = async (mascotaId) => {
    Alert.alert('Eliminar Mascota', '¿Estás seguro de que deseas eliminar esta mascota? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            if (!token) {
              Alert.alert('❌Error', 'Sesión expirada. Por favor inicia sesión nuevamente');
              return;
            }

            console.log('Eliminando mascota:', mascotaId);
            const response = await fetch(`${API_BASE_URL}/eliminar/${mascotaId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            });

            const responseText = await response.text();
            console.log('Delete response:', response.status, responseText);

            if (response.ok) {
              Alert.alert('✅Éxito', 'Mascota eliminada correctamente');
              loadMascotas();
            } else {
              const errorData = JSON.parse(responseText);
              throw new Error(errorData.mensaje || 'Error al eliminar mascota');
            }
          } catch (error) {
            console.error('❌Error eliminando mascota:', error);
            Alert.alert('❌Error', error.message || 'No se pudo eliminar la mascota');
          }
        }
      }
    ]);
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

  const showError = (mensaje) => {
    setFormError(mensaje);
    setTimeout(() => setFormError(null), 2000);  
  };

  const saveMascota = async () => {
    setFormError(null);

    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    const soloLetrasYComas = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s,]+$/;

    // Validar nombre
    if (!petForm.nombre.trim()) {
      showError('Por favor ingresa el nombre de la mascota.');
      return;
    }
    if (!soloLetras.test(petForm.nombre.trim())) {
      showError('El nombre solo debe contener letras y espacios.');
      return;
    }

    // Validar raza
    if (!petForm.raza.trim()) {
      showError('Por favor ingresa la raza de la mascota.');
      return;
    }
    if (!soloLetras.test(petForm.raza.trim())) {
      showError('La raza solo debe contener letras y espacios.');
      return;
    }

    // Validar edad
    if (!petForm.edad.trim()) {
      showError('Por favor ingresa la edad de la mascota.');
      return;
    }
    const edad = parseInt(petForm.edad);
    if (isNaN(edad) || edad <= 0 || edad > 30) {
      showError('La edad debe ser un número entero entre 1 y 30.');
      return;
    }

    // Validar peso
    if (!petForm.peso.trim()) {
      showError('Por favor ingresa el peso de la mascota.');
      return;
    }
    const peso = parseFloat(petForm.peso);
    if (isNaN(peso) || peso <= 0 || peso > 100) {
      showError('El peso debe ser un número válido entre 1 y 100 kg.');
      return;
    }

    // Validar enfermedades 
    if (petForm.enfermedades.trim() && !soloLetrasYComas.test(petForm.enfermedades.trim())) {
      showError('El campo enfermedades solo debe contener letras, comas y espacios.');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        showError('Sesión expirada. Por favor inicia sesión nuevamente.');
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

      const url = editingPet
        ? `${API_BASE_URL}/actualizar/${editingPet._id}`
        : `${API_BASE_URL}/registro`;
      const method = editingPet ? 'PUT' : 'POST';

      console.log(`${method} request to:`, url);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const responseText = await response.text();
      console.log('Save response:', response.status, responseText);

      if (response.ok) {
        setFormError(null);
        Alert.alert(
          '✅ Éxito',
          editingPet ? 'Mascota actualizada correctamente' : '🐾 Mascota registrada correctamente',
          [{ text: 'OK', onPress: () => { closeModal(); loadMascotas(); } }]
        );
      } else {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.mensaje || 'Error al guardar mascota');
      }
    } catch (error) {
      console.error('Error guardando mascota:', error);
      setFormError(error.message || 'No se pudo guardar la mascota');
    }
  };


  const disponibilidaDieta = (mascotaId) => {
    if (!fechasDietaPorMascota[mascotaId]) return true;
    const ahora = new Date();
    const ultimaFecha = new Date(fechasDietaPorMascota[mascotaId]);
    const diferenciaDias = Math.floor((ahora - ultimaFecha) / (1000 * 60 * 60 * 24));
    return diferenciaDias >= 7;
  };

  const generarDieta = async (mascotaId) => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente');
        return;
      }

      if (!presupuesto || isNaN(presupuesto) || presupuesto < 1 || presupuesto > 100) {
        Alert.alert('Error', '❌ Por favor ingresa un presupuesto válido entre 1 y 100');
        return;
      }

      if (!disponibilidaDieta(mascotaId)) {
        Alert.alert('Advertencia', 'Solo puedes generar una dieta cada 7 días para esta mascota.');
        return;
      }

      let presupuestoCategoria = '';
      const presupuestoNumero = Number(presupuesto);

      if (presupuestoNumero <= 33) {
        presupuestoCategoria = 'Bajo';
      } else if (presupuestoNumero <= 66) {
        presupuestoCategoria = 'Medio';
      } else {
        presupuestoCategoria = 'Alto';
      }

      const response = await fetch(`${API_BASE_URL}/generar-dieta/${mascotaId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ presupuesto: presupuestoCategoria }),
      });

      const responseText = await response.text();
      console.log('Generate Diet response:', response.status, responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);

        setDietasPorMascota(prev => ({ ...prev, [mascotaId]: data.dieta }));
        setDieta(data.dieta);

        const fechaActual = new Date().toISOString();
        setFechasDietaPorMascota(prev => ({ ...prev, [mascotaId]: fechaActual }));

        await AsyncStorage.setItem(`dieta_${mascotaId}`, data.dieta);
        await AsyncStorage.setItem(`fechaDieta_${mascotaId}`, fechaActual);
        setShowDietModal(false);
        setTimeout(() => {
          setShowVerDietaModal(true);
        }, 500);

      } else {
        const errorData = JSON.parse(responseText);
        if (response.status === 429) {
          Alert.alert('⚠️ Espera requerida', errorData.msg);
        } else if (response.status === 400) {
          Alert.alert('Presupuesto inválido', errorData.msg);
        } else if (response.status === 403) {
          Alert.alert('Sin permisos', errorData.msg);
        } else {
          Alert.alert('Error', errorData.msg || 'No se pudo generar la dieta');
        }
      }
    } catch (error) {
      console.error('Error generando dieta:', error);
      Alert.alert('Error', error.message || 'No se pudo generar la dieta');
    }
  };

  const loadFechasYDietasGuardadas = async () => {
    try {
      const nuevasFechas = {};
      const nuevasDietas = {};

      for (const mascota of mascotas) {
        const id = mascota._id;
        const fecha = await AsyncStorage.getItem(`fechaDieta_${id}`);
        const dieta = await AsyncStorage.getItem(`dieta_${id}`);

        if (fecha) nuevasFechas[id] = fecha;
        if (dieta) nuevasDietas[id] = dieta;
      }

      setFechasDietaPorMascota(nuevasFechas);
      setDietasPorMascota(nuevasDietas);
    } catch (error) {
      console.error('❌ Error cargando fechas o dietas guardadas:', error);
    }
  };


  const openVerDietaModal = (mascotaId) => {
    setEditingPet(mascotaId);
    setShowVerDietaModal(true);
  };

  const closeVerDietaModal = () => {
    setShowVerDietaModal(false);
    setEditingPet(null);
    setShowDietModal(false);
  };

  const openModal = (mascota = null) => {
    setFormError(null);
    setEditingPet(mascota);
    setPetForm(
      mascota
        ? {
          nombre: mascota.nombre || '',
          raza: mascota.raza || '',
          edad: mascota.edad?.toString() || '',
          actividad: mascota.actividad || 'Normal',
          peso: mascota.peso?.toString() || '',
          imagen: null,
          enfermedades: mascota.enfermedades || '',
        }
        : {
          nombre: '',
          raza: '',
          edad: '',
          actividad: 'Normal',
          peso: '',
          imagen: null,
          enfermedades: '',
        }
    );
    setShowModal(true);
  };

  const openDietModal = (mascotaId) => {
    setEditingPet(mascotaId);
    setShowDietModal(true);
  };

  const renderDietaText = (text) => {
    if (!text) return null;

    return text.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <Text key={index} style={styles.boldText}>
            {line.replace(/\*\*/g, '')}
          </Text>
        );
      } else if (line.startsWith('* ') && !line.startsWith('* *')) {
        return (
          <Text key={index} style={styles.listItem}>
            • {line.substring(2)}
          </Text>
        );
      } else {
        return (
          <Text key={index} style={styles.normalText}>
            {line}
          </Text>
        );
      }
    });
  };

  const closeModal = () => {
    setFormError(null);
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
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.backgroundContainer}>
        <LinearGradient colors={
          darkMode
            ? ['#0D1B2A', '#0D1B2A', '#0D1B2A']
            : ['#4CAF50', '#388E3C', '#2E7D32']
        } style={styles.gradientBackground} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
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
              <Text style={styles.headerTitle}>Mascotas</Text>
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
                  <LinearGradient colors={
                    darkMode
                      ? ['#2A5C91', '#1F4E78', '#173B5C']
                      : ['#66BB6A', '#4CAF50', '#43A047']
                  }
                    style={styles.petCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            {formError && (
              <View style={styles.messageError}>
                <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                  {formError}
                </Text>
              </View>
            )}
            <View style={styles.modalContent}>
              <LinearGradient
                colors={
                  darkMode
                    ? ['#3A6EA5', '#2A5691', '#1F3B66']
                    : ['#66BB6A', '#4CAF50', '#43A047']
                }
                style={styles.modalGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {editingPet ? '✏️ Editar Mascota' : '➕ Agregar Mascota'}
                    </Text>
                    <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>🏷️ Nombre *</Text>
                      <TextInput
                        style={styles.textInput}
                        value={petForm.nombre}
                        onChangeText={(text) => setPetForm(prev => ({ ...prev, nombre: text }))}
                        placeholder="Ej: Firulais, Max, Luna..."
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>🐕 Raza *</Text>
                      <TextInput
                        style={styles.textInput}
                        value={petForm.raza}
                        onChangeText={(text) => setPetForm(prev => ({ ...prev, raza: text }))}
                        placeholder="Ej: Labrador, Pastor Aleman, Mestizo..."
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>📅 Edad (años) *</Text>
                      <TextInput
                        style={styles.textInput}
                        value={petForm.edad}
                        onChangeText={(text) => setPetForm(prev => ({ ...prev, edad: text }))}
                        placeholder="Ej: 3"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>⚖️ Peso (kg) *</Text>
                      <TextInput
                        style={styles.textInput}
                        value={petForm.peso}
                        onChangeText={(text) => setPetForm(prev => ({ ...prev, peso: text }))}
                        placeholder="Ej: 25.5"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>🏃 Nivel de Actividad</Text>
                      <View style={styles.activityContainer}>
                        {activityLevels.map((nivel) => (
                          <TouchableOpacity
                            key={nivel}
                            style={[styles.activityButton, petForm.actividad === nivel && styles.activityButtonSelected]}
                            onPress={() => setPetForm(prev => ({ ...prev, actividad: nivel }))}
                          >
                            <Text style={[styles.activityButtonText, petForm.actividad === nivel && styles.activityButtonTextSelected]}>{nivel}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>💊 Enfermedades</Text>
                      <TextInput
                        style={styles.textInput}
                        value={petForm.enfermedades}
                        onChangeText={(text) => setPetForm(prev => ({ ...prev, enfermedades: text }))}
                        placeholder="Ej: Diabetes, Alergias..."
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      />
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
                      <TouchableOpacity
                        style={[
                          styles.cancelButton,
                          {
                            backgroundColor: darkMode
                              ? 'rgba(66, 140, 215, 1)'  
                              : 'rgba(255, 255, 255, 0.1)',
                            borderColor: darkMode
                              ? 'rgba(66, 140, 215, 1)'
                              : 'rgba(255, 255, 255, 0)',
                          }
                        ]}
                        onPress={closeModal}
                      >
                        <Text
                          style={[
                            styles.cancelButtonText,
                            {
                              color: darkMode ? '#E0E0E0' : '#E0E0E0'  
                            }
                          ]}
                        >
                          Cancelar
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.saveButton,
                          {
                            backgroundColor: darkMode ? '#428cd7ff' : '#5bab5fff'
                          }
                        ]}
                        onPress={saveMascota}
                      >
                        <Text
                          style={[
                            styles.saveButtonText,
                            {
                              color: darkMode ? '#E0F2F1' : '#f5f2f2ff'
                            }
                          ]}
                        >
                          {editingPet ? '✏️ Actualizar' : '💾 Guardar'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </LinearGradient>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        visible={showDietModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDietModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors=
                {
                  darkMode
                    ? ['#4B80B5', '#2D5A88', '#1A3F66']
                    : ['#66BB6A', '#4CAF50', '#43A047']
                }
                style={styles.modalGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
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
                      <TouchableOpacity
                        style={[
                          styles.cancelButton,
                          {
                            backgroundColor: darkMode
                              ? 'rgba(14, 159, 237, 1)'
                              : '#388E3C',
                            borderColor: darkMode
                              ? 'rgba(66, 140, 215, 1)'
                              : '#388E3C'
                          }
                        ]}
                        onPress={closeModal}
                      >
                        <Text
                          style={[
                            styles.cancelButtonText,
                            { color: darkMode ? '#E0F2F1' : '#E0F2F1' }
                          ]}
                        >
                          Cancelar
                        </Text>
                      </TouchableOpacity>


                      <TouchableOpacity
                        style={[
                          styles.saveButton,
                          {
                            backgroundColor: darkMode ? '#0e9fedff' : '#388E3C',
                            borderColor: darkMode ? '#428cd7ff' : '#388E3C',
                            opacity: !disponibilidaDieta(editingPet) ? 0.5 : 1,
                          }
                        ]}
                        onPress={() => generarDieta(editingPet)}
                        disabled={!disponibilidaDieta(editingPet)}
                      >
                        <Text
                          style={[
                            styles.saveButtonText,
                            { color: '#E0F2F1' } 
                          ]}
                        >
                          Generar Dieta
                        </Text>
                      </TouchableOpacity>

                    </View>

                    {!disponibilidaDieta(editingPet) && (
                      <Text style={{ color: 'yellow', marginTop: 15, textAlign: 'center', fontWeight: 'bold' }}>
                        Solo puedes generar una dieta cada 7 días para esta mascota.
                      </Text>
                    )}

                    {/* Guardar dieta */}
                    {dietasPorMascota[editingPet] && (
                      <TouchableOpacity
                        style={[
                          styles.saveButton,
                          {
                            marginTop: 20,
                            backgroundColor: darkMode ? '#0e9fedff' : '#388E3C',
                            borderColor: darkMode ? '#428cd7ff' : '#388E3C',
                          }
                        ]}
                        onPress={() => {
                          setDieta(dietasPorMascota[editingPet]);
                          setShowVerDietaModal(true);
                        }}
                      >
                        <Text
                          style={[
                            styles.saveButtonText,
                            { color: '#E0F2F1' } 
                          ]}
                        >
                          Ver Dieta Guardada
                        </Text>
                      </TouchableOpacity>

                    )}
                  </View>
                </ScrollView>
              </LinearGradient>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/*Mostrar dieta*/}
      <Modal
        visible={showVerDietaModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeVerDietaModal}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors=
                {
                  darkMode
                    ? ['#559ce2ff', '#0d5194ff', '#1A3F66']
                    : ['#66BB6A', '#4CAF50', '#43A047']
                }
                style={styles.modalGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Dieta Personalizada asistida por IA</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={closeVerDietaModal}>
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formContainer}>
                    {dieta ? (
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
                    ) : (
                      <Text style={{ color: 'white', textAlign: 'center' }}>
                        No hay dieta disponible para esta mascota.
                      </Text>
                    )}

                    <View style={styles.buttonContainer}>
                      <TouchableOpacity style={styles.saveButton} onPress={closeVerDietaModal}>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  cancelButton: {
    borderRadius: 10,
    padding: 15,
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
  },
  cancelButtonText: { color: '#FFFFFF', textAlign: 'center', fontSize: 16 },
  saveButton: {
    borderRadius: 10,
    padding: 15,
    flex: 1,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)'
  },
  saveButtonText: { color: '#FFFFFF', textAlign: 'center', fontSize: 16 },
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
  verDietaButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'flex-start',
  },

  verDietaButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  messageError: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.95)',
    borderWidth: 2,
    borderColor: '#F44336',
    borderRadius: 17,
    padding: 10,
    zIndex: 1000,
  }
});

export default GestionMascotas;