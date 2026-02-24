import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/layout";
import { Dashboard } from "./pages/dashboard";
import { DataManagement } from "./pages/data-management";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="data" element={<DataManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
