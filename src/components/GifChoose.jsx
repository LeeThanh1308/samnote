import { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, CircularProgress, TextField } from "@mui/material";

function GiphySearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [gifs, setGifs] = useState([]);
  const [selectedGif, setSelectedGif] = useState(null); // State để theo dõi GIF được chọn
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_KEY = "3f9X5UA8I0bbK3h9fwysbiEbluBM6JrC"; // Thay thế bằng API key của bạn

  // Hàm tìm kiếm hoặc tải GIFs phổ biến
  const fetchGifs = async (query) => {
    setLoading(true); // Bắt đầu tải dữ liệu
    setError(null); // Xóa thông báo lỗi trước đó
    setSelectedGif(null); // Xóa GIF đã chọn khi tìm kiếm mới
    const timeoutId = setTimeout(() => {
      setError("Loading took too long. Please try again later.");
      setLoading(false);
    }, 5000); // 5 giây

    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/${
          query ? "search" : "trending"
        }?api_key=${API_KEY}&q=${query || ""}&limit=10`
      );
      const data = await response.json();
      setGifs(data.data);
    } catch (error) {
      console.error("Error fetching GIFs:", error);
      setError("Failed to load GIFs. Please try again later.");
    } finally {
      clearTimeout(timeoutId); // Dọn dẹp thời gian chờ khi hoàn tất
      setLoading(false); // Kết thúc việc tải dữ liệu
    }
  };

  // Hàm gọi khi nhấn nút tìm kiếm
  const handleSearch = () => {
    fetchGifs(searchTerm.trim());
  };

  // Sử dụng useEffect để tải GIFs phổ biến khi trang được tải
  useEffect(() => {
    fetchGifs(); // Gọi fetchGifs mà không có từ khóa để tải GIFs phổ biến mặc định
  }, []);

  // Hàm xử lý khi người dùng chọn một GIF
  const handleGifClick = (gif) => {
    setSelectedGif(gif); // Đặt GIF đã chọn vào state
    console.log("GIF Information:", {
      id: gif.id,
      title: gif.title,
      url: gif.url,
      image: gif.images.fixed_height.url,
    });
  };

  return (
    <div className="max-h-[500px] w-full">
      <div className="flex flex-row w-full items-center justify-center">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#999",
            borderRadius: "30px",
            height: "40px",
            margin: "10px 0",
            width: "fit-content",
            justifyContent: "center",
            paddingLeft: "10px",
          }}
        >
          <TextField
            type="text"
            value={searchTerm}
            id="standard-basic"
            variant="standard"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for GIFs"
            sx={{
              width: "90%",
              border: "none",
              margin: "0 0 0px 10px",
              input: { color: "#000" },
            }}
          />
          <IconButton disabled={loading}>
            {loading ? (
              <CircularProgress size={24} className="mr-1 my-1" />
            ) : (
              <SearchIcon className="mr-1 my-1" onClick={handleSearch} />
            )}
          </IconButton>
        </div>
      </div>
      <div className="">
        {error ? (
          <p className="text-center w-full text-red-500">{error}</p>
        ) : selectedGif ? (
          <img
            key={selectedGif.id}
            src={selectedGif.images.fixed_height.url}
            alt={selectedGif.title}
            onClick={() => handleGifClick(selectedGif)}
            style={{ cursor: "pointer", margin: "10px", borderRadius: "4px" }}
          />
        ) : gifs.length > 0 ? (
          gifs.map((gif) => (
            <img
              key={gif.id}
              src={gif.images.fixed_height.url}
              alt={gif.title}
              onClick={() => handleGifClick(gif)}
              style={{ cursor: "pointer", margin: "10px", borderRadius: "4px" }}
            />
          ))
        ) : (
          <p className="text-center">loading...</p>
        )}
      </div>
    </div>
  );
}

export default GiphySearch;
