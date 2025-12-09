import type { SVGProps } from 'react';
import { useMemo } from 'react';
import { colleges } from '@/lib/data';

export function Logo({
  collegeId,
  ...props
}: SVGProps<SVGSVGElement> & { collegeId?: string | null }) {
  const college = useMemo(() => {
    if (!collegeId) return null;
    return colleges.find((c) => c.id === collegeId);
  }, [collegeId]);

  const getCollegeShortName = (name: string | undefined) => {
    if (!name) return '';
    
    // Prefer acronym at the end of the name (e.g. "College Name - CN")
    const endAcronymMatch = name.match(/ - ([A-Z]+)$/);
    if (endAcronymMatch && endAcronymMatch[1]) {
      return endAcronymMatch[1];
    }
    
    // Use regex to find the abbreviation in parentheses
    const shortNameMatch = name.match(/\(([^)]+)\)/);
    if (shortNameMatch && shortNameMatch[1]) {
      return shortNameMatch[1];
    }
    
    // Fallback for names without an abbreviation in parentheses
    const words = name.split(' ');
    if (words.length >= 2) {
      // Create an acronym from the first letter of each major word
      return words
        .filter(word => word.length > 2 && word[0] === word[0].toUpperCase())
        .map(word => word[0])
        .join('')
        .toUpperCase();
    }

    // Final fallback for short names
    return name.substring(0, 4).toUpperCase();
  };

  const collegeShortName = getCollegeShortName(college?.name);
  const logoText = collegeShortName ? `${collegeShortName} CampusHub` : 'CampusHub';

  // Dynamically adjust viewBox and width based on text length
  const textLength = logoText.length;
  // Adjusted estimation for better fitting. The multiplier is increased.
  const estimatedWidth = textLength * 18; 
  const viewBoxWidth = Math.max(220, estimatedWidth);
  const svgWidth = viewBoxWidth * 0.6;


  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${viewBoxWidth} 50`}
      width={svgWidth}
      height="30"
      {...props}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <text
        x="10"
        y="35"
        fontFamily="'Space Grotesk', sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="url(#logo-gradient)"
      >
        {logoText}
      </text>
    </svg>
  );
}
