import ReactDOM from "react-dom/client";
import AppProviders from "./app/providers";
import AppRouter from "./routes/AppRouter";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppProviders>
    <AppRouter />
  </AppProviders>
);
