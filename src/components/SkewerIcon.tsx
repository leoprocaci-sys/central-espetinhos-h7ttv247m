import React from 'react'
import { BrandLogo } from './BrandLogo'

/**
 * @deprecated Use BrandLogo directly. Kept for backwards compatibility.
 */
export const SkewerIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => {
  return <BrandLogo variant="mark" className={className} />
}
