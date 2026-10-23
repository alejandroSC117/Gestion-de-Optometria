import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ClinicProvider } from '@/context/ClinicContext';
import { AuthProvider } from '@/context/AuthContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { ProfessionalProfileProvider } from '@/context/ProfessionalProfileContext';
import { SupportProvider } from '@/context/SupportContext';
import { ClerkLoaded, ClerkProvider, useAuth as useClerkAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const expoPublicDomain = process.env.EXPO_PUBLIC_DOMAIN;
if (expoPublicDomain) setBaseUrl(`https://${expoPublicDomain}`);

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
const clerkProxyUrl = process.env.EXPO_PUBLIC_CLERK_PROXY_URL || undefined;

function ApiAuthTokenBridge() {
  const { getToken } = useClerkAuth();
  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);
  return null;
}

function RootLayoutNav() {
  return (
    <Stack initialRouteName="welcome" screenOptions={{ headerBackTitle: 'Atrás', headerShown: false }}>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="plans" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="calculators" options={{ headerShown: false }} />
      <Stack.Screen name="nexus-ai" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="professional-profile" options={{ headerShown: false }} />
      <Stack.Screen name="clinical-history" options={{ headerShown: false }} />
      <Stack.Screen name="support" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache} proxyUrl={clerkProxyUrl}>
      <ClerkLoaded>
        <ApiAuthTokenBridge />
        <SafeAreaProvider>
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <SubscriptionProvider>
                  <ProfessionalProfileProvider>
                    <SupportProvider>
                      <ClinicProvider>
                        <GestureHandlerRootView style={{ flex: 1 }}>
                          <KeyboardProvider>
                            <RootLayoutNav />
                          </KeyboardProvider>
                        </GestureHandlerRootView>
                      </ClinicProvider>
                    </SupportProvider>
                  </ProfessionalProfileProvider>
                </SubscriptionProvider>
              </AuthProvider>
            </QueryClientProvider>
          </ErrorBoundary>
        </SafeAreaProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
