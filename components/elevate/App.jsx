"use client";

import Header from "./intro/Header";
import SkyBackdrop from "./components/SkyBackdrop";
import Intro from "./intro/Intro";
import JetSection from "./intro/JetSection";
import LegacyGallery from "./components/LegacyGallery";
import BoardingPass from "./components/BoardingPass";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import BookFlight from "./components/BookFlight";
import SoundToggle from "./components/SoundToggle";
import { ScrollFlight, PlaneCursor, useRevealAll, useHoverTicks } from "./components/SiteChrome";

export default function SkylarkElevate() {
  useRevealAll();
  useHoverTicks();

  return (
    <div className="skylark-elevate">
      <SkyBackdrop />
      <ScrollFlight />
      <Header />
      <main id="main">
        <Intro />
        <JetSection />
        <LegacyGallery />
        <BoardingPass />
        <Faq />
      </main>
      <Footer />
      <BookFlight />
      <SoundToggle />
      <PlaneCursor />
    </div>
  );
}
