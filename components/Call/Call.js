import React, { useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import useAgora from "../../hooks/useAgora";
import MediaPlayer from "./MediaPlayer";
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
  FaInfoCircle,
  FaUser,
  FaVideoSlash,
  FaPhone,
} from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { ImPhoneHangUp } from "react-icons/im";
import { IoIosArrowUp } from "react-icons/io";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { BsFillChatLeftTextFill } from "react-icons/bs";
import { Constants } from "../../utils/Constants";
import SideBar from "./SideBar/SideBar";
import AgoraRTM, { RtmChannel } from "agora-rtm-sdk";
import axios from "axios";
import ClickAwayListener from "react-click-away-listener";

function Call({ user: currentUser }) {
  const router = useRouter();
  const { getUser, getChannel, updateChannel } = useFirestore(db);

  const {
    localAudioTrack,
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
  const [screenWidth, setScreenWidth] = useState(0);
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

  useEffect(() => {
    setScreenWidth(document.body.scrollWidth);
  }, [document.body.scrollWidth]);

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
        console.log({ memberArr });
        setMembers([...members, ...memberArr]);
        if (firebaseUser.uid === currentUser.uid)
          toast.dark(`${firebaseUser.name} joined`, {
            position: "bottom-left",
            autoClose: 500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            transition: Flip,
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
    }
  }, [joinState]);

  const joinMeeting = async (channel) => {
    const meeting = (await getChannel(channel)).data();
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
    }
    console.log(router.query);
  };

  const recieveMessage = (message, memberId) => {
    console.log(messages);
    const message = { message: message.text, sendBy: memberId };
    setCurrentMessage(message);
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
    if (typeof window !== "undefined") {
      injectStyle();
    }
    joinMeeting(router.query.channel);
    setCurrentTimeString(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
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

  // copy first six element of remoteUsers into a new variable and if it length is less than six then add until its len
  let remoteUsersList = remoteUsers.slice(0, 6);

  console.log({ members });

  const remoteUserAvailable = remoteUsers.length > 0;

  console.log({ screenWidth });

  let isTabWidth = screenWidth <= 768;
  let isMobileWidth = screenWidth <= 480;

  const columns = isTabWidth ? 2 : 3;
  const rows = isTabWidth <= 768 ? 3 : 2;

  return (
    <>
      <div className="call bg-gray-800 h-screen w-full relative text-white font-Poppins">
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
            <div
              className={`${
                remoteUserAvailable
                  ? `absolute ${
                      isMobileWidth ? "right-2" : "right-8"
                    } bottom-8 z-10 shadow-sm  w-56 h-32`
                  : " w-full h-full "
              } transition-all `}
            >
              <div className="local-player-wrapper relative w-full h-full">
                <div
                  className={`
                ${
                  remoteUserAvailable
                    ? "current-user-wrapper overflow-hidden bg-gray-700"
                    : "current-user-wrapper overflow-hidden m-auto bg-none"
                }  h-full relative rounded-md`}
                  style={remoteUserAvailable ? {} : { maxWidth: "1200px" }}
                >
                  <MediaPlayer
                    videoTrack={!videoOff ? localVideoTrack : undefined}
                    audioTrack={undefined}
                  ></MediaPlayer>
                  <span
                    className={`absolute left-2 text-white drop-shadow-sm ${
                      remoteUserAvailable ? "bottom-1" : "bottom-3"
                    }`}
                  >
                    You
                  </span>
                  <div
                    className={`bg-gray-600 rounded-full absolute ${
                      videoOff ? "" : "hidden"
                    }`}
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: remoteUserAvailable ? "50px" : "150px",
                      height: remoteUserAvailable ? "50px" : "150px",
                    }}
                  >
                    {members.find(
                      (member) => member.userId === currentUser.uid
                    ) != null ? (
                      <img
                        src={
                          members.find(
                            (member) => member.userId === currentUser.uid
                          ).imageUrl
                        }
                        alt=""
                        className="object-cover w-full h-full rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`${
                remoteUserAvailable
                  ? "w-full h-full flex flex-wrap justify-around"
                  : ""
              }`}
            >
              {remoteUsersList.map((user) => (
                <div
                  className={`remote-player-wrapper h-full overflow-hidden  relative rounded-md`}
                  style={{
                    maxWidth: "1200px",
                    width: `calc(${
                      remoteUsersList.length > 2
                        ? 100 / columns
                        : remoteUsersList.length == 2
                        ? 100 / (columns - 1)
                        : 100
                    }% - ${remoteUsersList.length > 1 ? 20 : 0}px)`,
                    height: `calc(${
                      remoteUsersList.length > (isTabWidth ? 1 : columns)
                        ? 100 / rows
                        : 100
                    }% - ${remoteUsersList.length > columns ? 20 : 0}px)`,
                    margin: remoteUsersList.length > 1 ? "10px" : "auto",
                  }}
                  key={user.uid}
                >
                  <MediaPlayer
                    videoTrack={user.videoTrack}
                    audioTrack={user.audioTrack}
                  ></MediaPlayer>
                  <span className="absolute left-2 text-white drop-shadow-sm bottom-3">
                    {members.find((member) => member.userId === user.uid) !=
                    null
                      ? members.find((member) => member.userId === user.uid)
                          .name
                      : "Connecting..."}
                  </span>
                  <div
                    className={`bg-gray-600 rounded-full absolute transition-opacity ${
                      user.videoTrack ? "opacity-0" : ""
                    }`}
                    style={{
                      width: "150px",
                      height: "150px",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {members.find((member) => member.userId === user.uid) !=
                    null ? (
                      <img
                        src={
                          members.find((member) => member.userId === user.uid)
                            .imageUrl
                        }
                        alt=""
                        className="object-cover w-full h-full rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <> </>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
            isTabWidth={isTabWidth}
            setNewMessage={(e) => setNewMessage(e)}
          />
        </div>
        <div
          className={`grid ${
            isMobileWidth
              ? "grid-cols-[4fr_1fr]"
              : !isTabWidth
              ? "grid-cols-[1fr_2fr_1fr]"
              : "grid-cols-[3fr_1fr]"
          }`}
          style={{ height: "calc(10% - 20px)" }}
        >
          {!isTabWidth && (
            <div className="info pl-6 flex items-center">
              <span className="text-base font-bold">{currentTimeString}</span>
              <span className="text-base px-2"> | </span>
              <span className="text-base font-bold">
                {router.query.channel}
              </span>
            </div>
          )}
          <div
            className={`controls flex items-center ${
              isMobileWidth
                ? "justify-start pl-8"
                : !isTabWidth
                ? "justify-center"
                : "justify-start pl-8"
            }`}
          >
            <div
              className={`rounded-full p-4 bg-gray-700 ${
                isMobileWidth ? "mr-8" : "mr-4"
              }`}
              onClick={() => {
                toggleMic();
                setMuted(!muted);
              }}
            >
              {muted ? <FaMicrophoneAltSlash /> : <FaMicrophone />}
            </div>
            <div
              className={`rounded-full p-4 bg-gray-700  ${
                isMobileWidth ? "mr-8" : "mr-4"
              }`}
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
          {!isMobileWidth ? (
            <div className="sub-controls  flex items-center justify-end pr-8">
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
                <span class="absolute top-0 right-0 inline-flex items-center justify-between px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-gray-400 rounded-full">
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
          ) : (
            <div className="sub-controls  flex items-center justify-end pr-8 relative">
              {showPoppup && (
                <ClickAwayListener onClickAway={() => setShowPoppup(false)}>
                  <div className="sub-controls  flex items-start justify-center p-4 bg-white w-40 flex-col absolute bottom-16 text-black z-40">
                    <button
                      className="text-2xl mb-8 flex justify-between w-full"
                      onClick={() => {
                        setSideBar({
                          visible:
                            sideBar?.current !== 1 ? true : !sideBar.visible,
                          current: 1,
                        });
                        setShowPoppup(false);
                      }}
                    >
                      <AiOutlineInfoCircle />
                      <span className="text-base font-bold">Info</span>
                    </button>
                    <button
                      className="text-2xl mb-8 flex justify-between w-full"
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
                        <MdOutlinePeopleAlt />
                        <span class="absolute top-0 right-0 inline-flex items-center justify-between px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-gray-400 rounded-full">
                          {members.length}
                        </span>
                      </div>
                      <span className="text-base font-bold">Members</span>
                    </button>
                    <button
                      className="text-xl flex justify-between w-full"
                      onClick={() => {
                        setSideBar({
                          visible:
                            sideBar?.current !== 3 ? true : !sideBar.visible,
                          current: 3,
                        });
                        setShowPoppup(false);
                      }}
                    >
                      <BsFillChatLeftTextFill />
                      <span className="text-base font-bold">Chat</span>
                    </button>
                  </div>
                </ClickAwayListener>
              )}
              <IoIosArrowUp
                className="font-bold text-2xl"
                onClick={() => setShowPoppup(true)}
              />
            </div>
          )}
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
