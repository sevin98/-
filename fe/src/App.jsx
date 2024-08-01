import { RouterProvider } from 'react-router-dom';
import router from '../src/router/router'
import { StompProvider } from './network/StompContext';
import { ToastContainer } from 'react-toastify'; // ToastContainer import
import 'react-toastify/dist/ReactToastify.css'; // ToastContainer 스타일 import

function App() {
    return (
        <StompProvider>
        <div id="app">
                <RouterProvider router={router} />
                <ToastContainer />
        </div>
        </StompProvider>
    );
}
export default App;
