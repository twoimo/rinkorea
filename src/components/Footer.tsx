import React from 'react';
import { Link } from 'react-router-dom';
import { OptimizedImage } from '@/components/ui/image';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white mt-auto w-full">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">{t('footer_company_info')}</h3>
            <div className="space-y-2">
              <p className="text-gray-300 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('footer_address')}
              </p>
              <p className="text-gray-300 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('footer_business_number')}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">{t('footer_quick_links')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-white transition-colors"></span>
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-white transition-colors"></span>
                  {t('products')}
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-white transition-colors"></span>
                  {t('projects')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-white transition-colors"></span>
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">{t('footer_customer_service')}</h3>
            <div className="space-y-2">
              <p className="text-gray-300 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {t('phone_number')}
              </p>
              <p className="text-gray-300 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                2019@rinkorea.com
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">{t('footer_social_media')}</h3>
            <div className="flex space-x-6">
              <a
                href="https://www.instagram.com/rinkorea_kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors transform hover:scale-110"
              >
                <OptimizedImage
                  src="/images/instagram-icon.png"
                  alt="Instagram"
                  className="h-8 w-8"
                  loadingClassName="bg-gray-800"
                  errorClassName="bg-gray-800"
                />
              </a>
              <a
                href="https://blog.naver.com/rinkorea"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors transform hover:scale-110"
              >
                <OptimizedImage
                  src="/images/blog-logo-hq.png"
                  alt="Naver Blog"
                  className="h-8 w-8"
                  loadingClassName="bg-gray-800"
                  errorClassName="bg-gray-800"
                />
              </a>
              <a
                href="https://www.youtube.com/@rinkorea"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors transform hover:scale-110"
              >
                <OptimizedImage
                  src="/images/youtube-icon.png"
                  alt="YouTube"
                  className="h-8 w-8"
                  loadingClassName="bg-gray-800"
                  errorClassName="bg-gray-800"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            {t('footer_copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
