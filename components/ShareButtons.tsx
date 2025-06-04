import React from 'react';

const ShareButtons = ({ url }) => {
    const shareOnFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    };

    const shareOnTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank');
    };

    const shareOnLinkedIn = () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    };

    return (
        <div className="share-buttons">
            <button onClick={shareOnFacebook} className="btn btn-facebook">Share on Facebook</button>
            <button onClick={shareOnTwitter} className="btn btn-twitter">Share on Twitter</button>
            <button onClick={shareOnLinkedIn} className="btn btn-linkedin">Share on LinkedIn</button>
        </div>
    );
};

export default ShareButtons;