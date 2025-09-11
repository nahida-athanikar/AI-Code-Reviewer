import { useState } from "react";
import { Copy } from "lucide-react";

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="
        absolute top-2 right-2
        p-1
        bg-transparent
        text-gray-400
        hover:text-gray-100
        opacity-60 hover:opacity-100
        transition-all
        rounded
        z-10
      "
      aria-label="Copy code"
    >
      {copied ? "✅" : <Copy size={16} />}
    </button>
  );
}
