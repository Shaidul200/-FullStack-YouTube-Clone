import {RotatingLines} from "react-loader-spinner";

export default function Loader({
    width,
    hight,
    color,
    animationDuration, 
    ...props
}) {
    return (
        <div className="flex items-center justify-center">
             <RotatingLines
    visible={true}
    height={hight}
    width={width}
    color={color}
    strokeWidth="5"
    animationDuration={animationDuration}
    ariaLabel="rotating-lines-loading"
/>
        </div>
    );
}