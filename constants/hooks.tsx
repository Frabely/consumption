import {useState, useEffect} from 'react';
import {Dimension} from "@/constants/types";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@/store/store";

//get window dimensions
function getWindowDimensions(): Dimension {
    let windowObject = {innerWidth: 0, innerHeight: 1}
    if (typeof window !== "undefined")
        windowObject = window

    const {innerWidth: width, innerHeight: height} = windowObject;
    return {
        width: width,
        height: height,
        isHorizontal: height >= width * 1.5
    };
}

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector


export default function useWindowDimensions(): Dimension {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        if (typeof window !== "undefined") {
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    return windowDimensions;
}

