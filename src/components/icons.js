import * as React from "react";

export const Hamburger = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3,6 h18 M3,12 h18 M3,18 h18"
    />
  </svg>
);

export const Search = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path
      d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.9999 21L16.6499 16.65"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* /> */}
  </svg>
);

export const Logo = (props) => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="100" height="100" fill="white" rx="10" />
    {/* <!-- Square with rounded corners, using currentColor for flexibility --> */}
    <path
      d="M10 30 L90 30 L90 70 L10 70 Z"
      fill="white"
      stroke="black"
      strokeWidth="2"
    />
    {/* <!-- Inner rectangle for a sushi-like pattern --> */}
    <circle
      cx="50"
      cy="50"
      r="20"
      fill="white"
      stroke="black"
      strokeWidth="3"
    />
    {/* <!-- Center circle for a focal point --> */}
  </svg>
);
