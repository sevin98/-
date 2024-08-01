import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import createStompClient from "./StompClient";

const StompContext = createContext(null);

export const StompProvider = ({ children }) => {
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        const client = createStompClient("서 버 주 소");
        client.activate();
        setStompClient(client);

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, []);

    return (
        <StompContext.Provider value={stompClient}>
            {children}
        </StompContext.Provider>
    );
};

StompProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useStompClient = () => {
    const context = useContext(StompContext);
    if (context === null) {
        throw new Error("useStompClient must be used within a StompProvider");
    }
    return context;
};