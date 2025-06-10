import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto w-full">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <img
              src="/images/린코리아-홈페이지-로고-블랙.png"
              alt="린코리아 로고"
              className="h-10 w-auto mb-4 filter invert"
            />
            <h3 className="text-lg font-bold mb-4">린코리아</h3>
            <p className="text-gray-300 mb-2">
              주소: 인천광역시 서구 백범로 707 (주안국가산업단지)
            </p>
            <p className="text-gray-300 mb-2">
              사업자등록번호: 747-42-00526
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">빠른 링크</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">회사소개</Link></li>
              <li><Link to="/products" className="text-gray-300 hover:text-white transition-colors">제품소개</Link></li>
              <li><Link to="/projects" className="text-gray-300 hover:text-white transition-colors">시공사례</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">연락처</Link></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">소셜 미디어</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/rinkorea_kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-75 transition-opacity"
              >
                <img
                  src="/images/instagram.png"
                  alt="Instagram"
                  className="w-8 h-8"
                />
              </a>
              <a
                href="https://blog.naver.com/rinkorea"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-75 transition-opacity"
              >
                <img
                  src="/images/블로그-로고-고화질.png"
                  alt="Naver Blog"
                  className="w-8 h-8"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 린코리아. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
