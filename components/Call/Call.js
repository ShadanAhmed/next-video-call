import React, { useState, useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import useAgora from "../../hooks/useAgora";
import Agora, { RtcTokenBuilder, RtmTokenBuilder } from "agora-access-token";
import { useRouter } from "next/router";
const client = AgoraRTC.createClient({ codec: "h264", mode: "rtc" });
import { db } from "../../utils/firebase";
import { Slide, toast, ToastContainer } from "react-toastify";
import useFirestore from "../../hooks/useFirestore";
import { injectStyle } from "react-toastify/dist/inject-style";
import {
  FaMicrophone,
  FaMicrophoneAltSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import { ImPhoneHangUp } from "react-icons/im";
import { IoIosArrowUp } from "react-icons/io";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { BsFillChatLeftTextFill } from "react-icons/bs";
import { Constants } from "../../utils/Constants";
import SideBar from "./Sidebar/SideBar";
import AgoraRTM from "agora-rtm-sdk";
import axios from "axios";
import ClickAwayListener from "react-click-away-listener";
import CallGrid from "./CallGrid";

import Loader from "../Loader";
import Head from "next/head";
import { Router } from "next/router";

function Call({ user: currentUser }) {
  const router = useRouter();
  const { getUser, getChannel } = useFirestore(db);

  const {
    localVideoTrack,
    leave,
    join,
    toggleMic,
    toggleVideo,
    joinState,
    remoteUsers,
  } = useAgora(client);

  const [members, setMembers] = useState([]);
  const [currentTimeString, setCurrentTimeString] = useState("");

  const [sideBar, setSideBar] = useState({
    visible: false,
    current: 1,
  });

  const [muted, setMuted] = useState(false); // mute/unmute
  const [videoOff, setVideoOff] = useState(false); // video off/on
  const [meeting, setMeeting] = useState({}); // is created by me
  const [rtmChannel, setRtmChannel] = useState();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState({});
  const [showPoppup, setShowPoppup] = useState(false);
  const [newMessage, setNewMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  const bodyContainer = useRef();

  useEffect(() => {
    console.log({ remoteUsers });
    if (remoteUsers.length + 1 > members.length) {
      console.log("adding remote user to list...");
      let users = [...remoteUsers, currentUser];
      let memberArr = [];
      let addedIds = members.map((member) => {
        console.log({ member });
        if (member.uid == undefined) {
          member.uid = member.userId;
        }
        return member.uid;
      });
      let usersToAdd = users.filter(
        (user) => addedIds.indexOf(user.uid) === -1
      );

      console.log({ usersToAdd, addedIds, users });
      usersToAdd.map(async (user) => {
        console.log({ user: user.uid });
        let firebaseUser = await (await getUser(user.uid)).data();
        console.log({ firebaseUser });
        memberArr.push(firebaseUser);
        console.log("is current user", user.uid == currentUser.uid);
        console.log({ memberArr });
        setMembers([...members, ...memberArr]);
        if (firebaseUser.uid === currentUser.uid)
          toast.dark(`${firebaseUser.name} joined`, {
            position: "bottom-left",
            autoClose: 1000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            transition: Slide,
          });
      });
    } else {
      let remoteUserIds = [
        ...remoteUsers.map((user) => user.uid),
        currentUser.uid,
      ];
      console.log({ remoteUserIds });
      let filtered = false;

      let filteredMember = members.filter((member) => {
        console.log({ member });
        if (remoteUserIds.indexOf(member.userId) === -1) {
          filtered = true;
        }
        return remoteUserIds.indexOf(member.userId) !== -1;
      });
      console.log({ filteredMember });
      if (filtered) {
        setMembers(filteredMember);
      }
    }
  }, [remoteUsers]);

  useEffect(() => {
    if (joinState) {
      toggleVideo();
      setVideoOff(!videoOff);
      toggleMic();
      setMuted(!muted);
      setLoading(false);
    }
  }, [joinState]);

  const joinMeeting = async (channel) => {
    const meeting = (await getChannel(channel)).data();
    if (!meeting) {
      router.push("/?st=1");
      return;
    }
    setMeeting(meeting);

    if (meeting.createdBy !== currentUser.uid) {
      const token = RtcTokenBuilder.buildTokenWithUid(
        Constants.APP_ID,
        Constants.APP_CERTIFICATE,
        channel,
        currentUser.uid,
        Agora.RtcRole.SUBSCRIBER,
        Math.floor(Date.now() / 1000) + 40 * 60 * 60
      );
      const rtmToken = RtmTokenBuilder.buildToken(
        Constants.APP_ID,
        Constants.APP_CERTIFICATE,
        currentUser.uid,
        Agora.RtcRole.SUBSCRIBER,
        Math.floor(Date.now() / 1000) + 40 * 60 * 60
      );
      console.log({ rtmToken });
      joinRtm(rtmToken, channel);
      join(Constants.APP_ID, token, channel, currentUser.uid);
    } else {
      console.log({ connectionState: client.connectionState });
      const rtmToken = meeting.rtmToken;
      console.log({ rtmToken });
      joinRtm(rtmToken, channel);
      join(Constants.APP_ID, meeting.token, meeting.channel, currentUser.uid);
      console.timeEnd("Execution time");
    }
    console.log(router.query);
  };

  const recieveMessage = (message, memberId) => {
    console.log(messages);
    const msg = { message: message.text, sendBy: memberId };
    setCurrentMessage(msg);
    console.log(messages);
  };

  const joinRtm = async (token, channelName) => {
    const rtmChannelClient = AgoraRTM.createInstance(Constants.APP_ID);

    console.log({ user: currentUser });
    await rtmChannelClient.login({ uid: currentUser.uid, token });
    let rtmChannel = rtmChannelClient.createChannel(channelName);
    setRtmChannel(rtmChannel);

    rtmChannel.on("ChannelMessage", (message, memberId, messageProps) => {
      console.log({ message, memberId, messageProps });
      recieveMessage(message, memberId);
    });

    rtmChannel.join();
  };

  useEffect(() => {
    console.time("Execution time");

    joinMeeting(router.query.channel);
    setCurrentTimeString(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
    if (typeof window !== "undefined") {
      injectStyle();
    }
    let currentSeconds = new Date().getSeconds();
    let timeout = setInterval(() => {
      setCurrentTimeString(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 1000 * (60 - currentSeconds));

    axios
      .get(`/api/delete-previous-data/`)
      .then((result) => console.log(result))
      .catch((err) => console.log(err));

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    console.log({ currentMessage });
    if (Object.keys(currentMessage).length === 0) return;
    console.log({ currentMessage });

    setMessages([...messages, currentMessage]);

    if (sideBar && sideBar.current == 3 && sideBar.visible == true) return;
    setNewMessage(true);
    toast(
      <div className="text-black font-Poppins">
        <h5
          className="text-bold pb-2"
          style={{
            webkitTouchCallxout: "none",
            webkitUserSelect: "none",
            khtmlUserSelect: "none",
            mozUserSelect: "none",
            msUserSelect: "none",
            userSelect: "none",
          }}
        >
          {
            members.find((member) => member.userId == currentMessage.sendBy)
              .name
          }
        </h5>
        <p
          className="pl-2"
          style={{
            webkitTouchCallout: "none",
            webkitUserSelect: "none",
            khtmlUserSelect: "none",
            mozUserSelect: "none",
            msUserSelect: "none",
            userSelect: "none",
          }}
        >
          {currentMessage.message}
        </p>
      </div>,
      {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        transition: Slide,
      }
    );
  }, [currentMessage]);

  console.log({ members });

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div
        ref={bodyContainer}
        className="call bg-gray-800 h-screen w-full relative text-white font-Poppins overflow-hidden"
      >
        <Head>
          <title>Meet - {router.query.channel}</title>
          <meta name="description" content="Meeting created on next meet" />
          <link rel="icon" href="/favicon.ico" />
          <meta name="theme-color" content="#1f2937" />
        </Head>
        <div
          className={`player-container relative m-auto ${
            sideBar.visible ? "flex justify-between" : ""
          }`}
          style={{ height: "90%", width: "100%" }}
        >
          <div
            className={`w-full h-full transition-all relative`}
            style={sideBar.visible ? { width: "74%" } : {}}
          >
            <CallGrid
              members={members}
              maxCol={3}
              maxRow={2}
              remoteUsers={remoteUsers.map((user) => {
                return {
                  userId: user.uid,
                  videoTrack: user.videoTrack,
                  audioTrack: user.audioTrack,
                };
              })}
              currentUser={{
                userId: currentUser.uid,
                videoTrack: localVideoTrack,
                audioTrack: null,
              }}
              videoOff={videoOff}
            />
          </div>
          <SideBar
            close={() => setSideBar({ visible: false })}
            visible={sideBar.visible}
            currentSideBarNo={sideBar.current}
            members={members}
            meeting={meeting}
            currentUserId={currentUser.uid}
            rtmChannel={rtmChannel}
            messages={messages}
            addMessage={(message) => setMessages([...messages, message])}
            isTabWidth={bodyContainer.current?.scrollWidth <= 768}
            setNewMessage={(e) => setNewMessage(e)}
          />
        </div>
        <div
          className={`grid bottom-bar-grid grid-cols-[1fr_2fr_1fr]`}
          style={{ height: "calc(10% - 20px)" }}
        >
          <div className="hide-in-tab-width info pl-6 flex items-center">
            <span className="text-base font-bold">{currentTimeString}</span>
            <span className="text-base px-2"> | </span>
            <span className="text-base font-bold">{router.query.channel}</span>
          </div>
          <div className={`controls flex items-center justify-center`}>
            <div
              className={`rounded-full p-4 bg-gray-700 mr-4`}
              onClick={() => {
                toggleMic();
                setMuted(!muted);
              }}
            >
              {muted ? <FaMicrophoneAltSlash /> : <FaMicrophone />}
            </div>
            <div
              className={`rounded-full p-4 bg-gray-700 mr-4`}
              onClick={() => {
                toggleVideo();
                setVideoOff(!videoOff);
              }}
            >
              {videoOff ? <FaVideoSlash /> : <FaVideo />}
            </div>

            <div
              className="rounded-full p-4 px-6 bg-red-600 "
              onClick={async () => {
                await leave();
                router.push("/");
              }}
            >
              <ImPhoneHangUp />
            </div>
          </div>
          <div className="sub-controls hide-on-mobile-width flex items-center justify-end pr-8">
            <button
              className={`text-2xl mr-8 ${
                sideBar?.current === 1 && sideBar?.visible
                  ? "text-blue-300"
                  : ""
              }`}
              onClick={() =>
                setSideBar({
                  visible: sideBar?.current !== 1 ? true : !sideBar.visible,
                  current: 1,
                })
              }
            >
              <AiOutlineInfoCircle />
            </button>
            <button
              className={`text-2xl mr-8  relative ${
                sideBar?.current === 2 && sideBar?.visible
                  ? "text-blue-300"
                  : ""
              }`}
              onClick={() =>
                setSideBar({
                  visible: sideBar?.current !== 2 ? true : !sideBar.visible,
                  current: 2,
                })
              }
            >
              <MdOutlinePeopleAlt />
              <span className="absolute top-0 right-0 inline-flex items-center justify-between px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-gray-400 rounded-full">
                {members.length}
              </span>
            </button>
            <button
              className={`text-2xl relative ${
                sideBar?.current === 3 && sideBar?.visible
                  ? "text-blue-300"
                  : ""
              }`}
              onClick={() =>
                setSideBar({
                  visible: sideBar?.current !== 3 ? true : !sideBar.visible,
                  current: 3,
                })
              }
            >
              <BsFillChatLeftTextFill />
              {newMessage && (
                <span
                  className="rounded-full bg-blue-600"
                  style={{
                    width: "10px",
                    height: "10px",
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                  }}
                ></span>
              )}
            </button>
          </div>
          <div className="sub-controls show-on-mobile-width flex items-center justify-end pr-8 relative">
            {showPoppup && (
              <ClickAwayListener onClickAway={() => setShowPoppup(false)}>
                <div className="shadow-md sub-controls  flex items-start justify-center p-4 bg-white w-56 rounded-md flex-col absolute bottom-10 text-black z-40 right-8">
                  <button
                    className="text-2xl mb-8 flex w-full"
                    onClick={() => {
                      setSideBar({
                        visible:
                          sideBar?.current !== 1 ? true : !sideBar.visible,
                        current: 1,
                      });
                      setShowPoppup(false);
                    }}
                  >
                    <div>
                      <AiOutlineInfoCircle />
                    </div>

                    <span className="text-base font-bold ml-6">Info</span>
                  </button>
                  <button
                    className="text-2xl mb-8 flex w-full"
                    onClick={() => {
                      setSideBar({
                        visible:
                          sideBar?.current !== 2 ? true : !sideBar.visible,
                        current: 2,
                      });
                      setShowPoppup(false);
                    }}
                  >
                    <div className="relative">
                      <div>
                        <MdOutlinePeopleAlt />
                      </div>
                      <span className="absolute top-0 right-0 inline-flex items-center justify-between px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-gray-400 rounded-full">
                        {members.length}
                      </span>
                    </div>
                    <span className="text-base font-bold ml-6">Members</span>
                  </button>
                  <button
                    className="text-xl flex w-full"
                    onClick={() => {
                      setSideBar({
                        visible:
                          sideBar?.current !== 3 ? true : !sideBar.visible,
                        current: 3,
                      });
                      setShowPoppup(false);
                    }}
                  >
                    <div>
                      <BsFillChatLeftTextFill />
                    </div>
                    <span className="text-base font-bold ml-6">Chat</span>
                  </button>
                </div>
              </ClickAwayListener>
            )}
            <IoIosArrowUp
              className="font-bold text-2xl"
              onClick={() => {
                if (showPoppup == false) setShowPoppup(true);
              }}
            />
          </div>
        </div>
      </div>
      <ToastContainer
        position="bottom-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}
export default Call;
