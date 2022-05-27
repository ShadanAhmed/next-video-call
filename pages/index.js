// pages/index.js

import dynamic from "next/dynamic";
import useAuth from "../hooks/useAuth";
import Router from "next/router";

const Join = dynamic(
  () => {
    return import("../components/Join");
  },
  { ssr: false }
);

export default function Home() {
  const { loading, isLoggedIn, user } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  } else if (!isLoggedIn) {
    Router.push("/login");
  }

  return (
    <div>
      <Join user={user} />
    </div>
  );
}
