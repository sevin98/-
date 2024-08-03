import { RouterProvider } from "react-router-dom";
import router from "../src/router/router";
import { ToastContainer } from "react-toastify"; // ToastContainer import
import "react-toastify/dist/ReactToastify.css"; // ToastContainer 스타일 import

function App() {
    return (
        <div id="app">
            <RouterProvider router={router} />
            <ToastContainer />
        </div>
    );
}
export default App;