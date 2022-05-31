import React, { useEffect, useState } from "react";
import CallVideoItem from "./CallVideoItem";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const CallGrid = ({
  members,
  maxCol,
  maxRow,
  isTabWidth = true,
  remoteUsers,
  currentUser,
  videoOff,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(members.length > 6);
  const [hasPrev, setHasPrev] = useState(false);
  const [maxPage, setMaxPage] = useState(Math.ceil(members.length / 6));
  const [currentItems, setCurrentItems] = useState(
    members.slice(0, maxRow * maxCol)
  );
  const [columns, setColumns] = useState(
    isTabWidth
      ? currentItems.length < 4
        ? 0
        : 2
      : currentItems.length == 1
      ? 1
      : currentItems.length == 2
      ? 2
      : currentItems.length == 3
      ? 3
      : currentItems.length == 4
      ? 2
      : 3
  );
  const [rows, setRows] = useState(
    isTabWidth
      ? currentItems.length == 1
        ? 1
        : currentItems.length == 2
        ? 2
        : currentItems.length == 3
        ? 3
        : currentItems.length == 4
        ? 2
        : 3
      : currentItems.length < 4
      ? 0
      : 2
  );

  const updateState = () => {
    let currentItems = members.slice(0, maxRow * maxCol);
    let columns = isTabWidth
      ? currentItems.length < 4
        ? 0
        : 2
      : currentItems.length == 1
      ? 1
      : currentItems.length == 2
      ? 2
      : currentItems.length == 3
      ? 3
      : currentItems.length == 4
      ? 2
      : 3;
    let rows = isTabWidth
      ? currentItems.length == 1
        ? 1
        : currentItems.length == 2
        ? 2
        : currentItems.length == 3
        ? 3
        : currentItems.length == 4
        ? 2
        : 3
      : currentItems.length < 4
      ? 0
      : 2;
    setCurrentItems(currentItems);
    setColumns(columns);
    setRows(rows);
    setHasNext(members.length > 6 * currentPage);
    setHasPrev(currentPage > 1);
    setMaxPage(Math.ceil(members.length / 6));
  };

  useEffect(() => {
    updateState();
  }, [members]);

  return (
    <Swiper
      spaceBetween={50}
      slidesPerView={maxPage}
      onSlideChange={() => {
        setCurrentPage(currentPage + 1);
        updateState();
      }}
      onSwiper={(swiper) => console.log(swiper)}
      style={{ height: "100%" }}
    >
      {hasPrev && (
        <SwiperSlide>
          <div
            className={`w-full h-full grid grid-item grid-item-${members.length} `}
          >
            {currentItems.map((member, index) => (
              <CallVideoItem
                member={member}
                videoTrack={
                  member.userId === currentUser.userId
                    ? videoOff
                      ? null
                      : currentUser.videoTrack
                    : remoteUsers?.find((user) => user.userId === member.userId)
                        ?.videoTrack
                }
                audioTrack={
                  member.userId === currentUser.userId
                    ? currentUser.audioTrack
                    : remoteUsers?.find((user) => user.userId === member.userId)
                        ?.audioTrack
                }
              />
            ))}
          </div>
        </SwiperSlide>
      )}
      <SwiperSlide>
        <div
          className={`w-full h-full grid grid-item grid-item-${members.length} `}
        >
          {currentItems.map((member, index) => (
            <CallVideoItem
              member={member}
              videoTrack={
                member.userId === currentUser.userId
                  ? videoOff
                    ? null
                    : currentUser.videoTrack
                  : remoteUsers?.find((user) => user.userId === member.userId)
                      ?.videoTrack
              }
              audioTrack={
                member.userId === currentUser.userId
                  ? currentUser.audioTrack
                  : remoteUsers?.find((user) => user.userId === member.userId)
                      ?.audioTrack
              }
            />
          ))}
        </div>
      </SwiperSlide>
      {hasNext && (
        <SwiperSlide>
          <div
            className={`w-full h-full grid grid-item grid-item-${members.length} `}
          >
            {currentItems.map((member, index) => (
              <CallVideoItem
                member={member}
                videoTrack={
                  member.userId === currentUser.userId
                    ? videoOff
                      ? null
                      : currentUser.videoTrack
                    : remoteUsers?.find((user) => user.userId === member.userId)
                        ?.videoTrack
                }
                audioTrack={
                  member.userId === currentUser.userId
                    ? currentUser.audioTrack
                    : remoteUsers?.find((user) => user.userId === member.userId)
                        ?.audioTrack
                }
              />
            ))}
          </div>
        </SwiperSlide>
      )}
    </Swiper>
  );
};

export default CallGrid;
