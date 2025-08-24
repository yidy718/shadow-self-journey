'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Database, X } from 'lucide-react';
import { exportAsJSON, exportAsText, getExportStats } from '../lib/dataExport';

interface ExportButtonProps {
  variant?: 'primary' | 'secondary' | 'minimal';
  className?: string;
}

export const ExportButton = ({ variant = 'secondary', className = '' }: ExportButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState(() => getExportStats());

  const handleOpenModal = () => {
    // Refresh stats when modal opens to ensure they're current
    setStats(getExportStats());
    setShowModal(true);
  };

  const handleJSONExport = async () => {
    setIsExporting(true);
    try {
      exportAsJSON();
      // Small delay for user feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsExporting(false);
      setShowModal(false);
    }
  };

  const handleTextExport = async () => {
    setIsExporting(true);
    try {
      exportAsText();
      // Small delay for user feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsExporting(false);
      setShowModal(false);
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

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative bg-gray-900 rounded-3xl p-8 w-full max-w-md mx-4 border border-gray-700 shadow-2xl"
              style={{ minHeight: '400px' }}
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
                <h2 className="text-2xl font-bold text-white mb-2">Export Your Journey</h2>
                <p className="text-gray-300 text-sm">
                  Download your complete shadow work data for safekeeping or sharing with professionals.
                </p>
              </div>

              {/* Data Summary */}
              <div className="bg-black/40 rounded-2xl p-4 mb-6 text-sm">
                <h3 className="text-white font-medium mb-3">Your Data Includes:</h3>
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
              </div>

              {isExporting && (
                <div className="absolute inset-0 bg-gray-900/80 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-white font-medium">Preparing export...</p>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-400 text-center">
                <p>Your data is yours. Keep exports private and secure.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExportButton;