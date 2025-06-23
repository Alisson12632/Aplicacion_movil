import { registerRootComponent } from 'expo';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

function App() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnim1 = useRef(new Animated.Value(0)).current;
  const cardAnim2 = useRef(new Animated.Value(0)).current;
  const cardAnim3 = useRef(new Animated.Value(0)).current;
  const cardAnim4 = useRef(new Animated.Value(0)).current;

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
      Animated.stagger(100, [
        Animated.timing(cardAnim1, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cardAnim2, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cardAnim3, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cardAnim4, {
          toValue: 1,
          duration: 500,
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

    createFloatingAnimation(animalFloat1, 2000, 0).start();
    createFloatingAnimation(animalFloat2, 2500, 500).start();
    createFloatingAnimation(animalFloat3, 3000, 1000).start();
    createFloatingAnimation(animalFloat4, 2200, 1500).start();
    createFloatingAnimation(animalFloat5, 2800, 800).start();
    createFloatingAnimation(animalFloat6, 2400, 1200).start();

    createRotationAnimation(animalRotate1, 4000, 0).start();
    createRotationAnimation(animalRotate2, 5000, 2000).start();
  }, []);

  const handleStartPress = () => {
    router.push('/login');
  };

  const floatInterpolate1 = animalFloat1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const floatInterpolate2 = animalFloat2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const floatInterpolate3 = animalFloat3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const floatInterpolate4 = animalFloat4.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });

  const floatInterpolate5 = animalFloat5.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const floatInterpolate6 = animalFloat6.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -11],
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
    <View style={styles.container}>
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
              { top: '8%', left: '10%' },
              { transform: [{ translateY: floatInterpolate1 }] }
            ]}
          >
            🐕‍🦺
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '12%', right: '8%' },
              { transform: [{ rotate: rotateInterpolate1 }] }
            ]}
          >
            🐕
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '20%', left: '75%' },
              { transform: [{ translateY: floatInterpolate2 }] }
            ]}
          >
            🐶
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '35%', left: '5%' },
              { transform: [{ translateY: floatInterpolate3 }] }
            ]}
          >
            🦮
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '45%', right: '12%' },
              { transform: [{ translateY: floatInterpolate4 }] }
            ]}
          >
            🐕‍🦺
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '60%', left: '15%' },
              { transform: [{ rotate: rotateInterpolate2 }] }
            ]}
          >
            🐾
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '70%', right: '20%' },
              { transform: [{ translateY: floatInterpolate5 }] }
            ]}
          >
            🐶
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '80%', left: '70%' },
              { transform: [{ translateY: floatInterpolate6 }] }
            ]}
          >
            🦴
          </Animated.Text>
          <Animated.Text
            style={[
              styles.bgAnimal,
              { top: '85%', left: '25%' },
              { transform: [{ translateY: floatInterpolate1 }] }
            ]}
          >
            🐕
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
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🐕‍🦺</Text>
            </View>
            <Text style={styles.title}>Tiendanimal</Text>
            <Text style={styles.subtitle}>Alimentación correcta para tus mascotas</Text>
            <Text style={styles.description}>
              Una aplicación diseñada para ayudar a las personas a alimentar correctamente a sus mascotas. 
              Esta herramienta genera dietas personalizadas utilizando inteligencia artificial, basándose en 
              las necesidades específicas de cada perro.
            </Text>
            <Text style={styles.descriptionSecondary}>
              Desde un solo lugar, el usuario puede acceder a funciones prácticas como visualizar productos, 
              gestionar a sus mascotas, controlar los alimentos que prefiere, y recibir recomendaciones alimenticias.
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            <Animated.View
              style={[
                styles.featureCard,
                { opacity: cardAnim1, transform: [{ scale: cardAnim1 }] }
              ]}
            >
              <Text style={styles.featureIcon}>🥘</Text>
              <Text style={styles.featureTitle}>Dietas IA</Text>
              <Text style={styles.featureSubtitle}>Planes personalizados basados en las necesidades específicas</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.featureCard,
                { opacity: cardAnim2, transform: [{ scale: cardAnim2 }] }
              ]}
            >
              <Text style={styles.featureIcon}>🛒</Text>
              <Text style={styles.featureTitle}>Productos</Text>
              <Text style={styles.featureSubtitle}>Visualiza y compra todo lo que necesitas para tu mascota</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.featureCard,
                { opacity: cardAnim3, transform: [{ scale: cardAnim3 }] }
              ]}
            >
              <Text style={styles.featureIcon}>🐕</Text>
              <Text style={styles.featureTitle}>Mascotas</Text>
              <Text style={styles.featureSubtitle}>Gestiona perfiles y controla los alimentos que prefieren</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.featureCard,
                { opacity: cardAnim4, transform: [{ scale: cardAnim4 }] }
              ]}
            >
              <Text style={styles.featureIcon}>💡</Text>
              <Text style={styles.featureTitle}>Consejos</Text>
              <Text style={styles.featureSubtitle}>Recomendaciones alimenticias inteligentes y personalizadas</Text>
            </Animated.View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartPress}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#66BB6A', '#4CAF50', '#43A047']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>🐾 Comenzar Ahora</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
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
    fontSize: 24,
    opacity: 0.15,
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height,
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    minHeight: height,
  },
  header: {
    alignItems: 'center',
    marginBottom: 35,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logoIcon: {
    fontSize: 55,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E9',
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#E8F5E9',
    textAlign: 'center',
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.3,
    paddingHorizontal: 15,
    lineHeight: 20,
    opacity: 0.95,
    marginBottom: 8,
  },
  descriptionSecondary: {
    fontSize: 13,
    color: '#E8F5E9',
    textAlign: 'center',
    fontWeight: '300',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.2,
    paddingHorizontal: 20,
    lineHeight: 18,
    opacity: 0.9,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    marginBottom: 40,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  featureCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 120,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  featureSubtitle: {
    fontSize: 11,
    color: '#E8F5E9',
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.3,
  },
  startButton: {
    borderRadius: 30,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginTop: 10,
  },
  buttonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
});

export default App;
registerRootComponent(App);