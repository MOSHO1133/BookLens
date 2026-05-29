import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import UploadScreen from '../screens/UploadScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BookDetailScreen from '../screens/BookDetailScreen';
import SummaryScreen from '../screens/SummaryScreen';
import ReaderScreen from '../screens/ReaderScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.white,
                    borderTopColor: COLORS.border,
                    borderTopWidth: 0.5,
                    paddingBottom: 5,
                    height: 58,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarLabelStyle: { fontSize: 11, marginBottom: 2 },
                tabBarIcon: ({ focused, color }) => {
                    const icons = {
                        Home: focused ? 'home' : 'home-outline',
                        Library: focused ? 'library' : 'library-outline',
                        Upload: focused ? 'cloud-upload' : 'cloud-upload-outline',
                        Profile: focused ? 'person' : 'person-outline',
                    };
                    return <Ionicons name={icons[route.name]} size={22} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Library" component={LibraryScreen} />
            <Tab.Screen name="Upload" component={UploadScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen name="BookDetail" component={BookDetailScreen} />
                <Stack.Screen name="Summary" component={SummaryScreen} />
                <Stack.Screen name="Reader" component={ReaderScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}