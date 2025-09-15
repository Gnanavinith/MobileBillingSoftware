import React, { useState, useEffect } from "react";
import {
  FiSave,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUsers,
  FiGlobe,
  FiPlus,
  FiTrash2,
  FiX,
  FiDollarSign,
  FiPercent,
  FiCreditCard,
  FiFileText,
  FiPackage,
  FiShield,
  FiClock,
} from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";

// Permissions list
const availablePermissions = [
  { id: "manage-users", label: "Manage Users" },
  { id: "billing", label: "Billing Access" },
  { id: "view-reports", label: "View Reports" },
  { id: "edit-settings", label: "Edit Settings" },
  { id: "manage-stock", label: "Manage Stock" },
  { id: "manage-purchases", label: "Manage Purchases" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("business");

  // Settings state
  const [settings, setSettings] = useState({
    businessInfo: {
      businessName: "",
      email: "",
      phone: "",
      address: "",
      gstin: "",
      website: "",
    },
    invoiceSettings: {
      invoicePrefix: "INV",
      autoNumbering: true,
      startingNumber: 1,
      footerText: "Thank you for your business!",
      showLogo: true,
    },
    taxSettings: {
      gstRate: 18,
      cgstRate: 9,
      sgstRate: 9,
      taxCategories: [
        { name: "Standard", rate: 18 },
        { name: "Reduced", rate: 5 },
        { name: "Zero", rate: 0 },
      ],
    },
    paymentMethods: [
      { name: "Cash", enabled: true },
      { name: "Card", enabled: true },
      { name: "UPI", enabled: true },
      { name: "Net Banking", enabled: false },
      { name: "Cheque", enabled: false },
    ],
    stockSettings: {
      lowStockThreshold: 20,
      autoReorder: false,
      reorderQuantity: 50,
      stockAlertEmail: "",
    },
    securitySettings: {
      sessionTimeout: 30, // minutes
      passwordMinLength: 6,
      requireStrongPassword: false,
      maxLoginAttempts: 5,
    },
  });

  // Users state
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Admin User",
      email: "admin@mobilebill.com",
      role: "Super Admin",
      permissions: ["all"],
      status: "active",
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
    alert("✅ Settings saved successfully!");
  };

  // Add user
  const addUser = () => {
    if (!newUser.name || !newUser.email) {
      alert("⚠️ Please fill in name and email");
      return;
    }
    setUsers([...users, { ...newUser, id: Date.now(), status: "active" }]);
    setNewUser({ name: "", email: "", role: "Staff", permissions: [] });
    setShowUserModal(false);
  };

  // Remove user
  const removeUser = (id) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  // Toggle user status
  const toggleUserStatus = (id) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === "active" ? "inactive" : "active" }
        : user
    ));
  };

  // Update business info
  const updateBusinessInfo = (field, value) => {
    setSettings(prev => ({
      ...prev,
      businessInfo: { ...prev.businessInfo, [field]: value }
    }));
  };

  // Update invoice settings
  const updateInvoiceSettings = (field, value) => {
    setSettings(prev => ({
      ...prev,
      invoiceSettings: { ...prev.invoiceSettings, [field]: value }
    }));
  };

  // Update tax settings
  const updateTaxSettings = (field, value) => {
    setSettings(prev => ({
      ...prev,
      taxSettings: { ...prev.taxSettings, [field]: value }
    }));
  };

  // Update payment methods
  const togglePaymentMethod = (index) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((method, i) => 
        i === index ? { ...method, enabled: !method.enabled } : method
      )
    }));
  };

  // Update stock settings
  const updateStockSettings = (field, value) => {
    setSettings(prev => ({
      ...prev,
      stockSettings: { ...prev.stockSettings, [field]: value }
    }));
  };

  // Update security settings
  const updateSecuritySettings = (field, value) => {
    setSettings(prev => ({
      ...prev,
      securitySettings: { ...prev.securitySettings, [field]: value }
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto">
        {[
          { id: "business", label: "Business Info", icon: <FaBuilding /> },
          { id: "invoice", label: "Invoice Settings", icon: <FiFileText /> },
          { id: "tax", label: "Tax Settings", icon: <FiPercent /> },
          { id: "payment", label: "Payment Methods", icon: <FiCreditCard /> },
          { id: "stock", label: "Stock Settings", icon: <FiPackage /> },
          { id: "users", label: "User Management", icon: <FiUsers /> },
          { id: "security", label: "Security", icon: <FiShield /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 -mb-px border-b-2 transition whitespace-nowrap ${
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
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaBuilding className="w-5 h-5" />
            Business Information
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Business Name *
            </label>
            <input
              type="text"
              value={settings.businessInfo.businessName}
              onChange={(e) => updateBusinessInfo("businessName", e.target.value)}
              className="mt-1 block w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
              placeholder="My Company Pvt Ltd"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={settings.businessInfo.email}
                  onChange={(e) => updateBusinessInfo("email", e.target.value)}
                  className="mt-1 block w-full rounded-xl border-2 border-slate-200 pl-10 px-3 py-2 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
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
                  value={settings.businessInfo.phone}
                  onChange={(e) => updateBusinessInfo("phone", e.target.value)}
                  className="mt-1 block w-full rounded-xl border-2 border-slate-200 pl-10 px-3 py-2 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all"
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
                value={settings.businessInfo.address}
                onChange={(e) => updateBusinessInfo("address", e.target.value)}
                className="mt-1 block w-full rounded-xl border-2 border-slate-200 pl-10 px-3 py-2 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
                placeholder="123, Main Street, City"
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                GSTIN
              </label>
              <input
                type="text"
                value={settings.businessInfo.gstin}
                onChange={(e) => updateBusinessInfo("gstin", e.target.value)}
                className="mt-1 block w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all"
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Website
              </label>
              <div className="relative">
                <FiGlobe className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="url"
                  value={settings.businessInfo.website}
                  onChange={(e) => updateBusinessInfo("website", e.target.value)}
                  className="mt-1 block w-full rounded-xl border-2 border-slate-200 pl-10 px-3 py-2 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 transition-all"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Settings */}
      {activeTab === "invoice" && (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiFileText className="w-5 h-5" />
            Invoice Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Invoice Prefix
              </label>
              <input
                type="text"
                value={settings.invoiceSettings.invoicePrefix}
                onChange={(e) => updateInvoiceSettings("invoicePrefix", e.target.value)}
                className="mt-1 block w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                placeholder="INV"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Starting Number
              </label>
              <input
                type="number"
                value={settings.invoiceSettings.startingNumber}
                onChange={(e) => updateInvoiceSettings("startingNumber", parseInt(e.target.value))}
                className="mt-1 block w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all"
                min="1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoNumbering"
              checked={settings.invoiceSettings.autoNumbering}
              onChange={(e) => updateInvoiceSettings("autoNumbering", e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoNumbering" className="text-sm font-medium text-slate-700">
              Enable Auto Numbering
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Footer Text
            </label>
            <textarea
              value={settings.invoiceSettings.footerText}
              onChange={(e) => updateInvoiceSettings("footerText", e.target.value)}
              className="mt-1 block w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
              placeholder="Thank you for your business!"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showLogo"
              checked={settings.invoiceSettings.showLogo}
              onChange={(e) => updateInvoiceSettings("showLogo", e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="showLogo" className="text-sm font-medium text-slate-700">
              Show Logo on Invoices
            </label>
          </div>
        </div>
      )}

      {/* Tax Settings */}
      {activeTab === "tax" && (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiPercent className="w-5 h-5" />
            Tax Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                GST Rate (%)
              </label>
              <input
                type="number"
                value={settings.taxSettings.gstRate}
                onChange={(e) => updateTaxSettings("gstRate", parseFloat(e.target.value))}
                className="mt-1 block w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                CGST Rate (%)
              </label>
              <input
                type="number"
                value={settings.taxSettings.cgstRate}
                onChange={(e) => updateTaxSettings("cgstRate", parseFloat(e.target.value))}
                className="mt-1 block w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                SGST Rate (%)
              </label>
              <input
                type="number"
                value={settings.taxSettings.sgstRate}
                onChange={(e) => updateTaxSettings("sgstRate", parseFloat(e.target.value))}
                className="mt-1 block w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-700 mb-3">Tax Categories</h3>
            <div className="space-y-2">
              {settings.taxSettings.taxCategories.map((category, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => {
                      const newCategories = [...settings.taxSettings.taxCategories];
                      newCategories[index].name = e.target.value;
                      updateTaxSettings("taxCategories", newCategories);
                    }}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Category name"
                  />
                  <input
                    type="number"
                    value={category.rate}
                    onChange={(e) => {
                      const newCategories = [...settings.taxSettings.taxCategories];
                      newCategories[index].rate = parseFloat(e.target.value);
                      updateTaxSettings("taxCategories", newCategories);
                    }}
                    className="w-20 rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <span className="text-slate-500">%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {activeTab === "payment" && (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiCreditCard className="w-5 h-5" />
            Payment Methods
          </h2>
          
          <div className="space-y-3">
            {settings.paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiCreditCard className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-700">{method.name}</span>
                </div>
                <button
                  onClick={() => togglePaymentMethod(index)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    method.enabled ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      method.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Settings */}
      {activeTab === "stock" && (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiPackage className="w-5 h-5" />
            Stock Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={settings.stockSettings.lowStockThreshold}
                onChange={(e) => updateStockSettings("lowStockThreshold", parseInt(e.target.value))}
                className="mt-1 block w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Reorder Quantity
              </label>
              <input
                type="number"
                value={settings.stockSettings.reorderQuantity}
                onChange={(e) => updateStockSettings("reorderQuantity", parseInt(e.target.value))}
                className="mt-1 block w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all"
                min="1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoReorder"
              checked={settings.stockSettings.autoReorder}
              onChange={(e) => updateStockSettings("autoReorder", e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoReorder" className="text-sm font-medium text-slate-700">
              Enable Auto Reorder
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Stock Alert Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                value={settings.stockSettings.stockAlertEmail}
                onChange={(e) => updateStockSettings("stockAlertEmail", e.target.value)}
                className="mt-1 block w-full rounded-xl border-2 border-slate-200 pl-10 px-3 py-2 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
                placeholder="alerts@example.com"
              />
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiUsers className="w-5 h-5" />
              User Management
            </h2>
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg"
            >
              <FiPlus /> Add User
            </button>
          </div>

          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between border p-3 rounded-xl hover:bg-slate-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium">{user.name}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  <p className="text-xs text-slate-400">
                    Role: {user.role} | Permissions: {user.permissions.join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    className={`px-3 py-1 text-xs rounded-lg ${
                      user.status === 'active'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  {user.role !== "Super Admin" && (
                    <button
                      onClick={() => removeUser(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiShield className="w-5 h-5" />
            Security Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.securitySettings.sessionTimeout}
                onChange={(e) => updateSecuritySettings("sessionTimeout", parseInt(e.target.value))}
                className="mt-1 block w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                min="5"
                max="480"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password Min Length
              </label>
              <input
                type="number"
                value={settings.securitySettings.passwordMinLength}
                onChange={(e) => updateSecuritySettings("passwordMinLength", parseInt(e.target.value))}
                className="mt-1 block w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all"
                min="4"
                max="20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="requireStrongPassword"
                checked={settings.securitySettings.requireStrongPassword}
                onChange={(e) => updateSecuritySettings("requireStrongPassword", e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="requireStrongPassword" className="text-sm font-medium text-slate-700">
                Require Strong Password
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={settings.securitySettings.maxLoginAttempts}
                onChange={(e) => updateSecuritySettings("maxLoginAttempts", parseInt(e.target.value))}
                className="mt-1 block w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
                min="3"
                max="10"
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      {activeTab !== "users" && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
          >
            <FiSave /> Save Settings
          </button>
        </div>
      )}

      {/* Add User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
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
                  className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
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
                  className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all"
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
                  className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
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
                  <div className="grid grid-cols-2 gap-2 mt-2">
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
                              })
                            } else {
                              setNewUser({
                                ...newUser,
                                permissions: newUser.permissions.filter(
                                  (p) => p !== perm.id
                                ),
                              })
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
                className="px-4 py-2 rounded-xl border-2 border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={addUser}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg"
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