import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSettings() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  async function handleSave() {
    alert(
      'Profile update functionality will be connected to Supabase later.'
    );
  }

  return (
    <div className="min-h-screen bg-deep-black px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-deep-black mb-2">
            Profile Settings
          </h1>

          <p className="text-gray-500 mb-8">
            Manage your personal information and account settings.
          </p>

          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                placeholder="Enter your full name"
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Mobile Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="Enter mobile number"
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <button
              onClick={handleSave}
              className="bg-champagne-gold text-deep-black font-semibold px-6 py-3 rounded-lg w-fit"
            >
              Save Changes
            </button>
          </div>

          <div className="mt-10 border-t pt-8">
            <h2 className="text-xl font-semibold mb-3">
              Future Features
            </h2>

            <ul className="space-y-2 text-gray-600">
              <li>• Change Password</li>
              <li>• Upload Profile Picture</li>
              <li>• Aadhaar Verification</li>
              <li>• PAN Verification</li>
              <li>• KYC Verification</li>
              <li>• Document Storage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}