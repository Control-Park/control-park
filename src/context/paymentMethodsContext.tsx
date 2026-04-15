import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchPaymentMethods, deletePaymentMethod, PaymentMethod as APIPaymentMethod } from "../api/payments";
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
  methods: PaymentMethod[];
  loading: boolean;
  addMethod: (method: Omit<PaymentMethod, "id">) => void;
  removeMethod: (id: string) => Promise<void>;
  refreshMethods: () => Promise<void>;
};

const PaymentMethodsContext = createContext<PaymentContextValue>({
  methods: [],
  loading: false,
  addMethod: () => {},
  removeMethod: async () => {},
  refreshMethods: async () => {},
});

function toLocalMethod(m: APIPaymentMethod): PaymentMethod {
  return {
    id: m.id,
    brand: m.brand,
    last4: m.last4,
    holder: m.holder_name ?? "",
    typeLabel: "Card",
  };
}

export const PaymentMethodsProvider = ({ children }: { children: ReactNode }) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshMethods = async () => {
    if (!await hasSession()) return;
    try {
      setLoading(true);
      const data = await fetchPaymentMethods();
      setMethods(data.map(toLocalMethod));
    } catch (err) {
      console.warn("Failed to load payment methods:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshMethods();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        void refreshMethods();
      } else if (event === "SIGNED_OUT") {
        setMethods([]);
      }
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const addMethod = (method: Omit<PaymentMethod, "id">) => {
    // Optimistic update — the real record comes from the backend after save
    setMethods(prev => [
      ...prev,
      {
        ...method,
        id: `optimistic-${Date.now()}`,
      },
    ]);
  };

  const removeMethod = async (id: string) => {
    setMethods(prev => prev.filter(m => m.id !== id));
    try {
      await deletePaymentMethod(id);
    } catch (err) {
      console.warn("Failed to delete payment method:", err);
      // Refresh to restore accurate state on failure
      await refreshMethods();
    }
  };

  return (
    <PaymentMethodsContext.Provider value={{ methods, loading, addMethod, removeMethod, refreshMethods }}>
      {children}
    </PaymentMethodsContext.Provider>
  );
};

export const usePaymentMethods = () => useContext(PaymentMethodsContext);
