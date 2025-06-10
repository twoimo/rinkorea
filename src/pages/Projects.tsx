
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ExternalLink, Calendar, MapPin } from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      title: "용인 테크노밸리",
      location: "용인시",
      date: "2024",
      image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742",
      description: "용인 테크노밸리 프로젝트에 RIN-COAT 제품을 적용하여 우수한 불연 성능을 구현했습니다.",
      url: "https://rinkorea.com/portfolio-item/용인-테크노밸리/",
      features: ["RIN-COAT 적용", "대규모 시공", "불연재 인증"]
    },
    {
      title: "화성시 정남산업단지",
      location: "화성시",
      date: "2024",
      image: "https://images.unsplash.com/photo-1496307653780-42ee777d4833",
      description: "화성시 정남산업단지의 산업시설에 세라믹 코팅을 적용한 대표적인 시공사례입니다.",
      url: "https://rinkorea.com/portfolio-item/화성시-정남산업단지-2/",
      features: ["산업시설 적용", "내구성 향상", "품질 보증"]
    },
    {
      title: "강화 동물병원 마포 서교동",
      location: "서울시 마포구",
      date: "2023",
      image: "https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace",
      description: "상업시설과 의료시설에 적용된 다목적 시공사례로 RIN-COAT COLOR를 활용했습니다.",
      url: "https://rinkorea.com/portfolio-item/강화-동물병원-마포-서교동-의류매장/",
      features: ["상업시설 적용", "RIN-COAT COLOR", "미적 효과"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">시공사례</h1>
            <p className="text-xl max-w-2xl mx-auto">
              린코리아의 세라믹 코팅제가 적용된 다양한 프로젝트를 통해 <br />
              우수한 품질과 성능을 확인하세요.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5 text-gray-700" />
                    </a>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{project.title}</h3>

                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{project.location}</span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">{project.date}</span>
                  </div>

                  <p className="text-gray-600 mb-4">{project.description}</p>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">적용 특징:</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.features.map((feature, featureIndex) => (
                        <span
                          key={featureIndex}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">시공 실적</h2>
            <p className="text-xl text-gray-600">
              다양한 분야에서 인정받는 린코리아의 기술력
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">완료된 프로젝트</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600">고객 만족도</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">3</div>
              <div className="text-gray-600">주요 제품군</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
