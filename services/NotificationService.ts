import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc,
  updateDoc,
  and,
  or,
  Timestamp 
} from "firebase/firestore";
import { fireStoreDb } from "./fireStoreDb";

export interface NotificationPayload {
  type: 'newUser' | 'orderUpdate' | 'priceDrop' | 'newPromocode' | 'adminNewUser' | 'adminNewOrder';
  userId?: string;
  orderId?: string;
  status?: string;
  productId?: string;
  productName?: string;
  newPrice?: number;
  productImage?: string;
  link?: string;
  code?: string;
  discount?: string;
  endDate?: string;
  imageUrl?: string;
  fullName?: string;
  email?: string;
  amount?: number;
  userName?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  imageUrl?: string;
  status: 'unread' | 'read';
  createdAt: any;
  payload: NotificationPayload;
}

class NotificationService {
  private collectionName = "notifications";

  /**
   * Subscribe to real-time notifications for a specific user.
   */
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(fireStoreDb, this.collectionName),
      or(
        where("userId", "==", userId),
        where("payload.userId", "==", userId)
      )
    );

    console.log(`[NotificationService] Subscribing to notifications for userId: ${userId}`);
    return onSnapshot(q, (snapshot) => {
      const notifications: Notification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({ id: doc.id, ...data } as Notification);
      });
      console.log(`[NotificationService] Result for ${userId}: ${notifications.length} notifications found.`);
      callback(notifications);
    });
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(notificationId: string) {
    const docRef = doc(fireStoreDb, this.collectionName, notificationId);
    await updateDoc(docRef, { status: "read" });
  }

  /**
   * Mark all unread notifications as read for a specific user.
   * This is more complex if done in a single call without a cloud function,
   * but for small amounts, we can batch update or do it sequentially.
   */
  async markAllAsRead(notifications: Notification[]) {
    const unread = notifications.filter(n => n.status === 'unread');
    const promises = unread.map(n => this.markAsRead(n.id));
    await Promise.all(promises);
  }

  /**
   * Subscribe to real-time unread count.
   */
  subscribeToUnreadCount(userId: string, callback: (count: number) => void) {
    const q = query(
      collection(fireStoreDb, this.collectionName),
      and(
        or(
          where("userId", "==", userId),
          where("payload.userId", "==", userId)
        ),
        where("status", "==", "unread")
      )
    );

    // Note: getCountFromServer is not real-time. 
    // For real-time counter, we use onSnapshot on the query and use snapshot.size.
    return onSnapshot(q, (snapshot) => {
      console.log(`[NotificationService] Unread count for ${userId}: ${snapshot.size}`);
      callback(snapshot.size);
    });
  }
}

export const notificationService = new NotificationService();
