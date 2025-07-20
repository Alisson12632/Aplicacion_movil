import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext.js';
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
const API_BASE_URL = 'https://tesis-agutierrez-jlincango-aviteri.onrender.com/api/';

const categorias = ['Todos', 'Perros', 'Gatos', 'Aves', 'Peces', 'Otros'];

function ProductosClientes() {
  const { darkMode, toggleTheme } = useTheme();
  const [productos, setProductos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingFavoritos, setLoadingFavoritos] = useState({});
  const [cantidadesFavoritos, setCantidadesFavoritos] = useState({});

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
      const response = await fetch(`${API_BASE_URL}/productos/publico`, {
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
        let cantidadesIniciales = {};
        favoritosIds.forEach(id => {
          cantidadesIniciales[id] = 1;
        });
        setCantidadesFavoritos(cantidadesIniciales);

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
          setCantidadesFavoritos(prev => {
            const copy = { ...prev };
            delete copy[productoId];
            return copy;
          });
        } else {
          setFavoritos(prev => [...prev, productoId]);
          setCantidadesFavoritos(prev => ({ ...prev, [productoId]: 1 }));
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

  const cambiarCantidad = (productoId, nuevaCantidad) => {
    const producto = productos.find(p => p._id === productoId);
    const stockDisponible = producto?.stock || 0;

    if (nuevaCantidad < 1) return;

    if (nuevaCantidad > stockDisponible) {
      Alert.alert('❌Stock insuficiente', ` ${stockDisponible} unidades disponibles.`);
      return;
    }

    setCantidadesFavoritos(prev => ({
      ...prev,
      [productoId]: nuevaCantidad,
    }));
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

  const generarIdUnico = () => `${Math.floor(Math.random() * 1000000)}`;

  const reducirStockProducto = async (productoId, nuevoStock) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No autenticado');
      const responseGet = await fetch(`${API_BASE_URL}/producto/detalle/${productoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!responseGet.ok) {
        throw new Error('No se pudo obtener producto');
      }

      const productoCompleto = await responseGet.json();
      const productoActualizado = {
        ...productoCompleto,
        stock: nuevoStock,
      };

      const responsePut = await fetch(`${API_BASE_URL}/producto/actualizar/${productoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productoActualizado),
      });

      if (!responsePut.ok) {
        const errorData = await responsePut.json();
        throw new Error(errorData.mensaje || 'Error actualizando stock');
      }
    } catch (error) {
      console.error('Error actualizando stock de producto:', productoId, error);
      throw error;
    }
  };

  const abrirWhatsApp = async () => {
    const agotados = productos.filter(
      p => favoritos.includes(p._id) && p.stock === 0
    );

    const disponibles = productos.filter(
      p => favoritos.includes(p._id) && p.stock > 0
    );

    if (favoritos.length === 0) {
      Alert.alert('No hay productos seleccionados', 'Agrega productos a favoritos para comprar');
      return;
    }

    if (disponibles.length === 0) {
      Alert.alert(
        'Productos agotados',
        'Todos los productos favoritos están agotados. Agrega otros productos disponibles.'
      );
      return;
    }

    const mensajeProductos = disponibles.map(p => {
      const cantidad = cantidadesFavoritos[p._id] || 1;
      return `- ${p.nombre} x${cantidad}`;
    }).join('\n');

    const pedidoId = `COMPRA-${generarIdUnico()}`;
    const total = disponibles.reduce((sum, p) => {
      const cant = cantidadesFavoritos[p._id] || 1;
      return sum + (p.precio * cant);
    }, 0).toFixed(2);

    const mensaje = `🛒 Pedido Simulado
ID: ${pedidoId}

📦 Productos:
${mensajeProductos}

💰 Total: $${total}

✅ Estoy interesado en esta compra.`;

    const url = `https://wa.me/593958882278?text=${encodeURIComponent(mensaje)}`;

    try {
      for (const producto of disponibles) {
        const cantidad = cantidadesFavoritos[producto._id] || 1;
        const nuevoStock = producto.stock - cantidad;
        if (nuevoStock >= 0) {
          await reducirStockProducto(producto._id, nuevoStock);
        }
      }

      setProductos((prevProductos) =>
        prevProductos.map((prod) => {
          if (favoritos.includes(prod._id)) {
            const cantidad = cantidadesFavoritos[prod._id] || 1;
            const stockActualizado = prod.stock - cantidad;
            return { ...prod, stock: stockActualizado >= 0 ? stockActualizado : 0 };
          }
          return prod;
        })
      );

      if (agotados.length > 0) {
        const nombresAgotados = agotados.map(p => `• ${p.nombre}`).join('\n');
        Alert.alert(
          '⚠️ Productos agotados',
          `Se omitieron del mensaje los siguientes productos por estar agotados:\n\n${nombresAgotados}`,
          [
            {
              text: 'OK',
              onPress: () => {
                Linking.openURL(url).catch(err => {
                  console.error('Error al abrir WhatsApp:', err);
                  Alert.alert('Error', 'No se pudo abrir WhatsApp');
                });
              }
            }
          ]
        );
      } else {
        Linking.openURL(url).catch(err => {
          console.error('Error al abrir WhatsApp:', err);
          Alert.alert('Error', 'No se pudo abrir WhatsApp');
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Error actualizando stock de productos');
      console.error('Error actualizando stock:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.backgroundContainer}>
          <LinearGradient
            colors={
              darkMode
                ? ['#0D1B2A', '#0D1B2A', '#0D1B2A']
                : ['#4CAF50', '#388E3C', '#2E7D32']
            }
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>

        <ScrollView contentContainerStyle={{ padding: 15 }}>
          <ShimmerPlaceHolder
            style={styles.searchShimmer}
            shimmerColors={darkMode ? ['#1B2A40', '#2D4A70', '#1B2A40'] : ['#98e09aa9', '#98e09aa9', '#98e09aa9']}
            autoRun
            duration={1200}
            visible={false}
          />
          <View style={{ flexDirection: 'row', marginVertical: 15 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <ShimmerPlaceHolder
                key={i}
                style={styles.categoryButtonShimmer}
                shimmerColors={darkMode ? ['#1B2A40', '#2D4A70', '#1B2A40'] : ['#98e09aa9', '#98e09aa9', '#98e09aa9']}
                autoRun
                duration={1200}
                visible={false}
              />
            ))}
          </View>
          <View style={styles.shimmerGrid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={styles.shimmerCard}>
                <ShimmerPlaceHolder
                  style={styles.shimmerBox}
                  shimmerStyle={{ borderRadius: 15 }}
                  shimmerColors={darkMode ? ['#1a2c3d', '#1f3a50', '#1a2c3d'] : ['#98e09aa9', '#98e09aa9', '#98e09aa9']}
                  duration={1200}
                  autoRun
                  visible={false}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={
            darkMode
              ? ['#0D1B2A', '#0D1B2A', '#0D1B2A']
              : ['#4CAF50', '#388E3C', '#2E7D32']
          }
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

          <View style={[styles.searchContainer, { position: 'relative' }]}>
            <TextInput
              style={styles.searchInput}
              value={textoBusqueda}
              onChangeText={setTextoBusqueda}
              placeholder="🔍 Buscar productos..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
            />

            {textoBusqueda.length > 0 && (
              <TouchableOpacity
                onPress={() => setTextoBusqueda('')}
                style={{
                  position: 'absolute',
                  right: 20,
                  top: 15,
                  zIndex: 1,
                }}
              >
                <Ionicons name="close-circle" size={22} color="#fff" />
              </TouchableOpacity>
            )}

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
                        colors=
                        {
                          darkMode
                            ? ['#4B80B5', '#2D5A88', '#1A3F66']
                            : ['#66BB6A', '#4CAF50', '#43A047']
                        }
                        style={[
                          styles.productCardGradient,
                          {
                            borderColor: darkMode
                              ? 'rgba(110, 155, 192, 0.47)' 
                              : 'rgba(116, 204, 120, 0.47)'
                          }
                        ]}

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
                          <Text style={styles.productDescription}>
                            {producto.descripcion}
                          </Text>

                          <View style={styles.productFooter}>
                            <Text style={styles.productPrice}>{formatearPrecio(producto.precio)}</Text>

                            <View style={styles.stockCantidadRow}>
                              <Text style={styles.stockText}>Stock: {producto.stock}</Text>

                              {categoriaSeleccionada === 'Favoritos' && favoritos.includes(producto._id) && producto.stock > 0 && (
                                <View style={styles.cantidadContainerMini}>
                                  <TouchableOpacity
                                    onPress={() => cambiarCantidad(producto._id, (cantidadesFavoritos[producto._id] || 1) - 1)}
                                    style={styles.cantidadBotonMini}
                                  >
                                    <Text style={styles.cantidadBotonTextoMini}>➖</Text>
                                  </TouchableOpacity>
                                  <Text style={styles.cantidadTextoMini}>
                                    {cantidadesFavoritos[producto._id] || 1}
                                  </Text>
                                  <TouchableOpacity
                                    onPress={() => cambiarCantidad(producto._id, (cantidadesFavoritos[producto._id] || 1) + 1)}
                                    style={styles.cantidadBotonMini}
                                  >
                                    <Text style={styles.cantidadBotonTextoMini}>➕</Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    </View>
                  ))}
                </View>

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
    borderColor: 'rgba(255, 255, 255, 0.2)',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
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
    justifyContent: 'space-between',
    paddingBottom: 10
  },
  productCard: {
    width: '48%',
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden'
  },
  productCardGradient: {
    flex: 1,
    borderRadius: 15,
    padding: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
    flex: 1,
    position: 'relative'
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
    marginTop: 5
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
  cantidadContainer: {
    marginTop: 6,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2
  },
  cantidadButton: {
    paddingHorizontal: 4,
    paddingVertical: 1
  },
  cantidadButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold'
  },
  cantidadTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginHorizontal: 4
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
    backgroundColor: 'rgb(255, 255, 255)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(58, 165, 32, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5
  },
  compraButtonText: {
    color: '#25D366',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
  },
  stockCantidadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },

  cantidadContainerMini: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2
  },

  cantidadBotonMini: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    marginHorizontal: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)'
  },

  cantidadBotonTextoMini: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },

  cantidadTextoMini: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 4
  },
  searchShimmer: {
    height: 40,
    borderRadius: 20,
    marginBottom: 10,
    width: '100%',
  },

  categoryButtonShimmer: {
    width: 80,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },

  shimmerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  shimmerCard: {
    width: '48%',
    marginBottom: 20,
  },

  shimmerBox: {
    width: '100%',
    height: 220,
    borderRadius: 15,
  },
});

export default ProductosClientes;
