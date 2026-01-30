import React from 'react';
import Link from 'next/link';
import { BookOpen, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-white">
              <BookOpen className="h-6 w-6" />
              <span className="text-xl font-bold">SkillBridge</span>
            </Link>
            <p className="text-sm text-gray-400">
              Connect with expert tutors and unlock your learning potential. Find the perfect instructor for any subject.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/tutors" className="text-sm hover:text-white transition-colors">
                  Find Tutors
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm hover:text-white transition-colors">
                  Become a Tutor
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Popular Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tutors?category=mathematics" className="text-sm hover:text-white transition-colors">
                  Mathematics
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=programming" className="text-sm hover:text-white transition-colors">
                  Programming
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=languages" className="text-sm hover:text-white transition-colors">
                  Languages
                </Link>
              </li>
              <li>
                <Link href="/tutors?category=science" className="text-sm hover:text-white transition-colors">
                  Science
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">support@skillbridge.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">123 Learning Street, Education City, EC 12345</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} SkillBridge. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
