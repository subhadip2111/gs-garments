import { fireStoreDb } from "@/services/fireStoreDb";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { NotificationPayload } from "@/services/NotificationService";

export const addNotification = async (userId: string, title: string, body: string, payload: NotificationPayload) => {
  try {
    await addDoc(collection(fireStoreDb, "notifications"), {
      userId,
      title,
      body,
      status: "unread",
      createdAt: serverTimestamp(),
      payload
    });
  } catch (err) {
    console.error("Error adding notification:", err);
  }
};

export const addNotificationForOrderStatusChange = async (userId: string, orderId: string, status: string) => {
  const title = "Order Update";
  const body = `Your order ${orderId} status has been updated to ${status}.`;
  
  await addNotification(userId, title, body, {
    type: 'orderUpdate',
    orderId,
    status
  });
};

export const addNewOfferNotification = async (userId: string, discount: string, code: string) => {
  const title = "New Offer";
  const body = `Check out our new offer: ${discount} off with code ${code}!`;
  
  await addNotification(userId, title, body, {
    type: 'newPromocode',
    code,
    discount
  });
};