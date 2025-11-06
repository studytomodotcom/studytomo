export default function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-3 h-3"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 1.5a1 1 0 01.894.553l1.618 3.286 3.63.528a1 1 0 01.554 1.707l-2.628 2.562.62 3.61a1 1 0 01-1.451 1.054L10 13.347l-3.237 1.702a1 1 0 01-1.451-1.054l.62-3.61L3.304 7.574a1 1 0 01.554-1.707l3.63-.528L9.106 2.05A1 1 0 0110 1.5z"
          clipRule="evenodd"
        />
      </svg>
      Verified
    </span>
  );
}
