'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Database, X, Upload, Filter, Calendar, BarChart3, Settings } from 'lucide-react';
import { ExportLoadingSkeleton } from './Skeletons';
import { exportAsJSON, exportAsText, exportAsCSV, importUserData, getExportStats, type ExportFilters } from '../lib/dataExport';

interface ExportButtonProps {
  variant?: 'primary' | 'secondary' | 'minimal';
  className?: string;
}

export const ExportButton = ({ variant = 'secondary', className = '' }: ExportButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState(() => getExportStats());
  const [statsLoading, setStatsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filters, setFilters] = useState<ExportFilters>({
    includeJournal: true,
    includeConversations: true,
    includeDeepAnalysis: true,
    includeExerciseProgress: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure component is mounted before using portals
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [showModal]);

  const handleOpenModal = async () => {
    setShowModal(true);
    // Refresh stats asynchronously after modal is open to avoid blocking
    setStatsLoading(true);
    // Use setTimeout to avoid blocking the UI thread
    setTimeout(() => {
      setStats(getExportStats());
      setStatsLoading(false);
    }, 100);
  };

  const handleJSONExport = async () => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const success = await exportAsJSON(showFilters ? filters : undefined);
      if (success) {
        setExportMessage({ type: 'success', message: 'JSON export completed successfully!' });
        // Small delay for user feedback
        await new Promise(resolve => setTimeout(resolve, 1500));
        setShowModal(false);
      } else {
        setExportMessage({ type: 'error', message: 'Failed to export JSON. Please try again.' });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleTextExport = async () => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const success = await exportAsText(showFilters ? filters : undefined);
      if (success) {
        setExportMessage({ type: 'success', message: 'Text export completed successfully!' });
        // Small delay for user feedback
        await new Promise(resolve => setTimeout(resolve, 1500));
        setShowModal(false);
      } else {
        setExportMessage({ type: 'error', message: 'Failed to export text. Please try again.' });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCSVExport = async (dataType: 'journal' | 'assessments' | 'conversations') => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const success = await exportAsCSV(dataType, showFilters ? filters : undefined);
      if (success) {
        setExportMessage({ type: 'success', message: `CSV export (${dataType}) completed successfully!` });
        // Small delay for user feedback
        await new Promise(resolve => setTimeout(resolve, 1500));
        setShowModal(false);
      } else {
        setExportMessage({ type: 'error', message: `Failed to export ${dataType} CSV. Please try again.` });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExporting(true);
    setExportMessage(null);

    try {
      const text = await file.text();
      const result = await importUserData(text);
      
      if (result.success) {
        setExportMessage({ type: 'success', message: result.message });
        // Refresh stats after import
        setTimeout(() => {
          setStats(getExportStats());
        }, 500);
      } else {
        setExportMessage({ type: 'error', message: result.message });
      }
    } catch (error) {
      setExportMessage({ type: 'error', message: 'Failed to read import file.' });
    } finally {
      setIsExporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getButtonStyles = () => {
    const base = "flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2";
    
    switch (variant) {
      case 'primary':
        return `${base} bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg focus:ring-green-400`;
      case 'minimal':
        return `${base} bg-transparent hover:bg-gray-800/60 text-gray-300 hover:text-white border border-gray-600/40 hover:border-gray-500/60 focus:ring-gray-400`;
      default:
        return `${base} bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white border border-gray-600/40 hover:border-gray-500/60 focus:ring-gray-400`;
    }
  };

  // Create modal content
  const modalContent = (
    <AnimatePresence>
      {showModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ 
            zIndex: 10000,
            pointerEvents: 'auto'
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isExporting && setShowModal(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-gray-900 rounded-3xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg mx-4 border border-gray-700 shadow-2xl"
            style={{ 
              minHeight: '400px',
              zIndex: 10001
            }}
            onClick={(e) => e.stopPropagation()}
          >
              <button
                onClick={() => !isExporting && setShowModal(false)}
                disabled={isExporting}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                aria-label="Close export dialog"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-8">
                <Download className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  {showImport ? 'Import Your Data' : 'Export Your Journey'}
                </h2>
                <p className="text-gray-300 text-sm">
                  {showImport 
                    ? 'Restore your shadow work data from a previous export.'
                    : 'Download your complete shadow work data for safekeeping or sharing with professionals.'
                  }
                </p>
              </div>

              {/* Export/Import Toggle */}
              <div className="flex justify-center mb-6">
                <div className="bg-black/40 p-1 rounded-xl flex">
                  <button
                    onClick={() => setShowImport(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !showImport 
                        ? 'bg-green-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Export
                  </button>
                  <button
                    onClick={() => setShowImport(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      showImport 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Import
                  </button>
                </div>
              </div>

              {showImport ? (
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExporting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white p-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3"
                  >
                    <Upload className="w-6 h-6" />
                    <div className="text-center">
                      <div>Select JSON Export File</div>
                      <div className="text-xs opacity-90">Choose a .json file from a previous export</div>
                    </div>
                  </motion.button>
                  
                  <div className="bg-yellow-900/30 rounded-xl p-4 text-yellow-200 text-sm">
                    <p className="font-medium mb-2">⚠️ Import Warning</p>
                    <p>Importing will replace your current data. Make sure to export your current data first if you want to keep it.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Advanced Options Toggle */}
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        showFilters 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-black/40 text-gray-300 hover:text-white'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Advanced Options</span>
                    </button>
                  </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <div className="bg-purple-900/30 rounded-2xl p-4 mb-4 border border-purple-500/30">
                      <h3 className="text-white font-medium mb-3 flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        Export Filters
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={filters.includeJournal}
                              onChange={(e) => setFilters(prev => ({...prev, includeJournal: e.target.checked}))}
                              className="rounded text-purple-500 focus:ring-purple-500"
                            />
                            <span className="text-gray-300">Journal Entries</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={filters.includeConversations}
                              onChange={(e) => setFilters(prev => ({...prev, includeConversations: e.target.checked}))}
                              className="rounded text-purple-500 focus:ring-purple-500"
                            />
                            <span className="text-gray-300">AI Conversations</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={filters.includeDeepAnalysis}
                              onChange={(e) => setFilters(prev => ({...prev, includeDeepAnalysis: e.target.checked}))}
                              className="rounded text-purple-500 focus:ring-purple-500"
                            />
                            <span className="text-gray-300">Deep Analysis</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={filters.includeExerciseProgress}
                              onChange={(e) => setFilters(prev => ({...prev, includeExerciseProgress: e.target.checked}))}
                              className="rounded text-purple-500 focus:ring-purple-500"
                            />
                            <span className="text-gray-300">Exercise Progress</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Data Summary */}
                  <div className="bg-black/40 rounded-2xl p-4 mb-6 text-sm">
                    <h3 className="text-white font-medium mb-3">Your Data Includes:</h3>
                {statsLoading ? (
                  <div className="py-4">
                    <ExportLoadingSkeleton />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">📊 Assessments</span>
                      <span className="text-white font-medium">{stats.assessments}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">📝 Journal entries</span>
                      <span className="text-white font-medium">{stats.journalEntries}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">💬 AI conversations</span>
                      <span className="text-white font-medium">{stats.conversations}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">✅ Actions completed</span>
                      <span className="text-white font-medium">{stats.actionsCompleted}</span>
                    </div>
                    {stats.hasDeepAnalysis && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">🧠 Deep analysis</span>
                        <span className="text-green-400 font-medium">✓</span>
                      </div>
                    )}
                    {stats.memberSince && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">📅 Member since</span>
                        <span className="text-white font-medium text-xs">{stats.memberSince}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleTextExport}
                      disabled={isExporting}
                      className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:opacity-50 text-white p-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3"
                    >
                      <FileText className="w-5 h-5" />
                      <div className="text-left">
                        <div>Summary Report</div>
                        <div className="text-xs opacity-90">Formatted overview (.txt)</div>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleJSONExport}
                      disabled={isExporting}
                      className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white p-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3"
                    >
                      <Database className="w-5 h-5" />
                      <div className="text-left">
                        <div>Complete Data</div>
                        <div className="text-xs opacity-90">Raw data export (.json)</div>
                      </div>
                    </motion.button>

                    {/* CSV Export Options */}
                    <div className="border-t border-gray-700 pt-3">
                      <p className="text-gray-400 text-xs mb-2 text-center">Analytics Exports (CSV)</p>
                      <div className="grid grid-cols-3 gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCSVExport('journal')}
                          disabled={isExporting}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center space-x-1"
                        >
                          <BarChart3 className="w-3 h-3" />
                          <span>Journal</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCSVExport('assessments')}
                          disabled={isExporting}
                          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center space-x-1"
                        >
                          <BarChart3 className="w-3 h-3" />
                          <span>Tests</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCSVExport('conversations')}
                          disabled={isExporting}
                          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center space-x-1"
                        >
                          <BarChart3 className="w-3 h-3" />
                          <span>Chats</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Export Message */}
              {exportMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                  exportMessage.type === 'success' 
                    ? 'bg-green-900/50 text-green-200 border border-green-500/30' 
                    : 'bg-red-900/50 text-red-200 border border-red-500/30'
                }`}>
                  {exportMessage.message}
                </div>
              )}

              {isExporting && (
                <div className="absolute inset-0 bg-gray-900/90 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-white font-medium">
                      {showImport ? 'Importing data...' : 'Preparing export...'}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-400 text-center">
                <p>
                  {showImport 
                    ? 'Only import files from trusted sources. This will overwrite your current data.'
                    : 'Your data is yours. Keep exports private and secure.'
                  }
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleOpenModal}
        className={`${getButtonStyles()} ${className}`}
        aria-label="Export your shadow work data"
      >
        <Download className="w-4 h-4" />
        <span>Export Data</span>
      </motion.button>

      {mounted && typeof document !== 'undefined' && 
        createPortal(modalContent, document.getElementById('modal-root') || document.body)
      }
    </>
  );
};

export default ExportButton;