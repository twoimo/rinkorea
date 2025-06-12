
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Phone, Mail, Clock, Building2, User, ArrowRight } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/image';

const Contact = () => {
  const contactMethods = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: '전화 문의',
      content: '032-571-1023',
      description: '평일 09:00 - 18:00',
      action: 'tel:032-571-1023',
      actionText: '전화걸기',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: '이메일 문의',
      content: '2019@rinkorea.com',
      description: '24시간 접수 가능',
      action: 'mailto:2019@rinkorea.com',
      actionText: '이메일 보내기',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: '방문 상담',
      content: '인천광역시 서구 백범로 707',
      description: '주안국가산업단지',
      action: '/about',
      actionText: '오시는 길',
      color: 'from-red-500 to-red-600'
    }
  ];

  const businessHours = [
    { day: '평일', time: '09:00 - 18:00', status: 'open' },
    { day: '토요일', time: '휴무', status: 'closed' },
    { day: '일요일', time: '휴무', status: 'closed' },
    { day: '공휴일', time: '휴무', status: 'closed' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              <span className="text-sm font-semibold">CONTACT US</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-8">
              린코리아와 <span className="text-yellow-400">함께하세요</span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed">
              더 나은 건설환경을 만들어가는 여정에 동참해주세요.<br />
              전문적인 상담과 맞춤형 솔루션을 제공합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">빠른 연락 방법</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              다양한 방법으로 린코리아와 연결하실 수 있습니다. 편리한 방법을 선택해주세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <div key={index} className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className={`bg-gradient-to-br ${method.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform`}>
                  {method.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-lg text-gray-800 font-medium mb-2">{method.content}</p>
                <p className="text-gray-600 mb-6">{method.description}</p>
                <Link
                  to={method.action}
                  className="group/btn inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  <span>{method.actionText}</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Information */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Company Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">회사 정보</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  린코리아는 2019년 설립된 건설업계 전문기업으로, 고객의 성공적인 프로젝트를 위해 
                  최고의 제품과 서비스를 제공합니다.
                </p>
              </div>

              {/* Address Information */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 w-12 h-12 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">본사 주소</h3>
                    <p className="text-gray-800 font-medium mb-1">
                      인천광역시 서구 백범로 707
                    </p>
                    <p className="text-gray-600 text-sm mb-4">주안국가산업단지</p>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium">
                        📍 천안 테크노파크 산업단지 입주예정 (2026년~)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">전화번호</h4>
                    <p className="text-gray-800 font-medium">032-571-1023</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">이메일</h4>
                    <p className="text-gray-800 font-medium">2019@rinkorea.com</p>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <Clock className="w-6 h-6 text-gray-600" />
                  <h3 className="text-xl font-bold text-gray-900">운영시간</h3>
                </div>
                <div className="space-y-3">
                  {businessHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium">{schedule.day}</span>
                      <span className={`font-semibold ${schedule.status === 'open' ? 'text-green-600' : 'text-red-500'}`}>
                        {schedule.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Business Registration & Social Links */}
            <div className="space-y-8">
              {/* Business Registration */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border border-blue-200">
                <div className="flex items-center space-x-3 mb-6">
                  <Building2 className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">사업자 정보</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-blue-200">
                    <span className="text-gray-700 font-medium">상호</span>
                    <span className="text-gray-900 font-bold">린코리아</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-blue-200">
                    <span className="text-gray-700 font-medium">사업자등록번호</span>
                    <span className="text-gray-900 font-bold">747-42-00526</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-700 font-medium">대표</span>
                    <span className="text-gray-900 font-bold">김정희</span>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">소셜 미디어</h3>
                <p className="text-gray-600 mb-6">
                  린코리아의 최신 소식과 프로젝트 사례를 소셜 미디어에서 확인하세요.
                </p>
                <div className="space-y-4">
                  <a
                    href="https://www.instagram.com/rinkorea_kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <OptimizedImage
                      src="/images/instagram-icon.png"
                      alt="Instagram"
                      className="h-10 w-10"
                      loadingClassName="bg-gray-200"
                      errorClassName="bg-gray-200"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Instagram
                      </h4>
                      <p className="text-sm text-gray-600">@rinkorea_kr</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all ml-auto" />
                  </a>

                  <a
                    href="https://blog.naver.com/rinkorea"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <OptimizedImage
                      src="/images/blog-logo-hq.png"
                      alt="Naver Blog"
                      className="h-10 w-10"
                      loadingClassName="bg-gray-200"
                      errorClassName="bg-gray-200"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        Naver Blog
                      </h4>
                      <p className="text-sm text-gray-600">전문 정보 및 소식</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all ml-auto" />
                  </a>

                  <a
                    href="https://www.youtube.com/@rinkorea"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <OptimizedImage
                      src="/images/youtube-icon.png"
                      alt="YouTube"
                      className="h-10 w-10"
                      loadingClassName="bg-gray-200"
                      errorClassName="bg-gray-200"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                        YouTube
                      </h4>
                      <p className="text-sm text-gray-600">제품 데모 및 시연 영상</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all ml-auto" />
                  </a>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">지금 상담받으세요</h3>
                <p className="text-red-100 mb-6 leading-relaxed">
                  건설 프로젝트에 대한 전문적인 상담과 맞춤형 솔루션을 제공해드립니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:032-571-1023"
                    className="bg-white text-red-700 hover:bg-red-50 px-6 py-3 rounded-full font-semibold transition-colors text-center"
                  >
                    지금 전화하기
                  </a>
                  <Link
                    to="/qna"
                    className="border-2 border-white text-white hover:bg-white hover:text-red-700 px-6 py-3 rounded-full font-semibold transition-colors text-center"
                  >
                    온라인 문의
                  </Link>
                </div>
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
