import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShoppingCart, Star, Info, ChevronDown } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  naverUrl: string;
  isNew?: boolean;
  stock?: number;
  sales?: number;
  createdAt?: string;
}

const Shop = () => {
  const [sortBy, setSortBy] = useState<string>('popularity');

  const sortOptions = [
    { value: 'popularity', label: '인기도순' },
    { value: 'newest', label: '최신등록순' },
    { value: 'priceAsc', label: '낮은 가격순' },
    { value: 'priceDesc', label: '높은 가격순' },
    { value: 'discount', label: '할인율순' },
    { value: 'sales', label: '누적 판매순' },
    { value: 'reviews', label: '리뷰 많은순' },
    { value: 'rating', label: '평점 높은순' },
  ];

  const handleSort = (value: string) => {
    setSortBy(value);
  };

  const getSortedProducts = () => {
    const sortedProducts = [...products];

    switch (sortBy) {
      case 'newest':
        return sortedProducts.sort((a, b) =>
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
      case 'priceAsc':
        return sortedProducts.sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return sortedProducts.sort((a, b) => b.price - a.price);
      case 'discount':
        return sortedProducts.sort((a, b) =>
          (b.discount || 0) - (a.discount || 0)
        );
      case 'sales':
        return sortedProducts.sort((a, b) =>
          (b.sales || 0) - (a.sales || 0)
        );
      case 'reviews':
        return sortedProducts.sort((a, b) => b.reviews - a.reviews);
      case 'rating':
        return sortedProducts.sort((a, b) => b.rating - a.rating);
      case 'popularity':
      default:
        // 인기도는 판매량, 리뷰 수, 평점을 종합적으로 고려
        return sortedProducts.sort((a, b) => {
          const scoreA = (a.sales || 0) * 0.4 + a.reviews * 0.3 + a.rating * 0.3;
          const scoreB = (b.sales || 0) * 0.4 + b.reviews * 0.3 + b.rating * 0.3;
          return scoreB - scoreA;
        });
    }
  };

  const products = [
    {
      id: 1,
      name: '린코리아 불연 세라믹 코팅제(1액형) 린코트 18KG',
      description: 'RIN COAT 바닥재 마감재 - 수많은 현장에 납품되어 성공적으로 시공되었고, 높은 고객 만족도를 이끌어낸 제품입니다.',
      image: 'https://shop-phinf.pstatic.net/20240927_124/1727411989211Iyd8t_JPEG/48036918245330549_1641587464.jpg?type=f296_296',
      price: 269000,
      originalPrice: 360020,
      discount: 25,
      rating: 4.0,
      reviews: 9,
      naverUrl: 'https://smartstore.naver.com/rinkorea_shop/products/8968404085',
      sales: 150,
      createdAt: '2023-10-18',
      isNew: false,
      stock: 50
    },
    {
      id: 2,
      name: '린코리아 콘크리트 실러 표면코팅제 린씰플러스 20KG',
      description: '표면보호 광택부여 바닥재 바닥마감재',
      image: 'https://shop-phinf.pstatic.net/20250214_78/1739507088533HgOuS_JPEG/15471762679596392_1050551584.jpg?type=f296_296',
      price: 159000,
      originalPrice: 180000,
      discount: 11,
      rating: 4.5,
      reviews: 3,
      naverUrl: 'https://smartstore.naver.com/rinkorea_shop/products/9462441672',
      sales: 80,
      createdAt: '2024-02-14',
      isNew: true,
      stock: 30
    },
    {
      id: 3,
      name: '린코리아 콘크리트 표면강화제 린하드 플러스 20KG',
      description: '액상하드너 바닥재 - 콘크리트 표면을 강화하고 내구성을 향상시킵니다.',
      image: 'https://shop-phinf.pstatic.net/20240911_36/1726044120062jPMju_PNG/5992884664615404_917135693.png?type=f296_296',
      price: 39900,
      originalPrice: 49900,
      discount: 20,
      rating: 4.33,
      reviews: 6,
      naverUrl: 'https://smartstore.naver.com/rinkorea_shop/products/7828589330',
      sales: 120,
      createdAt: '2024-01-15',
      isNew: false,
      stock: 25
    },
    {
      id: 4,
      name: '린코리아 고성능 침투 방수제 18L',
      description: '수성 침투 다목적 콘크리트 외벽 옥상 주차장 베란다벽돌 대용량',
      image: 'https://shop-phinf.pstatic.net/20250322_86/1742650443842lx4GL_PNG/78925438789627733_212981079.png?type=f296_296',
      price: 120000,
      originalPrice: null,
      discount: null,
      rating: 5.0,
      reviews: 1,
      naverUrl: 'https://smartstore.naver.com/rinkorea_shop/products/11624614214',
      sales: 200,
      createdAt: '2024-02-01',
      isNew: true,
      stock: 40
    },
    {
      id: 5,
      name: '린코리아 고성능 침투 방수제 4L',
      description: '수성 침투 다목적 콘크리트 외벽 옥상 주차장 베란다벽돌',
      image: 'https://shop-phinf.pstatic.net/20241003_154/1727883787081VUAdB_JPEG/62016644201209643_1050551808.jpg?type=f296_296',
      price: 29900,
      originalPrice: null,
      discount: null,
      rating: 5.0,
      reviews: 2,
      naverUrl: 'https://smartstore.naver.com/rinkorea_shop/products/10928441026',
      sales: 90,
      createdAt: '2024-01-20',
      isNew: false,
      stock: 60
    },
    {
      id: 6,
      name: '린코리아 불연 세라믹 코팅제(1액형) 린코트 2KG/4KG',
      description: 'RIN COAT 바닥재 마감재 - 소용량으로 테스트나 소규모 시공에 적합합니다.',
      image: 'https://shop-phinf.pstatic.net/20231018_149/1697614547809bk7av_PNG/22122972946497214_1486505831.png?type=f296_296',
      price: 29800,
      originalPrice: 298000,
      discount: 90,
      rating: 5.0,
      reviews: 9,
      naverUrl: 'https://smartstore.naver.com/rinkorea_shop/products/8968396177',
      sales: 180,
      createdAt: '2023-12-15',
      isNew: false,
      stock: 45
    },
  ];

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleProductClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] bg-blue-600">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-90"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">온라인 스토어</h1>
            <p className="text-xl md:text-2xl">린코리아의 최고 품질 제품을 만나보세요</p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Sort Options */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSort(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${sortBy === option.value
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getSortedProducts().map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-[500px]"
              >
                <div className="relative aspect-square w-full overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.discount && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {product.discount}% OFF
                      </span>
                    </div>
                  )}
                  {product.isNew && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        NEW
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-900">{product.rating}</span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <span className="text-sm text-gray-600">{product.reviews} 리뷰</span>
                    </div>
                    {product.stock && (
                      <span className="text-sm font-medium text-green-600">
                        재고: {product.stock}개
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      {product.originalPrice && (
                        <del className="text-sm text-gray-400">
                          {formatPrice(product.originalPrice)}원
                        </del>
                      )}
                      <span className="text-xl font-bold text-blue-600">
                        {formatPrice(product.price)}원
                      </span>
                    </div>
                    <button
                      onClick={() => handleProductClick(product.naverUrl)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 hover:scale-105"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>구매하기</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Shop;
