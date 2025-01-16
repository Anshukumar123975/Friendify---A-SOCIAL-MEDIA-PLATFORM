import React, { useState, useAuth0 } from "react";
import { useEffect } from "react";
import {jwtDecode} from 'jwt-decode';
import axios from "axios";
import { io } from 'socket.io-client';
const socket = io('http://localhost:7000');

const Logo = () => {
  return (
  <div className = "text-2xl font-sans text-blue-500  ml-10">Friendify</div>
  );
}

const NavBar = () => {
  return(
    <div className="text-lg list-none text-blue-500 ml-6 py-10">
      <div 
      className="mb-12 cursor-pointer hover:text-blue-700 flex items-center"
      ><img src="/assets/home2.png" className="w-6 h-6 mr-3"></img>Home</div>
      <div 
      className="mb-12 cursor-pointer hover:text-blue-700 flex items-center"
      ><img src="/assets/video.png" className="w-6 h-6 mr-3"></img>Mini</div>
      <div 
      className="mb-12 cursor-pointer hover:text-blue-700 flex items-center"
      ><img src="/assets/message.png" className="w-6 h-6 mr-3"></img>Message</div>
      <div 
      className="mb-12  cursor-pointer hover:text-blue-700 flex items-center"
      ><img src="/assets/settings.png" className="w-6 h-6 mr-3"></img>Settings</div>
    </div>
  )
}


const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearchSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on form submit

    if (!searchQuery.trim()) {
      setError('Please enter a search query.');
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `http://localhost:7000/auth/searchUser?query=${searchQuery}`
      );
      setSearchResults(response.data.user ? [response.data.user] : []);
    } catch (err) {
      setError('Unable to fetch search results.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
        console.log('Add friend:', userId);

        // Define the API endpoint
        const apiEndpoint = 'http://localhost:7000/friends/send';

        // Prepare the request payload
        const payload = { requestTo: userId };

        // Make the POST request
        const response = await axios.post(apiEndpoint, payload, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include JWT token for authentication
                'Content-Type': 'application/json',
            },
        });

        // Handle the response
        if (response.status === 200) {
            console.log('Friend request sent successfully:', response.data);
            alert('Friend request sent successfully!');
        } else {
            console.error('Failed to send friend request:', response.data);
            alert('Failed to send friend request.');
        }
    } catch (error) {
        console.error('Error while sending friend request:', error);
        alert('An error occurred while sending the friend request. Please try again.');
    }
};

  return (
    <div className="relative w-full max-w-md ml-28">
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex items-center">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <img src="/assets/search.png" alt="Search" className="w-5 h-5" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Here..."
          className="w-full pl-10 pr-3 py-1 border border-gray-300 bg-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="ml-3 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
        >
          Search
        </button>
      </form>

      {/* Error Message */}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* Loading State */}
      {loading && <p className="text-gray-500 mt-2">Loading...</p>}

      {/* Search Results */}
      {!loading && searchQuery && searchResults.length === 0 && !error && (
        <p className="text-gray-500 mt-0 text-sm">No results found.</p>
      )}

      {searchResults.length > 0 && (
        <div
          className="absolute w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-10"
          role="list"
          aria-live="polite"
        >
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-2 hover:bg-gray-100"
              role="listitem"
            >
              <div className="flex items-center">
                <img
                  src={user.avatar}
                  alt={`${user.username}'s Avatar`}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <p className="text-sm text-gray-800">{user.username}</p>
              </div>
              <button
                onClick={() => handleAddFriend(user._id)}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Add Friend
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



const Post = () => {
  const[content, setContent] = useState("");
  const[media,setMedia] = useState();
  const [message, setMessage] = useState("");

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]; // Access the selected file
    if (selectedFile) {
      setMedia(selectedFile); // Store the file in state
    }
  };

  const handlePostSubmit = async () => {
    try {
      const jwt = localStorage.getItem('jwt');
      console.log("Content:", content);
      console.log("Media:", media);
      

      
      if (!content) {
        setMessage("Content cannot be empty.");
        return;
      }
      const token = localStorage.getItem("token");
      let username = JSON.parse(localStorage.getItem('user'));
      
      const formData = new FormData();
      formData.append("content", content);
      if (media) {
        formData.append("media", media);
        console.log("Media exists");
      }
      
      console.log("Token:", token);
      console.log(token)
      const decodedToken = jwtDecode(token);
      console.log(decodedToken.userId)
      console.log(formData);
      const userid = decodedToken.userId
      formData.append("userid", userid);
      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });
      const response = await axios.post(
        "http://localhost:7000/posts/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Post created successfully!");
      console.log("Response:", response.data.post, response.data.message);
    } catch (error) {
      console.error("Error in frontend bro:", error);
      setMessage(
        error.response?.data?.message || "An unexpected error occurred"
      );
    }
  };
  
  
  

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Create a Post</h1>
      <textarea
        placeholder="What's on your mind?"
        className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="1"
        value={content} // Bind the state
        onChange={handleContentChange}
      ></textarea>
      <div className="flex mt-3 justify-end space-x-3">
        {/* Post Button */}
        <button onClick = {handlePostSubmit} className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Post
        </button>
        {/* Upload Photo Button */}
        <label htmlFor="upload-photo" className="cursor-pointer px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600">
          Upload Photo
        </label>
        <input
          id="upload-photo"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange} // Update state
        />

      </div>
    </div>
  );
};

const FeedPost = ({ post }) => {
  const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
  let currentUserId = null;
  const decodedToken = jwtDecode(token);
  currentUserId = decodedToken.userId;
  const [likes, setLikes] = useState(post.like);
  const [comments, setComments] = useState(post.comment);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(post.likedBy.includes(currentUserId)); // Set it based on user liking the post

  const [showCommentInput, setShowCommentInput] = useState(false);
  
  // Like a post handler
  const handleLike = async () => {
    try {
      // Optimistically update UI (before the server response)
      if (liked) {
        setLikes(likes - 1); // Decrease the like count
      } else {
        setLikes(likes + 1); // Increase the like count
      }
  
      // Toggle the liked state
      setLiked(!liked);
  
      // Make the PUT request to the backend
      const response = await fetch(`http://localhost:7000/posts/${post._id}/like`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUserId, // Replace with the actual userId of the current user
        }),
      });
  
      const data = await response.json();
      
      // If the server response indicates a failure, revert the UI change
      if (data.message !== "Post like toggled successfully") {
        alert(data.message);
        // Revert the like count if there was an error
        setLikes(likes); 
        setLiked(liked); 
      }
    } catch (error) {
      console.error("Error liking/unliking the post:", error);
      // In case of an error, revert the UI change
      setLikes(likes);
      setLiked(liked);
    }
  };
  
  

  // Comment on a post handler
  const handleComment = async () => {
    if (newComment.trim()) {
      try {
        const response = await fetch(`http://localhost:7000/posts/${post._id}/comment`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment: newComment }),
        });
        const data = await response.json();
        if (data.message === "Comment added successfully") {
          setComments([...comments, newComment]); // Add new comment to the local state
          setNewComment(""); // Clear the input field
          setShowCommentInput(false); // Hide the input field
        }
      } catch (error) {
        console.error("Error commenting on the post:", error);
      }
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-md mb-4">
      <div className="flex items-center mb-4">
        <img
          src={post.avatar} // Assuming avatar is a URL
          alt="User Avatar"
          className="w-10 h-10 rounded-full mr-3"
        />
        <p className="text-lg font-semibold text-gray-800">{post.username}</p>
      </div>
      <div className="mb-4 flex justify-center">
        {Array.isArray(post.media) ? (
          post.media.map((mediaItem) => (
            <div key={mediaItem._id} className="mb-2">
              {mediaItem.type === "image" && (
                <img
                  src={`http://localhost:4000${mediaItem.url}`} // Full URL for images
                  alt="Post Media"
                  className="w-full h-auto object-cover rounded-md"
                />
              )}
              {mediaItem.type === "video" && (
                <video
                  src={`http://localhost:4000${mediaItem.url}`} // Full URL for videos
                  controls
                  className="w-full h-auto object-cover rounded-md"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          ))
        ) : (
          <div className="mb-2">
            {post.media && post.media.includes("image") ? (
              <img
                src={post.media} // Directly use the URL for the image
                alt="Post Media"
                className="w-full h-auto object-cover rounded-md"
              />
            ) : post.media && post.media.includes("video") ? (
              <video
                src={post.media} // Directly use the URL for the video
                controls
                className="w-full h-auto object-cover rounded-md"
              >
                Your browser does not support the video tag.
              </video>
            ) : null}
          </div>
        )}
      </div>
      <p className="text-gray-700 mb-4">{post.content}</p>
      <div className="flex justify-between items-center border-t pt-3">
        <div className="flex items-center space-x-4 border-r-2 w-1/2 justify-center">
          {/* Like button */}
          <button
            onClick={handleLike}
            className="flex items-center text-blue-500 hover:text-blue-700"
          >
            <img
              src="/assets/like.png"
              alt="Like"
              className="w-6 h-6 mr-1"
            />
            {likes} Like{likes !== 1 ? "s" : ""}
          </button>
        </div>

        {/* Right side: Comment button */}
        <div className="flex items-center space-x-4 mr-36">
          <button
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center text-blue-500 hover:text-blue-700"
          >
            <img
              src="/assets/comment.png"
              alt="Comment"
              className="w-6 h-6 mr-1"
            />
            Comment
          </button>
        </div>
      </div>

      {/* Comment input and list */}
      {showCommentInput && (
        <div className="mt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Add a comment..."
          />
          <button
            onClick={handleComment}
            className="mt-2 text-white bg-blue-500 p-2 rounded-md"
          >
            Submit Comment
          </button>
        </div>
      )}

      {/* Display comments */}
      <div className="mt-4">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="mb-2 text-sm text-gray-700">
              {comment}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No comments yet</p>
        )}
      </div>
    </div>
  );
};



const PendingRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get("http://localhost:7000/friends/show", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPendingRequests(response.data.pendingRequests || []);
      } catch (err) {
        setError('Unable to fetch pending requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:7000/friends/accept`,
        { requestId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Request accepted!');
      setPendingRequests(pendingRequests.filter(req => req._id !== requestId));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:7000/friends/decline`,
        { requestId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Request declined.');
      setPendingRequests(pendingRequests.filter(req => req._id !== requestId));
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  return (
    <div className="w-full bg-white shadow-md rounded-md overflow-y-auto p-4 my-4 max-h-60 min-h-60">
      <h2 className="font-semibold mb-4 text-xl text-blue-400">Pending Requests</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {pendingRequests.length === 0 && !loading && (
        <p className="text-gray-500">No pending requests.</p>
      )}
      {pendingRequests.map((request) => (
        <div
          key={request._id}
          className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-md"
        >
          <div className="flex items-center">
            {/* Remove avatar as it's not present in the response */}
            <img className="w-10 h-10 rounded"  src = {`${request.requestFrom.avatar}`}></img>
            <p className="text-gray-800 font-medium ml-3">{request.requestFrom.username}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleAccept(request._id)}
              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Accept
            </button>
            <button
              onClick={() => handleDecline(request._id)}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const Profile = () => {
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userId;
  const [username,setUsername] = useState("");
  const [avatar,setAvatar] = useState("");
  useEffect(() => {
    const fetchDetails = async() => {
      try{
        const response = await axios.get(
          `http://localhost:7000/auth/fetchDetails?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data);
        setUsername(response.data.user.username);
        setAvatar(response.data.user.avatar);
      }
      catch(error){
        console.log(error);
      }
    };

    fetchDetails();
  }, [userId, token])
  
  return(
    <div className="flex items-center ml-96 justify-end">
      <img className="ml-28 h-8 w-8 rounded-full mr-4 bg-gray-100" src={`${avatar}`} alt="Avatar" />
      <div className="text-lg font-medium">{username}</div>
    </div>
  );
};

const Dashboard = () => {
  const [showPost, setShowPost] = useState(false);
  const [posts, setPosts] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [openChat, setOpenChat] = useState(false);
  const [currentChatUser, setCurrentChatUser] = useState(null);
  const [message, setMessage] = useState(""); // State to hold the input message
  const [messages, setMessages] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(""); // State to hold chat messages
  const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
  let currentUserId = null;
  const decodedToken = jwtDecode(token);
  currentUserId = decodedToken.userId;
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:7000/posts/");
        setPosts(response.data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error.message);
      }
    };

    const fetchAcceptedRequests = async () => {
      try {
        const response = await axios.get("http://localhost:7000/friends/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAcceptedRequests(response.data.data);
      } catch (error) {
        console.error("Error fetching accepted requests:", error.response?.data || error.message);
      }
    };
    fetchPosts();
    fetchAcceptedRequests();
  }, [token]);

  useEffect(() => {
    // Fetch messages from the backend when the component mounts
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/message/messages/${currentRoomId}`);
        setMessages(response.data.messages);  // Set the fetched messages to the state
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
  
    fetchMessages();
  }, [currentRoomId]);
    
const sendMessage = () => {
  if (message.trim()) {
    // Emit message with room and message data
    socket.emit("sendMessage", {
      room: currentRoomId, // Make sure this is correct
      sender: currentUserId,
      message,
    });
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: currentUserId, message }, // Local state update for the sent message
    ]);
    setMessage(""); // Clear input
  }
};
useEffect(() => {
  socket.current = io("http://localhost:7000");

  // Join the room
  socket.current.emit("joinRoom", currentRoomId);

  // Receive message
  socket.current.on("receiveMessage", (newMessage) => {
      console.log("Received message:", newMessage); // Log received message
      if (newMessage.sender !== currentUserId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
  });

  return () => {
      socket.current.off("receiveMessage");
      socket.current.disconnect();
  };
}, [currentRoomId]);

  const handlePostClick = () => {
    setShowPost(!showPost);
  };

  const handleChatClick = async (friendDetails) => {
    setCurrentChatUser(friendDetails);
    setOpenChat(true);
    const token = localStorage.getItem("token");
    let currentUserId = null;
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        currentUserId = decodedToken.userId;
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  
    if (!currentUserId) {
      console.error("Current user ID not found.");
      return;
    }
  
    try {
      // API call to find or create the room
      const response = await axios.post(
        "http://localhost:7000/message/create",
        {
          userId: currentUserId,
          friendId: friendDetails._id || friendDetails.id, // Ensure correct friend ID is sent
        }
      );
  
      const { roomId } = response.data;
      console.log("Room ID:", roomId);
      setCurrentRoomId(roomId);
      // Join the room via Socket.io
      socket.emit('joinRoom', roomId);
  
      // Open chat window and set the current chat user
      
    } catch (error) {
      console.error("Error handling chat click:", error.response?.data || error.message);
    }
    
  };
  

  return (
    <div className="relative bg-slate-300 min-h-screen">
      {/* Top Bar */}
      <div className="bg-white w-full flex items-center h-14 border fixed top-0 left-0 right-0 z-20">
        <Logo />
        <SearchBar />
        <Profile />
      </div>

      {/* Sidebar */}
      <div className="top-14 py-40 bg-white min-h-screen w-44 fixed z-10">
        <NavBar />
      </div>

      {/* Main Content Section */}
      <div className="ml-44 flex pt-14 min-h-screen relative">
        {/* Feed Posts Section */}
        <div className="w-7/12 py-1 px-4 mt-4">
          {posts.map((post) => (
            <FeedPost key={post._id} post={post} />
          ))}
        </div>

        {/* Pending Requests Section */}
        <div className="fixed right-[2%] top-14 w-[36%] py-1 px-4 rounded-md">
          <PendingRequests />
        </div>

        {/* Chat Section */}
        <div className="fixed right-[3%] top-[calc(14rem+100px)] w-[34%] py-1 px-4 bg-white shadow-md rounded-md overflow-y-auto max-h-96 min-h-96">
          <h3 className="text-xl mt-3 font-semibold mb-4 text-blue-400">
            Chat with friends
          </h3>
          {acceptedRequests.length > 0 ? (
            acceptedRequests.map((friend) => {
              const token = localStorage.getItem("token");
              let currentUserId = null;
              if (token) {
                try {
                  const decodedToken = jwtDecode(token);
                  currentUserId = decodedToken.userId;
                } catch (error) {
                  console.error("Error decoding token:", error);
                }
              }
              const isCurrentUserRequestFrom =
                friend.requestFrom._id === currentUserId;
              const friendDetails = isCurrentUserRequestFrom
                ? friend.requestTo
                : friend.requestFrom;
              return (
                <div
                  key={friend._id}
                  className="flex items-center h-16 justify-between py-2 border-b"
                >
                  <div className="flex items-center">
                    <img
                      src={friendDetails.avatar}
                      alt={friendDetails.username}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="text-l text-black">{friendDetails.username}</span>
                  </div>
                  <button
                    onClick={() => handleChatClick(friendDetails)}
                    className="text-blue-500 text-s hover:underline"
                  >
                    Chat
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">No accepted requests yet.</p>
          )}
        </div>
      </div>

      {/* Chat Window */}
      {openChat && currentChatUser && (
        <div className="fixed top-[20%] left-[20%] w-3/5 h-3/5 bg-white shadow-lg rounded-md z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img
                src={currentChatUser.avatar}
                alt={currentChatUser.username}
                className="w-8 h-8 rounded-full mr-2"
              />
              <h2 className="text-xl font-semibold">{currentChatUser.username}</h2>
            </div>
            <button
              onClick={() => setOpenChat(false)}
              className="text-red-500 hover:underline"
            >
              Close
            </button>
          </div>
          <div className="flex flex-col h-[calc(100%-56px)]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto border border-gray-300 p-2">
                
              <div className="flex-1 overflow-y-auto border border-gray-300 p-2">
                {messages.map((msg, index) => (
                  
                  <div key={index} className={msg.sender === currentUserId ? "text-right" : "text-left"}>
                  <p className="text-gray-700">
                    <strong>{msg.sender === currentUserId ? "You" : currentChatUser.username}</strong>: {msg.message}
                  </p>
                  </div>
                ))}
              </div>

            </div>
            {/* Message Input */}
            <div className="mt-2 flex items-center">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={sendMessage} className="ml-2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Post Button */}
      <div className="fixed bottom-5 mb-3 right-4 md:bottom-8 md:right-8 w-fit h-fit bg-transparent rounded-md">
        <button
          onClick={handlePostClick}
          className="px-4 py-2 w-full sm:w-auto text-white bg-blue-500 rounded-md hover:bg-blue-600 text-sm sm:text-base md:px-6 md:py-3"
        >
          {showPost ? "Close Post" : "Create Post"}
        </button>
        {showPost && (
          <div className="mt-4">
            <Post />
          </div>
        )}
      </div>
    </div>
  );
};


export default Dashboard;
