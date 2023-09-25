import fs from 'fs';

//Function to read the CSV file
function readCSVFile(filePath){
  console.log("Reading CSV file...");
  try {
      const data = fs.readFileSync(filePath, 'utf8');
      return data.split("\r\n");
  } catch (error) {
      console.error(`Error reading CSV file: ${error.message}`);
      return [];
  }
}

//Function to fetch weather data
async function getWeatherData() {
    console.log("Fetching weather data...");

    const apiKey = '90a4897252af43a191b9fe1ef672ff2c',
    cityId = '3399415',
    startDate = '2023-08-01',
    endDate = '2023-08-32',
    units = 'metric';

    const apiWeatherURL = `https://api.weatherbit.io/v2.0/history/daily?city_id=${cityId}&start_date=${startDate}&end_date=${endDate}&units=${units}&key=${apiKey}`;
  
    try {
      const res = await fetch(apiWeatherURL);
      if (!res.ok) {
        throw new Error(`Erro ao buscar dados da API: ${res.status}`);
      }
  
      const weatherData = await res.json();
      return weatherData.data;
    } catch (error) {
      console.error(`Erro ao buscar dados da API: ${error.message}`);
      return null;
    }
  }

  // Function to calculate revenue for a day
  function calculateRevenue(day, soda, water, popsicle, iceCream, highestRevenue, dayWithHighestRevenue, lowestRevenue, dayWithLowestRevenue){

    console.log("Calculating revenue...")
    console.log(highestRevenue)
    const revenue = (soda * 5) + (water * 3) + (popsicle * 7) + (iceCream * 9);

    if (revenue > highestRevenue) {
      highestRevenue = revenue;
      dayWithHighestRevenue = day;
    }

    if (revenue < lowestRevenue) {
      lowestRevenue = revenue;
      dayWithLowestRevenue = day;
    }

    return [ revenue, highestRevenue, dayWithHighestRevenue, lowestRevenue, dayWithLowestRevenue ];
  }

//Main function to process data
async function processData(){
    const lines = readCSVFile('planilha.csv');
    const daysWeather = await getWeatherData();

    if (!daysWeather) {
        console.error("Não foi possível obter os dados do clima.");
        return;
    }

    console.log("Processing data...")

    //Initialize variables
    let dataRows = "",
    highestRevenue = 0,
    dayWithHighestRevenue = 0,
    lowestRevenue = Infinity,
    dayWithLowestRevenue = 100000,
    revenues = [],
    revenue = 0,
    totalRevenue = 0;

    for(let i = 0; i < lines.length; i++){
      
      var columns = lines[i].split(",");
      
      if(i == 0){
        columns.push("Temperatura máxima e mínima")
        columns.push("Máxima das rajadas de vento")
        columns.push("Porcentagem de Nuvens")

        // Join the columns back together using a comma and concatenate the lines
        dataRows += "\n" + columns.join(",");

      } else{

        [ revenue, highestRevenue, dayWithHighestRevenue, lowestRevenue, dayWithLowestRevenue ] = calculateRevenue(...columns, highestRevenue, dayWithHighestRevenue, lowestRevenue, dayWithLowestRevenue);
        
        revenues.push(revenue);
        totalRevenue += revenue;

        // Add API data to columns
        columns.push(`${daysWeather[i - 1].min_temp}/${daysWeather[i - 1].max_temp}`);
        columns.push(daysWeather[i-1].max_wind_spd.toString())
        columns.push(daysWeather[i-1].clouds.toString())
        
        // Join the columns back together using a comma and concatenate the lines
        dataRows += "\n" + columns.join(",");
      }          
    }

    const jsonResult = {
      dayWithHighestRevenue,
      highestRevenue,
      dayWithLowestRevenue,
      lowestRevenue,
      totalRevenue,
      averageRevenue: (totalRevenue / revenues.length).toFixed(2),
    }

    // Writing files
    console.log("Writing files...")
    fs.writeFileSync('novo-arquivo.csv', dataRows);
    fs.writeFileSync('arquivo.json', JSON.stringify(jsonResult));

    console.log("Completed!")
}

processData()