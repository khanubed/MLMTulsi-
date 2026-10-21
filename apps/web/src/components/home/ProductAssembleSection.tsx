'use client';

import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChevronDown } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}


interface IngredientCoord {
  x: number;
  y: number;
}

interface BreakpointConfig {
  capStartY: number;
  capInitialRotation: number;
  bottleTravelX: number;
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
// - capInitialRotation: Tilt angle of cap in initial state (degrees)
// - bottleTravelX: Horizontal shift into the 60% right column on desktop
// - bottleTravelY: How far the assembled bottle travels down into Section 2
// - tulsi, amla, herbs, lahsun, shilajit: (x, y) radial positions around bottle
// =========================================================================
const RESPONSIVE_LAYOUTS: {
  desktop: BreakpointConfig;
  tablet: BreakpointConfig;
  mobile: BreakpointConfig;
} = {
  // Desktop screens (>= 1024px) - Centered layout
  desktop: {
    capStartY: -300, // <-- CAP START HEIGHT: Change this to start higher (e.g. -300) or lower (e.g. -180)
    capInitialRotation: -30, // <-- CAP ROTATION: Initial tilt in degrees before assembly
    bottleTravelX: 0, // <-- CENTERED IN SECTION 2: Bottle remains horizontally in the center
    bottleTravelY: 75, // <-- BOTTLE DOWNWARD TRAVEL: Height in Section 2
    tulsi: { x: 0, y: -250 }, // Top Apex
    amla: { x: -250, y: -100 }, // Upper Left
    herbs: { x: 250, y: -100 }, // Upper Right
    lahsun: { x: -225, y: 85 }, // Lower Left
    shilajit: { x: 225, y: 85 }, // Lower Right
  },

  // Tablet screens (640px to 1023px) - Centered layout
  tablet: {
    capStartY: -350, // <-- Tablet cap start height
    capInitialRotation: -10,
    bottleTravelX: 0, // Centered horizontally
    bottleTravelY: 55, // <-- Tablet bottle travel distance
    tulsi: { x: 0, y: -250 },
    amla: { x: -170, y: -60 },
    herbs: { x: 170, y: -60 },
    lahsun: { x: -155, y: 75 },
    shilajit: { x: 155, y: 75 },
  },
  // Mobile screens (< 640px) - Compact centered layout
  mobile: {
    capStartY: -400, // <-- Mobile cap start height
    capInitialRotation: -8,
    bottleTravelX: 0, // Centered horizontally
    bottleTravelY: 40, // <-- Mobile bottle travel distance
    tulsi: { x: 0, y: -200 },
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
  void sec2HeaderRef;
  const sec2FooterRef = useRef<HTMLDivElement>(null);
  void sec2FooterRef;


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
            gsap.set(capRef.current, { y: 0, rotation: 0, x: 0 });
            gsap.set(shadowRef.current, { scale: 1, opacity: 0.65 });
            gsap.set(stageMotionGroupRef.current, {
              x: config.bottleTravelX,
              y: config.bottleTravelY,
            });

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

          // Initial state setup with cap rotation
          gsap.set(capRef.current, {
            y: config.capStartY,
            rotation: config.capInitialRotation,
            x: 0,
          });
          gsap.set(shadowRef.current, { scale: 0.75, opacity: 0.35 });
          gsap.set(stageMotionGroupRef.current, { x: 0, y: 0 });

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
          // The cap descends smoothly from its tilted angle to form an airtight lock
          // Followed by a generous hold so the assembled bottle remains stable on scroll
          // =========================================================================
          const assemblyTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section1Ref.current,
              start: "top top",
              end: "+=120%", // Generous scroll distance for smooth assembly + hold
              pin: true,
              pinSpacing: true,
              scrub: 1, // Smooth scrub matched with Lenis
              invalidateOnRefresh: true,
            },
          });

          assemblyTimeline
            .fromTo(
              capRef.current,
              // Starting position: uses config.capStartY and tilted rotation (e.g. -14deg)
              {
                y: config.capStartY,
                rotation: config.capInitialRotation,
                x: 0,
              },
              // Final landing position: straightens to rotation: 0 and locks seamlessly at y: 0
              {
                y: 0,
                rotation: 0,
                x: 0,
                ease: "power2.inOut",
                duration: 0.8,
              },
            )
            .fromTo(
              shadowRef.current,
              { scale: 0.75, opacity: 0.35 },
              { scale: 1, opacity: 0.65, ease: "power2.inOut", duration: 0.8 },
              0,
            )
            // Generous appreciation hold: assembled bottle remains completely stable across ~60% of the scroll
            .to({}, { duration: 1.2 });

          // =========================================================================
          // TIMELINE 2: BOTTLE TRANSITION (Between Section 1 & Section 2)
          // On desktop, the bottle glides down and shifts into the 60% right canvas
          // =========================================================================
          const transitionTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section2Ref.current,
              start: "top bottom",
              end: "top top",
              scrub: 1, // Smooth scrub matched with Lenis
              invalidateOnRefresh: true,
            },
          });

          transitionTimeline.fromTo(
            stageMotionGroupRef.current,
            { x: 0, y: 0 },
            {
              x: config.bottleTravelX,
              y: config.bottleTravelY,
              ease: "power1.inOut",
            },
          );


          // =========================================================================
          // TIMELINE 3: INGREDIENT REVEAL (Section 2)
          // 5 Sacred Botanicals emerge radially from behind the bottle
          // Followed by a solid hold so user can view the complete radial composition
          // =========================================================================
          const ingredientTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section2Ref.current,
              start: "top top",
              end: "+=135%", // Generous scroll distance for bloom + hold
              pin: true,
              pinSpacing: true,
              scrub: 1, // Smooth scrub matched with Lenis
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
                duration: 0.65,
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
                duration: 0.65,
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
                duration: 0.65,
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
                duration: 0.65,
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
                duration: 0.65,
              },
              0.32,
            )
            // Generous appreciation hold: complete radial composition stays locked and readable
            .to({}, { duration: 1.35 });

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
          <span className="text-[8vw] font-serif font-black tracking-tight text-[#183F32]/[0.05] whitespace-nowrap will-change-transform">
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
          Centered radial composition around bottle across all breakpoints
          ========================================================================= */}
      <section
        ref={section2Ref}
        id="section-ingredient-showcase"
        className="relative w-full min-h-[100svh] flex items-center justify-center px-6 sm:px-10 py-12 select-none overflow-hidden"
      >
        {/* Central spacer reserving the full-viewport radial ingredient stage */}
        <div className="w-full h-[380px] sm:h-[460px] lg:h-[540px] pointer-events-none relative flex items-center justify-center" />
      </section>


    </div>
  );
};
