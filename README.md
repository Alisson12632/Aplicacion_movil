
# 📱 Desarrollo de sistema de gestión de productos para tiendas de mascotas con recomendación de dietas saludables mediante inteligencia artificial

Aplicación móvil desarrollada con React Native y Expo permite a los usuarios clientes administrar el perfil de sus mascotas, acceder a productos clasificados por categorías y recibir recomendaciones personalizadas de dietas generadas mediante inteligencia artificial 🤖🍽️. 

## 📖 Manual de instalación

Para instalar correctamente el sistema y ejecutarlo en un entorno de desarrollo local, se deben seguir los siguientes pasos:

**1. Clonar el repositorio**

```bash
  git clone https://github.com/Alisson12632/Aplicacion_movil.git
  cd "nombre_del_repositorio"
```
**2. Instalar las dependencias**
```bash
  npm install
```
Esto descargará todas las librerías necesarias, como:

`expo-image-picker` para acceder a cámara o galería.

`@react-navigation/native` para la navegación entre pantallas.

`react-native-markdown-display` para mostrar la dieta en formato visual.

`@expo/vector-icons, expo-linear-gradient` y otras para diseño.

> [!CAUTION]
> Si aparecen errores al instalar, ejecutar los siguientes comandos para limpiar el entorno:
> ```bash
>  rm -rf node_modules
>  rm package-lock.json
>  npm install
> ```
**3. Iniciar el proyecto**
```bash
  npx expo start
```
Esto abrirá Metro Bundler, desde ahí se puede: 
* Escanear el código QR con la app Expo Go (en Android)
* Ejecutar el proyecto en un emulador.
> [!NOTE]
> Si se desea usar Expo directamente desde consola, se puede instalar globalmente:
> ```bash
>  npm install -g expo-cli
> ```
## 🧾 Proceso de ejecución del componente
Para ejecutar correctamente el sistema, es necesario lo siguiente:

**1. Instalar Node.js y npm**

    Descargar desde https://nodejs.org/.
    
**2. Clonar el repositorio y acceder a la carpeta**


**3. Instala todas las dependencias del proyecto**

```bash
  npm install
```
**4. Inicia el servidor con Expo**
```bash
  npx expo start
```
Escanear el código QR con Expo Go desde un celular o ejecutar el proyecto en un emulador.
> [!NOTE]
> En el caso de que se use un emulador este debe estar abierto antes de ejecutar el proyecto.

> [!IMPORTANT]
> Esta aplicación se conecta con un backend ya desplegado para obtener información y generar dietas con IA. Por lo tanto, requiere conexión a internet.

> [!WARNING]
> Si se modifican versiones de librerías sin verificar compatibilidad, pueden generarse errores. Verificar primero el archivo `package.json`.

## 🔗 Links
[![Funcionalidad](https://img.shields.io/badge/Funcionalidad-red?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/)

## Author

- [@Alisson12632](https://github.com/Alisson12632)



















    
