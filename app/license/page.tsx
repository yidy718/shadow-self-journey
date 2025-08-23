import React from 'react';

export default function LicensePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="bg-black/40 rounded-3xl p-8 glass">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">License</h1>
          
          <div className="prose prose-invert max-w-none text-gray-100">
            <h2 className="text-3xl font-semibold text-purple-200 text-center mb-6">
              Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International
            </h2>
            <p className="text-center text-purple-300 mb-8">(CC BY-NC-ND 4.0)</p>

            <p className="text-center mb-8">
              <strong>Copyright (c) 2024 yidy</strong>
            </p>

            <h3 className="text-2xl font-semibold text-green-200 mt-8 mb-4">✅ You are free to:</h3>
            <div className="bg-green-900/20 rounded-xl p-6 mb-6">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Share</strong> — copy and redistribute the material in any medium or format</li>
              </ul>
            </div>

            <h3 className="text-2xl font-semibold text-yellow-200 mt-8 mb-4">⚠️ Under the following terms:</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-900/20 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-blue-200 mb-3">📝 Attribution</h4>
                <p>
                  You must give appropriate credit, provide a link to the license, and indicate if changes were made. 
                  You may do so in any reasonable manner, but not in any way that suggests the licensor endorses 
                  you or your use.
                </p>
              </div>

              <div className="bg-red-900/20 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-red-200 mb-3">🚫 NonCommercial</h4>
                <p>
                  You may not use the material for commercial purposes.
                </p>
              </div>

              <div className="bg-orange-900/20 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-orange-200 mb-3">🔒 NoDerivatives</h4>
                <p>
                  If you remix, transform, or build upon the material, you may not distribute the modified material.
                </p>
              </div>

              <div className="bg-gray-800/40 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-gray-200 mb-3">⚖️ No additional restrictions</h4>
                <p>
                  You may not apply legal terms or technological measures that legally restrict others from 
                  doing anything the license permits.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-red-200 mt-8 mb-4">🚨 Commercial Use Notice</h3>
            <div className="bg-red-900/30 rounded-xl p-6 mb-6">
              <p className="mb-4">
                This application and its psychological assessment methodology are intended for <strong>non-profit use only</strong>. 
                <span className="text-red-300 font-bold"> Any commercial use is strictly prohibited</span>, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Selling access to the application or its methodology</li>
                <li>Integrating into paid psychological services</li>
                <li>Using the assessment questions or archetypes in commercial products</li>
                <li>Monetizing any aspect of the shadow work system</li>
                <li>Creating derivative commercial products based on this work</li>
              </ul>
            </div>

            <h3 className="text-2xl font-semibold text-purple-200 mt-8 mb-4">🔗 Full License Details</h3>
            <p className="mb-6">
              For complete license terms, visit:{' '}
              <a 
                href="https://creativecommons.org/licenses/by-nc-nd/4.0/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                https://creativecommons.org/licenses/by-nc-nd/4.0/
              </a>
            </p>

            <h3 className="text-2xl font-semibold text-green-200 mt-8 mb-4">💝 Permitted Uses</h3>
            <div className="bg-green-900/20 rounded-xl p-6 mb-8">
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal psychological self-exploration</li>
                <li>Educational and academic research</li>
                <li>Non-profit mental health awareness</li>
                <li>Sharing with proper attribution</li>
                <li>Academic study and analysis</li>
              </ul>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-600 text-center">
              <a 
                href="/" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Return to Shadow Journey
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}