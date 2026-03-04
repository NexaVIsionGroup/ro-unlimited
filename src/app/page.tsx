import MobilePageFlip, { FlipSlide } from '@/components/animations/MobilePageFlip';
import Hero from '@/components/sections/Hero';
import DivisionCards from '@/components/sections/DivisionCards';
import WhyRO from '@/components/sections/WhyRO';
import ConstructionCTA from '@/components/sections/ConstructionCTA';
import SectionTransition from '@/components/animations/SectionTransition';

export default function HomePage() {
  return (
    <MobilePageFlip>
      <FlipSlide><Hero /></FlipSlide>
      <SectionTransition label="FLOOR 01" sparks className="hidden lg:block" />
      <FlipSlide><DivisionCards /></FlipSlide>
      <SectionTransition label="FLOOR 02" sparks className="hidden lg:block" />
      <FlipSlide><WhyRO /></FlipSlide>
      <SectionTransition label="FLOOR 03" sparks className="hidden lg:block" />
      <FlipSlide><ConstructionCTA /></FlipSlide>
    </MobilePageFlip>
  );
}
