import fs from 'fs';

//Função para ler o arquivo CSV
function readCSVFile(filePath){
    console.log("Lendo arquivo CSV...");
    const data = fs.readFileSync('planilha.csv', 'utf8');
    const lines = data.split("\r\n")
    return lines;
}

//Função para buscar os dados meteorológicos
async function getWeatherData() {
    console.log("Buscando dados metereológicos...");

    const apiWeatherURL = `https://api.weatherbit.io/v2.0/history/daily?city_id=3399415&start_date=2023-08-01&end_date=2023-08-32&units=metric&key=API_KEY`;
  
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

  let dataRows = "";
  
  let highestRevenue = 0;
  let dayWithHighestRevenue = 0;
  let lowestRevenue = Infinity;
  let dayWithLowestRevenue = 100000;
  let revenues = [];
  let totalRevenue = 0;

  function calculateRevenue(day, water, soda, popsicle, iceCream){

    if(day == 1){
      console.log("Calculando faturamento...")
    }

    let revenue = 0;
    revenue = (water * 3) + (soda * 5) + (popsicle * 7) + (iceCream * 9);
    
    //Capturando dados para calcular a média de faturamento
    revenues.push(revenue)
    totalRevenue += revenue;
    
    const result = {
      dayWithHighestRevenue: revenue > highestRevenue ? day : dayWithHighestRevenue,
      highestRevenue: Math.max(highestRevenue, revenue),
      dayWithLowestRevenue: revenue < lowestRevenue ? day : dayWithLowestRevenue,
      lowestRevenue: Math.min(lowestRevenue, revenue),
      totalRevenue: totalRevenue,
    };
 
    return result;

}

let calculationResult;

//Função principal para processar os dados
async function processData(){
    const lines = readCSVFile('planilha.csv');
    const daysWeather = await getWeatherData();

    if (!daysWeather) {
        console.error("Não foi possível obter os dados do clima.");
        return;
    }

    console.log("Processando Dados...")

    let sodaQuantity = 0;
    let waterQuantity = 0;
    let popsicleQuantity = 0;
    let iceCreamQuantity = 0;

    for(let i = 0; i < lines.length; i++){
      
      var columns = lines[i].split(",");
      
      if(i == 0){
        columns.push("Temperatura máxima e mínima")
        columns.push("Máxima das rajadas de vento")
        columns.push("Porcentagem de Nuvens")

        //Juntar novamente as colunas utilizando a vírgula e concatena as linhas
        dataRows += "\n" + columns.join(",");

      }else{
        
        // Somando a quantidade de refri
        const soda = parseInt(columns[1]);
        sodaQuantity += soda;
        
        //Somando a quantidade de aguas
        const water = parseFloat(columns[2]);
        waterQuantity += water;
        

        //Somando a quandtidade de picole
        const popsicle = parseFloat(columns[3]);
        popsicleQuantity += popsicle;

        //Somando a quantidade de sorvete
        const iceCream = parseFloat(columns[4]);
        iceCreamQuantity += iceCream;

        calculationResult = calculateRevenue(columns[0], sodaQuantity, waterQuantity, popsicleQuantity, iceCreamQuantity);


        columns.push(`${daysWeather[i - 1].min_temp}/${daysWeather[i - 1].max_temp}`);
        columns.push(daysWeather[i-1].max_wind_spd.toString())
        columns.push(daysWeather[i-1].clouds.toString())
        
        //Juntar novamente as colunas utilizando a vírgula e concatena as linhas
        dataRows += "\n" + columns.join(",");
      }          
    }

    // Calcula a média de faturamento
    let averageRevenue = totalRevenue / revenues.length;    
    calculationResult.averageRevenue = averageRevenue.toFixed(2)

    // Escrevendo arquivos
    console.log("Escrevendo arquivos...")
    fs.writeFileSync('novo-arquivo.csv', dataRows);
    fs.writeFileSync('arquivo.json', JSON.stringify(calculationResult));

    console.log("Concluído!")
}

processData()