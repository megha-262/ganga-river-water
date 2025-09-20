import React from 'react';
import { 
  Twitter, 
  Linkedin, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  Heart,
  ExternalLink,
  Waves
} from 'lucide-react';

const Footer = () => {
  const footerLinks = [
    {
      title: 'Quick Links',
      links: [
        { name: 'Contact', href: '/contact' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Data Sources', href: '/data-sources' },
        { name: 'Hackathon Credits', href: '/credits' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'API Documentation', href: '/api-docs' },
        { name: 'Research Papers', href: '/research' },
        { name: 'Community Guidelines', href: '/guidelines' },
        { name: 'Developer Portal', href: '/developers' }
      ]
    },
    {
      title: 'Get Involved',
      links: [
        { name: 'Report Issues', href: '/report' },
        { name: 'Volunteer', href: '/volunteer' },
        { name: 'Donate', href: '/donate' },
        { name: 'Partner with Us', href: '/partnership' }
      ]
    }
  ];

  const socialLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      href: 'https://twitter.com/gangamonitoring',
      color: 'hover:text-blue-400'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: 'https://linkedin.com/company/ganga-monitoring',
      color: 'hover:text-blue-600'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      href: 'https://youtube.com/c/gangamonitoring',
      color: 'hover:text-red-500'
    }
  ];

  const contactInfo = [
    {
      icon: Mail,
      text: 'info@gangamonitoring.org',
      href: 'mailto:info@gangamonitoring.org'
    },
    {
      icon: Phone,
      text: '+91 11 2345 6789',
      href: 'tel:+911123456789'
    },
    {
      icon: MapPin,
      text: 'New Delhi, India',
      href: '#'
    }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="rgba(59, 130, 246, 0.1)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Waves className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Ganga Monitor</h3>
                  <p className="text-blue-200 text-sm">Water Quality Platform</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Real-time monitoring and prediction system for Ganga river water quality, 
                empowering communities with data-driven insights for a cleaner future.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                {contactInfo.map((contact, index) => (
                  <a
                    key={index}
                    href={contact.href}
                    className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group"
                  >
                    <contact.icon className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                    <span className="text-sm">{contact.text}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            {footerLinks.map((section, index) => (
              <div key={index} className="lg:col-span-1">
                <h4 className="text-lg font-semibold mb-6 text-white">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                      >
                        <span>{link.name}</span>
                        <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Tagline Section */}
        <div className="py-8 border-t border-gray-700/50">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-green-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10">
              <Heart className="w-5 h-5 text-red-400 animate-pulse" />
              <span className="text-lg font-medium bg-gradient-to-r from-blue-200 to-green-200 bg-clip-text text-transparent">
                Together for a Cleaner Ganga
              </span>
              <span className="text-2xl">🌊</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-8 border-t border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              <p>© 2024 Ganga Water Quality Monitoring Platform. All rights reserved.</p>
              <p className="mt-1">Built with ❤️ for a sustainable future</p>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              <span className="text-gray-400 text-sm hidden md:block">Follow us:</span>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full 
                      flex items-center justify-center text-gray-300 
                      ${social.color} transition-all duration-300 
                      hover:bg-white/20 hover:scale-110 hover:shadow-lg
                      group
                    `}
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-blue-500/10 rounded-full animate-float"></div>
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-green-500/10 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-indigo-500/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
    </footer>
  );
};

export default Footer;