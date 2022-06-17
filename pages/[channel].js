// pages/index.js
import useAuth from "../hooks/useAuth";

import dynamic from "next/dynamic";
import Router from "next/router";
import Loader from "../components/Loader";

const Call = dynamic(
  () => {
    return import("../components/Call/Call");
  },
  { ssr: false }
);

export default function Home() {
  const { loading, user, isLoggedIn } = useAuth();

  if (loading) return <Loader />;
  else if (!isLoggedIn) Router.push("/login?st=true");
  return (
    <div>
      <Call user={user} />
    </div>
  );
}

export async function getServerSideProps(context) {
  return { props: {} };
}
