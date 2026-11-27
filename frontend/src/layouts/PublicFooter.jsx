import { Link } from "react-router-dom";

import Logo from "../shared/components/Logo";

export default function PublicFooter() {
  return (
    <footer className="border-t border-line bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-mute">
            AI-assisted detection of potholes and garbage from CCTV footage, reviewed by city operators before
            action is taken.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/map" className="text-slate-600 hover:text-brand">Issue map</Link></li>
            <li><Link to="/issues" className="text-slate-600 hover:text-brand">All issues</Link></li>
            <li><Link to="/#how-it-works" className="text-slate-600 hover:text-brand">How it works</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Operators</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/admin/login" className="text-slate-600 hover:text-brand">Admin sign in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-mute sm:px-6">
          CivicConnect currently analyses recorded CCTV footage. It is not connected to live city cameras.
        </p>
      </div>
    </footer>
  );
}
