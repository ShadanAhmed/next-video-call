import React from "react";

export const ErrorPage = () => {
  return (
    <div className=" bg-gray-800 h-screen w-screen flex-col text-white flex items-center justify-center font-Poppins">
      <div className="max-w-3xl text-center p-8">
        <h2 className="text-4xl mb-4">Aaaah! Something went wrong</h2>
        <p className="text-xl">
          Brace yourself till we get the error fixed. You may also refresh the
          page and try again
        </p>
      </div>
    </div>
  );
};
