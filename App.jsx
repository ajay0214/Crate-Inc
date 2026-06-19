import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from './Pages/LoginScreen';
import Dashboard from './Pages/Dashboard';

import CategoryList from './Pages/CategoryList';

import Profile from './Pages/Profile';

import CartScreen from './Pages/CartScreen';









const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="LoginScreen">
                <Stack.Screen
                    name="LoginScreen"
                    component={LoginScreen}
                    options={{
                        headerShown: false,
                    }} />


                <Stack.Screen
                    name="Dashboard"
                    component={Dashboard}
                    options={{
                        headerShown: false,
                    }} />


                <Stack.Screen
                    name="CategoryList"
                    component={CategoryList}
                    options={{
                        headerShown: false,
                    }} />


                <Stack.Screen
                    name="Profile"
                    component={Profile}
                    options={{
                        headerShown: false,
                    }} />


                <Stack.Screen
                    name="CartScreen"
                    component={CartScreen}
                    options={{
                        headerShown: false,
                    }} />








            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
