import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BottomNavbar } from '../../components/BottomNavbar';

const BRAND = 'rgb(49,66,154)';

export default function PagesLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BRAND,
        tabBarInactiveTintColor: '#94A3B8',
      }}
      tabBar={(props) => <BottomNavbar {...props} />}
    >
      <Tabs.Screen
        name="HomePage"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="MessegeOverviewPage"
        options={{
          title: 'Nachrichten',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="betreuungsgruppechat"
        options={{
          title: 'Gruppe',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ProfilePage"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
