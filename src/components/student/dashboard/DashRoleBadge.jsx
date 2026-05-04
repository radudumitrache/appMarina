import { motion } from 'framer-motion'

const SPRING = [0.16, 1, 0.3, 1]
const LEAVE  = { duration: 0.3, ease: [0, 0, 0.2, 1] }

export default function DashRoleBadge({ uiLeaving }) {
  return (
    <motion.div
      className="dash-role-badge"
      initial={{ opacity: 0, y: -10 }}
      animate={uiLeaving ? { opacity: 0, x: -20 } : { opacity: 1, y: 0 }}
      transition={uiLeaving ? LEAVE : { duration: 0.48, ease: SPRING, delay: 0.35 }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
      <span>Student</span>
    </motion.div>
  )
}
