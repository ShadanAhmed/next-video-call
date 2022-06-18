import React from "react";

const MemberInfo = ({ member, host }) => {
  return (
    <div className="member flex pt-4 unselectable" key={member.userId}>
      <img
        src={member.imageUrl + "32"}
        alt="user-image"
        className="w-8 h-8 rounded-full my-auto mx-0"
      />
      <div className="pl-2">
        <p>{member.name}</p>
        {host ? <p className="text-xs text-gray-700">Meeting host</p> : null}
      </div>
    </div>
  );
};

export default MemberInfo;
