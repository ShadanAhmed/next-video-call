import React, { useEffect } from "react";
import MediaPlayer from "./MediaPlayer";
import { BsPin, BsFillPinFill } from "react-icons/bs";

const CallVideoItem = ({ member, videoTrack, audioTrack }) => {
  useEffect(() => {
    console.log({ videoTrack: member.videoTrack });
  }, [member.videoTrack]);
  return (
    <div
      key={member.userId}
      className={`relative bg-gray-700 rounded-md overflow-hidden`}
    >
      <MediaPlayer
        videoTrack={videoTrack}
        audioTrack={audioTrack}
      ></MediaPlayer>
      <span className="absolute left-4 text-white drop-shadow-sm bottom-3">
        {member.name}
      </span>

      {!videoTrack && (
        <div
          className={`bg-gray-600 rounded-full absolute transition-opacity ${
            member.videoTrack ? "opacity-0" : ""
          }`}
          style={{
            width: "150px",
            height: "150px",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <img
            src={member.imageUrl}
            alt=""
            className="object-cover w-full h-full rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
};

export default CallVideoItem;
