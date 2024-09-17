import { useContext, useEffect, useRef, useState } from 'react'
import './Group.css'

import axios from 'axios'
import moment from 'moment'
import { Link } from 'react-router-dom'
import io from 'socket.io-client'
import Swal from 'sweetalert2'

import { joiResolver } from '@hookform/resolvers/joi'
import { useForm } from 'react-hook-form'
import { schemaGroup } from '../../utils/schema/schema'

import Modal from 'react-bootstrap/Modal'

import addUser from '../../assets/add-user.png'
import avatarDefault from '../../assets/avatar-default.png'
import bgMessage from '../../assets/img-chat-an-danh.jpg'

import configs from '../../configs/configs.json'
import { AppContext } from '../../context'
import FormMessage from './FormMessage/FormMessage'

import AddIcon from '@mui/icons-material/Add'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import LogoutIcon from '@mui/icons-material/Logout'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import SearchIcon from '@mui/icons-material/Search'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import InfoIcon from '@mui/icons-material/Info'

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
} from '@mui/material'
import Information from './Information/Information'

const { API_SERVER_URL, BASE64_URL } = configs

const Group = () => {
 const appContext = useContext(AppContext)
 const { setSnackbar, user } = appContext

 const [socket, setSocket] = useState(null)

 // var chat users
 const [chatUser, setChatUser] = useState({
  userList: [],
  chatUserRef: useRef(),
  heightChatUser: '300',
 })
 const { userList, chatUserRef, heightChatUser } = chatUser
 const [typeFilterChatUser, setTypeFilterChatUser] = useState('All')
 const [infoOtherUser, setInfoOtherUser] = useState({})
 const [messageList, setMessageList] = useState([])

 // var search user
 const [searchUser, setSearchUser] = useState({
  searchUserName: '',
  searchUserResult: [],
  showModalSearch: false,
  messageNotifi: '',
 })
 const { searchUserName, searchUserResult, showModalSearch, messageNotifi } =
  searchUser

 const [groupList, setGroupList] = useState([])
 const [infoGroupItem, setInfoGroupItem] = useState({})
 const [messageGroupList, setMessageGroupList] = useState([])

 // var content message
 const [messageContent, setMessageContent] = useState({
  messageContentRef: useRef(),
  inputMessageFormRef: useRef(),
  heightMessageContent: '500',
  messageContentUlRef: useRef(),
 })
 const {
  inputMessageFormRef,
  messageContentRef,
  heightMessageContent,
  messageContentUlRef,
 } = messageContent

 const [formName, setFormName] = useState(null)

 const [activeListChatItem, setActiveListChatItem] = useState(false)

 //______________________________________

 const fetchUserChat = async () => {
  const response = await axios.get(
   `${API_SERVER_URL}/message/list_user_chat1vs1/${user.id}`
  )

  if (typeFilterChatUser === 'All') {
   response.data.data.map((item) => {
    return socket.emit('join_room', { room: item.idRoom })
   })

   return setChatUser({ ...chatUser, userList: response.data.data })
  }

  if (typeFilterChatUser === 'Unread') {
   response.data.data.filter((item) => {
    if (item.is_seen !== 1)
     return socket.emit('join_room', { room: item.idRoom })
   })

   return setChatUser({
    ...chatUser,
    userList: response.data.data.filter((user) => user.is_seen !== 1),
   })
  }

  if (typeFilterChatUser === 'Read') {
   response.data.data.filter((item) => {
    if (item.is_seen !== 0)
     return socket.emit('join_room', { room: item.idRoom })
   })

   return setChatUser({
    ...chatUser,
    userList: response.data.data.filter((user) => user.is_seen !== 0),
   })
  }
 }

 const getGroups = async (idOwner) => {
  try {
   const response = await axios.get(`${API_SERVER_URL}/group/all/${idOwner}`)

   if (typeFilterChatUser === 'All') {
    response.data.data.map((item) =>
     socket.emit('join_room', { room: item.idGroup })
    )

    return setGroupList(response.data.data)
   }

   if (typeFilterChatUser === 'Unread') {
    response.data.data.filter((item) => {
     if (
      item.listUserReaded === 0 ||
      !isReadMessageGroup(item.listUserReaded)
     ) {
      return socket.emit('join_room', { room: item.idGroup })
     }
    })

    return setGroupList(
     response.data.data.filter(
      (item) =>
       item.listUserReaded === 0 || !isReadMessageGroup(item.listUserReaded)
     )
    )
   }

   if (typeFilterChatUser === 'Read') {
    response.data.data.filter((item) => {
     if (item.listUserReaded > 0 && isReadMessageGroup(item.listUserReaded)) {
      return socket.emit('join_room', { room: item.idGroup })
     }
    })

    return setGroupList(
     response.data.data.filter((group) =>
      isReadMessageGroup(group.listUserReaded)
     )
    )
   }
  } catch (err) {
   console.error(err)
  }
 }

 useEffect(() => {
  const socketIo = io(API_SERVER_URL)

  socketIo.on('connect', () => {
   console.log('Connected')
   setSocket(socketIo)
  })
 }, [])

 useEffect(() => {
  if (socket) {
   socket.on('send_message', (result) => {
    fetchUserChat()
    console.log('send_message')

    const { ReceivedID, SenderID } = result.data
    if (
     formName === 'chat' &&
     (ReceivedID === infoOtherUser.id || SenderID === infoOtherUser.id)
    ) {
     getMessageList(user.id, ReceivedID === user.id ? SenderID : ReceivedID)
    }
   })

   socket.on('chat_group', (result) => {
    getGroups(user.id)
    if (formName === 'group') {
     fetchMessagesGroup(infoGroupItem.idGroup)
    }
   })

   getGroups(user.id)
   fetchUserChat()

   if (messageContentRef.current && messageContentUlRef.current) {
    messageContentRef.current.scrollTop =
     messageContentUlRef.current.offsetHeight
   }
  }
 }, [
  socket,
  typeFilterChatUser,
  formName,
  messageContentUlRef.current?.offsetHeight,
 ])

 // *********** handle chat user messages
 const handleClickChatUser = (otherUser) => {
  if (otherUser.is_seen === 0 && otherUser.idReceive === user.id) {
   fetchUpdateSeenMessage(otherUser.idMessage)
  }
  getMessageList(user.id, otherUser.user.id)

  setInfoOtherUser(otherUser.user)
  inputMessageFormRef.current.focus()
  resetGroup()
 }

 const handleDeleteMessage = async (messageID) => {
  try {
   const response = await axios.delete(`${API_SERVER_URL}/message/${messageID}`)

   getMessageList(user.id, infoOtherUser.id)
   fetchUserChat()
  } catch (error) {
   console.log(error)
  }
 }

 const fetchUpdateSeenMessage = async (messageID) => {
  try {
   const response = await axios.post(`${API_SERVER_URL}/message/${messageID}`)
   fetchUserChat()
  } catch (error) {
   console.log(error)
  }
 }

 const getMessageList = async (userID, otherUserID) => {
  try {
   const response = await axios.get(
    `${API_SERVER_URL}/message/list_message_chat1vs1/${userID}/${otherUserID}`
   )

   setMessageList(
    response.data.data.length ? response.data.data[0].messages : []
   )
  } catch (error) {
   console.log(error)
  }
 }

 const convertTime = (time) => moment(`${time}+0700`).calendar()

 const handleChatLastText = (lastText, idSend) => {
  return idSend === user.id ? `Bạn: ${lastText}` : `${lastText}`
 }
 // ** search user buy name

 const fetchSearchUser = async (userName) => {
  try {
   const url = `${API_SERVER_URL}/group/search_user_by_word`
   const response = await axios.post(url, {
    start_name: userName,
   })

   setSearchUser({
    ...searchUser,
    searchUserResult: response.data.data ? response.data.data : [],
    messageNotifi: response.data.message ? response.data.message : '',
   })
  } catch (error) {
   console.error(error)
  }
 }

 const postRelation = async (userID, otherUserID) => {
  try {
   const response = await axios.post(`${API_SERVER_URL}/chatblock/${userID}`, {
    idReceive: otherUserID,
   })
  } catch (error) {
   console.log(error)
  }
 }

 const roomSplit = (idUser, idOther) =>
  idUser > idOther ? `${idOther}#${idUser}` : `${idUser}#${idOther}`

 const handleChangeSearchUser = (e) => {
  setSearchUser({ ...searchUser, searchUserName: e.target.value })
 }

 const handleSubmitSearchUser = (e) => {
  e.preventDefault()
  if (
   searchUserName.trim().split(' ').length !== 1 ||
   searchUserName.trim() === ''
  )
   return

  fetchSearchUser(searchUserName)
 }

 const handleClickSearchBtn = (otherUser) => {
  if (!otherUser) return
  const newInfoOtherUser = {
   id: otherUser.idUser,
   Avarta: otherUser.linkAvatar,
   name: otherUser.userName,
  }

  const roomID = roomSplit(user.id, otherUser.idUser)
  socket.emit('join_room', { room: roomID })

  // console.log(socket)

  setFormName('chat')
  setInfoOtherUser(newInfoOtherUser)
  resetGroup()

  postRelation(user.id, otherUser.idUser)

  getMessageList(user.id, otherUser.idUser)

  handleHideModalSearch()
  inputMessageFormRef.current.focus()
 }

 const handleSubmitSearchGroup = (e) => {
  e.preventDefault()
  console.log('search group')
 }

 const handleShowModalSearch = (e) => {
  setSearchUser({ ...searchUser, showModalSearch: true })
  setSearchUserFormName('chat')
 }

 const handleHideModalSearch = (e) => {
  setSearchUser({
   ...searchUser,
   searchUserResult: [],
   searchUserName: '',
   showModalSearch: false,
   messageNotifi: '',
  })

  setSearchUserFormName('chat')
 }

 // * handle filter message
 const handleFilterMessage = (e) => {
  const type = e.target.innerHTML
  if (type === typeFilterChatUser) return

  setTypeFilterChatUser(type)
 }

 // set height messages, height chat messages, height chat group
 useEffect(() => {
  // @ts-ignore
  messageContentRef.current.offsetHeight &&
   // @ts-ignore
   setMessageContent({
    ...messageContent,
    heightMessageContent: `${messageContentRef.current.offsetHeight - 50}`,
   })

  // @ts-ignore
  chatUserRef.current.offsetHeight &&
   // @ts-ignore
   setChatUser({
    ...chatUser,
    heightChatUser: `${chatUserRef.current.offsetHeight}`,
   })
 }, [])

 // *** handle group

 const resetGroup = () => {
  setInfoGroupItem({})
  setMessageGroupList([])
  setFormName('chat')
 }

 const resetChat = () => {
  setInfoOtherUser({})
  setMessageList([])
  setFormName('group')
 }

 // *********** handle group

 const [memberGroup, setMemberGroup] = useState({ gmail: '', id: '' })
 const [memberListGroup, setMemberListGroup] = useState([])

 const [showModalCreateGroup, setShowModalCreateGroup] = useState(false)

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

 const resetModalCreateGroup = () => {
  setMemberGroup({ gmail: '', id: '' })
  setMemberListGroup([])
  reset()
 }

 const fetchMessagesGroup = async (groupID) => {
  try {
   const response = await axios.get(
    `${API_SERVER_URL}/group/messages/${groupID}`
   )
   setMessageGroupList(response.data.data)
  } catch (error) {
   console.log(error)
  }
 }

 const handleClickGroupItem = (group) => {
  fetchMessagesGroup(group.idGroup)
  setValueGroupName(group.name)
  setNewAvatarGroup(null)

  setInfoGroupItem(group)
  resetChat()
  inputMessageFormRef.current.focus()
 }

 const handleShowModalCreateGroup = () => {
  setShowModalCreateGroup(true)
 }

 const handleHideModalCreateGroup = () => {
  setShowModalCreateGroup(false)
  resetModalCreateGroup()
 }

 const postGroup = async (dataGroup, userID) => {
  try {
   const response = await axios.post(
    `${API_SERVER_URL}/group/create/${userID}`,
    dataGroup
   )
   setSnackbar({
    isOpen: true,
    message: `Create group complete`,
    severity: 'success',
   })

   // cập nhật group list
   getGroups(userID)

   // reset form create group
   setShowModalCreateGroup(false)
   resetModalCreateGroup()
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
   // info change
   name: groupName,
   members: members,
   describe: desc,

   //  info constant
   createAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
   idOwner: user.id,
   r: 255,
   g: 255,
   b: 255,
   a: 0.99,
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

 // props form message
 const propsFormMessage = {
  userID: user.id,
  otherUserID: infoOtherUser?.id,
  idGroup: infoGroupItem.idGroup,
  socket,
  messageContentRef,
  heightMessageContent,
  inputMessageFormRef,
  formName,
 }

 //  handle buttons group
 const [showButtonsGroup, setShowButtonsGroup] = useState(false)
 const ulElementButtonsGroupRef = useRef()
 const showButtonsGroupRef = useRef()
 const [typeButtonGroup, setTypeButtonGroup] = useState(null)

 const fetchQuitGroup = async (idMem) => {
  try {
   const response = await axios.delete(
    `https://samnote.mangasocial.online/group/quit/${idMem}`
   )

   fetchAllMemberGroup(infoGroupItem.idGroup)
   //  setShowModalMemberList(false)
  } catch (error) {
   console.error(error)
  }
 }

 const handleQuitGroup = () => {
  setTypeButtonGroup('quit')

  if (infoGroupItem.idOwner === user.id) {
   return Swal.fire({
    icon: 'warning',
    title: 'You are the team leader',
   })
  }

  const memberQuit = infoGroupItem.member.filter(
   (member) => member.idUser === user.id
  )

  Swal.fire({
   title: 'Are you sure?',
   text: 'Do you want to leave the group?',
   icon: 'warning',
   showCancelButton: true,
   confirmButtonColor: '#3085d6',
   cancelButtonColor: '#d33',
   confirmButtonText: 'Yes',
  }).then((result) => {
   if (result.isConfirmed) {
    fetchQuitGroup(memberQuit.idMem)
    Swal.fire({
     title: 'Quitted!',
     text: 'You have left the group.',
     icon: 'success',
    })
   }
  })
 }

 const handleDeleteMemberGroup = (idMember) => {
  if (!idMember) return

  Swal.fire({
   title: 'Are you sure?',
   text: 'Do you want to delete this member?',
   icon: 'warning',
   showCancelButton: true,
   confirmButtonColor: '#3085d6',
   cancelButtonColor: '#d33',
   confirmButtonText: 'Yes',
  }).then((result) => {
   if (result.isConfirmed) {
    fetchQuitGroup(idMember)
    Swal.fire({
     title: 'Delete!',
     text: 'This member has been removed from the group.',
     icon: 'success',
    })
   }
  })
 }

 const [searchUserFormName, setSearchUserFormName] = useState('chat')

 const handleShowModalSearchUserGroup = () => {
  setSearchUser({ ...searchUser, showModalSearch: true })
  setSearchUserFormName('group')
  setTypeButtonGroup('add')
 }

 const handleClickSearchUserBtnAdd = (user) => {
  const idMemberList = [user.idUser]
  const idGroup = infoGroupItem.idGroup
  if (!idMemberList || !idGroup) return

  postMembersGroup(idMemberList, idGroup)
 }

 const postMembersGroup = async (idMemberList, idGroup) => {
  try {
   const response = await axios.post(`${API_SERVER_URL}/group/add/${idGroup}`, {
    idMembers: idMemberList,
   })

   handleHideModalSearch()
   fetchAllMemberGroup(infoGroupItem.idGroup)
   setSnackbar({
    isOpen: true,
    message: `Add members successfully!`,
    severity: 'success',
   })
  } catch (error) {
   console.log(error)
  }
 }

 const [showModalMemberList, setShowModalMemberList] = useState(false)
 const [groupMemberList, setGroupMemberList] = useState([])
 const [showInforMation, setShowInforMation] = useState(false)

 useEffect(() => {
  infoGroupItem.idGroup && fetchAllMemberGroup(infoGroupItem.idGroup)
 }, [infoGroupItem.idGroup])

 const fetchAllMemberGroup = async (idGroup) => {
  try {
   const response = await axios.get(
    `https://samnote.mangasocial.online/group/only/${idGroup}`
   )

   setGroupMemberList(response.data.data.members)
  } catch (error) {
   console.log(error)
  }
 }

 const handleClickShowSettingsGroup = () => {
  if (formName === 'group') {
   setShowButtonsGroup((prevState) => !prevState)
   setTypeButtonGroup(null)
  }

  if (formName === 'chat') {
   console.log('chat')
  }
  return null
 }

 const handleShowAllMembers = () => {
  setShowModalMemberList(true)
  setTypeButtonGroup('delete')
 }

 const handleShowInformation = () => {
  setShowInforMation(true)
  setTypeButtonGroup(null)
  setShowButtonsGroup(false)
 }

 const handleHideInformation = () => {
  setShowInforMation(false)
 }

 const handleHideModalMembers = () => {
  setShowModalMemberList(false)
 }

 const [valueGroupName, setValueGroupName] = useState('')
 const [newAvatarGroup, setNewAvatarGroup] = useState(null)
 const [disableGroupName, setDisableGroupName] = useState(true)
 const inputGroupNameRef = useRef()
 const formGroupNameRef = useRef()
 const buttonClickEditNameGroup = useRef()

 const isLeaderTeam = (idOwner) => {
  return idOwner === user.id
 }

 const updateNameGroup = async (idGroup, newName) => {
  try {
   const response = await axios.patch(
    `${API_SERVER_URL}/group/update/${idGroup}`,
    { groupName: newName }
   )

   getGroups(user.id)
   setDisableGroupName(true)
   setInfoGroupItem({ ...infoGroupItem, name: newName })
  } catch (error) {
   console.log(error)
  }
 }

 const updateAvatarGroup = async (idGroup, newAvatar) => {
  try {
   const response = await axios.patch(
    `${API_SERVER_URL}/group/update/${idGroup}`,
    {
     linkAvatar: newAvatar,
    }
   )

   getGroups(user.id)
   setNewAvatarGroup(newAvatar)
  } catch (error) {
   console.error(error)
  }
 }

 const handleChangeNameGroup = (e) => {
  setValueGroupName(e.target.value)
 }
 const handleSubmitFormNameGroup = (e) => {
  e.preventDefault()
  if (!infoGroupItem.idGroup) return

  if (
   valueGroupName.trim() !== '' &&
   valueGroupName.trim() !== infoGroupItem.name
  ) {
   updateNameGroup(infoGroupItem.idGroup, valueGroupName)
  }
 }

 const handleChangeAvatarGroup = async (e) => {
  if (!infoGroupItem) return
  const { idGroup } = infoGroupItem

  const reader = new FileReader()
  reader.readAsDataURL(e.target.files[0])
  reader.onload = () => {
   // @ts-ignore
   const imageBase64 = reader.result.split(',')[1]
   updateAvatarGroup(idGroup, imageBase64)
  }

  e.target.value = null
 }

 // hande click outside element
 useEffect(() => {
  if (!ulElementButtonsGroupRef.current || !showButtonsGroupRef.current) return

  const handleClickOutside = (element) => {
   if (
    !ulElementButtonsGroupRef?.current?.contains(element) &&
    !showButtonsGroupRef.current?.contains(element)
   ) {
    setShowButtonsGroup(false)
    setTypeButtonGroup(null)
   }

   if (
    !formGroupNameRef.current ||
    !inputGroupNameRef.current ||
    !buttonClickEditNameGroup.current
   )
    return

   if (
    !formGroupNameRef.current?.contains(element) &&
    !inputGroupNameRef.current.disabled &&
    !buttonClickEditNameGroup.current?.contains(element)
   ) {
    setDisableGroupName(true)
   }
  }

  document.body.addEventListener('click', (e) => {
   handleClickOutside(e.target)
  })

  return document.body.removeEventListener('click', (e) => {
   handleClickOutside(e.target)
  })
 }, [ulElementButtonsGroupRef, showButtonsGroupRef])

 const isReadMessageGroup = (listUserReaded) => {
  if (listUserReaded.length < 1) return false
  return listUserReaded.some(
   (userReaded) => Number(userReaded.idUser) === user.id
  )
 }


 return (
  <div className='w-fluid'>
   <div className='row vh-100 mx-0'>
    <div className='col-3 group-sidebar flex flex-col px-0'>
     <h3 className='text-center py-[60px] px-3 font-bold'>Chat</h3>

     <Modal
      show={showModalCreateGroup}
      onHide={handleHideModalCreateGroup}
      size='sm'
      centered={false}
     >
      <Box
       component='form'
       onSubmit={handleSubmit(onSubmit)}
       sx={{
        width: 'max-content',
        maxWidth: '400px',
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

       {memberListGroup.length > 0 ? (
        ''
       ) : (
        <Box sx={{ mt: 1, color: 'red' }}>{errors?.members?.message}</Box>
       )}

       <div className='flex justify-end gap-2 mt-3'>
        <Box>
         <Button
          type='button'
          variant='contained'
          color='secondary'
          onClick={handleHideModalCreateGroup}
         >
          cancel
         </Button>
        </Box>
        <Box>
         <Button type='submit' variant='contained' color='primary'>
          Create
         </Button>
        </Box>
       </div>
      </Box>
     </Modal>

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
          value={searchUserName}
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
             alt='avatar '
             className='w-[50px] h-[50px] object-cover rounded-[100%]'
            />
           </div>

           <div>
            <h5 className='text-lg font-extrabold capitalize'>
             {user.userName}
            </h5>
           </div>
          </div>

          {searchUserFormName === 'chat' && (
           <button
            onClick={() => handleClickSearchBtn(user)}
            type='button'
            className='bg-[#F56852] text-white rounded-sm text-decoration-none px-3 py-2 text-xl font-medium'
           >
            Chat
           </button>
          )}

          {searchUserFormName === 'group' && (
           <button
            onClick={() => handleClickSearchUserBtnAdd(user)}
            type='button'
            className='bg-black text-white rounded-sm text-decoration-none px-3 py-2 text-xl font-medium'
           >
            Add
           </button>
          )}
         </li>
        ))}

        {messageNotifi.trim() !== '' && (
         <li className='font-bold capitalize'>{messageNotifi} !</li>
        )}
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

     <Modal
      dialogClassName='modal-members'
      show={showModalMemberList}
      onHide={() => setShowModalMemberList(false)}
     >
      <div className='p-3 '>
       <h3 className='text-[25px] font-medium'>All member</h3>

       <ul className='flex flex-col gap-2 py-[20px] max-h-[60vh] overflow-y-auto'>
        {groupMemberList?.map((user) => (
         <li
          key={user.idMember}
          className='flex justify-between bg-white items-center rounded-[40px] cursor-pointer'
         >
          <div className='flex gap-2 items-center'>
           <div>
            <img
             onError={(e) => {
              e.target.src = avatarDefault
             }}
             src={user.avt}
             alt='avatar '
             className='w-[50px] h-[50px] object-cover rounded-[100%]'
            />
           </div>

           <div>
            <h5 className='text-lg font-extrabold capitalize'>{user.name}</h5>
           </div>
          </div>

          <button
           onClick={() => {
            handleDeleteMemberGroup(user.idMember)
           }}
           type='button'
           className='text-red-500 rounded-sm text-decoration-none px-3 py-2 text-xl font-medium'
          >
           <RemoveCircleIcon className='text-[30px]' />
          </button>
         </li>
        ))}

        {messageNotifi.trim() !== '' && (
         <li className='font-bold capitalize'>{messageNotifi} !</li>
        )}
       </ul>

       <div className='text-right'>
        <button
         className='text-[25px] font-medium text-[#ff2d2d]'
         type='button'
         onClick={handleHideModalMembers}
        >
         Cancel
        </button>
       </div>
      </div>
     </Modal>

     <div className='shadow-lg bg-[#dffffe] flex flex-col flex-grow-1 px-[20px]'>
      <div className='flex mt-4 mb-5 justify-between gap-2'>
       <button
        onClick={handleShowModalSearch}
        className='flex gap-2 items-center bg-white p-2 rounded-5 shadow-lg w-100 text-[#686464CC]'
       >
        <SearchIcon />
        Search user
       </button>

       <form
        onSubmit={handleSubmitSearchGroup}
        className='flex justify-between gap-2'
       >
        <button
         type='button'
         className=''
         title='add group'
         onClick={handleShowModalCreateGroup}
        >
         <GroupAddIcon className='text-[36px]' />
        </button>
       </form>
      </div>

      <div className='flex flex-col flex-grow-1'>
       <ul className='flex justify-between group-buttons mb-4'>
        <li>
         <button
          onClick={handleFilterMessage}
          className={typeFilterChatUser === 'All' && 'active'}
          type='button'
         >
          All
         </button>
        </li>

        <li>
         <button
          className={typeFilterChatUser === 'Unread' && 'active'}
          onClick={handleFilterMessage}
          type='button'
         >
          Unread
         </button>
        </li>

        <li>
         <button
          className={typeFilterChatUser === 'Read' && 'active'}
          onClick={handleFilterMessage}
          type='button'
         >
          Read
         </button>
        </li>
       </ul>

       <ul
        className='flex flex-col flex-grow-1 gap-4 overflow-y-auto pb-[30px] overflow-x-hidden list-chat'
        ref={chatUserRef}
        style={{ height: `${heightChatUser}px`, scrollbarWidth: 'none' }}
       >
        {/* render userlist and grouplist */}
        {userList?.map((item) => {
         return (
          <li
           key={item.idMessage}
           className={`flex justify-between items-center rounded-[40px] cursor-pointer ${
            infoOtherUser.id === item.user.id ? 'active' : null
           }`}
           onClick={() => handleClickChatUser(item)}
          >
           <div className='flex gap-2 items-center'>
            <div>
             <img
              src={item.user.Avarta}
              alt='avatar'
              className='w-[50px] h-[50px] object-cover rounded-[100%]'
             />
            </div>

            <div>
             <h5 className='text-lg font-extrabold capitalize'>
              {item.user.name}
             </h5>
             <p
              style={{ maxWidth: '200px' }}
              className={
               item.is_seen === 0
                ? 'p-0 m-0 whitespace-nowrap overflow-hidden text-ellipsis font-[600] text-lg'
                : 'p-0 m-0 whitespace-nowrap overflow-hidden text-ellipsis text-lg'
              }
             >
              {handleChatLastText(item.last_text, item.idSend)}
             </p>
            </div>
           </div>

           <div
            className={
             item.is_seen === 0
              ? 'text-[#ff0404] text-[16px] me-2'
              : 'text-[#00ff73] text-[16px] me-2'
            }
           >
            {item.is_seen === 0 ? (
             <p className='bg-[#dfdfdf] w-[20px] h-[20px] rounded-full flex items-center justify-center'>
              1
             </p>
            ) : (
             <CheckIcon />
            )}
           </div>
          </li>
         )
        })}

        {groupList?.map((item) => (
         <li
          key={item.idGroup}
          className={`flex justify-between items-center rounded-[40px] cursor-pointer ${
           item.idGroup === infoGroupItem.idGroup ? 'active' : null
          }`}
          onClick={() => handleClickGroupItem(item)}
         >
          <div className='flex gap-2 items-center'>
           <div>
            <img
             src={item.linkAvatar || avatarDefault}
             alt='avatar'
             className='w-[50px] h-[50px] object-cover rounded-[100%]'
            />
           </div>

           <div>
            <h5 className='text-lg font-extrabold capitalize'>{item.name}</h5>
            <p
             style={{ maxWidth: '200px' }}
             className={
              item.is_seen === 0
               ? 'p-0 m-0 whitespace-nowrap overflow-hidden text-ellipsis font-[600] text-lg'
               : 'p-0 m-0 whitespace-nowrap overflow-hidden text-ellipsis text-lg'
             }
            >
             {item.text_lastest_message_in_group}
            </p>
           </div>
          </div>

          <div
           className={
            isReadMessageGroup(item.listUserReaded)
             ? 'text-[#00ff73] text-[16px] me-2'
             : 'text-[#ff0404] text-[16px] me-2'
           }
          >
           {isReadMessageGroup(item.listUserReaded) ? (
            <CheckIcon />
           ) : (
            <p className='bg-[#dfdfdf] w-[20px] h-[20px] rounded-full flex items-center justify-center'>
             1
            </p>
           )}
          </div>
         </li>
        ))}

        {userList.length === 0 && groupList.length === 0 && (
         <div className='text-center'>
          <div>
           <ChatBubbleOutlineIcon className='text-[80px]' />
          </div>
          <h3>Không có tin nhắn nào</h3>
          <p>Tin nhắn mới sẽ được hiện thị tại đây</p>
         </div>
        )}
       </ul>
      </div>

      {/* <ChatUser {...propsChatUser} /> */}
     </div>
    </div>

    <div className='col-9 px-0  flex flex-col'>
     <div className='flex justify-between items-center bg-[#dffffe] py-[30px] px-[20px] shadow-lg'>
      <div className='flex gap-2 items-center'>
       <div className='position-relative'>
        <Link to={infoOtherUser.id && `/other-user/${infoOtherUser.id}`}>
         <img
          className='w-[90px] h-[90px] object-cover rounded-[100%]'
          src={
           !newAvatarGroup
            ? infoOtherUser.Avarta || infoGroupItem.linkAvatar || avatarDefault
            : `${BASE64_URL}${newAvatarGroup}`
          }
          alt='avatar'
         />
        </Link>

        {formName === 'group' && (
         <div className='position-absolute bg-[#d9d9d9] w-[30px] h-[30px] rounded-full right-0 bottom-0 flex items-center justify-center'>
          <input
           onChange={handleChangeAvatarGroup}
           id='file-avatar-group'
           type='file'
           className='hidden m-0'
           disabled={!isLeaderTeam(infoGroupItem.idOwner)}
          />
          <label htmlFor='file-avatar-group' className='flex'>
           <CameraAltIcon className='text-[20px]' />
          </label>
         </div>
        )}
       </div>
       {formName === null && <h5>Anonymous chatter</h5>}
       {formName === 'chat' && <h5>{infoOtherUser.name}</h5>}
       {formName === 'group' && (
        <form
         onSubmit={handleSubmitFormNameGroup}
         className='flex items-center'
         ref={formGroupNameRef}
        >
         <div>
          <input
           disabled={disableGroupName}
           type='text'
           size={valueGroupName.length}
           value={valueGroupName}
           onChange={handleChangeNameGroup}
           ref={inputGroupNameRef}
           autoFocus={true}
           className={`px-2 py-1 rounded-md ${
            disableGroupName ? '' : 'bg-[#252f31] text-white'
           }`}
          />
         </div>

         <button
          onClick={(e) => {
           if (!isLeaderTeam(infoGroupItem.idOwner)) return

           return disableGroupName
            ? setDisableGroupName(false)
            : handleSubmitFormNameGroup(e)
          }}
          ref={buttonClickEditNameGroup}
          title={disableGroupName ? 'Edit name' : 'Save name'}
          type='button'
          disabled={valueGroupName === infoGroupItem.name && !disableGroupName}
          className={
           valueGroupName.trim() === infoGroupItem.name && !disableGroupName
            ? 'cursor-not-allowed text-[#d1deeb]'
            : disableGroupName
            ? ''
            : 'text-[#1976d2]'
          }
         >
          <svg
           width='40'
           height='40'
           viewBox='0 0 40 40'
           fill={
            valueGroupName.trim() === infoGroupItem?.name && !disableGroupName
             ? '#d1deeb'
             : disableGroupName
             ? ''
             : '#1976d2'
           }
           xmlns='http://www.w3.org/2000/svg'
          >
           <g clipPath='url(#clip0_373_1556)'>
            <path d='M31.111 33.3337H6.66656V8.88921H21.3554L23.5777 6.66699H6.66656C6.07719 6.66699 5.51196 6.90112 5.09521 7.31787C4.67846 7.73461 4.44434 8.29984 4.44434 8.88921V33.3337C4.44434 33.923 4.67846 34.4883 5.09521 34.905C5.51196 35.3218 6.07719 35.5559 6.66656 35.5559H31.111C31.7004 35.5559 32.2656 35.3218 32.6824 34.905C33.0991 34.4883 33.3332 33.923 33.3332 33.3337V16.667L31.111 18.8892V33.3337Z' />
            <path d='M37.2555 6.48888L33.511 2.74444C33.3449 2.5778 33.1474 2.4456 32.9301 2.35539C32.7127 2.26518 32.4797 2.21875 32.2444 2.21875C32.009 2.21875 31.776 2.26518 31.5587 2.35539C31.3413 2.4456 31.1439 2.5778 30.9777 2.74444L15.7444 18.0667L14.511 23.4111C14.4585 23.6702 14.464 23.9377 14.5272 24.1943C14.5904 24.451 14.7097 24.6905 14.8765 24.8956C15.0433 25.1006 15.2535 25.2662 15.4919 25.3803C15.7304 25.4944 15.9911 25.5543 16.2555 25.5555C16.3921 25.5705 16.53 25.5705 16.6666 25.5555L22.0555 24.3667L37.2555 9.02221C37.4221 8.85604 37.5543 8.65861 37.6445 8.44126C37.7347 8.2239 37.7812 7.99088 37.7812 7.75555C37.7812 7.52022 37.7347 7.28719 37.6445 7.06984C37.5543 6.85248 37.4221 6.65506 37.2555 6.48888ZM20.8999 22.3111L16.8333 23.2111L17.7777 19.1778L29.2444 7.63333L32.3777 10.7667L20.8999 22.3111ZM33.6333 9.5111L30.4999 6.37777L32.2221 4.62221L35.3777 7.77777L33.6333 9.5111Z' />
           </g>
           <defs>
            <clipPath id='clip0_373_1556'>
             <rect width='40' height='40' fill='white' />
            </clipPath>
           </defs>
          </svg>
         </button>
        </form>
       )}
      </div>

      <div className='position-relative show-buttons'>
       <button ref={showButtonsGroupRef} onClick={handleClickShowSettingsGroup}>
        <MoreVertIcon className='text-[40px]' />
       </button>

       <ul
        className={`bg-black p-2 position-absolute top-100 right-[100%] z-10 w-max ${
         showButtonsGroup ? 'active' : null
        }`}
        ref={ulElementButtonsGroupRef}
       >
        <li>
         <button
          className={`text-[25px] ${
           typeButtonGroup === 'quit' ? 'active' : null
          }`}
          onClick={handleQuitGroup}
         >
          <LogoutIcon className='me-2 text-[30px]' /> Quit group
         </button>
        </li>

        <li>
         <button
          className={`text-[25px] ${
           typeButtonGroup === 'add' ? 'active' : null
          }`}
          onClick={handleShowModalSearchUserGroup}
         >
          <AddCircleOutlineIcon className='me-2 text-[30px]' /> Add member
         </button>
        </li>

        {isLeaderTeam(infoGroupItem.idOwner) && (
         <li>
          <button
           className={`text-[25px] ${
            typeButtonGroup === 'delete' ? 'active' : null
           }`}
           onClick={handleShowAllMembers}
          >
           <HighlightOffIcon className='me-2 text-[30px]' /> Delete member
          </button>
         </li>
        )}

        <li>
         <button
          className={`text-[25px] ${
           typeButtonGroup === 'add' ? 'active' : null
          }`}
          onClick={handleShowInformation}
         >
          <InfoIcon className='me-2 text-[30px]' />
          Information
         </button>
        </li>
       </ul>
      </div>
     </div>

     <div
      style={{
       background: `url(${bgMessage}) no-repeat center/cover`,
      }}
      className='flex-grow-1 flex flex-col position-relative'
     >
      <div
       style={{
        overflowY: 'auto',
        scrollbarWidth: 'none',
        height: `${heightMessageContent}px`,
       }}
       className='flex-grow-1 p-[20px]'
       ref={messageContentRef}
      >
       <ul id='message-content' ref={messageContentUlRef}>
        {formName === 'chat' &&
         messageList?.map((item) =>
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
         )}

        {formName === 'group' &&
         messageGroupList?.map((item) =>
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
               onError={(e) => (e.target.src = avatarDefault)}
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
       </ul>
      </div>
      <FormMessage {...propsFormMessage} />

      <Information
       idGroup={infoGroupItem.idGroup}
       showInfo={showInforMation}
       onHide={handleHideInformation}
       groupItem={infoGroupItem}
      />
     </div>
    </div>
   </div>
  </div>
 )
}

export default Group
