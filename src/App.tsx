import "./App.css";
import { AuthGate } from "./components/AuthGate";
import { AuthedApp } from "./components/AuthedApp";

function App() {
  return <AuthGate children={(user) => <AuthedApp user={user} />} />;
}

export default App;