import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: '',
    email: '',
    serviceNumber: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/me');
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (err.response && err.response.status === 401) {
          navigate('/login'); // Redirect if unauthorized
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await api.put('/me', {
        name: user.name,
        phoneNumber: user.phoneNumber,
        serviceNumber: user.serviceNumber,
      });
      setMessage('Profile updated successfully');
      setEditing(false);
      setUser(res.data.user);
      console.log('Updated user:', res.data.user);
    } catch (err) {
      console.error('Update failed:', err);
      setMessage('Failed to update profile');
    }
  };

  if (loading) {
    return <p className="p-6 text-center">Loading profile...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Profile</h1>

        {message && <p className="text-green-500 text-center mb-2">{message}</p>}

        <div className="space-y-3">
          <div>
            <label className="block font-semibold">Name</label>
            {editing ? (
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            ) : (
              <p>{user.name}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold">Email</label>
            <p>{user.email}</p>
          </div>

          <div>
            <label className="block font-semibold">Service Number</label>
            {editing ? (
              <input
                type="text"
                name="serviceNumber"
                value={user.serviceNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            ) : (
              <p>{user.serviceNumber}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold">Phone Number</label>
            {editing ? (
              <input
                type="text"
                name="phoneNumber"
                value={user.phoneNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            ) : (
              <p>{user.phoneNumber}</p>
            )}
          </div>

          {editing ? (
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
