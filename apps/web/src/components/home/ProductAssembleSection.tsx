import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Sparkles, ChevronDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface IngredientCoord {
  x: number;
  y: number;
}

interface BreakpointConfig {
  capStartY: number;
  bottleTravelY: number;
  tulsi: IngredientCoord;
  amla: IngredientCoord;
  herbs: IngredientCoord;
  lahsun: IngredientCoord;
  shilajit: IngredientCoord;
}

// =========================================================================
// RESPONSIVE COORDINATES & POSITIONING CONFIGURATION
// -------------------------------------------------------------------------
// Edit the values below to easily adjust positions across screen sizes:
// - capStartY: Starting height of the cap before scroll (more negative = higher up)
// - bottleTravelY: How far the assembled bottle travels down into Section 2
// - tulsi, amla, herbs, lahsun, shilajit: (x, y) radial positions around bottle
// =========================================================================
const RESPONSIVE_LAYOUTS: {
  desktop: BreakpointConfig;
  tablet: BreakpointConfig;
  mobile: BreakpointConfig;
} = {
  // Desktop screens (>= 1024px)
  desktop: {
    capStartY: -250, // <-- CAP START HEIGHT: Change this to start higher (e.g. -300) or lower (e.g. -180)
    bottleTravelY: 70, // <-- BOTTLE DOWNWARD TRAVEL: How far bottle moves down into Section 2
    tulsi: { x: 0, y: -250 }, // Top Apex
    amla: { x: -215, y: -75 }, // Upper Left
    herbs: { x: 215, y: -75 }, // Upper Right
    lahsun: { x: -195, y: 90 }, // Lower Left
    shilajit: { x: 195, y: 90 }, // Lower Right
  },
  // Tablet screens (640px to 1023px)
  tablet: {
    capStartY: -120, // <-- Tablet cap start height
    bottleTravelY: 55, // <-- Tablet bottle travel distance
    tulsi: { x: 0, y: -160 },
    amla: { x: -170, y: -60 },
    herbs: { x: 170, y: -60 },
    lahsun: { x: -155, y: 75 },
    shilajit: { x: 155, y: 75 },
  },
  // Mobile screens (< 640px)
  mobile: {
    capStartY: -100, // <-- Mobile cap start height
    bottleTravelY: 40, // <-- Mobile bottle travel distance
    tulsi: { x: 0, y: -135 },
    amla: { x: -125, y: -60 },
    herbs: { x: 125, y: -60 },
    lahsun: { x: -115, y: 75 },
    shilajit: { x: 115, y: 75 },
  },
};

export const ProductAssembleSection: React.FC = () => {
  // Master container spanning both full-screen sections
  const containerRef = useRef<HTMLDivElement>(null);

  // Section 1: Brand Introduction & Bottle Assembly
  const section1Ref = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const sec1HeaderRef = useRef<HTMLDivElement>(null);
  void sec1HeaderRef; // Suppress unused warning while header is commented in JSX
  const sec1FooterRef = useRef<HTMLDivElement>(null);

  // Section 2: Full-Screen Ingredient Showcase
  const section2Ref = useRef<HTMLElement>(null);
  const sec2HeaderRef = useRef<HTMLDivElement>(null);
  const sec2FooterRef = useRef<HTMLDivElement>(null);

  // Shared Persistent Visual Stage
  const stageMotionGroupRef = useRef<HTMLDivElement>(null);
  const bottleWrapperRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  // Ingredients Layer & Individual Nodes
  const tulsiRef = useRef<HTMLDivElement>(null);
  const amlaRef = useRef<HTMLDivElement>(null);
  const herbsRef = useRef<HTMLDivElement>(null);
  const lahsunRef = useRef<HTMLDivElement>(null);
  const shilajitRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
        !containerRef.current ||
        !section1Ref.current ||
        !section2Ref.current ||
        !stageMotionGroupRef.current ||
        !capRef.current ||
        !bodyRef.current ||
        !shadowRef.current ||
        !tulsiRef.current ||
        !amlaRef.current ||
        !herbsRef.current ||
        !lahsunRef.current ||
        !shilajitRef.current
      ) {
        return;
      }

      const mm = gsap.matchMedia(containerRef);

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isTablet: "(min-width: 640px) and (max-width: 1023px)",
          isMobile: "(max-width: 639px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, isTablet, reduceMotion } = context.conditions as {
            isDesktop: boolean;
            isTablet: boolean;
            isMobile: boolean;
            reduceMotion: boolean;
          };

          const config = isDesktop
            ? RESPONSIVE_LAYOUTS.desktop
            : isTablet
              ? RESPONSIVE_LAYOUTS.tablet
              : RESPONSIVE_LAYOUTS.mobile;

          // If reduced motion is preferred, render settled static state
          if (reduceMotion) {
            gsap.set(capRef.current, { y: 0 });
            gsap.set(shadowRef.current, { scale: 1, opacity: 0.65 });
            gsap.set(stageMotionGroupRef.current, { y: config.bottleTravelY });

            const items = [
              { ref: tulsiRef.current, coord: config.tulsi },
              { ref: amlaRef.current, coord: config.amla },
              { ref: herbsRef.current, coord: config.herbs },
              { ref: lahsunRef.current, coord: config.lahsun },
              { ref: shilajitRef.current, coord: config.shilajit },
            ];
            items.forEach(({ ref, coord }) => {
              if (ref) {
                gsap.set(ref, {
                  x: coord.x,
                  y: coord.y,
                  scale: 1,
                  opacity: 1,
                });
              }
            });
            return;
          }

          // Initial state setup
          gsap.set(capRef.current, { y: config.capStartY });
          gsap.set(shadowRef.current, { scale: 0.75, opacity: 0.35 });
          gsap.set(stageMotionGroupRef.current, { y: 0 });

          const ingredientNodes = [
            tulsiRef.current,
            amlaRef.current,
            herbsRef.current,
            lahsunRef.current,
            shilajitRef.current,
          ];
          gsap.set(ingredientNodes, {
            x: 0,
            y: 0,
            scale: 0,
            opacity: 0,
          });

          // =========================================================================
          // TIMELINE 1: BOTTLE ASSEMBLY (Section 1)
          // The cap descends smoothly to form an airtight lock with container opening
          // =========================================================================
          const assemblyTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section1Ref.current,
              start: "top top",
              end: "+=75%",
              pin: true,
              pinSpacing: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });

          assemblyTimeline
            .fromTo(
              capRef.current,
              // Starting position: uses config.capStartY (e.g. -250 on desktop)
              { y: config.capStartY, x: 0 },
              // Final landing position when assembled:
              // - y: 0 is the exact mathematical seam lock.
              // - Increase y (e.g. y: 4) to make cap sit lower into the bottle neck.
              // - Decrease y (e.g. y: -4) to make cap sit higher with a gap.
              // - Add x (e.g. x: 2) if you ever need to nudge the cap left/right.
              { y: 0, x: 0, ease: "power2.inOut", duration: 1 },
            )
            .fromTo(
              shadowRef.current,
              { scale: 0.75, opacity: 0.35 },
              { scale: 1, opacity: 0.65, ease: "power2.inOut", duration: 1 },
              0,
            )
            // Deliberate appreciation hold (increase duration to keep assembled bottle held longer)
            .to({}, { duration: 0.5 });

          // =========================================================================
          // TIMELINE 2: BOTTLE TRANSITION (Between Section 1 & Section 2)
          // The assembled bottle glides down smoothly, carrying user into Section 2
          // =========================================================================
          const transitionTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section2Ref.current,
              start: "top bottom",
              end: "top top",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });

          transitionTimeline.fromTo(
            stageMotionGroupRef.current,
            { y: 0 },
            { y: config.bottleTravelY, ease: "power1.inOut" },
          );

          // =========================================================================
          // TIMELINE 3: INGREDIENT REVEAL (Section 2)
          // 5 Sacred Botanicals emerge radially from behind the bottle
          // =========================================================================
          const ingredientTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section2Ref.current,
              start: "top top",
              end: "+=85%",
              pin: true,
              pinSpacing: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });

          ingredientTimeline
            .fromTo(
              tulsiRef.current,
              { x: 0, y: 0, scale: 0, opacity: 0 },
              {
                x: config.tulsi.x,
                y: config.tulsi.y,
                scale: 1,
                opacity: 1,
                ease: "power2.out",
                duration: 0.7,
              },
            )
            .fromTo(
              amlaRef.current,
              { x: 0, y: 0, scale: 0, opacity: 0 },
              {
                x: config.amla.x,
                y: config.amla.y,
                scale: 1,
                opacity: 1,
                ease: "power2.out",
                duration: 0.7,
              },
              0.08,
            )
            .fromTo(
              herbsRef.current,
              { x: 0, y: 0, scale: 0, opacity: 0 },
              {
                x: config.herbs.x,
                y: config.herbs.y,
                scale: 1,
                opacity: 1,
                ease: "power2.out",
                duration: 0.7,
              },
              0.16,
            )
            .fromTo(
              lahsunRef.current,
              { x: 0, y: 0, scale: 0, opacity: 0 },
              {
                x: config.lahsun.x,
                y: config.lahsun.y,
                scale: 1,
                opacity: 1,
                ease: "power2.out",
                duration: 0.7,
              },
              0.24,
            )
            .fromTo(
              shilajitRef.current,
              { x: 0, y: 0, scale: 0, opacity: 0 },
              {
                x: config.shilajit.x,
                y: config.shilajit.y,
                scale: 1,
                opacity: 1,
                ease: "power2.out",
                duration: 0.7,
              },
              0.32,
            )
            // Settled appreciation hold
            .to({}, { duration: 0.45 });
        },
      );

      return () => {
        mm.revert();
      };
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="relative w-full bg-[#F8F5ED]">
      {/* =========================================================================
          PERSISTENT VISUAL STAGE (Shares Bottle & Ingredients Across Both Scenes)
          This layer spans the entire two-section container and sticks continuously
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="sticky top-0 h-[100svh] w-full flex items-center justify-center overflow-hidden">
          {/* Master Motion Group (Carries Bottle & Ingredients Downward During Transition) */}
          <div
            ref={stageMotionGroupRef}
            className="relative flex items-center justify-center will-change-transform"
          >
            {/* -------------------------------------------------------------
                INGREDIENTS RADIAL LAYER (Behind Bottle: z-10)
                ------------------------------------------------------------- */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-10">
              {/* 1. Holy Tulsi (Top Apex) */}
              <div
                ref={tulsiRef}
                className="absolute flex flex-col items-center pointer-events-auto will-change-transform"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-transparent">
                  <img
                    src="/images/INGREDIENTS/tulsi.png"
                    alt="Holy Tulsi"
                    className="w-full h-full object-contain filter drop-shadow-md select-none"
                    draggable={false}
                  />
                </div>
                <span className="mt-1 px-2.5 py-0.5 rounded-full bg-[#183F32] text-[#F8F5ED] text-[10px] sm:text-xs font-semibold tracking-wider uppercase shadow-xs whitespace-nowrap">
                  Holy Tulsi
                </span>
              </div>

              {/* 2. Wild Amla (Upper Left) */}
              <div
                ref={amlaRef}
                className="absolute flex flex-col items-center pointer-events-auto will-change-transform"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-transparent">
                  <img
                    src="/images/INGREDIENTS/AWLA.png"
                    alt="Wild Amla"
                    className="w-full h-full object-contain filter drop-shadow-md select-none"
                    draggable={false}
                  />
                </div>
                <span className="mt-1 px-2.5 py-0.5 rounded-full bg-[#183F32] text-[#F8F5ED] text-[10px] sm:text-xs font-semibold tracking-wider uppercase shadow-xs whitespace-nowrap">
                  Wild Amla
                </span>
              </div>

              {/* 3. Vedic Herbs (Upper Right) */}
              <div
                ref={herbsRef}
                className="absolute flex flex-col items-center pointer-events-auto will-change-transform"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-transparent">
                  <img
                    src="/images/INGREDIENTS/HERBS.png"
                    alt="Vedic Herbs"
                    className="w-full h-full object-contain filter drop-shadow-md select-none"
                    draggable={false}
                  />
                </div>
                <span className="mt-1 px-2.5 py-0.5 rounded-full bg-[#183F32] text-[#F8F5ED] text-[10px] sm:text-xs font-semibold tracking-wider uppercase shadow-xs whitespace-nowrap">
                  Vedic Herbs
                </span>
              </div>

              {/* 4. Native Lahsun (Lower Left) */}
              <div
                ref={lahsunRef}
                className="absolute flex flex-col items-center pointer-events-auto will-change-transform"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-transparent">
                  <img
                    src="/images/INGREDIENTS/LAHSUN.png"
                    alt="Native Lahsun"
                    className="w-full h-full object-contain filter drop-shadow-md select-none"
                    draggable={false}
                  />
                </div>
                <span className="mt-1 px-2.5 py-0.5 rounded-full bg-[#183F32] text-[#F8F5ED] text-[10px] sm:text-xs font-semibold tracking-wider uppercase shadow-xs whitespace-nowrap">
                  Native Lahsun
                </span>
              </div>

              {/* 5. Himalayan Shilajit (Lower Right) */}
              <div
                ref={shilajitRef}
                className="absolute flex flex-col items-center pointer-events-auto will-change-transform"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-transparent">
                  <img
                    src="/images/INGREDIENTS/SHILAJIT.png"
                    alt="Himalayan Shilajit"
                    className="w-full h-full object-contain filter drop-shadow-md select-none"
                    draggable={false}
                  />
                </div>
                <span className="mt-1 px-2.5 py-0.5 rounded-full bg-[#183F32] text-[#F8F5ED] text-[10px] sm:text-xs font-semibold tracking-wider uppercase shadow-xs whitespace-nowrap">
                  Shilajit
                </span>
              </div>
            </div>

            {/* -------------------------------------------------------------
                ASSEMBLED BOTTLE WRAPPER (In Front of Ingredients: z-20)
                Uses exact mathematical aspect ratio 208/459 with body at 18.52%
                ------------------------------------------------------------- */}
            <div
              ref={bottleWrapperRef}
              className="relative z-20 w-[130px] sm:w-[155px] md:w-[175px] lg:w-[185px] aspect-[208/459] flex items-center justify-center select-none"
            >
              {/* Cap (containerTop.png) */}
              <div
                ref={capRef}
                className="absolute top-10 left-0 w-full h-auto z-20 pointer-events-none will-change-transform"
              >
                <img
                  src="/images/hero/containerTop.png"
                  alt="Tulsi Swaraj Herbal Cap"
                  className="w-full h-auto object-contain drop-shadow-[0_8px_16px_rgba(24,63,50,0.14)] select-none"
                  draggable={false}
                />
              </div>

              {/* Container Body (containerBottom.png) — mathematically aligned at 18.52% */}
              <div
                ref={bodyRef}
                className="absolute top-[18.52%] left-0 w-full h-auto z-10 pointer-events-none will-change-transform"
              >
                <img
                  src="/images/hero/containerBottom.png"
                  alt="Tulsi Swaraj Herbal Container Body"
                  className="w-full h-auto object-contain drop-shadow-[0_16px_28px_rgba(24,63,50,0.18)] select-none"
                  draggable={false}
                />
              </div>

              {/* Ground Contact Shadow */}
              <div
                ref={shadowRef}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-28 sm:w-36 md:w-40 h-2.5 bg-[#183F32]/25 rounded-[100%] blur-[4px] pointer-events-none transition-opacity"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1 — Brand Introduction and Bottle Assembly
          Full viewport height section with subtle watermark and clean typography
          ========================================================================= */}
      <section
        ref={section1Ref}
        id="section-bottle-assembly"
        className="relative w-full min-h-[100svh] flex flex-col justify-between items-center px-6 sm:px-12 py-12 sm:py-16 text-center select-none"
      >
        {/* Typographic Watermark (Oversized, subtle background integration) */}
        <div
          ref={watermarkRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0"
        >
          <span className="text-[13vw] font-serif font-black tracking-tight text-[#183F32]/[0.05] whitespace-nowrap will-change-transform">
            TULSI SWAROJGAR
          </span>
        </div>

        {/* Section 1 Header */}
        {/* <div
          ref={sec1HeaderRef}
          className="relative z-10 max-w-xl mx-auto space-y-2 mt-2 sm:mt-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#183F32]/5 border border-[#183F32]/15 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#B49A63]">
            <Sparkles className="w-3.5 h-3.5 text-[#B49A63]" />
            The Architecture of Wholeness
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#183F32] font-normal tracking-tight">
            Harmonized by Nature. Assembled with Precision.
          </h2>
          <p className="text-xs sm:text-sm text-[#77796F] max-w-md mx-auto leading-relaxed font-light">
            Where ancient Ayurvedic wisdom meets pristine modern formulation in an airtight botanical seal.
          </p>
        </div> */}

        {/* Vertical clearance reserved for central bottle */}
        <div className="w-full h-44 sm:h-52 pointer-events-none" />

        {/* Section 1 Scroll Guide */}
        <div
          ref={sec1FooterRef}
          className="relative z-10 flex flex-col items-center gap-1.5 pb-2 text-[#77796F]"
        >
          <span className="text-[11px] uppercase tracking-[0.22em] font-medium text-[#77796F]/80">
            Scroll to Seal the Vessel
          </span>
          <ChevronDown className="w-4 h-4 text-[#B49A63] animate-bounce" />
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 — Full-Screen Ingredient Showcase
          Genuinely separate semantic section with radial ingredient presentation
          ========================================================================= */}
      <section
        ref={section2Ref}
        id="section-ingredient-showcase"
        className="relative w-full min-h-[100svh] flex flex-col justify-between items-center px-6 sm:px-12 py-12 sm:py-16 text-center select-none"
      >
        {/* Section 2 Header */}
        <div
          ref={sec2HeaderRef}
          className="relative z-10 max-w-xl mx-auto space-y-2 mt-2 sm:mt-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#183F32]/5 border border-[#183F32]/15 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#B49A63]">
            <Sparkles className="w-3.5 h-3.5 text-[#B49A63]" />5 Sacred
            Ayurvedic Pillars
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#183F32] font-normal tracking-tight">
            Synergistic Botanical Alchemy
          </h2>
          <p className="text-xs sm:text-sm text-[#77796F] max-w-lg mx-auto leading-relaxed font-light">
            Pure wild-foraged adaptogens cold-ground to bioavailable perfection,
            blossoming outward from the heart of the vessel.
          </p>
        </div>

        {/* Vertical clearance reserved for blooming ingredient radial stage */}
        <div className="w-full h-56 sm:h-64 pointer-events-none" />

        {/* Section 2 Trust Markers */}
        <div
          ref={sec2FooterRef}
          className="relative z-10 max-w-2xl mx-auto pb-2"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-[#183F32] font-medium">
            <span className="px-3 py-1 rounded-full bg-white/70 border border-[#E5DFD3] shadow-xs">
              100% Wild Harvested
            </span>
            <span className="px-3 py-1 rounded-full bg-white/70 border border-[#E5DFD3] shadow-xs">
              Zero Synthetics or Fillers
            </span>
            <span className="px-3 py-1 rounded-full bg-white/70 border border-[#E5DFD3] shadow-xs">
              Vedic Cold Extraction
            </span>
            <span className="px-3 py-1 rounded-full bg-white/70 border border-[#E5DFD3] shadow-xs">
              Lab-Tested Purity
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
