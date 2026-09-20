// Small inline SVG icon set (stroke icons, 24px grid). All decorative
// unless a `title` prop is passed, in which case the icon is labelled.

function Svg({ children, title, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const IconSearch = (p) => (
  <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>
);
export const IconClose = (p) => (
  <Svg {...p}><path d="M18 6 6 18M6 6l12 12" /></Svg>
);
export const IconMenu = (p) => (
  <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>
);
export const IconPlus = (p) => (
  <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
);
export const IconPin = (p) => (
  <Svg {...p}><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" /><circle cx="12" cy="11" r="2.2" /></Svg>
);
export const IconClock = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
);
export const IconCalendar = (p) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></Svg>
);
export const IconTag = (p) => (
  <Svg {...p}><path d="M20 12.5 12.5 20a1.5 1.5 0 0 1-2.1 0L4 13.6V4h9.6l6.4 6.4a1.5 1.5 0 0 1 0 2.1Z" /><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" /></Svg>
);
export const IconUser = (p) => (
  <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Svg>
);
export const IconImage = (p) => (
  <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m21 16-5-5-8 8" /></Svg>
);
export const IconCamera = (p) => (
  <Svg {...p}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.2" /></Svg>
);
export const IconBox = (p) => (
  <Svg {...p}><path d="m3 7 9-4 9 4v10l-9 4-9-4z" /><path d="m3 7 9 4 9-4M12 11v10" /></Svg>
);
export const IconBell = (p) => (
  <Svg {...p}><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" /><path d="M10 21a2 2 0 0 0 4 0" /></Svg>
);
export const IconCheck = (p) => (
  <Svg {...p}><path d="m5 12 4.5 4.5L19 7" /></Svg>
);
export const IconCheckCircle = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Svg>
);
export const IconAlert = (p) => (
  <Svg {...p}><path d="M12 3 2.5 20h19z" /><path d="M12 10v4M12 17.5h.01" /></Svg>
);
export const IconInfo = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Svg>
);
export const IconArrowLeft = (p) => (
  <Svg {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>
);
export const IconArrowRight = (p) => (
  <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
);
export const IconEdit = (p) => (
  <Svg {...p}><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17z" /><path d="m13.5 6.5 3 3" /></Svg>
);
export const IconTrash = (p) => (
  <Svg {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Svg>
);
export const IconHand = (p) => (
  <Svg {...p}><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 5a1.5 1.5 0 0 1 3 0v7M14 6.5a1.5 1.5 0 0 1 3 0V12M17 9.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.8-2.4L4.4 14.8a1.6 1.6 0 0 1 2.5-2L8 14" /></Svg>
);
export const IconEye = (p) => (
  <Svg {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></Svg>
);
export const IconLogout = (p) => (
  <Svg {...p}><path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9" /></Svg>
);
export const IconShield = (p) => (
  <Svg {...p}><path d="M12 3 4 6v6c0 4.5 3.4 7.7 8 9 4.6-1.3 8-4.5 8-9V6z" /></Svg>
);
export const IconUpload = (p) => (
  <Svg {...p}><path d="M12 16V5M7 10l5-5 5 5M5 19h14" /></Svg>
);
export const IconRefresh = (p) => (
  <Svg {...p}><path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4" /></Svg>
);

export const GoogleMark = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

/** Category → icon */
export function CategoryIcon({ category, ...p }) {
  switch (category) {
    case 'Electronics':
      return <Svg {...p}><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8M12 17v4" /></Svg>;
    case 'Clothing':
      return <Svg {...p}><path d="m8 4 4 2 4-2 4 4-3 2v10H7V10L4 8z" /></Svg>;
    case 'IDs & Cards':
      return <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="11" r="2" /><path d="M13 10h5M13 14h5M5.5 16.5c.5-1.5 1.7-2.3 3-2.3s2.5.8 3 2.3" /></Svg>;
    case 'Books':
      return <Svg {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" /></Svg>;
    case 'Accessories':
      return <Svg {...p}><circle cx="12" cy="14" r="6" /><path d="M9 8.5 12 3l3 5.5" /></Svg>;
    case 'Keys':
      return <Svg {...p}><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M17 6l2 2M14 9l2 2" /></Svg>;
    case 'Bags':
      return <Svg {...p}><path d="M5 8h14l-1 13H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></Svg>;
    default:
      return <IconBox {...p} />;
  }
}
