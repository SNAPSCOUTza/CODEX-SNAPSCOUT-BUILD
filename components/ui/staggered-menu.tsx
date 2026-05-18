"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface MenuItem {
  name: string
  url: string
  icon: LucideIcon
}

interface StaggeredMenuProps {
  items: MenuItem[]
  isOpen: boolean
  onItemClick: () => void
}

const menuVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    x: 50,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    x: 30,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
}

const lineVariants = {
  hidden: {
    scaleX: 0,
    originX: 0,
  },
  visible: {
    scaleX: 1,
    transition: {
      delay: 0.2,
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    scaleX: 0,
    originX: 1,
    transition: {
      duration: 0.2,
    },
  },
}

export function StaggeredMenu({ items, isOpen, onItemClick }: StaggeredMenuProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.nav variants={menuVariants} initial="hidden" animate="visible" exit="exit" className="space-y-1 px-4">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div key={item.name} variants={itemVariants}>
                <Link
                  href={item.url}
                  onClick={onItemClick}
                  className="group flex items-center space-x-4 px-4 py-4 text-gray-700 hover:text-red-600 rounded-xl transition-all duration-200 relative overflow-hidden"
                >
                  {/* Background hover effect */}
                  <motion.div
                    className="absolute inset-0 bg-red-50 rounded-xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />

                  {/* Icon container with animation */}
                  <motion.div
                    className="relative z-10 flex items-center justify-center w-10 h-10 bg-gray-100 group-hover:bg-red-100 rounded-lg transition-colors duration-200"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-5 h-5 group-hover:text-red-600 transition-colors" />
                  </motion.div>

                  {/* Text with underline animation */}
                  <div className="relative z-10 flex-1">
                    <span className="text-base font-semibold block">{item.name}</span>
                    <motion.div
                      className="h-0.5 bg-red-500 mt-0.5"
                      initial={{ scaleX: 0, originX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Arrow indicator */}
                  <motion.div
                    className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </Link>

                {/* Separator line with animation */}
                {index < items.length - 1 && (
                  <motion.div
                    variants={lineVariants}
                    className="h-px bg-gradient-to-r from-gray-200 via-gray-300 to-transparent mx-4 mt-1"
                  />
                )}
              </motion.div>
            )
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  )
}

// Animated hamburger icon that transforms to X
interface AnimatedMenuIconProps {
  isOpen: boolean
  onClick: () => void
}

export function AnimatedMenuIcon({ isOpen, onClick }: AnimatedMenuIconProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
      whileTap={{ scale: 0.9 }}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <div className="w-6 h-5 relative flex flex-col justify-between">
        <motion.span
          className="w-full h-0.5 bg-gray-800 rounded-full block"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 9 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <motion.span
          className="w-full h-0.5 bg-gray-800 rounded-full block"
          animate={{
            opacity: isOpen ? 0 : 1,
            scaleX: isOpen ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="w-full h-0.5 bg-gray-800 rounded-full block"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -9 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>
    </motion.button>
  )
}
