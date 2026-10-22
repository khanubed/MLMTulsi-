"use client";

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
  dropStartY: number;
  dropEndY: number;
  bottleStartY: number;
  bottleTravelX: number;
  bottleTravelY: number;
  tulsi: IngredientCoord;
  fenugreek: IngredientCoord;
  herbs: IngredientCoord;
  lahsun: IngredientCoord;
  cumin: IngredientCoord;
}

// =========================================================================
// RESPONSIVE COORDINATES & POSITIONING CONFIGURATION
// -------------------------------------------------------------------------
// - capStartY: Starting height of the cap before scroll
// - capInitialRotation: Tilt angle of cap before assembly
// - dropStartY: Starting height for ingredients dropping from above
// - dropEndY: Height where ingredients enter the bottle neck opening
// - bottleStartY: Vertical offset in Section 1 (ensures 100% clearance from headline)
// - bottleTravelX: Horizontal shift (0 = centered)
// - bottleTravelY: Vertical distance the assembled bottle travels into Section 2
// - tulsi, fenugreek, herbs, lahsun, cumin: (x, y) radial positions around bottle
// =========================================================================
const RESPONSIVE_LAYOUTS: {
  desktop: BreakpointConfig;
  tablet: BreakpointConfig;
  mobile: BreakpointConfig;
} = {
  // Desktop screens (>= 1024px) - Balanced, symmetrical botanical diagram layout
  desktop: {
    capStartY: -370,
    capInitialRotation: -28,
    dropStartY: -390,
    dropEndY: -75,
    bottleStartY: 75,
    bottleTravelX: 0,
    bottleTravelY: 95,
    tulsi: { x: 0, y: -230 }, // Top Apex
    fenugreek: { x: -210, y: -75 }, // Upper Left
    herbs: { x: 210, y: -75 }, // Upper Right
    lahsun: { x: -200, y: 80 }, // Lower Left
    cumin: { x: 200, y: 80 }, // Lower Right
  },

  // Tablet screens (640px to 1023px) - Streamlined centered layout
  tablet: {
    capStartY: -310,
    capInitialRotation: -10,
    dropStartY: -350,
    dropEndY: -65,
    bottleStartY: 35,
    bottleTravelX: 0,
    bottleTravelY: 45,
    tulsi: { x: 0, y: -220 },
    fenugreek: { x: -160, y: -60 },
    herbs: { x: 160, y: -60 },
    lahsun: { x: -150, y: 70 },
    cumin: { x: 150, y: 70 },
  },

  // Mobile screens (< 640px) - Compact centered layout
  mobile: {
    capStartY: -450,
    capInitialRotation: -8,
    dropStartY: -290,
    dropEndY: -55,
    bottleStartY: 25,
    bottleTravelX: 0,
    bottleTravelY: 35,
    tulsi: { x: 0, y: -190 },
    fenugreek: { x: -125, y: -55 },
    herbs: { x: 125, y: -55 },
    lahsun: { x: -115, y: 75 },
    cumin: { x: 115, y: 75 },
  },
};

export const ProductAssembleSection: React.FC = () => {
  // Master container spanning both full-screen sections
  const containerRef = useRef<HTMLDivElement>(null);

  // Section 1: Brand Introduction & Bottle Assembly
  const section1Ref = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const sec1HeaderRef = useRef<HTMLDivElement>(null);
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
  const fenugreekRef = useRef<HTMLDivElement>(null);
  const herbsRef = useRef<HTMLDivElement>(null);
  const lahsunRef = useRef<HTMLDivElement>(null);
  const cuminRef = useRef<HTMLDivElement>(null);

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
        !fenugreekRef.current ||
        !herbsRef.current ||
        !lahsunRef.current ||
        !cuminRef.current
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
            gsap.set(".ingredient-label", { opacity: 1, scale: 1 });
            gsap.set(".sec2-metadata", { opacity: 1, y: 0 });
            gsap.set(".connecting-line", { opacity: 1 });
            gsap.set(".ingredient-annotation", { opacity: 1, y: 0 });
            gsap.set(".product-identity-panel", { opacity: 1, y: 0 });
            gsap.set(".sec1-benefit-card", { opacity: 1, y: 0 });

            const items = [
              { ref: tulsiRef.current, coord: config.tulsi },
              { ref: fenugreekRef.current, coord: config.fenugreek },
              { ref: herbsRef.current, coord: config.herbs },
              { ref: lahsunRef.current, coord: config.lahsun },
              { ref: cuminRef.current, coord: config.cumin },
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

          // Initial state setup with cap rotation and bottleStartY
          gsap.set(capRef.current, {
            y: config.capStartY,
            rotation: config.capInitialRotation,
            x: 0,
          });
          gsap.set(shadowRef.current, { scale: 0.75, opacity: 0.35 });
          gsap.set(stageMotionGroupRef.current, {
            x: 0,
            y: config.bottleStartY,
          });

          // Section 1 benefit cards: visible by default to describe the product
          gsap.set(".sec1-benefit-card", { opacity: 1, y: 0 });

          // Start Section 2 elements hidden; they reveal during ingredient timeline
          gsap.set(".ingredient-label", { opacity: 0, scale: 0.8 });
          gsap.set(".sec2-metadata", { opacity: 0, y: -12 });
          gsap.set(".connecting-line", { opacity: 0 });
          gsap.set(".ingredient-annotation", { opacity: 0, y: 12 });
          gsap.set(".product-identity-panel", { opacity: 0, y: 12 });

          const ingredientNodes = [
            tulsiRef.current,
            fenugreekRef.current,
            herbsRef.current,
            lahsunRef.current,
            cuminRef.current,
          ];
          gsap.set(ingredientNodes, {
            x: 0,
            y: config.dropStartY,
            scale: 0.65,
            opacity: 0,
          });

          // =========================================================================
          // TIMELINE 1: INGREDIENTS DROP & BOTTLE ASSEMBLY (Section 1)
          // 1. Five botanical ingredients drop from above into the open neck of the bottle
          // 2. The cap descends smoothly from its tilted angle to form an airtight seal
          // 3. Generous appreciation hold so the assembled bottle remains stable on scroll
          // =========================================================================
          const assemblyTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section1Ref.current,
              start: "top top",
              end: "+=170%", // Extended scroll distance for drop + cap lock + hold
              pin: true,
              pinSpacing: true,
              scrub: 1, // Smooth scrub matched with Lenis
              invalidateOnRefresh: true,
            },
          });

          // Phase 1: Cascade drop of the 5 botanicals into the bottle opening
          assemblyTimeline
            // 1. Tulsi drops into neck
            .fromTo(
              tulsiRef.current,
              {
                x: 0,
                y: config.dropStartY,
                scale: 0.65,
                opacity: 0,
                rotation: -10,
              },
              {
                keyframes: [
                  {
                    y: config.dropStartY * 0.45,
                    opacity: 1,
                    scale: 0.65,
                    duration: 0.24,
                    ease: "power1.out",
                  },
                  {
                    y: config.dropEndY,
                    opacity: 0.35,
                    scale: 0.32,
                    duration: 0.22,
                    ease: "power2.in",
                  },
                  {
                    x: 0,
                    y: 0,
                    opacity: 0,
                    scale: 0,
                    rotation: 0,
                    duration: 0.16,
                    ease: "power1.in",
                  },
                ],
                duration: 0.62,
              },
              0.0,
            )
            // 2. Fenugreek drops into neck
            .fromTo(
              fenugreekRef.current,
              {
                x: -35,
                y: config.dropStartY - 20,
                scale: 0.65,
                opacity: 0,
                rotation: 14,
              },
              {
                keyframes: [
                  {
                    x: -18,
                    y: config.dropStartY * 0.45,
                    opacity: 1,
                    scale: 0.65,
                    duration: 0.24,
                    ease: "power1.out",
                  },
                  {
                    x: -3,
                    y: config.dropEndY,
                    opacity: 0.35,
                    scale: 0.32,
                    duration: 0.22,
                    ease: "power2.in",
                  },
                  {
                    x: 0,
                    y: 0,
                    opacity: 0,
                    scale: 0,
                    rotation: 0,
                    duration: 0.16,
                    ease: "power1.in",
                  },
                ],
                duration: 0.62,
              },
              0.14,
            )
            // 3. Vedic Herbs drop into neck
            .fromTo(
              herbsRef.current,
              {
                x: 32,
                y: config.dropStartY - 10,
                scale: 0.65,
                opacity: 0,
                rotation: -16,
              },
              {
                keyframes: [
                  {
                    x: 16,
                    y: config.dropStartY * 0.45,
                    opacity: 1,
                    scale: 0.65,
                    duration: 0.24,
                    ease: "power1.out",
                  },
                  {
                    x: 3,
                    y: config.dropEndY,
                    opacity: 0.35,
                    scale: 0.32,
                    duration: 0.22,
                    ease: "power2.in",
                  },
                  {
                    x: 0,
                    y: 0,
                    opacity: 0,
                    scale: 0,
                    rotation: 0,
                    duration: 0.16,
                    ease: "power1.in",
                  },
                ],
                duration: 0.62,
              },
              0.28,
            )
            // 4. Native Lahsun drops into neck
            .fromTo(
              lahsunRef.current,
              {
                x: -22,
                y: config.dropStartY - 25,
                scale: 0.65,
                opacity: 0,
                rotation: 12,
              },
              {
                keyframes: [
                  {
                    x: -10,
                    y: config.dropStartY * 0.45,
                    opacity: 1,
                    scale: 0.65,
                    duration: 0.24,
                    ease: "power1.out",
                  },
                  {
                    x: -2,
                    y: config.dropEndY,
                    opacity: 0.35,
                    scale: 0.32,
                    duration: 0.22,
                    ease: "power2.in",
                  },
                  {
                    x: 0,
                    y: 0,
                    opacity: 0,
                    scale: 0,
                    rotation: 0,
                    duration: 0.16,
                    ease: "power1.in",
                  },
                ],
                duration: 0.62,
              },
              0.42,
            )
            // 5. Pure Cumin drops into neck
            .fromTo(
              cuminRef.current,
              {
                x: 25,
                y: config.dropStartY - 15,
                scale: 0.65,
                opacity: 0,
                rotation: -12,
              },
              {
                keyframes: [
                  {
                    x: 12,
                    y: config.dropStartY * 0.45,
                    opacity: 1,
                    scale: 0.65,
                    duration: 0.24,
                    ease: "power1.out",
                  },
                  {
                    x: 2,
                    y: config.dropEndY,
                    opacity: 0.35,
                    scale: 0.32,
                    duration: 0.22,
                    ease: "power2.in",
                  },
                  {
                    x: 0,
                    y: 0,
                    opacity: 0,
                    scale: 0,
                    rotation: 0,
                    duration: 0.16,
                    ease: "power1.in",
                  },
                ],
                duration: 0.62,
              },
              0.56,
            )
            // Phase 2: Cap descends from tilted angle and locks airtight over the neck
            .fromTo(
              capRef.current,
              {
                y: config.capStartY,
                rotation: config.capInitialRotation,
                x: 0,
              },
              {
                y: 0,
                rotation: 0,
                x: 0,
                ease: "power2.inOut",
                duration: 0.85,
              },
              1.35,
            )
            .fromTo(
              shadowRef.current,
              { scale: 0.75, opacity: 0.35 },
              { scale: 1, opacity: 0.65, ease: "power2.inOut", duration: 0.85 },
              1.35,
            )
            // Header subtle breath as bottle seals
            .to(
              sec1HeaderRef.current,
              { opacity: 0.35, y: -8, duration: 0.55, ease: "power1.inOut" },
              1.5,
            )
            // Soften benefit cards near end of Section 1
            .to(
              ".sec1-benefit-card",
              { opacity: 0.25, y: -8, duration: 0.55, ease: "power1.inOut" },
              1.5,
            )
            .to(sec1FooterRef.current, { opacity: 0.2, duration: 0.4 }, 1.6)
            // Phase 3: Appreciation hold of the sealed product
            .to({}, { duration: 1.2 });

          // =========================================================================
          // TIMELINE 2: BOTTLE TRANSITION (Between Section 1 & Section 2)
          // Assembled bottle smoothly travels down from bottleStartY into bottleTravelY
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

          transitionTimeline
            .fromTo(
              stageMotionGroupRef.current,
              { x: 0, y: config.bottleStartY },
              {
                x: config.bottleTravelX,
                y: config.bottleTravelY,
                ease: "power1.inOut",
              },
            )
            .to(
              ".sec1-benefit-card",
              { opacity: 0, duration: 0.35, ease: "power1.out" },
              0,
            );

          // =========================================================================
          // TIMELINE 3: INGREDIENT REVEAL & EDITORIAL SHOWCASE (Section 2)
          // 1. Five Sacred Botanicals emerge radially from behind the bottle
          // 2. Ingredient pill labels appear
          // 3. Section 2 metadata header fades in
          // 4. Delicate botanical connecting lines reveal
          // 5. Editorial ingredient annotations fade & slide in
          // 6. Product Identity Panel settles in
          // 7. Generous appreciation hold so user can absorb the complete composition
          // =========================================================================
          const ingredientTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section2Ref.current,
              start: "top top",
              end: "+=150%", // Extended distance for full bloom, annotations & hold
              pin: true,
              pinSpacing: true,
              scrub: 1, // Smooth scrub matched with Lenis
              invalidateOnRefresh: true,
            },
          });

          ingredientTimeline
            // Radial bloom of 5 ingredients
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
              fenugreekRef.current,
              { x: 0, y: 0, scale: 0, opacity: 0 },
              {
                x: config.fenugreek.x,
                y: config.fenugreek.y,
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
              cuminRef.current,
              { x: 0, y: 0, scale: 0, opacity: 0 },
              {
                x: config.cumin.x,
                y: config.cumin.y,
                scale: 1,
                opacity: 1,
                ease: "power2.out",
                duration: 0.65,
              },
              0.32,
            )
            // Section 2 metadata header
            .fromTo(
              ".sec2-metadata",
              { opacity: 0, y: -12 },
              { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
              0.2,
            )
            // Ingredient pill labels
            .fromTo(
              ".ingredient-label",
              { opacity: 0, scale: 0.8 },
              {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                stagger: 0.05,
                ease: "power2.out",
              },
              0.25,
            )
            // Fine SVG connecting lines
            .fromTo(
              ".connecting-line",
              { opacity: 0 },
              { opacity: 1, duration: 0.45, stagger: 0.06, ease: "power1.out" },
              0.35,
            )
            // Editorial annotations in left & right flanks
            .fromTo(
              ".ingredient-annotation",
              { opacity: 0, y: 10 },
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.07,
                ease: "power2.out",
              },
              0.42,
            )
            // Product Identity Panel
            .fromTo(
              ".product-identity-panel",
              { opacity: 0, y: 12 },
              { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
              0.5,
            )
            // Generous appreciation hold: complete radial composition stays locked and readable
            .to({}, { duration: 1.4 });
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
          ATMOSPHERIC BACKGROUND IMAGE (Authentic Herbal Harvest Flatlay)
          Low-opacity background layer spanning both scenes
          ========================================================================= */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
      >
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          <img
            src="/images/assemble-section-bg.png"
            alt=""
            className="w-full h-full object-cover object-center opacity-30 sm:opacity-12 mix-blend-multiply select-none pointer-events-none"
            draggable={false}
          />
          {/* Soft gradient wash to ensure text and botanical graphics remain crisp */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F8F5ED]/30 via-transparent to-[#F8F5ED]/40 pointer-events-none" />
        </div>
      </div>

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
                CONNECTING LINES & CONCENTRIC GUIDES (Behind Ingredients: z-5)
                Rendered on Desktop (>= 1024px) for diagrammatic editorial feel
                ------------------------------------------------------------- */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-5 hidden lg:block"
              aria-hidden="true"
            >
              <svg
                className="w-[1100px] h-[720px] overflow-visible"
                viewBox="-550 -360 1100 720"
                fill="none"
              >
                {/* Concentric botanical guide rings */}
                <circle
                  cx="0"
                  cy="0"
                  r="260"
                  stroke="#183F32"
                  strokeOpacity="0.05"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="170"
                  stroke="#B49A63"
                  strokeOpacity="0.14"
                  strokeWidth="1"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="340"
                  stroke="#183F32"
                  strokeOpacity="0.03"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />

                {/* 01: Holy Tulsi Connecting Line */}
                <g className="connecting-line opacity-0">
                  <line
                    x1="-380"
                    y1="-190"
                    x2="-55"
                    y2="-230"
                    stroke="#285642"
                    strokeOpacity="0.35"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <circle cx="-380" cy="-190" r="2.5" fill="#B49A63" />
                  <circle
                    cx="-55"
                    cy="-230"
                    r="2"
                    fill="#B49A63"
                    fillOpacity="0.8"
                  />
                </g>

                {/* 02: Fenugreek Connecting Line */}
                <g className="connecting-line opacity-0">
                  <line
                    x1="-380"
                    y1="-75"
                    x2="-255"
                    y2="-75"
                    stroke="#285642"
                    strokeOpacity="0.35"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <circle cx="-380" cy="-75" r="2.5" fill="#B49A63" />
                  <circle
                    cx="-255"
                    cy="-75"
                    r="2"
                    fill="#B49A63"
                    fillOpacity="0.8"
                  />
                </g>

                {/* 04: Native Lahsun Connecting Line */}
                <g className="connecting-line opacity-0">
                  <line
                    x1="-380"
                    y1="80"
                    x2="-245"
                    y2="80"
                    stroke="#285642"
                    strokeOpacity="0.35"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <circle cx="-380" cy="80" r="2.5" fill="#B49A63" />
                  <circle
                    cx="-245"
                    cy="80"
                    r="2"
                    fill="#B49A63"
                    fillOpacity="0.8"
                  />
                </g>

                {/* 03: Vedic Herbs Connecting Line */}
                <g className="connecting-line opacity-0">
                  <line
                    x1="380"
                    y1="-75"
                    x2="255"
                    y2="-75"
                    stroke="#285642"
                    strokeOpacity="0.35"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <circle cx="380" cy="-75" r="2.5" fill="#B49A63" />
                  <circle
                    cx="255"
                    cy="-75"
                    r="2"
                    fill="#B49A63"
                    fillOpacity="0.8"
                  />
                </g>

                {/* 05: Pure Cumin Connecting Line */}
                <g className="connecting-line opacity-0">
                  <line
                    x1="380"
                    y1="80"
                    x2="245"
                    y2="80"
                    stroke="#285642"
                    strokeOpacity="0.35"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <circle cx="380" cy="80" r="2.5" fill="#B49A63" />
                  <circle
                    cx="245"
                    cy="80"
                    r="2"
                    fill="#B49A63"
                    fillOpacity="0.8"
                  />
                </g>
              </svg>
            </div>

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
                    alt="Holy Tulsi botanical ingredient"
                    className="w-full h-full object-contain filter drop-shadow-md select-none"
                    draggable={false}
                  />
                </div>
                <span className="ingredient-label mt-1 px-3 py-0.5 rounded-full bg-[#183F32]/95 border border-[#B49A63]/30 text-[#F8F5ED] text-[10px] sm:text-[11px] font-medium tracking-[0.14em] uppercase shadow-xs whitespace-nowrap backdrop-blur-xs">
                  Holy Tulsi
                </span>
              </div>

              {/* 2. Golden Fenugreek (Upper Left) */}
              <div
                ref={fenugreekRef}
                className="absolute flex flex-col items-center pointer-events-auto will-change-transform"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-transparent">
                  <img
                    src="/images/INGREDIENTS/fenugreek.png"
                    alt="Fenugreek seed ingredient"
                    className="w-full h-full object-contain filter drop-shadow-md select-none"
                    draggable={false}
                  />
                </div>
                <span className="ingredient-label mt-1 px-3 py-0.5 rounded-full bg-[#183F32]/95 border border-[#B49A63]/30 text-[#F8F5ED] text-[10px] sm:text-[11px] font-medium tracking-[0.14em] uppercase shadow-xs whitespace-nowrap backdrop-blur-xs">
                  Fenugreek
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
                    alt="Vedic Herbs botanical mix"
                    className="w-full h-full object-contain filter drop-shadow-md select-none"
                    draggable={false}
                  />
                </div>
                <span className="ingredient-label mt-1 px-3 py-0.5 rounded-full bg-[#183F32]/95 border border-[#B49A63]/30 text-[#F8F5ED] text-[10px] sm:text-[11px] font-medium tracking-[0.14em] uppercase shadow-xs whitespace-nowrap backdrop-blur-xs">
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
                    alt="Native Lahsun aged bulb"
                    className="w-full h-full object-contain filter drop-shadow-md select-none"
                    draggable={false}
                  />
                </div>
                <span className="ingredient-label mt-1 px-3 py-0.5 rounded-full bg-[#183F32]/95 border border-[#B49A63]/30 text-[#F8F5ED] text-[10px] sm:text-[11px] font-medium tracking-[0.14em] uppercase shadow-xs whitespace-nowrap backdrop-blur-xs">
                  Native Lahsun
                </span>
              </div>

              {/* 5. Pure Cumin (Lower Right) */}
              <div
                ref={cuminRef}
                className="absolute flex flex-col items-center pointer-events-auto will-change-transform"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-transparent">
                  <img
                    src="/images/INGREDIENTS/cumin.png"
                    alt="Cumin aromatic seed"
                    className="w-full h-full object-contain filter drop-shadow-md select-none"
                    draggable={false}
                  />
                </div>
                <span className="ingredient-label mt-1 px-3 py-0.5 rounded-full bg-[#183F32]/95 border border-[#B49A63]/30 text-[#F8F5ED] text-[10px] sm:text-[11px] font-medium tracking-[0.14em] uppercase shadow-xs whitespace-nowrap backdrop-blur-xs">
                  Cumin
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
        className="relative w-full min-h-[100svh] flex flex-col justify-between items-center px-6 sm:px-12 pt-28 sm:pt-32 pb-6 text-center select-none"
      >
        {/* Typographic Watermark (Oversized, subtle background integration) */}
        <div
          ref={watermarkRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0"
          aria-hidden="true"
        >
          <span className="text-[9vw] font-serif font-black tracking-[0.08em] text-[#183F32]/[0.035] whitespace-nowrap will-change-transform uppercase select-none">
            TULSI SWAROJGAR
          </span>
        </div>

        {/* Atmospheric Concentric Blueprint Circles Behind Bottle */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 translate-y-7 sm:translate-y-9 md:translate-y-11"
          aria-hidden="true"
        >
          <svg
            className="w-[580px] h-[580px] max-w-[85vw] max-h-[85vw] text-[#183F32]"
            viewBox="0 0 580 580"
            fill="none"
          >
            <circle
              cx="290"
              cy="290"
              r="270"
              stroke="currentColor"
              strokeOpacity="0.04"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
            <circle
              cx="290"
              cy="290"
              r="190"
              stroke="currentColor"
              strokeOpacity="0.05"
              strokeWidth="1"
            />
            <circle
              cx="290"
              cy="290"
              r="115"
              stroke="#B49A63"
              strokeOpacity="0.14"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            <line
              x1="290"
              y1="12"
              x2="290"
              y2="28"
              stroke="#B49A63"
              strokeOpacity="0.35"
              strokeWidth="1"
            />
            <line
              x1="290"
              y1="552"
              x2="290"
              y2="568"
              stroke="#B49A63"
              strokeOpacity="0.35"
              strokeWidth="1"
            />
            <line
              x1="12"
              y1="290"
              x2="28"
              y2="290"
              stroke="#B49A63"
              strokeOpacity="0.35"
              strokeWidth="1"
            />
            <line
              x1="552"
              y1="290"
              x2="568"
              y2="290"
              stroke="#B49A63"
              strokeOpacity="0.35"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Botanical Sprig Line Art Accent (Corner Atmospheric Detail) */}
        <div
          className="absolute top-24 right-6 sm:right-12 pointer-events-none z-0 opacity-15 hidden sm:block"
          aria-hidden="true"
        >
          <svg
            className="w-24 h-24 sm:w-28 sm:h-28 text-[#183F32]"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <path
              d="M50 95 C50 65 75 40 90 20 M90 20 C75 35 55 40 50 65 M50 65 C45 45 30 30 15 25 M50 50 C60 40 75 38 85 40 M50 78 C40 68 30 65 20 68"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Subtle Ayurvedic Coordinate Tag (Bottom-Left Corner Detail) */}
        <div
          className="absolute bottom-8 left-8 sm:left-12 pointer-events-none z-0 hidden md:flex items-center gap-2 text-[#77796F]/40 text-[10px] tracking-[0.25em] uppercase font-mono"
          aria-hidden="true"
        >
          <span className="text-[#B49A63]/60">✦</span>
          <span>TRADITIONAL HARVEST • AYUR-FORMULATION</span>
        </div>

        {/* Header Block: Brand Bar + Editorial Intro */}
        <div className="relative z-10 w-full max-w-3xl mx-auto space-y-2.5">
          {/* Top Brand Bar & Section Identifier */}
          <div className="w-full flex items-center justify-between pb-2 border-b border-[#183F32]/10 text-[11px] tracking-[0.24em] uppercase font-medium text-[#183F32]/70">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B49A63]" />
              <span className="font-semibold text-[#183F32]">
                TULSI SWAROJGAR
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#B49A63] font-semibold">
                01 / THE FORMULA
              </span>
              <span className="hidden sm:inline text-[#183F32]/20">•</span>
              <span className="hidden sm:inline text-[10px] text-[#77796F]">
                AYURVEDIC WELLNESS
              </span>
            </div>
          </div>

          {/* Section 1 Editorial Header */}
          <div ref={sec1HeaderRef} className="space-y-1.5 pt-0.5 px-4">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#183F32]/[0.04] border border-[#183F32]/10 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B49A63]">
              <span className="w-1 h-1 rounded-full bg-[#B49A63]" />
              <span>THE BOTANICAL FORMULA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#183F32] font-normal tracking-tight leading-[1.15]">
              The Art of Herbal Wellness.
            </h2>
            <p className="text-xs sm:text-sm text-[#77796F] max-w-5xl mx-auto leading-relaxed font-light">
              Rooted in traditional botanical ingredients, thoughtfully brought
              together for your everyday wellness ritual.
            </p>

            {/* Targeted Health Pillar Badges (Mobile & Tablet) */}
            <div className="flex lg:hidden flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-2.5 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#183F32]/[0.05] border border-[#183F32]/10 text-[10px] sm:text-[11px] font-medium text-[#183F32]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B49A63]" />
                <span>Kindles Metabolism</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#183F32]/[0.05] border border-[#183F32]/10 text-[10px] sm:text-[11px] font-medium text-[#183F32]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B49A63]" />
                <span>Soothes Gut & Bloating</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#183F32]/[0.05] border border-[#183F32]/10 text-[10px] sm:text-[11px] font-medium text-[#183F32]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B49A63]" />
                <span>Supports Liver Health</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Symmetric Flanks: Targeted Health Benefits Framing Central Assembly */}
        <div className="absolute inset-0 max-w-[1440px] mx-auto px-8 lg:px-12 xl:px-16 flex items-center justify-between pointer-events-none z-25 hidden lg:flex translate-y-6 lg:translate-y-8">
          {/* Left Flank: Metabolic Health & Gut Ease */}
          <div className="flex flex-col justify-center space-y-8 xl:space-y-12 max-w-[220px] xl:max-w-[260px] pointer-events-auto text-left">
            {/* 01: Metabolic Vitality */}
            <div className="sec1-benefit-card group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.22em] text-[#B49A63] uppercase">
                  01 / METABOLISM
                </span>
                <span className="h-px w-6 bg-[#B49A63]/40" />
              </div>
              <h4 className="text-sm xl:text-base font-serif font-bold tracking-wide text-[#183F32] uppercase">
                Metabolic Vitality
              </h4>
              <span className="text-[11px] font-serif italic text-[#77796F] block -mt-0.5 mb-1">
                Deepana & Digestive Fire
              </span>
              <p className="text-xs text-[#252923]/80 font-normal leading-relaxed">
                Stimulates sluggish metabolism to accelerate nutrient assimilation and relieve heavy, sluggish sensations after meals.
              </p>
            </div>

            {/* 02: Gut & Digestive Ease */}
            <div className="sec1-benefit-card group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.22em] text-[#B49A63] uppercase">
                  02 / GUT HARMONY
                </span>
                <span className="h-px w-6 bg-[#B49A63]/40" />
              </div>
              <h4 className="text-sm xl:text-base font-serif font-bold tracking-wide text-[#183F32] uppercase">
                Gut & Digestive Ease
              </h4>
              <span className="text-[11px] font-serif italic text-[#77796F] block -mt-0.5 mb-1">
                Microbiome & Motility
              </span>
              <p className="text-xs text-[#252923]/80 font-normal leading-relaxed">
                Soothes recurring abdominal discomfort, calms bloating, and nurtures a balanced intestinal environment for smooth daily digestion.
              </p>
            </div>
          </div>

          {/* Center visual stage spacer */}
          <div className="w-[440px] xl:w-[500px] pointer-events-none shrink-0" />

          {/* Right Flank: Liver Cleansing & Whole-Body Lightness */}
          <div className="flex flex-col justify-center space-y-8 xl:space-y-12 max-w-[220px] xl:max-w-[260px] pointer-events-auto text-left">
            {/* 03: Hepatic Cleansing */}
            <div className="sec1-benefit-card group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.22em] text-[#B49A63] uppercase">
                  03 / LIVER SUPPORT
                </span>
                <span className="h-px w-6 bg-[#B49A63]/40" />
              </div>
              <h4 className="text-sm xl:text-base font-serif font-bold tracking-wide text-[#183F32] uppercase">
                Hepatic Cleansing
              </h4>
              <span className="text-[11px] font-serif italic text-[#77796F] block -mt-0.5 mb-1">
                Yakrit Shodhana & Bile Flow
              </span>
              <p className="text-xs text-[#252923]/80 font-normal leading-relaxed">
                Assists healthy liver bile production and filtration, helping eliminate accumulated metabolic waste (Ama).
              </p>
            </div>

            {/* 04: Enduring Lightness */}
            <div className="sec1-benefit-card group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.22em] text-[#B49A63] uppercase">
                  04 / WHOLE-BODY
                </span>
                <span className="h-px w-6 bg-[#B49A63]/40" />
              </div>
              <h4 className="text-sm xl:text-base font-serif font-bold tracking-wide text-[#183F32] uppercase">
                Enduring Lightness
              </h4>
              <span className="text-[11px] font-serif italic text-[#77796F] block -mt-0.5 mb-1">
                Clean Everyday Stamina
              </span>
              <p className="text-xs text-[#252923]/80 font-normal leading-relaxed">
                Clears sluggish bodily fatigue to awaken sustained daytime energy, clear vitality, and a lighter everyday constitution.
              </p>
            </div>
          </div>
        </div>

        {/* Vertical clearance reserved for central bottle assembly */}
        <div className="w-full h-36 sm:h-44 md:h-52 pointer-events-none" />

        {/* Mobile / Tablet Targeted Wellness Summary */}
        <div className="lg:hidden relative z-10 max-w-xs mx-auto px-4 text-center my-1">
          <p className="text-[11px] text-[#77796F] font-light leading-relaxed">
            Formulated to rekindle sluggish metabolism, ease gut bloating, and rejuvenate liver vitality.
          </p>
        </div>

        {/* Section 1 Scroll Guide */}
        <div
          ref={sec1FooterRef}
          className="relative z-10 flex flex-col items-center gap-1.5 pb-2 text-[#77796F]"
        >
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] font-semibold text-[#183F32]/80">
            DISCOVER THE FORMULA
          </span>
          <div className="flex flex-col items-center">
            <ChevronDown className="w-3.5 h-3.5 text-[#B49A63] opacity-80" />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 — Full-Screen Ingredient Showcase
          Desktop: Vertically Centered Symmetric Layout with Symmetrical Flank Padding
          ========================================================================= */}
      <section
        ref={section2Ref}
        id="section-ingredient-showcase"
        className="relative w-full h-[100svh] min-h-[100svh] flex items-center justify-center px-6 sm:px-10 select-none overflow-hidden"
      >
        {/* Subtle Watermark for Section 2 */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0"
          aria-hidden="true"
        >
          <span className="text-[9vw] font-serif font-black tracking-[0.08em] text-[#183F32]/[0.025] whitespace-nowrap uppercase">
            SACRED BOTANICALS
          </span>
        </div>

        {/* Section 2 Header Metadata (Pinned gracefully near the top) */}
        <div
          ref={sec2HeaderRef}
          className="sec2-metadata opacity-0 absolute top-16 sm:top-20 inset-x-0 mx-auto text-center max-w-2xl px-4 z-10 pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#183F32]/[0.04] border border-[#183F32]/10 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B49A63] mb-1">
            <span className="w-1 h-1 rounded-full bg-[#B49A63]" />
            <span>02 / SACRED BOTANICALS</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#183F32] font-normal tracking-tight">
            The Five-Fold Botanical Harmony
          </h3>
          <p className="text-xs sm:text-sm text-[#77796F] max-w-4xl mx-auto mt-1 font-light leading-relaxed">
            Five indigenous herbs thoughtfully proportioned to create a
            balanced, time-honored Ayurvedic blend.
          </p>
        </div>

        {/* Desktop Symmetric Layout: Vertically Centered with Symmetrical Left & Right Flank Padding */}
        <div className="relative w-full max-w-[1440px] mx-auto px-8 lg:px-12 xl:px-16 flex items-center justify-between pointer-events-none z-15 hidden lg:flex translate-y-8 lg:translate-y-10">
          {/* Left Flank Annotations (Padded to Left) */}
          <div className="flex flex-col justify-center space-y-7 xl:space-y-9 max-w-[220px] xl:max-w-[260px] pointer-events-auto text-left">
            {/* 01: Holy Tulsi */}
            <div className="ingredient-annotation opacity-0 group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.22em] text-[#B49A63] uppercase">
                  01 / BOTANICAL
                </span>
                <span className="h-px w-6 bg-[#B49A63]/40" />
              </div>
              <h4 className="text-sm xl:text-base font-serif font-bold tracking-wide text-[#183F32] uppercase">
                Holy Tulsi
              </h4>
              <span className="text-[11px] font-serif italic text-[#77796F] block -mt-0.5 mb-1">
                Ocimum Sanctum
              </span>
              <p className="text-xs text-[#252923]/80 font-normal leading-relaxed">
                A traditional botanical revered for everyday harmony and
                balance.
              </p>
            </div>

            {/* 02: Fenugreek */}
            <div className="ingredient-annotation opacity-0 group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.22em] text-[#B49A63] uppercase">
                  02 / BOTANICAL
                </span>
                <span className="h-px w-6 bg-[#B49A63]/40" />
              </div>
              <h4 className="text-sm xl:text-base font-serif font-bold tracking-wide text-[#183F32] uppercase">
                Fenugreek
              </h4>
              <span className="text-[11px] font-serif italic text-[#77796F] block -mt-0.5 mb-1">
                Trigonella Foenum-Graecum
              </span>
              <p className="text-xs text-[#252923]/80 font-normal leading-relaxed">
                Time-honored seed botanical valued in classical wellness
                recipes.
              </p>
            </div>

            {/* 04: Native Lahsun */}
            <div className="ingredient-annotation opacity-0 group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.22em] text-[#B49A63] uppercase">
                  04 / BOTANICAL
                </span>
                <span className="h-px w-6 bg-[#B49A63]/40" />
              </div>
              <h4 className="text-sm xl:text-base font-serif font-bold tracking-wide text-[#183F32] uppercase">
                Native Lahsun
              </h4>
              <span className="text-[11px] font-serif italic text-[#77796F] block -mt-0.5 mb-1">
                Allium Sativum
              </span>
              <p className="text-xs text-[#252923]/80 font-normal leading-relaxed">
                A traditional botanical bulb prized for foundational balance.
              </p>
            </div>
          </div>

          {/* Center visual stage spacer */}
          <div className="w-[440px] xl:w-[500px] pointer-events-none shrink-0" />

          {/* Right Flank Annotations & Product Identity (Padded to Right) */}
          <div className="flex flex-col justify-center space-y-7 xl:space-y-9 max-w-[220px] xl:max-w-[260px] pointer-events-auto text-left">
            {/* 03: Vedic Herbs */}
            <div className="ingredient-annotation opacity-0 group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.22em] text-[#B49A63] uppercase">
                  03 / BOTANICAL
                </span>
                <span className="h-px w-6 bg-[#B49A63]/40" />
              </div>
              <h4 className="text-sm xl:text-base font-serif font-bold tracking-wide text-[#183F32] uppercase">
                Vedic Herbs
              </h4>
              <span className="text-[11px] font-serif italic text-[#77796F] block -mt-0.5 mb-1">
                Forest Botanical Blend
              </span>
              <p className="text-xs text-[#252923]/80 font-normal leading-relaxed">
                A synergistic harmony of indigenous forest-sourced botanicals.
              </p>
            </div>

            {/* 05: Pure Cumin */}
            <div className="ingredient-annotation opacity-0 group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.22em] text-[#B49A63] uppercase">
                  05 / BOTANICAL
                </span>
                <span className="h-px w-6 bg-[#B49A63]/40" />
              </div>
              <h4 className="text-sm xl:text-base font-serif font-bold tracking-wide text-[#183F32] uppercase">
                Cumin
              </h4>
              <span className="text-[11px] font-serif italic text-[#77796F] block -mt-0.5 mb-1">
                Cuminum Cyminum
              </span>
              <p className="text-xs text-[#252923]/80 font-normal leading-relaxed">
                An ancient aromatic seed selected for botanical harmony.
              </p>
            </div>

            {/* Desktop Product Identity Signature Panel */}
            <div className="product-identity-panel opacity-0 border-l-2 border-[#B49A63]/60 pl-3.5 py-1">
              <span className="text-[10px] tracking-[0.24em] uppercase font-semibold text-[#B49A63] block">
                TULSI SWAROJGAR
              </span>
              <h4 className="text-base font-serif text-[#183F32] font-semibold tracking-tight mt-0.5">
                TULSI META VED
              </h4>
              <span className="inline-block text-[10px] tracking-[0.18em] uppercase text-[#77796F] font-medium">
                HERBAL MIX
              </span>
              <p className="text-xs text-[#77796F] font-light mt-1 leading-relaxed">
                A botanical blend inspired by traditional Ayurvedic wellness.
              </p>
              <a
                href="/products/tulsi-meta-ved-herbal-mix"
                className="inline-flex items-center gap-1.5 text-xs text-[#183F32] font-semibold mt-2 hover:text-[#B49A63] transition-colors group cursor-pointer"
              >
                <span>Explore Formulation</span>
                <span
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Product Identity Panel (shown below radial ingredients when lg:hidden) */}
        <div
          ref={sec2FooterRef}
          className="product-identity-panel opacity-0 absolute bottom-6 inset-x-0 z-10 lg:hidden w-full max-w-sm mx-auto text-center px-4"
        >
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B49A63]" />
            <span className="text-[10px] tracking-[0.24em] uppercase font-semibold text-[#183F32]">
              TULSI SWAROJGAR
            </span>
            <span className="text-[#B49A63] text-xs">•</span>
            <span className="text-[10px] tracking-[0.18em] uppercase text-[#77796F]">
              HERBAL MIX
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-serif text-[#183F32] font-medium tracking-tight">
            TULSI META VED
          </h4>
          <p className="text-xs text-[#77796F] font-light mt-0.5 max-w-xs mx-auto leading-relaxed">
            A botanical blend inspired by traditional Ayurvedic wellness.
          </p>
          <a
            href="/products/tulsi-meta-ved-herbal-mix"
            className="inline-flex items-center gap-1.5 text-xs text-[#183F32] font-semibold mt-1.5 hover:text-[#B49A63] transition-colors group cursor-pointer"
          >
            <span>Explore Full Formulation</span>
            <span
              className="transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </a>
        </div>
      </section>
    </div>
  );
};
