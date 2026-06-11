export function Badge({ children, variant = "default", className = "" }) {
  const variantClass = {
    default: "bg-green-100 text-green-800",
    secondary: "bg-gray-200 text-gray-800",
    outline: "border border-gray-300 text-gray-600",
  }[variant] || "";

  return (
    <span className={`inline-block px-2 py-1 text-sm rounded ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
