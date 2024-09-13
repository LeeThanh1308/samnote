import { useEffect, useState } from "react";
import api from "../api";
import "./modalComments.css";

const NoteComponent = ({ noteText }) => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: noteText,
      }}
    />
  );
};

function ModalComments(props) {
  const [info, setInfo] = useState(props.data);
  const [user, setUser] = useState(props.userInfomations);
  const [comments, setComments] = useState([]);
  const [userComment, setUserComment] = useState({
    id: 0,
    Avarta: "",
  });
  const [valueInput, setValueInput] = useState("");
  const [reloadComment, setReloadComment] = useState(false);
  // const convertDay = () => {
  //   const createAt = info.createAt.split(" ").slice(0, 1);
  //   console.log(createAt);
  //   const day = createAt[0].split("-");
  //   console.log(day);
  //   switch (day[1]) {
  //     case 1:
  //       return `Create at ${day[2]}st, Jan ${day[0]}`;
  //     case 2:
  //       return `Create at ${day[2]}st, Feb ${day[0]}`;
  //     case 3:
  //       return `Create at ${day[2]}st, Mar ${day[0]}`;
  //     case 4:
  //       return `Create at ${day[2]}st, Apr ${day[0]}`;
  //     case 5:
  //       return `Create at ${day[2]}st, May ${day[0]}`;
  //     case 6:
  //       return `Create at ${day[2]}st, June ${day[0]}`;
  //     case 7:
  //       return `Create at ${day[2]}st, July ${day[0]}`;
  //     case 8:
  //       return `Create at ${day[2]}st, Aug ${day[0]}`;
  //     case 9:
  //       return `Create at ${day[2]}st, Sep ${day[0]}`;
  //     case 10:
  //       return `Create at ${day[2]}st, Oct ${day[0]}`;
  //     case 11:
  //       return `Create at ${day[2]}st, Nov ${day[0]}`;
  //     case 12:
  //       return `Create at ${day[2]}st, Dec ${day[0]}`;
  //     default:
  //       break;
  //   }
  // };
  console.log(info);
  console.log(props.userInfomations);
  useEffect(() => {
    const userInLocalStorage = localStorage.getItem("USER");
    if (userInLocalStorage) {
      setUserComment(JSON.parse(userInLocalStorage));
    }

    const fetchComments = async () => {
      const response = await api.get(
        `https://samnote.mangasocial.online/notes/notes-comment/${info.idNote}`
      );
      if (response && response.data.status === 200) {
        setComments(response.data.data);
      }
    };

    fetchComments();
  }, [reloadComment]);

  console.log(comments);

  const getTimeDifference = (time1, time2) => {
    const diffInMs = new Date(time2).getTime() - new Date(time1).getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return `now`;
    } else if (diffInHours < 1) {
      return `${diffInMinutes} min ago`;
    } else if (diffInDays < 1) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays < 30) {
      return `${diffInDays} day ago`;
    } else {
      return `more 30 day`;
    }
  };

  const handleSendComment = async () => {
    const time = new Date();
    const timeIOS = time.toISOString();
    console.log(typeof time);
    const rawData = {
      parent_id: false,
      sendAt: timeIOS,
      content: valueInput,
      idNote: +info.idNote,
      idUser: +userComment.id,
    };
    const response = await api.post(
      `/notes/notes-comment/${info.idNote}`,
      rawData
    );
    if (response && response.data.status === 200) {
      console.log(response.data);
      if (reloadComment === false) {
        setReloadComment(true);
      } else {
        setReloadComment(false);
      }
      setValueInput("");
    }
  };
  console.log(valueInput);
  console.log(reloadComment);
  return (
    <div className="fixed z-10 inset-0 w-full overflow-y-auto">
      <div className="flex items-center justify-center w-full h-full min-h-screen">
        <div className="bg-white flex justify-between items-center flex-col rounded-lg shadow-lg w-full max-w-4xl h-[95%] max-h-screen p-6 relative z-20 overflow-hidden">
          <div className="flex justify-between items-center mb-4 w-[95%]">
            <h2 className="text-2xl font-bold">Post of {user.name}</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={props.toggleModal}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="w-[95%] max-h-full overflow-y-auto h-auto mb-2 flex flex-col items-center">
            <div className="w-[95%] h-auto my-3">
              <div className="w-full h-[50%] flex justify-between">
                <div className="w-[35%] h-[30px] flex justify-around">
                  <img
                    className="w-[60px] h-[60px] rounded-full object-cover"
                    src={user.Avarta}
                    alt="Avarta"
                  />
                  <div>
                    <span className="text-xl">{user.name}</span>
                    <br />
                    <span className="text-xs">Create at {info.createAt}</span>
                  </div>
                </div>
                <div className="right">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M42 24L28 10V18C14 20 8 30 6 40C11 33 18 29.8 28 29.8V38L42 24Z"
                      fill="black"
                    />
                  </svg>
                </div>
              </div>
              <div className="w-full flex flex-col items-center">
                <div className="w-[95%] h-auto">
                  <span className="font-[700] text-xl">{info.title}</span>
                </div>
                <br />
                <div className="w-[95%] h-auto mx-auto max-w-[1000px]">
                  <p className="break-words">
                    <NoteComponent noteText={info.data} />
                  </p>
                </div>
              </div>
            </div>
            <br />
            {/* comment */}
            <div className="w-full h-full borderTop flex justify-center">
              <div className="w-[95%] h-auto my-auto flex flex-col items-center mt-2">
                {comments.length > 0 ? (
                  <>
                    {comments.map((comment, index) => (
                      <div className="w-full h-auto">
                        <div
                          key={`comment ${index}`}
                          className="w-full h-auto my-2 flex flex-col justify-between items-start"
                        >
                          <div className="w-[16%] flex justify-between">
                            <img
                              className="w-[40px] h-[40px] object-cover rounded-full"
                              src={comment.avt}
                            />
                            <div className="ml-5 flex flex-col">
                              <span className="w-[100px]">
                                {comment.user_name}
                              </span>
                              <span className="w-[100px]">
                                {getTimeDifference(comment.sendAt, new Date())}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-[90%] h-auto mx-auto break-words mb-2">
                          {comment.content}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div>No comments to show...</div>
                )}
              </div>
            </div>
          </div>
          <div
            className="w-full borderTop  h-auto flex justify-center"
            // onClick={props.toggleModal}
          >
            <img
              className="w-[50px] object-cover rounded-full"
              src={userComment.Avarta}
              alt="Avarta"
            />
            <div className="w-[80%] ml-2 ">
              <input
                className="w-full bg-[#F0F2F5] h-[50px]"
                onChange={(e) => setValueInput(e.target.value)}
                type="text"
                value={valueInput}
              />
            </div>
            <div className="ml-6 mt-2 cursor-pointer">
              {valueInput !== "" && (
                <svg
                  width="34"
                  height="37"
                  viewBox="0 0 34 37"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={handleSendComment}
                >
                  <path
                    d="M21.8725 16.4087L25.6826 20.4909H6.375V9.10693H4.25V20.4909C4.25067 21.0945 4.47477 21.6732 4.87314 22.1C5.27151 22.5268 5.81162 22.7669 6.375 22.7676H25.6826L21.8726 26.8498L23.375 28.4596L29.75 21.6293L23.375 14.7989L21.8725 16.4087Z"
                    fill="#1976D2"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity ${
          props.isModalNote ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      ></div>
    </div>
  );
}

export default ModalComments;
