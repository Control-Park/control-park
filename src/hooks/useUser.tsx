import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export const useUser = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  useFocusEffect(
    useCallback(() => {
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUserEmail(user?.email || "");
        setUserId(user?.id || "");
        console.log("Logged in as:", user?.email);
      };
      
      getUser();
    }, [])
  );

  return { userEmail, userId };
};