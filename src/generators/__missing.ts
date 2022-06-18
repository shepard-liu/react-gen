export default `\
import React from "react";

export default React.forwardRef<SVGSVGElement, React.ComponentPropsWithRef<'svg'>>((props, ref) => (
    <svg {...props} ref={ref} viewBox="0 0 128 128" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient x1="100%" y1="0%" x2="0%" y2="100%" id="linearGradient-ihcr8hdluy-1">
                <stop stopColor="#000000" offset="0%"></stop>
                <stop stopColor="#000000" offset="51.2583893%"></stop>
                <stop stopColor="#000000" offset="100%"></stop>
            </linearGradient>
            <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-ihcr8hdluy-2">
                <stop stopColor="#E02020" offset="0%"></stop>
                <stop stopColor="#FA6400" offset="16.7194618%"></stop>
                <stop stopColor="#F7B500" offset="33.3898731%"></stop>
                <stop stopColor="#6DD400" offset="50.0513863%"></stop>
                <stop stopColor="#0091FF" offset="66.5668601%"></stop>
                <stop stopColor="#6236FF" offset="83.3200233%"></stop>
                <stop stopColor="#B620E0" offset="100%"></stop>
            </linearGradient>
        </defs>
        <g>
            <rect stroke="url(#linearGradient-ihcr8hdluy-2)" strokeWidth="21" fill="url(#linearGradient-ihcr8hdluy-1)" x="10.5" y="10.5" width="107" height="107"></rect>
            <text fontSize="14" fontWeight="bold" letterSpacing="1.44827586" fill="#FF0000">
                <tspan x="29.4820345" y="49">MISSING</tspan>
                <tspan x="43.6314483" y="69">ICON</tspan>
                <tspan x="64" y="89" fontSize="10" fill="#FFFFFF" textAnchor="middle">"{props['data-icon-name']}"</tspan>
            </text>
        </g>
    </svg>));
`;