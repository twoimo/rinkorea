
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

      {/* Hero Section - 모바일 최적화 */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">연락처</h1>
            <p className="text-base md:text-xl max-w-2xl mx-auto px-2">
              린코리아와 함께 더 나은 건설환경을 만들어가세요. <br className="hidden md:block" />
              언제든지 문의해 주시면 성심껏 답변드리겠습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info - 모바일 최적화 */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">회사 정보</h2>

          <div className="space-y-6 md:space-y-8">
            {/* 주소 */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-lg mr-4 flex-shrink-0">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">주소</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    인천광역시 서구 백범로 707 (주안국가산업단지) <br />
                    천안 테크노파크 산업단지 입주예정 (2026~)
                  </p>
                </div>
              </div>
            </div>

            {/* 전화번호 */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-lg mr-4 flex-shrink-0">
                  <Phone className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">전화번호</h3>
                  <a 
                    href="tel:032-571-1023" 
                    className="text-sm md:text-base text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    032-571-1023
                  </a>
                </div>
              </div>
            </div>

            {/* 이메일 */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="bg-red-100 p-3 rounded-lg mr-4 flex-shrink-0">
                  <Mail className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">이메일</h3>
                  <a 
                    href="mailto:2019@rinkorea.com" 
                    className="text-sm md:text-base text-blue-600 hover:text-blue-700 font-medium transition-colors break-all"
                  >
                    2019@rinkorea.com
                  </a>
                </div>
              </div>
            </div>

            {/* 사업자 정보 */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">사업자 정보</h3>
              <div className="space-y-2 md:space-y-3 text-gray-600">
                <div className="flex flex-col md:flex-row">
                  <span className="font-medium text-gray-700 mb-1 md:mb-0 md:mr-2 text-sm md:text-base">상호:</span>
                  <span className="text-sm md:text-base">린코리아</span>
                </div>
                <div className="flex flex-col md:flex-row">
                  <span className="font-medium text-gray-700 mb-1 md:mb-0 md:mr-2 text-sm md:text-base">사업자등록번호:</span>
                  <span className="text-sm md:text-base">747-42-00526</span>
                </div>
                <div className="flex flex-col md:flex-row">
                  <span className="font-medium text-gray-700 mb-1 md:mb-0 md:mr-2 text-sm md:text-base">대표:</span>
                  <span className="text-sm md:text-base">김정희</span>
                </div>
              </div>
            </div>

            {/* 소셜 미디어 - 모바일 최적화 */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">소셜 미디어</h3>
              <div className="grid grid-cols-3 gap-4 md:flex md:space-x-6">
                <a
                  href="https://www.instagram.com/rinkorea_kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col md:flex-row items-center group p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Instagram"
                >
                  <OptimizedImage
                    src="/images/instagram-icon.png"
                    alt="Instagram"
                    className="h-8 w-8 md:h-6 md:w-6 mb-2 md:mb-0 md:mr-2"
                    loadingClassName="bg-white"
                    errorClassName="bg-white"
                  />
                  <span className="text-xs md:text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Instagram</span>
                </a>
                <a
                  href="https://blog.naver.com/rinkorea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col md:flex-row items-center group p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Naver Blog"
                >
                  <OptimizedImage
                    src="/images/blog-logo-hq.png"
                    alt="Naver Blog"
                    className="h-8 w-8 md:h-6 md:w-6 mb-2 md:mb-0 md:mr-2"
                    loadingClassName="bg-white"
                    errorClassName="bg-white"
                  />
                  <span className="text-xs md:text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Blog</span>
                </a>
                <a
                  href="https://www.youtube.com/@rinkorea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col md:flex-row items-center group p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="YouTube"
                >
                  <OptimizedImage
                    src="/images/youtube-icon.png"
                    alt="YouTube"
                    className="h-8 w-8 md:h-6 md:w-6 mb-2 md:mb-0 md:mr-2"
                    loadingClassName="bg-white"
                    errorClassName="bg-white"
                  />
                  <span className="text-xs md:text-sm text-gray-600 group-hover:text-gray-900 transition-colors">YouTube</span>
                </a>
              </div>
            </div>

            {/* 빠른 연락 버튼 - 모바일 전용 */}
            <div className="block md:hidden">
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="tel:032-571-1023"
                  className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  전화하기
                </a>
                <a
                  href="mailto:2019@rinkorea.com"
                  className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  메일보내기
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
