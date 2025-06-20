import React from 'react';
import { Plus } from 'lucide-react';
import AdminOnly from '../AdminOnly';

interface ResourcesHeroProps {
    setShowForm: (show: boolean) => void;
}

const ResourcesHero: React.FC<ResourcesHeroProps> = ({ setShowForm }) => {
    return (
        <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 md:py-20">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">자료실</h1>
                    <p className="text-base md:text-xl max-w-2xl mx-auto px-4">
                        린코리아의 다양한 기술 자료와 문서를 다운로드하실 수 있습니다.
                    </p>
                    <AdminOnly>
                        <div className="mt-6 md:mt-8">
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center bg-white text-blue-900 px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm md:text-base"
                                aria-label="새 자료 등록"
                            >
                                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" aria-hidden="true" />
                                새 자료 등록
                            </button>
                        </div>
                    </AdminOnly>
                </div>
            </div>
        </section>
    );
};

export default ResourcesHero; 