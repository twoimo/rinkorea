
import React from 'react';
import CertificateCard from './CertificateCard';

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

interface CertificateSectionProps {
  title: string;
  description: string;
  certificates: Certificate[];
  hiddenCertificateIds: string[];
  isAdmin: boolean;
  onImageClick: (src: string, alt: string, title: string) => void;
  onEdit: (certificate: Certificate) => void;
  onDelete: (certificate: Certificate) => void;
  onToggleHide: (certificate: Certificate) => void;
  isLoading?: boolean;
  backgroundColor?: string;
  gridCols?: string;
  cardSize?: 'normal' | 'small';
}

const CertificateSection: React.FC<CertificateSectionProps> = ({
  title,
  description,
  certificates,
  hiddenCertificateIds,
  isAdmin,
  onImageClick,
  onEdit,
  onDelete,
  onToggleHide,
  isLoading = false,
  backgroundColor = '',
  gridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  cardSize = 'normal'
}) => {
  const sectionClass = backgroundColor ? `py-12 sm:py-20 ${backgroundColor}` : 'py-12 sm:py-20';

  return (
    <section className={sectionClass}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg sm:text-xl text-gray-600">{description}</p>
        </div>

        <div className={`grid ${gridCols} gap-4 sm:gap-6`}>
          {certificates
            .filter(cert => !hiddenCertificateIds.includes(cert.id) || isAdmin)
            .map((cert, index) => (
              <CertificateCard
                key={index}
                certificate={cert}
                isHidden={hiddenCertificateIds.includes(cert.id)}
                isAdmin={isAdmin}
                onImageClick={onImageClick}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleHide={onToggleHide}
                isLoading={isLoading}
                size={cardSize}
              />
            ))}
        </div>
      </div>
    </section>
  );
};

export default CertificateSection;
