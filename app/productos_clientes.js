import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Linking,
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
const API_BASE_URL = 'https://tesis-agutierrez-jlincango-aviteri.onrender.com/api';

const categorias = ['Todos', 'Perros', 'Gatos', 'Aves', 'Peces', 'Otros'];

function ProductosClientes() {
    const [productos, setProductos] = useState([]);
    const [favoritos, setFavoritos] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
    const [textoBusqueda, setTextoBusqueda] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingFavoritos, setLoadingFavoritos] = useState({});

    useEffect(() => {
        loadInitialData();
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

    const loadInitialData = async () => {
        setLoading(true);
        await Promise.all([loadProductos(), loadFavoritos()]);
        setLoading(false);
    };

    const loadProductos = async () => {
        try {
            console.log('Cargando todos los productos...');

            const response = await fetch(`${API_BASE_URL}/public`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Status de respuesta productos:', response.status);
            const responseText = await response.text();
            console.log('Respuesta productos:', responseText);

            if (response.ok) {
                const data = JSON.parse(responseText);
                console.log('Productos recibidos:', data);
                setProductos(Array.isArray(data) ? data : []);
            } else {
                console.error('Error cargando productos:', response.status, responseText);
                Alert.alert('Error', 'No se pudieron cargar los productos');
            }
        } catch (error) {
            console.error('Error cargando productos:', error);
            Alert.alert('Error', 'Error de conexión. Verifica tu internet e intenta nuevamente');
        } finally {
            setRefreshing(false);
        }
    };

    const loadFavoritos = async () => {
        try {
            const token = await getToken();
            if (!token) {
                console.log('No hay token, usuario no autenticado');
                return;
            }

            console.log('Cargando favoritos...');
            const response = await fetch(`${API_BASE_URL}/usuario/favoritos`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Status de respuesta favoritos:', response.status);
            const responseText = await response.text();
            console.log('Respuesta favoritos:', responseText);

            if (response.ok) {
                const data = JSON.parse(responseText);
                console.log('Favoritos recibidos:', data);
                const favoritosIds = Array.isArray(data.favoritos) ? data.favoritos.map(fav => fav._id || fav) : [];
                setFavoritos(favoritosIds);
            } else if (response.status === 401) {
                console.log('Token expirado');
                Alert.alert('Sesión Expirada', 'Por favor inicia sesión nuevamente', [
                    { text: 'OK', onPress: () => router.replace('/login') }
                ]);
            }
        } catch (error) {
            console.error('Error cargando favoritos:', error);
        }
    };

    const toggleFavorito = async (productoId) => {
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('Iniciar Sesión', 'Debes iniciar sesión para agregar productos a favoritos', [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Iniciar Sesión', onPress: () => router.push('/login') }
                ]);
                return;
            }

            setLoadingFavoritos(prev => ({ ...prev, [productoId]: true }));

            const esFavorito = favoritos.includes(productoId);
            const url = esFavorito
                ? `${API_BASE_URL}/usuario/eliminar-favorito/${productoId}`
                : `${API_BASE_URL}/usuario/agregar-favorito/${productoId}`;
            const method = esFavorito ? 'DELETE' : 'POST';

            console.log(`${method} request to:`, url);

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const responseText = await response.text();
            console.log('Favorito response:', response.status, responseText);

            if (response.ok) {
                if (esFavorito) {
                    setFavoritos(prev => prev.filter(id => id !== productoId));
                } else {
                    setFavoritos(prev => [...prev, productoId]);
                }

                const mensaje = esFavorito ? '💔 Eliminado de favoritos' : '❤️ Agregado a favoritos';
                Alert.alert('¡Éxito!', mensaje);
            } else {
                const errorData = JSON.parse(responseText);
                throw new Error(errorData.mensaje || 'Error al actualizar favoritos');
            }
        } catch (error) {
            console.error('Error toggle favorito:', error);
            Alert.alert('Error', error.message || 'No se pudo actualizar el favorito');
        } finally {
            setLoadingFavoritos(prev => ({ ...prev, [productoId]: false }));
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadInitialData();
    };

    const productosFiltrados = productos.filter(producto => {
        const nombre = producto.nombre || '';
        const descripcion = producto.descripcion || '';
        const coincideBusqueda = nombre.toLowerCase().includes(textoBusqueda.toLowerCase()) ||
                                 descripcion.toLowerCase().includes(textoBusqueda.toLowerCase());
        const coincideCategoria = categoriaSeleccionada === 'Todos' 
            || producto.categoria === categoriaSeleccionada
            || (categoriaSeleccionada === 'Favoritos' && favoritos.includes(producto._id));
        return coincideBusqueda && coincideCategoria;
    });

    const goBack = () => router.back();

    const formatearPrecio = (precio) => {
        return `$${precio.toFixed(2)}`;
    };

    const abrirWhatsApp = () => {
        const favoritosInfo = productos
            .filter(producto => favoritos.includes(producto._id))
            .map(producto => `• ${producto.nombre}`)
            .join('\n');

        const mensaje = `Hola 👋, estoy interesado en estos productos:\n\n${favoritosInfo}\n\n¿Hay algo más que quisiera comprar?`;
        const url = `https://wa.me/593958882278?text=${encodeURIComponent(mensaje)}`; //cambiar numero

        Linking.openURL(url).catch(err => console.error('Error al abrir WhatsApp:', err));
    };

    if (loading) {
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
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Cargando productos...</Text>
                </View>
            </SafeAreaView>
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
            <Text style={styles.headerTitle}>Productos</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {productosFiltrados.length > 0
              ? `${productosFiltrados.length} producto${productosFiltrados.length > 1 ? 's' : ''} disponible${productosFiltrados.length > 1 ? 's' : ''}`
              : 'Descubre los mejores productos para tu mascota'}
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={textoBusqueda}
            onChangeText={setTextoBusqueda}
            placeholder="🔍 Buscar productos..."
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScrollView}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categorias.map((categoria) => (
            <TouchableOpacity
              key={categoria}
              style={[
                styles.categoryButton,
                categoriaSeleccionada === categoria && styles.categoryButtonSelected
              ]}
              onPress={() => setCategoriaSeleccionada(categoria)}
            >
              <Text style={[
                styles.categoryButtonText,
                categoriaSeleccionada === categoria && styles.categoryButtonTextSelected
              ]}>
                {categoria === 'Todos' ? '🏪' :
                  categoria === 'Perros' ? '🐕' :
                  categoria === 'Gatos' ? '🐱' :
                  categoria === 'Aves' ? '🐦' :
                  categoria === 'Peces' ? '🐟' : '🐾'} {categoria}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.categoryButton,
              categoriaSeleccionada === 'Favoritos' && styles.categoryButtonSelected
            ]}
            onPress={() => setCategoriaSeleccionada('Favoritos')}
          >
            <Text style={[
              styles.categoryButtonText,
              categoriaSeleccionada === 'Favoritos' && styles.categoryButtonTextSelected
            ]}>
              ❤️ Tus favoritos
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.productsContainer}>
          {productosFiltrados.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>
                {textoBusqueda
                  ? 'No se encontraron productos'
                  : 'No hay productos disponibles'}
              </Text>
              <Text style={styles.emptySubtext}>
                {textoBusqueda
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Prueba con otra categoría o actualiza la página'}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.productsGrid}>
                {productosFiltrados.map((producto, index) => (
                  <View key={producto._id || index} style={styles.productCard}>
                    <LinearGradient
                      colors={['#66BB6A', '#4CAF50', '#43A047']}
                      style={styles.productCardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.productImageContainer}>
                        <Image
                          source={{ uri: producto.imagen }}
                          style={styles.productImage}
                          onError={(error) => console.log('Error cargando imagen producto:', error)}
                        />

                        <TouchableOpacity
                          style={styles.favoriteButton}
                          onPress={() => toggleFavorito(producto._id)}
                          disabled={loadingFavoritos[producto._id]}
                        >
                          {loadingFavoritos[producto._id] ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.favoriteButtonText}>
                              {favoritos.includes(producto._id) ? '❤️' : '🤍'}
                            </Text>
                          )}
                        </TouchableOpacity>

                        {producto.stock <= 5 && (
                          <View style={styles.stockBadge}>
                            <Text style={styles.stockBadgeText}>
                              {producto.stock === 0 ? 'Agotado' : `Últimas ${producto.stock}`}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {producto.nombre}
                        </Text>
                        <Text style={styles.productDescription} >
                          {producto.descripcion}
                    
                        </Text>

                        <View style={styles.productFooter}>
                          <View style={styles.priceContainer}>
                            <Text style={styles.productPrice}>
                              {formatearPrecio(producto.precio)}
                            </Text>
                            <Text style={styles.stockText}>
                              Stock: {producto.stock}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </View>

              {}
            {categoriaSeleccionada === 'Favoritos' && favoritos.length > 0 && (
            <TouchableOpacity style={styles.compraButton} onPress={abrirWhatsApp}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome name="whatsapp" size={20} color="#25D366" style={{ marginRight: 8 }} />
                    <Text style={styles.compraButtonText}>Compra aquí</Text>
                </View>
            </TouchableOpacity>

              )}
            </>
          )}
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    backgroundContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    gradientBackground: {
        flex: 1
    },
    scrollView: {
        flex: 1
    },
    scrollContainer: {
        flexGrow: 1
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2
    },
    header: {
        marginBottom: 20
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)'
    },
    backButtonText: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold'
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        flex: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 6
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#E8F5E9',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3
    },
    searchContainer: {
        marginBottom: 20
    },
    searchInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 15,
        padding: 15,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        fontSize: 16
    },
    categoriesScrollView: {
        marginBottom: 20
    },
    categoriesContainer: {
        paddingRight: 20
    },
    categoryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginRight: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)'
    },
    categoryButtonSelected: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderColor: 'rgba(255, 255, 255, 0.5)'
    },
    categoryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500'
    },
    categoryButtonTextSelected: {
        fontWeight: 'bold'
    },
    productsContainer: {
        flex: 1,
        paddingBottom: 20
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    productCard: {
        width: '48%',
        marginBottom: 20,
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: '#2E7D32'
    },
    productCardGradient: {
        flex: 1,
        borderRadius: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6
    },
    productImageContainer: {
        position: 'relative',
        marginBottom: 10
    },
    productImage: {
        width: '100%',
        height: 120,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    favoriteButtonText: {
        fontSize: 14
    },
    stockBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4
    },
    stockBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold'
    },
    productInfo: {
        flex: 1
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3
    },
    productDescription: {
        fontSize: 12,
        color: '#E8F5E9',
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    priceContainer: {
        flex: 1
    },
    productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3
    },
    stockText: {
        fontSize: 10,
        color: '#E8F5E9',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2
    },
    addToCartButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)'
    },
    addToCartButtonDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    addToCartButtonText: {
        fontSize: 16
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5
    },
    emptyText: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3
    },
    emptySubtext: {
        fontSize: 16,
        color: '#E8F5E9',
        textAlign: 'center',
        paddingHorizontal: 40,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2
    },
    compraButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        alignSelf: 'center',
        marginTop: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 5
    },  
    compraButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2
    }
});

export default ProductosClientes;
