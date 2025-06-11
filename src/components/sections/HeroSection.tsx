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
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-blue-900/60"></div>

      {/* Content Container */}
      <div className="relative z-10 h-screen flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Patent & Trademark Info */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="bg-yellow-400 text-black px-3 py-2 rounded-full text-sm font-bold tracking-wider shadow-lg text-left w-fit">
                  특허 제10-2312833호
                </div>
                <div className="bg-yellow-400 text-black px-3 py-2 rounded-full text-sm font-bold tracking-wider shadow-lg text-left w-fit">
                  상표 제40-1678504호
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 sm:mb-8 leading-tight">
              <span className="text-white drop-shadow-2xl block">
                친환경 불연재(1액형)
              </span>
              <div className="h-2 sm:h-4"></div>
              <span className="text-blue-400 drop-shadow-2xl block">
                신소재 세라믹 코팅제
              </span>
            </h1>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
              <Link
                to="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 sm:px-8 rounded-lg font-semibold transition-colors flex items-center justify-center shadow-lg touch-manipulation text-base sm:text-lg"
              >
                제품 문의하기
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 sm:px-8 rounded-lg font-semibold transition-colors flex items-center justify-center shadow-lg touch-manipulation text-base sm:text-lg"
              >
                제품 구매하기
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/projects"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-6 py-4 sm:px-8 rounded-lg font-semibold transition-colors flex items-center justify-center shadow-lg touch-manipulation text-base sm:text-lg"
              >
                시공사례 보기
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div >

      {/* Admin Controls */}
      {
        isAdmin && (
          <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-xl max-w-xs sm:max-w-md border">
            <div className="mb-3 font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" style={{ display: loading ? 'inline' : 'none' }} />
              메인 유튜브 영상 링크 수정
            </div>
            <input
              type="text"
              className="border border-gray-300 px-3 py-2 rounded-lg w-full text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 mb-2"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors font-semibold text-sm touch-manipulation"
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
        )
      }
    </section >
  );
};

export default HeroSection;
