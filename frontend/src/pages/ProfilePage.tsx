import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email] = useState(user?.email || '');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    // TODO: implement updateProfile API if available
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(false);
        setError('');
        try {
            // await updateProfile({ name });
            setSuccess(true);
        } catch (err: any) {
            setError('Failed to update profile');
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-8 rounded shadow mt-8">
            <h1 className="text-2xl font-bold mb-6">Profile</h1>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                    />
                </div>
                {/* Optional: Change password section here */}
                <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                </div>
                {success && <div className="text-green-600 text-sm">Profile updated!</div>}
                {error && <div className="text-red-600 text-sm">{error}</div>}
            </form>
        </div>
    );
};

export default ProfilePage; 