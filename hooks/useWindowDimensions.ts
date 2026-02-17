import {useEffect, useState} from "react";
import {Dimension} from "@/constants/types";

const getWindowDimensions = (): Dimension => {
    if (typeof window === "undefined") {
        return {
            width: 0,
            height: 1,
            isHorizontal: true
        };
    }

    const {innerWidth: width, innerHeight: height} = window;
    return {
        width,
        height,
        isHorizontal: height >= width * 1.5
    };
};

export default function useWindowDimensions(): Dimension {
    const [windowDimensions, setWindowDimensions] = useState<Dimension>(getWindowDimensions());

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions(getWindowDimensions());
        };

        if (typeof window !== "undefined") {
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, []);

    return windowDimensions;
}
