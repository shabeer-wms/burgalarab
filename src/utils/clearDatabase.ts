import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const clearDatabase = async () => {
  // List of collections to clear
  const collections = [
    'menuItems',
    'orders',
    'staff',
    'users',
    'bills',
    'kitchenOrders',
    'ratings',
  ];
  for (const col of collections) {
    const colRef = collection(db, col);
    const snapshot = await getDocs(colRef);
    for (const docSnap of snapshot.docs) {
      try {
        await deleteDoc(doc(db, col, docSnap.id));
      } catch (err) {
        console.error(`Failed to delete doc ${docSnap.id} in ${col}:`, err);
      }
    }
  }
};
