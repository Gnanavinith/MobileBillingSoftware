import React, { useState, useEffect } from 'react'
import { FiSave, FiUpload, FiUser, FiBell, FiCreditCard, FiBuilding, FiShield, FiPalette, FiGlobe, FiClock } from 'react-icons/fi'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('business')
  const [settings, setSettings] = useState({
    business: {
      shopName: 'MobileBill Store',
      address: '123 Main Street, City, State 12345',
      phone: '+91 9876543210',
      email: 'info@mobilebillstore.com',
      gstNumber: '29ABCDE1234F1Z5',
      logo: null
    },
    billing: {
      invoicePrefix: 'INV-',
      defaultTaxPercent: 18,
      enableDiscount: true,
      enableGST: true,
      currencyFormat: 'INR',
      currencySymbol: '₹'
    },
    notifications: {
      enableSMS: true,
      enableWhatsApp: true,
      enableEmail: true,
      smsApiKey: '',
      whatsappApiKey: '',
      emailSmtp: {
        host: '',
        port: 587,
        username: '',
        password: '',
        secure: false
      }
    },
    app: {
      theme: 'light',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      timezone: 'Asia/Kolkata'
    }
  })

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@mobilebillstore.com',
      role: 'Super Admin',
      status: 'Active',
      lastLogin: '2025-01-15 14:30:00',
      permissions: ['all']
    },
    {
      id: 2,
      name: 'Amit Sharma',
      email: 'amit@mobilebillstore.com',
      role: 'Staff',
      status: 'Active',
      lastLogin: '2025-01-15 12:15:00',
      permissions: ['billing', 'inventory', 'services']
    },
    {
      id: 3,
      name: 'Sneha Patel',
      email: 'sneha@mobilebillstore.com',
      role: 'Staff',
      status: 'Active',
      lastLogin: '2025-01-15 10:45:00',
      permissions: ['billing', 'services', 'reports']
    }
  ])

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Staff',
    permissions: []
  })

  const [showUserModal, setShowUserModal] = useState(false)

  const tabs = [
    { id: 'business', label: 'Business Info', icon: FiBuilding },
    { id: 'billing', label: 'Billing Settings', icon: FiCreditCard },
    { id: 'users', label: 'User Management', icon: FiUser },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'app', label: 'App Preferences', icon: FiPalette }
  ]

  const rolePermissions = {
    'Super Admin': ['all'],
    'Admin': ['billing', 'inventory', 'services', 'reports', 'settings'],
    'Staff': ['billing', 'inventory', 'services']
  }

  const availablePermissions = [
    { id: 'billing', label: 'Billing & POS' },
    { id: 'inventory', label: 'Inventory Management' },
    { id: 'services', label: 'Service Management' },
    { id: 'reports', label: 'Reports & Analytics' },
    { id: 'settings', label: 'Settings & Configuration' },
    { id: 'users', label: 'User Management' }
  ]

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('mobilebill:settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const saveSettings = () => {
    localStorage.setItem('mobilebill:settings', JSON.stringify(settings))
    alert('Settings saved successfully!')
  }

  const handleBusinessChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      business: {
        ...prev.business,
        [field]: value
      }
    }))
  }

  const handleBillingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      billing: {
        ...prev.billing,
        [field]: value
      }
    }))
  }

  const handleNotificationChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }))
  }

  const handleAppChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      app: {
        ...prev.app,
        [field]: value
      }
    }))
  }

  const handleLogoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        handleBusinessChange('logo', e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const addUser = () => {
    if (!newUser.name || !newUser.email) {
      alert('Please fill in all required fields')
      return
    }

    const user = {
      id: Date.now(),
      ...newUser,
      status: 'Active',
      lastLogin: 'Never',
      permissions: rolePermissions[newUser.role] || []
    }

    setUsers([...users, user])
    setNewUser({ name: '', email: '', role: 'Staff', permissions: [] })
    setShowUserModal(false)
    alert('User added successfully!')
  }

  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId))
      alert('User deleted successfully!')
    }
  }

  const updateUserRole = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: newRole, permissions: rolePermissions[newRole] || [] }
        : user
    ))
  }

  const renderBusinessInfo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiBuilding className="w-5 h-5" />
          Business Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Shop Name *</label>
            <input
              type="text"
              value={settings.business.shopName}
              onChange={(e) => handleBusinessChange('shopName', e.target.value)}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">GST Number</label>
            <input
              type="text"
              value={settings.business.gstNumber}
              onChange={(e) => handleBusinessChange('gstNumber', e.target.value)}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={settings.business.phone}
              onChange={(e) => handleBusinessChange('phone', e.target.value)}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={settings.business.email}
              onChange={(e) => handleBusinessChange('email', e.target.value)}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
            <textarea
              value={settings.business.address}
              onChange={(e) => handleBusinessChange('address', e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Logo Upload</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md cursor-pointer hover:bg-slate-200"
              >
                <FiUpload className="w-4 h-4 inline mr-2" />
                Upload Logo
              </label>
              {settings.business.logo && (
                <img
                  src={settings.business.logo}
                  alt="Logo Preview"
                  className="w-16 h-16 object-contain border border-slate-300 rounded"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiCreditCard className="w-5 h-5" />
          Billing Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Prefix</label>
            <input
              type="text"
              value={settings.billing.invoicePrefix}
              onChange={(e) => handleBillingChange('invoicePrefix', e.target.value)}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Default Tax %</label>
            <input
              type="number"
              value={settings.billing.defaultTaxPercent}
              onChange={(e) => handleBillingChange('defaultTaxPercent', parseFloat(e.target.value))}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Currency Format</label>
            <select
              value={settings.billing.currencyFormat}
              onChange={(e) => handleBillingChange('currencyFormat', e.target.value)}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Currency Symbol</label>
            <input
              type="text"
              value={settings.billing.currencySymbol}
              onChange={(e) => handleBillingChange('currencySymbol', e.target.value)}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableDiscount"
                checked={settings.billing.enableDiscount}
                onChange={(e) => handleBillingChange('enableDiscount', e.target.checked)}
                className="rounded border-slate-300"
              />
              <label htmlFor="enableDiscount" className="ml-2 text-sm text-slate-700">
                Enable Discount in Bills
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableGST"
                checked={settings.billing.enableGST}
                onChange={(e) => handleBillingChange('enableGST', e.target.checked)}
                className="rounded border-slate-300"
              />
              <label htmlFor="enableGST" className="ml-2 text-sm text-slate-700">
                Enable GST in Bills
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FiUser className="w-5 h-5" />
            User Management
          </h3>
          <button
            onClick={() => setShowUserModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add User
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="text-sm border border-slate-300 rounded px-2 py-1"
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Admin">Admin</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiBell className="w-5 h-5" />
          Notification Settings
        </h3>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableSMS"
                checked={settings.notifications.enableSMS}
                onChange={(e) => handleNotificationChange('enableSMS', e.target.checked)}
                className="rounded border-slate-300"
              />
              <label htmlFor="enableSMS" className="ml-2 text-sm text-slate-700">
                Enable SMS Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableWhatsApp"
                checked={settings.notifications.enableWhatsApp}
                onChange={(e) => handleNotificationChange('enableWhatsApp', e.target.checked)}
                className="rounded border-slate-300"
              />
              <label htmlFor="enableWhatsApp" className="ml-2 text-sm text-slate-700">
                Enable WhatsApp Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableEmail"
                checked={settings.notifications.enableEmail}
                onChange={(e) => handleNotificationChange('enableEmail', e.target.checked)}
                className="rounded border-slate-300"
              />
              <label htmlFor="enableEmail" className="ml-2 text-sm text-slate-700">
                Enable Email Notifications
              </label>
            </div>
          </div>

          {settings.notifications.enableSMS && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">SMS API Key</label>
              <input
                type="password"
                value={settings.notifications.smsApiKey}
                onChange={(e) => handleNotificationChange('smsApiKey', e.target.value)}
                placeholder="Enter SMS API Key"
                className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              />
            </div>
          )}

          {settings.notifications.enableWhatsApp && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">WhatsApp API Key</label>
              <input
                type="password"
                value={settings.notifications.whatsappApiKey}
                onChange={(e) => handleNotificationChange('whatsappApiKey', e.target.value)}
                placeholder="Enter WhatsApp API Key"
                className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              />
            </div>
          )}

          {settings.notifications.enableEmail && (
            <div className="space-y-4">
              <h4 className="font-medium text-slate-700">Email SMTP Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.notifications.emailSmtp.host}
                    onChange={(e) => handleNotificationChange('emailSmtp', { ...settings.notifications.emailSmtp, host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Port</label>
                  <input
                    type="number"
                    value={settings.notifications.emailSmtp.port}
                    onChange={(e) => handleNotificationChange('emailSmtp', { ...settings.notifications.emailSmtp, port: parseInt(e.target.value) })}
                    className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                  <input
                    type="email"
                    value={settings.notifications.emailSmtp.username}
                    onChange={(e) => handleNotificationChange('emailSmtp', { ...settings.notifications.emailSmtp, username: e.target.value })}
                    placeholder="your-email@gmail.com"
                    className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={settings.notifications.emailSmtp.password}
                    onChange={(e) => handleNotificationChange('emailSmtp', { ...settings.notifications.emailSmtp, password: e.target.value })}
                    placeholder="App Password"
                    className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderAppPreferences = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiPalette className="w-5 h-5" />
          App Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
            <select
              value={settings.app.theme}
              onChange={(e) => handleAppChange('theme', e.target.value)}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
            <select
              value={settings.app.language}
              onChange={(e) => handleAppChange('language', e.target.value)}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date Format</label>
            <select
              value={settings.app.dateFormat}
              onChange={(e) => handleAppChange('dateFormat', e.target.value)}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Time Format</label>
            <select
              value={settings.app.timeFormat}
              onChange={(e) => handleAppChange('timeFormat', e.target.value)}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            >
              <option value="24h">24 Hour</option>
              <option value="12h">12 Hour</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
            <select
              value={settings.app.timezone}
              onChange={(e) => handleAppChange('timezone', e.target.value)}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <button
          onClick={saveSettings}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FiSave className="w-4 h-4" />
          Save Settings
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'business' && renderBusinessInfo()}
          {activeTab === 'billing' && renderBillingSettings()}
          {activeTab === 'users' && renderUserManagement()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'app' && renderAppPreferences()}
        </div>
      </div>

      {/* Add User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={addUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
