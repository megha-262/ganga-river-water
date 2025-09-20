import React, { useState } from 'react';
import { Droplets, Factory, AlertTriangle, Church, Phone, Mail } from 'lucide-react';
import ModernCard from '../components/ModernCard';

const emergencyProtocols = [
  {
    id: 'waterContamination',
    title: 'Water Contamination Emergency 🔥',
    icon: Droplets,
    details: {
      immediateSafety: [
        'Do not consume or use contaminated water.',
        'Evacuate the immediate area if advised by authorities.',
        'Wear protective gear (gloves, masks) if contact with water is unavoidable.',
      ],
      reportIncident: [
        'Contact local emergency services immediately (e.g., 112, 100).',
        'Notify the Ganga River Basin Authority or relevant environmental agencies.',
        'Provide precise location, time, and observed details of the contamination.',
      ],
      documentEvidence: [
        'Take photos and videos of the affected area, water color, dead aquatic life, etc.',
        'Note down any unusual smells, sources, or activities observed.',
        'Collect water samples if safe to do so, following proper protocols.',
      ],
      communityAlert: [
        'Warn local communities, especially those dependent on the river for water.',
        'Share official advisories and safety instructions.',
        'Avoid spreading unverified information; rely on official sources.',
      ],
      contacts: [
        { name: 'National Disaster Response Force', phone: '1078', email: 'ndrf@nic.in' },
        { name: 'State Pollution Control Board', phone: '1800-180-xxxx', email: 'spcb@gov.in' },
      ],
    },
  },
  {
    id: 'industrialDischarge',
    title: 'Industrial Discharge Alert 🏭',
    icon: Factory,
    details: {
      immediateSafety: [
        'Maintain a safe distance from the discharge point.',
        'Avoid contact with water or any visible pollutants.',
        'Do not attempt to intervene or clean up without proper training and equipment.',
      ],
      reportIncident: [
        'Report to the State Pollution Control Board and local authorities.',
        'Provide details of the industry, discharge type, and impact.',
        'Use the Ganga Monitoring App to report with location and photos.',
      ],
      documentEvidence: [
        'Photograph the discharge, the source (if visible), and any affected areas.',
        'Record the time, date, and weather conditions.',
        'Note down any company names or vehicle numbers if applicable.',
      ],
      communityAlert: [
        'Inform nearby villages and communities about potential health risks.',
        'Advise against using river water for drinking, bathing, or irrigation.',
        'Collaborate with local NGOs for awareness campaigns.',
      ],
      contacts: [
        { name: 'Central Pollution Control Board', phone: '011-22307233', email: 'cpcb@nic.in' },
        { name: 'District Magistrate Office', phone: 'Local District Number', email: 'dm@district.in' },
      ],
    },
  },
  {
    id: 'sewageOverflow',
    title: 'Sewage Overflow Response ⚠️',
    icon: AlertTriangle,
    details: {
      immediateSafety: [
        'Stay away from areas with sewage overflow.',
        'Prevent children and pets from accessing contaminated zones.',
        'Practice good hygiene: wash hands thoroughly after potential exposure.',
      ],
      reportIncident: [
        'Contact the local municipal corporation or urban development authority.',
        'Report to the Jal Nigam or water supply department.',
        'Specify the exact location and estimated volume of the overflow.',
      ],
      documentEvidence: [
        'Take pictures of the overflow, affected streets, and water bodies.',
        'Document any damage to property or public health concerns.',
        'Note the duration and frequency of such incidents.',
      ],
      communityAlert: [
        'Advise residents to boil water if their supply is affected.',
        'Organize community clean-up drives after the issue is resolved, with proper safety gear.',
        'Educate about proper waste disposal and sanitation practices.',
      ],
      contacts: [
        { name: 'Local Municipal Corporation', phone: 'Local City Number', email: 'mcorp@city.in' },
        { name: 'Jal Nigam / Water Board', phone: 'Local Water Board Number', email: 'jalnigam@state.in' },
      ],
    },
  },
  {
    id: 'religiousActivityImpact',
    title: 'Religious Activity Impact ⛪',
    icon: Church,
    details: {
      immediateSafety: [
        'Be mindful of crowds during religious gatherings near the river.',
        'Avoid direct contact with offerings or materials immersed in the river.',
        'Promote eco-friendly alternatives for rituals and offerings.',
      ],
      reportIncident: [
        'Engage with local religious leaders and community elders.',
        'Report excessive pollution from religious activities to environmental NGOs.',
        'Suggest designated immersion sites or artificial ponds to authorities.',
      ],
      documentEvidence: [
        'Document instances of excessive waste, plastic, or non-biodegradable materials.',
        'Photograph the aftermath of large gatherings if pollution is evident.',
        'Collect data on the types and quantities of waste generated.',
      ],
      communityAlert: [
        'Organize awareness campaigns on sustainable religious practices.',
        'Encourage the use of biodegradable materials for offerings.',
        'Highlight the importance of river cleanliness for spiritual well-being.',
      ],
      contacts: [
        { name: 'Local Religious Authorities', phone: 'Local Temple/Mosque/Church Number', email: 'religious@community.in' },
        { name: 'Environmental NGOs', phone: 'NGO Helpline', email: 'ngo@email.com' },
      ],
    },
  },
];

const EmergencyResponse = () => {
  const [selectedProtocol, setSelectedProtocol] = useState(emergencyProtocols[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 text-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10 animate-fade-in scroll-slide-up">
          Ganga Emergency Response Protocols
        </h1>

        <p className="text-center text-lg text-gray-600 mb-12 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
          Quick access to essential guidelines for various water-related emergencies in the Ganga River.
          Select a protocol to view detailed steps and emergency contacts.
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Selectable Protocol Cards */}
          <div className="lg:w-1/3 space-y-6 animate-fade-in scroll-slide-left" style={{animationDelay: '0.4s'}}>
            {emergencyProtocols.map((protocol) => (
              <ModernCard
                key={protocol.id}
                title={protocol.title}
                icon={protocol.icon}
                variant={selectedProtocol.id === protocol.id ? 'glass' : 'default'}
                className={`cursor-pointer hover-lift ${selectedProtocol.id === protocol.id ? 'border-2 border-blue-500' : ''}`}
                onClick={() => setSelectedProtocol(protocol)}
              />
            ))}
          </div>

          {/* Right Column: Detailed Steps */}
          <div className="lg:w-2/3 bg-white bg-opacity-90 rounded-xl shadow-xl p-8 space-y-8 animate-fade-in scroll-slide-right" style={{animationDelay: '0.6s'}}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200">
              {selectedProtocol.title}
            </h2>

            {Object.entries(selectedProtocol.details).map(([sectionTitle, steps]) => (
              sectionTitle !== 'contacts' && (
                <div key={sectionTitle} className="space-y-3">
                  <h3 className="text-2xl font-semibold text-blue-700 capitalize flex items-center">
                    {sectionTitle.replace(/([A-Z])/g, ' $1').trim()}{/* Format camelCase to Title Case */}
                  </h3>
                  <ol className="list-decimal list-inside text-gray-700 space-y-2 pl-4">
                    {steps.map((step, index) => (
                      <li key={index} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )
            ))}

            {/* Emergency Contacts */}
            <div className="border-t pt-6 mt-8 border-gray-200">
              <h3 className="text-2xl font-semibold text-red-600 mb-4 flex items-center">
                Emergency Contacts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedProtocol.details.contacts.map((contact, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-red-50 p-4 rounded-lg shadow-sm hover-lift">
                    <Phone className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-800">{contact.name}</p>
                      <a href={`tel:${contact.phone}`} className="text-red-600 hover:underline">
                        {contact.phone}
                      </a>
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="text-red-600 hover:underline block">
                          {contact.email}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyResponse;