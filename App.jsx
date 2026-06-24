import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './Pages/LoginScreen';
import Dashboard from './Pages/Dashboard';

import OrderGuide from './Pages/OrderGuide';

import Profile from './Pages/Profile';

import Catolog from './Pages/Catolog';

import Orders from './Pages/Orders';

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
          }}
        />

        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="OrderGuide"
          component={OrderGuide}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Catolog"
          component={Catolog}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Orders"
          component={Orders}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
