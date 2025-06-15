
import React from 'react';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';

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
}

interface CertificateCardProps {
  certificate: Certificate;
  isHidden: boolean;
  isAdmin: boolean;
  onImageClick: (src: string, alt: string, title: string) => void;
  onEdit: (certificate: Certificate) => void;
  onDelete: (certificate: Certificate) => void;
  onToggleHide: (certificate: Certificate) => void;
  isLoading?: boolean;
  size?: 'normal' | 'small';
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
  size = 'normal'
}) => {
  const isMobile = useIsMobile();
  
  const isSmall = size === 'small';
  const cardPadding = isSmall ? 'p-3 sm:p-4' : 'p-4 sm:p-6';
  const buttonSize = isSmall ? 'p-2' : 'p-3 sm:p-2';
  const iconSize = isSmall ? 'w-3 h-3 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5';
  const titleSize = isSmall ? 'text-sm sm:text-base' : 'text-base sm:text-lg';

  return (
    <div className={`bg-white ${cardPadding} rounded-lg shadow-lg hover:shadow-xl transition-shadow ${isHidden && isAdmin ? 'opacity-50' : ''}`}>
      <div className="relative">
        <div
          className="cursor-pointer"
          onClick={() => onImageClick(certificate.image_url, certificate.name, certificate.name)}
        >
          <img
            src={certificate.image_url}
            alt={certificate.name}
            className="w-full aspect-[1/1.4142] object-contain rounded-lg mb-3 sm:mb-4 border hover:border-blue-300 transition-colors"
            loading="lazy"
          />
        </div>
        {isAdmin && (
          <div className={`absolute top-2 right-2 flex gap-1 sm:gap-2 z-10 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <button
              onClick={() => onToggleHide(certificate)}
              className={`bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full ${buttonSize} shadow touch-manipulation ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isHidden ? "노출 해제" : "숨기기"}
              disabled={isLoading}
              aria-label={isHidden ? "노출 해제" : "숨기기"}
            >
              {isHidden ? (
                <Eye className={iconSize} />
              ) : (
                <EyeOff className={iconSize} />
              )}
            </button>
            <button
              onClick={() => onEdit(certificate)}
              className={`bg-white ${buttonSize} rounded-full hover:bg-gray-100 transition-colors touch-manipulation`}
            >
              <Edit className={`${iconSize} text-blue-600`} />
            </button>
            <button
              onClick={() => onDelete(certificate)}
              className={`bg-white ${buttonSize} rounded-full hover:bg-gray-100 transition-colors touch-manipulation`}
            >
              <Trash2 className={`${iconSize} text-red-600`} />
            </button>
          </div>
        )}
      </div>
      <h3 className={`${titleSize} font-bold text-gray-900 text-center mb-1`}>{certificate.name}</h3>
      <p className="text-xs text-gray-500 text-center">클릭하여 확대보기</p>
    </div>
  );
};

export default CertificateCard;
