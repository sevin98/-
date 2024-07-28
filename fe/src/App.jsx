import { RouterProvider } from 'react-router-dom';
import router from '../src/router/router'
import { StompProvider } from './network/StompContext';

function App() {
    return (
        <StompProvider>
        <div id="app">
           <RouterProvider router ={router} />
        </div>
        </StompProvider>
    );
}
export default App;
