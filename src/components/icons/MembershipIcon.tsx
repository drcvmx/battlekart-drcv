import { cn } from "@/lib/utils";

interface MembershipIconProps {
  className?: string;
}

const MembershipIcon = ({ className }: MembershipIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-6 h-6", className)}
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <circle cx="8" cy="12" r="2" />
    <path d="M14 10h4" />
    <path d="M14 14h4" />
  </svg>
);

export { MembershipIcon };
