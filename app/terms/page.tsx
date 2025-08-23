import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="bg-black/40 rounded-3xl p-8 glass">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none text-gray-100">
            <p className="text-center mb-8">
              <strong>Effective Date:</strong> November 2024<br />
              <strong>Contact:</strong> yidy@pm.me
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By using The Abyss - Shadow Self Journey ("the Application"), you agree to these Terms of Service. 
              If you do not agree, do not use this application.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Description of Service</h2>
            <p>
              The Application provides psychological self-assessment tools based on Jungian shadow work principles 
              for educational and personal development purposes only.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. License and Usage Restrictions</h2>
            
            <h3 className="text-xl font-semibold text-purple-200 mt-6 mb-3">Personal Use Only</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>This application is licensed for personal, educational, and research use only</li>
              <li>You may use the application for your own psychological self-exploration</li>
            </ul>

            <h3 className="text-xl font-semibold text-red-200 mt-6 mb-3">Prohibited Commercial Use</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may NOT use this application for any commercial purposes</li>
              <li>You may NOT charge others for access to or use of this application</li>
              <li>You may NOT integrate this into paid services or products</li>
              <li>You may NOT use the psychological methodology for commercial assessment services</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Medical and Psychological Disclaimer</h2>
            
            <h3 className="text-xl font-semibold text-yellow-200 mt-6 mb-3">Not Medical Advice</h3>
            <p>
              This application is for educational and self-exploration purposes only. It is NOT:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Medical advice, diagnosis, or treatment</li>
              <li>Professional psychological assessment</li>
              <li>A substitute for professional mental health care</li>
              <li>Appropriate for crisis situations or severe mental health concerns</li>
            </ul>

            <h3 className="text-xl font-semibold text-yellow-200 mt-6 mb-3">Content Warning</h3>
            <p>
              This application explores deep psychological themes including self-hatred, existential despair, 
              and other intense emotional states. Use discretion and seek professional support if needed.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Privacy and Data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All data is stored locally on your device</li>
              <li>No personal information is collected or stored on servers</li>
              <li>Only assessment questions and responses are sent to Claude API for insights</li>
              <li>We use rate limiting to prevent abuse</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Limitation of Liability</h2>
            <p>
              The creator of this application is not liable for any psychological, emotional, or other harm 
              that may result from use of this application. Use at your own risk and seek professional 
              support when needed.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. Changes to Terms</h2>
            <p>
              These terms may be updated from time to time. Continued use of the application constitutes 
              acceptance of any changes.
            </p>

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