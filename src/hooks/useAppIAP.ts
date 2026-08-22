import { useState, useEffect, useCallback } from 'react';
import { useIAP, ErrorCode, type Purchase, initConnection } from 'expo-iap';
import { paymentsApi } from '@/api/endpoints';
import { IAP_PRODUCT_IDS, PLAN_BY_IAP_PRODUCT } from '@/types';
import { useQueryClient } from '@tanstack/react-query';

export function useAppIAP() {
  const queryClient = useQueryClient();
  const [purchasing, setPurchasing] = useState(false);

  const {
    connected,
    subscriptions,
    fetchProducts,
    finishTransaction,
    requestPurchase,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        const productId = purchase.productId;
        const planName = PLAN_BY_IAP_PRODUCT[productId];
        if (!planName) return;

        const receipt = purchase.purchaseToken || '';
        const transactionId = purchase.transactionId || '';
        const platform = purchase.store === 'apple' ? 'ios' : 'android';

        await paymentsApi.verifyIAPReceipt({
          platform,
          product_id: productId,
          receipt,
          transaction_id: transactionId,
        });

        await finishTransaction({ purchase, isConsumable: false });
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      } catch {
        // verification failed
      } finally {
        setPurchasing(false);
      }
    },
    onPurchaseError: () => {
      setPurchasing(false);
    },
  });

  useEffect(() => {
    async function initIAP() {
      const connected = await initConnection();
      if (!connected) return;
      fetchProducts({ skus: Object.values(IAP_PRODUCT_IDS), type: 'subs' });
    }
    initIAP();
  }, [fetchProducts]);

  const buySubscription = useCallback(async (planName: string) => {
    const sku = IAP_PRODUCT_IDS[planName];
    if (!sku) return;

    setPurchasing(true);

    try {
      await requestPurchase({
        request: {
          apple: { sku },
          google: { skus: [sku] },
        },
        type: 'subs',
      });
    } catch (err: any) {
      setPurchasing(false);
      if (err?.code === ErrorCode.UserCancelled) return;
    }
  }, [requestPurchase]);

  return { connected, products: subscriptions, purchasing, buySubscription };
}
