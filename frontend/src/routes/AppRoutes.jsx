import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import PublicLayout from "../layouts/PublicLayout";
import Loader from "../shared/components/Loader";
import NotFound from "../shared/components/NotFound";
import ProtectedRoute from "./ProtectedRoute";

// Pages load on demand so public visitors don't download the admin console,
// charts or map code they never open.
const Home = lazy(() => import("../features/home/pages/Home"));
const ExploreMap = lazy(() => import("../features/map/pages/ExploreMap"));
const Issues = lazy(() => import("../features/incidents/pages/Issues"));
const IssueDetails = lazy(() => import("../features/incidents/pages/IssueDetails"));
const Login = lazy(() => import("../features/auth/pages/Login"));
const Overview = lazy(() => import("../features/dashboard/pages/Overview"));
const IncidentManagement = lazy(() => import("../features/incidents/pages/IncidentManagement"));
const Cameras = lazy(() => import("../features/cameras/pages/Cameras"));
const VideoUpload = lazy(() => import("../features/videos/pages/VideoUpload"));

function PageSuspense() {
  return (
    <Suspense fallback={<Loader />}>
      <Outlet />
    </Suspense>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route element={<PageSuspense />}>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<ExploreMap />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/issues/:id" element={<IssueDetails />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      <Route element={<PageSuspense />}>
        <Route path="/admin/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route element={<PageSuspense />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<Overview />} />
            <Route path="/admin/incidents" element={<IncidentManagement />} />
            <Route path="/admin/cameras" element={<Cameras />} />
            <Route path="/admin/video-upload" element={<VideoUpload />} />
            <Route path="/admin/*" element={<NotFound admin />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
