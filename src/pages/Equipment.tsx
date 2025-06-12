import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Shield, Wrench, Settings, Zap } from 'lucide-react';

const Equipment = () => {
    const equipment = [
        {
            name: "코팅 전용 스프레이건",
            image: '/images/main-18.jpg',
            icon: <Wrench className="w-8 h-8 text-blue-600" />,
            description: "RIN-COAT 시공을 위한 전용 스프레이건으로, 균일한 도막 두께와 최적의 시공 품질을 보장합니다.",
            features: ["균일한 도포", "정밀 제어", "내구성 설계", "편리한 유지보수"]
        },
        {
            name: "자동 코팅 시스템",
            image: '/images/main-8.jpg',
            icon: <Settings className="w-8 h-8 text-green-600" />,
            description: "대규모 시공을 위한 자동화 코팅 시스템입니다. 효율적이고 일관된 품질의 시공이 가능합니다.",
            features: ["자동화 시공", "높은 생산성", "품질 안정성", "대면적 시공"]
        },
        {
            name: "표면 처리 장비",
            image: '/images/main-11.jpg',
            icon: <Shield className="w-8 h-8 text-yellow-600" />,
            description: "코팅 전 표면 처리를 위한 전문 장비로, 최적의 부착력을 위한 표면 상태를 만들어냅니다.",
            features: ["효과적 표면처리", "다양한 소재 대응", "먼지 제어", "고성능"]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-6">기계소개</h1>
                        <p className="text-xl max-w-2xl mx-auto">
                            린코리아의 전문 시공 장비를 소개합니다. <br />
                            최고의 품질을 위한 최적의 장비들을 확인하세요.
                        </p>
                    </div>
                </div>
            </section>

            {/* Equipment Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {equipment.map((item, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform hover:scale-105"
                                    />
                                    <div className="absolute top-4 right-4 bg-white p-2 rounded-full">
                                        {item.icon}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.name}</h3>
                                    <p className="text-gray-600 mb-4">{item.description}</p>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-gray-900">주요 특징:</h4>
                                        <ul className="space-y-1">
                                            {item.features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-center text-gray-600">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Equipment Benefits */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">전문 시공 장비의 장점</h2>
                        <p className="text-xl text-gray-600">
                            최고의 시공 품질을 위한 전문 장비 시스템
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Shield className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">품질 안정성</h3>
                            <p className="text-gray-600">일관된 고품질 시공</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Zap className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">작업 효율성</h3>
                            <p className="text-gray-600">빠르고 정확한 시공</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Wrench className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">전문성</h3>
                            <p className="text-gray-600">전문 시공을 위한 맞춤 설계</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Settings className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">유지보수</h3>
                            <p className="text-gray-600">간편한 관리와 유지보수</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Equipment; 