import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Settings, Wrench, Award, Star } from 'lucide-react';

const Equipment = () => {
    const premiumGrinders = [
        {
            name: "950GT",
            image: "/images/equipment-1.jpg",
            icon: <Settings className="w-8 h-8 text-blue-600" />,
            description: "최신형 콘크리트 연삭기의 최상위 모델로, 뛰어난 성능과 효율성을 제공합니다.",
            features: ["대형 작업장 적합", "고효율 연삭 성능", "첨단 제어 시스템", "우수한 내구성"]
        },
        {
            name: "850GT",
            image: "/images/equipment-2.jpg",
            icon: <Settings className="w-8 h-8 text-green-600" />,
            description: "중대형 작업장에 최적화된 최신형 콘크리트 연삭기입니다.",
            features: ["중대형 작업장 적합", "안정적인 성능", "사용자 친화적 설계", "효율적인 먼지 제어"]
        },
        {
            name: "Falcon",
            image: "/images/equipment-3.jpg",
            icon: <Settings className="w-8 h-8 text-yellow-600" />,
            description: "혁신적인 디자인과 성능을 갖춘 최신형 콘크리트 연삭기입니다.",
            features: ["혁신적 디자인", "고급 연마 기능", "정밀한 제어", "다목적 활용"]
        }
    ];

    const professionalGrinders = [
        {
            name: "PRO950",
            image: "/images/equipment-4.jpg",
            icon: <Wrench className="w-8 h-8 text-blue-600" />,
            description: "전문가용 고성능 콘크리트 연삭기로, 안정적인 작업을 보장합니다.",
            features: ["전문가용 설계", "높은 내구성", "편리한 유지보수", "강력한 연삭력"]
        },
        {
            name: "PRO850",
            image: "/images/equipment-5.jpg",
            icon: <Wrench className="w-8 h-8 text-green-600" />,
            description: "중형 작업장에 적합한 전문가용 콘크리트 연삭기입니다.",
            features: ["중형 작업장 최적화", "균일한 연삭 품질", "손쉬운 조작", "경제적인 유지비용"]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-6">건설기계소개</h1>
                        <p className="text-xl max-w-2xl mx-auto">
                            최첨단 콘크리트 연삭기와 연마기로 <br />
                            최고의 품질과 효율성을 제공합니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* Premium Grinders Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">최신형 콘크리트 연삭기</h2>
                        <p className="text-xl text-gray-600">
                            최첨단 기술이 적용된 프리미엄 연삭기 라인업
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {premiumGrinders.map((grinder, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={grinder.image}
                                        alt={grinder.name}
                                        className="w-full h-full object-cover transition-transform hover:scale-105"
                                    />
                                    <div className="absolute top-4 right-4 bg-white p-2 rounded-full">
                                        {grinder.icon}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{grinder.name}</h3>
                                    <p className="text-gray-600 mb-4">{grinder.description}</p>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-gray-900">주요 특징:</h4>
                                        <ul className="space-y-1">
                                            {grinder.features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-center text-gray-600">
                                                    <Star className="w-4 h-4 text-blue-600 mr-2" />
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

            {/* Professional Grinders Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">콘크리트 연삭기</h2>
                        <p className="text-xl text-gray-600">
                            전문가를 위한 고성능 연삭기 시리즈
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {professionalGrinders.map((grinder, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={grinder.image}
                                        alt={grinder.name}
                                        className="w-full h-full object-cover transition-transform hover:scale-105"
                                    />
                                    <div className="absolute top-4 right-4 bg-white p-2 rounded-full">
                                        {grinder.icon}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{grinder.name}</h3>
                                    <p className="text-gray-600 mb-4">{grinder.description}</p>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-gray-900">주요 특징:</h4>
                                        <ul className="space-y-1">
                                            {grinder.features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-center text-gray-600">
                                                    <Star className="w-4 h-4 text-blue-600 mr-2" />
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

            {/* Partnership Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="md:w-1/2">
                            <div className="flex items-center mb-4">
                                <Award className="w-8 h-8 text-blue-600 mr-3" />
                                <h2 className="text-3xl font-bold text-gray-900">Shanghai JS Floor Systems 공식 파트너</h2>
                            </div>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Shanghai JS Floor Systems의 공식 파트너사로서 한국 공식 판매업체 및 서비스센터를 운영하고 있습니다.
                                세계적인 공사 현장에서 사용되는 콘크리트 연삭기 및 연마기 시장의 선두주자입니다.
                            </p>
                        </div>
                        <div className="md:w-1/2">
                            <img
                                src="/images/js-floor-systems.png"
                                alt="Shanghai JS Floor Systems Partnership"
                                className="rounded-lg shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Equipment; 