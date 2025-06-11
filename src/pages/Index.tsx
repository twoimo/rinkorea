
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowRight, Shield, Leaf, Award, Loader2, CheckCircle, XCircle, Play, Star, TrendingUp } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useUserRole } from '../hooks/useUserRole';
import { OptimizedImage } from '@/components/ui/image';
import type { SupabaseClient } from '@supabase/supabase-js';

const Index = () => {
  const { isAdmin } = useUserRole();
  const [youtubeLink, setYoutubeLink] = useState('https://www.youtube.com/embed/W6ACoEMN3-0?autoplay=1&mute=1&controls=0&loop=1&playlist=W6ACoEMN3-0&showinfo=0&rel=0&modestbranding=1');
  const [editLink, setEditLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const features = [
    {
      icon: <Shield className="w-12 h-12 text-blue-600" />,
      title: "불연재 인증",
      description: "국토교통부 불연재 인증을 받은 안전한 세라믹 코팅제",
      gradient: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-50"
    },
    {
      icon: <Leaf className="w-12 h-12 text-green-600" />,
      title: "친환경 소재",
      description: "환경을 생각하는 친환경 1액형 신소재 세라믹 코팅",
      gradient: "from-green-500 to-green-700",
      bgColor: "bg-green-50"
    },
    {
      icon: <Award className="w-12 h-12 text-amber-600" />,
      title: "우수한 품질",
      description: "다양한 시험성적서와 인증으로 검증된 품질",
      gradient: "from-amber-500 to-amber-700",
      bgColor: "bg-amber-50"
    }
  ];

  const stats = [
    { number: "1000+", label: "시공 현장", icon: <TrendingUp className="w-6 h-6" /> },
    { number: "15+", label: "년 경험", icon: <Star className="w-6 h-6" /> },
    { number: "99%", label: "고객 만족도", icon: <Award className="w-6 h-6" /> },
  ];

  // 유튜브 링크 불러오기
  const loadYoutubeLink = async () => {
    try {
      const { data, error } = await (supabase as SupabaseClient)
        .from('site_settings')
        .select('value')
        .eq('key', 'youtube_link')
        .single();
      if (!error && data?.value) {
        setYoutubeLink(data.value);
        setEditLink(data.value);
      }
    } catch (e) {
      // 기본값 유지
    }
  };

  useEffect(() => {
    loadYoutubeLink();
  }, []);

  // 유튜브 주소를 embed 주소로 변환
  const toEmbedUrl = (url: string) => {
    if (url.includes('/embed/')) return url;
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([\w-]+)/);
    if (watchMatch) {
      const id = watchMatch[1];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&showinfo=0&rel=0&modestbranding=1`;
    }
    const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
    if (shortMatch) {
      const id = shortMatch[1];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&showinfo=0&rel=0&modestbranding=1`;
    }
    return url;
  };

  const embedPreview = toEmbedUrl(editLink);

  const handleSaveYoutubeLink = async () => {
    setLoading(true);
    setResult('');
    try {
      const embedUrl = toEmbedUrl(editLink);
      const { error } = await (supabase as SupabaseClient)
        .from('site_settings')
        .upsert({ key: 'youtube_link', value: embedUrl, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) {
        setResult('error:' + error.message);
      } else {
        setYoutubeLink(embedUrl);
        setResult('success:유튜브 링크가 저장되었습니다.');
      }
    } catch (e) {
      setResult('error:' + (e.message || e));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Header />

      {/* Hero Section - Enhanced */}
      <section className="relative">
        <div className="relative w-full h-screen overflow-hidden">
          {/* YouTube Video Background */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <iframe
              className="absolute top-1/2 left-1/2"
              style={{
                width: '100vw',
                height: '56.25vw',
                minHeight: '100vh',
                minWidth: '177.78vh',
                transform: 'translate(-50%, -50%) scale(1.11)',
                objectFit: 'cover',
                pointerEvents: 'none'
              }}
              src={youtubeLink}
              title="RIN-COAT Introduction"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Enhanced overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>

          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-pulse" style={{ top: '20%', left: '10%', animationDelay: '0s' }}></div>
            <div className="absolute w-1 h-1 bg-green-400 rounded-full opacity-40 animate-pulse" style={{ top: '60%', left: '80%', animationDelay: '1s' }}></div>
            <div className="absolute w-3 h-3 bg-amber-400 rounded-full opacity-20 animate-pulse" style={{ top: '80%', left: '20%', animationDelay: '2s' }}></div>
          </div>

          {/* Content - Enhanced */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full md:w-1/2 h-full flex items-center pl-8">
              <div className="relative group">
                {/* Glassmorphism background */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl transform group-hover:scale-105 transition-all duration-500"></div>
                
                <div className="relative p-12 w-full max-w-[480px] md:max-w-[540px] xl:max-w-[700px] text-left">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-green-500/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-2 mb-6">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="text-white/90 text-sm font-medium">특허받은 혁신 기술</span>
                  </div>

                  <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold mb-6 leading-tight text-white">
                    <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-green-400 bg-clip-text text-transparent drop-shadow-2xl">
                      친환경 불연재(1액형)
                      <br />
                      신소재 세라믹 코팅제
                    </span>
                  </h1>
                  
                  <p className="text-lg md:text-xl mb-8 text-white/90 drop-shadow-md leading-relaxed">
                    특허 제 10-2312833 호 / 상표 제 40-1678504 호
                    <br />
                    <span className="text-blue-300">안전하고 지속가능한 건설환경의 새로운 기준</span>
                  </p>

                  {/* CTA Buttons - Enhanced */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Link
                      to="/contact"
                      className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                    >
                      <span className="relative z-10">제품 문의하기</span>
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                    <Link
                      to="/shop"
                      className="group relative bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                    >
                      <span className="relative z-10">제품 구매하기</span>
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/projects"
                      className="group relative border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-xl backdrop-blur-sm hover:border-white/50 transform hover:-translate-y-1"
                    >
                      <Play className="mr-2 w-5 h-5" />
                      시공사례 보기
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center group">
                        <div className="flex items-center justify-center mb-2 text-blue-300 group-hover:text-blue-200 transition-colors">
                          {stat.icon}
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                        <div className="text-sm text-white/70">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block w-1/2"></div>
          </div>

          {/* Admin UI - Enhanced */}
          {isAdmin && (
            <div className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-2xl flex flex-col gap-3 max-w-md border border-white/20 w-full sm:w-auto">
              <div className="mb-1 font-bold text-white flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" style={{ display: loading ? 'inline' : 'none' }} />
                메인 유튜브 영상 링크 수정
              </div>
              <input
                type="text"
                className="border border-white/30 px-3 py-3 rounded-xl w-full text-sm focus:ring-2 focus:ring-blue-400 bg-white/20 backdrop-blur-sm text-white placeholder-white/70"
                value={editLink}
                onChange={e => setEditLink(e.target.value)}
                placeholder="유튜브 영상 주소 입력"
                disabled={loading}
              />
              <div className="text-xs text-blue-200 mt-1 mb-2 font-mono break-all">
                변환된 embed 주소: <span>{embedPreview}</span>
              </div>
              <button
                onClick={handleSaveYoutubeLink}
                disabled={loading || !editLink}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl disabled:opacity-50 transition-all duration-300 font-semibold transform hover:scale-105"
              >
                {loading ? (<span className="flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> 저장 중...</span>) : '저장'}
              </button>
              {result && (
                <div className={`flex items-center gap-2 text-xs mt-2 ${result.startsWith('success:') ? 'text-green-300' : 'text-red-300'}`}>
                  {result.startsWith('success:') ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {result.replace(/^\w+:/, '')}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-100/30 to-transparent rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-green-100 rounded-full px-6 py-3 mb-6">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">린코리아의 차별화된 기술력</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                린코리아만의 특별함
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              최고 품질의 세라믹 코팅제로 안전하고 친환경적인 건설환경을 만들어갑니다
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden"
              >
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>
                
                {/* Icon container */}
                <div className="relative z-10 flex justify-center mb-8">
                  <div className={`relative w-24 h-24 rounded-2xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                    {feature.icon}
                    {/* Pulsing effect */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                
                {/* Hover indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl"></div>
              </div>
            ))}
          </div>

          {/* Additional CTA */}
          <div className="text-center mt-16">
            <Link
              to="/products"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-10 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
            >
              <Award className="w-6 h-6" />
              <span>제품 상세정보 보기</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Company Overview - Enhanced */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-6 py-3 mb-8">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">15년 이상의 신뢰와 경험</span>
              </div>
              
              <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  신뢰할 수 있는 파트너
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                린코리아는 건설재료사업부와 2024년 신설된 건설기계사업부를 통해
                종합적인 건설 솔루션을 제공합니다.
              </p>
              
              <div className="space-y-6 mb-10">
                <div className="group flex items-center bg-gradient-to-r from-blue-50 to-transparent rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-blue-100">
                  <span className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl mr-6 font-bold text-lg group-hover:scale-110 transition-transform shadow-lg">1</span>
                  <span className="text-gray-700 text-lg">인천광역시 서구 백범로 707 (주안국가산업단지)</span>
                </div>
                <div className="group flex items-center bg-gradient-to-r from-green-50 to-transparent rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-green-100">
                  <span className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl mr-6 font-bold text-lg group-hover:scale-110 transition-transform shadow-lg">2</span>
                  <span className="text-gray-700 text-lg">사업자등록번호: 747-42-00526</span>
                </div>
                <div className="group flex items-center bg-gradient-to-r from-amber-50 to-transparent rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-amber-100">
                  <span className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl mr-6 font-bold text-lg group-hover:scale-110 transition-transform shadow-lg">3</span>
                  <span className="text-gray-700 text-lg">건설재료사업부 / 건설기계사업부</span>
                </div>
              </div>
              
              <Link
                to="/about"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-5 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
              >
                <span>회사소개 자세히 보기</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="order-1 lg:order-2 flex justify-center items-center">
              <div className="relative group">
                {/* Decorative background */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                
                <div className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white group-hover:scale-105 transition-all duration-500">
                  <OptimizedImage
                    src="/images/1-메인-18.jpg"
                    alt="린코리아 제품"
                    className="w-full h-full object-cover"
                    loadingClassName="bg-gradient-to-br from-blue-50 to-green-50"
                    errorClassName="bg-gradient-to-br from-blue-50 to-green-50"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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

export default Index;
