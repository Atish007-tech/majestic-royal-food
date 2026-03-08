import React, { useEffect, useState, useRef } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    
    const cursorRef = useRef(null);

    useEffect(() => {
        const touchQuery = window.matchMedia('(pointer: coarse)');
        setIsTouchDevice(touchQuery.matches);
        
        const handleTouchChange = (e) => setIsTouchDevice(e.matches);
        touchQuery.addEventListener('change', handleTouchChange);
        
        return () => touchQuery.removeEventListener('change', handleTouchChange);
    }, []);

    useEffect(() => {
        if (isTouchDevice) return;
        let isOverridden = false;
        
        const onMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            if (!isVisible && !isOverridden) {
                setIsVisible(true);
            }
        };

        const onMouseEnter = () => setIsVisible(true);
        const onMouseLeave = () => {
             setIsVisible(false);
             isOverridden = true;
        };
        
        const onMouseOver = (e) => {
            // Check if hovering over clickable elements
            const clickableTags = ['A', 'BUTTON', 'INPUT', 'SELECT'];
            const isClickableTag = clickableTags.includes(e.target.tagName);
            
            // Check for specific layout elements we want magnetic reaction on
            const isCardOrLink = 
                e.target.closest('a') !== null || 
                e.target.closest('button') !== null || 
                e.target.closest('.food-card') !== null ||
                e.target.closest('.nav-link') !== null;
            
            if (isClickableTag || isCardOrLink) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseenter', onMouseEnter);
        document.addEventListener('mouseleave', onMouseLeave);
        document.addEventListener('mouseover', onMouseOver);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseenter', onMouseEnter);
            document.removeEventListener('mouseleave', onMouseLeave);
            document.removeEventListener('mouseover', onMouseOver);
        };
    }, [isVisible]);

    useEffect(() => {
        let animationFrame;
        const current = { x: position.x, y: position.y };
        
        const render = () => {
            if (cursorRef.current) {
                // Smooth easing
                const difX = position.x - current.x;
                const difY = position.y - current.y;
                
                // High easing for very responsive, but smooth follow
                current.x += difX * 0.4;
                current.y += difY * 0.4;
                
                cursorRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
            }
            animationFrame = requestAnimationFrame(render);
        };
        
        render();
        
        return () => cancelAnimationFrame(animationFrame);
    }, [position]);

    if (!isVisible || isTouchDevice) return null;

    return (
        <div 
            ref={cursorRef} 
            className={`custom-arrow-cursor ${isHovering ? 'cursor-hover' : ''}`}
        >
            <div className="cursor-circle"></div>
        </div>
    );
};

export default CustomCursor;
