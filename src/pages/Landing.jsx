import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LandingNav      from '../components/landing/LandingNav'
import HeroSection     from '../components/landing/HeroSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import TimelineSection from '../components/landing/TimelineSection'
import ContactSection  from '../components/landing/ContactSection'
import './css/Landing.css'

gsap.registerPlugin(ScrollTrigger)

export default function Landing() {
  return (
    <div className="landing-page">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <TimelineSection />
      <ContactSection />
    </div>
  )
}
