// pages/index.js

import dynamic from "next/dynamic";
import useAuth from "../hooks/useAuth";
import Router from "next/router";
import Loader from "../components/Loader";

const Join = dynamic(
  () => {
    return import("../components/Join");
  },
  { ssr: false }
);

export default function Home() {
  const { loading, isLoggedIn, user, logout } = useAuth();

  if (loading) {
    <Loader />;
  } else if (!isLoggedIn) {
    Router.push("/login");
  }

  return (
    <div>
      <Join user={user} logout={logout} />
    </div>
  );
}
