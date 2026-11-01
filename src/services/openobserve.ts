import { useEffect, useRef } from 'react';
import { usePathname } from 'expo-router';
import {
  OpenObserveProviderConfiguration,
  PropagatorType,
  TrackingConsent,
  SdkVerbosity,
  BatchSize,
  UploadFrequency,
  O2Rum,
} from '@openobserve/mobile-react-native';
import Constants from 'expo-constants';

// OpenObserve RUM credentials come from Data → Data Sources → Real User
// Monitoring in the OpenObserve UI. When any of them is missing the app runs
// without the provider, so dev/test environments never touch the native SDK.
const CLIENT_TOKEN = process.env.EXPO_PUBLIC_O2_CLIENT_TOKEN ?? '';
const APPLICATION_ID = process.env.EXPO_PUBLIC_O2_APPLICATION_ID ?? '';
const OPENOBSERVE_ENDPOINT = process.env.EXPO_PUBLIC_O2_ENDPOINT ?? '';

export const isOpenObserveConfigured = () =>
  Boolean(CLIENT_TOKEN && APPLICATION_ID && OPENOBSERVE_ENDPOINT);

// First-party host (for W3C tracecontext propagation) is derived from the
// Groupify API base URL so tap → API request → backend stays one trace.
function getFirstPartyHosts() {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_GROUPIFY_API_URL || '';
    if (!apiUrl) return [];
    const url = new URL(apiUrl);
    if (!url.hostname) return [];
    return [
      {
        match: url.hostname,
        propagatorTypes: [PropagatorType.TRACECONTEXT],
      },
    ];
  } catch {
    return [];
  }
}

let cachedConfig: OpenObserveProviderConfiguration | null | undefined;

/**
 * Builds (and caches) the provider configuration once. Returns null when
 * credentials are absent so the caller can render the tree without RUM.
 */
export function getOpenObserveConfig(): OpenObserveProviderConfiguration | null {
  if (cachedConfig !== undefined) return cachedConfig;
  if (!isOpenObserveConfigured()) {
    console.warn('[openobserve] missing EXPO_PUBLIC_O2_* credentials — RUM disabled');
    cachedConfig = null;
    return cachedConfig;
  }

  const config = new OpenObserveProviderConfiguration(
    CLIENT_TOKEN,
    __DEV__ ? 'development' : 'production',
    TrackingConsent.GRANTED,
    {
      batchSize: BatchSize.MEDIUM,
      uploadFrequency: UploadFrequency.AVERAGE,
      rumConfiguration: {
        applicationId: APPLICATION_ID,
        customEndpoint: OPENOBSERVE_ENDPOINT,
        // Automatic instrumentation:
        trackInteractions: true,
        trackResources: true,
        trackErrors: true,
        sessionSampleRate: 100,
        nativeCrashReportEnabled: true,
        trackFrustrations: true,
        firstPartyHosts: getFirstPartyHosts(),
      },
      logsConfiguration: { customEndpoint: OPENOBSERVE_ENDPOINT },
      traceConfiguration: { customEndpoint: OPENOBSERVE_ENDPOINT },
    },
  );
  config.service = Constants.expoConfig?.ios?.bundleIdentifier ?? 'com.groupifyapp';
  config.version = Constants.expoConfig?.version ?? undefined;
  if (__DEV__) {
    config.verbosity = SdkVerbosity.DEBUG;
  }

  cachedConfig = config;
  return cachedConfig;
}

/**
 * Tracks expo-router navigations as RUM views. Automatic React Navigation
 * tracking (@openobserve/mobile-react-navigation) doesn't fit expo-router
 * directly, so each path change becomes startView/stopView pair.
 */
export function useOpenObserveViewTracking() {
  const pathname = usePathname();
  const currentKey = useRef<string | null>(null);
  // Serialize start/stop pairs so rapid navigations can't interleave and stop
  // a view before its start ran: run N+1 always waits for run N to finish.
  const queue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const previousKey = currentKey.current;
    currentKey.current = pathname;

    // Name the view from the last meaningful segment; root path gets none.
    const name = pathname.split('/').filter(Boolean).pop() ?? 'home';

    queue.current = queue.current.then(async () => {
      if (previousKey) {
        await O2Rum.stopView(previousKey).catch(() => {});
      }
      await O2Rum.startView(pathname, name).catch(() => {});
    });
  }, [pathname]);
}
