import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Landing } from "./routes/Landing";
import { Login } from "./routes/Login";
import { Signup } from "./routes/Signup";
import { Upload } from "./routes/Upload";
import { Results } from "./routes/Results";
import { History } from "./routes/History";
import { SharedEvaluation } from "./routes/SharedEvaluation";

export function App() {
  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/evaluation/:shareId" element={<SharedEvaluation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results/:id"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
