import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "./Group.css";

import axios from "axios";
import moment from "moment";
import { Await, Link } from "react-router-dom";
import io from "socket.io-client";

import Modal from "react-bootstrap/Modal";

import avatarDefault from "../../assets/avatar-default.png";
import bgMessage from "../../assets/img-chat-an-danh.jpg";

import configs from "../../configs/configs.json";
import { AppContext } from "../../context";
import FormMessage from "./FormMessage/FormMessage";
import {
  fetchAllMemberGroup,
  fetchUserChatList,
  fetchGroupList,
} from "./fetchApiGroup";

import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DeleteIcon from "@mui/icons-material/Delete";

import ChatList from "./ChatList/ChatList";
import Information from "./Information/Information";
import SettingGroup from "./SettingGroup/SettingGroup";

const { API_SERVER_URL, BASE64_URL } = configs;

const Group = () => {
  const appContext = useContext(AppContext);
  const { setSnackbar, user } = appContext;

  const [socket, setSocket] = useState(null);

  // var search user
  const [searchUser, setSearchUser] = useState({
    searchUserName: "",
    searchUserResult: [],
    showModalSearch: false,
    messageNotifi: "",
  });
  const { searchUserName, searchUserResult, showModalSearch, messageNotifi } =
    searchUser;

  // var content message
  const [messageContent, setMessageContent] = useState({
    messageContentRef: useRef(),
    inputMessageFormRef: useRef(),
    heightMessageContent: "500",
    messageContentUlRef: useRef(),
  });
  const {
    inputMessageFormRef,
    messageContentRef,
    heightMessageContent,
    messageContentUlRef,
  } = messageContent;

  const [userList, setUserList] = useState([]);
  const [groupList, setGroupList] = useState([]);

  const [infoOtherUser, setInfoOtherUser] = useState({});
  const [infoGroupItem, setInfoGroupItem] = useState({});

  const [messageList, setMessageList] = useState([]);
  const [messageGroupList, setMessageGroupList] = useState([]);

  const [formName, setFormName] = useState(null);

  const [typeFilterChat, setTypeFilterChat] = useState(
    window.localStorage.getItem("typeFilterChat") ?? "All"
  );
  const handleChangeTypeFilterChat = (type) => setTypeFilterChat(type);
  //______________________________________
  const getGroupList = async () => {
    const groups = await fetchGroupList(user.id, socket, typeFilterChat);
    setGroupList(groups);
  };
  const getUserChatList = async () => {
    console.log(typeFilterChat, window.localStorage.getItem("typeFilterChat"));
    const userList = await fetchUserChatList(
      user.id,
      socket,
      window.localStorage.getItem("typeFilterChat") ?? typeFilterChat
    );
    setUserList(userList);
  };

  useEffect(() => {
    const socketIo = io(API_SERVER_URL);

    socketIo.on("connect", () => {
      console.log("Connected");
      setSocket(socketIo);
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    console.log("type filter", typeFilterChat);

    getUserChatList();
    // getGroupList()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, socket, typeFilterChat]);

  useEffect(() => {
    if (!socket) return;

    socket.on("send_message", (result) => {
      console.log("type:", typeFilterChat);
      getUserChatList();

      const { ReceivedID, SenderID } = result.data;
      if (
        formName === "chat" &&
        (ReceivedID === infoOtherUser.id || SenderID === infoOtherUser.id)
      ) {
        getMessageList(user.id, ReceivedID === user.id ? SenderID : ReceivedID);
        if (messageContentRef.current && messageContentUlRef.current) {
          messageContentRef.current.scrollTop =
            messageContentUlRef.current.offsetHeight;
        }
      }
    });

    socket.on("chat_group", (result) => {
      getGroupList();
      if (formName === "group") {
        fetchMessagesGroup(infoGroupItem.idGroup);
        if (messageContentRef.current && messageContentUlRef.current) {
          messageContentRef.current.scrollTop =
            messageContentUlRef.current.offsetHeight;
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, formName, typeFilterChat]);

  // *********** handle chat user messages
  const handleClickUserItem = (otherUser) => {
    if (otherUser.is_seen === 0 && otherUser.idReceive === user.id) {
      fetchUpdateSeenMessage(otherUser.idMessage);
    }

    getMessageList(user.id, otherUser.user.id);

    setInfoOtherUser(otherUser.user);
    inputMessageFormRef.current.focus();
    resetGroup();
  };

  const handleDeleteMessage = async (messageID) => {
    try {
      const response = await axios.delete(
        `${API_SERVER_URL}/message/${messageID}`
      );

      getMessageList(user.id, infoOtherUser.id);
      getUserChatList();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUpdateSeenMessage = async (messageID) => {
    try {
      const response = await axios.post(
        `${API_SERVER_URL}/message/${messageID}`
      );
      getUserChatList();
    } catch (error) {
      console.log(error);
    }
  };

  const getMessageList = async (userID, otherUserID) => {
    try {
      const response = await axios.get(
        `${API_SERVER_URL}/message/list_message_chat1vs1/${userID}/${otherUserID}`
      );

      setMessageList(
        response.data.data.length ? response.data.data[0].messages : []
      );
    } catch (error) {
      console.log(error);
    }
  };

  const convertTime = (time) => moment(`${time}+0700`).calendar();

  // ** search user buy name

  const fetchSearchUser = async (userName) => {
    try {
      const url = `${API_SERVER_URL}/group/search_user_by_word`;
      const response = await axios.post(url, {
        start_name: userName,
      });

      setSearchUser({
        ...searchUser,
        searchUserResult: response.data.data ? response.data.data : [],
        messageNotifi: response.data.message ? response.data.message : "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const postRelation = async (userID, otherUserID) => {
    try {
      const response = await axios.post(
        `${API_SERVER_URL}/chatblock/${userID}`,
        {
          idReceive: otherUserID,
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const roomSplit = (idUser, idOther) =>
    idUser > idOther ? `${idOther}#${idUser}` : `${idUser}#${idOther}`;

  const handleChangeSearchUser = (e) => {
    setSearchUser({ ...searchUser, searchUserName: e.target.value });
  };

  const handleSubmitSearchUser = (e) => {
    e.preventDefault();
    if (
      searchUserName.trim().split(" ").length !== 1 ||
      searchUserName.trim() === ""
    )
      return;

    fetchSearchUser(searchUserName);
  };

  const handleClickSearchBtn = (otherUser) => {
    if (!otherUser) return;
    const newInfoOtherUser = {
      id: otherUser.idUser,
      Avarta: otherUser.linkAvatar,
      name: otherUser.userName,
    };

    const roomID = roomSplit(user.id, otherUser.idUser);
    socket.emit("join_room", { room: roomID });

    // console.log(socket)

    setFormName("chat");
    setInfoOtherUser(newInfoOtherUser);
    resetGroup();

    postRelation(user.id, otherUser.idUser);

    getMessageList(user.id, otherUser.idUser);

    handleHideModalSearch();
    inputMessageFormRef.current.focus();
  };

  const handleShowModalSearch = (e) => {
    setSearchUser({ ...searchUser, showModalSearch: true });
    setSearchUserFormName("chat");
  };

  const handleHideModalSearch = (e) => {
    setSearchUser({
      ...searchUser,
      searchUserResult: [],
      searchUserName: "",
      showModalSearch: false,
      messageNotifi: "",
    });

    setSearchUserFormName("chat");
  };

  // set height messages
  useEffect(() => {
    // @ts-ignore
    messageContentRef.current.offsetHeight &&
      // @ts-ignore
      setMessageContent({
        ...messageContent,
        heightMessageContent: `${messageContentRef.current.offsetHeight - 50}`,
      });
  }, []);

  // *** reset when click userItem, groupItem
  const resetGroup = () => {
    setInfoGroupItem({});
    setMessageGroupList([]);
    setFormName("chat");
  };

  const resetChat = () => {
    setInfoOtherUser({});
    setMessageList([]);
    setFormName("group");
  };

  const fetchMessagesGroup = async (groupID) => {
    try {
      const response = await axios.get(
        `${API_SERVER_URL}/group/messages/${groupID}`
      );
      setMessageGroupList(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClickGroupItem = (group) => {
    fetchMessagesGroup(group.idGroup);
    setValueGroupName(group.name);

    setInfoGroupItem(group);
    resetChat();

    inputMessageFormRef.current.focus();
  };

  //  handle setting group

  const [searchUserFormName, setSearchUserFormName] = useState("chat");

  const handleShowModalSearchUserGroup = () => {
    setSearchUser({ ...searchUser, showModalSearch: true });
    setSearchUserFormName("group");
  };

  const handleAddUserSearch = (user) => {
    const idMemberList = [user.idUser];
    const idGroup = infoGroupItem.idGroup;
    if (!idMemberList || !idGroup) return;

    postMembersGroup(idMemberList, idGroup);
  };

  const postMembersGroup = async (idMemberList, idGroup) => {
    try {
      const response = await axios.post(
        `${API_SERVER_URL}/group/add/${idGroup}`,
        {
          idMembers: idMemberList,
        }
      );

      handleHideModalSearch();
      const groupMemberList = await fetchAllMemberGroup(infoGroupItem.idGroup);
      setGroupMemberList(groupMemberList);

      setSnackbar({
        isOpen: true,
        message: `Add members successfully!`,
        severity: "success",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const [groupMemberList, setGroupMemberList] = useState([]);
  const [showInforMation, setShowInforMation] = useState(false);

  useEffect(() => {
    const getMemberListGroup = async () => {
      const memberList = await fetchAllMemberGroup(infoGroupItem.idGroup);
      setGroupMemberList(memberList);
    };

    infoGroupItem.idGroup && getMemberListGroup();
  }, [infoGroupItem.idGroup]);

  const handleHideInformation = () => {
    setShowInforMation(false);
  };

  // handle Change name group
  const [valueGroupName, setValueGroupName] = useState("");
  const [disableGroupName, setDisableGroupName] = useState(true);
  const inputGroupNameRef = useRef();
  const formGroupNameRef = useRef();
  const buttonClickEditNameGroup = useRef();

  const isLeaderTeam = (idOwner) => {
    return idOwner === user.id;
  };

  const updateNameGroup = async (idGroup, newName) => {
    try {
      const response = await axios.patch(
        `${API_SERVER_URL}/group/update/${idGroup}`,
        { groupName: newName }
      );

      getGroupList();
      setDisableGroupName(true);
      setInfoGroupItem({ ...infoGroupItem, name: newName });
    } catch (error) {
      console.log(error);
    }
  };

  const updateAvatarGroup = async (idGroup, newAvatar) => {
    try {
      const response = await axios.patch(
        `${API_SERVER_URL}/group/update/${idGroup}`,
        {
          linkAvatar: newAvatar,
        }
      );

      await getGroupList();

      // render new avatar
      setTimeout(() => {
        const ulElement = document.querySelector("#list-chat");
        const liElementActive = ulElement.querySelector("li.active");

        liElementActive.click();
      }, 300);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeNameGroup = (e) => {
    setValueGroupName(e.target.value);
  };
  const handleSubmitFormNameGroup = (e) => {
    e.preventDefault();
    if (!infoGroupItem.idGroup) return;

    if (
      valueGroupName.trim() !== "" &&
      valueGroupName.trim() !== infoGroupItem.name
    ) {
      updateNameGroup(infoGroupItem.idGroup, valueGroupName);
    }
  };

  const handleChangeAvatarGroup = async (e) => {
    if (!infoGroupItem) return;

    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      // @ts-ignore
      const imageBase64 = reader.result.split(",")[1];
      updateAvatarGroup(infoGroupItem.idGroup, imageBase64);
    };

    e.target.value = null;
  };

  // hande click outside element
  useEffect(() => {
    const handleClickOutside = (element) => {
      if (
        !formGroupNameRef.current ||
        !inputGroupNameRef.current ||
        !buttonClickEditNameGroup.current
      )
        return;

      if (
        !formGroupNameRef.current?.contains(element) &&
        !inputGroupNameRef.current.disabled &&
        !buttonClickEditNameGroup.current?.contains(element)
      ) {
        setDisableGroupName(true);
      }
    };

    document.body.addEventListener("click", (e) => {
      handleClickOutside(e.target);
    });

    return document.body.removeEventListener("click", (e) => {
      handleClickOutside(e.target);
    });
  }, [formGroupNameRef, inputGroupNameRef, buttonClickEditNameGroup]);

  const propsFormMessage = {
    userID: user.id,
    otherUserID: infoOtherUser?.id,
    idGroup: infoGroupItem.idGroup,
    socket,
    messageContentRef,
    heightMessageContent,
    inputMessageFormRef,
    formName,
  };

  const propsChatList = {
    userID: user.id,
    socket,
    typeFilterChat,

    userList,
    groupList,
    setGroupList,

    userItem: infoOtherUser,
    groupItem: infoGroupItem,

    onChangeTypeFilter: handleChangeTypeFilterChat,
    onClickUserItem: handleClickUserItem,
    onClickGroupItem: handleClickGroupItem,
    onShowModalSearch: handleShowModalSearch,
    setSnackbar,
  };

  const propsSettingGroup = {
    userID: user.id,
    groupItem: infoGroupItem,
    formName,
    groupMemberList,
    setGroupMemberList,
    onShowModalSearch: handleShowModalSearchUserGroup,
    setShowInforMation,
  };

  const propsInformation = {
    showInfo: showInforMation,
    onHide: handleHideInformation,

    groupItem: infoGroupItem,
    groupMemberList,
  };

  return (
    <div className="w-fluid">
      <div className="row vh-100 mx-0">
        <div className="col-3 group-sidebar flex flex-col px-0">
          <h3 className="text-center py-[60px] px-3 font-bold">Chat</h3>

          <Modal show={showModalSearch} onHide={handleHideModalSearch}>
            <div className="p-3">
              <h3 className="text-[25px] font-medium">Search user</h3>

              <form
                onSubmit={handleSubmitSearchUser}
                className="flex gap-2 ms-4 me-2 my-3 items-center"
              >
                <div className="border border-black rounded-sm p-2 w-100">
                  <input
                    className="w-100 text-[25px]"
                    type="text"
                    placeholder="User name"
                    onChange={handleChangeSearchUser}
                    value={searchUserName}
                  />
                </div>

                <button
                  className="bg-black h-max text-white text-[20px] px-3 py-1 rounded-md"
                  type="submit"
                >
                  Search
                </button>
              </form>

              <ul className="flex flex-col gap-2">
                {searchUserResult?.map((user) => (
                  <li
                    key={user.idUser}
                    className="flex justify-between bg-white items-center rounded-[40px] cursor-pointer"
                  >
                    <div className="flex gap-2 items-center">
                      <div>
                        <img
                          onError={(e) => {
                            e.target.src = avatarDefault;
                          }}
                          src={user.linkAvatar}
                          alt="avatar "
                          className="w-[50px] h-[50px] object-cover rounded-[100%]"
                        />
                      </div>

                      <div>
                        <h5 className="text-lg font-extrabold capitalize">
                          {user.userName}
                        </h5>
                      </div>
                    </div>

                    {searchUserFormName === "chat" && (
                      <button
                        onClick={() => handleClickSearchBtn(user)}
                        type="button"
                        className="bg-[#F56852] text-white rounded-sm text-decoration-none px-3 py-2 text-xl font-medium"
                      >
                        Chat
                      </button>
                    )}

                    {searchUserFormName === "group" && (
                      <button
                        onClick={() => handleAddUserSearch(user)}
                        type="button"
                        className="bg-black text-white rounded-sm text-decoration-none px-3 py-2 text-xl font-medium"
                      >
                        Add
                      </button>
                    )}
                  </li>
                ))}

                {messageNotifi.trim() !== "" && (
                  <li className="font-bold text-[#ff2d2d]">
                    {messageNotifi} !
                  </li>
                )}
              </ul>

              <div className="text-right">
                <button
                  className="text-[25px] font-medium text-[#ff2d2d]"
                  type="button"
                  onClick={handleHideModalSearch}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
          <ChatList data={propsChatList} />
        </div>

        <div className="col-9 px-0  flex flex-col">
          <div className="flex justify-between items-center bg-[#dffffe] py-[30px] px-[20px] shadow-lg">
            <div className="flex gap-2 items-center">
              <div className="position-relative">
                <Link
                  to={infoOtherUser.id && `/other-user/${infoOtherUser.id}`}
                >
                  <img
                    className="w-[90px] h-[90px] object-cover rounded-[100%]"
                    src={
                      infoOtherUser.Avarta ||
                      infoGroupItem.linkAvatar ||
                      avatarDefault
                    }
                    alt="avatar"
                  />
                </Link>

                {formName === "group" && (
                  <div className="position-absolute bg-[#d9d9d9] w-[30px] h-[30px] rounded-full right-0 bottom-0 flex items-center justify-center">
                    <input
                      onChange={handleChangeAvatarGroup}
                      id="file-avatar-group"
                      type="file"
                      className="hidden m-0"
                      disabled={!isLeaderTeam(infoGroupItem.idOwner)}
                    />
                    <label htmlFor="file-avatar-group" className="flex">
                      <CameraAltIcon className="text-[20px]" />
                    </label>
                  </div>
                )}
              </div>
              {formName === null && <h5>Anonymous chatter</h5>}
              {formName === "chat" && <h5>{infoOtherUser.name}</h5>}
              {formName === "group" && (
                <form
                  onSubmit={handleSubmitFormNameGroup}
                  className="flex items-center"
                  ref={formGroupNameRef}
                >
                  <div>
                    <input
                      disabled={disableGroupName}
                      type="text"
                      size={valueGroupName?.length}
                      value={valueGroupName}
                      onChange={handleChangeNameGroup}
                      ref={inputGroupNameRef}
                      autoFocus={true}
                      className={`px-2 py-1 rounded-md ${
                        disableGroupName ? "" : "bg-[#252f31] text-white"
                      }`}
                    />
                  </div>

                  <button
                    onClick={(e) => {
                      if (!isLeaderTeam(infoGroupItem.idOwner)) return;

                      return disableGroupName
                        ? setDisableGroupName(false)
                        : handleSubmitFormNameGroup(e);
                    }}
                    ref={buttonClickEditNameGroup}
                    title={disableGroupName ? "Edit name" : "Save name"}
                    type="button"
                    disabled={
                      valueGroupName === infoGroupItem.name && !disableGroupName
                    }
                    className={
                      valueGroupName?.trim() === infoGroupItem.name &&
                      !disableGroupName
                        ? "cursor-not-allowed text-[#d1deeb]"
                        : disableGroupName
                        ? ""
                        : "text-[#1976d2]"
                    }
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 40 40"
                      fill={
                        valueGroupName.trim() === infoGroupItem?.name &&
                        !disableGroupName
                          ? "#d1deeb"
                          : disableGroupName
                          ? ""
                          : "#1976d2"
                      }
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_373_1556)">
                        <path d="M31.111 33.3337H6.66656V8.88921H21.3554L23.5777 6.66699H6.66656C6.07719 6.66699 5.51196 6.90112 5.09521 7.31787C4.67846 7.73461 4.44434 8.29984 4.44434 8.88921V33.3337C4.44434 33.923 4.67846 34.4883 5.09521 34.905C5.51196 35.3218 6.07719 35.5559 6.66656 35.5559H31.111C31.7004 35.5559 32.2656 35.3218 32.6824 34.905C33.0991 34.4883 33.3332 33.923 33.3332 33.3337V16.667L31.111 18.8892V33.3337Z" />
                        <path d="M37.2555 6.48888L33.511 2.74444C33.3449 2.5778 33.1474 2.4456 32.9301 2.35539C32.7127 2.26518 32.4797 2.21875 32.2444 2.21875C32.009 2.21875 31.776 2.26518 31.5587 2.35539C31.3413 2.4456 31.1439 2.5778 30.9777 2.74444L15.7444 18.0667L14.511 23.4111C14.4585 23.6702 14.464 23.9377 14.5272 24.1943C14.5904 24.451 14.7097 24.6905 14.8765 24.8956C15.0433 25.1006 15.2535 25.2662 15.4919 25.3803C15.7304 25.4944 15.9911 25.5543 16.2555 25.5555C16.3921 25.5705 16.53 25.5705 16.6666 25.5555L22.0555 24.3667L37.2555 9.02221C37.4221 8.85604 37.5543 8.65861 37.6445 8.44126C37.7347 8.2239 37.7812 7.99088 37.7812 7.75555C37.7812 7.52022 37.7347 7.28719 37.6445 7.06984C37.5543 6.85248 37.4221 6.65506 37.2555 6.48888ZM20.8999 22.3111L16.8333 23.2111L17.7777 19.1778L29.2444 7.63333L32.3777 10.7667L20.8999 22.3111ZM33.6333 9.5111L30.4999 6.37777L32.2221 4.62221L35.3777 7.77777L33.6333 9.5111Z" />
                      </g>
                      <defs>
                        <clipPath id="clip0_373_1556">
                          <rect width="40" height="40" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </button>
                </form>
              )}
            </div>

            <SettingGroup data={propsSettingGroup} />
          </div>

          <div
            style={{
              background: `url(${bgMessage}) no-repeat center/cover`,
            }}
            className="flex-grow-1 flex flex-col position-relative"
          >
            <div
              style={{
                overflowY: "auto",
                scrollbarWidth: "none",
                height: `${heightMessageContent}px`,
              }}
              className="flex-grow-1 p-[20px]"
              ref={messageContentRef}
            >
              <ul id="message-content" ref={messageContentUlRef}>
                {formName === "chat" &&
                  messageList?.map((item) =>
                    item.idSend === user.id ? (
                      <div
                        key={item.id}
                        className="h-auto flex flex-col items-end"
                      >
                        <div className="flex gap-2 mb-1">
                          <div className="flex items-center hover-message gap-1">
                            <button
                              style={{
                                border: "none",
                                backgroundColor: "transparent",
                                transition: "all .3s ease-in-out",
                              }}
                              className="d-none"
                              onClick={() => {
                                handleDeleteMessage(item.id);
                              }}
                            >
                              <DeleteIcon />
                            </button>

                            <div className="flex flex-col gap-1 items-end">
                              {item.image && (
                                <div>
                                  <img
                                    className={`h-auto rounded-md ${
                                      item.type === "image"
                                        ? "w-[100px]"
                                        : "w-[30px]"
                                    }`}
                                    src={item.image}
                                  />
                                </div>
                              )}

                              {item.text.trim() !== "" && (
                                <p
                                  style={{
                                    width: "max-content",
                                    overflowWrap: "anywhere",
                                    maxWidth: "250px",
                                  }}
                                  className="break-words bg-[#007AFF] text-white h-auto rounded-[26.14px] p-2 my-auto"
                                >
                                  {item.text}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <time className="text-xs text-black-50">
                          {convertTime(item.sendAt)}
                        </time>
                      </div>
                    ) : (
                      <div key={item.id} className="h-auto mb-2">
                        <div className="flex gap-2 mb-1">
                          <div className="flex gap-1 items-end">
                            <img
                              className="object-fit-cover rounded-circle"
                              style={{ width: "40px", height: "40px" }}
                              src={infoOtherUser.Avarta}
                              alt="avatar other_user"
                            />
                          </div>

                          <div className="flex items-center hover-message gap-1">
                            <div className="flex flex-col gap-1">
                              {item.image && (
                                <div>
                                  <img
                                    className={`h-auto rounded-md ${
                                      item.type === "image"
                                        ? "w-[100px]"
                                        : "w-[30px]"
                                    }`}
                                    src={item.image}
                                  />
                                </div>
                              )}

                              {item.text.trim() !== "" && (
                                <p
                                  style={{
                                    width: "max-content",
                                    overflowWrap: "anywhere",
                                    maxWidth: "250px",
                                  }}
                                  className="break-words bg-[#F2F2F7] h-auto rounded-[26.14px] p-2 my-auto"
                                >
                                  {item.text}
                                </p>
                              )}
                            </div>
                            {/* <button
               style={{
                border: 'none',
                backgroundColor: 'transparent',
                transition: 'all .3s ease-in-out',
               }}
               className='d-none'
               onClick={() => {
                handleDeleteMessage(item.id)
               }}
              >
               <DeleteIcon />
              </button> */}
                          </div>
                        </div>

                        <time className="text-xs text-black-50">
                          {convertTime(item.sendAt)}
                        </time>
                      </div>
                    )
                  )}

                {formName === "group" &&
                  messageGroupList?.map((item) =>
                    item.idSend === user.id ? (
                      <div
                        key={item.id}
                        className="h-auto mb-2 flex flex-col items-end"
                      >
                        <div className="flex gap-2 mb-1">
                          <div className="flex items-center hover-message gap-1">
                            <div className="flex flex-col gap-1 items-end">
                              {item.image.trim() !== "" && (
                                <div>
                                  <img
                                    className={`h-auto rounded-md ${
                                      item.type === "image"
                                        ? "w-[100px]"
                                        : "w-[30px]"
                                    }`}
                                    src={item.image}
                                  />
                                </div>
                              )}

                              {item.content && (
                                <p
                                  style={{
                                    width: "max-content",
                                    overflowWrap: "anywhere",
                                    maxWidth: "250px",
                                  }}
                                  className="break-words bg-[#007AFF] text-white h-auto rounded-[26.14px] p-2 my-auto"
                                >
                                  {item.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <time className="text-xs text-black-50">
                          {convertTime(item.sendAt)}
                        </time>
                      </div>
                    ) : (
                      <div key={item.id} className="h-auto mb-2">
                        <div className="flex gap-2 mb-1">
                          <div className="flex gap-1 items-end">
                            <img
                              className="object-fit-cover rounded-circle"
                              style={{ width: "40px", height: "40px" }}
                              src={item.avt}
                              alt="avatar other_user"
                              onError={(e) => (e.target.src = avatarDefault)}
                            />
                          </div>

                          <div className="flex items-center hover-message gap-1">
                            <div className="flex flex-col gap-1">
                              {item.image.trim() !== "" && (
                                <div>
                                  <h3 className="mb-1 text-[12px] font-light capitalize">
                                    {item.name}
                                  </h3>
                                  <div>
                                    <img
                                      className={`h-auto rounded-md ${
                                        item.type === "image"
                                          ? "w-[100px]"
                                          : "w-[30px]"
                                      }`}
                                      src={item.image}
                                    />
                                  </div>
                                </div>
                              )}

                              {item.content && (
                                <div
                                  style={{
                                    width: "max-content",
                                    overflowWrap: "anywhere",
                                    maxWidth: "250px",
                                  }}
                                  className="break-words bg-[#F2F2F7] h-auto rounded-[26.14px] p-2 my-auto"
                                >
                                  <h3 className="mb-1 text-[12px] font-light capitalize">
                                    {item.name}
                                  </h3>
                                  <p className="font-semibold">
                                    {item.content}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <time className="text-xs text-black-50">
                          {convertTime(item.sendAt)}
                        </time>
                      </div>
                    )
                  )}
              </ul>
            </div>

            <FormMessage {...propsFormMessage} />

            <Information data={propsInformation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Group;
