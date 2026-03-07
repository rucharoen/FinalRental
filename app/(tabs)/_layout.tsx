import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#95A5A6',
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'หน้าแรก',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'storefront' : 'storefront-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: 'แชท',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'โปรไฟล์',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* ซ่อนหน้าจอที่ไม่ต้องแสดงใน Tab Bar */}
      <Tabs.Screen name="products" options={{ href: null }} />
      <Tabs.Screen name="products/index" options={{ href: null }} />
      {/* ซ่อนหน้าจอและซ่อน Tab Bar เมื่ออยู่ที่หน้านี้ */}
      <Tabs.Screen
        name="products/[id]"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }
        }}
      />

      <Tabs.Screen name="products/create" options={{ href: null }} />
      <Tabs.Screen name="products/edit" options={{ href: null }} />
      <Tabs.Screen name="products/edit/[id]" options={{ href: null }} />
      <Tabs.Screen name="products/edit/index" options={{ href: null }} />
      <Tabs.Screen name="bookings" options={{ href: null }} />
      <Tabs.Screen name="bookings/index" options={{ href: null }} />
      <Tabs.Screen name="bookings/[id]" options={{ href: null }} />
      <Tabs.Screen name="wallet" options={{ href: null }} />
      <Tabs.Screen name="wallet/index" options={{ href: null }} />
      <Tabs.Screen name="wallet/history" options={{ href: null }} />
      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen
        name="chat/[chatId]"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }
        }}
      />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="cart" options={{ href: null }} />
      <Tabs.Screen
        name="cart/index"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }
        }}
      />
      <Tabs.Screen
        name="checkout/index"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }
        }}
      />
      <Tabs.Screen name="profile/rules" options={{ href: null }} />
      <Tabs.Screen name="profile/bookings" options={{ href: null }} />
      <Tabs.Screen name="profile/kyc" options={{ href: null }} />
      <Tabs.Screen name="profile/shop" options={{ href: null }} />
      <Tabs.Screen name="profile/shop/rentals" options={{ href: null }} />
      <Tabs.Screen name="profile/shop/damage-report" options={{ href: null }} />
      <Tabs.Screen name="profile/address" options={{ href: null }} />


    </Tabs>
  );
}
