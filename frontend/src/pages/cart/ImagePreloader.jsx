import React from 'react';

const ImagePreloader = ({ imageUrls }) => {
    return (
        <div style={{ display: 'none' }}>
            {imageUrls.map((url, index) => (
                <img key={index} src={url} alt="preloaded" />
            ))}
        </div>
    );
};

export default ImagePreloader;