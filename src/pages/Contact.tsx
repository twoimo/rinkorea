import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Phone, Mail } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/image';

const Contact = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">연락처</h1>
            <p className="text-xl max-w-2xl mx-auto">
              린코리아와 함께 더 나은 건설환경을 만들어가세요. <br />
              언제든지 문의해 주시면 성심껏 답변드리겠습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">회사 정보</h2>

          <div className="space-y-8">
            <div className="flex items-start">
              <MapPin className="w-6 h-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">주소</h3>
                <p className="text-gray-600">
                  인천광역시 서구 백범로 707 (주안국가산업단지)
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="w-6 h-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">전화번호</h3>
                <p className="text-gray-600">032-123-4567</p>
              </div>
            </div>

            <div className="flex items-start">
              <Mail className="w-6 h-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">이메일</h3>
                <p className="text-gray-600">info@rinkorea.com</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">사업자 정보</h3>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">상호:</span> 린코리아</p>
                <p><span className="font-medium">사업자등록번호:</span> 747-42-00526</p>
                <p><span className="font-medium">대표:</span> 김정희</p>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">소셜 미디어</h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.instagram.com/rinkorea_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <OptimizedImage
                    src="/images/instagram.png"
                    alt="Instagram"
                    className="h-6 w-6"
                    loadingClassName="bg-white"
                    errorClassName="bg-white"
                  />
                </a>
                <a
                  href="https://blog.naver.com/rinkorea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <OptimizedImage
                    src="/images/블로그-로고-고화질.png"
                    alt="Naver Blog"
                    className="h-6 w-6"
                    loadingClassName="bg-white"
                    errorClassName="bg-white"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
