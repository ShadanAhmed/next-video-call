import { db } from "../../utils/firebase";
import {
  query,
  orderBy,
  limit,
  collection,
  getDocs,
  deleteDoc,
  endAt,
} from "firebase/firestore";
import { Constants } from "../../utils/Constants";

export default async function handle(req, res) {
  var ref = collection(db, Constants.CHANNEL_COLLECTION);
  var now = Date.now();
  var cutoff = now - 2 * 60 * 60 * 1000;

  const q = query(ref, orderBy("timestamp"), endAt(cutoff), limit(10));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref);
  });
  res.status(200).json({ message: "successfully deleted" });
}
