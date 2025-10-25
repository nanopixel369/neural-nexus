import 'react-native-gesture-handler';
import { Slot } from 'expo-router';

export default function RootLayout() {
  // Slot renders the current route without creating a Native Stack.
  return <Slot />;
}
