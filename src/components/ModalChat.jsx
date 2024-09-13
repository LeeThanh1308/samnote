import { useContext, useState } from "react";
import { AppContext } from "../context";
import { useNavigate } from "react-router-dom";

const ModalChat = (props) => {
  const appContext = useContext(AppContext);
  const { user } = appContext;
  const [data, setData] = useState(props.dataMess);
  const navi = useNavigate();
  const performanceData = (arr) => {
    if (arr.length > 6) {
      return arr.slice(0, 6);
    } else {
      return arr;
    }
  };
  const handleNavi = (data) => {
    const user = data.user;
    if (data) {
      navi(`/user/group`, { state: user });
    }
  };
  return (
    <div className="absolute bg-white p-2 right-[40%] w-[500px] h-auto flex flex-col justify-center rounded-[21.4px] max-h-[800px] overflow-y-scroll ">
      {performanceData(data).map((item, index) => (
        <div
          key={`mess ${index}`}
          className="w-full my-2 flex justify-around bg-[#F2F2F7] rounded-[21.4px] cursor-pointer"
          onClick={() => handleNavi(item)}
        >
          <div className="w-[6%]">
            <img
              className="w-[40px] h-[40px] object-cover rounded-full mt-1"
              src={item.user.Avarta}
              alt={item.user.Avarta}
            />
          </div>
          <div
            className="w-[40%] px-2"
            style={{
              borderLeft: "1px solid #333",
              borderRight: "1px solid #333",
            }}
          >
            <div>{item.user.name}</div>
            <div>
              {item.user.id === user.id
                ? `Bạn: ${item.last_text}`
                : item.last_text}
            </div>
          </div>
          <div className="text-xs mt-4">{item.sendAt}</div>
        </div>
      ))}
    </div>
  );
};

export default ModalChat;
