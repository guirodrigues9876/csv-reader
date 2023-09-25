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
    console.log("Buscando dados meteorológicos...");

    const apiWeatherURL = `https://api.weatherbit.io/v2.0/history/daily?city_id=3399415&start_date=2023-08-01&end_date=2023-08-32&units=metric&key=d80813fa6eb64eee867ae8b23a2d6615`;
  
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

  var dataRows = "";
  var highestRevenue = 0;
  var dayWithHighestRevenue = 0;
  var lowestRevenue = 100000;
  var dayWithLowestRevenue = 100000;
  var revenues = [];
  var totalRevenue = 0;

  function calculateRevenue(day, soda, water, popsicle, iceCream){

    if(day == 1){
      console.log("Calculando faturamento...")
    }

    var revenue = 0;
    revenue = (soda * 5) + (water * 3) + (popsicle * 7) + (iceCream * 9);

    if(revenue > highestRevenue){
      highestRevenue = revenue
      dayWithHighestRevenue = day
    }

    if(revenue < lowestRevenue){
      lowestRevenue = revenue
      dayWithLowestRevenue = day
    }
    
    //Capturando dados para calcular a média de faturamento
    revenues.push(revenue)
    totalRevenue += revenue;
    
    const result = {
      dayWithHighestRevenue: dayWithHighestRevenue,
      highestRevenue: highestRevenue,
      dayWithLowestRevenue: dayWithLowestRevenue,
      lowestRevenue: lowestRevenue,
      totalRevenue: totalRevenue,
    };
    
    soda = 0;
    water = 0;
    popsicle = 0;
    iceCream = 0;
    revenue = 0;

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

    console.log("Processando dados...")

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
        const water = parseInt(columns[2]);
        waterQuantity += water;
        

        //Somando a quandtidade de picole
        const popsicle = parseInt(columns[3]);
        popsicleQuantity += popsicle;

        //Somando a quantidade de sorvete
        const iceCream = parseInt(columns[4]);
        iceCreamQuantity += iceCream;

        calculationResult = calculateRevenue(columns[0], sodaQuantity, waterQuantity, popsicleQuantity, iceCreamQuantity);
        iceCreamQuantity = 0;
        popsicleQuantity = 0;
        waterQuantity = 0;
        sodaQuantity = 0;


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