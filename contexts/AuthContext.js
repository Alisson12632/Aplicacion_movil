import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { router } from 'expo-router';

const AuthContext = createContext();

const INACTIVITY_LIMIT = 15 * 60 * 1000; 

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});
    const [loading, setLoading] = useState(true);
    const timeoutRef = useRef(null);

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            setAuth({});
            router.replace('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            Alert.alert('Sesión', 'Sesión cerrada por inactividad');
            logout();
        }, INACTIVITY_LIMIT);
    }, []);

    const fetchUserProfile = async (token) => {
        try {
            const res = await fetch('https://tesis-agutierrez-jlincango-aviteri.onrender.com/api/usuario/perfil', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok) throw new Error('Error al obtener perfil');
            const profileData = await res.json();
            return profileData;
        } catch (error) {
            throw error;
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await fetch('https://tesis-agutierrez-jlincango-aviteri.onrender.com/api/usuario/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.msg || 'Credenciales incorrectas');
            }
            await AsyncStorage.setItem('userToken', data.token);
            const profile = await fetchUserProfile(data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(profile));
            setAuth({ ...profile, token: data.token });
            router.replace('/inicio');
            resetTimer();
            return { success: true, userData: profile };
        } catch (error) {
            Alert.alert('Error de login', error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };


    const loadStorageData = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userDataString = await AsyncStorage.getItem('userData');
            if (token && userDataString) {
                const userData = JSON.parse(userDataString);
                setAuth({ ...userData, token });
                resetTimer();
            }
        } catch (error) {
            console.error('Error cargando datos auth:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStorageData();
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <AuthContext.Provider value={{
            auth,
            loading,
            login,
            logout,
            isAuthenticated: !!auth.token,
            resetTimer,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };
