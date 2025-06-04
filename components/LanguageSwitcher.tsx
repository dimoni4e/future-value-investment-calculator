import React from 'react';

const LanguageSwitcher = () => {
    const [language, setLanguage] = React.useState('en');

    const handleLanguageChange = (event) => {
        setLanguage(event.target.value);
        // Add logic to update the application's language
    };

    return (
        <div className="language-switcher">
            <select value={language} onChange={handleLanguageChange}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                {/* Add more languages as needed */}
            </select>
        </div>
    );
};

export default LanguageSwitcher;