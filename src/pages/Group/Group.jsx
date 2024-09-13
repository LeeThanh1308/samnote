import './Group.css'
import { useState, useEffect, useContext, useRef } from 'react'

import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import io from 'socket.io-client'
import moment from 'moment'
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react'

import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

import avatarDefault from '../../assets/avatar-default.png'
import bgMessage from '../../assets/img-chat-an-danh.jpg'
import addUser from '../../assets/add-user.png'
import textNote from '../../assets/text-note.png'

import configs from '../../configs/configs.json'
import { AppContext } from '../../context'

import SearchIcon from '@mui/icons-material/Search'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import SendIcon from '@mui/icons-material/Send'
import LogoutIcon from '@mui/icons-material/Logout'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import CancelIcon from '@mui/icons-material/Cancel'

const { BASE64_URL, API_SERVER_URL } = configs

const Group = () => {
 const appContext = useContext(AppContext)
 const { setSnackbar, user } = appContext

 const [socket, setSocket] = useState(null)
 const [userList, setUserList] = useState([])
 const [groupList, setGroupList] = useState([])
 const messagesRef = useRef()

 const [messagesUser, setMessagesUser] = useState([])
 const [infoOtherUser, setInfoOtherUser] = useState(null)
 const inputMessageFormRef = useRef()

 const [typeFilterMessage, setTypeFilterMessage] = useState('All')

 const [formName, setFormName] = useState(null)

 const [messageForm, setMessageForm] = useState({
  content: '',
  image: null,
  emoji: null,
 })
 const { content, image, emoji } = messageForm
 const [showEmoji, setShowEmoji] = useState(false)

 const fetchUserChat = async () => {
  const response = await axios.get(
   `${API_SERVER_URL}/message/list_user_chat1vs1/${user.id}`
  )

  if (typeFilterMessage === 'All') {
   response.data.data.filter((item) => {
    return socket.emit('join_room', { room: item.idRoom })
   })
   setUserList(response.data.data)
   return
  }

  if (typeFilterMessage === 'Unread') {
   setUserList(response.data.data.filter((user) => user.is_seen !== 1))

   response.data.data.filter((item) => {
    if (item.is_seen !== 1)
     return socket.emit('join_room', { room: item.idRoom })
   })
   return
  }

  if (typeFilterMessage === 'Read') {
   setUserList(response.data.data.filter((user) => user.is_seen !== 0))

   response.data.data.filter((item) => {
    if (item.is_seen !== 0)
     return socket.emit('join_room', { room: item.idRoom })
   })
   return
  }
 }

 const getGroups = async (idOwner) => {
  try {
   const res = await axios.get(`${API_SERVER_URL}/group/all/${idOwner}`)
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

 useEffect(() => {
  const socketIo = io(API_SERVER_URL)

  socketIo.on('connect', () => {
   console.log('Connected to server')
   setSocket(socketIo)
  })
 }, [])

 useEffect(() => {
  if (socket) {
   socket.on('send_message', (result) => {
    const { ReceivedID, SenderID } = result.data

    fetchUserChat()
    getMessagesUser(user.id, ReceivedID === user.id ? SenderID : ReceivedID)
    // formName === 'chat' &&
    //  getMessageChats(user.id, ReceivedID === user.id ? SenderID : ReceivedID)
   })

   socket.once('chat_group', (result) => {
    console.log('message received from server', result)
   })

   getGroups(user.id)
   fetchUserChat()
  }
 }, [socket, typeFilterMessage])

 // *********** handle chat user messages
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

 const fetchUpdateSeenMessage = async (messageID) => {
  try {
   const response = await axios.post(`${API_SERVER_URL}/message/${messageID}`)
   fetchUserChat()
  } catch (error) {
   console.log(error)
  }
 }

 const getMessagesUser = async (userID, otherUserID) => {
  try {
   const response = await axios.get(
    `${API_SERVER_URL}/message/list_message_chat1vs1/${userID}/${otherUserID}`
   )

   setMessagesUser(response.data.data[0].messages)
   // @ts-ignore
   messagesRef.current.scrollTop = heightMessages
  } catch (error) {
   console.log(error)
  }
 }

 const handleClickChatUser = (otherUser) => {
  if (otherUser.is_seen === 0 && otherUser.idReceive === user.id) {
   fetchUpdateSeenMessage(otherUser.idMessage)
  }
  getMessagesUser(user.id, otherUser.user.id)
  setInfoOtherUser(otherUser.user)
  //   resetGroup()
 }

 const handleDeleteMessage = async (messageID) => {
  try {
   const response = await axios.delete(`${API_SERVER_URL}/message/${messageID}`)

   getMessagesUser(user.id, infoOtherUser.id)
   fetchUserChat()
  } catch (error) {
   console.log(error)
  }
 }

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
   // @ts-ignore
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
   socket.emit('send_message', { room, data }) // Gửi sự kiện "send_message" tới server
   setMessageForm({ content: '', image: null, emoji: null })

   // Xử lý logic khi tin nhắn được gửi đi
   getMessagesUser(user.id, infoOtherUser.id)
   fetchUserChat()

   messagesRef.current.scrollTop = heightMessages

   // * send message group

   //  if (formName === 'group') {
   //   socket.emit('chat_group', { room, data }) // Gửi sự kiện "send_message" tới server

   //   setMessageForm({ content: '', image: null, emoji: null })

   //   fetchMessagesGroup(groupItem.idGroup)
   //   return
   //  }
  } else {
   console.error('Socket.io not initialized.')
   // Xử lý khi socket chưa được khởi tạo
  }
 }

 const handleSubmitMessage = (e) => {
  e.preventDefault()
  // * submit form chat

  if (!infoOtherUser?.id) return
  const roomID = roomSplit(user.id, infoOtherUser.id)

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

  // * submit form group chat
  // if (formName === 'group') {
  //  const roomID = groupItem.idGroup

  //  const dataForm = {
  //   idSend: `${user.id}`,
  //   type: 'text',
  //  }

  //  if (image) {
  //   dataForm.type = 'image'
  //   dataForm.metaData = image

  //   sendMessage(roomID, dataForm)
  //   return
  //  }

  //  if (emoji) {
  //   dataForm.type = 'icon-image'
  //   dataForm.metaData = emoji

  //   sendMessage(roomID, dataForm)
  //   return
  //  }

  //  if (content.trim() !== '') {
  //   dataForm.content = content
  //   sendMessage(roomID, dataForm)
  //  }
  // }

  return null
 }

 // search user buy name
 const [userNameSearch, serUserNameSearch] = useState('')
 const [searchUserResult, setSearchUserResult] = useState([])

 const fetchSearchUser = async (userName) => {
  try {
   const url = `${API_SERVER_URL}/group/search_user_by_word`
   const response = await axios.post(url, {
    start_name: userName,
   })

   setSearchUserResult(response.data.data)
  } catch (error) {
   console.error(error)
  }
 }

 const handleChangeSearchUser = (e) => {
  serUserNameSearch(e.target.value)
 }

 const handleSubmitSearchUser = (e) => {
  e.preventDefault()
  if (userNameSearch.trim().split(' ').length !== 1) return

  fetchSearchUser(userNameSearch)
 }

 const handleClickChatBtn = (user) => {
  if (!user) return
  const infoOtherUser = {
   id: user.idUser,
   Avarta: user.linkAvatar,
   name: user.userName,
  }

  setInfoOtherUser(infoOtherUser)
  handleHideModalSearch()

  inputMessageFormRef.current.focus()
 }

 const handleSubmitSearchGroup = (e) => {
  e.preventDefault()
  console.log('search group')
 }

 const handleFilterMessage = (e) => {
  const type = e.target.innerHTML
  if (type === typeFilterMessage) return

  setTypeFilterMessage(type)
 }

 const [showModalSearch, setShowModalSearch] = useState(false)
 const handleShowModalSearch = (e) => {
  setShowModalSearch(true)
 }

 const handleHideModalSearch = (e) => {
  setShowModalSearch(false)
  setSearchUserResult([])
  serUserNameSearch('')
 }

 // set height messages
 const [heightMessages, setHeightMessages] = useState('500')

 useEffect(() => {
  // @ts-ignore
  messagesRef.current.offsetHeight &&
   // @ts-ignore
   setHeightMessages(messagesRef.current.offsetHeight - 50)
 }, [messagesUser])

 return (
  <div className='w-fluid'>
   <div className='row vh-100 mx-0'>
    <div className='col-6 group-sidebar flex flex-col px-0'>
     <h3 className='text-center py-[60px] px-3 font-bold'>Chat</h3>

     <div className='flex gap-2 h-100 flex-grow-1'>
      <Modal show={showModalSearch} onHide={handleHideModalSearch}>
       <div className='p-3'>
        <h3 className='text-[25px] font-medium'>Search user</h3>

        <form
         onSubmit={handleSubmitSearchUser}
         className='flex gap-2 ms-4 me-2 my-3 items-center'
        >
         <div className='border border-black rounded-sm p-2 w-100'>
          <input
           className='w-100 text-[25px]'
           type='text'
           placeholder='User name'
           onChange={handleChangeSearchUser}
           value={userNameSearch}
          />
         </div>

         <button
          className='bg-black h-max text-white text-[20px] px-3 py-1 rounded-md'
          type='submit'
         >
          Search
         </button>
        </form>

        <ul className='flex flex-col gap-2'>
         {searchUserResult?.map((user) => (
          <li
           key={user.idUser}
           className='flex justify-between bg-white items-center rounded-[40px] cursor-pointer'
          >
           <div className='flex gap-2 items-center'>
            <div>
             <img
              onError={(e) => {
               e.target.src = avatarDefault
              }}
              src={user.linkAvatar}
              alt='avatar'
              className='w-[50px] h-[50px] object-cover rounded-[100%]'
             />
            </div>

            <div>
             <h5 className='text-lg font-extrabold capitalize'>
              {user.userName}
             </h5>
            </div>
           </div>

           <button
            onClick={() => handleClickChatBtn(user)}
            type='button'
            className='bg-[#F56852] text-white rounded-sm text-decoration-none px-3 py-2 text-xl font-medium'
           >
            Chat
           </button>
          </li>
         ))}
        </ul>

        <div className='text-right'>
         <button
          className='text-[25px] font-medium text-[#ff2d2d]'
          type='button'
          onClick={handleHideModalSearch}
         >
          Cancel
         </button>
        </div>
       </div>
      </Modal>
      <div className='w-50 search-message px-3 shadow-lg'>
       <div className='flex mt-4 mb-5 justify-between gap-2'>
        <button
         onClick={handleShowModalSearch}
         className='flex gap-2 items-center bg-white p-2 rounded-5 shadow-lg w-100 text-[#686464CC]'
        >
         <SearchIcon />
         Search messenger
         {/* <div className='w-100'>
          <input
           className='outline-none border-none bg-transparent w-100'
           type='text'
           placeholder='Search messenger'
           //  value={messageSearch}
           onChange={handleChangeMessageSearch}
          />
         </div> */}
        </button>

        <button type='button' className=''>
         <img src={addUser} alt='add user' />
        </button>
       </div>

       <div>
        <ul className='flex justify-between group-buttons mb-4'>
         <li>
          <button
           onClick={handleFilterMessage}
           className={typeFilterMessage === 'All' && 'active'}
           type='button'
          >
           All
          </button>
         </li>

         <li>
          <button
           className={typeFilterMessage === 'Unread' && 'active'}
           onClick={handleFilterMessage}
           type='button'
          >
           Unread
          </button>
         </li>

         <li>
          <button
           className={typeFilterMessage === 'Read' && 'active'}
           onClick={handleFilterMessage}
           type='button'
          >
           Read
          </button>
         </li>
        </ul>

        <ul className='flex flex-col gap-4'>
         {userList.length > 0
          ? userList.map((user) => (
             <li
              key={user.idMessage}
              className='flex justify-between bg-white items-center rounded-[40px] cursor-pointer'
              onClick={() => handleClickChatUser(user)}
             >
              <div className='flex gap-2 items-center'>
               <div>
                <img
                 src={user.user.Avarta}
                 alt='avatar'
                 className='w-[50px] h-[50px] object-cover rounded-[100%]'
                />
               </div>

               <div>
                <h5 className='text-lg font-extrabold capitalize'>
                 {user.user.name}
                </h5>
                <p
                 style={{ maxWidth: '200px' }}
                 className={
                  user.is_seen === 0
                   ? 'p-0 m-0 whitespace-nowrap overflow-hidden text-ellipsis font-[600] text-lg'
                   : 'p-0 m-0 whitespace-nowrap overflow-hidden text-ellipsis text-lg'
                 }
                >
                 {handleChatLastText(user.last_text, user.idSend)}
                </p>
               </div>
              </div>

              <div
               className={
                user.is_seen === 0
                 ? 'text-[#ff0404] text-[16px] me-2'
                 : 'text-[#00ff73] text-[16px] me-2'
               }
              >
               {user.is_seen === 0 ? (
                <p className='bg-[#dfdfdf] w-[20px] h-[20px] rounded-full flex items-center justify-center'>
                 1
                </p>
               ) : (
                <CheckIcon />
               )}
              </div>
             </li>
            ))
          : null}
        </ul>
       </div>
      </div>

      <div className='w-50 search-message px-3 shadow-lg'>
       <form
        onSubmit={handleSubmitSearchGroup}
        className='flex mt-4 mb-5 justify-between gap-2'
       >
        <div className='flex gap-2 items-center bg-white p-2 rounded-5 shadow-lg w-100'>
         <button
          className='bg-transparent outline-none border-none'
          type='submit'
         >
          <SearchIcon />
         </button>

         <div className='w-100'>
          <input
           className='outline-none border-none bg-transparent w-100'
           type='text'
           placeholder='Search group'
          />
         </div>
        </div>

        <button type='button' className=''>
         <img src={addUser} alt='add user' />
        </button>
       </form>

       <div>
        <ul className='flex justify-between group-buttons mb-4'>
         <li>
          <button className='active' type='button'>
           All
          </button>
         </li>

         <li>
          <button type='button'>Unread</button>
         </li>

         <li>
          <button type='button'>Read</button>
         </li>
        </ul>

        <ul className='flex flex-col gap-4'>
         <li className='flex justify-between bg-white items-center rounded-[40px]'>
          <div className='flex gap-2 items-center'>
           <div>
            <img
             style={{ width: '50px', height: '50px', objectFit: 'cover' }}
             src={avatarDefault}
             alt='avatar'
            />
           </div>

           <div>
            <h5 className='text-lg font-extrabold'>User name 1</h5>
            <p className='text-lg'>Message 1</p>
           </div>
          </div>

          <div>count 1</div>
         </li>

         <li className='flex justify-between bg-white items-center rounded-[40px]'>
          <div className='flex gap-2 items-center'>
           <div>
            <img
             style={{ width: '50px', height: '50px', objectFit: 'cover' }}
             src={avatarDefault}
             alt='avatar'
            />
           </div>

           <div>
            <h5 className='text-lg font-extrabold'>User name 1</h5>
            <p className='text-lg'>Message 1</p>
           </div>
          </div>

          <div>count 1</div>
         </li>

         <li className='flex justify-between bg-white items-center rounded-[40px]'>
          <div className='flex gap-2 items-center'>
           <div>
            <img
             style={{ width: '50px', height: '50px', objectFit: 'cover' }}
             src={avatarDefault}
             alt='avatar'
            />
           </div>

           <div>
            <h5 className='text-lg font-extrabold'>User name 1</h5>
            <p className='text-lg'>Message 1</p>
           </div>
          </div>

          <div>count 1</div>
         </li>

         <li className='flex justify-between bg-white items-center rounded-[40px]'>
          <div className='flex gap-2 items-center'>
           <div>
            <img
             style={{ width: '50px', height: '50px', objectFit: 'cover' }}
             src={avatarDefault}
             alt='avatar'
            />
           </div>

           <div>
            <h5 className='text-lg font-extrabold'>User name 1</h5>
            <p className='text-lg'>Message 1</p>
           </div>
          </div>

          <div>count 1</div>
         </li>
        </ul>
       </div>
      </div>
     </div>
    </div>

    <div className='col-6 px-0  flex flex-col'>
     <div className='flex justify-between items-center bg-[#dffffe] py-[30px] px-[20px]'>
      <div className='flex gap-2 items-center'>
       <Link to={infoOtherUser && `/other-user/${infoOtherUser.id}`}>
        <img
         className='w-[90px] h-[90px] object-cover rounded-[100%]'
         src={infoOtherUser?.Avarta || avatarDefault}
         alt='avatar'
        />
       </Link>
       <h5>{infoOtherUser?.name || 'Anonymous chatter'}</h5>

       <button>
        <img src={textNote} alt='search user' />
       </button>
      </div>

      <div className='position-relative show-buttons'>
       <button>
        <MoreVertIcon className='text-[40px]' />
       </button>

       <ul className='bg-black p-2 position-absolute top-100 right-[100%] w-max'>
        <li>
         <button className='text-[25px]'>
          <LogoutIcon className='me-2 text-[30px]' /> Quit group
         </button>
        </li>

        <li>
         <button className='text-[25px]'>
          <AddCircleOutlineIcon className='me-2 text-[30px]' /> Add member
         </button>
        </li>

        <li>
         <button className='text-[25px]'>
          <HighlightOffIcon className='me-2 text-[30px]' /> Delete member
         </button>
        </li>
       </ul>
      </div>
     </div>

     <div
      style={{
       background: `url(${bgMessage}) no-repeat center/cover`,
      }}
      className='flex-grow-1 flex flex-col'
     >
      <div
       style={{
        overflowY: 'auto',
        scrollbarWidth: 'none',
        height: `${heightMessages}px`,
       }}
       className='flex-grow-1 p-[20px]'
       ref={messagesRef}
      >
       <ul>
        {messagesUser.length > 0
         ? messagesUser.map((item) =>
            item.idSend === user.id ? (
             <div key={item.id} className='h-auto flex flex-col items-end'>
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
           )
         : null}
       </ul>
      </div>

      <form
       onSubmit={handleSubmitMessage}
       className='flex items-end bg-white mx-5 border rounded-[54px] p-3 mb-5 gap-1 position-relative form-message'
      >
       <button type='button' onClick={handleToggleEmoji}>
        <EmojiEmotionsIcon className='text-[40px] text-[#0095ff]' />
       </button>

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

       <div>
        <input
         onChange={handleChangeImageMsg}
         id='file'
         type='file'
         className='hidden m-0'
        />
        <label htmlFor='file'>
         <AttachFileIcon className='text-[40px] text-[#0095ff]' />
        </label>
       </div>

       <div className='w-100'>
        {image && (
         <div
          style={{ width: 'max-content' }}
          className='mb-1 position-relative'
         >
          <button
           className='delete-image'
           onClick={() => setMessageForm({ ...messageForm, image: null })}
          >
           <CancelIcon />
          </button>

          <img
           style={{ width: '80px', height: '50px', objectFit: 'cover' }}
           src={`${BASE64_URL}${image}`}
           alt='anh message'
           className='rounded'
          />
         </div>
        )}

        <input
         onChange={handleChangeValueMsg}
         type='text'
         className='w-100 h-100'
         placeholder='Type your message...'
         value={content}
         ref={inputMessageFormRef}
        />
       </div>

       <button type='submit'>
        <SendIcon className='text-[40px] text-[#0095ff]' />
       </button>
      </form>
     </div>
    </div>
   </div>
  </div>
 )
}

export default Group
