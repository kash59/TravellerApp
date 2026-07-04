interface FloatingBlobProps {
  className?: string;
}

export default function FloatingBlob({
  className = "",
}: FloatingBlobProps) {
  return (
    <div
      className={`
        absolute
        rounded-full
        bg-gradient-to-br
        from-cyan-400/30
        to-blue-600/30
        blur-3xl
        animate-floating
        ${className}
      `}
    />
  );
}