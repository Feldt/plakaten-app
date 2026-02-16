import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register-party" />
      <Stack.Screen name="register-worker" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="pending-approval" />
    </Stack>
  );
}
