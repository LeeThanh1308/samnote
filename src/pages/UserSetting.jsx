import { useState, useContext, useEffect } from "react";
import {
  Button,
  Container,
  TextField,
  Typography,
  Box,
  CircularProgress,
  MenuItem,
  Select,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AppContext } from "../context";
import PasswordField from "../components/PasswordField";
import api from "../api"; // Make sure to import the API instance

const UserSetting = () => {
  const appContext = useContext(AppContext);
  const { user, setSnackbar } = appContext;

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageCover, setSelectedImageCover] = useState(null);
  const [userInformations, setUserInformations] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const getUserInformation = async () => {
      try {
        const res = await api.get(
          `https://samnote.mangasocial.online/profile/${user.id}`
        );
        setUserInformations(res.data.user);
        setImage(res.data.user?.AvtProfile);
        setImageCover(res.data.user?.Avarta);
      } catch (err) {
        console.error(err);
      }
    };

    getUserInformation();
  }, [user.id, reload]);

  const [image, setImage] = useState(userInformations?.AvtProfile);
  const [imageCover, setImageCover] = useState(userInformations?.Avarta);
  const [selected, setSelected] = useState("");
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword2, setCurrentPassword2] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPw2, setLoadingPw2] = useState(false);
  const [loadingFogotPw2, setLoadingFogotPw2] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [currentCreatePassword2, setCurrentCreatePassword2] = useState(null);
  const [createPassword2, setCreatePassword2] = useState(null);
  const [confimNewPassword2, setConfimNewPassword2] = useState(null);
  const [resultMessage, setResultMessage] = useState(null);
  const [openPw2, setOpenPw2] = useState(true);
  const [openPw, setOpenPw] = useState(true);
  const [openCreatePw2, setOpenCreatePw2] = useState(true);
  const [OpenForgotpw2, setOpenForgotpw2] = useState(false);

  const toggleOpenPw2 = () => {
    setOpenPw2((prevState) => !prevState);
  };
  const toggleOpenCreatePw2 = () => {
    setOpenCreatePw2((prevState) => !prevState);
  };
  const toggleOpenPw = () => {
    setOpenPw((prevState) => !prevState);
  };

  const toggleOpenForgotpw2 = () => {
    setOpenForgotpw2((prevState) => !prevState);
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setSelectedImage(selectedImage);
    if (selectedImage) {
      setImage(URL.createObjectURL(selectedImage));
    }
  };

  const handleImageCoverChange = (e) => {
    const selectedImageCover = e.target.files[0];
    setSelectedImageCover(selectedImageCover);
    if (selectedImageCover) {
      setImageCover(URL.createObjectURL(selectedImageCover));
    }
  };

  // const FogotPw2 = () => {
  //   setFogotPw2Message("");
  // };
  const FogotPw2 = async () => {
    const payload = {
      email: user.gmail,
    };

    try {
      setLoadingFogotPw2(true); // Set loading state to true when starting the request
      const res = await api.post(`/forgot_password_2`, payload);
      toggleOpenForgotpw2();
      setResultMessage(res.data.message);
    } catch (error) {
      setSnackbar({
        isOpen: true,
        message: "Failed to fogot password 2",
        severity: "error",
      });
    } finally {
      setLoadingFogotPw2(false); // Set loading state to false after request is complete
    }
  };

  const handleChange = (event) => {
    setSelected(event.target.value);
  };
  const Email = user.gmail;
  const handleProfileUpdate = async () => {
    try {
      setLoadingProfile(true);
      let updatedImage = image;
      let updatedImageCover = imageCover;
      if (selectedImage) {
        const imageUrl = await uploadToImgBB(selectedImage);
        updatedImage = imageUrl;
      }

      if (selectedImageCover) {
        const imageCoverUrl = await uploadToImgBB(selectedImageCover);
        updatedImageCover = imageCoverUrl;
      }

      const payload = {
        name,
        AvtProfile: updatedImage,
        Avarta: updatedImageCover,
      };

      await api.patch(
        `https://samnote.mangasocial.online/profile/change_Profile/${user.id}`,
        payload
      );

      setImage(updatedImage);
      setImageCover(updatedImageCover);

      setSnackbar({
        isOpen: true,
        message: "Profile updated successfully",
        severity: "success",
      });
      setReload((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      setSnackbar({
        isOpen: true,
        message: "Failed to update profile",
        severity: "error",
      });
    } finally {
      setLoadingProfile(false); // Set loading state to false after request is complete
    }
  };

  const CreatePassWord2 = async () => {
    if (!currentCreatePassword2) {
      setSnackbar({
        isOpen: true,
        message: "Confirm password 2 is not empty",
        severity: "error",
      });
      return;
    }

    if (!createPassword2) {
      setSnackbar({
        isOpen: true,
        message: "Password 2 is not empty",
        severity: "error",
      });
      return;
    }

    const payload = {
      id_user: user.id,
      private_password: createPassword2,
      confirm_private_password: currentCreatePassword2,
    };

    try {
      setLoadingPw2(true); // Set loading state to true when starting the request
      const res = await api.post(`/create_password_2`, payload);
      setResultMessage(res.data.message);
      console.log("resultMessage", resultMessage);
    } catch (error) {
      setSnackbar({
        isOpen: true,
        message: "Failed to create password 2",
        severity: "error",
      });
    } finally {
      setLoadingPw2(false); // Set loading state to false after request is complete
    }
  };

  const handlePasswordUpdate = async () => {
    const payload = {
      gmail: Email,
      password: currentPassword,
      new_password: newPassword,
    };

    if (!currentPassword) {
      setSnackbar({
        isOpen: true,
        message: "Current password cannot be empty",
        severity: "error",
      });
      return;
    }

    if (!newPassword) {
      setSnackbar({
        isOpen: true,
        message: "New password cannot be empty",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        `https://samnote.mangasocial.online/login/change_password/${user.id}`,
        payload
      );
      setResultMessage(response.data.message);
      console.log("payload", payload);
      console.log(response.data);
    } catch (error) {
      console.error(error);
      setSnackbar({
        isOpen: true,
        message: "Failed to update password",
        severity: "error",
      });
    } finally {
      setLoading(false); // Set loading state to false after request is complete
    }
  };

  const UpdatePw2 = async () => {
    const payload = {
      id_user: user.id,
      old_private_password: currentPassword2,
      new_private_password: newPassword2,
      confirm_private_password: confimNewPassword2,
    };

    if (!currentPassword2) {
      setSnackbar({
        isOpen: true,
        message: "Current password 2 cannot be empty",
        severity: "error",
      });
      return;
    }

    if (!newPassword2) {
      setSnackbar({
        isOpen: true,
        message: "New password 2 cannot be empty",
        severity: "error",
      });
      return;
    }
    if (!confimNewPassword2) {
      setSnackbar({
        isOpen: true,
        message: "Confim password 2 cannot be empty",
        severity: "error",
      });
      return;
    }

    try {
      setLoadingPw2(true);
      const response = await api.post(`/reset_password_2`, payload);
      console.log("payload", payload);
      console.log("response.data", response.data);
      setResultMessage(response.data.message);
      console.log("resultMessage", resultMessage);
    } catch (error) {
      console.error(error);
      setSnackbar({
        isOpen: true,
        message: "Failed to update password",
        severity: "error",
      });
    } finally {
      setLoadingPw2(false); // Set loading state to false after request is complete
    }
  };

  const uploadToImgBB = async (imageData) => {
    const apiKey = "0165c1b60ac134636927900246669e17";
    const formData = new FormData();
    formData.append("image", imageData);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (data.data?.url) {
      return data.data.url;
    } else {
      throw new Error("Failed to upload image to ImgBB");
    }
  };

  return (
    <Container>
      <Typography
        variant="h5"
        sx={{
          marginTop: "20px",
          color: "#6a53cc",
          fontSize: "22px",
          fontWeight: 700,
        }}
      >
        Update Profile
      </Typography>
      <Box className="flex mt-2 items-center">
        <Typography className="sm:w-[200px]">Avatar:</Typography>
        <Box className="flex items-center sm:mt-0 mt-3">
          <input
            accept="image/*"
            id="avatar-button-file"
            type="file"
            style={{ display: "none" }}
            onChange={handleImageCoverChange}
          />
          <Box sx={{ marginLeft: 2 }}>
            <img
              src={imageCover}
              alt="Avatar"
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          </Box>
          <label htmlFor="avatar-button-file" style={{ marginLeft: "10px" }}>
            <Button variant="outlined" component="span">
              Change
            </Button>
          </label>
        </Box>
      </Box>
      <Box className="flex items-center mt-[10px]">
        <Typography className="sm:w-[200px]">Name:</Typography>
        <TextField
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="sm:w-[300px] w-[200px]"
        />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
        <Typography className="sm:w-[200px]">Cover image:</Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <input
            accept="image/*"
            id="cover-button-file"
            type="file"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <Box sx={{ marginLeft: 2 }}>
            <img
              src={image}
              alt="Cover"
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </Box>
          <label htmlFor="cover-button-file" style={{ marginLeft: "10px" }}>
            <Button variant="outlined" component="span">
              Change
            </Button>
          </label>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", marginTop: "20px" }}>
        <Typography className="sm:w-[200px] mr-[10px]">Gmail:</Typography>
        <Typography>{user.gmail}</Typography>
      </Box>

      <Button
        sx={{ marginTop: "20px", width: "90px" }}
        variant="contained"
        onClick={handleProfileUpdate}
        disabled={loadingProfile}
      >
        {loadingProfile ? <CircularProgress size={24} /> : "UPDATE"}
      </Button>

      <Box sx={{ marginTop: "20px" }}>
        <Typography
          variant="h5"
          sx={{
            marginTop: "20px",
            color: "#6a53cc",
            fontSize: "22px",
            fontWeight: 700,
          }}
        >
          Update Password
        </Typography>
        <Box className="flex mt-[20px] flex-col sm:flex-row">
          {" "}
          <Typography className="sm:w-[200px]">Password:</Typography>
          {openPw ? (
            <Box className="flex flex-col sm:flex-row  mt-[10px]">
              <TextField required sx={{ width: "300px" }} value="********" />
              <Button
                variant="outlined"
                sx={{ margin: "10px 10px  0", height: "35px", width: "90px" }}
                onClick={toggleOpenPw}
              >
                change
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <PasswordField
                label="Current password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <PasswordField
                label="New password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Box>
                {" "}
                <Button
                  variant="outlined"
                  sx={{ margin: "10px 10px 0 0" }}
                  onClick={toggleOpenPw}
                >
                  cancel
                </Button>
                <Button
                  variant="contained"
                  disabled={loading}
                  sx={{ marginTop: "10px" }}
                  onClick={handlePasswordUpdate}
                >
                  {loading ? <CircularProgress size={24} /> : "UPDATE"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        <Typography
          variant="h5"
          sx={{
            marginTop: "30px",
            color: "#6a53cc",
            fontSize: "22px",
            fontWeight: 700,
          }}
        >
          Update Password 2
        </Typography>{" "}
        <Box className="flex mt-[20px] flex-col sm:flex-row">
          <Typography className="sm:w-[200px] mb-[10px] sm:mb-0">
            Password 2:
          </Typography>
          {user.password_2 !== null ? (
            openPw2 ? (
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <TextField required sx={{ width: "300px" }} value="********" />
                <Box>
                  {" "}
                  <Button
                    variant="outlined"
                    sx={{ margin: "10px 0", height: "35px" }}
                    onClick={toggleOpenPw2}
                  >
                    change
                  </Button>{" "}
                  <Button
                    variant="outlined"
                    sx={{ margin: "10px 0", height: "35px" }}
                    onClick={toggleOpenForgotpw2}
                  >
                    fogot password
                  </Button>
                  {OpenForgotpw2 ? (
                    <Box className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.4)] flex items-center justify-center flex-col">
                      <Box className="flex flex-col relative items-center justify-center bg-white h-[120px] w-[500px] pt-[30px] rounded-lg">
                        Are you want to reset password 2
                        <Box className="flex items-center justify-center flex-row pt-[30px] pb-[10px]">
                          <Button
                            variant="outlined"
                            sx={{ margin: "10px " }}
                            onClick={() => toggleOpenForgotpw2()}
                          >
                            cancel
                          </Button>
                          <Button
                            variant="contained"
                            disabled={loadingFogotPw2}
                            sx={{ margin: "10px" }}
                            onClick={() => FogotPw2()}
                          >
                            {loadingFogotPw2 ? (
                              <CircularProgress size={24} />
                            ) : (
                              "ok"
                            )}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    ""
                  )}
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <PasswordField
                  label="Current Password 2"
                  placeholder="Enter current password 2"
                  value={currentPassword2}
                  onChange={(e) => setCurrentPassword2(e.target.value)}
                />

                <PasswordField
                  label="New Password 2"
                  placeholder="Enter new password 2"
                  value={newPassword2}
                  onChange={(e) => setNewPassword2(e.target.value)}
                />
                <PasswordField
                  label="Confim new password 2"
                  placeholder="Confim new password 2"
                  value={confimNewPassword2}
                  onChange={(e) => setConfimNewPassword2(e.target.value)}
                />
                <Box>
                  {" "}
                  <Button
                    variant="outlined"
                    sx={{ margin: "10px 10px 0 0" }}
                    onClick={toggleOpenPw2}
                  >
                    cancel
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ marginTop: "10px", width: "90px" }}
                    disabled={loadingPw2}
                    onClick={UpdatePw2}
                  >
                    {loadingPw2 ? <CircularProgress size={24} /> : "UPDATE"}
                  </Button>
                </Box>
              </Box>
            )
          ) : openCreatePw2 ? (
            <Button
              variant="contained"
              sx={{ marginTop: "10px" }}
              onClick={toggleOpenCreatePw2}
            >
              create
            </Button>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {" "}
              <PasswordField
                label="New Password 2"
                placeholder="Enter your password 2"
                value={createPassword2}
                onChange={(e) => setCreatePassword2(e.target.value)}
              />
              <PasswordField
                label="Confim Password 2"
                placeholder="Confim your password 2"
                value={currentCreatePassword2}
                onChange={(e) => setCurrentCreatePassword2(e.target.value)}
              />
              <Box>
                {" "}
                <Button
                  variant="outlined"
                  sx={{ margin: "10px 10px 0 0" }}
                  onClick={toggleOpenCreatePw2}
                >
                  cancel
                </Button>
                <Button
                  disabled={loadingPw2}
                  variant="contained"
                  sx={{ margin: "10px 10px 0", width: "90px" }}
                  onClick={CreatePassWord2}
                >
                  {loadingPw2 ? <CircularProgress size={24} /> : "Create"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <Typography
        variant="h5"
        sx={{
          margin: "25px 0 20px",
          color: "#6a53cc",
          fontSize: "22px",
          fontWeight: 700,
        }}
      >
        General
      </Typography>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography className="sm:w-[200px]">Default screen:</Typography>
          <Select
            value={selected}
            onChange={handleChange}
            sx={{ minWidth: "150px" }}
          >
            <MenuItem value="calendar">Calendar</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
            <MenuItem value="deleted">Deleted</MenuItem>
            <MenuItem value="settings">Settings</MenuItem>
          </Select>
        </Box>
        <Typography>Default color:</Typography>
      </Box>
      <Typography
        variant="h5"
        sx={{
          margin: "20px 0",
          color: "#6a53cc",
          fontSize: "22px",
          fontWeight: 700,
        }}
      >
        Online Sync & Backup
      </Typography>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ width: "300px" }}>Sync on launch:</Typography>
          <CheckCircleOutlineIcon />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", marginTop: "20px" }}>
          <Typography sx={{ width: "300px" }}>Auto backup:</Typography>
          <CheckCircleOutlineIcon />
        </Box>
      </Box>
      {resultMessage !== null ? (
        <Box className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.4)] flex items-center justify-center flex-col">
          <Box className="flex relative items-center justify-center bg-white h-[120px] w-[500px] pb-[50px] rounded-lg">
            {" "}
            {resultMessage}
            <Button
              className="absolute bottom-0 "
              variant="contained"
              sx={{ margin: "10px" }}
              onClick={() => setResultMessage(null)}
            >
              ok
            </Button>
          </Box>
        </Box>
      ) : (
        ""
      )}
    </Container>
  );
};

export default UserSetting;
