import React from "react";
import PageTitle from "../../components/Guideline/PageTitle";
import "./tree.css";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Avatar, Chip, IconButton } from "@mui/material";

/**
 *
 * @param {Array} data 樹狀結構，資料結構為[{id,name,subordinates:[{id,nam,subordinates}]},...
 * @param {boolean} editable 對單筆節點是否可編輯
 * @param {boolean} deleteable 對單筆節點是否可編輯
 * @param {Function} handleDelete 處理刪除的函數
 * @param {Function} handleEdit 處理編輯的函數
 * @param {string} title 標題、第一格
 * @returns
 */

const Tree = ({
  data,
  editable = true,
  deleteable = true,
  title = "",
  handleDelete = (nodeData) => {
    console.log("處理刪除", nodeData);
  },
  handleEdit = (nodeData) => {
    console.log("處理編輯", nodeData);
  },
}) => {
  const MenuNode = ({ node, onlyone }) => {
    const { name, subordinates } = node;
    const [isOpen, setIsOpen] = useState(true);

    const toggleOpen = (e) => {
      setIsOpen(!isOpen);
    };

    return (
      <li
        className={`md:!ms-16 relative md:p-2 list-none ${
          subordinates.length > 0 ? "parent_li" : ""
        } `}
        data-onlyone={onlyone}
      >
        <div
          className={`inline-flex w-full md:w-fit md:text-nowrap p-3 pe-6 me-4 justify-center items-center md:bg-gray-50 border-b md:border-2 border-gray-400 md:border-gray-300 md:rounded-[0.25rem] md:shadow-[3px_3px_4px_1px_rgba(0,0,0,0.2)] ${
            subordinates.length > 0 ? "md:mb-2" : ""
          }`}
        >
          <span
            className="px-4 w-6 h-full flex justify-center items-center rounded-full "
            onClick={(e) => toggleOpen(e)}
          >
            {subordinates.length > 0 && isOpen && (
              <ExpandMoreIcon fontSize="large" className="cursor-pointer" />
            )}
            {subordinates.length > 0 && !isOpen && (
              <ExpandLessIcon fontSize="large" className="cursor-pointer" />
            )}
          </span>
          〔 {node.department.name} 〕 {name}
          <span className={`!ms-6 flex gap-2  `}>
            {editable && (
              <IconButton
                aria-label={"編輯"}
                size="small"
                color="secondary"
                onClick={() => {
                  handleEdit(node);
                }}
                sx={{ width: "34px", height: "34px" }}
              >
                <EditIcon className="cursor-pointer text-white" />
              </IconButton>
            )}{" "}
            {deleteable && (
              <IconButton
                aria-label={"刪除"}
                size="small"
                color="secondary"
                onClick={() => {
                  handleDelete(node);
                }}
                sx={{ width: "34px", height: "34px" }}
              >
                <DeleteIcon className="cursor-pointer text-white" />
              </IconButton>
            )}
          </span>
        </div>
        {isOpen && subordinates.length > 0 && (
          <ul>
            {subordinates.map((child, index) => (
              <MenuNode
                key={index}
                node={child}
                onlyone={subordinates.length === 1}
              />
            ))}
          </ul>
        )}
      </li>
    );
  };
  return (
    <>
      {data && (
        <div className="tree min-h-5 py-4 md:py-10 md:px-6 px-3 bg-white rounded-md overflow-y-auto sm:overflow-auto h-full">
          {!!title && (
            <div className="inline-flex text-nowrap p-3 justify-center items-center bg-gray-50 border-2 border-gray-300 rounded-[0.25rem] shadow-[3px_3px_4px_1px_rgba(0,0,0,0.2)] mb-2">
              {title}
            </div>
          )}
          <ul className="sm:w-full md:max-w-[1000px] ">
            {data.map((node, index) => (
              <MenuNode key={index} node={node} />
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Tree;
