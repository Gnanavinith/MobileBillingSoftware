import React, { useState, useEffect } from 'react'
import { FiDownload, FiUpload, FiClock, FiHardDrive, FiAlertTriangle, FiCheckCircle, FiXCircle, FiRefreshCw, FiTrash2, FiFile } from 'react-icons/fi'

const BackupRestore = () => {
  const [backupHistory, setBackupHistory] = useState([
    {
      id: 1,
      date: '2025-01-15 14:30:00',
      type: 'Excel Backup',
      size: '2.5 MB',
      status: 'Success',
      filePath: '/backups/mobilebill_20250115_143000.xlsx'
    },
    {
      id: 2,
      date: '2025-01-14 14:30:00',
      type: 'Excel Backup',
      size: '2.3 MB',
      status: 'Success',
      filePath: '/backups/mobilebill_20250114_143000.xlsx'
    },
    {
      id: 3,
      date: '2025-01-13 14:30:00',
      type: 'Excel Backup',
      size: '1.8 MB',
      status: 'Success',
      filePath: '/backups/mobilebill_20250113_143000.xlsx'
    },
    {
      id: 4,
      date: '2025-01-12 14:30:00',
      type: 'Excel Backup',
      size: '2.1 MB',
      status: 'Failed',
      filePath: '/backups/mobilebill_20250112_143000.xlsx'
    }
  ])

  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreFile, setRestoreFile] = useState(null)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState(null)

  useEffect(() => {
    const savedHistory = localStorage.getItem('mobilebill:backupHistory')
    if (savedHistory) {
      setBackupHistory(JSON.parse(savedHistory))
    }
  }, [])

  const saveBackupHistory = (history) => {
    localStorage.setItem('mobilebill:backupHistory', JSON.stringify(history))
    setBackupHistory(history)
  }

  const createBackup = async () => {
    setIsBackingUp(true)
    
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const now = new Date()
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
      
      const newBackup = {
        id: Date.now(),
        date: now.toLocaleString(),
        type: 'Excel Backup',
        size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
        status: 'Success',
        filePath: `/backups/mobilebill_${timestamp}.xlsx`
      }
      
      const updatedHistory = [newBackup, ...backupHistory]
      saveBackupHistory(updatedHistory)
      alert('Excel backup created successfully!')
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
      // Simulate restore process
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
      // Simulate restore process
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
    const file = new Blob(['Backup data for ' + backup.date], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    element.href = URL.createObjectURL(file)
    element.download = `mobilebill_backup_${backup.id}.xlsx`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const deleteBackup = (backupId) => {
    if (window.confirm('Are you sure you want to delete this backup?')) {
      const updatedHistory = backupHistory.filter(backup => backup.id !== backupId)
      saveBackupHistory(updatedHistory)
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
            <FiFile className="w-4 h-4" />
          )}
          {isBackingUp ? 'Creating Excel Backup...' : 'Create Excel Backup'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restore Options */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiUpload className="w-5 h-5" />
              Restore Options
            </h3>
          <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
              <FiFile className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="font-medium text-slate-700 mb-2">Upload Excel Backup</h4>
              <p className="text-sm text-slate-500 mb-4">Upload an Excel backup file to restore data</p>
                <input
                  type="file"
                accept=".xlsx,.xls"
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

        {/* Backup Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiHardDrive className="w-5 h-5" />
            Backup Information
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">What's Included in Excel Backup</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Customer data (separate sheet)</li>
                <li>• Product inventory (separate sheet)</li>
                <li>• Sales records (separate sheet)</li>
                <li>• Purchase records (separate sheet)</li>
                <li>• User accounts (separate sheet)</li>
                <li>• System settings (separate sheet)</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Important Notes</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Excel backups are stored locally</li>
                <li>• Each data type is in a separate worksheet</li>
                <li>• Restore will overwrite current data</li>
                <li>• Always create a backup before restoring</li>
                <li>• Keep Excel backup files in a safe location</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
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
                        <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
