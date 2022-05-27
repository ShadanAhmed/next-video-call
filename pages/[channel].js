// pages/index.js
import useAuth from "../hooks/useAuth";

import dynamic from "next/dynamic";

const Call = dynamic(
  () => {
    return import("../components/Call/Call");
  },
  { ssr: false }
);

export default function Home() {
  const { loading, user, isLoggedIn } = useAuth();

  if (loading) return <div>Loading...</div>;
  else if (!isLoggedIn) router.push("/login");
  return (
    <div>
      <Call user={user} />
    </div>
  );
}
