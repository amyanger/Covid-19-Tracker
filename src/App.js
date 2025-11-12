import './App.css';
import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import { useEffect, useState } from 'react';
import InfoBox from './InfoBox';
import Tables from './Tables';
import Map from './Map';
import { sortData, prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";


function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState([34.80746, -40.4796]);
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState('cases');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching worldwide data:', error);
        setError('Failed to load COVID-19 data. Please check your connection and try again.');
        setLoading(false);
      });
  }, [])

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then((response) => response.json())
        .then((data) => {
          const countries = data
            .filter((country) => country.countryInfo.iso2)
            .map((country) => ({
              name: country.country,
              value: country.countryInfo.iso2
            }));

          const sortedData = sortData(data);
          setTableData(sortedData);

          const mapCountriesFiltered = data.filter(
            (country) => country.countryInfo.lat && country.countryInfo.long
          );
          setMapCountries(mapCountriesFiltered);
          setCountries(countries);
        })
        .catch(error => {
          console.error('Error fetching countries data:', error);
          setError('Failed to load countries data. Please check your connection and try again.');
        });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode);
        setCountryInfo(data);

        if (countryCode === 'worldwide') {
          setMapCenter([34.80746, -40.4796]);
          setMapZoom(3);
        } else if (data.countryInfo?.lat && data.countryInfo?.long) {
          setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
          setMapZoom(4);
        }
      })
      .catch(error => {
        console.error('Error fetching country data:', error);
      });
  };

  return (
    <div className="app">
      {loading ? (
        <div className="app__loading">
          <h1>Loading COVID-19 data...</h1>
        </div>
      ) : error ? (
        <div className="app__error">
          <h1>⚠️ Error</h1>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      ) : (
        <>
          <div className='app__left'>
            <div className='app__header'>
              <h1>Covid-19 Tracker - Made by Arjun Myanger</h1>
              <FormControl className='app__dropdown'>
                <Select variant='outlined' onChange={onCountryChange} value={country}>
                  <MenuItem value='worldwide'>Worldwide</MenuItem>
                  {countries.map(country => (
                    <MenuItem key={country.value} value={country.value}>{country.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className='app__stats'>
          <InfoBox
            active={casesType === 'cases'}
            onClick={e => setCasesType('cases')}
            title='Coronavirus cases'
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
          />
          <InfoBox
            active={casesType === 'recovered'}
            isGreen
            onClick={e => setCasesType('recovered')}
            title='Recovered'
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <InfoBox
            active={casesType === 'deaths'}
            isRed
            onClick={e => setCasesType('deaths')}
            title='Deaths'
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>

        <Map
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
          countries={mapCountries}
        />
      </div>
          <Card className='app__right'>
            <CardContent>
              <h3>Live Cases by Country</h3>
              <Tables countries={tableData} />
              <h3 className='app__graphTitle'>Worldwide {casesType} (Last 120 Days)</h3>
              <LineGraph className='app__graph' casesType={casesType} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default App;
