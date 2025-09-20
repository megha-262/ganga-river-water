import React from 'react';
import { Shield, Eye, Lock, Database, Users, FileText } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            Your privacy is important to us. Learn how we protect your data.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          <section>
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Information We Collect</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                The Ganga Water Quality Monitoring Platform collects and processes the following types of information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Water quality sensor data from monitoring stations</li>
                <li>Geographic location data of monitoring points</li>
                <li>Environmental parameters and measurements</li>
                <li>Usage analytics to improve our services</li>
                <li>Contact information when you reach out to us</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Database className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">How We Use Your Information</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Providing real-time water quality monitoring services</li>
                <li>Generating alerts and forecasts for water quality issues</li>
                <li>Improving our monitoring algorithms and predictions</li>
                <li>Research and development for better water quality management</li>
                <li>Communicating with users about service updates</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Data Protection</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                We implement appropriate security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data storage and backup procedures</li>
                <li>Compliance with relevant data protection regulations</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Data Sharing</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                We may share aggregated, anonymized data with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Environmental research institutions</li>
                <li>Government agencies for policy making</li>
                <li>Academic researchers studying water quality</li>
                <li>Public health organizations</li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                We never share personally identifiable information without explicit consent.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Your Rights</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
              </ul>
            </div>
          </section>

          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <div className="text-gray-700">
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><strong>Email:</strong> privacy@gangamonitoring.org</p>
                <p><strong>Address:</strong> New Delhi, India</p>
                <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;