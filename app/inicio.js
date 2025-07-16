import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

function Inicio() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim1 = useRef(new Animated.Value(0)).current;
  const cardAnim2 = useRef(new Animated.Value(0)).current;
  const cardAnim3 = useRef(new Animated.Value(0)).current;

  const loadUserData = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUserData(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );


  const startAnimations = useCallback(() => {
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
    ]).start();

    Animated.stagger(150, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim1, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim2, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim3, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, headerAnim, cardAnim1, cardAnim2, cardAnim3]);

  useEffect(() => {
    startAnimations();
  }, [startAnimations]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      '🚪 Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userData');
              router.replace('/login');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            }
          },
        },
      ]
    );
  }, []);

  const navigateToProfile = useCallback(() => {
    router.push('/modificar_perfil');
  }, []);

  const navigateToProducts = useCallback(() => {
    router.push('/productos_clientes');
  }, []);

  const navigateToPets = useCallback(() => {
    router.push('/gestion_mascotas');
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#4CAF50', '#388E3C', '#2E7D32']}
          style={styles.gradientBackground}
        >
          <Text style={styles.loadingText}>🐾 Cargando...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['#4CAF50', '#388E3C', '#2E7D32']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
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
          <Animated.View
            style={[
              styles.header,
              { opacity: headerAnim, transform: [{ scale: headerAnim }] }
            ]}
          >
            <View style={styles.headerTop}>
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>¡Bienvenido/a!</Text>
                <Text style={styles.userNameText}>
                  {userData ? `${userData.nombre} ${userData.apellido}` : 'Usuario'}
                </Text>
              </View>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>🚪</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🐾</Text>
              <Text style={styles.appTitle}>TiendAnimal</Text>
              <Text style={styles.appSubtitle}>Tu mundo de mascotas</Text>
            </View>
          </Animated.View>

          <View style={styles.menuContainer}>
            <Animated.View
              style={[
                styles.menuItemContainer,
                { opacity: cardAnim1, transform: [{ scale: cardAnim1 }] }
              ]}
            >
              <TouchableOpacity
                style={styles.menuCard}
                onPress={navigateToProfile}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#81C784', '#66BB6A', '#4CAF50']}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.cardIconContainer}>
                    <Text style={styles.cardIcon}>👤</Text>
                  </View>
                  <Text style={styles.cardTitle}>Modificar Perfil</Text>
                  <Text style={styles.cardSubtitle}>Actualiza tu información personal</Text>
                  <View style={styles.cardArrow}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                styles.menuItemContainer,
                { opacity: cardAnim2, transform: [{ scale: cardAnim2 }] }
              ]}
            >
              <TouchableOpacity
                style={styles.menuCard}
                onPress={navigateToProducts}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#81C784', '#66BB6A', '#4CAF50']}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.cardIconContainer}>
                    <Text style={styles.cardIcon}>🛍️</Text>
                  </View>
                  <Text style={styles.cardTitle}>Productos & Favoritos</Text>
                  <Text style={styles.cardSubtitle}>Explora productos para tu mascota</Text>
                  <View style={styles.cardArrow}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                styles.menuItemContainer,
                { opacity: cardAnim3, transform: [{ scale: cardAnim3 }] }
              ]}
            >
              <TouchableOpacity
                style={styles.menuCard}
                onPress={navigateToPets}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#81C784', '#66BB6A', '#4CAF50']}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.cardIconContainer}>
                    <Text style={styles.cardIcon}>🐕</Text>
                  </View>
                  <Text style={styles.cardTitle}>Mascotas</Text>
                  <Text style={styles.cardSubtitle}>Administra la info de tus mascotas</Text>
                  <View style={styles.cardArrow}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>🌟 ¡Cuida a tus mascotas con amor! 🌟</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  userNameText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoutText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoIcon: {
    fontSize: 48,
    color: '#FFFFFF',
  },
  appTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  appSubtitle: {
    fontSize: 15,
    color: '#C8E6C9',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  menuItemContainer: {
    marginBottom: 18,
  },
  menuCard: {
    borderRadius: 16,
    backgroundColor: '#33691E',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
    minHeight: 110,
  },
  cardIconContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 13.5,
    color: '#D0F8CE',
    lineHeight: 19,
  },
  cardArrow: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -15 }],
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#B2DFDB',
    fontWeight: '500',
    textAlign: 'center',
  },
});


export default Inicio;
