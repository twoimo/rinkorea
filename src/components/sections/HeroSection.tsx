
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import type { SupabaseClient } from '@supabase/supabase-js';

const HeroSection = () => {
  const { isAdmin } = useUserRole();
  const [youtubeLink, setYoutubeLink] = useState('https://www.youtube.com/embed/W6ACoEMN3-0?autoplay=1&mute=1&controls=0&loop=1&playlist=W6ACoEMN3-0&showinfo=0&rel=0&modestbranding=1');
  const [editLink, setEditLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

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

  // 실시간 변환된 embed 주소
  const embedPreview = toEmbedUrl(editLink);

  // 유튜브 링크 저장
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
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
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

      {/* Enhanced Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-sky-900/60 to-red-800/70"></div>

      {/* Content Container */}
      <div className="relative z-10 h-screen flex items-center">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Patent & Trademark Info */}
            <div className="mb-8 space-y-2">
              <div className="inline-block bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold tracking-wider shadow-lg">
                특허 제 10-2312833 호
              </div>
              <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold tracking-wider shadow-lg ml-4">
                상표 제 40-1678504 호
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
              <span className="text-white drop-shadow-2xl">
                친환경 불연재(1액형)
              </span>
              <br />
              <span className="text-sky-400 drop-shadow-2xl">
                신소재 세라믹 코팅제
              </span>
            </h1>

            {/* Product Name */}
            <div className="mb-8">
              <span className="text-2xl md:text-3xl font-bold text-red-600 bg-white px-6 py-3 rounded-lg shadow-xl">
                RIN-COAT
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/contact"
                className="group bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-2xl hover:shadow-red-500/25 hover:scale-105"
              >
                제품 문의하기
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/projects"
                className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-2xl hover:scale-105"
              >
                시공사례 보기
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-red-300/30">
                <div className="text-red-400 font-bold text-sm mb-1">국토교통부 인증</div>
                <div className="text-white text-xs">불연재 인증 완료</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-green-300/30">
                <div className="text-green-400 font-bold text-sm mb-1">친환경 소재</div>
                <div className="text-white text-xs">1액형 신소재</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-sky-300/30">
                <div className="text-sky-400 font-bold text-sm mb-1">검증된 품질</div>
                <div className="text-white text-xs">시험성적서 완비</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-xl max-w-md border border-blue-200">
          <div className="mb-3 font-bold text-blue-900 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" style={{ display: loading ? 'inline' : 'none' }} />
            메인 유튜브 영상 링크 수정
          </div>
          <input
            type="text"
            className="border border-blue-300 px-3 py-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-400 mb-2"
            value={editLink}
            onChange={e => setEditLink(e.target.value)}
            placeholder="유튜브 영상 주소 입력"
            disabled={loading}
          />
          <div className="text-xs text-gray-600 mb-3 font-mono break-all">
            변환된 embed 주소: <span>{embedPreview}</span>
          </div>
          <button
            onClick={handleSaveYoutubeLink}
            disabled={loading || !editLink}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors font-semibold"
          >
            {loading ? (<span className="flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> 저장 중...</span>) : '저장'}
          </button>
          {result && (
            <div className={`flex items-center gap-2 text-xs mt-2 ${result.startsWith('success:') ? 'text-green-700' : 'text-red-600'}`}>
              {result.startsWith('success:') ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {result.replace(/^\w+:/, '')}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
