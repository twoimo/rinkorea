
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, Building, Users, Globe } from 'lucide-react';
import { OptimizedImage } from '../ui/image';

export const CompanyOverview = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }} />
      </div>
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          {/* Enhanced Content */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-full px-8 py-4 mb-10 shadow-lg border border-blue-100">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <span className="text-blue-800 font-bold text-lg">15년 이상의 신뢰와 경험</span>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            
            <h2 className="text-6xl md:text-7xl font-black text-gray-900 mb-10 leading-tight">
              <span className="block bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                신뢰할 수 있는
              </span>
              <span className="block bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                파트너
              </span>
            </h2>
            
            <p className="text-2xl text-gray-600 mb-12 leading-relaxed font-light">
              린코리아는 <span className="font-semibold text-blue-600">건설재료사업부</span>와 
              <span className="font-semibold text-emerald-600"> 2024년 신설된 건설기계사업부</span>를 통해
              종합적인 건설 솔루션을 제공합니다.
            </p>
            
            {/* Enhanced Info Cards */}
            <div className="space-y-8 mb-12">
              <div className="group flex items-center bg-gradient-to-r from-blue-50 via-blue-25 to-transparent rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-blue-100 transform hover:-translate-y-1">
                <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl mr-8 font-black text-2xl group-hover:scale-110 transition-transform shadow-xl">
                  <Building className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800 mb-2">본사 위치</h3>
                  <span className="text-gray-700 text-lg">인천광역시 서구 백범로 707 (주안국가산업단지)</span>
                </div>
              </div>
              
              <div className="group flex items-center bg-gradient-to-r from-emerald-50 via-emerald-25 to-transparent rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-emerald-100 transform hover:-translate-y-1">
                <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl mr-8 font-black text-2xl group-hover:scale-110 transition-transform shadow-xl">
                  <Globe className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800 mb-2">사업자등록번호</h3>
                  <span className="text-gray-700 text-lg">747-42-00526</span>
                </div>
              </div>
              
              <div className="group flex items-center bg-gradient-to-r from-amber-50 via-amber-25 to-transparent rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-amber-100 transform hover:-translate-y-1">
                <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl mr-8 font-black text-2xl group-hover:scale-110 transition-transform shadow-xl">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800 mb-2">사업 분야</h3>
                  <span className="text-gray-700 text-lg">건설재료사업부 / 건설기계사업부</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced CTA */}
            <Link
              to="/about"
              className="group inline-flex items-center gap-4 bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 hover:from-blue-700 hover:via-blue-800 hover:to-emerald-700 text-white px-12 py-6 rounded-3xl font-black text-xl transition-all duration-500 shadow-2xl hover:shadow-3xl transform hover:-translate-y-3 hover:scale-105"
            >
              <span>회사소개 자세히 보기</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
          
          {/* Enhanced Image Section */}
          <div className="order-1 lg:order-2 flex justify-center items-center">
            <div className="relative group">
              {/* Enhanced Decorative Background */}
              <div className="absolute -inset-8 bg-gradient-to-r from-blue-600 via-emerald-600 to-blue-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-700 animate-pulse" />
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity duration-500" />
              
              <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden shadow-3xl border-8 border-white group-hover:scale-105 transition-all duration-700">
                <OptimizedImage
                  src="/images/1-메인-18.jpg"
                  alt="린코리아 제품"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  loadingClassName="bg-gradient-to-br from-blue-50 to-emerald-50"
                  errorClassName="bg-gradient-to-br from-blue-50 to-emerald-50"
                />
                
                {/* Enhanced Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Floating Badge */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-xl text-blue-600 px-6 py-3 rounded-full font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-4 group-hover:translate-y-0">
                  15+ Years
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
