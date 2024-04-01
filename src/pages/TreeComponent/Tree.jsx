import React from "react";
import PageTitle from "../../components/Guideline/PageTitle";
import "./tree.css";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { Avatar, Chip } from "@mui/material";

const Tree = () => {
  const MenuNode = ({ node }) => {
    const { name, subordinates } = node;
    const [isOpen, setIsOpen] = useState(true);

    const toggleOpen = () => {
      setIsOpen(!isOpen);
    };

    return (
      <li
        className={`${
          subordinates.length > 0 ? "parent_li" : ""
        } !ms-16 relative m-0 px-2 py-2 list-none`}
      >
        <span
          onClick={toggleOpen}
          title={isOpen ? "Collapse this branch" : "Expand this branch"}
          className=""
        >
          {node.department.name} - {name}
          <div className="size-8 absolute top-0 -right-8">
            <Chip className="bg-transparent !shadow-[1px_1px_1px_1px_rgba(50,50,50,0.3)]">
              <DeleteIcon />
            </Chip>
          </div>
        </span>
        {isOpen && subordinates.length > 0 && (
          <ul>
            {subordinates.map((child, index) => (
              <MenuNode key={index} node={child} />
            ))}
          </ul>
        )}
      </li>
    );
  };
  return (
    <>
      {/* PageTitle */}
      <PageTitle title="樹" />
      <div className="overflow-y-auto h-full order-3 sm:order-1 p-2">
        <div className="tree ">
          <ul>
            {data.map((node, index) => (
              <MenuNode key={index} node={node} />
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Tree;

const data = [
  {
    id: "2",
    name: "董事長",
    department: {
      id: "2",
      name: "總經理室",
    },
    approvable: true,
    subordinates: [
      {
        id: "7",
        name: "會計專員",
        department: {
          id: "3",
          name: "會計部",
        },
        approvable: false,
        subordinates: [],
      },
      {
        id: "11",
        name: "會計助理",
        department: {
          id: "3",
          name: "會計部",
        },
        approvable: false,
        subordinates: [],
      },
      {
        id: "13",
        name: "行政專員",
        department: {
          id: "3",
          name: "會計部",
        },
        approvable: false,
        subordinates: [],
      },
      {
        id: "17",
        name: "行政助理",
        department: {
          id: "3",
          name: "會計部",
        },
        approvable: false,
        subordinates: [],
      },
      {
        id: "19",
        name: "倉管專員",
        department: {
          id: "3",
          name: "會計部",
        },
        approvable: false,
        subordinates: [],
      },
      {
        id: "23",
        name: "倉管助理",
        department: {
          id: "3",
          name: "會計部",
        },
        approvable: false,
        subordinates: [],
      },
    ],
  },
  {
    id: "3",
    name: "總經理",
    department: {
      id: "2",
      name: "總經理室",
    },
    approvable: true,
    subordinates: [
      {
        id: "29",
        name: "業務經理",
        department: {
          id: "5",
          name: "業務部",
        },
        approvable: true,
        subordinates: [
          {
            id: "31",
            name: "業務專員",
            department: {
              id: "5",
              name: "業務部",
            },
            approvable: false,
            subordinates: [],
          },
          {
            id: "37",
            name: "業務助理",
            department: {
              id: "5",
              name: "業務部",
            },
            approvable: false,
            subordinates: [],
          },
          {
            id: "41",
            name: "行銷經理",
            department: {
              id: "5",
              name: "業務部",
            },
            approvable: false,
            subordinates: [
              {
                id: "43",
                name: "行銷專員",
                department: {
                  id: "5",
                  name: "業務部",
                },
                approvable: false,
                subordinates: [],
              },
              {
                id: "47",
                name: "行銷助理",
                department: {
                  id: "5",
                  name: "業務部",
                },
                approvable: false,
                subordinates: [],
              },
              {
                id: "53",
                name: "專案專員",
                department: {
                  id: "5",
                  name: "業務部",
                },
                approvable: false,
                subordinates: [],
              },
              {
                id: "59",
                name: "專案助理",
                department: {
                  id: "5",
                  name: "業務部",
                },
                approvable: false,
                subordinates: [],
              },
            ],
          },
        ],
      },
      {
        id: "61",
        name: "設計課長",
        department: {
          id: "7",
          name: "設計部",
        },
        approvable: true,
        subordinates: [
          {
            id: "67",
            name: "設計副課長",
            department: {
              id: "7",
              name: "設計部",
            },
            approvable: false,
            subordinates: [],
          },
          {
            id: "71",
            name: "結構工程師",
            department: {
              id: "7",
              name: "設計部",
            },
            approvable: false,
            subordinates: [],
          },
          {
            id: "73",
            name: "結構助理工程師",
            department: {
              id: "7",
              name: "設計部",
            },
            approvable: false,
            subordinates: [],
          },
          {
            id: "79",
            name: "機電工程師",
            department: {
              id: "7",
              name: "設計部",
            },
            approvable: false,
            subordinates: [],
          },
          {
            id: "83",
            name: "機電助理工程師",
            department: {
              id: "7",
              name: "設計部",
            },
            approvable: false,
            subordinates: [],
          },
        ],
      },
      {
        id: "89",
        name: "工務課長",
        department: {
          id: "11",
          name: "工務部",
        },
        approvable: true,
        subordinates: [
          {
            id: "97",
            name: "工務副課長",
            department: {
              id: "11",
              name: "工務部",
            },
            approvable: false,
            subordinates: [],
          },
          {
            id: "101",
            name: "工務專員",
            department: {
              id: "11",
              name: "工務部",
            },
            approvable: false,
            subordinates: [],
          },
          {
            id: "103",
            name: "工務助理",
            department: {
              id: "11",
              name: "工務部",
            },
            approvable: false,
            subordinates: [],
          },
        ],
      },
      {
        id: "107",
        name: "測量課長",
        department: {
          id: "13",
          name: "測量部",
        },
        approvable: true,
        subordinates: [
          {
            id: "109",
            name: "測量專員",
            department: {
              id: "13",
              name: "測量部",
            },
            approvable: false,
            subordinates: [],
          },
          {
            id: "113",
            name: "測量助理",
            department: {
              id: "13",
              name: "測量部",
            },
            approvable: false,
            subordinates: [],
          },
        ],
      },
      {
        id: "127",
        name: "土木課長",
        department: {
          id: "17",
          name: "土木部",
        },
        approvable: true,
        subordinates: [
          {
            id: "131",
            name: "土木師傅",
            department: {
              id: "17",
              name: "土木部",
            },
            approvable: false,
            subordinates: [],
          },
          {
            id: "137",
            name: "土木學徒",
            department: {
              id: "17",
              name: "土木部",
            },
            approvable: false,
            subordinates: [],
          },
          {
            id: "139",
            name: "土木臨時工",
            department: {
              id: "17",
              name: "土木部",
            },
            approvable: false,
            subordinates: [],
          },
        ],
      },
      {
        id: "149",
        name: "鋼構課長",
        department: {
          id: "19",
          name: "鋼構部",
        },
        approvable: true,
        subordinates: [
          {
            id: "151",
            name: "鋼構師傅",
            department: {
              id: "19",
              name: "鋼構部",
            },
            approvable: false,
            subordinates: [],
          },
          {
            id: "157",
            name: "鋼構學徒",
            department: {
              id: "19",
              name: "鋼構部",
            },
            approvable: false,
            subordinates: [],
          },
          {
            id: "163",
            name: "鋼構臨時工",
            department: {
              id: "19",
              name: "鋼構部",
            },
            approvable: false,
            subordinates: [],
          },
        ],
      },
      {
        id: "167",
        name: "資訊課長",
        department: {
          id: "23",
          name: "資訊部",
        },
        approvable: true,
        subordinates: [
          {
            id: "173",
            name: "前端工程師",
            department: {
              id: "23",
              name: "資訊部",
            },
            approvable: false,
            subordinates: [],
          },
          {
            id: "179",
            name: "後端工程師",
            department: {
              id: "23",
              name: "資訊部",
            },
            approvable: false,
            subordinates: [],
          },
        ],
      },
      {
        id: "181",
        name: "法務特助",
        department: {
          id: "29",
          name: "法務部",
        },
        approvable: false,
        subordinates: [],
      },
      {
        id: "191",
        name: "人資專員",
        department: {
          id: "31",
          name: "人資部",
        },
        approvable: false,
        subordinates: [],
      },
      {
        id: "193",
        name: "人資助理",
        department: {
          id: "31",
          name: "人資部",
        },
        approvable: false,
        subordinates: [],
      },
    ],
  },
  {
    id: "5",
    name: "副總經理",
    department: {
      id: "2",
      name: "總經理室",
    },
    approvable: true,
    subordinates: [],
  },
];
