// Type declaration for the <spline-viewer> custom element, loaded via a
// plain <script type="module"> tag from unpkg (see components/ui/SplineViewer.tsx).
// This is the same technique the Gloma reference site uses — a pre-built
// web component, not the @splinetool/react-spline npm wrapper, which is
// currently incompatible with React 19 (verified extensively).
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type SplineViewerElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  url?: string;
  hint?: string;
  loading?: string;
  background?: string;
};

// React 19's JSX namespace lives under the "react" module rather than the
// old bare global `JSX` namespace.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": SplineViewerElement;
    }
  }
}

export {};
