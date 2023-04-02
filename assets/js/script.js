// the API key will remain the same throughout the code.
const APIKEY = 'd6d727c8c68c5cd31db30ad289ac8254';
// maximum number of search results from Open Weather Map
const LIMIT = '5';
// Wrap code in a call to jQuery so all elments on the page will load before we do anything
$(function(){
    let weatherSearchHistory = []
    // if search history is stored locally
    if(localStorage.getItem('weatherSearchHistory')){
        for(let searchItem of localStorage.getItem('weatherSearchHistory')){
            weatherSearchHistory.push(searchItem);
        }
    }
    $('#search-btn').click(function (e) { 
        e.preventDefault();
        var userSearchedCity = $('#citySearch').val();
        // get
        if(userSearchedCity){
            $.ajax({
                type: "GET",
                url: `http://api.openweathermap.org/geo/1.0/direct?q=${userSearchedCity}&limit=${LIMIT}&appid=${APIKEY}`,
            }).then(function(response){
                if(!response.length){
                    $('#citySearch').css('border', 'var(--bs-danger) 2px solid');
                    return;
                }
                $('#citySearch').css('border', 'unset');
                let lat = String(Number(response[1]['lat']).toFixed(2));
                let lon = String(Number(response[1]['lon']).toFixed(2));
                console.log('lat:'+lat + ' lon:' + lon);
                // get 5 day forecast from Open Weather Map using lat, long, and the apikey
                $.ajax({
                    type: 'GET',
                    url: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKEY}`,
                    data: {
                        units: 'imperial'
                    }
                }).then(function(response){
                    console.log('--- current ---');
                    console.log(response);
                    $('#current-weather-card').css('display', 'flex');
                    $('.city-date').text(`Weather in ${userSearchedCity} on ${dayjs().format('M/DD/YYYY')}`)
                    $('#current-weather-card').children('.temp').text(`Temp: ${response['main']['temp']} °F`)
                    $('#current-weather-card').children('.wind').text(`Wind: ${response['wind']['speed']} MPH`)
                    $('#current-weather-card').children('.humidity').text(`Humidity: ${response['main']['humidity']} %`)
                });
                $.ajax({ 
                    type: 'GET',
                    url: `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKEY}`,
                    data: {
                        units: 'imperial'
                    }
                }).then(function(response){
                    console.log('--- forecast ---');
                    console.log(response);
                    $('#placeholder-text-h2').css('display', 'none');
                    $('.forecast-card').css('display', 'unset');
                    $('#forecast-weather-card-title').css('display', 'unset');
                });
            });
        }else{
            $('#citySearch').css('border', 'var(--bs-danger) 2px solid');
        }
    });
})