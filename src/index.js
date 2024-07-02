import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { SnackbarProvider } from "notistack";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe(
  "pk_test_51PIEMgSAt0aDT5BwQgqbuflb3VHRRSFzZrKoU8pGr6H6OIQf9tRn1hpF2GBO3jtXOVJ1rKst1N6chk1OYj0d6eY800C4oznlp3"
);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <SnackbarProvider
        maxSnack={2}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Elements stripe={stripePromise}>
          <Router>
            <App />
          </Router>
        </Elements>
      </SnackbarProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
