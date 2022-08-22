import Head from "next/head";
import { useState, useEffect } from "react";
import Agora, { RtcTokenBuilder, RtmTokenBuilder } from "agora-access-token";
import { useRouter } from "next/router";
import { db } from "../utils/firebase";
import useFirestore from "../hooks/useFirestore";
import Constants from "../utils/Constants";
import { Slide, toast, ToastContainer } from "react-toastify";

import { injectStyle } from "react-toastify/dist/inject-style";
import {
  AiOutlineInfoCircle,
  AiOutlineLogout,
  AiOutlineUserSwitch,
  AiOutlineVideoCameraAdd,
} from "react-icons/ai";
import ClickAwayListener from "react-click-away-listener";

export default function Home({ user, logout }) {
  console.log("user", user);
  const [channel, setChannel] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const { updateChannel } = useFirestore(db);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      injectStyle();
    }
    if (router.query.st == 1) {
      toast.dark("Please enter a valid meeting code", {
        position: "bottom-left",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
      });
    }
    if (router.query.st == 2) {
      toast.dark("Already logged in", {
        position: "bottom-left",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
      });
    }
  }, []);
  const generateMeetingCode = () => {
    let meetingCode = "";
    const alphabets = "abcdefghijklmnopqrstuvwxyz";
    // generate random alphabet
    for (let i = 1; i <= 3; i++) {
      meetingCode += alphabets[Math.floor(Math.random() * alphabets.length)];
    }
    meetingCode += "-";
    for (let i = 1; i <= 4; i++) {
      meetingCode += alphabets[Math.floor(Math.random() * alphabets.length)];
    }
    meetingCode += "-";
    for (let i = 1; i <= 3; i++) {
      meetingCode += alphabets[Math.floor(Math.random() * alphabets.length)];
    }
    return meetingCode;
  };

  const createMeeting = () => {
    const generatedChannel = generateMeetingCode();
    const appId = "eaba463a5db445fda89361ca451604e3";
    const appCertificate = "697bd8f3d2a547c9b9a05d2c8e981d72";
    const expiresAt = Math.floor(Date.now() / 1000) + 2 * 60 * 60;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      generatedChannel,
      user.uid,
      Agora.RtcRole.PUBLISHER,
      expiresAt
    );
    let rtmToken = RtmTokenBuilder.buildToken(
      appId,
      appCertificate,
      user.uid,
      Agora.RtcRole.PUBLISHER,
      expiresAt
    );

    updateChannel(generatedChannel, {
      channel: generatedChannel,
      token: token,
      rtmToken: rtmToken,
      createdBy: user.uid,
      timestamp: Date.now(),
    });
    router.push(`/${channel ? channel : generatedChannel}`);
  };

  useEffect(() => console.log(showPopup), [showPopup]);

  return (
    <div className="bg-gray-800">
      <Head>
        <title>Next video call</title>
        <meta
          name="description"
          content="A video call app created using next"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1f2937" />
      </Head>

      {showPopup ? (
        <ClickAwayListener onClickAway={() => setShowPopup(false)}>
          <div className="font-Poppins shadow-md sub-controls flex items-start justify-center  bg-white w-56 rounded-md flex-col absolute top-12 text-black z-40 right-14">
            <button
              className="text-2xl flex w-full p-4"
              onClick={async () => {
                await logout();
                router.push(`/login`);
              }}
            >
              <div>
                <AiOutlineLogout />
              </div>

              <span className="text-base font-bold ml-4">Logout</span>
            </button>
          </div>
        </ClickAwayListener>
      ) : null}

      <div className=" h-screen">
        <div className="bg-red w-screen h-16 relative">
          <img
            src={user != null ? user.photoURL : ""}
            onClick={() => setShowPopup(!showPopup)}
            alt="userImage"
            className="h-full rounded-full p-2 absolute right-4 top-2"
          />
        </div>
        <div className=" mb-4 relative items-center justify-center flex">
          <div
            className="ml-10 mr-10 mt-4 flex h-12 collapse-on-tab-width"
            style={{ width: "min(500px, 90vw)" }}
          >
            <button
              className=" font-Poppins flex items-center shadow-sm w-1/2 mb-0 text-white bg-gray-600 border-0 py-2 px-3 focus:outline-none transition-all duration-500 hover:bg-gray-700 rounded text-lg"
              onClick={createMeeting}
            >
              <AiOutlineVideoCameraAdd className="text-2xl text-white mr-3" />{" "}
              Meeting
            </button>

            <input
              type="channel"
              id="channel"
              name="channel"
              autoCorrect="off"
              className="shadow-md font-Poppins ml-4 flex-row-reverse w-full bg-gray-600 rounded border border-gray-500 text-white focus:border-gray-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              placeholder="Enter a code"
              onChange={(event) => {
                setChannel(event.target.value.toLowerCase());
              }}
              value={channel}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  router.push(`/${channel}`);
                }
              }}
            />
          </div>
        </div>
        <footer className="text-center text-white absolute bottom-0 w-screen pb-3 md:pb-5 text-lg font-Poppins">
          Made with ❤ by Shadan ahmed
        </footer>
        <ToastContainer />
      </div>
    </div>
  );
}
