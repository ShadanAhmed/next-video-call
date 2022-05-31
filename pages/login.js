import React, { useState, useEffect } from "react";
import useFirestore from "../hooks/useFirestore";
import Router from "next/router";
import { db, auth } from "../utils/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Flip, toast, ToastContainer } from "react-toastify";
import { injectStyle } from "react-toastify/dist/inject-style";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [loading, setLoading] = useState(null);
  const { updateUser } = useFirestore(db);

  useEffect(() => {
    if (typeof window !== "undefined") {
      injectStyle();
    }

    if (Router.query.st) {
      toast.dark("Login to continue", {
        position: "bottom-left",
        autoClose: 500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Flip,
      });
    }
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);
        Router.push("/?st=2");
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
    <div className="container h-screen w-screen bg-gray-700 flex justify-center items-center text-white font-Poppins">
      <div>
        <button
          className="bg-white text-black p-2 rounded-sm flex items-center"
          onClick={signInWithGoogle}
        >
          <span>
            <FcGoogle className="text-4xl mr-4" />
          </span>{" "}
          Sign in with google
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
