import React from "react";
import { useRouter } from "next/router";
import { MdContentCopy } from "react-icons/md";
import { Flip, toast, ToastContainer } from "react-toastify";

const InfoSideBar = () => {
  const Router = useRouter();
  const copyToClipboard = (text) => {
    const input = document.createElement("input");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, 99999);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(input.value);
    }
    document.body.removeChild(input);
    toast.dark("Copied to clipboard!", {
      position: "bottom-left",
      autoClose: 1000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      transition: Flip,
    });
  };

  return (
    <div className="pl-2">
      <h4 className="text-md font-bold unselectable">Joining info</h4>
      <p className="text-gray-700 pt-1 text-sm">
        http://localhost:3000/{Router.query.channel}
      </p>
      <button
        className="text-blue-500 text-sm font-bold pt-4 unselectable"
        onClick={() =>
          copyToClipboard(`http://localhost:3000/${Router.query.channel}`)
        }
      >
        <span className="text-lg">
          <MdContentCopy className="inline" />
        </span>{" "}
        Copy joining info
      </button>
    </div>
  );
};

export default InfoSideBar;
