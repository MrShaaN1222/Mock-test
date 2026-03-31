import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./store";

export default function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );
}
