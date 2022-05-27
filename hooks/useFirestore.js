import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { Constants } from "../utils/Constants";

export default function useFirestore(db) {
  const getUser = (uid) => {
    return getDoc(doc(db, Constants.USER_COLLECTION, uid));
  };
  const updateUser = (uid, data) => {
    return setDoc(doc(db, Constants.USER_COLLECTION, uid), data);
  };
  const getChannel = (channel) => {
    return getDoc(doc(db, Constants.CHANNEL_COLLECTION, channel));
  };
  const updateChannel = (channel, data) => {
    return setDoc(doc(db, Constants.CHANNEL_COLLECTION, channel), data);
  };
  const channelStream = (channel) => {
    return onSnapshot(doc(db, Constants.CHANNEL_COLLECTION, channel), (doc) => {
      console.log("Current data: ", doc.data());
    });
  };

  return {
    getUser,
    updateUser,
    getChannel,
    updateChannel,
    channelStream,
  };
}
