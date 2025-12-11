'use client';

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { TourStep, AppView } from '@/lib/types';
import { ArrowRight, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface GuidedTourProps {
  isActive: boolean;
  onComplete: () => void;
  onNavigate: (view: AppView) => void;
}

const GuidedTour: React.FC<GuidedTourProps> = ({ isActive, onComplete, onNavigate }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const tourSteps = useMemo<TourStep[]>(() => [
    {
      targetId: 'dashboard-value',
      title: 'Your Asset Dashboard',
      content: 'This is your financial overview. See the total value of your inventory at a glance.',
      view: 'dashboard',
      placement: 'bottom'
    },
    {
      targetId: isMobile ? 'mobile-add' : 'dashboard-add',
      title: 'Add Your First Item',
      content: 'Tap here to start. The AI will identify your item, estimate its value, and suggest a maintenance schedule.',
      view: 'dashboard',
      placement: isMobile ? 'top' : 'bottom'
    },
    {
      targetId: 'dashboard-quick-actions',
      title: 'Powerful Tools',
      content: 'Access the AI Move Planner, Risk Simulator, and Room Audit directly from here.',
      view: 'dashboard',
      placement: 'bottom'
    },
    {
      targetId: 'nav-auctions',
      title: 'Proveniq Bids',
      content: 'Ready to declutter? Create private auctions for your items instantly with one tap.',
      view: 'dashboard',
      placement: isMobile ? 'top' : 'right'
    },
    {
      targetId: 'inventory-search',
      title: 'Ask Proveniq',
      content: 'Type a natural question like "Show me tools in the garage" and the AI will find them instantly.',
      view: 'inventory',
      placement: 'bottom'
    }
  ], [isMobile]);

  const currentStep = tourSteps[stepIndex];

  const handleNext = useCallback(() => {
    setStepIndex((prev) => {
      if (prev < tourSteps.length - 1) {
        return prev + 1;
      }
      onComplete();
      return prev;
    });
  }, [onComplete, tourSteps.length]);

  const handleClose = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const positionElement = useCallback((step: TourStep) => {
    // If mobile, try to find the mobile target first, fallback to desktop target if not found (and vice versa if needed)
    // But here we rely on the step.targetId being correct based on isMobile
    let element = document.getElementById(step.targetId);

    // Fallback for add button if mobile-add is missing but dashboard-add exists (or vice versa)
    if (!element && step.targetId === 'mobile-add') {
      element = document.getElementById('dashboard-add');
    }

    if (element) {
      const isFixed = window.getComputedStyle(element).position === 'fixed';

      if (!isFixed) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }

      setTimeout(() => {
        setTargetRect(element.getBoundingClientRect());
      }, isFixed ? 50 : 350);
    } else {
      console.warn(`Tour target not found: ${step.targetId}`);
      // Skip step if target not found, but prevent infinite loop if all missing
      // For now just log warning. In production maybe auto-skip.
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      setTargetRect(null);
      setStepIndex(0);
      return;
    }

    if (!currentStep) {
      onComplete();
      return;
    }

    setTargetRect(null);

    const currentView = document.querySelector('[data-current-view]')?.getAttribute('data-current-view');

    // Simple view check - in a real app might need more robust routing check
    // Here we assume onNavigate handles it or we are already there.
    if (currentView !== currentStep.view && onNavigate) {
      // If we need to navigate, we do it. 
      // Note: This assumes onNavigate will trigger a re-render or view change that eventually mounts the target.
      onNavigate(currentStep.view);
      // We wait a bit for navigation
      setTimeout(() => positionElement(currentStep), 500);
    } else {
      positionElement(currentStep);
    }

    const handleResize = () => {
      if (isActive && currentStep) {
        positionElement(currentStep);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [stepIndex, isActive, onNavigate, currentStep, onComplete, positionElement]);

  useLayoutEffect(() => {
    if (!targetRect || !tooltipRef.current || !currentStep) return;

    const tooltip = tooltipRef.current;
    const { width: tooltipWidth, height: tooltipHeight } = tooltip.getBoundingClientRect();
    const padding = 12;

    let top = 0;
    let left = 0;
    let placement = currentStep.placement;

    // Viewport boundary checks
    if (placement === 'bottom' && targetRect.bottom + padding + tooltipHeight > window.innerHeight) {
      placement = 'top';
    }
    if (placement === 'top' && targetRect.top - padding - tooltipHeight < 0) {
      placement = 'bottom';
    }
    if (placement === 'right' && targetRect.right + padding + tooltipWidth > window.innerWidth) {
      placement = 'left';
    }
    if (placement === 'left' && targetRect.left - padding - tooltipWidth < 0) {
      placement = 'right';
    }

    // Mobile specific override: if screen is narrow, force top/bottom to avoid squishing
    if (window.innerWidth < 768 && (placement === 'left' || placement === 'right')) {
      placement = targetRect.bottom + tooltipHeight + padding > window.innerHeight ? 'top' : 'bottom';
    }

    switch (placement) {
      case 'top':
        top = targetRect.top - tooltipHeight - padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - padding;
        break;
      case 'right':
      default:
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + padding;
        break;
    }

    // Keep within screen bounds
    if (left < padding) left = padding;
    if (top < padding) top = padding;
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }
    if (top + tooltipHeight > window.innerHeight - padding) {
      top = window.innerHeight - tooltipHeight - padding;
    }

    setTooltipStyle({
      top: `${top}px`,
      left: `${left}px`,
      position: 'fixed',
      opacity: 1,
      transform: 'scale(1)',
      transition: 'opacity 0.2s, transform 0.2s',
      willChange: 'transform, opacity',
    });

  }, [targetRect, currentStep?.placement]);

  if (!isActive || !currentStep || !targetRect) {
    return null;
  }

  const highlightPadding = 8;

  return (
    <>
      <svg
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 9998, pointerEvents: 'none' }}
        className="animate-fade-in"
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - highlightPadding}
              y={targetRect.top - highlightPadding}
              width={targetRect.width + highlightPadding * 2}
              height={targetRect.height + highlightPadding * 2}
              rx="16"
              fill="black"
              className="transition-all duration-300"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.6)"
          mask="url(#tour-mask)"
          style={{ pointerEvents: 'auto' }}
        />
      </svg>

      <div
        ref={tooltipRef}
        style={{
          ...tooltipStyle,
          zIndex: 9999,
          opacity: 0,
          transform: 'scale(0.95)'
        }}
        className="bg-white rounded-xl shadow-2xl w-72 p-5 flex flex-col"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900 leading-tight">{currentStep.title}</h3>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-5 leading-relaxed">{currentStep.content}</p>

        <div className="flex justify-between items-center mt-auto">
          <div className="flex gap-2">
            {tourSteps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${stepIndex === i ? 'w-4 bg-indigo-600' : 'w-2 bg-gray-300'}`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {stepIndex === tourSteps.length - 1 ? 'Finish' : 'Next'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

export default GuidedTour;
