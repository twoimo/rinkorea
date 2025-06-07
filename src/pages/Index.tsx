
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowRight, Shield, Leaf, Award } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: <Shield className="w-12 h-12 text-blue-900" />,
      title: "불연재 인증",
      description: "국토교통부 불연재 인증을 받은 안전한 세라믹 코팅제"
    },
    {
      icon: <Leaf className="w-12 h-12 text-green-600" />,
      title: "친환경 소재",
      description: "환경을 생각하는 친환경 1액형 신소재 세라믹 코팅"
    },
    {
      icon: <Award className="w-12 h-12 text-yellow-600" />,
      title: "우수한 품질",
      description: "다양한 시험성적서와 인증으로 검증된 품질"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white">
        <div 
          className="relative min-h-screen bg-cover bg-center flex items-center"
          style={{
            backgroundImage: `url('https://rinkorea.com/wp-content/uploads/2024/08/JS-린코리아-홈페이지-01.png')`
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black opacity-60"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl bg-black bg-opacity-40 p-8 rounded-lg backdrop-blur-sm">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                린코리아,<br />
                <span className="text-blue-400">세라믹 코팅의 모든 것</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-100 drop-shadow-md">
                친환경 불연재(1액형) 신소재 세라믹 코팅제
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/contact" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center shadow-lg"
                >
                  제품 문의하기
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link 
                  to="/shop" 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center shadow-lg"
                >
                  제품 구매하기
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link 
                  to="/projects" 
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center shadow-lg"
                >
                  시공사례 보기
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              린코리아만의 특별함
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              최고 품질의 세라믹 코팅제로 안전하고 친환경적인 건설환경을 만들어갑니다
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                신뢰할 수 있는 파트너
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                린코리아는 건설재료사업부와 2024년 신설된 건설기계사업부를 통해 
                종합적인 건설 솔루션을 제공합니다.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">인천광역시 서구 백범로 707 (주안국가산업단지)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">사업자등록번호: 747-42-00526</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">건설재료사업부 / 건설기계사업부</span>
                </div>
              </div>
              <Link 
                to="/about" 
                className="inline-block mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                회사소개 자세히 보기
              </Link>
            </div>
            <div className="lg:order-first">
              <img 
                src="https://rinkorea.com/wp-content/uploads/2022/04/1-메인-18.jpg" 
                alt="린코리아 제품" 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
