import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PagePlaceholder from "./components/PagePlaceholder";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminLayout from "./layouts/AdminLayout";
import AuthContextProvider from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import VisaServicesPage from "./pages/VisaServicesPage";
import VisaServiceDetailsPage from "./pages/VisaServiceDetailsPage";
import ApplyPage from "./pages/ApplyPage";
import CheckApplicationPage from "./pages/CheckApplicationPage";
import ContactPage from "./pages/ContactPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

function NotFound() {
  return (
    <PagePlaceholder
      title="Page Not Found"
      description="The page you are looking for could not be found."
    />
  );
}

function App() {
  return (
    <AuthContextProvider>
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/visa-services" element={<VisaServicesPage />} />
        <Route
          path="/visa-services/:slug"
          element={<VisaServiceDetailsPage />}
        />
        <Route path="/apply" element={<ApplyPage />} />
        <Route
          path="/check-application"
          element={<CheckApplicationPage />}
        />
        <Route path="/contact" element={<ContactPage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </AuthContextProvider>
  );
}

export default App;
