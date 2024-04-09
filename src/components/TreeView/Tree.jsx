import React from "react";
import "./tree.css";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { IconButton } from "@mui/material";

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
    console.log("處理刪除, 該節點資料", nodeData);
  },
  handleEdit = (nodeData) => {
    console.log("處理編輯, 該節點資料", nodeData);
  },
}) => {
  const MenuNode = ({ node, onlyone, layer }) => {
    const { name, subordinates } = node;
    const [isOpen, setIsOpen] = useState(true);

    const toggleOpen = (e) => {
      setIsOpen(!isOpen);
    };

    return (
      <li
        className={`sm:!ms-16 relative sm:p-2 list-none w-full  ${
          subordinates.length > 0 ? "parent_li" : ""
        } `}
        data-onlyone={onlyone}
      >
        <div
          className={`inline-flex w-full sm:w-fit sm:text-nowrap sm:text-start py-3 sm:p-3 sm:pe-6 sm:me-4 sm:justify-center justify-between items-center sm:bg-gray-50 border-b sm:border-2 border-gray-400 sm:border-gray-300 sm:rounded-[0.25rem] sm:shadow-[3px_3px_4px_1px_rgba(0,0,0,0.2)] ${
            subordinates.length > 0 ? "sm:mb-2" : ""
          }`}
        >
          <div
            className={`flex justify-center items-center overflow-hidden ${
              layer === 1
                ? "ms-0"
                : layer === 2
                ? "ms-4"
                : layer === 3
                ? "ms-8"
                : "ms-10"
            } sm:ms-0`}
          >
            <span
              className="px-4 w-6 h-full flex justify-center items-center rounded-full "
              onClick={(e) => toggleOpen(e)}
            >
              {subordinates.length > 0 && isOpen && (
                <>
                  {layer === 1 ? (
                    <KeyboardArrowDownIcon
                      fontSize="large"
                      className="cursor-pointer"
                    />
                  ) : layer === 2 ? (
                    <KeyboardArrowDownIcon
                      fontSize="medium"
                      className="cursor-pointer"
                    />
                  ) : (
                    <ArrowDropDownIcon
                      fontSize="medium"
                      className="cursor-pointer"
                    />
                  )}
                </>
              )}
              {subordinates.length > 0 && !isOpen && (
                <>
                  {layer === 1 ? (
                    <KeyboardArrowRightIcon
                      fontSize="large"
                      className="cursor-pointer"
                    />
                  ) : layer === 2 ? (
                    <KeyboardArrowRightIcon
                      fontSize="medium"
                      className="cursor-pointer"
                    />
                  ) : (
                    <ArrowRightIcon
                      fontSize="medium"
                      className="cursor-pointer"
                    />
                  )}
                </>
              )}
            </span>
            <span className="truncate me-1.5">
              〔 {node.department.name} 〕 {name}
            </span>
          </div>
          <span className={`sm:!ms-6 flex gap-2 `}>
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
          <ul className="">
            {subordinates.map((child, index) => (
              <MenuNode
                key={index}
                node={child}
                onlyone={subordinates.length === 1}
                layer={layer + 1}
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
        <div className="tree min-h-5 py-4 sm:py-10 sm:px-6 px-3 bg-white rounded-md overflow-y-auto sm:overflow-auto h-full">
          {!!title && (
            <div className="inline-flex text-nowrap p-3 justify-center items-center bg-gray-50 border-2 border-gray-300 rounded-[0.25rem] shadow-[3px_3px_4px_1px_rgba(0,0,0,0.2)] mb-2">
              {title}
            </div>
          )}
          <ul className="sm:w-full sm:max-w-[1000px] ">
            {data.map((node, index) => (
              <MenuNode key={index} node={node} layer={1} />
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Tree;
