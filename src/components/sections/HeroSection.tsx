
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Play, TrendingUp, Award, Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useUserRole } from '../../hooks/useUserRole';
import type { SupabaseClient } from '@supabase/supabase-js';

export const HeroSection = () => {
  const { isAdmin } = useUserRole();
  const [youtubeLink, setYoutubeLink] = useState('https://www.youtube.com/embed/W6ACoEMN3-0?autoplay=1&mute=1&controls=0&loop=1&playlist=W6ACoEMN3-0&showinfo=0&rel=0&modestbranding=1');
  const [editLink, setEditLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

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
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Video Background with Enhanced Overlay */}
      <div className="absolute inset-0">
        <iframe
          className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-screen min-w-[177.78vh]"
          style={{
            transform: 'translate(-50%, -50%) scale(1.1)',
            objectFit: 'cover',
            pointerEvents: 'none'
          }}
          src={youtubeLink}
          title="RIN-COAT Introduction"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        
        {/* Multi-layered overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-blue-900/60 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Enhanced Badge */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/30 to-emerald-500/30 backdrop-blur-xl border border-white/20 rounded-full px-8 py-4 mb-8 shadow-2xl">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-white font-semibold text-lg">특허받은 혁신 기술</span>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </div>

            {/* Enhanced Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
              <span className="block bg-gradient-to-r from-white via-blue-200 to-emerald-300 bg-clip-text text-transparent drop-shadow-2xl">
                친환경 불연재
              </span>
              <span className="block bg-gradient-to-r from-emerald-300 via-blue-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
                신소재 세라믹 코팅제
              </span>
            </h1>
            
            {/* Enhanced Subtitle */}
            <div className="space-y-4 mb-12">
              <p className="text-xl md:text-2xl text-blue-100 font-medium">
                특허 제 10-2312833 호 / 상표 제 40-1678504 호
              </p>
              <p className="text-lg md:text-xl text-emerald-200 font-light max-w-2xl leading-relaxed">
                안전하고 지속가능한 건설환경의 새로운 기준을 제시하는 
                <span className="font-semibold text-white"> 1액형 혁신 솔루션</span>
              </p>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 mb-16">
              <Link
                to="/contact"
                className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-2 hover:scale-105"
              >
                <span className="relative z-10">제품 문의하기</span>
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              
              <Link
                to="/shop"
                className="group relative bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-2xl hover:shadow-emerald-500/25 transform hover:-translate-y-2 hover:scale-105"
              >
                <span className="relative z-10">제품 구매하기</span>
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              
              <Link
                to="/projects"
                className="group relative border-2 border-white/40 bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 hover:border-white/60 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-2xl transform hover:-translate-y-2"
              >
                <Play className="mr-3 w-6 h-6" />
                시공사례 보기
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="group text-center">
                  <div className="flex items-center justify-center mb-4 text-blue-300 group-hover:text-white transition-colors duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
                  <div className="text-sm md:text-base text-blue-200 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Controls - Enhanced */}
      {isAdmin && (
        <div className="absolute top-6 right-6 z-30 bg-black/40 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl border border-white/20 max-w-md">
          <div className="mb-3 font-bold text-white flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" style={{ display: loading ? 'inline' : 'none' }} />
            <Sparkles className="w-5 h-5 text-amber-400" />
            메인 영상 링크 수정
          </div>
          <input
            type="text"
            className="border border-white/30 px-4 py-3 rounded-xl w-full text-sm focus:ring-2 focus:ring-blue-400 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 mb-3"
            value={editLink}
            onChange={e => setEditLink(e.target.value)}
            placeholder="유튜브 영상 주소 입력"
            disabled={loading}
          />
          <div className="text-xs text-blue-200 mb-4 font-mono break-all opacity-75">
            변환된 주소: {embedPreview}
          </div>
          <button
            onClick={handleSaveYoutubeLink}
            disabled={loading || !editLink}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl disabled:opacity-50 transition-all duration-300 font-semibold transform hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> 저장 중...
              </span>
            ) : '저장'}
          </button>
          {result && (
            <div className={`flex items-center gap-2 text-xs mt-3 ${result.startsWith('success:') ? 'text-emerald-300' : 'text-red-300'}`}>
              {result.startsWith('success:') ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {result.replace(/^\w+:/, '')}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
