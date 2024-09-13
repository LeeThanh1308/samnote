// @ts-nocheck
import { useContext, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import io from 'socket.io-client'
import { AppContext } from '../context'

import { joiResolver } from '@hookform/resolvers/joi'
import moment from 'moment'
import { useForm } from 'react-hook-form'
import { schemaGroup } from '../utils/schema/schema'

import {
 Accordion,
 AccordionDetails,
 AccordionSummary,
 Avatar,
 Box,
 Button,
 IconButton,
 InputBase,
 List,
 ListItem,
 ListItemSecondaryAction,
 ListItemText,
 Modal,
 TextField,
 Typography,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CancelIcon from '@mui/icons-material/Cancel'
import DeleteIcon from '@mui/icons-material/Delete'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import SearchIcon from '@mui/icons-material/Search'
import SubdirectoryArrowRightSharpIcon from '@mui/icons-material/SubdirectoryArrowRightSharp'
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react'

import axios from 'axios'
import config from '../configs/configs.json'
const { BASE64_URL, API_SERVER_URL } = config

const UserGroup = () => {
 const location = useLocation()

 const [open, setOpen] = useState(false)

 const [message, setMessage] = useState([])
 const [userChat, setUserChat] = useState([])

 const appContext = useContext(AppContext)
 const { setSnackbar, user } = appContext

 const pickerEmojiRef = useRef(null)
 const scrollContainerRef = useRef(null)

 const handleOpen = () => setOpen(true)
 const handleClose = () => setOpen(false)

 // form message
 const [groupList, setGroupList] = useState([])
 const [groupItem, setGroupItem] = useState({})
 const [infoOtherUser, setInfoOtherUser] = useState({})

 const [socket, setSocket] = useState(null)

 useEffect(() => {
  // Kết nối tới server Socket.IO khi component được tạo ra
  const socketIo = io(API_SERVER_URL)

  socketIo.on('connect', () => {
   console.log('Connected to server')
   setSocket(socketIo)
  })

  return () => {
   socketIo.disconnect() // Ngắt kết nối khi component bị xoá
  }
 }, [])

 useEffect(() => {
  if (socket) {
   socket.on('send_message', (result) => {
    const { ReceivedID, SenderID } = result.data
    fetchUserChat()
    formName === 'chat' &&
     getMessageChats(user.id, ReceivedID === user.id ? SenderID : ReceivedID)
   })

   socket.once('chat_group', (result) => {
    console.log('message received from server', result)
   })

   getGroups(user.id)
   fetchUserChat()
  }
 }, [socket])

 useEffect(() => {
  const scrollContainer = scrollContainerRef.current
  scrollContainer.scrollTop = scrollContainer.scrollHeight
 }, [infoOtherUser, groupItem])

 useEffect(() => {
  const scrollContainer = scrollContainerRef.current
  scrollContainer.scrollTop =
   scrollContainer.scrollHeight - scrollContainer.clientHeight
 }, [infoOtherUser, groupItem])

 useEffect(() => {
  const handleClickOutside = (event) => {
   if (
    pickerEmojiRef.current &&
    !pickerEmojiRef.current.contains(event.target)
   ) {
    setShowEmoji(false)
   }
  }

  document.addEventListener('mousedown', handleClickOutside)
  return () => {
   document.removeEventListener('mousedown', handleClickOutside)
  }
 }, [])

 const fetchUserChat = async () => {
  const response = await axios.get(
   `${API_SERVER_URL}/message/list_user_chat1vs1/${user.id}`
  )

  try {
   response.data.data.map((item) => {
    return socket.emit('join_room', { room: item.idRoom })
   })
   setUserChat(response.data.data)
  } catch (error) {
   console.log(error)
  }
 }

 const getGroups = async (idOwner) => {
  try {
   const res = await axios.get(`${API_SERVER_URL}/group/all/${idOwner}`)

   //    console.log('groups:', res.data.data)
   res.data.data.map((item) => {
    if (item.numberMems >= 1) {
     socket.emit('join_room ', { room: item.idGroup })
    }
   })

   setGroupList(res.data.data)
  } catch (err) {
   console.error(err)
  }
 }

 // todo new code form message

 const [formName, setFormName] = useState(null)

 const [messageForm, setMessageForm] = useState({
  content: '',
  image: null,
  emoji: null,
 })
 const { content, image, emoji } = messageForm
 const [showEmoji, setShowEmoji] = useState(false)

 useEffect(() => {
  if (location.state) {
   setInfoOtherUser(location.state)
   getMessageChats(user.id, location.state.id)
  }
 }, [location.state])

 const resetGroup = () => {
  setGroupItem({})
  setMessageGroup([])
  setFormName('chat')
 }

 const resetChat = () => {
  setInfoOtherUser({})
  setMessage([])
  setFormName('group')
 }

 //..........

 const getMessageChats = async (userID, otherUserID) => {
  try {
   const response = await axios.get(
    `${API_SERVER_URL}/message/list_message_chat1vs1/${userID}/${otherUserID}`
   )

   setMessage(response.data.data[0].messages)
  } catch (error) {
   console.log(error)
  }
 }

 const handleUserChatClick = async (otherUser) => {
  if (otherUser.is_seen === 0 && otherUser.idReceive === user.id) {
   fetchUpdateSeenMessage(otherUser.idMessage)
  }

  getMessageChats(user.id, otherUser.user.id)
  setInfoOtherUser(otherUser.user)

  resetGroup()
 }

 // handle convert time, image, emoji, roomID

 const convertTime = (time) => moment(`${time}+0700`).calendar()

 const handleChatLastText = (lastText, idSend) =>
  idSend === user.id ? `Bạn: ${lastText}` : `${lastText}`

 const roomSplit = (idUser, idOther) =>
  idUser > idOther ? `${idOther}#${idUser}` : `${idUser}#${idOther}`

 const convertEmojiToBase64 = (emoji) => {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const context = canvas.getContext('2d')
  context.font = '48px Arial'
  context.fillText(emoji, 0, 48)

  const base64 = canvas.toDataURL().split(',')[1]
  return base64
 }

 //  ** handle form message

 const handleChangeValueMsg = (e) => {
  setMessageForm({
   ...messageForm,
   content: emoji ? '' : e.target.value,
   emoji: null,
  })
 }

 const handleChangeImageMsg = (e) => {
  const reader = new FileReader()

  reader.onload = () => {
   const imageBase64 = reader.result.split(',')[1]
   setMessageForm({ ...messageForm, image: imageBase64 })
  }

  reader.readAsDataURL(e.target.files[0])
  e.target.value = null
 }

 const handleToggleEmoji = () => {
  setShowEmoji((prevState) => !prevState)
 }

 const handleClickEmoji = (data) => {
  setMessageForm({
   ...messageForm,
   content: data.emoji,
   emoji: convertEmojiToBase64(data.emoji),
  })

  setShowEmoji(false)
 }

 const sendMessage = (room, data) => {
  if (socket) {
   // * send message chat
   if (formName === 'chat') {
    socket.emit('send_message', { room, data }) // Gửi sự kiện "send_message" tới server
    setMessageForm({ content: '', image: null, emoji: null })

    // Xử lý logic khi tin nhắn được gửi đi
    getMessageChats(user.id, infoOtherUser.id)
    fetchUserChat()
    return
   }

   // * send message group

   if (formName === 'group') {
    socket.emit('chat_group', { room, data }) // Gửi sự kiện "send_message" tới server

    setMessageForm({ content: '', image: null, emoji: null })

    fetchMessagesGroup(groupItem.idGroup)
    return
   }
  } else {
   console.error('Socket.io not initialized.')
   // Xử lý khi socket chưa được khởi tạo
  }
 }

 const handleSubmitMessage = () => {
  // * submit form chat

  if (formName === 'chat') {
   const roomID = roomSplit(user.id, infoOtherUser.id)

   if (!infoOtherUser.id) return

   const dataForm = {
    idSend: `${user.id}`,
    idReceive: `${infoOtherUser.id}`,
    type: 'text',
    state: '',
    content: content,
   }

   if (image) {
    dataForm.type = 'image'
    dataForm.content = emoji ? '' : content
    dataForm.data = image

    sendMessage(roomID, dataForm)
    return
   }

   if (emoji) {
    dataForm.type = 'icon-image'
    dataForm.content = ''
    dataForm.data = emoji

    sendMessage(roomID, dataForm)
    return
   }

   if (content.trim() !== '') {
    sendMessage(roomID, dataForm)
   }
   return
  }

  // * submit form group chat
  if (formName === 'group') {
   const roomID = groupItem.idGroup

   const dataForm = {
    idSend: `${user.id}`,
    type: 'text',
   }

   if (image) {
    dataForm.type = 'image'
    dataForm.metaData = image

    sendMessage(roomID, dataForm)
    return
   }

   if (emoji) {
    dataForm.type = 'icon-image'
    dataForm.metaData = emoji

    sendMessage(roomID, dataForm)
    return
   }

   if (content.trim() !== '') {
    dataForm.content = content
    sendMessage(roomID, dataForm)
   }
  }

  return null
 }

 const fetchUpdateSeenMessage = async (messageID) => {
  try {
   const response = await axios.post(`${API_SERVER_URL}/message/${messageID}`)
   fetchUserChat()
  } catch (error) {
   console.log(error)
  }
 }

 const handleDeleteMessage = async (messageID) => {
  try {
   const response = await axios.delete(`${API_SERVER_URL}/message/${messageID}`)

   getMessageChats(user.id, infoOtherUser.id)
   fetchUserChat()
  } catch (error) {
   console.log(error)
  }
 }

 // ******** GROUPS ********

 const [messageGroup, setMessageGroup] = useState([])
 const [memberGroup, setMemberGroup] = useState({ gmail: '', id: '' })
 const [memberListGroup, setMemberListGroup] = useState([])

 const {
  register,
  handleSubmit,
  setValue,
  getValues,
  reset,
  formState: { errors },
 } = useForm({
  resolver: joiResolver(schemaGroup),
  defaultValues: { groupName: '', desc: '', members: null },
 })

 const handleGroupClick = async (group) => {
  try {
   fetchMessagesGroup(group.idGroup)
   setGroupItem(group)

   resetChat()
  } catch (err) {
   console.log(err)
  }
 }

 const fetchMessagesGroup = async (groupID) => {
  try {
   const response = await axios.get(
    `${API_SERVER_URL}/group/messages/${groupID}`
   )
   setMessageGroup(response.data.data)
  } catch (error) {
   console.log(error)
  }
 }

 const postGroup = async (dataGroup, userID) => {
  try {
   const response = await axios.post(
    `${API_SERVER_URL}/group/create/${userID}`,
    dataGroup
   )

   handleClose()
   setSnackbar({
    isOpen: true,
    message: `Create group complete`,
    severity: 'success',
   })

   // cập nhật group list
   getGroups(user.id)

   // reset form create group
   reset()
   setMemberListGroup([])
   setMemberGroup({ gmail: '', id: '' })
  } catch (error) {
   setSnackbar({
    isOpen: true,
    message: error.response.data.message,
    severity: 'error',
   })
  }
 }

 const onSubmit = (data) => {
  const { groupName, desc, members } = data

  const group = {
   name: groupName,
   createAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
   idOwner: user.id,
   describe: desc,
   r: 255,
   g: 255,
   b: 255,
   a: 0.99,
   members: members,
  }

  postGroup(group, user.id)
 }

 const handleAddMember = () => {
  const membersChema = getValues('members')
  const { gmail, id } = memberGroup

  const member = { gmail, id, role: 'member' }
  setMemberListGroup([...memberListGroup, member])
  setMemberGroup({ gmail: '', id: '' })

  setValue(
   'members',
   membersChema
    ? [...membersChema, { gmail: gmail, id: id, role: 'member' }]
    : [{ gmail, id: id, role: 'member' }]
  )
 }

 const handleDeleteMember = (index) => {
  setMemberListGroup(memberListGroup.filter((member, idx) => idx !== index))

  const membersChema = getValues('members')
  setValue(
   'members',
   membersChema.filter((member, idx) => idx !== index)
  )
 }

 const handleChangeMemberGroup = (e) =>
  setMemberGroup({ ...memberGroup, [e.target.name]: e.target.value })

 // search message
 const handleSubmitSearchMessage = (e) => {
  e.preventDefault()
  console.log('Search')
 }
 return (
  <div
   className='mb-[3rem] lg:mb-0'
   style={{
    display: 'grid',
    gridTemplateColumns: '50% 50%',
   }}
  >
   <Box
    sx={{
     backgroundColor: 'bgitem.main',
     paddingTop: '10px',
     height: '635px',
    }}
   >
    <Box
     sx={{
      color: 'text.main',
      boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.5)',
      paddingLeft: '10px',
     }}
    >
     <div
      style={{
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'space-between',
       fontWeight: '700',
       fontSize: '20px',
       padding: '10px 10px 20px',
      }}
     >
      Chat
     </div>
     <div
      style={{
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'space-between',
      }}
     >
      <Box
       component='form'
       onSubmit={handleSubmitSearchMessage}
       sx={{
        backgroundColor: '#DADADA',
        display: 'flex',
        alignItems: 'center',
        height: '40px',
        width: '100%',
        borderRadius: '30px',
        margin: '0 10px 10px 0px',
       }}
      >
       <button
        type='submit'
        className='border-none bg-transparent outline-none'
       >
        <SearchIcon sx={{ marginLeft: '15px', color: '#333' }} />
       </button>
       <InputBase
        sx={{ ml: 1, flex: 1, color: '#333' }}
        placeholder='Search Messenger'
        inputProps={{ 'aria-label': 'search google maps' }}
       />
      </Box>
     </div>
    </Box>
    <div className='flex gap-2'>
     <Accordion>
      <AccordionSummary>
       <ExpandMoreIcon />
       <Typography>Chat</Typography>
      </AccordionSummary>
      <AccordionDetails>
       <Box
        sx={{
         maxHeight: '400px',
         overflow: 'auto',
         scrollbarWidth: 'none',
        }}
       >
        {userChat.map((item, index) => {
         return (
          <Box
           key={`chat ${index}`}
           sx={{
            margin: '2px 0',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            color: 'text.main',
            backgroundColor: ' rgba(178, 178, 178, 0.1)',
            borderRadius: '30px',
            '&:hover': {
             backgroundColor: ' rgba(178, 178, 178, 0.3)',
             cursor: 'pointer',
            },
           }}
           onClick={() => handleUserChatClick(item)}
          >
           <Avatar
            src={item.user.Avarta}
            sx={{ width: '30px', height: '30px', margin: '10px' }}
           />
           <div style={{ width: '100%', overflow: 'hidden' }}>
            <strong
             style={{
              padding: 0,
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textTransform: 'capitalize',
             }}
            >
             {item.user.name}
            </strong>
            <p
             style={{ maxWidth: '200px' }}
             className={
              item.is_seen === 0
               ? 'p-0 m-0 whitespace-nowrap overflow-hidden text-ellipsis font-[700]'
               : 'p-0 m-0 whitespace-nowrap overflow-hidden text-ellipsis'
             }
            >
             {handleChatLastText(item.last_text, item.idSend)}
            </p>
           </div>
           <div className='h-full mr-4 flex items-start'>
            <p className='mt-3 text-xs'>{convertTime(item.sendAt)}</p>
           </div>
          </Box>
         )
        })}
       </Box>
      </AccordionDetails>
     </Accordion>

     <Accordion>
      <AccordionSummary
       expandIcon={<AddIcon sx={{ cursor: 'pointer' }} onClick={handleOpen} />}
       aria-controls='panel2a-content'
       id='panel2a-header'
      >
       <ExpandMoreIcon />
       <Typography>Group</Typography>
      </AccordionSummary>
      <AccordionDetails>
       <Box
        sx={{
         maxHeight: '400px',
         overflowY: 'auto',
        }}
       >
        {groupList?.map((item, index) => {
         if (item.numberMems >= 1) {
          return (
           <Box
            key={index}
            sx={{
             display: 'flex',
             justifyContent: 'space-between',
             alignItems: 'center',
             margin: '20px',
             padding: '10px',
             color: 'text.main',
             '&:hover': {
              backgroundColor: '#BFEFFF',
              cursor: 'pointer',
             },
            }}
            onClick={() => handleGroupClick(item)}
           >
            <div className='flex gap-2 items-center'>
             <Avatar
              src={item.linkAvatar}
              sx={{ width: '30px', height: '30px' }}
             />
             <div className='flex flex-col gap-2' style={{ width: '100%' }}>
              <h3 className='text-capitalize fs-6 fw-bold mb-0'>{item.name}</h3>
              {/* <p
               style={{
                padding: 0,
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
               }}
              >
               {msgGroupLast.type}
              </p> */}
             </div>
            </div>

            {/* <p className='mb-0'>{item.numberMems}</p> */}
           </Box>
          )
         } else {
          return null
         }
        })}
       </Box>
      </AccordionDetails>
     </Accordion>
    </div>
   </Box>

   <div
    className='mb-2'
    style={{
     borderLeft: '1px solid black',
     borderRight: '1px solid black',
     height: 'auto',
    }}
   >
    <Box
     sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px',
      color: 'text.main',
      backgroundColor: 'bg.main',
      borderBottom: '1px solid #999',
     }}
    >
     <div style={{ display: 'flex', alignItems: 'center' }}>
      <Link to={`/other-user/${infoOtherUser.id}`}>
       <Avatar
        style={{
         height: '40px',
         width: '40px',
         marginRight: '15px',
        }}
        src={infoOtherUser.Avarta || groupItem.linkAvatar}
        alt='avatar'
       />
      </Link>

      <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
       {infoOtherUser.name || groupItem.name || 'Anonymous chatter'}
      </h3>
     </div>
     <div
      style={{
       display: 'flex',
       flexDirection: 'column',
       justifyContent: 'center',
       alignItems: 'center',
      }}
     ></div>
     <MoreHorizIcon />
    </Box>
    <Box
     ref={scrollContainerRef}
     sx={{
      backgroundColor: 'bgitem.main',
      height: '515px',
      overflow: 'scroll',
      scrollbarWidth: 'none',
      padding: '10px',
     }}
    >
     {/* Đã cập nhật để hiển thị tin nhắn từ server */}
     {messageGroup.length > 0 ? (
      <>
       {messageGroup.map((item) =>
        item.idSend === user.id ? (
         <div key={item.id} className='h-auto mb-2 flex flex-col items-end'>
          <div className='flex gap-2 mb-1'>
           <div className='flex items-center hover-message gap-1'>
            <div className='flex flex-col gap-1 items-end'>
             {item.image.trim() !== '' && (
              <div>
               <img
                className={`h-auto rounded-md ${
                 item.type === 'image' ? 'w-[100px]' : 'w-[30px]'
                }`}
                src={item.image}
               />
              </div>
             )}

             {item.content && (
              <p
               style={{
                width: 'max-content',
                overflowWrap: 'anywhere',
                maxWidth: '250px',
               }}
               className='break-words bg-[#007AFF] text-white h-auto rounded-[26.14px] p-2 my-auto'
              >
               {item.content}
              </p>
             )}
            </div>
           </div>
          </div>

          <time className='text-xs text-black-50'>
           {convertTime(item.sendAt)}
          </time>
         </div>
        ) : (
         <div key={item.id} className='h-auto mb-2'>
          <div className='flex gap-2 mb-1'>
           <div className='flex gap-1 items-end'>
            <img
             className='object-fit-cover rounded-circle'
             style={{ width: '40px', height: '40px' }}
             src={item.avt}
             alt='avatar other_user'
            />
           </div>

           <div className='flex items-center hover-message gap-1'>
            <div className='flex flex-col gap-1'>
             {item.image.trim() !== '' && (
              <div>
               <img
                className={`h-auto rounded-md ${
                 item.type === 'image' ? 'w-[100px]' : 'w-[30px]'
                }`}
                src={item.image}
               />
              </div>
             )}

             {item.content && (
              <p
               style={{
                width: 'max-content',
                overflowWrap: 'anywhere',
                maxWidth: '250px',
               }}
               className='break-words bg-[#F2F2F7] h-auto rounded-[26.14px] p-2 my-auto'
              >
               {item.content}
              </p>
             )}
            </div>
           </div>
          </div>

          <time className='text-xs text-black-50'>
           {convertTime(item.sendAt)}
          </time>
         </div>
        )
       )}
      </>
     ) : (
      <>
       {message.map((item) =>
        item.idSend === user.id ? (
         <div key={item.id} className='h-auto mb-2 flex flex-col items-end'>
          <div className='flex gap-2 mb-1'>
           <div className='flex items-center hover-message gap-1'>
            <button
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
            </button>

            <div className='flex flex-col gap-1 items-end'>
             {item.image && (
              <div>
               <img
                className={`h-auto rounded-md ${
                 item.type === 'image' ? 'w-[100px]' : 'w-[30px]'
                }`}
                src={item.image}
               />
              </div>
             )}

             {item.text.trim() !== '' && (
              <p
               style={{
                width: 'max-content',
                overflowWrap: 'anywhere',
                maxWidth: '250px',
               }}
               className='break-words bg-[#007AFF] text-white h-auto rounded-[26.14px] p-2 my-auto'
              >
               {item.text}
              </p>
             )}
            </div>
           </div>
          </div>

          <time className='text-xs text-black-50'>
           {convertTime(item.sendAt)}
          </time>
         </div>
        ) : (
         <div key={item.id} className='h-auto mb-2'>
          <div className='flex gap-2 mb-1'>
           <div className='flex gap-1 items-end'>
            <img
             className='object-fit-cover rounded-circle'
             style={{ width: '40px', height: '40px' }}
             src={infoOtherUser.Avarta}
             alt='avatar other_user'
            />
           </div>

           <div className='flex items-center hover-message gap-1'>
            <div className='flex flex-col gap-1'>
             {item.image && (
              <div>
               <img
                className={`h-auto rounded-md ${
                 item.type === 'image' ? 'w-[100px]' : 'w-[30px]'
                }`}
                src={item.image}
               />
              </div>
             )}

             {item.text.trim() !== '' && (
              <p
               style={{
                width: 'max-content',
                overflowWrap: 'anywhere',
                maxWidth: '250px',
               }}
               className='break-words bg-[#F2F2F7] h-auto rounded-[26.14px] p-2 my-auto'
              >
               {item.text}
              </p>
             )}
            </div>
            <button
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
            </button>
           </div>
          </div>

          <time className='text-xs text-black-50'>
           {convertTime(item.sendAt)}
          </time>
         </div>
        )
       )}
      </>
     )}
    </Box>

    <form
     onSubmit={(e) => {
      e.preventDefault()
      handleSubmitMessage()
     }}
     className='form-message position-relative'
    >
     <div>
      <button type='button' className='border-none' onClick={handleToggleEmoji}>
       <EmojiEmotionsIcon />
      </button>
     </div>

     {showEmoji && (
      <div className='position-absolute bottom-[100%] left-0'>
       <EmojiPicker
        width='20em'
        onEmojiClick={handleClickEmoji}
        emojiStyle={EmojiStyle.FACEBOOK}
        lazyLoadEmojis={true}
       />
      </div>
     )}

     <div className='w-100'>
      {image && (
       <div style={{ width: 'max-content' }} className='mb-1 position-relative'>
        <button
         className='delete-image'
         onClick={() => setMessageForm({ ...messageForm, image: null })}
        >
         <CancelIcon />
        </button>

        <img
         style={{ width: '80px', height: '50px', objectFit: 'cover' }}
         src={`${BASE64_URL}${image}`}
         alt='image message'
         className='rounded'
        />
       </div>
      )}

      <input
       type='text'
       placeholder='Type your message...'
       onChange={handleChangeValueMsg}
       value={messageForm.content}
      />
     </div>

     <div>
      <input
       id='file'
       type='file'
       className='hidden m-0'
       onChange={handleChangeImageMsg}
      />
      <label htmlFor='file'>
       <AttachFileIcon />
      </label>
     </div>

     <button
      type='submit'
      className={content || image || emoji ? 'text-[#1976d2]' : 'text-black'}
     >
      <SubdirectoryArrowRightSharpIcon sx={{ cursor: 'pointer' }} />
     </button>
    </form>
   </div>
   <Modal
    open={open}
    onClose={handleClose}
    aria-labelledby='modal-modal-title'
    aria-describedby='modal-modal-description'
   >
    <Box
     component='form'
     onSubmit={handleSubmit(onSubmit)}
     sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      bgcolor: 'background.paper',
      border: '2px solid #000',
      boxShadow: 24,
      p: 4,
     }}
    >
     <Typography id='modal-modal-title' variant='h6' component='h2'>
      Create Group
     </Typography>
     <TextField
      fullWidth
      label='Group Name'
      type='text'
      variant='outlined'
      margin='normal'
      {...register('groupName')}
     />
     {errors.groupName && (
      <Box sx={{ mt: 1, color: 'red' }}>{errors.groupName.message}</Box>
     )}
     <TextField
      fullWidth
      label='Description'
      type='text'
      variant='outlined'
      margin='normal'
      {...register('desc')}
     />
     {errors.desc && (
      <Box sx={{ mt: 1, color: 'red' }}>{errors.desc.message}</Box>
     )}
     <List>
      {memberListGroup?.map((member, index) => (
       <ListItem key={index}>
        <ListItemText primary={member.gmail} secondary={member.role} />
        <ListItemSecondaryAction>
         <IconButton edge='end' onClick={() => handleDeleteMember(index)}>
          <DeleteIcon />
         </IconButton>
        </ListItemSecondaryAction>
       </ListItem>
      ))}
     </List>
     <Box
      sx={{
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'space-between',
       mt: 2,
       gap: '5px',
      }}
     >
      <TextField
       label='Member Email'
       name='gmail'
       type='email'
       fullWidth
       onChange={handleChangeMemberGroup}
       value={memberGroup.gmail}
      />

      <TextField
       label='Member ID'
       name='id'
       type='number'
       fullWidth
       onChange={handleChangeMemberGroup}
       value={memberGroup.id}
      />

      <IconButton
       disabled={
        memberGroup.gmail.trim() !== '' && memberGroup.id.trim() !== ''
         ? false
         : true
       }
       onClick={handleAddMember}
      >
       <AddIcon />
      </IconButton>
     </Box>
     {errors.members && (
      <Box sx={{ mt: 1, color: 'red' }}>{errors.members.message}</Box>
     )}
     <Box sx={{ mt: 3, textAlign: 'right' }}>
      <Button type='submit' variant='contained' color='primary'>
       Create
      </Button>
     </Box>
    </Box>
   </Modal>
  </div>
 )
}

export default UserGroup
