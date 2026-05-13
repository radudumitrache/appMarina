import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LandingNav        from '../components/landing/LandingNav'
import HeroSection       from '../components/landing/HeroSection'
import FeaturesSection   from '../components/landing/FeaturesSection'
import StatsSection      from '../components/landing/StatsSection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import WhyVRSection      from '../components/landing/WhyVRSection'
import TimelineSection   from '../components/landing/TimelineSection'
import ContactSection    from '../components/landing/ContactSection'
import './css/Landing.css'

gsap.registerPlugin(ScrollTrigger)

export default function Landing() {
  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-theme')
    document.documentElement.setAttribute('data-theme', 'dark')
    return () => document.documentElement.setAttribute('data-theme', prev || 'dark')
  }, [])

  return (
    <div className="landing-page">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <WhyVRSection />
      <TimelineSection />
      <ContactSection />
    </div>
  )
}
