import React, { useState, useEffect } from 'react'
import { FiDownload, FiUpload, FiClock, FiHardDrive, FiCloud, FiAlertTriangle, FiCheckCircle, FiXCircle, FiRefreshCw, FiSettings } from 'react-icons/fi'

const BackupRestore = () => {
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupLocation: 'local',
    cloudProvider: 'google',
    backupType: 'full',
    retentionDays: 30
  })

  const [backupHistory, setBackupHistory] = useState([
    {
      id: 1,
      date: '2025-01-15 14:30:00',
      type: 'Full Backup',
      size: '2.5 MB',
      location: 'Local',
      status: 'Success',
      filePath: '/backups/mobilebill_20250115_143000.zip'
    },
    {
      id: 2,
      date: '2025-01-14 14:30:00',
      type: 'Full Backup',
      size: '2.3 MB',
      location: 'Google Drive',
      status: 'Success',
      filePath: 'mobilebill_20250114_143000.zip'
    },
    {
      id: 3,
      date: '2025-01-13 14:30:00',
      type: 'Database Only',
      size: '1.8 MB',
      location: 'Local',
      status: 'Success',
      filePath: '/backups/mobilebill_db_20250113_143000.sql'
    },
    {
      id: 4,
      date: '2025-01-12 14:30:00',
      type: 'Full Backup',
      size: '2.1 MB',
      location: 'Local',
      status: 'Failed',
      filePath: '/backups/mobilebill_20250112_143000.zip'
    }
  ])

  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreFile, setRestoreFile] = useState(null)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState(null)

  useEffect(() => {
    const savedSettings = localStorage.getItem('mobilebill:backupSettings')
    if (savedSettings) {
      setBackupSettings(JSON.parse(savedSettings))
    }
  }, [])

  const saveBackupSettings = () => {
    localStorage.setItem('mobilebill:backupSettings', JSON.stringify(backupSettings))
    alert('Backup settings saved successfully!')
  }

  const handleBackupSettingsChange = (field, value) => {
    setBackupSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const createBackup = async () => {
    setIsBackingUp(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const now = new Date()
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const backupType = backupSettings.backupType === 'full' ? 'Full Backup' : 
                        backupSettings.backupType === 'database' ? 'Database Only' : 'Files Only'
      
      const newBackup = {
        id: Date.now(),
        date: now.toLocaleString(),
        type: backupType,
        size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
        location: backupSettings.backupLocation === 'local' ? 'Local' : 
                 backupSettings.cloudProvider === 'google' ? 'Google Drive' :
                 backupSettings.cloudProvider === 'dropbox' ? 'Dropbox' : 'OneDrive',
        status: 'Success',
        filePath: backupSettings.backupLocation === 'local' ? 
                 `/backups/mobilebill_${timestamp}.zip` :
                 `mobilebill_${timestamp}.zip`
      }
      
      setBackupHistory(prev => [newBackup, ...prev])
      alert('Backup created successfully!')
    } catch (error) {
      alert('Backup failed: ' + error.message)
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleRestoreFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setRestoreFile(file)
      setShowRestoreModal(true)
    }
  }

  const restoreFromFile = async () => {
    if (!restoreFile) {
      alert('Please select a backup file')
      return
    }

    setIsRestoring(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 5000))
      alert('Data restored successfully! The application will reload.')
      window.location.reload()
    } catch (error) {
      alert('Restore failed: ' + error.message)
    } finally {
      setIsRestoring(false)
      setShowRestoreModal(false)
      setRestoreFile(null)
    }
  }

  const restoreFromHistory = async (backup) => {
    if (backup.status !== 'Success') {
      alert('Cannot restore from a failed backup')
      return
    }

    if (!window.confirm(`Are you sure you want to restore from backup created on ${backup.date}? This will overwrite all current data.`)) {
      return
    }

    setSelectedBackup(backup)
    setShowRestoreModal(true)
  }

  const confirmRestore = async () => {
    setIsRestoring(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 5000))
      alert('Data restored successfully! The application will reload.')
      window.location.reload()
    } catch (error) {
      alert('Restore failed: ' + error.message)
    } finally {
      setIsRestoring(false)
      setShowRestoreModal(false)
      setSelectedBackup(null)
    }
  }

  const downloadBackup = (backup) => {
    const element = document.createElement('a')
    const file = new Blob(['Backup data for ' + backup.date], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `mobilebill_backup_${backup.id}.zip`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const deleteBackup = (backupId) => {
    if (window.confirm('Are you sure you want to delete this backup?')) {
      setBackupHistory(prev => prev.filter(backup => backup.id !== backupId))
      alert('Backup deleted successfully!')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Success':
        return <FiCheckCircle className="w-4 h-4 text-green-600" />
      case 'Failed':
        return <FiXCircle className="w-4 h-4 text-red-600" />
      default:
        return <FiClock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success':
        return 'text-green-600 bg-green-100'
      case 'Failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Backup / Restore</h1>
        <button
          onClick={createBackup}
          disabled={isBackingUp}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBackingUp ? (
            <FiRefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <FiDownload className="w-4 h-4" />
          )}
          {isBackingUp ? 'Creating Backup...' : 'Create Backup Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backup Settings */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiSettings className="w-5 h-5" />
              Backup Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Auto Backup</span>
                <button
                  onClick={() => handleBackupSettingsChange('autoBackup', !backupSettings.autoBackup)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    backupSettings.autoBackup ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      backupSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {backupSettings.autoBackup && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                    <select
                      value={backupSettings.backupFrequency}
                      onChange={(e) => handleBackupSettingsChange('backupFrequency', e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Backup Location</label>
                    <select
                      value={backupSettings.backupLocation}
                      onChange={(e) => handleBackupSettingsChange('backupLocation', e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all"
                    >
                      <option value="local">Local System</option>
                      <option value="cloud">Cloud Storage</option>
                    </select>
                  </div>

                  {backupSettings.backupLocation === 'cloud' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Cloud Provider</label>
                      <select
                        value={backupSettings.cloudProvider}
                        onChange={(e) => handleBackupSettingsChange('cloudProvider', e.target.value)}
                        className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                      >
                        <option value="google">Google Drive</option>
                        <option value="dropbox">Dropbox</option>
                        <option value="onedrive">OneDrive</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Backup Type</label>
                    <select
                      value={backupSettings.backupType}
                      onChange={(e) => handleBackupSettingsChange('backupType', e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
                    >
                      <option value="full">Full Backup</option>
                      <option value="database">Database Only</option>
                      <option value="files">Files Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Retention (Days)</label>
                    <input
                      type="number"
                      value={backupSettings.retentionDays}
                      onChange={(e) => handleBackupSettingsChange('retentionDays', parseInt(e.target.value))}
                      className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all"
                      min="1"
                      max="365"
                    />
                  </div>
                </>
              )}

              <button
                onClick={saveBackupSettings}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* Restore Options */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiUpload className="w-5 h-5" />
              Restore Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                <FiUpload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="font-medium text-slate-700 mb-2">Upload Backup File</h4>
                <p className="text-sm text-slate-500 mb-4">Upload a backup file to restore data</p>
                <input
                  type="file"
                  accept=".zip,.sql,.json"
                  onChange={handleRestoreFileUpload}
                  className="hidden"
                  id="restore-file-upload"
                />
                <label
                  htmlFor="restore-file-upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl cursor-pointer hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg"
                >
                  <FiUpload className="w-4 h-4" />
                  Choose File
                </label>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                <FiHardDrive className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="font-medium text-slate-700 mb-2">Restore from History</h4>
                <p className="text-sm text-slate-500 mb-4">Select from previous backups</p>
                <button
                  onClick={() => setShowRestoreModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl cursor-pointer hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg"
                >
                  <FiClock className="w-4 h-4" />
                  View History
                </button>
              </div>
            </div>
          </div>

          {/* Backup History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiClock className="w-5 h-5" />
              Backup History
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {backupHistory.map((backup) => (
                    <tr key={backup.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{backup.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{backup.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{backup.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 flex items-center gap-1">
                        {backup.location === 'Local' ? <FiHardDrive className="w-4 h-4" /> : <FiCloud className="w-4 h-4" />}
                        {backup.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(backup.status)}`}>
                          {getStatusIcon(backup.status)}
                          {backup.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => downloadBackup(backup)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Download"
                          >
                            <FiDownload className="w-4 h-4" />
                          </button>
                          {backup.status === 'Success' && (
                            <button
                              onClick={() => restoreFromHistory(backup)}
                              className="text-green-600 hover:text-green-800"
                              title="Restore"
                            >
                              <FiUpload className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteBackup(backup.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <FiXCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold">Confirm Restore</h3>
            </div>
            
            {restoreFile ? (
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">File selected:</p>
                <p className="font-medium text-slate-900">{restoreFile.name}</p>
                <p className="text-xs text-slate-500">Size: {(restoreFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : selectedBackup ? (
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">Backup selected:</p>
                <p className="font-medium text-slate-900">{selectedBackup.date}</p>
                <p className="text-xs text-slate-500">{selectedBackup.type} - {selectedBackup.size}</p>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-slate-600">Please select a backup to restore from the history table.</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This action will overwrite all current data. This cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRestoreModal(false)
                  setRestoreFile(null)
                  setSelectedBackup(null)
                }}
                className="px-4 py-2 rounded-xl border-2 border-slate-300 hover:bg-slate-50"
                disabled={isRestoring}
              >
                Cancel
              </button>
              <button
                onClick={restoreFile ? restoreFromFile : confirmRestore}
                disabled={isRestoring || (!restoreFile && !selectedBackup)}
                className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isRestoring ? (
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FiAlertTriangle className="w-4 h-4" />
                )}
                {isRestoring ? 'Restoring...' : 'Restore Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BackupRestore
