interface Props {
  /** Path without size/extension, e.g. "/images/massage-argan" → -800.webp / -1600.webp */
  base: string
  alt: string
  sizes: string
  widths?: [number, number]
  className?: string
  priority?: boolean
  width?: number
  height?: number
}

export function Picture({ base, alt, sizes, widths = [800, 1400], className, priority, width = 1400, height = 933 }: Props) {
  const [s, l] = widths
  return (
    <img
      src={`${base}-${l}.webp`}
      srcSet={`${base}-${s}.webp ${s}w, ${base}-${l}.webp ${l}w`}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={className}
    />
  )
}
