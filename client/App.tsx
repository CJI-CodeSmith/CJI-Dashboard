import React from 'react'
import Card from './components/StatCard';
import ChartPanel from './components/ChartsPanel';
import CsvDownloadButton from './components/CsvDownloadButton';
import Footer from './components/Footer';
import Header from './components/Header';


const App : React.FC = () => {
return(
    <>
    <CsvDownloadButton/>
    <Header/>
    <Card/>
    <Card/>
    <Card/>
    <ChartPanel/>
    <ChartPanel/>
    <ChartPanel/>
    <Footer/>
    </>
)
}

export default App;