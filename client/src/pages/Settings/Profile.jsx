import React, { useState, useEffect } from 'react'
import { FiSave, FiUpload, FiUser, FiMail, FiPhone, FiShield, FiClock, FiEye, FiEyeOff, FiEdit3 } from 'react-icons/fi'

const Profile = () => {
  const [profile, setProfile] = useState({
    basicInfo: {
      fullName: 'Admin User',
      email: 'admin@mobilebillstore.com',
      phone: '+91 9876543210',
      role: 'Super Admin',
      profilePicture: null
    },
    loginInfo: {
      username: 'admin',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: false
    }
  })

  const [activityLogs, setActivityLogs] = useState([
    {
      id: 1,
      action: 'Login',
      timestamp: '2025-01-15 14:30:00',
      ipAddress: '192.168.1.100',
      device: 'Chrome on Windows'
    },
    {
      id: 2,
      action: 'Updated Settings',
      timestamp: '2025-01-15 12:15:00',
      ipAddress: '192.168.1.100',
      device: 'Chrome on Windows'
    },
    {
      id: 3,
      action: 'Created New Bill',
      timestamp: '2025-01-15 10:45:00',
      ipAddress: '192.168.1.100',
      device: 'Chrome on Windows'
    },
    {
      id: 4,
      action: 'Generated Report',
      timestamp: '2025-01-14 16:20:00',
      ipAddress: '192.168.1.100',
      device: 'Chrome on Windows'
    },
    {
      id: 5,
      action: 'Login',
      timestamp: '2025-01-14 09:30:00',
      ipAddress: '192.168.1.100',
      device: 'Chrome on Windows'
    }
  ])

  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem('mobilebill:profile')
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    }
  }, [])

  const saveProfile = () => {
    localStorage.setItem('mobilebill:profile', JSON.stringify(profile))
    alert('Profile updated successfully!')
  }

  const handleBasicInfoChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value
      }
    }))
  }

  const handleLoginInfoChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      loginInfo: {
        ...prev.loginInfo,
        [field]: value
      }
    }))
  }

  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        handleBasicInfoChange('profilePicture', e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const changePassword = () => {
    if (!profile.loginInfo.currentPassword) {
      alert('Please enter current password')
      return
    }
    if (profile.loginInfo.newPassword !== profile.loginInfo.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    if (profile.loginInfo.newPassword.length < 6) {
      alert('New password must be at least 6 characters long')
      return
    }

    // In real app, verify current password and update
    alert('Password changed successfully!')
    setProfile(prev => ({
      ...prev,
      loginInfo: {
        ...prev.loginInfo,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }))
  }

  const toggleTwoFactor = () => {
    setProfile(prev => ({
      ...prev,
      loginInfo: {
        ...prev.loginInfo,
        twoFactorEnabled: !prev.loginInfo.twoFactorEnabled
      }
    }))
  }

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiUser className="w-5 h-5" />
          Basic Information
        </h3>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
              {profile.basicInfo.profilePicture ? (
                <img
                  src={profile.basicInfo.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser className="w-16 h-16 text-slate-400" />
              )}
            </div>
            <div className="mt-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
                id="profile-upload"
              />
              <label
                htmlFor="profile-upload"
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-md cursor-pointer hover:bg-slate-200 text-sm"
              >
                <FiUpload className="w-4 h-4" />
                Upload Photo
              </label>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={profile.basicInfo.fullName}
                onChange={(e) => handleBasicInfoChange('fullName', e.target.value)}
                className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
              <input
                type="email"
                value={profile.basicInfo.email}
                onChange={(e) => handleBasicInfoChange('email', e.target.value)}
                className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={profile.basicInfo.phone}
                onChange={(e) => handleBasicInfoChange('phone', e.target.value)}
                className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
              <input
                type="text"
                value={profile.basicInfo.role}
                disabled
                className="w-full rounded-md border border-slate-300 bg-slate-50 text-slate-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderLoginInfo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiShield className="w-5 h-5" />
          Login Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
            <input
              type="text"
              value={profile.loginInfo.username}
              disabled
              className="w-full rounded-md border border-slate-300 bg-slate-50 text-slate-500"
            />
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-700 mb-4">Change Password</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={profile.loginInfo.currentPassword}
                    onChange={(e) => handleLoginInfoChange('currentPassword', e.target.value)}
                    className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={profile.loginInfo.newPassword}
                    onChange={(e) => handleLoginInfoChange('newPassword', e.target.value)}
                    className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={profile.loginInfo.confirmPassword}
                    onChange={(e) => handleLoginInfoChange('confirmPassword', e.target.value)}
                    className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                onClick={changePassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Change Password
              </button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-700 mb-4">Security Settings</h4>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-700">Two-Factor Authentication</div>
                <div className="text-sm text-slate-500">Add an extra layer of security to your account</div>
              </div>
              <button
                onClick={toggleTwoFactor}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  profile.loginInfo.twoFactorEnabled ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profile.loginInfo.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderActivityLogs = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiClock className="w-5 h-5" />
          Activity Logs
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Device</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {activityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{log.timestamp}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{log.ipAddress}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{log.device}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <button
          onClick={saveProfile}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FiSave className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('basic')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === 'basic'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FiUser className="w-4 h-4" />
                Basic Info
              </button>
              <button
                onClick={() => setActiveTab('login')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === 'login'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FiShield className="w-4 h-4" />
                Login Info
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === 'activity'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FiClock className="w-4 h-4" />
                Activity Logs
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'login' && renderLoginInfo()}
          {activeTab === 'activity' && renderActivityLogs()}
        </div>
      </div>
    </div>
  )
}

export default Profile


