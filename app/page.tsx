import CheckoutProvider from "./components/CheckoutProvider";
import CodCheckout from "./components/CodCheckout";
import Footer from "./components/Footer";
import HeroSlider from "./components/HeroSlider";
import Ingredients from "./components/Ingredients";
import Origins from "./components/Origins";
import ProductCards from "./components/ProductCards";
import SocialProof from "./components/SocialProof";
import StickyCta from "./components/StickyCta";
import TopBar from "./components/TopBar";
import VoiceReviews from "./components/VoiceReviews";

export default function Home() {
  return (
    <>
      <TopBar />
      <HeroSlider />
      <SocialProof />
      {/* StickyCta is fixed, so it goes last and never sits between two sections in the flow. */}
      <CheckoutProvider>
        <ProductCards />
        <CodCheckout />
        {/* Sits directly under the checkout form — nothing between the two. */}
        <Ingredients />
        {/* Reads as the follow-on: the note above names the ingredients, this shows them. */}
        <Origins />
        <VoiceReviews />
        <StickyCta />
      </CheckoutProvider>
      <Footer />
      {/* Clears the fixed mobile purchase bar so nothing sits underneath it. */}
      <div aria-hidden className="h-[76px] md:hidden" />
    </>
  );
}
