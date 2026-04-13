import React, { createContext, useContext, useState, ReactNode } from "react";

export type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  holder: string;
  typeLabel: string;
};

type PaymentContextValue = {
  methods: PaymentMethod[];
  addMethod: (method: Omit<PaymentMethod, "id">) => void;
  removeMethod: (id: string) => void;
};

const PaymentMethodsContext = createContext<PaymentContextValue>({
  methods: [],
  addMethod: () => {},
  removeMethod: () => {},
});

export const PaymentMethodsProvider = ({ children }: { children: ReactNode }) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  const addMethod = (method: Omit<PaymentMethod, "id">) => {
    setMethods(prev => [
      ...prev,
      {
        ...method,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      },
    ]);
  };

  const removeMethod = (id: string) => {
    setMethods(prev => prev.filter(method => method.id !== id));
  };

  return (
    <PaymentMethodsContext.Provider value={{ methods, addMethod, removeMethod }}>
      {children}
    </PaymentMethodsContext.Provider>
  );
};

export const usePaymentMethods = () => useContext(PaymentMethodsContext);
