import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center bg-gray-800 h-screen">
      <div className="bg-gray-700 flex space-x-2 p-5 rounded-full justify-center items-center">
        <div className="bg-blue-400 p-2  w-4 h-4 rounded-full animate-bounce blue-circle"></div>
        <div className="bg-green-400 p-2 w-4 h-4 rounded-full animate-bounce green-circle"></div>
        <div className="bg-red-400 p-2  w-4 h-4 rounded-full animate-bounce red-circle"></div>
      </div>
    </div>
  );
};

export default Loader;
