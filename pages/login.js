import React, { useState, useEffect } from "react";
import useFirestore from "../hooks/useFirestore";
import Router from "next/router";
import { db, auth } from "../utils/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";

const Login = () => {
  const [loading, setLoading] = useState(null);
  const { updateUser } = useFirestore(db);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);
      } else {
        // User is signed out
        // ...
        console.log(false);
      }
    });
  }, []);

  const signInWithGoogle = () => {
    signInWithPopup(auth, new GoogleAuthProvider())
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // ...
        console.log({ credential, token, user, result });
        createUserInDatabase({
          userId: user.uid,
          name: user.displayName,
          imageUrl: user.photoURL,
        });
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
        console.log(errorCode, errorMessage, email, credential);
      });
  };

  const createUserInDatabase = async ({ userId, name, imageUrl }) => {
    setLoading(true);
    await updateUser(userId, {
      userId,
      name,
      imageUrl,
    });

    Router.push("/");
  };

  return (
    <div className="container">
      <button className="bg-blue-400" onClick={signInWithGoogle}>
        Sign in with google
      </button>
    </div>
  );
};

export default Login;
