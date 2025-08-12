import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Role() {
  const [roles, setRoles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState(''); // comma separated string
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      const res = await axios.get('/api/roles'); // adjust API endpoint as needed
      setRoles(res.data.data);
    } catch (err) {
      setError('Failed to fetch roles');
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Handle create new role
  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/roles', {
        name,
        description,
        permissions: permissions.split(',').map(p => p.trim()).filter(Boolean),
      });
      setName('');
      setDescription('');
      setPermissions('');
      fetchRoles();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating role');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete role
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      await axios.delete(`/api/roles/${id}`);
      fetchRoles();
    } catch (err) {
      setError('Failed to delete role');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Roles Management</h1>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleCreate} className="mb-6 space-y-4">
        <div>
          <label className="block font-medium">Role Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g. Admin"
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Describe the role"
          />
        </div>

        <div>
          <label className="block font-medium">Permissions (comma separated)</label>
          <input
            type="text"
            value={permissions}
            onChange={e => setPermissions(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="create_user, edit_post, delete_comment"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Role'}
        </button>
      </form>

      <hr className="my-4" />

      <h2 className="text-xl font-semibold mb-2">Existing Roles</h2>
      <ul>
        {roles.length === 0 && <p>No roles found.</p>}
        {roles.map(role => (
          <li
            key={role._id}
            className="border rounded p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{role.name}</p>
              <p className="text-sm text-gray-600">{role.description}</p>
              <p className="text-sm text-gray-700">
                Permissions: {role.permissions.join(', ')}
              </p>
            </div>
            <button
              onClick={() => handleDelete(role._id)}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
