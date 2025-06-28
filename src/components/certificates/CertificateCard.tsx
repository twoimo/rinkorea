import React from 'react';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';
import { Language, getLocalizedValue } from '@/contexts/LanguageContext';

interface Certificate {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  issue_date?: string;
  expiry_date?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // 다국어 필드
  name_ko?: string;
  name_en?: string;
  name_zh?: string;
  name_id?: string;
  description_ko?: string;
  description_en?: string;
  description_zh?: string;
  description_id?: string;
}

interface CertificateCardProps {
  certificate: Certificate;
  isHidden: boolean;
  isAdmin: boolean;
  onImageClick: (certificate: Certificate) => void;
  onEdit: (certificate: Certificate) => void;
  onDelete: (certificate: Certificate) => void;
  onToggleHide: (certificate: Certificate) => void;
  isLoading?: boolean;
  size?: 'normal' | 'small';
  language: Language;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  isHidden,
  isAdmin,
  onImageClick,
  onEdit,
  onDelete,
  onToggleHide,
  isLoading = false,
  size = 'normal',
  language
}) => {
  const isMobile = useIsMobile();

  const isSmall = size === 'small';
  const cardPadding = isSmall ? 'p-3 sm:p-4' : 'p-4 sm:p-6';
  const buttonSize = isSmall ? 'p-2' : 'p-3 sm:p-2';
  const iconSize = isSmall ? 'w-3 h-3 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5';
  const titleSize = isSmall ? 'text-sm sm:text-base' : 'text-base sm:text-lg';

  // 다국어 지원된 이름과 설명 가져오기
  const getLocalizedCertificateName = (cert: Certificate): string => {
    switch (language) {
      case 'en':
        return cert.name_en || cert.name;
      case 'zh':
        return cert.name_zh || cert.name;
      default:
        return cert.name_ko || cert.name;
    }
  };

  const getLocalizedCertificateDescription = (cert: Certificate): string => {
    switch (language) {
      case 'en':
        return cert.description_en || cert.description;
      case 'zh':
        return cert.description_zh || cert.description;
      default:
        return cert.description_ko || cert.description;
    }
  };

  const localizedName = getLocalizedCertificateName(certificate);
  const localizedDescription = getLocalizedCertificateDescription(certificate);

  return (
    <div className={`bg-white ${cardPadding} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${isHidden && isAdmin ? 'opacity-50' : ''} border border-gray-100`}>
      <div className="relative">
        <div
          className="cursor-pointer"
          onClick={() => onImageClick(certificate)}
        >
          <img
            src={certificate.image_url}
            alt={localizedName}
            className="w-full aspect-[1/1.4142] object-contain rounded-lg mb-4 sm:mb-6 border hover:border-blue-300 transition-colors"
            loading="lazy"
          />
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-1 sm:gap-2">
            <button
              onClick={() => onToggleHide(certificate)}
              className={`${buttonSize} rounded-full transition-colors touch-manipulation ${isHidden
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              disabled={isLoading}
              title={isHidden ? '표시하기' : '숨기기'}
            >
              {isHidden ? <Eye className={iconSize} /> : <EyeOff className={iconSize} />}
            </button>
            <button
              onClick={() => onEdit(certificate)}
              className={`${buttonSize} bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors touch-manipulation`}
              disabled={isLoading}
              title="편집"
            >
              <Edit className={iconSize} />
            </button>
            <button
              onClick={() => onDelete(certificate)}
              className={`${buttonSize} bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors touch-manipulation`}
              disabled={isLoading}
              title="삭제"
            >
              <Trash2 className={iconSize} />
            </button>
          </div>
        )}
      </div>

      <div className="text-center space-y-2">
        <h3 className={`${titleSize} font-bold text-gray-900 line-clamp-2 leading-tight`}>{localizedName}</h3>
        {!isSmall && (
          <p className="text-sm sm:text-base text-gray-600 line-clamp-2 leading-relaxed">{localizedDescription}</p>
        )}
      </div>
    </div>
  );
};

export default CertificateCard;
