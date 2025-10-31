import { Heart, Facebook, Instagram, Linkedin, Twitter, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <Heart className="h-8 w-8 text-jamaican-gold mr-2" />
              <span className="text-xl font-heading font-bold">JHRF</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Rebuilding Stronger. Together.
              <br />
              Supporting Jamaica's hurricane recovery and climate resilience.
            </p>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-jamaican-gold transition">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-jamaican-gold transition">Our Impact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-jamaican-gold transition">Get Involved</a></li>
              <li><a href="#" className="text-gray-400 hover:text-jamaican-gold transition">News & Updates</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start">
                <Mail className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                <a href="mailto:info@jamaicahurricanefund.org" className="hover:text-jamaican-gold transition">
                  info@jamaicahurricanefund.org
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                <span>Alberta, Canada</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                <span>Kingston, Jamaica</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Follow Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-jamaican-gold transition">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-jamaican-gold transition">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-jamaican-gold transition">
                <Linkedin size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-jamaican-gold transition">
                <Twitter size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              2024 Jamaica Hurricane Recovery Fund. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-jamaican-gold transition">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-jamaican-gold transition">
                Transparency Report
              </a>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Partnered with: Stigg Security Inc. | Omega Group | Alberta Tech Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
