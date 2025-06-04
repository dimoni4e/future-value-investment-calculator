import React from 'react';
import CalculatorForm from '../components/CalculatorForm';
import GrowthChart from '../components/GrowthChart';
import ScenarioSlider from '../components/ScenarioSlider';
import ShareButtons from '../components/ShareButtons';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Page = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold">Future Value Investment Calculator</h1>
            <LanguageSwitcher />
            <CalculatorForm />
            <ScenarioSlider />
            <GrowthChart />
            <ShareButtons />
        </div>
    );
};

export default Page;