import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* หน้าแรก (Welcome หรือ Index) */}
        <Stack.Screen name="index" /> 
        
        {/* หน้า Login และ Register */}
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />

        {/* 📌 ต้องเพิ่มบรรทัดนี้เพื่อให้รู้จักโฟลเดอร์ (tabs) */}
        <Stack.Screen name="(tabs)" /> 
      </Stack>
    </GestureHandlerRootView>
  );
}