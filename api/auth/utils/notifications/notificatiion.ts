import { fireStoreDb } from "@/services/fireStoreDb";
import { collection, addDoc } from "firebase/firestore";

export const  setNewOfferNotification = async () => {
  const notification = {
    title: "New Offer",
    message: "Check out our new offer",
    read: false,
    time: new Date().toISOString(),
  }

}

export const  addNotificationForOrderStatusChange=async (userId:string,orderPayload:any) => {
// now set notification in firestore

const saveOrderNotification=await addDoc(collection(fireStoreDb, "notifications"), {
    userId,
    orderPayload,
    read: false,
    time: new Date().toISOString(),
})
}