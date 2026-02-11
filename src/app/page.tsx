"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
// ProductDetailContent imported but not used or commented out per request
// import { ProductDetailContent } from "@/components/product/ProductDetailContent";
import { TryOnModal } from "@/components/features/TryOnModal";
import { PaymentModal } from "@/components/features/PaymentModal"; // Added import
import { ProductCard } from "@/components/product/ProductCard";
import { Shirt } from "lucide-react";
import { PRODUCTS, Product } from "@/lib/products";

export default function Home() {
  const router = useRouter(); // Initialize router
  // State for the product displayed in the Top Detail View
  // Default to the first product
  const [featuredProduct, setFeaturedProduct] = useState<Product>(PRODUCTS[0]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // State for Try On Modal (can be triggered from featured view or grid)
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false); // Added isPaymentOpen state
  const [selectedTryOnProduct, setSelectedTryOnProduct] = useState<Product | null>(null);
  // State for the selected user image from "My Try-On Photos"
  // Rebuild Trigger: V2.1
  const [selectedUserImage, setSelectedUserImage] = useState<string | null>(null); // Added state for selected user image
  const [showCartToast, setShowCartToast] = useState(false);

  const { addToCart } = useCart();

  // When "Try On" is clicked on the Featured/Top section
  const handleFeaturedTryOn = (userImage?: string) => {
    // Construct a product object with the CURRENTLY SELECTED image from the gallery
    const productWithSelectedImage = {
      ...featuredProduct,
      image: featuredProduct.images[selectedImageIndex] || featuredProduct.image
    };
    setSelectedTryOnProduct(productWithSelectedImage);

    // Set selected user image if provided
    if (userImage) {
      setSelectedUserImage(userImage);
    } else {
      setSelectedUserImage(null);
    }

    setIsTryOnOpen(true);
  };

  const handleAddToCart = () => {
    if (featuredProduct) {
      addToCart(featuredProduct);
      setShowCartToast(true);
      setTimeout(() => setShowCartToast(false), 3000);
    }
  };

  // When "Try On" is clicked on a Grid Item
  const handleGridTryOn = (product: Product) => {
    console.log("🖱️ GRID TRY-ON CLICKED:", product.name);
    setSelectedTryOnProduct(product);
    setIsTryOnOpen(true);
  };

  // When a Grid Item is CLICKED (to update the top view)
  const handleProductSelect = (product: Product) => {
    console.log("🖱️ PRODUCT SELECT CLICKED:", product.name);
    setFeaturedProduct(product);
    setSelectedImageIndex(0); // Reset gallery index when changing product
  };

  const handleFeaturedClick = () => {
    router.push(`/product/${featuredProduct.id}`);
  };

  if (!featuredProduct) {
    return null;
  }

  return (
    <div className="pb-20 relative">
      {/* Toast Notification */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] transition-all duration-300 ${showCartToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
          <div className="bg-green-500 rounded-full p-1">
            <svg className="w-4 h-4 text-white" fill="none" strokeWidth="3" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"></path></svg>
          </div>
          <span className="font-medium">Added to Cart!</span>
        </div>
      </div>



      {/* --- TOP SECTION: FEATURED PRODUCT (Dynamic Detail View) --- */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 mb-20 relative">
          {/* Key property forces re-render of gallery animations when product changes */}
          <ProductGallery
            key={featuredProduct.id}
            images={featuredProduct.images}
            productId={featuredProduct.id}
            onMainImageClick={handleFeaturedClick}
            selectedIndex={selectedImageIndex}
            onSelectIndex={setSelectedImageIndex}
          />

          <div className="relative">
            <ProductInfo
              key={`info-${featuredProduct.id}`}
              name={featuredProduct.name}
              price={featuredProduct.price}
              description={featuredProduct.description}
              onTryOn={handleFeaturedTryOn}
              onBuyNow={() => setIsPaymentOpen(true)} // Added onBuyNow handler
              onAddToCart={handleAddToCart}
            />

            {/* Link to Full Detail Page */}
            <div className="mt-4">
              <a href={`/product/${featuredProduct.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-4">
                View Full Details &rarr;
              </a>
            </div>

            {/* Floating Try On CTA for Featured Product */}
            <button
              onClick={() => handleFeaturedTryOn()}
              className="fixed bottom-20 right-6 md:absolute md:bottom-auto md:top-0 md:right-0 p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-xl text-white hover:scale-105 transition-transform z-40 flex items-center gap-2 group animate-bounce-slow"
            >
              <Shirt size={24} />
              <span className="font-bold hidden group-hover:block transition-all">Try On Now</span>
            </button>
          </div>
        </div>

        {/* Empty Area where DetailContent used to be */}
        {/* <div className="border-t border-border pt-8 mb-16"></div> */}
      </div>

      {/* --- MIDDLE BANNER TEXT --- */}
      <div className="w-full bg-yellow-400 py-8 mb-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-center">
            {/* Pair 1 */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-3xl md:text-5xl font-black italic tracking-tighter text-white drop-shadow-sm">Try it On !</span>
              <span className="text-lg md:text-2xl font-bold text-black/80">입어보고</span>
            </div>
            {/* Pair 2 */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-3xl md:text-5xl font-black italic tracking-tighter text-white drop-shadow-sm">Try it On !</span>
              <span className="text-lg md:text-2xl font-bold text-black/80">신어보고</span>
            </div>
            {/* Pair 3 */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-3xl md:text-5xl font-black italic tracking-tighter text-white drop-shadow-sm">Try it On !</span>
              <span className="text-lg md:text-2xl font-bold text-black/80">써 보고</span>
            </div>
            {/* Pair 4 - Circle Design */}
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full flex flex-col items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-300 ring-4 ring-white/50 gap-3 md:gap-4">
                <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-yellow-500 drop-shadow-sm leading-none">Buy it !</span>
                <span className="text-sm md:text-lg font-bold text-black/80 leading-none">구입하자!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: PRODUCT GRID --- */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-indigo-600 text-sm font-bold tracking-widest uppercase mb-2 block">More Collection</span>
            <h2 className="text-3xl md:text-4xl font-serif text-slate-800">New Arrivals</h2>
          </div>
          <button className="text-sm font-medium border-b border-slate-800 pb-0.5 hover:text-indigo-600 hover:border-indigo-600 transition-colors">
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {PRODUCTS.slice(0, 30).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onTryOn={handleGridTryOn}
              onSelect={handleProductSelect}
            />
          ))}
        </div>
      </section>

      {/* Virtual Fitting Room Modal */}
      <TryOnModal
        isOpen={isTryOnOpen}
        onClose={() => setIsTryOnOpen(false)}
        product={selectedTryOnProduct}
        initialUserImage={selectedUserImage}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        productName={featuredProduct?.name || ""}
        productPrice={featuredProduct?.price || ""}
      />
    </div>
  );
}
