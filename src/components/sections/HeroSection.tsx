import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SupabaseClient } from '@supabase/supabase-js';

const HeroSection = () => {
  const { isAdmin } = useUserRole();
  const { t } = useLanguage();
  const [youtubeLink, setYoutubeLink] = useState('https://www.youtube.com/embed/W6ACoEMN3-0?autoplay=1&mute=1&controls=0&loop=1&playlist=W6ACoEMN3-0&showinfo=0&rel=0&modestbranding=1');
  const [editLink, setEditLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [isChina, setIsChina] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  // Check if user is accessing from China
  const checkUserLocation = async () => {
    try {
      setLocationLoading(true);
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      setIsChina(data.country_code === 'CN');
    } catch (error) {
      console.log('Failed to detect location, defaulting to YouTube video');
      setIsChina(false);
    } finally {
      setLocationLoading(false);
    }
  };

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
    checkUserLocation();
    loadYoutubeLink();
  }, []);

  const toEmbedUrl = (url: string) => {
    if (url.includes('/embed/')) return url;
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([\w-]+)/);
    if (watchMatch) {
      const id = watchMatch[1];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&showinfo=0&rel=0&modestbranding=1&vq=hd1080`;
    }
    const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
    if (shortMatch) {
      const id = shortMatch[1];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&showinfo=0&rel=0&modestbranding=1&vq=hd1080`;
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
        setResult('success:' + t('hero_save_success'));
      }
    } catch (e) {
      setResult('error:' + ((e as Error).message || e));
    }
    setLoading(false);
  };

  return (
    <section className="relative min-h-screen overflow-hidden -mt-16 sm:-mt-20">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        {locationLoading ? (
          // Loading state
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : isChina ? (
          // Local video for China
          <video
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover"
            style={{
              transform: 'translate(-50%, -50%)',
            }}
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/videos/intro_video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          // YouTube video for other regions
          <iframe
            className="absolute top-1/2 left-1/2"
            style={{
              width: '100vw',
              height: '56.25vw',
              minHeight: '100vh',
              minWidth: '177.78vh',
              transform: 'translate(-50%, -50%) scale(1.27)',
              objectFit: 'cover',
              pointerEvents: 'none'
            }}
            src={youtubeLink}
            title="RIN-COAT Introduction"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        )}
      </div>

      {/* Enhanced Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-blue-900/60"></div>

      {/* Content Container */}
      <div className="relative z-10 h-screen flex items-center pt-16 sm:pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Patent & Trademark Info */}
            <div className="mb-8">
              <div className="flex flex-nowrap gap-2 sm:gap-4">
                <div className="bg-yellow-400 text-black px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wider shadow-lg text-left whitespace-nowrap">
                  {t('hero_patent')}
                </div>
                <div className="bg-yellow-400 text-black px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wider shadow-lg text-left whitespace-nowrap">
                  {t('hero_trademark')}
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 leading-tight">
              <span className="text-white drop-shadow-2xl block sm:whitespace-nowrap">
                {t('hero_title_line1')}
              </span>
              <div className="h-2 sm:h-4"></div>
              <span className="text-blue-400 drop-shadow-2xl block sm:whitespace-nowrap">
                {t('hero_title_line2')}
              </span>
            </h1>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
              <Link
                to="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 sm:px-8 rounded-lg font-semibold transition-colors flex items-center justify-center shadow-lg touch-manipulation text-base sm:text-lg"
              >
                {t('hero_inquiry_btn')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 sm:px-8 rounded-lg font-semibold transition-colors flex items-center justify-center shadow-lg touch-manipulation text-base sm:text-lg"
              >
                {t('hero_purchase_btn')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/projects"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-6 py-4 sm:px-8 rounded-lg font-semibold transition-colors flex items-center justify-center shadow-lg touch-manipulation text-base sm:text-lg"
              >
                {t('hero_projects_btn')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div >

      {/* Admin Controls */}
      {
        isAdmin && (
          <div className="absolute top-24 right-4 z-20 bg-white/95 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-xl max-w-xs sm:max-w-md border">
            <div className="mb-3 font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" style={{ display: loading ? 'inline' : 'none' }} />
              {t('hero_admin_youtube_edit')}
            </div>
            <input
              type="text"
              className="border border-gray-300 px-3 py-2 rounded-lg w-full text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 mb-2"
              value={editLink}
              onChange={e => setEditLink(e.target.value)}
              placeholder={t('hero_youtube_placeholder')}
              disabled={loading}
            />
            <div className="text-xs text-gray-600 mb-3 font-mono break-all">
              {t('hero_embed_preview')} <span>{embedPreview}</span>
            </div>
            <button
              onClick={handleSaveYoutubeLink}
              disabled={loading || !editLink}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors font-semibold text-sm touch-manipulation"
            >
              {loading ? (<span className="flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> {t('hero_saving')}</span>) : t('hero_save_btn')}
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
