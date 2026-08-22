import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { 
  MobileAds, 
  BannerAd, 
  BannerAdSize, 
  InterstitialAd, 
  AdEventType,
  TestIds,
  RewardedAd,
  RewardedAdEventType,
  AppOpenAd
} from 'react-native-google-mobile-ads';

// Disable ads flag for testing
const ADS_DISABLED = process.env.EXPO_PUBLIC_DISABLE_ADS === 'true';

// Configure Ad Units
const BANNER_AD_UNIT_ID = __DEV__ 
  ? TestIds.BANNER 
  : Platform.select({
      ios: 'ca-app-pub-4077364511521347/5530767115',
      android: 'ca-app-pub-4077364511521347/9374409243'
    });

const INTERSTITIAL_AD_UNIT_ID = __DEV__ 
  ? TestIds.INTERSTITIAL 
  : Platform.select({
      ios: 'ca-app-pub-4077364511521347/8898932374',
      android: 'ca-app-pub-4077364511521347/4369494577'
    });

const REWARDED_AD_UNIT_ID = __DEV__ 
  ? TestIds.REWARDED 
  : Platform.select({
      ios: 'ca-app-pub-4077364511521347/4983972201',
      android: 'ca-app-pub-4077364511521347/6748245906'
    });

const APP_OPEN_AD_UNIT_ID = __DEV__ 
  ? TestIds.APP_OPEN 
  : Platform.select({
      ios: 'ca-app-pub-4077364511521347/7658002890',
      android: 'ca-app-pub-4077364511521347/8980795642'
    });


export const openAppAd = () => {
  return new Promise((resolve) => {
    if (ADS_DISABLED) {
      console.log('[AdMob] Ads disabled, skipping app open ad');
      resolve(false);
      return;
    }
    const appOpenAd = AppOpenAd.createForAdRequest(APP_OPEN_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      appOpenAd.show();
    });

    appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      resolve(true);
    });

    appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('App open ad error', error);
      resolve(false); // Resolve false so the app can continue
    });

    // Begin loading
    appOpenAd.load();
  });
};

// Rewarded Ad Management
export const loadRewardedAd = () => {
  return new Promise((resolve) => {
    if (ADS_DISABLED) {
      console.log('[AdMob] Ads disabled, skipping rewarded ad');
      resolve(false);
      return;
    }
    const rewarded = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      rewarded.show();
    });

    rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
      console.log('User earned reward of ', reward);
      // Handle user reward
    });

    rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      resolve(true);
    });

    rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Rewarded ad error', error);
      resolve(false); // Resolve false so the app can continue
    });

    // Begin loading
    rewarded.load();
  });
};

// Interstitial Ad Management
export const loadInterstitial = () => {
  return new Promise((resolve) => {
    if (ADS_DISABLED) {
      console.log('[AdMob] Ads disabled, skipping interstitial ad');
      resolve(false);
      return;
    }
    const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitial.show();
    });

    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      resolve(true);
    });

    interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Interstitial ad error', error);
      resolve(false);
    });

    // Begin loading
    interstitial.load();
  });
};

const AdMobManager = ({ style }: { style?: any }) => {
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await requestTrackingPermissionsAsync();
      if (cancelled) return;
      MobileAds()
        .initialize()
        .then(adapterStatuses => {
          console.log('AdMob Initialization complete', adapterStatuses);
        });
    };
    init();
    return () => { cancelled = true; };
  }, []);

  // Banner Ad Component
  const BannerAdComponent = () => (
    <BannerAd
      unitId={BANNER_AD_UNIT_ID}
      size={BannerAdSize.FULL_BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
      onAdLoaded={() => {
        console.log('Banner ad loaded');
      }}
      onAdFailedToLoad={(error) => {
        console.error('Banner ad failed to load', error);
      }}
    />
  );

  if (ADS_DISABLED) {
    return null;
  }

  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <BannerAdComponent />
    </View>
  );
};

export const InlineAd = ({ style }: { style?: any }) => {
  if (ADS_DISABLED) {
    return null;
  }
  return (
    <View style={[{ alignItems: 'center', marginVertical: 10 }, style]}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.INLINE_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

// Attach methods to AdMobManager for easier access
AdMobManager.loadRewardedAd = loadRewardedAd;
AdMobManager.loadInterstitial = loadInterstitial;
AdMobManager.openAppAd = openAppAd;

export default AdMobManager;