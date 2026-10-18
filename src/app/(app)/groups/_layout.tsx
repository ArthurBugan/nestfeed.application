import { Stack } from 'expo-router';

export default function GroupsStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="new" />
      <Stack.Screen
        name="[id]/(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="[id]/edit" />
      <Stack.Screen name="[id]/share" />
      <Stack.Screen name="[id]/add-channel" />
    </Stack>
  );
}