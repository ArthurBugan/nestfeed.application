import { Stack } from 'expo-router';

export default function AnimesStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="edit/[id]" />
      <Stack.Screen name="change-group/[id]" />
    </Stack>
  );
}