import BrandSection from "./(home-sections)/brand-section/BrandSection";
import CategorySection from "./(home-sections)/categoty-section/CategorySection";
import FeedbackFormSection from "./(home-sections)/feedback-form-section/FeedbackFormSection";
import GoogleReviewSection from "./(home-sections)/google-review-section/GoogleReviewSection";
import HeroSection from "./(home-sections)/hero-section/HeroSection";
import TopSalesSection from "./(home-sections)/top-sales-section/TopSalesSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <TopSalesSection />
      <CategorySection />
      <BrandSection />
      <GoogleReviewSection />
      <FeedbackFormSection />
    </>
  );
}
