import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="book/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="search" options={{ presentation: 'modal' }} />
      <Stack.Screen name="session/start" options={{ presentation: 'modal' }} />
      <Stack.Screen name="session/timer" options={{ gestureEnabled: false }} />
      <Stack.Screen name="session/external" options={{ gestureEnabled: false }} />
      <Stack.Screen name="session/complete" options={{ gestureEnabled: false }} />
      <Stack.Screen name="session/manual" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
