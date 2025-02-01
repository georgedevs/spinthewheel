import { motion } from "framer-motion";

interface AnimatedHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedHeading = ({ children, className = "" }: AnimatedHeadingProps) => {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`font-montserrat font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 animate-gradient ${className}`}
    >
      {children}
    </motion.h1>
  );
};