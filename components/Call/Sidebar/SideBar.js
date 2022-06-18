import React, { useEffect } from "react";
import { GrFormClose } from "react-icons/gr";
import InfoSideBar from "./InfoSideBar";
import PeopleSideBar from "./PeopleSideBar";
import ChatSideBar from "./ChatSideBar";
import Router from "next/router";

const SideBar = ({
  currentSideBarNo,
  visible,
  close,
  members,
  meeting,
  currentUserId,
  rtmChannel,
  messages,
  addMessage,
  isTabWidth,
  setNewMessage,
}) => {
  console.log(currentSideBarNo);
  let title;
  if (currentSideBarNo === 1) {
    title = "Meeting details";
  } else if (currentSideBarNo === 2) {
    title = "People";
  } else {
    title = "In-call messages";
    if (visible) {
      setNewMessage(false);
    }
  }

  // sort members by name everytime it updates but keep the user with userId currentUserId at the top

  useEffect(() => {
    members.sort((a, b) => {
      if (a.userId === currentUserId) {
        return -1;
      } else if (b.userId === currentUserId) {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
  }, [members]);

  return (
    <div
      className={`sideBar py-4 px-6 rounded-md bg-white h-full text-black  relative  duration-3000 ${
        !visible
          ? isTabWidth
            ? "left-96 hidden"
            : " left-8 hidden"
          : "w-1/4 left-0"
      }`}
      style={{ transitionProperty: "left" }}
    >
      <div className="title-continer flex justify-between">
        <h3 className="text-lg unselectable">{title}</h3>
        <button onClick={close} className="mr-0">
          <GrFormClose className="text-3xl" />
        </button>
      </div>
      <div className="content mt-6" style={{ height: "calc(100% - 3.5rem)" }}>
        {currentSideBarNo === 1 ? (
          <InfoSideBar />
        ) : currentSideBarNo === 2 ? (
          <PeopleSideBar
            members={members}
            createdBy={meeting.createdBy}
            isTabWidth={isTabWidth}
          />
        ) : (
          <ChatSideBar
            currentUserId={currentUserId}
            rtmChannel={rtmChannel}
            messages={messages}
            members={members}
            addMessage={addMessage}
            isTabWidth={isTabWidth}
          />
        )}
      </div>
    </div>
  );
};

export default SideBar;
