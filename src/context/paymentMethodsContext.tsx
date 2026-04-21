import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  deletePaymentMethod,
  fetchPaymentMethods,
  PaymentMethod as APIPaymentMethod,
} from "../api/payments";
import { supabase } from "../utils/supabase";

async function hasSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

export type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  holder: string;
  typeLabel: string;
};

type PaymentContextValue = {
  defaultMethod: PaymentMethod | null;
  defaultPaymentMethodId: string | null;
  methods: PaymentMethod[];
  loading: boolean;
  addMethod: (method: Omit<PaymentMethod, "id">) => void;
  removeMethod: (id: string) => Promise<void>;
  refreshMethods: () => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
};

const PaymentMethodsContext = createContext<PaymentContextValue>({
  defaultMethod: null,
  defaultPaymentMethodId: null,
  methods: [],
  loading: false,
  addMethod: () => {},
  removeMethod: async () => {},
  refreshMethods: async () => {},
  setDefaultPaymentMethod: async () => {},
});

const DEFAULT_PAYMENT_STORAGE_KEY = "default-payment-method";

async function getStorageKey() {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  return userId
    ? `${DEFAULT_PAYMENT_STORAGE_KEY}:${userId}`
    : DEFAULT_PAYMENT_STORAGE_KEY;
}

function toLocalMethod(m: APIPaymentMethod): PaymentMethod {
  return {
    id: m.id,
    brand: m.brand,
    last4: m.last4,
    holder: m.holder_name ?? "",
    typeLabel: "Card",
  };
}

export const PaymentMethodsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<string | null>(null);

  const persistDefaultPaymentMethodId = async (id: string | null) => {
    const storageKey = await getStorageKey();

    if (id) {
      await AsyncStorage.setItem(storageKey, id);
      return;
    }

    await AsyncStorage.removeItem(storageKey);
  };

  const refreshMethods = async () => {
    if (!await hasSession()) {
      setMethods([]);
      setDefaultPaymentMethodId(null);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchPaymentMethods();
      const nextMethods = data.map(toLocalMethod);
      setMethods(nextMethods);

      const storageKey = await getStorageKey();
      const storedDefaultId = await AsyncStorage.getItem(storageKey);
      const nextDefaultId = nextMethods.some((method) => method.id === storedDefaultId)
        ? storedDefaultId
        : nextMethods[0]?.id ?? null;

      setDefaultPaymentMethodId(nextDefaultId);
      await persistDefaultPaymentMethodId(nextDefaultId);
    } catch (err) {
      console.warn("Failed to load payment methods:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshMethods();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        void refreshMethods();
      } else if (event === "SIGNED_OUT") {
        setMethods([]);
        setDefaultPaymentMethodId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addMethod = (method: Omit<PaymentMethod, "id">) => {
    const optimisticMethod = {
      ...method,
      id: `optimistic-${Date.now()}`,
    };

    // Optimistic update - the real record comes from the backend after save.
    setMethods((prev) => [
      ...prev,
      optimisticMethod,
    ]);

    if (!defaultPaymentMethodId) {
      setDefaultPaymentMethodId(optimisticMethod.id);
      void persistDefaultPaymentMethodId(optimisticMethod.id);
    }
  };

  const removeMethod = async (id: string) => {
    const previousMethods = methods;
    const remainingMethods = previousMethods.filter((method) => method.id !== id);
    const nextDefaultId =
      defaultPaymentMethodId === id
        ? remainingMethods[0]?.id ?? null
        : defaultPaymentMethodId;

    setMethods(remainingMethods);
    setDefaultPaymentMethodId(nextDefaultId);
    await persistDefaultPaymentMethodId(nextDefaultId);

    try {
      await deletePaymentMethod(id);
    } catch (err) {
      console.warn("Failed to delete payment method:", err);
      await refreshMethods();
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    setDefaultPaymentMethodId(id);
    await persistDefaultPaymentMethodId(id);
  };

  const defaultMethod =
    methods.find((method) => method.id === defaultPaymentMethodId) ?? null;

  return (
    <PaymentMethodsContext.Provider
      value={{
        defaultMethod,
        defaultPaymentMethodId,
        methods,
        loading,
        addMethod,
        removeMethod,
        refreshMethods,
        setDefaultPaymentMethod,
      }}
    >
      {children}
    </PaymentMethodsContext.Provider>
  );
};

export const usePaymentMethods = () => useContext(PaymentMethodsContext);
