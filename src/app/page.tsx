import Hero from '@/components/sections/Hero';
import DivisionCards from '@/components/sections/DivisionCards';
import WhyRO from '@/components/sections/WhyRO';
import ConstructionCTA from '@/components/sections/ConstructionCTA';
import SectionTransition from '@/components/animations/SectionTransition';

export default function HomePage() {
  return (
    <>
      <Hero />
      <SectionTransition label="FLOOR 01" sparks zIndex={45} />
      <DivisionCards />
      <SectionTransition label="FLOOR 02" sparks zIndex={35} />
      <WhyRO />
      <SectionTransition label="FLOOR 03" sparks zIndex={25} />
      <ConstructionCTA />
    </>
  );
}
