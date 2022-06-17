import React, { useEffect, useState } from "react";
import Input from "./Input";
import { FaSearch } from "react-icons/fa";
import MemberInfo from "./MemberInfo";

const InfoSideBar = ({ members, createdBy, isTabWidth }) => {
  const [rows, setRows] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    console.log(e);
    console.log(searchTerm);
  };

  const [filteredMember, setFilteredMember] = useState(members);

  useEffect(() => {
    setFilteredMember(
      members.filter((member) => {
        return member.name
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase());
      })
    );
  }, [searchTerm]);
  useEffect(() => {
    setFilteredMember(
      members.filter((member) => {
        return member.name
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase());
      })
    );
  }, [members]);

  return (
    <div>
      <Input
        type={"search"}
        onChange={(e) => setSearchTerm(e.target.value)}
        icon={
          <button onClick={() => handleSearch(searchTerm)}>
            <FaSearch className="text-gray-700" />
          </button>
        }
        placeholder="Search for people"
        value={searchTerm}
        onsubmit={(e) => handleSearch(e)}
        rows={rows}
        setRows={(e) => setRows(e)}
        isTabWidth={isTabWidth}
      />
      <div className="pl-4">
        <h5 className="text-gray-600 font-semibold pt-4 unselectable">
          In call
        </h5>

        {filteredMember.length > 0 ? (
          filteredMember.map((member, index) => {
            console.log({ member, createdBy });
            return (
              <MemberInfo
                key={index}
                member={member}
                host={createdBy == member.userId}
              />
            );
          })
        ) : (
          <p className="text-gray-600 pt-4">No results</p>
        )}
      </div>
    </div>
  );
};

export default InfoSideBar;
