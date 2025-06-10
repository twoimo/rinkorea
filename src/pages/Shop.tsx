import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShoppingCart, Star } from 'lucide-react';

const Shop = () => {
  const [sortBy, setSortBy] = useState('인기도순');

  const sortOptions = [
    '인기도순',
    '최신등록순',
    '낮은 가격순',
    '높은 가격순',
    '할인율순',
    '누적 판매순',
    '리뷰 많은순',
    '평점 높은순'
  ];

  const products = [
    {
      id: 1,
      name: '린코리아 고성능 침투 방수제 4L',
      description: '수성 침투 다목적 콘크리트 외벽 옥상 주차장 베란다벽돌',
      image: 'https://shop-phinf.pstatic.net/20241003_154/1727883787081VUAdB_JPEG/62016644201209643_1050551808.jpg?type=f296_296',
      price: 29900,
      originalPrice: null,
      discount: null,
      rating: 5.0,
      reviews: 2,
      naverUrl: 'https://smartstore.naver.com/rinkorea_shop/products/10928441026'
    },
    {
      id: 2,
      name: '린코리아 불연 세라믹 코팅제(1액형) 린코트 18KG',
      description: 'RIN COAT 바닥재 마감재 - 수많은 현장에 납품되어 성공적으로 시공되었고, 높은 고객 만족도를 이끌어낸 제품입니다.',
      image: 'https://shop-phinf.pstatic.net/20240927_124/1727411989211Iyd8t_JPEG/48036918245330549_1641587464.jpg?type=f296_296',
      price: 269000,
      originalPrice: 360020,
      discount: 25,
      rating: 4.0,
      reviews: 9,
      naverUrl: 'https://smartstore.naver.com/rinkorea_shop/products/8968404085'
    },
    {
      id: 3,
      name: '린코리아 불연 세라믹 코팅제(1액형) 린코트 2KG/4KG',
      description: 'RIN COAT 바닥재 마감재 - 소용량으로 테스트나 소규모 시공에 적합합니다.',
      image: 'https://shop-phinf.pstatic.net/20231018_149/1697614547809bk7av_PNG/22122972946497214_1486505831.png?type=f296_296',
      price: 29800,
      originalPrice: 298000,
      discount: 90,
      rating: 5.0,
      reviews: 9,
      naverUrl: 'https://smartstore.naver.com/rinkorea_shop/products/8968396177'
    },
    {
      id: 4,
      name: '린코리아 콘크리트 표면강화제 린하드 플러스 20KG',
      description: '액상하드너 바닥재 - 콘크리트 표면을 강화하고 내구성을 향상시킵니다.',
      image: 'https://shop-phinf.pstatic.net/20240911_36/1726044120062jPMju_PNG/5992884664615404_917135693.png?type=f296_296',
      price: 39900,
      originalPrice: 49900,
      discount: 20,
      rating: 4.33,
      reviews: 6,
      naverUrl: 'https://smartstore.naver.com/rinkorea_shop/products/7828589330'
    },
    {
      id: 5,
      name: '린코리아 고성능 침투 방수제 18L',
      description: '수성 침투 다목적 콘크리트 외벽 옥상 주차장 베란다벽돌 대용량',
      image: 'https://shop-phinf.pstatic.net/20250322_86/1742650443842lx4GL_PNG/78925438789627733_212981079.png?type=f296_296',
      price: 120000,
      originalPrice: null,
      discount: null,
      rating: 5.0,
      reviews: 1,
      naverUrl: 'https://smartstore.naver.com/rinkorea_shop/products/11624614214'
    },
    {
      id: 6,
      name: '린코리아 콘크리트 실러 표면코팅제 린씰플러스 20KG',
      description: '표면보호 광택부여 바닥재 바닥마감재',
      image: 'https://shop-phinf.pstatic.net/20250214_78/1739507088533HgOuS_JPEG/15471762679596392_1050551584.jpg?type=f296_296',
      price: 159000,
      originalPrice: 180000,
      discount: 11,
      rating: 4.5,
      reviews: 3,
      naverUrl: 'https://smartstore.naver.com/rinkorea_shop/products/9462441672'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleProductClick = (naverUrl: string) => {
    window.open(naverUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">온라인 스토어</h1>
            <p className="text-xl max-w-2xl mx-auto">
              린코리아의 우수한 품질의 제품을 <br />
              온라인에서 편리하게 구매하세요.
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">전체상품</h2>

            {/* Sort Options */}
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${sortBy === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative cursor-pointer" onClick={() => handleProductClick(product.naverUrl)}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 md:h-64 object-cover hover:scale-105 transition-transform"
                  />
                  {product.discount && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {product.discount}% 할인
                    </div>
                  )}
                </div>

                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mb-3">
                    {product.originalPrice && (
                      <del className="text-xs md:text-sm text-gray-400 block">
                        {formatPrice(product.originalPrice)}원
                      </del>
                    )}
                    <div className="flex items-center">
                      <span className="text-lg md:text-xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-gray-600 ml-1">원</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="flex items-center text-xs md:text-sm text-gray-600">
                      <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{product.rating}</span>
                      <span className="mx-1">·</span>
                      <span>리뷰 {product.reviews}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleProductClick(product.naverUrl)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center text-sm md:text-base"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    구매하기
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Note about external links */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              ※ 제품 구매는 네이버 스마트스토어에서 진행됩니다.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
