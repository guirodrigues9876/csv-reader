import fs from 'fs';

//Function to read the CSV file. Returns an array of lines
function readCSVFile(filePath){
    const data = fs.readFileSync('planilha.csv', 'utf8');
    const lines = data.split("\r\n")
    return lines;
}

//Função para buscar os dados meteorológicos
async function getWeatherData() {
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

  let dado;
  let dado1 = "";
  
  var maiorFat = 0;
  var diaMaiorFat = 0;
  var menorFat = Infinity;
  var diaMenorFat = 100000;
  var faturamentos = [];
  var fatTotal = 0;
  var mediaFat = 0;

  function calculate(dia, agua, refri, picole, sorvete){
    
    var fat = 0;
    fat = (agua * 3) + (refri * 5) + (picole * 7) + (sorvete * 9);
    
    //Capturando dados para calcular a média de faturamento
    faturamentos.push(fat)
    fatTotal += fat;
    
    const resultado = {
      diaMaiorFat: fat > maiorFat ? dia : diaMaiorFat,
      maiorFat: Math.max(maiorFat, fat),
      diaMenorFat: fat < menorFat ? dia : diaMenorFat,
      menorFat: Math.min(menorFat, fat),
      fatTotal: fatTotal,
    };
 
    return resultado;

}

let resultadoCalculate;

//Função principal para processar os dados
async function processData(){
    const lines = readCSVFile('planilha.csv');
    const daysWeather = await getWeatherData();

    if (!daysWeather) {
        console.error("Não foi possível obter os dados do clima.");
        return;
    }

    let qtdRefri = 0;
    let qtdAgua = 0;
    let qtdPicole = 0;
    let qtdSorvete = 0;

    for(let i = 0; i < lines.length; i++){
      
      var columns = lines[i].split(",");
      
      if(i == 0){
        columns.push("Temperatura máxima e mínima")
        columns.push("Máxima das rajadas de vento")
        columns.push("Porcentagem de Nuvens")

        //Juntar novamente as colunas utilizando a vírgula
        dado = columns.join(",")

        //Vai interando os dados 
        dado1 = dado1.concat("", dado) 

      }else{
        
        // Somando a quantidade de refri
        const refri = parseInt(columns[1]);
        qtdRefri += refri;
        
        //Somando a quantidade de aguas
        const agua = parseFloat(columns[2]);
        qtdAgua += agua;
        

        //Somando a quandtidade de picole
        const picole = parseFloat(columns[3]);
        qtdPicole += picole;

        //Somando a quantidade de sorvete
        const sorvete = parseFloat(columns[4]);
        qtdSorvete += sorvete;

        resultadoCalculate = calculate(columns[0], qtdRefri, qtdAgua, qtdPicole, qtdSorvete);

        columns.push(daysWeather[i - 1].min_temp.toString() + '/' + daysWeather[i - 1].max_temp.toString());
        columns.push(daysWeather[i-1].max_wind_spd.toString())
        columns.push(daysWeather[i-1].clouds.toString())
        
        //Juntar novamente as colunas utilizando a vírgula
        dado = columns.join(",")
        //Vai interando os dados
        dado1 = dado1.concat("\n", dado)
      }          
    }

    // Calcula a média de faturamento
    mediaFat = fatTotal / faturamentos.length;    
    resultadoCalculate.mediaFat = mediaFat.toFixed(2)

    // Escrevendo arquivos
    fs.writeFileSync('novo-arquivo.csv', dado1);
    fs.writeFileSync('arquivo.json', JSON.stringify(resultadoCalculate));

}

processData()