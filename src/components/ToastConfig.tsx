import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        maxWidth: 480,
        width: '90%',
        minHeight: 80,
        borderLeftColor: '#4CAF50',
        borderLeftWidth: 6,
      }}
      contentContainerStyle={{
        paddingHorizontal: 20,  
        paddingVertical: 20,   
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: "blue",
      }}
      text2Style={{
        fontSize: 14,
        color: "blue",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        maxWidth: 480,
        width: '90%',
        minHeight: 80,
        borderLeftColor: '#F44336',
        borderLeftWidth: 6,
      }}
      contentContainerStyle={{
        paddingHorizontal: 20,  
        paddingVertical: 20,   
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
      }}
      text2Style={{
        fontSize: 14,
      }}
    />
  ),
};