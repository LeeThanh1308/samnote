import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import { fetchGroupList } from "../fetchApiGroup";
import avatarDefault from "../../../assets/avatar-default.png";

import Modal from "react-bootstrap/Modal";

import { joiResolver } from "@hookform/resolvers/joi";
import { useForm } from "react-hook-form";
import { schemaGroup } from "../../../utils/schema/schema";
import configs from "../../../configs/configs.json";
const { API_SERVER_URL } = configs;

import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const ChatList = (props) => {
  const {
    userID,
    socket,
    typeFilterChat,

    userList,
    groupList,
    setGroupList,
    userItem,
    groupItem,
    setSnackbar,

    onChangeTypeFilter,
    onShowModalSearch,
    onClickUserItem,
    onClickGroupItem,
  } = props.data;

  console.log(userList);
  const chatListRef = useRef();
  const [heightChatList, setHeightChatList] = useState("300");

  useEffect(() => {
    chatListRef.current?.offsetHeight &&
      // @ts-ignore
      setHeightChatList(chatListRef.current.offsetHeight);
  }, [chatListRef]);

  // * handle filter message
  const handleTypeFilterChat = (e) => {
    const type = e.target.innerHTML;
    if (type === typeFilterChat) return;
    window.localStorage.setItem("typeFilterChat", type);
    onChangeTypeFilter(type);
  };

  const convertLastText = (lastText, idSend) => {
    return idSend === userID ? `Bạn: ${lastText}` : `${lastText}`;
  };

  const isReadMessageGroup = (listUserReaded, userID) => {
    if (listUserReaded.length < 1) return false;
    return listUserReaded.some(
      (userReaded) => Number(userReaded.idUser) === userID
    );
  };

  // *********** handle create group

  const [memberGroupCreate, setMemberGroupCreate] = useState({
    gmail: "",
    id: "",
  });
  const [memberListGroupCreate, setMemberListGroupCreate] = useState([]);
  const [showModalCreateGroup, setShowModalCreateGroup] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(schemaGroup),
    defaultValues: { groupName: "", desc: "", members: null },
  });

  const resetModalCreateGroup = () => {
    setMemberGroupCreate({ gmail: "", id: "" });
    setMemberListGroupCreate([]);
    reset();
  };

  const handleShowModalCreateGroup = () => {
    setShowModalCreateGroup(true);
  };

  const handleHideModalCreateGroup = () => {
    setShowModalCreateGroup(false);
    resetModalCreateGroup();
  };

  const handleAddMemberCreate = () => {
    const membersChema = getValues("members");
    const { gmail, id } = memberGroupCreate;

    const member = { gmail, id, role: "member" };
    setMemberListGroupCreate([...memberListGroupCreate, member]);
    setMemberGroupCreate({ gmail: "", id: "" });

    setValue(
      "members",
      membersChema
        ? [...membersChema, { gmail: gmail, id: id, role: "member" }]
        : [{ gmail, id: id, role: "member" }]
    );
  };

  const handleDeleteMemberCreate = (index) => {
    setMemberListGroupCreate(
      memberListGroupCreate.filter((member, idx) => idx !== index)
    );

    const membersChema = getValues("members");
    setValue(
      "members",
      membersChema.filter((member, idx) => idx !== index)
    );
  };

  const handleChangeMemberGroupCreate = (e) =>
    setMemberGroupCreate({
      ...memberGroupCreate,
      [e.target.name]: e.target.value,
    });

  const postGroup = async (dataGroup, userID) => {
    try {
      const response = await axios.post(
        `${API_SERVER_URL}/group/create/${userID}`,
        dataGroup
      );
      setSnackbar({
        isOpen: true,
        message: `Create group complete`,
        severity: "success",
      });

      //  cập nhật group list
      const groups = await fetchGroupList(userID, socket, typeFilterChat);
      setGroupList(groups);

      // reset form create group
      setShowModalCreateGroup(false);
      resetModalCreateGroup();
    } catch (error) {
      setSnackbar({
        isOpen: true,
        message: error.response.data.message,
        severity: "error",
      });
    }
  };

  const onSubmit = (data) => {
    const { groupName, desc, members } = data;

    const group = {
      // info change
      name: groupName,
      members: members,
      describe: desc,

      //  info constant
      createAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      idOwner: userID,
      r: 255,
      g: 255,
      b: 255,
      a: 0.99,
    };

    console.log(group);

    postGroup(group, userID);
  };

  return (
    <div className="shadow-lg bg-[#dffffe] flex flex-col flex-grow-1 px-[20px]">
      <Modal
        show={showModalCreateGroup}
        onHide={handleHideModalCreateGroup}
        size="sm"
        centered={false}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            width: "max-content",
            maxWidth: "400px",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Create Group
          </Typography>
          <TextField
            fullWidth
            label="Group Name"
            type="text"
            variant="outlined"
            margin="normal"
            {...register("groupName")}
          />
          {errors.groupName && (
            <Box sx={{ mt: 1, color: "red" }}>{errors.groupName.message}</Box>
          )}
          <TextField
            fullWidth
            label="Description"
            type="text"
            variant="outlined"
            margin="normal"
            {...register("desc")}
          />
          {errors.desc && (
            <Box sx={{ mt: 1, color: "red" }}>{errors.desc.message}</Box>
          )}
          <List>
            {memberListGroupCreate?.map((member, index) => (
              <ListItem key={index}>
                <ListItemText primary={member.gmail} secondary={member.role} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteMemberCreate(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 2,
              gap: "5px",
            }}
          >
            <TextField
              label="Member Email"
              name="gmail"
              type="email"
              fullWidth
              onChange={handleChangeMemberGroupCreate}
              value={memberGroupCreate.gmail}
            />

            <TextField
              label="Member ID"
              name="id"
              type="number"
              fullWidth
              onChange={handleChangeMemberGroupCreate}
              value={memberGroupCreate.id}
            />

            <IconButton
              disabled={
                memberGroupCreate.gmail.trim() !== "" &&
                memberGroupCreate.id.trim() !== ""
                  ? false
                  : true
              }
              onClick={handleAddMemberCreate}
            >
              <AddIcon />
            </IconButton>
          </Box>

          {memberListGroupCreate.length > 0 ? (
            ""
          ) : (
            <Box sx={{ mt: 1, color: "red" }}>{errors?.members?.message}</Box>
          )}

          <div className="flex justify-end gap-2 mt-3">
            <Box>
              <Button
                type="button"
                variant="contained"
                color="secondary"
                onClick={handleHideModalCreateGroup}
              >
                cancel
              </Button>
            </Box>
            <Box>
              <Button type="submit" variant="contained" color="primary">
                Create
              </Button>
            </Box>
          </div>
        </Box>
      </Modal>

      <div className="flex mt-4 mb-5 justify-between gap-2">
        <div className="flex justify-between gap-2 w-full">
          <button
            onClick={onShowModalSearch}
            type="button"
            className="flex w-full gap-2 items-center bg-white p-2 rounded-5 shadow-lg text-[#686464CC]"
          >
            <SearchIcon />
            Search user
          </button>

          <button
            type="button"
            className=""
            title="add group"
            onClick={handleShowModalCreateGroup}
          >
            <GroupAddIcon className="text-[36px]" />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-grow-1">
        <ul className="flex justify-between group-buttons mb-4">
          <li>
            <button
              onClick={handleTypeFilterChat}
              className={typeFilterChat === "All" && "active"}
              type="button"
            >
              All
            </button>
          </li>

          <li>
            <button
              className={typeFilterChat === "Unread" && "active"}
              onClick={handleTypeFilterChat}
              type="button"
            >
              Unread
            </button>
          </li>

          <li>
            <button
              className={typeFilterChat === "Read" && "active"}
              onClick={handleTypeFilterChat}
              type="button"
            >
              Read
            </button>
          </li>
        </ul>

        <ul
          id="list-chat"
          className="flex flex-col flex-grow-1 gap-4 overflow-y-auto pb-[30px] overflow-x-hidden list-chat"
          ref={chatListRef}
          style={{ height: `${heightChatList}px`, scrollbarWidth: "none" }}
        >
          {userList?.map((item) => {
            return (
              <li
                key={item.idMessage}
                className={`flex justify-between items-center rounded-[40px] cursor-pointer ${
                  userItem?.id === item.user.id ? "active" : null
                }`}
                onClick={() => onClickUserItem(item)}
              >
                <div className="flex gap-2 items-center">
                  <div>
                    <img
                      src={item.user.Avarta}
                      alt="avatar"
                      className="w-[50px] h-[50px] object-cover rounded-[100%]"
                    />
                  </div>

                  <div>
                    <h5 className="text-lg font-extrabold capitalize">
                      {item.user.name}
                    </h5>
                    <p
                      style={{ maxWidth: "200px" }}
                      className={
                        item.is_seen === 0
                          ? "p-0 m-0 whitespace-nowrap overflow-hidden text-ellipsis font-[600] text-lg"
                          : "p-0 m-0 whitespace-nowrap overflow-hidden text-ellipsis text-lg"
                      }
                    >
                      {convertLastText(item.last_text, item.idSend)}
                    </p>
                  </div>
                </div>

                <div
                  className={
                    item.is_seen === 0
                      ? "text-[#ff0404] text-[16px] me-2"
                      : "text-[#00ff73] text-[16px] me-2"
                  }
                >
                  {item.is_seen === 0 ? (
                    <p className="bg-[#dfdfdf] w-[20px] h-[20px] rounded-full flex items-center justify-center">
                      1
                    </p>
                  ) : (
                    <CheckIcon />
                  )}
                </div>
              </li>
            );
          })}

          {groupList?.map((item) => (
            <li
              key={item.idGroup}
              className={`flex justify-between items-center rounded-[40px] cursor-pointer ${
                item.idGroup === groupItem?.idGroup ? "active" : null
              }`}
              onClick={() => onClickGroupItem(item)}
            >
              <div className="flex gap-2 items-center">
                <div>
                  <img
                    src={item.linkAvatar || avatarDefault}
                    alt="avatar"
                    className="w-[50px] h-[50px] object-cover rounded-[100%]"
                  />
                </div>

                <div>
                  <h5 className="text-lg font-extrabold capitalize">
                    {item.name}
                  </h5>
                  <p
                    style={{ maxWidth: "200px" }}
                    className={
                      item.is_seen === 0
                        ? "p-0 m-0 whitespace-nowrap overflow-hidden text-ellipsis font-[600] text-lg"
                        : "p-0 m-0 whitespace-nowrap overflow-hidden text-ellipsis text-lg"
                    }
                  >
                    {item.text_lastest_message_in_group}
                  </p>
                </div>
              </div>

              <div
                className={
                  isReadMessageGroup(item.listUserReaded)
                    ? "text-[#00ff73] text-[16px] me-2"
                    : "text-[#ff0404] text-[16px] me-2"
                }
              >
                {isReadMessageGroup(item.listUserReaded) ? (
                  <CheckIcon />
                ) : (
                  <p className="bg-[#dfdfdf] w-[20px] h-[20px] rounded-full flex items-center justify-center">
                    1
                  </p>
                )}
              </div>
            </li>
          ))}

          {userList.length === 0 && groupList.length === 0 && (
            <div className="text-center">
              <div>
                <ChatBubbleOutlineIcon className="text-[80px]" />
              </div>
              <h3>Không có tin nhắn nào</h3>
              <p>Tin nhắn mới sẽ được hiện thị tại đây</p>
            </div>
          )}
        </ul>
      </div>

      {/* <ChatUser {...propsChatUser} /> */}
    </div>
  );
};

export default ChatList;
