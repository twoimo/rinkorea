import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '@/contexts/LanguageContext';

// Leaflet 기본 아이콘 문제 수정
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  className?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { t, language } = useLanguage();

  // 구글 지도와 동일한 위치 (인천광역시 서구 백범로 707)
  const COMPANY_LOCATION = {
    lat: 37.4824189,
    lng: 126.6785593,
    name: language === 'ko' ? '린코리아 (RIN Korea)' :
      language === 'en' ? 'RIN Korea' :
        '林韩国'
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // 지도 초기화
    const map = L.map(mapRef.current, {
      center: [COMPANY_LOCATION.lat, COMPANY_LOCATION.lng],
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // OpenStreetMap 타일 레이어 추가 (중국에서도 접근 가능)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // 회사 위치 마커 추가
    const marker = L.marker([COMPANY_LOCATION.lat, COMPANY_LOCATION.lng])
      .addTo(map);

    // 마커 팝업 설정
    const popupContent = `
      <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">
          ${COMPANY_LOCATION.name}
        </h3>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; line-height: 1.4;">
          ${t('contact_address_value')}
        </p>
        <div style="margin-top: 12px;">
          <a 
            href="https://www.google.com/maps/place/%EC%9D%B8%EC%B2%9C%EA%B4%91%EC%97%AD%EC%8B%9C+%EC%84%9C%EA%B5%AC+%EB%B0%B1%EB%B2%94%EB%A1%9C+707/data=!3m1!4b1!4m6!3m5!1s0x357b7eb4921092dd:0xf125040b28bebf6b!8m2!3d37.4824189!4d126.6785593!16s%2Fg%2F11bz6y9zf9?entry=ttu"
            target="_blank"
            rel="noopener noreferrer"
            style="display: inline-block; background: #3b82f6; color: white; padding: 6px 12px; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 500;"
          >
            ${language === 'ko' ? '구글 지도에서 보기' :
        language === 'en' ? 'View on Google Maps' :
          '在谷歌地图中查看'}
          </a>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'custom-popup'
    });

    // 지도 로드 후 팝업 열기
    map.whenReady(() => {
      marker.openPopup();
    });

    mapInstanceRef.current = map;

    // 컴포넌트 언마운트 시 지도 제거
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [language, t]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg border border-gray-200 shadow-sm"
        style={{ minHeight: '400px' }}
      />

      {/* 지도 로딩 스타일 추가 */}
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .leaflet-popup-tip {
          background: white;
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 16px;
        }
        
        .leaflet-control-zoom {
          border: none;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .leaflet-control-zoom a {
          border-radius: 6px;
          border: none;
          background: white;
          color: #374151;
          font-weight: bold;
          font-size: 18px;
          line-height: 26px;
        }
        
        .leaflet-control-zoom a:hover {
          background: #f9fafb;
          color: #1f2937;
        }
      `}</style>
    </div>
  );
};

export default LocationMap; 