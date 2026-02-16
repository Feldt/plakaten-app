import { Stack } from 'expo-router';

export default function TasksLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen
        name="[id]/hanging"
        options={{
          gestureEnabled: false,
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
