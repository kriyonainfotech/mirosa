import { useEffect } from 'react';

function useOutsideClick(ref, callback) {
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };

        // Add event listener when the component mounts
        document.addEventListener("mousedown", handleClickOutside);

        // Remove event listener on cleanup
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, callback]);
}

export default useOutsideClick;