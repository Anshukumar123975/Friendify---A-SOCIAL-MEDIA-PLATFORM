import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const handleChange = (e) => {
    const selectedFile = e.target.files[0]; // Access the selected file
    if (selectedFile) {
      setFile(selectedFile); // Store the file in state
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const formData = new FormData();
        formData.append("email", email);
        formData.append("username", username);
        formData.append("password", password);
        formData.append("avatar", file);

        const response = await axios.post(
            "http://localhost:7000/auth/register",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

      setSuccess(response.data.message);
      setError("");  // Reset error message

      // Optionally navigate to login after successful registration
      setTimeout(() => {
        navigate("/"); // Redirect to login page after successful sign up
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
      setSuccess(""); // Reset success message
    }
  };

  return (
    <div
      className="flex items-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/Socialify new.png')",
      }}
    >
      <div className="w-full max-w-md p-8 space-y-6 ml-20 rounded-lg shadow-lg mt-6">
        <h2 className="text-2xl font-bold text-center text-blue-600">Sign Up</h2>

        {/* Display success or error message */}
        {success && <p className="text-green-500 text-center">{success}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your username"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Avatar</label>
            <input
              type="file"
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Choose file"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 mt-1"
          >
            Sign Up
          </button>
        </form>

        <div className="text-sm text-center text-gray-500">
          Already have an account?{" "}
          <Link to="/" className="text-blue-500 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
