export function Card({ children, className = "", ...props }) {
  return (
    <div className={`bg-white rounded-xl shadow-md p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div className={`text-gray-800 ${className}`}>
      {children}
    </div>
  );
}
