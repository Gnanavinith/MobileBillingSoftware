import React, { useState, useEffect } from "react";
import {
  FiSave,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUsers,
  FiBell,
  FiGlobe,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";

// Permissions list
const availablePermissions = [
  { id: "manage-users", label: "Manage Users" },
  { id: "billing", label: "Billing Access" },
  { id: "view-reports", label: "View Reports" },
  { id: "edit-settings", label: "Edit Settings" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("business");

  // Settings state
  const [settings, setSettings] = useState({
    businessName: "",
    email: "",
    phone: "",
    address: "",
    gstin: "",
    invoicePrefix: "",
    autoNumbering: true,
    currency: "INR",
    language: "en",
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
  });

  // Users state
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Aravind Velmurugan",
      email: "aravind@example.com",
      role: "Super Admin",
      permissions: ["all"],
    },
  ]);

  // Modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Staff",
    permissions: [],
  });

  // Load settings and users from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("mobilebill:settings");
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    const savedUsers = localStorage.getItem("mobilebill:users");
    if (savedUsers) setUsers(JSON.parse(savedUsers));
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem("mobilebill:settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("mobilebill:users", JSON.stringify(users));
  }, [users]);

  // Save settings
  const handleSaveSettings = () => {
    localStorage.setItem("mobilebill:settings", JSON.stringify(settings));
    alert("✅ Settings saved!");
  };

  // Add user
  const addUser = () => {
    if (!newUser.name || !newUser.email) {
      alert("⚠️ Please fill in name and email");
      return;
    }
    setUsers([...users, { ...newUser, id: Date.now() }]);
    setNewUser({ name: "", email: "", role: "Staff", permissions: [] });
    setShowUserModal(false);
  };

  // Remove user
  const removeUser = (id) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">⚙️ Settings</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        {[
          { id: "business", label: "Business Info", icon: <FaBuilding /> },
          { id: "billing", label: "Billing", icon: <FiSave /> },
          { id: "users", label: "Users", icon: <FiUsers /> },
          { id: "notifications", label: "Notifications", icon: <FiBell /> },
          { id: "preferences", label: "App Preferences", icon: <FiGlobe /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 -mb-px border-b-2 transition ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-800"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Business Info */}
      {activeTab === "business" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Business Name *
            </label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) =>
                setSettings({ ...settings, businessName: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="My Company Pvt Ltd"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 pl-10 px-3 py-2"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Phone
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 pl-10 px-3 py-2"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Address
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-slate-400" />
              <textarea
                value={settings.address}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-slate-300 pl-10 px-3 py-2"
                placeholder="123, Main Street, City"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              GSTIN
            </label>
            <input
              type="text"
              value={settings.gstin}
              onChange={(e) =>
                setSettings({ ...settings, gstin: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="22AAAAA0000A1Z5"
            />
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === "users" && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">User Management</h2>
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FiPlus /> Add User
            </button>
          </div>

          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between border p-3 rounded-md"
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  <p className="text-xs text-slate-400">
                    Role: {user.role} | Permissions:{" "}
                    {user.permissions.join(", ")}
                  </p>
                </div>
                {user.role !== "Super Admin" && (
                  <button
                    onClick={() => removeUser(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      {activeTab !== "users" && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700"
          >
            <FiSave /> Save Settings
          </button>
        </div>
      )}

      {/* Add User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New User</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Name *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              {/* Permissions */}
              {newUser.role !== "Super Admin" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePermissions.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={newUser.permissions.includes(perm.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewUser({
                                ...newUser,
                                permissions: [...newUser.permissions, perm.id],
                              });
                            } else {
                              setNewUser({
                                ...newUser,
                                permissions: newUser.permissions.filter(
                                  (p) => p !== perm.id
                                ),
                              });
                            }
                          }}
                        />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={addUser}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
