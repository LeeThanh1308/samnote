import React, { useContext, useState } from "react";
import axios from "axios";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import PasswordField from "../components/PasswordField";
import { AppContext } from "../context";
import { TOKEN, USER } from "../constant";
import api from "../api";

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 6,
};

const LOGIN = 1;
const REGISTER = 2;
const FORGOT_PASSWORD = 3;
const RESET_PASSWORD = 4;

const Login = () => {
  const [content, setContent] = useState(1);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerGmail, setRegisterGmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [forgotPassword, setForgotPassword] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const [openDialog, setOpenDialog] = useState(false);
  const handleClickOpenDialog = () => {
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const appContext = useContext(AppContext);
  const { setUser } = appContext;
  const { setSnackbar } = appContext;

  const renderContent = () => {
    if (content === LOGIN) {
      return (
        <>
          <Typography variant="h4" className="uppercase">
            Sign In
          </Typography>
          <TextField
            label="Email address or username"
            variant="outlined"
            className="w-full rounded-full"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <PasswordField
            label="Password"
            placeholder="Enter current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="contained"
            size="large"
            className="bg-[#5BE260] w-full text-center text-black"
            onClick={handleLogin}
          >
            login
          </Button>
          <CenteredNotification
            isOpen={notification.isOpen}
            message={notification.message}
            handleClose={handleCloseNotification}
          />
          <Button
            variant="contained"
            className="bg-[#CBCDCF] w-full text-[#08174E]"
            onClick={() => (handleShowForgotPassword(), setOpenModal(true))}
          >
            i forgot my password
          </Button>
        </>
      );
    }
    if (content === REGISTER) {
      return (
        <>
          <Typography variant="h5" className="uppercase">
            Create Account
          </Typography>
          <TextField
            label="Name"
            variant="outlined"
            className="w-full rounded-full"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
          />
          <TextField
            label="Gmail"
            variant="outlined"
            className="w-full"
            type="email"
            value={registerGmail}
            onChange={(e) => {
              setRegisterGmail(e.target.value);
            }}
          />
          <TextField
            label="Username"
            variant="outlined"
            className="w-full"
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.currentTarget.value)}
          />
          <PasswordField
            label="Password"
            placeholder="Enter current password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
          />
          <Button
            variant="contained"
            size="large"
            className="bg-[#5BE260] w-full text-center text-black"
            onClick={handleRegister}
          >
            {loadingCreate ? <CircularProgress size={24} /> : "create"}
          </Button>
          <CenteredNotification
            isOpen={notification.isOpen}
            message={notification.message}
            handleClose={handleCloseNotification}
          />
          <Button
            variant="contained"
            className="bg-[#CBCDCF] w-full text-[#08174E]"
            onClick={handleShowLogin}
          >
            i already have an account
          </Button>
        </>
      );
    }

    if (content === FORGOT_PASSWORD) {
      return (
        <>
          <Typography variant="h5" className="uppercase">
            Forgot Your Password ?
          </Typography>
          <Typography>
            Please enter your email below and we will send you a password reset
            via email.
          </Typography>
          <TextField
            label="Email address "
            variant="outlined"
            className="w-full rounded-full"
            type="email"
            value={forgotPassword}
            onChange={(e) => setForgotPassword(e.target.value)}
          />

          <Button
            variant="contained"
            size="large"
            className="bg-[#5BE260] w-full text-center text-black"
            onClick={handleForgotPassword}
          >
            submit
          </Button>
          <CenteredNotification
            isOpen={notification.isOpen}
            message={notification.message}
            handleClose={handleCloseNotification}
          />
        </>
      );
    }
  };
  const handleShowLogin = () => {
    setContent(LOGIN);
    setOpenModal(true);
  };
  //------------------
  const CenteredNotification = ({ isOpen, message, handleClose }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className={`p-4 rounded shadow-lg bg-white`}>
          <div className="flex justify-between items-center flex-col">
            <span>{message}</span>
            <button
              onClick={handleClose}
              className={`mt-4 px-4 py-2 rounded-full text-black bg-[#5BE260] font-bold uppercase text-[16px]`}
            >
              ok
            </button>
          </div>
        </div>
      </div>
    );
  };
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    severity: "info",
  });

  const handleCloseNotification = () => {
    setNotification((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };
  //--------------------
  const handleShowRegister = () => {
    setContent(REGISTER);

    setOpenModal(true);
  };

  const handleShowForgotPassword = () => {
    setContent(FORGOT_PASSWORD);
  };

  const handleRegister = () => {
    if (registerName === "") {
      setSnackbar({
        isOpen: true,
        message: "Name is not allowed",
        severity: "error",
      });
    } else if (registerGmail === "") {
      setSnackbar({
        isOpen: true,
        message: "Gmail is not allowed",
        severity: "error",
      });
    } else if (registerUsername === "") {
      setSnackbar({
        isOpen: true,
        message: "UserName is not allowed",
        severity: "error",
      });
    } else if (registerPassword === "") {
      setSnackbar({
        isOpen: true,
        message: "Password is not allowed",
        severity: "error",
      });
    } else {
      const payload = {
        name: registerName,
        gmail: registerGmail,
        user_name: registerUsername,
        password: registerPassword,
      };

      // setRegisterName("");
      // setRegisterGmail("");
      // setRegisterUsername("");
      // setRegisterPassword("");
      console.log(payload);
      const createAccount = async () => {
        try {
          setLoadingCreate(true);
          await api.post(
            `https://samnote.mangasocial.online/register`,
            payload
          );

          setOpenDialog(true);
        } catch (err) {
          if (err.response.data.status == 400) {
            setNotification({
              isOpen: true,
              message: err.response.data.message,
              severity: "success",
            });
          }
          console.log(err);
        } finally {
          setLoadingCreate(false);
        }
      };
      createAccount();
    }
  };

  const handleLogin = async () => {
    const payload = {
      user_name: userName,
      password,
    };
    try {
      const res = await api.post(`/login`, payload);
      setUser(res.data.user);
      localStorage.setItem(USER, JSON.stringify(res.data.user));
      localStorage.setItem(TOKEN, res.data.jwt);
      setUserName("");
      setPassword("");

      window.location.reload();
    } catch (err) {
      if (err.response.data.status == 400) {
        setNotification({
          isOpen: true,
          message: err.response.data.message,
          severity: "success",
        });
      }
      console.log(err);
    }
  };

  const handleForgotPassword = () => {
    const forgotPass = async () => {
      try {
        await api.post(`/resetPasswork`, {
          gmail: forgotPassword,
        });
      } catch (err) {
        console.log(err);
        setNotification({
          isOpen: true,
          message: err.response.data.message,
          severity: "success",
        });
      }
      console.log(JSON.stringify(forgotPassword));
    };
    forgotPass();
  };

  return (
    <Box className="h-screen bg-[url(/loginBackground.png)] bg-cover">
      <Box className="flex flex-col gap-12 top-0 left-0 w-full h-full  justify-center items-center text-center">
        <Box className="flex items-center gap-4">
          <img
            src="/public/logo.png"
            alt=""
            className="lg:w-[100px] lg:h-[92px] md:w-[80px] md:h-[70px] w-[60px] h-[50px]"
          />

          <Typography className="uppercase font-bold text-white lg:text-[70px] md:text-[50px] text-[30px]">
            samnotes
          </Typography>
        </Box>
        <Typography className="text-2xl lg:text-4xl md:text-3xl text-white">
          A place to store and share your ideas. Anytime, anywhere.
        </Typography>
        <Box className="flex gap-3 justify-center md:flex-row flex-col">
          <Button
            variant="contained"
            className="w-[200px] h-[50px] bg-[#5BE260] text-[20px] font-black  text-black rounded-[30px]"
            onClick={handleShowRegister}
          >
            Get Started
          </Button>

          <Button
            variant="contained"
            className="w-[200px] h-[50px] font-black text-[20px] bg-[#DADADA] text-black rounded-[30px]"
            onClick={handleShowLogin}
          >
            login
          </Button>
          <Modal
            open={openModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box
              sx={styleModal}
              className="opacity-95 rounded-[30px] border-none flex flex-col gap-4 items-center relative"
            >
              <ClearIcon
                className="text-[50px] absolute top-4 right-5 p-2 cursor-pointer text-zinc-500 hover:text-black"
                onClick={handleCloseModal}
              />

              {renderContent()}
            </Box>
          </Modal>
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Account Created</DialogTitle>

            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                We have sent a confirmation letter to your email address. Please
                check your email and access the link. If you haven't received
                our letter, please click the button below to resend.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Box className="w-full flex justify-center gap-3">
                <Button
                  variant="contained"
                  onClick={() => (handleCloseDialog(), setContent(LOGIN))}
                  className="bg-[#5BE260] text-black flex-1"
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCloseDialog}
                  className="text-black bg-[#DADADA] flex-1"
                >
                  resend confirmation mail
                </Button>
              </Box>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
