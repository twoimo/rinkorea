import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowRight, Shield, Leaf, Award } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useUserRole } from '../hooks/useUserRole';

const Index = () => {
  const { isAdmin } = useUserRole();
  const [youtubeLink, setYoutubeLink] = useState('https://www.youtube.com/embed/W6ACoEMN3-0?autoplay=1&mute=1&controls=0&loop=1&playlist=W6ACoEMN3-0&showinfo=0&rel=0&modestbranding=1');
  const [editLink, setEditLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

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

  // 유튜브 링크 불러오기
  const loadYoutubeLink = async () => {
    try {
      const { data, error } = await (supabase as any)
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
    // 이미 embed 주소면 그대로 반환
    if (url.includes('/embed/')) return url;
    // watch?v= 형태
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([\w-]+)/);
    if (watchMatch) {
      const id = watchMatch[1];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&showinfo=0&rel=0&modestbranding=1`;
    }
    // youtu.be 형태
    const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
    if (shortMatch) {
      const id = shortMatch[1];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&showinfo=0&rel=0&modestbranding=1`;
    }
    // 기타: 그대로 반환
    return url;
  };

  // 유튜브 링크 저장
  const handleSaveYoutubeLink = async () => {
    setLoading(true);
    setResult('');
    try {
      const embedUrl = toEmbedUrl(editLink);
      const { error } = await (supabase as any)
        .from('site_settings')
        .upsert({ key: 'youtube_link', value: embedUrl, updated_at: new Date().toISOString() });
      if (error) {
        setResult('오류: ' + error.message);
      } else {
        setYoutubeLink(embedUrl);
        setResult('유튜브 링크가 저장되었습니다.');
      }
    } catch (e) {
      setResult('오류: ' + (e.message || e));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative">
        <div className="relative w-full h-screen overflow-hidden">
          {/* YouTube Video Background */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <iframe
              className="absolute top-1/2 left-1/2"
              style={{
                width: '100vw',
                height: '56.25vw', // 16:9 비율
                minHeight: '100vh',
                minWidth: '177.78vh', // 16/9 * 100vh
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

          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container mx-auto px-4">
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

          {/* 관리자만 유튜브 링크 수정 UI 노출 */}
          {isAdmin && (
            <div className="absolute top-4 right-4 z-20 bg-white bg-opacity-90 p-4 rounded shadow flex flex-col gap-2 max-w-md">
              <label className="font-semibold text-sm mb-1">유튜브 링크 수정 (embed 주소)</label>
              <input
                type="text"
                className="border px-2 py-1 rounded w-full"
                value={editLink}
                onChange={e => setEditLink(e.target.value)}
                placeholder="유튜브 embed 링크 입력"
              />
              <button
                onClick={handleSaveYoutubeLink}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 mt-1"
              >
                {loading ? '저장 중...' : '저장'}
              </button>
              {result && <div className="text-xs text-green-700 mt-1">{result}</div>}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              린코리아만의 특별함
            </h2>
            <p className="text-xl text-gray-600 max-w-1xl mx-auto">
              최고 품질의 세라믹 코팅제로 안전하고 친환경적인 건설환경을 만들어갑니다
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 group-hover:scale-110 transition-transform shadow-lg">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                신뢰할 수 있는 파트너
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                린코리아는 건설재료사업부와 2024년 신설된 건설기계사업부를 통해
                종합적인 건설 솔루션을 제공합니다.
              </p>
              <div className="space-y-5 mb-8">
                <div className="flex items-center bg-blue-50 rounded-lg p-4 shadow-sm">
                  <span className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full mr-4 font-bold">1</span>
                  <span className="text-gray-700">인천광역시 서구 백범로 707 (주안국가산업단지)</span>
                </div>
                <div className="flex items-center bg-blue-50 rounded-lg p-4 shadow-sm">
                  <span className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full mr-4 font-bold">2</span>
                  <span className="text-gray-700">사업자등록번호: 747-42-00526</span>
                </div>
                <div className="flex items-center bg-blue-50 rounded-lg p-4 shadow-sm">
                  <span className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full mr-4 font-bold">3</span>
                  <span className="text-gray-700">건설재료사업부 / 건설기계사업부</span>
                </div>
              </div>
              <Link
                to="/about"
                className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                회사소개 자세히 보기
              </Link>
            </div>
            <div className="flex justify-center items-center">
              <div className="relative w-full max-w-lg aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-100">
                <img
                  src="/images/1-메인-18.jpg"
                  alt="린코리아 제품"
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent"></div>
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
