import * as React from 'react';
import {  StyleSheet, StatusBar } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FlightScreen from './src/screens/FlightScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TripScreen from './src/screens/TripScreen';

// Type for bottom tab navigator
type TabParamList = {
  Flights: undefined;
  Trips: undefined;
  History: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({  color, size }) => {
              let iconName: string;

              switch (route.name) {
                case 'Flights':
                  iconName = 'flight';
                  break;
                case 'Trips':
                  iconName = 'search';
                  break;
                case 'History':
                  iconName = 'history';
                  break;
                case 'Profile':
                  iconName = 'person';
                  break;
                default:
                  iconName = 'help';
                  break;
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#1a73e8',
            tabBarInactiveTintColor: '#5f6368',
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabBarLabel,
          })}>
          <Tab.Screen 
            name="Flights" 
            component={FlightScreen}
            options={{
              tabBarLabel: 'Flights',
            }}
          />
          <Tab.Screen 
            name="Trips" 
            component={TripScreen}
            options={{
              tabBarLabel: 'Trips',
            }}
          />
          <Tab.Screen 
            name="History" 
            component={HistoryScreen}
            options={{
              tabBarLabel: 'History',
            }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Profile',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // Tab Bar Styles
  tabBar: {
    backgroundColor: '#ffffff',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default App;