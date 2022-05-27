import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dispose = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setIsLoggedIn(true);
        setLoading(false);
      } else {
        // User is signed out
        // ...
        setUser(null);
        setIsLoggedIn(false);
        setLoading(false);
      }
    });
    return () => dispose();
  }, []);

  return {
    user,
    isLoggedIn,
    loading,
  };
}
